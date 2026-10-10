import { useI18n } from '../../../i18n/context'
import { PLANESWALKER_STYLES, type PlaneswalkerStyle } from '../editorOptions'
import type { FrameVariant } from '../types'
import { FrameColorPicker } from './FrameColorPicker'

type PlaneswalkerFrameControlsProps = {
	style: PlaneswalkerStyle
	onStyleChange: (style: PlaneswalkerStyle) => void
	abilityTextColor: '#fff' | '#111'
	onAbilityTextColorChange: (color: '#fff' | '#111') => void
	frameSelection: FrameVariant | 'auto'
	onFrameSelectionChange: (variant: FrameVariant | 'auto') => void
	limitedColors: boolean
}

export function PlaneswalkerFrameControls({
	style,
	onStyleChange,
	abilityTextColor,
	onAbilityTextColorChange,
	frameSelection,
	onFrameSelectionChange,
	limitedColors,
}: PlaneswalkerFrameControlsProps) {
	const { t } = useI18n()
	const isSdcc = style.startsWith('planeswalker-sdcc15')

	return (
		<>
			<div className="form-group gap-2">
				<label htmlFor="planeswalker-style">{t('planeswalkerStyle')}</label>
				<select
					id="planeswalker-style"
					value={style}
					onChange={(event) => onStyleChange(event.target.value as PlaneswalkerStyle)}
				>
					{PLANESWALKER_STYLES.map(({ id, label }) => (
						<option key={id} value={id}>{t(label)}</option>
					))}
				</select>
			</div>
			{isSdcc && (
				<div className="form-group gap-2 mb-5">
					<label htmlFor="planeswalker-ability-color">{t('abilityTextColor')}</label>
					<select
						id="planeswalker-ability-color"
						value={abilityTextColor}
						onChange={(event) => onAbilityTextColorChange(event.target.value as '#fff' | '#111')}
					>
						<option value="#fff">{t('frameBorderWhite')}</option>
						<option value="#111">{t('frameBorderBlack')}</option>
					</select>
				</div>
			)}
			{!isSdcc && (
				<div className="form-group gap-2 mb-5">
					<FrameColorPicker
						value={frameSelection}
						onChange={onFrameSelectionChange}
						hideLands
						hideVehicles
						hideArtifacts={limitedColors}
						hideColorless={limitedColors}
					/>
				</div>
			)}
		</>
	)
}
