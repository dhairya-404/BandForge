import {
  createServer as createHttpServer,
  type IncomingMessage,
  type ServerResponse
} from 'node:http'
import type { Socket } from 'node:net'
import { connectFrom } from '../network/deviceBinding'
import { listActiveInterfaces } from '../network/interfaces'
import type { NetworkInterfaceInfo } from '../../shared/types'

export interface InterfaceProxyStats {
  id: string
  name: string
  address: string
  activeConnections: number
  bytesReceived: number
  bytesSent: number
}

export interface ProxyStatus {
  enabled: boolean
  port: number
  pacPort: number
  pacUrl: string
  activeConnections: number
  totalBytes: number
  interfaces: Record<string, InterfaceProxyStats>
}

export class MultiWanProxy {
  private proxyServer: ReturnType<typeof createHttpServer> | null = null
  private pacServer: ReturnType<typeof createHttpServer> | null = null
  private readonly proxyPort: number = 9090
  private readonly pacPort: number = 9091
  private enabled: boolean = false
  private activeConnections: number = 0
  private nextInterfaceIdx: number = 0
  private cachedInterfaces: NetworkInterfaceInfo[] = []
  private readonly stats: Map<string, InterfaceProxyStats> = new Map()
  private onStatsUpdate?: (status: ProxyStatus) => void

  constructor(proxyPort = 9090, pacPort = 9091) {
    this.proxyPort = proxyPort
    this.pacPort = pacPort
  }

  public setStatsListener(listener: (status: ProxyStatus) => void): void {
    this.onStatsUpdate = listener
  }

  public async start(): Promise<boolean> {
    if (this.enabled) return true

    await this.refreshInterfaces()

    try {
      await this.startPacServer()
      await this.startProxyServer()
      this.enabled = true
      this.emitStats()
      console.info(
        `[Tesso] Multi-WAN Browser Proxy active on 127.0.0.1:${this.proxyPort} (PAC: 127.0.0.1:${this.pacPort}/proxy.pac)`
      )
      return true
    } catch (err) {
      console.error('[Tesso] Failed to start Multi-WAN Proxy:', err)
      await this.stop()
      return false
    }
  }

  public async stop(): Promise<void> {
    this.enabled = false
    if (this.proxyServer) {
      this.proxyServer.close()
      this.proxyServer = null
    }
    if (this.pacServer) {
      this.pacServer.close()
      this.pacServer = null
    }
    this.activeConnections = 0
    this.emitStats()
    console.info('[Tesso] Multi-WAN Browser Proxy stopped.')
  }

  public getStatus(): ProxyStatus {
    const ifaceMap: Record<string, InterfaceProxyStats> = {}
    let totalBytes = 0

    for (const [id, stat] of this.stats.entries()) {
      ifaceMap[id] = { ...stat }
      totalBytes += stat.bytesReceived + stat.bytesSent
    }

    return {
      enabled: this.enabled,
      port: this.proxyPort,
      pacPort: this.pacPort,
      pacUrl: `http://127.0.0.1:${this.pacPort}/proxy.pac`,
      activeConnections: this.activeConnections,
      totalBytes,
      interfaces: ifaceMap
    }
  }

  public async refreshInterfaces(): Promise<void> {
    try {
      const active = await listActiveInterfaces()
      this.updateInterfaces(active)
    } catch (err) {
      console.warn('[Tesso] Error refreshing proxy interfaces:', err)
    }
  }

  public updateInterfaces(active: NetworkInterfaceInfo[]): void {
    this.cachedInterfaces = active.filter((i) => i.addresses.some((a) => a.family === 4))
    for (const iface of this.cachedInterfaces) {
      if (!this.stats.has(iface.id)) {
        this.stats.set(iface.id, {
          id: iface.id,
          name: iface.displayName || iface.device,
          address: iface.addresses.find((a) => a.family === 4)?.address || '',
          activeConnections: 0,
          bytesReceived: 0,
          bytesSent: 0
        })
      }
    }
  }

  private getInterfaceCandidates(): Array<{ iface?: NetworkInterfaceInfo; address?: string }> {
    if (this.cachedInterfaces.length === 0) {
      return [{}]
    }

    const startIdx = this.nextInterfaceIdx % this.cachedInterfaces.length
    this.nextInterfaceIdx++

    const candidates: Array<{ iface?: NetworkInterfaceInfo; address?: string }> = []
    for (let i = 0; i < this.cachedInterfaces.length; i++) {
      const iface = this.cachedInterfaces[(startIdx + i) % this.cachedInterfaces.length]
      const address = iface.addresses.find((a) => a.family === 4)?.address
      candidates.push({ iface, address })
    }

    // Unpinned fallback route as safety net
    candidates.push({})
    return candidates
  }

  private startPacServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pacServer = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
        const url = req.url || '/'
        if (url === '/proxy.pac' || url === '/') {
          const pacScript = `function FindProxyForURL(url, host) {
  // Direct for local addresses and intranet
  if (isPlainHostName(host) ||
      shExpMatch(host, "*.local") ||
      isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
      isInNet(dnsResolve(host), "172.16.0.0", "255.240.0.0") ||
      isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0") ||
      isInNet(dnsResolve(host), "127.0.0.0", "255.0.0.0")) {
    return "DIRECT";
  }
  // Route all public internet traffic across Tesso's Multi-WAN proxy
  return "PROXY 127.0.0.1:${this.proxyPort}; DIRECT";
}
`
          res.writeHead(200, {
            'Content-Type': 'application/x-ns-proxy-autoconfig',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          })
          res.end(pacScript)
          return
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      })

      this.pacServer.once('error', reject)
      this.pacServer.listen(this.pacPort, '127.0.0.1', () => {
        resolve()
      })
    })
  }

  private startProxyServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.proxyServer = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
        // Plain HTTP forward proxying
        this.handleHttpRequest(req, res)
      })

      // HTTPS CONNECT Tunneling
      this.proxyServer.on('connect', (req: IncomingMessage, clientSocket: Socket, head: Buffer) => {
        this.handleConnectTunnel(req, clientSocket, head)
      })

      this.proxyServer.once('error', reject)
      this.proxyServer.listen(this.proxyPort, '127.0.0.1', () => {
        resolve()
      })
    })
  }

  private handleConnectTunnel(req: IncomingMessage, clientSocket: Socket, head: Buffer): void {
    const target = req.url
    if (!target) {
      clientSocket.destroy()
      return
    }

    const parts = target.split(':')
    const host = parts[0]
    const port = parseInt(parts[1] || '443', 10)

    const candidates = this.getInterfaceCandidates()
    let candidateIndex = 0
    let remoteSocket: Socket | null = null
    let activeStat: InterfaceProxyStats | null = null
    let isConnected = false
    let isClientClosed = false

    const onClientClose = (): void => {
      isClientClosed = true
      if (remoteSocket) {
        remoteSocket.destroy()
      }
      this.cleanupConnection(activeStat)
      activeStat = null
    }

    clientSocket.once('close', onClientClose)
    clientSocket.on('error', () => {
      remoteSocket?.destroy()
    })

    const tryNextCandidate = (): void => {
      if (isClientClosed || isConnected) return

      if (remoteSocket) {
        remoteSocket.removeAllListeners()
        remoteSocket.destroy()
        remoteSocket = null
        this.cleanupConnection(activeStat)
        activeStat = null
      }

      if (candidateIndex >= candidates.length) {
        try {
          clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n')
        } catch {
          // Client might already be closed
        }
        clientSocket.destroy()
        return
      }

      const candidate = candidates[candidateIndex++]
      const chosenAddress = candidate.address
      const ifaceId = candidate.iface?.id

      this.activeConnections++
      activeStat = ifaceId ? this.stats.get(ifaceId) || null : null
      if (activeStat) activeStat.activeConnections++
      this.emitStats()

      let socket: Socket
      try {
        socket = connectFrom(chosenAddress, host, port, candidate.iface?.device)
      } catch (err) {
        console.warn(`[Tesso] Failed to create socket to ${host}:${port} on iface ${ifaceId}:`, err)
        tryNextCandidate()
        return
      }

      remoteSocket = socket
      socket.setTimeout(5000)

      socket.once('timeout', () => {
        if (!isConnected) {
          console.warn(
            `[Tesso Proxy] Connection timeout to ${host}:${port} on iface ${ifaceId || 'default'}, falling back`
          )
          tryNextCandidate()
        }
      })

      socket.once('error', (err) => {
        if (!isConnected) {
          console.warn(
            `[Tesso Proxy] Error connecting to ${host}:${port} on iface ${ifaceId || 'default'}: ${err.message}, falling back`
          )
          tryNextCandidate()
        }
      })

      socket.once('connect', () => {
        isConnected = true
        socket.setTimeout(0)

        try {
          clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
          if (head && head.length > 0) {
            socket.write(head)
          }

          clientSocket.on('data', (chunk) => {
            if (activeStat) activeStat.bytesSent += chunk.length
          })

          socket.on('data', (chunk) => {
            if (activeStat) activeStat.bytesReceived += chunk.length
          })

          clientSocket.pipe(socket)
          socket.pipe(clientSocket)

          socket.once('close', () => {
            this.cleanupConnection(activeStat)
            activeStat = null
          })
        } catch {
          socket.destroy()
          clientSocket.destroy()
        }
      })
    }

    tryNextCandidate()
  }

  private handleHttpRequest(req: IncomingMessage, res: ServerResponse): void {
    // If a direct browser GET comes to the proxy root
    if (req.url === '/' || req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(this.getStatus(), null, 2))
      return
    }

    let parsed: URL
    try {
      parsed = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('Bad Request')
      return
    }

    const host = parsed.hostname
    const port = parseInt(parsed.port || '80', 10)
    const candidates = this.getInterfaceCandidates()
    let candidateIndex = 0

    const tryNextHttp = (): void => {
      if (candidateIndex >= candidates.length) {
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end('Bad Gateway')
        }
        return
      }

      const candidate = candidates[candidateIndex++]
      const chosenAddress = candidate.address
      const ifaceId = candidate.iface?.id
      const stat = ifaceId ? this.stats.get(ifaceId) || null : null

      let socket: Socket
      try {
        socket = connectFrom(chosenAddress, host, port, candidate.iface?.device)
      } catch {
        tryNextHttp()
        return
      }

      let isConnected = false
      socket.setTimeout(5000)
      socket.once('timeout', () => {
        if (!isConnected) {
          socket.destroy()
          tryNextHttp()
        }
      })

      socket.once('error', () => {
        if (!isConnected) {
          tryNextHttp()
        }
      })

      socket.once('connect', () => {
        isConnected = true
        socket.setTimeout(0)
        socket.write(`${req.method} ${parsed.pathname}${parsed.search} HTTP/1.1\r\n`)
        for (const [key, val] of Object.entries(req.headers)) {
          if (Array.isArray(val)) {
            val.forEach((v) => socket.write(`${key}: ${v}\r\n`))
          } else if (val) {
            socket.write(`${key}: ${val}\r\n`)
          }
        }
        socket.write('\r\n')

        req.on('data', (chunk) => {
          if (stat) stat.bytesSent += chunk.length
          socket.write(chunk)
        })

        socket.on('data', (chunk) => {
          if (stat) stat.bytesReceived += chunk.length
        })

        socket.pipe(res)
      })
    }

    tryNextHttp()
  }

  private cleanupConnection(stat: InterfaceProxyStats | null | undefined): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1)
    if (stat) {
      stat.activeConnections = Math.max(0, stat.activeConnections - 1)
    }
    this.emitStats()
  }

  private emitStats(): void {
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.getStatus())
    }
  }
}

export const globalProxy = new MultiWanProxy()
