import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Camera, Calendar, MapPin, X, Edit3, Trash2 } from 'lucide-react';
import { PhotoReclassifyModal } from './PhotoReclassifyModal';
import type { Place, Trip, Photo } from '../../types/base';

interface PlacePhotoGalleryProps {
  place: Place;
  onClose?: () => void;
}

interface PhotoWithTrip extends Photo {
  trip?: Trip;
}

export function PlacePhotoGallery({ place, onClose }: PlacePhotoGalleryProps) {
  const { photos, trips, deletePhoto } = useStore();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTrip | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showReclassifyModal, setShowReclassifyModal] = useState(false);
  const [photoToReclassify, setPhotoToReclassify] = useState<PhotoWithTrip | null>(null);

  // その場所に関連する写真を取得
  const placePhotos = photos
    .filter(photo => 
      photo.placeId === place.id || 
      (photo.location && 
       Math.abs(photo.location.lat - place.lat) < 0.001 && 
       Math.abs(photo.location.lng - place.lng) < 0.001)
    )
    .map(photo => {
      const trip = photo.tripId ? trips.find(t => t.id === photo.tripId) : undefined;
      return { ...photo, trip };
    })
    .sort((a, b) => new Date(b.takenAt || b.createdAt).getTime() - new Date(a.takenAt || a.createdAt).getTime());

  const handlePhotoClick = (photo: PhotoWithTrip) => {
    setSelectedPhoto(photo);
    setShowFullscreen(true);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('この写真を削除しますか？')) {
      await deletePhoto(photoId);
      if (selectedPhoto?.id === photoId) {
        setShowFullscreen(false);
        setSelectedPhoto(null);
      }
    }
  };

  const handleReclassifyPhoto = (photo: PhotoWithTrip) => {
    setPhotoToReclassify(photo);
    setShowReclassifyModal(true);
  };

  const handleReclassifySuccess = () => {
    setShowReclassifyModal(false);
    setPhotoToReclassify(null);
    // 写真リストを再読み込みするため、少し待ってからページをリフレッシュ
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Camera className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {place.name} の写真
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📍 {place.address}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-4">
          {placePhotos.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                この場所の写真はまだありません
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                写真をアップロードして思い出を記録しましょう
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {placePhotos.length}枚の写真
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {placePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={`${place.name}の写真`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Camera className="text-gray-400" size={24} />
                      </div>
                    )}

                    {/* 写真情報オーバーレイ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-white text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{formatDate(photo.takenAt || photo.createdAt).split(' ')[0]}</span>
                          </div>
                          {photo.trip && (
                            <div className="flex items-center gap-1">
                              <span className="px-1 py-0.5 bg-blue-500 rounded text-xs">
                                {photo.trip.name}
                              </span>
                            </div>
                          )}
                          {photo.autoClassified && (
                            <div className="text-xs text-green-300">
                              📍 自動分類
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* フルスクリーンモーダル */}
      {showFullscreen && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-full w-full flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between text-white mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span className="text-lg font-medium">{place.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReclassifyPhoto(selectedPhoto)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="写真を再分類"
                >
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={() => {
                    setShowFullscreen(false);
                    setSelectedPhoto(null);
                  }}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 写真 */}
            <div className="flex-1 flex items-center justify-center">
              {selectedPhoto.url ? (
                <img
                  src={selectedPhoto.url}
                  alt={`${place.name}の写真`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg">
                  <Camera className="text-gray-400" size={48} />
                </div>
              )}
            </div>

            {/* フッター情報 */}
            <div className="mt-4 p-4 bg-black bg-opacity-50 rounded-lg text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} />
                    <span className="font-medium">撮影日時</span>
                  </div>
                  <div className="text-gray-300">
                    {formatDate(selectedPhoto.takenAt || selectedPhoto.createdAt)}
                  </div>
                </div>

                {selectedPhoto.trip && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">関連する旅行</span>
                    </div>
                    <div className="text-gray-300">
                      🧳 {selectedPhoto.trip.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {selectedPhoto.trip.startDate} - {selectedPhoto.trip.endDate}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">分類方法</span>
                  </div>
                  <div className="text-gray-300">
                    {selectedPhoto.autoClassified ? (
                      <span className="text-green-300">📍 自動分類</span>
                    ) : (
                      <span className="text-blue-300">👤 手動分類</span>
                    )}
                  </div>
                  {selectedPhoto.classificationDistance && (
                    <div className="text-xs text-gray-400">
                      約{selectedPhoto.classificationDistance}m離れた場所で撮影
                    </div>
                  )}
                </div>
              </div>

              {selectedPhoto.caption && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="font-medium mb-1">キャプション</div>
                  <div className="text-gray-300">{selectedPhoto.caption}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 写真再分類モーダル */}
      {showReclassifyModal && photoToReclassify && (
        <PhotoReclassifyModal
          photo={photoToReclassify}
          onClose={() => {
            setShowReclassifyModal(false);
            setPhotoToReclassify(null);
          }}
          onSuccess={handleReclassifySuccess}
        />
      )}
    </>
  );
}