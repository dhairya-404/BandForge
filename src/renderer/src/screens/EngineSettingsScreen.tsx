import React from 'react'
import { Settings, FolderOpen, Sliders, HardDrive, Globe, Sun, Moon, Check } from 'lucide-react'
import type { ThemeSource, SpeedUnit } from '@shared/types'
import { useAppStore } from '../store/useAppStore'
import { useProxyStatus } from '../hooks/useProxyStatus'

export function EngineSettingsScreen(): React.JSX.Element {
  const downloadsAtOnce = useAppStore((state) => state.downloadsAtOnce)
  const setDownloadsAtOnce = useAppStore((state) => state.setDownloadsAtOnce)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const setSpeedUnit = useAppStore((state) => state.setSpeedUnit)
  const destinationDir = useAppStore((state) => state.destinationDir)
  const setDestinationDir = useAppStore((state) => state.setDestinationDir)
  const themeSource = useAppStore((state) => state.themeSource)
  const setThemeSource = useAppStore((state) => state.setThemeSource)

  const { status: proxyStatus, toggleProxy, loading: proxyLoading } = useProxyStatus()
  const isProxyActive = proxyStatus?.enabled ?? false

  const api =
    typeof window !== 'undefined' ? window.tesso || window.bondforge || window.plexo : undefined

  const handleBrowse = async (): Promise<void> => {
    const chosen = await api?.chooseDestinationFolder?.(destinationDir)
    if (chosen) setDestinationDir(chosen)
  }

  const themes: { id: ThemeSource; label: string; desc: string; icon: typeof Moon }[] = [
    {
      id: 'dark',
      label: 'Obsidian Cyber Dark',
      desc: 'Deep space void (#08090C) with luminous cyan & emerald energy conduits',
      icon: Moon
    },
    {
      id: 'light',
      label: 'Studio Titanium Light',
      desc: 'Ultra-clean pearl canvas (#F4F6FA) with high-contrast slate typography',
      icon: Sun
    }
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 max-w-4xl select-none text-[var(--text)]">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <Settings className="size-6 text-cyan-400" />
          <span>Engine Settings & Studio Configuration</span>
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Manage system appearance, multi-network aggregation parameters, proxy routing, and local
          storage conduits.
        </p>
      </div>

      <div className="space-y-5">
        {/* SECTION 1: Appearance & Theme Engine */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sun className="size-4.5 text-cyan-400" />
              <h2 className="font-bold text-[15px] tracking-tight">Appearance & Theme Engine</h2>
            </div>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              Active: {themeSource || 'dark'}
            </span>
          </div>

          <p className="text-[12.5px] text-[var(--text-secondary)]">
            Select your preferred visual mode. Tesso transforms instantaneously between Obsidian
            Cyber Dark and Studio Titanium Light.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {themes.map((t) => {
              const active = themeSource === t.id
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeSource(t.id)}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer relative ${
                    active
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                      : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-cyan-500/40 hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {active && (
                    <span className="absolute top-3 right-3 size-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                      <Check className="size-3 stroke-[3]" />
                    </span>
                  )}
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center mb-3 ${
                      active
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[var(--bg-secondary)] text-[var(--text)]'
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <span className="font-bold text-[13.5px] mb-1">{t.label}</span>
                  <span className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                    {t.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* SECTION 2: Storage Conduit */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 font-bold text-[15px]">
            <HardDrive className="size-4.5 text-cyan-400" />
            <span>Default Destination Directory</span>
          </div>

          <p className="text-[12.5px] text-[var(--text-secondary)]">
            Target folder where accelerated pipeline files and multi-stream chunks are written.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={destinationDir || 'C:\\Users\\Dhairya\\Downloads'}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] font-mono text-[12.5px] text-[var(--text)] outline-none"
            />
            <button
              onClick={() => void handleBrowse()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-cyan-500 hover:text-slate-950 border border-[var(--border)] text-[12.5px] font-semibold transition-all cursor-pointer shrink-0"
            >
              <FolderOpen className="size-4" />
              <span>Change Folder</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: Browser Multi-WAN Proxy Hub */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="size-4.5 text-cyan-400" />
              <h2 className="font-bold text-[15px] tracking-tight">
                Browser Multi-WAN Proxy Daemon
              </h2>
            </div>
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={proxyLoading}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all cursor-pointer ${
                isProxyActive
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {isProxyActive ? 'ACCELERATION ACTIVE' : 'DAEMON STOPPED'}
            </button>
          </div>

          <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
            Routes outbound browser traffic across all bonded physical interfaces using round-robin
            socket binding. Zero remote server infrastructure required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] font-mono">
            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">HTTP/HTTPS Proxy Port:</span>
              <span className="text-cyan-400 font-semibold">{proxyStatus?.port || 9090}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">PAC Script Port:</span>
              <span className="text-cyan-400 font-semibold">{proxyStatus?.pacPort || 9091}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center sm:col-span-2">
              <span className="text-[var(--text-secondary)]">PAC Auto-Config URL:</span>
              <span className="text-emerald-400 font-semibold">
                {proxyStatus?.pacUrl || 'http://127.0.0.1:9091/proxy.pac'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Concurrency & Stream Sizing */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 font-bold text-[15px]">
            <Sliders className="size-4.5 text-cyan-400" />
            <span>Parallel Ingestion Concurrency</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-[var(--text)]">
                Concurrent Active Jobs
              </div>
              <div className="text-[12px] text-[var(--text-secondary)]">
                Maximum number of parallel downloads active before queuing.
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              {[1, 2, 3, 5, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => setDownloadsAtOnce(count)}
                  className={`size-9 rounded-xl border text-[13px] font-bold transition-all cursor-pointer ${
                    downloadsAtOnce === count
                      ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow-sm'
                      : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-[var(--text)]">Telemetry Speed Unit</div>
              <div className="text-[12px] text-[var(--text-secondary)]">
                Format throughout dashboard meters, badges, and status bar.
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              {(['bytes', 'bits'] as SpeedUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setSpeedUnit(unit)}
                  className={`px-3.5 py-1.5 rounded-xl border text-[12px] font-bold transition-all cursor-pointer ${
                    speedUnit === unit
                      ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow-sm'
                      : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                  }`}
                >
                  {unit === 'bytes' ? 'Megabytes (MB/s)' : 'Megabits (Mbps)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
