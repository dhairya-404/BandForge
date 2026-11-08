import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Create a modern, iconic vector emblem for BondForge
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Squircle Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#070a13"/>
    </linearGradient>

    <!-- Outer Rim Laser Glow -->
    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.7"/>
    </linearGradient>

    <!-- Central Core Energy Glow -->
    <radialGradient id="coreGlow" cx="52%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Wi-Fi Channel Cyan -->
    <linearGradient id="cyanStream" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#00f2fe"/>
    </linearGradient>

    <!-- 5G Mobile Channel Amber -->
    <linearGradient id="amberStream" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>

    <!-- Ethernet Channel Cobalt -->
    <linearGradient id="blueStream" x1="0%" y1="100%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>

    <!-- Forged Output Beam -->
    <linearGradient id="forgeBeam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="70%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>

    <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Obsidian Rounded Squircle Container -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgGrad)" stroke="url(#rimGrad)" stroke-width="4"/>
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#coreGlow)"/>

  <!-- Subtle Internal Grid Pattern -->
  <g opacity="0.12" stroke="#38bdf8" stroke-width="1">
    <line x1="80" y1="180" x2="432" y2="180"/>
    <line x1="80" y1="256" x2="432" y2="256"/>
    <line x1="80" y1="332" x2="432" y2="332"/>
    <line x1="160" y1="80" x2="160" y2="432"/>
    <line x1="256" y1="80" x2="256" y2="432"/>
    <line x1="352" y1="80" x2="352" y2="432"/>
  </g>

  <!-- EMBLEM: THE FORGE NEXUS (3 Multi-WAN Channels Converging into a Super-Charged Stream) -->
  <g filter="url(#laserGlow)">
    <!-- Pathway 1: Top Wi-Fi 5GHz Stream (Cyan) -->
    <path d="M 108 164 C 180 164, 210 236, 260 256" fill="none" stroke="url(#cyanStream)" stroke-width="18" stroke-linecap="round"/>
    <circle cx="108" cy="164" r="9" fill="#00f2fe"/>

    <!-- Pathway 2: Center 5G Mobile Cellular Stream (Amber) -->
    <path d="M 96 256 L 260 256" fill="none" stroke="url(#amberStream)" stroke-width="18" stroke-linecap="round"/>
    <circle cx="96" cy="256" r="9" fill="#fbbf24"/>

    <!-- Pathway 3: Bottom Ethernet Gigabit Stream (Cobalt Blue) -->
    <path d="M 108 348 C 180 348, 210 276, 260 256" fill="none" stroke="url(#blueStream)" stroke-width="18" stroke-linecap="round"/>
    <circle cx="108" cy="348" r="9" fill="#60a5fa"/>

    <!-- Central Fusion Core (The Anvil / Hex Core) -->
    <polygon points="260,224 290,256 260,288 230,256" fill="#ffffff" stroke="#00f2fe" stroke-width="6"/>

    <!-- Accelerated Output Spearhead (Forged Aggregated Beam) -->
    <path d="M 276 256 L 396 256" stroke="url(#forgeBeam)" stroke-width="26" stroke-linecap="round"/>
    <!-- Supersonic Speed Chevrons -->
    <polygon points="384,232 424,256 384,280 398,256" fill="#ffffff"/>
    <polygon points="340,240 366,256 340,272 350,256" fill="#00f2fe" opacity="0.9"/>
  </g>

  <!-- Sparkle Accents -->
  <circle cx="260" cy="256" r="5" fill="#ffffff"/>
  <circle cx="430" cy="256" r="3" fill="#ffffff"/>
  <polygon points="290,200 293,208 301,211 293,214 290,222 287,214 279,211 287,208" fill="#00f2fe" opacity="0.7"/>
  <polygon points="380,310 382,316 388,318 382,320 380,326 378,320 372,318 378,316" fill="#fbbf24" opacity="0.7"/>
</svg>
`

// Greyscale version for extension off state
const svgOffContent = svgContent
  .replace(/#00f2fe/gi, '#64748b')
  .replace(/#06b6d4/gi, '#475569')
  .replace(/#38bdf8/gi, '#94a3b8')
  .replace(/#f59e0b/gi, '#475569')
  .replace(/#fbbf24/gi, '#64748b')
  .replace(/#3b82f6/gi, '#334155')
  .replace(/#60a5fa/gi, '#475569')

function buildIco(pngBuffers) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // Image type: 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4) // Count of images

  // Directory entries: 16 bytes per image
  const entries = []
  let offset = 6 + pngBuffers.length * 16

  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // Width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // Height (0 means 256)
    entry.writeUInt8(0, 2) // Color palette: 0 for 256+ colors
    entry.writeUInt8(0, 3) // Reserved
    entry.writeUInt16LE(1, 4) // Color planes: 1
    entry.writeUInt16LE(32, 6) // Bits per pixel: 32
    entry.writeUInt32LE(buffer.length, 8) // Image size in bytes
    entry.writeUInt32LE(offset, 12) // Offset to image data
    entries.push(entry)
    offset += buffer.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)])
}

async function run() {
  console.log('[BondForge] Generating original pixel-perfect branding icons...')

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

  console.log('[BondForge] All icons generated successfully!')
}

run().catch((err) => {
  console.error('Failed to generate icons:', err)
  process.exit(1)
})
