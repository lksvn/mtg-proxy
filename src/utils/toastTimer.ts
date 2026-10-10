export function createToastTimer(onClose: () => void) {
	let remaining = 8_000
	let startedAt = 0
	let timeout: ReturnType<typeof setTimeout> | undefined

	return {
		resume() {
			if (timeout !== undefined) return
			startedAt = Date.now()
			timeout = setTimeout(() => {
				timeout = undefined
				remaining = 0
				onClose()
			}, remaining)
		},
		pause() {
			if (timeout === undefined) return
			clearTimeout(timeout)
			timeout = undefined
			remaining = Math.max(0, remaining - (Date.now() - startedAt))
		},
	}
}
