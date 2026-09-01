import { useState } from 'react'
import { parseCardList, type ParsedCard } from '../Cards'
import { findCards, findPrintings, type ScryfallCard } from '../Scryfall'

export type CardEntry = {
	parsed: ParsedCard
	status: 'loading' | 'ready' | 'error'
	card?: ScryfallCard
	error?: string
	printings?: ScryfallCard[]
	loadingPrintings?: boolean
	printingsError?: string
}

export function useCards() {
	const [cards, setCards] = useState<CardEntry[]>([])
	const [loading, setLoading] = useState(false)

	async function loadCards(cardList: string) {
		const entries: CardEntry[] = parseCardList(cardList).map((parsed) => ({
			parsed,
			status: parsed.error ? 'error' : 'loading',
			error: parsed.error
		}))

		setCards(entries)
		setLoading(true)

		try {
			const validEntries = entries.filter((entry) => entry.status !== 'error')
			const lookups = await findCards(validEntries.map((entry) => entry.parsed))

			let lookupIndex = 0

			const resolvedCards = entries.map((entry): CardEntry => {
				if (entry.status === 'error') return entry

				const lookup = lookups[lookupIndex]
				lookupIndex += 1

				if (lookup.card) {
					return { ...entry, status: 'ready', card: lookup.card }
				}

				return {
					...entry,
					status: 'error',
					error: lookup.error ?? 'Card not found'
				}
			})

			setCards(resolvedCards)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown card lookup error'

			setCards(entries.map((entry) =>
				entry.status === 'error'
					? entry
					: { ...entry, status: 'error', error: message }
			))
		} finally {
			setLoading(false)
		}
	}

	async function loadCardPrintings(index: number) {
		const entry = cards[index]

		if (!entry?.card || entry.printings || entry.loadingPrintings) return

		const cardId = entry.card.id

		setCards((current) =>
			current.map((item, itemIndex) =>
				itemIndex === index
					? { ...item, loadingPrintings: true, printingsError: undefined }
					: item
			)
		)

		try {
			const printings = await findPrintings(entry.card)

			setCards((current) =>
				current.map((item, itemIndex) =>
					itemIndex === index && item.card?.id === cardId
						? { ...item, printings, loadingPrintings: false }
						: item
				)
			)
		} catch (error) {
			setCards((current) =>
				current.map((item, itemIndex) =>
					itemIndex === index && item.card?.id === cardId
						? {
							...item,
							loadingPrintings: false,
							printingsError: error instanceof Error
								? error.message
								: 'Could not load printings'
						}
						: item
				)
			)
		}
	}

	function selectPrinting(index: number, cardId: string) {
		setCards((current) =>
			current.map((entry, entryIndex) => {
				if (entryIndex !== index) return entry

				const printing = entry.printings?.find((card) => card.id === cardId)
				return printing ? { ...entry, card: printing } : entry
			})
		)
	}

	return { cards, loading, loadCards, loadCardPrintings, selectPrinting }
}