import type { FrameFamily } from '../frameFamilies.ts'
import {
	commonFonts,
	commonFallbacks,
	splitLayout,
	fuseLayout,
	aftermathLayout,
} from './shared.ts'

export const splitFrames = {
	'split-regular': {
		id: 'split-regular',
		frames: {
			W: 'img/frames/split/regular/w.png',
			U: 'img/frames/split/regular/u.png',
			B: 'img/frames/split/regular/b.png',
			R: 'img/frames/split/regular/r.png',
			G: 'img/frames/split/regular/g.png',
			M: 'img/frames/split/regular/m.png',
			A: 'img/frames/split/regular/a.png',
			L: 'img/frames/split/regular/l.png',
		},
		pt: {},
		fallbacks: { ...commonFallbacks, C: 'A' },
		layout: splitLayout,
		fonts: commonFonts,
	},
	'split-fuse': {
		id: 'split-fuse',
		frames: {
			W: 'img/frames/split/fuse/w.png',
			U: 'img/frames/split/fuse/u.png',
			B: 'img/frames/split/fuse/b.png',
			R: 'img/frames/split/fuse/r.png',
			G: 'img/frames/split/fuse/g.png',
			M: 'img/frames/split/fuse/m.png',
			A: 'img/frames/split/fuse/a.png',
			L: 'img/frames/split/fuse/l.png',
		},
		pt: {},
		fallbacks: { ...commonFallbacks, C: 'A' },
		layout: fuseLayout,
		fonts: commonFonts,
	},
	'split-aftermath': {
		id: 'split-aftermath',
		frames: {
			W: 'img/frames/split/aftermath/w.png',
			U: 'img/frames/split/aftermath/u.webp',
			B: 'img/frames/split/aftermath/b.png',
			R: 'img/frames/split/aftermath/r.png',
			G: 'img/frames/split/aftermath/g.png',
			M: 'img/frames/split/aftermath/m.webp',
			A: 'img/frames/split/aftermath/a.png',
			L: 'img/frames/split/aftermath/l.png',
		},
		pt: {},
		fallbacks: { ...commonFallbacks, C: 'A' },
		layout: aftermathLayout,
		fonts: commonFonts,
	},
} satisfies Record<string, FrameFamily>
