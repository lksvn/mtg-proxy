import { createContext } from 'react'

export const RulesTextSizeContext = createContext<{
	sizes: Record<string, number | undefined>
	baseSize: number
	combinedAbilities?: boolean
	onChange: (field: string, size?: number) => void
} | null>(null)
