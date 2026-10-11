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
import { SplitDetailsForm } from './ui/SplitDetailsForm'
import { SplitHalfTabs } from './ui/SplitHalfTabs'
import { AdventureDetailsForm } from './ui/AdventureDetailsForm'
import { LevelerDetailsForm } from './ui/LevelerDetailsForm'
import type { FrameVariant } from './types'
import {
	SAMPLE_CARD,
	SAMPLE_TOKEN,
	SAMPLE_PLANESWALKER,
	SAMPLE_BATTLE,
	SAMPLE_SAGA,
	SAMPLE_CLASS,
	SAMPLE_CASE,
	SAMPLE_ROOM,
	SAMPLE_SPLIT,
	SAMPLE_ADVENTURE,
	SAMPLE_LEVELER,
} from './sampleCards'
import { inferFrameVariant } from './cardText'
import { useI18n } from '../../i18n/context'
import { downloadBlob } from '../../utils/downloadBlob'
import { setPngDpi } from '../../utils/pngDpi'
import { Icon } from '../Icon'
import { getFrameFamily, type FrameBorderStyle, type FrameFamilyId } from './frameFamilies'
import { FrameColorPicker } from './ui/FrameColorPicker'
import { CardFrameControls } from './ui/CardFrameControls'
import { PlaneswalkerFrameControls } from './ui/PlaneswalkerFrameControls'
import { SagaFrameControls } from './ui/SagaFrameControls'
import {
	ADVENTURE_STYLES,
	CLASS_STYLES,
	CASE_STYLES,
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
	return { x: 0, y: 0, flipX: false, flipY: false, grayscale, invert: false, scale: 0, rotation: 0 }
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
	const [splitArtwork, setSplitArtwork] = useState<File | string | undefined>(SAMPLE_ARTWORK_URL)
	const [splitTransform, setSplitTransform] = useState(createDefaultArtworkTransform)
	const [splitFrameSelection, setSplitFrameSelection] = useState<FrameVariant | 'auto'>('auto')
	const [splitArtworkSide, setSplitArtworkSide] = useState<'first' | 'second'>('first')
	const [splitFrameSide, setSplitFrameSide] = useState<'first' | 'second'>('first')
	const [splitStyle, setSplitStyle] = useState<'split-regular' | 'split-fuse'>('split-regular')
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
	const [layout, setLayout] = useState<'card' | 'token' | 'planeswalker' | 'battle' | 'saga' | 'class' | 'case' | 'room' | 'adventure' | 'leveler' | 'split'>('card')
	const [tokenStyle, setTokenStyle] = useState<TokenStyle>('token-regular')
	const [planeswalkerStyle, setPlaneswalkerStyle] = useState<PlaneswalkerStyle>('planeswalker-regular')
	const [sagaStyle, setSagaStyle] = useState<SagaStyle>('saga-regular')
	const [classStyle, setClassStyle] = useState<ClassStyle>('class-regular')
	const [caseStyle, setCaseStyle] = useState<CaseStyle>('case-regular')
	const [adventureStyle, setAdventureStyle] = useState<AdventureStyle>('adventure-regular')
	const [card, setCard] = useState(SAMPLE_CARD)
	const [token, setToken] = useState(SAMPLE_TOKEN)
	const [planeswalker, setPlaneswalker] = useState(SAMPLE_PLANESWALKER)
	const [battle, setBattle] = useState(SAMPLE_BATTLE)
	const [saga, setSaga] = useState(SAMPLE_SAGA)
	const [classCard, setClassCard] = useState(SAMPLE_CLASS)
	const [caseCard, setCaseCard] = useState(SAMPLE_CASE)
	const [room, setRoom] = useState(SAMPLE_ROOM)
	const [split, setSplit] = useState(SAMPLE_SPLIT)
	const [adventure, setAdventure] = useState(SAMPLE_ADVENTURE)
	const [leveler, setLeveler] = useState(SAMPLE_LEVELER)
	const cardsByLayout = {
		card,
		token,
		planeswalker,
		battle,
		saga,
		class: classCard,
		case: caseCard,
		room,
		split,
		adventure,
		leveler,
	}
	const familiesByLayout = {
		card: frameFamily,
		token: tokenStyle,
		planeswalker: planeswalkerStyle,
		battle: 'battle-regular',
		saga: sagaStyle,
		class: classStyle,
		case: caseStyle,
		room: 'room-regular',
		split: splitStyle,
		adventure: adventureStyle,
		leveler: 'leveler-regular',
	} satisfies Record<typeof layout, FrameFamilyId>
	const activeCard = cardsByLayout[layout]
	const activeFamily = familiesByLayout[layout]
	const editingSecondArtwork = layout === 'split' && splitArtworkSide === 'second'
	const activeArtwork = editingSecondArtwork ? splitArtwork : artwork
	const activeTransform = editingSecondArtwork ? splitTransform : artworkTransform
	const setActiveArtwork = editingSecondArtwork ? setSplitArtwork : setArtwork
	const setActiveTransform = editingSecondArtwork ? setSplitTransform : setArtworkTransform
	const exportName = layout === 'split' ? `${split.name} // ${split.secondName}` : activeCard.name
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
	const secondFrameVariant = splitFrameSelection === 'auto'
		? inferFrameVariant(split.secondManaCost, split.secondTypeLine)
		: splitFrameSelection
	const renderInput = useMemo<CardRenderInput>(() => ({
		artwork,
		setSymbol,
		frameFamily: activeFamily,
		borderStyle: activeFamily === 'token-unglued' ? 'silver' : borderStyle,
		frameVariant,
		transform: artworkTransform,
		card: activeCard,
		split: layout === 'split' ? { artwork: splitArtwork, transform: splitTransform, frameVariant: secondFrameVariant } : undefined,
	}), [artwork, setSymbol, activeFamily, borderStyle, frameVariant, artworkTransform, activeCard, layout, splitArtwork, splitTransform, secondFrameVariant])
	const canExport = canExportCardRender(renderInput, renderResult)
	const renderFailed = renderResult?.input === renderInput && renderResult.status === 'error'
	const handleRenderResult = useCallback((result: CardRenderResult) => {
		setRenderResult(result)
		if (result.input === renderInput && result.status === 'error') {
			onError(t('couldNotRenderCard'))
		}
	}, [renderInput, onError, t])

	function renderCardForm(part: 'content' | 'details') {
		switch (layout) {
			case 'planeswalker':
				return (
					<PlaneswalkerDetailsForm
						card={planeswalker}
						onChange={setPlaneswalker}
						part={part}
						showNickname={planeswalkerStyle === 'planeswalker-nickname'}
						showReverseFace={planeswalkerStyle === 'planeswalker-mdfc-back'}
					/>
				)
			case 'saga':
				return (
					<SagaDetailsForm
						card={saga}
						onChange={setSaga}
						part={part}
						showCreatureFields={[
							'saga-creature',
							'saga-creature-regular',
							'saga-creature-transform-front',
							'saga-creature-transform-back',
							'saga-creature-transform-front-ub',
							'saga-creature-transform-back-ub',
						].includes(sagaStyle)}
						showTransformFields={[
							'saga-transform',
							'saga-creature-transform-front',
							'saga-creature-transform-front-ub',
						].includes(sagaStyle)}
					/>
				)
			case 'class':
				return <ClassDetailsForm card={classCard} onChange={setClassCard} part={part} />
			case 'case':
				return <CaseDetailsForm card={caseCard} onChange={setCaseCard} part={part} />
			case 'room':
				return <RoomDetailsForm card={room} onChange={setRoom} part={part} />
			case 'split':
				return <SplitDetailsForm card={split} onChange={setSplit} part={part} showFuse={splitStyle === 'split-fuse'} />
			case 'adventure':
				return <AdventureDetailsForm card={adventure} onChange={setAdventure} part={part} />
			case 'leveler':
				return <LevelerDetailsForm card={leveler} onChange={setLeveler} part={part} />
			default: {
				const onChange = { card: setCard, token: setToken, battle: setBattle }[layout]
				return (
					<CardDetailsForm
						card={cardsByLayout[layout]}
						onChange={onChange}
						part={part}
						hideManaCost={layout === 'token' && !tokenOptions.showManaCost}
						hideRulesText={layout === 'token' && tokenOptions.hideRulesText}
						hideNameAndType={layout === 'token' && tokenOptions.hideNameAndType}
						hideTypeLine={layout === 'token' && tokenOptions.hideTypeLine}
						hidePowerToughness={layout === 'token' && tokenOptions.hidePowerToughness}
						powerToughnessLabel={layout === 'battle' ? 'defense' : undefined}
						maxManaItems={activeFamily === 'future-sight' ? 6 : undefined}
					/>
				)
			}
		}
	}

	async function downloadPng(dpi?: number) {
		if (!canExport) return
		try {
			const blob = await canvasToPng(canvasRef.current)
			if (!dpi) {
				downloadBlob(blob, cardPngFilename(exportName))
				return
			}
			const png = setPngDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
			downloadBlob(new Blob([png.buffer as ArrayBuffer], { type: 'image/png' }), cardPngFilename(exportName, dpi))
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
				name: exportName || t('customCard'),
				typeLine: activeCard.typeLine,
				artist: activeCard.artist,
				collectorNumber: activeCard.number,
				image,
			})
		} catch {
			onError(t('couldNotAddCustomCard'))
		}
	}

	const artworkInput = (
		<FileInput
			key={editingSecondArtwork ? 'second' : 'first'}
			id="custom-card-artwork"
			accept="image/*"
			label={t('chooseArtwork')}
			hasValue={Boolean(activeArtwork)}
			validate={loadImageSource}
			validationError={t('invalidImageFile')}
			onSelect={(file) => {
				setActiveArtwork(file)
				setActiveTransform(createDefaultArtworkTransform(
					layout === 'planeswalker' && isDoubleFeatureStyle(planeswalkerStyle),
				))
			}}
			onClear={() => setActiveArtwork(undefined)}
		/>
	)
	const artworkControls = activeArtwork ? (
		<ArtworkControls
			transform={activeTransform}
			onChange={setActiveTransform}
			onReset={() => setActiveTransform(createDefaultArtworkTransform(
				layout === 'planeswalker' && isDoubleFeatureStyle(planeswalkerStyle),
			))}
		/>
	) : null

	return (
		<section>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem'}}>
                <div>
					<details className="form-section" open>
                        <summary><h5 className="mt-5">{t('cardImageSection')}</h5></summary>
                        <div className="form-group gap-2">
                            {layout === 'split' ? (
                                <SplitHalfTabs side={splitArtworkSide} onChange={setSplitArtworkSide} label={t('cardImageSection')}>
                                    {artworkInput}
                                </SplitHalfTabs>
                            ) : artworkInput}
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
								<option value="split">{t('cardLayoutSplit')}</option>
								<option value="adventure">{t('cardLayoutAdventure')}</option>
								<option value="leveler">{t('cardLayoutLeveler')}</option>
                            </select>
                        </div>
						{layout === 'card' && (
							<CardFrameControls
								frameFamily={frameFamily}
								onFrameFamilyChange={(family) => {
									setFrameFamily(family)
									setBorderStyle(getFrameFamily(family).defaultBorderStyle ?? 'black')
									setFrameStyleSearch('')
								}}
								borderStyle={borderStyle}
								onBorderStyleChange={setBorderStyle}
								frameSelection={frameSelection}
								onFrameSelectionChange={setFrameSelection}
								search={frameStyleSearch}
								onSearchChange={setFrameStyleSearch}
							/>
						)}
                        {layout === 'token' && <div className="form-group gap-2">
                            <label htmlFor="token-style">{t('tokenStyle')}</label>
                            <select id="token-style" value={tokenStyle} onChange={(event) => setTokenStyle(event.target.value as typeof tokenStyle)}>
                                {TOKEN_STYLES.map(({ id, label }) => <option key={id} value={id}>{t(label)}</option>)}
                            </select>
                        </div>}
                        {layout === 'token' && !tokenOptions.hideColor && <div className="form-group gap-2 mb-5">
                            <FrameColorPicker value={tokenFrameSelection} onChange={setTokenFrameSelection} hideLands hideVehicles />
                        </div>}
						{layout === 'planeswalker' && (
							<PlaneswalkerFrameControls
								style={planeswalkerStyle}
								onStyleChange={(style) => {
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
								abilityTextColor={planeswalker.abilityTextColor ?? '#fff'}
								onAbilityTextColorChange={(abilityTextColor) => setPlaneswalker({
									...planeswalker,
									abilityTextColor,
								})}
								frameSelection={frameSelection}
								onFrameSelectionChange={setFrameSelection}
								limitedColors={planeswalkerLimitedColors}
							/>
						)}
						{layout === 'battle' && <div className="form-group gap-2 mb-5">
							<FrameColorPicker value={frameSelection} onChange={setFrameSelection} hideVehicles />
						</div>}
						{layout === 'saga' && (
							<SagaFrameControls
								style={sagaStyle}
								onStyleChange={setSagaStyle}
								frameSelection={frameSelection}
								onFrameSelectionChange={setFrameSelection}
							/>
						)}
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
						{layout === 'split' && <>
							<div className="form-group gap-2">
								<label htmlFor="split-style">{t('splitStyle')}</label>
								<select id="split-style" value={splitStyle} onChange={(event) => setSplitStyle(event.target.value as typeof splitStyle)}>
									<option value="split-regular">{t('splitRegular')}</option>
									<option value="split-fuse">Fuse</option>
								</select>
							</div>
							<SplitHalfTabs side={splitFrameSide} onChange={setSplitFrameSide} label={t('cardEditionSection')}>
								<div className="form-group gap-2 mb-5">
									<FrameColorPicker
										key={splitFrameSide}
										value={splitFrameSide === 'first' ? frameSelection : splitFrameSelection}
										onChange={splitFrameSide === 'first' ? setFrameSelection : setSplitFrameSelection}
										hideColoredLands
										hideVehicles
									/>
								</div>
							</SplitHalfTabs>
						</>}
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
						{renderCardForm('content')}
					</details>}
					<details className="form-section">
                        <summary><h5 className="mt-5">{t('cardDetailsSection')}</h5></summary>
						{renderCardForm('details')}
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
                        artworkSide={editingSecondArtwork ? 'second' : 'first'}
                        onTransformChange={setActiveTransform}
                    />
					{layout === 'split' ? (
						<div className="mt-3">
							<SplitHalfTabs side={splitArtworkSide} onChange={setSplitArtworkSide} label={t('artworkPosition')}>
								{artworkControls ?? <small className="text-muted">{t('chooseArtwork')}</small>}
							</SplitHalfTabs>
						</div>
					) : artworkControls}
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
