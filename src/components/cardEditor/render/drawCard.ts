import type { ArtworkTransform } from '../CardCanvas'
import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import { resolveFooterX, resolvePtTextColor, resolveTextColor, resolveTextX } from '../frameFamilies'
import type { CustomCardData, FrameVariant } from '../types'
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
const COLOR_INDICATOR_COLORS: Record<string, string> = {
	W: '#fcfeff',
	U: '#0075be',
	B: '#272624',
	R: '#ef3827',
	G: '#007b43',
}

type CardImages = {
	frame: CanvasImageSource
	overlay?: {
		image: CanvasImageSource
		x: number
		y: number
		width: number
		height: number
	}
	frameOverlay?: {
		image: CanvasImageSource
		crops: { x: number; y: number; width: number; height: number }[]
	}
	border?: CanvasImageSource
	colorIndicatorBase?: CanvasImageSource
	colorIndicatorColors?: string[]
	ptBackground?: HTMLImageElement
	art?: HTMLImageElement
	symbol?: HTMLImageElement
	typeIcon?: HTMLImageElement
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
	{ frame, overlay, frameOverlay, border, colorIndicatorBase, colorIndicatorColors, ptBackground, art, symbol, typeIcon, manaSymbols }: CardImages,
	{ manaRuns, rulesRuns, flavorRuns }: CardRuns,
	layout: FrameLayout,
	variant: FrameVariant,
	drawBeforeFrame?: () => void,
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

	drawBeforeFrame?.()
	context.drawImage(frame, 0, 0, WIDTH, HEIGHT)
	frameOverlay?.crops.forEach(({ x, y, width, height }) => {
		context.drawImage(frameOverlay.image, x, y, width, height, x, y, width, height)
	})
	if (overlay) context.drawImage(overlay.image, overlay.x, overlay.y, overlay.width, overlay.height)
	if (border) context.drawImage(border, 0, 0, WIDTH, HEIGHT)
	if (colorIndicatorBase && colorIndicatorColors?.length) {
		context.drawImage(colorIndicatorBase, 115, 1207, 70, 70)
		const slice = Math.PI * 2 / colorIndicatorColors.length

		colorIndicatorColors.forEach((color, index) => {
			context.beginPath()
			context.moveTo(155, 1242)
			context.arc(155, 1242, 22, -Math.PI / 2 + slice * index, -Math.PI / 2 + slice * (index + 1))
			context.closePath()
			context.fillStyle = COLOR_INDICATOR_COLORS[color]
			context.fill()
		})
	}
	if (typeIcon) {
		const icon = document.createElement('canvas')
		icon.width = WIDTH
		icon.height = HEIGHT
		const iconContext = icon.getContext('2d')
		if (iconContext) {
			iconContext.drawImage(typeIcon, 0, 0, WIDTH, HEIGHT)
			iconContext.globalCompositeOperation = 'source-in'
			iconContext.fillStyle = '#fff'
			iconContext.fillRect(0, 0, WIDTH, HEIGHT)
			context.drawImage(icon, 0, 0)
		}
	}

	if (symbol && layout.symbol.boxSize > 0) {
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
	if (layout.title.maxWidth > 0) {
		applyTextStyle(context, layout.title, variant)
		context.textAlign = layout.title.align ?? 'left'
		context.fillText(card.name, resolveTextX(layout.title), layout.title.y, layout.title.maxWidth)
	}
	context.textAlign = 'right'
	drawManaCost(context, manaRuns, manaSymbols, layout.mana.right, layout.mana.centerY, layout.mana)
	if (layout.type.maxWidth > 0) {
		applyTextStyle(context, layout.type, variant)
		context.textAlign = 'left'
		context.fillText(card.typeLine.replace(/\s+-\s+/, ' — '), layout.type.x, layout.type.y, layout.type.maxWidth)
	}
	const textRuns: CardTextRun[] = rulesRuns.length && flavorRuns.length
		? [...rulesRuns, { type: 'text', value: '\n\n', italic: false }, ...flavorRuns]
		: [...rulesRuns, ...flavorRuns]
	if (layout.flavorRules) {
		const rulesStyle = card.centerRulesText ? { ...layout.rules, horizontalAlign: 'center' as const, verticalAlign: 'middle' as const } : layout.rules
		const flavorStyle = card.centerRulesText ? { ...layout.flavorRules, horizontalAlign: 'center' as const, verticalAlign: 'middle' as const } : layout.flavorRules
		drawRulesText(context, rulesRuns, manaSymbols, layout.rules.x, layout.rules.y, layout.rules.width, layout.rules.height, rulesStyle)
		drawRulesText(context, flavorRuns, manaSymbols, layout.flavorRules.x, layout.flavorRules.y, layout.flavorRules.width, layout.flavorRules.height, flavorStyle)
	} else {
		drawRulesText(context, textRuns, manaSymbols, layout.rules.x, layout.rules.y, layout.rules.width, layout.rules.height, card.centerRulesText
			? { ...layout.rules, horizontalAlign: 'center', verticalAlign: 'middle' }
			: layout.rules)
	}

	if (card.powerToughness && layout.pt.width > 0) {
		if (ptBackground) context.drawImage(
			ptBackground,
			layout.pt.x,
			layout.pt.y,
			layout.pt.width,
			layout.pt.height,
		)
		applyTextStyle(context, layout.pt)
		context.fillStyle = resolvePtTextColor(variant, resolveTextColor(layout.pt, variant))
		context.textAlign = 'center'
		context.fillText(
			card.powerToughness,
			layout.pt.textX,
			layout.pt.textY,
			layout.pt.width,
		)
	}

	const footerX = resolveFooterX(layout, Boolean(card.powerToughness) && layout.pt.width > 0)
	applyTextStyle(context, layout.footer.metadata)
	context.fillStyle = layout.footer.colorByVariant?.[variant] ?? layout.footer.metadata.color
	context.textAlign = layout.footer.align ?? 'left'
	context.fillText(
		`${RARITY_CODES[card.rarity]}${card.number ? ' • ' + card.number : ''}${card.artist ? ' • ' + card.artist : ''}`,
		footerX,
		layout.footer.metadataY,
		layout.footer.maxWidth,
	)
	applyTextStyle(context, layout.footer.disclaimer)
	context.fillStyle = layout.footer.disclaimerColorByVariant?.[variant] ?? layout.footer.colorByVariant?.[variant] ?? layout.footer.disclaimer.color
	context.textAlign = layout.footer.disclaimerAlign ?? layout.footer.align ?? 'left'
	context.fillText('NOT FOR SALE • Made on MTG Proxy', layout.footer.disclaimerX ?? footerX, layout.footer.disclaimerY, layout.footer.maxWidth)
}

function applyTextStyle(
	context: CanvasRenderingContext2D,
	style: { font: string; color: string; colorByVariant?: Partial<Record<FrameVariant, string>>; shadowColor?: string; shadowOffsetX?: number; shadowOffsetY?: number },
	variant?: FrameVariant,
) {
	context.font = style.font
	context.fillStyle = variant ? resolveTextColor(style, variant) : style.color
	context.shadowColor = style.shadowColor ?? 'transparent'
	context.shadowOffsetX = style.shadowOffsetX ?? 0
	context.shadowOffsetY = style.shadowOffsetY ?? 0
}
