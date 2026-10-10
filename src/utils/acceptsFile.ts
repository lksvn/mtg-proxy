export function acceptsFile(file: Pick<File, 'name' | 'type'>, accept?: string) {
	if (!accept) return true
	const name = file.name.toLowerCase()
	const type = file.type.toLowerCase()
	return accept.split(',').some((entry) => {
		const rule = entry.trim().toLowerCase()
		if (rule.startsWith('.')) return name.endsWith(rule)
		if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
		return type === rule
	})
}
