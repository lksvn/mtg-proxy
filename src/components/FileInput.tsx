import { useRef, useState } from 'react'
import { Icon } from './Icon'

type FileInputProps = {
	id: string
	accept?: string
	onSelect: (file: File) => void
}

export function FileInput({ id, accept, onSelect }: FileInputProps) {
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
				<Icon name="file-up"/> Import .txt list
			</label>

			<span className="file-name" aria-live="polite">
				{fileName || 'No file selected'}
			</span>

			<button
				type="button"
				className="btn danger"
				disabled={!fileName}
				aria-label="Clear selected file"
				onClick={clearFile}
			>
				<Icon name="trash-can"/>
			</button>
		</div>
	)
}