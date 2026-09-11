import type { CardTextRun } from './cardText'
import { drawManaSymbol } from './drawGenericMana'

export function drawManaCost(
	context: CanvasRenderingContext2D,
	runs: CardTextRun[],
	symbols: ReadonlyMap<string, HTMLImageElement>,
	right: number,
	centerY: number
) {
	const symbolSize = 64
	const gap = 4

	context.save()
	context.fillStyle = '#111'
	context.font = '48px belerenb, serif'
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
			drawManaSymbol(context, run.value, symbols, x, centerY, symbolSize, true)
		} else {
			context.fillText(run.value, x, centerY)
		}

		x += widths[index] + gap
	})

	context.restore()
}
