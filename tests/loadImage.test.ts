import assert from 'node:assert/strict'
import test from 'node:test'
import { loadImageSource } from '../src/components/cardEditor/render/loadImage.ts'

test('validates uploaded images, caches valid files, and releases temporary URLs', async (context) => {
	let valid = true
	let loads = 0
	const revoked: string[] = []
	class MockImage {
		onload?: () => void
		onerror?: () => void
		set src(_value: string) {
			assert.equal(_value, 'blob:upload')
			loads++
			queueMicrotask(() => valid ? this.onload?.() : this.onerror?.())
		}
	}
	Object.defineProperty(globalThis, 'Image', { value: MockImage, configurable: true })
	context.after(() => Reflect.deleteProperty(globalThis, 'Image'))
	context.mock.method(URL, 'createObjectURL', () => 'blob:upload')
	context.mock.method(URL, 'revokeObjectURL', (url: string) => revoked.push(url))
	const file = new File(['image'], 'artwork.png')
	const image = await loadImageSource(file)
	assert.equal(await loadImageSource(file), image)
	assert.equal(loads, 1)
	valid = false
	const invalid = new File(['not an image'], 'invalid.png')
	await assert.rejects(loadImageSource(invalid), /Could not load image/)
	await assert.rejects(loadImageSource(invalid), /Could not load image/)
	assert.equal(loads, 3)
	assert.equal(revoked.length, 3)
})
