import assert from 'node:assert/strict'
import test from 'node:test'
import { isInsideArtwork } from '../src/components/cardEditor/artworkHitArea.ts'
import { FRAME_FAMILIES } from '../src/components/cardEditor/frameFamilies.ts'
import { HEIGHT, WIDTH } from '../src/components/cardEditor/canvasDimensions.ts'

test('artwork hit areas respect every frame, preview scale, and canvas rotation', () => {
	for (const family of Object.values(FRAME_FAMILIES)) {
		const { layout } = family
		const area = layout.artwork
		const centerX = (area.dragLeft + area.dragRight) / 2
		const centerY = (area.dragTop + area.dragBottom) / 2
		const points = [
			[centerX, centerY, true],
			[area.dragLeft, centerY, true],
			[area.dragRight, centerY, true],
			[centerX, area.dragTop, true],
			[centerX, area.dragBottom, true],
			[area.dragLeft - 1, centerY, false],
			[area.dragRight + 1, centerY, false],
			[centerX, area.dragTop - 1, false],
			[centerX, area.dragBottom + 1, false],
		] as const

		for (const scale of [1, 0.25]) {
			const bounds = { left: 20, top: 40, width: WIDTH * scale, height: HEIGHT * scale }
			for (const [x, y, expected] of points) {
				const rotated = layout.canvas?.rotation === 'counterclockwise'
				const clientX = bounds.left + (rotated ? y : x) * scale
				const clientY = bounds.top + (rotated ? HEIGHT - x : y) * scale
				assert.equal(isInsideArtwork(clientX, clientY, bounds, layout), expected, family.id)
			}
		}
	}
})
