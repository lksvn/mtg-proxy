import type { ParsedCard } from './Cards'

export type ScryfallCard = {
	id: string
	name: string
    flavor_name?: string
	set: string
	set_name: string
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
}

export type CardLookup = {
	card?: ScryfallCard
	error?: string
}

type Identifier = { name: string } | { set: string; collector_number: string }

const cache = new Map<string, ScryfallCard>()
const printingsCache = new Map<string, Promise<ScryfallCard[]>>()
const translatedNamesCache = new Map<string, Promise<string>>()

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
		} else if (card.set && !card.collectorNumber) {
			individualCards.push({ parsedCard: card })
		} else {
			identifiers.set(key, identifierFor(card))
		}
	}

	const identifierEntries = [...identifiers.entries()]

	for (let index = 0; index < identifierEntries.length; index += 75) {
		const chunk = identifierEntries.slice(index, index + 75)
		const response = await fetchCollection(chunk.map(([, value]) => value))

		for (const [key, identifier] of chunk) {
			const parsedCard = cardsByKey.get(key)

            const identifiedCard = response.data.find((candidate) => matchesIdentifier(candidate, identifier))

            const card = identifiedCard && (!parsedCard || matchesCardName(identifiedCard, parsedCard.name)) ? identifiedCard : undefined

            if (card) {
                cache.set(key, card)
                results.set(key, { card })
            } else if (parsedCard) {
                individualCards.push({ parsedCard, identifiedCard, skipNamedLookup: true })
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

	return cards.map((card) => {
		return results.get(cardKey(card)) ?? { error: 'Card not found' }
	})
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

	return enqueueRequest(async () => {
		const response = await fetch(url, {
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
	}, 100)
}

export function findCard(card: ParsedCard): Promise<ScryfallCard> {
	const key = cardKey(card)
	const cached = cache.get(key)

	if (cached) {
		return Promise.resolve(cached)
	}

	const url = card.set && card.collectorNumber
        ? `https://api.scryfall.com/cards/${encodeURIComponent(card.set)}/${encodeURIComponent(card.collectorNumber)}`
        : namedCardUrl(card)

	return enqueueRequest(async () => {
		const response = await fetch(url, {
			headers: { Accept: 'application/json' }
		})

		if (!response.ok) {
			throw await responseError(response)
		}

		const foundCard = (await response.json()) as ScryfallCard
		cache.set(key, foundCard)

		return foundCard
	}, 100)
}

function fetchCollection(identifiers: Identifier[]): Promise<{ data: ScryfallCard[] }> {
	return enqueueRequest(async () => {
		const response = await fetch('https://api.scryfall.com/cards/collection',
			{
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
        return [card.name, card.flavor_name].some(
            (name) => name?.toLowerCase() === identifier.name.toLowerCase()
        )
    }

	return (
		card.set.toLowerCase() === identifier.set.toLowerCase() &&
		card.collector_number.toLowerCase() === identifier.collector_number.toLowerCase()
	)
}

function cardKey(card: ParsedCard): string {
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

function enqueueRequest<T>(request: () => Promise<T>, delay: number): Promise<T> {
	const queuedRequest = requestQueue.then(async () => {
		await new Promise((resolve) => setTimeout(resolve, delay))
		return request()
	})

	requestQueue = queuedRequest.then(
		() => undefined,
		() => undefined
	)

	return queuedRequest
}

async function responseError(response: Response): Promise<Error> {
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

		const page = await enqueueRequest(async () => {
			const response = await fetch(currentUrl, {
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
		}, 100)

		printings.push(...page.data)
		pageUrl = page.has_more ? page.next_page : null
	}

	return printings
}

function matchesCardName(card: ScryfallCard, name: string): boolean {
	const expected = name.toLowerCase()
	const names = [
		card.name,
		card.flavor_name,
		...(card.card_faces?.map((face) => face.name) ?? [])
	]

	return names.some(
		(candidate) => candidate?.toLowerCase() === expected
	)
}
