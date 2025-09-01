import { MapComponent } from './components/Map/MapComponent';
import { SidePanel } from './components/SidePanel/SidePanel';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function App() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  return (
    <div className="h-screen flex relative bg-gray-50 dark:bg-gray-900">
      {/* Map Area */}
      <div className="flex-1 relative">
        <MapComponent className="h-full" />
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          className="md:hidden absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidePanelOpen ? <X size={24} className="text-gray-900 dark:text-gray-100" /> : <Menu size={24} className="text-gray-900 dark:text-gray-100" />}
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
    </div>
  );
}

export default App;
