import type { FrameFamily } from '../frameFamilies.ts'
import {
	commonFonts,
	commonFallbacks,
	roomLayout,
} from './shared.ts'

export const roomFrames = {
	'room-regular': {
		id: 'room-regular',
		frames: {
			W: 'img/frames/room/regular/w.webp',
			U: 'img/frames/room/regular/u.webp',
			B: 'img/frames/room/regular/b.webp',
			R: 'img/frames/room/regular/r.webp',
			G: 'img/frames/room/regular/g.webp',
			M: 'img/frames/room/regular/m.webp',
			A: 'img/frames/room/regular/a.webp',
		},
		pt: {},
		fallbacks: { ...commonFallbacks, C: 'A' },
		layout: roomLayout,
		fonts: commonFonts,
	},
} satisfies Record<string, FrameFamily>
