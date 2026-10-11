import type { ArtworkTransform } from '../CardCanvas'
import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { SplitCardData } from '../types'
import { artworkFilter } from './artworkFilter'
import { drawSetSymbol } from './drawCard'
import { drawManaCost } from './drawManaCost'
import { drawRulesText } from './drawRulesText'
import { HEIGHT, WIDTH } from '../canvasDimensions'

export function drawSplit(
	context: CanvasRenderingContext2D,
	card: SplitCardData,
	frames: CanvasImageSource[],
	artworks: (HTMLImageElement | undefined)[],
	transforms: ArtworkTransform[],
	manaRuns: CardTextRun[][],
	rulesRuns: CardTextRun[][],
	reminderRuns: CardTextRun[],
	manaSymbols: Map<string, HTMLImageElement>,
	symbol: HTMLImageElement | undefined,
	layout: FrameLayout,
) {
	const split = layout.split!
	const aftermath = Boolean(split.secondLayout)
	const halves = [
		{
			originX: 0, originY: split.firstOriginY,
			rotation: aftermath ? 0 : -Math.PI / 2,
			artwork: layout.artwork, name: card.name, typeLine: card.typeLine, layout,
			cropY: aftermath ? 0 : split.frameSplitY,
			cropHeight: aftermath ? split.frameSplitY : HEIGHT - split.frameSplitY,
		},
		{
			originX: split.secondLayout?.originX ?? 0, originY: split.secondOriginY,
			rotation: aftermath ? Math.PI / 2 : -Math.PI / 2,
			artwork: split.secondArtwork, name: card.secondName, typeLine: card.secondTypeLine,
			layout: split.secondLayout ?? layout,
			cropY: aftermath ? split.frameSplitY : 0,
			cropHeight: aftermath ? HEIGHT - split.frameSplitY : split.frameSplitY,
		},
	]
	context.fillStyle = card.backgroundColor
	context.fillRect(0, 0, 1500, 2100)
	for (const [index, half] of halves.entries()) {
		const art = artworks[index]
		const transform = transforms[index]
		const bounds = half.artwork
		const style = half.layout
		context.save()
		context.beginPath()
		context.rect(bounds.dragLeft, bounds.dragTop, bounds.dragRight - bounds.dragLeft, bounds.dragBottom - bounds.dragTop)
		context.clip()
		if (art) {
			const artWidth = half.rotation === 0 ? art.width : art.height
			const artHeight = half.rotation === 0 ? art.height : art.width
			const scale = Math.max((bounds.dragRight - bounds.dragLeft) / artWidth, (bounds.dragBottom - bounds.dragTop) / artHeight) * (1 + transform.scale)
			context.translate((bounds.dragLeft + bounds.dragRight) / 2 + transform.x, (bounds.dragTop + bounds.dragBottom) / 2 + transform.y)
			context.rotate(half.rotation + transform.rotation * Math.PI / 180)
			context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)
			context.filter = artworkFilter(transform)
			context.drawImage(art, -art.width * scale / 2, -art.height * scale / 2, art.width * scale, art.height * scale)
		}
		context.restore()
		context.drawImage(frames[index], 0, half.cropY, WIDTH, half.cropHeight, 0, half.cropY, WIDTH, half.cropHeight)
		context.save()
		context.translate(half.originX, half.originY)
		context.rotate(half.rotation)
		context.textBaseline = 'middle'
		context.textAlign = 'left'
		context.fillStyle = style.title.color
		context.font = style.mana.font
		const manaWidth = manaRuns[index].reduce((width, run) => {
			const runWidth = run.type === 'symbol' ? style.mana.symbolSize : context.measureText(run.value).width
			return width + runWidth
		}, 0) + Math.max(0, manaRuns[index].length - 1) * style.mana.gap
		context.font = style.title.font
		context.fillText(half.name, style.title.x, style.title.y, Math.max(1, style.title.maxWidth - manaWidth - 15))
		drawManaCost(context, manaRuns[index], manaSymbols, style.mana.right, style.mana.centerY, style.mana)
		context.font = style.type.font
		context.fillStyle = style.type.color
		context.fillText(half.typeLine.replace(/\s+-\s+/, ' — '), style.type.x, style.type.y, style.type.maxWidth)
		if (symbol) drawSetSymbol(context, card, symbol, style)
		drawRulesText(context, rulesRuns[index], manaSymbols, style.rules.x, style.rules.y, style.rules.width, style.rules.height, card.centerRulesText
			? { ...style.rules, horizontalAlign: 'center', verticalAlign: 'middle' }
			: style.rules)
		context.restore()
	}
	if (split.reminder) {
		context.save()
		context.translate(0, split.firstOriginY)
		context.rotate(-Math.PI / 2)
		const reminder = split.reminder
		drawRulesText(context, reminderRuns, manaSymbols, reminder.x, reminder.y, reminder.width, reminder.height, reminder)
		context.restore()
	}
}
