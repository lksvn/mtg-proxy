import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { useI18n } from '../i18n/context'

type FileInputProps = {
	id: string
	accept?: string
	onSelect: (file: File) => void
}

export function FileInput({ id, accept, onSelect }: FileInputProps) {
    const { t } = useI18n()
	const input = useRef<HTMLInputElement>(null)
	const [fileName, setFileName] = useState('')

	function selectFile(file?: File) {
		if (!file) return

		setFileName(file.name)
		onSelect(file)
	}

	function clearFile() {
		if (input.current) input.current.value = ''
		setFileName('')
	}

	return (
		<div className="file-input">
			<input
				ref={input}
				id={id}
				type="file"
				accept={accept}
				onChange={(event) => selectFile(event.target.files?.[0])}
			/>

			<label htmlFor={id} className="btn">
				<Icon name="file-up"/> {t('importTextList')}
			</label>

			<span className="file-name" aria-live="polite">
				{fileName || t('noFileSelected')}
			</span>

			<button
				type="button"
				className="btn danger"
				disabled={!fileName}
				aria-label={t('clearSelectedFile')}
				onClick={clearFile}
			>
				<Icon name="trash-can"/>
			</button>
		</div>
	)
}
