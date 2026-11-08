import React from 'react'
import { Settings, FolderOpen, Gauge, Cpu, Sliders, HardDrive, Turtle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function EngineSettingsScreen(): React.JSX.Element {
  const downloadsAtOnce = useAppStore((state) => state.downloadsAtOnce)
  const setDownloadsAtOnce = useAppStore((state) => state.setDownloadsAtOnce)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const setSpeedUnit = useAppStore((state) => state.setSpeedUnit)
  const slowMode = useAppStore((state) => state.slowMode)
  const setSlowMode = useAppStore((state) => state.setSlowMode)
  const destinationDir = useAppStore((state) => state.destinationDir)
  const setDestinationDir = useAppStore((state) => state.setDestinationDir)

  const handleBrowse = async (): Promise<void> => {
    const chosen = await window.plexo?.chooseDestinationFolder(destinationDir)
    if (chosen) setDestinationDir(chosen)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="size-5 text-cyan-400" />
          <span>Engine Settings & Optimization</span>
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Fine-tune concurrent range sockets, telemetry display units, and local storage routing.
        </p>
      </div>

      <div className="space-y-4">
        {/* Section 1: Storage */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-[14.5px] text-white">
            <HardDrive className="size-4 text-cyan-400" />
            <span>Default Destination Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={destinationDir || 'C:\\Users\\Dhairya\\Downloads'}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-[var(--border)] font-mono text-[12.5px] text-slate-300 outline-none"
            />
            <button
              onClick={() => void handleBrowse()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[12.5px] font-semibold transition-colors cursor-pointer shrink-0"
            >
              <FolderOpen className="size-4" />
              <span>Change Folder</span>
            </button>
          </div>
        </div>

        {/* Section 2: Concurrency & Stream Sizing */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-[14.5px] text-white">
            <Sliders className="size-4 text-cyan-400" />
            <span>Parallel Downloads & Concurrency</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-semibold text-white">Concurrent Active Jobs</div>
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
                      ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Telemetry & Units */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-[14.5px] text-white">
            <Gauge className="size-4 text-cyan-400" />
            <span>Speed Telemetry Display Unit</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-semibold text-white">Throughput Unit</div>
              <div className="text-[12px] text-slate-400">
                Display speeds in megabytes per second (storage) or megabits per second (ISP).
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[12px]">
              <button
                onClick={() => setSpeedUnit('bytes')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  speedUnit === 'bytes'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MB/s
              </button>
              <button
                onClick={() => setSpeedUnit('bits')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  speedUnit === 'bits'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mbps
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-white">
                <Turtle className="size-4 text-amber-400" />
                <span>Background / Slow Mode</span>
              </div>
              <div className="text-[12px] text-slate-400">
                Cap background bandwidth usage so other tasks and video streams are uninterrupted.
              </div>
            </div>

            <button
              onClick={() => setSlowMode(!slowMode)}
              className={`px-4 py-1.5 rounded-xl font-mono text-[12px] font-bold transition-colors cursor-pointer ${
                slowMode
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {slowMode ? 'ENABLED (512 KB/s)' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Section 4: Engine Status */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/15 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-[14.5px] text-white">
            <Cpu className="size-4 text-cyan-400" />
            <span>Core Engine Diagnostics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between">
              <span className="text-slate-400">Socket Kernel Binding:</span>
              <span className="text-emerald-400 font-bold">C FFI (koffi) ACTIVE</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between">
              <span className="text-slate-400">Windows Routing Engine:</span>
              <span className="text-cyan-400 font-bold">Winsock2 Raw Multi-WAN</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between">
              <span className="text-slate-400">Dynamic Chunk Engine:</span>
              <span className="text-cyan-400 font-bold">Adaptive HTTP Range</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between">
              <span className="text-slate-400">Zero-Server Tunnel Cost:</span>
              <span className="text-emerald-400 font-bold">$0.00 / FREE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
