import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { DUAL_FRAME_VARIANTS, type CustomCardData, type FrameVariant } from './types'
import { getRunSymbolFile, hasHybridManaSymbol, parseCardText, parseRulesText, parseManaCost, type CardTextRun } from './cardText'
import { drawCard, HEIGHT, PT_BOUNDS, PT_OFFSET, WIDTH } from './drawCard'
import { loadImage, loadImageSource } from './loadImage'
import { loadDualFrame } from './composeDualFrame'
import { useI18n } from '../../i18n/context'

const DEBUG_CANVAS = import.meta.env.DEV
const FRAME_ROOT = `${import.meta.env.BASE_URL}img/frames/m15/boxTopper/`
const MANA_SYMBOLS_URL = `${import.meta.env.BASE_URL}img/manaSymbols/`
const PT_ROOT = `${import.meta.env.BASE_URL}img/frames/m15/regular/`
const ARTWORK_DRAG_TOP = 210
const ARTWORK_DRAG_BOTTOM = 1200
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
	frameVariant: FrameVariant
	transform: ArtworkTransform,
    card: CustomCardData,
    onTransformChange: (transform: ArtworkTransform) => void,
	canvasRef?: RefObject<HTMLCanvasElement | null>
}

export function CardCanvas({ artwork, setSymbol, frameVariant, transform, card, onTransformChange, canvasRef: externalCanvasRef }: CardCanvasProps) {
	const { t } = useI18n()
	const internalCanvasRef = useRef<HTMLCanvasElement>(null)
	const canvasRef = externalCanvasRef ?? internalCanvasRef
    const [dragging, setDragging] = useState(false)
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
		if (y < ARTWORK_DRAG_TOP || y > ARTWORK_DRAG_BOTTOM) return

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

			const dualPair = DUAL_FRAME_VARIANTS.find((pair) => pair === frameVariant)
			const hybrid = Boolean(dualPair && hasHybridManaSymbol(card.manaCost))
			const ptVariant = hybrid ? 'C' : dualPair ? 'M' : frameVariant === 'L' ? 'C' : frameVariant.endsWith('L')
				? frameVariant[0]
				: frameVariant
			const [frame, ptBackground, art, symbol] = await Promise.all([
				dualPair
					? loadDualFrame(dualPair, hybrid)
					: loadImage(`${FRAME_ROOT}${frameVariant === 'C' ? 'c.png' : `m15BoxTopperFrame${frameVariant}.png`}`),
				loadImage(`${PT_ROOT}m15PT${ptVariant}.png`),
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

			drawCard(
				context,
				card,
				transform,
				{ frame, ptBackground, art, symbol, manaSymbols },
				{ manaRuns, rulesRuns, flavorRuns },
			)

		}

		void render()

		return () => {
			cancelled = true
		}
	}, [artwork, setSymbol, frameVariant, transform, card, canvasRef])

	return (
		<div>
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
                {DEBUG_CANVAS && showDebug && (
                    <svg
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        aria-hidden="true"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                    >
                        <g fill="#000" stroke="#ff00ff" fillOpacity="0.25" strokeWidth="4" strokeDasharray="12 8">
                            <rect x="115" y="110" width="1000" height="100" />
                            <rect x="1050" y="110" width="340" height="100" />
                            <rect x="115" y="1200" width="1155" height="100" />

                            <rect x="1285" y="1195" width="100" height="100" />

                            <rect x="125" y="1345" width="1240" height="555" />
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
            <small className="text-center text-muted block mt-2" style={{ display: 'block' }}>{t('dragImageHelp')}</small>
		</div>
	)
}
