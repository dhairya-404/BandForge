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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 select-none text-[var(--text)] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="size-5 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Hardware Adapter Matrix
            </h1>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Physical network cards bonded into client-side socket pool ({rawList.length} adapter
            {rawList.length === 1 ? '' : 's'} detected).
          </p>
        </div>

        <button
          onClick={() => void loadInterfaces()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text)] text-[12px] font-mono font-medium transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="size-3.5 text-cyan-400" />
          <span>Rescan Adapters</span>
        </button>
      </div>

      {rawList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center bg-[var(--bg-secondary)] max-w-lg mx-auto">
          <div className="size-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/20">
            <Network className="size-6" />
          </div>
          <h3 className="text-[16px] font-bold">No active network adapters detected</h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Connect your device to Wi-Fi, plug in an Ethernet cable, or enable USB/Mobile 5G
            tethering to begin multi-network aggregation.
          </p>
          <button
            onClick={() => void loadInterfaces()}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[13px] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 shadow-sm"
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
                ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                : item.kind === 'usb'
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : 'text-blue-400 border-blue-500/30 bg-blue-500/10'

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                  isOff
                    ? 'border-[var(--border)] bg-[var(--bg-secondary)] opacity-50'
                    : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-cyan-500/40'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${accentColor}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[14px] truncate">{customName}</h3>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
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
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                        : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                    title={isOff ? 'Enable for Bonding' : 'Disable from Bonding'}
                  >
                    <CheckCircle2 className="size-4" />
                  </button>
                </div>

                {/* Hardware Telemetry Specs */}
                <div className="space-y-2 rounded-xl bg-[var(--bg-tertiary)] p-3.5 border border-[var(--border)] font-mono text-[11.5px]">
                  <div className="flex justify-between items-center text-[var(--text-secondary)]">
                    <span>IPv4 Address:</span>
                    <span className="text-[var(--text)] font-semibold">{item.ip}</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-secondary)]">
                    <span>Hardware Binding:</span>
                    <span>{item.mac}</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-secondary)]">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-medium">{item.ping}</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-secondary)]">
                    <span>Throughput:</span>
                    <span
                      className={
                        ifaceSpeed > 0 ? 'text-cyan-400 font-bold' : 'text-[var(--text-secondary)]'
                      }
                    >
                      {ifaceSpeed > 0 ? formatSpeed(ifaceSpeed, speedUnit) : '0 B/s (Standby)'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${isOff ? 'bg-slate-400' : 'bg-emerald-400'}`}
                    />
                    {isOff ? 'Disabled' : 'Armed & Bonded'}
                  </span>
                  <span>Auto-hedging ready</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
