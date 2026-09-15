export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic'
export const DUAL_FRAME_VARIANTS = ['WU', 'WB', 'UB', 'UR', 'BR', 'BG', 'RG', 'RW', 'GW', 'GU'] as const
export type DualFrameVariant = typeof DUAL_FRAME_VARIANTS[number]
export type FrameVariant = 'W' | 'U' | 'B' | 'R' | 'G' | 'M' | 'A' | 'C' | 'L' | 'WL' | 'UL' | 'BL' | 'RL' | 'GL' | 'ML' | 'V' | DualFrameVariant

export type CustomCardData = {
    name: string
    manaCost: string
    typeLine: string
    rulesText: string
    flavorText: string
    powerToughness: string
    artist: string
    number: string
    rarity: CardRarity
    tintSetSymbol: boolean
    backgroundColor: string
}
