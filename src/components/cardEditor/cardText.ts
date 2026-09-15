import { DUAL_FRAME_VARIANTS, type FrameVariant } from './types.ts'

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
		const ability = line.match(/^(.+? (?:—|-))(.*)$/)
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

export function hasHybridManaSymbol(manaCost: string) {
	return parseManaCost(manaCost).some((run) =>
		run.type === 'symbol' && run.value.split('/').filter((part) => /^[WUBRG]$/.test(part)).length === 2,
	)
}

export function inferFrameVariant(manaCost: string, typeLine: string): FrameVariant {
	const type = typeLine.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
	if (/\b(Vehicle|Veiculo)\b/i.test(type)) return 'V'
	if (/\b(Land|Terreno)\b/i.test(type)) {
		const landFrames: Record<string, FrameVariant> = {
			plains: 'WL', planicie: 'WL',
			island: 'UL', ilha: 'UL',
			swamp: 'BL', pantano: 'BL',
			mountain: 'RL', montanha: 'RL',
			forest: 'GL', floresta: 'GL',
		}
		const basicTypes = new Set(
			type.match(/\b(Plains|Planicie|Island|Ilha|Swamp|Pantano|Mountain|Montanha|Forest|Floresta)\b/gi)
				?.map((type) => landFrames[type.toLowerCase()]),
		)
		if (basicTypes.size > 1) return 'ML'
		return basicTypes.size === 1 ? [...basicTypes][0] : 'L'
	}
	if (/\b(Artifact|Artefato)\b/i.test(type)) return 'A'

	const colors = new Set(
		parseManaCost(manaCost).flatMap((run) =>
			run.type === 'symbol'
				? run.value.split('/').filter((part) => /^[WUBRG]$/.test(part))
				: [],
		),
	)

	if (colors.size === 2) {
		return DUAL_FRAME_VARIANTS.find((pair) => colors.has(pair[0]) && colors.has(pair[1])) ?? 'M'
	}
	return colors.size === 0 ? 'C' : colors.size === 1
		? [...colors][0] as FrameVariant
		: 'M'
}
