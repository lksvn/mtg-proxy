import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import type { CustomCardData } from './types'
import { getRunSymbolFile, parseCardText, parseRulesText, parseManaCost, type CardTextRun } from './cardText'
import { drawRulesText } from './drawRulesText'
import { drawManaCost } from './drawManaCost'
import { useI18n } from '../../i18n/context'

const WIDTH = 1500
const HEIGHT = 2100
const DEBUG_CANVAS = import.meta.env.DEV
const FRAME_URL = `${import.meta.env.BASE_URL}img/frames/m15/boxTopper/m15BoxTopperFrameA.png`
const MANA_SYMBOLS_URL = `${import.meta.env.BASE_URL}img/manaSymbols/`
const PT_URL = `${import.meta.env.BASE_URL}img/frames/m15/regular/m15PTA.png`
const PT_OFFSET = {
	x: 0,
	y: 45
}
const PT_BOUNDS = {
	x: 1136,
	y: 1858,
	width: 282,
	height: 154,
	textX: 1290,
	textY: 1925
}
const RARITY_COLORS: Record<CustomCardData['rarity'], string> = {
    common: '#ffffff',
    uncommon: '#c0c0c0',
    rare: '#d4af37',
    mythic: '#e05a2a'
}
const RARITY_CODES: Record<CustomCardData['rarity'], string> = {
	common: 'C',
	uncommon: 'U',
	rare: 'R',
	mythic: 'M'
}

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
	transform: ArtworkTransform,
    card: CustomCardData,
    onTransformChange: (transform: ArtworkTransform) => void,
	canvasRef?: RefObject<HTMLCanvasElement | null>
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()
const fileImageCache = new WeakMap<File, Promise<HTMLImageElement>>()

function loadImage(src: string) {
	const cached = imageCache.get(src)
	if (cached) return cached

	const loading = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image()

		image.onload = () => resolve(image)
		image.onerror = () => {
			imageCache.delete(src)
			reject(new Error(`Could not load image: ${src}`))
		}

		image.src = src
	})

	imageCache.set(src, loading)
	return loading
}

function loadFileImage(file: File) {
	const cached = fileImageCache.get(file)
	if (cached) return cached

	const loading = new Promise<HTMLImageElement>((resolve, reject) => {
		const url = URL.createObjectURL(file)
		const image = new Image()

		image.onload = () => {
			URL.revokeObjectURL(url)
			resolve(image)
		}
		image.onerror = () => {
			URL.revokeObjectURL(url)
			fileImageCache.delete(file)
			reject(new Error(`Could not load image: ${file.name}`))
		}
		image.src = url
	})

	fileImageCache.set(file, loading)
	return loading
}

function loadImageSource(source: File | string) {
	return typeof source === 'string' ? loadImage(source) : loadFileImage(source)
}

export function CardCanvas({ artwork, setSymbol, transform, card, onTransformChange, canvasRef: externalCanvasRef }: CardCanvasProps) {
	const { t } = useI18n()
	const internalCanvasRef = useRef<HTMLCanvasElement>(null)
	const canvasRef = externalCanvasRef ?? internalCanvasRef
    const [dragging, setDragging] = useState(false)
    const dragRef = useRef<{
        pointerId: number
        clientX: number
        clientY: number
        x: number
        y: number
    }>(null)

    function startDragging(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (!artwork) return

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
        const drag = dragRef.current

        if (!drag || drag.pointerId !== event.pointerId) return

        const bounds = event.currentTarget.getBoundingClientRect()

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

        function zoomArtwork(event: WheelEvent) {
            if (!artwork) return

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

        canvas.addEventListener('wheel', zoomArtwork, {
            passive: false,
        })

        return () => {
            canvas.removeEventListener('wheel', zoomArtwork)
        }
    }, [artwork, canvasRef, onTransformChange])

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

            const cardTextRuns: CardTextRun[] = [
                ...rulesRuns,
                ...(card.rulesText && card.flavorText
                    ? [{ type: 'text', value: '\n\n', italic: false } as CardTextRun]
                    : []),
                ...flavorRuns,
            ]

            const allRuns = [...manaRuns, ...cardTextRuns]

            const manaFiles = [
                ...new Set(
                    allRuns.flatMap((run) => {
                        if (run.type !== 'symbol') return []

                        const file = getRunSymbolFile(run.value)
                        return file ? [file] : []
                    }),
                ),
            ]

			const [frame, ptBackground, art, symbol] = await Promise.all([
				loadImage(FRAME_URL),
				loadImage(PT_URL),
				artwork ? loadImageSource(artwork) : undefined,
                setSymbol ? loadImageSource(setSymbol) : undefined
			])
			const manaSymbols = new Map(
                await Promise.all(
                    manaFiles.map(async (file) => [
                        file,
                        await loadImage(`${MANA_SYMBOLS_URL}${file}`),
                    ] as const),
                ),
			)
			await Promise.all([
                document.fonts.load('64px belerenb'),
                document.fonts.load('64px belerenbsc'),
                document.fonts.load('74px mplantin'),
                document.fonts.load('74px mplantini'),
            ])

			if (cancelled) return

			const canvas = canvasRef.current
			const context = canvas?.getContext('2d')

			if (!canvas || !context) return

            // Canvas background
			context.fillStyle = card.backgroundColor
			context.fillRect(0, 0, WIDTH, HEIGHT)

            // Draw the artwork
			if (art) {
				const scale =
					Math.max(WIDTH / art.width, HEIGHT / art.height) *
					(1 + transform.scale)

				const width = art.width * scale
				const height = art.height * scale

				context.save()
				context.translate(
					WIDTH / 2 + transform.x,
					HEIGHT / 2 + transform.y,
				)

                context.rotate(transform.rotation * Math.PI / 180)

				context.scale(
					transform.flipX ? -1 : 1,
					transform.flipY ? -1 : 1,
				)
				context.drawImage(art, -width / 2, -height / 2, width, height)
				context.restore()
			}

            // Draw the card frame
			context.drawImage(frame, 0, 0)

            // Draw the set symbol
            // Tint the icon with the rarity colours
            if (symbol) {
                const boxSize = 100
                const scale = Math.min(
                    boxSize / symbol.width,
                    boxSize / symbol.height,
                )

                const width = symbol.width * scale
                const height = symbol.height * scale

                if (card.tintSetSymbol) {
                    const tinted = document.createElement('canvas')
                    const tintedContext = tinted.getContext('2d')

                    tinted.width = boxSize
                    tinted.height = boxSize

                    if (tintedContext) {
                        tintedContext.drawImage(
                            symbol,
                            (boxSize - width) / 2,
                            (boxSize - height) / 2,
                            width,
                            height,
                        )

                        tintedContext.globalCompositeOperation = 'source-in'
                        tintedContext.fillStyle = RARITY_COLORS[card.rarity]
                        tintedContext.fillRect(0, 0, boxSize, boxSize)

                        context.drawImage(tinted, 1285, 1195)
                    }
                } else {
                    context.drawImage(
                        symbol,
                        1335 - width / 2,
                        1245 - height / 2,
                        width,
                        height,
                    )
                }
            }

            // Card inputs
            context.fontKerning = 'normal'
            context.textRendering = 'optimizeLegibility'
            context.textBaseline = 'middle'
            // Name
            context.fillStyle = '#111'
            context.font = '70px belerenb, serif'
            context.textAlign = 'left'
            context.fillText(card.name, 115, 160, 1000)
            // Mana cost
            context.textAlign = 'right'
            drawManaCost(context, manaRuns, manaSymbols, 1390, 160)
            // Type
            context.fillStyle = '#fff'
            context.font = '54px belerenb, serif'
            context.textAlign = 'left'
            context.fillText(card.typeLine, 115, 1245, 1120)
            // Rules and flavor text
            drawRulesText(context, cardTextRuns, manaSymbols, 135, 1350, 1230, 540)
            // Power and Toughness
            // Draw the frame
            if (card.powerToughness) {
                context.drawImage(
                    ptBackground,
                    PT_OFFSET.x + PT_BOUNDS.x,
                    PT_OFFSET.y + PT_BOUNDS.y,
                    PT_BOUNDS.width,
                    PT_BOUNDS.height
                )
            }
            // text
            if (card.powerToughness) {
                context.fillStyle = '#111'
                context.font = '64px belerenbsc, serif'
                context.textAlign = 'center'
                context.fillText(
                    card.powerToughness,
                    PT_OFFSET.x + PT_BOUNDS.textX,
                    PT_OFFSET.y + PT_BOUNDS.textY,
                    PT_BOUNDS.width
                )
            }
            // Rarity and Artist
            context.fillStyle = '#fff'
            context.font = '38px mplantin, serif'
            context.textAlign = 'left'
            context.fillText(
                `${RARITY_CODES[card.rarity]}${card.number ? ' • ' + card.number : ''}${card.artist ? ' • ' + card.artist : ''}`,
                115,
                1985,
                1050
            )
            //
            context.fillStyle = '#fff'
            context.font = '34px mplantin, serif'
            context.textAlign = 'left'
            context.fillText('NOT FOR SALE • Made on MTG Proxy', 115, 2025, 1050)

		}

		void render()

		return () => {
			cancelled = true
		}
	}, [artwork, setSymbol, transform, card, canvasRef])

	return (
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
			style={{
                width: '100%',
                height: 'auto',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--card-image-radius)',
                boxShadow: '10px 5px 15px 0px var(--shadow)',
                cursor: artwork ? dragging ? 'grabbing' : 'grab' : 'default',
                userSelect: 'none'
			}}
		/>
		{DEBUG_CANVAS && (
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				aria-hidden="true"
				style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
			>
				<g fill="none" stroke="#ff00ff" strokeWidth="4" strokeDasharray="12 8">
					<rect x="115" y="110" width="1000" height="100" />
					<rect x="1050" y="110" width="340" height="100" />
					<rect x="115" y="1205" width="1120" height="80" />
					<rect x="1285" y="1195" width="100" height="100" />
					<rect x="135" y="1370" width="1230" height="320" />
					<rect x="135" y="1690" width="1230" height="190" />
					<rect
						x={PT_OFFSET.x + PT_BOUNDS.x}
						y={PT_OFFSET.y + PT_BOUNDS.y}
						width={PT_BOUNDS.width}
						height={PT_BOUNDS.height}
					/>
				</g>
			</svg>
		)}
		</div>
	)
}
