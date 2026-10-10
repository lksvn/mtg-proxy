import { useI18n } from '../../../i18n/context'
import { FRAME_STYLE_GROUPS } from '../editorOptions'
import { getFrameFamily, type FrameBorderStyle, type FrameFamilyId } from '../frameFamilies'
import type { FrameVariant } from '../types'
import { FrameColorPicker } from './FrameColorPicker'

type CardFrameControlsProps = {
	frameFamily: FrameFamilyId
	onFrameFamilyChange: (family: FrameFamilyId) => void
	borderStyle: FrameBorderStyle
	onBorderStyleChange: (border: FrameBorderStyle) => void
	frameSelection: FrameVariant | 'auto'
	onFrameSelectionChange: (variant: FrameVariant | 'auto') => void
	search: string
	onSearchChange: (search: string) => void
}

export function CardFrameControls({
	frameFamily,
	onFrameFamilyChange,
	borderStyle,
	onBorderStyleChange,
	frameSelection,
	onFrameSelectionChange,
	search,
	onSearchChange,
}: CardFrameControlsProps) {
	const { t } = useI18n()
	const normalizedSearch = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

	return (
		<>
			<div
				className="gap-3"
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
					gridAutoFlow: 'dense',
				}}
			>
				<div className="form-group gap-2">
					<label htmlFor="card-frame-style-search">{t('searchFrameStyles')}</label>
					<input
						id="card-frame-style-search"
						type="search"
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
					/>
				</div>
				<div className="form-group gap-2">
					<label htmlFor="card-frame-style">{t('frameStyle')}</label>
					<select
						id="card-frame-style"
						value={frameFamily}
						onChange={(event) => onFrameFamilyChange(event.target.value as FrameFamilyId)}
					>
						{FRAME_STYLE_GROUPS.map((group) => {
							const options = group.options.filter((option) =>
								option.id === frameFamily ||
								t(option.label).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalizedSearch) ||
								option.id.includes(normalizedSearch),
							)
							return options.length > 0 && (
								<optgroup key={group.label} label={t(group.label)}>
									{options.map((option) => (
										<option key={option.id} value={option.id}>{t(option.label)}</option>
									))}
								</optgroup>
							)
						})}
					</select>
				</div>
			</div>
			{frameFamily !== 'token-unglued' && getFrameFamily(frameFamily).borderMask && (
				<div className="form-group gap-2">
					<label htmlFor="card-frame-border">{t('frameBorder')}</label>
					<select
						id="card-frame-border"
						value={borderStyle}
						onChange={(event) => onBorderStyleChange(event.target.value as FrameBorderStyle)}
					>
						<option value="black">{t('frameBorderBlack')}</option>
						<option value="white">{t('frameBorderWhite')}</option>
						<option value="silver">{t('frameBorderSilver')}</option>
						<option value="gold">{t('frameBorderGold')}</option>
					</select>
				</div>
			)}
			<div className="form-group gap-2">
				<FrameColorPicker value={frameSelection} onChange={onFrameSelectionChange} />
			</div>
		</>
	)
}
