export type ParsedCard = {
    quantity: number
    name: string
    set?: string
    collectorNumber?: string
    // Scryfall language code, e.g. "pt". Absent means "any".
    language?: string
    scryfallId?: string
    sourceLine: string
    error?: string
}

export type CardListSaveMode = 'complete' | 'without-basic-lands' | 'clean'

export const EXAMPLE_CARD_LIST = `Shock
4 Lightning Bolt
1 Black Lotus (lea) 232
Blood Artist (sld)`

export function getQuantityError(quantity: number): string | undefined {
	if (quantity < 1) return 'Quantity must be at least 1'
	if (!Number.isSafeInteger(quantity)) return 'Quantity must be a safe whole number'
	return undefined
}
const ABOUT_HEADER = /^about:{0,2}$/i
const SECTION_HEADER = /^(commander|companion|deck|mainboard|maybeboard|sideboard|stickers?):{0,2}$/i

export function isBasicLand(card: { type_line: string }): boolean {
	return /^Basic(?: Snow)? Land\b/.test(card.type_line)
}

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
			cards.push(parseExportedLine(rawLine.trim()))
		}
	}

	return cards
}

function cleanLine(line: string): string {
	return line
		.trim()
		.replace(/(?:\s+(?:\*(?:F|E)\*|\[[^\]]+\]|\^[^^]+\^|#[^\s#]+))+$/i, '')
		.replace(' / ', ' // ')
}

// Attribute tokens written by Scry & Trade exports: "4 Bolt (m10) 146 foil pt nm".
const LANGUAGES = new Set(['en', 'pt', 'ja', 'de', 'es', 'fr', 'it', 'ko', 'ru', 'zhs', 'zht', 'ph'])
const OTHER_ATTRIBUTES = /^(?:-|m|nm|sp|mp|hp|dm|altered|signed|misprint|miscut|nonfoil|foil|etched|glossy|textured|oilslick|doublerainbow|gilded|stepandcompleat|[a-z0-9]*foil(?:,[a-z0-9]+)*)$/

function languageToken(token: string): string | undefined {
	if (token === 'jp') return 'ja'
	if (token === 'pt-en') return 'pt'
	return LANGUAGES.has(token) ? token : undefined
}

function parseExportedLine(rawLine: string): ParsedCard {
	const want = rawLine.match(/\s+\[want: (\{.*\})\]$/)
	if (want) return parseWantLine(rawLine.slice(0, want.index), want[1])

	const scryfallId = rawLine.match(/\s+\[scryfall: ([0-9a-f-]{36})\][^[]*$/i)?.[1]?.toLowerCase()
	const words = cleanLine(rawLine).split(/\s+/)
	const printed = words.findLastIndex((word) => /^\([a-z0-9]+\)$/i.test(word))
	// With a printing, attributes follow the collector number; without one, only recognised trailing words.
	const firstAttribute = printed >= 0 ? Math.min(printed + 2, words.length) : 1
	let language: string | undefined
	while (words.length > firstAttribute) {
		const token = words.at(-1)!.toLowerCase()
		const tokenLanguage = languageToken(token)
		if (!tokenLanguage && !OTHER_ATTRIBUTES.test(token)) break
		if (printed < 0 && /^[+-]?[\d.]+[xX]?$/.test(words.slice(0, -1).join(' '))) break
		language ??= tokenLanguage
		words.pop()
	}

	const card = parseCardLine(words.join(' '))
	if (language) card.language = language
	if (scryfallId) card.scryfallId = scryfallId
	return card
}

function parseWantLine(line: string, json: string): ParsedCard {
	const card = parseExportedLine(line)
	try {
		const item = JSON.parse(json) as {
			language?: string | null
			acceptedLanguages?: string[]
			printing?: { setCode?: string; collectorNumber?: string } | null
		}
		const languages = item.acceptedLanguages ?? []
		const language = item.language ?? (languages.includes('pt') ? 'pt' : languages.length === 1 ? languages[0] : undefined)
		if (language && LANGUAGES.has(language)) card.language = language
		if (item.printing?.setCode && item.printing.collectorNumber) {
			card.set = item.printing.setCode.toLowerCase()
			card.collectorNumber = item.printing.collectorNumber
		}
	} catch {
		// Keep the card name; the preferences block is optional.
	}
	return card
}

function parseCardLine(sourceLine: string): ParsedCard {
    const match = sourceLine.match(/^(?:([+-]?(?:\d+(?:\.\d*)?|\.\d+))[xX]?\s+)?(.+?)(?:\s+\(([a-zA-Z0-9]+)\)(?:\s+(\S+))?)?$/)

    if (!match) {
        return {
            quantity: 1,
            name: sourceLine,
            sourceLine,
            error: 'Invalid card line'
        }
    }

    // The leading comma is the same as "ignore the first element"
    const quantityText = match[1]
    let [, , name, set, collectorNumber] = match
    if (!set) {
        // Without parentheses, require a collector number so the last word of the name stays.
        const printing = name.match(/^(.+?)\s+([a-z0-9]{3,6})\s+(\d\S*)$/i)
        if (printing) [, name, set, collectorNumber] = printing
    }
    const quantity = Number(quantityText ?? 1)

    return {
        quantity,
        name,
        set: set?.toLowerCase(),
        collectorNumber,
        sourceLine,
        error: getQuantityError(quantity)
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
            const language = card.language ? ` ${card.language}` : ''
            return `${card.quantity} ${card.name}${set}${collectorNumber}${language}`
        }).join('\n') + '\n'
	)
}

export function addCardListToHistory(history: string[], cardList: string): string[] {
	const list = cardList.trim()

	if (!list) return history

	return [list, ...history.filter((item) => item !== list)].slice(0, 5)
}

export function removeCardListFromHistory(history: string[], cardList: string): string[] {
	return history.filter((item) => item !== cardList)
}
