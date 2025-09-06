import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, MapPin, Calendar, Camera, Save, Navigation, Search } from 'lucide-react';
import type { Photo, Place } from '../../types/base';

interface PhotoReclassifyModalProps {
  photo: Photo;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PlaceWithDistance extends Place {
  distance?: number;
}

export function PhotoReclassifyModal({ photo, onClose, onSuccess }: PhotoReclassifyModalProps) {
  const { places, trips, photos } = useStore();
  
  const [selectedPlaceId, setSelectedPlaceId] = useState(photo.placeId || '');
  const [selectedTripId, setSelectedTripId] = useState(photo.tripId || '');
  const [caption, setCaption] = useState(photo.caption || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    lat: photo.location?.lat || '',
    lng: photo.location?.lng || ''
  });
  const [locationSearch, setLocationSearch] = useState('');

  // 現在の分類情報
  const currentPlace = photo.placeId ? places.find(p => p.id === photo.placeId) : undefined;
  const currentTrip = photo.tripId ? trips.find(t => t.id === photo.tripId) : undefined;
  const selectedPlace = selectedPlaceId ? places.find(p => p.id === selectedPlaceId) : undefined;
  const selectedTrip = selectedTripId ? trips.find(t => t.id === selectedTripId) : undefined;

  // 候補となる場所を取得（位置情報がある場合は近い順にソート）
  const getSuggestedPlaces = (): PlaceWithDistance[] => {
    if (!photo.location) return places;

    return places
      .map(place => {
        const distance = Math.sqrt(
          Math.pow(place.lat - photo.location!.lat, 2) + 
          Math.pow(place.lng - photo.location!.lng, 2)
        ) * 111000; // 大まかな距離（m）

        return { ...place, distance };
      })
      .sort((a, b) => a.distance! - b.distance!);
  };

  const suggestedPlaces = getSuggestedPlaces();

  // 写真の撮影日時に基づいて候補となる旅行を取得
  const getSuggestedTrips = () => {
    const photoDate = new Date(photo.takenAt || photo.createdAt);
    
    return trips
      .filter(trip => {
        const tripStart = new Date(trip.startDate);
        const tripEnd = new Date(trip.endDate);
        
        // 撮影日が旅行期間内、または前後1週間以内
        const weekBefore = new Date(tripStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAfter = new Date(tripEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return photoDate >= weekBefore && photoDate <= weekAfter;
      })
      .sort((a, b) => {
        // 撮影日に近い旅行順にソート
        const aStart = new Date(a.startDate).getTime();
        const bStart = new Date(b.startDate).getTime();
        const photoTime = photoDate.getTime();
        
        return Math.abs(aStart - photoTime) - Math.abs(bStart - photoTime);
      });
  };

  const suggestedTrips = getSuggestedTrips();

  const handleSave = async () => {
    setIsUpdating(true);
    
    try {
      // 手動位置情報の処理
      let locationData = photo.location;
      if (manualLocation.lat && manualLocation.lng) {
        locationData = {
          lat: typeof manualLocation.lat === 'string' ? parseFloat(manualLocation.lat) : manualLocation.lat,
          lng: typeof manualLocation.lng === 'string' ? parseFloat(manualLocation.lng) : manualLocation.lng
        };
      } else if (selectedPlaceId && !photo.location) {
        // 場所が選択されていて、写真に位置情報がない場合、場所の位置情報を使用
        const selectedPlace = places.find(p => p.id === selectedPlaceId);
        if (selectedPlace) {
          locationData = {
            lat: selectedPlace.lat,
            lng: selectedPlace.lng
          };
        }
      }

      // 写真データを更新
      const updatedPhotos = photos.map(p => {
        if (p.id === photo.id) {
          return {
            ...p,
            placeId: selectedPlaceId || undefined,
            tripId: selectedTripId || undefined,
            caption: caption.trim() || undefined,
            location: locationData,
            autoClassified: false, // 手動で再分類したのでfalseにする
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      // ストアを直接更新（実際のアプリではupdatePhoto関数を使用）
      useStore.setState({ photos: updatedPhotos });

      // データ保存
      const store = useStore.getState();
      store.saveData();
      
      // Firebase同期
      if (store.useFirebase) {
        try {
          await store.syncWithFirebase();
        } catch (error) {
          console.error('Failed to sync photo reclassification:', error);
        }
      }

      alert('写真の分類を更新しました！');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to update photo:', error);
      alert('更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDistanceText = (place: PlaceWithDistance) => {
    if (!photo.location || !place.distance) return '';
    
    if (place.distance < 1000) {
      return `約${Math.round(place.distance)}m`;
    } else {
      return `約${(place.distance / 1000).toFixed(1)}km`;
    }
  };

  const handleLocationFromPlace = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    if (place) {
      setManualLocation({
        lat: place.lat.toString(),
        lng: place.lng.toString()
      });
    }
  };

  const handleLocationSearch = () => {
    if (!locationSearch) return;
    
    const filteredPlaces = places.filter(place =>
      place.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      place.address.toLowerCase().includes(locationSearch.toLowerCase())
    );
    
    return filteredPlaces.slice(0, 5);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Camera className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                写真の再分類
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                撮影場所や関連する旅行を変更できます
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* 写真プレビュー */}
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt="写真プレビュー"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="text-gray-400" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">撮影日時: </span>
                  <span className="font-medium">{formatDate(photo.takenAt || photo.createdAt)}</span>
                </div>
                {photo.location && (
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">位置情報: </span>
                    <span className="font-medium">
                      {photo.location.lat.toFixed(6)}, {photo.location.lng.toFixed(6)}
                    </span>
                  </div>
                )}
                {photo.autoClassified && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    📍 自動分類済み
                  </div>
                )}
              </div>
            </div>

            {/* 現在の分類 */}
            {(currentPlace || currentTrip) && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">現在の分類</h3>
                <div className="space-y-2">
                  {currentPlace && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-gray-500" />
                      <span>{currentPlace.name}</span>
                    </div>
                  )}
                  {currentTrip && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-gray-500" />
                      <span>{currentTrip.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 場所選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📍 関連する場所
              </label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">場所を選択しない</option>
                {suggestedPlaces.map(place => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                    {photo.location && place.distance !== undefined && ` (${getDistanceText(place)})`}
                  </option>
                ))}
              </select>
              {selectedPlace && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  📍 {selectedPlace.address}
                </p>
              )}
            </div>

            {/* 旅行選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🧳 関連する旅行
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">旅行を選択しない</option>
                {suggestedTrips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} ({trip.startDate} - {trip.endDate})
                  </option>
                ))}
              </select>
              {selectedTrip && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  📅 {selectedTrip.startDate} - {selectedTrip.endDate}
                </p>
              )}
            </div>

            {/* 位置情報編集 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  📍 位置情報
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {photo.location ? '位置情報を編集' : '位置情報を追加'}
                </button>
              </div>
              
              {photo.location && !showLocationInput && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Navigation size={14} className="text-green-600" />
                    <span>緯度: {photo.location.lat.toFixed(6)}</span>
                    <span>経度: {photo.location.lng.toFixed(6)}</span>
                  </div>
                </div>
              )}

              {(!photo.location || showLocationInput) && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {/* 場所から位置情報を取得 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      既存の場所から位置情報を取得
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="場所名で検索..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const results = handleLocationSearch();
                          if (results && results.length > 0) {
                            handleLocationFromPlace(results[0].id);
                            setLocationSearch('');
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Search size={14} />
                      </button>
                    </div>
                    
                    {locationSearch && (
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {handleLocationSearch()?.map(place => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => {
                              handleLocationFromPlace(place.id);
                              setLocationSearch('');
                            }}
                            className="w-full text-left p-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded border-b border-gray-200 dark:border-gray-600"
                          >
                            <div className="font-medium">{place.name}</div>
                            <div className="text-gray-600 dark:text-gray-400 text-xs">{place.address}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 手動入力 */}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      手動で座標を入力
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">緯度</label>
                        <input
                          type="number"
                          step="0.000001"
                          placeholder="35.6762"
                          value={manualLocation.lat}
                          onChange={(e) => setManualLocation(prev => ({ ...prev, lat: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">経度</label>
                        <input
                          type="number"
                          step="0.000001"
                          placeholder="139.6503"
                          value={manualLocation.lng}
                          onChange={(e) => setManualLocation(prev => ({ ...prev, lng: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      💡 Google Mapsで場所を右クリック→座標をコピーできます
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* キャプション編集 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💬 キャプション
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="写真についての説明やメモを追加..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>更新中...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>保存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}