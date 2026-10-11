import { RulesTextarea } from './RulesTextarea'
import { useState } from 'react'
import { useI18n } from '../../../i18n/context'
import { formatPowerToughnessInput } from '../cardText'
import type { LevelerCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'
import { ContentTabs } from './ContentTabs'

type Props = {
	card: LevelerCardData
	onChange: (card: LevelerCardData) => void
	part: 'content' | 'details'
}

export function LevelerDetailsForm({ card, onChange, part }: Props) {
	const { t } = useI18n()
	const [tier, setTier] = useState(0)
	const update = (changes: Partial<LevelerCardData>) => onChange({ ...card, ...changes })

	if (part === 'details') return <CardDetailsForm card={card} onChange={update} part="details" />

	return <ContentTabs labels={[t('levelBaseTab'), t('levelSecondTab'), t('levelThirdTab')]} activeIndex={tier} onChange={setTier} label={t('cardInformationSection')} numbered>
		{tier === 0 && <>
		<CardDetailsForm card={card} onChange={update} hideRulesText part="content" />
		<div className="form-group gap-2">
			<label htmlFor="leveler-level-up">{t('levelUpText')}</label>
			<RulesTextarea id="leveler-level-up" rows={6} value={card.levelUpText} onChange={(event) => update({ levelUpText: event.target.value })} />
		</div>
		</>}
		{tier === 1 && <LevelTierFields prefix="two" level={card.levelTwo} rules={card.levelTwoRulesText} powerToughness={card.levelTwoPowerToughness} onChange={update} />}
		{tier === 2 && <LevelTierFields prefix="three" level={card.levelThree} rules={card.levelThreeRulesText} powerToughness={card.levelThreePowerToughness} onChange={update} />}
	</ContentTabs>
}

function LevelTierFields({ prefix, level, rules, powerToughness, onChange }: {
	prefix: 'two' | 'three'
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
		<div className="form-group gap-2">
			<label htmlFor={`leveler-${prefix}-range`}>{t('levelRange')}</label>
			<input id={`leveler-${prefix}-range`} type="text" value={level} onChange={(event) => onChange({ [levelKey]: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor={`leveler-${prefix}-rules`}>{t('rulesText')}</label>
			<RulesTextarea id={`leveler-${prefix}-rules`} rows={6} value={rules} onChange={(event) => onChange({ [rulesKey]: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor={`leveler-${prefix}-pt`}>{t('powerToughness')}</label>
			<input id={`leveler-${prefix}-pt`} type="text" value={powerToughness} placeholder="***/***" onChange={(event) => onChange({ [powerKey]: formatPowerToughnessInput(event.target.value) })} />
		</div>
	</>
}
