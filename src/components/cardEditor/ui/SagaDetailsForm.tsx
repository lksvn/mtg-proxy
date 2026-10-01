import { Icon } from '../../Icon'
import { useI18n } from '../../../i18n/context'
import type { SagaCardData } from '../types'
import { CardDetailsForm } from './CardDetailsForm'

type SagaDetailsFormProps = {
	card: SagaCardData
	onChange: (card: SagaCardData) => void
	part: 'content' | 'details'
	showCreatureFields?: boolean
}

export function SagaDetailsForm({ card, onChange, part, showCreatureFields = false }: SagaDetailsFormProps) {
	const { t } = useI18n()
	const totalChapters = card.chapters.reduce((total, chapter) => total + chapter.chapterCount, 0)

	function update(changes: Partial<SagaCardData>) {
		onChange({ ...card, ...changes })
	}

	if (part === 'details') {
		return (
			<CardDetailsForm
				card={card}
				onChange={(details) => update(details)}
				part="details"
			/>
		)
	}

	return (
		<>
			<CardDetailsForm
				card={card}
				onChange={(content) => update(content)}
				hideRulesText
				hidePowerToughness
				part="content"
			/>

			<div className="form-group gap-2">
				<label htmlFor="saga-reminder">{t('sagaReminder')}</label>
				<textarea
					id="saga-reminder"
					rows={3}
					value={card.rulesText}
					onChange={(event) => update({ rulesText: event.target.value })}
				/>
			</div>

			<h5 className="mt-5">{t('sagaChapters')}</h5>
			<small className="text-muted">{t('sagaChapterGroupingHelp')}</small>
			{card.chapters.map((chapter, index) => (
				<div key={index} className="planeswalker-ability">
					<div className="form-group gap-2">
						<label htmlFor={`saga-chapter-count-${index}`}>{t('chapterCount')}</label>
						<input
							id={`saga-chapter-count-${index}`}
							type="number"
							min="1"
							max={6 - totalChapters + chapter.chapterCount}
							value={chapter.chapterCount}
							onChange={(event) => {
								const chapters = [...card.chapters]
								const available = 6 - totalChapters + chapter.chapterCount
								const chapterCount = Math.max(1, Math.min(available, Number(event.target.value)))
								chapters[index] = { ...chapter, chapterCount }
								update({ chapters })
							}}
						/>
					</div>
					<div className="form-group gap-2">
						<label htmlFor={`saga-chapter-text-${index}`}>{t('abilityText')}</label>
						<textarea
							id={`saga-chapter-text-${index}`}
							rows={2}
							value={chapter.text}
							onChange={(event) => {
								const chapters = [...card.chapters]
								chapters[index] = { ...chapter, text: event.target.value }
								update({ chapters })
							}}
						/>
					</div>
					<div className="form-group gap-2 planeswalker-ability-remove">
						<label aria-hidden="true">&nbsp;</label>
						<button
							type="button"
							className="btn danger"
							aria-label={t('removeAbility')}
							onClick={() => update({ chapters: card.chapters.filter((_, chapterIndex) => chapterIndex !== index) })}
						>
							<Icon name="trash-can" />
						</button>
					</div>
				</div>
			))}
			<button
				type="button"
				className="btn mt-3"
				disabled={card.chapters.length >= 4 || totalChapters >= 6}
				onClick={() => update({ chapters: [...card.chapters, { chapterCount: 1, text: '' }] })}
			>
				<Icon name="plus" /> {t('addChapter')}
			</button>

			{showCreatureFields && <>
				<div className="form-group gap-2 mt-5">
					<label htmlFor="saga-creature-rules">{t('rulesText')}</label>
					<textarea
						id="saga-creature-rules"
						rows={3}
						value={card.flavorText}
						onChange={(event) => update({ flavorText: event.target.value })}
					/>
				</div>
				<div className="form-group gap-2">
					<label htmlFor="saga-creature-power-toughness">{t('powerToughness')}</label>
					<input
						id="saga-creature-power-toughness"
						type="text"
						placeholder="3/3"
						value={card.powerToughness}
						onChange={(event) => update({ powerToughness: event.target.value })}
					/>
				</div>
			</>}
		</>
	)
}
