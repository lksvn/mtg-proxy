import { useId, type ReactNode } from 'react'
import { Icon } from '../../Icon'
import { nextTabIndex } from './tabNavigation'

type Props = {
	labels: readonly string[]
	activeIndex: number
	onChange: (index: number) => void
	label: string
	children: ReactNode
	stacked?: boolean
	numbered?: boolean
	showIcons?: boolean
}

export function ContentTabs({ labels, activeIndex, onChange, label, children, stacked, numbered, showIcons = true }: Props) {
	const id = useId()
	return <div className="split-half-tab-layout">
		<div role="tablist" aria-label={label} className="split-half-tabs">
			{labels.map((title, index) => (
				<button
					key={index}
					id={`${id}-${index}`}
					type="button"
					role="tab"
					aria-selected={activeIndex === index}
					aria-controls={`${id}-panel`}
					tabIndex={activeIndex === index ? 0 : -1}
					className="split-half-tab"
					onClick={() => onChange(index)}
					onKeyDown={(event) => {
						if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
						event.preventDefault()
						const next = nextTabIndex(index, labels.length, event.key)
						onChange(next)
						document.getElementById(`${id}-${next}`)?.focus()
					}}
				>
					{showIcons && (numbered ? <span aria-hidden="true">{index + 1}</span> : <Icon name="arrow-right" className={stacked
						? index === 0 ? 'split-tab-arrow-up' : 'split-tab-arrow-down'
						: index === 0 ? 'split-tab-arrow-left' : undefined} />)}
					{title}
				</button>
			))}
		</div>
		<div id={`${id}-panel`} className="split-half-panel" role="tabpanel" aria-labelledby={`${id}-${activeIndex}`} tabIndex={0}>
			{children}
		</div>
	</div>
}
