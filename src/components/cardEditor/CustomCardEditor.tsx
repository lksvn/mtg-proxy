import { useRef, useState } from 'react'
import { CardCanvas, type ArtworkTransform } from './CardCanvas'
import { FileInput } from '../FileInput'
import { ArtworkControls } from './ArtworkControls'
import { CardDetailsForm } from './CardDetailsForm'
import type { CustomCardData } from './types'
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
                        onSelect={setSetSymbol}
                        onClear={() => setSetSymbol(undefined)}
                    />
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
