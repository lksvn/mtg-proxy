export function canvasToPng(canvas: HTMLCanvasElement | null): Promise<Blob> {
	return new Promise((resolve, reject) => {
		if (!canvas) {
			reject(new Error('Could not access the card canvas'))
			return
		}
		canvas.toBlob((blob) => {
			if (blob) resolve(blob)
			else reject(new Error('Could not prepare card image'))
		}, 'image/png')
	})
}
