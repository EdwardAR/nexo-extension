// Minimal PNG generator for extension icons
import fs from 'fs'
import path from 'path'
import { deflateSync } from 'zlib'

function createPNG(width, height, r, g, b) {
  // Minimal PNG writer
  function crc32(buf) {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff]
    }
    return (c ^ 0xffffffff) >>> 0
  }

  const crcTable = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    crcTable[n] = c
  }

  // Create raw pixel data (RGBA)
  const rawData = Buffer.alloc((width * height * 4) + height)
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0 // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 4 + 1) + 1 + x * 4
      // Draw a shield-like shape
      const cx = width / 2
      const cy = height / 2
      const dx = Math.abs(x - cx) / cx
      const dy = Math.abs(y - cy) / cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const inShape = dist < 0.8 && (y < height * 0.75)
      
      if (inShape) {
        rawData[offset] = r
        rawData[offset + 1] = g
        rawData[offset + 2] = b
        rawData[offset + 3] = 255
      } else {
        rawData[offset] = 0
        rawData[offset + 1] = 0
        rawData[offset + 2] = 0
        rawData[offset + 3] = 0
      }
    }
  }

  const deflated = deflateSync(rawData)

  // Build PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeB = Buffer.from(type)
    const crcData = Buffer.concat([typeB, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(crcData))
    return Buffer.concat([len, typeB, data, crc])
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const iend = Buffer.alloc(0)

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', iend),
  ])
}

const outDir = path.resolve('public/icons')
fs.mkdirSync(outDir, { recursive: true })

const sizes = [
  [16, 99, 102, 241],   // indigo-400
  [48, 99, 102, 241],
  [128, 99, 102, 241],
]

for (const [size, r, g, b] of sizes) {
  const png = createPNG(size, size, r, g, b)
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), png)
  console.log(`Created icon${size}.png (${png.length} bytes)`)
}
