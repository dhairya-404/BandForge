import fs from 'fs'
import sharp from 'sharp'

// Bespoke, original Tesso Nexus Weave vector mark
// 3 converging parallel network streams (Cyan, Emerald, Cobalt) weaving into a monolithic 'T' node
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="tessoBg" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="60%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#04060a"/>
    </radialGradient>

    <!-- Beveled Shield Rim Gradient -->
    <linearGradient id="tessoRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="35%" stop-color="#3b82f6"/>
      <stop offset="70%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>

    <!-- Cyan Stream Gradient -->
    <linearGradient id="streamCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="50%" stop-color="#00f2fe"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Emerald Stream Gradient -->
    <linearGradient id="streamEmerald" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Cobalt Stream Gradient -->
    <linearGradient id="streamCobalt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Core 'T' Monogram Gradient -->
    <linearGradient id="coreTesso" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#e0f2fe"/>
      <stop offset="75%" stop-color="#00f2fe"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>

    <!-- Intense Holographic Glow Filter -->
    <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 1. Sleek Cyber Squircle Foundation -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#tessoBg)" stroke="url(#tessoRim)" stroke-width="6"/>
  <rect x="36" y="36" width="440" height="440" rx="96" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>

  <!-- 2. Ambient Energy Conduits -->
  <g opacity="0.4">
    <!-- Stream 1 (Wi-Fi 5GHz: Cyan) -->
    <path d="M 96 160 Q 200 130 256 160" fill="none" stroke="url(#streamCyan)" stroke-width="4" stroke-linecap="round"/>
    <!-- Stream 2 (5G Tether: Emerald) -->
    <path d="M 256 160 Q 312 190 416 160" fill="none" stroke="url(#streamEmerald)" stroke-width="4" stroke-linecap="round"/>
    <!-- Stream 3 (Ethernet: Cobalt) -->
    <path d="M 256 360 Q 256 420 256 440" fill="none" stroke="url(#streamCobalt)" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- 3. THE TESSO MONOLITHIC 'T' WEAVE NEXUS -->
  <g filter="url(#coreGlow)">
    <!-- Horizontal Crossbar: Parallel Layer 1 (Left Wing - Cyan) -->
    <polygon points="108,136 248,136 232,188 128,188" fill="url(#streamCyan)"/>
    <line x1="108" y1="136" x2="248" y2="136" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

    <!-- Horizontal Crossbar: Parallel Layer 2 (Right Wing - Cobalt) -->
    <polygon points="264,136 404,136 384,188 280,188" fill="url(#streamCobalt)"/>
    <line x1="264" y1="136" x2="404" y2="136" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

    <!-- Central Diamond Apex (Fusion Core) -->
    <polygon points="256,110 292,152 256,194 220,152" fill="url(#coreTesso)"/>
    <!-- Apex Spark -->
    <polygon points="256,122 280,152 256,182 232,152" fill="#ffffff"/>

    <!-- Vertical Stem: The High-Throughput Pipeline (Woven Chevron Columns) -->
    <!-- Segment A (Top Stem) -->
    <polygon points="234,204 278,204 290,270 222,270" fill="url(#streamCyan)"/>
    <!-- Segment B (Middle Stem - High Energy Emerald) -->
    <polygon points="220,280 292,280 300,344 212,344" fill="url(#streamEmerald)"/>
    <!-- Segment C (Root Anchor - Deep Cobalt) -->
    <polygon points="210,354 302,354 284,410 228,410" fill="url(#streamCobalt)"/>
  </g>

  <!-- 4. Precision Micro-Nodes (Adapter Ingress Ports) -->
  <circle cx="108" cy="136" r="7" fill="#00f2fe" stroke="#ffffff" stroke-width="2.5"/>
  <circle cx="404" cy="136" r="7" fill="#60a5fa" stroke="#ffffff" stroke-width="2.5"/>
  <circle cx="256" cy="410" r="7" fill="#34d399" stroke="#ffffff" stroke-width="2.5"/>
  <circle cx="256" cy="110" r="6" fill="#ffffff" stroke="#00f2fe" stroke-width="2"/>
</svg>
`

// Monochromatic / Greyscale variant for inactive or off states
const svgOffContent = svgContent
  .replace(/#00f2fe/gi, '#64748b')
  .replace(/#67e8f9/gi, '#94a3b8')
  .replace(/#0284c7/gi, '#334155')
  .replace(/#6ee7b7/gi, '#64748b')
  .replace(/#10b981/gi, '#475569')
  .replace(/#047857/gi, '#334155')
  .replace(/#34d399/gi, '#64748b')
  .replace(/#93c5fd/gi, '#94a3b8')
  .replace(/#3b82f6/gi, '#475569')
  .replace(/#1d4ed8/gi, '#1e293b')
  .replace(/#60a5fa/gi, '#64748b')
  .replace(/#06b6d4/gi, '#475569')

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

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)])
}

async function run() {
  console.log('[Tesso] Generating bespoke Tesso Nexus Parallel Weave icon suite...')

  const icon512 = await sharp(Buffer.from(svgContent)).resize(512, 512).png().toBuffer()

  // 1. build/icon.png
  fs.writeFileSync('build/icon.png', icon512)
  console.log('✓ Created build/icon.png (512x512)')

  // 2. resources/icon-dark.png (THE WINDOW & TASKBAR ICON)
  fs.writeFileSync('resources/icon-dark.png', icon512)
  console.log('✓ Created resources/icon-dark.png (512x512)')

  // 3. resources/icon.png
  if (fs.existsSync('resources/icon.png')) {
    fs.writeFileSync('resources/icon.png', icon512)
    console.log('✓ Created resources/icon.png (512x512)')
  }

  // 4. build/icon.ico (Windows taskbar multi-size ICO: 256, 128, 64, 48, 32, 16)
  const icoSizes = [256, 128, 64, 48, 32, 16]
  const icoPngs = []
  for (const size of icoSizes) {
    const buf = await sharp(Buffer.from(svgContent)).resize(size, size).png().toBuffer()
    icoPngs.push({ size, buffer: buf })
  }
  const icoBuffer = buildIco(icoPngs)
  fs.writeFileSync('build/icon.ico', icoBuffer)
  console.log('✓ Created build/icon.ico (multi-resolution Windows ICO)')

  // 5. Browser Extension Icons
  const extSizes = [128, 48, 32, 16]
  for (const size of extSizes) {
    const buf = await sharp(Buffer.from(svgContent)).resize(size, size).png().toBuffer()
    fs.writeFileSync(`extension/icons/icon-${size}.png`, buf)
    console.log(`✓ Created extension/icons/icon-${size}.png`)
  }

  // 6. Browser Extension Inactive Icons
  for (const size of [32, 16]) {
    const buf = await sharp(Buffer.from(svgOffContent)).resize(size, size).png().toBuffer()
    fs.writeFileSync(`extension/icons/icon-off-${size}.png`, buf)
    console.log(`✓ Created extension/icons/icon-off-${size}.png`)
  }

  console.log('[Tesso] High-resolution icon suite generated successfully!')
}

run().catch((err) => {
  console.error('Failed to generate icons:', err)
  process.exit(1)
})
