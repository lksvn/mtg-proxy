import assert from 'node:assert/strict'
import test from 'node:test'
import { createToastTimer } from '../src/utils/toastTimer.ts'

test('dismisses after eight seconds and keeps remaining time when paused', (context) => {
	context.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
	let closed = 0
	const timer = createToastTimer(() => { closed += 1 })
	timer.resume()
	context.mock.timers.tick(3_000)
	timer.pause()
	context.mock.timers.tick(20_000)
	assert.equal(closed, 0)
	timer.resume()
	timer.resume()
	context.mock.timers.tick(4_999)
	assert.equal(closed, 0)
	context.mock.timers.tick(1)
	assert.equal(closed, 1)
})

test('cancelling the toast timer prevents dismissal', (context) => {
	context.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
	let closed = false
	const timer = createToastTimer(() => { closed = true })
	timer.resume()
	timer.pause()
	context.mock.timers.tick(8_000)
	assert.equal(closed, false)
})
