import { useState, useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { Building, Coffee, Utensils, Star, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  category: 'museum' | 'gallery' | 'restaurant' | 'cafe' | 'other';
}

// POI type mapping
const POI_TYPES = {
  museum: ['museum'],
  gallery: ['gallery', 'arts_centre'],
  restaurant: ['restaurant', 'fast_food'],
  cafe: ['cafe', 'bar', 'pub'],
  other: ['tourist_attraction', 'attraction', 'viewpoint']
};

// Create custom icons for POIs
const createPOIIcon = (category: POI['category'], isTemporary = true) => {
  let iconComponent;
  let color;

  switch (category) {
    case 'museum':
      iconComponent = <Building size={16} />;
      color = '#8B5CF6'; // Purple
      break;
    case 'gallery':
      iconComponent = <Star size={16} />;
      color = '#EC4899'; // Pink
      break;
    case 'restaurant':
      iconComponent = <Utensils size={16} />;
      color = '#F59E0B'; // Orange
      break;
    case 'cafe':
      iconComponent = <Coffee size={16} />;
      color = '#8B4513'; // Brown
      break;
    default:
      iconComponent = <MapPin size={16} />;
      color = '#6B7280'; // Gray
  }

  const iconHtml = `
    <div style="
      background-color: ${color}; 
      width: 28px; 
      height: 28px; 
      border-radius: 50%; 
      border: 2px solid white; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex; 
      align-items: center; 
      justify-content: center;
      opacity: ${isTemporary ? '0.7' : '1'};
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        ${renderToStaticMarkup(iconComponent).replace(/<svg[^>]*>|<\/svg>/g, '')}
      </svg>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'poi-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Fetch POIs from Overpass API with rate limiting protection
async function fetchPOIs(bounds: L.LatLngBounds): Promise<POI[]> {
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();

  // Overpass API query for various POI types
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"~"^(museum|gallery|arts_centre|restaurant|fast_food|cafe|bar|pub)$"](${south},${west},${north},${east});
      node["tourism"~"^(museum|gallery|attraction)$"](${south},${west},${north},${east});
    );
    out body;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Overpass API rate limit reached, using cached POIs...');
        // Return cached POIs instead of empty array during rate limiting
        return [];
      }
      if (response.status >= 500) {
        console.warn('Overpass API server error, retrying later...');
        return [];
      }
      throw new Error(`POI data fetch failed: ${response.status}`);
    }

    const data = await response.json();
    
    return data.elements
      .filter((element: any) => element.lat && element.lon && element.tags?.name)
      .map((element: any) => {
        const amenity = element.tags.amenity || element.tags.tourism || 'other';
        let category: POI['category'] = 'other';

        // Categorize POIs
        for (const [cat, types] of Object.entries(POI_TYPES)) {
          if (types.includes(amenity)) {
            category = cat as POI['category'];
            break;
          }
        }

        return {
          id: element.id.toString(),
          name: element.tags.name || element.tags['name:ja'] || '名称不明',
          lat: element.lat,
          lng: element.lon,
          type: amenity,
          category,
        };
      })
      .slice(0, 50); // Limit to 50 POIs for performance
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return [];
  }
}

export function POILayer() {
  const map = useMap();
  const { addPlace } = useStore();
  const [pois, setPOIs] = useState<POI[]>([]);
  const [cachedPOIs, setCachedPOIs] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastBounds, setLastBounds] = useState<string>('');
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  const loadPOIs = async () => {
    const zoom = map.getZoom();
    if (zoom < 14) {
      // Keep POIs visible even at lower zoom levels
      return;
    }

    // Rate limiting: minimum 2 seconds between requests (balanced approach)
    const now = Date.now();
    if (now - lastLoadTime < 2000) {
      return;
    }

    const bounds = map.getBounds();
    const boundsKey = `${bounds.getNorth().toFixed(2)}-${bounds.getSouth().toFixed(2)}-${bounds.getEast().toFixed(2)}-${bounds.getWest().toFixed(2)}-${Math.floor(zoom)}`;
    
    // Skip if same area already loaded (less strict comparison)
    if (boundsKey === lastBounds) return;

    // Clear existing timeout
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    // Keep current POIs visible while loading new ones
    // Significantly increased debounce for better persistence and API protection
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setLastLoadTime(Date.now());
      try {
        const poisData = await fetchPOIs(bounds);
        if (poisData.length > 0) {
          // Merge with existing POIs for smoother transition
          const mergedPOIs = [...cachedPOIs.filter(p => 
            Math.abs(p.lat - bounds.getCenter().lat) < 0.01 && 
            Math.abs(p.lng - bounds.getCenter().lng) < 0.01
          ), ...poisData];
          
          setPOIs(mergedPOIs);
          setCachedPOIs(mergedPOIs);
          setLastBounds(boundsKey);
        }
      } catch (error) {
        console.warn('POI loading failed, keeping existing POIs:', error);
        // Keep existing POIs on error
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Optimized to 1s for better responsiveness while maintaining stability

    setLoadTimeout(timeout);
  };

  useEffect(() => {
    // Initial load with slight delay for stability
    const initialLoad = setTimeout(() => {
      loadPOIs();
    }, 500);

    const handleMoveEnd = () => {
      // Reduced delay for faster response to user movement
      const moveTimeout = setTimeout(() => {
        loadPOIs();
      }, 200);
      
      return () => clearTimeout(moveTimeout);
    };

    const handleZoomEnd = () => {
      // Immediate load on zoom end for better responsiveness
      loadPOIs();
    };

    // Use passive listeners for better mobile performance
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    return () => {
      clearTimeout(initialLoad);
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [map]);

  const handleAddPOI = (poi: POI) => {
    if (window.confirm(`「${poi.name}」を場所リストに追加しますか？`)) {
      addPlace({
        name: poi.name,
        address: `${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`,
        lat: poi.lat,
        lng: poi.lng,
        category: poi.category,
        status: 'interested',
        notes: `地図上のPOIから追加 (${poi.type})`,
      });
      
      alert(`「${poi.name}」を追加しました！`);
    }
  };

  const getCategoryLabel = (category: POI['category']) => {
    switch (category) {
      case 'museum': return '博物館';
      case 'gallery': return '美術館';
      case 'restaurant': return 'レストラン';
      case 'cafe': return 'カフェ';
      default: return 'その他';
    }
  };

  return (
    <>
      {pois.map((poi) => (
        <Marker
          key={`poi-${poi.id}`}
          position={[poi.lat, poi.lng]}
          icon={createPOIIcon(poi.category, true)}
        >
          <Popup>
            <div className="p-2 min-w-48">
              <h3 className="font-semibold text-lg mb-1">{poi.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getCategoryColor(poi.category) + '20',
                    color: getCategoryColor(poi.category)
                  }}
                >
                  {getCategoryLabel(poi.category)}
                </span>
                <span className="text-xs text-gray-500">{poi.type}</span>
              </div>
              <button
                onClick={() => handleAddPOI(poi)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                マイリストに追加
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span>POIを読み込み中...</span>
          </div>
        </div>
      )}
    </>
  );
}

function getCategoryColor(category: POI['category']) {
  switch (category) {
    case 'museum': return '#8B5CF6';
    case 'gallery': return '#EC4899';
    case 'restaurant': return '#F59E0B';
    case 'cafe': return '#8B4513';
    default: return '#6B7280';
  }
}