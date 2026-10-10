import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ColorSchemeToggle } from './components/ColorSchemeToggle.tsx'
import { LanguageToggle } from './components/LanguageToggle.tsx'
import './assets/main.scss'
import { I18nProvider } from './i18n/I18nProvider'
import iconSprite from '../public/icons.svg?raw'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
        <I18nProvider>
            <div hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSprite }} />
            <div className="display-controls">
                <LanguageToggle />
                <ColorSchemeToggle />
            </div>
            <App />
        </I18nProvider>
	</StrictMode>
)
