import type { CustomCardData } from '../types'
import { countManaCostItems } from '../cardText'
import { useI18n } from '../../../i18n/context'
import { SymbolReferenceDialog } from './SymbolReferenceDialog'

type CardDetailsFormProps = {
	card: CustomCardData
	onChange: (card: CustomCardData) => void
	maxManaItems?: number
	hideManaCost?: boolean
	hideRulesText?: boolean
	hideNameAndType?: boolean
	hideTypeLine?: boolean
	hidePowerToughness?: boolean
	powerToughnessLabel?: 'powerToughness' | 'defense'
	part?: 'content' | 'details'
}

export function CardDetailsForm({ card, onChange, maxManaItems, hideManaCost, hideRulesText, hideNameAndType, hideTypeLine, hidePowerToughness, powerToughnessLabel = 'powerToughness', part }: CardDetailsFormProps) {
	const { t } = useI18n()

	function update(changes: Partial<CustomCardData>) {
		onChange({ ...card, ...changes })
	}

	return (
		<fieldset>
			{part !== 'details' && <>
			{!hideNameAndType && <div className="form-group gap-2">
				<label htmlFor="card-name">{t('cardName')}</label>
				<input
					id="card-name"
					type="text"
					value={card.name}
					onChange={(event) => update({ name: event.target.value })}
				/>
			</div>}

			{!hideManaCost && <div className="form-group gap-2">
				<label htmlFor="card-mana-cost">{t('manaCost')}</label>
				<input
					id="card-mana-cost"
					type="text"
					value={card.manaCost}
					placeholder="{2}{U}{U}"
					onChange={(event) => {
						const next = event.target.value
						if (maxManaItems && countManaCostItems(next) > Math.max(maxManaItems, countManaCostItems(card.manaCost))) return
						update({ manaCost: next })
					}}
				/>
				<small className="text-muted">{t('manaCostHelp')} <SymbolReferenceDialog isLink/></small>
				{maxManaItems && <small className="text-muted">{t('manaCostLimitFuture')}</small>}
			</div>}

			{!hideNameAndType && !hideTypeLine && <div className="form-group gap-2">
				<label htmlFor="card-type-line">{t('typeLine')}</label>
				<input
					id="card-type-line"
					type="text"
					value={card.typeLine}
						onChange={(event) =>
						update({ typeLine: event.target.value })
					}
				/>
				<small className="text-muted">{t('typeLineHelp')}</small>
			</div>}

			{!hideRulesText && <div className="form-group gap-2">
				<label htmlFor="card-rules-text">{t('rulesText')}</label>
				<textarea
					id="card-rules-text"
					rows={5}
					value={card.rulesText}
					onChange={(event) =>
						update({ rulesText: event.target.value })
					}
				/>
				<label>
					<input
						type="checkbox"
						checked={card.centerRulesText}
						onChange={(event) => update({ centerRulesText: event.target.checked })}
					/> {t('centerRulesText')}
				</label>
                <details>
					<summary>{t('formatting')}</summary>
					<ul className="pl-3">
						<li>{t('formatManaSymbols')}: <code>{'{W} {U} {2} {W/U}'}</code></li>
						<li>{t('formatLoyaltySymbols')}: <code>[+1] [0] [-1]</code></li>
						<li>{t('formatReminderText')}: <code>{t('formatReminderExample')}</code></li>
						<li>{t('formatAbilityName')}: <code>{t('formatAbilityExample')}</code></li>
					</ul>
					<SymbolReferenceDialog />
                </details>
			</div>}

			{!hideRulesText && <div className="form-group gap-2">
				<label htmlFor="card-flavor-text">{t('flavorText')}</label>
				<textarea
					id="card-flavor-text"
					rows={3}
					value={card.flavorText}
					onChange={(event) =>
						update({ flavorText: event.target.value })
					}
				/>
			</div>}

			{!hidePowerToughness && <div className="form-group gap-2">
				<label htmlFor="card-power-toughness">{t(powerToughnessLabel)}</label>
				<input
					id="card-power-toughness"
					type="text"
					value={card.powerToughness}
					placeholder={powerToughnessLabel === 'defense' ? '4' : '3/3'}
					onChange={(event) =>
						update({ powerToughness: event.target.value })
					}
				/>
			</div>}
			</>}

			{part !== 'content' && <>
			<div className="form-group gap-2">
				<label htmlFor="card-artist">{t('artist')}</label>
				<input
					id="card-artist"
					type="text"
					value={card.artist}
					onChange={(event) =>
						update({ artist: event.target.value })
					}
				/>
			</div>

            <div className="form-group gap-2">
				<label htmlFor="card-number">{t('cardNumber')}</label>
				<input
					id="card-number"
					type="text"
					value={card.number}
					onChange={(event) =>
						update({ number: event.target.value })
					}
				/>
			</div>

			<div className="form-group gap-2">
				<label htmlFor="card-rarity">{t('rarity')}</label>
				<select
					id="card-rarity"
					value={card.rarity}
					onChange={(event) =>
						update({
							rarity: event.target.value as CustomCardData['rarity'],
						})
					}
				>
					<option value="common">{t('common')}</option>
					<option value="uncommon">{t('uncommon')}</option>
					<option value="rare">{t('rare')}</option>
					<option value="mythic">{t('mythicRare')}</option>
				</select>

                <label>
                    <input
                        type="checkbox"
                        checked={card.tintSetSymbol}
                        onChange={(event) =>
                            update({ tintSetSymbol: event.target.checked })
                        }
                    /> {t('tintSetSymbolByRarity')}
                </label>

                <div className="form-group gap-2">
                    <label htmlFor="card-background">{t('backgroundColor')}</label>
                    <input
                        id="card-background"
                        type="color"
                        value={card.backgroundColor}
                        onChange={(event) =>
                            update({ backgroundColor: event.target.value })
                        }
                        style={{ width: '100%' }}
                    />
                    <small className="text-muted">{t('backgroundColorHelp')}</small>
                </div>
			</div>
			</>}
		</fieldset>
	)
}
