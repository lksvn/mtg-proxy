import type { FrameFamily } from '../frameFamilies.ts'
import {
	commonFonts,
	commonFallbacks,
	commonFooter,
} from './shared.ts'

export const battleFrames = {
	'battle-regular': {
		id: 'battle-regular',
		frames: {
			W: 'img/frames/battle/w.png',
			U: 'img/frames/battle/u.png',
			B: 'img/frames/battle/b.png',
			R: 'img/frames/battle/r.png',
			G: 'img/frames/battle/g.png',
			M: 'img/frames/battle/m.png',
			A: 'img/frames/battle/a.png',
			C: 'img/frames/battle/c.png',
			L: 'img/frames/battle/l.png',
		},
		pt: {},
		fallbacks: commonFallbacks,
		layout: {
			canvas: { width: 2100, height: 1500, rotation: 'counterclockwise' },
			artwork: { dragLeft: 167, dragTop: 60, dragRight: 2040, dragBottom: 870 },
			title: { x: 387, y: 138, maxWidth: 1547, font: '80px belerenb, serif', color: '#111' },
			mana: { right: 1957, centerY: 136, symbolSize: 76, gap: 4, font: '48px belerenb, serif', color: '#111' },
			type: { x: 268, y: 930, maxWidth: 1667, font: '68px belerenb, serif', color: '#111' },
			rules: { x: 272, y: 1015, width: 1661, height: 414, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 76, minFontSize: 36 },
			symbol: { centerX: 1900, centerY: 930, boxSize: 86 },
			pt: { x: 1918, y: 1319, width: 92, height: 124, textX: 1964, textY: 1381, font: '78px belerenbsc, serif', color: '#fff' },
			footer: {
				...commonFooter,
				unrotated: true,
			},
		},
		fonts: commonFonts,
	},
} satisfies Record<string, FrameFamily>
