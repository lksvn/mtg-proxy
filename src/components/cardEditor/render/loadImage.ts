const imageCache = new Map<string, Promise<HTMLImageElement>>()
const fileImageCache = new WeakMap<File, Promise<HTMLImageElement>>()

export function loadImage(src: string) {
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

export function loadImageSource(source: File | string) {
	return typeof source === 'string' ? loadImage(source) : loadFileImage(source)
}
