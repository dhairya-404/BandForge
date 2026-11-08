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
  Plus
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

  const api =
    typeof window !== 'undefined' ? window.bondforge || window.plexo : undefined

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 select-none">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowDownToLine className="size-5 text-sky-400" />
            <span>Transfers & Queue Manager</span>
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Real-time chunk allocation, active downloads, and historical transfers.
          </p>
        </div>

        <button
          onClick={onOpenNewDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[13px] shadow-sm shadow-sky-600/30 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>New Transfer</span>
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
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
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
            placeholder="Search transfers..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070b13] border border-slate-800 text-[12.5px] text-white placeholder-slate-500 outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Downloads List */}
      <div className="space-y-3">
        {filteredActive.length === 0 && filteredHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center bg-[#0a0f1d]">
            <ArrowDownToLine className="size-8 text-sky-400/50 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">No transfers in queue</h3>
            <p className="text-[13px] text-slate-400 mt-1">
              Add a URL link to initiate multi-WAN bonded acceleration.
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
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3 hover:border-sky-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-white truncate">
                          {dl.fileName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                          BONDED
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11.5px] font-mono text-slate-400 mt-1.5">
                        <span>
                          {formatBytes(dl.bytesDownloaded || 0)} / {formatBytes(dl.totalBytes || 0)}
                        </span>
                        <span>•</span>
                        <span className="text-sky-300 font-semibold">
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
                          onClick={() => api?.pauseDownload?.(dl.id)}
                          className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Pause"
                        >
                          <Pause className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => api?.resumeDownload?.(dl.id)}
                          className="size-8 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 flex items-center justify-center text-sky-300 transition-colors cursor-pointer"
                          title="Resume"
                        >
                          <Play className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => api?.revealDownload?.(dl.id)}
                        className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Show in Folder"
                      >
                        <FolderOpen className="size-3.5" />
                      </button>
                      <button
                        onClick={() => api?.cancelDownload?.(dl.id)}
                        className="size-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Network Progress */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
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
                    <h4 className="text-[13.5px] font-semibold text-white truncate">
                      {item.fileName}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      COMPLETED
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px] font-mono text-slate-400 mt-1">
                    <span>{formatBytes(item.totalBytes)}</span>
                    <span>•</span>
                    <span>Speed: {formatSpeed(item.speedBytesPerSec || 0, speedUnit)}</span>
                    <span>•</span>
                    <span>Saved to local disk</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => api?.revealDownload?.(item.id)}
                    className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Open File"
                  >
                    <FolderOpen className="size-3.5" />
                  </button>
                  <button
                    onClick={() => api?.removeDownload?.(item.id)}
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
