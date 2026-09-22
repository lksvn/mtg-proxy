import { getRunSymbolFile } from '../cardText.ts'

export type SymbolShadow = Partial<Pick<CanvasRenderingContext2D, 'shadowColor' | 'shadowOffsetX' | 'shadowOffsetY'>>

export function drawGenericMana(
	context: CanvasRenderingContext2D,
	value: string,
	x: number,
	y: number,
	size: number,
    shadow?: SymbolShadow
) {
	const radius = size / 2

	context.save()
	context.fillStyle = '#cbc2bf'
    if (shadow) {
        context.shadowColor = shadow.shadowColor ?? '#000'
        context.shadowOffsetX = shadow.shadowOffsetX ?? 4
        context.shadowOffsetY = shadow.shadowOffsetY ?? 5
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
	shadow?: SymbolShadow,
) {
	const file = getRunSymbolFile(value)
	const image = file ? symbols.get(file) : undefined

	if (image) {
		context.save()
		if (shadow) {
			context.shadowColor = shadow.shadowColor ?? '#000'
			context.shadowOffsetX = shadow.shadowOffsetX ?? 2
			context.shadowOffsetY = shadow.shadowOffsetY ?? 6
		}
		context.drawImage(image, x, centerY - size / 2, size, size)
		context.restore()
	} else if (/^\d+$/.test(value)) {
		drawGenericMana(context, value, x, centerY, size, shadow)
	}
}
