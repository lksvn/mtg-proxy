import assert from 'node:assert/strict'
import test from 'node:test'
import { romanNumeral } from '../src/components/cardEditor/render/sagaNumbers.ts'

test('formats Saga chapter numbers as Roman numerals', () => {
	assert.equal(romanNumeral(1), 'I')
	assert.equal(romanNumeral(4), 'IV')
	assert.equal(romanNumeral(10), 'X')
})
