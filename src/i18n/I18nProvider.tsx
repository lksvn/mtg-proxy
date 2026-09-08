import { useEffect, useState, type ReactNode } from 'react'
import { I18nContext } from './context'
import { messages, type Language } from './messages'

const STORAGE_KEY = 'mtg-proxy-language'

function initialLanguage(): Language {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === 'en-US' || stored === 'pt-BR') return stored
	} catch {
		// Browser preference still works when storage is unavailable.
	}

	return navigator.language.toLowerCase().startsWith('pt')
		? 'pt-BR'
		: 'en-US'
}

export function I18nProvider({ children }: { children: ReactNode }) {
	const [language, setLanguage] = useState<Language>(initialLanguage)

	useEffect(() => {
		document.documentElement.lang = language

		try {
			localStorage.setItem(STORAGE_KEY, language)
		} catch {
			// Language still works for the current tab.
		}
	}, [language])

	return (
		<I18nContext.Provider
			value={{
				language,
				setLanguage,
				t: (key) => messages[language][key]
			}}
		>
			{children}
		</I18nContext.Provider>
	)
}
