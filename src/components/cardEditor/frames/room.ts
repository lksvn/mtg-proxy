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
			W: 'img/frames/room/regular/w.png',
			U: 'img/frames/room/regular/u.png',
			B: 'img/frames/room/regular/b.png',
			R: 'img/frames/room/regular/r.png',
			G: 'img/frames/room/regular/g.png',
			M: 'img/frames/room/regular/m.png',
			A: 'img/frames/room/regular/a.png',
		},
		pt: {},
		fallbacks: { ...commonFallbacks, C: 'A' },
		layout: roomLayout,
		fonts: commonFonts,
	},
} satisfies Record<string, FrameFamily>
