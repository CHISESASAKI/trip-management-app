import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useStore } from '../../store/useStore';
import L from 'leaflet';
import type { Photo } from '../../types/base';

// Create custom photo marker icon
const createPhotoIcon = (hasMultiple: boolean = false) => {
  const size = hasMultiple ? 24 : 20;
  const emoji = hasMultiple ? '📸+' : '📷';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: #F59E0B; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: ${size * 0.5}px;
        font-weight: bold;
        color: white;
      ">
        ${emoji}
      </div>
    `,
    className: 'photo-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface PhotoGroup {
  lat: number;
  lng: number;
  photos: Photo[];
}

export function PhotoLayer() {
  const { photos } = useStore();
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);

  useEffect(() => {
    // Group photos by location (within ~10m radius)
    const groups: PhotoGroup[] = [];
    
    photos
      .filter(photo => photo.lat && photo.lng)
      .forEach(photo => {
        if (!photo.lat || !photo.lng) return;
        
        // Find existing group within 10m radius
        const existingGroup = groups.find(group => {
          const distance = getDistance(group.lat, group.lng, photo.lat!, photo.lng!);
          return distance < 10; // 10 meters
        });
        
        if (existingGroup) {
          existingGroup.photos.push(photo);
        } else {
          groups.push({
            lat: photo.lat,
            lng: photo.lng,
            photos: [photo]
          });
        }
      });
    
    setPhotoGroups(groups);
  }, [photos]);

  // Calculate distance between two coordinates in meters
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return (
    <>
      {photoGroups.map((group, index) => (
        <Marker
          key={`photo-group-${index}`}
          position={[group.lat, group.lng]}
          icon={createPhotoIcon(group.photos.length > 1)}
        >
          <Popup maxWidth={300} className="photo-popup">
            <div className="p-2">
              <h4 className="font-semibold text-sm mb-2">
                📷 写真 ({group.photos.length}枚)
              </h4>
              
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {group.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.description || photo.filename}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => window.open(photo.url, '_blank')}
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">📷</span>
                      </div>
                    )}
                    
                    <div className="mt-1">
                      <p className="text-xs text-gray-600 truncate" title={photo.filename}>
                        {photo.filename}
                      </p>
                      {photo.description && (
                        <p className="text-xs text-gray-500 truncate" title={photo.description}>
                          {photo.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(photo.takenAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {group.photos.length > 4 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  他 {group.photos.length - 4} 枚
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}