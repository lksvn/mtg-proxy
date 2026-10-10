import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanMarkdownCardList } from '../src/utils/cleanMarkdownCardList.ts'
import { parseCardList } from '../src/Cards.ts'

test('cleans vault-style Markdown while retaining card quantities and printing details', () => {
	const cleaned = cleanMarkdownCardList([
		'#project/deck #status/active', '# My deck', '## Commander',
		'- **1 Marrow-Gnawer (chk) 124**',
		'- [x] 4 Lightning Bolt', '1. `2 Island`', '> 1 Alive // Well',
		'```text', '1 骨を灰に', '```', '---',
		'- [Black Lotus](https://example.com)', '- [[Rat]]',
	].join('\n'))
	assert.equal(cleaned, '1 Marrow-Gnawer (chk) 124\n4 Lightning Bolt\n2 Island\n1 Alive // Well\n1 骨を灰に\nBlack Lotus\nRat')
	const cards = parseCardList(cleaned)
	assert.equal(cards[0].set, 'chk')
	assert.equal(cards[0].collectorNumber, '124')
	assert.equal(cards[1].quantity, 4)
	assert.equal(cleanMarkdownCardList('[[Cards/Rat|Rat]]'), 'Rat')
	const [existingRules] = parseCardList(cleanMarkdownCardList('- **1x Lightning Bolt (2XM) 129 *F* [Burn] ^Removal^**'))
	assert.equal(existingRules.name, 'Lightning Bolt')
	assert.equal(existingRules.collectorNumber, '129')
	assert.equal(cleanMarkdownCardList('Some notes\n-1 Rat\n1.5 Rat'), 'Some notes\n-1 Rat\n1.5 Rat')
})
