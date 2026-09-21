/// <reference types="node" />

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import {
	FRAME_FAMILIES,
	resolveFrameVariant,
	resolvePtTextColor,
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
	assert.equal(existsSync(resolve('src/assets/fonts/matrix-b.ttf')), true)
	assert.equal(existsSync(resolve('src/assets/fonts/matrix-bsc.ttf')), true)
	assert.equal(existsSync(resolve('src/assets/fonts/goudy-medieval.ttf')), true)
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
	const universesBeyond = FRAME_FAMILIES['universes-beyond']
	assert.equal(resolveFrameVariant(universesBeyond, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(universesBeyond, 'V'), 'V')
	assert.equal(resolveFrameVariant(universesBeyond, 'C'), 'A')
	assert.equal(resolveFrameVariant(universesBeyond, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(universesBeyond, 'ML'), 'ML')
	assert.equal(resolvePtTextColor('V', '#111'), '#fff')
	assert.equal(resolvePtTextColor('A', '#111'), '#111')
	const eighth = FRAME_FAMILIES['eighth-edition']
	assert.equal(resolveFrameVariant(eighth, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(eighth, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(eighth, 'C'), 'C')
	assert.equal(resolveFrameVariant(eighth, 'V'), 'A')
	assert.equal(eighth.pt.C, 'img/frames/8th/pt/l.png')
	assert.equal(eighth.layout.footer.colorByVariant?.B, '#fff')
	const seventh = FRAME_FAMILIES['seventh-edition']
	assert.equal(resolveFrameVariant(seventh, 'WU'), 'M')
	assert.equal(resolveFrameVariant(seventh, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(seventh, 'ML'), 'L')
	assert.equal(resolveFrameVariant(seventh, 'V'), 'A')
	assert.deepEqual(seventh.pt, {})

	const limited: FrameFamily = {
		...regular,
		frames: { ...regular.frames, V: undefined, WL: undefined },
		dual: undefined,
	}
	assert.equal(resolveFrameVariant(limited, 'V'), 'A')
	assert.equal(resolveFrameVariant(limited, 'WL'), 'L')
	assert.equal(resolveFrameVariant(limited, 'WU'), 'M')
})
