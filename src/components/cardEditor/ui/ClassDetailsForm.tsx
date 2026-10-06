import { useI18n } from '../../../i18n/context'
import type { ClassCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'

type ClassDetailsFormProps = {
	card: ClassCardData
	onChange: (card: ClassCardData) => void
	part: 'content' | 'details'
}

export function ClassDetailsForm({ card, onChange, part }: ClassDetailsFormProps) {
	const { t } = useI18n()

	function update(changes: Partial<ClassCardData>) {
		onChange({ ...card, ...changes })
	}

	if (part === 'details') {
		return <CardDetailsForm card={card} onChange={update} part="details" />
	}

	return <>
		<CardDetailsForm card={card} onChange={update} hideRulesText hidePowerToughness part="content" />
		<h5 className="mt-5">{t('classLevels')}</h5>
		{card.levels.map((level, index) => <div key={index} className={'planeswalker-ability' + (index > 0 ? ' ' : ' nocols')}>
			{index > 0 && <div className="form-group gap-2">
				<label htmlFor={`class-level-cost-${index}`}>{t('levelCost')}</label>
				<input
					id={`class-level-cost-${index}`}
					type="text"
					value={level.cost}
					onChange={(event) => {
						const levels = [...card.levels]
						levels[index] = { ...level, cost: event.target.value }
						update({ levels })
					}}
				/>
			</div>}
			{index > 0 && <div className="form-group gap-2">
				<label htmlFor={`class-level-name-${index}`}>{t('levelName')}</label>
				<input
					id={`class-level-name-${index}`}
					type="text"
					value={level.name}
					onChange={(event) => {
						const levels = [...card.levels]
						levels[index] = { ...level, name: event.target.value }
						update({ levels })
					}}
				/>
			</div>}
			<div className="form-group gap-2">
				<label htmlFor={`class-level-text-${index}`}>{t('abilityText')}</label>
				<textarea
					id={`class-level-text-${index}`}
					rows={3}
					value={level.text}
					onChange={(event) => {
						const levels = [...card.levels]
						levels[index] = { ...level, text: event.target.value }
						update({ levels })
					}}
				/>
			</div>
		</div>)}
	</>
}
