import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ProbeResult, StartDownloadRequest } from '@shared/types'
import { AlertCircle, ArrowRight, CheckCircle2, FolderOpen, X, Zap } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatBytes } from '../utils/format'
import { useFreeSpace } from '../hooks/useFreeSpace'
import { useNetworkVisuals } from '../hooks/useNetworkVisuals'

type ProbeState =
  | { status: 'idle' }
  | { status: 'probing' }
  | { status: 'ready'; result: ProbeResult }
  | { status: 'error'; message: string }

export function NewPipelineModal(): React.JSX.Element | null {
  const open = useAppStore((store) => store.newDownloadOpen)
  const close = useAppStore((store) => store.closeNewDownload)
  const draftUrl = useAppStore((store) => store.draftUrl)
  const setDraftUrl = useAppStore((store) => store.setDraftUrl)
  const destinationDir = useAppStore((store) => store.destinationDir)
  const setDestinationDir = useAppStore((store) => store.setDestinationDir)
  const interfaces = useAppStore((store) => store.interfaces)
  const networkVisual = useNetworkVisuals()
  const freeSpace = useFreeSpace(destinationDir)

  const [inputUrl, setInputUrl] = useState(draftUrl || '')
  const [probe, setProbe] = useState<ProbeState>({ status: 'idle' })
  const [deselectedIds, setDeselectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const selectedInterfaceIds = interfaces
    .map((i) => i.id)
    .filter((id) => !deselectedIds.includes(id))

  const triggerProbe = useCallback(async (urlToProbe: string): Promise<void> => {
    const target = urlToProbe.trim()
    if (!target) {
      setProbe({ status: 'idle' })
      return
    }

    setProbe({ status: 'probing' })
    setSubmitError(null)

    try {
      if (typeof window !== 'undefined' && window.plexo?.probeUrl) {
        const result = await window.plexo.probeUrl(target)
        setProbe({ status: 'ready', result })
      } else {
        setProbe({
          status: 'ready',
          result: {
            kind: 'http',
            requestedUrl: target,
            finalUrl: target,
            suggestedFileName: target.split('/').pop()?.split('?')[0] || 'pipeline-download',
            totalBytes: 0,
            supportsRanges: true,
            contentType: null,
            etag: null,
            lastModified: null
          }
        })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to probe link'
      setProbe({ status: 'error', message: msg })
    }
  }, [])

  // Clipboard auto-detect on modal open
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      if (draftUrl) {
        void triggerProbe(draftUrl)
      } else if (typeof window !== 'undefined' && window.plexo?.readClipboardText) {
        void window.plexo.readClipboardText().then((clip) => {
          const trimmed = (clip || '').trim()
          if (
            trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('magnet:')
          ) {
            setInputUrl(trimmed)
            void triggerProbe(trimmed)
          }
        })
      }
    }, 50)

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => {
      clearTimeout(timer)
      clearTimeout(focusTimer)
    }
  }, [open, draftUrl, triggerProbe])

  const handleBrowseFolder = async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.plexo?.chooseDestinationFolder) {
      const chosen = await window.plexo.chooseDestinationFolder(destinationDir)
      if (chosen) setDestinationDir(chosen)
    }
  }

  const handleBrowseFile = async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.plexo?.chooseDownloadFile) {
      const path = await window.plexo.chooseDownloadFile()
      if (path) {
        setInputUrl(path)
        void triggerProbe(path)
      }
    }
  }

  const toggleInterface = (id: string): void => {
    setDeselectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((entry) => entry !== id)
      }
      // Keep at least one selected
      if (interfaces.length - prev.length <= 1) return prev
      return [...prev, id]
    })
  }

  const handleLaunch = async (): Promise<void> => {
    if (probe.status !== 'ready') return
    if (selectedInterfaceIds.length === 0) {
      setSubmitError('Select at least one network adapter')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = probe.result
      const common = {
        url: res.finalUrl,
        destinationDir,
        suggestedFileName: res.suggestedFileName,
        totalBytes: res.totalBytes ?? 0,
        supportsRanges: res.supportsRanges ?? true,
        interfaceIds: selectedInterfaceIds,
        etag: res.etag,
        lastModified: res.lastModified
      }

      if (typeof window !== 'undefined' && window.plexo?.startDownload) {
        let req: StartDownloadRequest
        if (res.kind === 'torrent') {
          req = {
            ...common,
            kind: 'torrent',
            infoHash: res.torrent.infoHash
          }
        } else if (res.kind === 'nzb') {
          req = {
            ...common,
            kind: 'nzb',
            nzbHash: res.nzb.hash
          }
        } else {
          req = {
            ...common,
            kind: 'http'
          }
        }
        await window.plexo.startDownload(req)
      }

      setDraftUrl('')
      close()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to initiate transfer'
      setSubmitError(msg)
      setSubmitting(false)
    }
  }

  if (!open) return null

  const isReady = probe.status === 'ready'
  const isRanges = isReady && probe.result.supportsRanges
  const predictedMultiplier =
    selectedInterfaceIds.length > 1
      ? `${(1.1 + (selectedInterfaceIds.length - 1) * 0.85).toFixed(1)}x`
      : '1.0x'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Zap className="size-4 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[var(--text)] tracking-tight">
                New Accelerated Pipeline
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                Multi-Conduit Ingestion Engine
              </p>
            </div>
          </div>

          <button
            onClick={close}
            className="size-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target URL / Path Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-semibold text-[var(--text)]">Source Link / File</span>
              <button
                type="button"
                onClick={() => void handleBrowseFile()}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>Select .torrent file</span>
              </button>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value)
                  void triggerProbe(e.target.value)
                }}
                placeholder="Paste HTTP, HTTPS, Magnet, or Torrent link..."
                className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[12.5px] text-[var(--text)] placeholder-[var(--text-tertiary)] focus:outline-hidden focus:border-cyan-500/50 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => void triggerProbe(inputUrl)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-cyan-600 dark:text-cyan-300 border border-[var(--border)] text-[11px] font-mono font-bold transition-colors cursor-pointer"
              >
                {probe.status === 'probing' ? 'Checking...' : 'Probe'}
              </button>
            </div>
          </div>

          {/* Probe Result / Capabilities Card */}
          {probe.status === 'ready' && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-cyan-500/30 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                    {probe.result.kind}
                  </span>
                  <h4 className="font-bold text-[13.5px] text-[var(--text)] truncate mt-1">
                    {probe.result.suggestedFileName}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[13px] font-bold text-[var(--text)] block">
                    {formatBytes(probe.result.totalBytes ?? 0)}
                  </span>
                </div>
              </div>

              {/* Bonding Capability Pill */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border)] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>
                    {isRanges ? 'Parallel HTTP Range Chunking Supported' : 'Standard Stream'}
                  </span>
                </div>
                <div className="text-cyan-600 dark:text-cyan-300 font-bold">
                  {isRanges
                    ? `Estimated ${predictedMultiplier} Acceleration`
                    : '1.0x (Single Stream)'}
                </div>
              </div>
            </div>
          )}

          {probe.status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-[12px] flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{probe.message}</span>
            </div>
          )}

          {/* Hardware Conduits Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-semibold text-[var(--text)]">Hardware Bonding Conduits</span>
              <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                {selectedInterfaceIds.length} of {interfaces.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {interfaces.map((iface, i) => {
                const visual = networkVisual(iface.id, iface.kind, iface.displayName)
                const isSelected = selectedInterfaceIds.includes(iface.id)

                return (
                  <button
                    key={iface.id || i}
                    type="button"
                    onClick={() => toggleInterface(iface.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-[var(--text)]'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-tertiary)] opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`size-2 rounded-full ${
                          isSelected ? 'bg-cyan-400' : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-[12px] block truncate text-[var(--text)]">
                          {visual.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                          {iface.kind}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
                          : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      {isSelected ? 'BOUND' : 'OFF'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Destination Path Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-semibold text-[var(--text)]">Destination Folder</span>
              {freeSpace !== null && (
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  Free: <span className="text-[var(--text)]">{formatBytes(freeSpace)}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={destinationDir || 'Choose destination...'}
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[12px] text-[var(--text)] font-mono"
              />
              <button
                type="button"
                onClick={() => void handleBrowseFolder()}
                className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text)] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FolderOpen className="size-3.5" />
                <span>Browse</span>
              </button>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-[12px]">
              {submitError}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="h-16 px-5 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleLaunch()}
            disabled={!isReady || submitting || selectedInterfaceIds.length === 0}
            className={`px-5 py-2.5 rounded-xl text-[12.5px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isReady && !submitting && selectedInterfaceIds.length > 0
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-md shadow-cyan-500/25 active:scale-95'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border)]'
            }`}
          >
            {submitting ? (
              <span>Initiating...</span>
            ) : (
              <>
                <span>Launch Pipeline</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
