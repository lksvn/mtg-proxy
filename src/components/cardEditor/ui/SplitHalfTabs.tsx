import { useId, type ReactNode } from 'react'
import { useI18n } from '../../../i18n/context'
import { Icon } from '../../Icon'

type Props = {
	side: 'first' | 'second'
	onChange: (side: 'first' | 'second') => void
	label: string
	children: ReactNode
	stacked?: boolean
}

export function SplitHalfTabs({ side, onChange, label, children, stacked }: Props) {
	const id = useId()
	const { t } = useI18n()
	return <div className="split-half-tab-layout">
		<div role="tablist" aria-label={label} className="split-half-tabs">
			{(['first', 'second'] as const).map((half) => (
				<button
					key={half}
					id={`${id}-${half}`}
					type="button"
					role="tab"
					aria-selected={side === half}
					aria-controls={`${id}-panel`}
					tabIndex={side === half ? 0 : -1}
					className="split-half-tab"
					onClick={() => onChange(half)}
					onKeyDown={(event) => {
						if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
						event.preventDefault()
						const next = event.key === 'Home' ? 'first'
							: event.key === 'End' ? 'second'
							: side === 'first' ? 'second' : 'first'
						onChange(next)
						document.getElementById(`${id}-${next}`)?.focus()
					}}
				>
					<Icon name="arrow-right" className={stacked
						? half === 'first' ? 'split-tab-arrow-up' : 'split-tab-arrow-down'
						: half === 'first' ? 'split-tab-arrow-left' : undefined} />
					{t(stacked
						? half === 'first' ? 'splitTopHalf' : 'splitBottomHalf'
						: half === 'first' ? 'splitFirstHalf' : 'splitSecondHalf')}
				</button>
			))}
		</div>
		<div id={`${id}-panel`} className="split-half-panel" role="tabpanel" aria-labelledby={`${id}-${side}`} tabIndex={0}>
			{children}
		</div>
	</div>
}
