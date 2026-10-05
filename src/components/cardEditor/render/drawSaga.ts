import type { CardTextRun } from '../cardText'
import type { FrameLayout } from '../frameFamilies'
import type { SagaCardData } from '../types'
import { drawRulesText } from './drawRulesText'
import { romanNumeral } from './sagaNumbers'

export const SAGA_ASSETS = {
	chapter: 'img/frames/saga/sagaChapter.png',
	divider: 'img/frames/saga/sagaDivider.png',
}

export type SagaImages = {
	chapter: HTMLImageElement
	divider: HTMLImageElement
}

export function drawSaga(
	context: CanvasRenderingContext2D,
	card: SagaCardData,
	reminderRuns: CardTextRun[],
	chapterRuns: CardTextRun[][],
	creatureRulesRuns: CardTextRun[],
	manaSymbols: Map<string, HTMLImageElement>,
	images: SagaImages,
	layout: NonNullable<FrameLayout['saga']>,
) {
	const { reminder, abilities, creatureRules, chapter: chapterLayout, reversePt } = layout

	drawRulesText(context, reminderRuns, manaSymbols, reminder.x, reminder.y, reminder.width, reminder.height, {
		fontFamily: 'mplantin',
		italicFontFamily: 'mplantini',
		color: '#111',
		strokeColor: '#fff',
		strokeWidth: 0.75,
		maxFontSize: 62,
		minFontSize: 34,
	})
	if (creatureRules) {
		drawRulesText(context, creatureRulesRuns, manaSymbols, creatureRules.x, creatureRules.y, creatureRules.width, creatureRules.height, {
			fontFamily: 'mplantin',
			italicFontFamily: 'mplantini',
			color: '#111',
			strokeColor: '#fff',
			strokeWidth: 0.75,
			maxFontSize: 58,
			minFontSize: 30,
			horizontalAlign: 'center',
			verticalAlign: 'middle',
		})
	}

	const weights = card.chapters.map((chapter) => Math.max(20, chapter.text.length))
	const totalWeight = weights.reduce((total, weight) => total + weight, 0)
	let y = abilities.y
	let chapterNumber = 1
	let remainingChapters = 6

	card.chapters.forEach((chapter, index) => {
		const height = index === card.chapters.length - 1
			? abilities.y + abilities.height - y
			: abilities.height * weights[index] / totalWeight

		context.drawImage(images.divider, chapterLayout.dividerX, y + chapterLayout.dividerOffsetY, chapterLayout.dividerWidth, chapterLayout.dividerHeight)
		drawRulesText(context, chapterRuns[index], manaSymbols, abilities.x + chapterLayout.textInsetX, y + chapterLayout.textInsetY, abilities.width - chapterLayout.textInsetX * 2, height - chapterLayout.textInsetY * 2, {
			verticalAlign: 'middle',
			fontFamily: 'mplantin',
			italicFontFamily: 'mplantini',
			color: '#111',
			strokeColor: '#fff',
			strokeWidth: 0.75,
			maxFontSize: 64,
			minFontSize: 32,
		})

		const count = Math.min(remainingChapters, Math.max(1, chapter.chapterCount))
		const firstChapterY = y + height / 2 - chapterLayout.height / 2 - (count - 1) * chapterLayout.gap / 2
		for (let offset = 0; offset < count; offset += 1) {
			const chapterY = firstChapterY + offset * chapterLayout.gap
			context.drawImage(images.chapter, chapterLayout.x, chapterY, chapterLayout.width, chapterLayout.height)
			context.font = '52px mplantin, serif'
			context.fillStyle = '#111'
			context.textAlign = 'center'
			context.textBaseline = 'middle'
			context.fillText(romanNumeral(chapterNumber), chapterLayout.x + chapterLayout.width / 2, chapterY + chapterLayout.height / 2)
			chapterNumber += 1
		}
		remainingChapters -= count

		y += height
	})

	if (reversePt && card.reversePowerToughness) {
		context.font = reversePt.font
		context.fillStyle = reversePt.color
		context.textAlign = 'center'
		context.textBaseline = 'middle'
		context.fillText(card.reversePowerToughness, reversePt.textX, reversePt.textY, reversePt.width)
	}
}
