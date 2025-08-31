import { MapComponent } from './components/Map/MapComponent';
import { SidePanel } from './components/SidePanel/SidePanel';

function App() {
  return (
    <div className="h-screen flex">
      {/* Map Area */}
      <div className="flex-1">
        <MapComponent className="h-full" />
      </div>
      
      {/* Side Panel */}
      <div className="w-96 h-full">
        <SidePanel className="h-full" />
      </div>
    </div>
  );
}

export default App;
