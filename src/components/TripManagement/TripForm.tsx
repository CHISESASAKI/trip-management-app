import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Trip } from '../../types/base';
import { X, Calendar, MapPin, DollarSign, FileText } from 'lucide-react';

interface TripFormProps {
  trip?: Trip;
  onClose: () => void;
}

export function TripForm({ trip, onClose }: TripFormProps) {
  const { addTrip, updateTrip } = useStore();
  
  const [formData, setFormData] = useState({
    name: trip?.name || '',
    description: trip?.description || '',
    startDate: trip?.startDate || '',
    endDate: trip?.endDate || '',
    theme: trip?.theme || '',
    budget: trip?.budget?.toString() || '',
    notes: trip?.notes || '',
    status: trip?.status || 'planned' as Trip['status']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = '予算は数値で入力してください';
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
      budget: formData.budget ? Number(formData.budget) : undefined,
      notes: formData.notes.trim() || undefined,
      status: formData.status,
      places: trip?.places || [],
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

          {/* 予算 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              予算
            </label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.budget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="50000"
            />
            {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
            <p className="text-gray-500 text-sm mt-1">円単位で入力してください</p>
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