import type { PrintSettings } from '../Pdf'
import type { Paper } from '../PdfLayout'

type PrintSettingsFormProps = {
	settings: PrintSettings
	onChange: (settings: PrintSettings) => void
}

export function PrintSettingsForm({
	settings: printSettings,
	onChange: setPrintSettings,
}: PrintSettingsFormProps) {
	return (
		<fieldset>
            <legend>Print settings</legend>

            <p>
                <label htmlFor="paper">Paper</label>{' '}
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
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                </select>
            </p>

            <p>
                <label htmlFor="gap">Gap in millimetres</label>{' '}
                <input
                    id="gap"
                    type="number"
                    min="0"
                    step="0.1"
                    value={printSettings.gap}
                    onChange={(event) =>
                        setPrintSettings({
                            ...printSettings,
                            gap: Math.max(0, event.target.valueAsNumber || 0),
                        })
                    }
                />
            </p>

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
                Crop marks
            </label>

            <br />

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
                Black corners
            </label>

            <br />

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
                Bleed
            </label>

            {printSettings.bleed && printSettings.gap < 3 && (<p>Tip: use a 3 mm gap with bleed.</p>)}

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
                Skip basic lands
            </label>

            <br />

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
                Print deck list
            </label>

            <br />

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
                Playtest watermark
            </label>
        </fieldset>
	)
}