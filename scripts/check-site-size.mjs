import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function checkSiteSize(directory, maximumBytes = 985_000_000) {
	let bytes = 0
	for (const entry of await readdir(directory, { recursive: true, withFileTypes: true })) {
		if (entry.isFile()) bytes += (await stat(join(entry.parentPath, entry.name))).size
	}
	if (bytes > maximumBytes) {
		throw new Error(`Site is ${(bytes / 1_000_000).toFixed(1)} MB; deployment budget is ${maximumBytes / 1_000_000} MB. Optimize frame assets before deploying.`)
	}
	return bytes
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	checkSiteSize('dist')
		.then(bytes => console.log(`Deployment size: ${(bytes / 1_000_000).toFixed(1)} MB / 985 MB`))
		.catch(error => {
			console.error(error.message)
			process.exitCode = 1
		})
}
