import type { TranslationKey } from '../../i18n/messages'
import type { FrameFamilyId } from './frameFamilies'

export const FRAME_STYLE_GROUPS = [
	{ label: 'frameStyleGroupM15', options: [
		{ id: 'box-topper', label: 'frameStyleBoxTopper' },
		{ id: 'm15-regular', label: 'frameStyleM15Regular' },
		{ id: 'm15-extended', label: 'frameStyleM15Extended' },
		{ id: 'snow', label: 'frameStyleSnow' },
		{ id: 'nyx', label: 'frameStyleNyx' },
		{ id: 'universes-beyond', label: 'frameStyleUniversesBeyond' },
	] },
	{ label: 'frameStyleGroupShowcase', options: [
		{ id: 'borderless', label: 'frameStyleBorderless' },
	] },
	{ label: 'frameStyleGroupPromo', options: [
		{ id: 'promo-regular', label: 'frameStylePromoRegular' },
	] },
	{ label: 'frameStyleGroupHistorical', options: [
		{ id: 'eighth-edition', label: 'frameStyleEighthEdition' },
		{ id: 'seventh-edition', label: 'frameStyleSeventhEdition' },
		{ id: 'old-floating', label: 'frameStyleOldFloating' },
		{ id: 'abu', label: 'frameStyleAbu' },
		{ id: 'revised', label: 'frameStyleRevised' },
		{ id: 'fourth-era', label: 'frameStyleFourthEra' },
		{ id: 'colorshifted', label: 'frameStyleColorshifted' },
		{ id: 'classicshifted', label: 'frameStyleClassicshifted' },
		{ id: 'future-sight', label: 'frameStyleFutureSight' },
	] },
] as const

export type TokenStyle = Extract<FrameFamilyId, `token-${string}`>
export type PlaneswalkerStyle = Extract<FrameFamilyId, `planeswalker-${string}`>
export type SagaStyle = Extract<FrameFamilyId, `saga-${string}`>

export const SAGA_STYLES: readonly { id: SagaStyle; label: TranslationKey }[] = [
	{ id: 'saga-regular', label: 'sagaStyleRegular' },
	{ id: 'saga-creature', label: 'sagaStyleCreature' },
]

export const PLANESWALKER_STYLES: readonly { id: PlaneswalkerStyle; label: TranslationKey }[] = [
	{ id: 'planeswalker-regular', label: 'planeswalkerStyleRegular' },
	{ id: 'planeswalker-tall', label: 'planeswalkerStyleTall' },

	{ id: 'planeswalker-transform-front', label: 'planeswalkerStyleTransformFront' },
	{ id: 'planeswalker-transform-back', label: 'planeswalkerStyleTransformBack' },

    { id: 'planeswalker-mdfc-back', label: 'planeswalkerStyleMdfcBack' },
	{ id: 'planeswalker-box-topper', label: 'planeswalkerStyleBoxTopper' },
	{ id: 'planeswalker-compleated', label: 'planeswalkerStyleCompleated' },

    { id: 'planeswalker-double-feature', label: 'planeswalkerStyleDoubleFeature' },
	{ id: 'planeswalker-tall-double-feature', label: 'planeswalkerStyleTallDoubleFeature' },
	{ id: 'planeswalker-transform-front-double-feature', label: 'planeswalkerStyleTransformFrontDoubleFeature' },
	{ id: 'planeswalker-transform-back-double-feature', label: 'planeswalkerStyleTransformBackDoubleFeature' },
	{ id: 'planeswalker-sdcc15', label: 'planeswalkerStyleSdcc15' },
	{ id: 'planeswalker-sdcc15-transform', label: 'planeswalkerStyleSdcc15Transform' },
	{ id: 'planeswalker-nickname', label: 'planeswalkerStyleNickname' },
	{ id: 'planeswalker-seventh', label: 'planeswalkerStyleSeventh' },

	{ id: 'planeswalker-borderless', label: 'planeswalkerStyleBorderless' },
	{ id: 'planeswalker-tall-borderless', label: 'planeswalkerStyleTallBorderless' },
]

type TokenStyleOptions = {
	id: TokenStyle
	label: TranslationKey
	hideSetSymbol?: boolean
	hideColor?: boolean
	showManaCost?: boolean
	hideRulesText?: boolean
	hideNameAndType?: boolean
	hideTypeLine?: boolean
	hidePowerToughness?: boolean
}

export const TOKEN_STYLES: readonly TokenStyleOptions[] = [
	{ id: 'token-regular', label: 'tokenStyleRegular' },
	{ id: 'token-tall', label: 'tokenStyleTall' },
	{ id: 'token-short', label: 'tokenStyleShort' },
	{ id: 'token-textless', label: 'tokenStyleTextless', hideRulesText: true },
	{ id: 'token-textless-borderless', label: 'tokenStyleTextlessBorderless', hideRulesText: true },
	{ id: 'token-nyx', label: 'tokenStyleNyx' },
	{ id: 'token-nyx-textless', label: 'tokenStyleNyxTextless', hideRulesText: true },
	{ id: 'token-old', label: 'tokenStyleOld' },
	{ id: 'token-unglued', label: 'tokenStyleUnglued', hideSetSymbol: true, hideRulesText: true, hideNameAndType: true, hidePowerToughness: true },
	{ id: 'token-monarch', label: 'tokenStyleMonarch', hideSetSymbol: true, hideColor: true, hideTypeLine: true, hidePowerToughness: true },
	{ id: 'token-marker', label: 'tokenStyleMarker', hideColor: true, hideTypeLine: true, hidePowerToughness: true },
	{ id: 'token-initiative', label: 'tokenStyleInitiative', hideColor: true, hideTypeLine: true, hidePowerToughness: true },
	{ id: 'token-day-night', label: 'tokenStyleDayNight', hideSetSymbol: true, hideColor: true, hideTypeLine: true, hidePowerToughness: true },
	{ id: 'token-jumpstart', label: 'tokenStyleJumpstart', hideSetSymbol: true, hideColor: true, showManaCost: true, hideRulesText: true, hideTypeLine: true, hidePowerToughness: true },
]
