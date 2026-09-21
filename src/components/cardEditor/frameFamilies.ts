import { DUAL_FRAME_VARIANTS, type FrameVariant } from './types.ts'

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

const commonFonts = [
	'70px belerenb',
	'70px belerenbsc',
	'64px mplantin',
	'64px mplantini',
]

const commonFallbacks: Partial<Record<FrameVariant, FrameVariant>> = {
	V: 'A',
	WL: 'L',
	UL: 'L',
	BL: 'L',
	RL: 'L',
	GL: 'L',
	ML: 'L',
	WU: 'M',
	WB: 'M',
	UB: 'M',
	UR: 'M',
	BR: 'M',
	BG: 'M',
	RG: 'M',
	RW: 'M',
	GW: 'M',
	GU: 'M',
}

export const FRAME_FAMILIES: Record<FrameFamilyId, FrameFamily> = {
	'box-topper': {
		id: 'box-topper',
		frames: {
			W: 'img/frames/m15/boxTopper/m15BoxTopperFrameW.png',
			U: 'img/frames/m15/boxTopper/m15BoxTopperFrameU.png',
			B: 'img/frames/m15/boxTopper/m15BoxTopperFrameB.png',
			R: 'img/frames/m15/boxTopper/m15BoxTopperFrameR.png',
			G: 'img/frames/m15/boxTopper/m15BoxTopperFrameG.png',
			M: 'img/frames/m15/boxTopper/m15BoxTopperFrameM.png',
			A: 'img/frames/m15/boxTopper/m15BoxTopperFrameA.png',
			C: 'img/frames/m15/boxTopper/c.png',
			L: 'img/frames/m15/boxTopper/m15BoxTopperFrameL.png',
			WL: 'img/frames/m15/boxTopper/m15BoxTopperFrameWL.png',
			UL: 'img/frames/m15/boxTopper/m15BoxTopperFrameUL.png',
			BL: 'img/frames/m15/boxTopper/m15BoxTopperFrameBL.png',
			RL: 'img/frames/m15/boxTopper/m15BoxTopperFrameRL.png',
			GL: 'img/frames/m15/boxTopper/m15BoxTopperFrameGL.png',
			ML: 'img/frames/m15/boxTopper/m15BoxTopperFrameML.png',
			V: 'img/frames/m15/boxTopper/m15BoxTopperFrameV.png',
		},
		pt: {
			W: 'img/frames/m15/regular/m15PTW.png',
			U: 'img/frames/m15/regular/m15PTU.png',
			B: 'img/frames/m15/regular/m15PTB.png',
			R: 'img/frames/m15/regular/m15PTR.png',
			G: 'img/frames/m15/regular/m15PTG.png',
			M: 'img/frames/m15/regular/m15PTM.png',
			A: 'img/frames/m15/regular/m15PTA.png',
			C: 'img/frames/m15/regular/m15PTC.png',
			V: 'img/frames/m15/regular/m15PTV.png',
		},
		fallbacks: commonFallbacks,
		dual: {
			neutralVariant: 'L',
			rulesMask: 'img/frames/m15/regular/m15MaskRules.png',
			pinlineMask: 'img/frames/m15/regular/m15MaskPinlineSuper.png',
			titleMask: 'img/frames/m15/regular/m15MaskTitle.png',
			typeMask: 'img/frames/m15/regular/m15MaskType.png',
			frameMask: 'img/frames/m15/regular/m15MaskFrame.png',
			rightHalfMask: 'img/frames/m15/regular/maskRightHalf.png',
		},
		layout: {
			artwork: { dragTop: 210, dragBottom: 1200 },
			title: { x: 115, y: 160, maxWidth: 1000, font: '70px belerenb, serif', color: '#111' },
			mana: { right: 1390, centerY: 160, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#111' },
			type: { x: 115, y: 1245, maxWidth: 1120, font: '54px belerenb, serif', color: '#fff' },
			rules: { x: 125, y: 1345, width: 1240, height: 555, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
			symbol: { centerX: 1335, centerY: 1248, boxSize: 85 },
			pt: { x: 1136, y: 1903, width: 282, height: 154, textX: 1295, textY: 1975, font: '70px belerenbsc, serif', color: '#111' },
			footer: {
				x: 115,
				maxWidth: 1050,
				metadataY: 1985,
				metadata: { font: '38px mplantin, serif', color: '#fff' },
				disclaimerY: 2025,
				disclaimer: { font: '34px mplantin, serif', color: '#fff' },
			},
		},
		fonts: commonFonts,
	},
	'm15-regular': {
		id: 'm15-regular',
		frames: {
			W: 'img/frames/m15/new/w.png',
			U: 'img/frames/m15/new/u.png',
			B: 'img/frames/m15/new/b.png',
			R: 'img/frames/m15/new/r.png',
			G: 'img/frames/m15/new/g.png',
			M: 'img/frames/m15/new/m.png',
			A: 'img/frames/m15/new/a.png',
			C: 'img/frames/m15/new/c.png',
			L: 'img/frames/m15/new/l.png',
			WL: 'img/frames/m15/new/lw.png',
			UL: 'img/frames/m15/new/lu.png',
			BL: 'img/frames/m15/new/lb.png',
			RL: 'img/frames/m15/new/lr.png',
			GL: 'img/frames/m15/new/lg.png',
			ML: 'img/frames/m15/new/lm.png',
			V: 'img/frames/m15/new/v.png',
		},
		pt: {
			W: 'img/frames/m15/regular/m15PTW.png',
			U: 'img/frames/m15/regular/m15PTU.png',
			B: 'img/frames/m15/regular/m15PTB.png',
			R: 'img/frames/m15/regular/m15PTR.png',
			G: 'img/frames/m15/regular/m15PTG.png',
			M: 'img/frames/m15/regular/m15PTM.png',
			A: 'img/frames/m15/regular/m15PTA.png',
			C: 'img/frames/m15/regular/m15PTC.png',
			V: 'img/frames/m15/regular/m15PTV.png',
		},
		fallbacks: commonFallbacks,
		dual: {
			neutralVariant: 'L',
			rulesMask: 'img/frames/m15/new/rules.png',
			pinlineMask: 'img/frames/m15/new/pinline.png',
			titleMask: 'img/frames/m15/new/title.png',
			typeMask: 'img/frames/m15/new/type.png',
			frameMask: 'img/frames/m15/new/frame.png',
			rightHalfMask: 'img/frames/m15/regular/maskRightHalf.png',
		},
		layout: {
			artwork: { dragTop: 237, dragBottom: 1167 },
			title: { x: 125, y: 165, maxWidth: 1244, font: '70px belerenb, serif', color: '#111' },
			mana: { right: 1391, centerY: 167, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#111' },
			type: { x: 125, y: 1242, maxWidth: 1244, font: '54px belerenb, serif', color: '#111' },
			rules: { x: 129, y: 1328, width: 1242, height: 604, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
			symbol: { centerX: 1335, centerY: 1241, boxSize: 85 },
			pt: { x: 1136, y: 1858, width: 282, height: 154, textX: 1292, textY: 1933, font: '70px belerenbsc, serif', color: '#111' },
			footer: {
				x: 115,
				maxWidth: 1050,
				metadataY: 1985,
				metadata: { font: '38px mplantin, serif', color: '#fff' },
				disclaimerY: 2025,
				disclaimer: { font: '34px mplantin, serif', color: '#fff' },
			},
		},
		fonts: commonFonts,
	},
	'm15-extended': {
		id: 'm15-extended',
		frames: {
			W: 'img/frames/m15/new/extended/w.png',
			U: 'img/frames/m15/new/extended/u.png',
			B: 'img/frames/m15/new/extended/b.png',
			R: 'img/frames/m15/new/extended/r.png',
			G: 'img/frames/m15/new/extended/g.png',
			M: 'img/frames/m15/new/extended/m.png',
			A: 'img/frames/m15/new/extended/a.png',
			C: 'img/frames/m15/new/extended/c.png',
			L: 'img/frames/m15/new/extended/l.png',
			WL: 'img/frames/m15/new/extended/lw.png',
			UL: 'img/frames/m15/new/extended/lu.png',
			BL: 'img/frames/m15/new/extended/lb.png',
			RL: 'img/frames/m15/new/extended/lr.png',
			GL: 'img/frames/m15/new/extended/lg.png',
			ML: 'img/frames/m15/new/extended/lm.png',
			V: 'img/frames/m15/new/extended/v.png',
		},
		pt: {
			W: 'img/frames/m15/regular/m15PTW.png',
			U: 'img/frames/m15/regular/m15PTU.png',
			B: 'img/frames/m15/regular/m15PTB.png',
			R: 'img/frames/m15/regular/m15PTR.png',
			G: 'img/frames/m15/regular/m15PTG.png',
			M: 'img/frames/m15/regular/m15PTM.png',
			A: 'img/frames/m15/regular/m15PTA.png',
			C: 'img/frames/m15/regular/m15PTC.png',
			V: 'img/frames/m15/regular/m15PTV.png',
		},
		fallbacks: commonFallbacks,
		dual: {
			neutralVariant: 'L',
			rulesMask: 'img/frames/m15/new/rules.png',
			pinlineMask: 'img/frames/m15/new/extended/pinline.png',
			titleMask: 'img/frames/m15/new/title.png',
			typeMask: 'img/frames/m15/new/type.png',
			frameMask: 'img/frames/m15/new/frame.png',
			rightHalfMask: 'img/frames/m15/regular/maskRightHalf.png',
		},
		layout: {
			artwork: { dragTop: 176, dragBottom: 1318 },
			title: { x: 125, y: 165, maxWidth: 1244, font: '70px belerenb, serif', color: '#111' },
			mana: { right: 1391, centerY: 167, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#111' },
			type: { x: 125, y: 1253, maxWidth: 1244, font: '54px belerenb, serif', color: '#fff' },
			rules: { x: 129, y: 1328, width: 1242, height: 604, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
			symbol: { centerX: 1335, centerY: 1249, boxSize: 85 },
			pt: { x: 1136, y: 1858, width: 282, height: 154, textX: 1292, textY: 1933, font: '70px belerenbsc, serif', color: '#111' },
			footer: {
				x: 115,
				maxWidth: 1050,
				metadataY: 1985,
				metadata: { font: '38px mplantin, serif', color: '#fff' },
				disclaimerY: 2025,
				disclaimer: { font: '34px mplantin, serif', color: '#fff' },
			},
		},
		fonts: commonFonts,
	},
	borderless: {
		id: 'borderless',
		frames: {
			W: 'img/frames/m15/borderless/m15GenericShowcaseFrameW.png',
			U: 'img/frames/m15/borderless/m15GenericShowcaseFrameU.png',
			B: 'img/frames/m15/borderless/m15GenericShowcaseFrameB.png',
			R: 'img/frames/m15/borderless/m15GenericShowcaseFrameR.png',
			G: 'img/frames/m15/borderless/m15GenericShowcaseFrameG.png',
			M: 'img/frames/m15/borderless/m15GenericShowcaseFrameM.png',
			A: 'img/frames/m15/borderless/m15GenericShowcaseFrameA.png',
			C: 'img/frames/m15/borderless/m15GenericShowcaseFrameC.png',
			L: 'img/frames/m15/borderless/m15GenericShowcaseFrameL.png',
		},
		pt: {
			W: 'img/frames/m15/borderless/pt/w.png',
			U: 'img/frames/m15/borderless/pt/u.png',
			B: 'img/frames/m15/borderless/pt/b.png',
			R: 'img/frames/m15/borderless/pt/r.png',
			G: 'img/frames/m15/borderless/pt/g.png',
			M: 'img/frames/m15/borderless/pt/m.png',
			A: 'img/frames/m15/borderless/pt/a.png',
			C: 'img/frames/m15/borderless/pt/l.png',
		},
		fallbacks: commonFallbacks,
		dual: {
			neutralVariant: 'L',
			rulesMask: 'img/frames/m15/regular/m15MaskRules.png',
			pinlineMask: 'img/frames/m15/borderless/m15GenericShowcaseMaskPinline.png',
			titleMask: 'img/frames/m15/regular/m15MaskTitle.png',
			typeMask: 'img/frames/m15/regular/m15MaskType.png',
			frameMask: 'img/frames/m15/regular/m15MaskFrame.png',
			rightHalfMask: 'img/frames/m15/regular/maskRightHalf.png',
		},
		layout: {
			artwork: { dragTop: 210, dragBottom: 1160 },
			title: { x: 128, y: 165, maxWidth: 1244, font: '70px belerenb, serif', color: '#fff' },
			mana: { right: 1391, centerY: 167, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#fff' },
			type: { x: 128, y: 1245, maxWidth: 1244, font: '54px belerenb, serif', color: '#fff' },
			rules: { x: 129, y: 1324, width: 1242, height: 604, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#fff', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
			symbol: { centerX: 1335, centerY: 1241, boxSize: 85 },
			pt: { x: 1146, y: 1861, width: 274, height: 140, textX: 1283, textY: 1932, font: '70px belerenbsc, serif', color: '#fff' },
			footer: {
				x: 115,
				maxWidth: 1050,
				metadataY: 1985,
				metadata: { font: '38px mplantin, serif', color: '#fff' },
				disclaimerY: 2025,
				disclaimer: { font: '34px mplantin, serif', color: '#fff' },
			},
		},
		fonts: commonFonts,
	},
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
