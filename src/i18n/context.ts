import { createContext, useContext } from 'react'
import type { Language, TranslationKey } from './messages'

type I18nContextValue = {
	language: Language
	setLanguage: (language: Language) => void
	t: (key: TranslationKey) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n() {
	const context = useContext(I18nContext)

	if (!context) throw new Error('useI18n must be used inside I18nProvider')

	return context
}
