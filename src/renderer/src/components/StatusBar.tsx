import React from 'react'
import type { SpeedUnit } from '@shared/types'
import { HardDrive, Layers, Globe, Zap } from 'lucide-react'
import { useFreeSpace } from '../hooks/useFreeSpace'
import { useAppStore } from '../store/useAppStore'
import { formatBytes } from '../utils/format'
import { useFormatSpeedLimit } from '../hooks/useFormatSpeed'
import { useDownloadSchedule } from '../hooks/useDownloadSchedule'
import { useProxyStatus } from '../hooks/useProxyStatus'
import { Switch } from './ui/switch'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { UpdateIndicator } from './UpdateIndicator'

/** MB/s or Mbps unit selector styled as modern obsidian pills */
function SpeedUnitToggle(): React.JSX.Element {
  const speedUnit = useAppStore((store) => store.speedUnit)
  const setSpeedUnit = useAppStore((store) => store.setSpeedUnit)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToggleGroup
            aria-label="Speed units"
            value={[speedUnit]}
            onValueChange={(values) => {
              if (values[0] !== undefined) setSpeedUnit(values[0] as SpeedUnit)
            }}
            size="xs"
            spacing={0.5}
            className="h-[24px] rounded-md border border-[#1f2633] bg-[#0c0e14] p-0.5 [-webkit-app-region:no-drag]"
          >
            {(['bytes', 'bits'] as const).map((unit) => (
              <ToggleGroupItem
                key={unit}
                value={unit}
                className="h-full rounded-[4px] px-2 font-mono text-[10.5px] font-medium text-slate-400 aria-pressed:bg-cyan-500/15 aria-pressed:text-cyan-300 aria-pressed:border aria-pressed:border-cyan-500/30 transition-all cursor-pointer"
              >
                {unit === 'bytes' ? 'MB/s' : 'Mbps'}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />
      <TooltipContent>Toggle between Megabytes per sec (MB/s) and Megabits (Mbps)</TooltipContent>
    </Tooltip>
  )
}

/** Tesso High-Tech Obsidian Telemetry Status Deck */
export function StatusBar(): React.JSX.Element {
  const formatSpeedLimit = useFormatSpeedLimit()
  const { message } = useDownloadSchedule()

  const downloads = useAppStore((store) => store.downloads)
  const interfaces = useAppStore((store) => store.interfaces)
  const slowMode = useAppStore((store) => store.slowMode)
  const slowModeSpeed = useAppStore((store) => store.slowModeSpeed)
  const setSlowMode = useAppStore((store) => store.setSlowMode)
  const destinationDir = useAppStore((store) => store.destinationDir)
  const free = useFreeSpace(destinationDir)
  const { status: proxyStatus } = useProxyStatus()

  const activeDownloads = Object.values(downloads)
  const downloadingCount = activeDownloads.filter((d) => d.status === 'downloading').length
  const waitingCount = activeDownloads.filter((d) => d.status === 'queued').length
  const activeInterfaces = interfaces.filter(
    (i) => !i.addresses.some((a) => a.address === '127.0.0.1')
  )
  const isProxyActive = proxyStatus?.enabled ?? false

  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[#1f2633] bg-[#08090c] px-4 py-2 font-mono text-[11px] select-none text-slate-400 z-20">
      {/* Left Telemetry Pills */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hardware Interfaces Conduit Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f1218] border border-[#1f2633] text-slate-300">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-cyan-500" />
          </span>
          <span className="font-semibold text-slate-200">
            {activeInterfaces.length || interfaces.length}
          </span>
          <span className="text-slate-400 text-[10.5px]">CONDUITS BONDED</span>
        </div>

        {/* Free Storage Visual */}
        {free !== null && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f1218] border border-[#1f2633] text-slate-300">
            <HardDrive className="size-3 text-cyan-400" />
            <span className="text-slate-200 font-semibold">{formatBytes(free)}</span>
            <span className="text-slate-400 text-[10.5px]">AVAILABLE</span>
          </div>
        )}

        {/* Queue / Processing Indicator */}
        {downloadingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-800/50 text-cyan-300">
            <Zap className="size-3 text-cyan-400 animate-pulse" />
            <span className="font-semibold">{downloadingCount}</span>
            <span className="text-[10.5px]">ACTIVE</span>
          </div>
        )}

        {waitingCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-950/30 border border-amber-800/40 text-amber-300">
            <Layers className="size-3 text-amber-400" />
            <span>{waitingCount} QUEUED</span>
          </div>
        )}

        {/* Browser Proxy Badge */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10.5px] transition-colors ${
            isProxyActive
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-[#0f1218] border-[#1f2633] text-slate-500'
          }`}
        >
          <Globe className="size-3" />
          <span>PROXY: {isProxyActive ? '802.3ad PAC :9091' : 'OFFLINE'}</span>
        </div>

        {message && <span className="truncate text-slate-400 hidden xl:inline">{message}</span>}
      </div>

      {/* Right Controls & Toggles */}
      <div className="flex shrink-0 items-center gap-3">
        <UpdateIndicator />

        {/* Slow Mode Precision Switch */}
        <Tooltip>
          <TooltipTrigger
            render={
              <label className="flex items-center gap-2 cursor-pointer px-2 py-0.5 rounded-md hover:bg-white/5 transition-colors">
                <span className="text-[11px] text-slate-400">Slow Mode</span>
                <Switch checked={slowMode} onCheckedChange={setSlowMode} className="scale-85" />
              </label>
            }
          />
          <TooltipContent>
            Cap aggregated pipeline speed to {formatSpeedLimit(slowModeSpeed)}
          </TooltipContent>
        </Tooltip>

        {/* Speed Unit Selector */}
        <SpeedUnitToggle />
      </div>
    </footer>
  )
}
