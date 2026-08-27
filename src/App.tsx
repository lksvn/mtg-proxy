import { useState, type SubmitEvent } from 'react'
import { parseCardList, serializeCardList, type ParsedCard } from './Cards'
import { findCards, findPrintings, type ScryfallCard } from './Scryfall'

type CardEntry = {
	parsed: ParsedCard
	status: 'loading' | 'ready' | 'error'
	card?: ScryfallCard
	error?: string,
	printings?: ScryfallCard[],
	loadingPrintings?: boolean,
	printingsError?: string
}

type CardResultProps = {
	entry: CardEntry
	index: number
	onLoadPrintings: (index: number) => void
	onSelectPrinting: (index: number, cardId: string) => void
}

function CardResult({
	entry,
	index,
	onLoadPrintings,
	onSelectPrinting,
}: CardResultProps) {
	const [imageLoading, setImageLoading] = useState(false)

	if (entry.status === 'loading') {
		return <p>{entry.parsed.name}: loading…</p>
	}

	if (entry.status === 'error') {
		return (
			<p>
				{entry.parsed.sourceLine}: {entry.error}
			</p>
		)
	}

	const image =
		entry.card?.image_uris?.normal ??
		entry.card?.card_faces?.[0]?.image_uris?.normal

	return (
		<article>
			<h3>{entry.parsed.quantity} × {entry.card?.name}</h3>
			<p>
				{entry.card?.set_name} ({entry.card?.set}){' '}
				{entry.card?.collector_number}
			</p>
			<div>
				<label htmlFor={`printing-${index}`}>Printing</label><br/>
				<select
					id={`printing-${index}`}
					value={entry.card?.id}
					disabled={entry.loadingPrintings}
					onFocus={() => onLoadPrintings(index)}
					onChange={
						(event) => {
							setImageLoading(true)
							onSelectPrinting(index, event.target.value)
						}
					}
					style={{width: '244px'}}
				>
					{entry.printings ? (
						entry.printings.map((printing) => (
							<option key={printing.id} value={printing.id}>
								{printing.set_name} ({printing.set}){' '}
								{printing.collector_number} — {printing.released_at}
							</option>
						))
					) : (
						<option value={entry.card?.id}>
							{entry.card?.set_name} ({entry.card?.set}){' '}
							{entry.card?.collector_number}
						</option>
					)}
				</select>

				{entry.loadingPrintings && <p>Loading printings…</p>}
				{entry.printingsError && <p>{entry.printingsError}</p>}
			</div>
			<div>
				<div style={{ width: '244px', height: '340px' }}>
					{image && (
						<img
						key={image}
						src={image}
						alt={`${entry.card?.name} card`}
						width="244"
						height="340"
						aria-busy={imageLoading}
						onLoad={() => setImageLoading(false)}
						onError={() => setImageLoading(false)}
						/>
					)}
				</div>
				{imageLoading && <p role="status">Loading image</p>}
			</div>
		</article>
	)
}

function App() {
	const [cardList, setCardList] = useState('')
	const [cards, setCards] = useState<CardEntry[]>([])
	const [loading, setLoading] = useState(false)

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()

		const entries: CardEntry[] = parseCardList(cardList).map((parsed) => ({
			parsed,
			status: parsed.error ? 'error' : 'loading',
			error: parsed.error,
		}))

		setCards(entries)
		setLoading(true)

		try {
			const validEntries = entries.filter(
				(entry) => entry.status !== 'error',
			)
			const lookups = await findCards(
				validEntries.map((entry) => entry.parsed),
			)

			let lookupIndex = 0

			const resolvedCards = entries.map((entry): CardEntry => {
				if (entry.status === 'error') {
					return entry
				}

				const lookup = lookups[lookupIndex]
				lookupIndex += 1

				if (lookup.card) {
					return {
						...entry,
						status: 'ready',
						card: lookup.card,
					}
				}

				return {
					...entry,
					status: 'error',
					error: lookup.error ?? 'Card not found',
				}
			})

			setCards(resolvedCards)
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Unknown card lookup error'

			setCards(
				entries.map((entry) =>
					entry.status === 'error'
						? entry
						: { ...entry, status: 'error', error: message },
				),
			)
		} finally {
			setLoading(false)
		}
	}

	async function loadCardPrintings(index: number) {
		const entry = cards[index]

		if (
			!entry?.card ||
			entry.printings ||
			entry.loadingPrintings
		) {
			return
		}

		const cardId = entry.card.id

		setCards((current) =>
			current.map((item, itemIndex) =>
				itemIndex === index
					? {
							...item,
							loadingPrintings: true,
							printingsError: undefined,
						}
					: item,
			),
		)

		try {
			const printings = await findPrintings(entry.card)

			setCards((current) =>
				current.map((item, itemIndex) =>
					itemIndex === index && item.card?.id === cardId
						? {
								...item,
								printings,
								loadingPrintings: false,
							}
						: item,
				),
			)
		} catch (error) {
			setCards((current) =>
				current.map((item, itemIndex) =>
					itemIndex === index && item.card?.id === cardId
						? {
								...item,
								loadingPrintings: false,
								printingsError:
									error instanceof Error
										? error.message
										: 'Could not load printings',
							}
						: item,
				),
			)
		}
	}

	function selectPrinting(index: number, cardId: string) {
		setCards((current) =>
			current.map((entry, entryIndex) => {
				if (entryIndex !== index) {
					return entry
				}

				const printing = entry.printings?.find(
					(card) => card.id === cardId,
				)

				return printing ? { ...entry, card: printing } : entry
			}),
		)
	}

	function saveCardList() {
		const backup = serializeCardList(
			cards.map((entry) => {
				if (!entry.card) {
					return {
						...entry.parsed,
						error: entry.error ?? entry.parsed.error,
					}
				}

				return {
					...entry.parsed,
					name: entry.card.name,
					set: entry.card.set,
					collectorNumber: entry.card.collector_number,
					error: undefined,
				}
			}),
		)

		const url = URL.createObjectURL(
			new Blob([backup], { type: 'text/plain;charset=utf-8' }),
		)
		const link = document.createElement('a')

		link.href = url
		link.download = `mtg-proxy-list-${new Intl.DateTimeFormat(
			'en-CA',
		).format(new Date())}.txt`
		link.click()

		URL.revokeObjectURL(url)
	}

	return (
		<main>
			<h1>MTG Proxy</h1>

			<form onSubmit={handleSubmit}>
				<label htmlFor="card-list">Card list</label>
				<br />
				<textarea
					id="card-list"
					name="card-list"
					rows={12}
					cols={50}
					value={cardList}
					onChange={(event) => setCardList(event.target.value)}
					placeholder={'4 Lightning Bolt\n1 Black Lotus (lea) 232'}
				/>
				<br />
				<button type="submit" disabled={loading}>
					{loading ? 'Loading…' : 'Load cards'}
				</button>
				<button
					type="button"
					disabled={cards.length === 0 || loading}
					onClick={saveCardList}
				>
					Save card list
				</button>
			</form>

			<section aria-labelledby="cards-heading">
				<h2 id="cards-heading">Cards</h2>

				{cards.length === 0 ? (
					<p>No cards loaded.</p>
				) : (
					<ul style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
						{cards.map((entry, index) => (
							<li key={`${entry.parsed.sourceLine}-${index}`} style={{width: '250px'}}>
								<CardResult
									entry={entry}
									index={index}
									onLoadPrintings={loadCardPrintings}
									onSelectPrinting={selectPrinting}
								/>
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	)
}

export default App