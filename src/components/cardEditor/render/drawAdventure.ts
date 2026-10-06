import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { AdventureCardData } from '../types'
import { drawManaCost } from './drawManaCost'
import { drawRulesText } from './drawRulesText'

export function drawAdventure(
	context: CanvasRenderingContext2D,
	card: AdventureCardData,
	manaRuns: CardTextRun[],
	rulesRuns: CardTextRun[],
	manaSymbols: Map<string, HTMLImageElement>,
	layout: NonNullable<FrameLayout['adventure']>,
) {
	context.font = layout.title.font
	context.fillStyle = layout.title.color
	context.textAlign = 'left'
	context.textBaseline = 'middle'
	context.fillText(card.adventureName, layout.title.x, layout.title.y, layout.title.maxWidth)

	drawManaCost(context, manaRuns, manaSymbols, layout.mana.right, layout.mana.centerY, layout.mana)

	context.font = layout.type.font
	context.fillStyle = layout.type.color
	context.fillText(card.adventureTypeLine, layout.type.x, layout.type.y, layout.type.maxWidth)

	drawRulesText(
		context,
		rulesRuns,
		manaSymbols,
		layout.rules.x,
		layout.rules.y,
		layout.rules.width,
		layout.rules.height,
		layout.rules,
	)
}
