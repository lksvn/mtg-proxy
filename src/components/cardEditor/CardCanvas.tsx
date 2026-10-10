import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { HEIGHT, WIDTH } from './canvasDimensions'
import { getFrameFamily } from './frameFamilies'
import type { CardRenderInput, CardRenderResult } from './cardRender'
import { renderCardPreview } from './render/renderCardPreview'
import { useI18n } from '../../i18n/context'
import { getDebugRegions } from './render/getDebugRegions'
import { isInsideArtwork } from './artworkHitArea'
import { Icon } from '../Icon'

const DEBUG_CANVAS = import.meta.env.DEV
const DEBUG_COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#007aff', '#5856d6', '#af52de', '#ff2d55']

export type ArtworkTransform = {
	x: number
	y: number
	flipX: boolean
	flipY: boolean
	grayscale: boolean
	invert: boolean
	scale: number
    rotation: number
}

type CardCanvasProps = {
	input: CardRenderInput
	onRenderResult: (result: CardRenderResult) => void
    onTransformChange: (transform: ArtworkTransform) => void,
	canvasRef?: RefObject<HTMLCanvasElement | null>
}

export function CardCanvas({ input, onRenderResult, onTransformChange, canvasRef: externalCanvasRef }: CardCanvasProps) {
	const { artwork, frameFamily, transform } = input
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

		void renderCardPreview(input, canvasRef, () => cancelled).then((textOverflow) => {
			if (!cancelled) onRenderResult({ input, status: 'ready', textOverflow })
		}).catch((error: unknown) => {
			if (cancelled) return
			console.error('Could not render card', error)
			onRenderResult({ input, status: 'error' })
		})

		return () => {
			cancelled = true
		}
	}, [input, canvasRef, onRenderResult])

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
			{(family.layout.canvas || family.layout.previewRotation) && (
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
