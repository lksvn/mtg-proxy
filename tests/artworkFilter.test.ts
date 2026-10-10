import assert from 'node:assert/strict'
import test from 'node:test'
import { artworkFilter } from '../src/components/cardEditor/render/artworkFilter.ts'

test('combines artwork grayscale and inversion without replacing either effect', () => {
	assert.equal(artworkFilter({ grayscale: false, invert: false }), 'none')
	assert.equal(artworkFilter({ grayscale: true, invert: false }), 'grayscale(1)')
	assert.equal(artworkFilter({ grayscale: false, invert: true }), 'invert(1)')
	assert.equal(artworkFilter({ grayscale: true, invert: true }), 'grayscale(1) invert(1)')
})
