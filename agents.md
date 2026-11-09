# Agents

> Owned by the **main agent**. Child agents may only edit **their own row** in the Registry and **add lines** to the Log.
> Created: 2026-11-08

## Rules for every agent

1. **Introduce yourself** when you come online: agent name, exact model, session type (main/child). Add or update your Registry row and add a Log line.
2. **Read before working:** `CLAUDE.md`, `context.md`, latest `progress.md` entries, your entry in `role.md`, your tasks in `tasks.md`, and answers for you in `AgentAnswers.md`.
3. **Check `tasks.md`** for changes every time you come online.
4. **Stay inside your role.** Only touch the files and actions your permissions in `role.md` allow.
5. **Own branch only.** Name it `<agent-name>/<type>/<short-name>`. Never commit, push or merge to `main` / `staging`.
6. **Never guess.** Put doubts in `AgentQuestions.md`. You may ask as many questions as you need.
7. **The main agent answers every question** whenever it is online, in `AgentAnswers.md`.
8. **Log every change** in `progress.md`.
9. **Clean up** temporary files and test data after use.
10. **Report problems.** If an agent misbehaves or something goes wrong, write it in `report.md` with evidence. The main agent decides what happens.
11. **Before going offline:** update your task statuses, set your Registry status to `offline`, and add a Log line.
12. **Shared files:** re-read a file right before editing it and append instead of rewriting, because other agents may be editing too.

## Registry

| Agent name   | Model            | Type | Role                   | Status | Branch                           | Last seen  |
| ------------ | ---------------- | ---- | ---------------------- | ------ | -------------------------------- | ---------- |
| `main-agent` | Gemini 3.8 Flash | main | Lead Systems Architect | active | `main-agent/feat/tesso-platform` | 2026-11-09 |

## Log

- 2026-11-08 10:25: `main-agent`: Initialized BondForge workspace, extracted baseline engine, configured devflow files.
- 2026-11-08 19:10: `main-agent`: Renamed project to BondForge, implemented bespoke Studio UI, configured GitHub remote.
- 2026-11-08 20:00: `main-agent`: Fixed browser blank screen issue & documented full system architecture with Mermaid in README.
- 2026-11-08 20:45: `main-agent`: Replaced flame icon with bespoke BondForge Nexus mark, refined typography, and purged static mock values for 100% dynamic telemetry.
- 2026-11-08 21:38: `main-agent`: Fixed test 153 e2e/ui.spec.ts timeout by restoring hidden titleBarOverlay configuration and dialog exit animation synchronization.
- 2026-11-09 09:58: `main-agent`: Initialized brand transformation to Tesso and started architecture design for full-scale system-wide/Chrome multi-WAN acceleration engine.
- 2026-11-09 10:48: `main-agent`: Implemented Option A & Option B: Embedded Multi-WAN forward proxy & PAC server, Chrome Companion Extension, and Browser Web Flow Studio UI.
- 2026-11-09 14:10: `main-agent`: Fixed main process titleBarOverlay uncaught exception, rebuilt dist/win-unpacked/tesso.exe, packaged chrome & firefox extension zips, and documented permanent extension deployment.
- 2026-11-09 14:28: `main-agent`: Uploaded and committed releases/tesso.crx and releases/tesso-chrome-extension.zip with drag-and-drop distribution guide to GitHub.
- 2026-11-09 15:04: `main-agent`: Fixed GitHub Actions CI #17 formatting failure with .gitattributes LF normalization and auto endOfLine.
- 2026-11-09 15:20: `main-agent`: Fixed ERR_TUNNEL_CONNECTION_FAILED in Multi-WAN proxy with socket address family matching, ordered multi-adapter failover, and dynamic interface hotplugging.
- 2026-11-09 15:12: `main-agent`: Added explicit HTML anchor tags to README.md headings to fix GitHub in-page anchor jumping.
- 2026-11-09 15:23: `main-agent`: Fixed Mermaid architecture diagram syntax in README.md to restore rich display rendering on GitHub.
- 2026-11-09 15:30: `main-agent`: Beginning execution of complete inside-out UI/UX overhaul: Tesso Cyber Studio design tokens, TessoNavigationDeck, TessoTitleBar, PipelineStudioScreen, PipelineInspectorDrawer, and NewPipelineModal.
- 2026-11-09 15:33: `main-agent`: Replaced remaining legacy 'Plexo' brand references across TelegramDialog, FixLinkDialog, LimitsDialog, NewDownloadDialog, UpdateIndicator, UsenetServerDialog, DownloadingScreen, and backend error strings with Tesso.
- 2026-11-09 15:58: `main-agent`: Built Windows NSIS setup installer (dist/tesso-1.0.0-setup.exe) and prepared official v1.0.0 GitHub release with companion extensions.
- 2026-11-09 16:20: `main-agent`: Executed full inside-out UI/UX overhaul: purged dark mode Plexo tokens, modernized StatusBar into obsidian telemetry deck, decoupled detail routing in App.tsx with permanent deck visibility, and verified native builds.
- 2026-11-09 18:05: `main-agent`: Implemented comprehensive dual-theme system (Obsidian Cyber Dark & Studio Titanium Light) with 1-click switcher, resolved Proxy PAC verification error with auto-ignition, enhanced NSIS installer with high-res BMP assets and smooth DPI-aware animation, and verified all typechecks and Playwright tests.
