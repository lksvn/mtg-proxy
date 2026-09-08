import { useState, type SubmitEvent } from 'react'
import { Icon } from './Icon'
import { EXAMPLE_CARD_LIST, type CardListSaveMode } from '../Cards'
import { FileInput } from './FileInput'
import { CardListInput } from './CardListInput'
import { useI18n } from '../i18n/context'

type CardListFormProps = {
	value: string
    history: string[]
	loading: boolean
	canSave: boolean
    onClearHistory: () => void
    onRemoveHistory: (list: string) => void
	onChange: (value: string) => void
	onLoad: (cardList: string) => void
	onSave: (mode: CardListSaveMode) => void
}

export function CardListForm({
	value,
    history,
	loading,
	canSave,
    onClearHistory,
    onRemoveHistory,
	onChange,
	onLoad,
	onSave
}: CardListFormProps) {
    const { t } = useI18n()
    const [importError, setImportError] = useState('')

	async function importCardList(file: File) {
		setImportError('')
		try {
			onChange(await file.text())
		} catch {
			setImportError(t('couldNotReadFile'))
		}
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()
        const list = value.trim() || EXAMPLE_CARD_LIST
        if (!value.trim()) onChange(list)
		onLoad(list)
	}

	return (
		<form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
                <div className="meh">
                    <div>
                        <p className='text-muted'>{t('cardListHelp')}</p>
                        <p className='text-muted'>
                            <mark>{t('autocompleteEnglish')}</mark> <br/>
                            {t('autocompleteBefore')} <mark>@</mark> {t('autocompleteAfter')}
                        </p>

                        <CardListInput value={value} onChange={onChange} />

                        <FileInput
                            id="card-list-file"
                            accept=".txt,text/plain"
                            onSelect={importCardList}
                        />
                        {importError && <p role="alert" className="error">{importError}</p>}

                        <div className="actions">
                            <button type="submit" disabled={loading} className="btn">
                                {loading ? (<><Icon name="loading" className="hourglass"/> {t('loading')}</>) : (<><Icon name="refresh-cw" /> {t('loadCards')}</>)}
                            </button>

                            <div className="split-button">
                                <button
                                    type="button"
                                    disabled={!canSave || loading}
                                    onClick={() => onSave('complete')}
                                    className="btn"
                                >
                                    <Icon name="file-down"/>
                                    {t('downloadList')}
                                </button>

                                <details inert={!canSave || loading}>
                                    <summary
                                        className="btn"
                                        aria-label={t('moreDownloadOptions')}
                                        title={t('moreDownloadOptions')}
                                    >
                                        <Icon name="chevron-down"/>
                                    </summary>

                                    <div className="split-button-options">
                                        <button
                                            type="button"
                                            onClick={() => onSave('without-basic-lands')}
                                            className="btn"
                                        >
                                            {t('noBasicLands')}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onSave('clean')}
                                            className="btn"
                                        >
                                            {t('namesOnly')}
                                        </button>
                                    </div>
                                </details>
                            </div>
                        </div>
					</div>
                    <div aria-labelledby="previous-lists-heading" className="previous-lists">
                        <h4 id="previous-lists-heading" className="mb-1"><Icon name="list-clock"/> {t('previousLists')}</h4>
                    {history.length === 0 ?
                        (
                            <p className="text-muted">{t('noSavedLists')}</p>
                        ) : (
                            <>
                                <p className="text-muted">{t('savedInBrowser')}</p>

                                <ul className="p-0 m-0 mb-2">
                                    {history.map((list, index) => (
                                        <li key={list}>
                                            <button type="button" onClick={() => onChange(list)} className="btn block">
                                                <Icon name="arrow-right" className="flip-h" />
                                                <span className="truncate">{list.split(/\r?\n/, 1)[0] || `${t('listFallback')} ${index + 1}`}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveHistory(list)}
                                                className="btn sm danger"
                                                aria-label={t('removeFromHistory')}
                                            >
                                                <Icon name="trash-can" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <button type="button" onClick={onClearHistory} className="btn sm danger"><Icon name="trash-can" /> {t('clearHistory')}</button>
                            </>
                        )}
                    </div>
                </div>
            </fieldset>
		</form>
	)
}
