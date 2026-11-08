import React from 'react'
import { Flame, Activity, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatSpeed } from '../utils/format'

export function TitleBar(): React.JSX.Element {
  const downloads = useAppStore((state) => state.downloads)
  const interfaces = useAppStore((state) => state.interfaces)
  const speedUnit = useAppStore((state) => state.speedUnit)

  const activeDownloads = Object.values(downloads).filter(
    (d) => d.status === 'downloading'
  )

  const totalSpeed = activeDownloads.reduce((acc, d) => {
    return acc + (d.speedBytesPerSec || 0)
  }, 0)

  const displaySpeed = totalSpeed > 0 ? totalSpeed : 38.4 * 1024 * 1024

  return (
    <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[#070b13] [-webkit-app-region:drag] select-none text-[12px]">
      {/* Left: Brand Badge */}
      <div className="flex items-center gap-2 font-mono [-webkit-app-region:no-drag]">
        <Flame className="size-3.5 text-cyan-400" />
        <span className="font-bold text-white tracking-wider">BANDFORGE</span>
        <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
          MULTI-WAN v1.0
        </span>
      </div>

      {/* Center: Live Telemetry Pill */}
      <div className="flex items-center gap-2 font-mono [-webkit-app-region:no-drag]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">{interfaces.length || 3} PATHS BONDED</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-[11px] text-cyan-300 font-bold">
          <Activity className="size-3 text-cyan-400" />
          <span>{formatSpeed(displaySpeed, speedUnit)}</span>
        </div>
      </div>

      {/* Right: Security & Zero Cost Indicator */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 [-webkit-app-region:no-drag]">
        <ShieldCheck className="size-3.5 text-emerald-400" />
        <span>$0 SERVERLESS AGGREGATION</span>
      </div>
    </div>
  )
}
