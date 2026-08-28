/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCardList, serializeCardList } from '../src/Cards.ts'

test('parses supported card-list syntax', () => {
    const cards = parseCardList(`
        4 Lightning Bolt
        Black Lotus (LEA) 232
        2 Delver of Secrets (isd)
        0 Island
    `)

    assert.deepEqual(cards, [
        {
            quantity: 4,
            name: 'Lightning Bolt',
            sourceLine: '4 Lightning Bolt',
            set: undefined,
            collectorNumber: undefined,
            error: undefined,
        },
        {
            quantity: 1,
            name: 'Black Lotus',
            sourceLine: 'Black Lotus (LEA) 232',
            set: 'lea',
            collectorNumber: '232',
            error: undefined,
        },
        {
            quantity: 2,
            name: 'Delver of Secrets',
            sourceLine: '2 Delver of Secrets (isd)',
            set: 'isd',
            collectorNumber: undefined,
            error: undefined,
        },
        {
            quantity: 0,
            name: 'Island',
            sourceLine: '0 Island',
            set: undefined,
            collectorNumber: undefined,
            error: 'Quantity must be at least 1',
        },
    ])
})

test('serializes a restorable card list', () => {
	const cards = parseCardList(`
        4 Lightning Bolt
        Missing Card
    `)

	cards[0].set = '2xm'
	cards[0].collectorNumber = '129'
	cards[1].error = 'Card not found'

	assert.equal(
		serializeCardList(cards),
		'4 Lightning Bolt (2xm) 129\nMissing Card\n',
	)
})

test('cleans Moxfield export metadata', () => {
	const cards = parseCardList(`
        About
        Name The Unbeatable Squirrel Girl (cEDH)🐿🐿🐿🐿🐿

        Commander:
        1 Mox Opal (SLD) 1072 *E*
        1 Lightning Bolt (2XM) 129 *F*
        1 Invasion of Ikoria / Zilortha, Apex of Ikoria
        1 Name Sticker Goblin
	`)

	assert.deepEqual(
		cards.map(({ name, set, collectorNumber }) => ({
			name,
			set,
			collectorNumber,
		})),
		[
			{
				name: 'Mox Opal',
				set: 'sld',
				collectorNumber: '1072',
			},
			{
				name: 'Lightning Bolt',
				set: '2xm',
				collectorNumber: '129',
			},
			{
				name:
					'Invasion of Ikoria // Zilortha, Apex of Ikoria',
				set: undefined,
				collectorNumber: undefined,
			},
			{
				name: 'Name Sticker Goblin',
				set: undefined,
				collectorNumber: undefined,
			},
		],
	)
})