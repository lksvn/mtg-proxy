import type { FrameVariant } from '../types.ts'
import type { FrameFamily, FrameLayout } from '../frameFamilies.ts'

export const commonFonts = [
	'70px belerenb',
	'70px belerenbsc',
	'64px mplantin',
	'64px mplantini',
]

export const commonFallbacks: Partial<Record<FrameVariant, FrameVariant>> = {
	V: 'A',
	WL: 'L',
	UL: 'L',
	BL: 'L',
	RL: 'L',
	GL: 'L',
	ML: 'L',
	WU: 'M',
	WB: 'M',
	UB: 'M',
	UR: 'M',
	BR: 'M',
	BG: 'M',
	RG: 'M',
	RW: 'M',
	GW: 'M',
	GU: 'M',
}

export const m15Pt = {
	W: 'img/frames/m15/regular/m15PTW.webp',
	U: 'img/frames/m15/regular/m15PTU.webp',
	B: 'img/frames/m15/regular/m15PTB.webp',
	R: 'img/frames/m15/regular/m15PTR.webp',
	G: 'img/frames/m15/regular/m15PTG.webp',
	M: 'img/frames/m15/regular/m15PTM.webp',
	A: 'img/frames/m15/regular/m15PTA.webp',
	C: 'img/frames/m15/regular/m15PTC.webp',
	V: 'img/frames/m15/regular/m15PTV.webp',
}

export const commonFooter: FrameLayout['footer'] = {
	x: 115,
	maxWidth: 1050,
	metadataY: 1985,
	metadata: { font: '38px mplantin, serif', color: '#fff' },
	disclaimerY: 2025,
	disclaimer: { font: '34px mplantin, serif', color: '#fff' },
}

export const regularSagaLayout: NonNullable<FrameLayout['saga']> = {
	reminder: { x: 130, y: 265, width: 606, height: 372 },
	abilities: { x: 200, y: 608, width: 525, height: 1148 },
	chapter: {
		x: 58,
		width: 118,
		height: 132,
		gap: 150,
		dividerX: 150,
		dividerWidth: 592,
		dividerHeight: 6,
		dividerOffsetY: -3,
		textInsetX: 0,
		textInsetY: 16,
	},
}

export const creatureSagaLayout: NonNullable<FrameLayout['saga']> = {
	reminder: { x: 130, y: 250, width: 1260, height: 174 },
	abilities: { x: 200, y: 451, width: 525, height: 1138 },
	creatureRules: { x: 119, y: 1741, width: 1263, height: 192 },
	chapter: regularSagaLayout.chapter,
}

export const classLayout: FrameLayout = {
	artwork: { dragLeft: 113, dragTop: 236, dragRight: 750, dragBottom: 1759 },
	title: { x: 128, y: 160, maxWidth: 1244, font: '80px belerenb, serif', color: '#111' },
	mana: { right: 1394, centerY: 160, symbolSize: 71, gap: 4, font: '48px belerenb, serif', color: '#111' },
	type: { x: 128, y: 1835, maxWidth: 1244, font: '68px belerenb, serif', color: '#111' },
	rules: { x: 764, y: 237, width: 606, height: 1522, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
	class: {
		levels: { x: 764, y: 237, width: 606, height: 1522 },
		header: { x: 752, width: 633, height: 101 },
	},
	symbol: { centerX: 1340, centerY: 1835, boxSize: 80 },
	pt: { x: 0, y: 0, width: 0, height: 0, textX: 0, textY: 0, font: '1px mplantin, serif', color: '#111' },
	footer: commonFooter,
}

export const caseLayout: FrameLayout = {
	...classLayout,
	class: undefined,
	case: {
		sections: { x: 764, y: 266, width: 606, height: 1469 },
	},
}

export const roomLayout: FrameLayout = {
	previewRotation: true,
	artwork: { dragLeft: 206, dragTop: 99, dragRight: 1038, dragBottom: 1911 },
	title: { x: 0, y: 0, maxWidth: 0, font: '1px belerenb, serif', color: '#111' },
	mana: { right: 0, centerY: 0, symbolSize: 0, gap: 0, font: '1px belerenb, serif', color: '#111' },
	type: { x: 0, y: 0, maxWidth: 0, font: '1px belerenb, serif', color: '#fff' },
	rules: { x: 0, y: 0, width: 0, height: 0, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0, maxFontSize: 1, minFontSize: 1 },
	room: {
		left: { originX: 78, originY: 1880 },
		right: { originX: 78, originY: 920 },
		titleWidth: 805,
		rules: { x: 1050, width: 776, height: 372 },
		type: { x: 825, y: 1880, width: 1755, height: 100, textY: 30 },
		reminder: { x: 920, y: 1880, width: 1734, height: 110 },
	},
	symbol: { centerX: 855, centerY: 160, boxSize: 60, rotation: 'counterclockwise' },
	pt: { x: 0, y: 0, width: 0, height: 0, textX: 0, textY: 0, font: '1px mplantin, serif', color: '#111' },
	footer: {
		x: 0, maxWidth: 0, metadataY: 0, metadata: { font: '1px mplantin, serif', color: '#fff' },
		disclaimerY: 0, disclaimer: { font: '1px mplantin, serif', color: '#fff' },
	},
}

export const splitLayout: FrameLayout = {
	...roomLayout,
	room: undefined,
	artwork: { dragLeft: 237, dragTop: 1070, dragRight: 797, dragBottom: 1888 },
	split: {
		frameSplitY: 1000,
		firstOriginY: 1878,
		secondOriginY: 920,
		secondArtwork: { dragLeft: 237, dragTop: 112, dragRight: 797, dragBottom: 930 },
	},
	title: { x: 0, y: 165, maxWidth: 805, font: '80px belerenb, serif', color: '#111' },
	mana: { right: 815, centerY: 165, symbolSize: 68, gap: 4, font: '48px belerenb, serif', color: '#111' },
	type: { x: 0, y: 855, maxWidth: 710, font: '58px belerenb, serif', color: '#111' },
	rules: { x: 0, y: 913, width: 776, height: 500, verticalAlign: 'middle', fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
	symbol: { centerX: 770, centerY: 855, boxSize: 60 },
	footer: commonFooter,
}

export const fuseLayout: FrameLayout = {
	...splitLayout,
	rules: { ...splitLayout.rules, height: 400 },
	split: {
		...splitLayout.split!,
		reminder: {
			...splitLayout.rules,
			x: 0,
			y: 1360,
			width: 1763,
			height: 60,
			horizontalAlign: 'center',
			maxFontSize: 50,
			minFontSize: 28,
		},
	},
}

export const aftermathLayout: FrameLayout = {
	...splitLayout,
	previewRotation: 'counterclockwise',
	artwork: { dragLeft: 114, dragTop: 236, dragRight: 1386, dragBottom: 705 },
	title: { x: 128, y: 165, maxWidth: 1244, font: '80px belerenb, serif', color: '#111' },
	mana: { ...splitLayout.mana, right: 1391, centerY: 165 },
	type: { x: 128, y: 780, maxWidth: 1160, font: '64px belerenb, serif', color: '#111' },
	rules: { ...splitLayout.rules, x: 129, y: 869, width: 1242, height: 252 },
	symbol: { centerX: 1335, centerY: 780, boxSize: 75 },
	split: {
		frameSplitY: 1139,
		firstOriginY: 0,
		secondOriginY: 1186,
		secondArtwork: { dragLeft: 825, dragTop: 1186, dragRight: 1270, dragBottom: 1904 },
		secondLayout: {
			originX: 1380,
			title: { x: 0, y: 50, maxWidth: 720, font: '72px belerenb, serif', color: '#111' },
			mana: { ...splitLayout.mana, right: 742, centerY: 50 },
			type: { x: 0, y: 630, maxWidth: 625, font: '58px belerenb, serif', color: '#111' },
			rules: { ...splitLayout.rules, x: 10, y: 706, width: 705, height: 540, maxFontSize: 55 },
			symbol: { centerX: 685, centerY: 630, boxSize: 60 },
		},
	},
}

export const adventureLayout: FrameLayout = {
	artwork: { dragLeft: 115, dragTop: 237, dragRight: 1386, dragBottom: 1167 },
	title: { x: 128, y: 165, maxWidth: 1244, font: '70px belerenb, serif', color: '#111' },
	mana: { right: 1391, centerY: 167, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#111' },
	type: { x: 128, y: 1242, maxWidth: 1244, font: '54px belerenb, serif', color: '#111' },
	rules: { x: 790, y: 1365, width: 580, height: 495, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 58, minFontSize: 30 },
	adventure: {
		title: { x: 128, y: 1370, maxWidth: 590, font: '48px belerenb, serif', color: '#fff' },
		mana: { right: 720, centerY: 1370, symbolSize: 55, gap: 4, font: '42px belerenb, serif', color: '#fff' },
		type: { x: 128, y: 1465, maxWidth: 590, font: '46px belerenb, serif', color: '#fff' },
		rules: { x: 128, y: 1545, width: 592, height: 315, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 58, minFontSize: 30 },
	},
	symbol: { centerX: 1335, centerY: 1241, boxSize: 85 },
	pt: { x: 1136, y: 1858, width: 282, height: 154, textX: 1292, textY: 1933, font: '70px belerenbsc, serif', color: '#111' },
	footer: commonFooter,
}

export const levelerLayout: FrameLayout = {
	artwork: { dragLeft: 115, dragTop: 237, dragRight: 1386, dragBottom: 1167 },
	title: { x: 128, y: 165, maxWidth: 1244, font: '70px belerenb, serif', color: '#111' },
	mana: { right: 1391, centerY: 167, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#111' },
	type: { x: 128, y: 1242, maxWidth: 1244, font: '54px belerenb, serif', color: '#111' },
	rules: { x: 0, y: 0, width: 0, height: 0, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0, maxFontSize: 1, minFontSize: 1 },
	leveler: {
		levelUp: { x: 129, y: 1324, width: 1025, height: 190, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 58, minFontSize: 30 },
		levelTwo: {
			label: {
				x: 170,
				y: 1610,
				maxWidth: 220,
				font: '58px belerenbsc, serif',
				fixedFont: '24px belerenbsc, serif',
				fixedOffsetY: -24,
				rangeOffsetY: 20,
				color: '#111',
				align: 'center',
			},
			rules: { x: 310, y: 1518, width: 844, height: 200, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 58, minFontSize: 30 },
			powerToughness: { x: 1292, y: 1615, maxWidth: 205, font: '60px belerenbsc, serif', color: '#111', align: 'center' },
		},
		levelThree: {
			label: {
				x: 170,
				y: 1820,
				maxWidth: 220,
				font: '58px belerenbsc, serif',
				fixedFont: '24px belerenbsc, serif',
				fixedOffsetY: -24,
				rangeOffsetY: 20,
				color: '#111',
				align: 'center',
			},
			rules: { x: 310, y: 1726, width: 844, height: 200, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#fff', strokeWidth: 0.75, maxFontSize: 58, minFontSize: 30 },
			powerToughness: { x: 1292, y: 1825, maxWidth: 205, font: '60px belerenbsc, serif', color: '#111', align: 'center' },
		},
	},
	symbol: { centerX: 1335, centerY: 1241, boxSize: 85 },
	pt: { x: 1136, y: 1347, width: 282, height: 560, textX: 1292, textY: 1420, font: '60px belerenbsc, serif', color: '#111' },
	footer: commonFooter,
}

export function tokenFrames(style: string, variants: readonly FrameVariant[]): FrameFamily['frames'] {
	return Object.fromEntries(variants.map((variant) => [variant, `img/frames/token/${style}/${variant.toLowerCase()}.png`]))
}

export const m15RegularLayout: FrameLayout = {
	artwork: { dragLeft: 115, dragTop: 237, dragRight: 1386, dragBottom: 1167 },
	title: { x: 125, y: 165, maxWidth: 1244, font: '70px belerenb, serif', color: '#111' },
	mana: { right: 1391, centerY: 167, symbolSize: 64, gap: 4, font: '48px belerenb, serif', color: '#111' },
	type: { x: 125, y: 1242, maxWidth: 1244, font: '54px belerenb, serif', color: '#111' },
	rules: { x: 129, y: 1328, width: 1242, height: 604, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 64, minFontSize: 32 },
	symbol: { centerX: 1335, centerY: 1241, boxSize: 85 },
	pt: { x: 1136, y: 1858, width: 282, height: 154, textX: 1292, textY: 1933, font: '70px belerenbsc, serif', color: '#111' },
	footer: commonFooter,
}

export const tokenRegularLayout: FrameLayout = {
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1439 },
	title: { x: 120, y: 163, maxWidth: 1265, align: 'center', font: '80px belerenb, serif', color: '#fff' },
	mana: { right: 1316, centerY: 121, symbolSize: 70, gap: 8, font: '48px belerenb, serif', color: '#fff' },
	type: { x: 120, y: 1415, maxWidth: 1190, font: '68px belerenb, serif', color: '#111' },
	rules: { x: 130, y: 1510, width: 1240, height: 410, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 74, minFontSize: 32 },
	symbol: { centerX: 1345, centerY: 1416, boxSize: 86 },
	pt: { x: 1136, y: 1858, width: 282, height: 154, textX: 1300, textY: 1935, font: '78px belerenbsc, serif', color: '#111' },
	footer: commonFooter,
}

export const tokenTallLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1240 },
	type: { ...tokenRegularLayout.type, y: 1240 },
	rules: { ...tokenRegularLayout.rules, y: 1335, height: 585 },
	symbol: { ...tokenRegularLayout.symbol, centerY: 1241 },
}

export const tokenShortLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1940 },
	type: { ...tokenRegularLayout.type, y: 1481 },
	rules: { ...tokenRegularLayout.rules, y: 1559, height: 371 },
	symbol: { ...tokenRegularLayout.symbol, centerY: 1475 },
}

export const tokenTextlessLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1771 },
	type: { ...tokenRegularLayout.type, y: 1771 },
	rules: { ...tokenRegularLayout.rules, y: 0, height: 0 },
	symbol: { ...tokenRegularLayout.symbol, centerY: 1772 },
}

export const tokenTextlessBorderlessLayout: FrameLayout = {
	...tokenTextlessLayout,
	artwork: { dragLeft: 0, dragTop: 0, dragRight: 1500, dragBottom: 2100 },
	title: { ...tokenTextlessLayout.title, x: 128, y: 167, maxWidth: 1244 },
	type: { ...tokenTextlessLayout.type, x: 128, y: 1778, maxWidth: 1244 },
	symbol: { ...tokenTextlessLayout.symbol, centerY: 1775 },
}

export const tokenOldLayout: FrameLayout = {
	artwork: { dragLeft: 173, dragTop: 232, dragRight: 1327, dragBottom: 1303 },
	title: { x: 170, y: 150, maxWidth: 1160, align: 'center', font: '100px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 3 },
	mana: { right: 1330, centerY: 106, symbolSize: 0, gap: 0, font: '48px mplantin, serif', color: '#fff' },
	type: { x: 234, y: 1425, maxWidth: 1032, font: '67px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 3 },
	rules: { x: 270, y: 1496, width: 960, height: 294, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 75, minFontSize: 32 },
	symbol: { centerX: 1228, centerY: 1424, boxSize: 78 },
	pt: { x: 1040, y: 1838, width: 205, height: 90, textX: 1160, textY: 1883, font: '90px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 3 },
	footer: {
		align: 'center', x: 750, maxWidth: 1200,
		metadataY: 1855, metadata: { font: '42px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 2 },
		disclaimerY: 1900, disclaimer: { font: '30px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 2, shadowOffsetY: 2 },
        disclaimerColorByVariant: { W: '#111' }
	},
}

export const tokenUngluedLayout: FrameLayout = {
	artwork: { dragLeft: 180, dragTop: 204, dragRight: 1320, dragBottom: 1815 },
	title: { x: 0, y: 0, maxWidth: 0, font: '1px mplantin, serif', color: '#fff' },
	mana: { right: 0, centerY: 0, symbolSize: 0, gap: 0, font: '1px mplantin, serif', color: '#fff' },
	type: { x: 0, y: 0, maxWidth: 0, font: '1px mplantin, serif', color: '#fff' },
	rules: { x: 0, y: 0, width: 0, height: 0, fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0, maxFontSize: 1, minFontSize: 1 },
	symbol: { centerX: 0, centerY: 0, boxSize: 0 },
	pt: { x: 0, y: 0, width: 0, height: 0, textX: 0, textY: 0, font: '1px mplantin, serif', color: '#fff' },
	footer: {
		align: 'center', x: 750, maxWidth: 1200,
		metadataY: 1900, metadata: { font: '42px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 2 },
		disclaimerY: 1955, disclaimer: { font: '30px mplantin, serif', color: '#111', shadowColor: '#111', shadowOffsetX: 2, shadowOffsetY: 2 },
        disclaimerColorByVariant: { G: '#fff', B: '#fff' }
	},
}

export const tokenMonarchLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 100, dragTop: 130, dragRight: 1400, dragBottom: 1320 },
	title: { ...tokenRegularLayout.title, y: 1383, color: '#f4ce80' },
	mana: { ...tokenRegularLayout.mana, symbolSize: 0 },
	type: { ...tokenRegularLayout.type, maxWidth: 0 },
	rules: { ...tokenRegularLayout.rules, y: 1460, height: 470 },
	symbol: { centerX: 0, centerY: 0, boxSize: 0 },
	pt: { ...tokenRegularLayout.pt, width: 0, height: 0 },
}

export const tokenMarkerLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1480 },
	title: { ...tokenRegularLayout.title, y: 1481 },
	mana: { ...tokenRegularLayout.mana, symbolSize: 0 },
	type: { ...tokenRegularLayout.type, maxWidth: 0 },
	rules: { ...tokenRegularLayout.rules, y: 1559, height: 371, color: '#fff', strokeColor: '#fff' },
	symbol: { ...tokenRegularLayout.symbol, centerY: 1475 },
	pt: { ...tokenRegularLayout.pt, width: 0, height: 0 },
}

export const tokenInitiativeLayout: FrameLayout = {
	...tokenMarkerLayout,
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1246 },
	title: { ...tokenMarkerLayout.title, y: 1247, font: '80px belerenb, serif' },
	rules: { ...tokenMarkerLayout.rules, y: 1324, height: 604 },
	symbol: { ...tokenMarkerLayout.symbol, centerY: 1241 },
}

export const tokenDayNightLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 60, dragTop: 60, dragRight: 1440, dragBottom: 1929 },
	mana: { ...tokenRegularLayout.mana, symbolSize: 0 },
	type: { ...tokenRegularLayout.type, maxWidth: 0 },
	rules: { ...tokenRegularLayout.rules, x: 90, y: 1300, width: 1320, height: 630, color: '#fff', strokeColor: '#fff' },
	flavorRules: { ...tokenRegularLayout.rules, x: 90, y: 266, width: 1320, height: 350, color: '#fff', strokeColor: '#fff' },
	symbol: { centerX: 0, centerY: 0, boxSize: 0 },
	pt: { ...tokenRegularLayout.pt, width: 0, height: 0 },
	footer: { ...commonFooter, metadataY: 2010, disclaimerX: 1385, disclaimerY: 2010, disclaimerAlign: 'right' },
}

export const tokenJumpstartLayout: FrameLayout = {
	...tokenRegularLayout,
	artwork: { dragLeft: 23, dragTop: 74, dragRight: 1477, dragBottom: 2026 },
	title: { ...tokenRegularLayout.title, x: 71, y: 1570, maxWidth: 1358, font: '112px belerenb, serif' },
	mana: { ...tokenRegularLayout.mana, right: 800, centerY: 1795, symbolSize: 100 },
	type: { ...tokenRegularLayout.type, maxWidth: 0 },
	rules: { ...tokenRegularLayout.rules, height: 0 },
	symbol: { centerX: 0, centerY: 0, boxSize: 0 },
	pt: { ...tokenRegularLayout.pt, width: 0, height: 0 },
	footer: { ...commonFooter, metadataY: 2010, disclaimerY: 2040 },
}

export const seventhLayout: FrameLayout = {
	artwork: { dragLeft: 180, dragTop: 208, dragRight: 1330, dragBottom: 1138 },
	title: { x: 170, y: 148, maxWidth: 1160, font: '80px goudymedieval, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 4, shadowOffsetY: 3 },
	mana: { right: 1386, centerY: 140, symbolSize: 68, gap: 4, font: '48px goudymedieval, serif', color: '#fff' },
	type: { x: 161, y: 1209, maxWidth: 1178, font: '65px goudymedieval, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 4, shadowOffsetY: 3 },
	rules: { x: 192, y: 1285, width: 1116, height: 565, verticalAlign: 'middle', fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 72, minFontSize: 32 },
	symbol: { centerX: 1290, centerY: 1209, boxSize: 78 },
	pt: { x: 1211, y: 1899, width: 205, height: 90, textX: 1314, textY: 1944, font: '90px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 5, shadowOffsetY: 5 },
	footer: {
		align: 'center',
		x: 750,
		maxWidth: 1200,
		metadataY: 1925,
		metadata: { font: '42px goudymedieval, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 2 },
		disclaimerY: 1975,
		disclaimer: { font: '30px mplantin, serif', color: '#fff', shadowColor: '#111', shadowOffsetX: 0, shadowOffsetY: 0 },
		disclaimerColorByVariant: { W: '#111' },
	},
}

export const abuFrames: FrameFamily['frames'] = {
	W: 'img/frames/old/abu/w.png', U: 'img/frames/old/abu/u.png',
	B: 'img/frames/old/abu/b.png', R: 'img/frames/old/abu/r.webp',
	G: 'img/frames/old/abu/g.webp', A: 'img/frames/old/abu/a.png',
	L: 'img/frames/old/abu/l.png', WL: 'img/frames/old/abu/wl.png',
	UL: 'img/frames/old/abu/ul.png', BL: 'img/frames/old/abu/bl.png',
	RL: 'img/frames/old/abu/rl.png', GL: 'img/frames/old/abu/gl.png',
}

export const abuFallbacks: FrameFamily['fallbacks'] = {
	...commonFallbacks,
	C: 'A', M: 'A', ML: 'L',
	WU: 'A', WB: 'A', UB: 'A', UR: 'A', BR: 'A', BG: 'A', RG: 'A', RW: 'A', GW: 'A', GU: 'A',
}

export const abuLayout: FrameLayout = {
	artwork: { dragLeft: 174, dragTop: 219, dragRight: 1323, dragBottom: 1145 },
	title: { x: 105, y: 150, maxWidth: 1190, font: '90px goudymedieval, serif', color: '#ababab', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 3 },
	mana: { right: 1375, centerY: 157, symbolSize: 74, gap: 4, font: '48px goudymedieval, serif', color: '#ababab', shadowOffsetX: 0, shadowOffsetY: 0 },
	type: { x: 150, y: 1208, maxWidth: 1130, font: '70px mplantin, serif', color: '#ababab', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 3 },
	rules: { x: 225, y: 1270, width: 1050, height: 580, verticalAlign: 'middle', fontFamily: 'mplantin', italicFontFamily: 'mplantini', color: '#111', strokeColor: '#111', strokeWidth: 0.75, maxFontSize: 72, minFontSize: 32 },
	symbol: { centerX: 1325, centerY: 1225, boxSize: 74 },
	pt: { x: 1200, y: 1884, width: 240, height: 87, textX: 1320, textY: 1928, font: '87px mplantin, serif', color: '#ababab', shadowColor: '#111', shadowOffsetX: 3, shadowOffsetY: 3 },
	footer: {
		align: 'left', x: 150, maxWidth: 1200,
		metadataY: 1915, metadata: { font: '50px mplantin, serif', color: '#ababab', shadowColor: '#111', shadowOffsetX: 4, shadowOffsetY: 3 },
		disclaimerY: 1970, disclaimer: { font: '26px mplantin, serif', color: '#ababab', shadowColor: '#111', shadowOffsetX: 4, shadowOffsetY: 3 },
	},
}
