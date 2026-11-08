# Project Context

> Full context of this project. Kept up to date by the main agent. Anything not known yet is marked `UNKNOWN: ask user`.
> Created: 2026-11-08

## 1. What this project is
- **Name:** BandForge
- **Purpose / problem it solves:** High-performance multi-network bonding & download acceleration engine. Combines multiple internet connections (Wi-Fi, Ethernet, USB 4G/5G mobile tethering, secondary dongles) simultaneously to accelerate downloads without requiring expensive remote VPS servers or VPN drivers.
- **Who uses it:** Dhairya & power users looking to combine multiple internet connections for maximum download speed with zero server infrastructure costs.
- **Client / owner:** Dhairya

## 2. Tech stack
- **Desktop Runtime:** Electron 44+ / Node.js 26+ / electron-vite
- **Frontend UI:** React 19, TypeScript, Tailwind CSS v4, Lucide icons, Zustand, Base UI
- **Networking Core:** Custom per-interface socket binding (`koffi` C FFI for Linux `SO_BINDTODEVICE`, native source routing on Windows/macOS), parallel HTTP range chunker with dynamic work-stealing, WebTorrent multi-route engine, Telegram media downloader, NZB/Usenet engine
- **Storage & State:** `fs-chunk-store`, sparse file allocation, JSON history/settings
- **Browser Integration:** Chrome / Firefox extension for native browser download handoff over `127.0.0.1`

## 3. Architecture
- `src/main/`: Core desktop daemons:
  - `network/interfaces.ts`: Real-time polling & detection of network interfaces (Wi-Fi, Ethernet, USB tethering via PowerShell on Windows, udev/sysfs on Linux, `networksetup` on macOS).
  - `network/deviceBinding.ts`: Low-level socket binding to interface IPs/devices.
  - `download/chunkDownloader.ts`: Multi-stream HTTP `Range: bytes` chunk manager.
  - `download/scheduler.ts`: Dynamic work-stealing and chunk-racing scheduler.
  - `download/torrent/`: WebTorrent integration with per-network peer socket routing.
  - `ipc/handlers.ts`: Secure Electron IPC communication.
- `src/preload/`: Context bridge exposing type-safe APIs to renderer.
- `src/renderer/`: React dashboard featuring real-time bandwidth meters, network cards, block progress visualizer, download scheduler, and speed caps.
- `extension/`: Chrome and Firefox extensions for browser integration.

## 4. Folder map
- `build/`: Icons, installer scripts (`installer.nsh`), macOS entitlements.
- `docs/`: Product documentation and changelog.
- `extension/`: Browser extension source code.
- `src/main/`: Electron main process & networking engine.
- `src/preload/`: Preload scripts and bridge definitions.
- `src/renderer/`: React dashboard and UI components.
- `patches/`: Dependency patches applied via `patch-package`.

## 5. How to run, build, test
- **Install:** `npm install`
- **Run locally:** `npm run dev`
- **Build Windows Executable:** `npm run build:win`
- **Build Unpacked:** `npm run build:unpack`
- **Typecheck:** `npm run typecheck`
- **Lint / format:** `npm run lint` / `npm run format`
- **E2E Tests:** `npm run test:e2e`

## 6. Environments & branches
| Environment | Branch | URL | Set up properly? |
|---|---|---|---|
| Local | feature / chore branches | `localhost` | Yes |
| Staging | `staging` | Local git tracking | Yes |
| Production | `main` | Local git tracking | Yes |

## 7. Environment variables (names only, never values)
| Name | Used for | Where set |
|---|---|---|
| None currently required | Operates fully local with zero cloud auth | N/A |

## 8. Conventions
- ESLint + Prettier for formatting.
- Strict TypeScript (`tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json`).
- Commit messages: `<type>(<scope>): <summary>` (e.g. `feat(branding): rename engine to BandForge`).
- Log every change in `progress.md`.

## 9. Known issues / risks
- Servers that do not support HTTP Range requests (`Accept-Ranges: bytes`) fall back to a single network connection.
- Windows requires proper adapter classification (handled via PowerShell `Get-NetAdapter`).

## 10. Glossary
- **BandForge:** The multi-network bonding & download acceleration engine.
- **Socket Binding:** Pinning an outbound TCP socket to a specific local IP address / network interface.
- **Chunk Racing:** Dynamically launching duplicate requests for lagging tail-end chunks across faster links to prevent Head-of-Line blocking.

## 11. Open questions for the user
- None currently.
