import type { FrameFamily } from '../frameFamilies.ts'
import {
	commonFonts,
	commonFallbacks,
	levelerLayout,
} from './shared.ts'

export const levelerFrames = {
	'leveler-regular': {
		id: 'leveler-regular',
		frames: {
			W: 'img/frames/leveler/regular/w.png',
			U: 'img/frames/leveler/regular/u.png',
			B: 'img/frames/leveler/regular/b.png',
			R: 'img/frames/leveler/regular/r.png',
			G: 'img/frames/leveler/regular/g.png',
			M: 'img/frames/leveler/regular/m.png',
			A: 'img/frames/leveler/regular/a.png',
			V: 'img/frames/leveler/regular/v.png',
		},
		pt: {
			W: 'img/frames/leveler/regular/pt/w.png',
			U: 'img/frames/leveler/regular/pt/u.png',
			B: 'img/frames/leveler/regular/pt/b.png',
			R: 'img/frames/leveler/regular/pt/r.png',
			G: 'img/frames/leveler/regular/pt/g.png',
			M: 'img/frames/leveler/regular/pt/m.png',
			A: 'img/frames/leveler/regular/pt/a.png',
			V: 'img/frames/leveler/regular/pt/v.png',
		},
		fallbacks: { ...commonFallbacks, C: 'A' },
		layout: levelerLayout,
		fonts: commonFonts,
	},
} satisfies Record<string, FrameFamily>
