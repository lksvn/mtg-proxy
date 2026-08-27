import { useState, type SubmitEvent } from 'react'
import { parseCardList, serializeCardList, type ParsedCard } from './Cards'
import { findCards, findPrintings, type ScryfallCard } from './Scryfall'
import type { Paper } from './PdfLayout'
import { createCalibrationPdf, createCardsPdf, type PrintSettings } from './Pdf'

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
				<small>
					Artwork by {entry.card?.artist}.{' '}
					<a
						href={entry.card?.scryfall_uri}
						target="_blank"
						rel="noreferrer"
					>
						View on Scryfall
					</a>
				</small>
			</div>
		</article>
	)
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')

	link.href = url
	link.download = filename
	link.click()

	URL.revokeObjectURL(url)
}

function App() {
	const [cardList, setCardList] = useState('')
	const [cards, setCards] = useState<CardEntry[]>([])
	const [loading, setLoading] = useState(false)
	const [printSettings, setPrintSettings] = useState<PrintSettings>({
		paper: 'a4',
		gap: 0.2,
		cropMarks: false,
		blackCorners: false,
		bleed: false,
		skipBasicLands: false,
		deckList: false,
		watermark: false,
	})
	const [exporting, setExporting] = useState(false)
	const [pdfError, setPdfError] = useState('')

	async function downloadCalibrationPdf() {
		setExporting(true)
		setPdfError('')

		try {
			const pdf = await createCalibrationPdf(
				printSettings.paper,
				printSettings.gap,
			)
			downloadBlob(pdf, 'mtg-proxy-calibration.pdf')
		} catch (error) {
			setPdfError(
				error instanceof Error
					? error.message
					: 'Could not generate PDF',
			)
		} finally {
			setExporting(false)
		}
	}

	async function downloadCardsPdf() {
		setExporting(true)
		setPdfError('')

		try {
			const printableCards = cards.flatMap((entry) => entry.card ? [{ quantity: entry.parsed.quantity, card: entry.card, },] : [],)

			const pdf = await createCardsPdf(printableCards,printSettings)

			downloadBlob(
				pdf,
				`mtg-proxy-${new Intl.DateTimeFormat('en-CA').format(
					new Date(),
				)}.pdf`,
			)
		} catch (error) {
			setPdfError(
				error instanceof Error
					? error.message
					: 'Could not generate PDF',
			)
		} finally {
			setExporting(false)
		}
	}

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

		downloadBlob(new Blob([backup], { type: 'text/plain;charset=utf-8' }),
			`mtg-proxy-list-${new Intl.DateTimeFormat('en-CA').format(
				new Date(),
			)}.txt`,
		)
	}

	return (
		<>
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

				<fieldset>
					<legend>Print settings</legend>

					<p>
						<label htmlFor="paper">Paper</label>{' '}
						<select
							id="paper"
							value={printSettings.paper}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									paper: event.target.value as Paper,
								})
							}
						>
							<option value="a4">A4</option>
							<option value="a3">A3</option>
							<option value="letter">Letter</option>
							<option value="legal">Legal</option>
						</select>
					</p>

					<p>
						<label htmlFor="gap">Gap in millimetres</label>{' '}
						<input
							id="gap"
							type="number"
							min="0"
							step="0.1"
							value={printSettings.gap}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									gap: Math.max(0, event.target.valueAsNumber || 0),
								})
							}
						/>
					</p>

					<label>
						<input
							type="checkbox"
							checked={printSettings.cropMarks}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									cropMarks: event.target.checked,
								})
							}
						/>
						Crop marks
					</label>

					<br />

					<label>
						<input
							type="checkbox"
							checked={printSettings.blackCorners}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									blackCorners: event.target.checked,
								})
							}
						/>
						Black corners
					</label>

					<br />

					<label>
						<input
							type="checkbox"
							checked={printSettings.bleed}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									bleed: event.target.checked,
								})
							}
						/>
						Bleed
					</label>

					{printSettings.bleed && printSettings.gap < 3 && (
						<p>Tip: use a 3 mm gap with bleed.</p>
					)}

					<label>
						<input
							type="checkbox"
							checked={printSettings.skipBasicLands}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									skipBasicLands: event.target.checked,
								})
							}
						/>
						Skip basic lands
					</label>

					<br />

					<label>
						<input
							type="checkbox"
							checked={printSettings.deckList}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									deckList: event.target.checked,
								})
							}
						/>
						Print deck list
					</label>

					<br />

					<label>
						<input
							type="checkbox"
							checked={printSettings.watermark}
							onChange={(event) =>
								setPrintSettings({
									...printSettings,
									watermark: event.target.checked,
								})
							}
						/>
						Playtest watermark
					</label>
				</fieldset>
				<button
					type="button"
					disabled={exporting}
					onClick={downloadCalibrationPdf}
				>
					{exporting ? 'Generating…' : 'Download calibration PDF'}
				</button>
				<button
					type="button"
					disabled={
						exporting || !cards.some((entry) => entry.card)
					}
					onClick={downloadCardsPdf}
				>
					{exporting ? 'Generating…' : 'Download card PDF'}
				</button>

				{pdfError && <p role="alert">{pdfError}</p>}
			</form>

			<section aria-labelledby="cards-heading">
				<h2 id="cards-heading">Cards</h2>

				{cards.length === 0 ? (
					<p>No cards loaded.</p>
				) : (
					<ul style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(244px, 1fr))', gap: '16px', listStyle: 'none', padding: '0'}}>
						{cards.map((entry, index) => (
							<li key={`${entry.parsed.sourceLine}-${index}`}>
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
		<footer>
			<p>
				Card data and images provided by{' '}
				<a href="https://scryfall.com/">Scryfall</a>.
			</p>
			<p>
				For personal playtesting only. Not affiliated with or endorsed
				by Wizards of the Coast.
			</p>
		</footer>
		</>
	)
}

export default App