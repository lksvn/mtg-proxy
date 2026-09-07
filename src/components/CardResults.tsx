import { CardResultItem } from './CardResultItem'
import type { CardEntry } from '../hooks/useCards'

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
	return (
		<section id="cards-result">
			{cards.length > 0 && (
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
