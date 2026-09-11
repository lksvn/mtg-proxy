/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
	getLoyaltySymbolFile,
	getSymbolFile,
	parseCardText,
	parseManaCost,
	parseRulesText,
} from '../src/components/cardEditor/cardText.ts'

test('maps card symbols to bundled asset names', () => {
	assert.equal(getSymbolFile('W'), 'w.svg')
    assert.equal(getSymbolFile('2/u'), '2u.svg')
    assert.equal(getSymbolFile('Q'), 'untap.svg')
    assert.equal(getSymbolFile('unknown'), undefined)
})

test('parses symbols and italic text', () => {
	assert.deepEqual(
		parseCardText('Add {G}{G}. (Spend this mana only to cast creatures.)'),
		[
			{ type: 'text', value: 'Add ', italic: false },
			{ type: 'symbol', value: 'G' },
			{ type: 'symbol', value: 'G' },
			{ type: 'text', value: '. ', italic: false },
			{
				type: 'text',
				value: '(Spend this mana only to cast creatures.)',
				italic: true,
			},
		],
	)
})

test('keeps unknown symbols as ordinary text', () => {
	assert.deepEqual(parseCardText('{UNKNOWN}'), [
		{ type: 'text', value: '{UNKNOWN}', italic: false },
	])
})

test('maps loyalty symbols to bundled assets', () => {
	assert.equal(getLoyaltySymbolFile('-1'), '-1.svg')
	assert.equal(getLoyaltySymbolFile('−3'), '-3.svg')
	assert.equal(getLoyaltySymbolFile('0'), '+0.svg')
	assert.equal(getLoyaltySymbolFile('10'), undefined)
})

test('parses loyalty symbols inside italic text', () => {
	assert.deepEqual(parseCardText('([−1]: Surveil 1)'), [
		{ type: 'text', value: '(', italic: true },
		{ type: 'symbol', value: '-1.svg' },
		{ type: 'text', value: ': Surveil 1)', italic: true },
	])
})

test('italicizes ability labels ending with an em dash or hyphen', () => {
	for (const separator of ['—', '-']) {
		assert.deepEqual(
			parseRulesText(`Exhaust ${separator} {5}{B}: Return target creature.`)[0],
			{ type: 'text', value: `Exhaust ${separator}`, italic: true },
		)
	}
})

test('parses compact and spaced mana costs', () => {
	assert.deepEqual(parseManaCost('2UU'), [
		{ type: 'symbol', value: '2' },
		{ type: 'symbol', value: 'U' },
		{ type: 'symbol', value: 'U' },
	])

	assert.deepEqual(parseManaCost('W/U W/P'), [
		{ type: 'symbol', value: 'W/U' },
		{ type: 'symbol', value: 'W/P' },
	])

	assert.deepEqual(parseManaCost('9 9 9'), [
		{ type: 'symbol', value: '9' },
		{ type: 'symbol', value: '9' },
		{ type: 'symbol', value: '9' },
	])
})

test('parses generic and mixed-format mana costs', () => {
	assert.deepEqual(parseManaCost('123'), [
		{ type: 'symbol', value: '123' },
	])

	assert.deepEqual(parseManaCost('1{3}XQWBUGRC'), [
		{ type: 'symbol', value: '1' },
		{ type: 'symbol', value: '3' },
		{ type: 'symbol', value: 'X' },
		{ type: 'symbol', value: 'Q' },
		{ type: 'symbol', value: 'W' },
		{ type: 'symbol', value: 'B' },
		{ type: 'symbol', value: 'U' },
		{ type: 'symbol', value: 'G' },
		{ type: 'symbol', value: 'R' },
		{ type: 'symbol', value: 'C' },
	])
})

test('parses arbitrary generic mana in rules text', () => {
	assert.deepEqual(parseCardText('Pay {123}.'), [
		{ type: 'text', value: 'Pay ', italic: false },
		{ type: 'symbol', value: '123' },
		{ type: 'text', value: '.', italic: false },
	])
})
