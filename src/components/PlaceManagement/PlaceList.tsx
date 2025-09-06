import { useStore } from '../../store/useStore';
import type { Place } from '../../types/base';
import { MapPin, Building, Utensils, Star, Edit3, Trash2, Plus } from 'lucide-react';
import type { JSX } from 'react';
import { AddToTripModal } from './AddToTripModal';
import { EmptyState } from '../UI/EmptyState';
import { useState } from 'react';

interface PlaceListProps {
  onAddPlace: () => void;
  onEditPlace: (place: Place) => void;
}

export function PlaceList({ onAddPlace, onEditPlace }: PlaceListProps) {
  const { places, deletePlace, setSelectedPlace } = useStore();
  const [showAddToTripModal, setShowAddToTripModal] = useState(false);
  const [selectedPlaceForTrip, setSelectedPlaceForTrip] = useState<Place | undefined>();

  const getCategoryIcon = (category: Place['category']) => {
    switch (category) {
      case 'museum':
        return <Building size={16} className="text-blue-600" />;
      case 'gallery':
        return <Star size={16} className="text-purple-600" />;
      case 'restaurant':
        return <Utensils size={16} className="text-orange-600" />;
      case 'landmark':
        return <MapPin size={16} className="text-red-600" />;
      default:
        return <MapPin size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: Place['status']) => {
    switch (status) {
      case 'interested': return 'bg-blue-100 text-blue-700';
      case 'planned': return 'bg-orange-100 text-orange-700';
      case 'visited': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Place['status']) => {
    switch (status) {
      case 'interested': return '興味あり';
      case 'planned': return '計画中';
      case 'visited': return '訪問済み';
      default: return '未設定';
    }
  };

  const handleDeletePlace = (place: Place) => {
    if (window.confirm(`「${place.name}」を削除しますか？`)) {
      deletePlace(place.id);
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleAddToTrip = (place: Place) => {
    setSelectedPlaceForTrip(place);
    setShowAddToTripModal(true);
  };

  const handleCloseAddToTripModal = () => {
    setShowAddToTripModal(false);
    setSelectedPlaceForTrip(undefined);
  };

  const groupedPlaces = places.reduce((groups, place) => {
    const status = place.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(place);
    return groups;
  }, {} as Record<Place['status'], Place[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 md:p-4 border-b">
        <h2 className="text-base md:text-lg font-semibold">場所管理</h2>
        <button
          onClick={onAddPlace}
          className="px-2 md:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
        >
          <span className="hidden md:inline">新しい場所を追加</span>
          <span className="md:hidden">追加</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {places.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} />}
            title="まだ場所が登録されていません"
            description="行きたい場所を追加して、旅行計画の準備を始めましょう！"
            actionLabel="最初の場所を追加"
            onAction={onAddPlace}
            suggestions={[
              "地図を拡大すると美術館やカフェなどのPOIが表示されます",
              "POIをクリックして「マイリストに追加」で簡単登録",
              "「新しい場所を追加」ボタンで手動登録も可能",
              "住所やキーワードで検索して追加することもできます"
            ]}
          />
        ) : (
          <div className="space-y-6">
            {/* 興味あり */}
            {groupedPlaces.interested && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  興味あり ({groupedPlaces.interested.length})
                </h3>
                <div className="space-y-2">
                  {groupedPlaces.interested.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onEdit={onEditPlace}
                      onDelete={handleDeletePlace}
                      onClick={handlePlaceClick}
                      onAddToTrip={handleAddToTrip}
                      getCategoryIcon={getCategoryIcon}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 計画中 */}
            {groupedPlaces.planned && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  計画中 ({groupedPlaces.planned.length})
                </h3>
                <div className="space-y-2">
                  {groupedPlaces.planned.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onEdit={onEditPlace}
                      onDelete={handleDeletePlace}
                      onClick={handlePlaceClick}
                      onAddToTrip={handleAddToTrip}
                      getCategoryIcon={getCategoryIcon}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 訪問済み */}
            {groupedPlaces.visited && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  訪問済み ({groupedPlaces.visited.length})
                </h3>
                <div className="space-y-2">
                  {groupedPlaces.visited.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onEdit={onEditPlace}
                      onDelete={handleDeletePlace}
                      onClick={handlePlaceClick}
                      onAddToTrip={handleAddToTrip}
                      getCategoryIcon={getCategoryIcon}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {showAddToTripModal && selectedPlaceForTrip && (
        <AddToTripModal
          place={selectedPlaceForTrip}
          onClose={handleCloseAddToTripModal}
        />
      )}
    </div>
  );
}

interface PlaceCardProps {
  place: Place;
  onEdit: (place: Place) => void;
  onDelete: (place: Place) => void;
  onClick: (place: Place) => void;
  onAddToTrip: (place: Place) => void;
  getCategoryIcon: (category: Place['category']) => JSX.Element;
  getStatusColor: (status: Place['status']) => string;
  getStatusText: (status: Place['status']) => string;
}

function PlaceCard({
  place,
  onEdit,
  onDelete,
  onClick,
  onAddToTrip,
  getCategoryIcon,
  getStatusColor,
  getStatusText
}: PlaceCardProps) {
  return (
    <div 
      className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick(place)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(place.category)}
            <h4 className="font-semibold text-gray-900 truncate">{place.name}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{place.address}</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(place.status)}`}>
              {getStatusText(place.status)}
            </span>
            <span className="text-xs text-gray-500 capitalize">{place.category}</span>
          </div>
          {place.notes && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{place.notes}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToTrip(place);
            }}
            className="p-1.5 md:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            aria-label="旅行に追加"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(place);
            }}
            className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="編集"
          >
            <Edit3 size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(place);
            }}
            className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="削除"
          >
            <Trash2 size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}