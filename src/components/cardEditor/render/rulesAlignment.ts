import type { CustomCardData } from '../types.ts'

export function rulesAlignment(card: Pick<CustomCardData, 'centerRulesText' | 'centerRulesTextVertically'>) {
	return {
		horizontalAlign: card.centerRulesText ? 'center' as const : 'left' as const,
		verticalAlign: (card.centerRulesTextVertically ?? card.centerRulesText) ? 'middle' as const : 'top' as const,
	}
}
