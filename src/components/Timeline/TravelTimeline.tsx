import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Calendar, MapPin, Camera, DollarSign, Clock, Star, FileText, Eye } from 'lucide-react';
import type { Trip } from '../../types/base';
import { TripRecordEditor } from '../TripRecord/TripRecordEditor';

interface TimelineItem {
  trip: Trip;
  year: number;
  month: number;
  photoCount: number;
  visitedPlaces: number;
}

export function TravelTimeline() {
  const { trips, places, photos, setSelectedTrip } = useStore();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showRecordEditor, setShowRecordEditor] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>();

  // 完了した旅行のみを取得し、時系列でソート
  const completedTrips = trips
    .filter(trip => trip.status === 'completed')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // タイムラインアイテムを作成
  const timelineItems: TimelineItem[] = completedTrips.map(trip => {
    const startDate = new Date(trip.startDate);
    const tripPhotos = photos.filter(photo => photo.tripId === trip.id);
    const visitedPlaces = places.filter(place => 
      trip.places.includes(place.id) && place.status === 'visited'
    ).length;

    return {
      trip,
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      photoCount: tripPhotos.length,
      visitedPlaces
    };
  });

  // 年ごとにグループ化
  const groupedByYear = timelineItems.reduce((groups, item) => {
    if (!groups[item.year]) {
      groups[item.year] = [];
    }
    groups[item.year].push(item);
    return groups;
  }, {} as Record<number, TimelineItem[]>);

  // 年の一覧を取得（新しい順）
  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // 統計情報
  const totalTrips = completedTrips.length;
  const totalPhotos = timelineItems.reduce((sum, item) => sum + item.photoCount, 0);
  const totalPlaces = timelineItems.reduce((sum, item) => sum + item.visitedPlaces, 0);
  const totalCost = completedTrips.reduce((sum, trip) => sum + (trip.actualCost || 0), 0);

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleEditRecord = (trip: Trip) => {
    setEditingTrip(trip);
    setShowRecordEditor(true);
  };

  const handleCloseRecordEditor = () => {
    setShowRecordEditor(false);
    setEditingTrip(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleDateString('ja-JP', { month: 'long' });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (completedTrips.length === 0) {
    return (
      <div className="p-6 text-center">
        <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          まだ旅行記録がありません
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          旅行を完了すると、ここにタイムラインが表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー統計 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          🕒 旅行履歴タイムライン
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTrips}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">旅行回数</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPlaces}</div>
            <div className="text-sm text-green-800 dark:text-green-300">訪問場所</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalPhotos}</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">写真枚数</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totalCost > 0 ? `¥${Math.round(totalCost / 10000)}万` : '未記録'}
            </div>
            <div className="text-sm text-orange-800 dark:text-orange-300">総費用</div>
          </div>
        </div>
      </div>

      {/* 年フィルター */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedYear(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedYear === null
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            全て
          </button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {year}年 ({groupedByYear[year].length})
            </button>
          ))}
        </div>
      </div>

      {/* タイムライン */}
      <div className="flex-1 overflow-y-auto p-4">
        {years
          .filter(year => selectedYear === null || year === selectedYear)
          .map(year => (
            <div key={year} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {year}年
                </h3>
                <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {groupedByYear[year].length}回の旅行
                </span>
              </div>

              <div className="space-y-4">
                {groupedByYear[year].map((item, _index) => (
                  <div key={item.trip.id} className="relative">
                    {/* タイムライン線 */}
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    
                    {/* タイムラインドット */}
                    <div className="absolute left-4 top-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 shadow-md"></div>

                    {/* 旅行カード */}
                    <div 
                      className="ml-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-shadow group"
                      onClick={() => handleTripClick(item.trip)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* 日付とタイトル */}
                          <div className="mb-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              {formatDate(item.trip.startDate)} - {formatDate(item.trip.endDate)}
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {item.trip.name}
                            </h4>
                            {item.trip.description && (
                              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.trip.description}
                              </p>
                            )}
                          </div>

                          {/* 統計情報 */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {getDuration(item.trip.startDate, item.trip.endDate)}日間
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.visitedPlaces}ヶ所
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Camera size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.photoCount}枚
                              </span>
                            </div>
                            {item.trip.actualCost && (
                              <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  ¥{item.trip.actualCost.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* タグ */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              完了
                            </span>
                            {item.trip.theme && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {item.trip.theme}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {getMonthName(item.month)}
                            </span>
                          </div>

                          {/* メモプレビュー */}
                          {item.trip.notes && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Star size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.trip.notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* アクションボタン */}
                        <div className="flex flex-col gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRecord(item.trip);
                            }}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="記録を編集"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTripClick(item.trip);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="詳細を表示"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Trip Record Editor Modal */}
      {showRecordEditor && editingTrip && (
        <TripRecordEditor
          trip={editingTrip}
          onClose={handleCloseRecordEditor}
        />
      )}
    </div>
  );
}