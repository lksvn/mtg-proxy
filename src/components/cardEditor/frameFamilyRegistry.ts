import type { FrameFamily, FrameFamilyId } from './frameFamilies.ts'
import { planeswalkersFrames } from './frames/planeswalkers.ts'
import { m15Frames } from './frames/m15.ts'
import { tokensFrames } from './frames/tokens.ts'
import { sagasFrames } from './frames/sagas.ts'
import { classFrames } from './frames/class.ts'
import { caseFrames } from './frames/case.ts'
import { roomFrames } from './frames/room.ts'
import { splitFrames } from './frames/split.ts'
import { adventureFrames } from './frames/adventure.ts'
import { levelerFrames } from './frames/leveler.ts'
import { battleFrames } from './frames/battle.ts'
import { modalFrames } from './frames/modal.ts'
import { showcaseFrames } from './frames/showcase.ts'
import { transformFrames } from './frames/transform.ts'
import { historicalFrames } from './frames/historical.ts'

export const FRAME_FAMILIES: Record<FrameFamilyId, FrameFamily> = {
	...planeswalkersFrames,
	...m15Frames,
	...tokensFrames,
	...sagasFrames,
	...classFrames,
	...caseFrames,
	...roomFrames,
	...splitFrames,
	...adventureFrames,
	...levelerFrames,
	...battleFrames,
	...modalFrames,
	...showcaseFrames,
	...transformFrames,
	...historicalFrames,
}
