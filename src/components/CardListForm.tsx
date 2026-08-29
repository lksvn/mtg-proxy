import { useRef, useState, type SubmitEvent } from 'react'

type CardListFormProps = {
	value: string
	loading: boolean
	canSave: boolean
	onChange: (value: string) => void
	onLoad: () => void
	onSave: () => void
}

export function CardListForm({
	value,
	loading,
	canSave,
	onChange,
	onLoad,
	onSave
}: CardListFormProps) {
	const fileInput = useRef<HTMLInputElement>(null)
	const [importError, setImportError] = useState('')

	async function importCardList(file?: File) {
		if (!file) return

		setImportError('')

		try {
			onChange(await file.text())
		} catch {
			setImportError('Could not read the selected file')
		}
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault()
		onLoad()
	}

	function clearFile() {
		if (fileInput.current) {
			fileInput.current.value = ''
		}
	}

	return (
		<form onSubmit={handleSubmit}>
            <fieldset>
			    <legend>Card list</legend>
                <textarea
                    id="card-list"
                    name="card-list"
                    rows={12}
                    cols={50}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={'4 Lightning Bolt\n1 Black Lotus (lea) 232'}
                />

                <hr />

                <label htmlFor="card-list-file">📤 Import from file (.txt) </label>
                <input
                    ref={fileInput}
                    id="card-list-file"
                    type="file"
                    accept=".txt,text/plain"
                    onChange={(event) =>
                        importCardList(event.target.files?.[0])
                    }
                />
                <button type="button" onClick={clearFile} style={{color: '#f00', border: 'none', background: 'transparent'}}>❌</button>
                {importError && <p role="alert" style={{color: '#f00'}}>{importError}</p>}

                <hr />

                <button type="submit" disabled={loading}>
                    {loading ? '🔄️ Loading' : '🔄️ Load cards'}
                </button>
                {' '}
                <button
                    type="button"
                    disabled={!canSave || loading}
                    onClick={onSave}
                >
                    ⬇️ Download current list
                </button>
            </fieldset>
		</form>
	)
}