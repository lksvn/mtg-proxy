import { mkdir, readFile, writeFile } from 'node:fs/promises'

const svgPath = new URL('../public/icons.svg', import.meta.url)
const outputDirectory = new URL('../src/generated/', import.meta.url)
const outputPath = new URL('IconName.ts', outputDirectory)

const svg = await readFile(svgPath, 'utf8')

const names = [...svg.matchAll(/<symbol\b[^>]*\bid=["']([^"']+)["']/g)]
	.map((match) => match[1])

const uniqueNames = [...new Set(names)].sort()

if (uniqueNames.length === 0) {
	throw new Error('No <symbol id="..."> icons found')
}

const type = [
	'// Generated from public/icons.svg',
	'',
	'export type IconName =',
	...uniqueNames.map((name) => `\t| ${JSON.stringify(name)}`),
	''
].join('\n')

await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, type)

console.log(`Generated ${uniqueNames.length} icon names`)