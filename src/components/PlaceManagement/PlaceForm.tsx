import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Place } from '../../types/base';
import { X, MapPin, Search } from 'lucide-react';

interface PlaceFormProps {
  place?: Place;
  onClose: () => void;
}

export function PlaceForm({ place, onClose }: PlaceFormProps) {
  const { addPlace, updatePlace } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 35.6762, // Tokyo default
    lng: 139.6503,
    category: 'museum' as Place['category'],
    status: 'interested' as Place['status'],
    notes: '',
    openingHours: '',
    website: '',
    phone: '',
  });

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        category: place.category,
        status: place.status,
        notes: place.notes || '',
        openingHours: place.openingHours || '',
        website: place.website || '',
        phone: place.phone || '',
      });
    }
  }, [place]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('名前と住所は必須項目です。');
      return;
    }

    if (place) {
      updatePlace(place.id, formData);
    } else {
      addPlace(formData);
    }
    
    onClose();
  };

  // Simulate geocoding search (In a real app, you'd use a geocoding API)
  const handleAddressSearch = async () => {
    if (!formData.address.trim()) return;
    
    setIsSearching(true);
    // Simulate API call delay
    setTimeout(() => {
      // For demo purposes, set random coordinates around Tokyo
      const lat = 35.6762 + (Math.random() - 0.5) * 0.1;
      const lng = 139.6503 + (Math.random() - 0.5) * 0.1;
      
      setFormData(prev => ({
        ...prev,
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6))
      }));
      setIsSearching(false);
    }, 1000);
  };

  const categoryOptions = [
    { value: 'museum', label: '博物館' },
    { value: 'gallery', label: '美術館' },
    { value: 'landmark', label: 'ランドマーク' },
    { value: 'restaurant', label: 'レストラン' },
    { value: 'other', label: 'その他' },
  ];

  const statusOptions = [
    { value: 'interested', label: '興味あり' },
    { value: 'planned', label: '計画中' },
    { value: 'visited', label: '訪問済み' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {place ? '場所を編集' : '新しい場所を追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本情報</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                名前 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="場所の名前を入力"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                住所 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="住所を入力"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching || !formData.address.trim()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                  ) : (
                    <Search size={16} />
                  )}
                  検索
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin size={20} />
              位置情報
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                  緯度
                </label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
                  経度
                </label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">詳細情報</h3>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="メモや感想を入力"
              />
            </div>

            <div>
              <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-1">
                営業時間
              </label>
              <input
                type="text"
                id="openingHours"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 9:00-17:00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  ウェブサイト
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="03-1234-5678"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {place ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}