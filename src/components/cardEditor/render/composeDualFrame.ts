import { HEIGHT, WIDTH } from './drawCard'
import type { FrameFamily } from '../frameFamilies'
import { loadImage } from './loadImage'
import type { DualFrameVariant, FrameVariant } from '../types'

const frameCache = new Map<string, Promise<HTMLCanvasElement>>()

function url(path: string) {
	return `${import.meta.env.BASE_URL}${path}`
}

export function loadDualFrame(family: FrameFamily, pair: DualFrameVariant, hybrid: boolean) {
	const key = `${family.id}:${pair}:${hybrid}`
	const cached = frameCache.get(key)
	if (cached) return cached

	const loading = composeDualFrame(family, pair, hybrid).catch((error) => {
		frameCache.delete(key)
		throw error
	})
	frameCache.set(key, loading)
	return loading
}

async function composeDualFrame(family: FrameFamily, pair: DualFrameVariant, hybrid: boolean) {
	const dual = family.dual
	if (!dual) throw new Error(`Frame family ${family.id} does not support dual frames`)

	const [multicolored, left, right, neutral, rulesMask, pinlineMask, titleMask, typeMask, frameMask, rightHalf] = await Promise.all([
		loadImage(url(family.frames.M!)),
		loadImage(url(family.frames[pair[0] as FrameVariant]!)),
		loadImage(url(family.frames[pair[1] as FrameVariant]!)),
		loadImage(url(family.frames[dual.neutralVariant]!)),
		loadImage(url(dual.rulesMask)),
		loadImage(url(dual.pinlineMask)),
		loadImage(url(dual.titleMask)),
		loadImage(url(dual.typeMask)),
		loadImage(url(dual.frameMask)),
		loadImage(url(dual.rightHalfMask)),
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
		maskContext.drawImage(image, 0, 0, WIDTH, HEIGHT)
		maskContext.globalCompositeOperation = 'destination-in'
		maskContext.drawImage(mask, 0, 0, WIDTH, HEIGHT)
		if (rightSide) maskContext.drawImage(rightHalf, 0, 0, WIDTH, HEIGHT)
		output.drawImage(layer, 0, 0)
	}

	output.drawImage(hybrid ? left : multicolored, 0, 0, WIDTH, HEIGHT)
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
