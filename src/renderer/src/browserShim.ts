import type { InitialState, NetworkInterfaceInfo } from '@shared/types'

export const defaultInitialState: InitialState = {
  downloadSchedule: undefined,
  homeDir: 'C:\\Users\\Dhairya',
  downloadsDir: 'C:\\Users\\Dhairya\\Downloads',
  themeSource: 'dark',
  networkPreferences: {
    wifi0: { customName: 'Home Wi-Fi (Primary)', colorId: 'blue' },
    eth0: { customName: 'High-Speed Ethernet', colorId: 'green' },
    usb0: { customName: '5G Mobile USB Tether', colorId: 'purple' }
  },
  downloadsAtOnce: 3,
  speedLimit: undefined,
  slowMode: false,
  slowModeSpeed: 512 * 1024,
  speedUnit: 'bytes',
  destinationDir: undefined
}

export const defaultInterfaces: NetworkInterfaceInfo[] = [
  {
    id: 'wifi0',
    device: 'Wi-Fi',
    displayName: 'Wi-Fi (Primary 5GHz)',
    addresses: [{ address: '172.21.117.113', family: 4 }],
    kind: 'wifi'
  },
  {
    id: 'eth0',
    device: 'Ethernet',
    displayName: 'Ethernet (High-Speed LAN)',
    addresses: [{ address: '192.168.1.150', family: 4 }],
    kind: 'ethernet'
  },
  {
    id: 'usb0',
    device: 'USB Tether',
    displayName: '5G Mobile USB Tether',
    addresses: [{ address: '192.168.42.12', family: 4 }],
    kind: 'usb'
  }
]

const activeDownloadsMap = new Map<string, any>()
const updateListeners = new Set<(update: any) => void>()
const networkListeners = new Set<(networks: NetworkInterfaceInfo[]) => void>()

export function initBrowserShim(): void {
  if (typeof window === 'undefined') return

  if (!window.plexo) {
    console.info('[BandForge] Initializing dynamic multi-network browser engine shim.')
    const totalBytes = 1024 * 1024 * 1024 * 1.5

    const baseShim: Record<string, any> = {
      platform: 'win32',
      initialState: defaultInitialState,
      listInterfaces: async () => defaultInterfaces,
      deviceBindingSupported: async () => true,
      openNetworkSettings: async () => {},
      updateSettings: async () => {},
      probeUrl: async (url: string) => {
        const cleanName = url.split('/').pop()?.split('?')[0] || 'ubuntu-24.04-desktop-amd64.iso'
        return {
          kind: 'http' as const,
          requestedUrl: url,
          finalUrl: url,
          supportsRanges: true,
          totalBytes: totalBytes,
          suggestedFileName: cleanName.endsWith('.iso') || cleanName.includes('.') ? cleanName : cleanName + '.bin',
          contentType: 'application/octet-stream',
          etag: '"fast-hash-1234"',
          lastModified: new Date().toUTCString()
        }
      },
      chooseDestinationFolder: async () => 'C:\\Users\\Dhairya\\Downloads',
      chooseDownloadFile: async () => null,
      pathForFile: () => '',
      readClipboardText: async () => 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
      revealDownload: async () => {},
      openDownload: async () => {},
      startDownload: async (request: any) => {
        const id = 'dl-' + Date.now()
        const total = request.totalBytes || totalBytes
        const blockCount = Math.max(1, Math.min(60, Math.ceil(total / (25 * 1024 * 1024))))
        const blockSize = Math.ceil(total / blockCount)

        const initialNetworks: any[] = [
          {
            id: 'wifi0',
            label: 'Wi-Fi (Primary 5GHz)',
            kind: 'wifi',
            transfer: 'http',
            enabled: true,
            status: 'on',
            bytesDownloaded: 0,
            speedBytesPerSec: 18 * 1024 * 1024,
            retries: 0
          },
          {
            id: 'eth0',
            label: 'Ethernet (High-Speed LAN)',
            kind: 'ethernet',
            transfer: 'http',
            enabled: true,
            status: 'on',
            bytesDownloaded: 0,
            speedBytesPerSec: 14 * 1024 * 1024,
            retries: 0
          },
          {
            id: 'usb0',
            label: '5G Mobile USB Tether',
            kind: 'usb',
            transfer: 'http',
            enabled: true,
            status: 'on',
            bytesDownloaded: 0,
            speedBytesPerSec: 8 * 1024 * 1024,
            retries: 0
          }
        ]

        const initialStreams: any[] = [
          {
            id: 1,
            interfaceId: 'wifi0',
            rangeStart: 0,
            rangeEnd: blockSize,
            bytesDownloaded: 0,
            speedBytesPerSec: 9 * 1024 * 1024,
            status: 'downloading',
            currentBlockIndex: 0
          },
          {
            id: 2,
            interfaceId: 'wifi0',
            rangeStart: blockSize,
            rangeEnd: blockSize * 2,
            bytesDownloaded: 0,
            speedBytesPerSec: 9 * 1024 * 1024,
            status: 'downloading',
            currentBlockIndex: 1
          },
          {
            id: 3,
            interfaceId: 'eth0',
            rangeStart: blockSize * 2,
            rangeEnd: blockSize * 3,
            bytesDownloaded: 0,
            speedBytesPerSec: 14 * 1024 * 1024,
            status: 'downloading',
            currentBlockIndex: 2
          },
          {
            id: 4,
            interfaceId: 'usb0',
            rangeStart: blockSize * 3,
            rangeEnd: blockSize * 4,
            bytesDownloaded: 0,
            speedBytesPerSec: 8 * 1024 * 1024,
            status: 'downloading',
            currentBlockIndex: 3
          }
        ]

        const initialBlocks: any[] = Array.from({ length: blockCount }, (_, i) => ({
          kind: 'http',
          index: i,
          rangeStart: i * blockSize,
          rangeEnd: Math.min(total, (i + 1) * blockSize) - 1,
          interfaceId: i < 2 ? 'wifi0' : i === 2 ? 'eth0' : i === 3 ? 'usb0' : undefined,
          bytesDownloaded: 0,
          bytesByInterface: {},
          status: i < 4 ? 'downloading' : 'pending'
        }))

        const dl = {
          id,
          kind: 'http' as const,
          url: request.url,
          fileName: request.suggestedFileName || 'ubuntu-24.04-desktop-amd64.iso',
          destinationPath: (request.destinationDir || 'C:\\Users\\Dhairya\\Downloads') + '\\' + (request.suggestedFileName || 'ubuntu-24.04-desktop-amd64.iso'),
          status: 'downloading' as const,
          startedAt: Date.now(),
          totalBytes: total,
          bytesDownloaded: 0,
          speedBytesPerSec: 40 * 1024 * 1024,
          speedHistory: [25 * 1024 * 1024, 32 * 1024 * 1024, 40 * 1024 * 1024],
          supportsRanges: true,
          etag: '"fast-hash-1234"',
          lastModified: new Date().toUTCString(),
          networks: initialNetworks,
          streams: initialStreams,
          blocks: initialBlocks
        }
        activeDownloadsMap.set(id, dl)

        // Broadcast initial state
        setTimeout(() => {
          for (const cb of updateListeners) cb({ ...dl })
        }, 50)

        // Simulate multi-network dynamic progress
        const interval = setInterval(() => {
          const item = activeDownloadsMap.get(id)
          if (!item || item.status !== 'downloading') {
            clearInterval(interval)
            return
          }
          const delta = 15 * 1024 * 1024
          item.bytesDownloaded = Math.min(item.totalBytes, item.bytesDownloaded + delta)
          item.speedBytesPerSec = 40 * 1024 * 1024

          item.networks[0].bytesDownloaded += 6.5 * 1024 * 1024
          item.networks[1].bytesDownloaded += 5.5 * 1024 * 1024
          item.networks[2].bytesDownloaded += 3.0 * 1024 * 1024

          const completedBlocksCount = Math.floor((item.bytesDownloaded / item.totalBytes) * blockCount)
          for (let b = 0; b < blockCount; b++) {
            if (b < completedBlocksCount) {
              item.blocks[b].status = 'completed'
              item.blocks[b].bytesDownloaded = blockSize
            } else if (b < completedBlocksCount + 4) {
              item.blocks[b].status = 'downloading'
            }
          }

          if (item.bytesDownloaded >= item.totalBytes) {
            item.bytesDownloaded = item.totalBytes
            item.status = 'completed'
            item.completedAt = Date.now()
            clearInterval(interval)
          }
          for (const cb of updateListeners) cb({ ...item })
        }, 400)

        return id
      },
      listDownloads: async () => Array.from(activeDownloadsMap.values()),
      listHistory: async () => [],
      clearHistory: async () => {},
      networkUsage: async () => ({
        wifi0: 1024 * 1024 * 1024 * 12.4,
        eth0: 1024 * 1024 * 1024 * 18.2,
        usb0: 1024 * 1024 * 1024 * 4.8
      }),
      resetNetworkUsage: async () => {},
      freeSpace: async () => 1024 * 1024 * 1024 * 240,
      torrentFiles: async () => [],
      chooseTorrentFiles: async () => {},
      torrentTrackers: async () => [],
      addTorrentTrackers: async () => {},
      pauseDownload: async (id: string) => {
        const item = activeDownloadsMap.get(id)
        if (item) {
          item.status = 'paused'
          for (const cb of updateListeners) cb({ ...item })
        }
      },
      resumeDownload: async (id: string) => {
        const item = activeDownloadsMap.get(id)
        if (item) {
          item.status = 'downloading'
          for (const cb of updateListeners) cb({ ...item })
        }
      },
      relinkDownload: async () => {},
      setDownloadNetwork: async () => {},
      cancelDownload: async (id: string) => {
        const item = activeDownloadsMap.get(id)
        if (item) {
          item.status = 'cancelled'
          for (const cb of updateListeners) cb({ ...item })
        }
      },
      removeDownload: async (id: string) => {
        activeDownloadsMap.delete(id)
      },
      updateState: async () => ({ status: 'disabled' as const }),
      showUpdateMenu: async () => {},
      pendingLinks: async () => [],
      resumeFromLink: async () => {},
      dismissLink: async () => {},
      usenetServer: async () => undefined,
      saveUsenetServer: async () => {},
      testUsenetServer: async () => ({ ok: true }),
      telegramState: async () => ({ status: 'logged_out' as const }),
      telegramStartLogin: async () => {},
      telegramStartQrLogin: async () => '',
      telegramSubmitCode: async () => {},
      telegramSubmitPassword: async () => {},
      telegramLogout: async () => {},
      telegramListMedia: async () => [],
      onTelegramAuth: () => () => {},
      onLinkReceived: () => () => {},
      onDownloadUpdated: (callback: (update: any) => void) => {
        updateListeners.add(callback)
        return () => updateListeners.delete(callback)
      },
      onHistoryChanged: () => () => {},
      onUpdateState: () => () => {},
      onNetworksChanged: (callback: (networks: NetworkInterfaceInfo[]) => void) => {
        networkListeners.add(callback)
        setTimeout(() => callback(defaultInterfaces), 50)
        return () => networkListeners.delete(callback)
      },
      onMagnetCheckStatus: () => () => {}
    }

    // Wrap with Proxy so any unhandled property or event returns a safe fallback without throwing
    window.plexo = new Proxy(baseShim, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver)
        }
        if (typeof prop === 'string') {
          if (prop.startsWith('on')) {
            return () => () => {}
          }
          return async () => undefined
        }
        return undefined
      }
    }) as any
  }
}
