import sharp from 'sharp'
import { readdirSync, statSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const SRC = join(process.cwd(), 'public/assets/village')
const DST = SRC // overwrite originals with compressed versions

/** 生成 3 级分辨率版本 */
async function optimize() {
  const files = readdirSync(SRC).filter(f => /\.(jpg|jpeg|png)$/i.test(f))

  for (const file of files) {
    const input = join(SRC, file)
    const originalKB = (statSync(input).size / 1024).toFixed(0)

    // 生成缩略图 400px（移动端）
    const name = file.replace(/\.(jpg|jpeg|png)$/i, '')
    const thumbFile = `${name}_thumb.jpg`
    const thumbPath = join(SRC, thumbFile)

    if (!existsSync(thumbPath)) {
      await sharp(input)
        .resize(400)
        .jpeg({ quality: 65, mozjpeg: true })
        .toFile(thumbPath)
      const thumbKB = (statSync(thumbPath).size / 1024).toFixed(0)
      console.log(`✓ 缩略图: ${thumbFile}  (${originalKB}KB → ${thumbKB}KB)`)
    }

    // 中尺寸 800px（平板）
    const medFile = `${name}_med.jpg`
    const medPath = join(SRC, medFile)

    if (!existsSync(medPath)) {
      await sharp(input)
        .resize(800)
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(medPath)
      const medKB = (statSync(medPath).size / 1024).toFixed(0)
      console.log(`✓ 中尺寸: ${medFile}  (${originalKB}KB → ${medKB}KB)`)
    }

    // 原始图也要压缩：限制最大宽度 1400px + 降低 JPEG quality
    const optimizedFile = `${name}_opt.jpg`
    const optPath = join(SRC, optimizedFile)

    if (!existsSync(optPath)) {
      const metadata = await sharp(input).metadata()
      const resizeOpts = metadata.width && metadata.width > 1400 ? { width: 1400 } : undefined
      await sharp(input)
        .resize(resizeOpts || undefined)
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(optPath)
      const optKB = (statSync(optPath).size / 1024).toFixed(0)
      console.log(`✓ 压缩原图: ${optimizedFile}  (${originalKB}KB → ${optKB}KB)`)
    }
  }

  // 最终清单
  console.log('\n=== 输出文件 ===')
  const out = readdirSync(SRC).filter(f => /\.jpg$/i.test(f)).sort()
  out.forEach(f => {
    const kb = (statSync(join(SRC, f)).size / 1024).toFixed(1)
    console.log(`  ${f.padEnd(40)} ${kb} KB`)
  })
}

optimize().catch(e => { console.error(e); process.exit(1) })
