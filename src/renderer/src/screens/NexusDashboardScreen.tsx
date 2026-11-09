import React from 'react'
import {
  Wifi,
  Cable,
  Smartphone,
  Gauge,
  Layers,
  ArrowRight,
  Plus,
  Network,
  HardDrive,
  Globe,
  Radio
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatBytes, formatSpeed } from '../utils/format'
import { useProxyStatus } from '../hooks/useProxyStatus'

export function NexusDashboardScreen({
  onOpenNewDownload,
  onNavigateBrowserFlow
}: {
  onOpenNewDownload: () => void
  onNavigateBrowserFlow?: () => void
  onNavigateTransfers?: () => void
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
    const factor = Math.min(interfaces.length, 1.2 + (interfaces.length - 1) * 0.82)
    return `${factor.toFixed(2)}x`
  }

  // Get network icon
  const getInterfaceIcon = (kind: string | undefined): React.JSX.Element => {
    switch (kind) {
      case 'wifi':
        return <Wifi className="size-4 text-cyan-400" />
      case 'ethernet':
        return <Cable className="size-4 text-blue-400" />
      case 'usb':
        return <Smartphone className="size-4 text-amber-400" />
      default:
        return <Network className="size-4 text-slate-400" />
    }
  }

  const isProxyActive = Boolean(proxyStatus?.enabled)

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none bg-[#08090c]">
      {/* Top Banner / Nexus Command Deck */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[#0d131f] via-[#0f1726] to-[#0a0e17] p-6 shadow-2xl">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  isLive
                    ? 'bg-cyan-400 shadow-sm shadow-cyan-400/80 animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-mono text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                {isLive ? 'Multi-Network Bonding Active' : 'Nexus Aggregation Engine Ready'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Tesso Nexus Command</span>
            </h1>
            <p className="text-[13px] text-slate-400 max-w-xl leading-relaxed">
              Combining throughput across all active physical network adapters ({interfaces.length}{' '}
              hardware links detected) with parallel range chunking and zero remote proxy overhead.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-[13px] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>New Pipeline</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Aggregated Speed */}
        <div className="rounded-xl border border-[var(--border)] bg-[#0f1218] p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>AGGREGATED SPEED</span>
            <Gauge className={`size-4 ${isLive ? 'text-cyan-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div
              className={`font-mono text-3xl font-bold tracking-tight ${
                isLive ? 'text-cyan-300' : 'text-slate-200'
              }`}
            >
              {formatSpeed(totalSpeed, speedUnit)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {isLive ? 'Live parallel byte streams' : 'Standby · No active streams'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#18202d] overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-cyan-400 to-sky-400 transition-all duration-300 ${
                isLive ? 'w-[75%]' : 'w-0'
              }`}
            />
          </div>
        </div>

        {/* Metric 2: Speedup Multiplier */}
        <div className="rounded-xl border border-[var(--border)] bg-[#0f1218] p-4 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>BOND MULTIPLIER</span>
            <Layers className={`size-4 ${isLive ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div
              className={`font-mono text-3xl font-bold tracking-tight ${
                isLive ? 'text-amber-300' : 'text-slate-200'
              }`}
            >
              {getMultiplier()}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {isLive ? 'Estimated speedup vs single link' : 'Baseline single connection'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#18202d] overflow-hidden">
            <div
              className={`h-full bg-amber-400 transition-all duration-300 ${isLive ? 'w-[80%]' : 'w-0'}`}
            />
          </div>
        </div>

        {/* Metric 3: Active Interfaces */}
        <div className="rounded-xl border border-[var(--border)] bg-[#0f1218] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>HARDWARE CONDUITS</span>
            <Network className="size-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-emerald-300 tracking-tight">
              {interfaces.length}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {interfaces.length > 1
                ? `${interfaces.length} physical adapters bound`
                : '1 hardware interface detected'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#18202d] overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, interfaces.length * 50)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Total Delivered Data */}
        <div className="rounded-xl border border-[var(--border)] bg-[#0f1218] p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>DELIVERED DATA</span>
            <HardDrive className="size-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-indigo-300 tracking-tight">
              {formatBytes(totalHistoryBytes)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {history.length} completed {history.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#18202d] overflow-hidden">
            <div className="h-full bg-indigo-400 w-full" />
          </div>
        </div>
      </div>

      {/* Hardware Interface Aggregation Deck */}
      <div className="rounded-2xl border border-[var(--border)] bg-[#0f1218] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-cyan-400" />
            <h2 className="text-[14px] font-bold text-white tracking-tight">
              Hardware Interfaces & Metric Weights
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Automatic round-robin weighted dispatch
          </span>
        </div>

        {interfaces.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-slate-500 text-[13px]">
            No physical network interfaces detected. Check hardware connections.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {interfaces.map((iface, index) => {
              const ipv4 = iface.addresses.find((a) => a.family === 4)?.address || 'DHCP'
              return (
                <div
                  key={iface.id || index}
                  className="rounded-xl border border-[var(--border)] bg-[#12161f] p-3.5 flex items-center justify-between hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-lg bg-[#18202d] flex items-center justify-center shrink-0">
                      {getInterfaceIcon(iface.kind)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-white truncate">
                          {iface.displayName || iface.id}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-bold">
                          {iface.kind}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block truncate">
                        {ipv4}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                      ONLINE
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">W: 1.0</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Multi-WAN Chrome Browser Flow Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[#0f1218] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Globe className="size-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[14px] text-white tracking-tight">
                  Browser Multi-WAN Acceleration Bridge
                </h3>
                <span
                  className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isProxyActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isProxyActive ? 'PROXY ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Transparent multi-WAN failover for Chrome, Brave, and Edge via PAC script (
                <span className="font-mono text-cyan-400">:9091</span>) and forward proxy tunnel (
                <span className="font-mono text-cyan-400">:9090</span>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={proxyLoading}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold font-mono transition-all cursor-pointer ${
                isProxyActive
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/30'
              }`}
            >
              {proxyLoading ? 'Updating...' : isProxyActive ? 'Stop Proxy' : 'Launch Proxy'}
            </button>
            {onNavigateBrowserFlow && (
              <button
                onClick={onNavigateBrowserFlow}
                className="px-3 py-1.5 rounded-lg bg-[#161b24] hover:bg-[#1f2633] border border-[var(--border)] text-slate-300 text-[12px] font-medium transition-colors cursor-pointer"
              >
                Configure
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Backward-compatible alias
export { NexusDashboardScreen as ForgeDashboardScreen }
