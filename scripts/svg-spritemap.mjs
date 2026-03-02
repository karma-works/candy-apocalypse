#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { join, basename, parse } from 'path'

const SVG_RAW_DIR = 'assets/svg_raw'
const SPRITEMAP_FILE = 'public/assets/spritemap.svg'

const SPRITEMAP_HEADER = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <!--
    Candy Apocalypse Spritemap
    All symbols follow the "Candy Apocalypse" color theme:
      Primary:  #00D4FF (Sky Pop), #FFB7C5 (Cotton Cloud), #FFE135 (Solar Burst), #32FF00 (Toxic Lime)
      Accent:   #FF6B35 (Rage Orange), #9B5DE5 (Mystic Violet), #FF0044 (Cherry Bomb)
      Outline:  #1A1A2E (Deep Space) at 3-5px stroke
  -->
`

function pack() {
  console.log('📦 Packing SVGs into spritemap...\n')
  
  if (!existsSync(SVG_RAW_DIR)) {
    console.error(`❌ Directory not found: ${SVG_RAW_DIR}`)
    process.exit(1)
  }

  const svgFiles = readdirSync(SVG_RAW_DIR)
    .filter(file => file.endsWith('.svg'))
    .sort()

  if (svgFiles.length === 0) {
    console.log('⚠️  No SVG files found in', SVG_RAW_DIR)
    return
  }

  const symbols = []
  const stats = { total: 0, warnings: [] }

  for (const file of svgFiles) {
    const filePath = join(SVG_RAW_DIR, file)
    const content = readFileSync(filePath, 'utf-8')
    const symbolId = parse(file).name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')

    const viewBoxMatch = content.match(/viewBox="([^"]+)"/)
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 64 64'

    const innerContent = content
      .replace(/<\?xml[^?]*\?>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<svg[^>]*>/i, '')
      .replace(/<\/svg>/i, '')
      .trim()

    if (!viewBoxMatch) {
      stats.warnings.push(`${file}: No viewBox found, using default "0 0 64 64"`)
    }

    const comment = content.match(/<!--\s*([^-]+?)\s*-->/)
    const symbolComment = comment ? `  <!-- ${comment[1].trim()} -->\n` : ''

    symbols.push(`${symbolComment}  <symbol id="${symbolId}" viewBox="${viewBox}">
${innerContent.split('\n').map(line => '    ' + line).join('\n')}
  </symbol>`)

    stats.total++
    console.log(`  ✓ ${file} → ${symbolId}`)
  }

  const spritemap = `${SPRITEMAP_HEADER}
${symbols.join('\n\n')}
</svg>
`

  writeFileSync(SPRITEMAP_FILE, spritemap)
  
  console.log(`\n✅ Packed ${stats.total} SVGs into ${SPRITEMAP_FILE}`)
  
  if (stats.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    stats.warnings.forEach(w => console.log(`  - ${w}`))
  }
}

function unpack() {
  console.log('📤 Unpacking spritemap into individual SVGs...\n')

  if (!existsSync(SPRITEMAP_FILE)) {
    console.error(`❌ Spritemap not found: ${SPRITEMAP_FILE}`)
    process.exit(1)
  }

  if (!existsSync(SVG_RAW_DIR)) {
    mkdirSync(SVG_RAW_DIR, { recursive: true })
  }

  const content = readFileSync(SPRITEMAP_FILE, 'utf-8')
  const symbolRegex = /<symbol\s+id="([^"]+)"\s+viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g

  const existingFiles = readdirSync(SVG_RAW_DIR).filter(f => f.endsWith('.svg'))
  existingFiles.forEach(file => {
    unlinkSync(join(SVG_RAW_DIR, file))
    console.log(`  🗑️  Removed old file: ${file}`)
  })

  let match
  let count = 0

  while ((match = symbolRegex.exec(content)) !== null) {
    const [, symbolId, viewBox, innerContent] = match
    
    const fileName = `${symbolId}.svg`
    const filePath = join(SVG_RAW_DIR, fileName)
    
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${innerContent.trim()}
</svg>
`

    writeFileSync(filePath, svgContent)
    console.log(`  ✓ ${symbolId} → ${fileName}`)
    count++
  }

  console.log(`\n✅ Unpacked ${count} symbols into ${SVG_RAW_DIR}/`)
}

function showHelp() {
  console.log(`
Usage: node scripts/svg-spritemap.mjs <command>

Commands:
  pack      Pack all SVGs from ${SVG_RAW_DIR}/ into ${SPRITEMAP_FILE}
  unpack    Extract all symbols from ${SPRITEMAP_FILE} into ${SVG_RAW_DIR}/

Examples:
  node scripts/svg-spritemap.mjs pack
  node scripts/svg-spritemap.mjs unpack
`)
}

const command = process.argv[2]

switch (command) {
  case 'pack':
    pack()
    break
  case 'unpack':
    unpack()
    break
  case '--help':
  case '-h':
  case undefined:
    showHelp()
    break
  default:
    console.error(`❌ Unknown command: ${command}`)
    showHelp()
    process.exit(1)
}
