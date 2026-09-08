import { useState } from 'react'
import { parseCardList, type ParsedCard } from '../Cards'
import { findCards, findPrintings, type ScryfallCard } from '../Scryfall'
import { useI18n } from '../i18n/context'

export type CardEntry = {
	parsed: ParsedCard
	status: 'loading' | 'ready' | 'error'
	card?: ScryfallCard
	error?: string
	printings?: ScryfallCard[]
	loadingPrintings?: boolean
	printingsError?: string
}
const ERROR_TRANSLATIONS = {
	'Invalid card line': 'invalidCardLine',
	'Quantity must be at least 1': 'quantityAtLeastOne',
	'Card not found': 'cardNotFound',
	'Your query didn’t match any cards. Adjust your search terms or refer to the syntax guide at https://scryfall.com/docs/reference': 'cardNotFound'
} as const

export function useCards() {
    const { t } = useI18n()
	const [cards, setCards] = useState<CardEntry[]>([])
	const [loading, setLoading] = useState(false)

    function translateError(error?: string) {
        if (!error) return

        const key = ERROR_TRANSLATIONS[
            error as keyof typeof ERROR_TRANSLATIONS
        ]

        return key ? t(key) : error
    }

	async function loadCards(cardList: string) {
		const entries: CardEntry[] = parseCardList(cardList).map((parsed) => ({
			parsed,
			status: parsed.error ? 'error' : 'loading',
			error: translateError(parsed.error)
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
					error: translateError(lookup.error) ?? t('cardNotFound')
				}
			})

			setCards(resolvedCards)
		} catch (error) {
			const message = error instanceof Error
                ? error.message
                : t('unknownCardLookupError')

			setCards(entries.map((entry) =>
				entry.status === 'error'
					? entry
					: { ...entry, status: 'error', error: message }
			))
		} finally {
			setLoading(false)
		}
	}

	async function retryCard(index: number) {
		const entry = cards[index]

		if (!entry || entry.status !== 'error' || entry.parsed.error) return

		const parsed = entry.parsed

		setCards((current) =>
			current.map((item, itemIndex) =>
				itemIndex === index && item.parsed === parsed
					? { ...item, status: 'loading', error: undefined }
					: item
			)
		)

		try {
			const [lookup] = await findCards([parsed])

			setCards((current) =>
				current.map((item, itemIndex) => {
					if (itemIndex !== index || item.parsed !== parsed) return item

					return lookup?.card
						? { ...item, status: 'ready', card: lookup.card, error: undefined }
						: { ...item, status: 'error', error: translateError(lookup?.error) ?? t('cardNotFound') }
				})
			)
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: t('unknownCardLookupError')

			setCards((current) =>
				current.map((item, itemIndex) =>
					itemIndex === index && item.parsed === parsed
						? { ...item, status: 'error', error: message }
						: item
				)
			)
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
								: t('couldNotLoadPrintings')
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

	return { cards, loading, loadCards, loadCardPrintings, selectPrinting, retryCard }
}
