import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Save, MapPin, Clock, Star, Camera, Utensils } from 'lucide-react';
import type { Trip, Place } from '../../types/base';

interface PlaceMemoEditorProps {
  trip: Trip;
  places: Place[];
  onBack: () => void;
}

interface PlaceMemo {
  placeId: string;
  visitTime?: string;
  rating?: number;
  experience?: string;
  foodNotes?: string;
  recommendations?: string;
  photos?: string[];
}

export function PlaceMemoEditor({ trip, places, onBack }: PlaceMemoEditorProps) {
  const { photos, saveData } = useStore();
  const [placeMemos, setPlaceMemos] = useState<PlaceMemo[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(places[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  // 場所ごとの写真を取得
  const getPlacePhotos = (placeId: string) => {
    return photos.filter(photo => 
      photo.placeId === placeId && 
      photo.tripId === trip.id
    );
  };

  // 初期化：既存のメモがあれば読み込み
  useEffect(() => {
    const savedMemos = localStorage.getItem(`trip-memos-${trip.id}`);
    if (savedMemos) {
      setPlaceMemos(JSON.parse(savedMemos));
    } else {
      // 初期状態として空のメモを作成
      setPlaceMemos(places.map(place => ({ placeId: place.id })));
    }
  }, [trip.id, places]);

  const selectedPlace = places.find(p => p.id === selectedPlaceId);
  const selectedMemo = placeMemos.find(m => m.placeId === selectedPlaceId);
  const placePhotos = getPlacePhotos(selectedPlaceId);

  const updateMemo = (field: keyof PlaceMemo, value: any) => {
    setPlaceMemos(prev => 
      prev.map(memo => 
        memo.placeId === selectedPlaceId 
          ? { ...memo, [field]: value }
          : memo
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // ローカルストレージに保存
      localStorage.setItem(`trip-memos-${trip.id}`, JSON.stringify(placeMemos));
      
      // データ保存
      await saveData();
      
      alert('場所別メモを保存しました！');
      onBack();
    } catch (error) {
      console.error('Failed to save place memos:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStarRating = (rating: number = 0) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={20}
            className={`cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => updateMemo('rating', star)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating > 0 ? `${rating}/5` : '未評価'}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!selectedPlace) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">場所が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            場所別メモの編集
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {trip.name} • {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>保存</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 場所リスト */}
        <div className="lg:col-span-1">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            訪問した場所
          </h4>
          <div className="space-y-2">
            {places.map(place => {
              const memo = placeMemos.find(m => m.placeId === place.id);
              const hasContent = memo && (memo.experience || memo.rating || memo.foodNotes || memo.recommendations);
              
              return (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPlaceId === place.id
                      ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-500" />
                        <span className="font-medium text-sm">{place.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {place.address}
                      </p>
                      {memo?.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={12} className="text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {memo.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                    {hasContent && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* メモ編集フォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
            {/* 選択中の場所情報 */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedPlace.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlace.address}
              </p>
              {placePhotos.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400">
                  <Camera size={14} />
                  <span>{placePhotos.length}枚の写真</span>
                </div>
              )}
            </div>

            {/* 訪問時間 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={16} />
                訪問時間
              </label>
              <input
                type="time"
                value={selectedMemo?.visitTime || ''}
                onChange={(e) => updateMemo('visitTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 評価 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star size={16} />
                総合評価
              </label>
              {renderStarRating(selectedMemo?.rating)}
            </div>

            {/* 体験・感想 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 体験・感想
              </label>
              <textarea
                value={selectedMemo?.experience || ''}
                onChange={(e) => updateMemo('experience', e.target.value)}
                placeholder="この場所での体験や感想を詳しく記録しましょう..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 食事・グルメ */}
            {(selectedPlace.category === 'restaurant' || selectedPlace.category === 'cafe') && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Utensils size={16} />
                  食事・グルメメモ
                </label>
                <textarea
                  value={selectedMemo?.foodNotes || ''}
                  onChange={(e) => updateMemo('foodNotes', e.target.value)}
                  placeholder="注文した料理、味の感想、価格、サービスなど..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* おすすめ・次回への情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💡 おすすめ・次回への情報
              </label>
              <textarea
                value={selectedMemo?.recommendations || ''}
                onChange={(e) => updateMemo('recommendations', e.target.value)}
                placeholder="他の人におすすめしたいポイント、次回訪問時の注意点、ベストな時間帯など..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 写真プレビュー */}
            {placePhotos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  📸 この場所で撮影した写真
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {placePhotos.slice(0, 6).map(photo => (
                    <div key={photo.id} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={`${selectedPlace.name}の写真`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                  ))}
                  {placePhotos.length > 6 && (
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600 dark:text-gray-400">
                        <Camera size={20} />
                        <div className="text-xs mt-1">+{placePhotos.length - 6}枚</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}