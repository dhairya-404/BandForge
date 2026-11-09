import React, { useState, useEffect } from 'react'
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
  const themeSource = useAppStore((state) => state.themeSource)

  // Dynamic Theme Controller: Synchronize Dark / Light mode across document and DOM
  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (): void => {
      const isDark = themeSource === 'dark' || (!themeSource && mediaQuery.matches)

      if (isDark) {
        root.classList.add('dark')
        root.classList.remove('light')
        root.setAttribute('data-theme', 'dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
        root.setAttribute('data-theme', 'light')
        root.style.colorScheme = 'light'
      }
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [themeSource])

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
        <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans transition-colors duration-150">
          <TessoTitleBar />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <TessoNavigationDeck
              activeTab={effectiveTab}
              onSelectTab={handleSelectTab}
              onOpenNewDownload={() => openNewDownload()}
            />
            <main className="flex-1 min-w-0 flex flex-col bg-[var(--bg)] overflow-hidden transition-colors duration-150">
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
