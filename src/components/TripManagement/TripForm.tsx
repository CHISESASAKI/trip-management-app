import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Trip } from '../../types/base';
import { X, Calendar, MapPin, FileText, GripVertical, Trash2 } from 'lucide-react';

interface TripFormProps {
  trip?: Trip;
  onClose: () => void;
}

export function TripForm({ trip, onClose }: TripFormProps) {
  const { addTrip, updateTrip, places } = useStore();
  
  const [formData, setFormData] = useState({
    name: trip?.name || '',
    description: trip?.description || '',
    startDate: trip?.startDate || '',
    endDate: trip?.endDate || '',
    theme: trip?.theme || '',
    notes: trip?.notes || '',
    status: trip?.status || 'planned' as Trip['status']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(trip?.places || []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '旅行名は必須です';
    }

    if (!formData.startDate) {
      newErrors.startDate = '開始日は必須です';
    }

    if (!formData.endDate) {
      newErrors.endDate = '終了日は必須です';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '終了日は開始日以降にしてください';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const tripData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      theme: formData.theme.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      status: formData.status,
      places: selectedPlaces,
      images: trip?.images || []
    };

    if (trip) {
      updateTrip(trip.id, tripData);
    } else {
      addTrip(tripData);
    }

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 場所の追加
  const addPlace = (placeId: string) => {
    if (!selectedPlaces.includes(placeId)) {
      setSelectedPlaces(prev => [...prev, placeId]);
    }
  };

  // 場所の削除
  const removePlace = (placeId: string) => {
    setSelectedPlaces(prev => prev.filter(id => id !== placeId));
  };

  // 場所の順番変更
  const movePlaceUp = (index: number) => {
    if (index > 0) {
      const newPlaces = [...selectedPlaces];
      [newPlaces[index - 1], newPlaces[index]] = [newPlaces[index], newPlaces[index - 1]];
      setSelectedPlaces(newPlaces);
    }
  };

  const movePlaceDown = (index: number) => {
    if (index < selectedPlaces.length - 1) {
      const newPlaces = [...selectedPlaces];
      [newPlaces[index], newPlaces[index + 1]] = [newPlaces[index + 1], newPlaces[index]];
      setSelectedPlaces(newPlaces);
    }
  };

  const themes = [
    '文化・歴史',
    '自然・風景',
    'グルメ',
    'アート・美術',
    'ショッピング',
    'リラックス',
    'アクティブ',
    'その他'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {trip ? '旅行計画を編集' : '新しい旅行計画'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 旅行名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              旅行名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 京都の紅葉巡り"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="旅行の目的や概要を入力してください"
            />
          </div>

          {/* 日程 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                開始日 *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                終了日 *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* テーマ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テーマ
            </label>
            <select
              value={formData.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planned">計画中</option>
              <option value="in_progress">実行中</option>
              <option value="completed">完了</option>
            </select>
          </div>

          {/* 場所の選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              訪問場所
            </label>
            
            {/* 場所追加セクション */}
            <div className="mb-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addPlace(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">場所を選択して追加...</option>
                {places
                  .filter(place => !selectedPlaces.includes(place.id))
                  .map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name} - {place.address}
                    </option>
                  ))}
              </select>
            </div>

            {/* 選択された場所一覧 */}
            {selectedPlaces.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  訪問順序：{selectedPlaces.length}箇所選択済み
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {selectedPlaces.map((placeId, index) => {
                    const place = places.find(p => p.id === placeId);
                    if (!place) return null;
                    
                    return (
                      <div key={placeId} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => movePlaceUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="上に移動"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => movePlaceDown(index)}
                            disabled={index === selectedPlaces.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="下に移動"
                          >
                            ▼
                          </button>
                        </div>
                        
                        <GripVertical size={16} className="text-gray-400" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {index + 1}. {place.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {place.address}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removePlace(placeId)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="削除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {selectedPlaces.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                まだ場所が選択されていません。上のドロップダウンから場所を追加してください。
              </p>
            )}
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="特別な準備や注意事項など"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {trip ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}