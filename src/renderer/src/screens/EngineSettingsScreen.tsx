import React from 'react'
import { Settings, FolderOpen, Gauge, Cpu, Sliders, HardDrive, Turtle, Globe } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useProxyStatus } from '../hooks/useProxyStatus'

export function EngineSettingsScreen(): React.JSX.Element {
  const downloadsAtOnce = useAppStore((state) => state.downloadsAtOnce)
  const setDownloadsAtOnce = useAppStore((state) => state.setDownloadsAtOnce)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const setSpeedUnit = useAppStore((state) => state.setSpeedUnit)
  const slowMode = useAppStore((state) => state.slowMode)
  const setSlowMode = useAppStore((state) => state.setSlowMode)
  const destinationDir = useAppStore((state) => state.destinationDir)
  const setDestinationDir = useAppStore((state) => state.setDestinationDir)

  const { status: proxyStatus, toggleProxy, loading: proxyLoading } = useProxyStatus()
  const isProxyActive = proxyStatus?.enabled ?? false

  const api =
    typeof window !== 'undefined' ? window.tesso || window.bondforge || window.plexo : undefined

  const handleBrowse = async (): Promise<void> => {
    const chosen = await api?.chooseDestinationFolder?.(destinationDir)
    if (chosen) setDestinationDir(chosen)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl select-none">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="size-5 text-sky-400" />
          <span>Engine Settings</span>
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Socket concurrency, throughput telemetry units, browser proxy routing, and local storage.
        </p>
      </div>

      <div className="space-y-4">
        {/* Section 1: Storage */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-[14px] text-white">
            <HardDrive className="size-4 text-sky-400" />
            <span>Default Destination Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={destinationDir || 'C:\\Users\\Dhairya\\Downloads'}
              className="flex-1 px-3.5 py-2 rounded-lg bg-[#070b13] border border-slate-700 font-mono text-[12.5px] text-slate-300 outline-none"
            />
            <button
              onClick={() => void handleBrowse()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[12.5px] font-medium transition-colors cursor-pointer shrink-0"
            >
              <FolderOpen className="size-4 text-sky-400" />
              <span>Change Folder</span>
            </button>
          </div>
        </div>

        {/* Section 2: Browser Multi-WAN Proxy Configuration */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[14px] text-white">
              <Globe className="size-4 text-sky-400" />
              <span>Browser & Chrome Multi-WAN Proxy</span>
            </div>
            <button
              onClick={() => void toggleProxy(!isProxyActive)}
              disabled={proxyLoading}
              className={`px-3 py-1 rounded-lg font-mono text-[12px] font-semibold transition-colors cursor-pointer ${
                isProxyActive
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isProxyActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <p className="text-[12.5px] text-slate-400 leading-relaxed">
            Routes outbound browser traffic across active physical interfaces using round-robin
            socket binding. Zero remote server infrastructure required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] font-mono">
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">HTTP/HTTPS Proxy Port:</span>
              <span className="text-sky-300 font-semibold">{proxyStatus?.port || 9090}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">PAC Script Port:</span>
              <span className="text-sky-300 font-semibold">{proxyStatus?.pacPort || 9091}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between items-center sm:col-span-2">
              <span className="text-slate-400">PAC Auto-Config URL:</span>
              <span className="text-emerald-400 font-semibold">
                {proxyStatus?.pacUrl || 'http://127.0.0.1:9091/proxy.pac'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Concurrency & Stream Sizing */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-[14px] text-white">
            <Sliders className="size-4 text-sky-400" />
            <span>Parallel Downloads & Concurrency</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-white">Concurrent Active Jobs</div>
              <div className="text-[12px] text-slate-400">
                Number of downloads running in parallel before queuing.
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[13px]">
              {[1, 2, 3, 5, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setDownloadsAtOnce(num)}
                  className={`size-8 rounded-lg flex items-center justify-center font-bold transition-colors cursor-pointer ${
                    downloadsAtOnce === num
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Telemetry & Units */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-[14px] text-white">
            <Gauge className="size-4 text-sky-400" />
            <span>Speed Telemetry Display Unit</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-white">Throughput Unit</div>
              <div className="text-[12px] text-slate-400">
                Display speeds in megabytes per second (storage) or megabits per second (ISP).
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#070b13] border border-slate-800 font-mono text-[12px]">
              <button
                onClick={() => setSpeedUnit('bytes')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  speedUnit === 'bytes'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MB/s
              </button>
              <button
                onClick={() => setSpeedUnit('bits')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  speedUnit === 'bits'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mbps
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-white">
                <Turtle className="size-4 text-amber-400" />
                <span>Background / Slow Mode</span>
              </div>
              <div className="text-[12px] text-slate-400">
                Cap background bandwidth usage so other tasks and video streams are uninterrupted.
              </div>
            </div>

            <button
              onClick={() => setSlowMode(!slowMode)}
              className={`px-4 py-1.5 rounded-lg font-mono text-[12px] font-semibold transition-colors cursor-pointer ${
                slowMode
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {slowMode ? 'ENABLED (512 KB/s)' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Section 5: Engine Status */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-950/10 p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-[14px] text-white">
            <Cpu className="size-4 text-sky-400" />
            <span>Core Engine Diagnostics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] font-mono">
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between">
              <span className="text-slate-400">Socket Kernel Binding:</span>
              <span className="text-emerald-400 font-semibold">C FFI (koffi) Active</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between">
              <span className="text-slate-400">Windows Routing Engine:</span>
              <span className="text-sky-400 font-semibold">Winsock2 Raw Multi-WAN</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between">
              <span className="text-slate-400">Dynamic Chunk Engine:</span>
              <span className="text-sky-400 font-semibold">Adaptive HTTP Range</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070b13] border border-slate-800 flex justify-between">
              <span className="text-slate-400">Zero-Server Tunnel Cost:</span>
              <span className="text-emerald-400 font-semibold">$0.00 / Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
