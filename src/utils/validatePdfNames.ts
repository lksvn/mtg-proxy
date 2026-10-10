import type { PDFFont } from 'pdf-lib'

export function validatePdfNames(names: string[], font: PDFFont) {
	for (const name of names) {
		try {
			font.encodeText(name)
		} catch {
			throw new Error(`Unsupported PDF deck-list name: ${name}`)
		}
	}
}
