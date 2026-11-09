# Contributing to Tesso

Thank you for your interest in contributing to **Tesso**!

## Quick Setup

```bash
# Clone repository
git clone https://github.com/dhairya-404/Tesso.git
cd Tesso

# Install dependencies
npm install

# Start local development
npm run dev
```

Prerequisites: Node.js 20+ and npm 10+, on Windows, macOS, or Linux.

## Packaging

- **Windows**: `npm run build:unpack` builds the standalone application at `dist/win-unpacked/tesso.exe`.
- **macOS**: `npm run build:mac` creates `.dmg` and `.zip` packages.
- **Linux**: `npm run build:linux` creates AppImage, `.deb`, and `.rpm` packages.
- **Companion Extension**: `npm run build:extension` compiles and packages the Chrome & Firefox extension zips into `extension/dist/`.

## Quality Checks

Before submitting a PR, verify:

```bash
npm run typecheck
npm run lint
```
