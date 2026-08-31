import { useState } from 'react'
import { serializeCardList, addCardListToHistory } from './Cards'
import { useCards } from './hooks/useCards'
import { downloadBlob } from './utils/downloadBlob'
import type { PrintSettings } from './Pdf'
import { PrintSettingsForm } from './components/PrintSettingsForm'
import { CardListForm } from './components/CardListForm'
import { CardResults } from './components/CardResults'
import { PdfExport } from './components/PdfExport'

const HISTORY_KEY = 'mtg-proxy-card-list-history'

function App() {
    const [cardList, setCardList] = useState('')
    const [history, setHistory] = useState<string[]>(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
            return Array.isArray(stored)
                ? stored.filter((item): item is string => typeof item === 'string').slice(0, 5)
                : []
        } catch {
            return []
        }
    })
    const { cards, loading, loadCards, loadCardPrintings, selectPrinting } = useCards(cardList)
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
    const canExport = cards.some((entry) => entry.card)

    function clearHistory() {
        if (!window.confirm('Clear all previous lists?')) return

        setHistory([])

        try {
            localStorage.removeItem(HISTORY_KEY)
        } catch {
            // History is still cleared for the current tab.
        }
    }

    function loadAndRememberCards() {
        const nextHistory = addCardListToHistory(history, cardList)

        setHistory(nextHistory)

        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))
        } catch {
            // Card loading should still work if browser storage is unavailable.
        }

        loadCards()
    }

	async function downloadCardsPdf() {
		setExporting(true)
		setPdfError('')

		try {
			const printableCards = cards.flatMap((entry) => entry.card ? [{ quantity: entry.parsed.quantity, card: entry.card }] : [])

            const { createCardsPdf } = await import('./Pdf')
			const pdf = await createCardsPdf(printableCards,printSettings)

			downloadBlob( pdf, `mtg-proxy-${new Intl.DateTimeFormat('en-CA').format(new Date(),)}.pdf` )
		} catch (error) {
			setPdfError( error instanceof Error ? error.message : 'Could not generate PDF' )
		} finally {
			setExporting(false)
		}
	}

	function saveCardList() {
		const backup = serializeCardList(
			cards.map((entry) => {
				if (!entry.card) {
					return {
						...entry.parsed,
						error: entry.error ?? entry.parsed.error
					}
				}

				return {
					...entry.parsed,
					name: entry.card.name,
					set: entry.card.set,
					collectorNumber: entry.card.collector_number,
					error: undefined
				}
			})
		)

		downloadBlob(new Blob([backup], { type: 'text/plain;charset=utf-8' }), `mtg-proxy-list-${new Intl.DateTimeFormat('en-CA').format(new Date())}.txt`)
	}

	return (
		<>
		<main>
			<h1>MTG Proxy</h1>

            <CardListForm
                value={cardList}
                history={history}
                onClearHistory={clearHistory}
                loading={loading}
                canSave={cards.length > 0}
                onChange={setCardList}
                onLoad={loadAndRememberCards}
                onSave={saveCardList}
            />
            <PrintSettingsForm
                settings={printSettings}
                onChange={setPrintSettings}
            />

            <PdfExport
                exporting={exporting}
                canExport={canExport}
                error={pdfError}
                onExport={downloadCardsPdf}
            />

            <CardResults
                cards={cards}
                onLoadPrintings={loadCardPrintings}
                onSelectPrinting={selectPrinting}
            />

            <PdfExport
                exporting={exporting}
                canExport={canExport}
                error={pdfError}
                onExport={downloadCardsPdf}
            />
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
