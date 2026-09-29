/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { drawRulesText } from '../src/components/cardEditor/render/drawRulesText.ts'

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
