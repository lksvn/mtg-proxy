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
