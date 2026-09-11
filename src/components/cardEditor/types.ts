export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic'

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