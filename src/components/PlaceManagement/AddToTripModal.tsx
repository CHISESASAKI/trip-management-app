import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Place } from '../../types/base';
import { X, MapPin, Calendar } from 'lucide-react';

interface AddToTripModalProps {
  place: Place;
  onClose: () => void;
}

export function AddToTripModal({ place, onClose }: AddToTripModalProps) {
  const { trips, updateTrip } = useStore();
  const [selectedTripId, setSelectedTripId] = useState('');

  // 計画中または実行中の旅行のみ表示
  const availableTrips = trips.filter(trip => 
    trip.status === 'planned' || trip.status === 'in_progress'
  );

  const handleAddToTrip = () => {
    if (!selectedTripId) return;

    const selectedTrip = trips.find(trip => trip.id === selectedTripId);
    if (!selectedTrip) return;

    // 既に追加されている場合はスキップ
    if (selectedTrip.places.includes(place.id)) {
      alert('この場所は既に選択した旅行に追加されています。');
      return;
    }

    // 旅行に場所を追加
    updateTrip(selectedTripId, {
      places: [...selectedTrip.places, place.id]
    });

    alert(`「${place.name}」を「${selectedTrip.name}」に追加しました！`);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">旅行に追加</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 選択中の場所 */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">{place.name}</h3>
              <p className="text-sm text-blue-700 mt-1">{place.address}</p>
            </div>
          </div>
        </div>

        {availableTrips.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">追加可能な旅行計画がありません</p>
            <p className="text-gray-400 text-sm">
              先に旅行計画を作成してください
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              追加先の旅行を選択してください
            </label>
            
            <div className="space-y-2 mb-6">
              {availableTrips.map((trip) => (
                <label
                  key={trip.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTripId === trip.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="trip"
                    value={trip.id}
                    checked={selectedTripId === trip.id}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{trip.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'planned' 
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {trip.status === 'planned' ? '計画中' : '実行中'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      現在の場所数: {trip.places.length}箇所
                      {trip.places.includes(place.id) && (
                        <span className="text-orange-600 ml-2">※既に追加済み</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddToTrip}
                disabled={!selectedTripId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}