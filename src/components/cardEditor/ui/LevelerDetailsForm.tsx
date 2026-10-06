import { useI18n } from '../../../i18n/context'
import { formatPowerToughnessInput } from '../cardText'
import type { LevelerCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'

type Props = {
	card: LevelerCardData
	onChange: (card: LevelerCardData) => void
	part: 'content' | 'details'
}

export function LevelerDetailsForm({ card, onChange, part }: Props) {
	const { t } = useI18n()
	const update = (changes: Partial<LevelerCardData>) => onChange({ ...card, ...changes })

	if (part === 'details') return <CardDetailsForm card={card} onChange={update} part="details" />

	return <>
		<CardDetailsForm card={card} onChange={update} hideRulesText part="content" />
		<div className="form-group gap-2">
			<label htmlFor="leveler-level-up">{t('levelUpText')}</label>
			<textarea id="leveler-level-up" rows={3} value={card.levelUpText} onChange={(event) => update({ levelUpText: event.target.value })} />
		</div>
		<LevelTierFields prefix="two" label={t('levelTwo')} level={card.levelTwo} rules={card.levelTwoRulesText} powerToughness={card.levelTwoPowerToughness} onChange={update} />
		<LevelTierFields prefix="three" label={t('levelThree')} level={card.levelThree} rules={card.levelThreeRulesText} powerToughness={card.levelThreePowerToughness} onChange={update} />
	</>
}

function LevelTierFields({ prefix, label, level, rules, powerToughness, onChange }: {
	prefix: 'two' | 'three'
	label: string
	level: string
	rules: string
	powerToughness: string
	onChange: (changes: Partial<LevelerCardData>) => void
}) {
	const { t } = useI18n()
	const levelKey = prefix === 'two' ? 'levelTwo' : 'levelThree'
	const rulesKey = prefix === 'two' ? 'levelTwoRulesText' : 'levelThreeRulesText'
	const powerKey = prefix === 'two' ? 'levelTwoPowerToughness' : 'levelThreePowerToughness'

	return <>
		<h5 className="mt-5">{label}</h5>
		<div className="form-group gap-2">
			<label htmlFor={`leveler-${prefix}-range`}>{t('levelRange')}</label>
			<input id={`leveler-${prefix}-range`} type="text" value={level} onChange={(event) => onChange({ [levelKey]: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor={`leveler-${prefix}-rules`}>{t('rulesText')}</label>
			<textarea id={`leveler-${prefix}-rules`} rows={3} value={rules} onChange={(event) => onChange({ [rulesKey]: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor={`leveler-${prefix}-pt`}>{t('powerToughness')}</label>
			<input id={`leveler-${prefix}-pt`} type="text" value={powerToughness} placeholder="***/***" onChange={(event) => onChange({ [powerKey]: formatPowerToughnessInput(event.target.value) })} />
		</div>
	</>
}
