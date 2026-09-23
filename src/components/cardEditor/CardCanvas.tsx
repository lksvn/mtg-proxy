import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { DUAL_FRAME_VARIANTS, type CustomCardData, type FrameVariant } from './types'
import { getRunSymbolFile, hasHybridManaSymbol, parseCardText, parseRulesText, parseManaCost, type CardTextRun } from './cardText'
import { drawCard, HEIGHT, WIDTH } from './render/drawCard'
import { loadImage, loadImageSource } from './render/loadImage'
import { loadDualFrame } from './render/composeDualFrame'
import { loadBorderOverlay } from './render/composeBorder'
import { useI18n } from '../../i18n/context'
import { getFrameFamily, resolveFrameVariant, resolvePtVariant, type FrameBorderStyle, type FrameFamilyId } from './frameFamilies'

const DEBUG_CANVAS = import.meta.env.DEV
const MANA_SYMBOLS_URL = `${import.meta.env.BASE_URL}img/manaSymbols/`
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
export type ArtworkTransform = {
	x: number
	y: number
	flipX: boolean
	flipY: boolean
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
    card: CustomCardData,
    onTransformChange: (transform: ArtworkTransform) => void,
	canvasRef?: RefObject<HTMLCanvasElement | null>
}

export function CardCanvas({ artwork, setSymbol, frameFamily, frameVariant, borderStyle, transform, card, onTransformChange, canvasRef: externalCanvasRef }: CardCanvasProps) {
	const { t } = useI18n()
	const family = getFrameFamily(frameFamily)
	const internalCanvasRef = useRef<HTMLCanvasElement>(null)
	const canvasRef = externalCanvasRef ?? internalCanvasRef
    const [dragging, setDragging] = useState(false)
	const [artworkHovered, setArtworkHovered] = useState(false)
	const [showDebug, setShowDebug] = useState(false)
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
		const y = (event.clientY - bounds.top) * (HEIGHT / bounds.height)
		if (y < family.layout.artwork.dragTop || y > family.layout.artwork.dragBottom) return

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
		const y = (event.clientY - bounds.top) * (HEIGHT / bounds.height)
		setArtworkHovered(y >= family.layout.artwork.dragTop && y <= family.layout.artwork.dragBottom)

        const drag = dragRef.current

        if (!drag || drag.pointerId !== event.pointerId) return

        onTransformChange({
            ...transform,
            x:
                drag.x +
                (event.clientX - drag.clientX) *
                    (WIDTH / bounds.width),
            y:
                drag.y +
                (event.clientY - drag.clientY) *
                    (HEIGHT / bounds.height),
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
			const y = (event.clientY - bounds.top) * (HEIGHT / bounds.height)
			if (y < family.layout.artwork.dragTop || y > family.layout.artwork.dragBottom) return

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
            const manaRuns = parseManaCost(card.manaCost)
            const rulesRuns = parseRulesText(card.rulesText)

            const flavorRuns = parseCardText(card.flavorText).map(
                (run): CardTextRun =>
                    run.type === 'text'
                        ? { ...run, italic: true }
                        : run,
            )

            const allRuns = [...manaRuns, ...rulesRuns, ...flavorRuns]

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
			const dualPair = DUAL_FRAME_VARIANTS.find((pair) => pair === resolvedVariant)
			const hybrid = Boolean(dualPair && hasHybridManaSymbol(card.manaCost))
			const ptVariant = resolvePtVariant(resolvedVariant, hybrid)
			const ptPath = family.pt[ptVariant] ?? family.pt.C ?? Object.values(family.pt)[0]
			const [frame, border, ptBackground, art, symbol] = await Promise.all([
				dualPair
					? loadDualFrame(family, dualPair, hybrid)
					: loadImage(assetUrl(family.frames[resolvedVariant]!)),
				family.borderMask && borderStyle !== 'black' ? loadBorderOverlay(family.borderMask, borderStyle) : undefined,
				ptPath ? loadImage(assetUrl(ptPath)) : undefined,
				artwork ? loadImageSource(artwork) : undefined,
                setSymbol ? loadImageSource(setSymbol) : undefined
			])
			const manaSymbols = new Map(
                await Promise.all(
                    manaFiles.map(async (file) => [
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

			drawCard(
				context,
				card,
				transform,
				{ frame, border, ptBackground, art, symbol, manaSymbols },
				{ manaRuns, rulesRuns, flavorRuns },
				family.layout,
				resolvedVariant,
			)

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
            <div style={{ position: 'relative', lineHeight: 0 }}>
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
                        width: '100%',
                        height: 'auto',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--card-image-radius)',
                        boxShadow: '10px 5px 15px 0px var(--shadow)',
                        cursor: dragging ? 'grabbing' : artwork && artworkHovered ? 'grab' : 'default',
                        userSelect: 'none'
                    }}
                />
                {DEBUG_CANVAS && showDebug && (
                    <svg
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        aria-hidden="true"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                    >
                        <g fill="#000" stroke="#ff00ff" fillOpacity="0.25" strokeWidth="4" strokeDasharray="12 8">
							<rect x={family.layout.title.x} y={family.layout.title.y - 50} width={family.layout.title.maxWidth} height="100" />
							<rect x={family.layout.type.x} y={family.layout.type.y - 50} width={family.layout.type.maxWidth} height="100" />
							<rect x={family.layout.symbol.centerX - family.layout.symbol.boxSize / 2} y={family.layout.symbol.centerY - family.layout.symbol.boxSize / 2} width={family.layout.symbol.boxSize} height={family.layout.symbol.boxSize} />
							<rect x={family.layout.rules.x} y={family.layout.rules.y} width={family.layout.rules.width} height={family.layout.rules.height} />
							<rect
								x={family.layout.pt.x}
								y={family.layout.pt.y}
								width={family.layout.pt.width}
								height={family.layout.pt.height}
                            />
                        </g>
                    </svg>
                )}
            </div>
            <small className="text-center text-muted block mt-2" style={{ display: 'block' }}>{t('dragImageHelp')}</small>
		</div>
	)
}
