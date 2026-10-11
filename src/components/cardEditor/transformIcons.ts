export const TRANSFORM_ICONS = [
	{ id: 'up', file: 'default.png', label: 'transformIconUp' },
	{ id: 'down', file: 'downArrow.png', label: 'transformIconDown' },
	{ id: 'sun', file: 'sun.svg', label: 'transformIconSun' },
	{ id: 'moon', file: 'moon.svg', label: 'transformIconMoon' },
	{ id: 'fullmoon', file: 'fullmoon.svg', label: 'transformIconFullmoon' },
	{ id: 'emrakul', file: 'emrakul.svg', label: 'transformIconEmrakul' },
	{ id: 'compass', file: 'compass.svg', label: 'transformIconCompass' },
	{ id: 'land', file: 'land.svg', label: 'transformIconLand' },
	{ id: 'spark', file: 'spark.svg', label: 'transformIconSpark' },
	{ id: 'planeswalker', file: 'planeswalker.svg', label: 'transformIconPlaneswalker' },
	{ id: 'lesson', file: 'lesson.svg', label: 'transformIconLesson' },
	{ id: 'fanClosed', file: 'fanClosed.svg', label: 'transformIconFanClosed' },
	{ id: 'fanOpen', file: 'fanOpen.svg', label: 'transformIconFanOpen' },
	{ id: 'meld', file: 'hammer.png', label: 'transformIconMeld' },
] as const

export type TransformIcon = typeof TRANSFORM_ICONS[number]['id']

export function transformIconPath(icon: TransformIcon | undefined, defaultIcon?: TransformIcon) {
	const option = TRANSFORM_ICONS.find(option => option.id === (icon ?? defaultIcon))
	return option ? `img/frames/m15/transform/icons/${option.file}` : undefined
}
