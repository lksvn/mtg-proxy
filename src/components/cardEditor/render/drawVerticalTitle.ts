export function drawVerticalTitle(
	context: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	width: number,
	height: number,
) {
	const characters = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)]
		.map(segment => segment.segment)
	if (!characters.length) return
	const step = Math.min(parseFloat(context.font), height / characters.length)
	context.save()
	context.font = context.font.replace(/[\d.]+px/, `${step}px`)
	context.textAlign = 'center'
	characters.forEach((character, index) => {
		context.fillText(character, x + width / 2, y + step * (index + 0.5), width)
	})
	context.restore()
}
