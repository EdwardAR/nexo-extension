import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = path.join(projectRoot, 'public', 'icons')
const source = path.join(iconsDir, 'icon-source.svg')
const sizes = [16, 48, 128]

await Promise.all(
  sizes.map(async (size) => {
    const output = path.join(iconsDir, `icon${size}.png`)
    await sharp(source)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(output)
    console.log(`Creado: public/icons/icon${size}.png`)
  })
)
