import type { FrameFamily } from '../frameFamilies.ts'
import {
	commonFonts,
	commonFallbacks,
	m15Pt,
	adventureLayout,
} from './shared.ts'

export const adventureFrames = {
	'adventure-regular': {
		id: 'adventure-regular',
		frames: {
			W: 'img/frames/adventure/regular/w.png',
			U: 'img/frames/adventure/regular/u.png',
			B: 'img/frames/adventure/regular/b.png',
			R: 'img/frames/adventure/regular/r.png',
			G: 'img/frames/adventure/regular/g.png',
			M: 'img/frames/adventure/regular/m.png',
			A: 'img/frames/adventure/regular/a.png',
			L: 'img/frames/adventure/regular/l.png',
		},
		pt: m15Pt,
		fallbacks: commonFallbacks,
		layout: adventureLayout,
		fonts: commonFonts,
	},
	'adventure-nyx': {
		id: 'adventure-nyx',
		frames: {
			W: 'img/frames/adventure/nyx/w.webp',
			U: 'img/frames/adventure/nyx/u.webp',
			B: 'img/frames/adventure/nyx/b.webp',
			R: 'img/frames/adventure/nyx/r.webp',
			G: 'img/frames/adventure/nyx/g.webp',
			M: 'img/frames/adventure/nyx/m.webp',
			A: 'img/frames/adventure/nyx/a.webp',
		},
		pt: m15Pt,
		fallbacks: { ...commonFallbacks, C: 'A', L: 'M' },
		layout: adventureLayout,
		fonts: commonFonts,
	},
} satisfies Record<string, FrameFamily>
