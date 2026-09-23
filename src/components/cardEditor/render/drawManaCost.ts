import type { CardTextRun } from '../cardText'
import { drawManaSymbol, type SymbolShadow } from './drawGenericMana.ts'

export function futureManaFile(value: string) {
	const token = value.toLowerCase().replace('/', '')
	return /^(?:[wubrgx]|[0-9]|1[0-9]|20|wu|wb|ub|ur|br|bg|rg|rw|gw|gu)$/.test(token)
		? `future/f${token}.png`
		: undefined
}

export function drawManaCost(
	context: CanvasRenderingContext2D,
	runs: CardTextRun[],
	symbols: ReadonlyMap<string, HTMLImageElement>,
	right: number,
	centerY: number,
	style: { symbolSize: number; gap: number; font: string; color: string; verticalPositions?: readonly (readonly [number, number])[] } & SymbolShadow,
) {
	const { symbolSize, gap } = style
	if (style.verticalPositions && runs.length <= style.verticalPositions.length) {
		runs.forEach((run, index) => {
			const [x, y] = style.verticalPositions![index]
			const image = run.type === 'symbol' ? symbols.get(futureManaFile(run.value) ?? '') : undefined
			if (image) context.drawImage(image, x, y, symbolSize, symbolSize)
			else if (run.type === 'symbol') drawManaSymbol(context, run.value, symbols, x, y + symbolSize / 2, symbolSize, style)
		})
		return
	}

	context.save()
	context.fillStyle = style.color
	context.font = style.font
	context.textAlign = 'left'
	context.textBaseline = 'middle'

	const widths = runs.map((run) =>
		run.type === 'symbol'
			? symbolSize
			: context.measureText(run.value).width
	)

	let x = right -
		widths.reduce((total, width) => total + width, 0) -
		Math.max(0, runs.length - 1) * gap

	runs.forEach((run, index) => {
		if (run.type === 'symbol') {
			drawManaSymbol(context, run.value, symbols, x, centerY, symbolSize, style)
		} else {
			context.fillText(run.value, x, centerY)
		}

		x += widths[index] + gap
	})

	context.restore()
}
