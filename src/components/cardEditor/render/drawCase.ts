import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import { drawRulesText } from './drawRulesText'

export function drawCase(
	context: CanvasRenderingContext2D,
	sections: CardTextRun[][],
	manaSymbols: Map<string, HTMLImageElement>,
	layout: NonNullable<FrameLayout['case']>,
) {
	const labels = ['', 'To solve —', 'Solved —']
	const weights = sections.map((runs) => Math.max(100, runs.reduce((total, run) => total + ('value' in run ? run.value.length : 1), 0)))
	const totalWeight = weights.reduce((total, weight) => total + weight, 0)
	let y = layout.sections.y

	sections.forEach((runs, index) => {
		const sectionRuns: CardTextRun[] = index > 0
			? [{ type: 'text', value: `${labels[index]} `, italic: false }, ...runs]
			: runs
		const height = index === sections.length - 1
			? layout.sections.y + layout.sections.height - y
			: layout.sections.height * weights[index] / totalWeight

		if (index > 0) {
			context.fillStyle = '#111'
			context.fillRect(layout.sections.x, y, layout.sections.width, 5)
		}

		drawRulesText(context, sectionRuns, manaSymbols, layout.sections.x + 16, y + 16, layout.sections.width - 32, height - 28, {
			verticalAlign: 'middle',
			fontFamily: 'mplantin',
			italicFontFamily: 'mplantini',
			color: '#111',
			strokeColor: '#fff',
			strokeWidth: 0.75,
			maxFontSize: 64,
			minFontSize: 32,
		})
		y += height
	})
}
