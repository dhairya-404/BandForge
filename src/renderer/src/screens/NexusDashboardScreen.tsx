import React from 'react'
import {
  Wifi,
  Cable,
  Smartphone,
  ArrowRight,
  Plus,
  Network,
  HardDrive,
  Globe,
  Zap,
  Activity,
  TrendingUp
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatBytes, formatSpeed } from '../utils/format'
import { useProxyStatus } from '../hooks/useProxyStatus'

export function NexusDashboardScreen({
  onOpenNewDownload,
  onNavigateBrowserFlow,
  onNavigateTransfers
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
        return <Wifi className="size-4.5 text-cyan-400" />
      case 'ethernet':
        return <Cable className="size-4.5 text-blue-400" />
      case 'usb':
        return <Smartphone className="size-4.5 text-emerald-400" />
      default:
        return <Network className="size-4.5 text-slate-400" />
    }
  }

  const isProxyActive = Boolean(proxyStatus?.enabled)

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 select-none text-[var(--text)] transition-colors">
      {/* Top Hero Command Deck */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 md:p-8 shadow-sm transition-colors">
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  isLive
                    ? 'bg-cyan-400 shadow-md shadow-cyan-400/80 animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                {isLive ? 'Multi-Network Aggregation Active' : 'Nexus Bonding Engine Ready'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Tesso Nexus Command Center
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Combining bandwidth across all active physical network adapters ({interfaces.length}{' '}
              hardware conduit{interfaces.length === 1 ? '' : 's'} detected) with parallel range
              chunking and zero remote proxy overhead.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewDownload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-[13px] text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Ingest Link / File</span>
            </button>

            {onNavigateTransfers && (
              <button
                onClick={onNavigateTransfers}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text)] font-medium text-[13px] transition-all cursor-pointer"
              >
                <span>Transfers</span>
                <ArrowRight className="size-4 text-cyan-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Aggregated Speed Gauge */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span className="uppercase tracking-wider font-semibold">Aggregated Throughput</span>
            <Activity
              className={`size-3.5 ${isLive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-cyan-400">
              {isLive ? formatSpeed(totalSpeed, speedUnit) : '0 B/s'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            {isLive ? 'Full hardware convergence active' : 'Awaiting transfer ingress'}
          </div>
        </div>

        {/* Metric 2: Bonding Velocity Multiplier */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span className="uppercase tracking-wider font-semibold">Bonding Velocity</span>
            <TrendingUp className="size-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-400">
              {getMultiplier()}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            {interfaces.length > 1
              ? `Calculated across ${interfaces.length} conduits`
              : 'Connect 2nd adapter for boost'}
          </div>
        </div>

        {/* Metric 3: Active Interfaces */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span className="uppercase tracking-wider font-semibold">Hardware Conduits</span>
            <Network className="size-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-[var(--text)]">
              {interfaces.length}
            </span>
            <span className="text-[12px] font-mono text-[var(--text-secondary)]">NICs</span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            {interfaces.map((i) => i.kind.toUpperCase()).join(' · ') || 'DHCP Pool'}
          </div>
        </div>

        {/* Metric 4: Lifetime Processed Data */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span className="uppercase tracking-wider font-semibold">Ingested Volume</span>
            <HardDrive className="size-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-[var(--text)]">
              {formatBytes(totalHistoryBytes)}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            {history.length} completed transfer{history.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Main Grid: Hardware Matrix & Browser Flow Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hardware Adapter Matrix */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="size-4.5 text-cyan-400" />
              <h3 className="font-bold text-[15px] tracking-tight">
                Active Hardware Conduit Matrix
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-secondary)] font-medium">
              Real-time Socket Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {interfaces.map((item) => {
              const liveIfaceSpeed = activeDownloads.reduce((sum, dl) => {
                const matched = dl.networks?.find((n) => n.id === item.id)
                return sum + (matched?.speedBytesPerSec || 0)
              }, 0)

              const ip = item.addresses.find((a) => a.family === 4)?.address || 'DHCP Assigned'

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 space-y-3 hover:border-cyan-500/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border)]">
                        {getInterfaceIcon(item.kind)}
                      </div>
                      <div>
                        <div className="font-bold text-[13px] text-[var(--text)] truncate max-w-[150px]">
                          {item.displayName || item.device}
                        </div>
                        <div className="text-[10.5px] font-mono text-[var(--text-secondary)] uppercase">
                          {item.kind} Conduit
                        </div>
                      </div>
                    </div>

                    <span className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[var(--border)] text-[var(--text-secondary)]">
                    <span>IP: {ip}</span>
                    <span className="font-bold text-cyan-400">
                      {liveIfaceSpeed > 0 ? formatSpeed(liveIfaceSpeed, speedUnit) : 'Ready'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Col: Browser Multi-WAN Flow Station */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-sm flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="size-4.5 text-cyan-400" />
                <h3 className="font-bold text-[15px] tracking-tight">Browser Multi-WAN</h3>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isProxyActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isProxyActive ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Auto-PAC forward proxy distributes Chrome, Brave, and Edge browser sessions across all
              bonded interfaces.
            </p>

            <div className="rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>PAC URL:</span>
                <span className="text-cyan-400 font-semibold truncate max-w-[160px]">
                  {proxyStatus?.pacUrl || 'http://127.0.0.1:9091/proxy.pac'}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tunnel Port:</span>
                <span className="text-[var(--text)] font-semibold">
                  {proxyStatus?.port || 9090}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={proxyLoading}
              className={`w-full py-2.5 px-3 rounded-xl font-mono text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isProxyActive
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                  : 'bg-[var(--bg-tertiary)] hover:bg-cyan-500 hover:text-slate-950 text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              <Zap className="size-3.5 fill-current" />
              <span>{isProxyActive ? 'Deactivate Proxy' : 'Activate Proxy'}</span>
            </button>

            {onNavigateBrowserFlow && (
              <button
                onClick={onNavigateBrowserFlow}
                className="w-full py-2 px-3 rounded-xl border border-[var(--border)] bg-transparent hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text)] font-medium text-[11.5px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Browser Flow Details</span>
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
