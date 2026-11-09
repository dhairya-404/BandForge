import React, { useState } from 'react'
import type { DownloadState, FinishedDownload } from '@shared/types'
import {
  ArrowDownToLine,
  Search,
  Pause,
  Play,
  FolderOpen,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  Layers,
  Activity,
  Info
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatBytes, formatEta, formatPercent, formatSpeed, wantedBytes } from '../utils/format'
import { PipelineInspectorDrawer } from '../components/PipelineInspectorDrawer'
import { useNetworkVisuals } from '../hooks/useNetworkVisuals'
import { useDownloadActions } from '../components/downloadActionsContext'

type FilterType = 'all' | 'active' | 'queued' | 'paused' | 'completed' | 'failed'

export function PipelineStudioScreen(): React.JSX.Element {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [inspectedId, setInspectedId] = useState<string | null>(null)

  const downloads = useAppStore((state) => state.downloads)
  const history = useAppStore((state) => state.history)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const interfaces = useAppStore((state) => state.interfaces)
  const openNewDownload = useAppStore((state) => state.openNewDownload)
  const view = useAppStore((state) => state.view)
  const setView = useAppStore((state) => state.setView)
  const networkVisual = useNetworkVisuals()
  const actions = useDownloadActions()

  // Derive inspected download directly from either store view or local selection
  const activeInspectedId = view.name === 'download' ? view.id : inspectedId
  const inspectedDownload: DownloadState | FinishedDownload | null = activeInspectedId
    ? (downloads[activeInspectedId] ?? history.find((h) => h.id === activeInspectedId) ?? null)
    : null

  const handleCloseInspector = (): void => {
    setInspectedId(null)
    if (view.name === 'download') {
      setView({ name: 'list' })
    }
  }

  const activeList = Object.values(downloads)

  // Filtered lists
  const filteredActive = activeList.filter((d) => {
    if (filter === 'active' && d.status !== 'downloading') return false
    if (filter === 'queued' && d.status !== 'queued') return false
    if (filter === 'paused' && d.status !== 'paused') return false
    if (filter === 'failed' && d.status !== 'error') return false
    if (filter === 'completed') return false
    if (search && !d.fileName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const filteredHistory = history.filter((h) => {
    if (filter === 'active' || filter === 'paused' || filter === 'queued' || filter === 'failed')
      return false
    if (search && !h.fileName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalActiveSpeed = activeList.reduce((acc, d) => {
    return d.status === 'downloading' ? acc + (d.speedBytesPerSec || 0) : acc
  }, 0)

  const handlePauseResume = async (d: DownloadState): Promise<void> => {
    if (d.status === 'downloading') {
      await actions.perform('pause', [d])
    } else {
      await actions.perform('resume', [d])
    }
  }

  const handleOpenFolder = async (d: DownloadState | FinishedDownload): Promise<void> => {
    await actions.perform('reveal', [d])
  }

  const handleTrash = async (d: DownloadState | FinishedDownload): Promise<void> => {
    const isFinished = 'unitsWritten' in d || d.status === 'completed'
    await actions.perform(isFinished ? 'trash' : 'cancel', [d])
  }

  const totalCount = activeList.length + history.length
  const downloadingCount = activeList.filter((d) => d.status === 'downloading').length
  const queuedCount = activeList.filter((d) => d.status === 'queued').length
  const pausedCount = activeList.filter((d) => d.status === 'paused').length

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none bg-[#08090c]">
      {/* Top Header & Search Console */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Pipeline Transfers Studio
            </h1>
          </div>
          <p className="text-[12.5px] text-slate-400 mt-0.5">
            Real-time multi-network parallel chunk streams & high-throughput pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter transfers..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0f1218] border border-[var(--border)] text-[12.5px] text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50 w-44 sm:w-56 font-sans transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* New Transfer Trigger */}
          <button
            onClick={() => openNewDownload()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-[12px] shadow-sm shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Aggregate Rate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Transfers', count: totalCount },
              { id: 'active', label: 'Active', count: downloadingCount },
              { id: 'queued', label: 'Queued', count: queuedCount },
              { id: 'paused', label: 'Paused', count: pausedCount },
              { id: 'completed', label: 'Completed', count: history.length }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#161b24]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#161b24] text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {totalActiveSpeed > 0 && (
          <div className="flex items-center gap-2 font-mono text-[11.5px] text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30">
            <Activity className="size-3.5 animate-pulse text-cyan-400" />
            <span>Aggregated Speed: {formatSpeed(totalActiveSpeed, speedUnit)}</span>
          </div>
        )}
      </div>

      {/* Active Pipeline Cards */}
      <div className="space-y-3">
        {filteredActive.length === 0 && filteredHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[#0c1017]/50 p-12 text-center select-none">
            <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
              <ArrowDownToLine className="size-6 text-cyan-400" />
            </div>
            <h3 className="text-[15px] font-bold text-white tracking-tight">
              {search ? 'No matching pipelines found' : 'No transfers active in queue'}
            </h3>
            <p className="text-[12.5px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              {search
                ? 'Try a different search query or reset the filter.'
                : 'Accelerate downloads by aggregating Wi-Fi, Ethernet, and Mobile Tethering.'}
            </p>
            <button
              onClick={() => openNewDownload()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[12.5px] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-cyan-500/30 active:scale-95"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>Start New Pipeline</span>
            </button>
          </div>
        ) : (
          <>
            {/* Active Transfers */}
            {filteredActive.map((d) => {
              const isDownloading = d.status === 'downloading'
              const isPaused = d.status === 'paused'
              const total = wantedBytes(d)
              const percent = formatPercent(d.bytesDownloaded, total)
              const speed = isDownloading ? d.speedBytesPerSec || 0 : 0
              const eta = isDownloading && speed > 0 ? (total - d.bytesDownloaded) / speed : null

              return (
                <div
                  key={d.id}
                  onClick={() => setInspectedId(d.id)}
                  className="rounded-2xl border border-[var(--border)] bg-[#0f1218] hover:border-cyan-500/40 p-4.5 transition-all duration-150 cursor-pointer shadow-lg group space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {d.kind || 'STREAM'}
                        </span>
                        <span
                          className={`text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            isDownloading
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isPaused
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-[14px] text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                        {d.fileName}
                      </h3>
                    </div>

                    {/* Inline Quick Actions */}
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => void handlePauseResume(d)}
                        title={isDownloading ? 'Pause' : 'Resume'}
                        className="size-8 rounded-lg bg-[#161b24] hover:bg-[#1f2633] text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {isDownloading ? (
                          <Pause className="size-3.5" />
                        ) : (
                          <Play className="size-3.5 fill-current" />
                        )}
                      </button>

                      <button
                        onClick={() => void handleOpenFolder(d)}
                        title="Open containing folder"
                        className="size-8 rounded-lg bg-[#161b24] hover:bg-[#1f2633] text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <FolderOpen className="size-3.5" />
                      </button>

                      <button
                        onClick={() => void handleTrash(d)}
                        title="Remove transfer"
                        className="size-8 rounded-lg bg-[#161b24] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-300 font-bold">{percent}%</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">
                          {formatBytes(d.bytesDownloaded)} of {formatBytes(total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {eta !== null && (
                          <span className="text-slate-400">
                            ETA:{' '}
                            <span className="text-slate-200 font-medium">{formatEta(eta)}</span>
                          </span>
                        )}
                        <span className="text-cyan-300 font-bold">
                          {formatSpeed(speed, speedUnit)}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#18202d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(1, Math.min(100, percent))}%` }}
                      />
                    </div>
                  </div>

                  {/* Bonded Interfaces Contributing */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {interfaces.map((iface, i) => {
                        const visual = networkVisual(iface.id, iface.kind, iface.displayName)
                        return (
                          <span
                            key={iface.id || i}
                            className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#141a27] text-slate-300 border border-[var(--border)] flex items-center gap-1"
                          >
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            <span>{visual.name}</span>
                          </span>
                        )
                      })}
                    </div>
                    <span className="text-[10.5px] font-mono text-cyan-400 group-hover:underline flex items-center gap-1">
                      <span>Inspect Heatmap</span>
                      <Info className="size-3" />
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Completed Transfers from History */}
            {filteredHistory.map((h) => (
              <div
                key={h.id}
                onClick={() => setInspectedId(h.id)}
                className="rounded-2xl border border-[var(--border)] bg-[#0f1218]/70 hover:border-cyan-500/30 p-4 transition-all duration-150 cursor-pointer shadow-sm group flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-4.5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[13.5px] text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                      {h.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                      <span className="text-emerald-400 font-semibold">100% COMPLETED</span>
                      <span>·</span>
                      <span>{formatBytes(h.totalBytes || 0)}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => void handleOpenFolder(h)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b24] hover:bg-[#1f2633] text-slate-200 border border-[var(--border)] text-[11.5px] font-medium transition-colors cursor-pointer"
                  >
                    <FolderOpen className="size-3.5" />
                    <span className="hidden sm:inline">Folder</span>
                  </button>

                  <button
                    onClick={() => void handleTrash(h)}
                    className="size-8 rounded-lg bg-[#161b24] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Slide-out Inspector Drawer */}
      <PipelineInspectorDrawer download={inspectedDownload} onClose={handleCloseInspector} />
    </div>
  )
}
