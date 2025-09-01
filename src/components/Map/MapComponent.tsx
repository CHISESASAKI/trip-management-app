import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useStore } from '../../store/useStore';
import type { Place } from '../../types/base';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { POILayer } from './POILayer';
import { RouteLayer } from './RouteLayer';
import { Moon, Sun } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, status: Place['status']) => {
  let iconHtml = '';
  
  switch (status) {
    case 'interested':
      iconHtml = `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>`;
      break;
    case 'planned':
      iconHtml = `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H17V12H7V10ZM7 14H12V16H7V14Z"/>
        </svg>
      </div>`;
      break;
    case 'visited':
      iconHtml = `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
        </svg>
      </div>`;
      break;
  }
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const getMarkerColor = (status: Place['status']) => {
  switch (status) {
    case 'interested': return '#3B82F6'; // Blue
    case 'planned': return '#F59E0B'; // Orange
    case 'visited': return '#10B981'; // Green
    default: return '#6B7280'; // Gray
  }
};

// Map click handler component
function MapClickHandler() {
  const { setSelectedPlace, addPlace } = useStore();
  
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      // Clear selected place first
      setSelectedPlace(undefined);
      
      // Show confirmation to add place at clicked location
      // Simplified message for mobile
      const message = window.innerWidth < 768 
        ? '📍 この場所に追加しますか？'
        : `この場所（緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}）に場所を追加しますか？`;
      
      if (window.confirm(message)) {
        searchLocationInfo(lat, lng, addPlace);
      }
    },
  });
  
  return null;
}

// Search for location information using Nominatim API
async function searchLocationInfo(lat: number, lng: number, addPlace: Function) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=ja`
    );
    
    if (!response.ok) {
      throw new Error('位置情報の取得に失敗しました');
    }
    
    const data = await response.json();
    
    // Extract information from the response
    const name = data.display_name.split(',')[0] || '新しい場所';
    const address = data.display_name || `緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`;
    
    // Determine category based on amenity or building type
    let category: Place['category'] = 'other';
    if (data.address?.amenity) {
      const amenity = data.address.amenity;
      if (amenity.includes('restaurant') || amenity.includes('cafe') || amenity.includes('food')) {
        category = 'restaurant';
      } else if (amenity.includes('museum')) {
        category = 'museum';
      }
    }
    
    // Add the place
    addPlace({
      name,
      address,
      lat,
      lng,
      category,
      status: 'interested' as Place['status'],
      notes: `地図上でクリックして追加された場所`,
    });
    
    alert(`「${name}」を追加しました！`);
    
  } catch (error) {
    console.error('Error fetching location info:', error);
    
    // Fallback: add with basic information
    const fallbackName = `場所 ${new Date().toLocaleTimeString()}`;
    addPlace({
      name: fallbackName,
      address: `緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`,
      lat,
      lng,
      category: 'other' as Place['category'],
      status: 'interested' as Place['status'],
      notes: '地図上でクリックして追加された場所',
    });
    
    alert(`${fallbackName}を追加しました！`);
  }
}

interface MapComponentProps {
  className?: string;
}

export function MapComponent({ className = '' }: MapComponentProps) {
  const { 
    places, 
    setSelectedPlace, 
    mapViewState,
    isDarkMode,
    toggleTheme,
    loadData 
  } = useStore();

  const [showPOIs, setShowPOIs] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={mapViewState.center}
        zoom={mapViewState.zoom}
        className="h-full w-full z-0"
        whenReady={() => {
          // Map event handlers are set up in POILayer and MapClickHandler
        }}
      >
        {/* より見やすいタイルプロバイダーを使用 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler />
        
        {/* POI Layer */}
        {showPOIs && <POILayer />}
        
        {/* Route Layer */}
        <RouteLayer />
        
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createCustomIcon(getMarkerColor(place.status), place.status)}
            eventHandlers={{
              click: () => handleMarkerClick(place),
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2 min-w-48 max-w-72">
                <h3 className="font-semibold text-base md:text-lg mb-1 leading-tight">{place.name}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 leading-relaxed">{place.address}</p>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getMarkerColor(place.status) + '20',
                      color: getMarkerColor(place.status)
                    }}
                  >
                    {place.status === 'interested' ? '興味あり' : 
                     place.status === 'planned' ? '計画中' : '訪問済み'}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{place.category}</span>
                </div>
                {place.notes && (
                  <p className="text-xs md:text-sm text-gray-700 mt-2 leading-relaxed">{place.notes}</p>
                )}
                {place.openingHours && (
                  <p className="text-xs text-gray-500 mt-1">
                    営業時間: {place.openingHours}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map controls - Responsive positioning */}
      <div className="absolute top-4 left-4 md:top-4 md:right-4 space-y-2 z-10">
        <button
          onClick={() => setShowPOIs(!showPOIs)}
          className={`px-3 py-2 rounded-lg shadow-lg text-xs md:text-sm font-medium transition-colors ${
            showPOIs 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <span className="hidden md:inline">{showPOIs ? 'POI非表示' : 'POI表示'}</span>
          <span className="md:hidden">{showPOIs ? 'POI' : 'POI'}</span>
        </button>
        
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg shadow-lg text-xs md:text-sm font-medium transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun size={16} className="md:w-5 md:h-5" />
          ) : (
            <Moon size={16} className="md:w-5 md:h-5" />
          )}
        </button>
      </div>

      {/* Map legend - Hide on small screens, show on hover/click */}
      <div className="hidden md:block absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <h4 className="text-sm font-semibold mb-2">凡例</h4>
        
        <div className="space-y-1 mb-3">
          <h5 className="text-xs font-medium text-gray-600">マイリスト</h5>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>興味あり</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>計画中</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>訪問済み</span>
          </div>
        </div>

        {showPOIs && (
          <div className="space-y-1 border-t pt-2">
            <h5 className="text-xs font-medium text-gray-600">POI</h5>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>博物館</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>美術館</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>レストラン</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span>カフェ</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ズーム14以上で表示
            </div>
          </div>
        )}
      </div>
    </div>
  );
}