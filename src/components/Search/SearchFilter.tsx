import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Place, Trip } from '../../types/base';

interface SearchFilterProps {
  places: Place[];
  trips: Trip[];
  onFilteredResults: (places: Place[], trips: Trip[]) => void;
  className?: string;
}

export function SearchFilter({ places, trips, onFilteredResults, className = '' }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    tripStatus: 'all'
  });

  // 検索とフィルタリングのロジック
  const applyFilters = (query: string, filterState = filters) => {
    // 場所のフィルタリング
    let filteredPlaces = places;

    // テキスト検索
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredPlaces = filteredPlaces.filter(place =>
        place.name.toLowerCase().includes(searchTerm) ||
        place.address.toLowerCase().includes(searchTerm) ||
        place.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // カテゴリフィルタ
    if (filterState.category !== 'all') {
      filteredPlaces = filteredPlaces.filter(place => place.category === filterState.category);
    }

    // ステータスフィルタ
    if (filterState.status !== 'all') {
      filteredPlaces = filteredPlaces.filter(place => place.status === filterState.status);
    }

    // 旅行のフィルタリング
    let filteredTrips = trips;

    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredTrips = filteredTrips.filter(trip =>
        trip.name.toLowerCase().includes(searchTerm) ||
        trip.description?.toLowerCase().includes(searchTerm) ||
        trip.theme?.toLowerCase().includes(searchTerm) ||
        trip.notes?.toLowerCase().includes(searchTerm)
      );
    }

    if (filterState.tripStatus !== 'all') {
      filteredTrips = filteredTrips.filter(trip => trip.status === filterState.tripStatus);
    }

    onFilteredResults(filteredPlaces, filteredTrips);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      category: 'all',
      status: 'all',
      tripStatus: 'all'
    });
    onFilteredResults(places, trips);
  };

  const hasActiveFilters = searchQuery.trim() || 
    filters.category !== 'all' || 
    filters.status !== 'all' || 
    filters.tripStatus !== 'all';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 検索バー */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="場所や旅行を検索..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* フィルタボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            hasActiveFilters
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter size={16} />
          <span>フィルタ</span>
          {hasActiveFilters && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            クリア
          </button>
        )}
      </div>

      {/* フィルタオプション */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-3">
          {/* 場所カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              場所カテゴリ
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="museum">博物館</option>
              <option value="gallery">美術館</option>
              <option value="landmark">ランドマーク</option>
              <option value="restaurant">レストラン</option>
              <option value="cafe">カフェ</option>
              <option value="other">その他</option>
            </select>
          </div>

          {/* 場所ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              場所ステータス
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="interested">興味あり</option>
              <option value="planned">計画中</option>
              <option value="visited">訪問済み</option>
            </select>
          </div>

          {/* 旅行ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              旅行ステータス
            </label>
            <select
              value={filters.tripStatus}
              onChange={(e) => handleFilterChange('tripStatus', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="planned">計画中</option>
              <option value="in_progress">実行中</option>
              <option value="completed">完了</option>
            </select>
          </div>
        </div>
      )}

      {/* 検索結果サマリー */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          検索結果: 場所 {places.length}件, 旅行 {trips.length}件
        </div>
      )}
    </div>
  );
}