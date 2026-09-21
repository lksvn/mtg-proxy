import { getRunSymbolFile } from '../cardText'

export function drawGenericMana(
	context: CanvasRenderingContext2D,
	value: string,
	x: number,
	y: number,
	size: number,
    shadow = true
) {
	const radius = size / 2

	context.save()
	context.fillStyle = '#cbc2bf'
    if (shadow) {
        context.shadowColor = '#000'
        context.shadowOffsetX = 4
        context.shadowOffsetY = 5
    }

	context.beginPath()
	context.arc(x + radius, y, radius, 0, Math.PI * 2)
	context.fill()

	context.shadowColor = 'transparent'
	context.shadowOffsetX = 0
	context.shadowOffsetY = 0

	context.fillStyle = '#231f20'
	context.font = `bold ${
		value.length > 2 ? size * 0.4 : size * 0.55
	}px belerenbsc, serif`
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	context.fillText(value, x + radius, y)

	context.restore()
}

export function drawManaSymbol(
	context: CanvasRenderingContext2D,
	value: string,
	symbols: ReadonlyMap<string, HTMLImageElement>,
	x: number,
	centerY: number,
	size: number,
	shadow = false,
) {
	const file = getRunSymbolFile(value)
	const image = file ? symbols.get(file) : undefined

	if (image) {
		context.save()
		if (shadow) {
			context.shadowColor = '#000'
			context.shadowOffsetX = 2
			context.shadowOffsetY = 6
		}
		context.drawImage(image, x, centerY - size / 2, size, size)
		context.restore()
	} else if (/^\d+$/.test(value)) {
		drawGenericMana(context, value, x, centerY, size, shadow)
	}
}
