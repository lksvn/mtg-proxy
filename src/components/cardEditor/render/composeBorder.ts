import type { FrameBorderStyle } from '../frameFamilies'
import { HEIGHT, WIDTH } from './drawCard'
import { loadImage } from './loadImage'

const BORDER_COLORS: Record<FrameBorderStyle, string> = {
	black: '#000000',
	white: '#ffffff',
	silver: '#a3aeb7',
	gold: '#a6884c',
}

const cache = new Map<string, Promise<HTMLCanvasElement>>()

export function loadBorderOverlay(maskPath: string, style: FrameBorderStyle) {
	const key = `${maskPath}:${style}`
	const cached = cache.get(key)
	if (cached) return cached

	const loading = loadImage(`${import.meta.env.BASE_URL}${maskPath}`).then((mask) => {
		const canvas = document.createElement('canvas')
		canvas.width = WIDTH
		canvas.height = HEIGHT
		const context = canvas.getContext('2d')
		if (!context) throw new Error('Could not create border canvas')
		context.fillStyle = BORDER_COLORS[style]
		context.fillRect(0, 0, WIDTH, HEIGHT)
		context.globalCompositeOperation = 'destination-in'
		context.drawImage(mask, 0, 0, WIDTH, HEIGHT)
		return canvas
	}).catch((error) => {
		cache.delete(key)
		throw error
	})
	cache.set(key, loading)
	return loading
}
