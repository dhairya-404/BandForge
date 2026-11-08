# Roles

> Edited by the **main agent only**. Every role must list its permissions.
> An agent without a row here may only read files and ask questions.
> Created: 2026-11-08

## Default permissions (apply to everyone unless a row says otherwise)
- **Allowed:** read any project file, create its own branch, edit files listed in its role, run local tests, write to `AgentQuestions.md`, `report.md`, `progress.md`, its own row in `agents.md`, and the status of its own tasks in `tasks.md`.
- **Not allowed:** push or merge to `main` / `staging`, force-push, delete branches, change other agents' files or tasks, edit `role.md`, change secrets or environment config, deploy, or run stress tests against anything other than local/staging.

## Roles

| Agent | Role | Responsibilities | Allowed (files / actions) | Not allowed | Assigned by / date |
|---|---|---|---|---|---|
| `main-agent` | Lead Systems Architect | Architecture, workspace config, branding, dependency verification, and builds | All files, git branching, verification runs | Force pushes to remote | Dhairya / 2026-11-08 |

## Role changes
- 2026-11-08: `main-agent`: Assigned Lead Systems Architect role for BandForge.
