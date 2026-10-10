import { useCallback, useMemo, useRef, useState } from 'react'
import { CardCanvas, type ArtworkTransform } from './CardCanvas'
import { canExportCardRender, type CardRenderInput, type CardRenderResult } from './cardRender'
import { getQuantityError } from '../../Cards'
import { canvasToPng } from '../../utils/canvasToPng'
import { cardPngFilename } from '../../utils/cardPngFilename'
import { FileInput } from '../FileInput'
import { loadImageSource } from './render/loadImage'
import { ArtworkControls } from './ui/ArtworkControls'
import { CardDetailsForm } from './ui/CardDetailsForm'
import { PlaneswalkerDetailsForm } from './ui/PlaneswalkerDetailsForm'
import { SagaDetailsForm } from './ui/SagaDetailsForm'
import { ClassDetailsForm } from './ui/ClassDetailsForm'
import { CaseDetailsForm } from './ui/CaseDetailsForm'
import { RoomDetailsForm } from './ui/RoomDetailsForm'
import { AdventureDetailsForm } from './ui/AdventureDetailsForm'
import { LevelerDetailsForm } from './ui/LevelerDetailsForm'
import type { AdventureCardData, CaseCardData, ClassCardData, CustomCardData, FrameVariant, LevelerCardData, PlaneswalkerCardData, RoomCardData, SagaCardData } from './types'
import { inferFrameVariant } from './cardText'
import { useI18n } from '../../i18n/context'
import { downloadBlob } from '../../utils/downloadBlob'
import { setPngDpi } from '../../utils/pngDpi'
import { Icon } from '../Icon'
import { getFrameFamily, type FrameBorderStyle, type FrameFamilyId } from './frameFamilies'
import { FrameColorPicker } from './ui/FrameColorPicker'
import {
	FRAME_STYLE_GROUPS,
	ADVENTURE_STYLES,
	CLASS_STYLES,
	CASE_STYLES,
	PLANESWALKER_STYLES,
	SAGA_STYLES,
	TOKEN_STYLES,
	type PlaneswalkerStyle,
	type ClassStyle,
	type CaseStyle,
	type SagaStyle,
	type TokenStyle,
	type AdventureStyle,
} from './editorOptions'

const SAMPLE_ARTWORK_URL = `${import.meta.env.BASE_URL}img/samples/marrow-gnawer.jpg`
const SAMPLE_SET_SYMBOL_URL = `${import.meta.env.BASE_URL}img/setSymbols/chk.svg`
function createDefaultArtworkTransform(grayscale = false): ArtworkTransform {
	return { x: 0, y: 0, flipX: false, flipY: false, grayscale, scale: 0, rotation: 0 }
}

function isDoubleFeatureStyle(style: PlaneswalkerStyle) {
	return style === 'planeswalker-double-feature' ||
		style === 'planeswalker-tall-double-feature' ||
		style === 'planeswalker-transform-front-double-feature' ||
		style === 'planeswalker-transform-back-double-feature'
}

type CustomCardEditorProps = {
	onError: (message: string) => void
	onAddToDeckList?: (card: {
		quantity: number
		name: string
		typeLine: string
		artist: string
		collectorNumber: string
		image: Blob
	}) => void
}

export function CustomCardEditor({ onAddToDeckList, onError }: CustomCardEditorProps) {
	const { t } = useI18n()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [renderResult, setRenderResult] = useState<CardRenderResult | null>(null)
	const [artwork, setArtwork] = useState<File | string | undefined>(SAMPLE_ARTWORK_URL)
    const [artworkTransform, setArtworkTransform] = useState(createDefaultArtworkTransform)
    const [setSymbol, setSetSymbol] = useState<File | string | undefined>(SAMPLE_SET_SYMBOL_URL)
	const [frameSelection, setFrameSelection] = useState<FrameVariant | 'auto'>('auto')
	const [tokenFrameSelection, setTokenFrameSelection] = useState<FrameVariant | 'auto'>('C')
	const [frameFamily, setFrameFamily] = useState<FrameFamilyId>('box-topper')
	const [borderStyle, setBorderStyle] = useState<FrameBorderStyle>('black')
	const [frameStyleSearch, setFrameStyleSearch] = useState('')
	const [customCardQuantity, setCustomCardQuantity] = useState('1')
	const quantity = Number(customCardQuantity)
	const quantityError = getQuantityError(quantity)
	const [layout, setLayout] = useState<'card' | 'token' | 'planeswalker' | 'battle' | 'saga' | 'class' | 'case' | 'room' | 'adventure' | 'leveler'>('card')
	const [tokenStyle, setTokenStyle] = useState<TokenStyle>('token-regular')
	const [planeswalkerStyle, setPlaneswalkerStyle] = useState<PlaneswalkerStyle>('planeswalker-regular')
	const [sagaStyle, setSagaStyle] = useState<SagaStyle>('saga-regular')
	const [classStyle, setClassStyle] = useState<ClassStyle>('class-regular')
	const [caseStyle, setCaseStyle] = useState<CaseStyle>('case-regular')
	const [adventureStyle, setAdventureStyle] = useState<AdventureStyle>('adventure-regular')
    const [card, setCard] = useState<CustomCardData>({
        name: 'Marrow-Gnawer',
        manaCost: '3bb',
        typeLine: 'Legendary Creature — Rat Rogue',
        rulesText: `All Rats have fear.
{T}, Sacrifice a Rat: Create X 1/1 black Rat creature tokens, where X is the number of Rats you control.`,
		centerRulesText: false,
        flavorText: 'Marrow-Gnawer united three nezumi gangs when he slew their leaders in a single night. Now they call him their first lord.',
        powerToughness: '2/3',
        artist: 'Wayne Reynolds',
        number: '124',
        rarity: 'rare',
        tintSetSymbol: false,
        backgroundColor: '#000000'
    })
	const [token, setToken] = useState<CustomCardData>({
		name: 'Rat', manaCost: '', typeLine: 'Token Creature — Rat', rulesText: '', centerRulesText: false, flavorText: '',
		powerToughness: '1/1', artist: '', number: '1', rarity: 'common', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const [planeswalker, setPlaneswalker] = useState<PlaneswalkerCardData>({
		name: 'Jace, Arcane Strategist', manaCost: '4uu', typeLine: 'Legendary Planeswalker — Jace', startingLoyalty: '4',
		nickname: 'The Mind Sculptor',
		reverseFaceName: '', reverseFaceManaCost: '',
		abilities: [
			{ cost: '+1', text: 'Draw a card.' },
			{ cost: '-2', text: 'Return target creature to its owner’s hand.' },
			{ cost: '-8', text: 'Draw seven cards. You get an emblem with “You have no maximum hand size.”' },
		],
		artist: '', number: '1', rarity: 'mythic', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const [battle, setBattle] = useState<CustomCardData>({
		name: 'Invasion of Zendikar', manaCost: '3g', typeLine: 'Battle — Siege',
		rulesText: '(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it’s defeated, exile it, then cast it transformed.)\n\nWhen Invasion of Zendikar enters, search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.',
		centerRulesText: false, flavorText: '', powerToughness: '3', artist: '', number: '194',
		rarity: 'uncommon', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const [saga, setSaga] = useState<SagaCardData>({
		name: 'History of Benalia', manaCost: '1ww', typeLine: 'Enchantment — Saga',
		rulesText: '(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)',
		centerRulesText: false, flavorText: '', powerToughness: '', artist: '', number: '21',
		rarity: 'mythic', tintSetSymbol: false, backgroundColor: '#000000',
		chapters: [
			{ chapterCount: 1, text: 'Create a 2/2 white Knight creature token with vigilance.' },
			{ chapterCount: 1, text: 'Create a 2/2 white Knight creature token with vigilance.' },
			{ chapterCount: 1, text: 'Knights you control get +2/+1 until end of turn.' },
		],
		reversePowerToughness: '',
	})
	const [classCard, setClassCard] = useState<ClassCardData>({
		name: 'Wizard Class', manaCost: 'u', typeLine: 'Enchantment — Class',
		rulesText: '', centerRulesText: false, flavorText: '', powerToughness: '', artist: '', number: '81',
		rarity: 'uncommon', tintSetSymbol: false, backgroundColor: '#000000',
		levels: [
			{ cost: '', name: '', text: '(Gain the next level as a sorcery to add its ability.)\nYou have no maximum hand size.' },
			{ cost: '{2}{U}', name: 'Level 2', text: 'When this Class becomes level 2, draw two cards.' },
			{ cost: '{4}{U}', name: 'Level 3', text: 'Whenever you draw a card, put a +1/+1 counter on target creature you control.' },
		],
	})
	const [caseCard, setCaseCard] = useState<CaseCardData>({
		name: 'Case of the Uneaten Feast', manaCost: 'w', typeLine: 'Enchantment — Case',
		rulesText: 'Whenever a creature enters under your control, you gain 1 life.',
		solveCondition: '(If unsolved, solve at the beginning of your end step.) You gained 5 or more life this turn.',
		solvedAbility: 'Creatures you control get +1/+1.',
		centerRulesText: false, flavorText: '', powerToughness: '', artist: '', number: '10',
		rarity: 'uncommon', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const [room, setRoom] = useState<RoomCardData>({
		name: 'Bottomless Pool', manaCost: 'u', rulesText: 'When you unlock this door, return up to one target creature to its owner’s hand.',
		otherName: 'Locker Room', otherManaCost: '4u', otherRulesText: 'Whenever one or more creatures you control deal combat damage to a player, draw a card.',
		typeLine: 'Enchantment — Room', reminderText: '(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)',
		centerRulesText: false, flavorText: '', powerToughness: '', artist: '', number: '43',
		rarity: 'uncommon', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const [adventure, setAdventure] = useState<AdventureCardData>({
		name: 'Beanstalk Giant', manaCost: '6g', typeLine: 'Creature — Giant', rulesText: 'Beanstalk Giant’s power and toughness are each equal to the number of lands you control.',
		adventureName: 'Fertile Footsteps', adventureManaCost: '2g', adventureTypeLine: 'Sorcery — Adventure', adventureRulesText: 'Search your library for a basic land card, put it onto the battlefield, then shuffle.',
		centerRulesText: false, flavorText: '', powerToughness: '*/*', artist: '', number: '149',
		rarity: 'uncommon', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const [leveler, setLeveler] = useState<LevelerCardData>({
		name: 'Transcendent Master', manaCost: '1ww', typeLine: 'Creature — Human Cleric Avatar', rulesText: '',
		levelUpText: 'Level up {1} ({1}: Put a level counter on this. Level up only as a sorcery.)',
		levelTwo: '6-11', levelTwoRulesText: 'Lifelink', levelTwoPowerToughness: '6/6',
		levelThree: '12+', levelThreeRulesText: 'Lifelink\nTranscendent Master is indestructible.', levelThreePowerToughness: '9/9',
		centerRulesText: false, flavorText: '', powerToughness: '3/3', artist: '', number: '47',
		rarity: 'mythic', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const activeCard = layout === 'token' ? token : layout === 'planeswalker' ? planeswalker : layout === 'battle' ? battle : layout === 'saga' ? saga : layout === 'class' ? classCard : layout === 'case' ? caseCard : layout === 'room' ? room : layout === 'adventure' ? adventure : layout === 'leveler' ? leveler : card
	const activeFamily: FrameFamilyId = layout === 'token' ? tokenStyle : layout === 'planeswalker' ? planeswalkerStyle : layout === 'battle' ? 'battle-regular' : layout === 'saga' ? sagaStyle : layout === 'class' ? classStyle : layout === 'case' ? caseStyle : layout === 'room' ? 'room-regular' : layout === 'adventure' ? adventureStyle : layout === 'leveler' ? 'leveler-regular' : frameFamily
	const activeFrameSelection = layout === 'token' ? tokenFrameSelection : frameSelection
	const tokenOptions = TOKEN_STYLES.find(({ id }) => id === tokenStyle)!
	const planeswalkerLimitedColors = planeswalkerStyle === 'planeswalker-transform-front' ||
		planeswalkerStyle === 'planeswalker-transform-back' ||
		planeswalkerStyle === 'planeswalker-mdfc-back' ||
		planeswalkerStyle === 'planeswalker-compleated' ||
		isDoubleFeatureStyle(planeswalkerStyle)
	const frameVariant = activeFrameSelection === 'auto'
		? inferFrameVariant(activeCard.manaCost, activeCard.typeLine)
		: activeFrameSelection
	const renderInput = useMemo<CardRenderInput>(() => ({
		artwork,
		setSymbol,
		frameFamily: activeFamily,
		borderStyle: activeFamily === 'token-unglued' ? 'silver' : borderStyle,
		frameVariant,
		transform: artworkTransform,
		card: activeCard,
	}), [artwork, setSymbol, activeFamily, borderStyle, frameVariant, artworkTransform, activeCard])
	const canExport = canExportCardRender(renderInput, renderResult)
	const renderFailed = renderResult?.input === renderInput && renderResult.status === 'error'
	const handleRenderResult = useCallback((result: CardRenderResult) => {
		setRenderResult(result)
		if (result.input === renderInput && result.status === 'error') {
			onError(t('couldNotRenderCard'))
		}
	}, [renderInput, onError, t])
	const search = frameStyleSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

	async function downloadPng(dpi?: number) {
		if (!canExport) return
		try {
			const blob = await canvasToPng(canvasRef.current)
			if (!dpi) {
				downloadBlob(blob, cardPngFilename(activeCard.name))
				return
			}
			const png = setPngDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
			downloadBlob(new Blob([png.buffer as ArrayBuffer], { type: 'image/png' }), cardPngFilename(activeCard.name, dpi))
		} catch {
			onError(t('couldNotExportCard'))
		}
	}

	async function addToDeckList() {
		if (!canExport || quantityError) return
		try {
			const image = await canvasToPng(canvasRef.current)
			onAddToDeckList?.({
				quantity,
				name: activeCard.name || t('customCard'),
				typeLine: activeCard.typeLine,
				artist: activeCard.artist,
				collectorNumber: activeCard.number,
				image,
			})
		} catch {
			onError(t('couldNotAddCustomCard'))
		}
	}

	return (
		<section>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem'}}>
                <div>
					<details className="form-section" open>
                        <summary><h5 className="mt-5">{t('cardImageSection')}</h5></summary>
                        <div className="form-group gap-2">
                            <FileInput
                                id="custom-card-artwork"
                                accept="image/*"
                                label={t('chooseArtwork')}
                                hasValue={Boolean(artwork)}
                                validate={loadImageSource}
                                validationError={t('invalidImageFile')}
                                onSelect={(file) => {
                                    setArtwork(file)
                                    setArtworkTransform(createDefaultArtworkTransform(
										layout === 'planeswalker' && isDoubleFeatureStyle(planeswalkerStyle),
									))
                                }}
                                onClear={() => setArtwork(undefined)}
                            />
                        </div>
						{(layout !== 'token' || !tokenOptions.hideSetSymbol) && <div className="form-group gap-2 mb-5"><FileInput
                            id="custom-card-set-symbol"
                            accept="image/*"
                            label={t('chooseSetSymbol')}
                            validate={loadImageSource}
                            validationError={t('invalidImageFile')}
                            hasValue={Boolean(setSymbol)}
                            onSelect={setSetSymbol}
                            onClear={() => setSetSymbol(undefined)}
						/></div>}
					</details>
					<details className="form-section" open>
					    <summary><h5 className="mt-5">{t('cardEditionSection')}</h5></summary>
                        <div className="form-group gap-2">
                            <label htmlFor="card-layout">{t('cardLayout')}</label>
                            <select id="card-layout" value={layout} onChange={(event) => setLayout(event.target.value as typeof layout)}>
                                <option value="card">{t('cardLayoutCard')}</option>
                                <option value="token">{t('cardLayoutToken')}</option>
                                <option value="planeswalker">{t('cardLayoutPlaneswalker')}</option>
								<option value="battle">{t('cardLayoutBattle')}</option>
								<option value="saga">{t('cardLayoutSaga')}</option>
								<option value="class">{t('cardLayoutClass')}</option>
								<option value="case">{t('cardLayoutCase')}</option>
								<option value="room">{t('cardLayoutRoom')}</option>
								<option value="adventure">{t('cardLayoutAdventure')}</option>
								<option value="leveler">{t('cardLayoutLeveler')}</option>
                            </select>
                        </div>
                        {layout === 'card' && <>
                            <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gridAutoFlow:'dense'}} className="gap-3">
                                <div className="form-group gap-2">
                                    <label htmlFor="card-frame-style-search">{t('searchFrameStyles')}</label>
                                    <input
                                        id="card-frame-style-search"
                                        type="search"
                                        value={frameStyleSearch}
                                        onChange={(event) => setFrameStyleSearch(event.target.value)}
                                    />
                                </div>
                                <div className="form-group gap-2">
                                    <label htmlFor="card-frame-style">{t('frameStyle')}</label>
                                    <select
                                        id="card-frame-style"
                                        value={frameFamily}
                                        onChange={(event) => {
                                            const family = event.target.value as FrameFamilyId
                                            setFrameFamily(family)
                                            setBorderStyle(getFrameFamily(family).defaultBorderStyle ?? 'black')
                                            setFrameStyleSearch('')
                                        }}
                                    >
                                        {FRAME_STYLE_GROUPS.map((group) => {
                                            const options = group.options.filter((option) =>
                                                option.id === frameFamily ||
                                                t(option.label).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(search) ||
                                                option.id.includes(search),
                                            )
                                            return options.length > 0 && (
                                                <optgroup key={group.label} label={t(group.label)}>
                                                    {options.map((option) => <option key={option.id} value={option.id}>{t(option.label)}</option>)}
                                                </optgroup>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            {activeFamily !== 'token-unglued' && getFrameFamily(activeFamily).borderMask && (
                                <div className="form-group gap-2">
                                    <label htmlFor="card-frame-border">{t('frameBorder')}</label>
                                    <select id="card-frame-border" value={borderStyle} onChange={(event) => setBorderStyle(event.target.value as FrameBorderStyle)}>
                                        <option value="black">{t('frameBorderBlack')}</option>
                                        <option value="white">{t('frameBorderWhite')}</option>
                                        <option value="silver">{t('frameBorderSilver')}</option>
                                        <option value="gold">{t('frameBorderGold')}</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group gap-2">
                                <FrameColorPicker value={frameSelection} onChange={setFrameSelection} />
							</div>
                        </>}
                        {layout === 'token' && <div className="form-group gap-2">
                            <label htmlFor="token-style">{t('tokenStyle')}</label>
                            <select id="token-style" value={tokenStyle} onChange={(event) => setTokenStyle(event.target.value as typeof tokenStyle)}>
                                {TOKEN_STYLES.map(({ id, label }) => <option key={id} value={id}>{t(label)}</option>)}
                            </select>
                        </div>}
                        {layout === 'token' && !tokenOptions.hideColor && <div className="form-group gap-2 mb-5">
                            <FrameColorPicker value={tokenFrameSelection} onChange={setTokenFrameSelection} hideLands hideVehicles />
                        </div>}
                        {layout === 'planeswalker' && <>
                            <div className="form-group gap-2">
                                <label htmlFor="planeswalker-style">{t('planeswalkerStyle')}</label>
                                <select
                                    id="planeswalker-style"
                                    value={planeswalkerStyle}
                                    onChange={(event) => {
                                        const style = event.target.value as PlaneswalkerStyle
                                        setPlaneswalkerStyle(style)
										setArtworkTransform({
											...artworkTransform,
											grayscale: isDoubleFeatureStyle(style),
										})
                                        const limitedColors = style === 'planeswalker-transform-front' ||
                                            style === 'planeswalker-transform-back' ||
                                            style === 'planeswalker-mdfc-back' ||
                                            style === 'planeswalker-compleated' ||
											isDoubleFeatureStyle(style)
                                        if (limitedColors && (frameSelection === 'A' || frameSelection === 'C')) {
                                            setFrameSelection('auto')
                                        }
                                    }}
                                >
                                    {PLANESWALKER_STYLES.map(({ id, label }) => (
                                        <option key={id} value={id}>{t(label)}</option>
                                    ))}
                                </select>
                            </div>
							{!planeswalkerStyle.startsWith('planeswalker-sdcc15') && <div className="form-group gap-2 mb-5">
                                <FrameColorPicker
                                    value={frameSelection}
                                    onChange={setFrameSelection}
                                    hideLands
                                    hideVehicles
                                    hideArtifacts={planeswalkerLimitedColors}
                                    hideColorless={planeswalkerLimitedColors}
                                />
							</div>}
                        </>}
						{layout === 'battle' && <div className="form-group gap-2 mb-5">
							<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideVehicles />
						</div>}
						{layout === 'saga' && <>
							<div className="form-group gap-2">
								<label htmlFor="saga-style">{t('sagaStyle')}</label>
								<select id="saga-style" value={sagaStyle} onChange={(event) => setSagaStyle(event.target.value as SagaStyle)}>
									{SAGA_STYLES.map(({ id, label }) => <option key={id} value={id}>{t(label)}</option>)}
								</select>
							</div>
							<div className="form-group gap-2 mb-5">
								<FrameColorPicker
									value={frameSelection}
									onChange={setFrameSelection}
									hideVehicles
									hideArtifacts={!['saga-nyx', 'saga-universes-beyond'].includes(sagaStyle)}
									hideColorless={['saga-regular', 'saga-transform', 'saga-lord-of-the-rings', 'saga-universes-beyond-regular'].includes(sagaStyle)}
									hideLands={!['saga-regular', 'saga-transform', 'saga-universes-beyond-regular', 'saga-creature-regular'].includes(sagaStyle)}
									hideColoredLands
								/>
							</div>
						</>}
						{layout === 'class' && <>
							<div className="form-group gap-2">
								<label htmlFor="class-style">{t('classStyle')}</label>
								<select id="class-style" value={classStyle} onChange={(event) => setClassStyle(event.target.value as ClassStyle)}>
									{CLASS_STYLES.map(({ id, label }) => <option key={id} value={id}>{t(label)}</option>)}
								</select>
							</div>
							<div className="form-group gap-2 mb-5">
								<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideLands hideColoredLands hideVehicles />
							</div>
						</>}
						{layout === 'case' && <>
							<div className="form-group gap-2">
								<label htmlFor="case-style">{t('caseStyle')}</label>
								<select id="case-style" value={caseStyle} onChange={(event) => setCaseStyle(event.target.value as CaseStyle)}>
									{CASE_STYLES.map(({ id, label }) => <option key={id} value={id}>{t(label)}</option>)}
								</select>
							</div>
							<div className="form-group gap-2 mb-5">
								<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideLands hideColoredLands hideVehicles />
							</div>
						</>}
						{layout === 'room' && <div className="form-group gap-2 mb-5">
							<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideLands hideColoredLands hideVehicles hideColorless />
						</div>}
						{layout === 'adventure' && <>
							<div className="form-group gap-2">
								<label htmlFor="adventure-style">{t('adventureStyle')}</label>
								<select id="adventure-style" value={adventureStyle} onChange={(event) => setAdventureStyle(event.target.value as AdventureStyle)}>
									{ADVENTURE_STYLES.map(({ id, label }) => <option key={id} value={id}>{t(label)}</option>)}
								</select>
							</div>
							<div className="form-group gap-2 mb-5">
								<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideLands={adventureStyle === 'adventure-nyx'} hideColoredLands hideVehicles hideColorless />
							</div>
						</>}
						{layout === 'leveler' && <div className="form-group gap-2 mb-5">
							<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideLands hideColoredLands hideColorless />
						</div>}
					</details>
					{(layout !== 'token' || tokenStyle !== 'token-unglued') && <details className="form-section" open>
					    <summary><h5 className="mt-5">{t('cardInformationSection')}</h5></summary>
						{layout === 'planeswalker' ? <PlaneswalkerDetailsForm card={planeswalker} onChange={setPlaneswalker} part="content" showNickname={planeswalkerStyle === 'planeswalker-nickname'} showReverseFace={planeswalkerStyle === 'planeswalker-mdfc-back'} /> : layout === 'saga' ? <SagaDetailsForm card={saga} onChange={setSaga} part="content" showCreatureFields={['saga-creature', 'saga-creature-regular', 'saga-creature-transform-front', 'saga-creature-transform-back', 'saga-creature-transform-front-ub', 'saga-creature-transform-back-ub'].includes(sagaStyle)} showTransformFields={['saga-transform', 'saga-creature-transform-front', 'saga-creature-transform-front-ub'].includes(sagaStyle)} /> : layout === 'class' ? <ClassDetailsForm card={classCard} onChange={setClassCard} part="content" /> : layout === 'case' ? <CaseDetailsForm card={caseCard} onChange={setCaseCard} part="content" /> : layout === 'room' ? <RoomDetailsForm card={room} onChange={setRoom} part="content" /> : layout === 'adventure' ? <AdventureDetailsForm card={adventure} onChange={setAdventure} part="content" /> : layout === 'leveler' ? <LevelerDetailsForm card={leveler} onChange={setLeveler} part="content" /> : <CardDetailsForm
							card={layout === 'token' ? token : layout === 'battle' ? battle : card}
							onChange={layout === 'token' ? setToken : layout === 'battle' ? setBattle : setCard}
                            hideManaCost={layout === 'token' && !tokenOptions.showManaCost}
							hideRulesText={layout === 'token' && tokenOptions.hideRulesText}
							hideNameAndType={layout === 'token' && tokenOptions.hideNameAndType}
							hideTypeLine={layout === 'token' && tokenOptions.hideTypeLine}
							hidePowerToughness={layout === 'token' && tokenOptions.hidePowerToughness}
							powerToughnessLabel={layout === 'battle' ? 'defense' : undefined}
                            maxManaItems={activeFamily === 'future-sight' ? 6 : undefined}
                            part="content"
                        />}
					</details>}
					<details className="form-section">
                        <summary><h5 className="mt-5">{t('cardDetailsSection')}</h5></summary>
						{layout === 'planeswalker' ? <PlaneswalkerDetailsForm card={planeswalker} onChange={setPlaneswalker} part="details" /> : layout === 'saga' ? <SagaDetailsForm card={saga} onChange={setSaga} part="details" /> : layout === 'class' ? <ClassDetailsForm card={classCard} onChange={setClassCard} part="details" /> : layout === 'case' ? <CaseDetailsForm card={caseCard} onChange={setCaseCard} part="details" /> : layout === 'room' ? <RoomDetailsForm card={room} onChange={setRoom} part="details" /> : layout === 'adventure' ? <AdventureDetailsForm card={adventure} onChange={setAdventure} part="details" /> : layout === 'leveler' ? <LevelerDetailsForm card={leveler} onChange={setLeveler} part="details" /> : <CardDetailsForm card={layout === 'token' ? token : layout === 'battle' ? battle : card} onChange={layout === 'token' ? setToken : layout === 'battle' ? setBattle : setCard} part="details" />}
					</details>
                </div>

                <div style={{position:'relative'}}>
					{renderResult?.status === 'ready' && renderResult.textOverflow && (
						<p role="status" className="message warning">
							<Icon name="warning" />
							<span>{t('cardTextOverflow')}</span>
						</p>
					)}
                    {!canExport && !renderFailed && <p role="status" className="visually-hidden">
                        {t('renderingCard')}
                    </p>}
                    <CardCanvas
						key={activeFamily}
						canvasRef={canvasRef}
                        input={renderInput}
                        onRenderResult={handleRenderResult}
                        onTransformChange={setArtworkTransform}
                    />
                    {artwork && <ArtworkControls
                        transform={artworkTransform}
                        onChange={setArtworkTransform}
                        onReset={() => setArtworkTransform(createDefaultArtworkTransform(
								layout === 'planeswalker' && isDoubleFeatureStyle(planeswalkerStyle),
							))}
                        />
                    }
					{onAddToDeckList && <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gridAutoFlow:'dense'}} className="gap-3 mt-3">
						<div className="form-group gap-2">
							<label htmlFor="custom-card-quantity">{t('quantity')}</label>
							<input
								id="custom-card-quantity"
								type="number"
								min="1"
								step="1"
								value={customCardQuantity}
								aria-invalid={Boolean(quantityError)}
								aria-describedby={quantityError ? 'custom-card-quantity-error' : undefined}
								onChange={(event) => setCustomCardQuantity(event.currentTarget.value)}
							/>
							{quantityError && <small id="custom-card-quantity-error" role="alert" className="message error">
								<Icon name="error" />
								<span>{t(quantity < 1 ? 'quantityAtLeastOne' : 'quantitySafeWholeNumber')}</span>
							</small>}
						</div>
                        <div className="pt-5">
                            <button type="button" className="btn block" disabled={!canExport || Boolean(quantityError)} onClick={addToDeckList}>
                                <Icon name="plus"/> {t('addCustomCardToDeckList')}
                            </button>
                        </div>
					</div>}
					<div className="split-button mt-3">
						<button type="button" className="btn" disabled={!canExport} onClick={() => downloadPng()}>
							<Icon name="file-down"/> {t('downloadPng')}
						</button>
						<details>
							<summary className="btn" aria-label={t('moreDownloadOptions')} title={t('moreDownloadOptions')}>
								<Icon name="chevron-down"/>
							</summary>
							<div className="split-button-options">
								<button type="button" className="btn" disabled={!canExport} onClick={() => downloadPng(300)}>300 DPI</button>
								<button type="button" className="btn" disabled={!canExport} onClick={() => downloadPng(600)}>600 DPI</button>
							</div>
						</details>
					</div>
                </div>
            </div>

		</section>
	)
}
