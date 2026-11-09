import React from 'react'
import { Activity, ArrowDownToLine, Globe, HardDrive, Network, Plus, Settings } from 'lucide-react'
import { TessoLogo } from './TessoLogo'
import { formatBytes, formatSpeed } from '../utils/format'
import { useFreeSpace } from '../hooks/useFreeSpace'
import { useAppStore } from '../store/useAppStore'
import { useProxyStatus } from '../hooks/useProxyStatus'

export type StudioTab = 'dashboard' | 'transfers' | 'browser' | 'adapters' | 'settings'

interface TessoNavigationDeckProps {
  activeTab: StudioTab
  onSelectTab: (tab: StudioTab) => void
  onOpenNewDownload: () => void
}

export function TessoNavigationDeck({
  activeTab,
  onSelectTab,
  onOpenNewDownload
}: TessoNavigationDeckProps): React.JSX.Element {
  const interfaces = useAppStore((state) => state.interfaces)
  const downloads = useAppStore((state) => state.downloads)
  const destinationDir = useAppStore((state) => state.destinationDir)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const freeSpace = useFreeSpace(destinationDir)
  const { status: proxyStatus } = useProxyStatus()

  const activeDownloads = Object.values(downloads).filter((d) => d.status === 'downloading')
  const totalSpeed = activeDownloads.reduce((acc, d) => acc + (d.speedBytesPerSec || 0), 0)
  const activeDownloadsCount = activeDownloads.length
  const activeInterfacesCount = interfaces.length || 0
  const isProxyActive = Boolean(proxyStatus?.enabled)

  const navItems = [
    {
      id: 'dashboard' as StudioTab,
      label: 'Nexus Command',
      icon: Activity,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/15 text-emerald-400'
    },
    {
      id: 'transfers' as StudioTab,
      label: 'Transfers Studio',
      icon: ArrowDownToLine,
      counter: activeDownloadsCount
    },
    {
      id: 'browser' as StudioTab,
      label: 'Browser Multi-WAN',
      icon: Globe,
      badge: isProxyActive ? 'PAC' : undefined,
      badgeColor: 'bg-cyan-500/15 text-cyan-400'
    },
    {
      id: 'adapters' as StudioTab,
      label: 'Hardware Deck',
      icon: Network,
      counter: activeInterfacesCount
    },
    {
      id: 'settings' as StudioTab,
      label: 'Engine Settings',
      icon: Settings
    }
  ]

  return (
    <aside className="hidden min-[860px]:flex w-60 flex-col border-r border-[var(--border)] bg-[#08090c] select-none shrink-0 transition-all">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <TessoLogo size={28} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] text-white tracking-tight">Tesso</span>
              <span className="text-[9px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.2 rounded">
                STUDIO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
              Multi-Network Engine
            </span>
          </div>
        </div>
      </div>

      {/* Primary Ingestion Trigger */}
      <div className="p-3">
        <button
          onClick={onOpenNewDownload}
          aria-label="New transfer"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-[12.5px] text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-sm shadow-cyan-500/20 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Main Navigation Deck Links */}
      <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#161b24]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`size-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`font-mono text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}

              {typeof item.counter === 'number' && (
                <span
                  className={`size-4.5 flex items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    item.counter > 0
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/40'
                      : 'text-slate-500 bg-[#161b24]'
                  }`}
                >
                  {item.counter}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Deck Telemetry & Hardware Gauges */}
      <div className="p-3 border-t border-[var(--border)] bg-[#0c1017] space-y-2.5">
        {/* Live Bonded Throughput Mini-Card */}
        <div className="p-2.5 rounded-lg bg-[#08090c] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${
                  totalSpeed > 0 ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
                }`}
              />
              Bonded Output
            </span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">
              {totalSpeed > 0 ? `${activeInterfacesCount} NICs` : 'IDLE'}
            </span>
          </div>
          <div className="font-mono text-[13px] font-bold text-white tracking-tight">
            {formatSpeed(totalSpeed, speedUnit)}
          </div>
        </div>

        {/* Local Storage Target Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
          <HardDrive className="size-3.5 text-slate-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-400 truncate">Free Space</span>
              <span className="font-mono text-slate-300 font-medium">
                {freeSpace !== null ? formatBytes(freeSpace) : 'Detecting...'}
              </span>
            </div>
            {freeSpace !== null && (
              <div className="w-full bg-[#161b24] h-1 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, (freeSpace / (1024 * 1024 * 1024 * 500)) * 100)
                    )}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
