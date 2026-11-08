import React, { useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { BondForgeSidebar, StudioTab } from './components/BondForgeSidebar'
import { ForgeDashboardScreen } from './screens/ForgeDashboardScreen'
import { TransfersScreen } from './screens/TransfersScreen'
import { HardwareDeckScreen } from './screens/HardwareDeckScreen'
import { EngineSettingsScreen } from './screens/EngineSettingsScreen'
import { NewDownloadModal } from './components/NewDownloadModal'
import { useDownloadEvents } from './hooks/useDownloadEvents'
import { useNetworkEvents } from './hooks/useNetworks'
import { useNewDownloadShortcuts, useOpenedLinks } from './hooks/useOpenedLinks'
import { useAppStore } from './store/useAppStore'

function App(): React.JSX.Element {
  // Listen for native hardware/network and download events
  useDownloadEvents()
  useOpenedLinks()
  useNewDownloadShortcuts()
  useNetworkEvents()

  const [activeTab, setActiveTab] = useState<StudioTab>('dashboard')
  const openNewDownload = useAppStore((state) => state.openNewDownload)

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans">
      {/* Sleek Custom TitleBar */}
      <TitleBar />

      {/* Main Studio Two-Pane Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Studio Sidebar Navigation */}
        <BondForgeSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenNewDownload={() => openNewDownload()}
        />

        {/* Central Dynamic Workspace Panel */}
        <main className="flex-1 min-w-0 flex flex-col bg-[var(--bg)] overflow-hidden">
          {activeTab === 'dashboard' && (
            <ForgeDashboardScreen onOpenNewDownload={() => openNewDownload()} />
          )}
          {activeTab === 'transfers' && (
            <TransfersScreen onOpenNewDownload={() => openNewDownload()} />
          )}
          {activeTab === 'adapters' && <HardwareDeckScreen />}
          {activeTab === 'settings' && <EngineSettingsScreen />}
        </main>
      </div>

      {/* New Accelerated Transfer Modal */}
      <NewDownloadModal />
    </div>
  )
}

export default App
