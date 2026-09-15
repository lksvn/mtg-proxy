import { useRef, useState } from 'react'
import { CardCanvas, type ArtworkTransform } from './CardCanvas'
import { FileInput } from '../FileInput'
import { ArtworkControls } from './ArtworkControls'
import { CardDetailsForm } from './CardDetailsForm'
import type { CustomCardData, FrameVariant } from './types'
import { inferFrameVariant } from './cardText'
import { useI18n } from '../../i18n/context'
import { downloadBlob } from '../../utils/downloadBlob'
import { Icon } from '../Icon'

const SAMPLE_ARTWORK_URL = `${import.meta.env.BASE_URL}img/samples/marrow-gnawer.jpg`
const SAMPLE_SET_SYMBOL_URL = `${import.meta.env.BASE_URL}img/setSymbols/chk.svg`

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
    const [card, setCard] = useState<CustomCardData>({
        name: 'Marrow-Gnawer',
        manaCost: '3bb',
        typeLine: 'Legendary Creature — Rat Rogue',
        rulesText: `All Rats have fear.
{T}, Sacrifice a Rat: Create X 1/1 black Rat creature tokens, where X is the number of Rats you control.`,
        flavorText: 'Marrow-Gnawer united three nezumi gangs when he slew their leaders in a single night. Now they call him their first lord.',
        powerToughness: '2/3',
        artist: 'Wayne Reynolds',
        number: '124',
        rarity: 'rare',
        tintSetSymbol: false,
        backgroundColor: '#000000'
    })
	const frameVariant = frameSelection === 'auto'
		? inferFrameVariant(card.manaCost, card.typeLine)
		: frameSelection

	function downloadPng() {
		canvasRef.current?.toBlob((blob) => {
			if (blob) downloadBlob(blob, 'mtg-proxy-custom-card.png')
		}, 'image/png')
	}

	return (
		<section>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem'}}>
                <div className="form-group gap-2">
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
                    <FileInput
                        id="custom-card-set-symbol"
                        accept="image/*"
                        label={t('chooseSetSymbol')}
						hasValue={Boolean(setSymbol)}
                        onSelect={setSetSymbol}
                        onClear={() => setSetSymbol(undefined)}
                    />
					<label htmlFor="card-frame">{t('frame')}</label>
					<select
						id="card-frame"
						value={frameSelection}
						onChange={(event) => setFrameSelection(event.target.value as FrameVariant | 'auto')}
					>
						<option value="auto">{t('frameAuto')}</option>
						<option value="W">{t('frameWhite')}</option>
						<option value="U">{t('frameBlue')}</option>
						<option value="B">{t('frameBlack')}</option>
						<option value="R">{t('frameRed')}</option>
						<option value="G">{t('frameGreen')}</option>
						<option value="M">{t('frameMulticolored')}</option>
						<option value="A">{t('frameArtifact')}</option>
						<option value="C">{t('frameColorless')}</option>
						<option value="L">{t('frameLand')}</option>
						<option value="WL">{t('frameWhiteLand')}</option>
						<option value="UL">{t('frameBlueLand')}</option>
						<option value="BL">{t('frameBlackLand')}</option>
						<option value="RL">{t('frameRedLand')}</option>
						<option value="GL">{t('frameGreenLand')}</option>
						<option value="ML">{t('frameMulticoloredLand')}</option>
						<option value="V">{t('frameVehicle')}</option>
					</select>
                    <CardDetailsForm card={card} onChange={setCard} />
                </div>

                <div>
                    <CardCanvas
						canvasRef={canvasRef}
                        artwork={artwork}
                        transform={artworkTransform}
                        onTransformChange={setArtworkTransform}
                        card={card}
                        setSymbol={setSymbol}
						frameVariant={frameVariant}
                    />
                    {artwork && <ArtworkControls
                        transform={artworkTransform}
                        onChange={setArtworkTransform}
                        onReset={() => setArtworkTransform(createDefaultArtworkTransform())}
                        />
                    }
					<button type="button" className="btn mt-3" onClick={downloadPng}>
						<Icon name="file-down"/> {t('downloadPng')}
					</button>
                </div>
            </div>

		</section>
	)
}
