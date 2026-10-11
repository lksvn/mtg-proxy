import { DUAL_FRAME_VARIANTS, type CustomCardData } from '../types'
import type { CardRenderInput } from '../cardRender'
import { getAbuDualLandColors, getRunSymbolFile, hasHybridManaSymbol, parseCardText, parseRulesText, parseManaCost, type CardTextRun } from '../cardText'
import { drawCard, drawCardFooter, HEIGHT, WIDTH } from './drawCard'
import { futureManaFile } from './drawManaCost'
import { loadImage, loadImageSource } from './loadImage'
import { loadDualFrame } from './composeDualFrame'
import { loadAbuDualLand } from './composeAbuDualLand'
import { loadBorderOverlay } from './composeBorder'
import { getFrameFamily, resolveFrameVariant, resolvePtVariant } from '../frameFamilies'
import { drawIconlessPlaneswalkerAbilities, drawPlaneswalker, drawPlaneswalkerBackground, drawPlaneswalkerNickname, drawPlaneswalkerReverseFace, PLANESWALKER_ASSETS, type PlaneswalkerIcons } from './drawPlaneswalker'
import { drawSaga, SAGA_ASSETS, type SagaImages } from './drawSaga'
import { CLASS_HEADER, drawClass } from './drawClass'
import { drawCase } from './drawCase'
import { drawRoom } from './drawRoom'
import { drawSplit } from './drawSplit'
import { drawAdventure } from './drawAdventure'
import { drawLeveler } from './drawLeveler'
import { hasRulesTextOverflow, resetRulesTextOverflow } from './drawRulesText'

const MANA_SYMBOLS_URL = `${import.meta.env.BASE_URL}img/manaSymbols/`
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
const COLOR_INDICATOR_ORDER = ['W', 'U', 'B', 'R', 'G'] as const

export async function renderCardPreview(
	input: CardRenderInput,
	canvasRef: { current: HTMLCanvasElement | null },
	isCancelled: () => boolean,
) {
	const { artwork, setSymbol, frameFamily, frameVariant, borderStyle, transform, card } = input
	const family = getFrameFamily(frameFamily)
	const planeswalker = 'startingLoyalty' in card
	const saga = 'chapters' in card
	const classCard = 'levels' in card
	const caseCard = 'solveCondition' in card
	const room = 'otherManaCost' in card
	const split = 'secondManaCost' in card
	const adventure = 'adventureManaCost' in card
	const leveler = 'levelUpText' in card
	const drawableCard: CustomCardData = planeswalker ? {
		...card,
		name: family.id === 'planeswalker-nickname' ? card.nickname : card.name,
		rulesText: '',
		centerRulesText: false,
		flavorText: '',
		powerToughness: card.startingLoyalty,
	} : saga || classCard || caseCard || room || leveler ? { ...card, rulesText: '', flavorText: '' } : card
	const manaRuns = parseManaCost(card.manaCost)
	const rulesRuns = parseRulesText(drawableCard.rulesText)

	const flavorRuns = parseCardText(drawableCard.flavorText).map(
		(run): CardTextRun =>
			run.type === 'text'
				? { ...run, italic: true }
				: run,
	)

	const abilityRuns = planeswalker ? card.abilities.map(({ text }) => parseRulesText(text)) : []
	const sagaReminderRuns = saga ? parseRulesText(card.rulesText) : []
	const sagaChapterRuns = saga ? card.chapters.map(({ text }) => parseRulesText(text)) : []
	const sagaCreatureRulesRuns = saga && family.layout.saga?.creatureRules ? parseRulesText(card.flavorText) : []
	const classLevelRuns = classCard ? card.levels.map(({ text }) => parseRulesText(text)) : []
	const classCostRuns = classCard ? card.levels.map(({ cost }) => parseManaCost(cost)) : []
	const caseRuns = caseCard
		? [parseRulesText(card.rulesText), parseRulesText(card.solveCondition), parseRulesText(card.solvedAbility)]
		: []
	const roomManaRuns = room ? [manaRuns, parseManaCost(card.otherManaCost)] : []
	const roomRulesRuns = room ? [parseRulesText(card.rulesText), parseRulesText(card.otherRulesText)] : []
	const roomReminderRuns = room ? parseRulesText(card.reminderText) : []
	const splitManaRuns = split ? [manaRuns, parseManaCost(card.secondManaCost)] : []
	const splitReminderRuns = split && family.layout.split?.reminder ? parseRulesText(card.fuseReminderText ?? '') : []
	const splitRulesRuns = split ? [
		parseRulesText(card.rulesText + (card.flavorText ? `\n\n*${card.flavorText}*` : '')),
		parseRulesText(card.secondRulesText + (card.secondFlavorText ? `\n\n*${card.secondFlavorText}*` : '')),
	] : []
	const adventureManaRuns = adventure ? parseManaCost(card.adventureManaCost) : []
	const adventureRulesRuns = adventure ? parseRulesText(card.adventureRulesText) : []
	const levelerRuns = leveler ? [parseRulesText(card.levelUpText), parseRulesText(card.levelTwoRulesText), parseRulesText(card.levelThreeRulesText)] : []
	const reverseManaRuns = planeswalker ? parseManaCost(card.reverseFaceManaCost) : []
	const planeswalkerMask = family.id === 'planeswalker-mdfc-back'
		? 'img/frames/planeswalker/mdfc/text.png'
		: family.id === 'planeswalker-compleated'
			? 'img/frames/planeswalker/compleated/text.svg'
		: family.id === 'planeswalker-transform-front' || family.id === 'planeswalker-transform-front-double-feature'
			? 'img/frames/planeswalker/transform/textFront.svg'
		: family.id === 'planeswalker-tall' || family.id === 'planeswalker-tall-borderless' || family.id === 'planeswalker-tall-double-feature'
			? 'img/frames/planeswalker/tall/planeswalkerTallMaskRules.png'
			: PLANESWALKER_ASSETS.mask
	const planeswalkerAssets = { ...PLANESWALKER_ASSETS, mask: planeswalkerMask }
	const allRuns = [
		...manaRuns,
		...reverseManaRuns,
		...rulesRuns,
		...flavorRuns,
		...abilityRuns.flat(),
		...sagaReminderRuns,
		...sagaChapterRuns.flat(),
		...sagaCreatureRulesRuns,
		...classLevelRuns.flat(),
		...classCostRuns.flat(),
		...caseRuns.flat(),
		...roomManaRuns.flat(),
		...roomRulesRuns.flat(),
		...roomReminderRuns,
		...splitManaRuns.flat(),
		...splitRulesRuns.flat(),
		...splitReminderRuns,
		...adventureManaRuns,
		...adventureRulesRuns,
		...levelerRuns.flat(),
	]
	const futureManaFiles = family.id === 'future-sight'
		? manaRuns.flatMap((run) => run.type === 'symbol' ? [futureManaFile(run.value)].filter((file): file is string => Boolean(file)) : [])
		: []
	const cardTypes = card.typeLine.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
	const typeMatches = family.typeIconMasks ? ([
		['creature', /\b(creature|criatura)\b/], ['instant', /\b(instant|instantanea)\b/],
		['sorcery', /\b(sorcery|feitico)\b/], ['enchantment', /\b(enchantment|encantamento)\b/],
		['artifact', /\b(artifact|artefato)\b/], ['land', /\b(land|terreno)\b/],
	] as const).filter(([, pattern]) => pattern.test(cardTypes)) : []
	const typeIconKey = typeMatches.length > 1 ? 'multi' : typeMatches[0]?.[0]
	const typeIconPath = typeIconKey ? family.typeIconMasks?.[typeIconKey] : undefined

	const manaFiles = [
		...new Set(
			allRuns.flatMap((run) => {
				if (run.type !== 'symbol') return []

				const file = getRunSymbolFile(run.value)
				return file ? [file] : []
			}),
		),
	]

	const resolvedVariant = resolveFrameVariant(family, frameVariant)
	const abuLandColors = family.dualLandMask && (frameVariant === 'L' || frameVariant === 'ML')
		? getAbuDualLandColors(card.name, card.typeLine)
		: undefined
	const dualPair = DUAL_FRAME_VARIANTS.find((pair) => pair === resolvedVariant)
	const hybrid = Boolean(dualPair && hasHybridManaSymbol(card.manaCost))
	const ptVariant = resolvePtVariant(resolvedVariant, hybrid)
	const ptPath = family.pt[ptVariant] ?? family.pt.C ?? Object.values(family.pt)[0]
	const frameOverlay = family.frameOverlays?.[resolvedVariant]
	const colorIndicatorColors = family.layout.colorIndicator
		? COLOR_INDICATOR_ORDER.filter((color) => card.manaCost.toUpperCase().includes(color))
		: []
	const [frame, overlay, frameOverlayImage, border, ptBackground, art, symbol, typeIcon, planeswalkerIcons, colorIndicatorBase, sagaImages, classHeader, secondFrame, secondArt] = await Promise.all([
		abuLandColors
			? loadAbuDualLand(family, abuLandColors)
			: dualPair
			? loadDualFrame(family, dualPair, hybrid)
			: loadImage(assetUrl(family.frames[resolvedVariant]!)),
		family.overlay ? loadImage(assetUrl(family.overlay.path)) : undefined,
		frameOverlay ? loadImage(assetUrl(frameOverlay.path)) : undefined,
		family.borderMask && borderStyle !== (family.baseBorderStyle ?? 'black')
			? loadBorderOverlay(family.borderMask, borderStyle)
			: undefined,
		ptPath ? loadImage(assetUrl(ptPath)) : undefined,
		artwork ? loadImageSource(artwork) : undefined,
		setSymbol ? loadImageSource(setSymbol) : undefined,
		typeIconPath ? loadImage(assetUrl(typeIconPath)) : undefined,
		planeswalker ? Promise.all(Object.entries(planeswalkerAssets).map(async ([key, path]) => [key, await loadImage(assetUrl(path))] as const)).then((entries) => Object.fromEntries(entries) as PlaneswalkerIcons) : undefined,
		colorIndicatorColors.length ? loadImage(assetUrl('img/frames/planeswalker/color-indicator/base.png')) : undefined,
		saga ? Promise.all(Object.entries(SAGA_ASSETS).map(async ([key, path]) => [key, await loadImage(assetUrl(path))] as const)).then((entries) => Object.fromEntries(entries) as SagaImages) : undefined,
		classCard ? loadImage(assetUrl(CLASS_HEADER)) : undefined,
		input.split ? loadImage(assetUrl(family.frames[resolveFrameVariant(family, input.split.frameVariant)]!)) : undefined,
		input.split?.artwork ? loadImageSource(input.split.artwork) : undefined,
	])
	const manaSymbols = new Map(
		await Promise.all(
			[...manaFiles, ...futureManaFiles].map(async (file) => [
				file,
				await loadImage(`${MANA_SYMBOLS_URL}${family.manaSymbolOverrides?.[file] ?? file}`),
			] as const),
		),
	)
	await Promise.all(family.fonts.map((font) => document.fonts.load(font)))

	if (isCancelled()) return

	const canvas = canvasRef.current
	const context = canvas?.getContext('2d')

	if (!canvas || !context) throw new Error('Could not access the card canvas')
	resetRulesTextOverflow(context)

	const iconlessPlaneswalker = family.id === 'planeswalker-seventh'
	context.resetTransform()
	context.clearRect(0, 0, WIDTH, HEIGHT)
	if (split && input.split && secondFrame) {
		drawSplit(context, card, [frame, secondFrame], [art, secondArt], [transform, input.split.transform], splitManaRuns, splitRulesRuns, splitReminderRuns, manaSymbols, symbol, family.layout)
		drawCardFooter(context, card, family.layout, resolvedVariant)
		return hasRulesTextOverflow(context)
	}
	if (family.layout.canvas?.rotation === 'counterclockwise') {
		context.translate(0, HEIGHT)
		context.rotate(-Math.PI / 2)
	}
	drawCard(
		context,
		drawableCard,
		transform,
		{
			frame,
			overlay: overlay && family.overlay ? { image: overlay, ...family.overlay } : undefined,
			frameOverlay: frameOverlayImage && frameOverlay
				? { image: frameOverlayImage, crops: frameOverlay.crops, bounds: frameOverlay.bounds }
				: undefined,
			border,
			colorIndicatorBase,
			colorIndicatorColors,
			ptBackground,
			art,
			symbol,
			typeIcon,
			manaSymbols,
		},
		{ manaRuns, rulesRuns, flavorRuns },
		family.layout,
		resolvedVariant,
		planeswalker && planeswalkerIcons && !iconlessPlaneswalker
			? () => drawPlaneswalkerBackground(
				context,
				card,
				abilityRuns,
				planeswalkerIcons,
				family.layout.rules.y,
				family.layout.rules.y + family.layout.rules.height,
			)
			: undefined,
	)
	if (planeswalker && planeswalkerIcons) {
		if (iconlessPlaneswalker) {
			drawIconlessPlaneswalkerAbilities(context, card, abilityRuns, manaSymbols, family.layout.rules)
		} else {
			drawPlaneswalker(
				context,
				card,
				abilityRuns,
				manaSymbols,
				planeswalkerIcons,
				family.layout.rules.y,
				family.layout.rules.y + family.layout.rules.height,
				family.id.startsWith('planeswalker-sdcc15')
					? card.abilityTextColor ?? '#fff'
					: family.layout.rules.color,
			)
		}
		if (family.id === 'planeswalker-nickname') drawPlaneswalkerNickname(context, card.name)
		if (family.id === 'planeswalker-mdfc-back') {
			drawPlaneswalkerReverseFace(context, card, reverseManaRuns, manaSymbols)
		}
	}
	if (saga && sagaImages) {
		drawSaga(
			context,
			card,
			sagaReminderRuns,
			sagaChapterRuns,
			sagaCreatureRulesRuns,
			manaSymbols,
			sagaImages,
			family.layout.saga!,
		)
	}
	if (classCard && classHeader) {
		drawClass(context, card, classLevelRuns, classCostRuns, manaSymbols, classHeader, family.layout.class!)
	}
	if (caseCard) {
		drawCase(context, caseRuns, manaSymbols, family.layout.case!)
	}
	if (room) {
		drawRoom(context, card, roomManaRuns, roomRulesRuns, roomReminderRuns, manaSymbols, family.layout.room!)
	}
	if (adventure) {
		drawAdventure(context, card, adventureManaRuns, adventureRulesRuns, manaSymbols, family.layout.adventure!)
	}
	if (leveler) {
		drawLeveler(context, card, levelerRuns, manaSymbols, family.layout.leveler!)
	}
	context.resetTransform()
	if (family.layout.footer.unrotated) {
		drawCardFooter(context, drawableCard, family.layout, resolvedVariant)
	}
	return hasRulesTextOverflow(context)
}
