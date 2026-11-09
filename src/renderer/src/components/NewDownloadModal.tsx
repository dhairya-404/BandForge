import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  FolderOpen,
  Wifi,
  Smartphone,
  Cable,
  CheckCircle2,
  AlertCircle,
  Clipboard,
  Network,
  ArrowRight
} from 'lucide-react'
import type { HttpProbeResult, ProbeResult, StartHttpDownloadRequest } from '@shared/types'
import { TessoLogo } from './TessoLogo'
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

  const api = typeof window !== 'undefined' ? window.bondforge || window.plexo : undefined

  const handleProbe = useCallback(
    async (link: string): Promise<void> => {
      const trimmed = link.trim()
      if (!trimmed || !trimmed.startsWith('http')) return
      setProbing(true)
      setError(null)
      try {
        if (api?.probeUrl) {
          const res = await api.probeUrl(trimmed)
          setProbeResult(res)
        } else {
          const fallback: HttpProbeResult = {
            kind: 'http',
            requestedUrl: trimmed,
            finalUrl: trimmed,
            suggestedFileName:
              trimmed.split('/').pop()?.split('?')[0] || 'accelerated-download.bin',
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
    },
    [api]
  )

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
    const chosen = await api?.chooseDestinationFolder?.(destinationDir)
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
      await api?.startDownload?.(req)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-xl rounded-xl border border-slate-700/80 bg-[#0c121e] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <TessoLogo size={26} />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                New Accelerated Transfer
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Multi-Network Socket Bonding Engine
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

        {/* URL Input Form */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-mono text-slate-300">
              Target File / Resource URL
            </label>
            <button
              onClick={() => void handlePasteClipboard()}
              className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <Clipboard className="size-3" />
              <span>Paste from Clipboard</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                void handleProbe(e.target.value)
              }}
              placeholder="https://example.com/large-file.iso"
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#070b13] border border-slate-700 text-[13px] text-white placeholder-slate-500 font-mono outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Probe Telemetry & Capabilities */}
        <div className="rounded-lg bg-[#070b13] p-3.5 border border-slate-800 space-y-2">
          {probing ? (
            <div className="flex items-center gap-2 text-[12px] font-mono text-sky-400">
              <span className="size-2 rounded-full bg-sky-400 animate-ping" />
              <span>Probing server capabilities and Range support...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-[12px] font-mono text-red-400">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          ) : probeResult ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white font-medium truncate max-w-[320px]">
                  {probeResult.suggestedFileName}
                </span>
                <span className="font-mono text-sky-300 font-bold">
                  {formatBytes(probeResult.totalBytes || 0)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] ${
                    probeResult.supportsRanges
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <CheckCircle2 className="size-3" />
                  {probeResult.supportsRanges
                    ? 'HTTP Range Bonding Supported'
                    : 'Single-Stream Only'}
                </span>
                <span className="text-slate-500 truncate max-w-[200px]">
                  {probeResult.contentType}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[12px] font-mono text-slate-500">
              Enter a valid URL to verify file size and multi-range bonding capability.
            </div>
          )}
        </div>

        {/* Interface Participation Selector */}
        <div className="space-y-2">
          <label className="text-[12px] font-mono text-slate-300">
            Active Hardware Sockets for this Transfer
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {defaultInterfacesList.map((iface) => {
              const selected = selectedAdapters.includes(iface.id)
              const Icon =
                iface.kind === 'wifi'
                  ? Wifi
                  : iface.kind === 'usb'
                    ? Smartphone
                    : iface.kind === 'ethernet'
                      ? Cable
                      : Network

              return (
                <button
                  key={iface.id}
                  onClick={() => handleToggleAdapter(iface.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selected
                      ? 'border-sky-500/50 bg-sky-950/30 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`size-4 ${selected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold truncate">{iface.displayName}</div>
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
              className="flex-1 px-3 py-2 rounded-lg bg-[#070b13] border border-slate-700 font-mono text-[12px] text-slate-300 outline-none"
            />
            <button
              onClick={() => void handleBrowse()}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[12px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FolderOpen className="size-3.5 text-sky-400" />
              <span>Browse</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border)]">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleStart()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[13px] shadow-sm shadow-sky-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Bonded Download</span>
            <ArrowRight className="size-4" />
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
