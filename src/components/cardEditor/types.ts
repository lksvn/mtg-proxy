export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic'
export const DUAL_FRAME_VARIANTS = ['WU', 'WB', 'UB', 'UR', 'BR', 'BG', 'RG', 'RW', 'GW', 'GU'] as const
export type DualFrameVariant = typeof DUAL_FRAME_VARIANTS[number]
export type FrameVariant = 'W' | 'U' | 'B' | 'R' | 'G' | 'M' | 'A' | 'C' | 'L' | 'WL' | 'UL' | 'BL' | 'RL' | 'GL' | 'ML' | 'V' | DualFrameVariant

export type CustomCardData = {
    name: string
    manaCost: string
    typeLine: string
    rulesText: string
	centerRulesText: boolean
    flavorText: string
    powerToughness: string
    artist: string
    number: string
    rarity: CardRarity
    tintSetSymbol: boolean
    backgroundColor: string
}

export type PlaneswalkerAbility = {
	cost: string
	text: string
}

export type PlaneswalkerCardData = Omit<CustomCardData, 'rulesText' | 'centerRulesText' | 'flavorText' | 'powerToughness'> & {
	nickname: string
	startingLoyalty: string
	reverseFaceName: string
	reverseFaceManaCost: string
	abilities: PlaneswalkerAbility[]
	abilityTextColor?: '#fff' | '#111'
}

export type SagaChapter = {
	chapterCount: number
	text: string
}

export type SagaCardData = CustomCardData & {
	chapters: SagaChapter[]
	reversePowerToughness: string
}

export type ClassLevel = {
	cost: string
	name: string
	text: string
}

export type ClassCardData = CustomCardData & {
	levels: ClassLevel[]
}

export type CaseCardData = CustomCardData & {
	solveCondition: string
	solvedAbility: string
}

export type RoomCardData = CustomCardData & {
	otherName: string
	otherManaCost: string
	otherRulesText: string
	reminderText: string
}

export type AdventureCardData = CustomCardData & {
	adventureName: string
	adventureManaCost: string
	adventureTypeLine: string
	adventureRulesText: string
}

export type LevelerCardData = CustomCardData & {
	levelUpText: string
	levelTwo: string
	levelTwoRulesText: string
	levelTwoPowerToughness: string
	levelThree: string
	levelThreeRulesText: string
	levelThreePowerToughness: string
}

export type SplitCardData = CustomCardData & {
	secondName: string
	secondManaCost: string
	secondTypeLine: string
	secondRulesText: string
	secondFlavorText: string
}
