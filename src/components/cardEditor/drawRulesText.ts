import type { CardTextRun } from './cardText'
import { drawManaSymbol } from './drawGenericMana'

type Atom =
	| { type: 'text'; value: string; italic: boolean }
	| { type: 'symbol'; value: string }
	| { type: 'newline' }

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
	const lines: Atom[][] = [[]]
	let width = 0

	for (const atom of atoms) {
		if (atom.type === 'newline') {
			lines.push([])
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

		const line = lines.at(-1)!

		if (
			width > 0 &&
			width + atomWidth > maxWidth &&
			!(atom.type === 'text' && atom.value === ' ')
		) {
			lines.push([atom])
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
	let fontSize = 74
	let lines: Atom[][] = []
	let lineHeight = 0

	for (; fontSize >= 32; fontSize--) {
		lineHeight = Math.round(fontSize * 1.15)
		lines = layout(context, atomize(runs), maxWidth, fontSize)

		if (lines.length * lineHeight <= maxHeight) break
	}

	fontSize = Math.max(fontSize, 32)
	lineHeight = Math.round(fontSize * 1.15)

	context.save()
	context.fillStyle = '#111'
	context.textAlign = 'left'
	context.textBaseline = 'top'

	lines.forEach((line, lineIndex) => {
		let cursorX = x
		const lineY = y + lineIndex * lineHeight

		for (const atom of line) {
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
				context.fillText(atom.value, cursorX, lineY)
				cursorX += context.measureText(atom.value).width
			}
		}
	})

	context.restore()
}
