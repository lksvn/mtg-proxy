import { useState } from 'react'
import type { CardEntry } from '../hooks/useCards'
import { Icon } from './Icon'
import placeholderUrl from '../assets/placeholder.webp'
import { useI18n } from '../i18n/context'
import type { TranslationKey } from '../i18n/messages'

const ERROR_TRANSLATIONS: Record<string, TranslationKey> = {
	'Invalid card line': 'invalidCardLine',
	'Quantity must be at least 1': 'quantityAtLeastOne',
	'Card not found': 'cardNotFound',
	'Your query didn’t match any cards. Adjust your search terms or refer to the syntax guide at https://scryfall.com/docs/reference': 'cardNotFound'
}

const placeholderImage = new Image()
placeholderImage.src = placeholderUrl

type CardResultProps = {
	entry: CardEntry
	index: number
	onLoadPrintings: (index: number) => void
	onSelectPrinting: (index: number, cardId: string) => void
	onRetry: (index: number) => void
}

export function CardResultItem({
	entry,
	index,
	onLoadPrintings,
	onSelectPrinting,
	onRetry
}: CardResultProps) {
	const { t } = useI18n()
	const [imageLoading, setImageLoading] = useState(true)
	const [frontImageError, setFrontImageError] = useState(false)
	const [backImageError, setBackImageError] = useState(false)
	const [printingSearch, setPrintingSearch] = useState('')
	const [showPrintingForm, setShowPrintingForm] = useState(false)
	const [showBackFace, setShowBackFace] = useState(false)

	if (entry.status === 'loading') {
		return <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}><Icon name="loading" className="hourglass"/> {t('loading')}</div>
	}

	if (entry.status === 'error') {
        const errorKey = entry.error && ERROR_TRANSLATIONS[entry.error]
		return (
			<>
				<p role="alert" className="error">
					<strong>{entry.parsed.sourceLine}</strong> <br/> {errorKey ? t(errorKey) : entry.error}
				</p>
				{!entry.parsed.error && (
					<button
						type="button"
						className="btn center"
						onClick={() => onRetry(index)}
					>
						<Icon name="refresh-cw"/> {t('reload')}
					</button>
				)}
			</>
		)
	}

	const frontImage =
		entry.card?.image_uris?.grid ??
		entry.card?.image_uris?.normal ??
		entry.card?.card_faces?.[0]?.image_uris?.grid ??
		entry.card?.card_faces?.[0]?.image_uris?.normal

	const backImage =
		entry.card?.card_faces?.[1]?.image_uris?.grid ??
		entry.card?.card_faces?.[1]?.image_uris?.normal

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
			<div
				className={`card-image${backImage ? ' has-back' : ''}${showBackFace ? ' show-back' : ''}`}
			>
				{frontImage && (
					<img
						key={frontImage}
						loading="lazy"
						decoding="async"
						fetchPriority="low"
						src={frontImageError ? placeholderUrl : frontImage}
						alt={`${entry.card?.name} — ${t('frontFace')}`}
						width="244"
						height="340"
						aria-busy={imageLoading}
						onLoad={() => setImageLoading(false)}
						onError={() => {
							setImageLoading(true)
							setFrontImageError(true)
						}}
						className={`front-face${imageLoading ? ' is-loading' : ''}`}
					/>
				)}
				{backImage && (
					<img
						key={backImage}
						className="back-face"
						loading="lazy"
						decoding="async"
						fetchPriority="low"
						src={backImageError ? placeholderUrl : backImage}
						alt={`${entry.card?.name} — ${t('backFace')}`}
						width="244"
						height="340"
						onError={() => setBackImageError(true)}
					/>
				)}
				{backImage && (
					<button
						type="button"
						className="flip-card btn sm"
						aria-pressed={showBackFace}
						onClick={() => setShowBackFace((current) => !current)}
					>
						<Icon name="arrow-left-right"/>
						{showBackFace ? t('frontFace') : t('backFace')}
					</button>
				)}
				{frontImageError || backImageError ? (
					<button
						type="button"
						className="btn loading"
						onClick={() => {
							if (frontImageError) setImageLoading(true)
							setFrontImageError(false)
							setBackImageError(false)
						}}
					>
						<Icon name="refresh-cw"/> {t('reload')}
					</button>
				) : imageLoading && (
					<span role="status" className="loading"><Icon name="loading" className="hourglass"/> {t('loading')}</span>)
				}
			</div>
			<small>
				<a href={entry.card?.scryfall_uri} target="_blank" rel="noreferrer">{t('viewOnScryfall')}</a>
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
					{entry.loadingPrintings ? (<><Icon name="loading" className="hourglass"/> {t('loading')}</>) : (<><Icon name="arrow-left-right"/> {t('changePrinting')}</>)}
				</button>
				<div
					id={`printing-form-${index}`}
					inert={!entry.printings || !showPrintingForm}
					className={entry.printings && showPrintingForm ? 'form open': 'form'}
				>
					<div className="form-group">
						<label htmlFor={`printing-search-${index}`}>{t('searchPrintings')}</label>
						<input
							id={`printing-search-${index}`}
							type="search"
							value={printingSearch}
							placeholder={t('printingSearchPlaceholder')}
							onChange={(event) => setPrintingSearch(event.target.value)}
						/>
					</div>
					<div className="form-group">
						<label htmlFor={`printing-${index}`}>{t('printing')}</label>
						<select
							id={`printing-${index}`}
							value={entry.card?.id}
							onChange={(event) => {
								setImageLoading(true)
								setFrontImageError(false)
								setBackImageError(false)
								setShowBackFace(false)
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

						{filteredPrintings?.length === 0 && <p style={{margin: 0, padding: 0}}>{t('noMatchingPrintings')}</p>}
					</div>
					<button type="button" onClick={() => setShowPrintingForm(false)} aria-label={t('closePrintingSelection')} className="btn md"><Icon name="chevron-down"/></button>
				</div>
				{entry.printingsError && (
					<>
						<p role="alert" className="error">{entry.printingsError}</p>
						<button
							type="button"
							className="btn center"
							onClick={() => onLoadPrintings(index)}
						>
							<Icon name="refresh-cw"/> {t('reload')}
						</button>
					</>
				)}
			</div>
		</>
	)
}
