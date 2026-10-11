import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTabIndex } from '../src/components/cardEditor/ui/tabNavigation.ts'

test('two- and three-tab controls navigate and wrap with keyboard arrows', () => {
	for (const count of [2, 3]) {
		assert.equal(nextTabIndex(0, count, 'ArrowRight'), 1)
		assert.equal(nextTabIndex(0, count, 'ArrowLeft'), count - 1)
		assert.equal(nextTabIndex(count - 1, count, 'ArrowRight'), 0)
		assert.equal(nextTabIndex(1, count, 'Home'), 0)
		assert.equal(nextTabIndex(0, count, 'End'), count - 1)
	}
})
