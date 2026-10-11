/// <reference types="node" />

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { futureManaFile } from '../src/components/cardEditor/render/drawManaCost.ts'
import { getDebugRegions } from '../src/components/cardEditor/render/getDebugRegions.ts'
import {
	FRAME_FAMILIES,
	resolveFrameVariant,
	resolvePtTextColor,
	resolveTextColor,
	resolveTextX,
	resolveFooterX,
	type FrameFamily,
} from '../src/components/cardEditor/frameFamilies.ts'

test('borderless transform faces use full artwork and face-specific geometry', () => {
	const front = FRAME_FAMILIES['m15-transform-borderless-front']
	const back = FRAME_FAMILIES['m15-transform-borderless-back']
	for (const family of [front, back]) {
		assert.equal(family.layout.artwork.dragLeft, 0)
		assert.equal(family.layout.artwork.dragTop, 0)
		assert.equal(family.layout.artwork.dragRight, 1500)
		assert.equal(family.layout.artwork.dragBottom, 1937)
		assert.equal(family.layout.transformIcon?.x, 89)
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
		assert.equal(resolveFrameVariant(family, 'C'), 'A')
	}
	assert.equal(resolveFrameVariant(front, 'UL'), 'L')
	assert.equal(resolveFrameVariant(back, 'UL'), 'M')
	assert.equal(front.layout.reversePowerToughness?.color, '#666')
	assert.equal(back.layout.reversePowerToughness, undefined)
	assert.equal(back.layout.showManaCost, false)
	assert.equal(back.layout.rules.color, '#fff')
	assert.equal(back.layout.colorIndicator?.centerX, 150)
	assert.equal(back.dual?.neutralVariant, 'A')
})

test('extended transform faces keep artwork in the wide window', () => {
	for (const id of ['m15-transform-extended-front', 'm15-transform-extended-back'] as const) {
		const family = FRAME_FAMILIES[id]
		assert.deepEqual(family.layout.artwork, { dragLeft: 0, dragTop: 170, dragRight: 1500, dragBottom: 1285 })
		assert.equal(resolveFrameVariant(family, 'UL'), 'L')
		assert.equal(resolveFrameVariant(family, 'C'), 'A')
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
		assert.equal(family.layout.type.color, '#fff')
		assert.equal(family.layout.rules.color, '#111')
		assert.equal(family.dual?.neutralVariant, 'L')
	}
	assert.equal(FRAME_FAMILIES['m15-transform-extended-front'].layout.transformIcon?.defaultIcon, 'up')
	assert.equal(FRAME_FAMILIES['m15-transform-extended-back'].layout.transformIcon?.defaultIcon, 'down')
	assert.equal(FRAME_FAMILIES['m15-transform-extended-back'].layout.showManaCost, false)
})

test('Double Feature transform shares frames but keeps face details separate', () => {
	const front = FRAME_FAMILIES['m15-transform-double-feature-front']
	const back = FRAME_FAMILIES['m15-transform-double-feature-back']
	assert.deepEqual(front.frames, back.frames)
	for (const family of [front, back]) {
		assert.deepEqual(family.layout.artwork, { dragLeft: 116, dragTop: 238, dragRight: 1384, dragBottom: 1165 })
		assert.equal(family.layout.rules.color, '#fff')
		assert.equal(family.layout.pt.color, '#fff')
		assert.equal(resolveFrameVariant(family, 'UL'), 'L')
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
	}
	assert.equal(front.layout.transformIcon?.defaultIcon, 'sun')
	assert.equal(back.layout.transformIcon?.defaultIcon, 'moon')
	assert.ok(front.layout.reversePowerToughness)
	assert.equal(back.layout.reversePowerToughness, undefined)
	assert.equal(back.layout.showManaCost, false)
	assert.ok(back.layout.colorIndicator)
})

test('original transform back uses the left icon without changing the modern back', () => {
	const original = FRAME_FAMILIES['m15-transform-original-back']
	assert.equal(original.layout.transformIcon?.x, 89)
	assert.equal(original.layout.transformIcon?.defaultIcon, 'moon')
	assert.equal(original.layout.title.x, 240)
	assert.equal(original.layout.showManaCost, false)
	assert.equal(resolveFrameVariant(original, 'UL'), 'L')
	assert.equal(resolveFrameVariant(original, 'C'), 'A')
	assert.equal(resolveFrameVariant(original, 'V'), 'V')
	assert.equal(FRAME_FAMILIES['m15-transform-back'].layout.transformIcon?.x, 1296)
})

test('original Nyx transform back keeps fallbacks in its enchantment frames', () => {
	const family = FRAME_FAMILIES['m15-transform-nyx-original-back']
	assert.equal(family.layout.transformIcon?.x, 89)
	assert.equal(family.layout.transformIcon?.defaultIcon, 'moon')
	assert.equal(family.layout.showManaCost, false)
	assert.equal(resolveFrameVariant(family, 'C'), 'A')
	assert.equal(resolveFrameVariant(family, 'V'), 'A')
	assert.equal(resolveFrameVariant(family, 'UL'), 'M')
	assert.equal(resolveFrameVariant(family, 'WU'), 'WU')
	assert.equal(family.dual?.neutralVariant, 'A')
})

test('original Snow transform back uses readable text on pale panels', () => {
	const family = FRAME_FAMILIES['m15-transform-snow-original-back']
	assert.equal(family.layout.transformIcon?.x, 89)
	assert.equal(family.layout.transformIcon?.defaultIcon, 'moon')
	assert.equal(family.layout.title.color, '#111')
	assert.equal(family.layout.type.color, '#111')
	assert.equal(family.layout.pt.color, '#fff')
	assert.equal(family.layout.showManaCost, false)
	assert.equal(resolveFrameVariant(family, 'C'), 'A')
	assert.equal(resolveFrameVariant(family, 'V'), 'A')
	assert.equal(resolveFrameVariant(family, 'UL'), 'L')
	assert.equal(family.dual?.neutralVariant, 'L')
})

test('original UB transform back preserves vehicles and falls back for missing colorless', () => {
	const family = FRAME_FAMILIES['m15-transform-ub-original-back']
	assert.equal(family.layout.transformIcon?.x, 89)
	assert.equal(family.layout.transformIcon?.defaultIcon, 'down')
	assert.equal(family.layout.showManaCost, false)
	assert.equal(resolveFrameVariant(family, 'C'), 'A')
	assert.equal(resolveFrameVariant(family, 'V'), 'V')
	assert.equal(resolveFrameVariant(family, 'UL'), 'L')
	assert.ok(family.pt.U?.includes('/ub-back/pt/'))
})

test('regular Double Feature keeps colored lands and omits transform-only details', () => {
	const family = FRAME_FAMILIES['m15-double-feature']
	assert.equal(resolveFrameVariant(family, 'UL'), 'UL')
	assert.equal(resolveFrameVariant(family, 'C'), 'A')
	assert.equal(resolveFrameVariant(family, 'V'), 'A')
	assert.equal(family.layout.transformIcon, undefined)
	assert.equal(family.layout.reversePowerToughness, undefined)
	assert.equal(family.layout.title.x, 125)
	assert.equal(family.layout.rules.color, '#fff')
	assert.equal(family.layout.artwork.dragBottom, 1165)
})

test('Neon Ink uses full artwork and keeps its P/T overlay separate from the text box', () => {
	const family = FRAME_FAMILIES['neon-ink']
	assert.equal(family.layout.artwork.dragBottom, 2100)
	assert.equal(family.layout.artwork.dragTop, 0)
	assert.ok(family.layout.rules.y + family.layout.rules.height < family.layout.type.y)
	assert.equal(family.layout.rules.color, '#fff')
	assert.deepEqual(family.layout.pt.backgroundBounds, { x: 0, y: 0, width: 1500, height: 2100 })
	assert.equal(family.layout.pt.width, 260)
	assert.equal(resolveFrameVariant(family, 'WU'), 'M')
	assert.equal(resolveFrameVariant(family, 'UL'), 'L')
	assert.equal(FRAME_FAMILIES['m15-regular'].layout.pt.backgroundBounds, undefined)
})

test('regular modal faces keep mana costs and reserve the opposite-face strip', () => {
	const front = FRAME_FAMILIES['m15-modal-front']
	const back = FRAME_FAMILIES['m15-modal-back']
	for (const family of [front, back]) {
		assert.notEqual(family.layout.showManaCost, false)
		assert.ok(family.layout.rules.y + family.layout.rules.height < family.layout.reverseFace!.y)
		assert.equal(family.layout.transformIcon, undefined)
		assert.equal(resolveFrameVariant(family, 'UL'), 'UL')
		assert.ok(getDebugRegions(family).some(region => region.label === 'Opposite face strip'))
	}
	assert.equal(front.layout.reverseFace?.color, '#fff')
	assert.equal(back.layout.reverseFace?.color, '#111')
	assert.equal(back.layout.title.color, '#fff')
})

test('Nyx modal faces reuse the strip and keep fallbacks in Nyx', () => {
	for (const id of ['m15-modal-nyx-front', 'm15-modal-nyx-back'] as const) {
		const family = FRAME_FAMILIES[id]
		assert.ok(family.layout.reverseFace)
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
		assert.equal(resolveFrameVariant(family, 'UL'), 'M')
		assert.equal(resolveFrameVariant(family, 'L'), 'M')
		assert.equal(resolveFrameVariant(family, 'C'), 'C')
		assert.equal(family.dual?.neutralVariant, 'C')
	}
})

test('Snow modal faces retain colored lands and readable pale-panel text', () => {
	for (const id of ['m15-modal-snow-front', 'm15-modal-snow-back'] as const) {
		const family = FRAME_FAMILIES[id]
		assert.ok(family.layout.reverseFace)
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
		assert.equal(resolveFrameVariant(family, 'C'), 'A')
		assert.equal(resolveFrameVariant(family, 'UL'), 'UL')
		assert.equal(family.layout.title.color, '#111')
		assert.equal(family.layout.type.color, '#111')
	}
	assert.equal(FRAME_FAMILIES['m15-modal-snow-back'].layout.pt.color, '#fff')
})

test('UB modal faces use UB power/toughness and retain colored lands', () => {
	const front = FRAME_FAMILIES['m15-modal-ub-front']
	const back = FRAME_FAMILIES['m15-modal-ub-back']
	for (const family of [front, back]) {
		assert.ok(family.layout.reverseFace)
		assert.equal(resolveFrameVariant(family, 'UL'), 'UL')
		assert.equal(resolveFrameVariant(family, 'V'), 'V')
		assert.equal(resolveFrameVariant(family, 'C'), 'C')
	}
	assert.ok(front.pt.U?.includes('/ub/pt/'))
	assert.ok(back.pt.U?.includes('/ub-back/pt/'))
	assert.equal(front.layout.reverseFace?.color, '#fff')
	assert.equal(back.layout.reverseFace?.color, '#111')
})

test('UB Nyx modal faces keep fallbacks in their enchantment frames', () => {
	const front = FRAME_FAMILIES['m15-modal-ub-nyx-front']
	const back = FRAME_FAMILIES['m15-modal-ub-nyx-back']
	for (const family of [front, back]) {
		assert.ok(family.layout.reverseFace)
		assert.equal(resolveFrameVariant(family, 'UL'), 'M')
		assert.equal(resolveFrameVariant(family, 'L'), 'M')
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
		assert.equal(resolveFrameVariant(family, 'C'), 'C')
		assert.equal(family.dual?.neutralVariant, 'C')
	}
	assert.ok(front.pt.U?.includes('/ub/pt/'))
	assert.ok(back.pt.U?.includes('/ub-back/pt/'))
})

test('extended modal faces retain wide artwork, the strip, and regular P/T', () => {
	for (const id of ['m15-modal-extended-front', 'm15-modal-extended-back'] as const) {
		const family = FRAME_FAMILIES[id]
		assert.deepEqual(family.layout.artwork, { dragLeft: 0, dragTop: 170, dragRight: 1500, dragBottom: 1285 })
		assert.ok(family.layout.reverseFace)
		assert.equal(family.layout.type.color, '#fff')
		assert.equal(family.layout.pt.color, '#111')
		assert.equal(family.pt.U, FRAME_FAMILIES['m15-regular'].pt.U)
		assert.equal(resolveFrameVariant(family, 'UL'), 'L')
		assert.equal(resolveFrameVariant(family, 'C'), 'A')
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
	}
})

test('borderless modal faces reserve the strip and keep artwork dragging full width', () => {
	for (const id of ['m15-modal-borderless-front', 'm15-modal-borderless-back'] as const) {
		const family = FRAME_FAMILIES[id]
		assert.deepEqual(family.layout.artwork, { dragLeft: 0, dragTop: 0, dragRight: 1500, dragBottom: 1937 })
		assert.ok(family.layout.reverseFace)
		assert.equal(resolveFrameVariant(family, 'UL'), 'M')
		assert.equal(resolveFrameVariant(family, 'L'), 'M')
		assert.equal(resolveFrameVariant(family, 'V'), 'A')
		assert.equal(family.pt.U, FRAME_FAMILIES['m15-regular'].pt.U)
	}
	assert.equal(FRAME_FAMILIES['m15-modal-borderless-front'].layout.rules.color, '#111')
	assert.equal(FRAME_FAMILIES['m15-modal-borderless-back'].layout.rules.color, '#fff')
})

test('Kaldheim showcase uses its own geometry and same-family fallbacks', () => {
	const family = FRAME_FAMILIES['kaldheim-showcase']
	assert.deepEqual(family.layout.artwork, { dragLeft: 157, dragTop: 243, dragRight: 1343, dragBottom: 1213 })
	assert.equal(family.layout.symbol.centerY, 1277)
	assert.equal(family.layout.title.color, '#fff')
	assert.ok(family.pt.U?.includes('/kaldheim/'))
	assert.equal(resolveFrameVariant(family, 'L'), 'M')
	assert.equal(resolveFrameVariant(family, 'V'), 'A')
	assert.equal(resolveFrameVariant(family, 'C'), 'A')
})

test('Kaldheim modal faces reserve the strip and load matching face overlays', () => {
	for (const face of ['front', 'back'] as const) {
		const family = FRAME_FAMILIES[`kaldheim-modal-${face}`]
		const overlays = family.faceOverlays!
		assert.ok(overlays.icons.U?.endsWith(face === 'front' ? 'uft.png' : 'ubt.png'))
		assert.ok(overlays.reminders.U?.endsWith(face === 'front' ? 'ufb.png' : 'ubb.png'))
		assert.ok(family.layout.rules.y + family.layout.rules.height < overlays.reminderBounds.y)
		assert.ok(family.layout.title.x > overlays.iconBounds.x + overlays.iconBounds.width)
		assert.ok(getDebugRegions(family).some(region => region.label === 'Modal face icon'))
		assert.equal(family.layout.reverseFace?.color, face === 'front' ? '#fff' : '#111')
		for (const path of [...Object.values(overlays.icons), ...Object.values(overlays.reminders)]) {
			assert.equal(existsSync(resolve('public', path)), true, path)
		}
	}
})

test('Zendikar Rising showcase keeps wide artwork and white text', () => {
	const family = FRAME_FAMILIES['zendikar-rising-showcase']
	assert.deepEqual(family.layout.artwork, { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1876 })
	assert.equal(family.layout.title.color, '#fff')
	assert.equal(family.layout.rules.color, '#fff')
	assert.equal(family.layout.pt.color, '#fff')
	assert.equal(resolveFrameVariant(family, 'UL'), 'L')
	assert.equal(resolveFrameVariant(family, 'V'), 'A')
	assert.equal(resolveFrameVariant(family, 'C'), 'C')
	assert.ok(family.pt.U?.includes('/zendikar-rising/'))
})

test('Commander Legends etched retains readable text and same-family fallbacks', () => {
	const family = FRAME_FAMILIES['commander-legends-etched']
	assert.equal(family.layout.rules.x, 139)
	assert.equal(family.layout.rules.width, 1222)
	assert.equal(family.layout.rules.color, '#fff')
	assert.equal(family.layout.pt.color, '#fff')
	assert.equal(family.dual?.neutralVariant, 'C')
	assert.equal(resolveFrameVariant(family, 'L'), 'C')
	assert.equal(resolveFrameVariant(family, 'UL'), 'C')
	assert.equal(resolveFrameVariant(family, 'V'), 'A')
	assert.ok(family.pt.U?.includes('/commander-legends/'))
})

test('Mystical Archive uses wide artwork and bundled outline symbols', () => {
	const family = FRAME_FAMILIES['mystical-archive']
	assert.equal(family.layout.mana.shadowColor, 'transparent')
	assert.equal(family.layout.mana.shadowOffsetX, 0)
	assert.equal(family.layout.mana.shadowOffsetY, 0)
	assert.equal(family.layout.artwork.dragTop, 253)
	assert.equal(family.layout.artwork.dragRight, 1500)
	assert.equal(resolveFrameVariant(family, 'WU'), 'M')
	assert.equal(resolveFrameVariant(family, 'L'), 'C')
	for (const path of Object.values(family.manaSymbolOverrides ?? {})) {
		assert.equal(existsSync(resolve('public/img/manaSymbols', path)), true, path)
	}
})

test('Japanese Mystical Archive reserves its vertical title and custom mana symbols', () => {
	const family = FRAME_FAMILIES['mystical-archive-japanese']
	assert.equal(family.layout.title.verticalHeight, 238)
	assert.equal(family.layout.title.font, '40px belerenb, serif')
	assert.equal(family.layout.type.font, '54px belerenb, serif')
	assert.equal(family.layout.type.align, 'center')
	assert.equal(resolveFrameVariant(family, 'C'), 'L')
	assert.equal(resolveFrameVariant(family, 'WU'), 'M')
	for (const path of Object.values(family.manaSymbolOverrides ?? {})) {
		assert.equal(existsSync(resolve('public/img/manaSymbols', path)), true, path)
	}
})

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
	for (const side of ['front', 'back'] as const) {
		const ubNyx = FRAME_FAMILIES[`m15-transform-ub-nyx-${side}`]
		const ub = FRAME_FAMILIES[`m15-transform-ub-${side}`]
		assert.equal(resolveFrameVariant(ubNyx, 'WU'), 'WU')
		assert.equal(resolveFrameVariant(ubNyx, 'V'), 'A')
		assert.equal(resolveFrameVariant(ubNyx, 'C'), 'C')
		assert.equal(resolveFrameVariant(ubNyx, 'WL'), 'M')
		assert.equal(ubNyx.dual?.neutralVariant, 'C')
		assert.deepEqual(ubNyx.layout, ub.layout)
		assert.deepEqual(ubNyx.pt, ub.pt)
	}
	const nyxFront = FRAME_FAMILIES['m15-transform-nyx-front']
	assert.equal(resolveFrameVariant(nyxFront, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(nyxFront, 'V'), 'A')
	assert.equal(resolveFrameVariant(nyxFront, 'L'), 'M')
	assert.equal(resolveFrameVariant(nyxFront, 'WL'), 'M')
	assert.equal(nyxFront.dual?.neutralVariant, 'C')
	assert.deepEqual(nyxFront.layout, FRAME_FAMILIES['m15-transform-front'].layout)
	const transformBack = FRAME_FAMILIES['m15-transform-back']
	const ubBack = FRAME_FAMILIES['m15-transform-ub-back']
	assert.equal(resolveFrameVariant(ubBack, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(ubBack, 'V'), 'V')
	assert.equal(resolveFrameVariant(ubBack, 'C'), 'C')
	assert.equal(resolveFrameVariant(ubBack, 'WL'), 'L')
	assert.deepEqual(ubBack.layout, transformBack.layout)
	assert.equal(ubBack.pt.C, ubBack.pt.A)
	assert.ok(ubBack.pt.V!.includes('/ub-back/pt/'))
	const snowBack = FRAME_FAMILIES['m15-transform-snow-back']
	assert.equal(resolveFrameVariant(snowBack, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(snowBack, 'V'), 'A')
	assert.equal(resolveFrameVariant(snowBack, 'C'), 'A')
	assert.equal(resolveFrameVariant(snowBack, 'WL'), 'L')
	assert.equal(snowBack.dual?.neutralVariant, 'L')
	assert.deepEqual(snowBack.layout.artwork, transformBack.layout.artwork)
	assert.deepEqual(snowBack.layout.transformIcon, transformBack.layout.transformIcon)
	assert.equal(snowBack.layout.title.color, '#111')
	assert.equal(snowBack.layout.type.color, '#111')
	assert.equal(snowBack.layout.showManaCost, false)
	assert.deepEqual(snowBack.pt, transformBack.pt)
	const nyxBack = FRAME_FAMILIES['m15-transform-nyx-back']
	assert.equal(resolveFrameVariant(nyxBack, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(nyxBack, 'V'), 'A')
	assert.equal(resolveFrameVariant(nyxBack, 'L'), 'M')
	assert.equal(resolveFrameVariant(nyxBack, 'WL'), 'M')
	assert.equal(nyxBack.dual?.neutralVariant, 'C')
	assert.deepEqual(nyxBack.layout, transformBack.layout)
	assert.deepEqual(nyxBack.pt, transformBack.pt)
	assert.equal(resolveFrameVariant(transformBack, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(transformBack, 'C'), 'C')
	assert.equal(resolveFrameVariant(transformBack, 'WL'), 'WL')
	assert.equal(transformBack.layout.showManaCost, false)
	assert.equal(getDebugRegions(transformBack).some(region => region.label === 'Mana'), false)
	assert.equal(transformBack.layout.title.color, '#fff')
	assert.equal(transformBack.layout.type.color, '#fff')
	assert.equal(transformBack.layout.pt.color, '#fff')
	assert.equal(transformBack.layout.reversePowerToughness, undefined)
	assert.ok(transformBack.layout.type.x > transformBack.layout.colorIndicator!.x + transformBack.layout.colorIndicator!.width)
	assert.equal(transformBack.pt.C, transformBack.pt.A)
	assert.deepEqual(transformBack.layout.artwork, FRAME_FAMILIES['m15-regular'].layout.artwork)
	const transformFront = FRAME_FAMILIES['m15-transform-front']
	const ubFront = FRAME_FAMILIES['m15-transform-ub-front']
	assert.equal(resolveFrameVariant(ubFront, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(ubFront, 'V'), 'V')
	assert.equal(resolveFrameVariant(ubFront, 'C'), 'C')
	assert.equal(resolveFrameVariant(ubFront, 'WL'), 'WL')
	assert.deepEqual(ubFront.layout, transformFront.layout)
	assert.deepEqual(ubFront.pt, FRAME_FAMILIES['universes-beyond'].pt)
	const snowFront = FRAME_FAMILIES['m15-transform-snow-front']
	assert.equal(resolveFrameVariant(snowFront, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(snowFront, 'V'), 'A')
	assert.equal(resolveFrameVariant(snowFront, 'C'), 'A')
	assert.equal(resolveFrameVariant(snowFront, 'WL'), 'WL')
	assert.equal(snowFront.dual?.neutralVariant, 'L')
	assert.deepEqual(snowFront.layout, transformFront.layout)
	assert.equal(resolveFrameVariant(transformFront, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(transformFront, 'V'), 'V')
	assert.equal(resolveFrameVariant(transformFront, 'WL'), 'WL')
	assert.equal(transformFront.layout.title.x, 240)
	assert.equal(transformFront.layout.reversePowerToughness?.align, 'right')
	assert.ok(transformFront.layout.reversePowerToughness!.y < transformFront.layout.pt.y)
	assert.equal(FRAME_FAMILIES['m15-regular'].layout.reversePowerToughness, undefined)
	assert.deepEqual(transformFront.layout.artwork, FRAME_FAMILIES['m15-regular'].layout.artwork)
	const regular = FRAME_FAMILIES['m15-regular']
	assert.equal(resolveFrameVariant(regular, 'WU'), 'WU')
	assert.equal(resolveFrameVariant(regular, 'V'), 'V')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['class-regular'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['class-nyx'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['class-universes-beyond'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['class-universes-beyond-nyx'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['case-regular'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['case-nyx'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['case-universes-beyond'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['case-universes-beyond-nyx'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['room-regular'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['adventure-regular'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['adventure-nyx'], 'WU'), 'M')
	assert.equal(resolveFrameVariant(FRAME_FAMILIES['leveler-regular'], 'WU'), 'M')
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
