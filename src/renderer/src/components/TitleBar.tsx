import React from 'react'
import { ShieldCheck, Activity } from 'lucide-react'
import { TessoLogo } from './TessoLogo'
import { useAppStore } from '../store/useAppStore'
import { formatSpeed } from '../utils/format'

export function TitleBar(): React.JSX.Element {
  const downloads = useAppStore((state) => state.downloads)
  const interfaces = useAppStore((state) => state.interfaces)
  const speedUnit = useAppStore((state) => state.speedUnit)

  const activeDownloads = Object.values(downloads).filter((d) => d.status === 'downloading')

  const totalSpeed = activeDownloads.reduce((acc, d) => {
    return acc + (d.speedBytesPerSec || 0)
  }, 0)

  const isDownloading = totalSpeed > 0

  return (
    <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[#070b13] [-webkit-app-region:drag] select-none text-[12px]">
      {/* Left: Brand Badge */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        <TessoLogo size={20} />
        <span className="font-bold text-white tracking-tight">Tesso</span>
        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
          v1.0
        </span>
      </div>

      {/* Center: Live Telemetry Pill */}
      <div className="flex items-center gap-2 font-mono [-webkit-app-region:no-drag]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-medium">{interfaces.length} Interfaces Bonded</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors ${
            isDownloading
              ? 'bg-sky-950/60 border-sky-500/40 text-sky-300 font-bold'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 font-medium'
          }`}
        >
          <Activity
            className={`size-3 ${isDownloading ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`}
          />
          <span>{isDownloading ? formatSpeed(totalSpeed, speedUnit) : '0 B/s (Standby)'}</span>
        </div>
      </div>

      {/* Right: Zero Cost Client-Side Indicator */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 [-webkit-app-region:no-drag]">
        <ShieldCheck className="size-3.5 text-emerald-400" />
        <span>Client-Side Binding ($0 Server)</span>
      </div>
    </div>
  )
}
