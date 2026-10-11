import { useState } from 'react'
import { useI18n } from '../../../i18n/context'
import type { SplitCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'
import { SplitHalfTabs } from './SplitHalfTabs'

type Props = {
	card: SplitCardData
	onChange: (card: SplitCardData) => void
	part: 'content' | 'details'
	showFuse?: boolean
	stacked?: boolean
}

export function SplitDetailsForm({ card, onChange, part, showFuse, stacked }: Props) {
	const { t } = useI18n()
	const [side, setSide] = useState<'first' | 'second'>('first')
	if (part === 'details') {
		return <CardDetailsForm card={card} onChange={(changes) => onChange({ ...card, ...changes })} part="details" />
	}
	return <>
		<SplitHalfTabs side={side} onChange={setSide} label={t('cardInformationSection')} stacked={stacked}>
			{side === 'first' ? (
				<CardDetailsForm card={card} onChange={(changes) => onChange({ ...card, ...changes })} part="content" hidePowerToughness />
			) : (
				<CardDetailsForm
					card={{
						...card,
						name: card.secondName,
						manaCost: card.secondManaCost,
						typeLine: card.secondTypeLine,
						rulesText: card.secondRulesText,
						flavorText: card.secondFlavorText,
					}}
					onChange={(changes) => onChange({
						...card,
						secondName: changes.name,
						secondManaCost: changes.manaCost,
						secondTypeLine: changes.typeLine,
						secondRulesText: changes.rulesText,
						secondFlavorText: changes.flavorText,
						centerRulesText: changes.centerRulesText,
					})}
					part="content"
					hidePowerToughness
				/>
			)}
		</SplitHalfTabs>
		{showFuse && <div className="form-group gap-2 mt-3">
			<label htmlFor="split-fuse-reminder">{t('fuseReminder')}</label>
			<textarea
				id="split-fuse-reminder"
				rows={2}
				value={card.fuseReminderText ?? ''}
				onChange={(event) => onChange({ ...card, fuseReminderText: event.target.value })}
			/>
		</div>}
	</>
}
