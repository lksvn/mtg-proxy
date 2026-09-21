import { DUAL_FRAME_VARIANTS, type FrameVariant } from './types.ts'
import { FRAME_FAMILIES } from './frameFamilyRegistry.ts'

export { FRAME_FAMILIES } from './frameFamilyRegistry.ts'

export type FrameFamilyId = 'box-topper' | 'm15-regular' | 'm15-extended' | 'borderless'

type TextStyle = {
	font: string
	color: string
	shadowColor?: string
	shadowOffsetX?: number
	shadowOffsetY?: number
}

type TextBox = TextStyle & {
	x: number
	y: number
	maxWidth: number
}

export type FrameLayout = {
	artwork: { dragTop: number; dragBottom: number }
	title: TextBox
	mana: TextStyle & { right: number; centerY: number; symbolSize: number; gap: number }
	type: TextBox
	rules: {
		x: number
		y: number
		width: number
		height: number
		fontFamily: string
		italicFontFamily: string
		color: string
		strokeColor: string
		strokeWidth: number
		maxFontSize: number
		minFontSize: number
	}
	symbol: { centerX: number; centerY: number; boxSize: number }
	pt: TextStyle & {
		x: number
		y: number
		width: number
		height: number
		textX: number
		textY: number
	}
	footer: {
		x: number
		maxWidth: number
		metadataY: number
		metadata: TextStyle
		disclaimerY: number
		disclaimer: TextStyle
	}
}

export type FrameFamily = {
	id: FrameFamilyId
	frames: Partial<Record<FrameVariant, string>>
	pt: Partial<Record<FrameVariant, string>>
	fallbacks: Partial<Record<FrameVariant, FrameVariant>>
	dual?: {
		neutralVariant: FrameVariant
		rulesMask: string
		pinlineMask: string
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
