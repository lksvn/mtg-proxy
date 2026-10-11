import type { ArtworkTransform } from '../CardCanvas'
import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { SplitCardData } from '../types'
import { artworkFilter } from './artworkFilter'
import { drawSetSymbol } from './drawCard'
import { drawManaCost } from './drawManaCost'
import { drawRulesText } from './drawRulesText'

export function drawSplit(
	context: CanvasRenderingContext2D,
	card: SplitCardData,
	frames: CanvasImageSource[],
	artworks: (HTMLImageElement | undefined)[],
	transforms: ArtworkTransform[],
	manaRuns: CardTextRun[][],
	rulesRuns: CardTextRun[][],
	manaSymbols: Map<string, HTMLImageElement>,
	symbol: HTMLImageElement | undefined,
	layout: FrameLayout,
) {
	const split = layout.split!
	const halves = [
		{ originY: split.firstOriginY, artwork: layout.artwork, name: card.name, typeLine: card.typeLine, cropY: 1050 },
		{ originY: split.secondOriginY, artwork: split.secondArtwork, name: card.secondName, typeLine: card.secondTypeLine, cropY: 0 },
	]
	context.fillStyle = card.backgroundColor
	context.fillRect(0, 0, 1500, 2100)
	for (const [index, half] of halves.entries()) {
		const art = artworks[index]
		const transform = transforms[index]
		const bounds = half.artwork
		context.save()
		context.beginPath()
		context.rect(bounds.dragLeft, bounds.dragTop, bounds.dragRight - bounds.dragLeft, bounds.dragBottom - bounds.dragTop)
		context.clip()
		if (art) {
			const scale = Math.max((bounds.dragBottom - bounds.dragTop) / art.width, (bounds.dragRight - bounds.dragLeft) / art.height) * (1 + transform.scale)
			context.translate((bounds.dragLeft + bounds.dragRight) / 2 + transform.x, (bounds.dragTop + bounds.dragBottom) / 2 + transform.y)
			context.rotate(-Math.PI / 2 + transform.rotation * Math.PI / 180)
			context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)
			context.filter = artworkFilter(transform)
			context.drawImage(art, -art.width * scale / 2, -art.height * scale / 2, art.width * scale, art.height * scale)
		}
		context.restore()
		context.drawImage(frames[index], 0, half.cropY, 1500, 1050, 0, half.cropY, 1500, 1050)
		context.save()
		context.translate(0, half.originY)
		context.rotate(-Math.PI / 2)
		context.textBaseline = 'middle'
		context.textAlign = 'left'
		context.fillStyle = layout.title.color
		context.font = layout.mana.font
		const manaWidth = manaRuns[index].reduce((width, run) => {
			const runWidth = run.type === 'symbol' ? layout.mana.symbolSize : context.measureText(run.value).width
			return width + runWidth
		}, 0) + Math.max(0, manaRuns[index].length - 1) * layout.mana.gap
		context.font = layout.title.font
		context.fillText(half.name, layout.title.x, layout.title.y, Math.max(1, layout.title.maxWidth - manaWidth - 15))
		drawManaCost(context, manaRuns[index], manaSymbols, layout.mana.right, layout.mana.centerY, layout.mana)
		context.font = layout.type.font
		context.fillStyle = layout.type.color
		context.fillText(half.typeLine.replace(/\s+-\s+/, ' — '), layout.type.x, layout.type.y, layout.type.maxWidth)
		if (symbol) drawSetSymbol(context, card, symbol, layout)
		drawRulesText(context, rulesRuns[index], manaSymbols, layout.rules.x, layout.rules.y, layout.rules.width, layout.rules.height, card.centerRulesText
			? { ...layout.rules, horizontalAlign: 'center', verticalAlign: 'middle' }
			: layout.rules)
		context.restore()
	}
}
