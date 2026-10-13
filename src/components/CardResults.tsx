import { CardResultItem } from './CardResultItem'
import type { CardEntry } from '../hooks/useCards'
import { useI18n } from '../i18n/context'
import { useState } from 'react'
import { Icon } from './Icon'

type CardResultsProps = {
	cards: CardEntry[]
	onLoadPrintings: (index: number) => void
	onSelectPrinting: (index: number, cardId: string) => void
	onRetry: (index: number) => void
	onRemoveCustomCard: (index: number) => void
}

export function CardResults({
	cards,
	onLoadPrintings,
	onSelectPrinting,
	onRetry,
	onRemoveCustomCard,
}: CardResultsProps) {
	const { t } = useI18n()
    const [compactView, setCompactView] = useState(false)

	return (
		<section id="cards-result">
            <div className="mb-3" role="group" aria-label={t('resultsView')}>
                <button
                    type="button"
                    className={`mr-2 btn${!compactView ? '' : ' outline'}`}
                    aria-pressed={!compactView}
                    onClick={() => setCompactView(false)}
                >
                    <Icon name="layout-grid" />
                    {t('gridView')}
                </button>
                <button
                    type="button"
                    className={`btn${compactView ? '' : ' outline'}`}
                    aria-pressed={compactView}
                    onClick={() => setCompactView(true)}
                >
                    <Icon name="layout-list" />
                    {t('compactView')}
                </button>
            </div>
			{cards.length === 0 ? (
				<p className="text-muted mt-5 pt-5 text-center">{t('emptyCards')}</p>
			) : (
				<ul className={`cardList${compactView ? ' is-compact' : ''}`}>
					{cards.map((entry, index) => (
						<li key={`${entry.parsed.sourceLine}-${index}`} className={`card${entry.status === 'error' ? ' has-error' : ''}`}>
							<CardResultItem
                                compactView={compactView}
								entry={entry}
								index={index}
								onLoadPrintings={onLoadPrintings}
								onSelectPrinting={onSelectPrinting}
								onRetry={onRetry}
								onRemoveCustomCard={onRemoveCustomCard}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
