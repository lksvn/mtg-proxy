import type { PrintSettings } from '../Pdf'
import type { Paper } from '../PdfLayout'
import { useI18n } from '../i18n/context'

type PrintSettingsFormProps = {
	settings: PrintSettings
	onChange: (settings: PrintSettings) => void
}

export function PrintSettingsForm({
	settings: printSettings,
	onChange: setPrintSettings
}: PrintSettingsFormProps) {
    const { t } = useI18n()

	return (
		<details>
			<summary>{t('printSettings')}</summary>
            <div className="wrapper">
                <div className="form-group mb-0">
                    <label htmlFor="paper">{t('paper')}</label>{' '}
                    <select
                        id="paper"
                        value={printSettings.paper}
                        onChange={(event) =>
                            setPrintSettings({
                                ...printSettings,
                                paper: event.target.value as Paper,
                            })
                        }
                    >
                        <option value="a4">A4</option>
                        <option value="a3">A3</option>
                        <option value="letter">{t('paperLetter')}</option>
                        <option value="legal">{t('paperLegal')}</option>
                    </select>
                </div>

                <div className="form-group mb-0">
                    <label htmlFor="gap">{t('gapMillimetres')}</label>{' '}
                    <input
                        id="gap"
                        type="number"
                        min="0.3"
                        step="0.1"
                        value={printSettings.gap}
                        onChange={(event) =>
                            setPrintSettings({
                                ...printSettings,
                                gap: Math.max(0, event.target.valueAsNumber || 0),
                            })
                        }
                    />
                </div>

                <div className="form-group mb-0">
                    <label>
                        <input
                            type="checkbox"
                            checked={printSettings.cropMarks}
                            onChange={(event) =>
                                setPrintSettings({
                                    ...printSettings,
                                    cropMarks: event.target.checked,
                                })
                            }
                        />
                        {t('cropMarks')}
                    </label>
                </div>

                <div className="form-group mb-0">
                    <label>
                        <input
                            type="checkbox"
                            checked={printSettings.blackCorners}
                            onChange={(event) =>
                                setPrintSettings({
                                    ...printSettings,
                                    blackCorners: event.target.checked,
                                })
                            }
                        />
                        {t('blackCorners')}
                    </label>
                </div>

                <div className="form-group mb-0">
                    <label>
                        <input
                            type="checkbox"
                            checked={printSettings.bleed}
                            onChange={(event) =>
                                setPrintSettings({
                                    ...printSettings,
                                    bleed: event.target.checked,
                                })
                            }
                        />
                        {t('bleed')}
                    </label>
                </div>

                <div className="form-group mb-0">
                    <label>
                        <input
                            type="checkbox"
                            checked={printSettings.skipBasicLands}
                            onChange={(event) =>
                                setPrintSettings({
                                    ...printSettings,
                                    skipBasicLands: event.target.checked,
                                })
                            }
                        />
                        {t('skipBasicLands')}
                    </label>
                </div>

                <div className="form-group mb-0">
                    <label>
                        <input
                            type="checkbox"
                            checked={printSettings.deckList}
                            onChange={(event) =>
                                setPrintSettings({
                                    ...printSettings,
                                    deckList: event.target.checked,
                                })
                            }
                        />
                        {t('printDeckList')}
                    </label>
                </div>

                <div className="form-group mb-0">
                    <label>
                        <input
                            type="checkbox"
                            checked={printSettings.watermark}
                            onChange={(event) =>
                                setPrintSettings({
                                    ...printSettings,
                                    watermark: event.target.checked,
                                })
                            }
                        />
                        {t('playtestWatermark')}
                    </label>
                </div>
            </div>
		</details>
	)
}
