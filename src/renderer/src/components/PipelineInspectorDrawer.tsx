import React from 'react'
import type { DownloadState, FinishedDownload } from '@shared/types'
import { X, FolderOpen, Pause, Play, Trash2, Network, Activity, Layers } from 'lucide-react'
import { formatBytes, formatEta, formatPercent, formatSpeed, wantedBytes } from '../utils/format'
import { useAppStore } from '../store/useAppStore'
import { useNetworkVisuals } from '../hooks/useNetworkVisuals'
import { useDownloadActions } from './downloadActionsContext'

interface PipelineInspectorDrawerProps {
  download: DownloadState | FinishedDownload | null
  onClose: () => void
}

export function PipelineInspectorDrawer({
  download,
  onClose
}: PipelineInspectorDrawerProps): React.JSX.Element | null {
  const speedUnit = useAppStore((state) => state.speedUnit)
  const networkVisual = useNetworkVisuals()
  const interfaces = useAppStore((state) => state.interfaces)
  const actions = useDownloadActions()

  if (!download) return null

  const isFinished = 'unitsWritten' in download || download.status === 'completed'
  const isPaused = !isFinished && download.status === 'paused'
  const isDownloading = !isFinished && download.status === 'downloading'

  const fileName = download.fileName || 'Transfer Item'
  const total = wantedBytes(download)
  const downloaded = isFinished ? total : download.bytesDownloaded
  const percent = formatPercent(downloaded, total)
  const speed = !isFinished && isDownloading ? download.speedBytesPerSec || 0 : 0
  const eta = !isFinished && isDownloading && speed > 0 ? (total - downloaded) / speed : null

  const handlePauseResume = async (): Promise<void> => {
    if (isFinished) return
    if (isDownloading) {
      await actions.perform('pause', [download])
    } else {
      await actions.perform('resume', [download])
    }
  }

  const handleOpenFolder = async (): Promise<void> => {
    await actions.perform('reveal', [download])
  }

  const handleTrash = async (): Promise<void> => {
    await actions.perform(isFinished ? 'trash' : 'cancel', [download])
    onClose()
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0c1017]/95 backdrop-blur-xl border-l border-[var(--border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Top Header */}
      <div className="h-14 px-5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[#08090c]/80">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="size-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-[13.5px] text-white tracking-tight truncate">
            Pipeline Stream Inspector
          </span>
        </div>
        <button
          onClick={onClose}
          className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#161b24] transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* File Overview Card */}
        <div className="p-4 rounded-xl bg-[#0f141f] border border-[var(--border)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {download.kind || 'HTTP STREAM'}
              </span>
              <h2 className="text-[14px] font-bold text-white tracking-tight mt-1.5 break-all">
                {fileName}
              </h2>
            </div>
            {isFinished ? (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                FINISHED
              </span>
            ) : (
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  isDownloading
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                    : isPaused
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                      : 'bg-slate-700 text-slate-300'
                }`}
              >
                {download.status.toUpperCase()}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">{percent}% Completed</span>
              <span className="text-slate-200">{formatBytes(total)}</span>
            </div>
            <div className="h-1.5 w-full bg-[#18202d] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-400 to-sky-400'
                }`}
                style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
              />
            </div>
          </div>

          {/* Live Telemetry Tickers */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
            <div className="p-2 rounded-lg bg-[#141a27]">
              <span className="text-[10px] font-mono text-slate-400 block">THROUGHPUT</span>
              <span className="text-[13px] font-mono font-bold text-cyan-300">
                {formatSpeed(speed, speedUnit)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#141a27]">
              <span className="text-[10px] font-mono text-slate-400 block">ESTIMATED TIME</span>
              <span className="text-[13px] font-mono font-bold text-slate-200">
                {eta !== null ? formatEta(eta) : isFinished ? 'Complete' : 'Calculating...'}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Stream Chunk Heatmap Visualizer */}
        <div className="p-4 rounded-xl bg-[#0f141f] border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-cyan-400" />
              <h3 className="text-[13px] font-bold text-white tracking-tight">
                Multi-Stream Byte Heatmap
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Parallel Range Heatmap</span>
          </div>

          {/* Heatmap Blocks */}
          <div className="p-2.5 rounded-lg bg-[#08090c] border border-[var(--border)]">
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 48 }).map((_, idx) => {
                const isBlockDone = (idx / 48) * 100 <= percent
                const isHead = Math.floor((percent / 100) * 48) === idx
                return (
                  <div
                    key={idx}
                    className={`h-4 rounded-xs transition-all duration-150 ${
                      isBlockDone
                        ? 'bg-cyan-500/80 shadow-xs shadow-cyan-500/20'
                        : isHead && isDownloading
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-[#18202d]'
                    }`}
                    title={`Byte Range Block ${idx + 1}/48`}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-400" />
              <span>Received Chunks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400" />
              <span>Active Buffer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#18202d]" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Bonded Hardware Channels Breakdown */}
        <div className="p-4 rounded-xl bg-[#0f141f] border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="size-4 text-emerald-400" />
              <h3 className="text-[13px] font-bold text-white tracking-tight">
                Bonded Hardware Channels
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {interfaces.length} ACTIVE
            </span>
          </div>

          <div className="space-y-2">
            {interfaces.map((iface, i) => {
              const visual = networkVisual(iface.id, iface.kind, iface.displayName)
              return (
                <div
                  key={iface.id || i}
                  className="p-2.5 rounded-lg bg-[#141a27] border border-[var(--border)] flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white truncate">{visual.name}</span>
                    <span className="text-[9.5px] font-mono text-cyan-400 uppercase px-1 py-0.2 rounded bg-cyan-500/10">
                      {iface.kind}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 font-medium">
                    {isDownloading
                      ? `${Math.round(100 / interfaces.length)}% Stream Share`
                      : 'Standby'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="h-16 px-5 border-t border-[var(--border)] bg-[#08090c] flex items-center justify-between shrink-0">
        <button
          onClick={handleTrash}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-[12px] font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="size-4" />
          <span>Remove</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161b24] hover:bg-[#1f2633] text-slate-200 border border-[var(--border)] text-[12px] font-medium transition-colors cursor-pointer"
          >
            <FolderOpen className="size-4" />
            <span>Open Folder</span>
          </button>

          {!isFinished && (
            <button
              onClick={handlePauseResume}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                isDownloading
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
              }`}
            >
              {isDownloading ? (
                <>
                  <Pause className="size-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Resume</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
