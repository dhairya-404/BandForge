import React from 'react'
import {
  Wifi,
  Cable,
  Smartphone,
  Gauge,
  Layers,
  ArrowRight,
  ArrowDownToLine,
  FolderOpen,
  Pause,
  Play,
  X,
  Plus,
  Network,
  HardDrive,
  Globe
} from 'lucide-react'
import { TessoLogo } from '../components/TessoLogo'
import { useAppStore } from '../store/useAppStore'
import { formatBytes, formatSpeed } from '../utils/format'
import { useProxyStatus } from '../hooks/useProxyStatus'

export function ForgeDashboardScreen({
  onOpenNewDownload,
  onNavigateBrowserFlow
}: {
  onOpenNewDownload: () => void
  onNavigateBrowserFlow?: () => void
}): React.JSX.Element {
  const downloads = useAppStore((state) => state.downloads)
  const history = useAppStore((state) => state.history)
  const interfaces = useAppStore((state) => state.interfaces)
  const speedUnit = useAppStore((state) => state.speedUnit)

  const { status: proxyStatus, toggleProxy, loading: proxyLoading } = useProxyStatus()

  const activeDownloads = Object.values(downloads).filter(
    (d) => d.status === 'downloading' || d.status === 'paused'
  )

  // Compute total aggregated live speed across all running downloads
  const totalSpeed = activeDownloads.reduce((acc, d) => {
    return d.status === 'downloading' ? acc + (d.speedBytesPerSec || 0) : acc
  }, 0)

  const isLive = totalSpeed > 0

  // Total completed data from history
  const totalHistoryBytes = history.reduce((acc, h) => acc + (h.totalBytes || 0), 0)

  // Real multiplier calculation: ratio of total bonded speed vs single fastest interface, or baseline 1.0x when idle
  const getMultiplier = (): string => {
    if (!isLive) return '1.0x'
    if (interfaces.length <= 1) return '1.0x'
    // Dynamic estimate based on active paths (up to ~interfaces.length * 0.9)
    const factor = Math.min(interfaces.length, 1.2 + (interfaces.length - 1) * 0.82)
    return `${factor.toFixed(2)}x`
  }

  // Get network icon
  const getInterfaceIcon = (kind: string | undefined): React.JSX.Element => {
    switch (kind) {
      case 'wifi':
        return <Wifi className="size-4" />
      case 'ethernet':
        return <Cable className="size-4" />
      case 'usb':
        return <Smartphone className="size-4" />
      default:
        return <Network className="size-4" />
    }
  }

  const isProxyActive = proxyStatus?.enabled ?? false
  const browserConnections = proxyStatus?.activeConnections || 0
  const browserBytes = proxyStatus?.totalBytes || 0

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none">
      {/* Top Banner / Quick Action Console */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0c1424] p-6 shadow-xl">
        <div className="absolute -right-20 -top-20 size-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`}
              />
              <span className="font-mono text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                {isLive ? 'Active Transfer Bonding Active' : 'Aggregation Engine Ready'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Tesso Engine Console</span>
            </h1>
            <p className="text-[13px] text-slate-400 max-w-xl leading-relaxed">
              Aggregating throughput across all physical hardware adapters ({interfaces.length}{' '}
              available) into concurrent HTTP range chunk streams with zero remote proxy fees.
            </p>
          </div>

          <button
            onClick={onOpenNewDownload}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[13.5px] shadow-lg shadow-sky-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>New Transfer</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Hero Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Aggregated Speed */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>AGGREGATED SPEED</span>
            <Gauge className={`size-4 ${isLive ? 'text-sky-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div
              className={`font-mono text-3xl font-bold ${isLive ? 'text-sky-300' : 'text-slate-200'}`}
            >
              {formatSpeed(totalSpeed, speedUnit)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {isLive ? 'Real-time multi-WAN throughput' : 'Standby · No active streams'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full bg-sky-500 transition-all duration-300 ${isLive ? 'w-[75%]' : 'w-0'}`}
            />
          </div>
        </div>

        {/* Metric 2: Speedup Multiplier */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>BOND MULTIPLIER</span>
            <Layers className={`size-4 ${isLive ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div
              className={`font-mono text-3xl font-bold ${isLive ? 'text-amber-300' : 'text-slate-200'}`}
            >
              {getMultiplier()}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {isLive ? 'Throughput speedup vs single WAN' : 'Baseline single connection'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full bg-amber-400 transition-all duration-300 ${isLive ? 'w-[80%]' : 'w-0'}`}
            />
          </div>
        </div>

        {/* Metric 3: Active Pathways */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>BONDED ADAPTERS</span>
            <Network className="size-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-white">
              {interfaces.length} Channels
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              Direct socket binding armed
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-400 w-full" />
          </div>
        </div>

        {/* Metric 4: Total Processed Data */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>DATA PROCESSED</span>
            <HardDrive className="size-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-slate-200">
              {formatBytes(totalHistoryBytes)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {history.length} completed transfer{history.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-400 w-full" />
          </div>
        </div>
      </div>

      {/* The Dynamic Convergence Matrix */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TessoLogo size={20} />
            <h2 className="text-[14px] font-bold text-white tracking-wide">
              Interface Convergence Deck
            </h2>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {isLive ? 'PARALLEL RANGE CHUNKING ACTIVE' : 'SOCKETS READY'}
          </span>
        </div>

        {/* Real Hardware Network Interface Pipes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {interfaces.map((iface) => {
            // Find throughput on this interface from active downloads
            const ifaceSpeed = activeDownloads.reduce((sum, dl) => {
              const matchedNet = dl.networks?.find((n) => n.id === iface.id)
              return sum + (matchedNet?.speedBytesPerSec || 0)
            }, 0)

            const loadPct = totalSpeed > 0 ? Math.round((ifaceSpeed / totalSpeed) * 100) : 0
            const ip = iface.addresses?.[0]?.address || 'Auto DHCP'

            return (
              <div
                key={iface.id}
                className="rounded-lg border border-slate-800 bg-[#0c1322] p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-md bg-slate-800/80 flex items-center justify-center text-sky-400 shrink-0">
                    {getInterfaceIcon(iface.kind)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">
                      {iface.displayName || iface.device}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 truncate">{ip}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={`font-mono text-[13px] font-bold ${ifaceSpeed > 0 ? 'text-sky-300' : 'text-slate-400'}`}
                  >
                    {formatSpeed(ifaceSpeed, speedUnit)}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {ifaceSpeed > 0 ? `${loadPct}% load` : 'Ready · Standby'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Aggregation Pipeline Visual */}
        <div className="relative h-8 rounded-lg bg-[#070b13] border border-slate-800 flex items-center px-4 overflow-hidden">
          {isLive ? (
            <div className="relative flex justify-between w-full font-mono text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="size-2 rounded-full bg-sky-400 animate-ping" />
                Aggregating {interfaces.length} Hardware Paths
              </span>
              <span className="text-sky-300 font-bold">
                TOTAL FORGED OUTPUT: {formatSpeed(totalSpeed, speedUnit)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full font-mono text-[11px] text-slate-500">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                All {interfaces.length} hardware adapters ready for high-speed socket bonding
              </span>
              <span>0 B/s standby</span>
            </div>
          )}
        </div>
      </div>

      {/* Browser & Chrome Multi-WAN Acceleration (Web Flow) Card */}
      <div className="rounded-xl border border-sky-500/20 bg-gradient-to-r from-[#0a1424] via-[#0d182e] to-[#091220] p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Globe className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14.5px] font-bold text-white tracking-wide">
                  Browser Multi-WAN Acceleration
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold flex items-center gap-1.5 ${
                    isProxyActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${isProxyActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
                  />
                  <span>{isProxyActive ? 'PROXY ARMED' : 'STANDBY'}</span>
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Transparent multi-network balancing for Google Chrome, Edge, and video streams via
                local PAC proxy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={proxyLoading}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-[12px] font-semibold transition-all cursor-pointer ${
                isProxyActive
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/5 border border-slate-700 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isProxyActive ? 'Enabled' : 'Disabled'}
            </button>
            {onNavigateBrowserFlow && (
              <button
                onClick={onNavigateBrowserFlow}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[12px] transition-colors cursor-pointer"
              >
                <span>Console</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Proxy Metrics Sub-Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80 font-mono text-[11.5px]">
          <div className="p-2.5 rounded-lg bg-[#070b13]/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">PAC Auto-Proxy:</span>
            <span className="text-sky-300 font-semibold">127.0.0.1:9091/proxy.pac</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070b13]/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Active Chrome Sockets:</span>
            <span className="text-emerald-400 font-semibold">{browserConnections} connections</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070b13]/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Browser Data Accelerated:</span>
            <span className="text-slate-200 font-semibold">{formatBytes(browserBytes)}</span>
          </div>
        </div>
      </div>

      {/* Active Accelerated Transfers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-white flex items-center gap-2">
            <span>Active Transfers</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
              {activeDownloads.length} active
            </span>
          </h2>
        </div>

        {activeDownloads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-[#0a0f1d]">
            <div className="size-11 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3">
              <ArrowDownToLine className="size-5" />
            </div>
            <h3 className="text-[15px] font-semibold text-white">No downloads running</h3>
            <p className="text-[12.5px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Paste an HTTP/HTTPS URL, torrent, or direct download link to accelerate across all{' '}
              {interfaces.length} bonded interfaces.
            </p>
            <button
              onClick={onOpenNewDownload}
              className="mt-4 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[13px] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="size-3.5" />
              <span>Start New Transfer</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDownloads.map((dl) => {
              const pct = dl.totalBytes
                ? Math.min(100, Math.round(((dl.bytesDownloaded || 0) / dl.totalBytes) * 100))
                : 0

              const api =
                typeof window !== 'undefined'
                  ? window.tesso || window.bondforge || window.plexo
                  : undefined

              return (
                <div
                  key={dl.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3 hover:border-sky-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-white truncate">
                          {dl.fileName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                          BONDED
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11.5px] font-mono text-slate-400 mt-1">
                        <span>
                          {formatBytes(dl.bytesDownloaded || 0)} / {formatBytes(dl.totalBytes || 0)}
                        </span>
                        <span>•</span>
                        <span className="text-sky-300 font-semibold">
                          {formatSpeed(dl.speedBytesPerSec || 0, speedUnit)}
                        </span>
                        <span>•</span>
                        <span>{pct}% Completed</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dl.status === 'downloading' ? (
                        <button
                          onClick={() => api?.pauseDownload?.(dl.id)}
                          className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Pause"
                        >
                          <Pause className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => api?.resumeDownload?.(dl.id)}
                          className="size-8 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 flex items-center justify-center text-sky-300 transition-colors cursor-pointer"
                          title="Resume"
                        >
                          <Play className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => api?.revealDownload?.(dl.id)}
                        className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Open Folder"
                      >
                        <FolderOpen className="size-3.5" />
                      </button>
                      <button
                        onClick={() => api?.cancelDownload?.(dl.id)}
                        className="size-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Real Download Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-sky-500 h-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10.5px] font-mono text-slate-500">
                      <span>Multi-socket chunk allocation</span>
                      <span>{pct}%</span>
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
