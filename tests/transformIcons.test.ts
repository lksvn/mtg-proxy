/// <reference types="node" />

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { TRANSFORM_ICONS, transformIconPath } from '../src/components/cardEditor/transformIcons.ts'
import { FRAME_FAMILIES } from '../src/components/cardEditor/frameFamilies.ts'

test('Transform icons exist and replace only the icon interior on either face', () => {
	assert.equal(transformIconPath(undefined), undefined)
	const borderlessFront = FRAME_FAMILIES['m15-transform-borderless-front'].layout.transformIcon!
	const borderlessBack = FRAME_FAMILIES['m15-transform-borderless-back'].layout.transformIcon!
	assert.equal(transformIconPath(undefined, borderlessFront.defaultIcon), transformIconPath('up'))
	assert.equal(transformIconPath(undefined, borderlessBack.defaultIcon), transformIconPath('down'))
	assert.equal(transformIconPath('sun', borderlessBack.defaultIcon), transformIconPath('sun'))
	for (const icon of TRANSFORM_ICONS) {
		assert.ok(existsSync(resolve('public', transformIconPath(icon.id)!)), icon.id)
	}
	const front = FRAME_FAMILIES['m15-transform-front'].layout
	const back = FRAME_FAMILIES['m15-transform-back'].layout
	assert.ok(front.transformIcon!.x + front.transformIcon!.width < front.title.x)
	assert.ok(back.title.x + back.title.maxWidth < back.transformIcon!.x)
	assert.equal(front.transformIcon!.y, back.transformIcon!.y)
	assert.equal(FRAME_FAMILIES['m15-regular'].layout.transformIcon, undefined)
})
