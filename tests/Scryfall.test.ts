/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { findCards, findPrintings, type ScryfallCard } from '../src/Scryfall.ts'

test('resolves a translated name without retrying the English named endpoint', async () => {
	const originalFetch = globalThis.fetch
	const requests: string[] = []
	const lightningBolt = {
		id: 'lightning-bolt',
		name: 'Lightning Bolt',
		set: 'lea',
		set_name: 'Limited Edition Alpha',
		collector_number: '161',
		lang: 'en'
	} as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)
		requests.push(url)

		if (url.endsWith('/cards/collection')) return Response.json({ data: [] })
		if (url.includes('/cards/search')) return Response.json({ data: [{ name: 'Lightning Bolt' }] })
		if (url.includes('/cards/named')) return Response.json(lightningBolt)

		return Response.json({}, { status: 404 })
	}) as typeof fetch

	try {
		const [result] = await findCards([{
			quantity: 1,
			name: 'Raio',
			sourceLine: 'Raio'
		}])

		assert.equal(result.card?.name, 'Lightning Bolt')
		assert.equal(requests.some((url) => url.includes('exact=Raio')), false)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('includes language-exclusive printings', async () => {
	const originalFetch = globalThis.fetch
	let requestedUrl = ''
	const japanesePrinting = { id: 'soa-155', name: 'Ad Nauseam', set: 'soa', lang: 'ja' } as ScryfallCard

	globalThis.fetch = (async (input) => {
		requestedUrl = String(input)
		return Response.json({ data: [japanesePrinting], has_more: false, next_page: null })
	}) as typeof fetch

	try {
		const printings = await findPrintings({
			name: 'Ad Nauseam',
			prints_search_uri: 'https://api.scryfall.com/cards/search?q=oracleid%3Aad-nauseam&unique=prints'
		} as ScryfallCard)

		assert.equal(new URL(requestedUrl).searchParams.get('q'), 'oracleid:ad-nauseam')
		assert.equal(printings[0].lang, 'ja')
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('finds extra cards by name', async () => {
	const originalFetch = globalThis.fetch
	const requests: string[] = []
	const token = { id: 'angel-demon', name: 'Angel // Demon', set: 'phel', collector_number: '1★' } as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)
		requests.push(url)

		if (url.endsWith('/cards/collection')) return Response.json({ data: [] })
		if (url.includes('/cards/search')) return Response.json({ data: [{ name: token.name }] })
		if (url.includes('/cards/named')) return Response.json(token)

		return Response.json({}, { status: 404 })
	}) as typeof fetch

	try {
		const [result] = await findCards([{ quantity: 1, name: token.name, sourceLine: token.name }])

		assert.equal(result.card?.collector_number, '1★')
		assert.equal(requests.some((url) => new URL(url).searchParams.get('include_extras') === 'true'), true)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('ignores Art Series cards when resolving a face name', async () => {
	const originalFetch = globalThis.fetch
	const card = {
		id: 'aang',
		name: "Aang, Swift Savior // Aang and La, Ocean's Fury",
		layout: 'transform'
	} as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)

		if (url.endsWith('/cards/collection')) return Response.json({ data: [] })
		if (url.includes('/cards/search')) {
			assert.match(new URL(url).searchParams.get('q') ?? '', /-layout:art_series/)
			return Response.json({ data: [{ name: card.name }] })
		}
		if (url.includes('/cards/named')) return Response.json(card)

		return Response.json({}, { status: 404 })
	}) as typeof fetch

	try {
		const [result] = await findCards([{
			quantity: 1,
			name: 'Aang, Swift Savior',
			sourceLine: 'Aang, Swift Savior'
		}])

		assert.equal(result.card?.id, card.id)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('falls back to individual lookups when the collection request cannot be fetched', async () => {
	const originalFetch = globalThis.fetch
	const shock = { id: 'shock', name: 'Shock' } as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)

		if (url.endsWith('/cards/collection')) throw new TypeError('Failed to fetch')
		if (url.includes('/cards/named')) return Response.json(shock)

		return Response.json({}, { status: 404 })
	}) as typeof fetch

	try {
		const [result] = await findCards([{ quantity: 1, name: shock.name, sourceLine: shock.name }])

		assert.equal(result.card?.id, shock.id)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('matches card-face names returned by collection lookup', async () => {
	const originalFetch = globalThis.fetch
	const card = {
		id: 'bala-ged-recovery',
		name: 'Bala Ged Recovery // Bala Ged Sanctuary',
		card_faces: [
			{ name: 'Bala Ged Recovery' },
			{ name: 'Bala Ged Sanctuary' }
		]
	} as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)

		if (url.endsWith('/cards/collection')) {
			return Response.json({ data: [card] })
		}

		throw new Error(`Unexpected fallback request: ${url}`)
	}) as typeof fetch

	try {
		const [result] = await findCards([{
			quantity: 1,
			name: 'Bala Ged Recovery',
			sourceLine: 'Bala Ged Recovery'
		}])

		assert.equal(result.card?.id, card.id)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('prefers the newest regular printing when the default is a promo', async () => {
	const originalFetch = globalThis.fetch
	const promo = {
		id: 'promo-arcane-signet', name: 'Arcane Signet', set: 'sld', promo: true,
		prints_search_uri: 'https://api.scryfall.com/cards/search?q=oracleid%3Aarcane-signet'
	} as ScryfallCard
	const regular = { id: 'regular-arcane-signet', name: 'Arcane Signet', set: 'cmm' } as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)
		if (url.endsWith('/cards/collection')) return Response.json({ data: [promo] })
		const query = new URL(url).searchParams.get('q') ?? ''
		assert.match(query, /-is:promo/)
		assert.match(query, /-set:sld/)
		assert.equal(new URL(url).searchParams.get('dir'), 'desc')
		return Response.json({ data: [regular] })
	}) as typeof fetch

	try {
		const [result] = await findCards([{ quantity: 1, name: 'Arcane Signet', sourceLine: 'Arcane Signet' }])
		assert.equal(result.card?.id, regular.id)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('keeps a special printing when regular results have a different name', async () => {
	const originalFetch = globalThis.fetch
	const reversible = {
		id: 'reversible-command-tower', name: 'Command Tower // Command Tower', set: 'sld',
		prints_search_uri: 'https://api.scryfall.com/cards/search?q=oracleid%3Acommand-tower'
	} as ScryfallCard
	const regular = { id: 'regular-command-tower', name: 'Command Tower', set: 'cmm' } as ScryfallCard

	globalThis.fetch = (async (input) => String(input).endsWith('/cards/collection')
		? Response.json({ data: [reversible] })
		: Response.json({ data: [regular] })) as typeof fetch

	try {
		const [result] = await findCards([{
			quantity: 1, name: reversible.name, sourceLine: reversible.name
		}])
		assert.equal(result.card?.id, reversible.id)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('keeps plain and reversible cards distinct in a batch lookup', async () => {
	const originalFetch = globalThis.fetch
	const reversible = {
		id: 'sld-sol-ring', name: 'Sol Ring // Sol Ring', set: 'sld',
		card_faces: [{ name: 'Sol Ring' }, { name: 'Sol Ring' }],
		prints_search_uri: 'https://api.scryfall.com/cards/search?q=oracleid%3Asol-ring'
	} as ScryfallCard
	const regular = { id: 'regular-sol-ring', name: 'Sol Ring', set: 'cmm' } as ScryfallCard
	const urzasSaga = { id: 'urzas-saga', name: "Urza's Saga", set: 'mh2' } as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)
		if (url.endsWith('/cards/collection')) return Response.json({ data: [reversible, regular, urzasSaga] })
		if (url.includes('/cards/named')) return Response.json(reversible)
		return Response.json({ data: [regular] })
	}) as typeof fetch

	try {
		const lookups = await findCards([
			{ quantity: 1, name: reversible.name, sourceLine: reversible.name },
			{ quantity: 1, name: regular.name, sourceLine: regular.name },
			{ quantity: 1, name: regular.name, set: 'sld', sourceLine: 'Sol Ring (sld)' },
			{ quantity: 1, name: urzasSaga.name, sourceLine: urzasSaga.name }
		])
		assert.deepEqual(lookups.map((lookup) => lookup.card?.id), [
			reversible.id, regular.id, reversible.id, urzasSaga.id
		])
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('retries the exact name when collection only returns a reversible card', async () => {
	const originalFetch = globalThis.fetch
	const reversible = {
		id: 'reversible-mind-stone', name: 'Mind Stone // Mind Stone', set: 'sld',
		card_faces: [{ name: 'Mind Stone' }, { name: 'Mind Stone' }]
	} as ScryfallCard
	const regular = { id: 'regular-mind-stone', name: 'Mind Stone', set: 'cmm' } as ScryfallCard

	globalThis.fetch = (async (input) => {
		const url = String(input)
		if (url.endsWith('/cards/collection')) return Response.json({ data: [reversible] })
		if (url.includes('/cards/named')) return Response.json(regular)
		throw new Error(`Unexpected search request: ${url}`)
	}) as typeof fetch

	try {
		const [result] = await findCards([{ quantity: 1, name: regular.name, sourceLine: regular.name }])
		assert.equal(result.card?.id, regular.id)
	} finally {
		globalThis.fetch = originalFetch
	}
})
