import type { ArtworkTransform } from './CardCanvas'
import type { CardTextRun } from './cardText'
import type { CustomCardData } from './types'
import { drawManaCost } from './drawManaCost'
import { drawRulesText } from './drawRulesText'

export const WIDTH = 1500
export const HEIGHT = 2100
export const PT_OFFSET = { x: 0, y: 45 }
export const PT_BOUNDS = {
	x: 1136,
	y: 1858,
	width: 282,
	height: 154,
	textX: 1295,
	textY: 1930,
}

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

	context.drawImage(frame, 0, 0)

	if (symbol) {
		const boxSize = 85
		const centerX = 1335
		const centerY = 1248
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
	context.fillStyle = '#111'
	context.font = '70px belerenb, serif'
	context.textAlign = 'left'
	context.fillText(card.name, 115, 160, 1000)
	context.textAlign = 'right'
	drawManaCost(context, manaRuns, manaSymbols, 1390, 160)
	context.fillStyle = '#fff'
	context.font = '54px belerenb, serif'
	context.textAlign = 'left'
	context.fillText(card.typeLine.replace(/\s+-\s+/, ' — '), 115, 1245, 1120)
	const textRuns: CardTextRun[] = rulesRuns.length && flavorRuns.length
		? [...rulesRuns, { type: 'text', value: '\n\n', italic: false }, ...flavorRuns]
		: [...rulesRuns, ...flavorRuns]
	drawRulesText(context, textRuns, manaSymbols, 125, 1345, 1240, 555)

	if (card.powerToughness) {
		context.drawImage(
			ptBackground,
			PT_OFFSET.x + PT_BOUNDS.x,
			PT_OFFSET.y + PT_BOUNDS.y,
			PT_BOUNDS.width,
			PT_BOUNDS.height,
		)
		context.fillStyle = '#111'
		context.font = '70px belerenbsc, serif'
		context.textAlign = 'center'
		context.fillText(
			card.powerToughness,
			PT_OFFSET.x + PT_BOUNDS.textX,
			PT_OFFSET.y + PT_BOUNDS.textY,
			PT_BOUNDS.width,
		)
	}

	context.fillStyle = '#fff'
	context.font = '38px mplantin, serif'
	context.textAlign = 'left'
	context.fillText(
		`${RARITY_CODES[card.rarity]}${card.number ? ' • ' + card.number : ''}${card.artist ? ' • ' + card.artist : ''}`,
		115,
		1985,
		1050,
	)
	context.font = '34px mplantin, serif'
	context.fillText('NOT FOR SALE • Made on MTG Proxy', 115, 2025, 1050)
}
