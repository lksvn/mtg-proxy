import { useI18n } from '../../../i18n/context'
import { FRAME_STYLE_GROUPS } from '../editorOptions'
import { getFrameFamily, resolveFrameVariant, type FrameBorderStyle, type FrameFamilyId } from '../frameFamilies'
import type { FrameVariant } from '../types'
import { FrameColorPicker } from './FrameColorPicker'
import { TRANSFORM_ICONS, type TransformIcon } from '../transformIcons'

type CardFrameControlsProps = {
	frameFamily: FrameFamilyId
	onFrameFamilyChange: (family: FrameFamilyId) => void
	borderStyle: FrameBorderStyle
	onBorderStyleChange: (border: FrameBorderStyle) => void
	transformIcon?: TransformIcon
	onTransformIconChange: (icon: TransformIcon | undefined) => void
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
	transformIcon,
	onTransformIconChange,
	frameSelection,
	onFrameSelectionChange,
	search,
	onSearchChange,
}: CardFrameControlsProps) {
	const { t } = useI18n()
	const isUbNyx = frameFamily === 'm15-transform-ub-nyx-front' || frameFamily === 'm15-transform-ub-nyx-back'
	const isModalNyx = [
		'm15-modal-nyx-front',
		'm15-modal-nyx-back',
		'm15-modal-ub-nyx-front',
		'm15-modal-ub-nyx-back',
	].includes(frameFamily)
	const isKaldheim = frameFamily === 'kaldheim-showcase'
	const isModalBorderless = frameFamily === 'm15-modal-borderless-front' || frameFamily === 'm15-modal-borderless-back'
	const isModalExtended = frameFamily === 'm15-modal-extended-front' || frameFamily === 'm15-modal-extended-back'
	const isModalSnow = frameFamily === 'm15-modal-snow-front' || frameFamily === 'm15-modal-snow-back'
	const isOriginalNyx = frameFamily === 'm15-transform-nyx-original-back'
	const isOriginalSnow = frameFamily === 'm15-transform-snow-original-back'
	const isBorderlessTransform = frameFamily === 'm15-transform-borderless-front' || frameFamily === 'm15-transform-borderless-back'
	const isExtendedTransform = frameFamily === 'm15-transform-extended-front' || frameFamily === 'm15-transform-extended-back'
	const isDoubleFeature = frameFamily === 'm15-transform-double-feature-front' || frameFamily === 'm15-transform-double-feature-back'
	const isOriginalBack = frameFamily === 'm15-transform-original-back' || frameFamily === 'm15-transform-ub-original-back'
	const isNeonInk = frameFamily === 'neon-ink'
	const hideColoredLands = isModalExtended || isOriginalBack || isBorderlessTransform || isExtendedTransform || isDoubleFeature || ['m15-transform-ub-back', 'm15-transform-snow-back', 'm15-transform-nyx-back'].includes(frameFamily)
	const displayedSelection = (isKaldheim || isModalBorderless || isModalExtended || isModalSnow || isModalNyx || isNeonInk || isOriginalSnow || isOriginalNyx || isOriginalBack || isUbNyx || isBorderlessTransform || isExtendedTransform || isDoubleFeature) && frameSelection !== 'auto'
		? resolveFrameVariant(getFrameFamily(frameFamily), frameSelection)
		: hideColoredLands && ['WL', 'UL', 'BL', 'RL', 'GL', 'ML'].includes(frameSelection)
		? 'L'
		: frameSelection
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
			{getFrameFamily(frameFamily).layout.transformIcon && (
				<div className="form-group gap-2">
					<label htmlFor="card-transform-icon">{t('transformIcon')}</label>
					<select
						id="card-transform-icon"
						value={transformIcon ?? ''}
						onChange={(event) => onTransformIconChange(event.target.value ? event.target.value as TransformIcon : undefined)}
					>
						<option value="">{t('transformIconDefault')}</option>
						{TRANSFORM_ICONS.map((icon) => (
							<option key={icon.id} value={icon.id}>{t(icon.label)}</option>
						))}
					</select>
				</div>
			)}
			<div className="form-group gap-2">
				<FrameColorPicker
					value={displayedSelection}
					onChange={onFrameSelectionChange}
					hideColoredLands={isNeonInk || hideColoredLands || isOriginalNyx || isOriginalSnow}
					hideLands={isKaldheim || isModalBorderless || isModalNyx || isOriginalNyx || isUbNyx || frameFamily === 'm15-transform-borderless-back'}
					hideVehicles={isKaldheim || isModalBorderless || isModalExtended || isModalSnow || isModalNyx || isNeonInk || frameFamily === 'm15-double-feature' || isOriginalSnow || isOriginalNyx || isUbNyx || isBorderlessTransform || isExtendedTransform || isDoubleFeature}
				/>
			</div>
		</>
	)
}
