import type { CardTextRun } from '../cardText.ts'
import type { PlaneswalkerCardData } from '../types.ts'
import { drawRulesText, measureRulesTextHeight } from './drawRulesText.ts'

const WIDTH = 1500
const HEIGHT = 2100

export const PLANESWALKER_ASSETS = {
	mask: 'img/frames/planeswalker/text.svg',
	plus: 'img/frames/planeswalker/planeswalkerPlus.png',
	neutral: 'img/frames/planeswalker/planeswalkerNeutral.png',
	minus: 'img/frames/planeswalker/planeswalkerMinus.png',
	lightToDark: 'img/frames/planeswalker/abilityLineOdd.png',
	darkToLight: 'img/frames/planeswalker/abilityLineEven.png',
} as const

const ABILITY_CENTERS = [
	[0.7467],
	[0.6953, 0.822],
	[0.6639, 0.7467, 0.8362],
	[0.6505, 0.72, 0.7905, 0.861],
] as const

export type PlaneswalkerIcons = Record<keyof typeof PLANESWALKER_ASSETS, HTMLImageElement>

export function getPlaneswalkerRows(count: number, desiredHeights?: number[]) {
	const top = 1310
	const bottom = 1870

	if (desiredHeights) {
		const availableHeight = bottom - top
		const minimumHeight = desiredHeights.length >= 3 ? 140 : 90
		const heights = desiredHeights.map((height) => Math.max(minimumHeight, height))
		const scale = availableHeight / heights.reduce((total, height) => total + height, 0)
		const fittedHeights = heights.map((height) => height * scale)
		let y = top

		return fittedHeights.map((height) => {
			const row = { y, height, center: y + height / 2 }
			y += height
			return row
		})
	}

	const centers = ABILITY_CENTERS[count - 1].map((center) => center * HEIGHT)
	const boundaries = [top, ...centers.slice(0, -1).map((center, index) => (center + centers[index + 1]) / 2), bottom]
	return centers.map((center, index) => ({ y: boundaries[index], height: boundaries[index + 1] - boundaries[index], center }))
}

function getPlaneswalkerLayout(
	context: CanvasRenderingContext2D,
	card: PlaneswalkerCardData,
	abilityRuns: CardTextRun[][],
) {
	const textStyle = {
		verticalAlign: 'middle' as const,
		fontFamily: 'mplantin',
		italicFontFamily: 'mplantini',
		color: '#111',
		strokeColor: '#111',
		strokeWidth: 0.75,
		maxFontSize: 62,
		minFontSize: 30,
	}
	const textHeights = abilityRuns.map((runs, index) => {
		const width = card.abilities[index].cost ? 1120 : 1200
		return measureRulesTextHeight(context, runs, width, textStyle.maxFontSize, textStyle)
	})
	const desiredHeights = textHeights.map((height) => height + 30)
	const rows = getPlaneswalkerRows(card.abilities.length, desiredHeights)

	return { rows, textHeights, textStyle }
}

export function drawPlaneswalkerBackground(
	context: CanvasRenderingContext2D,
	card: PlaneswalkerCardData,
	abilityRuns: CardTextRun[][],
	icons: PlaneswalkerIcons,
) {
	const { rows } = getPlaneswalkerLayout(context, card, abilityRuns)
	const background = document.createElement('canvas')
	background.width = WIDTH
	background.height = HEIGHT
	const backgroundContext = background.getContext('2d')

	if (backgroundContext) {
		rows.forEach((row, index) => {
			const isLastRow = index === rows.length - 1
			const backgroundHeight = isLastRow ? row.height + HEIGHT / 2 : row.height

			backgroundContext.fillStyle = index % 2 === 0 ? 'rgba(255,255,255,.61)' : 'rgba(164,164,164,.71)'
			backgroundContext.fillRect(175, row.y, 1215, backgroundHeight)
			if (!isLastRow) {
				const transition = index % 2 === 0 ? icons.lightToDark : icons.darkToLight
				backgroundContext.drawImage(transition, 175, row.y + row.height - 10, 1215, 20)
			}
		})
		backgroundContext.globalCompositeOperation = 'destination-in'
		backgroundContext.drawImage(icons.mask, 0, 0, WIDTH, HEIGHT)
		context.drawImage(background, 0, 0)
	}
}

export function drawPlaneswalker(
	context: CanvasRenderingContext2D,
	card: PlaneswalkerCardData,
	abilityRuns: CardTextRun[][],
	manaSymbols: Map<string, HTMLImageElement>,
	icons: PlaneswalkerIcons,
) {
	const { rows, textHeights, textStyle } = getPlaneswalkerLayout(context, card, abilityRuns)

	rows.forEach((row, index) => {
		const ability = card.abilities[index]
		if (ability.cost) {
			const textAreaHeight = row.height - 30
			const centeredTextOffset = Math.max(0, (textAreaHeight - textHeights[index]) / 2)
			const firstLineCenter = row.y + 15 + centeredTextOffset + Math.round(textStyle.maxFontSize * 1.1) / 2
			const costCenter = rows.length === 1
				? firstLineCenter
				: row.center
			const iconType = ability.cost.includes('+') ? 'plus' : ability.cost.includes('-') ? 'minus' : 'neutral'
			const icon = icons[iconType]
			const width = 210
			const placement = iconType === 'plus'
				? { x: 40, y: -54, height: 152, textY: 15 }
				: iconType === 'minus'
					? { x: 42, y: -50, height: 148, textY: 0 }
					: { x: 42, y: -50, height: 128, textY: 0 }
			context.drawImage(icon, placement.x, costCenter + placement.y, width, placement.height)
			context.save()
			context.font = '60px belerenbsc, serif'
			context.fillStyle = '#fff'
			context.textAlign = 'center'
			context.textBaseline = 'middle'
			context.fillText(ability.cost, 154, costCenter + placement.textY, 150)
			context.restore()
		}

		drawRulesText(
			context,
			abilityRuns[index],
			manaSymbols,
			ability.cost ? 270 : 210,
			row.y + 15,
			ability.cost ? 1100 : 1180,
			row.height - 30,
			textStyle,
		)
	})
}
