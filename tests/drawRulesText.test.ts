/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { drawRulesText, hasRulesTextOverflow, resetRulesTextOverflow } from '../src/components/cardEditor/render/drawRulesText.ts'

test('Seventh rules and flavor share a vertically centered text block', () => {
	const positions: number[] = []
	const context = {
		save() {},
		restore() {},
		measureText(value: string) { return { width: value.length * 10 } },
		fillText(_value: string, _x: number, y: number) { positions.push(y) },
	} as unknown as CanvasRenderingContext2D

	drawRulesText(
		context,
		[{ type: 'text', value: 'Rule\nFlavor', italic: false }],
		new Map(),
		0, 100, 500, 100,
		{ verticalAlign: 'middle', fontFamily: 'serif', italicFontFamily: 'serif', color: '#111', strokeColor: '#111', strokeWidth: 0, maxFontSize: 20, minFontSize: 20 },
	)

	assert.deepEqual(positions, [126.5, 151.5])
})

test('centers rules text horizontally and vertically', () => {
	const positions: [number, number][] = []
	const context = {
		save() {}, restore() {},
		measureText(value: string) { return { width: value.length * 10 } },
		fillText(_value: string, x: number, y: number) { positions.push([x, y]) },
	} as unknown as CanvasRenderingContext2D

	drawRulesText(
		context,
		[{ type: 'text', value: 'Rule', italic: false }],
		new Map(),
		100, 200, 300, 100,
		{ horizontalAlign: 'center', verticalAlign: 'middle', fontFamily: 'serif', italicFontFamily: 'serif', color: '#111', strokeColor: '#111', strokeWidth: 0, maxFontSize: 20, minFontSize: 20 },
	)

	assert.deepEqual(positions, [[230, 239]])
})

test('does not draw rules text without a text box', () => {
	let drawn = false
	const context = { fillText() { drawn = true } } as unknown as CanvasRenderingContext2D

	drawRulesText(
		context,
		[{ type: 'text', value: 'Hidden text', italic: false }],
		new Map(),
		0, 0, 500, 0,
		{ fontFamily: 'serif', italicFontFamily: 'serif', color: '#111', strokeColor: '#111', strokeWidth: 0, maxFontSize: 20, minFontSize: 20 },
	)

	assert.equal(drawn, false)
})

test('reports unfit text without changing drawing and clears it for the next render', () => {
	const context = {
		save() {}, restore() {}, fillText() {},
		measureText(value: string) { return { width: value.length * 10 } },
	} as unknown as CanvasRenderingContext2D
	const style = { fontFamily: 'serif', italicFontFamily: 'serif', color: '#111', strokeColor: '#111', strokeWidth: 0, maxFontSize: 20, minFontSize: 20 }
	function draw(value: string, width = 100, height = 100) {
		drawRulesText(context, [{ type: 'text', value, italic: false }], new Map(), 0, 0, width, height, style)
	}
	draw('Short')
	assert.equal(hasRulesTextOverflow(context), false)
	draw('Unbreakablewordtoolong')
	assert.equal(hasRulesTextOverflow(context), true)
	resetRulesTextOverflow(context)
	draw('One\nTwo\nThree', 100, 30)
	assert.equal(hasRulesTextOverflow(context), true)
	resetRulesTextOverflow(context)
	draw('Short\nFine')
	assert.equal(hasRulesTextOverflow(context), false)
	draw('Tenletters ', 100)
	assert.equal(hasRulesTextOverflow(context), false)
	drawRulesText(context, [
		{ type: 'symbol', value: 'W' },
		{ type: 'text', value: ' Reminder text', italic: true },
	], new Map(), 0, 0, 200, 100, style)
	assert.equal(hasRulesTextOverflow(context), false)
	drawRulesText(context, [{ type: 'symbol', value: 'W' }], new Map(), 0, 0, 10, 100, style)
	assert.equal(hasRulesTextOverflow(context), true)
})
