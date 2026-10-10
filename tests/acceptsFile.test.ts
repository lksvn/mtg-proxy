import assert from 'node:assert/strict'
import test from 'node:test'
import { acceptsFile } from '../src/utils/acceptsFile.ts'

test('rejects videos at every upload type and accepts supported files', () => {
	const video = { name: 'video.mp4', type: 'video/mp4' }
	assert.equal(acceptsFile(video, 'image/*'), false)
	assert.equal(acceptsFile(video, '.txt,.md,text/plain,text/markdown'), false)
	assert.equal(acceptsFile({ name: 'art.png', type: 'image/png' }, 'image/*'), true)
	assert.equal(acceptsFile({ name: 'set.svg', type: 'image/svg+xml' }, 'image/*'), true)
	assert.equal(acceptsFile({ name: 'deck.TXT', type: '' }, '.txt,text/plain'), true)
	assert.equal(acceptsFile({ name: 'deck', type: 'text/plain' }, '.txt,text/plain'), true)
	assert.equal(acceptsFile({ name: 'deck.MD', type: '' }, '.txt,.md,text/plain,text/markdown'), true)
	assert.equal(acceptsFile({ name: 'deck', type: 'text/markdown' }, '.txt,.md,text/plain,text/markdown'), true)
	assert.equal(acceptsFile(video), true)
})
