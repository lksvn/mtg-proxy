import assert from 'node:assert/strict'
import test from 'node:test'
import { FRAME_FAMILIES, resolveFrameVariant } from '../src/components/cardEditor/frameFamilies.ts'
import { isInsideArtwork } from '../src/components/cardEditor/artworkHitArea.ts'
import { getDebugRegions } from '../src/components/cardEditor/render/getDebugRegions.ts'

test('Split artwork selection keeps each drag area inside its own half', () => {
	const { layout } = FRAME_FAMILIES['split-regular']
	const second = { ...layout, artwork: layout.split!.secondArtwork }
	const bounds = { left: 0, top: 0, width: 1500, height: 2100 }
	assert.equal(isInsideArtwork(500, 1500, bounds, layout), true)
	assert.equal(isInsideArtwork(500, 500, bounds, layout), false)
	assert.equal(isInsideArtwork(500, 500, bounds, second), true)
	assert.equal(isInsideArtwork(500, 1500, bounds, second), false)
	for (const active of [layout, second]) {
		assert.equal(isInsideArtwork(150, 500, bounds, active), false)
		assert.equal(isInsideArtwork(950, 500, bounds, active), false)
	}
})

test('Split guides cover both halves and colors stay in the Split family', () => {
	const family = FRAME_FAMILIES['split-regular']
	assert.equal(family.layout.previewRotation, true)
	assert.equal(family.layout.canvas, undefined)
	assert.equal(family.layout.rules.verticalAlign, 'middle')
	assert.notEqual(family.layout.rules.horizontalAlign, 'center')
	assert.equal(resolveFrameVariant(family, 'R'), 'R')
	assert.equal(resolveFrameVariant(family, 'U'), 'U')
	assert.equal(resolveFrameVariant(family, 'WU'), 'M')
	assert.equal(resolveFrameVariant(family, 'C'), 'A')
	const guides = getDebugRegions(family)
	for (const side of ['Left', 'Right']) {
		for (const part of ['title', 'mana', 'type', 'rules', 'set symbol']) {
			const guide = guides.find(({ label }) => label === `${side} ${part}`)!
			assert.ok(guide)
			assert.ok(guide.x >= 0 && guide.x + guide.width <= 1500)
			assert.ok(guide.y >= 0 && guide.y + guide.height <= 2100)
		}
	}
})
