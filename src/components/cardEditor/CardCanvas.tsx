import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { DUAL_FRAME_VARIANTS, type CustomCardData, type FrameVariant, type PlaneswalkerCardData, type SagaCardData } from './types'
import { getAbuDualLandColors, getRunSymbolFile, hasHybridManaSymbol, parseCardText, parseRulesText, parseManaCost, type CardTextRun } from './cardText'
import { drawCard, drawCardFooter, HEIGHT, WIDTH } from './render/drawCard'
import { futureManaFile } from './render/drawManaCost'
import { loadImage, loadImageSource } from './render/loadImage'
import { loadDualFrame } from './render/composeDualFrame'
import { loadAbuDualLand } from './render/composeAbuDualLand'
import { loadBorderOverlay } from './render/composeBorder'
import { useI18n } from '../../i18n/context'
import { getFrameFamily, resolveFrameVariant, resolvePtVariant, type FrameBorderStyle, type FrameFamily, type FrameFamilyId } from './frameFamilies'
import { drawIconlessPlaneswalkerAbilities, drawPlaneswalker, drawPlaneswalkerBackground, drawPlaneswalkerNickname, drawPlaneswalkerReverseFace, PLANESWALKER_ASSETS, type PlaneswalkerIcons } from './render/drawPlaneswalker'
import { drawSaga, SAGA_ASSETS, type SagaImages } from './render/drawSaga'
import { Icon } from '../Icon'

const DEBUG_CANVAS = import.meta.env.DEV
const MANA_SYMBOLS_URL = `${import.meta.env.BASE_URL}img/manaSymbols/`
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
const COLOR_INDICATOR_ORDER = ['W', 'U', 'B', 'R', 'G'] as const
const DEBUG_COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#007aff', '#5856d6', '#af52de', '#ff2d55']

type DebugRegion = {
	label: string
	x: number
	y: number
	width: number
	height: number
	unrotated?: boolean
}

function getDebugRegions(family: FrameFamily): DebugRegion[] {
	const { layout } = family
	const regions: DebugRegion[] = [
		{
			label: 'Artwork / drag area',
			x: layout.artwork.dragLeft,
			y: layout.artwork.dragTop,
			width: layout.artwork.dragRight - layout.artwork.dragLeft,
			height: layout.artwork.dragBottom - layout.artwork.dragTop,
		},
		{ label: 'Title', x: layout.title.x, y: layout.title.y - 50, width: layout.title.maxWidth, height: 100 },
		{ label: 'Mana', x: layout.mana.right - 420, y: layout.mana.centerY - layout.mana.symbolSize / 2, width: 420, height: layout.mana.symbolSize },
		{ label: 'Type', x: layout.type.x, y: layout.type.y - 50, width: layout.type.maxWidth, height: 100 },
		{
			label: 'Set symbol',
			x: layout.symbol.centerX - layout.symbol.boxSize / 2,
			y: layout.symbol.centerY - layout.symbol.boxSize / 2,
			width: layout.symbol.boxSize,
			height: layout.symbol.boxSize,
		},
		{ label: 'Rules', ...layout.rules },
		...(layout.flavorRules ? [{ label: 'Flavor text', ...layout.flavorRules }] : []),
		{ label: 'P/T', x: layout.pt.x, y: layout.pt.y, width: layout.pt.width, height: layout.pt.height },
		{
			label: 'Footer metadata',
			x: layout.footer.x,
			y: layout.footer.metadataY - 35,
			width: layout.footer.maxWidth,
			height: 55,
			unrotated: layout.footer.unrotated,
		},
		{
			label: 'Footer disclaimer',
			x: layout.footer.disclaimerX ?? layout.footer.x,
			y: layout.footer.disclaimerY - 35,
			width: layout.footer.maxWidth,
			height: 55,
			unrotated: layout.footer.unrotated,
		},
		...(family.overlay ? [{ label: 'Frame overlay', ...family.overlay }] : []),
	]

	if (layout.saga) {
		regions.push(
			{ label: 'Saga reminder', ...layout.saga.reminder },
			{ label: 'Saga abilities', ...layout.saga.abilities },
			{
				label: 'Saga chapters',
				x: layout.saga.chapter.x,
				y: layout.saga.abilities.y,
				width: layout.saga.chapter.width,
				height: layout.saga.abilities.height,
			},
		)
		if (layout.saga.creatureRules) regions.push({ label: 'Creature rules', ...layout.saga.creatureRules })
		if (layout.saga.reversePt) regions.push({ label: 'Reverse P/T', ...layout.saga.reversePt })
	}

	return regions.filter(({ width, height }) => width > 0 && height > 0)
}

function isInsideArtwork(
	clientX: number,
	clientY: number,
	bounds: DOMRect,
	layout: ReturnType<typeof getFrameFamily>['layout'],
) {
	const canvasX = (clientX - bounds.left) * (WIDTH / bounds.width)
	const canvasY = (clientY - bounds.top) * (HEIGHT / bounds.height)
	const x = layout.canvas?.rotation === 'counterclockwise' ? HEIGHT - canvasY : canvasX
	const y = layout.canvas?.rotation === 'counterclockwise' ? canvasX : canvasY
	const artwork = layout.artwork

	return x >= artwork.dragLeft && x <= artwork.dragRight &&
		y >= artwork.dragTop && y <= artwork.dragBottom
}

export type ArtworkTransform = {
	x: number
	y: number
	flipX: boolean
	flipY: boolean
	grayscale: boolean
	scale: number
    rotation: number
}

type CardCanvasProps = {
	artwork?: File | string
	setSymbol?: File | string
	frameFamily: FrameFamilyId
	borderStyle: FrameBorderStyle
	frameVariant: FrameVariant
	transform: ArtworkTransform,
    card: CustomCardData | PlaneswalkerCardData | SagaCardData,
    onTransformChange: (transform: ArtworkTransform) => void,
	canvasRef?: RefObject<HTMLCanvasElement | null>
}

export function CardCanvas({ artwork, setSymbol, frameFamily, frameVariant, borderStyle, transform, card, onTransformChange, canvasRef: externalCanvasRef }: CardCanvasProps) {
	const { t } = useI18n()
	const family = getFrameFamily(frameFamily)
	const debugRegions = DEBUG_CANVAS ? getDebugRegions(family) : []
	const internalCanvasRef = useRef<HTMLCanvasElement>(null)
	const canvasRef = externalCanvasRef ?? internalCanvasRef
    const [dragging, setDragging] = useState(false)
	const [artworkHovered, setArtworkHovered] = useState(false)
	const [showDebug, setShowDebug] = useState(false)
	const [previewRotated, setPreviewRotated] = useState(false)
    const dragRef = useRef<{
        pointerId: number
        clientX: number
        clientY: number
        x: number
        y: number
    }>(null)

    function startDragging(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (!artwork) return

		const bounds = event.currentTarget.getBoundingClientRect()
		if (!isInsideArtwork(event.clientX, event.clientY, bounds, family.layout)) return

		setArtworkHovered(true)
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)

        dragRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            x: transform.x,
            y: transform.y,
        }
    }

    function dragArtwork(event: ReactPointerEvent<HTMLCanvasElement>) {
		const bounds = event.currentTarget.getBoundingClientRect()
		setArtworkHovered(isInsideArtwork(event.clientX, event.clientY, bounds, family.layout))

        const drag = dragRef.current

        if (!drag || drag.pointerId !== event.pointerId) return

        onTransformChange({
            ...transform,
			x: drag.x + (family.layout.canvas?.rotation === 'counterclockwise'
				? -(event.clientY - drag.clientY) * (HEIGHT / bounds.height)
				: (event.clientX - drag.clientX) * (WIDTH / bounds.width)),
			y: drag.y + (family.layout.canvas?.rotation === 'counterclockwise'
				? (event.clientX - drag.clientX) * (WIDTH / bounds.width)
				: (event.clientY - drag.clientY) * (HEIGHT / bounds.height)),
        })
    }

    function stopDragging(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (dragRef.current?.pointerId !== event.pointerId) return

        setDragging(false)
        dragRef.current = null
        event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const transformRef = useRef(transform)

    useEffect(() => {
        transformRef.current = transform
    }, [transform])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
		const target = canvas

        function zoomArtwork(event: WheelEvent) {
            if (!artwork) return
			const bounds = target.getBoundingClientRect()
			if (!isInsideArtwork(event.clientX, event.clientY, bounds, family.layout)) return

            event.preventDefault()

            const current = transformRef.current

            onTransformChange({
                ...current,
                scale: Math.min(
                    2,
                    Math.max(
                        -0.75,
                        current.scale - Math.sign(event.deltaY) * 0.05,
                    ),
                ),
            })
        }

        target.addEventListener('wheel', zoomArtwork, {
            passive: false,
        })

        return () => {
            target.removeEventListener('wheel', zoomArtwork)
        }
    }, [artwork, canvasRef, family, onTransformChange])

	useEffect(() => {
		let cancelled = false

		async function render() {
			const planeswalker = 'startingLoyalty' in card
			const saga = 'chapters' in card
			const drawableCard: CustomCardData = planeswalker ? {
				...card,
				name: family.id === 'planeswalker-nickname' ? card.nickname : card.name,
				rulesText: '', centerRulesText: false, flavorText: '', powerToughness: card.startingLoyalty,
			} : saga ? { ...card, rulesText: '', flavorText: '' } : card
            const manaRuns = parseManaCost(card.manaCost)
            const rulesRuns = parseRulesText(drawableCard.rulesText)

            const flavorRuns = parseCardText(drawableCard.flavorText).map(
                (run): CardTextRun =>
                    run.type === 'text'
                        ? { ...run, italic: true }
                        : run,
            )

			const abilityRuns = planeswalker ? card.abilities.map(({ text }) => parseRulesText(text)) : []
			const sagaReminderRuns = saga ? parseRulesText(card.rulesText) : []
			const sagaChapterRuns = saga ? card.chapters.map(({ text }) => parseRulesText(text)) : []
			const sagaCreatureRulesRuns = saga && family.id === 'saga-creature' ? parseRulesText(card.flavorText) : []
			const reverseManaRuns = planeswalker ? parseManaCost(card.reverseFaceManaCost) : []
			const planeswalkerMask = family.id === 'planeswalker-mdfc-back'
				? 'img/frames/planeswalker/mdfc/text.png'
				: family.id === 'planeswalker-compleated'
					? 'img/frames/planeswalker/compleated/text.svg'
				: family.id === 'planeswalker-transform-front' || family.id === 'planeswalker-transform-front-double-feature'
					? 'img/frames/planeswalker/transform/textFront.svg'
				: family.id === 'planeswalker-tall' || family.id === 'planeswalker-tall-borderless' || family.id === 'planeswalker-tall-double-feature'
					? 'img/frames/planeswalker/tall/planeswalkerTallMaskRules.png'
					: PLANESWALKER_ASSETS.mask
			const planeswalkerAssets = { ...PLANESWALKER_ASSETS, mask: planeswalkerMask }
			const allRuns = [...manaRuns, ...reverseManaRuns, ...rulesRuns, ...flavorRuns, ...abilityRuns.flat(), ...sagaReminderRuns, ...sagaChapterRuns.flat(), ...sagaCreatureRulesRuns]
			const futureManaFiles = family.id === 'future-sight'
				? manaRuns.flatMap((run) => run.type === 'symbol' ? [futureManaFile(run.value)].filter((file): file is string => Boolean(file)) : [])
				: []
			const cardTypes = card.typeLine.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
			const typeMatches = family.typeIconMasks ? ([
				['creature', /\b(creature|criatura)\b/], ['instant', /\b(instant|instantanea)\b/],
				['sorcery', /\b(sorcery|feitico)\b/], ['enchantment', /\b(enchantment|encantamento)\b/],
				['artifact', /\b(artifact|artefato)\b/], ['land', /\b(land|terreno)\b/],
			] as const).filter(([, pattern]) => pattern.test(cardTypes)) : []
			const typeIconKey = typeMatches.length > 1 ? 'multi' : typeMatches[0]?.[0]
			const typeIconPath = typeIconKey ? family.typeIconMasks?.[typeIconKey] : undefined

            const manaFiles = [
                ...new Set(
                    allRuns.flatMap((run) => {
                        if (run.type !== 'symbol') return []

                        const file = getRunSymbolFile(run.value)
                        return file ? [file] : []
                    }),
                ),
            ]

			const resolvedVariant = resolveFrameVariant(family, frameVariant)
			const abuLandColors = family.dualLandMask && (frameVariant === 'L' || frameVariant === 'ML')
				? getAbuDualLandColors(card.name, card.typeLine)
				: undefined
			const dualPair = DUAL_FRAME_VARIANTS.find((pair) => pair === resolvedVariant)
			const hybrid = Boolean(dualPair && hasHybridManaSymbol(card.manaCost))
			const ptVariant = resolvePtVariant(resolvedVariant, hybrid)
			const ptPath = family.pt[ptVariant] ?? family.pt.C ?? Object.values(family.pt)[0]
			const frameOverlay = family.frameOverlays?.[resolvedVariant]
			const colorIndicatorColors = family.id === 'planeswalker-transform-back' || family.id === 'planeswalker-transform-back-double-feature'
				? COLOR_INDICATOR_ORDER.filter((color) => card.manaCost.toUpperCase().includes(color))
				: []
			const [frame, overlay, frameOverlayImage, border, ptBackground, art, symbol, typeIcon, planeswalkerIcons, colorIndicatorBase, sagaImages] = await Promise.all([
				abuLandColors
					? loadAbuDualLand(family, abuLandColors)
					: dualPair
					? loadDualFrame(family, dualPair, hybrid)
					: loadImage(assetUrl(family.frames[resolvedVariant]!)),
				family.overlay ? loadImage(assetUrl(family.overlay.path)) : undefined,
				frameOverlay ? loadImage(assetUrl(frameOverlay.path)) : undefined,
				family.borderMask && borderStyle !== (family.baseBorderStyle ?? 'black')
					? loadBorderOverlay(family.borderMask, borderStyle)
					: undefined,
				ptPath ? loadImage(assetUrl(ptPath)) : undefined,
				artwork ? loadImageSource(artwork) : undefined,
				setSymbol ? loadImageSource(setSymbol) : undefined,
				typeIconPath ? loadImage(assetUrl(typeIconPath)) : undefined,
				planeswalker ? Promise.all(Object.entries(planeswalkerAssets).map(async ([key, path]) => [key, await loadImage(assetUrl(path))] as const)).then((entries) => Object.fromEntries(entries) as PlaneswalkerIcons) : undefined,
				colorIndicatorColors.length ? loadImage(assetUrl('img/frames/planeswalker/color-indicator/base.png')) : undefined,
				saga ? Promise.all(Object.entries(SAGA_ASSETS).map(async ([key, path]) => [key, await loadImage(assetUrl(path))] as const)).then((entries) => Object.fromEntries(entries) as SagaImages) : undefined,
			])
			const manaSymbols = new Map(
                await Promise.all(
                    [...manaFiles, ...futureManaFiles].map(async (file) => [
                        file,
						await loadImage(`${MANA_SYMBOLS_URL}${family.manaSymbolOverrides?.[file] ?? file}`),
                    ] as const),
                ),
			)
			await Promise.all(family.fonts.map((font) => document.fonts.load(font)))

			if (cancelled) return

			const canvas = canvasRef.current
			const context = canvas?.getContext('2d')

			if (!canvas || !context) return

			const iconlessPlaneswalker = family.id === 'planeswalker-seventh'
			context.resetTransform()
			context.clearRect(0, 0, WIDTH, HEIGHT)
			if (family.layout.canvas?.rotation === 'counterclockwise') {
				context.translate(0, HEIGHT)
				context.rotate(-Math.PI / 2)
			}
			drawCard(
				context,
				drawableCard,
				transform,
				{
					frame,
					overlay: overlay && family.overlay ? { image: overlay, ...family.overlay } : undefined,
					frameOverlay: frameOverlayImage && frameOverlay
						? { image: frameOverlayImage, crops: frameOverlay.crops, bounds: frameOverlay.bounds }
						: undefined,
					border,
					colorIndicatorBase,
					colorIndicatorColors,
					ptBackground,
					art,
					symbol,
					typeIcon,
					manaSymbols,
				},
				{ manaRuns, rulesRuns, flavorRuns },
				family.layout,
				resolvedVariant,
				planeswalker && planeswalkerIcons && !iconlessPlaneswalker
					? () => drawPlaneswalkerBackground(
						context,
						card,
						abilityRuns,
						planeswalkerIcons,
						family.layout.rules.y,
						family.layout.rules.y + family.layout.rules.height,
					)
					: undefined,
			)
			if (planeswalker && planeswalkerIcons) {
				if (iconlessPlaneswalker) {
					drawIconlessPlaneswalkerAbilities(context, card, abilityRuns, manaSymbols, family.layout.rules)
				} else {
					drawPlaneswalker(
						context,
						card,
						abilityRuns,
						manaSymbols,
						planeswalkerIcons,
						family.layout.rules.y,
						family.layout.rules.y + family.layout.rules.height,
						family.layout.rules.color,
					)
				}
				if (family.id === 'planeswalker-nickname') drawPlaneswalkerNickname(context, card.name)
				if (family.id === 'planeswalker-mdfc-back') {
					drawPlaneswalkerReverseFace(context, card, reverseManaRuns, manaSymbols)
				}
			}
			if (saga && sagaImages) {
				drawSaga(
					context,
					card,
					sagaReminderRuns,
					sagaChapterRuns,
					sagaCreatureRulesRuns,
					manaSymbols,
					sagaImages,
					family.layout.saga!,
				)
			}
			context.resetTransform()
			if (family.layout.footer.unrotated) {
				drawCardFooter(context, drawableCard, family.layout, resolvedVariant)
			}

		}

		void render()

		return () => {
			cancelled = true
		}
	}, [artwork, setSymbol, frameVariant, borderStyle, transform, card, canvasRef, family])

	return (
		<div style={{position: 'sticky', top: 0, zIndex: 2}}>
            {DEBUG_CANVAS && (
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={showDebug}
                        onChange={(event) => setShowDebug(event.target.checked)}
                    />{' '}
                    {t('showCanvasGuides')}
                </label>
            )}
			<div style={{
				position: 'relative',
				lineHeight: 0,
				aspectRatio: previewRotated ? `${HEIGHT} / ${WIDTH}` : undefined,
			}}>
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    aria-label={t('customCardPreview')}
                    onPointerDown={startDragging}
                    onPointerMove={dragArtwork}
                    onPointerUp={stopDragging}
                    onPointerCancel={stopDragging}
					onPointerLeave={() => !dragging && setArtworkHovered(false)}
                    style={{
						position: previewRotated ? 'absolute' : undefined,
						top: previewRotated ? '50%' : undefined,
						left: previewRotated ? '50%' : undefined,
						width: previewRotated ? `${WIDTH / HEIGHT * 100}%` : '100%',
                        height: 'auto',
						transform: previewRotated ? 'translate(-50%, -50%) rotate(90deg)' : undefined,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--card-image-radius)',
                        boxShadow: '10px 5px 15px 0px var(--shadow)',
                        cursor: dragging ? 'grabbing' : artwork && artworkHovered ? 'grab' : 'default',
						userSelect: 'none',
						pointerEvents: previewRotated ? 'none' : undefined,
                    }}
                />
                {DEBUG_CANVAS && showDebug && (
                    <svg
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        aria-hidden="true"
						style={{
							position: 'absolute',
							top: previewRotated ? '50%' : 0,
							left: previewRotated ? '50%' : 0,
							width: previewRotated ? `${WIDTH / HEIGHT * 100}%` : '100%',
							height: previewRotated ? 'auto' : '100%',
							transform: previewRotated ? 'translate(-50%, -50%) rotate(90deg)' : undefined,
							pointerEvents: 'none',
						}}
                    >
						{debugRegions.map((region, index) => {
							const color = DEBUG_COLORS[index % DEBUG_COLORS.length]
							const transformDebugRegion = !region.unrotated && family.layout.canvas?.rotation === 'counterclockwise'
								? `translate(0 ${HEIGHT}) rotate(-90)`
								: undefined

							return (
								<g key={`${region.label}-${index}`} transform={transformDebugRegion}>
									<rect
										x={region.x}
										y={region.y}
										width={region.width}
										height={region.height}
										fill={color}
										fillOpacity="0.18"
										stroke={color}
										strokeWidth="4"
										strokeDasharray="12 8"
									/>
									<text
										x={region.x + 8}
										y={region.y + 30}
										fill={color}
										stroke="#000"
										strokeWidth="6"
										paintOrder="stroke"
										fontSize="40"
										fontFamily="sans-serif"
									>
										{region.label}
									</text>
								</g>
							)
						})}
                    </svg>
                )}
            </div>
			<small className="text-center text-muted block mt-2" style={{ display: 'block' }}>{t('dragImageHelp')}</small>
			{family.layout.canvas && (
                <div className="text-center">
                    <button
                        type="button"
                        className="btn sm mt-2"
                        onClick={() => setPreviewRotated((rotated) => !rotated)}
                    >
                        <Icon name="refresh-cw"/> {t('rotateCanvas')}
                    </button>
                </div>
			)}
		</div>
	)
}
