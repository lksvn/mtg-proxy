import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { ClassCardData } from '../types'
import { drawRulesText } from './drawRulesText'

export const CLASS_HEADER = 'img/frames/class/header.png'

export function drawClass(
	context: CanvasRenderingContext2D,
	card: ClassCardData,
	levelRuns: CardTextRun[][],
	costRuns: CardTextRun[][],
	manaSymbols: Map<string, HTMLImageElement>,
	header: HTMLImageElement,
	layout: NonNullable<FrameLayout['class']>,
) {
	const weights = card.levels.map((level) => Math.max(80, level.text.length))
	const totalWeight = weights.reduce((total, weight) => total + weight, 0)
	const headerSpace = layout.header.height * Math.max(0, card.levels.length - 1)
	const textHeight = layout.levels.height - headerSpace
	let y = layout.levels.y

	card.levels.forEach((level, index) => {
		if (index > 0) {
			context.drawImage(header, layout.header.x, y, layout.header.width, layout.header.height)
			drawRulesText(context, costRuns[index], manaSymbols, layout.levels.x + 12, y + 10, layout.levels.width / 2, layout.header.height - 20, {
				verticalAlign: 'middle',
				fontFamily: 'belerenb',
				italicFontFamily: 'belerenb',
				color: '#111',
				strokeColor: '#fff',
				strokeWidth: 0,
				maxFontSize: 54,
				minFontSize: 32,
			})
			context.font = '58px belerenb, serif'
			context.fillStyle = '#111'
			context.textBaseline = 'middle'
			context.textAlign = 'right'
			context.fillText(level.name, layout.levels.x + layout.levels.width - 12, y + layout.header.height / 2, layout.levels.width / 2)
			y += layout.header.height
		}

		const height = index === card.levels.length - 1
			? layout.levels.y + layout.levels.height - y
			: textHeight * weights[index] / totalWeight
		drawRulesText(context, levelRuns[index], manaSymbols, layout.levels.x + 16, y + 12, layout.levels.width - 32, height - 24, {
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
