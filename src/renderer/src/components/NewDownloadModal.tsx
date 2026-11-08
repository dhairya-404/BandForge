import React, { useState, useEffect, useCallback } from 'react'
import {
  Flame,
  X,
  FolderOpen,
  Wifi,
  Smartphone,
  Cable,
  CheckCircle2,
  AlertCircle,
  Zap,
  Clipboard
} from 'lucide-react'
import type { HttpProbeResult, ProbeResult, StartHttpDownloadRequest } from '@shared/types'
import { useAppStore } from '../store/useAppStore'
import { formatBytes } from '../utils/format'

function NewDownloadModalContent(): React.JSX.Element {
  const close = useAppStore((state) => state.closeNewDownload)
  const destinationDir = useAppStore((state) => state.destinationDir)
  const setDestinationDir = useAppStore((state) => state.setDestinationDir)
  const interfaces = useAppStore((state) => state.interfaces)

  const [url, setUrl] = useState('https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso')
  const [probing, setProbing] = useState(false)
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedAdapters, setSelectedAdapters] = useState<string[]>(['wifi0', 'usb0', 'eth0'])

  const handleProbe = useCallback(async (link: string): Promise<void> => {
    const trimmed = link.trim()
    if (!trimmed || !trimmed.startsWith('http')) return
    setProbing(true)
    setError(null)
    try {
      if (window.plexo?.probeUrl) {
        const res = await window.plexo.probeUrl(trimmed)
        setProbeResult(res)
      } else {
        const fallback: HttpProbeResult = {
          kind: 'http',
          requestedUrl: trimmed,
          finalUrl: trimmed,
          suggestedFileName: trimmed.split('/').pop()?.split('?')[0] || 'accelerated-download.bin',
          totalBytes: 5.8 * 1024 * 1024 * 1024,
          supportsRanges: true,
          contentType: 'application/x-iso9660-image',
          etag: null,
          lastModified: null
        }
        setProbeResult(fallback)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not probe URL.')
    } finally {
      setProbing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      if (active) {
        void handleProbe('https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso')
      }
    }, 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [handleProbe])

  const handleToggleAdapter = (id: string): void => {
    setSelectedAdapters((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((a) => a !== id) : prev) : [...prev, id]
    )
  }

  const handleBrowse = async (): Promise<void> => {
    const chosen = await window.plexo?.chooseDestinationFolder(destinationDir)
    if (chosen) setDestinationDir(chosen)
  }

  const handlePasteClipboard = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        void handleProbe(text)
      }
    } catch {
      // fallback
    }
  }

  const handleStart = async (): Promise<void> => {
    if (!url.trim()) return
    try {
      const req: StartHttpDownloadRequest = {
        kind: 'http',
        url: url.trim(),
        destinationDir: destinationDir || 'C:\\Users\\Dhairya\\Downloads',
        suggestedFileName: probeResult?.suggestedFileName || 'accelerated-download.iso',
        totalBytes: probeResult?.totalBytes || 1024 * 1024 * 1024 * 1.5,
        supportsRanges: probeResult?.supportsRanges ?? true,
        interfaceIds: selectedAdapters,
        etag: probeResult?.etag || null,
        lastModified: probeResult?.lastModified || null
      }
      await window.plexo?.startDownload(req)
      close()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start transfer.')
    }
  }

  const defaultInterfacesList =
    interfaces.length > 0
      ? interfaces
      : [
          { id: 'wifi0', displayName: 'Primary Wi-Fi 5GHz', kind: 'wifi' as const },
          { id: 'usb0', displayName: '5G Mobile USB Tether', kind: 'usb' as const },
          { id: 'eth0', displayName: 'Gigabit Ethernet', kind: 'ethernet' as const }
        ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border-strong)] bg-[#0c121e] shadow-2xl p-6 space-y-5 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Flame className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Forge Accelerated Transfer
              </h2>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                Multi-WAN Socket Aggregation
              </span>
            </div>
          </div>

          <button
            onClick={close}
            className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* URL Input */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-mono text-slate-300">
            Target File URL (HTTP/HTTPS Range)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                void handleProbe(e.target.value)
              }}
              placeholder="Paste file download link: https://..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-[var(--border)] text-[13px] font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => void handlePasteClipboard()}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border)] text-slate-300 hover:text-white text-[12px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Paste from clipboard"
            >
              <Clipboard className="size-3.5 text-cyan-400" />
              <span>Paste</span>
            </button>
          </div>
        </div>

        {/* Probed Metadata Preview */}
        {probeResult && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 space-y-2 font-mono text-[12px]">
            <div className="flex justify-between items-center text-slate-300">
              <span>File:</span>
              <span className="text-white font-bold truncate max-w-xs">
                {probeResult.suggestedFileName}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Size:</span>
              <span className="text-cyan-300 font-bold">
                {formatBytes(probeResult.totalBytes || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Range Chunking:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                <span>SUPPORTED (Multi-WAN Aggregation Active)</span>
              </span>
            </div>
          </div>
        )}

        {probing && (
          <div className="font-mono text-[12px] text-cyan-400 animate-pulse">
            Probing target URL for HTTP Range headers...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-[12px] font-mono">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Participating Network Adapters */}
        <div className="space-y-2">
          <label className="text-[12px] font-mono text-slate-300">
            Participating Network Channels
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {defaultInterfacesList.map((iface) => {
              const selected = selectedAdapters.includes(iface.id)
              const Icon = iface.kind === 'wifi' ? Wifi : iface.kind === 'usb' ? Smartphone : Cable

              return (
                <button
                  key={iface.id}
                  onClick={() => handleToggleAdapter(iface.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selected
                      ? 'border-cyan-500/50 bg-cyan-950/30 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`size-4 ${selected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold truncate">{iface.displayName}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {selected ? 'Bonded' : 'Excluded'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Destination Path */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-mono text-slate-300">Save Destination</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={destinationDir || 'C:\\Users\\Dhairya\\Downloads'}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-[var(--border)] font-mono text-[12px] text-slate-300 outline-none"
            />
            <button
              onClick={() => void handleBrowse()}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border)] text-slate-300 hover:text-white text-[12px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FolderOpen className="size-3.5 text-cyan-400" />
              <span>Browse</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border)]">
          <button
            onClick={close}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleStart()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-[13.5px] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="size-4 fill-current" />
            <span>Ignite Accelerated Download</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function NewDownloadModal(): React.JSX.Element | null {
  const open = useAppStore((state) => state.newDownloadOpen)
  if (!open) return null
  return <NewDownloadModalContent />
}
