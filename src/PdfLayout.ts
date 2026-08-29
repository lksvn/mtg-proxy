export const CARD_WIDTH = 63
export const CARD_HEIGHT = 88

const PAPER_SIZES = {
	a4: { width: 210, height: 297 },
	a3: { width: 297, height: 420 },
	letter: { width: 215.9, height: 279.4 },
	legal: { width: 215.9, height: 355.6 }
} as const

export type Paper = keyof typeof PAPER_SIZES

export type PageLayout = {
	pageWidth: number
	pageHeight: number
	columns: number
	rows: number
	cardsPerPage: number
	marginX: number
	marginY: number
}

export function calculatePageLayout( paper: Paper, gap: number): PageLayout {
	if (!Number.isFinite(gap) || gap < 0) {
		throw new Error('Gap must be a positive number')
	}

	const { width: pageWidth, height: pageHeight } = PAPER_SIZES[paper]

	const columns = Math.floor((pageWidth + gap) / (CARD_WIDTH + gap))
	const rows = Math.floor((pageHeight + gap) / (CARD_HEIGHT + gap))

	const usedWidth = columns * CARD_WIDTH + (columns - 1) * gap
	const usedHeight = rows * CARD_HEIGHT + (rows - 1) * gap

	return {
		pageWidth,
		pageHeight,
		columns,
		rows,
		cardsPerPage: columns * rows,
		marginX: (pageWidth - usedWidth) / 2,
		marginY: (pageHeight - usedHeight) / 2
	}
}