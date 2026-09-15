import { HEIGHT, WIDTH } from './drawCard'
import { loadImage } from './loadImage'
import type { DualFrameVariant } from './types'

const FRAME_ROOT = `${import.meta.env.BASE_URL}img/frames/m15/boxTopper/`
const MASK_ROOT = `${import.meta.env.BASE_URL}img/frames/m15/regular/`

const frameCache = new Map<string, Promise<HTMLCanvasElement>>()

export function loadDualFrame(pair: DualFrameVariant, hybrid: boolean) {
	const key = `${pair}:${hybrid}`
	const cached = frameCache.get(key)
	if (cached) return cached

	const loading = composeDualFrame(pair, hybrid).catch((error) => {
		frameCache.delete(key)
		throw error
	})
	frameCache.set(key, loading)
	return loading
}

async function composeDualFrame(pair: DualFrameVariant, hybrid: boolean) {
	const [multicolored, left, right, neutral, rulesMask, pinlineMask, titleMask, typeMask, frameMask, rightHalf] = await Promise.all([
		loadImage(`${FRAME_ROOT}m15BoxTopperFrameM.png`),
		loadImage(`${FRAME_ROOT}m15BoxTopperFrame${pair[0]}.png`),
		loadImage(`${FRAME_ROOT}m15BoxTopperFrame${pair[1]}.png`),
		loadImage(`${FRAME_ROOT}m15BoxTopperFrameL.png`),
		loadImage(`${MASK_ROOT}m15MaskRules.png`),
		loadImage(`${MASK_ROOT}m15MaskPinlineSuper.png`),
		loadImage(`${MASK_ROOT}m15MaskTitle.png`),
		loadImage(`${MASK_ROOT}m15MaskType.png`),
		loadImage(`${MASK_ROOT}m15MaskFrame.png`),
		loadImage(`${MASK_ROOT}maskRightHalf.png`),
	])

	const frame = document.createElement('canvas')
	frame.width = WIDTH
	frame.height = HEIGHT
	const context = frame.getContext('2d')
	const layer = document.createElement('canvas')
	layer.width = WIDTH
	layer.height = HEIGHT
	const layerContext = layer.getContext('2d')
	if (!context || !layerContext) throw new Error('Could not create dual-frame canvas')
	const output = context
	const maskContext = layerContext

	function drawMasked(image: HTMLImageElement, mask: HTMLImageElement, rightSide = false) {
		maskContext.clearRect(0, 0, WIDTH, HEIGHT)
		maskContext.globalCompositeOperation = 'source-over'
		maskContext.drawImage(image, 0, 0)
		maskContext.globalCompositeOperation = 'destination-in'
		maskContext.drawImage(mask, 0, 0, WIDTH, HEIGHT)
		if (rightSide) maskContext.drawImage(rightHalf, 0, 0, WIDTH, HEIGHT)
		output.drawImage(layer, 0, 0)
	}

	output.drawImage(hybrid ? left : multicolored, 0, 0)
	if (hybrid) {
		drawMasked(right, frameMask, true)
		drawMasked(neutral, titleMask)
		drawMasked(neutral, typeMask)
	}
	for (const mask of [rulesMask, pinlineMask]) {
		drawMasked(left, mask)
		drawMasked(right, mask, true)
	}
	return frame
}
