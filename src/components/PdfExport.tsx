import { Icon } from "./Icon"

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
                className="btn"
			>
				{exporting ? (<><Icon name="loading" className="hourglass"/> Generating</>) : (<><Icon name="printer"/> Download PDF</>)}
			</button>

			{error && (
				<p role="alert" style={{ color: '#f00' }}>
					{error}
				</p>
			)}
		</>
	)
}