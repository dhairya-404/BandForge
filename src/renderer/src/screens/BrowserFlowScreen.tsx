import React, { useState } from 'react'
import {
  Globe,
  Wifi,
  Cable,
  Smartphone,
  Network,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Layers
} from 'lucide-react'
import { useProxyStatus } from '../hooks/useProxyStatus'
import { useAppStore } from '../store/useAppStore'
import { formatBytes } from '../utils/format'

export function BrowserFlowScreen(): React.JSX.Element {
  const { status, toggleProxy, loading, refresh } = useProxyStatus()
  const interfaces = useAppStore((state) => state.interfaces)
  const [copiedPac, setCopiedPac] = useState(false)
  const [copiedProxy, setCopiedProxy] = useState(false)
  const [copiedCli, setCopiedCli] = useState(false)
  const [probeResult, setProbeResult] = useState<string | null>(null)
  const [probing, setProbing] = useState(false)

  const isProxyActive = status?.enabled ?? false
  const pacUrl = status?.pacUrl || 'http://127.0.0.1:9091/proxy.pac'
  const proxyEndpoint = `127.0.0.1:${status?.port || 9090}`
  const cliCommand = `chrome.exe --proxy-pac-url=${pacUrl}`

  const copyToClipboard = async (
    text: string,
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleTestProbe = async (): Promise<void> => {
    setProbing(true)
    setProbeResult(null)
    const start = performance.now()
    try {
      const res = await fetch(pacUrl, { method: 'GET' })
      const elapsed = Math.round(performance.now() - start)
      if (res.ok) {
        const text = await res.text()
        const hasProxy = text.includes('PROXY 127.0.0.1')
        setProbeResult(
          `PAC script verified (${elapsed}ms) · ${hasProxy ? 'Multi-WAN rule verified' : 'Active'}`
        )
      } else {
        setProbeResult(`Error: HTTP ${res.status}`)
      }
    } catch {
      setProbeResult('Proxy PAC server is offline. Toggle acceleration ON.')
    } finally {
      setProbing(false)
    }
  }

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

  // Calculate total browser traffic across interfaces
  const ifaceStatsList = Object.values(status?.interfaces || {})
  const totalReceived = ifaceStatsList.reduce((acc, s) => acc + s.bytesReceived, 0)
  const totalSent = ifaceStatsList.reduce((acc, s) => acc + s.bytesSent, 0)
  const totalBrowserData = totalReceived + totalSent

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-r from-[#0a1220] via-[#0e172a] to-[#08101d] p-6 shadow-xl">
        <div className="absolute -right-20 -top-20 size-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  isProxyActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span
                className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${
                  isProxyActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {isProxyActive ? 'Browser Multi-WAN Proxy Active' : 'Proxy Standby'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Globe className="size-6 text-sky-400" />
              <span>Browser Multi-WAN Acceleration</span>
            </h1>
            <p className="text-[13px] text-slate-400 max-w-xl leading-relaxed">
              Distribute Google Chrome, Microsoft Edge, and web browsing sessions across all{' '}
              {interfaces.length} bonded physical network adapters simultaneously. Zero cloud server
              fees.
            </p>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={loading}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-[13.5px] shadow-lg transition-all cursor-pointer ${
                isProxyActive
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25 active:scale-95'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Zap className="size-4" />
              <span>{isProxyActive ? 'Acceleration Enabled' : 'Enable Browser Acceleration'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Browser Connections */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>ACTIVE BROWSER SOCKETS</span>
            <Network className={`size-4 ${isProxyActive ? 'text-sky-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div
              className={`font-mono text-3xl font-bold ${
                isProxyActive ? 'text-sky-300' : 'text-slate-300'
              }`}
            >
              {status?.activeConnections || 0}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Concurrent browser TCP flows
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full bg-sky-500 transition-all duration-300 ${
                isProxyActive && (status?.activeConnections || 0) > 0 ? 'w-[70%]' : 'w-0'
              }`}
            />
          </div>
        </div>

        {/* Metric 2: Accelerated Data */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>BROWSER DATA PROCESSED</span>
            <Layers className={`size-4 ${isProxyActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-emerald-300">
              {formatBytes(totalBrowserData)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Down: {formatBytes(totalReceived)} · Up: {formatBytes(totalSent)}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-400 w-full" />
          </div>
        </div>

        {/* Metric 3: Multi-WAN Routing Strategy */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>SCHEDULING STRATEGY</span>
            <ShieldCheck className="size-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-2xl font-bold text-white">Least-Load</div>
            <span className="text-[11px] text-amber-300 font-mono">
              Dynamic interface round-robin
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-400 w-full" />
          </div>
        </div>

        {/* Metric 4: Hardware Adapters Armed */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400">
            <span>BONDED ADAPTERS</span>
            <Globe className="size-4 text-sky-400" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-white">
              {interfaces.length} Adapters
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Zero cloud latency · Direct kernel bind
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-sky-400 w-full" />
          </div>
        </div>
      </div>

      {/* Network Interface Traffic Matrix */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-sky-400" />
            <h2 className="text-[14px] font-bold text-white tracking-wide">
              Interface Browser Allocation Matrix
            </h2>
          </div>
          <button
            onClick={() => void refresh()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3 text-sky-400" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {interfaces.map((iface) => {
            const ifaceStat = status?.interfaces?.[iface.id]
            const activeConn = ifaceStat?.activeConnections || 0
            const recv = ifaceStat?.bytesReceived || 0
            const sent = ifaceStat?.bytesSent || 0
            const ip = iface.addresses?.[0]?.address || 'Auto DHCP'
            const ifaceTotal = recv + sent
            const share =
              totalBrowserData > 0 ? Math.round((ifaceTotal / totalBrowserData) * 100) : 0

            return (
              <div
                key={iface.id}
                className="rounded-lg border border-slate-800 bg-[#0c1322] p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
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
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                    {activeConn} socket{activeConn === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Transferred:</span>
                    <span className="text-slate-200 font-semibold">{formatBytes(ifaceTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Down: {formatBytes(recv)}</span>
                    <span>Up: {formatBytes(sent)}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-300"
                      style={{ width: `${Math.max(4, share)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Connection Endpoints & Option B: Chrome Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Connection Endpoints Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-emerald-400" />
            <h2 className="text-[14px] font-bold text-white">Local Proxy Endpoints</h2>
          </div>

          <div className="space-y-3">
            {/* PAC URL */}
            <div className="p-3.5 rounded-lg bg-[#070b13] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-slate-300">
                  PAC Script (Automatic Proxy Configuration)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  RECOMMENDED
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] text-sky-300 truncate bg-black/40 px-2.5 py-1.5 rounded border border-slate-800">
                  {pacUrl}
                </code>
                <button
                  onClick={() => void copyToClipboard(pacUrl, setCopiedPac)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[12px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  {copiedPac ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copiedPac ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Direct Proxy */}
            <div className="p-3.5 rounded-lg bg-[#070b13] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-slate-300">HTTP / HTTPS Forward Proxy</span>
                <span className="text-[10px] font-mono text-slate-500">
                  PORT {status?.port || 9090}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] text-slate-300 truncate bg-black/40 px-2.5 py-1.5 rounded border border-slate-800">
                  {proxyEndpoint}
                </code>
                <button
                  onClick={() => void copyToClipboard(proxyEndpoint, setCopiedProxy)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[12px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  {copiedProxy ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copiedProxy ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Live Health Probe */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => void handleTestProbe()}
                disabled={probing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[12px] font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>Verify Proxy PAC Health</span>
              </button>
              {probeResult && (
                <span className="font-mono text-[11px] text-emerald-400">{probeResult}</span>
              )}
            </div>
          </div>
        </div>

        {/* Chrome Companion & 1-Click Launch Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-sky-400" />
              <h2 className="text-[14px] font-bold text-white">Google Chrome Integration</h2>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/25">
              OPTION A & B
            </span>
          </div>

          <div className="space-y-3 text-[12.5px]">
            {/* Path 1: Chrome Extension */}
            <div className="p-3.5 rounded-lg bg-[#070b13] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span>Method 1: Tesso Chrome Extension</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">
                    1-Click
                  </span>
                </span>
              </div>
              <p className="text-slate-400 text-[12px] leading-relaxed">
                Load the built companion extension in Google Chrome to toggle Multi-WAN acceleration
                directly from your browser toolbar.
              </p>
              <div className="bg-black/30 p-2.5 rounded font-mono text-[11px] text-slate-300 space-y-1">
                <div>
                  1. In Chrome, navigate to:{' '}
                  <span className="text-sky-300">chrome://extensions</span>
                </div>
                <div>
                  2. Turn on <span className="text-amber-300">Developer mode</span> (top right).
                </div>
                <div>
                  3. Click <span className="text-sky-300">Load unpacked</span> and choose:{' '}
                  <span className="text-emerald-300">extension/dist/chrome</span>
                </div>
              </div>
            </div>

            {/* Path 2: Direct CLI Flag */}
            <div className="p-3.5 rounded-lg bg-[#070b13] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  Method 2: Launch Chrome with Multi-WAN
                </span>
                <span className="text-[10px] font-mono text-slate-500">Zero Extension</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[11px] text-slate-300 truncate bg-black/40 px-2.5 py-1.5 rounded border border-slate-800">
                  {cliCommand}
                </code>
                <button
                  onClick={() => void copyToClipboard(cliCommand, setCopiedCli)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[12px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  {copiedCli ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copiedCli ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
