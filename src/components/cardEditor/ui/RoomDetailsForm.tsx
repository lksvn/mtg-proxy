import { useI18n } from '../../../i18n/context'
import type { RoomCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'

type RoomDetailsFormProps = {
	card: RoomCardData
	onChange: (card: RoomCardData) => void
	part: 'content' | 'details'
}

export function RoomDetailsForm({ card, onChange, part }: RoomDetailsFormProps) {
	const { t } = useI18n()

	function update(changes: Partial<RoomCardData>) {
		onChange({ ...card, ...changes })
	}

	if (part === 'details') {
		return <CardDetailsForm card={card} onChange={update} part="details" />
	}

	return <>
		<CardDetailsForm card={card} onChange={update} hideRulesText hideTypeLine hidePowerToughness part="content" />
		<div className="form-group gap-2">
			<label htmlFor="room-left-rules">{t('roomLeftRules')}</label>
			<textarea id="room-left-rules" rows={3} value={card.rulesText} onChange={(event) => update({ rulesText: event.target.value })} />
		</div>
		<h5 className="mt-5">{t('roomOtherDoor')}</h5>
		<div className="form-group gap-2">
			<label htmlFor="room-other-name">{t('cardName')}</label>
			<input id="room-other-name" type="text" value={card.otherName} onChange={(event) => update({ otherName: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="room-other-mana">{t('manaCost')}</label>
			<input id="room-other-mana" type="text" value={card.otherManaCost} onChange={(event) => update({ otherManaCost: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="room-other-rules">{t('rulesText')}</label>
			<textarea id="room-other-rules" rows={3} value={card.otherRulesText} onChange={(event) => update({ otherRulesText: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="room-type">{t('typeLine')}</label>
			<input id="room-type" type="text" value={card.typeLine} onChange={(event) => update({ typeLine: event.target.value })} />
		</div>
		<div className="form-group gap-2">
			<label htmlFor="room-reminder">{t('roomReminder')}</label>
			<textarea id="room-reminder" rows={3} value={card.reminderText} onChange={(event) => update({ reminderText: event.target.value })} />
		</div>
	</>
}
