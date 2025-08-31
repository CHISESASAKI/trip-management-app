import { useStore } from '../../store/useStore';
import type { Place, ViewMode } from '../../types/base';
import { MapPin, Calendar, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { PlaceList } from '../PlaceManagement/PlaceList';
import { PlaceForm } from '../PlaceManagement/PlaceForm';
import { TripList } from '../TripManagement/TripList';
import { DataManager } from '../DataManagement/DataManager';

interface SidePanelProps {
  className?: string;
}

export function SidePanel({ className = '' }: SidePanelProps) {
  const { currentViewMode, setViewMode, selectedPlace, selectedTrip } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | undefined>();

  const viewModes: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'places', label: '場所管理', icon: <MapPin size={20} /> },
    { mode: 'planning', label: '旅行計画', icon: <Calendar size={20} /> },
    { mode: 'records', label: 'データ管理', icon: <Settings size={20} /> },
  ];

  if (isCollapsed) {
    return (
      <div className={`bg-white shadow-lg border-l ${className}`}>
        <div className="p-4 border-b">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="space-y-2 p-2">
          {viewModes.map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                setIsCollapsed(false);
              }}
              className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                currentViewMode === mode
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-lg border-l flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">一人旅管理</h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* View Mode Tabs - Mobile: Icons only, Desktop: With labels */}
        <div className="flex space-x-1 mt-4">
          {viewModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center justify-center space-x-1 px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 md:flex-none ${
                currentViewMode === mode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={label} // Add tooltip for mobile
            >
              {icon}
              <span className="hidden md:inline ml-1">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentViewMode === 'places' && (
          <div>
            {/* Instructions */}
            <div className="p-3 md:p-4 bg-blue-50 border-b">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 使い方</h3>
              <div className="space-y-1 text-xs md:text-sm text-blue-700">
                <p>• 地図を拡大すると美術館・お店が表示</p>
                <p>• POIをクリック→「マイリストに追加」</p>
                <p>• 空いた場所をクリックして場所追加</p>
                <p>• 下のボタンで手動追加も可能</p>
              </div>
            </div>
            
            <PlaceList 
              onAddPlace={() => {
                setEditingPlace(undefined);
                setShowPlaceForm(true);
              }}
              onEditPlace={(place) => {
                setEditingPlace(place);
                setShowPlaceForm(true);
              }}
            />
          </div>
        )}
        {currentViewMode === 'planning' && (
          <TripList />
        )}
        {currentViewMode === 'records' && (
          <DataManager />
        )}
      </div>

      {/* Selected Place/Trip Details */}
      {(selectedPlace || selectedTrip) && (
        <div className="border-t bg-gray-50 p-4">
          {selectedPlace && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{selectedPlace.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedPlace.address}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {selectedPlace.status === 'interested' ? '興味あり' :
                   selectedPlace.status === 'planned' ? '計画中' : '訪問済み'}
                </span>
                <span className="text-xs text-gray-500 capitalize">{selectedPlace.category}</span>
              </div>
              {selectedPlace.notes && (
                <p className="text-sm text-gray-700 mt-2">{selectedPlace.notes}</p>
              )}
            </div>
          )}
          {selectedTrip && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{selectedTrip.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedTrip.startDate} - {selectedTrip.endDate}
              </p>
              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs mt-2">
                {selectedTrip.status === 'planned' ? '計画中' :
                 selectedTrip.status === 'in_progress' ? '実行中' : '完了'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Place Form Modal */}
      {showPlaceForm && (
        <PlaceForm 
          place={editingPlace}
          onClose={() => {
            setShowPlaceForm(false);
            setEditingPlace(undefined);
          }}
        />
      )}
    </div>
  );
}

