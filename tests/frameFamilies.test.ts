/// <reference types="node" />

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { futureManaFile } from '../src/components/cardEditor/render/drawManaCost.ts'
import {
	FRAME_FAMILIES,
	resolveFrameVariant,
	resolvePtTextColor,
	resolveTextColor,
	resolveTextX,
	resolveFooterX,
	type FrameFamily,
} from '../src/components/cardEditor/frameFamilies.ts'

test('frame family assets exist', () => {
	for (const family of Object.values(FRAME_FAMILIES)) {
		const paths = [
			...Object.values(family.frames),
			...Object.values(family.pt),
			...Object.values(family.typeIconMasks ?? {}),
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
	assert.equal(existsSync(resolve('public/img/frames/class/header.png')), true)
})

test('frame variants stay in the selected family and use declared fallbacks', () => {
	const regular = FRAME_FAMILIES['m15-regular']
	assert.equal(resolveFrameVariant(regular, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(regular, 'V'), 'V')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['class-regular'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-regular'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-nyx'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-universes-beyond'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-universes-beyond-regular'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-creature'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-creature-regular'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-creature-transform-front'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-creature-transform-back'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-creature-transform-front-ub'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-creature-transform-back-ub'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-transform'], 'WU'), 'WU')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['saga-lord-of-the-rings'], 'WU'), 'M')
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
	assert.equal(resolveTextColor({ font: '12px serif', color: '#fff', colorByVariant: { W: '#111' } }, 'W'), '#111')
	assert.equal(resolveTextColor({ font: '12px serif', color: '#fff', colorByVariant: { W: '#111' } }, 'B'), '#fff')
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
	const future = FRAME_FAMILIES['future-sight']
	assert.equal(resolveFrameVariant(future, 'WU'), 'M')
	assert.equal(resolveFrameVariant(future, 'WL'), 'L')
	assert.equal(resolveFrameVariant(future, 'V'), 'A')
	assert.equal(future.layout.mana.verticalPositions?.length, 6)
	assert.equal(resolveFooterX(future.layout, true), future.layout.footer.x)
	assert.equal(resolveFooterX(future.layout, false), future.layout.pt.x + future.layout.pt.width)
	assert.equal(resolveFooterX(seventh.layout, false), seventh.layout.footer.x)
	assert.equal(futureManaFile('2'), 'future/f2.png')
	assert.equal(futureManaFile('W/U'), 'future/fwu.png')
	assert.equal(futureManaFile('C'), undefined)
	const token = FRAME_FAMILIES['token-regular']
	assert.equal(resolveFrameVariant(token, 'C'), 'C')
	assert.equal(resolveFrameVariant(token, 'WU'), 'M')
	assert.equal(resolveFrameVariant(token, 'V'), 'A')
	assert.equal(token.layout.title.align, 'center')
	assert.equal(resolveTextX(token.layout.title), 752.5)
	const tallToken = FRAME_FAMILIES['token-tall']
	assert.equal(resolveFrameVariant(tallToken, 'C'), 'C')
	assert.equal(resolveFrameVariant(tallToken, 'WU'), 'M')
	assert.equal(tallToken.layout.rules.height, 585)
	const textlessToken = FRAME_FAMILIES['token-textless']
	assert.equal(resolveFrameVariant(textlessToken, 'C'), 'C')
	assert.equal(resolveFrameVariant(textlessToken, 'WU'), 'M')
	assert.equal(textlessToken.layout.rules.height, 0)
	const nyxToken = FRAME_FAMILIES['token-nyx']
	assert.equal(resolveFrameVariant(nyxToken, 'W'), 'W')
	assert.equal(resolveFrameVariant(nyxToken, 'C'), 'A')
	assert.equal(resolveFrameVariant(nyxToken, 'WU'), 'M')
	const nyxTextlessToken = FRAME_FAMILIES['token-nyx-textless']
	assert.equal(resolveFrameVariant(nyxTextlessToken, 'C'), 'A')
	assert.equal(resolveFrameVariant(nyxTextlessToken, 'WU'), 'M')
	assert.equal(nyxTextlessToken.layout.rules.height, 0)
	const oldToken = FRAME_FAMILIES['token-old']
	assert.equal(resolveFrameVariant(oldToken, 'C'), 'C')
	assert.equal(resolveFrameVariant(oldToken, 'WU'), 'M')
	assert.equal(resolveFrameVariant(oldToken, 'L'), 'M')
	assert.deepEqual(oldToken.pt, {})

	const borderlessToken = FRAME_FAMILIES['token-textless-borderless']
	assert.equal(resolveFrameVariant(borderlessToken, 'C'), 'C')
	assert.equal(resolveFrameVariant(borderlessToken, 'WU'), 'M')
	assert.equal(borderlessToken.layout.artwork.dragTop, 0)
	assert.equal(borderlessToken.layout.artwork.dragBottom, 2100)
	assert.equal(borderlessToken.layout.rules.height, 0)

	const shortToken = FRAME_FAMILIES['token-short']
	assert.equal(resolveFrameVariant(shortToken, 'C'), 'C')
	assert.equal(resolveFrameVariant(shortToken, 'WU'), 'M')
	assert.equal(shortToken.layout.artwork.dragBottom, 1940)
	assert.equal(shortToken.layout.rules.height, 371)

	const ungluedToken = FRAME_FAMILIES['token-unglued']
	assert.equal(resolveFrameVariant(ungluedToken, 'C'), 'A')
	assert.equal(resolveFrameVariant(ungluedToken, 'WU'), 'M')
	assert.equal(ungluedToken.layout.title.maxWidth, 0)
	assert.equal(ungluedToken.layout.rules.height, 0)
	assert.equal(ungluedToken.layout.symbol.boxSize, 0)
	assert.equal(ungluedToken.layout.pt.width, 0)
	assert.equal(ungluedToken.defaultBorderStyle, 'silver')
	assert.equal(ungluedToken.borderMask, 'img/frames/token/unglued/border.svg')

	const monarchToken = FRAME_FAMILIES['token-monarch']
	assert.equal(resolveFrameVariant(monarchToken, 'W'), 'C')
	assert.equal(monarchToken.layout.title.y, 1383)
	assert.equal(monarchToken.layout.type.maxWidth, 0)
	assert.equal(monarchToken.layout.pt.width, 0)

	const markerToken = FRAME_FAMILIES['token-marker']
	assert.equal(resolveFrameVariant(markerToken, 'G'), 'C')
	assert.equal(markerToken.layout.title.y, 1481)
	assert.equal(markerToken.layout.rules.color, '#fff')
	assert.equal(markerToken.layout.pt.width, 0)

	const initiativeToken = FRAME_FAMILIES['token-initiative']
	assert.equal(resolveFrameVariant(initiativeToken, 'U'), 'C')
	assert.equal(initiativeToken.layout.title.y, 1247)
	assert.equal(initiativeToken.layout.rules.height, 604)

	const dayNightToken = FRAME_FAMILIES['token-day-night']
	assert.equal(resolveFrameVariant(dayNightToken, 'R'), 'C')
	assert.equal(dayNightToken.layout.rules.horizontalAlign, undefined)
	assert.equal(dayNightToken.layout.flavorRules?.y, 266)
	assert.equal(dayNightToken.layout.symbol.boxSize, 0)
	assert.equal(dayNightToken.layout.footer.disclaimerAlign, 'right')

	const jumpstartToken = FRAME_FAMILIES['token-jumpstart']
	assert.equal(resolveFrameVariant(jumpstartToken, 'G'), 'C')
	assert.equal(jumpstartToken.layout.title.y, 1570)
	assert.equal(jumpstartToken.layout.rules.height, 0)
	assert.equal(jumpstartToken.layout.type.maxWidth, 0)
	assert.equal(jumpstartToken.layout.symbol.boxSize, 0)
	assert.equal(resolveTextX(FRAME_FAMILIES['m15-regular'].layout.title), 125)
	for (const token of ['W', 'U', 'B', 'R', 'G', '0', '20', 'X', 'W/U', 'R/G']) {
		assert.equal(existsSync(resolve('public/img/manaSymbols', futureManaFile(token)!)), true, token)
	}

	const limited: FrameFamily = {
		...regular,
		frames: { ...regular.frames, V: undefined, WL: undefined },
		dual: undefined,
	}
	assert.equal(resolveFrameVariant(limited, 'V'), 'A')
	assert.equal(resolveFrameVariant(limited, 'WL'), 'L')
	assert.equal(resolveFrameVariant(limited, 'WU'), 'M')
})
