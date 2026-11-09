import { useState, useEffect, useCallback } from 'react'
import type { ProxyStatus } from '@shared/types'

export function useProxyStatus(): {
  status: ProxyStatus | null
  toggleProxy: (enabled: boolean) => Promise<void>
  loading: boolean
  refresh: () => Promise<void>
} {
  const [status, setStatus] = useState<ProxyStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async (): Promise<void> => {
    const api =
      typeof window !== 'undefined' ? window.tesso || window.bondforge || window.plexo : undefined
    if (!api?.getProxyStatus) return
    try {
      const s = await api.getProxyStatus()
      setStatus(s)
    } catch (e) {
      console.error('Failed to get proxy status:', e)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const api =
      typeof window !== 'undefined' ? window.tesso || window.bondforge || window.plexo : undefined

    if (api?.getProxyStatus) {
      void api
        .getProxyStatus()
        .then((s) => {
          if (!cancelled) setStatus(s)
        })
        .catch(() => {})
    }

    if (api?.onProxyStatusChanged) {
      const unsub = api.onProxyStatusChanged((next) => {
        if (!cancelled) setStatus(next)
      })
      return () => {
        cancelled = true
        unsub()
      }
    }

    return () => {
      cancelled = true
    }
  }, [])

  const toggleProxy = useCallback(
    async (enabled: boolean): Promise<void> => {
      const api =
        typeof window !== 'undefined' ? window.tesso || window.bondforge || window.plexo : undefined
      if (!api?.setProxyEnabled) return
      setLoading(true)
      try {
        await api.setProxyEnabled(enabled)
        await refresh()
      } catch (e) {
        console.error('Failed to toggle proxy:', e)
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  return { status, toggleProxy, loading, refresh }
}
