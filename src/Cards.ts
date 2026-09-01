export type ParsedCard = {
    quantity: number
    name: string
    set?: string
    collectorNumber?: string
    sourceLine: string
    error?: string
}

export const EXAMPLE_CARD_LIST = `Shock
4 Lightning Bolt
1 Black Lotus (lea) 232
Blood Artist (sld)`
const ABOUT_HEADER = /^about:{0,2}$/i
const SECTION_HEADER = /^(commander|companion|deck|mainboard|maybeboard|sideboard):{0,2}$/i

export function parseCardList(input: string): ParsedCard[] {
	const cards: ParsedCard[] = []
	let expectingDeckName = false

	for (const rawLine of input.split(/\r?\n/)) {
		const line = cleanLine(rawLine)

		if (!line) {
			continue
		}

		if (ABOUT_HEADER.test(line)) {
			expectingDeckName = true
			continue
		}

		if ( expectingDeckName && /^name(?:\s|:)/i.test(line) ) {
			expectingDeckName = false
			continue
		}

		expectingDeckName = false

		if (!SECTION_HEADER.test(line)) {
			cards.push(parseCardLine(line))
		}
	}

	return cards
}

function cleanLine(line: string): string {
	return line
		.trim()
		.replace(/\s+\*(?:F|E)\*$/i, '')
		.replace(' / ', ' // ')
}

function parseCardLine(sourceLine: string): ParsedCard {
    const match = sourceLine.match(/^(?:(\d+)\s+)?(.+?)(?:\s+\(([a-zA-Z0-9]+)\)(?:\s+(\S+))?)?$/)

    if (!match) {
        return {
            quantity: 1,
            name: sourceLine,
            sourceLine,
            error: 'Invalid card line'
        }
    }

    // The leading comma is the same as "ignore the first element"
    const [, quantityText, name, set, collectorNumber] = match
    const quantity = Number(quantityText ?? 1)

    return {
        quantity,
        name,
        set: set?.toLowerCase(),
        collectorNumber,
        sourceLine,
        error: quantity < 1 ? 'Quantity must be at least 1' : undefined
    }
}

export function serializeCardList(cards: ParsedCard[]): string {
	if (cards.length === 0) {
		return ''
	}

	return (
		cards.map((card) => {
            if (card.error) {
                return card.sourceLine
            }

            const set = card.set ? ` (${card.set})` : ''
            const collectorNumber = card.collectorNumber ? ` ${card.collectorNumber}` : ''
            return `${card.quantity} ${card.name}${set}${collectorNumber}`
        }).join('\n') + '\n'
	)
}

export function addCardListToHistory(history: string[], cardList: string): string[] {
	const list = cardList.trim()

	if (!list) return history

	return [list, ...history.filter((item) => item !== list)].slice(0, 5)
}