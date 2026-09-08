import { CardResultItem } from './CardResultItem'
import type { CardEntry } from '../hooks/useCards'
import { useI18n } from '../i18n/context'

type CardResultsProps = {
	cards: CardEntry[]
	onLoadPrintings: (index: number) => void
	onSelectPrinting: (index: number, cardId: string) => void
	onRetry: (index: number) => void
}

export function CardResults({
	cards,
	onLoadPrintings,
	onSelectPrinting,
	onRetry
}: CardResultsProps) {
	const { t } = useI18n()

	return (
		<section id="cards-result">
			{cards.length === 0 ? (
				<p className="text-muted mt-5 pt-5 text-center">{t('emptyCards')}</p>
			) : (
				<ul className="cardList">
					{cards.map((entry, index) => (
						<li key={`${entry.parsed.sourceLine}-${index}`} className="card">
							<CardResultItem
								entry={entry}
								index={index}
								onLoadPrintings={onLoadPrintings}
								onSelectPrinting={onSelectPrinting}
								onRetry={onRetry}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
