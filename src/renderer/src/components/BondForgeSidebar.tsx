import React from 'react'
import { Flame, ArrowDownToLine, Network, Settings, HardDrive, Zap, Activity } from 'lucide-react'
import { formatBytes } from '../utils/format'
import { useFreeSpace } from '../hooks/useFreeSpace'
import { useAppStore } from '../store/useAppStore'

export type StudioTab = 'dashboard' | 'transfers' | 'adapters' | 'settings'

interface BondForgeSidebarProps {
  activeTab: StudioTab
  onSelectTab: (tab: StudioTab) => void
  onOpenNewDownload: () => void
}

export function BondForgeSidebar({
  activeTab,
  onSelectTab,
  onOpenNewDownload
}: BondForgeSidebarProps): React.JSX.Element {
  const interfaces = useAppStore((state) => state.interfaces)
  const downloads = useAppStore((state) => state.downloads)
  const destinationDir = useAppStore((state) => state.destinationDir)
  const freeSpace = useFreeSpace(destinationDir)

  const activeDownloadsCount = Object.values(downloads).filter(
    (d) => d.status === 'downloading'
  ).length

  const activeInterfacesCount = interfaces.length || 3

  return (
    <aside className="w-64 flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--border)]">
        <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/20 text-white">
          <Flame className="size-5 animate-pulse text-cyan-200" />
          <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-[var(--bg-secondary)]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-[15px] text-white">
            <span>BOND</span>
            <span className="text-cyan-400">FORGE</span>
          </div>
          <span className="font-mono text-[10px] text-[var(--text-tertiary)] tracking-widest uppercase">
            Bonding Engine v1.0
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenNewDownload}
          aria-label="New download"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-[13.5px] text-[#02192e] bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 shadow-md shadow-cyan-500/25 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <Zap className="size-4 fill-current" />
          <span>New download</span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity className="size-4" />
            <span>Forge Deck</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
            LIVE
          </span>
        </button>

        <button
          onClick={() => onSelectTab('transfers')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <ArrowDownToLine className="size-4" />
            <span>Transfers & Queue</span>
          </div>
          {activeDownloadsCount > 0 && (
            <span className="size-5 flex items-center justify-center rounded-full bg-cyan-500 text-black font-mono text-[11px] font-bold">
              {activeDownloadsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('adapters')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'adapters'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Network className="size-4" />
            <span>Hardware Adapters</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400">
            {activeInterfacesCount} active
          </span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="size-4" />
          <span>Engine Settings</span>
        </button>
      </nav>

      {/* Storage & Telemetry Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/50">
        <div className="flex items-center gap-2 mb-2 text-[12px] text-[var(--text-secondary)] font-mono">
          <HardDrive className="size-3.5 text-cyan-400" />
          <span>Storage NVMe</span>
        </div>
        <div className="flex justify-between items-baseline text-[11.5px] font-mono text-slate-300">
          <span>Free Available:</span>
          <span className="font-bold text-cyan-300">
            {freeSpace !== null ? formatBytes(freeSpace) : '240.0 GB'}
          </span>
        </div>
        <div className="w-full h-1.5 mt-2 rounded-full bg-[var(--track-bg)] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[68%]" />
        </div>
      </div>
    </aside>
  )
}
