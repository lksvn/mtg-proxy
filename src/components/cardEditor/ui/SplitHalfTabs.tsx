import type { ReactNode } from 'react'
import { useI18n } from '../../../i18n/context'
import { ContentTabs } from './ContentTabs'

type Props = {
	side: 'first' | 'second'
	onChange: (side: 'first' | 'second') => void
	label: string
	children: ReactNode
	stacked?: boolean
	labels?: readonly [string, string]
}

export function SplitHalfTabs({ side, onChange, label, children, stacked, labels }: Props) {
	const { t } = useI18n()
	return <ContentTabs
		labels={labels ?? [t(stacked ? 'splitTopHalf' : 'splitFirstHalf'), t(stacked ? 'splitBottomHalf' : 'splitSecondHalf')]}
		activeIndex={side === 'first' ? 0 : 1}
		onChange={(index) => onChange(index === 0 ? 'first' : 'second')}
		label={label}
		stacked={stacked}
	>
		{children}
	</ContentTabs>
}
