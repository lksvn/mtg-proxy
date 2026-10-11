export function splitRulesWords(text: string) {
	if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text)) {
		return [...new Intl.Segmenter('ja', { granularity: 'word' }).segment(text)]
			.map(segment => segment.segment)
	}
	return text.split(/(\n|[^\S\n]+)/).filter(Boolean)
}
