import { DUAL_FRAME_VARIANTS, type FrameVariant } from './types.ts'
import { FRAME_FAMILIES } from './frameFamilyRegistry.ts'

export { FRAME_FAMILIES } from './frameFamilyRegistry.ts'

type ClassFrameFamilyId = 'class-regular' | 'class-nyx' | 'class-universes-beyond' | 'class-universes-beyond-nyx' | 'case-regular' | 'case-nyx' | 'case-universes-beyond'
export type FrameFamilyId = ClassFrameFamilyId | 'saga-regular' | 'saga-nyx' | 'saga-universes-beyond' | 'saga-universes-beyond-regular' | 'saga-creature' | 'saga-creature-regular' | 'saga-creature-transform-front' | 'saga-creature-transform-back' | 'saga-creature-transform-front-ub' | 'saga-creature-transform-back-ub' | 'saga-transform' | 'saga-lord-of-the-rings' | 'battle-regular' | 'planeswalker-regular' | 'planeswalker-transform-front' | 'planeswalker-transform-back' | 'planeswalker-mdfc-back' | 'planeswalker-borderless' | 'planeswalker-box-topper' | 'planeswalker-compleated' | 'planeswalker-double-feature' | 'planeswalker-tall-double-feature' | 'planeswalker-transform-front-double-feature' | 'planeswalker-transform-back-double-feature' | 'planeswalker-sdcc15' | 'planeswalker-sdcc15-transform' | 'planeswalker-nickname' | 'planeswalker-seventh' | 'planeswalker-tall' | 'planeswalker-tall-borderless' | 'box-topper' | 'm15-regular' | 'm15-extended' | 'snow' | 'nyx' | 'universes-beyond' | 'borderless' | 'promo-regular' | 'eighth-edition' | 'seventh-edition' | 'old-floating' | 'abu' | 'revised' | 'fourth-era' | 'colorshifted' | 'classicshifted' | 'future-sight' | 'token-regular' | 'token-tall' | 'token-short' | 'token-textless' | 'token-textless-borderless' | 'token-nyx' | 'token-nyx-textless' | 'token-old' | 'token-unglued' | 'token-monarch' | 'token-marker' | 'token-initiative' | 'token-day-night' | 'token-jumpstart'
export type FrameBorderStyle = 'black' | 'white' | 'silver' | 'gold'

type TextStyle = {
	font: string
	color: string
	colorByVariant?: Partial<Record<FrameVariant, string>>
	shadowColor?: string
	shadowOffsetX?: number
	shadowOffsetY?: number
}

type TextBox = TextStyle & {
	x: number
	y: number
	maxWidth: number
	align?: CanvasTextAlign
}

type RulesBox = {
	x: number
	y: number
	width: number
	height: number
	verticalAlign?: 'top' | 'middle'
	horizontalAlign?: 'left' | 'center'
	fontFamily: string
	italicFontFamily: string
	color: string
	strokeColor: string
	strokeWidth: number
	maxFontSize: number
	minFontSize: number
}

type SagaLayout = {
	reminder: { x: number; y: number; width: number; height: number }
	abilities: { x: number; y: number; width: number; height: number }
	creatureRules?: { x: number; y: number; width: number; height: number }
	chapter: {
		x: number
		width: number
		height: number
		gap: number
		dividerX: number
		dividerWidth: number
		dividerHeight: number
		dividerOffsetY: number
		textInsetX: number
		textInsetY: number
	}
	reversePt?: TextStyle & {
		x: number
		y: number
		width: number
		height: number
		textX: number
		textY: number
	}
}

type ClassLayout = {
	levels: { x: number; y: number; width: number; height: number }
	header: { x: number; width: number; height: number }
}

type CaseLayout = {
	sections: { x: number; y: number; width: number; height: number }
}

export type FrameLayout = {
	canvas?: { width: number; height: number; rotation: 'counterclockwise' }
	artwork: { dragLeft: number; dragTop: number; dragRight: number; dragBottom: number }
	title: TextBox
	mana: TextStyle & { right: number; centerY: number; symbolSize: number; gap: number; verticalPositions?: readonly (readonly [number, number])[] }
	type: TextBox
	rules: RulesBox
	flavorRules?: RulesBox
	saga?: SagaLayout
	class?: ClassLayout
	case?: CaseLayout
	symbol: { centerX: number; centerY: number; boxSize: number }
	colorIndicator?: { x: number; y: number; width: number; height: number; centerX: number; centerY: number; radius: number }
	pt: TextStyle & {
		x: number
		y: number
		width: number
		height: number
		textX: number
		textY: number
	}
	footer: {
		unrotated?: boolean
		colorByVariant?: Partial<Record<FrameVariant, string>>
		disclaimerColorByVariant?: Partial<Record<FrameVariant, string>>
		align?: CanvasTextAlign
		x: number
		maxWidth: number
		metadataY: number
		metadata: TextStyle
		disclaimerY: number
		disclaimerX?: number
		disclaimerAlign?: CanvasTextAlign
		disclaimer: TextStyle
	}
}

export type FrameFamily = {
	id: FrameFamilyId
	overlay?: { path: string; x: number; y: number; width: number; height: number }
	frameOverlays?: Partial<Record<FrameVariant, {
		path: string
		crops?: { x: number; y: number; width: number; height: number }[]
		bounds?: { x: number; y: number; width: number; height: number }
	}>>
	borderMask?: string
	baseBorderStyle?: 'black' | 'white'
	defaultBorderStyle?: FrameBorderStyle
	dualLandMask?: string
	manaSymbolOverrides?: Record<string, string>
	typeIconMasks?: Partial<Record<'creature' | 'instant' | 'sorcery' | 'enchantment' | 'artifact' | 'land' | 'multi', string>>
	frames: Partial<Record<FrameVariant, string>>
	pt: Partial<Record<FrameVariant, string>>
	fallbacks: Partial<Record<FrameVariant, FrameVariant>>
	dual?: {
		neutralVariant: FrameVariant
		rulesMask: string
		rightRulesMask?: string
		pinlineMask: string
		rightPinlineMask?: string
		titleMask: string
		typeMask: string
		frameMask: string
		rightHalfMask: string
	}
	layout: FrameLayout
	fonts: string[]
}

export function getFrameFamily(id: FrameFamilyId) {
	return FRAME_FAMILIES[id]
}

export function resolveFrameVariant(family: FrameFamily, requested: FrameVariant): FrameVariant {
	if (family.frames[requested]) return requested
	if (DUAL_FRAME_VARIANTS.includes(requested as never) && family.dual) return requested

	const fallback = family.fallbacks[requested]
	if (fallback && family.frames[fallback]) return fallback

	return family.frames.C ? 'C' : Object.keys(family.frames)[0] as FrameVariant
}

export function resolvePtVariant(variant: FrameVariant, hybrid: boolean): FrameVariant {
	if (hybrid) return 'C'
	if (DUAL_FRAME_VARIANTS.includes(variant as never)) return 'M'
	if (variant === 'L') return 'C'
	if (variant.endsWith('L')) return variant[0] as FrameVariant
	return variant
}

export function resolvePtTextColor(variant: FrameVariant, defaultColor: string) {
	return variant === 'V' ? '#fff' : defaultColor
}

export function resolveTextColor(style: TextStyle, variant: FrameVariant) {
	return style.colorByVariant?.[variant] ?? style.color
}

export function resolveTextX(box: TextBox) {
	return box.align === 'center' ? box.x + box.maxWidth / 2 : box.x
}

export function resolveFooterX(layout: FrameLayout, hasPt: boolean) {
	return !hasPt && layout.footer.align === 'right'
		? layout.pt.x + layout.pt.width
		: layout.footer.x
}
