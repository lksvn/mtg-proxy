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
			...(family.borderMask ? [family.borderMask] : []),
			...(family.dualLandMask ? [family.dualLandMask] : []),
			...Object.values(family.dual ?? {}).filter((value) => typeof value === 'string' && value.includes('/')),
		]

		for (const path of paths) {
			assert.equal(existsSync(resolve('public', path)), true, `${family.id}: ${path}`)
		}
		for (const path of Object.values(family.manaSymbolOverrides ?? {})) {
			assert.equal(existsSync(resolve('public/img/manaSymbols', path)), true, `${family.id}: ${path}`)
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
	assert.equal(eighth.borderMask, 'img/frames/8th/border.png')
	const seventh = FRAME_FAMILIES['seventh-edition']
	assert.equal(resolveFrameVariant(seventh, 'WU'), 'M')
	assert.equal(resolveFrameVariant(seventh, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(seventh, 'ML'), 'L')
	assert.equal(resolveFrameVariant(seventh, 'V'), 'A')
	assert.deepEqual(seventh.pt, {})
	assert.equal(seventh.borderMask, 'img/frames/seventh/border.svg')
	assert.equal(seventh.layout.footer.align, 'center')
	assert.equal(seventh.layout.footer.x, 750)
	assert.equal(eighth.layout.footer.align, undefined)
	const oldFloating = FRAME_FAMILIES['old-floating']
	assert.equal(resolveFrameVariant(oldFloating, 'WU'), 'M')
	assert.equal(resolveFrameVariant(oldFloating, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(oldFloating, 'ML'), 'L')
	assert.equal(resolveFrameVariant(oldFloating, 'V'), 'A')
	assert.equal(oldFloating.layout.rules, seventh.layout.rules)
	const abu = FRAME_FAMILIES.abu
	assert.equal(resolveFrameVariant(abu, 'B'), 'B')
	assert.equal(resolveFrameVariant(abu, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(abu, 'WU'), 'A')
	assert.equal(resolveFrameVariant(abu, 'M'), 'A')
	assert.equal(resolveFrameVariant(abu, 'ML'), 'L')
	assert.equal(resolveFrameVariant(abu, 'V'), 'A')
	assert.equal(abu.manaSymbolOverrides?.['b.svg'], 'old/oldb.svg')
	assert.equal(abu.manaSymbolOverrides?.['t.svg'], undefined)
	assert.match(abu.layout.type.font, /mplantin/)
	const revised = FRAME_FAMILIES.revised
	assert.equal(revised.defaultBorderStyle, 'white')
	assert.equal(revised.manaSymbolOverrides?.['b.svg'], 'old/oldb.svg')
	assert.equal(revised.manaSymbolOverrides?.['t.svg'], 'originaltap.svg')
	assert.equal(resolveFrameVariant(revised, 'WU'), 'A')
	assert.equal(resolveFrameVariant(revised, 'WL'), 'WL')
	const fourth = FRAME_FAMILIES['fourth-era']
	assert.equal(fourth.baseBorderStyle, 'white')
	assert.equal(fourth.defaultBorderStyle, 'white')
	assert.equal(fourth.manaSymbolOverrides?.['t.svg'], 'oldtap.svg')
	assert.equal(resolveFrameVariant(fourth, 'WU'), 'M')
	assert.equal(resolveFrameVariant(fourth, 'WL'), 'L')
	assert.equal(resolveFrameVariant(fourth, 'V'), 'A')
	const colorshifted = FRAME_FAMILIES.colorshifted
	assert.equal(resolveFrameVariant(colorshifted, 'B'), 'B')
	assert.equal(resolveFrameVariant(colorshifted, 'WU'), 'W')
	assert.equal(resolveFrameVariant(colorshifted, 'A'), 'W')
	assert.equal(resolveFrameVariant(colorshifted, 'GL'), 'W')
	assert.equal(colorshifted.dual, undefined)
	const classicshifted = FRAME_FAMILIES.classicshifted
	assert.equal(resolveFrameVariant(classicshifted, 'B'), 'B')
	assert.equal(resolveFrameVariant(classicshifted, 'WU'), 'M')
	assert.equal(resolveFrameVariant(classicshifted, 'WL'), 'WL')
	assert.equal(resolveFrameVariant(classicshifted, 'ML'), 'L')
	assert.equal(resolveFrameVariant(classicshifted, 'V'), 'A')

	const limited: FrameFamily = {
		...regular,
		frames: { ...regular.frames, V: undefined, WL: undefined },
		dual: undefined,
	}
	assert.equal(resolveFrameVariant(limited, 'V'), 'A')
	assert.equal(resolveFrameVariant(limited, 'WL'), 'L')
	assert.equal(resolveFrameVariant(limited, 'WU'), 'M')
})
