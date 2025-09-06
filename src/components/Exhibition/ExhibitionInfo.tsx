import { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, MapPin, Ticket } from 'lucide-react';
import type { Place } from '../../types';

interface Exhibition {
  id: string;
  name: string;
  venue: string;
  description: string;
  startDate: string;
  endDate: string;
  price?: string;
  website?: string;
  image?: string;
  category: 'permanent' | 'special' | 'event';
}

interface ExhibitionInfoProps {
  place: Place;
  tripStartDate?: string;
  tripEndDate?: string;
}

// サンプル展示データ（実際にはAPIから取得）
const SAMPLE_EXHIBITIONS: Exhibition[] = [
  {
    id: '1',
    name: '印象派の巨匠展',
    venue: '東京国立近代美術館',
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
    description: '室町時代から現代まで、日本絵画の流れを時代順に紹介。',
    startDate: '2025-08-15',
    endDate: '2025-11-30',
    price: '一般 1,600円',
    category: 'special'
  }
];

export function ExhibitionInfo({ place, tripStartDate, tripEndDate }: ExhibitionInfoProps) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadExhibitions();
  }, [place.name, tripStartDate, tripEndDate]);

  const loadExhibitions = async () => {
    setIsLoading(true);
    
    // 実際のAPIに置き換え可能
    // 現在はサンプルデータをフィルタリング
    await new Promise(resolve => setTimeout(resolve, 500)); // ローディング演出

    const filtered = SAMPLE_EXHIBITIONS.filter(exhibition => {
      // 美術館・博物館名で簡単なマッチング
      const venueMatch = exhibition.venue.includes(place.name) || 
                        place.name.includes('美術館') || 
                        place.name.includes('博物館') ||
                        place.category === 'museum' || 
                        place.category === 'gallery';

      if (!venueMatch) return false;

      // 旅行期間が指定されている場合は、期間中に開催されているもののみ
      if (tripStartDate && tripEndDate) {
        const exhibitionStart = new Date(exhibition.startDate);
        const exhibitionEnd = new Date(exhibition.endDate);
        const tripStart = new Date(tripStartDate);
        const tripEnd = new Date(tripEndDate);

        return (exhibitionStart <= tripEnd && exhibitionEnd >= tripStart);
      }

      return true;
    });

    setExhibitions(filtered);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredExhibitions = selectedCategory === 'all' 
    ? exhibitions 
    : exhibitions.filter(ex => ex.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            展示・イベント情報
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="text-purple-600" size={20} />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          展示・イベント情報
        </h3>
      </div>

      {exhibitions.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            現在、該当する展示・イベント情報はありません
          </p>
        </div>
      ) : (
        <>
          {/* カテゴリフィルター */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({exhibitions.length})
            </button>
            {['permanent', 'special', 'event'].map(category => {
              const count = exhibitions.filter(ex => ex.category === category).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryLabel(category as Exhibition['category'])} ({count})
                </button>
              );
            })}
          </div>

          {/* 展示リスト */}
          <div className="space-y-3">
            {filteredExhibitions.map((exhibition) => (
              <div
                key={exhibition.id}
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {exhibition.name}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exhibition.category)}`}>
                        {getCategoryLabel(exhibition.category)}
                      </span>
                      {exhibition.venue && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin size={12} />
                          <span>{exhibition.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {exhibition.website && (
                    <a
                      href={exhibition.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                  {exhibition.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                    </span>
                  </div>
                  {exhibition.price && (
                    <div className="flex items-center gap-1">
                      <Ticket size={12} />
                      <span>{exhibition.price}</span>
                    </div>
                  )}
                </div>

                {/* 旅行期間との重複表示 */}
                {tripStartDate && tripEndDate && (
                  <div className="mt-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-800 dark:text-green-300">
                    ✅ 旅行期間中に開催中
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 営業情報 */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">施設情報</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {place.openingHours && (
                <p>📅 営業時間: {place.openingHours}</p>
              )}
              <p>📞 最新情報は公式サイトでご確認ください</p>
              <p>🎫 料金は展示により異なる場合があります</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}