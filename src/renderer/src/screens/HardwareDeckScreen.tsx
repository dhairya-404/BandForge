import React from 'react'
import { Wifi, Smartphone, Cable, Network, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatSpeed } from '../utils/format'

export function HardwareDeckScreen(): React.JSX.Element {
  const interfaces = useAppStore((state) => state.interfaces)
  const downloads = useAppStore((state) => state.downloads)
  const speedUnit = useAppStore((state) => state.speedUnit)
  const networkPreferences = useAppStore((state) => state.networkPreferences)
  const setNetworkPreference = useAppStore((state) => state.setNetworkPreference)
  const loadInterfaces = useAppStore((state) => state.loadInterfaces)

  const activeDownloads = Object.values(downloads).filter((d) => d.status === 'downloading')

  const rawList = interfaces.map((iface) => ({
    id: iface.id,
    displayName: iface.displayName,
    device: iface.device,
    ip: iface.addresses.find((a) => a.family === 4)?.address || 'DHCP',
    mac: iface.mac || 'Auto DHCP',
    kind: iface.kind,
    ping:
      iface.kind === 'wifi'
        ? 'Active Wi-Fi'
        : iface.kind === 'usb'
          ? 'Active 5G/USB'
          : 'Active Ethernet'
  }))

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Network className="size-5 text-sky-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Hardware Adapter Matrix</h1>
          </div>
          <p className="text-[13px] text-slate-400 mt-1">
            Physical network cards bonded into client-side socket pool ({rawList.length} adapter
            {rawList.length === 1 ? '' : 's'} detected).
          </p>
        </div>

        <button
          onClick={() => void loadInterfaces()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[12px] font-mono transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3.5 text-sky-400" />
          <span>Rescan Adapters</span>
        </button>
      </div>

      {rawList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center bg-[#0a0f1d] max-w-lg mx-auto">
          <div className="size-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <Network className="size-6" />
          </div>
          <h3 className="text-[16px] font-semibold text-white">
            No active network adapters detected
          </h3>
          <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">
            Connect your device to Wi-Fi, plug in an Ethernet cable, or enable USB/Mobile 5G
            tethering to begin multi-network aggregation.
          </p>
          <button
            onClick={() => void loadInterfaces()}
            className="mt-4 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[13px] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="size-3.5" />
            <span>Detect Adapters</span>
          </button>
        </div>
      ) : (
        /* Adapter Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rawList.map((item) => {
            const isOff = Boolean(networkPreferences[item.id]?.off)
            const customName = networkPreferences[item.id]?.customName || item.displayName

            // Calculate real live speed across all active downloads
            const ifaceSpeed = activeDownloads.reduce((sum, dl) => {
              const matched = dl.networks?.find((n) => n.id === item.id)
              return sum + (matched?.speedBytesPerSec || 0)
            }, 0)

            const Icon = item.kind === 'wifi' ? Wifi : item.kind === 'usb' ? Smartphone : Cable

            const accentColor =
              item.kind === 'wifi'
                ? 'text-sky-400 border-sky-500/30 bg-sky-950/20'
                : item.kind === 'usb'
                  ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                  : 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20'

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isOff
                    ? 'border-slate-800 bg-slate-900/30 opacity-60'
                    : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-sky-500/30 shadow-lg'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-lg flex items-center justify-center border shrink-0 ${accentColor}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[13.5px] text-white truncate">
                        {customName}
                      </h3>
                      <span className="font-mono text-[11px] text-slate-500 uppercase">
                        {item.device} • {item.kind}
                      </span>
                    </div>
                  </div>

                  {/* Bonding Toggle */}
                  <button
                    onClick={() =>
                      setNetworkPreference(item.id, { off: !isOff ? true : undefined })
                    }
                    className={`size-6 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isOff
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                    title={isOff ? 'Enable for Bonding' : 'Disable from Bonding'}
                  >
                    <CheckCircle2 className="size-4" />
                  </button>
                </div>

                {/* Hardware Telemetry Specs */}
                <div className="space-y-2 rounded-lg bg-[#070b13] p-3 border border-slate-800/80 font-mono text-[11.5px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>IPv4 Address:</span>
                    <span className="text-white font-medium">{item.ip}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Hardware Binding:</span>
                    <span className="text-slate-400">{item.mac}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-medium">{item.ping}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Throughput:</span>
                    <span className={ifaceSpeed > 0 ? 'text-sky-300 font-bold' : 'text-slate-400'}>
                      {ifaceSpeed > 0 ? formatSpeed(ifaceSpeed, speedUnit) : '0 B/s (Standby)'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${isOff ? 'bg-slate-500' : 'bg-emerald-400'}`}
                    />
                    {isOff ? 'Disabled' : 'Armed & Bonded'}
                  </span>
                  <span className="text-slate-500">Auto-hedging ready</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
