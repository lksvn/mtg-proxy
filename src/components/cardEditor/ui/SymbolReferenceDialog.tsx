import { useId, useRef } from 'react'
import { useI18n } from '../../../i18n/context'
import { Icon } from '../../Icon'

type SymbolReference = {
	symbol: string
	file: string
	name: string
	namePt: string
}

type Props = {
    isLink?: boolean
}

const SYMBOLS: SymbolReference[] = [
	...Array.from({ length: 21 }, (_, value) => ({
		symbol: `{${value}}`,
		file: `${value}.svg`,
		name: `${value} generic mana`,
		namePt: `${value} ${value === 1 ? 'mana genérico' : 'manas genéricos'}`,
	})),
	{ symbol: '{X}', file: 'x.svg', name: 'X generic mana', namePt: 'X manas genéricos' },
	{ symbol: '{Y}', file: 'y.svg', name: 'Y generic mana', namePt: 'Y manas genéricos' },
	{ symbol: '{Z}', file: 'z.svg', name: 'Z generic mana', namePt: 'Z manas genéricos' },
	{ symbol: '{W}', file: 'w.svg', name: 'One white mana', namePt: 'Um mana branco' },
	{ symbol: '{U}', file: 'u.svg', name: 'One blue mana', namePt: 'Um mana azul' },
	{ symbol: '{B}', file: 'b.svg', name: 'One black mana', namePt: 'Um mana preto' },
	{ symbol: '{R}', file: 'r.svg', name: 'One red mana', namePt: 'Um mana vermelho' },
	{ symbol: '{G}', file: 'g.svg', name: 'One green mana', namePt: 'Um mana verde' },
	{ symbol: '{C}', file: 'c.svg', name: 'One colorless mana', namePt: 'Um mana incolor' },
	{ symbol: '{S}', file: 's.svg', name: 'One snow mana', namePt: 'Um mana de uma fonte da neve' },
	...[
		['W/U', 'White or blue', 'branco ou azul'], ['W/B', 'White or black', 'branco ou preto'],
		['U/B', 'Blue or black', 'azul ou preto'], ['U/R', 'Blue or red', 'azul ou vermelho'],
		['B/R', 'Black or red', 'preto ou vermelho'], ['B/G', 'Black or green', 'preto ou verde'],
		['R/G', 'Red or green', 'vermelho ou verde'], ['R/W', 'Red or white', 'vermelho ou branco'],
		['G/W', 'Green or white', 'verde ou branco'], ['G/U', 'Green or blue', 'verde ou azul'],
	].map(([symbol, name, colorsPt]) => ({
		symbol: `{${symbol}}`,
		file: `${symbol.replace('/', '').toLowerCase()}.svg`,
		name: `One ${name.toLowerCase()} mana`,
		namePt: `Um mana ${colorsPt}`,
	})),
	...[
		['W', 'white', 'branco'], ['U', 'blue', 'azul'], ['B', 'black', 'preto'],
		['R', 'red', 'vermelho'], ['G', 'green', 'verde'],
	].flatMap(([symbol, color, colorPt]) => [
		{
			symbol: `{${symbol}/P}`, file: `${symbol.toLowerCase()}p.svg`,
			name: `One ${color} mana or two life`, namePt: `Um mana ${colorPt} ou 2 pontos de vida`,
		},
		{
			symbol: `{2/${symbol}}`, file: `2${symbol.toLowerCase()}.svg`,
			name: `Two generic mana or one ${color} mana`, namePt: `Dois manas genéricos ou um mana ${colorPt}`,
		},
	]),
	{ symbol: '{T}', file: 't.svg', name: 'Tap this permanent', namePt: 'Vire esta permanente' },
	{ symbol: '{Q}', file: 'untap.svg', name: 'Untap this permanent', namePt: 'Desvire esta permanente' },
	{ symbol: '{E}', file: 'e.svg', name: 'An energy counter', namePt: 'Um marcador de energia' },
	{ symbol: '[0]', file: '+0.svg', name: 'Zero loyalty', namePt: 'Zero marcadores de lealdade' },
	...Array.from({ length: 9 }, (_, index) => ({
		symbol: `[+${index + 1}]`,
		file: `+${index + 1}.svg`,
		name: `Add ${index + 1} loyalty`,
		namePt: `Coloque ${index + 1} ${index === 0 ? 'marcador' : 'marcadores'} de lealdade nesta permanente`,
	})),
	...Array.from({ length: 9 }, (_, index) => ({
		symbol: `[-${index + 1}]`,
		file: `-${index + 1}.svg`,
		name: `Remove ${index + 1} loyalty`,
		namePt: `Remova ${index + 1} ${index === 0 ? 'marcador' : 'marcadores'} de lealdade desta permanente`,
	})),
]

export function SymbolReferenceDialog({ isLink }: Props) {
	const { t, language } = useI18n()
	const dialogRef = useRef<HTMLDialogElement>(null)
	const titleId = useId()

	return <>
		<button
			type="button"
			className={isLink ? 'text-link' : 'btn'}
			aria-haspopup="dialog"
			onClick={() => dialogRef.current?.showModal()}
		>
			{t('viewSymbols')}
		</button>
		<dialog ref={dialogRef} className="symbol-reference-dialog" aria-labelledby={titleId}>
			<div className="symbol-reference-header">
				<h5 id={titleId}>{t('symbolReference')}</h5>
				<button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
					<Icon name="close" /> {t('close')}
				</button>
			</div>
			<table>
				<thead>
					<tr>
						<th>{t('symbolCode')}</th>
						<th>{t('symbolPrinted')}</th>
						<th>{t('symbolName')}</th>
					</tr>
				</thead>
				<tbody>
					{SYMBOLS.map(({ symbol, file, name, namePt }) => (
						<tr key={symbol}>
							<td><code>{symbol}</code></td>
							<td><img src={`${import.meta.env.BASE_URL}img/manaSymbols/${file}`} alt="" /></td>
							<td>{language === 'pt-BR' ? namePt : name}</td>
						</tr>
					))}
				</tbody>
			</table>
		</dialog>
	</>
}
