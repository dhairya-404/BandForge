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

/** MB/s or Mbps unit selector styled as modern dynamic pills */
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
            className="h-[24px] rounded-md border border-[var(--border)] bg-[var(--bg-tertiary)] p-0.5 [-webkit-app-region:no-drag]"
          >
            {(['bytes', 'bits'] as const).map((unit) => (
              <ToggleGroupItem
                key={unit}
                value={unit}
                className="h-full rounded-[4px] px-2 font-mono text-[10.5px] font-medium text-[var(--text-secondary)] aria-pressed:bg-cyan-500/15 aria-pressed:text-cyan-600 dark:aria-pressed:text-cyan-300 aria-pressed:border aria-pressed:border-cyan-500/30 transition-all cursor-pointer"
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

/** Tesso High-Tech Telemetry Status Deck */
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
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 font-mono text-[11px] select-none text-[var(--text-secondary)] z-20 transition-colors duration-150">
      {/* Left Telemetry Pills */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hardware Interfaces Conduit Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text)] transition-colors">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-cyan-500" />
          </span>
          <span className="font-semibold text-[var(--text)]">
            {activeInterfaces.length || interfaces.length}
          </span>
          <span className="text-[var(--text-secondary)] text-[10.5px]">CONDUITS BONDED</span>
        </div>

        {/* Free Storage Visual */}
        {free !== null && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text)] transition-colors">
            <HardDrive className="size-3 text-cyan-500 dark:text-cyan-400" />
            <span className="text-[var(--text)] font-semibold">{formatBytes(free)}</span>
            <span className="text-[var(--text-secondary)] text-[10.5px]">AVAILABLE</span>
          </div>
        )}

        {/* Queue / Processing Indicator */}
        {downloadingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300">
            <Zap className="size-3 text-cyan-500 dark:text-cyan-400 animate-pulse" />
            <span className="font-semibold">{downloadingCount}</span>
            <span className="text-[10.5px]">ACTIVE</span>
          </div>
        )}

        {waitingCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300">
            <Layers className="size-3 text-amber-500 dark:text-amber-400" />
            <span>{waitingCount} QUEUED</span>
          </div>
        )}

        {/* Browser Proxy Badge */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10.5px] transition-colors ${
            isProxyActive
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
              : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-tertiary)]'
          }`}
        >
          <Globe className="size-3" />
          <span>PROXY: {isProxyActive ? '802.3ad PAC :9091' : 'OFFLINE'}</span>
        </div>

        {message && (
          <span className="truncate text-[var(--text-secondary)] hidden xl:inline">{message}</span>
        )}
      </div>

      {/* Right Controls & Toggles */}
      <div className="flex shrink-0 items-center gap-3">
        <UpdateIndicator />

        {/* Slow Mode Precision Switch */}
        <Tooltip>
          <TooltipTrigger
            render={
              <label className="flex items-center gap-2 cursor-pointer px-2 py-0.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
                <span className="text-[11px] text-[var(--text-secondary)]">Slow Mode</span>
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
