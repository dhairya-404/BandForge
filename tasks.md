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

## T-001: Workspace Initialization & Brand Transformation to BandForge
- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `package.json`, `README.md`, `src/`, `build/`, `electron-builder.yml`
- **Branch:** `chore/bandforge-init`
- **Status:** IN PROGRESS
- **Done when:** Package and project references renamed to BandForge, devflow files in place, git repository setup with `main`, `staging`, and `chore/bandforge-init`.
- **Notes:** Workspace files created; git initialized; preparing initial commit.

## T-002: Dependency Installation & Dev Environment Verification
- **Assigned to:** `main-agent`
- **Assigned by / date:** Dhairya on 2026-11-08
- **Priority:** high
- **Repeats:** once
- **Files / area:** `node_modules/`, `package.json`
- **Branch:** `chore/bandforge-init`
- **Status:** TODO
- **Done when:** `npm install` runs cleanly, electron/electron-vite packages configured, typechecks pass.
- **Notes:** Pending completion of T-001.

## Done
<!-- Move finished tasks here. -->
