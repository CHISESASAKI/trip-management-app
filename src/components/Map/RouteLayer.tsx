import { useEffect, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { useStore } from '../../store/useStore';
import L from 'leaflet';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

interface RouteSegment {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  mode: 'walking' | 'driving';
}

export function RouteLayer() {
  const { selectedTrip, places } = useStore();
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const map = useMap();

  // 選択された旅行の場所を取得
  const tripPlaces = selectedTrip 
    ? places.filter(place => selectedTrip.places.includes(place.id))
    : [];

  useEffect(() => {
    if (!selectedTrip || tripPlaces.length < 2) {
      setRouteSegments([]);
      return;
    }

    fetchRoutes();
  }, [selectedTrip, tripPlaces]);

  const fetchRoutes = async () => {
    if (tripPlaces.length < 2) return;

    setIsLoading(true);
    try {
      const segments: RouteSegment[] = [];
      
      // 連続する場所間のルートを取得
      for (let i = 0; i < tripPlaces.length - 1; i++) {
        const start = tripPlaces[i];
        const end = tripPlaces[i + 1];
        
        const route = await fetchRoute(start, end);
        if (route) {
          segments.push(route);
        }
      }
      
      setRouteSegments(segments);
      
      // 全ルートが見えるようにマップを調整
      if (segments.length > 0) {
        const allCoordinates = segments.flatMap(segment => segment.coordinates);
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoute = async (start: RoutePoint, end: RoutePoint): Promise<RouteSegment | null> => {
    try {
      // OpenRouteService APIを使用（無料枠あり）
      // 本来は環境変数で管理すべきですが、デモ用に直接記載
      const apiKey = '5b3ce3597851110001cf6248b8fe49b0e95544a3a24267e4d99b9c1a'; // デモ用
      
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
      );
      
      if (!response.ok) {
        // フォールバック: 直線ルート
        return {
          coordinates: [[start.lat, start.lng], [end.lat, end.lng]],
          distance: calculateDistance(start.lat, start.lng, end.lat, end.lng),
          duration: 0,
          mode: 'walking'
        };
      }
      
      const data = await response.json();
      const route = data.features[0];
      
      if (!route) return null;
      
      // 座標を[lat, lng]形式に変換
      const coordinates: [number, number][] = route.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );
      
      return {
        coordinates,
        distance: route.properties.segments[0].distance,
        duration: route.properties.segments[0].duration,
        mode: 'walking'
      };
    } catch (error) {
      console.error('Route fetch error:', error);
      
      // エラー時のフォールバック: 直線
      return {
        coordinates: [[start.lat, start.lng], [end.lat, end.lng]],
        distance: calculateDistance(start.lat, start.lng, end.lat, end.lng),
        duration: 0,
        mode: 'walking'
      };
    }
  };

  // 2点間の直線距離を計算（km）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // メートル単位
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '計算中';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}時間${remainingMinutes}分`;
  };

  if (!selectedTrip || tripPlaces.length < 2) {
    return null;
  }

  const totalDistance = routeSegments.reduce((sum, segment) => sum + segment.distance, 0);
  const totalDuration = routeSegments.reduce((sum, segment) => sum + segment.duration, 0);

  return (
    <>
      {/* ルートの線を表示 */}
      {routeSegments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.coordinates}
          color="#3B82F6"
          weight={4}
          opacity={0.8}
        />
      ))}
      
      {/* ルート情報の表示 */}
      {!isLoading && routeSegments.length > 0 && (
        <div className="absolute top-16 left-4 md:top-4 md:left-4 bg-white p-3 rounded-lg shadow-lg z-10 max-w-xs">
          <h4 className="text-sm font-semibold mb-2 text-gray-900">
            📍 {selectedTrip.name} のルート
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>総距離:</span>
              <span className="font-medium">{formatDistance(totalDistance)}</span>
            </div>
            <div className="flex justify-between">
              <span>徒歩時間:</span>
              <span className="font-medium">{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span>場所数:</span>
              <span className="font-medium">{tripPlaces.length}箇所</span>
            </div>
          </div>
          
          {/* 場所リスト */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">ルート順序:</div>
            <div className="space-y-1">
              {tripPlaces.map((place, index) => (
                <div key={place.id} className="flex items-center text-xs">
                  <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] mr-2">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 truncate">{place.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute top-16 left-4 md:top-4 md:left-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <div className="flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
            ルートを計算中...
          </div>
        </div>
      )}
    </>
  );
}