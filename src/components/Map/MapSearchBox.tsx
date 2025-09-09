import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { useStore } from '../../store/useStore';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  class: string;
  type: string;
}

export function MapSearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const map = useMap();
  const { addPlace } = useStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=8&addressdetails=1&accept-language=ja`
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(data.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    if (value.trim().length >= 2) {
      setTimeout(() => {
        if (searchRef.current?.value === value) {
          searchPlaces(value);
        }
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Move map to location
    map.setView([lat, lng], 16);

    // Clear search
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);

    // Show add place confirmation
    setTimeout(() => {
      const name = result.name || result.display_name.split(',')[0];
      const message = `📍 "${name}" をマイリストに追加しますか？`;
      
      if (window.confirm(message)) {
        addPlace({
          name,
          address: result.display_name,
          lat,
          lng,
          category: getCategory(result.class, result.type),
          status: 'interested',
          notes: `地図検索から追加: ${result.class}/${result.type}`,
        });
        alert(`✅ "${name}" をマイリストに追加しました！`);
      }
    }, 500);
  };

  const getCategory = (classType: string, type: string): 'museum' | 'gallery' | 'landmark' | 'restaurant' | 'cafe' | 'other' => {
    if (classType === 'amenity') {
      if (type.includes('museum')) return 'museum';
      if (type.includes('gallery') || type.includes('exhibition')) return 'gallery';
      if (type.includes('restaurant') || type.includes('fast_food')) return 'restaurant';
      if (type.includes('cafe') || type.includes('coffee')) return 'cafe';
    }
    if (classType === 'tourism') {
      if (type.includes('museum')) return 'museum';
      if (type.includes('gallery')) return 'gallery';
      if (type.includes('attraction')) return 'landmark';
    }
    return 'other';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  const getResultIcon = (classType: string, type: string) => {
    if (classType === 'amenity') {
      if (type.includes('restaurant')) return '🍽️';
      if (type.includes('cafe')) return '☕';
      if (type.includes('museum')) return '🏛️';
      if (type.includes('hotel')) return '🏨';
    }
    if (classType === 'tourism') {
      if (type.includes('museum')) return '🏛️';
      if (type.includes('attraction')) return '🎯';
    }
    if (classType === 'shop') return '🛍️';
    return '📍';
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
      <div ref={resultsRef} className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-sm"
            placeholder="場所を検索... (レストラン、美術館、駅名など)"
            maxLength={100}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-30">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getResultIcon(result.class, result.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {result.name || result.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      📍 {result.display_name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {result.class}/{result.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-gray-400">
                    <Navigation size={12} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showResults && !isSearching && query.trim().length >= 2 && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
            <MapPin className="mx-auto mb-2 text-gray-400" size={24} />
            <p>該当する場所が見つかりませんでした</p>
            <p className="text-xs mt-1">別のキーワードを試してみてください</p>
          </div>
        )}
      </div>
    </div>
  );
}