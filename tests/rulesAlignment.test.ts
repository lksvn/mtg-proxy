import assert from 'node:assert/strict'
import test from 'node:test'
import { rulesAlignment } from '../src/components/cardEditor/render/rulesAlignment.ts'
import { splitRulesWords } from '../src/components/cardEditor/render/splitRulesWords.ts'

test('rules centering supports each axis and preserves saved combined centering', () => {
	assert.deepEqual(rulesAlignment({ centerRulesText: true }), { horizontalAlign: 'center', verticalAlign: 'middle' })
	assert.deepEqual(rulesAlignment({ centerRulesText: true, centerRulesTextVertically: false }), { horizontalAlign: 'center', verticalAlign: 'top' })
	assert.deepEqual(rulesAlignment({ centerRulesText: false, centerRulesTextVertically: true }), { horizontalAlign: 'left', verticalAlign: 'middle' })
})

test('Japanese rules can wrap without spaces and retain their original text', () => {
	const text = 'カードを２枚引く。\nその後、カード１枚を捨てる。'
	const words = splitRulesWords(text)
	assert.equal(words.join(''), text)
	assert.ok(words.length > 4)
	assert.deepEqual(splitRulesWords('Draw two cards.'), ['Draw', ' ', 'two', ' ', 'cards.'])
})
