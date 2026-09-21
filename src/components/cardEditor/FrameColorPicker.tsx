import { useRef, useState } from 'react'
import { Icon } from '../Icon'
import { useI18n } from '../../i18n/context'
import type { TranslationKey } from '../../i18n/messages'
import type { FrameVariant } from './types'

type FrameChoice = FrameVariant | 'auto'

const OPTIONS: { value: FrameChoice; label: TranslationKey; symbol?: string }[] = [
	{ value: 'auto', label: 'frameAuto' },
	{ value: 'W', label: 'frameWhite', symbol: 'w' },
	{ value: 'U', label: 'frameBlue', symbol: 'u' },
	{ value: 'B', label: 'frameBlack', symbol: 'b' },
	{ value: 'R', label: 'frameRed', symbol: 'r' },
	{ value: 'G', label: 'frameGreen', symbol: 'g' },
	{ value: 'M', label: 'frameMulticolored' },
	{ value: 'A', label: 'frameArtifact' },
	{ value: 'V', label: 'frameVehicle' },
	{ value: 'C', label: 'frameColorless', symbol: 'c' },
	{ value: 'L', label: 'frameLand' },
	{ value: 'WL', label: 'frameWhiteLand', symbol: 'w' },
	{ value: 'UL', label: 'frameBlueLand', symbol: 'u' },
	{ value: 'BL', label: 'frameBlackLand', symbol: 'b' },
	{ value: 'RL', label: 'frameRedLand', symbol: 'r' },
	{ value: 'GL', label: 'frameGreenLand', symbol: 'g' },
	{ value: 'ML', label: 'frameMulticoloredLand' },
]

function ChoiceIcon({ value, symbol }: { value: FrameChoice; symbol?: string }) {
	return symbol
		? <img src={`${import.meta.env.BASE_URL}img/manaSymbols/${symbol}.svg`} alt="" />
		: <span className={`frame-color-swatch frame-color-swatch-${value}`} aria-hidden="true" />
}

export function FrameColorPicker({ value, onChange }: { value: FrameChoice; onChange: (value: FrameChoice) => void }) {
	const { t } = useI18n()
	const triggerRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState(0)
	const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0]

	function highlight(index: number) {
		setActiveIndex(index)
		requestAnimationFrame(() => document.getElementById(`frame-color-option-${index}`)?.scrollIntoView({ block: 'nearest' }))
	}

	function choose(option: FrameChoice) {
		onChange(option)
		setOpen(false)
		triggerRef.current?.focus()
	}

	return (
		<div className="form-group" onBlur={(event) => {
			if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
		}}>
			<span id="card-frame-label">{t('frame')}</span>
			<div className="frame-color-picker">
				<button
					ref={triggerRef}
					type="button"
					role="combobox"
					aria-labelledby="card-frame-label card-frame-selected"
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={open ? 'frame-color-options' : undefined}
					aria-activedescendant={open ? `frame-color-option-${activeIndex}` : undefined}
					onClick={() => {
						if (!open) setActiveIndex(OPTIONS.findIndex((option) => option.value === value))
						setOpen(!open)
					}}
					onKeyDown={(event) => {
						if (event.key === 'Escape') { setOpen(false); return }
						if (event.key === 'Enter' && open) {
							event.preventDefault()
							choose(OPTIONS[activeIndex].value)
							return
						}
						if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
						event.preventDefault()
						const current = open ? activeIndex : OPTIONS.findIndex((option) => option.value === value)
						const next = event.key === 'Home' ? 0
							: event.key === 'End' ? OPTIONS.length - 1
							: Math.max(0, Math.min(OPTIONS.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)))
						setOpen(true)
						highlight(next)
					}}
				>
					<span className="frame-color-choice" id="card-frame-selected">
						<ChoiceIcon value={selected.value} symbol={selected.symbol} />{t(selected.label)}
					</span>
					<Icon name="chevron-down" />
				</button>
				{open && <div id="frame-color-options" role="listbox" aria-labelledby="card-frame-label" className="frame-color-options">
					{OPTIONS.map((option, index) => <button
						key={option.value}
						id={`frame-color-option-${index}`}
						type="button"
						role="option"
						className="frame-color-choice"
						aria-label={t(option.label)}
						aria-selected={activeIndex === index}
						tabIndex={-1}
						onMouseEnter={() => setActiveIndex(index)}
						onClick={() => choose(option.value)}
					>
						<ChoiceIcon value={option.value} symbol={option.symbol} />{t(option.label)}
					</button>)}
				</div>}
			</div>
		</div>
	)
}
