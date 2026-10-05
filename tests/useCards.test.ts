import assert from 'node:assert/strict'
import test from 'node:test'
import { createCustomCardEntry, withCustomCards } from '../src/hooks/cardEntries.ts'

test('creates a printable custom card entry without a Scryfall printing', () => {
	const entry = createCustomCardEntry({
		quantity: 10,
		name: 'Test Card',
		typeLine: 'Creature — Test',
		artist: 'Test Artist',
		collectorNumber: '42',
		imageUrl: 'blob:test-card',
	})

	assert.equal(entry.status, 'ready')
	assert.equal(entry.custom, true)
	assert.equal(entry.parsed.quantity, 10)
	assert.equal(entry.card?.name, 'Test Card')
	assert.equal(entry.card?.image_uris?.png, 'blob:test-card')
	assert.equal(entry.card?.scryfall_uri, '')
})

test('keeps custom cards when resolved deck-list cards are replaced', () => {
	const custom = createCustomCardEntry({
		quantity: 1,
		name: 'Custom Card',
		typeLine: 'Creature',
		artist: '',
		collectorNumber: '',
		imageUrl: 'blob:custom-card',
	})
	const resolved = { ...custom, custom: false }

	assert.deepEqual(withCustomCards([resolved], [custom]), [resolved, custom])
})
