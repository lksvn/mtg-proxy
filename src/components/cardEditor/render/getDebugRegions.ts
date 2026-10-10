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
