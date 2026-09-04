import { useState } from 'react'
import type { CardEntry } from '../hooks/useCards'
import { Icon } from './Icon'
import placeholderUrl from '../assets/placeholder.webp'

const placeholderImage = new Image()
placeholderImage.src = placeholderUrl

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
	const [imageLoading, setImageLoading] = useState(true)
    const [printingSearch, setPrintingSearch] = useState('')
    const [showPrintingForm, setShowPrintingForm] = useState(false)

	if (entry.status === 'loading') {
		return <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}><Icon name="loading" className="hourglass"/> Loading</div>
	}

	if (entry.status === 'error') {
		return (
			<p role="alert" className="error">
				{entry.parsed.sourceLine}: <br/> {entry.error}
			</p>
		)
	}

	const image = entry.card?.image_uris?.grid ??
                entry.card?.image_uris?.normal ??
                entry.card?.card_faces?.[0]?.image_uris?.grid ??
                entry.card?.card_faces?.[0]?.image_uris?.normal

    const filteredPrintings = entry.printings?.filter((printing) => {
        const text = `${printing.set_name} ${printing.set} ${printing.collector_number} ${printing.released_at}`.toLowerCase()
        return text.includes(printingSearch.toLowerCase())
    })

    const visiblePrintings = entry.card && filteredPrintings && !filteredPrintings.some((printing) => printing.id === entry.card?.id)
		? [entry.card, ...filteredPrintings]
		: filteredPrintings

	return (
		<>
			<p>
			    <strong
                    title={entry.card?.name}
                    className="truncate"
                >
					{entry.card?.name.toUpperCase()}
				</strong>
				<span
                    title={`${entry.card?.set_name} (${entry.card?.set.toUpperCase()}) ${entry.card?.collector_number}`}
                    className="truncate"
                >
					{entry.card?.set_name} ({entry.card?.set.toUpperCase()}){' '}{entry.card?.collector_number}
				</span>
			</p>
            <div className="card-image">
                {image && (
                    <img
                        key={image}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        src={image}
                        alt={`${entry.card?.name} card`}
                        width="244"
                        height="340"
                        aria-busy={imageLoading}
                        onLoad={() => setImageLoading(false)}
                        onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = placeholderUrl
                            setImageLoading(false)
                        }}
                        style={{ transition: 'opacity var(--transition-fast)', opacity: imageLoading ? 0 : 1}}
                    />
                )}
                {imageLoading && <span role="status" className="loading"><Icon name="loading" className="hourglass"/> Loading</span>}
            </div>
            <small>
                <a href={entry.card?.scryfall_uri} target="_blank" rel="noreferrer">View on Scryfall </a>
            </small>
			<div className="change-printing">
                <button
                    type="button"
                    disabled={entry.loadingPrintings}
                    onClick={() => {
                        setShowPrintingForm(true)
                        onLoadPrintings(index)
                    }}
                    className="btn block center"
                    aria-expanded={Boolean(entry.printings && showPrintingForm)}
                    aria-controls={`printing-form-${index}`}
                >
                    {entry.loadingPrintings ? (<><Icon name="loading" className="hourglass"/> Loading</>) : (<><Icon name="arrow-left-right"/> Change printing</>)}
                </button>
                <div
                    id={`printing-form-${index}`}
                    inert={!entry.printings || !showPrintingForm}
                    className={entry.printings && showPrintingForm ? 'form open': 'form'}
                >
                    <div className="form-group">
                        <label htmlFor={`printing-search-${index}`}>Search printings</label>
                        <input
                            id={`printing-search-${index}`}
                            type="search"
                            value={printingSearch}
                            placeholder="Set, code, number or date"
                            onChange={(event) => setPrintingSearch(event.target.value)}
                        />
                    </div>
                    <div className="form-group">
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
                                    {printing.collector_number} @ {printing.released_at}
                                </option>
                            ))}
                        </select>

                        {filteredPrintings?.length === 0 && <p style={{margin: 0, padding: 0}}>No printings match this search.</p>}
                    </div>
                    <button type="button" onClick={() => setShowPrintingForm(false)} aria-label='Close printing selection' className="btn md"><Icon name="chevron-down"/></button>
                </div>
                {entry.printingsError && <p role="alert" className="error">{entry.printingsError}</p>}
            </div>
		</>
	)
}
