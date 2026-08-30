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
    const [printingSearch, setPrintingSearch] = useState('')

	if (entry.status === 'loading') {
		return <p>{entry.parsed.name}: loading</p>
	}

	if (entry.status === 'error') {
		return (
			<p role="alert" style={{color: '#f00'}}>
				{entry.parsed.sourceLine}: <br/> {entry.error}
			</p>
		)
	}

	const image = entry.card?.image_uris?.normal ?? entry.card?.card_faces?.[0]?.image_uris?.normal

    const filteredPrintings = entry.printings?.filter((printing) => {
        const text = `${printing.set_name} ${printing.set} ${printing.collector_number} ${printing.released_at}`.toLowerCase()
        return text.includes(printingSearch.toLowerCase())
    })

    const visiblePrintings = entry.card && filteredPrintings && !filteredPrintings.some((printing) => printing.id === entry.card?.id)
		? [entry.card, ...filteredPrintings]
		: filteredPrintings

	return (
		<article>
			<h3 style={{height: '46px', margin: '0 0 8px 0', overflow: 'hidden'}}>{entry.parsed.quantity} × {entry.card?.name}</h3>
			<p style={{minHeight: '40px', margin: '0 0 8px 0'}}>
				{entry.card?.set_name} ({entry.card?.set}){' '}
				{entry.card?.collector_number}
			</p>
            <div style={{display: 'flex', alignItems: 'center', flexFlow: 'column', gap: '8px'}}>
				<div style={{ width: '244px', height: '340px', position: 'relative'}}>
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
                            style={{position: 'relative', zIndex: 1}}
						/>
					)}
				    {imageLoading && <p role="status" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)', zIndex: 2, margin: 0, padding: 0}}>Loading image</p>}
				</div>
				<small>
					<a href={entry.card?.scryfall_uri} target="_blank" rel="noreferrer">View on Scryfall </a>
				</small>
			</div>
			<div style={{display: 'flex', flexFlow: 'column', gap: '4px', minHeight: '120px', padding: '4px'}}>
                {entry.printings ? (
                    <>
                        <label htmlFor={`printing-search-${index}`}>Search printings</label>
                        <input
                            id={`printing-search-${index}`}
                            type="search"
                            value={printingSearch}
                            placeholder="Set, code, number or date"
                            onChange={(event) => setPrintingSearch(event.target.value)}
                        />

                        <label htmlFor={`printing-${index}`}>Printing</label>
                        <select
                            id={`printing-${index}`}
                            value={entry.card?.id}
                            onChange={(event) => {
                                setImageLoading(true)
                                onSelectPrinting(index, event.target.value)
                            }}
                        >
                            {visiblePrintings?.map((printing) => (
                                <option key={printing.id} value={printing.id}>
                                    {printing.set_name} ({printing.set}){' '}
                                    {printing.collector_number} — {printing.released_at}
                                </option>
                            ))}
                        </select>

                        {filteredPrintings?.length === 0 && <p style={{margin: 0, padding: 0}}>No printings match this search.</p>}
                    </>
                ) : (
                    <button
                        type="button"
                        disabled={entry.loadingPrintings}
                        onClick={() => onLoadPrintings(index)}
                    >
                        {entry.loadingPrintings ? 'Loading printings' : '🔁 Change printing'}
                    </button>
                )}
                {entry.printingsError && <p role="alert" style={{color: '#f00'}}>{entry.printingsError}</p>}
            </div>
		</article>
	)
}