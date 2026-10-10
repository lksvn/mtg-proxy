export function artworkFilter({ grayscale, invert }: { grayscale: boolean; invert: boolean }) {
	return [
		grayscale ? 'grayscale(1)' : '',
		invert ? 'invert(1)' : '',
	].filter(Boolean).join(' ') || 'none'
}
