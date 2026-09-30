import { useRef } from 'react'
import { useI18n } from '../../../i18n/context'

type SymbolReference = {
	symbol: string
	file: string
	name: string
}

const SYMBOLS: SymbolReference[] = [
	...Array.from({ length: 21 }, (_, value) => ({
		symbol: `{${value}}`,
		file: `${value}.svg`,
		name: `${value} generic mana`,
	})),
	{ symbol: '{X}', file: 'x.svg', name: 'X generic mana' },
	{ symbol: '{Y}', file: 'y.svg', name: 'Y generic mana' },
	{ symbol: '{Z}', file: 'z.svg', name: 'Z generic mana' },
	{ symbol: '{W}', file: 'w.svg', name: 'One white mana' },
	{ symbol: '{U}', file: 'u.svg', name: 'One blue mana' },
	{ symbol: '{B}', file: 'b.svg', name: 'One black mana' },
	{ symbol: '{R}', file: 'r.svg', name: 'One red mana' },
	{ symbol: '{G}', file: 'g.svg', name: 'One green mana' },
	{ symbol: '{C}', file: 'c.svg', name: 'One colorless mana' },
	{ symbol: '{S}', file: 's.svg', name: 'One snow mana' },
	...[
		['W/U', 'White or blue'], ['W/B', 'White or black'], ['U/B', 'Blue or black'],
		['U/R', 'Blue or red'], ['B/R', 'Black or red'], ['B/G', 'Black or green'],
		['R/G', 'Red or green'], ['R/W', 'Red or white'], ['G/W', 'Green or white'],
		['G/U', 'Green or blue'],
	].map(([symbol, name]) => ({ symbol: `{${symbol}}`, file: `${symbol.replace('/', '').toLowerCase()}.svg`, name: `One ${name.toLowerCase()} mana` })),
	...[
		['W', 'white'], ['U', 'blue'], ['B', 'black'], ['R', 'red'], ['G', 'green'],
	].flatMap(([symbol, color]) => [
		{ symbol: `{${symbol}/P}`, file: `${symbol.toLowerCase()}p.svg`, name: `One ${color} mana or two life` },
		{ symbol: `{2/${symbol}}`, file: `2${symbol.toLowerCase()}.svg`, name: `Two generic mana or one ${color} mana` },
	]),
	{ symbol: '{T}', file: 't.svg', name: 'Tap this permanent' },
	{ symbol: '{Q}', file: 'untap.svg', name: 'Untap this permanent' },
	{ symbol: '{E}', file: 'e.svg', name: 'An energy counter' },
	{ symbol: '[0]', file: '+0.svg', name: 'Zero loyalty' },
	...Array.from({ length: 9 }, (_, index) => ({
		symbol: `[+${index + 1}]`,
		file: `+${index + 1}.svg`,
		name: `Add ${index + 1} loyalty`,
	})),
	...Array.from({ length: 9 }, (_, index) => ({
		symbol: `[-${index + 1}]`,
		file: `-${index + 1}.svg`,
		name: `Remove ${index + 1} loyalty`,
	})),
]

export function SymbolReferenceDialog() {
	const { t } = useI18n()
	const dialogRef = useRef<HTMLDialogElement>(null)

	return <>
		<button type="button" className="btn" onClick={() => dialogRef.current?.showModal()}>
			{t('viewSymbols')}
		</button>
		<dialog ref={dialogRef} className="symbol-reference-dialog">
			<div className="symbol-reference-header">
				<h5>{t('symbolReference')}</h5>
				<button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
					{t('close')}
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
					{SYMBOLS.map(({ symbol, file, name }) => (
						<tr key={symbol}>
							<td><code>{symbol}</code></td>
							<td><img src={`${import.meta.env.BASE_URL}img/manaSymbols/${file}`} alt="" /></td>
							<td>{name}</td>
						</tr>
					))}
				</tbody>
			</table>
		</dialog>
	</>
}
