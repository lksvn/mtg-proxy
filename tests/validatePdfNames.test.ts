import assert from 'node:assert/strict'
import test from 'node:test'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { validatePdfNames } from '../src/utils/validatePdfNames.ts'

test('preflights names with the actual PDF font without changing them', async () => {
	const pdf = await PDFDocument.create()
	const font = await pdf.embedFont(StandardFonts.Helvetica)
	assert.doesNotThrow(() => validatePdfNames(['Lightning Bolt', 'Entzauberung', 'Éowyn'], font))
	for (const name of ['骨を灰に', 'Притязания Гниющих Лоз', 'Custom 🐀']) {
		assert.throws(() => font.widthOfTextAtSize(name, 9), /cannot encode/)
		assert.throws(() => validatePdfNames([name], font), {
			message: `Unsupported PDF deck-list name: ${name}`,
		})
	}
})
