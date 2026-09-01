import { CardResultItem } from './CardResultItem'
import type { CardEntry } from '../hooks/useCards'

type CardResultsProps = {
	cards: CardEntry[]
	onLoadPrintings: (index: number) => void
	onSelectPrinting: (index: number, cardId: string) => void
}

export function CardResults({
	cards,
	onLoadPrintings,
	onSelectPrinting
}: CardResultsProps) {
	return (
		<section aria-labelledby="cards-heading" id="cards-result">
			{/* <h2 id="cards-heading">Cards</h2> */}

			{cards.length > 0 && (
				<ul className="cardList">
					{cards.map((entry, index) => (
						<li key={`${entry.parsed.sourceLine}-${index}`} className="card">
							<CardResultItem
								entry={entry}
								index={index}
								onLoadPrintings={onLoadPrintings}
								onSelectPrinting={onSelectPrinting}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}