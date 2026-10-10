import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { useI18n } from '../i18n/context'
import { acceptsFile } from '../utils/acceptsFile'

type FileInputProps = {
	id: string
	accept?: string
    label?: string
	hasValue?: boolean
	onSelect: (file: File) => void
    onClear?: () => void
	validate?: (file: File) => Promise<unknown>
	validationError?: string
}

export function FileInput({ id, accept, label, hasValue, onSelect, onClear, validate, validationError }: FileInputProps) {
    const { t } = useI18n()
	const input = useRef<HTMLInputElement>(null)
	const [fileName, setFileName] = useState('')
	const [error, setError] = useState<string | null>(null)
	const selection = useRef(0)

	async function selectFile(file?: File) {
		if (!file) return
		const currentSelection = ++selection.current
		setError(null)
		if (!acceptsFile(file, accept)) {
			setError(t('unsupportedFileType'))
			return
		}
		try {
			await validate?.(file)
		} catch {
			if (currentSelection === selection.current) {
				setError(validationError ?? t('couldNotReadFile'))
			}
			return
		}
		if (currentSelection !== selection.current) return
		setFileName(file.name)
		onSelect(file)
	}

	function clearFile() {
		selection.current++
		setError(null)
		if (input.current) input.current.value = ''
		setFileName('')
        onClear?.()
	}

	return (
		<div className="file-input">
			<input
				ref={input}
				id={id}
				type="file"
				accept={accept}
				aria-invalid={Boolean(error) || undefined}
				aria-describedby={error ? `${id}-error` : undefined}
				onChange={(event) => {
					void selectFile(event.target.files?.[0])
					event.target.value = ''
				}}
			/>

			<label htmlFor={id} className="btn">
				<Icon name="file-up"/> {label ?? t('importTextList')}
			</label>

			<span className="file-name" aria-live="polite">
				{fileName || t('noFileSelected')}
			</span>

			<button
				type="button"
				className="btn danger"
				disabled={!fileName && !hasValue && !error}
				aria-label={t('clearSelectedFile')}
				onClick={clearFile}
			>
				<Icon name="trash-can"/>
			</button>
			{error && (
				<p id={`${id}-error`} className="error" role="alert">
					{error}
				</p>
			)}
		</div>
	)
}
