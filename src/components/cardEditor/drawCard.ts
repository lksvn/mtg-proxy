import type { ArtworkTransform } from './CardCanvas'
import type { CardTextRun } from './cardText'
import type { FrameLayout } from './frameFamilies'
import { resolvePtTextColor } from './frameFamilies'
import type { CustomCardData, FrameVariant } from './types'
import { drawManaCost } from './drawManaCost'
import { drawRulesText } from './drawRulesText'

export const WIDTH = 1500
export const HEIGHT = 2100

const RARITY_COLORS: Record<CustomCardData['rarity'], string> = {
	common: '#ffffff',
	uncommon: '#c0c0c0',
	rare: '#d4af37',
	mythic: '#e05a2a',
}
const RARITY_CODES: Record<CustomCardData['rarity'], string> = {
	common: 'C',
	uncommon: 'U',
	rare: 'R',
	mythic: 'M',
}

type CardImages = {
	frame: CanvasImageSource
	ptBackground: HTMLImageElement
	art?: HTMLImageElement
	symbol?: HTMLImageElement
	manaSymbols: Map<string, HTMLImageElement>
}

type CardRuns = {
	manaRuns: CardTextRun[]
	rulesRuns: CardTextRun[]
	flavorRuns: CardTextRun[]
}

export function drawCard(
	context: CanvasRenderingContext2D,
	card: CustomCardData,
	transform: ArtworkTransform,
	{ frame, ptBackground, art, symbol, manaSymbols }: CardImages,
	{ manaRuns, rulesRuns, flavorRuns }: CardRuns,
	layout: FrameLayout,
	variant: FrameVariant,
) {
	context.fillStyle = card.backgroundColor
	context.fillRect(0, 0, WIDTH, HEIGHT)

	if (art) {
		const scale = Math.max(WIDTH / art.width, HEIGHT / art.height) * (1 + transform.scale)
		const width = art.width * scale
		const height = art.height * scale

		context.save()
		context.translate(WIDTH / 2 + transform.x, HEIGHT / 2 + transform.y)
		context.rotate(transform.rotation * Math.PI / 180)
		context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)
		context.drawImage(art, -width / 2, -height / 2, width, height)
		context.restore()
	}

	context.drawImage(frame, 0, 0, WIDTH, HEIGHT)

	if (symbol) {
		const { boxSize, centerX, centerY } = layout.symbol
		const scale = Math.min(boxSize / symbol.width, boxSize / symbol.height)
		const width = symbol.width * scale
		const height = symbol.height * scale

		if (card.tintSetSymbol) {
			const tinted = document.createElement('canvas')
			const tintedContext = tinted.getContext('2d')

			tinted.width = boxSize
			tinted.height = boxSize

			if (tintedContext) {
				tintedContext.drawImage(symbol, (boxSize - width) / 2, (boxSize - height) / 2, width, height)
				tintedContext.globalCompositeOperation = 'source-in'
				tintedContext.fillStyle = RARITY_COLORS[card.rarity]
				tintedContext.fillRect(0, 0, boxSize, boxSize)
				context.drawImage(tinted, centerX - boxSize / 2, centerY - boxSize / 2)
			}
		} else {
			context.drawImage(symbol, centerX - width / 2, centerY - height / 2, width, height)
		}
	}

	context.fontKerning = 'normal'
	context.textRendering = 'optimizeLegibility'
	context.textBaseline = 'middle'
	applyTextStyle(context, layout.title)
	context.textAlign = 'left'
	context.fillText(card.name, layout.title.x, layout.title.y, layout.title.maxWidth)
	context.textAlign = 'right'
	drawManaCost(context, manaRuns, manaSymbols, layout.mana.right, layout.mana.centerY, layout.mana)
	applyTextStyle(context, layout.type)
	context.textAlign = 'left'
	context.fillText(card.typeLine.replace(/\s+-\s+/, ' — '), layout.type.x, layout.type.y, layout.type.maxWidth)
	const textRuns: CardTextRun[] = rulesRuns.length && flavorRuns.length
		? [...rulesRuns, { type: 'text', value: '\n\n', italic: false }, ...flavorRuns]
		: [...rulesRuns, ...flavorRuns]
	drawRulesText(context, textRuns, manaSymbols, layout.rules.x, layout.rules.y, layout.rules.width, layout.rules.height, layout.rules)

	if (card.powerToughness) {
		context.drawImage(
			ptBackground,
			layout.pt.x,
			layout.pt.y,
			layout.pt.width,
			layout.pt.height,
		)
		applyTextStyle(context, layout.pt)
		context.fillStyle = resolvePtTextColor(variant, layout.pt.color)
		context.textAlign = 'center'
		context.fillText(
			card.powerToughness,
			layout.pt.textX,
			layout.pt.textY,
			layout.pt.width,
		)
	}

	applyTextStyle(context, layout.footer.metadata)
	context.textAlign = 'left'
	context.fillText(
		`${RARITY_CODES[card.rarity]}${card.number ? ' • ' + card.number : ''}${card.artist ? ' • ' + card.artist : ''}`,
		layout.footer.x,
		layout.footer.metadataY,
		layout.footer.maxWidth,
	)
	applyTextStyle(context, layout.footer.disclaimer)
	context.fillText('NOT FOR SALE • Made on MTG Proxy', layout.footer.x, layout.footer.disclaimerY, layout.footer.maxWidth)
}

function applyTextStyle(
	context: CanvasRenderingContext2D,
	style: { font: string; color: string; shadowColor?: string; shadowOffsetX?: number; shadowOffsetY?: number },
) {
	context.font = style.font
	context.fillStyle = style.color
	context.shadowColor = style.shadowColor ?? 'transparent'
	context.shadowOffsetX = style.shadowOffsetX ?? 0
	context.shadowOffsetY = style.shadowOffsetY ?? 0
}
