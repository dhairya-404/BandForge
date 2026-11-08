# Tasks

> The **main agent** creates and assigns tasks. An assigned agent may update only the **Status** and **Notes** of its own tasks.
> Agents must check this file every time they come online.
> Created: 2026-11-08

## Format

```markdown
## T-000: <short title>

- **Assigned to:** <agent name>
- **Assigned by / date:** <main agent> on YYYY-MM-DD
- **Priority:** high / medium / low
- **Repeats:** once / daily / weekly
- **Files / area:** <paths this agent may change for this task>
- **Branch:** <branch name>
- **Status:** TODO | IN PROGRESS | BLOCKED (Q-xxx) | REVIEW | DONE
- **Done when:** <clear finish condition>
- **Notes:** <agent's updates, newest first>
```

## Active tasks

## T-005: Remote Repository Setup & GitHub Push

- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `git`, remote `origin`
- **Branch:** `chore/bondforge-init`
- **Status:** DONE
- **Done when:** Project is rebranded to BondForge and pushed to `https://github.com/dhairya-404/BandForge`.
- **Notes:** Full rebranding, Studio UI, system architecture in README, and browser blank screen fixed.
- **Notes:** Configured remote origin and preparing push.

## T-004: Multi-Network Engine Scaling & Dynamic RTT Hedging

- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `src/main/download/`, `src/main/network/`
- **Branch:** `chore/bondforge-init`
- **Status:** TODO
- **Done when:** Dynamic adaptive chunk scheduling with RTT latency weighting and transparent local proxy mode are implemented for global scaling.
- **Notes:** Scaling blueprint documented in `BANDFORGE_UI_AND_SCALING_BLUEPRINT.md`.

## Done

## T-003: Complete BondForge UI Redesign & Studio Architecture

- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `src/renderer/`, `src/renderer/src/screens/`, `src/renderer/src/components/`, `src/renderer/src/assets/main.css`
- **Branch:** `chore/bondforge-init`
- **Status:** DONE
- **Done when:** All legacy Plexo UI elements completely replaced with 100% original BondForge Studio UI (Sidebar, Forge Dashboard, Hardware Bonding Deck, Transfers Queue, New Transfer Modal).
- **Notes:** Implemented, verified with `npm run typecheck:web` (exit 0) and `electron-vite build` (exit 0). Bundle size reduced from 1.7 MB to 770 kB.

## T-001: Workspace Initialization & Brand Transformation to BondForge

- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `package.json`, `README.md`, `src/`, `build/`, `electron-builder.yml`
- **Branch:** `chore/bondforge-init`
- **Status:** DONE
- **Done when:** Package and project references renamed to BondForge, devflow files in place, git repository setup with `main`, `staging`, and `chore/bondforge-init`.
- **Notes:** Completed. Initial commit created, devflow files populated, and Git branch structure active.

## T-002: Dependency Installation & Dev Environment Verification

- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `node_modules/`, `package.json`
- **Branch:** `chore/bandforge-init`
- **Status:** DONE
- **Done when:** `npm install` runs cleanly, electron/electron-vite packages configured, typechecks pass.
- **Notes:** Completed. Electron binary verified, typechecks (`web` and `node`) passed with 0 errors, full `electron-vite build` output generated in `out/`.
