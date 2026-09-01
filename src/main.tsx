import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ColorSchemeToggle } from './components/ColorSchemeToggle.tsx'
import './assets/main.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeToggle />
    <App />
  </StrictMode>,
)
