import React from 'react'
import {
  Activity,
  ArrowDownToLine,
  Globe,
  HardDrive,
  Network,
  Plus,
  Settings,
  Sun,
  Moon
} from 'lucide-react'
import type { ThemeSource } from '@shared/types'
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
  const themeSource = useAppStore((state) => state.themeSource)
  const setThemeSource = useAppStore((state) => state.setThemeSource)
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
      badgeColor: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
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
      badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
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

  const themes: { id: ThemeSource; label: string; icon: typeof Sun }[] = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun }
  ]

  return (
    <aside className="hidden min-[860px]:flex w-64 flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] select-none shrink-0 transition-colors duration-150">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <TessoLogo size={28} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] text-[var(--text)] tracking-tight">Tesso</span>
              <span className="text-[9px] font-mono font-semibold text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.2 rounded">
                STUDIO
              </span>
            </div>
            <span className="text-[10.5px] text-[var(--text-secondary)] font-mono tracking-tight truncate">
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
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-[13px] text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-sm shadow-cyan-500/25 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="size-4 stroke-[2.5]" />
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`size-4 shrink-0 ${
                    isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-[var(--text-secondary)]'
                  }`}
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
                  className={`size-5 flex items-center justify-center rounded-full font-mono text-[10.5px] font-bold ${
                    item.counter > 0
                      ? 'bg-cyan-500 text-slate-950 shadow-xs shadow-cyan-500/40'
                      : 'text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]'
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
      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)] space-y-2.5 transition-colors">
        {/* Live Bonded Throughput Mini-Card */}
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] transition-colors">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${
                  totalSpeed > 0 ? 'bg-cyan-400 animate-ping' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              />
              Bonded Output
            </span>
            <span className="font-mono text-[10px] text-cyan-500 dark:text-cyan-400 font-bold">
              {totalSpeed > 0 ? `${activeInterfacesCount} NICs` : 'IDLE'}
            </span>
          </div>
          <div className="font-mono text-[13.5px] font-bold text-[var(--text)] tracking-tight">
            {formatSpeed(totalSpeed, speedUnit)}
          </div>
        </div>

        {/* Local Storage Target Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] px-1">
          <HardDrive className="size-3.5 text-[var(--text-tertiary)] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-[var(--text-secondary)] truncate">Free Space</span>
              <span className="font-mono text-[var(--text)] font-medium">
                {freeSpace !== null ? formatBytes(freeSpace) : 'Detecting...'}
              </span>
            </div>
            {freeSpace !== null && (
              <div className="w-full bg-[var(--bg-tertiary)] h-1 rounded-full mt-1 overflow-hidden">
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

        {/* Quick Theme Switcher Deck Bar */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-[10.5px] font-mono text-[var(--text-secondary)] font-medium">
            Appearance
          </span>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
            {themes.map((t) => {
              const active = (themeSource || 'dark') === t.id
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeSource(t.id)}
                  title={`${t.label} mode`}
                  className={`px-2 py-1 rounded-md text-[10.5px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="size-3" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
