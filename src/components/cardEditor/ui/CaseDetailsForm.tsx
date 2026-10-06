import { useI18n } from '../../../i18n/context'
import type { CaseCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'

type CaseDetailsFormProps = {
	card: CaseCardData
	onChange: (card: CaseCardData) => void
	part: 'content' | 'details'
}

export function CaseDetailsForm({ card, onChange, part }: CaseDetailsFormProps) {
	const { t } = useI18n()

	function update(changes: Partial<CaseCardData>) {
		onChange({ ...card, ...changes })
	}

	if (part === 'details') {
		return <CardDetailsForm card={card} onChange={update} part="details" />
	}

	return <>
		<CardDetailsForm card={card} onChange={update} hideRulesText hidePowerToughness part="content" />
		<div className="form-group gap-2">
			<label htmlFor="case-rules">{t('rulesText')}</label>
			<textarea id="case-rules" rows={3} value={card.rulesText} onChange={(event) => update({ rulesText: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="case-solve-condition">{t('caseSolveCondition')}</label>
			<textarea id="case-solve-condition" rows={3} value={card.solveCondition} onChange={(event) => update({ solveCondition: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="case-solved-ability">{t('caseSolvedAbility')}</label>
			<textarea id="case-solved-ability" rows={3} value={card.solvedAbility} onChange={(event) => update({ solvedAbility: event.target.value })} />
		</div>
	</>
}
