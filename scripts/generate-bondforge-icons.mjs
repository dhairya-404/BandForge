import fs from 'fs'
import sharp from 'sharp'

// Completely original, bold 3D Cyber Anvil & Lightning Nexus emblem for BondForge
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="hexBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="60%" stop-color="#0a0f1d"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>

    <!-- Metallic Shield Rim Gradient -->
    <linearGradient id="shieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="25%" stop-color="#3b82f6"/>
      <stop offset="70%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ff6b00"/>
    </linearGradient>

    <!-- Core Plasma Ambient Glow -->
    <radialGradient id="corePlasma" cx="50%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#ff6b00" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Left Wing (Cyan) -->
    <linearGradient id="cyanFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#00f2fe"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Center Lightning Spear (Amber / Fire) -->
    <linearGradient id="fireFacet" x1="0%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>

    <!-- Right Wing (Royal Cobalt) -->
    <linearGradient id="cobaltFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="60%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Anvil Base (Dark Titanium) -->
    <linearGradient id="titaniumFacet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <filter id="hyperGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 1. Geometric Hexagonal Cyber Shield -->
  <polygon points="256,20 452,132 452,380 256,492 60,380 60,132" fill="url(#hexBg)" stroke="url(#shieldRim)" stroke-width="6"/>
  <polygon points="256,36 438,142 438,370 256,476 74,370 74,142" fill="url(#corePlasma)"/>

  <!-- Inner Bevel Rim -->
  <polygon points="256,52 424,150 424,362 256,460 88,362 88,150" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>

  <!-- 2. THE CYBER ANVIL BASE (Forge Foundation) -->
  <g id="anvil-base">
    <!-- Anvil bottom plate -->
    <polygon points="170,395 342,395 372,425 140,425" fill="url(#titaniumFacet)" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.4"/>
    <!-- Anvil waist -->
    <polygon points="200,345 312,345 330,395 182,395" fill="#0f172a" stroke="#00f2fe" stroke-width="2" stroke-opacity="0.5"/>
  </g>

  <!-- 3. THE "BF" GEOMETRIC LIGHTNING FORGE NEXUS -->
  <g filter="url(#hyperGlow)">
    <!-- Left Wing / "B" Contour (Electric Cyan) -->
    <polygon points="124,160 236,160 216,230 154,230" fill="url(#cyanFacet)"/>
    <polygon points="150,240 220,240 196,335 120,335" fill="url(#cyanFacet)"/>
    <!-- Wing highlight line -->
    <line x1="124" y1="160" x2="236" y2="160" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

    <!-- Central High-Velocity Lightning Spear (Molten Amber to Fire) -->
    <polygon points="280,105 204,260 264,260 220,380 340,225 272,225" fill="url(#fireFacet)"/>
    <!-- Center white-hot spark -->
    <polygon points="274,125 218,250 260,250 234,350 320,235 270,235" fill="#ffffff" opacity="0.85"/>

    <!-- Right Wing / "F" Contour (Royal Cobalt) -->
    <polygon points="296,160 388,160 376,198 304,198" fill="url(#cobaltFacet)"/>
    <polygon points="286,220 360,220 348,256 280,256" fill="url(#cobaltFacet)"/>
    <!-- Top edge spark -->
    <line x1="296" y1="160" x2="388" y2="160" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- 4. Acceleration Spark Nodes (3 Multi-Network Ports) -->
  <circle cx="124" cy="160" r="7" fill="#00f2fe" stroke="#ffffff" stroke-width="2"/>
  <circle cx="280" cy="105" r="8" fill="#fef08a" stroke="#ff6b00" stroke-width="2.5"/>
  <circle cx="388" cy="160" r="7" fill="#60a5fa" stroke="#ffffff" stroke-width="2"/>
  <circle cx="220" cy="380" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>

  <!-- Energy Wave Lines -->
  <path d="M 90 248 C 110 240, 120 265, 140 256" fill="none" stroke="#00f2fe" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <path d="M 370 248 C 390 240, 400 265, 420 256" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
</svg>
`

// Greyscale version for extension off state
const svgOffContent = svgContent
  .replace(/#00f2fe/gi, '#64748b')
  .replace(/#22d3ee/gi, '#475569')
  .replace(/#0284c7/gi, '#334155')
  .replace(/#fef08a/gi, '#94a3b8')
  .replace(/#f59e0b/gi, '#475569')
  .replace(/#ff6b00/gi, '#334155')
  .replace(/#dc2626/gi, '#1e293b')
  .replace(/#60a5fa/gi, '#64748b')
  .replace(/#3b82f6/gi, '#475569')
  .replace(/#1d4ed8/gi, '#1e293b')

function buildIco(pngBuffers) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngBuffers.length, 4)

  const entries = []
  let offset = 6 + pngBuffers.length * 16

  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(buffer.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += buffer.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)])
}

async function run() {
  console.log('[BondForge] Generating revolutionary 3D Cyber Anvil & Lightning icon suite...')

  // 1. build/icon.png (512x512)
  const icon512 = await sharp(Buffer.from(svgContent)).resize(512, 512).png().toBuffer()
  fs.writeFileSync('build/icon.png', icon512)
  console.log('✓ Created build/icon.png (512x512)')

  // 2. build/icon.ico (256, 128, 64, 48, 32, 16)
  const icoSizes = [256, 128, 64, 48, 32, 16]
  const icoPngs = []
  for (const size of icoSizes) {
    const buf = await sharp(Buffer.from(svgContent)).resize(size, size).png().toBuffer()
    icoPngs.push({ size, buffer: buf })
  }
  const icoBuffer = buildIco(icoPngs)
  fs.writeFileSync('build/icon.ico', icoBuffer)
  console.log('✓ Created build/icon.ico (multi-resolution Windows ICO)')

  // 3. Extension icons
  const extSizes = [128, 48, 32, 16]
  for (const size of extSizes) {
    const buf = await sharp(Buffer.from(svgContent)).resize(size, size).png().toBuffer()
    fs.writeFileSync(`extension/icons/icon-${size}.png`, buf)
    console.log(`✓ Created extension/icons/icon-${size}.png`)
  }

  // 4. Extension off icons
  for (const size of [32, 16]) {
    const buf = await sharp(Buffer.from(svgOffContent)).resize(size, size).png().toBuffer()
    fs.writeFileSync(`extension/icons/icon-off-${size}.png`, buf)
    console.log(`✓ Created extension/icons/icon-off-${size}.png`)
  }

  console.log('[BondForge] Completely original icon suite created successfully!')
}

run().catch((err) => {
  console.error('Failed to generate icons:', err)
  process.exit(1)
})
