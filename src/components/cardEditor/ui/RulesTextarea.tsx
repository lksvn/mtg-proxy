import { useContext, useId, type ComponentProps } from 'react'
import { Icon } from '../../Icon'
import { useI18n } from '../../../i18n/context'
import { RulesTextSizeContext } from './rulesTextSizeContext'

export function RulesTextarea(props: ComponentProps<'textarea'>) {
	const controls = useContext(RulesTextSizeContext)
	const sliderId = useId()
	const { t } = useI18n()
	if (!controls) return <textarea {...props} />
	if (controls.combinedAbilities && props.id !== 'planeswalker-ability-0') return <textarea {...props} />
	const field = controls.combinedAbilities ? 'card-rules-text' : props.id ?? 'card-rules-text'
	const size = controls.sizes[field] ?? controls.baseSize

	return (
		<div className="rules-text-field">
			<textarea {...props} />
			<div className="rules-text-size">
				<label htmlFor={sliderId}>{t('textSize')} ({size})</label>
				<input
					id={sliderId}
					type="range"
					min={24}
					max={90}
					step={1}
					value={size}
					onChange={(event) => controls.onChange(field, Number(event.target.value))}
				/>
				<button type="button" className="btn" title={t('reset')} aria-label={t('reset')} onClick={() => controls.onChange(field, undefined)}>
					<Icon name="refresh-cw" />
				</button>
			</div>
		</div>
	)
}
