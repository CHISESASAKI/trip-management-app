import { useStore } from '../../store/useStore';
import type { Place, ViewMode } from '../../types/base';
import { MapPin, Calendar, Camera, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { PlaceList } from '../PlaceManagement/PlaceList';
import { PlaceForm } from '../PlaceManagement/PlaceForm';

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
    { mode: 'records', label: '旅行記録', icon: <Camera size={20} /> },
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
        
        {/* View Mode Tabs */}
        <div className="flex space-x-1 mt-4">
          {viewModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentViewMode === mode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentViewMode === 'places' && (
          <div>
            {/* Instructions */}
            <div className="p-4 bg-blue-50 border-b">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 使い方</h3>
              <div className="space-y-1 text-xs text-blue-700">
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
          <PlanningPanel />
        )}
        {currentViewMode === 'records' && (
          <RecordsPanel />
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

// Placeholder components for each panel
function PlanningPanel() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">旅行計画</h2>
        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
          新しい計画を作成
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 text-center">旅行計画がありません</p>
          <p className="text-gray-400 text-sm text-center mt-2">
            上のボタンから新しい旅行計画を作成してください
          </p>
        </div>
      </div>
    </div>
  );
}

function RecordsPanel() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">旅行記録</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 text-center">旅行記録がありません</p>
          <p className="text-gray-400 text-sm text-center mt-2">
            完了した旅行がここに表示されます
          </p>
        </div>
      </div>
    </div>
  );
}