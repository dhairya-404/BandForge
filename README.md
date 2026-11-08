<p align="center">
  <img src="build/icon.png" width="128" alt="BondForge icon">
</p>

<h1 align="center">BondForge</h1>

<p align="center">
  <strong>Next-Gen Multi-WAN Download & Bandwidth Aggregation Engine</strong><br>
  BondForge dynamically aggregates Wi-Fi, Ethernet, and Mobile 4G/5G USB tethering to accelerate download speeds with zero remote server costs.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#build-from-source">Build</a>
</p>

---

## ⚡ Features

* **Multi-Network Aggregation ($0 Server Cost):** Combines Wi-Fi, Ethernet, and 4G/5G mobile tethering on your local machine using raw C FFI socket binding (`koffi`) and Windows source routing.
* **Dynamic Range Chunking:** Automatically segments large downloads into parallel byte ranges across participating interfaces.
* **The Forge Matrix Visualizer:** Real-time stream telemetry showing individual throughput per adapter converging into the unified forged stream.
* **Multi-Route Auto-Hedging & Failover:** Seamlessly balances connections across adapters, auto-retrying and reassigning chunks if one connection suffers latency spikes or disconnects.
* **Per-Network Controls:** Configure individual traffic weights, toggle interfaces mid-download, and set custom data limits.
* **Studio UI:** Cyber-slate dark console with real-time throughput metrics, chunk visualizer strips, and hardware adapter health decks.

---

## 🛠️ How It Works

Traditional downloaders send all TCP traffic through the operating system's single default gateway. **BondForge** bypasses this limitation without requiring an expensive cloud VPN or remote server tunnel:

1. **Adapter Discovery:** Interrogates network hardware (Wi-Fi, USB NDIS cellular tether, Ethernet) via Windows APIs.
2. **Socket Binding (C FFI):** Binds each parallel connection to specific local IP addresses using native C FFI (`koffi`) socket calls (`bind()` / `IP_UNICAST_IF`).
3. **HTTP Range Chunking:** Requests specific byte ranges (`bytes=start-end`) concurrently over each bonded interface.
4. **Direct Stream Assembler:** Writes chunks into sparse files on disk with zero memory bottleneck.

---

## 🚀 Quick Start

### Prerequisites
* **OS:** Windows 10/11 (macOS / Linux support via socket FFI)
* **Node.js:** v20+ or v22+
* **npm:** v10+

### Development
```bash
# Clone the repository
git clone https://github.com/dhairya-404/BandForge.git
cd BandForge

# Install dependencies
npm install

# Start development mode (Electron + Vite HMR)
npm run dev
```

### Production Build
```bash
# Typecheck TypeScript
npm run typecheck

# Build and unpack native desktop application
npm run build:unpack
```
The compiled standalone executable will be located in `dist/win-unpacked/bondforge.exe`.

---

## 📄 License
MIT License. Created by Dhairya.
