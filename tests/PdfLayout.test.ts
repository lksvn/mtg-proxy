/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { calculatePageLayout, validatePdfQuantities } from '../src/PdfLayout.ts'

test('validates quantities and counts every face before allocating PDF images', () => {
	assert.doesNotThrow(() => validatePdfQuantities([{ quantity: 150, faceCount: 2 }]))
	assert.doesNotThrow(() => validatePdfQuantities([{ quantity: 500, faceCount: 1 }]))
	assert.throws(() => validatePdfQuantities([{ quantity: 501, faceCount: 1 }]), /500 card faces/)
	assert.throws(() => validatePdfQuantities([
		{ quantity: 150, faceCount: 2 },
		{ quantity: 201, faceCount: 1 },
	]), /500 card faces/)
	for (const quantity of [NaN, Infinity, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
		assert.throws(() => validatePdfQuantities([{ quantity, faceCount: 1 }]))
	}
})

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
