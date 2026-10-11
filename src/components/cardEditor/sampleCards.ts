import type {
	SplitCardData,
	AdventureCardData,
	CaseCardData,
	ClassCardData,
	CustomCardData,
	LevelerCardData,
	PlaneswalkerCardData,
	RoomCardData,
	SagaCardData,
} from './types'

export const SAMPLE_CARD: CustomCardData = {
	name: 'Marrow-Gnawer',
	manaCost: '3bb',
	typeLine: 'Legendary Creature — Rat Rogue',
	rulesText: `All Rats have fear.
{T}, Sacrifice a Rat: Create X 1/1 black Rat creature tokens, where X is the number of Rats you control.`,
	centerRulesText: false,
	flavorText: 'Marrow-Gnawer united three nezumi gangs when he slew their leaders in a single night. Now they call him their first lord.',
	powerToughness: '2/3',
	artist: 'Wayne Reynolds',
	number: '124',
	rarity: 'rare',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_SPLIT: SplitCardData = {
	...SAMPLE_CARD,
	name: 'Fire',
	manaCost: '1r',
	typeLine: 'Instant',
	rulesText: 'Fire deals 2 damage divided as you choose among one or two targets.',
	flavorText: '',
	powerToughness: '',
	artist: '',
	number: '',
	secondName: 'Ice',
	secondManaCost: '1u',
	secondTypeLine: 'Instant',
	secondRulesText: 'Tap target permanent.\nDraw a card.',
	secondFlavorText: '',
	fuseReminderText: 'Fuse (You may cast one or both halves of this card from your hand.)',
}

export const SAMPLE_TOKEN: CustomCardData = {
	name: 'Rat',
	manaCost: '',
	typeLine: 'Token Creature — Rat',
	rulesText: '',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '1/1',
	artist: '',
	number: '1',
	rarity: 'common',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_PLANESWALKER: PlaneswalkerCardData = {
	name: 'Jace, Arcane Strategist',
	manaCost: '4uu',
	typeLine: 'Legendary Planeswalker — Jace',
	startingLoyalty: '4',
	nickname: 'The Mind Sculptor',
	reverseFaceName: '',
	reverseFaceManaCost: '',
	abilities: [
		{
			cost: '+1',
			text: 'Draw a card.',
		},
		{
			cost: '-2',
			text: 'Return target creature to its owner’s hand.',
		},
		{
			cost: '-8',
			text: 'Draw seven cards. You get an emblem with “You have no maximum hand size.”',
		},
	],
	artist: '',
	number: '1',
	rarity: 'mythic',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_BATTLE: CustomCardData = {
	name: 'Invasion of Zendikar',
	manaCost: '3g',
	typeLine: 'Battle — Siege',
	rulesText: '(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it’s defeated, exile it, then cast it transformed.)\n\nWhen Invasion of Zendikar enters, search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '3',
	artist: '',
	number: '194',
	rarity: 'uncommon',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_SAGA: SagaCardData = {
	name: 'History of Benalia',
	manaCost: '1ww',
	typeLine: 'Enchantment — Saga',
	rulesText: '(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '',
	artist: '',
	number: '21',
	rarity: 'mythic',
	tintSetSymbol: false,
	backgroundColor: '#000000',
	chapters: [
		{
			chapterCount: 1,
			text: 'Create a 2/2 white Knight creature token with vigilance.',
		},
		{
			chapterCount: 1,
			text: 'Create a 2/2 white Knight creature token with vigilance.',
		},
		{
			chapterCount: 1,
			text: 'Knights you control get +2/+1 until end of turn.',
		},
	],
	reversePowerToughness: '',
}

export const SAMPLE_CLASS: ClassCardData = {
	name: 'Wizard Class',
	manaCost: 'u',
	typeLine: 'Enchantment — Class',
	rulesText: '',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '',
	artist: '',
	number: '81',
	rarity: 'uncommon',
	tintSetSymbol: false,
	backgroundColor: '#000000',
	levels: [
		{
			cost: '',
			name: '',
			text: '(Gain the next level as a sorcery to add its ability.)\nYou have no maximum hand size.',
		},
		{
			cost: '{2}{U}',
			name: 'Level 2',
			text: 'When this Class becomes level 2, draw two cards.',
		},
		{
			cost: '{4}{U}',
			name: 'Level 3',
			text: 'Whenever you draw a card, put a +1/+1 counter on target creature you control.',
		},
	],
}

export const SAMPLE_CASE: CaseCardData = {
	name: 'Case of the Uneaten Feast',
	manaCost: 'w',
	typeLine: 'Enchantment — Case',
	rulesText: 'Whenever a creature enters under your control, you gain 1 life.',
	solveCondition: '(If unsolved, solve at the beginning of your end step.) You gained 5 or more life this turn.',
	solvedAbility: 'Creatures you control get +1/+1.',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '',
	artist: '',
	number: '10',
	rarity: 'uncommon',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_ROOM: RoomCardData = {
	name: 'Bottomless Pool',
	manaCost: 'u',
	rulesText: 'When you unlock this door, return up to one target creature to its owner’s hand.',
	otherName: 'Locker Room',
	otherManaCost: '4u',
	otherRulesText: 'Whenever one or more creatures you control deal combat damage to a player, draw a card.',
	typeLine: 'Enchantment — Room',
	reminderText: '(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '',
	artist: '',
	number: '43',
	rarity: 'uncommon',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_ADVENTURE: AdventureCardData = {
	name: 'Beanstalk Giant',
	manaCost: '6g',
	typeLine: 'Creature — Giant',
	rulesText: 'Beanstalk Giant’s power and toughness are each equal to the number of lands you control.',
	adventureName: 'Fertile Footsteps',
	adventureManaCost: '2g',
	adventureTypeLine: 'Sorcery — Adventure',
	adventureRulesText: 'Search your library for a basic land card, put it onto the battlefield, then shuffle.',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '*/*',
	artist: '',
	number: '149',
	rarity: 'uncommon',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}

export const SAMPLE_LEVELER: LevelerCardData = {
	name: 'Transcendent Master',
	manaCost: '1ww',
	typeLine: 'Creature — Human Cleric Avatar',
	rulesText: '',
	levelUpText: 'Level up {1} ({1}: Put a level counter on this. Level up only as a sorcery.)',
	levelTwo: '6-11',
	levelTwoRulesText: 'Lifelink',
	levelTwoPowerToughness: '6/6',
	levelThree: '12+',
	levelThreeRulesText: 'Lifelink\nTranscendent Master is indestructible.',
	levelThreePowerToughness: '9/9',
	centerRulesText: false,
	flavorText: '',
	powerToughness: '3/3',
	artist: '',
	number: '47',
	rarity: 'mythic',
	tintSetSymbol: false,
	backgroundColor: '#000000',
}
