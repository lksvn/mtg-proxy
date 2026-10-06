import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { LevelerCardData } from '../types'
import { drawRulesText } from './drawRulesText'

export function drawLeveler(
	context: CanvasRenderingContext2D,
	card: LevelerCardData,
	runs: CardTextRun[][],
	manaSymbols: Map<string, HTMLImageElement>,
	layout: NonNullable<FrameLayout['leveler']>,
) {
	drawRulesText(context, runs[0], manaSymbols, layout.levelUp.x, layout.levelUp.y, layout.levelUp.width, layout.levelUp.height, layout.levelUp)
	drawTier(context, card.levelTwo, card.levelTwoPowerToughness, runs[1], manaSymbols, layout.levelTwo)
	drawTier(context, card.levelThree, card.levelThreePowerToughness, runs[2], manaSymbols, layout.levelThree)
}

function drawTier(
	context: CanvasRenderingContext2D,
	label: string,
	powerToughness: string,
	runs: CardTextRun[],
	manaSymbols: Map<string, HTMLImageElement>,
	layout: NonNullable<FrameLayout['leveler']>['levelTwo'],
) {
	context.textBaseline = 'middle'
	context.textAlign = layout.label.align ?? 'left'
	context.fillStyle = layout.label.color
	drawFittedText(
		context,
		'LEVEL',
		layout.label.fixedFont,
		layout.label.x,
		layout.label.y + layout.label.fixedOffsetY,
		layout.label.maxWidth,
	)
	drawFittedText(
		context,
		label,
		layout.label.font,
		layout.label.x,
		layout.label.y + layout.label.rangeOffsetY,
		layout.label.maxWidth,
	)

	drawRulesText(context, runs, manaSymbols, layout.rules.x, layout.rules.y, layout.rules.width, layout.rules.height, layout.rules)

	context.textAlign = layout.powerToughness.align ?? 'left'
	context.font = layout.powerToughness.font
	context.fillStyle = layout.powerToughness.color
	context.fillText(powerToughness, layout.powerToughness.x, layout.powerToughness.y, layout.powerToughness.maxWidth)
}

function drawFittedText(
	context: CanvasRenderingContext2D,
	text: string,
	font: string,
	x: number,
	y: number,
	maxWidth: number,
) {
	context.font = font
	const measuredWidth = context.measureText(text).width

	if (measuredWidth > maxWidth) {
		const fontSize = Number.parseFloat(font)
		const fittedSize = Math.max(16, Math.floor(fontSize * maxWidth / measuredWidth))
		context.font = font.replace(/^\d+(?:\.\d+)?px/, `${fittedSize}px`)
	}

	context.fillText(text, x, y)
}
