type PdfExportProps = {
	exporting: boolean
	canExport: boolean
	error: string
	onExport: () => void
}

export function PdfExport({
	exporting,
	canExport,
	error,
	onExport
}: PdfExportProps) {
	return (
		<>
			<button
				type="button"
				disabled={exporting || !canExport}
				onClick={onExport}
			>
				{exporting ? '🔄️ Generating' : '🖨️ Print'}
			</button>

			{error && (
				<p role="alert" style={{ color: '#f00' }}>
					{error}
				</p>
			)}
		</>
	)
}