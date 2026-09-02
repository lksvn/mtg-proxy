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
