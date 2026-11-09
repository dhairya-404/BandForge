import type {
  DownloadUpdate,
  HttpBlockState,
  HttpDownloadNetwork,
  HttpDownloadState,
  HttpStreamState,
  InitialState,
  NetworkInterfaceInfo,
  ProbeResult,
  ProxyStatus,
  StartDownloadRequest
} from '@shared/types'

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

const activeDownloadsMap = new Map<string, HttpDownloadState>()
const updateListeners = new Set<(update: DownloadUpdate) => void>()
const networkListeners = new Set<(networks: NetworkInterfaceInfo[]) => void>()

export function initBrowserShim(): void {
  if (typeof window === 'undefined') return

  if (!window.plexo) {
    console.info('[Tesso] Initializing dynamic multi-network browser engine shim.')
    const totalBytes = 1024 * 1024 * 1024 * 1.5

    const baseShim: Record<string, unknown> = {
      platform: 'win32',
      initialState: defaultInitialState,
      listInterfaces: async (): Promise<NetworkInterfaceInfo[]> => defaultInterfaces,
      deviceBindingSupported: async (): Promise<boolean> => true,
      openNetworkSettings: async (): Promise<void> => {},
      updateSettings: async (): Promise<void> => {},
      getProxyStatus: async (): Promise<ProxyStatus> => ({
        enabled: true,
        port: 9090,
        pacPort: 9091,
        pacUrl: 'http://127.0.0.1:9091/proxy.pac',
        activeConnections: 0,
        totalBytes: 0,
        interfaces: {
          wifi0: {
            id: 'wifi0',
            name: 'Wi-Fi (Primary 5GHz)',
            address: '172.21.117.113',
            activeConnections: 0,
            bytesReceived: 0,
            bytesSent: 0
          },
          eth0: {
            id: 'eth0',
            name: 'Ethernet (High-Speed LAN)',
            address: '192.168.1.150',
            activeConnections: 0,
            bytesReceived: 0,
            bytesSent: 0
          },
          usb0: {
            id: 'usb0',
            name: '5G Mobile USB Tether',
            address: '192.168.42.12',
            activeConnections: 0,
            bytesReceived: 0,
            bytesSent: 0
          }
        }
      }),
      setProxyEnabled: async (): Promise<boolean> => true,
      onProxyStatusChanged: () => (): void => {},
      probeUrl: async (url: string): Promise<ProbeResult> => {
        const cleanName = url.split('/').pop()?.split('?')[0] || 'ubuntu-24.04-desktop-amd64.iso'
        return {
          kind: 'http',
          requestedUrl: url,
          finalUrl: url,
          supportsRanges: true,
          totalBytes: totalBytes,
          suggestedFileName: cleanName,
          contentType: 'application/x-iso9660-image',
          etag: '"fast-hash-1234"',
          lastModified: new Date().toUTCString()
        }
      },
      chooseDestinationFolder: async (): Promise<string> => 'C:\\Users\\Dhairya\\Downloads',
      chooseDownloadFile: async (): Promise<null> => null,
      pathForFile: (): string => '',
      readClipboardText: async (): Promise<string> =>
        'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
      revealDownload: async (): Promise<void> => {},
      openDownload: async (): Promise<void> => {},
      startDownload: async (request: StartDownloadRequest): Promise<string> => {
        const id = 'dl-' + Date.now()
        const total =
          'totalBytes' in request &&
          typeof request.totalBytes === 'number' &&
          request.totalBytes > 0
            ? request.totalBytes
            : totalBytes
        const blockCount = Math.max(1, Math.min(60, Math.ceil(total / (25 * 1024 * 1024))))
        const blockSize = Math.ceil(total / blockCount)

        const initialNetworks: HttpDownloadNetwork[] = [
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

        const initialStreams: HttpStreamState[] = [
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

        const initialBlocks: HttpBlockState[] = Array.from({ length: blockCount }, (_, i) => ({
          kind: 'http',
          index: i,
          rangeStart: i * blockSize,
          rangeEnd: Math.min(total, (i + 1) * blockSize) - 1,
          interfaceId: i < 2 ? 'wifi0' : i === 2 ? 'eth0' : i === 3 ? 'usb0' : undefined,
          bytesDownloaded: 0,
          bytesByInterface: {},
          status: i < 4 ? 'downloading' : 'pending'
        }))

        const suggestedFileName =
          'suggestedFileName' in request && request.suggestedFileName
            ? request.suggestedFileName
            : 'ubuntu-24.04-desktop-amd64.iso'
        const destinationDir =
          'destinationDir' in request && request.destinationDir
            ? request.destinationDir
            : 'C:\\Users\\Dhairya\\Downloads'
        const url =
          'url' in request && request.url
            ? request.url
            : 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso'

        const dl: HttpDownloadState = {
          id,
          kind: 'http',
          url,
          fileName: suggestedFileName,
          destinationPath: `${destinationDir}\\${suggestedFileName}`,
          status: 'downloading',
          startedAt: Date.now(),
          totalBytes: total,
          bytesDownloaded: 0,
          speedBytesPerSec: 40 * 1024 * 1024,
          networks: initialNetworks,
          streams: initialStreams,
          peakStreams: 4,
          blocks: initialBlocks,
          totalBlocks: blockCount,
          blockSizeBytes: blockSize
        }
        activeDownloadsMap.set(id, dl)

        // Broadcast initial state
        setTimeout(() => {
          for (const cb of updateListeners) cb(dl as unknown as DownloadUpdate)
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

          const completedBlocksCount = Math.floor(
            (item.bytesDownloaded / item.totalBytes) * blockCount
          )
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
          for (const cb of updateListeners) cb(item as unknown as DownloadUpdate)
        }, 400)

        return id
      },
      listDownloads: async (): Promise<HttpDownloadState[]> =>
        Array.from(activeDownloadsMap.values()),
      listHistory: async (): Promise<never[]> => [],
      clearHistory: async (): Promise<void> => {},
      networkUsage: async (): Promise<Record<string, number>> => ({
        wifi0: 1024 * 1024 * 1024 * 12.4,
        eth0: 1024 * 1024 * 1024 * 18.2,
        usb0: 1024 * 1024 * 1024 * 4.8
      }),
      resetNetworkUsage: async (): Promise<void> => {},
      freeSpace: async (): Promise<number> => 1024 * 1024 * 1024 * 240,
      torrentFiles: async (): Promise<never[]> => [],
      chooseTorrentFiles: async (): Promise<void> => {},
      torrentTrackers: async (): Promise<never[]> => [],
      addTorrentTrackers: async (): Promise<void> => {},
      pauseDownload: async (id: string): Promise<void> => {
        const item = activeDownloadsMap.get(id)
        if (item) {
          item.status = 'paused'
          for (const cb of updateListeners) cb(item as unknown as DownloadUpdate)
        }
      },
      resumeDownload: async (id: string): Promise<void> => {
        const item = activeDownloadsMap.get(id)
        if (item) {
          item.status = 'downloading'
          for (const cb of updateListeners) cb(item as unknown as DownloadUpdate)
        }
      },
      relinkDownload: async (): Promise<void> => {},
      setDownloadNetwork: async (): Promise<void> => {},
      cancelDownload: async (id: string): Promise<void> => {
        const item = activeDownloadsMap.get(id)
        if (item) {
          item.status = 'cancelled'
          for (const cb of updateListeners) cb(item as unknown as DownloadUpdate)
        }
      },
      removeDownload: async (id: string): Promise<void> => {
        activeDownloadsMap.delete(id)
      },
      updateState: async (): Promise<{ status: 'disabled' }> => ({ status: 'disabled' }),
      showUpdateMenu: async (): Promise<void> => {},
      pendingLinks: async (): Promise<never[]> => [],
      resumeFromLink: async (): Promise<void> => {},
      dismissLink: async (): Promise<void> => {},
      usenetServer: async (): Promise<undefined> => undefined,
      saveUsenetServer: async (): Promise<void> => {},
      testUsenetServer: async (): Promise<{ ok: boolean }> => ({ ok: true }),
      telegramState: async (): Promise<{ status: 'logged_out' }> => ({ status: 'logged_out' }),
      telegramStartLogin: async (): Promise<void> => {},
      telegramStartQrLogin: async (): Promise<string> => '',
      telegramSubmitCode: async (): Promise<void> => {},
      telegramSubmitPassword: async (): Promise<void> => {},
      telegramLogout: async (): Promise<void> => {},
      telegramListMedia: async (): Promise<never[]> => [],
      onTelegramAuth: () => (): void => {},
      onLinkReceived: () => (): void => {},
      onDownloadUpdated: (callback: (update: DownloadUpdate) => void): (() => void) => {
        updateListeners.add(callback)
        return () => updateListeners.delete(callback)
      },
      onHistoryChanged: () => (): void => {},
      onUpdateState: () => (): void => {},
      onNetworksChanged: (callback: (networks: NetworkInterfaceInfo[]) => void): (() => void) => {
        networkListeners.add(callback)
        setTimeout(() => callback(defaultInterfaces), 50)
        return () => networkListeners.delete(callback)
      },
      onMagnetCheckStatus: () => (): void => {}
    }

    // Wrap with Proxy so any unhandled property or event returns a safe fallback without throwing
    const proxy = new Proxy(baseShim, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver)
        }
        if (typeof prop === 'string') {
          if (prop.startsWith('on')) {
            return () => (): void => {}
          }
          return async (): Promise<unknown> => undefined
        }
        return undefined
      }
    }) as unknown as typeof window.plexo
    window.plexo = proxy
    window.bondforge = proxy
    window.tesso = proxy
  }
}

// Auto-run immediately upon file load so window.plexo, window.bondforge, and window.tesso are set before other modules run
if (typeof window !== 'undefined') {
  initBrowserShim()
}
