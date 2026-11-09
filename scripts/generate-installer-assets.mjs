import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

function encodeBmp24(width, height, rawRgbBuffer) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4
  const pixelDataSize = rowSize * height
  const fileSize = 54 + pixelDataSize
  const buf = Buffer.alloc(fileSize)

  // File header (14 bytes)
  buf.write('BM', 0)
  buf.writeUInt32LE(fileSize, 2)
  buf.writeUInt32LE(0, 6)
  buf.writeUInt32LE(54, 10)

  // Info header (40 bytes)
  buf.writeUInt32LE(40, 14)
  buf.writeInt32LE(width, 18)
  buf.writeInt32LE(height, 22) // positive = bottom-to-top
  buf.writeUInt16LE(1, 26)
  buf.writeUInt16LE(24, 28) // 24-bit RGB
  buf.writeUInt32LE(0, 30) // BI_RGB (uncompressed)
  buf.writeUInt32LE(pixelDataSize, 34)
  buf.writeInt32LE(2835, 38) // 72 DPI
  buf.writeInt32LE(2835, 42)
  buf.writeUInt32LE(0, 46)
  buf.writeUInt32LE(0, 50)

  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y // flip vertically
    const rowOffset = 54 + y * rowSize
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 3
      const r = rawRgbBuffer[srcIdx]
      const g = rawRgbBuffer[srcIdx + 1]
      const b = rawRgbBuffer[srcIdx + 2]
      buf[rowOffset + x * 3] = b // BMP is BGR
      buf[rowOffset + x * 3 + 1] = g
      buf[rowOffset + x * 3 + 2] = r
    }
  }
  return buf
}

async function generateInstallerAssets() {
  const buildDir = path.resolve(process.cwd(), 'build')
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true })
  }

  // 1. Generate Sidebar BMP (164 x 314 standard NSIS MUI2 sidebar)
  const sidebarWidth = 164
  const sidebarHeight = 314

  const sidebarSvg = `
  <svg width="${sidebarWidth}" height="${sidebarHeight}" viewBox="0 0 ${sidebarWidth} ${sidebarHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#08090C" />
        <stop offset="40%" stop-color="#0F131D" />
        <stop offset="100%" stop-color="#07090E" />
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22D3EE" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#08090C" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${sidebarWidth}" height="${sidebarHeight}" fill="url(#bgGrad)" />

    <!-- Ambient glow ellipse -->
    <ellipse cx="82" cy="110" rx="70" ry="70" fill="url(#glowGrad)" />

    <!-- Cyber Circuit lines -->
    <path d="M 10 30 L 50 30 L 70 50 L 154 50" stroke="#1E293B" stroke-width="1" fill="none" opacity="0.6" />
    <path d="M 154 280 L 110 280 L 90 260 L 10 260" stroke="#1E293B" stroke-width="1" fill="none" opacity="0.6" />
    <circle cx="10" cy="30" r="2" fill="#06B6D4" opacity="0.8" />
    <circle cx="154" cy="280" r="2" fill="#10B981" opacity="0.8" />

    <!-- Tesso Hexagon Nexus Logo Symbol -->
    <g transform="translate(82, 105)">
      <!-- Outer Hexagon ring -->
      <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="#0F172A" stroke="url(#cyanGrad)" stroke-width="2.5" />
      <!-- Inner geometric conduits -->
      <path d="M -18 -10 L 0 -22 L 18 -10 L 18 12 L 0 24 L -18 12 Z" fill="#0284C7" opacity="0.4" />
      <!-- Central Nexus Node -->
      <circle cx="0" cy="0" r="7" fill="#38BDF8" />
      <!-- Conduits radiating -->
      <line x1="0" y1="0" x2="0" y2="-42" stroke="#38BDF8" stroke-width="2" />
      <line x1="0" y1="0" x2="36" y2="21" stroke="#34D399" stroke-width="2" />
      <line x1="0" y1="0" x2="-36" y2="21" stroke="#818CF8" stroke-width="2" />
    </g>

    <!-- Typography -->
    <text x="82" y="180" font-family="Segoe UI, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">TESSO</text>
    <text x="82" y="200" font-family="Segoe UI, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#38BDF8" text-anchor="middle" letter-spacing="1.5">MULTI-NETWORK</text>
    <text x="82" y="214" font-family="Segoe UI, -apple-system, sans-serif" font-size="8.5" font-weight="400" fill="#94A3B8" text-anchor="middle" letter-spacing="0.5">BONDING ENGINE</text>

    <!-- Bottom subtle tag -->
    <rect x="25" y="240" width="114" height="18" rx="4" fill="#0F172A" stroke="#1E293B" stroke-width="0.8" />
    <text x="82" y="252.5" font-family="Consolas, monospace" font-size="7.5" font-weight="600" fill="#10B981" text-anchor="middle">CLIENT-SIDE 802.3AD</text>
  </svg>
  `

  const sidebarRgb = await sharp(Buffer.from(sidebarSvg))
    .flatten({ background: '#08090C' })
    .raw()
    .toBuffer()

  const sidebarBmp = encodeBmp24(sidebarWidth, sidebarHeight, sidebarRgb)
  fs.writeFileSync(path.join(buildDir, 'installerSidebar.bmp'), sidebarBmp)
  console.log('✓ Generated build/installerSidebar.bmp (164x314 24-bit BMP)')

  // 2. Generate Header BMP (150 x 57 standard NSIS MUI2 header)
  const headerWidth = 150
  const headerHeight = 57

  const headerSvg = `
  <svg width="${headerWidth}" height="${headerHeight}" viewBox="0 0 ${headerWidth} ${headerHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#08090C" />
        <stop offset="100%" stop-color="#0F141F" />
      </linearGradient>
    </defs>
    <rect width="${headerWidth}" height="${headerHeight}" fill="url(#hBg)" />

    <!-- Tesso Mini Monogram -->
    <g transform="translate(118, 28.5)">
      <polygon points="0,-18 15.5,-9 15.5,9 0,18 -15.5,9 -15.5,-9" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5" />
      <circle cx="0" cy="0" r="3" fill="#38BDF8" />
    </g>

    <text x="14" y="26" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" fill="#F8FAFC">Tesso Setup</text>
    <text x="14" y="40" font-family="Segoe UI, sans-serif" font-size="8.5" font-weight="400" fill="#94A3B8">Nexus High-Throughput Engine</text>
  </svg>
  `

  const headerRgb = await sharp(Buffer.from(headerSvg))
    .flatten({ background: '#08090C' })
    .raw()
    .toBuffer()

  const headerBmp = encodeBmp24(headerWidth, headerHeight, headerRgb)
  fs.writeFileSync(path.join(buildDir, 'installerHeader.bmp'), headerBmp)
  console.log('✓ Generated build/installerHeader.bmp (150x57 24-bit BMP)')
}

generateInstallerAssets().catch((err) => {
  console.error('Failed generating installer assets:', err)
  process.exit(1)
})
