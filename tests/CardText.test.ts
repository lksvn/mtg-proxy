/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
	getLoyaltySymbolFile,
	getAbuDualLandColors,
	getSymbolFile,
	hasHybridManaSymbol,
	inferFrameVariant,
	parseCardText,
	parseManaCost,
	parseRulesText,
} from '../src/components/cardEditor/cardText.ts'

test('finds ABU dual-land colors from names or basic land types', () => {
	assert.deepEqual(getAbuDualLandColors('Savannah', 'Land'), ['WL', 'GL'])
	assert.deepEqual(getAbuDualLandColors('Plateau', 'Land'), ['WL', 'RL'])
	assert.deepEqual(getAbuDualLandColors('Custom', 'Land — Forest Plains'), ['WL', 'GL'])
	assert.deepEqual(getAbuDualLandColors('Custom', 'Terreno — Montanha Planície'), ['WL', 'RL'])
	assert.equal(getAbuDualLandColors('Savannah', 'Creature'), undefined)
})

test('identifies two-color hybrid mana symbols', () => {
	assert.equal(hasHybridManaSymbol('{W/U}'), true)
	assert.equal(hasHybridManaSymbol('2/W'), false)
	assert.equal(hasHybridManaSymbol('{B/P}'), false)
	assert.equal(hasHybridManaSymbol('{W}{U}'), false)
})

test('infers the frame from mana colors and card type', () => {
	assert.equal(inferFrameVariant('3BB', 'Legendary Creature — Rat Rogue'), 'B')
	assert.equal(inferFrameVariant('{W/U}', 'Creature'), 'WU')
	for (const pair of ['WU', 'WB', 'UB', 'UR', 'BR', 'BG', 'RG', 'RW', 'GW', 'GU']) {
		assert.equal(inferFrameVariant(pair, 'Creature'), pair)
		assert.equal(inferFrameVariant([...pair].reverse().join(''), 'Creature'), pair)
	}
	assert.equal(inferFrameVariant('{2}{B/P}', 'Creature'), 'B')
	assert.equal(inferFrameVariant('{W}{U}{B}', 'Creature'), 'M')
	assert.equal(inferFrameVariant('3', 'Artifact Creature'), 'A')
	assert.equal(inferFrameVariant('3W', 'Artifact — Equipment'), 'A')
	assert.equal(inferFrameVariant('3', 'Artifact — Vehicle'), 'V')
	assert.equal(inferFrameVariant('', 'Land'), 'L')
	assert.equal(inferFrameVariant('', 'Artifact Land'), 'L')
	assert.equal(inferFrameVariant('', 'Basic Land — Plains'), 'WL')
	assert.equal(inferFrameVariant('', 'Basic Land - Island'), 'UL')
	assert.equal(inferFrameVariant('', 'Basic Land — Swamp'), 'BL')
	assert.equal(inferFrameVariant('', 'Basic Land — Mountain'), 'RL')
	assert.equal(inferFrameVariant('', 'Basic Land — Forest'), 'GL')
	assert.equal(inferFrameVariant('', 'Land — Island Forest'), 'ML')
	assert.equal(inferFrameVariant('', 'Land — Forest Forest'), 'GL')
	assert.equal(inferFrameVariant('3W', 'Artefato — Equipamento'), 'A')
	assert.equal(inferFrameVariant('3', 'Artefato — Veículo'), 'V')
	assert.equal(inferFrameVariant('', 'Terreno'), 'L')
	assert.equal(inferFrameVariant('', 'Terreno Artefato — Planície'), 'WL')
	assert.equal(inferFrameVariant('', 'Terreno Básico — Ilha'), 'UL')
	assert.equal(inferFrameVariant('', 'Terreno Básico — Pântano'), 'BL')
	assert.equal(inferFrameVariant('', 'Terreno Básico — Montanha'), 'RL')
	assert.equal(inferFrameVariant('', 'Terreno Básico — Floresta'), 'GL')
	assert.equal(inferFrameVariant('', 'Terreno — Ilha Floresta'), 'ML')
	assert.equal(inferFrameVariant('', 'Terreno — Forest Floresta'), 'GL')
	assert.equal(inferFrameVariant('', 'Terreno Basico — Planicie'), 'WL')
	assert.equal(inferFrameVariant('', 'Terreno — Pa\u0302ntano'), 'BL')
	assert.equal(inferFrameVariant('3', 'Artefato — Veiculo'), 'V')
	assert.equal(inferFrameVariant('3', 'Creature'), 'C')
})

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
