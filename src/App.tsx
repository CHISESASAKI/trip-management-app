import { MapComponent } from './components/Map/MapComponent';
import { SidePanel } from './components/SidePanel/SidePanel';
import { WelcomeGuide } from './components/Onboarding/WelcomeGuide';
import { VersionInfo } from './components/UI/VersionInfo';
import { useState, useEffect } from 'react';
import { Menu, X, HelpCircle } from 'lucide-react';
import { useStore } from './store/useStore';

function App() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const { loadData, places, trips } = useStore();

  useEffect(() => {
    // データをロード（ローカルのみ）
    loadData();

    // 初回訪問判定
    const hasVisited = localStorage.getItem('trip-app-visited');
    if (!hasVisited) {
      // データロード後に判定するためタイマーを使用
      setTimeout(() => {
        if (places.length === 0 && trips.length === 0) {
          setShowWelcomeGuide(true);
          localStorage.setItem('trip-app-visited', 'true');
        }
      }, 1000);
    }

    // Service Worker 更新通知を監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('Service Worker updated, reloading page...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      });
    }
  }, [loadData, places.length, trips.length]);

  return (
    <div className="h-screen flex relative bg-gray-50 dark:bg-gray-900">
      {/* Map Area */}
      <div className="flex-1 relative">
        <MapComponent className="h-full" />
        
        {/* Mobile Menu Button - Enhanced positioning and visibility */}
        <button
          onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          className="md:hidden fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          style={{ zIndex: 1005 }}
          aria-label="Toggle menu"
        >
          {isSidePanelOpen ? (
            <X size={24} className="text-gray-900 dark:text-gray-100" />
          ) : (
            <Menu size={24} className="text-gray-900 dark:text-gray-100" />
          )}
        </button>

        {/* Help Button - Positioned to not conflict with search box */}
        <button
          onClick={() => setShowWelcomeGuide(true)}
          className="fixed top-20 left-4 md:top-4 md:left-4 bg-blue-600 text-white rounded-lg shadow-xl p-3 hover:bg-blue-700 transition-colors"
          style={{ zIndex: 1004 }}
          aria-label="Help guide"
          title="使い方ガイド"
        >
          <HelpCircle size={20} />
        </button>
      </div>
      
      {/* Side Panel - Desktop: Fixed width, Mobile: Overlay */}
      <div className={`
        h-full transition-transform duration-300 ease-in-out z-30
        md:w-96 md:relative md:transform-none
        fixed right-0 top-0 w-80 bg-white dark:bg-gray-800 shadow-xl
        ${isSidePanelOpen ? 'transform translate-x-0' : 'transform translate-x-full md:translate-x-0'}
      `}>
        <SidePanel className="h-full" />
      </div>
      
      {/* Mobile Overlay */}
      {isSidePanelOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* Welcome Guide */}
      {showWelcomeGuide && (
        <WelcomeGuide onClose={() => setShowWelcomeGuide(false)} />
      )}

      {/* Version Info */}
      <VersionInfo />
    </div>
  );
}

export default App;
