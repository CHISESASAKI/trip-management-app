import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Calendar, Ticket, MapPin, ExternalLink } from 'lucide-react';
import type { Trip } from '../../types';

interface TripExhibitionInfoProps {
  trip: Trip;
}

// 展示データの型定義
interface Exhibition {
  id: string;
  name: string;
  venue: string;
  venueId: string;
  description: string;
  startDate: string;
  endDate: string;
  price?: string;
  website?: string;
  category: 'permanent' | 'special' | 'event';
}

// サンプル展示データ（場所IDに基づく）
const SAMPLE_EXHIBITIONS: Exhibition[] = [
  {
    id: '1',
    name: '印象派の巨匠展',
    venue: '東京国立近代美術館',
    venueId: 'place_1',
    description: 'モネ、ルノワール、セザンヌの傑作約80点を展示。印象派の魅力を再発見できる特別展。',
    startDate: '2025-09-01',
    endDate: '2025-12-15',
    price: '一般 1,800円',
    website: 'https://example.com/exhibition1',
    category: 'special'
  },
  {
    id: '2',
    name: '常設展示',
    venue: '東京国立近代美術館',
    venueId: 'place_1',
    description: '近現代の日本美術を中心とした常設コレクション。',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    price: '一般 500円',
    category: 'permanent'
  },
  {
    id: '3',
    name: '現代アート体験ワークショップ',
    venue: '東京都現代美術館',
    venueId: 'place_2',
    description: 'アーティストと一緒に作品制作を体験できるワークショップ。要予約。',
    startDate: '2025-09-10',
    endDate: '2025-09-10',
    price: '参加費 2,000円',
    category: 'event'
  },
  {
    id: '4',
    name: '日本の絵画500年',
    venue: '東京都美術館',
    venueId: 'place_3',
    description: '室町時代から現代まで、日本絵画の流れを時代順に紹介。',
    startDate: '2025-08-15',
    endDate: '2025-11-30',
    price: '一般 1,600円',
    category: 'special'
  }
];

export function TripExhibitionInfo({ trip }: TripExhibitionInfoProps) {
  const { places } = useStore();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTripExhibitions();
  }, [trip.places, trip.startDate, trip.endDate]);

  const loadTripExhibitions = async () => {
    setIsLoading(true);
    
    // 実際のAPIに置き換え可能
    await new Promise(resolve => setTimeout(resolve, 300));

    // 旅行に含まれる場所を取得
    const tripPlaces = places.filter(place => 
      trip.places.includes(place.id) && 
      (place.category === 'museum' || place.category === 'gallery')
    );

    // 関連する展示を取得
    const relevantExhibitions = SAMPLE_EXHIBITIONS.filter(exhibition => {
      // 場所名で簡単なマッチング（実際のAPIではplace IDを使用）
      const hasMatchingVenue = tripPlaces.some(place => 
        exhibition.venue.includes(place.name) || 
        place.name.includes(exhibition.venue) ||
        exhibition.venueId === place.id
      );

      if (!hasMatchingVenue) return false;

      // 旅行期間中に開催されている展示のみ
      const exhibitionStart = new Date(exhibition.startDate);
      const exhibitionEnd = new Date(exhibition.endDate);
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);

      return exhibitionStart <= tripEnd && exhibitionEnd >= tripStart;
    });

    setExhibitions(relevantExhibitions);
    setIsLoading(false);
  };

  const getCategoryLabel = (category: Exhibition['category']) => {
    switch (category) {
      case 'permanent': return '常設展';
      case 'special': return '特別展';
      case 'event': return 'イベント';
      default: return 'その他';
    }
  };

  const getCategoryColor = (category: Exhibition['category']) => {
    switch (category) {
      case 'permanent': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isExhibitionDuringTrip = (exhibition: Exhibition) => {
    const exhibitionStart = new Date(exhibition.startDate);
    const exhibitionEnd = new Date(exhibition.endDate);
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    return exhibitionStart <= tripEnd && exhibitionEnd >= tripStart;
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="text-purple-600" size={18} />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">期間中の展示・イベント</h4>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (exhibitions.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="text-purple-600" size={18} />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">期間中の展示・イベント</h4>
        </div>
        <div className="text-center py-4">
          <Calendar className="mx-auto text-gray-400 mb-2" size={20} />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            該当する展示・イベントはありません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="text-purple-600" size={18} />
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          期間中の展示・イベント ({exhibitions.length}件)
        </h4>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {exhibitions.map((exhibition) => (
          <div
            key={exhibition.id}
            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                  {exhibition.name}
                </h5>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(exhibition.category)}`}>
                    {getCategoryLabel(exhibition.category)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin size={10} />
                    <span>{exhibition.venue}</span>
                  </div>
                </div>
              </div>
              {exhibition.website && (
                <a
                  href={exhibition.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
              {exhibition.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>
                  {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                </span>
              </div>
              {exhibition.price && (
                <div className="flex items-center gap-1">
                  <Ticket size={10} />
                  <span>{exhibition.price}</span>
                </div>
              )}
            </div>

            {/* 旅行期間中表示 */}
            {isExhibitionDuringTrip(exhibition) && (
              <div className="mt-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-800 dark:text-green-300">
                ✅ 旅行期間中に開催
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 注意事項 */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 事前予約が必要な展示もあります。詳細は各施設の公式サイトでご確認ください。
        </p>
      </div>
    </div>
  );
}