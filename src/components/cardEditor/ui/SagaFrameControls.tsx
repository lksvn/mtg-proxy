import { useI18n } from '../../../i18n/context'
import { SAGA_STYLES, type SagaStyle } from '../editorOptions'
import type { FrameVariant } from '../types'
import { FrameColorPicker } from './FrameColorPicker'

type SagaFrameControlsProps = {
	style: SagaStyle
	onStyleChange: (style: SagaStyle) => void
	frameSelection: FrameVariant | 'auto'
	onFrameSelectionChange: (variant: FrameVariant | 'auto') => void
}

export function SagaFrameControls({
	style,
	onStyleChange,
	frameSelection,
	onFrameSelectionChange,
}: SagaFrameControlsProps) {
	const { t } = useI18n()

	return (
		<>
			<div className="form-group gap-2">
				<label htmlFor="saga-style">{t('sagaStyle')}</label>
				<select
					id="saga-style"
					value={style}
					onChange={(event) => onStyleChange(event.target.value as SagaStyle)}
				>
					{SAGA_STYLES.map(({ id, label }) => (
						<option key={id} value={id}>{t(label)}</option>
					))}
				</select>
			</div>
			<div className="form-group gap-2 mb-5">
				<FrameColorPicker
					value={frameSelection}
					onChange={onFrameSelectionChange}
					hideVehicles
					hideArtifacts={!['saga-nyx', 'saga-universes-beyond'].includes(style)}
					hideColorless={['saga-regular', 'saga-transform', 'saga-lord-of-the-rings', 'saga-universes-beyond-regular'].includes(style)}
					hideLands={!['saga-regular', 'saga-transform', 'saga-universes-beyond-regular', 'saga-creature-regular'].includes(style)}
					hideColoredLands
				/>
			</div>
		</>
	)
}
