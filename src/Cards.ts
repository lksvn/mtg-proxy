export type ParsedCard = {
    quantity: number
    name: string
    set?: string
    collectorNumber?: string
    sourceLine: string
    error?: string
}

export function parseCardList(input: string): ParsedCard[] {
    return input
        .split(/\r?\n/)
        .map((sourceLine) => sourceLine.trim())
        .filter(Boolean)
        .map(parseCardLine)
}

function parseCardLine(sourceLine: string): ParsedCard {
    const match = sourceLine.match(
        /^(?:(\d+)\s+)?(.+?)(?:\s+\(([a-zA-Z0-9]+)\)(?:\s+(\S+))?)?$/,
    )

    if (!match) {
        return {
            quantity: 1,
            name: sourceLine,
            sourceLine,
            error: 'Invalid card line',
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
        error: quantity < 1 ? 'Quantity must be at least 1' : undefined,
    }
}

export function serializeCardList(cards: ParsedCard[]): string {
	if (cards.length === 0) {
		return ''
	}

	return (
		cards
			.map((card) => {
				if (card.error) {
					return card.sourceLine
				}

				const set = card.set ? ` (${card.set})` : ''
				const collectorNumber = card.collectorNumber
					? ` ${card.collectorNumber}`
					: ''

				return `${card.quantity} ${card.name}${set}${collectorNumber}`
			})
			.join('\n') + '\n'
	)
}