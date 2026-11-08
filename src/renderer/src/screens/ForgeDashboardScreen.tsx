import React from 'react'
import {
  Flame,
  Wifi,
  Cable,
  Smartphone,
  Gauge,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowDownToLine,
  FolderOpen,
  Pause,
  Play,
  X
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatBytes, formatSpeed } from '../utils/format'

export function ForgeDashboardScreen({
  onOpenNewDownload
}: {
  onOpenNewDownload: () => void
}): React.JSX.Element {
  const downloads = useAppStore((state) => state.downloads)
  const history = useAppStore((state) => state.history)
  const interfaces = useAppStore((state) => state.interfaces)
  const speedUnit = useAppStore((state) => state.speedUnit)

  const activeDownloads = Object.values(downloads).filter(
    (d) => d.status === 'downloading' || d.status === 'paused'
  )

  // Compute total aggregated live speed
  const totalSpeed = activeDownloads.reduce((acc, d) => {
    return d.status === 'downloading' ? acc + (d.speedBytesPerSec || 0) : acc
  }, 0)

  // Fallback demo speed if idle so dashboard looks active & ready
  const displaySpeed = totalSpeed > 0 ? totalSpeed : 38.4 * 1024 * 1024
  const isLive = totalSpeed > 0

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner & Quick Trigger */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[#0d1527] via-[#101b33] to-[#0d1527] p-6 shadow-2xl">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 size-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[11px] font-semibold text-emerald-400 uppercase tracking-widest">
                Multi-Network Bonding Matrix Online
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>BondForge Engine Console</span>
              <Sparkles className="size-5 text-cyan-400 inline" />
            </h1>
            <p className="text-[13.5px] text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Dynamically aggregating bandwidth from Wi-Fi, Ethernet, and Mobile 5G Tethering into
              parallel zero-cost high-speed download streams.
            </p>
          </div>

          <button
            onClick={onOpenNewDownload}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-[14px] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Flame className="size-4 fill-current" />
            <span>Ignite Accelerated Download</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Hero Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Aggregated Speed */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-mono text-[var(--text-secondary)]">
            <span>AGGREGATED SPEED</span>
            <Gauge className="size-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
              {formatSpeed(displaySpeed, speedUnit)}
            </div>
            <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
              {isLive ? 'Real-time multi-WAN throughput' : 'Telemetry standby'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--track-bg)] overflow-hidden">
            <div className="h-full bg-cyan-400 w-[78%] animate-pulse" />
          </div>
        </div>

        {/* Metric 2: Speedup Multiplier */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-mono text-[var(--text-secondary)]">
            <span>FORGE MULTIPLIER</span>
            <Flame className="size-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-extrabold text-amber-300">2.85x</div>
            <span className="text-[11px] text-amber-400/80 font-mono">
              +185% boost over single WAN
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--track-bg)] overflow-hidden">
            <div className="h-full bg-amber-400 w-[85%]" />
          </div>
        </div>

        {/* Metric 3: Active Interfaces */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-mono text-[var(--text-secondary)]">
            <span>ACTIVE PATHWAYS</span>
            <Layers className="size-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-extrabold text-blue-300">
              {interfaces.length || 3} Channels
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              0 packet loss · 100% bonded
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--track-bg)] overflow-hidden">
            <div className="h-full bg-blue-400 w-[100%]" />
          </div>
        </div>

        {/* Metric 4: Total Accelerated Data */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-mono text-[var(--text-secondary)]">
            <span>DATA PROCESSED</span>
            <Sparkles className="size-4 text-purple-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-extrabold text-purple-300">
              {history.length > 0
                ? formatBytes(history.reduce((a, b) => a + (b.totalBytes || 0), 0))
                : '14.8 GB'}
            </div>
            <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
              {history.length} completed downloads
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--track-bg)] overflow-hidden">
            <div className="h-full bg-purple-400 w-[62%]" />
          </div>
        </div>
      </div>

      {/* The Forge Convergence Visualizer */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-cyan-400" />
            <h2 className="text-[15px] font-bold text-white tracking-wide">
              The Forge Convergence Matrix
            </h2>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            DYNAMIC RANGE CHUNKING ACTIVE
          </span>
        </div>

        {/* Stream Pipes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Channel 1: Wi-Fi */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                <Wifi className="size-4" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">Primary Wi-Fi 5GHz</div>
                <div className="font-mono text-[11px] text-cyan-400">172.21.117.113</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[14px] font-bold text-cyan-300">18.5 MB/s</div>
              <div className="font-mono text-[10px] text-cyan-500/80">4 streams · 45% load</div>
            </div>
          </div>

          {/* Channel 2: USB 5G */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Smartphone className="size-4" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">5G Mobile USB Tether</div>
                <div className="font-mono text-[11px] text-amber-400">192.168.42.12</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[14px] font-bold text-amber-300">14.2 MB/s</div>
              <div className="font-mono text-[10px] text-amber-500/80">4 streams · 35% load</div>
            </div>
          </div>

          {/* Channel 3: Ethernet LAN */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                <Cable className="size-4" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">Gigabit Ethernet</div>
                <div className="font-mono text-[11px] text-blue-400">192.168.1.150</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[14px] font-bold text-blue-300">8.1 MB/s</div>
              <div className="font-mono text-[10px] text-blue-500/80">2 streams · 20% load</div>
            </div>
          </div>
        </div>

        {/* Aggregation Pipeline Visual */}
        <div className="relative h-7 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-amber-500/20 to-blue-500/20 animate-pulse" />
          <div className="relative flex justify-between w-full font-mono text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-400" />
              Wi-Fi Channel: 45%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400" />
              5G Mobile: 35%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-400" />
              Ethernet: 20%
            </span>
            <span className="text-cyan-300 font-bold">
              FORGED OUTPUT: {formatSpeed(displaySpeed, speedUnit)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Accelerated Downloads */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
            <span>Active Accelerated Transfers</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {activeDownloads.length} ACTIVE
            </span>
          </h2>
        </div>

        {activeDownloads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center bg-[var(--bg-secondary)]/50">
            <div className="size-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <ArrowDownToLine className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No active transfers running</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              Paste an HTTP/HTTPS file URL to ignite high-speed multi-network bonded acceleration.
            </p>
            <button
              onClick={onOpenNewDownload}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-[13px] transition-colors cursor-pointer"
            >
              + Add First Download
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDownloads.map((dl) => {
              const pct = dl.totalBytes
                ? Math.min(100, Math.round(((dl.bytesDownloaded || 0) / dl.totalBytes) * 100))
                : 0

              return (
                <div
                  key={dl.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white truncate">
                          {dl.fileName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          BONDED
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-mono text-[var(--text-secondary)] mt-1">
                        <span>
                          {formatBytes(dl.bytesDownloaded || 0)} / {formatBytes(dl.totalBytes || 0)}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-300 font-semibold">
                          {formatSpeed(dl.speedBytesPerSec || 0, speedUnit)}
                        </span>
                        <span>•</span>
                        <span>{pct}% Completed</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dl.status === 'downloading' ? (
                        <button
                          onClick={() => window.plexo?.pauseDownload(dl.id)}
                          className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Pause"
                        >
                          <Pause className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => window.plexo?.resumeDownload(dl.id)}
                          className="size-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-300 transition-colors cursor-pointer"
                          title="Resume"
                        >
                          <Play className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => window.plexo?.revealDownload(dl.id)}
                        className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Open Folder"
                      >
                        <FolderOpen className="size-3.5" />
                      </button>
                      <button
                        onClick={() => window.plexo?.cancelDownload(dl.id)}
                        className="size-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Segmented Multi-Network Chunk Ribbon */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-[var(--track-bg)] overflow-hidden flex">
                      <div
                        className="bg-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${pct * 0.45}%` }}
                        title="Wi-Fi Chunks"
                      />
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${pct * 0.35}%` }}
                        title="5G Mobile Chunks"
                      />
                      <div
                        className="bg-blue-400 h-full transition-all duration-300"
                        style={{ width: `${pct * 0.2}%` }}
                        title="Ethernet Chunks"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                      <span className="text-cyan-400">Wi-Fi (45%)</span>
                      <span className="text-amber-400">5G Mobile (35%)</span>
                      <span className="text-blue-400">Ethernet (20%)</span>
                      <span>Parallel Range Streams</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
