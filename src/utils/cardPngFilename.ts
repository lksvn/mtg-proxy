export function cardPngFilename(name: string, dpi?: number) {
	const safeName = Array.from(name
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^\p{L}\p{N}]+/gu, '-'))
		.slice(0, 160)
		.join('')
		.replace(/^-+|-+$/g, '') || 'custom-card'
	return `${safeName}-mtg-proxy${dpi ? `-${dpi}dpi` : ''}.png`
}
