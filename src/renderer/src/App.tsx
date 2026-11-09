import type { DownloadState, FinishedDownload } from '@shared/types'
import React, { useState } from 'react'
import { TessoNavigationDeck, StudioTab } from './components/TessoNavigationDeck'
import { DownloadActionsProvider } from './components/DownloadActionsProvider'
import { NetworkBindingDialog } from './components/NetworkBindingDialog'
import { NewPipelineModal } from './components/NewPipelineModal'
import { StatusBar } from './components/StatusBar'
import { TelegramDialog } from './components/TelegramDialog'
import { TessoTitleBar } from './components/TessoTitleBar'
import { TooltipProvider } from './components/ui/tooltip'
import { useDownloadEvents } from './hooks/useDownloadEvents'
import { useNetworkEvents } from './hooks/useNetworks'
import { useNewDownloadShortcuts, useOpenedLinks } from './hooks/useOpenedLinks'
import { CompleteScreen } from './screens/CompleteScreen'
import { DownloadingScreen } from './screens/DownloadingScreen'
import { PipelineStudioScreen } from './screens/PipelineStudioScreen'
import { EngineSettingsScreen } from './screens/EngineSettingsScreen'
import { ErrorScreen } from './screens/ErrorScreen'
import { NexusDashboardScreen } from './screens/NexusDashboardScreen'
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
        <NexusDashboardScreen
          onOpenNewDownload={() => useAppStore.getState().openNewDownload()}
          onNavigateBrowserFlow={() => onNavigateTab('browser')}
          onNavigateTransfers={() => onNavigateTab('transfers')}
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
      return <PipelineStudioScreen />
  }
}

function App(): React.JSX.Element {
  useDownloadEvents()
  useOpenedLinks()
  useNewDownloadShortcuts()
  useNetworkEvents()

  // Default landing route is the Tesso Nexus Command Dashboard
  const [activeTab, setActiveTab] = useState<StudioTab>('dashboard')
  const openNewDownload = useAppStore((state) => state.openNewDownload)
  const isDetailView = useAppStore((state) => state.view.name === 'download')

  return (
    <TooltipProvider>
      <DownloadActionsProvider>
        <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans">
          <TessoTitleBar />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {!isDetailView && (
              <TessoNavigationDeck
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
          <NewPipelineModal />
          <TelegramDialog />
          <NetworkBindingDialog />
        </div>
      </DownloadActionsProvider>
    </TooltipProvider>
  )
}

export default App
