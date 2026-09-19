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

	const limited: FrameFamily = {
		...regular,
		frames: { ...regular.frames, V: undefined, WL: undefined },
		dual: undefined,
	}
	assert.equal(resolveFrameVariant(limited, 'V'), 'A')
	assert.equal(resolveFrameVariant(limited, 'WL'), 'L')
	assert.equal(resolveFrameVariant(limited, 'WU'), 'M')
})
