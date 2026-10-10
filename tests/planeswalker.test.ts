import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { drawPlaneswalker, getIconlessAbilityRuns, getPlaneswalkerRows, PLANESWALKER_ASSETS, type PlaneswalkerIcons } from '../src/components/cardEditor/render/drawPlaneswalker.ts'
import { SAMPLE_PLANESWALKER } from '../src/components/cardEditor/sampleCards.ts'

test('ability text color does not change the white loyalty cost text', () => {
	for (const color of ['#fff', '#111']) {
		const drawn: { text: string; color: string }[] = []
		const context = {
			save() {}, restore() {}, drawImage() {}, strokeText() {},
			measureText(value: string) { return { width: value.length * 10 } },
			fillStyle: '',
			fillText(text: string) { drawn.push({ text, color: this.fillStyle }) },
		} as unknown as CanvasRenderingContext2D
		drawPlaneswalker(context, {
			...SAMPLE_PLANESWALKER,
			abilities: [{ cost: '+1', text: 'Draw' }],
		}, [[{ type: 'text', value: 'Draw', italic: false }]], new Map(), {} as PlaneswalkerIcons, 1310, 1870, color)
		assert.deepEqual(drawn, [{ text: '+1', color: '#fff' }, { text: 'Draw', color }])
	}
})

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
