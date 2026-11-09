import React from 'react'
import { Activity, Plus, ShieldCheck, Globe } from 'lucide-react'
import { TessoLogo } from './TessoLogo'
import { useAppStore } from '../store/useAppStore'
import { formatSpeed } from '../utils/format'
import { useProxyStatus } from '../hooks/useProxyStatus'

export function TessoTitleBar(): React.JSX.Element {
  const downloads = useAppStore((state) => state.downloads)
  const interfaces = useAppStore((state) => state.interfaces)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const openNewDownload = useAppStore((state) => state.openNewDownload)
  const { status: proxyStatus } = useProxyStatus()

  const activeDownloads = Object.values(downloads).filter((d) => d.status === 'downloading')
  const totalSpeed = activeDownloads.reduce((acc, d) => acc + (d.speedBytesPerSec || 0), 0)
  const isDownloading = totalSpeed > 0
  const isProxyActive = Boolean(proxyStatus?.enabled)

  return (
    <header className="h-10 shrink-0 flex items-center justify-between px-3.5 border-b border-[var(--border)] bg-[#08090c]/90 backdrop-blur-md [-webkit-app-region:drag] select-none text-[12px] z-50">
      {/* Left: Brand & Engine Monogram */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        <TessoLogo size={22} />
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[13px] text-white tracking-tight">Tesso</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono font-medium">
            Nexus v1.0
          </span>
        </div>
      </div>

      {/* Center: Live Telemetry & Quick Action */}
      <div className="flex items-center gap-2 font-mono [-webkit-app-region:no-drag]">
        {/* Interfaces Bonded */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f1218] border border-[var(--border)] text-[11px]">
          <span
            className={`size-2 rounded-full ${
              interfaces.length > 0
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {interfaces.length} {interfaces.length === 1 ? 'Adapter' : 'Adapters'} Bonded
          </span>
        </div>

        {/* Live Aggregate Speed */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-all duration-200 ${
            isDownloading
              ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20'
              : 'bg-[#0f1218] border-[var(--border)] text-slate-400 font-medium'
          }`}
        >
          <Activity
            className={`size-3 ${isDownloading ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}
          />
          <span>{isDownloading ? formatSpeed(totalSpeed, speedUnit) : '0 B/s (Standby)'}</span>
        </div>

        {/* Browser Multi-WAN Proxy Beacon */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f1218] border border-[var(--border)] text-[11px]">
          <Globe className={`size-3 ${isProxyActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="text-slate-300 font-medium">
            {isProxyActive ? `Proxy :${proxyStatus?.port || 9090}` : 'Proxy Idle'}
          </span>
        </div>

        {/* Quick Launch Transfer Button */}
        <button
          onClick={() => openNewDownload()}
          title="Start new accelerated transfer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
        >
          <Plus className="size-3 stroke-[2.5]" />
          <span>New</span>
        </button>
      </div>

      {/* Right: Engine Indicator (leaving margin for Windows native caption buttons) */}
      <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-slate-400 pr-36 [-webkit-app-region:no-drag]">
        <ShieldCheck className="size-3.5 text-emerald-400" />
        <span className="text-[10.5px]">Zero-Cost Client-Side Bonding</span>
      </div>
    </header>
  )
}
