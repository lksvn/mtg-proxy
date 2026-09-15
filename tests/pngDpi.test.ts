/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { setPngDpi } from '../src/utils/pngDpi.ts'

test('adds DPI metadata to a PNG', () => {
	const png = new Uint8Array([
		137, 80, 78, 71, 13, 10, 26, 10,
		0, 0, 0, 13, 73, 72, 68, 82,
		...new Uint8Array(17),
	])
	const output = setPngDpi(png, 300)
	const view = new DataView(output.buffer)

	assert.deepEqual([...output.slice(37, 41)], [112, 72, 89, 115])
	assert.equal(view.getUint32(41), 11811)
	assert.equal(view.getUint32(45), 11811)
	assert.equal(output[49], 1)
})
