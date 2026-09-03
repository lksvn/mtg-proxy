import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type FocusEvent } from 'react'
import { Icon } from './Icon'
import { EXAMPLE_CARD_LIST } from '../Cards'

type CardListInputProps = {
	value: string
	onChange: (value: string) => void
}

function getCaretTop(textarea: HTMLTextAreaElement): number {
    const style = getComputedStyle(textarea)
    const mirror = document.createElement('div')
    const properties = [
        'box-sizing', 'width', 'border', 'padding', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-indent', 'word-spacing', 'tab-size'
    ]

    for (const property of properties) {
        mirror.style.setProperty(property, style.getPropertyValue(property))
    }

    mirror.style.position = 'fixed'
    mirror.style.visibility = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.overflowWrap = 'break-word'
    mirror.textContent = textarea.value.slice(0, textarea.selectionStart)

    const marker = document.createElement('span')
    marker.textContent = '\u200b'
    mirror.append(marker)
    document.body.append(mirror)

    const lineHeight =
        parseFloat(style.lineHeight) ||
        parseFloat(style.fontSize) * 1.2

    const top =
        textarea.offsetTop +
        marker.offsetTop +
        lineHeight -
        textarea.scrollTop

    mirror.remove()

    return top
}

export function CardListInput({value, onChange}: CardListInputProps) {
	const [autocompleteQuery, setAutocompleteQuery] = useState('')
    const autocompleteRangeRef = useRef<{ start: number; end: number } | null>(null)
	const [suggestions, setSuggestions] = useState<string[]>([])
    const [activeSuggestion, setActiveSuggestion] = useState(-1)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [suggestionTop, setSuggestionTop] = useState(0)

    function highlightMatch(cardName: string) {
        const index = cardName
            .toLowerCase()
            .indexOf(autocompleteQuery.toLowerCase())

        if (index === -1) return cardName

        const end = index + autocompleteQuery.length

        return (
            <>
                {cardName.slice(0, index)}
                <mark>{cardName.slice(index, end)}</mark>
                {cardName.slice(end)}
            </>
        )
    }

    function selectSuggestion(cardName: string) {
		const textarea = textareaRef.current
        const range = autocompleteRangeRef.current

        if (!textarea || !range) return

        const lineStart = range.start
        const lineEnd = range.end
        const currentLine = value.slice(lineStart, lineEnd)
        const quantity = currentLine.match(/^(\d+)\s+@/)?.[1] ?? '1'
        const replacement = `${quantity} ${cardName}`
        const nextValue =
            value.slice(0, lineStart) +
            replacement +
            value.slice(lineEnd)

		onChange(nextValue)
		closeAutocomplete()

		requestAnimationFrame(() => {
			const nextCursor = lineStart + replacement.length
			textarea.focus()
			textarea.setSelectionRange(nextCursor, nextCursor)
		})
	}

    function closeAutocomplete() {
        setSuggestions([])
        setAutocompleteQuery('')
        setActiveSuggestion(-1)
        autocompleteRangeRef.current = null
    }

    function handleCardListChange(event: ChangeEvent<HTMLTextAreaElement>) {
        const nextValue = event.target.value
        const cursor = event.target.selectionStart
        const lineStart = nextValue.lastIndexOf('\n', cursor - 1) + 1
        const foundLineEnd = nextValue.indexOf('\n', cursor)
        const lineEnd = foundLineEnd === -1 ? nextValue.length : foundLineEnd
        const currentLine = nextValue.slice(lineStart, cursor)
        const match = currentLine.match(/^(?:(\d+)\s+)?@(.{2,})$/)

        onChange(nextValue)
        setSuggestions([])
        setActiveSuggestion(-1)

        if (match) {
            autocompleteRangeRef.current = {
                start: lineStart,
                end: lineEnd
            }

            setSuggestionTop(getCaretTop(event.target))
        } else {
            autocompleteRangeRef.current = null
        }

        setAutocompleteQuery(match?.[2].trim() ?? '')
    }

    function handleAutocompleteKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Escape') {
            closeAutocomplete()
            return
        }

        if (suggestions.length === 0) return

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()

            const direction = event.key === 'ArrowDown' ? 1 : -1
            const nextIndex = Math.max(
                0,
                Math.min(suggestions.length - 1, activeSuggestion + direction)
            )

            setActiveSuggestion(nextIndex)

            requestAnimationFrame(() => {
                document
                    .getElementById(`card-suggestion-${nextIndex}`)
                    ?.scrollIntoView({ block: 'nearest' })
            })

            return
        }

        if (event.key === 'Enter' && activeSuggestion >= 0) {
            event.preventDefault()
            selectSuggestion(suggestions[activeSuggestion])
        }
    }

    function handleAutocompleteBlur(event: FocusEvent<HTMLDivElement>) {
	    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return

        closeAutocomplete()
    }

    useEffect(() => {
		if (!autocompleteQuery) return

		const controller = new AbortController()
		const timeout = window.setTimeout(async () => {
			try {
				const response = await fetch(
					`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(autocompleteQuery)}`,
					{ signal: controller.signal }
				)

				if (!response.ok) throw new Error()

				const result = await response.json() as { data: string[] }
				setSuggestions(result.data)
                setActiveSuggestion(result.data.length > 0 ? 0 : -1)
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) setSuggestions([])
			}
		}, 300)

		return () => {
			window.clearTimeout(timeout)
			controller.abort()
		}
	}, [autocompleteQuery])

	return (
		<div className="card-list-input mb-2" onBlur={handleAutocompleteBlur}>
            <button type="button"
                onClick={
                    () => {
                        onChange('')
                        closeAutocomplete()
                    }
                }
                className="btn danger"
            >
                    <Icon name="trash-can"/> Clear
            </button>
            <textarea
                ref={textareaRef}
                id="card-list"
                name="card-list"
                rows={16}
                cols={50}
                value={value}
                onChange={handleCardListChange}
                placeholder={EXAMPLE_CARD_LIST}
                onKeyDown={handleAutocompleteKeyDown}
                aria-label="Card list"
            />

            {suggestions.length > 0 && (
                <ul
                    className="card-suggestions"
                    aria-label="Card suggestions"
                    style={{ top: suggestionTop }}
                >
                    {suggestions.map((cardName, index) => (
                        <li key={cardName}>
                            <button
                                type="button"
                                id={`card-suggestion-${index}`}
                                className={`${index === activeSuggestion ? ' active' : ''}`}
                                onMouseEnter={() => setActiveSuggestion(index)}
                                onClick={() => selectSuggestion(cardName)}
                            >
                                {highlightMatch(cardName)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

        </div>
	)
}