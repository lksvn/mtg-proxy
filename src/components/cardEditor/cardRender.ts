import type { ArtworkTransform } from './CardCanvas'
import type { FrameBorderStyle, FrameFamilyId } from './frameFamilies'
import type { AdventureCardData, CaseCardData, ClassCardData, CustomCardData, FrameVariant, LevelerCardData, PlaneswalkerCardData, RoomCardData, SagaCardData } from './types'

export type CardRenderInput = {
	artwork?: File | string
	setSymbol?: File | string
	frameFamily: FrameFamilyId
	borderStyle: FrameBorderStyle
	frameVariant: FrameVariant
	transform: ArtworkTransform
	card: CustomCardData | PlaneswalkerCardData | SagaCardData | ClassCardData | CaseCardData | RoomCardData | AdventureCardData | LevelerCardData
}

export type CardRenderResult = {
	input: CardRenderInput
	status: 'ready' | 'error'
	textOverflow?: boolean
}

export function canExportCardRender(input: CardRenderInput, result: CardRenderResult | null) {
	return result?.input === input && result.status === 'ready'
}
