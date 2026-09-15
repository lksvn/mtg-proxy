const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]
const PHYS_TYPE = new Uint8Array([112, 72, 89, 115])

function crc32(bytes: Uint8Array) {
	let crc = 0xffffffff

	for (const byte of bytes) {
		crc ^= byte
		for (let bit = 0; bit < 8; bit++) {
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
		}
	}

	return (crc ^ 0xffffffff) >>> 0
}

export function setPngDpi(source: Uint8Array, dpi: number) {
	if (!PNG_SIGNATURE.every((byte, index) => source[index] === byte)) {
		throw new Error('Invalid PNG')
	}

	const pixelsPerMeter = Math.round(dpi / 0.0254)
	const data = new Uint8Array(9)
	const dataView = new DataView(data.buffer)
	dataView.setUint32(0, pixelsPerMeter)
	dataView.setUint32(4, pixelsPerMeter)
	data[8] = 1

	const chunk = new Uint8Array(21)
	const chunkView = new DataView(chunk.buffer)
	chunkView.setUint32(0, data.length)
	chunk.set(PHYS_TYPE, 4)
	chunk.set(data, 8)
	chunkView.setUint32(17, crc32(chunk.subarray(4, 17)))

	let offset = 8
	while (offset + 12 <= source.length) {
		const length = new DataView(source.buffer, source.byteOffset + offset, 4).getUint32(0)
		if (source.subarray(offset + 4, offset + 8).every((byte, index) => byte === PHYS_TYPE[index])) {
			const output = source.slice()
			output.set(chunk, offset)
			return output
		}
		offset += length + 12
	}

	const ihdrEnd = 8 + new DataView(source.buffer, source.byteOffset + 8, 4).getUint32(0) + 12
	const output = new Uint8Array(source.length + chunk.length)
	output.set(source.subarray(0, ihdrEnd))
	output.set(chunk, ihdrEnd)
	output.set(source.subarray(ihdrEnd), ihdrEnd + chunk.length)
	return output
}
