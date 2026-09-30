import { useI18n } from '../../../i18n/context'
import { Icon } from '../../Icon'
import type { PlaneswalkerCardData } from '../types'
import { SymbolReferenceDialog } from './SymbolReferenceDialog'

type Props = {
	card: PlaneswalkerCardData
	onChange: (card: PlaneswalkerCardData) => void
	part: 'content' | 'details'
	showReverseFace?: boolean
}

export function PlaneswalkerDetailsForm({ card, onChange, part, showReverseFace = false }: Props) {
	const { t } = useI18n()
	const update = (changes: Partial<PlaneswalkerCardData>) => onChange({ ...card, ...changes })

	function updateAbility(index: number, changes: Partial<PlaneswalkerCardData['abilities'][number]>) {
		update({
			abilities: card.abilities.map((ability, abilityIndex) =>
				abilityIndex === index ? { ...ability, ...changes } : ability,
			),
		})
	}

	function removeAbility(index: number) {
		update({ abilities: card.abilities.filter((_, abilityIndex) => abilityIndex !== index) })
	}

	if (part === 'details') return (
		<fieldset>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-artist">{t('artist')}</label>
				<input
					id="planeswalker-artist"
					type="text"
					value={card.artist}
					onChange={(event) => update({ artist: event.target.value })}
				/>
			</div>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-number">{t('cardNumber')}</label>
				<input
					id="planeswalker-number"
					type="text"
					value={card.number}
					onChange={(event) => update({ number: event.target.value })}
				/>
			</div>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-rarity">{t('rarity')}</label>
				<select
					id="planeswalker-rarity"
					value={card.rarity}
					onChange={(event) => update({ rarity: event.target.value as PlaneswalkerCardData['rarity'] })}
				>
					<option value="common">{t('common')}</option>
					<option value="uncommon">{t('uncommon')}</option>
					<option value="rare">{t('rare')}</option>
					<option value="mythic">{t('mythicRare')}</option>
				</select>
			</div>
			<div className="form-group gap-2">
				<label>
					<input
						type="checkbox"
						checked={card.tintSetSymbol}
						onChange={(event) => update({ tintSetSymbol: event.target.checked })}
					/>{' '}
					{t('tintSetSymbolByRarity')}
				</label>
			</div>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-background">{t('backgroundColor')}</label>
				<input
					id="planeswalker-background"
					type="color"
					value={card.backgroundColor}
					onChange={(event) => update({ backgroundColor: event.target.value })}
					style={{ width: '100%' }}
				/>
				<small className="text-muted">{t('backgroundColorHelp')}</small>
			</div>
		</fieldset>
	)

	return (
		<fieldset>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-name">{t('cardName')}</label>
				<input
					id="planeswalker-name"
					type="text"
					value={card.name}
					onChange={(event) => update({ name: event.target.value })}
				/>
			</div>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-mana">{t('manaCost')}</label>
				<input
					id="planeswalker-mana"
					type="text"
					value={card.manaCost}
					placeholder="{2}{U}{U}"
					onChange={(event) => update({ manaCost: event.target.value })}
				/>
				<small className="text-muted">{t('manaCostHelp')} <SymbolReferenceDialog isLink/></small>
			</div>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-type">{t('typeLine')}</label>
				<input
					id="planeswalker-type"
					type="text"
					value={card.typeLine}
					onChange={(event) => update({ typeLine: event.target.value })}
				/>
				<small className="text-muted">{t('typeLineHelp')}</small>
			</div>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-loyalty">{t('startingLoyalty')}</label>
				<input
					id="planeswalker-loyalty"
					type="text"
					value={card.startingLoyalty}
					onChange={(event) => update({ startingLoyalty: event.target.value })}
				/>
			</div>
			{showReverseFace && <>
				<div className="form-group gap-2">
					<label htmlFor="planeswalker-reverse-name">{t('reverseFaceName')}</label>
					<input
						id="planeswalker-reverse-name"
						type="text"
						value={card.reverseFaceName}
						onChange={(event) => update({ reverseFaceName: event.target.value })}
					/>
				</div>
				<div className="form-group gap-2">
					<label htmlFor="planeswalker-reverse-mana">{t('reverseFaceManaCost')}</label>
					<input
						id="planeswalker-reverse-mana"
						type="text"
						value={card.reverseFaceManaCost}
						placeholder="{2}{R}"
						onChange={(event) => update({ reverseFaceManaCost: event.target.value })}
					/>
                    <small className="text-muted">{t('manaCostHelp')} <SymbolReferenceDialog isLink/></small>
				</div>
			</>}

			<h5 className="mt-5">{t('planeswalkerAbilities')}</h5>
			{card.abilities.map((ability, index) => (
				<div key={index} className="planeswalker-ability">
					<div className="form-group gap-2">
						<label htmlFor={`planeswalker-cost-${index}`}>{t('loyaltyCost')}</label>
						<input
							id={`planeswalker-cost-${index}`}
							type="text"
							value={ability.cost}
							placeholder="+1"
							onChange={(event) => updateAbility(index, { cost: event.target.value })}
						/>
					</div>
					<div className="form-group gap-2">
						<label htmlFor={`planeswalker-ability-${index}`}>{t('abilityText')}</label>
						<textarea
							id={`planeswalker-ability-${index}`}
							rows={ability.text ? 3 : 2}
							value={ability.text}
							onChange={(event) => updateAbility(index, { text: event.target.value })}
						/>
					</div>
					{card.abilities.length > 1 && (
						<div className="form-group gap-2 planeswalker-ability-remove">
							<span aria-hidden="true">{t('removeAbility')}</span>
							<button
								type="button"
								className="btn danger"
								aria-label={t('removeAbility')}
								title={t('removeAbility')}
								onClick={() => removeAbility(index)}
							>
								<Icon name="trash-can" />
							</button>
						</div>
					)}
				</div>
			))}
			{card.abilities.length < 4 && (
				<button
					type="button"
					className="btn"
					onClick={() => update({ abilities: [...card.abilities, { cost: '', text: '' }] })}
				>
					<Icon name="plus" /> {t('addAbility')}
				</button>
			)}
		</fieldset>
	)
}
