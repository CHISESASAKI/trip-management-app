import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Navigation, Clock, X, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type L from 'leaflet';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  class: string;
  type: string;
  importance: number;
}

// Cache for search results - modern pattern for fast UX
const searchCache = new Map<string, SearchResult[]>();

interface ModernSearchBoxProps {
  mapRef?: React.MutableRefObject<L.Map | null>;
}

export function ModernSearchBox({ mapRef }: ModernSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent-searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { addPlace } = useStore();

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem('recent-searches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  }, []);

  // Add to recent searches
  const addRecentSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    saveRecentSearches(updated);
  }, [recentSearches, saveRecentSearches]);

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

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const cacheKey = searchQuery.toLowerCase().trim();
    
    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      setResults(cached);
      setShowResults(true);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=6&addressdetails=1&accept-language=ja&extratags=1`
      );

      if (response.ok) {
        const data = await response.json();
        const sortedResults = data
          .filter((item: any) => item.name || item.display_name)
          .sort((a: any, b: any) => (b.importance || 0) - (a.importance || 0));
        
        searchCache.set(cacheKey, sortedResults);
        setResults(sortedResults);
        setShowResults(sortedResults.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 200); // Fast debounce for modern UX
  };

  const handleResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.name || result.display_name.split(',')[0];

    // Add to recent searches
    addRecentSearch(name);

    // Animate map to location
    if (mapRef?.current) {
      mapRef.current.setView([lat, lng], 16, {
        animate: true,
        duration: 0.5
      });
    }

    // Clear search
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    
    // Blur input for mobile
    searchRef.current?.blur();

    // Show add confirmation with modern styling
    setTimeout(() => {
      if (window.confirm(`📍 「${name}」をマイリストに追加しますか？\n\n📍 ${result.display_name}`)) {
        addPlace({
          name,
          address: result.display_name,
          lat,
          lng,
          category: getCategoryFromTags(result.class, result.type),
          status: 'interested',
          notes: `検索から追加: ${result.class}/${result.type}`,
        });
        
        // Success feedback
        setTimeout(() => {
          alert(`✅ 「${name}」がマイリストに追加されました！`);
        }, 100);
      }
    }, 300);
  };

  const handleRecentSearchClick = (term: string) => {
    setQuery(term);
    searchPlaces(term);
    searchRef.current?.focus();
  };

  const getCategoryFromTags = (classType: string, type: string): 'museum' | 'gallery' | 'landmark' | 'restaurant' | 'cafe' | 'other' => {
    const categoryMap: Record<string, Record<string, string>> = {
      amenity: {
        museum: 'museum',
        gallery: 'gallery',
        arts_centre: 'gallery',
        restaurant: 'restaurant',
        fast_food: 'restaurant',
        cafe: 'cafe',
        bar: 'restaurant'
      },
      tourism: {
        museum: 'museum',
        gallery: 'gallery',
        attraction: 'landmark',
        monument: 'landmark'
      },
      historic: {
        monument: 'landmark',
        castle: 'landmark',
        archaeological_site: 'landmark'
      }
    };

    return (categoryMap[classType]?.[type] as any) || 'other';
  };

  const getResultIcon = (classType: string, type: string) => {
    const iconMap: Record<string, string> = {
      restaurant: '🍽️',
      fast_food: '🍔',
      cafe: '☕',
      museum: '🏛️',
      gallery: '🎨',
      arts_centre: '🎭',
      attraction: '🎯',
      monument: '🗿',
      hotel: '🏨',
      shop: '🛍️',
      bank: '🏦',
      hospital: '🏥',
      school: '🏫'
    };
    
    return iconMap[type] || iconMap[classType] || '📍';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

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
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
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

  const handleFocus = () => {
    if (query.length >= 2 && results.length > 0) {
      setShowResults(true);
    } else if (query.length === 0 && recentSearches.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-4 md:right-96 max-w-md z-[1005]" style={{ display: 'block !important', marginLeft: '60px' }}>
      <div ref={resultsRef} className="relative">
        {/* Modern Search Input */}
        <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
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
            onFocus={handleFocus}
            className="block w-full pl-12 pr-10 py-3 md:py-4 border-0 rounded-xl bg-transparent focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="場所を検索..."
            maxLength={100}
          />
          
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm">
            {/* Recent searches when no query */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">最近の検索</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(term)}
                      className="flex items-center gap-2 w-full px-2 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    >
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-700">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search results */}
            {results.length > 0 && query.length >= 2 && (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultSelect(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-blue-100' : ''
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
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {result.display_name}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {result.type}
                          </span>
                          {result.importance > 0.5 && (
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          )}
                        </div>
                      </div>
                      <Navigation className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !isSearching && results.length === 0 && (
              <div className="p-6 text-center">
                <MapPin className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">該当する場所が見つかりません</p>
                <p className="text-xs text-gray-400 mt-1">別のキーワードをお試しください</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}