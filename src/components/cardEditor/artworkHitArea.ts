import type { FrameFamily } from './frameFamilies'
import { HEIGHT, WIDTH } from './canvasDimensions.ts'

export function isInsideArtwork(
	clientX: number,
	clientY: number,
	bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
	layout: FrameFamily['layout'],
) {
	const canvasX = (clientX - bounds.left) * (WIDTH / bounds.width)
	const canvasY = (clientY - bounds.top) * (HEIGHT / bounds.height)
	const x = layout.canvas?.rotation === 'counterclockwise' ? HEIGHT - canvasY : canvasX
	const y = layout.canvas?.rotation === 'counterclockwise' ? canvasX : canvasY
	const artwork = layout.artwork

	return x >= artwork.dragLeft && x <= artwork.dragRight &&
		y >= artwork.dragTop && y <= artwork.dragBottom
}
