import assert from 'node:assert/strict'
import test from 'node:test'
import { canvasToPng } from '../src/utils/canvasToPng.ts'

test('prepares a PNG and rejects missing or failed canvas exports', async () => {
	const png = new Blob(['test'], { type: 'image/png' })
	const canvas = {
		toBlob(callback: BlobCallback, type: string) {
			assert.equal(type, 'image/png')
			callback(png)
		},
	} as HTMLCanvasElement
	assert.equal(await canvasToPng(canvas), png)
	await assert.rejects(canvasToPng(null), /Could not access/)
	await assert.rejects(canvasToPng({ toBlob(callback: BlobCallback) { callback(null) } } as HTMLCanvasElement), /Could not prepare/)
	await assert.rejects(canvasToPng({ toBlob() { throw new Error('Security error') } } as unknown as HTMLCanvasElement), /Security error/)
})
