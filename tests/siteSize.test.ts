import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { checkSiteSize } from '../scripts/check-site-size.mjs'

test('deployment budget counts nested assets and rejects oversized sites', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'mtg-site-size-'))
	try {
		await mkdir(join(directory, 'nested'))
		await writeFile(join(directory, 'index.html'), 'abc')
		await writeFile(join(directory, 'nested', 'asset.webp'), 'de')
		assert.equal(await checkSiteSize(directory, 5), 5)
		await assert.rejects(checkSiteSize(directory, 4), /deployment budget/)
	} finally {
		await rm(directory, { recursive: true, force: true })
	}
})
