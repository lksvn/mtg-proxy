export function nextTabIndex(index: number, count: number, key: string) {
	if (key === 'Home') return 0
	if (key === 'End') return count - 1
	return (index + (key === 'ArrowLeft' ? -1 : 1) + count) % count
}
