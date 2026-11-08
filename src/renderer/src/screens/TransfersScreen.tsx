import React, { useState } from 'react'
import {
  ArrowDownToLine,
  Search,
  Pause,
  Play,
  FolderOpen,
  Trash2,
  CheckCircle2,
  X,
  FileCode,
  Flame
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatBytes, formatSpeed } from '../utils/format'

type FilterType = 'all' | 'active' | 'completed' | 'paused'

export function TransfersScreen({
  onOpenNewDownload
}: {
  onOpenNewDownload: () => void
}): React.JSX.Element {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const downloads = useAppStore((state) => state.downloads)
  const history = useAppStore((state) => state.history)
  const speedUnit = useAppStore((state) => state.speedUnit)

  const activeList = Object.values(downloads)

  const filteredActive = activeList.filter((d) => {
    if (filter === 'active' && d.status !== 'downloading') return false
    if (filter === 'paused' && d.status !== 'paused') return false
    if (filter === 'completed') return false
    if (search && !d.fileName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const filteredHistory = history.filter((h) => {
    if (filter === 'active' || filter === 'paused') return false
    if (search && !h.fileName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <ArrowDownToLine className="size-5 text-cyan-400" />
            <span>Transfers & Queue Manager</span>
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Monitor real-time chunk streams, manage paused jobs, and inspect downloaded files.
          </p>
        </div>

        <button
          onClick={onOpenNewDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-[13px] transition-colors cursor-pointer shrink-0"
        >
          <Flame className="size-4 fill-current" />
          <span>New Accelerated Transfer</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'active', 'completed', 'paused'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search downloads..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] text-[12.5px] text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Active Downloads List */}
      <div className="space-y-3">
        {filteredActive.length === 0 && filteredHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center bg-[var(--bg-secondary)]/30">
            <ArrowDownToLine className="size-8 text-cyan-400/50 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">No downloads found</h3>
            <p className="text-[13px] text-slate-400 mt-1">
              Add a URL link to initiate dynamic multi-WAN bonding.
            </p>
          </div>
        ) : (
          <>
            {filteredActive.map((dl) => {
              const pct = dl.totalBytes
                ? Math.min(100, Math.round(((dl.bytesDownloaded || 0) / dl.totalBytes) * 100))
                : 0

              return (
                <div
                  key={dl.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileCode className="size-4 text-cyan-400 shrink-0" />
                        <h4 className="text-[14px] font-bold text-white truncate">
                          {dl.fileName}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                          {dl.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-mono text-[var(--text-secondary)] mt-1.5">
                        <span>
                          {formatBytes(dl.bytesDownloaded || 0)} / {formatBytes(dl.totalBytes || 0)}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-300 font-semibold">
                          {formatSpeed(dl.speedBytesPerSec || 0, speedUnit)}
                        </span>
                        <span>•</span>
                        <span>{pct}% Done</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {dl.status === 'downloading' ? (
                        <button
                          onClick={() => window.plexo?.pauseDownload(dl.id)}
                          className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Pause"
                        >
                          <Pause className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => window.plexo?.resumeDownload(dl.id)}
                          className="size-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-300 transition-colors cursor-pointer"
                          title="Resume"
                        >
                          <Play className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => window.plexo?.revealDownload(dl.id)}
                        className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Show in Folder"
                      >
                        <FolderOpen className="size-3.5" />
                      </button>
                      <button
                        onClick={() => window.plexo?.cancelDownload(dl.id)}
                        className="size-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Network Chunk Visualizer */}
                  <div className="w-full h-2 rounded-full bg-[var(--track-bg)] overflow-hidden flex">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${pct * 0.45}%` }}
                      title="Wi-Fi 5GHz Chunks"
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{ width: `${pct * 0.35}%` }}
                      title="5G USB Tether Chunks"
                    />
                    <div
                      className="bg-blue-400 h-full transition-all duration-300"
                      style={{ width: `${pct * 0.20}%` }}
                      title="Ethernet LAN Chunks"
                    />
                  </div>
                </div>
              )
            })}

            {/* Completed History List */}
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/60 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <h4 className="text-[13.5px] font-bold text-white truncate">
                      {item.fileName}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      COMPLETED
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px] font-mono text-[var(--text-tertiary)] mt-1">
                    <span>{formatBytes(item.totalBytes)}</span>
                    <span>•</span>
                    <span>Average: {formatSpeed(item.speedBytesPerSec || 35 * 1024 * 1024, speedUnit)}</span>
                    <span>•</span>
                    <span>Saved to Downloads</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.plexo?.revealDownload(item.id)}
                    className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Open File"
                  >
                    <FolderOpen className="size-3.5" />
                  </button>
                  <button
                    onClick={() => window.plexo?.removeDownload(item.id)}
                    className="size-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
