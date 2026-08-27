/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { calculatePageLayout } from '../src/PdfLayout.ts'

test('calculates cards per supported paper size', () => {
	assert.equal(calculatePageLayout('a4', 0.2).cardsPerPage, 9)
	assert.equal(calculatePageLayout('a3', 0.2).cardsPerPage, 16)
	assert.equal(calculatePageLayout('letter', 0.2).cardsPerPage, 9)
	assert.equal(calculatePageLayout('legal', 0.2).cardsPerPage, 12)
})

test('centres the A4 card grid', () => {
	const layout = calculatePageLayout('a4', 0.2)

	assert.ok(Math.abs(layout.marginX - 10.3) < 0.001)
	assert.ok(Math.abs(layout.marginY - 16.3) < 0.001)
})

test('rejects invalid gaps', () => {
	assert.throws(() => calculatePageLayout('a4', -1))
	assert.throws(() => calculatePageLayout('a4', Number.NaN))
})