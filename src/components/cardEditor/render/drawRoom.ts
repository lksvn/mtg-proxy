import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { RoomCardData } from '../types'
import { drawManaCost } from './drawManaCost'
import { drawRulesText } from './drawRulesText'

export function drawRoom(
	context: CanvasRenderingContext2D,
	card: RoomCardData,
	manaRuns: CardTextRun[][],
	rulesRuns: CardTextRun[][],
	reminderRuns: CardTextRun[],
	manaSymbols: Map<string, HTMLImageElement>,
	layout: NonNullable<FrameLayout['room']>,
) {
	const sides = [
		{ ...layout.left, name: card.name },
		{ ...layout.right, name: card.otherName },
	]

	sides.forEach((side, index) => {
		context.save()
		context.translate(side.originX, side.originY)
		context.rotate(-Math.PI / 2)
		context.font = '80px belerenb, serif'
		context.fillStyle = '#111'
		context.textAlign = 'left'
		context.textBaseline = 'middle'
		context.fillText(side.name, 0, 50, layout.titleWidth)
		drawManaCost(context, manaRuns[index], manaSymbols, layout.titleWidth, 50, {
			symbolSize: 68,
			gap: 4,
			font: '48px belerenb, serif',
			color: '#111',
		})
		context.restore()

		context.save()
		context.translate(layout.rules.x, side.originY - 10)
		context.rotate(-Math.PI / 2)
		drawRulesText(context, rulesRuns[index], manaSymbols, 0, 0, layout.rules.width, layout.rules.height, {
			verticalAlign: 'middle',
			fontFamily: 'mplantin',
			italicFontFamily: 'mplantini',
			color: '#111',
			strokeColor: '#fff',
			strokeWidth: 0.75,
			maxFontSize: 70,
			minFontSize: 32,
		})
		context.restore()
	})

	context.save()
	context.translate(layout.type.x, layout.type.y)
	context.rotate(-Math.PI / 2)
	context.font = '58px belerenb, serif'
	context.fillStyle = '#fff'
	context.textAlign = 'left'
	context.textBaseline = 'middle'
	context.fillText(card.typeLine, 0, layout.type.textY, layout.type.width)
	context.restore()

	context.save()
	context.translate(layout.reminder.x, layout.reminder.y)
	context.rotate(-Math.PI / 2)
	drawRulesText(context, reminderRuns, manaSymbols, 0, 0, layout.reminder.width, layout.reminder.height, {
		verticalAlign: 'middle',
		horizontalAlign: 'center',
		fontFamily: 'mplantin',
		italicFontFamily: 'mplantini',
		color: '#fff',
		strokeColor: '#111',
		strokeWidth: 0.75,
		maxFontSize: 44,
		minFontSize: 28,
	})
	context.restore()
}
