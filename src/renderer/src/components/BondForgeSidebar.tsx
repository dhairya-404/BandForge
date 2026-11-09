import React from 'react'
import { Plus, ArrowDownToLine, Network, Settings, HardDrive, Activity, Globe } from 'lucide-react'
import { TessoLogo } from './TessoLogo'
import { formatBytes } from '../utils/format'
import { useFreeSpace } from '../hooks/useFreeSpace'
import { useAppStore } from '../store/useAppStore'

export type StudioTab = 'dashboard' | 'transfers' | 'adapters' | 'browser' | 'settings'

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

  const activeInterfacesCount = interfaces.length || 0

  return (
    <aside className="hidden min-[860px]:flex w-64 flex-col border-r border-[var(--border)] bg-[#0c121e] select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--border)]">
        <TessoLogo size={32} />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[15px] text-white tracking-tight">Tesso</span>
            <span className="text-[10px] font-mono font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 rounded">
              v1.0
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate font-sans">
            Multi-Network Engine
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenNewDownload}
          aria-label="New download"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-[13px] text-white bg-sky-600 hover:bg-sky-500 shadow-sm shadow-sky-600/30 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity className="size-4" />
            <span>Dashboard</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
            LIVE
          </span>
        </button>

        <button
          onClick={() => onSelectTab('transfers')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <ArrowDownToLine className="size-4" />
            <span>Transfers</span>
          </div>
          {activeDownloadsCount > 0 ? (
            <span className="size-5 flex items-center justify-center rounded-full bg-sky-500 text-slate-950 font-mono text-[11px] font-bold">
              {activeDownloadsCount}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-500">0</span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('adapters')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'adapters'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Network className="size-4" />
            <span>Hardware Deck</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 font-medium">
            {activeInterfacesCount} online
          </span>
        </button>

        <button
          onClick={() => onSelectTab('browser')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'browser'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Globe className="size-4 text-sky-400" />
            <span>Browser Multi-WAN</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-medium">
            PAC
          </span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="size-4" />
          <span>Engine Settings</span>
        </button>
      </nav>

      {/* Storage Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[#090d16]">
        <div className="flex items-center gap-2 mb-1.5 text-[12px] text-slate-400 font-mono">
          <HardDrive className="size-3.5 text-sky-400" />
          <span>Local Storage</span>
        </div>
        <div className="flex justify-between items-baseline text-[11.5px] font-mono text-slate-300">
          <span className="text-slate-500">Available:</span>
          <span className="font-semibold text-sky-300">
            {freeSpace !== null ? formatBytes(freeSpace) : 'Calculating...'}
          </span>
        </div>
        <div className="w-full h-1 mt-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-sky-500 w-[60%]" />
        </div>
      </div>
    </aside>
  )
}

export { BondForgeSidebar as TessoSidebar }
