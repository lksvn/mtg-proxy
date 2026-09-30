import { useRef, useState } from 'react'
import { CardCanvas, type ArtworkTransform } from './CardCanvas'
import { FileInput } from '../FileInput'
import { ArtworkControls } from './ui/ArtworkControls'
import { CardDetailsForm } from './ui/CardDetailsForm'
import { PlaneswalkerDetailsForm } from './ui/PlaneswalkerDetailsForm'
import type { CustomCardData, FrameVariant, PlaneswalkerCardData } from './types'
import { inferFrameVariant } from './cardText'
import { useI18n } from '../../i18n/context'
import { downloadBlob } from '../../utils/downloadBlob'
import { setPngDpi } from '../../utils/pngDpi'
import { Icon } from '../Icon'
import { getFrameFamily, type FrameBorderStyle, type FrameFamilyId } from './frameFamilies'
import { FrameColorPicker } from './ui/FrameColorPicker'
import {
	FRAME_STYLE_GROUPS,
	PLANESWALKER_STYLES,
	TOKEN_STYLES,
	type PlaneswalkerStyle,
	type TokenStyle,
} from './editorOptions'

const SAMPLE_ARTWORK_URL = `${import.meta.env.BASE_URL}img/samples/marrow-gnawer.jpg`
const SAMPLE_SET_SYMBOL_URL = `${import.meta.env.BASE_URL}img/setSymbols/chk.svg`
function createDefaultArtworkTransform(grayscale = false): ArtworkTransform {
	return { x: 0, y: 0, flipX: false, flipY: false, grayscale, scale: 0, rotation: 0 }
}

export function CustomCardEditor() {
	const { t } = useI18n()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [artwork, setArtwork] = useState<File | string | undefined>(SAMPLE_ARTWORK_URL)
    const [artworkTransform, setArtworkTransform] = useState(createDefaultArtworkTransform)
    const [setSymbol, setSetSymbol] = useState<File | string | undefined>(SAMPLE_SET_SYMBOL_URL)
	const [frameSelection, setFrameSelection] = useState<FrameVariant | 'auto'>('auto')
	const [tokenFrameSelection, setTokenFrameSelection] = useState<FrameVariant | 'auto'>('C')
	const [frameFamily, setFrameFamily] = useState<FrameFamilyId>('box-topper')
	const [borderStyle, setBorderStyle] = useState<FrameBorderStyle>('black')
	const [frameStyleSearch, setFrameStyleSearch] = useState('')
	const [layout, setLayout] = useState<'card' | 'token' | 'planeswalker'>('card')
	const [tokenStyle, setTokenStyle] = useState<TokenStyle>('token-regular')
	const [planeswalkerStyle, setPlaneswalkerStyle] = useState<PlaneswalkerStyle>('planeswalker-regular')
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
		reverseFaceName: '', reverseFaceManaCost: '',
		abilities: [
			{ cost: '+1', text: 'Draw a card.' },
			{ cost: '-2', text: 'Return target creature to its owner’s hand.' },
			{ cost: '-8', text: 'Draw seven cards. You get an emblem with “You have no maximum hand size.”' },
		],
		artist: '', number: '1', rarity: 'mythic', tintSetSymbol: false, backgroundColor: '#000000',
	})
	const activeCard = layout === 'token' ? token : layout === 'planeswalker' ? planeswalker : card
	const activeFamily: FrameFamilyId = layout === 'token' ? tokenStyle : layout === 'planeswalker' ? planeswalkerStyle : frameFamily
	const activeFrameSelection = layout === 'token' ? tokenFrameSelection : frameSelection
	const tokenOptions = TOKEN_STYLES.find(({ id }) => id === tokenStyle)!
	const planeswalkerLimitedColors = planeswalkerStyle === 'planeswalker-transform-front' ||
		planeswalkerStyle === 'planeswalker-transform-back' ||
		planeswalkerStyle === 'planeswalker-mdfc-back' ||
		planeswalkerStyle === 'planeswalker-compleated' ||
		planeswalkerStyle === 'planeswalker-double-feature'
	const frameVariant = activeFrameSelection === 'auto'
		? inferFrameVariant(activeCard.manaCost, activeCard.typeLine)
		: activeFrameSelection
	const search = frameStyleSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

	function downloadPng(dpi?: number) {
		canvasRef.current?.toBlob(async (blob) => {
			if (!blob) return

			if (!dpi) {
				downloadBlob(blob, 'mtg-proxy-custom-card.png')
				return
			}

			const png = setPngDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
			downloadBlob(new Blob([png.buffer as ArrayBuffer], { type: 'image/png' }), `mtg-proxy-custom-card-${dpi}dpi.png`)
		}, 'image/png')
	}

	return (
		<section>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem'}}>
                <div>
					<details className="form-section" open>
                        <summary><h5 className="mt-5">1. {t('cardImageSection')}</h5></summary>
                        <div className="form-group gap-2">
                            <FileInput
                                id="custom-card-artwork"
                                accept="image/*"
                                label={t('chooseArtwork')}
                                onSelect={(file) => {
                                    setArtwork(file)
                                    setArtworkTransform(createDefaultArtworkTransform(
										layout === 'planeswalker' && planeswalkerStyle === 'planeswalker-double-feature',
									))
                                }}
                                onClear={() => setArtwork(undefined)}
                            />
                        </div>
						{(layout !== 'token' || !tokenOptions.hideSetSymbol) && <div className="form-group gap-2 mb-5"><FileInput
                            id="custom-card-set-symbol"
                            accept="image/*"
                            label={t('chooseSetSymbol')}
                            hasValue={Boolean(setSymbol)}
                            onSelect={setSetSymbol}
                            onClear={() => setSetSymbol(undefined)}
						/></div>}
					</details>
					<details className="form-section" open>
					    <summary><h5 className="mt-5">2. {t('cardEditionSection')}</h5></summary>
                        <div className="form-group gap-2">
                            <label htmlFor="card-layout">{t('cardLayout')}</label>
                            <select id="card-layout" value={layout} onChange={(event) => setLayout(event.target.value as typeof layout)}>
                                <option value="card">{t('cardLayoutCard')}</option>
                                <option value="token">{t('cardLayoutToken')}</option>
                                <option value="planeswalker">{t('cardLayoutPlaneswalker')}</option>
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
											grayscale: style === 'planeswalker-double-feature',
										})
                                        const limitedColors = style === 'planeswalker-transform-front' ||
                                            style === 'planeswalker-transform-back' ||
                                            style === 'planeswalker-mdfc-back' ||
                                            style === 'planeswalker-compleated' ||
                                            style === 'planeswalker-double-feature'
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
                            <div className="form-group gap-2 mb-5">
                                <FrameColorPicker
                                    value={frameSelection}
                                    onChange={setFrameSelection}
                                    hideLands
                                    hideVehicles
                                    hideArtifacts={planeswalkerLimitedColors}
                                    hideColorless={planeswalkerLimitedColors}
                                />
                            </div>
                        </>}
					</details>
					<details className="form-section" open>
					    <summary><h5 className="mt-5">3. {t('cardInformationSection')}</h5></summary>
                        {layout === 'planeswalker' ? <PlaneswalkerDetailsForm card={planeswalker} onChange={setPlaneswalker} part="content" showReverseFace={planeswalkerStyle === 'planeswalker-mdfc-back'} /> : <CardDetailsForm
                            card={layout === 'token' ? token : card}
                            onChange={layout === 'token' ? setToken : setCard}
                            hideManaCost={layout === 'token' && !tokenOptions.showManaCost}
                            hideRulesText={tokenOptions.hideRulesText}
                            hideNameAndType={tokenOptions.hideNameAndType}
                            hideTypeLine={tokenOptions.hideTypeLine}
                            hidePowerToughness={tokenOptions.hidePowerToughness}
                            maxManaItems={activeFamily === 'future-sight' ? 6 : undefined}
                            part="content"
                        />}
					</details>
					<details className="form-section">
                        <summary><h5 className="mt-5">4. {t('cardDetailsSection')}</h5></summary>
                        {layout === 'planeswalker' ? <PlaneswalkerDetailsForm card={planeswalker} onChange={setPlaneswalker} part="details" /> : <CardDetailsForm card={layout === 'token' ? token : card} onChange={layout === 'token' ? setToken : setCard} part="details" />}
					</details>
                </div>

                <div style={{position:'relative'}}>
                    <CardCanvas
						canvasRef={canvasRef}
                        artwork={artwork}
                        transform={artworkTransform}
                        onTransformChange={setArtworkTransform}
						card={activeCard}
						setSymbol={setSymbol}
						frameFamily={activeFamily}
						borderStyle={activeFamily === 'token-unglued' ? 'silver' : borderStyle}
						frameVariant={frameVariant}
                    />
                    {artwork && <ArtworkControls
                        transform={artworkTransform}
                        onChange={setArtworkTransform}
                        onReset={() => setArtworkTransform(createDefaultArtworkTransform(
								layout === 'planeswalker' && planeswalkerStyle === 'planeswalker-double-feature',
							))}
                        />
                    }
					<div className="split-button mt-3">
						<button type="button" className="btn" onClick={() => downloadPng()}>
							<Icon name="file-down"/> {t('downloadPng')}
						</button>
						<details>
							<summary className="btn" aria-label={t('moreDownloadOptions')} title={t('moreDownloadOptions')}>
								<Icon name="chevron-down"/>
							</summary>
							<div className="split-button-options">
								<button type="button" className="btn" onClick={() => downloadPng(300)}>300 DPI</button>
								<button type="button" className="btn" onClick={() => downloadPng(600)}>600 DPI</button>
							</div>
						</details>
					</div>
                </div>
            </div>

		</section>
	)
}
