/// <reference types="node" />

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import {
	FRAME_FAMILIES,
	resolveFrameVariant,
	type FrameFamily,
} from '../src/components/cardEditor/frameFamilies.ts'

test('frame family assets exist', () => {
	for (const family of Object.values(FRAME_FAMILIES)) {
		const paths = [
			...Object.values(family.frames),
			...Object.values(family.pt),
			...Object.values(family.dual ?? {}).filter((value) => typeof value === 'string' && value.includes('/')),
		]

		for (const path of paths) {
			assert.equal(existsSync(resolve('public', path)), true, `${family.id}: ${path}`)
		}
	}
})

test('frame variants stay in the selected family and use declared fallbacks', () => {
	const regular = FRAME_FAMILIES['m15-regular']
	assert.equal(resolveFrameVariant(regular, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(regular, 'V'), 'V')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['m15-extended'], 'WU'), 'WU')
	const borderless = FRAME_FAMILIES.borderless
	assert.equal(resolveFrameVariant(borderless, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(borderless, 'V'), 'A')
	assert.equal(resolveFrameVariant(borderless, 'UL'), 'L')
	const promo = FRAME_FAMILIES['promo-regular']
	assert.equal(resolveFrameVariant(promo, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(promo, 'V'), 'A')
	assert.equal(resolveFrameVariant(promo, 'C'), 'A')
	assert.equal(resolveFrameVariant(promo, 'UL'), 'L')
	const snow = FRAME_FAMILIES.snow
	assert.equal(resolveFrameVariant(snow, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(snow, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(snow, 'ML'), 'ML')
	assert.equal(resolveFrameVariant(snow, 'V'), 'A')
	assert.equal(resolveFrameVariant(snow, 'C'), 'A')
	const nyx = FRAME_FAMILIES.nyx
	assert.equal(resolveFrameVariant(nyx, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(nyx, 'V'), 'A')
	assert.equal(resolveFrameVariant(nyx, 'C'), 'A')
	assert.equal(resolveFrameVariant(nyx, 'L'), 'M')
	assert.equal(resolveFrameVariant(nyx, 'UL'), 'M')

	const limited: FrameFamily = {
		...regular,
		frames: { ...regular.frames, V: undefined, WL: undefined },
		dual: undefined,
	}
	assert.equal(resolveFrameVariant(limited, 'V'), 'A')
	assert.equal(resolveFrameVariant(limited, 'WL'), 'L')
	assert.equal(resolveFrameVariant(limited, 'WU'), 'M')
})
