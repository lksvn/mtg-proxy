import type { ParsedCard } from './Cards'

export type ScryfallCard = {
	id: string
	name: string
    flavor_name?: string
	set: string
	set_name: string
	set_type?: string
	collector_number: string
	released_at: string
	lang: string
	type_line: string
	image_uris?: {
        small: string
        normal: string
        grid?: string
        crop?: string
        large: string
        png: string
	}
	card_faces?: Array<{
		name: string
		image_uris?: {
            small: string
            normal: string
            grid?: string
            crop?: string
            large: string
            png: string
		}
	}>,
	prints_search_uri: string,
	artist: string,
	scryfall_uri: string
    layout: string
	promo?: boolean
	full_art?: boolean
	border_color?: string
	frame_effects?: string[]
}

export type CardLookup = {
	card?: ScryfallCard
	error?: string
	// The requested language has no printing on Scryfall; the card stays in another language.
	languageMissing?: boolean
}

type Identifier = { name: string } | { set: string; collector_number: string } | { id: string }

const cache = new Map<string, ScryfallCard>()
const printingsCache = new Map<string, Promise<ScryfallCard[]>>()
const translatedNamesCache = new Map<string, Promise<string>>()
const languageCache = new Map<string, Promise<CardLookup>>()
let setCodesByName: Promise<Map<string, string[]>> | undefined

let requestQueue = Promise.resolve()

export async function findCards(cards: ParsedCard[]): Promise<CardLookup[]> {
    const cardsByKey = new Map<string, ParsedCard>()
	const results = new Map<string, CardLookup>()
	const identifiers = new Map<string, Identifier>()
	const individualCards: Array<{
            parsedCard: ParsedCard
            identifiedCard?: ScryfallCard
            skipNamedLookup?: boolean
        }> = []

	for (const card of cards) {
		const key = cardKey(card)
		const cached = cache.get(key)

        cardsByKey.set(key, card)

		if (cached) {
			results.set(key, { card: cached })
		} else if (card.set && !card.collectorNumber && !card.scryfallId) {
			individualCards.push({ parsedCard: card })
		} else {
			identifiers.set(key, identifierFor(card))
		}
	}

	const identifierEntries = [...identifiers.entries()]

	for (let index = 0; index < identifierEntries.length; index += 75) {
		const chunk = identifierEntries.slice(index, index + 75)
		let response: { data: ScryfallCard[] }

		try {
			response = await fetchCollection(chunk.map(([, value]) => value))
		} catch (error) {
			if (!(error instanceof TypeError)) throw error

			for (const [key] of chunk) {
				const parsedCard = cardsByKey.get(key)
				if (parsedCard) individualCards.push({ parsedCard })
			}

			continue
		}

		for (const [key, identifier] of chunk) {
			const parsedCard = cardsByKey.get(key)

			const identifiedCard = ('id' in identifier
				? response.data.find((candidate) => candidate.id === identifier.id)
				: undefined) ?? ('name' in identifier
				? response.data.find((candidate) => candidate.name.toLowerCase() === identifier.name.toLowerCase())
				: undefined) ?? response.data.find((candidate) => matchesIdentifier(candidate, identifier))

            const card = identifiedCard && (!parsedCard || matchesCardName(identifiedCard, parsedCard.name)) ? identifiedCard : undefined

            if (card) {
                cache.set(key, card)
                results.set(key, { card })
            } else if (parsedCard) {
				const repeatedFace = response.data.some((candidate) =>
					candidate.name.toLowerCase() === `${parsedCard.name.toLowerCase()} // ${parsedCard.name.toLowerCase()}`
				)
				individualCards.push({ parsedCard, identifiedCard, skipNamedLookup: !repeatedFace })
            } else {
                results.set(key, { error: 'Card not found' })
            }
		}
	}

	await Promise.all(
        individualCards.map(async ({ parsedCard, identifiedCard, skipNamedLookup }) => {
            const key = cardKey(parsedCard)

            try {
                const card = await findCardInAnyLanguage(parsedCard, identifiedCard, skipNamedLookup)

                cache.set(key, card)
                results.set(key, { card })
            } catch (error) {
                results.set(key, {
                    error: error instanceof Error ? error.message : 'Unknown card lookup error'
                })
            }
        })
    )

	await Promise.all(cards.map(async (parsedCard) => {
		if (parsedCard.set || parsedCard.scryfallId) return
		const key = cardKey(parsedCard)
		const result = results.get(key)
		if (!result?.card || !isSpecialPrinting(result.card)) return

		const preferred = await findRegularPrinting(result.card).catch(() => undefined)
		if (preferred) {
			cache.set(key, preferred)
			results.set(key, { card: preferred })
		}
	}))

	return Promise.all(cards.map(async (card) => {
		const result = results.get(cardKey(card)) ?? { error: 'Card not found' }
		if (!result.card || !card.language) return result
		return findCardLanguage(result.card, card.language, Boolean(card.set || card.scryfallId))
	}))
}

// Same printing in another language; without a fixed printing, the newest printing in that language.
export function findCardLanguage(card: ScryfallCard, language: string, keepPrinting: boolean): Promise<CardLookup> {
	if (card.lang === language || card.set === 'custom') return Promise.resolve({ card })

	const key = `${card.id}:${language}:${keepPrinting}`
	const cached = languageCache.get(key)
	if (cached) return cached

	const request = loadCardLanguage(card, language, keepPrinting)
	languageCache.set(key, request)
	request.catch(() => languageCache.delete(key))
	return request
}

async function loadCardLanguage(card: ScryfallCard, language: string, keepPrinting: boolean): Promise<CardLookup> {
	const samePrinting = await enqueueRequest(async (signal) => {
		const url = `https://api.scryfall.com/cards/${encodeURIComponent(card.set)}/${encodeURIComponent(card.collector_number)}/${encodeURIComponent(language)}`
		const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
		if (response.status === 404) return undefined
		if (!response.ok) throw await responseError(response)
		return await response.json() as ScryfallCard
	}, 125)
	if (samePrinting) return { card: samePrinting }
	if (keepPrinting || !card.prints_search_uri) return { card, languageMissing: true }

	const url = new URL(card.prints_search_uri)
	url.searchParams.set('q', `${url.searchParams.get('q')} game:paper lang:${language}`)
	url.searchParams.set('order', 'released')
	url.searchParams.set('dir', 'desc')
	url.searchParams.set('unique', 'prints')

	const printings = await enqueueRequest(async (signal) => {
		const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
		if (response.status === 404) return []
		if (!response.ok) throw await responseError(response)
		return (await response.json() as { data: ScryfallCard[] }).data
	}, 125)
	const printing = printings.find((candidate) => !isSpecialPrinting(candidate)) ?? printings[0]
	return printing ? { card: printing } : { card, languageMissing: true }
}

function isSpecialPrinting(card: ScryfallCard): boolean {
	return card.promo === true || card.full_art === true ||
		card.set === 'sld' || card.set_type === 'promo' ||
		card.border_color === 'borderless' ||
		(card.frame_effects?.some((effect) => ['showcase', 'extendedart'].includes(effect)) ?? false)
}

async function findRegularPrinting(card: ScryfallCard): Promise<ScryfallCard | undefined> {
	if (!card.prints_search_uri) return undefined

	const url = new URL(card.prints_search_uri)
	url.searchParams.set('q', `${url.searchParams.get('q')} game:paper lang:en -is:promo -is:fullart -is:borderless -is:showcase -is:extendedart -set:sld`)
	url.searchParams.set('order', 'released')
	url.searchParams.set('dir', 'desc')
	url.searchParams.set('unique', 'prints')

	return enqueueRequest(async (signal) => {
		const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
		if (!response.ok) throw await responseError(response)
		const result = await response.json() as { data: ScryfallCard[] }
		return result.data.find((printing) =>
			!isSpecialPrinting(printing) && matchesCardName(printing, card.name)
		)
	}, 125)
}

async function findCardInAnyLanguage(
	card: ParsedCard,
	identifiedCard?: ScryfallCard,
	skipNamedLookup = false
): Promise<ScryfallCard> {
	if (!identifiedCard && !skipNamedLookup) {
		try {
			return await findCard(card)
		} catch {
			// Try the exact name in other languages.
		}
	}

	const canonicalName = await findCanonicalName(card.name)
	const foundCard = identifiedCard ?? await findCard({
		...card,
		name: canonicalName
	})

	if (!matchesCardName(foundCard, canonicalName)) {
		throw new Error(
			`${card.set?.toUpperCase()} ${card.collectorNumber} is ` +
			`${foundCard.name}, not ${card.name}`
		)
	}

	return foundCard
}

function findCanonicalName(name: string): Promise<string> {
	const key = name.toLowerCase()
	const cached = translatedNamesCache.get(key)

	if (cached) return cached

	const request = loadCanonicalName(name)
	translatedNamesCache.set(key, request)

	request.catch(() => translatedNamesCache.delete(key))

	return request
}

async function loadCanonicalName(name: string): Promise<string> {
	const escapedName = name
		.replaceAll('\\', '\\\\')
		.replaceAll('"', '\\"')

	const url = new URL('https://api.scryfall.com/cards/search')
	url.searchParams.set('q', `!"${escapedName}" -layout:art_series`)
	url.searchParams.set('include_multilingual', 'true')
	url.searchParams.set('include_extras', 'true')
	url.searchParams.set('unique', 'cards')

	return enqueueRequest(async (signal) => {
		const response = await fetch(url, {
			signal,
			headers: { Accept: 'application/json' }
		})

		if (!response.ok) throw await responseError(response)

		const result = await response.json() as {
			data: Array<{ name: string }>
		}

		const names = [...new Set(result.data.map((card) => card.name))]

		if (names.length !== 1) {
			throw new Error(`Ambiguous card name: ${name}`)
		}

		return names[0]
	}, 125)
}

export function findCard(card: ParsedCard): Promise<ScryfallCard> {
	const key = cardKey(card)
	const cached = cache.get(key)

	if (cached) {
		return Promise.resolve(cached)
	}

	const url = card.scryfallId
		? `https://api.scryfall.com/cards/${encodeURIComponent(card.scryfallId)}`
		: card.set && card.collectorNumber
        ? `https://api.scryfall.com/cards/${encodeURIComponent(card.set)}/${encodeURIComponent(card.collectorNumber)}`
        : namedCardUrl(card)

	return enqueueRequest(async (signal) => {
		const response = await fetch(url, {
			signal,
			headers: { Accept: 'application/json' }
		})

		if (!response.ok) {
			throw await responseError(response)
		}

		const foundCard = (await response.json()) as ScryfallCard
		cache.set(key, foundCard)

		return foundCard
	}, 125)
}

function fetchCollection(identifiers: Identifier[]): Promise<{ data: ScryfallCard[] }> {
	return enqueueRequest(async (signal) => {
		const response = await fetch('https://api.scryfall.com/cards/collection',
			{
				signal,
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ identifiers })
			}
		)

		if (!response.ok) {
			throw await responseError(response)
		}

		return (await response.json()) as { data: ScryfallCard[] }
	}, 500)
}

function identifierFor(card: ParsedCard): Identifier {
	if (card.scryfallId) return { id: card.scryfallId }

	if (card.set && card.collectorNumber) {
		return {
			set: card.set,
			collector_number: card.collectorNumber
		}
	}

	return { name: card.name }
}

function matchesIdentifier(card: ScryfallCard, identifier: Identifier): boolean {
	if ('name' in identifier) {
        return matchesCardName(card, identifier.name)
    }

	if ('id' in identifier) return card.id === identifier.id

	return (
		card.set.toLowerCase() === identifier.set.toLowerCase() &&
		card.collector_number.toLowerCase() === identifier.collector_number.toLowerCase()
	)
}

function cardKey(card: ParsedCard): string {
	if (card.scryfallId) return `id:${card.scryfallId}`

	if (card.set && card.collectorNumber) {
		return `${card.set}:${card.collectorNumber}`.toLowerCase()
	}

	if (card.set) {
		return `${card.set}:${card.name}`.toLowerCase()
	}

	return card.name.toLowerCase()
}

function namedCardUrl(card: ParsedCard): string {
	const url = new URL('https://api.scryfall.com/cards/named')
	url.searchParams.set('exact', card.name)

	if (card.set) {
		url.searchParams.set('set', card.set)
	}

	return url.toString()
}

function enqueueRequest<T>(request: (signal: AbortSignal) => Promise<T>, delay: number): Promise<T> {
	const queuedRequest = requestQueue.then(async () => {
		await new Promise((resolve) => setTimeout(resolve, delay))
		const signal = AbortSignal.timeout(15_000)
		try {
			return await request(signal)
		} catch (error) {
			if (signal.aborted) throw new Error('Scryfall request timed out', { cause: error })
			throw error
		}
	})

	requestQueue = queuedRequest.then(
		() => undefined,
		() => undefined
	)

	return queuedRequest
}

async function responseError(response: Response): Promise<Error> {
	if (response.status === 404) return new Error('Card not found')

	const body = (await response.json().catch(() => null)) as {
		details?: string
	} | null

	return new Error(
		body?.details ?? `Scryfall request failed: ${response.status}`,
	)
}

export function findPrintings(card: ScryfallCard): Promise<ScryfallCard[]> {
	const cached = printingsCache.get(card.prints_search_uri)

	if (cached) {
		return cached
	}

	const request = loadPrintings(card)
	printingsCache.set(card.prints_search_uri, request)

	request.catch(() => {
		printingsCache.delete(card.prints_search_uri)
	})

	return request
}

async function loadPrintings(card: ScryfallCard): Promise<ScryfallCard[]> {
	const firstPage = new URL(card.prints_search_uri)

	firstPage.searchParams.set('order', 'released')
	firstPage.searchParams.set('dir', 'desc')
	firstPage.searchParams.set('unique', 'prints')

	const printings: ScryfallCard[] = []
	let pageUrl: string | null = firstPage.toString()

	while (pageUrl) {
		const currentUrl = pageUrl

		const page = await enqueueRequest(async (signal) => {
			const response = await fetch(currentUrl, {
				signal,
				headers: { Accept: 'application/json' }
			})

			if (!response.ok) {
				throw await responseError(response)
			}

			return (await response.json()) as {
				data: ScryfallCard[]
				has_more: boolean
				next_page: string | null
			}
		}, 125)

		printings.push(...page.data)
		pageUrl = page.has_more ? page.next_page : null
	}

	return printings
}

function matchesCardName(card: ScryfallCard, name: string): boolean {
	const expected = name.toLowerCase()
	if (card.name.toLowerCase() === `${expected} // ${expected}`) return false
	const names = [
		card.name,
		card.flavor_name,
		...(card.card_faces?.map((face) => face.name) ?? [])
	]

	return names.some(
		(candidate) => candidate?.toLowerCase() === expected
	)
}

/** Lower-case English set names mapped to Scryfall set codes, for LigaMagic imports. */
export function findSetCodesByName(): Promise<Map<string, string[]>> {
	setCodesByName ??= enqueueRequest(async (signal) => {
		const response = await fetch('https://api.scryfall.com/sets', { signal, headers: { Accept: 'application/json' } })
		if (!response.ok) throw await responseError(response)
		const { data } = await response.json() as { data: Array<{ name: string; code: string }> }
		const result = new Map<string, string[]>()
		for (const { name, code } of data) {
			const key = name.trim().toLocaleLowerCase('en')
			result.set(key, [...(result.get(key) ?? []), code.toLowerCase()])
		}
		return result
	}, 125)
	setCodesByName.catch(() => { setCodesByName = undefined })
	return setCodesByName
}
