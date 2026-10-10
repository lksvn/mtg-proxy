import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/context'
import { createToastTimer } from '../utils/toastTimer'
import { Icon } from './Icon'

type ErrorToastProps = {
	message: string
	onClose: () => void
	tone?: 'error' | 'warning' | 'info'
}

export function ErrorToast({ message, onClose, tone = 'error' }: ErrorToastProps) {
	const { t } = useI18n()
	const [hovered, setHovered] = useState(false)
	const [focused, setFocused] = useState(false)
	const timerRef = useRef<ReturnType<typeof createToastTimer> | null>(null)

	useEffect(() => {
		if (!message) return
		const timer = createToastTimer(onClose)
		timerRef.current = timer
		return () => {
			timer.pause()
			timerRef.current = null
		}
	}, [message, onClose])

	useEffect(() => {
		if (hovered || focused) timerRef.current?.pause()
		else timerRef.current?.resume()
	}, [message, onClose, hovered, focused])

	if (!message) return null

	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={`message ${tone} error-toast`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onFocus={() => setFocused(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
			}}
		>
			<Icon name={tone} />
			<p>{message}</p>
			<button type="button" className="btn error-toast-close" aria-label={t('close')} onClick={onClose}>
				<Icon name="close" />
			</button>
		</div>
	)
}
