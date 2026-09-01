/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { findCards, type ScryfallCard } from '../src/Scryfall.ts'

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
