import type { FrameFamily } from '../frameFamilies'
import type { FrameVariant } from '../types'
import { loadImage } from './loadImage'
import { HEIGHT, WIDTH } from './drawCard'

const cache = new Map<string, Promise<HTMLCanvasElement>>()

export function loadAbuDualLand(family: FrameFamily, colors: readonly [FrameVariant, FrameVariant]) {
	const key = colors.join(':')
	const cached = cache.get(key)
	if (cached) return cached

	const loading = (async () => {
		const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
		const [base, top, mask] = await Promise.all([
			loadImage(assetUrl(family.frames[colors[0]]!)),
			loadImage(assetUrl(family.frames[colors[1]]!)),
			loadImage(assetUrl(family.dualLandMask!)),
		])
		const frame = document.createElement('canvas')
		const layer = document.createElement('canvas')
		frame.width = layer.width = WIDTH
		frame.height = layer.height = HEIGHT
		const context = frame.getContext('2d')!
		const layerContext = layer.getContext('2d')!
		context.drawImage(base, 0, 0, WIDTH, HEIGHT)
		layerContext.drawImage(top, 0, 0, WIDTH, HEIGHT)
		layerContext.globalCompositeOperation = 'destination-in'
		layerContext.drawImage(mask, 0, 0, WIDTH, HEIGHT)
		context.drawImage(layer, 0, 0)
		return frame
	})().catch((error) => {
		cache.delete(key)
		throw error
	})
	cache.set(key, loading)
	return loading
}
