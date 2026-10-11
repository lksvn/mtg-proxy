import assert from 'node:assert/strict'
import test from 'node:test'
import { drawVerticalTitle } from '../src/components/cardEditor/render/drawVerticalTitle.ts'

test('vertical titles keep graphemes together and fit the panel', () => {
	const calls: unknown[][] = []
	const context = {
		font: '64px serif',
		save() {},
		restore() {},
		fillText(...args: unknown[]) { calls.push(args) },
	} as unknown as CanvasRenderingContext2D
	drawVerticalTitle(context, 'Á骨', 100, 150, 100, 80)
	assert.equal(context.font, '40px serif')
	assert.deepEqual(calls, [['Á', 150, 170, 100], ['骨', 150, 210, 100]])
})

test('STA Japanese title stays inside the usable panel', () => {
	const positions: number[] = []
	const context = {
		font: '64px serif',
		save() {},
		restore() {},
		fillText(_text: string, _x: number, y: number) { positions.push(y) },
	} as unknown as CanvasRenderingContext2D
	drawVerticalTitle(context, '暗黒の儀式', 135, 150, 179, 238)
	assert.equal(positions.length, 5)
	assert.ok(positions.every(y => y >= 150 && y < 388))
})
