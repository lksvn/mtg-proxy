export function cleanMarkdownCardList(markdown: string): string {
	return markdown.split(/\r?\n/).map((rawLine) => {
		let line = rawLine.trim()
		if (/^(?:#{1,6}\s|#\S|`{3,}|~{3,}|(?:[-*_]\s*){3,}$)/.test(line)) return ''
		line = line
			.replace(/^(?:>\s*)+/, '')
			.replace(/^(?:[-+*]\s+|\d+[.)]\s+)/, '')
			.replace(/^\[[ xX]\]\s+/, '')
			.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, name: string, alias?: string) => alias ?? name)
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.replace(/(\*\*|__|`)(.+?)\1/g, '$2')
		return line
	}).filter(Boolean).join('\n')
}
