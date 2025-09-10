import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Save, MapPin, Edit3 } from 'lucide-react';
import type { Trip } from '../../types/base';
import { PlaceMemoEditor } from './PlaceMemoEditor';

interface TripRecordEditorProps {
  trip: Trip;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TripRecordEditor({ trip, onClose, onSuccess }: TripRecordEditorProps) {
  const { updateTrip, places } = useStore();
  
  const [formData, setFormData] = useState({
    name: trip.name,
    description: trip.description || '',
    notes: trip.notes || ''
  });
  
  const [showPlaceMemos, setShowPlaceMemos] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 旅行に含まれる場所を取得
  const tripPlaces = places.filter(place => trip.places.includes(place.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateTrip(trip.id, {
        ...formData,
        notes: formData.notes.trim() || undefined,
        description: formData.description.trim() || undefined,
        updatedAt: new Date().toISOString()
      });

      alert('旅行記録を更新しました！');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to update trip record:', error);
      alert('更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Edit3 className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                旅行記録の編集
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
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
          {!showPlaceMemos ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">基本情報</h3>
                
                {/* 旅行名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🧳 旅行名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* 旅行の説明・感想 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📝 旅行の感想・振り返り
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="旅行全体の感想や印象に残ったことを記録しましょう..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>


                {/* その他のメモ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📋 その他のメモ
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="持ち物の反省、次回への改善点、おすすめ情報など..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 訪問した場所の一覧 */}
              {tripPlaces.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      訪問した場所（{tripPlaces.length}ヶ所）
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowPlaceMemos(true)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      場所別メモを編集
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tripPlaces.map(place => (
                      <div key={place.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          <span className="font-medium">{place.name}</span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            訪問済み
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {place.address}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            <PlaceMemoEditor 
              trip={trip}
              places={tripPlaces}
              onBack={() => setShowPlaceMemos(false)}
            />
          )}
        </div>

        {/* フッター */}
        {!showPlaceMemos && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
        )}
      </div>
    </div>
  );
}