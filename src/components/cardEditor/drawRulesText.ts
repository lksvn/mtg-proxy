import type { CardTextRun } from './cardText'
import { drawManaSymbol } from './drawGenericMana'

type Atom =
	| { type: 'text'; value: string; italic: boolean }
	| { type: 'symbol'; value: string }
	| { type: 'newline' }

type Line = {
	atoms: Atom[]
	gapBefore: number
}

function atomize(runs: CardTextRun[]): Atom[] {
	return runs.flatMap((run): Atom[] => {
		if (run.type === 'symbol') return [run]

		return run.value
			.split(/(\n|[^\S\n]+)/)
			.filter(Boolean)
			.map((value) => {
				if (value === '\n') return { type: 'newline' }
				if (/^\s+$/.test(value)) value = ' '

				return {
					type: 'text',
					value,
					italic: run.italic,
				}
			})
	})
}

function font(fontSize: number, italic: boolean) {
	return `${fontSize}px ${italic ? 'mplantini' : 'mplantin'}, serif`
}

function layout(
	context: CanvasRenderingContext2D,
	atoms: Atom[],
	maxWidth: number,
	fontSize: number,
) {
	const lines: Line[] = [{ atoms: [], gapBefore: 0 }]
	let width = 0

	for (const atom of atoms) {
		if (atom.type === 'newline') {
			const line = lines.at(-1)!
			if (line.atoms.length) {
				lines.push({ atoms: [], gapBefore: fontSize * 0.15 })
			} else {
				line.gapBefore = fontSize * 0.45
			}
			width = 0
			continue
		}

		context.font =
			atom.type === 'text'
				? font(fontSize, atom.italic)
				: font(fontSize, false)

		const atomWidth =
			atom.type === 'symbol'
				? fontSize
				: context.measureText(atom.value).width

		const line = lines.at(-1)!.atoms

		if (
			width > 0 &&
			width + atomWidth > maxWidth &&
			!(atom.type === 'text' && atom.value === ' ')
		) {
			lines.push({ atoms: [atom], gapBefore: 0 })
			width = atomWidth
		} else if (!(width === 0 && atom.type === 'text' && atom.value === ' ')) {
			line.push(atom)
			width += atomWidth
		}
	}

	return lines
}

export function drawRulesText(
	context: CanvasRenderingContext2D,
	runs: CardTextRun[],
	symbols: ReadonlyMap<string, HTMLImageElement>,
	x: number,
	y: number,
	maxWidth: number,
	maxHeight: number,
) {
	let fontSize = 64
	let lines: Line[] = []
	let lineHeight = 0

	for (; fontSize >= 32; fontSize--) {
		lineHeight = Math.round(fontSize * 1.1)
		lines = layout(context, atomize(runs), maxWidth, fontSize)

		const height = lines.length * lineHeight +
			lines.reduce((total, line) => total + line.gapBefore, 0)

		if (height <= maxHeight) break
	}

	fontSize = Math.max(fontSize, 32)
	lineHeight = Math.round(fontSize * 1.1)

	context.save()
	context.fillStyle = '#111'
	context.strokeStyle = '#111'
	context.lineWidth = 0.75
	context.textAlign = 'left'
	context.textBaseline = 'top'

	let lineY = y

	lines.forEach((line) => {
		let cursorX = x
		lineY += line.gapBefore

		for (const atom of line.atoms) {
			if (atom.type === 'symbol') {
                const symbolSize = fontSize
                drawManaSymbol(
                    context,
                    atom.value,
                    symbols,
                    cursorX,
                    lineY + lineHeight / 2,
                    symbolSize,
                )

                cursorX += symbolSize
			} else if (atom.type === 'text') {
				context.font = font(fontSize, atom.italic)
				context.strokeText(atom.value, cursorX, lineY)
				context.fillText(atom.value, cursorX, lineY)
				cursorX += context.measureText(atom.value).width
			}
		}

		lineY += lineHeight
	})

	context.restore()
}
