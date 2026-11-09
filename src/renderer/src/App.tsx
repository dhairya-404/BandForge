import type { DownloadState, FinishedDownload } from '@shared/types'
import React, { useState } from 'react'
import { BondForgeSidebar, StudioTab } from './components/BondForgeSidebar'
import { DownloadActionsProvider } from './components/DownloadActionsProvider'
import { NetworkBindingDialog } from './components/NetworkBindingDialog'
import { NewDownloadDialog } from './components/NewDownloadDialog'
import { StatusBar } from './components/StatusBar'
import { TelegramDialog } from './components/TelegramDialog'
import { TitleBar } from './components/TitleBar'
import { TooltipProvider } from './components/ui/tooltip'
import { useDownloadEvents } from './hooks/useDownloadEvents'
import { useNetworkEvents } from './hooks/useNetworks'
import { useNewDownloadShortcuts, useOpenedLinks } from './hooks/useOpenedLinks'
import { CompleteScreen } from './screens/CompleteScreen'
import { DownloadingScreen } from './screens/DownloadingScreen'
import { DownloadsScreen } from './screens/DownloadsScreen'
import { EngineSettingsScreen } from './screens/EngineSettingsScreen'
import { ErrorScreen } from './screens/ErrorScreen'
import { ForgeDashboardScreen } from './screens/ForgeDashboardScreen'
import { HardwareDeckScreen } from './screens/HardwareDeckScreen'
import { BrowserFlowScreen } from './screens/BrowserFlowScreen'
import { useAppStore } from './store/useAppStore'

function assertNever(status: never): never {
  throw new Error(`Unhandled download status: ${String(status)}`)
}

function renderDownload(download: DownloadState | FinishedDownload): React.JSX.Element {
  if ('unitsWritten' in download) return <CompleteScreen download={download} />
  switch (download.status) {
    case 'queued':
    case 'downloading':
    case 'paused':
      return <DownloadingScreen download={download} />
    case 'completed':
      return <CompleteScreen download={download} />
    case 'error':
    case 'cancelled':
      return <ErrorScreen download={download} />
    default:
      return assertNever(download.status)
  }
}

function CurrentScreen({
  activeTab,
  onNavigateTab
}: {
  activeTab: StudioTab
  onNavigateTab: (tab: StudioTab) => void
}): React.JSX.Element {
  const shown = useAppStore((store) => {
    const { view } = store
    if (view.name !== 'download') return null
    return store.downloads[view.id] ?? store.history.find((entry) => entry.id === view.id) ?? null
  })
  const cancelled = shown && !('unitsWritten' in shown) && shown.status === 'cancelled'

  if (shown && !cancelled) {
    return renderDownload(shown)
  }

  switch (activeTab) {
    case 'dashboard':
      return (
        <ForgeDashboardScreen
          onOpenNewDownload={() => useAppStore.getState().openNewDownload()}
          onNavigateBrowserFlow={() => onNavigateTab('browser')}
        />
      )
    case 'adapters':
      return <HardwareDeckScreen />
    case 'browser':
      return <BrowserFlowScreen />
    case 'settings':
      return <EngineSettingsScreen />
    case 'transfers':
    default:
      return <DownloadsScreen />
  }
}

function App(): React.JSX.Element {
  useDownloadEvents()
  useOpenedLinks()
  useNewDownloadShortcuts()
  useNetworkEvents()

  const [activeTab, setActiveTab] = useState<StudioTab>('transfers')
  const openNewDownload = useAppStore((state) => state.openNewDownload)
  const isDetailView = useAppStore((state) => state.view.name === 'download')

  return (
    <TooltipProvider>
      <DownloadActionsProvider>
        <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans">
          <TitleBar />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {!isDetailView && (
              <BondForgeSidebar
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenNewDownload={() => openNewDownload()}
              />
            )}
            <main className="flex-1 min-w-0 flex flex-col bg-[var(--bg)] overflow-hidden">
              <CurrentScreen activeTab={activeTab} onNavigateTab={setActiveTab} />
            </main>
          </div>
          <StatusBar />
          <NewDownloadDialog />
          <TelegramDialog />
          <NetworkBindingDialog />
        </div>
      </DownloadActionsProvider>
    </TooltipProvider>
  )
}

export default App
