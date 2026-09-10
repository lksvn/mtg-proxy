export type CardTextRun =
	| {
			type: 'text'
			value: string
			italic: boolean
	  }
	| {
			type: 'symbol'
			value: string
	  }

const SUPPORTED_SYMBOLS = new Set([
	...Array.from({ length: 21 }, (_, value) => String(value)),
	'W', 'U', 'B', 'R', 'G', 'C',
	'X', 'Y', 'Z',
	'S', 'T', 'Q', 'E',
	'W/U', 'U/B', 'B/R', 'R/G', 'G/W',
	'W/B', 'U/R', 'B/G', 'R/W', 'G/U',
	'W/P', 'U/P', 'B/P', 'R/P', 'G/P',
	'2/W', '2/U', '2/B', '2/R', '2/G',
])

export function getRunSymbolFile(value: string) {
	if (value.endsWith('.svg')) return value
	return getSymbolFile(value)
}

export function getSymbolFile(token: string) {
	const normalized = token.toUpperCase()

	if (!SUPPORTED_SYMBOLS.has(normalized)) return undefined

	if (normalized === 'Q') return 'untap.svg'

	return `${normalized.replace('/', '').toLowerCase()}.svg`
}

export function parseCardText(text: string): CardTextRun[] {
	const runs: CardTextRun[] = []
	let buffer = ''
	let italicDepth = 0

	function flush() {
		if (!buffer) return

		runs.push({
			type: 'text',
			value: buffer,
			italic: italicDepth > 0,
		})

		buffer = ''
	}

	for (let index = 0; index < text.length; index++) {
		const character = text[index]

		if (character === '{') {
			const closingBrace = text.indexOf('}', index + 1)

			if (closingBrace !== -1) {
				const token = text.slice(index + 1, closingBrace)
				.trim()
				.toUpperCase()

				if (getSymbolFile(token) || /^\d+$/.test(token)) {
					flush()
					runs.push({ type: 'symbol', value: token })
					index = closingBrace
					continue
				}
			}
		}

        if (character === '[') {
            const closingBracket = text.indexOf(']', index + 1)

            if (closingBracket !== -1) {
                const token = text.slice(index + 1, closingBracket)
                const file = getLoyaltySymbolFile(token)

                if (file) {
                    flush()
                    runs.push({
                        type: 'symbol',
                        value: file,
                    })
                    index = closingBracket
                    continue
                }
            }
        }

		if (character === '(') {
			flush()
			italicDepth++
			buffer = character
			continue
		}

		if (character === ')' && italicDepth > 0) {
			buffer += character
			flush()
			italicDepth--
			continue
		}

		buffer += character
	}

	flush()
	return runs
}

export function parseRulesText(text: string): CardTextRun[] {
	const lines = text.split('\n')

	return lines.flatMap((line, index) => {
		const ability = line.match(/^(.+? —)(.*)$/)
		const runs: CardTextRun[] = ability
			? [
                {
                    type: 'text',
                    value: ability[1],
                    italic: true,
                },
                ...parseCardText(ability[2])
			  ]
			: parseCardText(line)

		if (index < lines.length - 1) {
			runs.push({
				type: 'text',
				value: '\n',
				italic: false,
			})
		}

		return runs
	})
}

export function getLoyaltySymbolFile(token: string) {
	const normalized = token.replace('−', '-').trim()

	if (normalized === '0') return '+0.svg'
	if (/^[+-]\d$/.test(normalized)) return `${normalized}.svg`

	return undefined
}

export function parseManaCost(text: string): CardTextRun[] {
	const source = text
        .replace(/\{([^{}]+)\}/g, ' $1 ')
        .trim()
        .toUpperCase()
    const segments = source.split(/\s+/).filter(Boolean)

    const tokens = segments.flatMap(
        (segment) =>
            segment.match(
                /2\/[WUBRG]|[WUBRG]\/[WUBRGP]|\d+|[WUBRGCXYZSTEQ]/g,
            ) ?? [],
    )

    if (tokens.join('') !== segments.join('')) {
        return [{
            type: 'text',
            value: text,
            italic: false,
        }]
    }

	return tokens.map((value): CardTextRun =>
        /^\d+$/.test(value) || getSymbolFile(value)
            ? { type: 'symbol', value }
            : { type: 'text', value, italic: false },
    )
}