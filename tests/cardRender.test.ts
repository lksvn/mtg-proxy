import assert from 'node:assert/strict'
import test from 'node:test'
import { canExportCardRender, type CardRenderInput } from '../src/components/cardEditor/cardRender.ts'

test('only exports a successful render of the current card inputs', () => {
	const input: CardRenderInput = {
		frameFamily: 'm15-regular',
		borderStyle: 'black',
		frameVariant: 'W',
		transform: { x: 0, y: 0, rotation: 0, scale: 0, flipX: false, flipY: false, grayscale: false },
		card: {
			name: 'Test', manaCost: 'w', typeLine: 'Creature', rulesText: '',
			centerRulesText: false, flavorText: '', powerToughness: '1/1',
			artist: '', number: '1', rarity: 'common', tintSetSymbol: false, backgroundColor: '#000000',
		},
	}
	assert.equal(canExportCardRender(input, null), false)
	assert.equal(canExportCardRender(input, { input, status: 'error' }), false)
	assert.equal(canExportCardRender(input, { input, status: 'ready' }), true)

	const editedInput = { ...input, card: { ...input.card, name: 'Edited' } }
	assert.equal(canExportCardRender(editedInput, { input, status: 'ready' }), false)
	assert.equal(canExportCardRender(editedInput, { input: editedInput, status: 'ready' }), true)
})
