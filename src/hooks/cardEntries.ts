import { getQuantityError, type ParsedCard } from '../Cards.ts'
import type { ScryfallCard } from '../Scryfall.ts'

export type CardEntry = {
	parsed: ParsedCard
	status: 'loading' | 'ready' | 'error'
	custom?: boolean
	card?: ScryfallCard
	error?: string
	printings?: ScryfallCard[]
	loadingPrintings?: boolean
	printingsError?: string
}

export type CustomCardEntry = {
	quantity: number
	name: string
	typeLine: string
	artist: string
	collectorNumber: string
	imageUrl: string
}

export function createCustomCardEntry(customCard: CustomCardEntry): CardEntry {
	const quantityError = getQuantityError(customCard.quantity)
	if (quantityError) throw new Error(quantityError)
	const parsed: ParsedCard = {
		quantity: customCard.quantity,
		name: customCard.name,
		sourceLine: customCard.name,
	}
	const imageUris = {
		small: customCard.imageUrl,
		normal: customCard.imageUrl,
		grid: customCard.imageUrl,
		crop: customCard.imageUrl,
		large: customCard.imageUrl,
		png: customCard.imageUrl,
	}

	return {
		parsed,
		status: 'ready',
		custom: true,
		card: {
			id: `custom-${crypto.randomUUID()}`,
			name: customCard.name,
			set: 'custom',
			set_name: 'Custom card',
			collector_number: customCard.collectorNumber,
			released_at: '',
			lang: 'en',
			type_line: customCard.typeLine,
			image_uris: imageUris,
			prints_search_uri: '',
			artist: customCard.artist,
			scryfall_uri: '',
			layout: 'normal',
		},
	}
}

export function withCustomCards(cards: CardEntry[], current: CardEntry[]): CardEntry[] {
	return [...cards, ...current.filter((entry) => entry.custom)]
}
