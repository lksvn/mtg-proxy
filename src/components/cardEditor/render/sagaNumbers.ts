export function romanNumeral(value: number) {
	const numerals = [
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I'],
	] as const
	let result = ''

	for (const [amount, numeral] of numerals) {
		while (value >= amount) {
			result += numeral
			value -= amount
		}
	}

	return result
}
