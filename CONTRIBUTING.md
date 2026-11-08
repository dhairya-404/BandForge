# Contributing to BondForge

Thank you for your interest in contributing to **BondForge**!

## Quick Setup

```bash
# Clone repository
git clone https://github.com/dhairya-404/BandForge.git
cd BandForge

# Install dependencies
npm install

# Start local development
npm run dev
```

Prerequisites: Node.js 20+ and npm 10+, on Windows, macOS, or Linux.

## Packaging
- **Windows**: `npm run build:unpack` builds the standalone application at `dist/win-unpacked/bondforge.exe`.
- **macOS**: `npm run build:mac` creates `.dmg` and `.zip` packages.
- **Linux**: `npm run build:linux` creates AppImage, `.deb`, and `.rpm` packages.

## Quality Checks
Before submitting a PR, verify:
```bash
npm run typecheck
npm run lint
```
