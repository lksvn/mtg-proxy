import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { getIconlessAbilityRuns, getPlaneswalkerRows, PLANESWALKER_ASSETS } from '../src/components/cardEditor/render/drawPlaneswalker.ts'

test('lays out one to four Planeswalker abilities inside the rules area', () => {
	for (let count = 1; count <= 4; count++) {
		const rows = getPlaneswalkerRows(count)
		assert.equal(rows.length, count)
		assert.equal(rows[0].y, 1310)
		assert.equal(rows.at(-1)!.y + rows.at(-1)!.height, 1870)
	}
})

test('gives longer Planeswalker abilities more vertical space', () => {
	const rows = getPlaneswalkerRows(3, [90, 250, 90])

	assert.ok(rows[1].height > rows[0].height)
	assert.ok(rows[0].height > 140)
	assert.equal(rows[0].y, 1310)
	assert.equal(rows.at(-1)!.y + rows.at(-1)!.height, 1870)
})

test('gives passive text more room on a two-ability Planeswalker', () => {
	const rows = getPlaneswalkerRows(2, [210, 90])

	assert.ok(rows[0].height > rows[1].height * 2)
	assert.equal(rows.at(-1)!.y + rows.at(-1)!.height, 1870)
})

test('Planeswalker overlay assets exist', () => {
	for (const path of Object.values(PLANESWALKER_ASSETS)) assert.ok(existsSync(`public/${path}`), path)
})

test('formats Seventh-style loyalty costs as inline rules text', () => {
	const runs = getIconlessAbilityRuns(
		['+1', '-3'],
		[
			[{ type: 'text', value: 'Draw a card.', italic: false }],
			[{ type: 'text', value: 'Create a token.', italic: false }],
		],
	)

	assert.deepEqual(runs.filter((run) => run.type === 'text').map((run) => run.value), [
		'+1: ',
		'Draw a card.',
		'\n',
		'-3: ',
		'Create a token.',
	])
})
