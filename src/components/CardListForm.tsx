import { useState, type SubmitEvent } from 'react'
import { Icon } from './Icon'
import { EXAMPLE_CARD_LIST } from '../Cards'
import { FileInput } from './FileInput'

type CardListFormProps = {
	value: string
    history: string[]
	loading: boolean
	canSave: boolean
    onClearHistory: () => void
	onChange: (value: string) => void
	onLoad: (cardList: string) => void
	onSave: () => void
}

export function CardListForm({
	value,
    history,
	loading,
	canSave,
    onClearHistory,
	onChange,
	onLoad,
	onSave
}: CardListFormProps) {
	const [importError, setImportError] = useState('')

	async function importCardList(file: File) {
		setImportError('')
		try {
			onChange(await file.text())
		} catch {
			setImportError('Could not read the selected file')
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
            <div>
                <div className="meh">
                    <div>
                        <p className='text-muted'>One card per line: [quantity] card name [(set)] [collector number]. Only the card name is required.</p>
                        <div className="card-list-input mb-2">
                            <button type="button" onClick={() => onChange('')} className="btn danger"><Icon name="trash-can"/> Clear</button>
                            <textarea
                                id="card-list"
                                name="card-list"
                                rows={16}
                                cols={50}
                                value={value}
                                onChange={(event) => onChange(event.target.value)}
                                placeholder={EXAMPLE_CARD_LIST}
                            />
                        </div>

                        <FileInput
                            id="card-list-file"
                            accept=".txt,text/plain"
                            onSelect={importCardList}
                        />
                        {importError && <p role="alert" style={{color: '#f00'}}>{importError}</p>}

                        <div className="actions">
                            <button type="submit" disabled={loading} className="btn">
                                {loading ? (<><Icon name="loading" className="hourglass"/> Loading</>) : (<><Icon name="refresh-cw" /> Load cards</>)}
                            </button>

                            <button
                                type="button"
                                disabled={!canSave || loading}
                                onClick={onSave}
                                className={`btn${loading ? ' load' : ''}`}
                            >
                                <Icon name={loading ? 'loading' : 'file-down'} className={loading ? 'hourglass' : ''}/> Save card list
                            </button>
                        </div>

                    </div>

                    {history.length > 0 && (
                        <div aria-labelledby="previous-lists-heading" className="previous-lists">
                            <h4 id="previous-lists-heading" className="mb-1"><Icon name="list-clock"/> Previous lists</h4>
                            <p className="text-muted">Saved only in this browser.</p>

                            <ul className="p-0 m-0 mb-2">
                                {history.map((list, index) => (
                                    <li key={list}>
                                        <button type="button" onClick={() => onChange(list)} className="btn block">
                                            <Icon name="arrow-right" className="flip-h" />{list.split(/\r?\n/, 1)[0] || `List ${index + 1}`}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button type="button" onClick={onClearHistory} className="btn sm danger"><Icon name="trash-can" /> Clear history</button>
                        </div>
                    )}
                </div>
            </div>
		</form>
	)
}
