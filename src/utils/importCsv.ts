import { getQuantityError } from '../Cards.ts'

// Ported from Scry & Trade (mtg-haves/src/utils/importLigaMagicCsv.ts and importScannerCsv.ts).
// MTG Proxy only needs the printing and the language, so condition, finish and extras are dropped.

const scannerLanguages: Record<string, string> = {
	english: 'en', portuguese: 'pt', japanese: 'ja', german: 'de', spanish: 'es',
	french: 'fr', italian: 'it', korean: 'ko', russian: 'ru',
	'simplified chinese': 'zhs', 'traditional chinese': 'zht', phyrexian: 'ph'
}
const ligaMagicLanguages: Record<string, string> = { br: 'pt', jp: 'ja', tw: 'zht', cn: 'zhs', pten: 'pt' }
const knownLanguages = new Set(Object.values(scannerLanguages))
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseCsv(text: string): string[][] {
	const rows: string[][] = []
	let row: string[] = []
	let field = ''
	let quoted = false
	let closedQuote = false
	const input = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')

	for (let index = 0; index <= input.length; index += 1) {
		const char = input[index]
		if (quoted) {
			if (char === undefined) throw new Error('CSV with an unclosed quote')
			if (char === '"' && input[index + 1] === '"') {
				field += '"'
				index += 1
			} else if (char === '"') {
				quoted = false
				closedQuote = true
			} else field += char
		} else if (char === ',' || char === '\n' || char === undefined) {
			row.push(field)
			field = ''
			closedQuote = false
			if (char !== ',') {
				if (row.some((value) => value.trim())) rows.push(row)
				row = []
			}
		} else if (char === '"' && !field && !closedQuote) {
			quoted = true
		} else {
			if (closedQuote || char === '"') throw new Error('CSV with an invalid quote')
			field += char
		}
	}
	return rows
}

function language(value: string, names: Record<string, string>): string {
	const code = names[value] ?? value
	return knownLanguages.has(code) ? ` ${code}` : ''
}

function readRows(text: string) {
	const [headers, ...rows] = parseCsv(text)
	return {
		headers: headers ?? [],
		rows: rows.map((row, index) => {
			if (row.length !== headers.length) throw new Error(`CSV row ${index + 2}: wrong number of columns`)
			return (column: string) => row[headers.indexOf(column)]?.trim() ?? ''
		})
	}
}

function quantityOf(value: string, row: number): number {
	const quantity = Number(value)
	if (!value || getQuantityError(quantity)) throw new Error(`CSV row ${row}: invalid quantity`)
	return quantity
}

/** ManaBox or Delver Lens export, identified by Scryfall ID. Returns null for other CSVs. */
export function importScannerCsv(text: string): string | null {
	const { headers, rows } = readRows(text)
	const manaBox = ['Name', 'Set code', 'Collector number', 'Scryfall ID', 'Quantity'].every((column) => headers.includes(column))
	const delver = ['Name', 'Edition (CODE)', 'Scryfall ID', 'Quantity'].every((column) => headers.includes(column))
	if (!manaBox && !delver) return null

	return rows.map((get, index) => {
		const name = get('Name')
		const id = get('Scryfall ID').toLowerCase()
		if (!name) throw new Error(`CSV row ${index + 2}: missing card name`)
		if (!uuid.test(id)) throw new Error(`CSV row ${index + 2}: missing Scryfall ID`)
		const quantity = quantityOf(get('Quantity'), index + 2)
		return `${quantity} ${name}${language(get('Language').toLowerCase(), scannerLanguages)} [scryfall: ${id}]`
	}).join('\n')
}

// Families that LigaMagic splits or numbers differently from Scryfall. A wrong guess never accepts
// another card: the printing lookup checks the name and falls back to the name alone.
function scryfallPrinting(code: string, edition: string, number: string, name: string) {
	if (/^sldex\d+$/.test(code) && /secret lair prize/i.test(edition)) return { code: 'slp', number, name }
	if (/^sldsp\d+$/.test(code)) return { code: 'slc', number, name }
	if (/^sld(?:ex)?\d+$/.test(code)) return { code: 'sld', number, name }
	if (code === '4eb') return { code: '4bb', number, name }
	if (code === 'mb1') return { code: 'plst', number, name }
	if (code === 'salvat' && /^\d+$/.test(number)) return { code: 'psal', number: `A${number}`, name }
	const art = code.match(/^as([a-z0-9]{3,4})$/)
	if (art && /\(art series\)$/i.test(edition)) {
		const base = name.replace(/\s+\(Art Card[^)]*\)$/i, '').replace(/\s+#\d+$/, '')
		return { code: `a${art[1]}`, number: number.replace(/[a-z]$/i, ''), name: `${base} // ${base}` }
	}
	const token = number.match(/^T0*(\d+)$/i)
	if (token && /\(tokens\)$/i.test(edition)) return { code, number: token[1], name }
	return null
}

/** LigaMagic collection export. `setCodes` maps lower-case English set names to Scryfall codes. */
export function importLigaMagicCsv(text: string, setCodes: Map<string, string[]>): string {
	const { headers, rows } = readRows(text)
	const required = ['Edicao (EN)', 'Edicao (Sigla)', 'Card (EN)', 'Quantidade', 'Card #']
	if (required.some((header) => !headers.includes(header))) throw new Error('Unrecognised CSV')
	const languageColumn = headers.find((header) => header.startsWith('Idioma ('))
	const knownCodes = new Set([...setCodes.values()].flat())

	return rows.map((get, index) => {
		let name = get('Card (EN)')
		const lang = language(languageColumn ? get(languageColumn).toLowerCase() : '', ligaMagicLanguages)
		const edition = get('Edicao (EN)')
		const originalCode = get('Edicao (Sigla)').toLowerCase()
		let number = get('Card #')
		if (!name) throw new Error(`CSV row ${index + 2}: missing card name`)
		const quantity = quantityOf(get('Quantidade'), index + 2)
		if (!/^[a-z0-9]+$/.test(originalCode) || !number || /\s/.test(number)) return `${quantity} ${name}${lang}`

		const editionKey = edition.toLocaleLowerCase('en')
		const baseName = editionKey.replace(/\s+\([^()]+\)$/, '')
		const baseMatches = baseName === editionKey ? [] : (setCodes.get(baseName) ?? []).filter((code) => originalCode.endsWith(code))
		const candidates = setCodes.get(editionKey) ?? baseMatches
		let code = candidates.length === 1 ? candidates[0] : originalCode
		const family = scryfallPrinting(originalCode, edition, number, name)
		if (family) ({ code, number, name } = family)
		// An edition Scryfall does not know would fail the lookup: search by name instead.
		if (!knownCodes.has(code)) return `${quantity} ${name}${lang}`

		return `${quantity} ${name} (${code}) ${number}${lang}`
	}).join('\n')
}
