import type { FrameFamily } from '../frameFamilies'

type DebugRegion = {
	label: string
	x: number
	y: number
	width: number
	height: number
	unrotated?: boolean
}

export function getDebugRegions(family: FrameFamily): DebugRegion[] {
	const { layout } = family
	const regions: DebugRegion[] = [
		{
			label: 'Artwork / drag area',
			x: layout.artwork.dragLeft,
			y: layout.artwork.dragTop,
			width: layout.artwork.dragRight - layout.artwork.dragLeft,
			height: layout.artwork.dragBottom - layout.artwork.dragTop,
		},
		{ label: 'Title', x: layout.title.x, y: layout.title.y - 50, width: layout.title.maxWidth, height: 100 },
		{ label: 'Mana', x: layout.mana.right - 420, y: layout.mana.centerY - layout.mana.symbolSize / 2, width: 420, height: layout.mana.symbolSize },
		{ label: 'Type', x: layout.type.x, y: layout.type.y - 50, width: layout.type.maxWidth, height: 100 },
		{
			label: 'Set symbol',
			x: layout.symbol.centerX - layout.symbol.boxSize / 2,
			y: layout.symbol.centerY - layout.symbol.boxSize / 2,
			width: layout.symbol.boxSize,
			height: layout.symbol.boxSize,
		},
		{ label: 'Rules', ...layout.rules },
		...(layout.flavorRules ? [{ label: 'Flavor text', ...layout.flavorRules }] : []),
		{ label: 'P/T', x: layout.pt.x, y: layout.pt.y, width: layout.pt.width, height: layout.pt.height },
		{
			label: 'Footer metadata',
			x: layout.footer.x,
			y: layout.footer.metadataY - 35,
			width: layout.footer.maxWidth,
			height: 55,
			unrotated: layout.footer.unrotated,
		},
		{
			label: 'Footer disclaimer',
			x: layout.footer.disclaimerX ?? layout.footer.x,
			y: layout.footer.disclaimerY - 35,
			width: layout.footer.maxWidth,
			height: 55,
			unrotated: layout.footer.unrotated,
		},
		...(family.overlay ? [{ label: 'Frame overlay', ...family.overlay }] : []),
	]

	if (layout.split) {
		if (layout.split.reminder) {
			const reminder = layout.split.reminder
			regions.push({ label: 'Fuse reminder', x: reminder.y, y: layout.split.firstOriginY - reminder.x - reminder.width, width: reminder.height, height: reminder.width })
		}
		const artwork = layout.split.secondArtwork
		regions.push({ label: 'Right artwork / drag area', x: artwork.dragLeft, y: artwork.dragTop, width: artwork.dragRight - artwork.dragLeft, height: artwork.dragBottom - artwork.dragTop })
		if (layout.split.secondLayout) {
			const second = layout.split.secondLayout
			const boxes = [
				{ label: 'Bottom title', x: second.title.x, y: second.title.y - 50, width: second.title.maxWidth, height: 100 },
				{ label: 'Bottom mana', x: second.mana.right - 300, y: second.mana.centerY - second.mana.symbolSize / 2, width: 300, height: second.mana.symbolSize },
				{ label: 'Bottom type', x: second.type.x, y: second.type.y - 40, width: second.type.maxWidth, height: 80 },
				{ label: 'Bottom rules', ...second.rules },
				{ label: 'Bottom set symbol', x: second.symbol.centerX - second.symbol.boxSize / 2, y: second.symbol.centerY - second.symbol.boxSize / 2, width: second.symbol.boxSize, height: second.symbol.boxSize },
			]
			regions.push(...boxes.map((box) => ({ ...box, x: second.originX - box.y - box.height, y: layout.split!.secondOriginY + box.x, width: box.height, height: box.width })))
			return regions
		}
		for (const [index, originY] of [layout.split.firstOriginY, layout.split.secondOriginY].entries()) {
			const side = index === 0 ? 'Left' : 'Right'
			const boxes = [
				{ label: `${side} title`, x: layout.title.x, y: layout.title.y - 50, width: layout.title.maxWidth, height: 100 },
				{ label: `${side} mana`, x: layout.mana.right - 300, y: layout.mana.centerY - layout.mana.symbolSize / 2, width: 300, height: layout.mana.symbolSize },
				{ label: `${side} type`, x: layout.type.x, y: layout.type.y - 40, width: layout.type.maxWidth, height: 80 },
				{ label: `${side} rules`, ...layout.rules },
				{ label: `${side} set symbol`, x: layout.symbol.centerX - layout.symbol.boxSize / 2, y: layout.symbol.centerY - layout.symbol.boxSize / 2, width: layout.symbol.boxSize, height: layout.symbol.boxSize },
			]
			regions.push(...boxes.map((box) => ({ ...box, x: box.y, y: originY - box.x - box.width, width: box.height, height: box.width })))
		}
		return regions.filter((region) => region.label.includes('artwork') || region.label.includes('Artwork') || region.label.startsWith('Left') || region.label.startsWith('Right') || region.label.startsWith('Footer') || region.label === 'Fuse reminder')
	}

	if (layout.saga) {
		regions.push(
			{ label: 'Saga reminder', ...layout.saga.reminder },
			{ label: 'Saga abilities', ...layout.saga.abilities },
			{
				label: 'Saga chapters',
				x: layout.saga.chapter.x,
				y: layout.saga.abilities.y,
				width: layout.saga.chapter.width,
				height: layout.saga.abilities.height,
			},
		)
		if (layout.saga.creatureRules) regions.push({ label: 'Creature rules', ...layout.saga.creatureRules })
		if (layout.saga.reversePt) regions.push({ label: 'Reverse P/T', ...layout.saga.reversePt })
	}

	if (layout.room) {
		const { left, right, titleWidth, rules, type, reminder } = layout.room
		regions.push(
			{ label: 'Left title / mana', x: left.originX, y: left.originY - titleWidth, width: 100, height: titleWidth },
			{ label: 'Right title / mana', x: right.originX, y: right.originY - titleWidth, width: 100, height: titleWidth },
			{ label: 'Left rules', x: rules.x, y: left.originY - 10 - rules.width, width: rules.height, height: rules.width },
			{ label: 'Right rules', x: rules.x, y: right.originY - 10 - rules.width, width: rules.height, height: rules.width },
			{ label: 'Room type', x: type.x, y: type.y - type.width, width: type.height, height: type.width },
			{ label: 'Room reminder', x: reminder.x, y: reminder.y - reminder.width, width: reminder.height, height: reminder.width },
		)
	}

	if (layout.adventure) {
		regions.push(
			{ label: 'Adventure title', x: layout.adventure.title.x, y: layout.adventure.title.y - 40, width: layout.adventure.title.maxWidth, height: 80 },
			{ label: 'Adventure mana', x: layout.adventure.mana.right - 300, y: layout.adventure.mana.centerY - layout.adventure.mana.symbolSize / 2, width: 300, height: layout.adventure.mana.symbolSize },
			{ label: 'Adventure type', x: layout.adventure.type.x, y: layout.adventure.type.y - 35, width: layout.adventure.type.maxWidth, height: 70 },
			{ label: 'Adventure rules', ...layout.adventure.rules },
		)
	}

	if (layout.leveler) {
		regions.push(
			{ label: 'Level up', ...layout.leveler.levelUp },
			{ label: 'Level 2 label', x: layout.leveler.levelTwo.label.x - 60, y: layout.leveler.levelTwo.label.y - 60, width: 120, height: 120 },
			{ label: 'Level 2 rules', ...layout.leveler.levelTwo.rules },
			{ label: 'Level 2 P/T', x: layout.leveler.levelTwo.powerToughness.x - 105, y: layout.leveler.levelTwo.powerToughness.y - 50, width: 210, height: 100 },
			{ label: 'Level 3 label', x: layout.leveler.levelThree.label.x - 60, y: layout.leveler.levelThree.label.y - 60, width: 120, height: 120 },
			{ label: 'Level 3 rules', ...layout.leveler.levelThree.rules },
			{ label: 'Level 3 P/T', x: layout.leveler.levelThree.powerToughness.x - 105, y: layout.leveler.levelThree.powerToughness.y - 50, width: 210, height: 100 },
		)
	}

	return regions.filter(({ width, height }) => width > 0 && height > 0)
}
