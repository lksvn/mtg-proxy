import { Icon } from './Icon'
import { useI18n } from '../i18n/context'

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
	const { t } = useI18n()

	return (
		<>
			<button
				type="button"
				disabled={exporting || !canExport}
				onClick={onExport}
				className="btn"
			>
				{exporting ? (
					<><Icon name="loading" className="hourglass"/> {t('generatingPdf')}</>
				) : (
					<><Icon name="printer"/> {t('downloadPdf')}</>
				)}
			</button>

			{error && (
				<p role="alert" className="error">
					{error}
				</p>
			)}
		</>
	)
}
