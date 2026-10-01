import type { CardTextRun } from '../cardText'
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

const CHAPTER_X = 58
const CHAPTER_WIDTH = 118
const CHAPTER_HEIGHT = 132

export function drawSaga(
	context: CanvasRenderingContext2D,
	card: SagaCardData,
	reminderRuns: CardTextRun[],
	chapterRuns: CardTextRun[][],
	creatureRulesRuns: CardTextRun[],
	manaSymbols: Map<string, HTMLImageElement>,
	images: SagaImages,
	creature: boolean,
) {
	const reminder = creature
		? { x: 130, y: 250, width: 1260, height: 174 }
		: { x: 130, y: 265, width: 606, height: 372 }
	const abilities = creature
		? { x: 200, y: 451, width: 525, height: 1138 }
		: { x: 200, y: 608, width: 525, height: 1148 }

	drawRulesText(context, reminderRuns, manaSymbols, reminder.x, reminder.y, reminder.width, reminder.height, {
		fontFamily: 'mplantin',
		italicFontFamily: 'mplantini',
		color: '#111',
		strokeColor: '#fff',
		strokeWidth: 0.75,
		maxFontSize: 62,
		minFontSize: 34,
	})
	if (creature) {
		drawRulesText(context, creatureRulesRuns, manaSymbols, 119, 1741, 1263, 192, {
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

		context.drawImage(images.divider, 150, y - 3, 592, 6)
		drawRulesText(context, chapterRuns[index], manaSymbols, abilities.x, y + 16, abilities.width, height - 32, {
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
		const gap = 150
		const firstChapterY = y + height / 2 - CHAPTER_HEIGHT / 2 - (count - 1) * gap / 2
		for (let offset = 0; offset < count; offset += 1) {
			const chapterY = firstChapterY + offset * gap
			context.drawImage(images.chapter, CHAPTER_X, chapterY, CHAPTER_WIDTH, CHAPTER_HEIGHT)
			context.font = '52px mplantin, serif'
			context.fillStyle = '#111'
			context.textAlign = 'center'
			context.textBaseline = 'middle'
			context.fillText(romanNumeral(chapterNumber), CHAPTER_X + CHAPTER_WIDTH / 2, chapterY + CHAPTER_HEIGHT / 2)
			chapterNumber += 1
		}
		remainingChapters -= count

		y += height
	})
}
