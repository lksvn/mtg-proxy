import { useI18n } from '../../../i18n/context'
import type { AdventureCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'

type Props = {
	card: AdventureCardData
	onChange: (card: AdventureCardData) => void
	part: 'content' | 'details'
}

export function AdventureDetailsForm({ card, onChange, part }: Props) {
	const { t } = useI18n()
	const update = (changes: Partial<AdventureCardData>) => onChange({ ...card, ...changes })

	if (part === 'details') {
		return <CardDetailsForm card={card} onChange={update} part="details" />
	}

	return <>
		<CardDetailsForm card={card} onChange={update} part="content" />
		<h5 className="mt-5">{t('adventureSpell')}</h5>
		<div className="form-group gap-2">
			<label htmlFor="adventure-name">{t('cardName')}</label>
			<input id="adventure-name" type="text" value={card.adventureName} onChange={(event) => update({ adventureName: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="adventure-mana">{t('manaCost')}</label>
			<input id="adventure-mana" type="text" value={card.adventureManaCost} onChange={(event) => update({ adventureManaCost: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="adventure-type">{t('typeLine')}</label>
			<input id="adventure-type" type="text" value={card.adventureTypeLine} onChange={(event) => update({ adventureTypeLine: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="adventure-rules">{t('rulesText')}</label>
			<textarea id="adventure-rules" rows={3} value={card.adventureRulesText} onChange={(event) => update({ adventureRulesText: event.target.value })} />
		</div>
	</>
}
