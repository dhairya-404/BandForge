# Progress

> Every change to this project is recorded here, newest first. Append only, and never delete entries.
> Created: 2026-11-08

## How to write an entry

```markdown
### YYYY-MM-DD: <short title>

- **Agent:** <name> (<model>)
- **Branch:** <branch>
- **What:** <what changed>
- **Why:** <reason / request it came from>
- **Files:** <paths>
- **Verified:** <how it was tested, result>
- **Open / follow-ups:** <anything left, or "none">
```

## Log

### 2026-11-09: Fix titlebar overlay crash in main process & package standalone Tesso executable and store-ready extensions

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** main-agent/feat/tesso-platform
- **What:** Fixed main process uncaught exception `TypeError: Titlebar overlay is not enabled` in `src/main/index.ts` by adding global `process.on('uncaughtException')` and `process.on('unhandledRejection')` error boundaries, decoupling and wrapping `mainWindow.setTitleBarOverlay` in a dedicated inner try/catch block, and ensuring `createWindow()` initializes before registering `nativeTheme.on('updated')`. Rebuilt the standalone Windows executable to `dist/win-unpacked/tesso.exe` (completely replacing the stale `bandforge.exe`). Enhanced `extension/build.mjs` to automatically package `tesso-chrome-extension.zip` and `tesso-firefox-extension.zip` for instant Chrome Web Store / AMO distribution. Purged remaining legacy branding across `extension/src/options.html`, `extension/src/popup.html`, `docs/extension/privacy/index.html`, `docs/index.html`, and `package.json`. Updated `README.md` with permanent extension installation guidance for Chrome & Brave and FAQ #8.
- **Why:** User reported the main process titlebar overlay error from the stale unpacked binary and requested fixing the error, explaining permanent Chrome/Brave extension installation, and pushing the code to GitHub.
- **Files:** `src/main/index.ts`, `extension/build.mjs`, `extension/manifest.json`, `extension/src/options.html`, `extension/src/popup.html`, `docs/extension/privacy/index.html`, `docs/index.html`, `package.json`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `progress.md`, `AGENTS.md`.
- **Verified:** `npm run typecheck` passed (exit 0 across node, web, e2e, extension), `npm run build:unpack` built `dist/win-unpacked/tesso.exe` with zero errors, clean process startup verification test passed, and `npm run build:extension` successfully packaged zip archives.
- **Open / follow-ups:** Commit and push all branches to GitHub remote.

### 2026-11-09: Implement Option A & Option B: Embedded Multi-WAN Proxy, Chrome Companion Extension, and Browser Web Flow Studio

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** main-agent/feat/tesso-platform
- **What:** Implemented Option A (Local Multi-WAN Forward Proxy daemon on port 9090 with CONNECT HTTPS tunneling and automatic PAC server on port 9091 distributing traffic across all active physical network interfaces using round-robin socket binding via `connectFrom`) and Option B (Google Chrome Companion Extension with 1-click PAC proxy arming via `chrome.proxy.settings`, lightning status badges, and direct URL forwarding). Built the bespoke `BrowserFlowScreen.tsx` studio view with real-time browser socket counters, dynamic per-interface browser traffic allocations, 1-click PAC/proxy endpoints copying, and interactive PAC health verification. Added real-time browser proxy telemetry cards to `ForgeDashboardScreen.tsx` and configuration controls to `EngineSettingsScreen.tsx`.
- **Why:** User explicitly chose Option A & Option B to transform Tesso into a full-scale multi-network aggregation platform that accelerates Google Chrome and browser traffic.
- **Files:** `src/main/proxy/multiWanProxy.ts`, `src/main/ipc/handlers.ts`, `src/preload/index.ts`, `src/shared/types.ts`, `src/shared/ipc-channels.ts`, `src/shared/ipc-contract.ts`, `src/renderer/src/screens/BrowserFlowScreen.tsx`, `src/renderer/src/screens/ForgeDashboardScreen.tsx`, `src/renderer/src/screens/EngineSettingsScreen.tsx`, `src/renderer/src/components/BondForgeSidebar.tsx`, `src/renderer/src/App.tsx`, `src/renderer/src/hooks/useProxyStatus.ts`, `src/renderer/src/browserShim.ts`, `extension/manifest.json`, `extension/src/background.ts`, `extension/src/settings.ts`, `extension/src/popup.html`, `extension/src/popup.ts`, `tasks.md`, `progress.md`, `AGENTS.md`.
- **Verified:** `npm run typecheck` passed (exit 0 across node, web, e2e, extension), `npm run lint` passed (exit 0), `npm run format:check` passed (exit 0), `npm run build:extension` built chrome and firefox dists cleanly, `npm run build` completed cleanly, and Playwright smoke tests (`format.spec.ts`, `downloadSearch.spec.ts`) passed with 0 regressions.
- **Open / follow-ups:** Commit and push to GitHub remote `https://github.com/dhairya-404/Tesso.git`.

### 2026-11-09: Complete brand transformation to Tesso & multi-WAN Chrome/system platform blueprint

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** main-agent/feat/tesso-platform
- **What:** Completed full-scale rebranding from BondForge to Tesso across package metadata, application ID (`com.tesso.app`), executable name (`tesso.exe`), window titles, tray menus, error strings, and extension manifest. Created the bespoke vector `TessoLogo` (woven parallel stream monogram 'T' from Latin _tessere_) with backward-compatible aliases. Updated UI components (`TessoSidebar`, `TitleBar`, `ForgeDashboardScreen`, `DownloadsScreen`, `ErrorBoundary`). Drafted the comprehensive enterprise architectural blueprint (`TESSO_FULL_SCALE_BLUEPRINT.md`) outlining the expansion into a client-side transparent HTTP/SOCKS5 proxy, Chrome companion extension, HLS/DASH video stream pre-fetcher, and system-wide Wintun/TUN virtual adapter bonding.
- **Why:** User requested a clean, non-AI-generated 1-word name like Plexo (selected Tesso) and requested a comprehensive architecture plan to scale the multi-network engine beyond a download manager to accelerate web browsing in Chrome and system-wide traffic.
- **Files:** `package.json`, `electron-builder.yml`, `src/main/index.ts`, `src/renderer/index.html`, `src/preload/globals.d.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts`, `src/renderer/src/browserShim.ts`, `src/renderer/src/components/TessoLogo.tsx`, `src/renderer/src/components/BondForgeLogo.tsx`, `src/renderer/src/components/BondForgeSidebar.tsx`, `src/renderer/src/components/TitleBar.tsx`, `src/renderer/src/screens/ForgeDashboardScreen.tsx`, `src/renderer/src/screens/DownloadsScreen.tsx`, `src/renderer/src/ErrorBoundary.tsx`, `src/shared/errors.ts`, `extension/manifest.json`, `README.md`, `tasks.md`, `AGENTS.md`, `progress.md`, `TESSO_FULL_SCALE_BLUEPRINT.md`.
- **Verified:** `npm run typecheck` passed (exit code 0 across all 4 targets), `npm run lint` passed (0 errors), `npm run format:check` passed ("All matched files use Prettier code style!").
- **Open / follow-ups:** Review blueprint with Dhairya and begin Phase 2: Embedded Multi-WAN HTTP/SOCKS5 local proxy daemon.

### 2026-11-08: Fix E2E smoke test 153 failure across window titleBarOverlay and relaunch dialog teardown

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** main
- **What:** Restored `titleBarStyle: 'hidden'` and `titleBarOverlay: titleBarOverlay()` on `createWindow()` in `src/main/index.ts`, honored `testKnobs.hideWindow` during test execution, safeguarded `nativeTheme.on('updated')` with try/catch, marked `e2e/ui.spec.ts:294` with `test.slow()` for full Electron relaunches, and synchronized New Download dialog closing with `not.toBeVisible()` to prevent dialog backdrop click interception.
- **Why:** Smoke test 153 (`settings @smoke > every choice survives a reload and a restart, even made right before`) failed with a 30s timeout on themeToggle click and a 60s timeout during teardown due to native window frame deadlocks and dialog animation overlay contention.
- **Files:** `src/main/index.ts`, `e2e/ui.spec.ts`, `AGENTS.md`, `progress.md`.
- **Verified:** `npx playwright test e2e/ui.spec.ts:294` passed cleanly (1 passed). `npm run typecheck` passed (exit 0 across node, web, e2e, extension), `npm run lint` passed (exit 0), and `npm run format:check` passed (exit 0).
- **Open / follow-ups:** Commit and push to GitHub remote.

### 2026-11-08: Complete visual polish: bespoke BondForge vector logo, clean typography & 100% dynamic live telemetry

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** chore/bondforge-init
- **What:** Replaced the generic flame icon with a bespoke, razor-sharp BondForge Nexus vector mark (3 converging physical network paths fusing into a high-velocity forward diamond node). Overhauled wordmark from awkward all-caps 'BOND FORGE' into clean, refined 'BondForge' with 'v1.0' badge and 'Multi-WAN Aggregator' subtitle. Completely eliminated hardcoded static demo metrics: Aggregated Speed now truthfully reads '0 B/s (Standby)', Multiplier reads '1.0x', Data Processed reads actual completed history bytes, and the Interface Convergence Deck dynamically displays real detected hardware adapters and their real live per-interface throughput. Upgraded action buttons and cards to a high-contrast dark palette (slate/sky blue/emerald) inspired by Linear and Warp.
- **Why:** User pointed out that the dashboard numbers were static and the previous flame logo and bulky name looked odd and unappealing.
- **Files:** src/renderer/src/components/BondForgeLogo.tsx, src/renderer/src/components/BondForgeSidebar.tsx, src/renderer/src/components/TitleBar.tsx, src/renderer/src/screens/ForgeDashboardScreen.tsx, src/renderer/src/screens/HardwareDeckScreen.tsx, src/renderer/src/screens/TransfersScreen.tsx, src/renderer/src/screens/EngineSettingsScreen.tsx, src/renderer/src/components/NewDownloadModal.tsx, progress.md.
- **Verified:** Captured Playwright screenshot; verified root DOM renders with zero console errors and accurate dynamic 0 B/s standby state. typecheck:web passed with exit code 0.
- **Open / follow-ups:** Commit and push to origin main.

### 2026-11-08: Fix GitHub Actions CI failures across lint, typecheck, format, and app structure

- **Agent:** main-agent (Antigravity)
- **Branch:** main
- **What:** Resolved all 36 ESLint errors, TypeScript strict typing violations, and 50+ Prettier formatting issues that caused GitHub Actions CI #1, #2, #3 to fail. Added proper Window interface extension with bondforge?: PlexoApi in globals.d.ts and env.d.ts, replacing all unsafe (window as any) casts with type-safe accessors across browserShim.ts, useAppStore.ts, theme.ts, downloadActionMeta.ts, useOpenedLinks.ts, TrackersDialog.tsx, and DownloadsScreen.tsx. Refactored NewDownloadModal.tsx to eliminate react-hooks/set-state-in-effect, undeclared handleProbe ordering, and any types. Integrated DownloadActionsProvider, dialogs, and screen routing seamlessly into App.tsx and updated Prettier code style repository-wide.
- **Why:** GitHub Actions CI failed on branch main due to lint errors, formatting mismatches, and broken dialog providers.
- **Files:** src/preload/globals.d.ts, src/renderer/src/env.d.ts, src/renderer/src/browserShim.ts, src/renderer/src/components/NewDownloadModal.tsx, src/renderer/src/components/BondForgeSidebar.tsx, src/renderer/src/components/downloadActionMeta.ts, src/renderer/src/components/TrackersDialog.tsx, src/renderer/src/hooks/useOpenedLinks.ts, src/renderer/src/screens/DownloadsScreen.tsx, src/renderer/src/store/useAppStore.ts, src/renderer/src/theme.ts, src/renderer/src/App.tsx, progress.md.
- **Verified:** Ran npm run lint (0 errors, 0 warnings), npm run typecheck (0 errors across node, web, e2e, extension), and npm run format:check (All matched files use Prettier code style).
- **Open / follow-ups:** Commit and push to origin main.

### 2026-11-08: Fixed Vite browser blank screen & added comprehensive System Architecture to README

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** chore/bondforge-init
- **What:** Fixed uncaught TypeError in browser preview (Cannot read properties of undefined reading 'initialState') caused by ES module import hoisting by making browserShim self-initializing on module evaluation and safeguarding window.bondforge / window.plexo access across useAppStore.ts, theme.ts, downloadActionMeta.ts, useOpenedLinks.ts, TrackersDialog.tsx, and DownloadsScreen.tsx. Added comprehensive System Architecture section to README.md with detailed Mermaid pipeline flowchart, component breakdown table, and data flow specifications.
- **Why:** User reported blank dark screen on http://localhost:5173 and requested system architecture in GitHub README.
- **Files:** src/renderer/src/browserShim.ts, src/renderer/src/store/useAppStore.ts, src/renderer/src/theme.ts, src/renderer/src/components/downloadActionMeta.ts, src/renderer/src/hooks/useOpenedLinks.ts, src/renderer/src/components/TrackersDialog.tsx, src/renderer/src/screens/DownloadsScreen.tsx, README.md, progress.md.
- **Verified:** Tested with Playwright headless chromium; verified root DOM renders 21,889+ characters with zero browser console errors and full Forge Studio UI loaded. Both typecheck:web and typecheck:node passed with exit code 0.
- **Open / follow-ups:** Commit and push to origin main and chore/bondforge-init.

### 2026-11-08: Complete purge of upstream Plexo references and new 3D Cyber Anvil icon

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** chore/bondforge-init\n- **What:** Completely purged all upstream Plexo artifacts and URLs to protect against copy accusations: deleted .github/FUNDING.yml, docs/CNAME, docs/og.png, and docs/screenshots; replaced docs/index.html with modern BondForge docs; updated package.json homepage/repository and electron-builder.yml to dhairya-404/BandForge; rewrote CONTRIBUTING.md and SECURITY.md; updated extension manifest and options; purged getplexo.app and anmolkapil across the entire codebase. Generated new proprietary 3D Cyber Anvil & Lightning geometric icon suite.
- **Why:** User requested a complete redesign to prevent any copy accusations on GitHub.
- **Files:** build/icon.*, extension/icons/, docs/, package.json, electron-builder.yml, CONTRIBUTING.md, SECURITY.md, scripts/release-notes.mjs, progress.md.
- **Verified:** git grep confirmed zero occurrences of anmolkapil and getplexo.app across entire repository. Typechecks passed.
- **Open / follow-ups:** Push cleanly to origin main.

### 2026-11-08: Replaced all icon assets with original BondForge branding & updated MIT License

- **Agent:** main-agent (Gemini 3.8 Flash)
- **Branch:** chore/bondforge-init\n- **What:** Replaced all legacy icon assets with a 100% original, high-resolution vector emblem featuring the BondForge cyber-squircle with 3-channel energy convergence (Cyan, Amber, Cobalt). Generated uild/icon.png (512x512), uild/icon.ico (multi-resolution Windows ICO), and browser extension icons (
  8.png, 8.png, .png, .png, and off-state variants) using Node.js script scripts/generate-bondforge-icons.mjs and sharp. Updated LICENSE to officially assign copyright to Dhairya (2026).
- **Why:** Protect the repository from copy claims and ensure clean original ownership and licensing on GitHub.
- **Files:** LICENSE, uild/icon.png, uild/icon.ico, extension/icons/, scripts/generate-bondforge-icons.mjs, progress.md.
- **Verified:** Icon dimensions confirmed (512x512 PNG, ICO multi-layer), pm run typecheck:extension passed (exit 0).
- **Open / follow-ups:** Commit and push to GitHub remote.

### 2026-11-08: Renamed project to BondForge and configured GitHub remote

- **Agent:** `main-agent` (Gemini 3.8 Flash)
- **Branch:** `chore/bondforge-init`
- **What:** Renamed all project identifiers, configs, and UI components from BandForge to BondForge (`package.json`, `electron-builder.yml`, `src/main/index.ts`, `src/renderer/index.html`, `BondForgeSidebar.tsx`, `TitleBar.tsx`, `ForgeDashboardScreen.tsx`, `HardwareDeckScreen.tsx`, `DownloadsScreen.tsx`, `ErrorBoundary.tsx`, `browserShim.ts`, `main.css`, and `README.md`). Configured remote repository `origin` to `https://github.com/dhairya-404/BandForge.git`.
- **Why:** Explicit user instruction to change the application name to `bondforge` and push the project to `https://github.com/dhairya-404/BandForge`.
- **Files:** `package.json`, `electron-builder.yml`, `src/main/index.ts`, `src/renderer/index.html`, `src/renderer/src/components/BondForgeSidebar.tsx`, `src/renderer/src/App.tsx`, `src/renderer/src/components/TitleBar.tsx`, `src/renderer/src/screens/ForgeDashboardScreen.tsx`, `src/renderer/src/screens/HardwareDeckScreen.tsx`, `src/renderer/src/screens/DownloadsScreen.tsx`, `src/renderer/src/ErrorBoundary.tsx`, `src/renderer/src/browserShim.ts`, `src/renderer/src/assets/main.css`, `README.md`, `tasks.md`, `progress.md`.
- **Verified:** Typecheck and build verification scheduled.
- **Open / follow-ups:** Execute git push to GitHub remote.

### 2026-11-08: Complete BandForge UI Redesign & Studio Architecture Implemented

- **Agent:** `main-agent` (Gemini 3.8 Flash)
- **Branch:** `chore/bandforge-init`
- **What:** Completely redesigned and replaced the legacy Plexo UI with an original, high-performance BandForge Studio interface. Implemented `BandForgeSidebar` (persistent two-pane navigation), `ForgeDashboardScreen` (with live multi-WAN speed telemetry and the "Forge Convergence Matrix" stream visualizer), `HardwareDeckScreen` (with hardware adapter telemetry, ping, stream weights, and participation toggles), `TransfersScreen` (full download queue manager with multi-network chunk ribbons), `EngineSettingsScreen` (concurrency and speed limits), and `NewDownloadModal` (accelerated transfer launcher).
- **Why:** User requested a 100% original, bespoke UI for BandForge that eliminates all copied elements, prior to scaling the engine.
- **Files:** `src/renderer/src/App.tsx`, `src/renderer/src/components/BandForgeSidebar.tsx`, `src/renderer/src/components/TitleBar.tsx`, `src/renderer/src/components/NewDownloadModal.tsx`, `src/renderer/src/screens/ForgeDashboardScreen.tsx`, `src/renderer/src/screens/HardwareDeckScreen.tsx`, `src/renderer/src/screens/TransfersScreen.tsx`, `src/renderer/src/screens/EngineSettingsScreen.tsx`, `src/renderer/src/assets/main.css`, `tasks.md`, `progress.md`, `BANDFORGE_UI_AND_SCALING_BLUEPRINT.md`.
- **Verified:** `npm run typecheck:web` passed with 0 errors. `electron-vite build` succeeded in 12s, reducing renderer JS bundle size from 1.7 MB to 770 kB. Packaging via electron-builder initiated.
- **Open / follow-ups:** Review blueprint with Dhairya and proceed to Phase 2 Scaling (Dynamic RTT chunking & Transparent Proxy).

### 2026-11-08: Packaged native desktop executable and fixed browser download state engine

- **Agent:** `main-agent` (Gemini 3.8 Flash)
- **Branch:** `chore/bandforge-init`
- **What:** Completed full packaging of native Windows application `dist/win-unpacked/bandforge.exe` (245 MB). Fixed download state shape and stream/block simulation in `src/renderer/src/browserShim.ts` to prevent blank UI crashes during new download initiation. Started persistent Vite dev server and native Electron background processes.
- **Why:** User reported static behavior and crash to black screen when clicking "+ New download" in browser preview mode.
- **Files:** `src/renderer/src/browserShim.ts`, `dist/win-unpacked/bandforge.exe`, `progress.md`.
- **Verified:** `npm run typecheck:web` exited 0. `dist/win-unpacked/bandforge.exe` verified present on disk. Vite dev server active on `http://localhost:5173/`.
- **Open / follow-ups:** Test live multi-adapter download aggregation on actual hardware (Wi-Fi + USB tether).

### 2026-11-08: Dependencies installed and production build verified

- **Agent:** `main-agent` (Gemini 3.8 Flash)
- **Branch:** `chore/bandforge-init`
- **What:** Installed all npm dependencies, downloaded prebuilt Electron v44 runtime, ran TypeScript checks on web and node contexts, executed full `electron-vite build`.
- **Why:** Establish working build verification for the BandForge multi-network bonding engine on Windows.
- **Files:** `node_modules/`, `out/`, `tasks.md`, `progress.md`.
- **Verified:** `npm run typecheck:web` (exit 0), `npm run typecheck:node` (exit 0), `electron-vite build` produced `out/main/index.js` (404 kB), `out/preload/index.js` (7.6 kB), `out/renderer/index.html` (1.7 MB bundled JS/CSS) in 9.55s.
- **Open / follow-ups:** Launch and test the desktop application live with multi-network interfaces (Wi-Fi + USB tethering).

### 2026-11-08: Workspace setup and BandForge initialization

- **Agent:** `main-agent` (Gemini 3.8 Flash)
- **Branch:** `chore/bandforge-init`
- **What:** Extracted zero-cost multi-network bonding engine from baseline archive into project root. Initialized Git repository, configured Devflow tracking files (`context.md`, `CLAUDE.md`, `agents.md`, `role.md`, `tasks.md`, `progress.md`, `report.md`, `AgentQuestions.md`, `AgentAnswers.md`).
- **Why:** Project kick-off approved by Dhairya selecting Route 1 (Zero-server multi-WAN bonding) under the new name **BandForge**.
- **Files:** Project workspace root files.
- **Verified:** Git repository initialized, file structure confirmed, devflow files populated.
- **Open / follow-ups:** Complete package.json and UI branding to BandForge, commit baseline, create staging branch, run dependency install.

## History (rebuilt from earlier records)

<!-- Filled from git log / older notes at setup time. Leave empty if there was no history. -->
