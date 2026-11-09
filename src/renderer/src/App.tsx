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
import { PipelineStudioScreen } from './screens/PipelineStudioScreen'
import { EngineSettingsScreen } from './screens/EngineSettingsScreen'
import { NexusDashboardScreen } from './screens/NexusDashboardScreen'
import { HardwareDeckScreen } from './screens/HardwareDeckScreen'
import { BrowserFlowScreen } from './screens/BrowserFlowScreen'
import { useAppStore } from './store/useAppStore'

function CurrentScreen({
  activeTab,
  onNavigateTab
}: {
  activeTab: StudioTab
  onNavigateTab: (tab: StudioTab) => void
}): React.JSX.Element {
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
  const view = useAppStore((state) => state.view)
  const setView = useAppStore((state) => state.setView)

  // When an external item is opened in download view, derive effective tab directly
  const effectiveTab: StudioTab = view.name === 'download' ? 'transfers' : activeTab

  const handleSelectTab = (tab: StudioTab): void => {
    if (view.name === 'download') {
      setView({ name: 'list' })
    }
    setActiveTab(tab)
  }

  return (
    <TooltipProvider>
      <DownloadActionsProvider>
        <div className="flex h-full flex-col bg-[#08090c] text-[var(--text)] overflow-hidden font-sans">
          <TessoTitleBar />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <TessoNavigationDeck
              activeTab={effectiveTab}
              onSelectTab={handleSelectTab}
              onOpenNewDownload={() => openNewDownload()}
            />
            <main className="flex-1 min-w-0 flex flex-col bg-[#08090c] overflow-hidden">
              <CurrentScreen activeTab={effectiveTab} onNavigateTab={handleSelectTab} />
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
