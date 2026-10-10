import assert from 'node:assert/strict'
import test from 'node:test'
import { cardPngFilename } from '../src/utils/cardPngFilename.ts'

test('names all editor PNG exports after the card with a safe mtg-proxy suffix', () => {
	assert.equal(cardPngFilename('Bottomless Pool'), 'bottomless-pool-mtg-proxy.png')
	assert.equal(cardPngFilename('Room', 300), 'room-mtg-proxy-300dpi.png')
	assert.equal(cardPngFilename('Room', 600), 'room-mtg-proxy-600dpi.png')
	assert.equal(cardPngFilename('Alive // Well'), 'alive-well-mtg-proxy.png')
	assert.equal(cardPngFilename('骨を灰に'), '骨を灰に-mtg-proxy.png')
	assert.equal(cardPngFilename(' .. '), 'custom-card-mtg-proxy.png')
	assert.equal(cardPngFilename('Rat\n'), 'rat-mtg-proxy.png')
	assert.equal(cardPngFilename(' Éowyn, Shieldmaiden! '), 'eowyn-shieldmaiden-mtg-proxy.png')
	assert.equal(cardPngFilename("Rats' Feast"), 'rats-feast-mtg-proxy.png')
	assert.ok(cardPngFilename('a'.repeat(500)).length < 255)
})
