import type { ArtworkTransform } from './CardCanvas'
import type { TransformIcon } from './transformIcons'
import type { SplitCardData } from './types'
import type { FrameBorderStyle, FrameFamilyId } from './frameFamilies'
import type { AdventureCardData, CaseCardData, ClassCardData, CustomCardData, FrameVariant, LevelerCardData, PlaneswalkerCardData, RoomCardData, SagaCardData } from './types'

export type CardRenderInput = {
	artwork?: File | string
	setSymbol?: File | string
	frameFamily: FrameFamilyId
	transformIcon?: TransformIcon
	rulesFontSizes?: Record<string, number | undefined>
	borderStyle: FrameBorderStyle
	frameVariant: FrameVariant
	transform: ArtworkTransform
	split?: {
		artwork?: File | string
		transform: ArtworkTransform
		frameVariant: FrameVariant
	}
	card: CustomCardData | PlaneswalkerCardData | SagaCardData | ClassCardData | CaseCardData | RoomCardData | AdventureCardData | LevelerCardData | SplitCardData
}

export type CardRenderResult = {
	input: CardRenderInput
	status: 'ready' | 'error'
	textOverflow?: boolean
}

export function canExportCardRender(input: CardRenderInput, result: CardRenderResult | null) {
	return result?.input === input && result.status === 'ready'
}
