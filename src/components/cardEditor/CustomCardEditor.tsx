import { useRef, useState } from 'react'
import { CardCanvas, type ArtworkTransform } from './CardCanvas'
import { FileInput } from '../FileInput'
import { ArtworkControls } from './ui/ArtworkControls'
import { CardDetailsForm } from './ui/CardDetailsForm'
import type { CustomCardData, FrameVariant } from './types'
import { inferFrameVariant } from './cardText'
import { useI18n } from '../../i18n/context'
import { downloadBlob } from '../../utils/downloadBlob'
import { setPngDpi } from '../../utils/pngDpi'
import { Icon } from '../Icon'
import { getFrameFamily, type FrameBorderStyle, type FrameFamilyId } from './frameFamilies'
import { FrameColorPicker } from './ui/FrameColorPicker'

const SAMPLE_ARTWORK_URL = `${import.meta.env.BASE_URL}img/samples/marrow-gnawer.jpg`
const SAMPLE_SET_SYMBOL_URL = `${import.meta.env.BASE_URL}img/setSymbols/chk.svg`
const FRAME_STYLE_GROUPS = [
	{ label: 'frameStyleGroupM15', options: [
		{ id: 'box-topper', label: 'frameStyleBoxTopper' },
		{ id: 'm15-regular', label: 'frameStyleM15Regular' },
		{ id: 'm15-extended', label: 'frameStyleM15Extended' },
		{ id: 'snow', label: 'frameStyleSnow' },
		{ id: 'nyx', label: 'frameStyleNyx' },
		{ id: 'universes-beyond', label: 'frameStyleUniversesBeyond' },
	] },
	{ label: 'frameStyleGroupShowcase', options: [
		{ id: 'borderless', label: 'frameStyleBorderless' },
	] },
	{ label: 'frameStyleGroupPromo', options: [
		{ id: 'promo-regular', label: 'frameStylePromoRegular' },
	] },
	{ label: 'frameStyleGroupHistorical', options: [
		{ id: 'eighth-edition', label: 'frameStyleEighthEdition' },
		{ id: 'seventh-edition', label: 'frameStyleSeventhEdition' },
		{ id: 'old-floating', label: 'frameStyleOldFloating' },
		{ id: 'abu', label: 'frameStyleAbu' },
		{ id: 'revised', label: 'frameStyleRevised' },
		{ id: 'fourth-era', label: 'frameStyleFourthEra' },
		{ id: 'colorshifted', label: 'frameStyleColorshifted' },
		{ id: 'classicshifted', label: 'frameStyleClassicshifted' },
		{ id: 'future-sight', label: 'frameStyleFutureSight' },
	] },
] as const

function createDefaultArtworkTransform(): ArtworkTransform {
	return { x: 0, y: 0, flipX: false, flipY: false, scale: 0, rotation: 0 }
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
	const [layout, setLayout] = useState<'card' | 'token'>('card')
	const [tokenStyle, setTokenStyle] = useState<'token-regular' | 'token-tall' | 'token-short' | 'token-textless' | 'token-textless-borderless' | 'token-nyx' | 'token-nyx-textless' | 'token-old' | 'token-unglued' | 'token-monarch' | 'token-marker' | 'token-initiative' | 'token-day-night' | 'token-jumpstart'>('token-regular')
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
	const activeCard = layout === 'token' ? token : card
	const activeFamily: FrameFamilyId = layout === 'token' ? tokenStyle : frameFamily
	const activeFrameSelection = layout === 'token' ? tokenFrameSelection : frameSelection
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
                    <h5>1. {t('cardImageSection')}</h5>
                    <div className="form-group gap-2 mb-5">
                        <FileInput
                            id="custom-card-artwork"
                            accept="image/*"
                            label={t('chooseArtwork')}
                            onSelect={(file) => {
                                setArtwork(file)
                                setArtworkTransform(createDefaultArtworkTransform())
                            }}
                            onClear={() => setArtwork(undefined)}
                        />
						{tokenStyle !== 'token-unglued' && tokenStyle !== 'token-monarch' && tokenStyle !== 'token-day-night' && tokenStyle !== 'token-jumpstart' && <FileInput
                            id="custom-card-set-symbol"
                            accept="image/*"
                            label={t('chooseSetSymbol')}
                            hasValue={Boolean(setSymbol)}
                            onSelect={setSetSymbol}
                            onClear={() => setSetSymbol(undefined)}
						/>}
                    </div>
                    <h5>2. {t('cardEditionSection')}</h5>
					<div className="form-group gap-2">
						<label htmlFor="card-layout">{t('cardLayout')}</label>
						<select id="card-layout" value={layout} onChange={(event) => setLayout(event.target.value as 'card' | 'token')}>
							<option value="card">{t('cardLayoutCard')}</option>
							<option value="token">{t('cardLayoutToken')}</option>
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
							<option value="token-regular">{t('tokenStyleRegular')}</option>
							<option value="token-tall">{t('tokenStyleTall')}</option>
							<option value="token-short">{t('tokenStyleShort')}</option>
							<option value="token-textless">{t('tokenStyleTextless')}</option>
							<option value="token-textless-borderless">{t('tokenStyleTextlessBorderless')}</option>
							<option value="token-nyx">{t('tokenStyleNyx')}</option>
							<option value="token-nyx-textless">{t('tokenStyleNyxTextless')}</option>
							<option value="token-old">{t('tokenStyleOld')}</option>
							<option value="token-unglued">{t('tokenStyleUnglued')}</option>
							<option value="token-monarch">{t('tokenStyleMonarch')}</option>
							<option value="token-marker">{t('tokenStyleMarker')}</option>
							<option value="token-initiative">{t('tokenStyleInitiative')}</option>
							<option value="token-day-night">{t('tokenStyleDayNight')}</option>
							<option value="token-jumpstart">{t('tokenStyleJumpstart')}</option>
						</select>
					</div>}
					{layout === 'token' && tokenStyle !== 'token-monarch' && tokenStyle !== 'token-marker' && tokenStyle !== 'token-initiative' && tokenStyle !== 'token-day-night' && tokenStyle !== 'token-jumpstart' && <div className="form-group gap-2 mb-5"><FrameColorPicker value={tokenFrameSelection} onChange={setTokenFrameSelection} hideLands hideVehicles /></div>}
                    <h5 className='mt-5'>3. {t('cardInformationSection')}</h5>
					<CardDetailsForm
						card={activeCard}
						onChange={layout === 'token' ? setToken : setCard}
						hideManaCost={layout === 'token' && tokenStyle !== 'token-jumpstart'}
						hideRulesText={tokenStyle === 'token-textless' || tokenStyle === 'token-textless-borderless' || tokenStyle === 'token-nyx-textless' || tokenStyle === 'token-unglued' || tokenStyle === 'token-jumpstart'}
						hideNameAndType={tokenStyle === 'token-unglued'}
						hideTypeLine={tokenStyle === 'token-monarch' || tokenStyle === 'token-marker' || tokenStyle === 'token-initiative' || tokenStyle === 'token-day-night' || tokenStyle === 'token-jumpstart'}
						hidePowerToughness={tokenStyle === 'token-unglued' || tokenStyle === 'token-monarch' || tokenStyle === 'token-marker' || tokenStyle === 'token-initiative' || tokenStyle === 'token-day-night' || tokenStyle === 'token-jumpstart'}
						maxManaItems={activeFamily === 'future-sight' ? 6 : undefined}
					/>
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
                        onReset={() => setArtworkTransform(createDefaultArtworkTransform())}
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
