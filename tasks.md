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

## T-003: UI & Branding Polish for BandForge
- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** medium
- **Repeats:** once
- **Files / area:** `src/renderer/`, `build/`
- **Branch:** `chore/bandforge-init`
- **Status:** TODO
- **Done when:** All UI references, dialogs, titles, and headers reflect BandForge branding.
- **Notes:** Ready to execute after build verification.

## Done

## T-001: Workspace Initialization & Brand Transformation to BandForge
- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `package.json`, `README.md`, `src/`, `build/`, `electron-builder.yml`
- **Branch:** `chore/bandforge-init`
- **Status:** DONE
- **Done when:** Package and project references renamed to BandForge, devflow files in place, git repository setup with `main`, `staging`, and `chore/bandforge-init`.
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
