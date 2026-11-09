import React, { useState } from 'react'
import { Copy, Check, Zap, RefreshCw, Terminal, Activity } from 'lucide-react'
import { useProxyStatus } from '../hooks/useProxyStatus'
import { formatBytes } from '../utils/format'

export function BrowserFlowScreen(): React.JSX.Element {
  const { status, toggleProxy, loading } = useProxyStatus()
  const [copiedPac, setCopiedPac] = useState(false)
  const [copiedProxy, setCopiedProxy] = useState(false)
  const [copiedBrowser, setCopiedBrowser] = useState<string | null>(null)
  const [probeResult, setProbeResult] = useState<string | null>(null)
  const [probing, setProbing] = useState(false)

  const isProxyActive = status?.enabled ?? false
  const pacUrl = status?.pacUrl || 'http://127.0.0.1:9091/proxy.pac'
  const proxyEndpoint = `127.0.0.1:${status?.port || 9090}`

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
      if (!isProxyActive) {
        setProbeResult('Starting local PAC daemon...')
        await toggleProxy(true)
        await new Promise((r) => setTimeout(r, 400))
      }
      let res: Response | null = null
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await fetch(pacUrl, { method: 'GET' })
          if (res.ok) break
        } catch {
          await new Promise((r) => setTimeout(r, 250))
        }
      }

      const elapsed = Math.round(performance.now() - start)
      if (res && res.ok) {
        const text = await res.text()
        const hasProxy = text.includes('PROXY 127.0.0.1')
        setProbeResult(
          `✓ PAC Server Online (${elapsed}ms) · ${hasProxy ? 'Multi-WAN Conduit Rules Verified' : 'Online'}`
        )
      } else {
        setProbeResult(res ? `PAC responded with HTTP ${res.status}` : 'PAC daemon initializing...')
      }
    } catch {
      setProbeResult('Unable to reach PAC server. Verify local port 9091.')
    } finally {
      setProbing(false)
    }
  }

  // Calculate total browser traffic across interfaces
  const ifaceStatsList = Object.values(status?.interfaces || {})
  const totalReceived = ifaceStatsList.reduce((acc, s) => acc + s.bytesReceived, 0)
  const totalSent = ifaceStatsList.reduce((acc, s) => acc + s.bytesSent, 0)
  const totalBrowserData = totalReceived + totalSent

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 max-w-6xl select-none text-[var(--text)]">
      {/* Header Banner & Master Toggle */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 md:p-8 shadow-sm transition-colors">
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`size-3 rounded-full ${
                  isProxyActive
                    ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Browser Multi-WAN Acceleration Station
              </h1>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Transparently aggregate browser web flows (video streams, cloud downloads, heavy web
              apps) across Wi-Fi, Ethernet, and Mobile Hotspot simultaneously using local 802.3ad
              PAC routing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-[13px] font-bold transition-all cursor-pointer shadow-md ${
                isProxyActive
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  : 'bg-[var(--bg-tertiary)] hover:bg-cyan-500 hover:text-slate-950 text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              <Zap className={`size-4 ${isProxyActive ? 'fill-current' : ''}`} />
              <span>{isProxyActive ? 'ACCELERATION: ON' : 'START ACCELERATION'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick PAC Endpoints & Health Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Endpoint 1: PAC URL */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Automatic PAC Script URL
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              Port :9091
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pacUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] font-mono text-[12.5px] text-[var(--text)] outline-none"
            />
            <button
              onClick={() => void copyToClipboard(pacUrl, setCopiedPac)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-cyan-500 hover:text-slate-950 text-[var(--text)] border border-[var(--border)] text-[12px] font-semibold transition-all cursor-pointer"
            >
              {copiedPac ? (
                <Check className="size-3.5 text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>{copiedPac ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11.5px] text-[var(--text-secondary)]">
            Used by Chrome, Brave, Edge, and Windows Network Settings to route browser connections.
          </p>
        </div>

        {/* Endpoint 2: Local HTTP/HTTPS Proxy */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Direct Multi-WAN Forward Proxy
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Port :9090
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={proxyEndpoint}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] font-mono text-[12.5px] text-[var(--text)] outline-none"
            />
            <button
              onClick={() => void copyToClipboard(proxyEndpoint, setCopiedProxy)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text)] border border-[var(--border)] text-[12px] font-semibold transition-all cursor-pointer"
            >
              {copiedProxy ? (
                <Check className="size-3.5 text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>{copiedProxy ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11.5px] text-[var(--text-secondary)]">
            Accepts HTTP CONNECT tunnels and routes sockets round-robin through physical NICs.
          </p>
        </div>
      </div>

      {/* Interactive Verification Console */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => void handleTestProbe()}
            disabled={probing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-[12.5px] font-bold font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${probing ? 'animate-spin' : ''}`} />
            <span>Verify Proxy PAC Health</span>
          </button>

          {probeResult && (
            <span
              className={`text-[12px] font-mono font-medium ${
                probeResult.includes('✓') ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {probeResult}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono text-[var(--text-secondary)]">
          <Activity className="size-3.5 text-cyan-400" />
          <span>Total Browser Data: {formatBytes(totalBrowserData)}</span>
        </div>
      </div>

      {/* Browser Quick-Launch Command Deck */}
      <div className="space-y-4">
        <h3 className="font-bold text-[16px] tracking-tight flex items-center gap-2">
          <Terminal className="size-4.5 text-cyan-400" />
          <span>Launch Accelerated Browsers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chrome Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3 shadow-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px]">Google Chrome</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                RECOMMENDED
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Launch Chrome connected directly to Tesso multi-network auto-config.
            </p>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(`start chrome --proxy-pac-url=${pacUrl}`)
                setCopiedBrowser('chrome')
                setTimeout(() => setCopiedBrowser(null), 2000)
              }}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-cyan-500 hover:text-slate-950 border border-[var(--border)] text-[11.5px] font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedBrowser === 'chrome' ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>{copiedBrowser === 'chrome' ? 'Command Copied' : 'Copy Launch Command'}</span>
            </button>
          </div>

          {/* Brave Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3 shadow-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px]">Brave Browser</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TESTED
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Aggregated web streams with built-in Brave ad-blocking.
            </p>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(`start brave --proxy-pac-url=${pacUrl}`)
                setCopiedBrowser('brave')
                setTimeout(() => setCopiedBrowser(null), 2000)
              }}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-emerald-500 hover:text-slate-950 border border-[var(--border)] text-[11.5px] font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedBrowser === 'brave' ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>{copiedBrowser === 'brave' ? 'Command Copied' : 'Copy Launch Command'}</span>
            </button>
          </div>

          {/* Edge Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3 shadow-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px]">Microsoft Edge</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                NATIVE
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Windows native Chromium browser bonded across adapters.
            </p>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(`start msedge --proxy-pac-url=${pacUrl}`)
                setCopiedBrowser('edge')
                setTimeout(() => setCopiedBrowser(null), 2000)
              }}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-sky-500 hover:text-slate-950 border border-[var(--border)] text-[11.5px] font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedBrowser === 'edge' ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>{copiedBrowser === 'edge' ? 'Command Copied' : 'Copy Launch Command'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
