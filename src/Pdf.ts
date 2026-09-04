import {
	PDFDocument,
    StandardFonts,
    degrees,
	type PDFImage,
	type PDFPage,
    type PDFFont,
	rgb
} from 'pdf-lib'
import {
	CARD_HEIGHT,
	CARD_WIDTH,
	calculatePageLayout,
	type PageLayout,
	type Paper
} from './PdfLayout'
import type { ScryfallCard } from './Scryfall'

const POINTS_PER_MILLIMETRE = 72 / 25.4

export type PrintableCard = {
	quantity: number
	card: ScryfallCard
}

export type PrintSettings = {
	paper: Paper
	gap: number
	cropMarks: boolean
	blackCorners: boolean
	bleed: boolean
	skipBasicLands: boolean
	deckList: boolean
	watermark: boolean
}

function mm(value: number): number {
	return value * POINTS_PER_MILLIMETRE
}

export async function createCardsPdf(cards: PrintableCard[], settings: PrintSettings): Promise<Blob> {
	const printableCards = settings.skipBasicLands ? cards.filter(
            ({ card }) => !card.type_line.startsWith('Basic Land')
        ) : cards

	const imageUrls = printableCards.flatMap(({ quantity, card }) => {
		const urls = cardImageUrls(card)

		return Array.from({ length: quantity }, () => urls).flat()
	})

    if (imageUrls.length === 0) {
		throw new Error('There are no card images to export')
	}

	const pdf = await PDFDocument.create()

    const regularFont = settings.deckList
	    ? await pdf.embedFont(StandardFonts.Helvetica)
	    : undefined
    const boldFont = settings.watermark || settings.deckList
        ? await pdf.embedFont(StandardFonts.HelveticaBold)
        : undefined

	const layout = calculatePageLayout(settings.paper, settings.gap)
	const images = await embedImages(pdf, imageUrls, settings.blackCorners, printableCards)

	let page: PDFPage | undefined

	for (let index = 0; index < imageUrls.length; index += 1) {
		const pageIndex = index % layout.cardsPerPage

		if (pageIndex === 0) {
			page = addPage(pdf, layout)
		}

		const { x, y } = cardPosition(
			pageIndex,
			layout,
			settings.gap
		)

		const image = images.get(imageUrls[index])

		if (!page || !image) {
			throw new Error('Could not prepare a card image')
		}

		page.drawImage(image, {
			x: mm(x),
			y: mm(y),
			width: mm(CARD_WIDTH),
			height: mm(CARD_HEIGHT)
		})

        const bleed = settings.bleed ? Math.min(1.5, settings.gap / 2) : 0

        if (bleed > 0) {
            page.drawImage(image, {
                x: mm(x - bleed),
                y: mm(y - bleed),
                width: mm(CARD_WIDTH + bleed * 2),
                height: mm(CARD_HEIGHT + bleed * 2)
            })
        }

		if (settings.watermark && boldFont) {
            page.drawText('PLAYTEST CARD', {
                x: mm(x + 8),
                y: mm(y + 31),
                size: 18,
                font: boldFont,
                color: rgb(1, 1, 1),
                opacity: 0.55,
                rotate: degrees(35)
            })
        }

        if (settings.cropMarks) {
            drawCropMarks(page, x, y)
        }
	}

    if (settings.deckList && regularFont && boldFont) {
        addDeckList(
            pdf,
            printableCards,
            layout,
            regularFont,
            boldFont
        )
    }
	return pdfBlob(pdf)
}

function cardImageUrls(card: ScryfallCard): string[] {
	if (card.image_uris) {
		return [card.image_uris.large ?? card.image_uris.png]
	}

	return (
		card.card_faces?.flatMap(
            (face) => face.image_uris ? [face.image_uris.large ?? face.image_uris.png] : []
        ) ?? []
	)
}

async function fetchImage(url: string): Promise<Response> {
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(15_000)
		})

		if (response.ok) return response
	} catch {
		// Retry once below.
	}

	return fetch(url, {
		signal: AbortSignal.timeout(15_000)
	})
}

async function embedImages(pdf: PDFDocument, urls: string[], blackCorners: boolean, cards: PrintableCard[]): Promise<Map<string, PDFImage>> {
	const uniqueUrls = [...new Set(urls)]

	const images = await Promise.all(
		uniqueUrls.map(async (url) => {
			const cardName = cards.find(({ card }) =>
				cardImageUrls(card).includes(url)
			)?.card.name ?? 'card'

			let response: Response

			try {
				response = await fetchImage(url)
			} catch {
				throw new Error(`Could not download image for ${cardName}`)
			}

			if (!response.ok) {
				throw new Error(
					`Could not download image for ${cardName}: ${response.status}`
				)
			}

			if (blackCorners) {
				const bytes = await addBlackCorners(await response.blob())
				const image = await pdf.embedJpg(bytes)

				return [url, image] as const
			}

			const bytes = await response.arrayBuffer()
			const contentType = response.headers.get('content-type')
			const image = contentType?.includes('png') || url.includes('.png')
				? await pdf.embedPng(bytes)
				: await pdf.embedJpg(bytes)

			return [url, image] as const
		})
	)

	return new Map(images)
}

function addPage( pdf: PDFDocument, layout: PageLayout ): PDFPage {
	return pdf.addPage([ mm(layout.pageWidth), mm(layout.pageHeight) ])
}

function cardPosition(index: number, layout: PageLayout, gap: number): { x: number; y: number } {
	const column = index % layout.columns
	const row = Math.floor(index / layout.columns)

	return {
		x: layout.marginX + column * (CARD_WIDTH + gap),
		y: layout.pageHeight - layout.marginY - CARD_HEIGHT - row * (CARD_HEIGHT + gap)
	}
}

async function pdfBlob(pdf: PDFDocument): Promise<Blob> {
	const bytes = await pdf.save()

	return new Blob([Uint8Array.from(bytes)], {
		type: 'application/pdf'
	})
}

function addDeckList(
	pdf: PDFDocument,
	cards: PrintableCard[],
	layout: PageLayout,
	font: PDFFont,
	boldFont: PDFFont
) {
	const quantities = new Map<string, number>()

	for (const { quantity, card } of cards) {
		quantities.set(card.name, (quantities.get(card.name) ?? 0) + quantity)
	}

	const lines = [...quantities.entries()]
		.sort(([first], [second]) => first.localeCompare(second))
		.map(([name, quantity]) => `${quantity} × ${name}`)

	const margin = 15
	const titleHeight = 12
	const lineHeight = 5
	const columns = 2
	const columnGap = 8
	const columnWidth = (layout.pageWidth - margin * 2 - columnGap * (columns - 1)) / columns
	const rows = Math.floor((layout.pageHeight - margin * 2 - titleHeight) / lineHeight)
	const linesPerPage = rows * columns

	for (let pageStart = 0; pageStart < lines.length; pageStart += linesPerPage ) {
		const page = addPage(pdf, layout)
		const pageLines = lines.slice(pageStart, pageStart + linesPerPage)

		page.drawText(pageStart === 0 ? 'Deck list' : 'Deck list — continued',
			{
				x: mm(margin),
				y: mm(layout.pageHeight - margin),
				size: 14,
				font: boldFont,
			}
		)

		pageLines.forEach((line, index) => {
			const column = Math.floor(index / rows)
			const row = index % rows
			const x = margin + column * (columnWidth + columnGap)
            const y = layout.pageHeight - margin - titleHeight - row * lineHeight

			let fontSize = 9

			while (fontSize > 6 && font.widthOfTextAtSize(line, fontSize) > mm(columnWidth)) {
				fontSize -= 0.5
			}

			page.drawText(line, {
				x: mm(x),
				y: mm(y),
				size: fontSize,
				font
			})
		})
	}
}

function drawCropMarks(page: PDFPage, x: number, y: number) {
	const length = 3

	const lines = [
		[x, y, x + length, y],
		[x, y, x, y + length],

		[x + CARD_WIDTH, y, x + CARD_WIDTH - length, y],
		[x + CARD_WIDTH, y, x + CARD_WIDTH, y + length],

		[x, y + CARD_HEIGHT, x + length, y + CARD_HEIGHT],
		[x, y + CARD_HEIGHT, x, y + CARD_HEIGHT - length],

		[
			x + CARD_WIDTH,
			y + CARD_HEIGHT,
			x + CARD_WIDTH - length,
			y + CARD_HEIGHT,
		],
		[
			x + CARD_WIDTH,
			y + CARD_HEIGHT,
			x + CARD_WIDTH,
			y + CARD_HEIGHT - length,
		]
	]

	for (const [startX, startY, endX, endY] of lines) {
		const start = { x: mm(startX), y: mm(startY) }
		const end = { x: mm(endX), y: mm(endY) }

		// White backing keeps the mark visible on black card borders.
		page.drawLine({
			start,
			end,
			color: rgb(1, 1, 1),
			thickness: 1.4
		})
		page.drawLine({
			start,
			end,
			color: rgb(0, 0, 0),
			thickness: 0.5
		})
	}
}

async function addBlackCorners(source: Blob): Promise<ArrayBuffer> {
	const bitmap = await createImageBitmap(source)
	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	canvas.width = bitmap.width
	canvas.height = bitmap.height

	if (!context) {
		bitmap.close()
		throw new Error('Canvas is not supported by this browser')
	}

	const radius = canvas.width * 0.048

	context.fillStyle = 'black'
	context.fillRect(0, 0, canvas.width, canvas.height)

	context.save()
	context.beginPath()
	context.roundRect(0, 0, canvas.width, canvas.height, radius)
	context.clip()
	context.drawImage(bitmap, 0, 0)
	context.restore()

	bitmap.close()

	const result = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
            (blob) => blob
                ? resolve(blob)
                : reject(new Error('Could not process card image')),
			'image/jpeg',
			0.95
		)
	})

	return result.arrayBuffer()
}