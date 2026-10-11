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
	assert.equal(family.layout.split!.frameSplitY, 1000)
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

test('Fuse reserves a shared reminder strip without changing artwork bounds', () => {
	const regular = FRAME_FAMILIES['split-regular'].layout
	const family = FRAME_FAMILIES['split-fuse']
	const { layout } = family
	assert.deepEqual(layout.artwork, regular.artwork)
	assert.deepEqual(layout.split!.secondArtwork, regular.split!.secondArtwork)
	assert.equal(layout.split!.frameSplitY, 1000)
	assert.ok(layout.rules.height < regular.rules.height)
	const reminder = layout.split!.reminder!
	assert.ok(layout.rules.y + layout.rules.height < reminder.y)
	assert.equal(reminder.horizontalAlign, 'center')
	assert.equal(layout.previewRotation, true)
	assert.equal(resolveFrameVariant(family, 'WU'), 'M')
	const guide = getDebugRegions(family).find(({ label }) => label === 'Fuse reminder')!
	assert.ok(guide)
	assert.ok(guide.x + guide.width <= 1500)
	assert.ok(guide.y >= 0 && guide.y + guide.height <= 2100)
})

test('Aftermath keeps top and bottom artwork separate and guides follow the clockwise half', () => {
	const family = FRAME_FAMILIES['split-aftermath']
	const { layout } = family
	const split = layout.split!
	assert.equal(split.frameSplitY, 1139)
	assert.equal(layout.previewRotation, 'counterclockwise')
	assert.equal(split.reminder, undefined)
	assert.ok(split.secondLayout)
	const bounds = { left: 0, top: 0, width: 1500, height: 2100 }
	const bottom = { ...layout, artwork: split.secondArtwork }
	assert.equal(isInsideArtwork(750, 450, bounds, layout), true)
	assert.equal(isInsideArtwork(1000, 1500, bounds, layout), false)
	assert.equal(isInsideArtwork(1000, 1500, bounds, bottom), true)
	assert.equal(isInsideArtwork(750, 450, bounds, bottom), false)
	assert.equal(isInsideArtwork(500, 1500, bounds, bottom), false)
	assert.equal(resolveFrameVariant(family, 'WU'), 'M')
	for (const part of ['title', 'mana', 'type', 'rules', 'set symbol']) {
		const guide = getDebugRegions(family).find(({ label }) => label === `Bottom ${part}`)!
		assert.ok(guide)
		assert.ok(guide.x >= 0 && guide.x + guide.width <= 1500)
		assert.ok(guide.y >= split.frameSplitY && guide.y + guide.height <= 2100)
	}
})
