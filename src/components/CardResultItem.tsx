import { useState } from 'react'
import type { CardEntry } from '../hooks/useCards'

type CardResultProps = {
	entry: CardEntry
	index: number
	onLoadPrintings: (index: number) => void
	onSelectPrinting: (index: number, cardId: string) => void
}

export function CardResultItem({
	entry,
	index,
	onLoadPrintings,
	onSelectPrinting
}: CardResultProps) {
	const [imageLoading, setImageLoading] = useState(false)

	if (entry.status === 'loading') {
		return <p>{entry.parsed.name}: loading…</p>
	}

	if (entry.status === 'error') {
		return (
			<p role="alert" style={{color: '#f00'}}>
				{entry.parsed.sourceLine}: <br/> {entry.error}
			</p>
		)
	}

	const image = entry.card?.image_uris?.normal ?? entry.card?.card_faces?.[0]?.image_uris?.normal

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