import { Icon } from '../Icon'
import type { ArtworkTransform } from './CardCanvas'
import { useI18n } from '../../i18n/context'

type ArtworkControlsProps = {
	transform: ArtworkTransform
	onChange: (transform: ArtworkTransform) => void
	onReset: () => void
}

export function ArtworkControls({
	transform,
	onChange,
	onReset,
}: ArtworkControlsProps) {
	const { t } = useI18n()

	function update(changes: Partial<ArtworkTransform>) {
		onChange({ ...transform, ...changes })
	}

	return (
		<fieldset className="mt-3">
			<strong style={{ display: 'block' }}>{t('artworkPosition')}</strong>

            <div className="form-group gap-3" style={{ flexDirection: 'row' }}>
                <label>
                    {t('horizontal')} ({transform.x.toFixed(0)})
                    <input
                        type="range"
                        min={-750}
                        max={750}
                        value={transform.x}
                        onChange={(event) =>
                            update({ x: Number(event.target.value) })
                        }
                    />
                </label>

                <label>
                    {t('vertical')} ({transform.y.toFixed(0)})
                    <input
                        type="range"
                        min={-1050}
                        max={1050}
                        value={transform.y}
                        onChange={(event) =>
                            update({ y: Number(event.target.value) })
                        }
                    />
                </label>

                <label>
                    {t('rotation')} ({transform.rotation}°)
                    <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={transform.rotation}
                        onChange={(event) =>
                            update({
                                rotation: Number(event.target.value),
                            })
                        }
                    />
                </label>
            </div>

			<div className="form-group">
				<label>
					<input
						type="checkbox"
						checked={transform.flipX}
						onChange={(event) =>
							update({ flipX: event.target.checked })
						}
					/> {t('flipHorizontally')}
				</label>

				<label>
					<input
						type="checkbox"
						checked={transform.flipY}
						onChange={(event) =>
							update({ flipY: event.target.checked })
						}
					/> {t('flipVertically')}
				</label>
			</div>

            <div className="form-group">
                <label>
                    {t('zoom')} ({(transform.scale * 100).toFixed(0)}%)
                    <input
                        type="range"
                        min={-0.75}
                        max={2}
                        step={0.01}
                        value={transform.scale}
                        onChange={(event) =>
                            update({ scale: Number(event.target.value) })
                        }
                    />
                </label>
            </div>

			<button type="button" className="btn" onClick={onReset}>
				<Icon name="refresh-cw"/> {t('reset')}
			</button>
		</fieldset>
	)
}
