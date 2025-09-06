import { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Camera, Upload, X, MapPin, Clock } from 'lucide-react';
import { extractEXIFData, findNearestPlace } from '../../utils/exif';

interface PhotoUploadProps {
  tripId?: string;
  placeId?: string;
  onClose?: () => void;
}

export function PhotoUpload({ tripId, placeId, onClose }: PhotoUploadProps) {
  const { addPhoto, trips, places } = useStore();
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<{
    lat: number;
    lng: number;
    nearestPlace?: { place: any; distance: number };
    timestamp?: Date;
  } | null>(null);
  const [locationAnalysis, setLocationAnalysis] = useState<{
    isAnalyzing: boolean;
    hasLocation: boolean;
    suggestion?: string;
  }>({ isAnalyzing: false, hasLocation: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trip = tripId ? trips.find(t => t.id === tripId) : undefined;
  const place = placeId ? places.find(p => p.id === placeId) : undefined;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    setLocationAnalysis({ isAnalyzing: true, hasLocation: false });

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // EXIF位置情報の抽出と分析
    try {
      const exifData = await extractEXIFData(file);
      
      if (exifData.location) {
        const nearestPlace = findNearestPlace(exifData.location, places, 200);
        
        setDetectedLocation({
          lat: exifData.location.lat,
          lng: exifData.location.lng,
          nearestPlace: nearestPlace || undefined,
          timestamp: exifData.timestamp
        });

        let suggestion = '';
        if (nearestPlace) {
          suggestion = `📍 ${nearestPlace.place.name}の近くで撮影 (約${Math.round(nearestPlace.distance)}m)`;
        } else {
          suggestion = '📍 位置情報が検出されましたが、登録済みの場所に近いものはありません';
        }

        setLocationAnalysis({
          isAnalyzing: false,
          hasLocation: true,
          suggestion
        });
      } else {
        setLocationAnalysis({
          isAnalyzing: false,
          hasLocation: false,
          suggestion: '📍 この写真に位置情報は含まれていません'
        });
      }
    } catch (error) {
      console.error('EXIF analysis error:', error);
      setLocationAnalysis({
        isAnalyzing: false,
        hasLocation: false,
        suggestion: '📍 位置情報の分析に失敗しました'
      });
    }
  };

  const handleUpload = async () => {
    if (!previewUrl) {
      alert('写真を選択してください');
      return;
    }

    setIsUploading(true);

    try {
      // 位置情報の決定（優先順位: 1.検出された最寄り場所, 2.手動選択された場所, 3.検出されたGPS座標）
      let finalPlaceId = placeId;
      let finalLocation = place ? { lat: place.lat, lng: place.lng } : undefined;

      // EXIF位置情報で最寄りの場所が見つかった場合は自動分類
      if (detectedLocation?.nearestPlace && !placeId) {
        finalPlaceId = detectedLocation.nearestPlace.place.id;
        finalLocation = {
          lat: detectedLocation.nearestPlace.place.lat,
          lng: detectedLocation.nearestPlace.place.lng
        };
      } else if (detectedLocation && !finalLocation) {
        // 最寄りの場所は見つからなかったが、GPS座標はある場合
        finalLocation = {
          lat: detectedLocation.lat,
          lng: detectedLocation.lng
        };
      }

      // Base64データとして保存（本来はクラウドストレージに保存すべき）
      const photoData = {
        tripId,
        placeId: finalPlaceId,
        url: previewUrl, // Base64 URL
        caption: caption.trim() || undefined,
        takenAt: detectedLocation?.timestamp?.toISOString() || new Date().toISOString(),
        location: finalLocation,
        // EXIF情報由来かどうかのフラグ
        autoClassified: !!detectedLocation?.nearestPlace
      };

      addPhoto(photoData);

      // 成功メッセージ
      alert('写真をアップロードしました！');

      // フォームをリセット
      setCaption('');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setDetectedLocation(null);
    setLocationAnalysis({ isAnalyzing: false, hasLocation: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          写真をアップロード
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* アップロード先の情報 */}
      {(trip || place) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-300">
            {trip && (
              <p>📅 旅行: {trip.name}</p>
            )}
            {place && (
              <p>📍 場所: {place.name}</p>
            )}
          </div>
        </div>
      )}

      {/* ファイル選択 */}
      <div className="space-y-4">
        {!previewUrl ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Camera size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                クリックして写真を選択
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG, GIF (最大5MB)
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>

            {/* 位置情報分析結果 */}
            {locationAnalysis.isAnalyzing ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <MapPin size={16} />
                  <span>位置情報を分析中...</span>
                </div>
              </div>
            ) : locationAnalysis.suggestion && (
              <div className={`p-3 border rounded-lg ${
                locationAnalysis.hasLocation
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
              }`}>
                <div className={`flex items-start gap-2 text-sm ${
                  locationAnalysis.hasLocation
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{locationAnalysis.suggestion}</p>
                    
                    {detectedLocation?.timestamp && (
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                        <Clock size={12} />
                        <span>撮影日時: {detectedLocation.timestamp.toLocaleString('ja-JP')}</span>
                      </div>
                    )}
                    
                    {detectedLocation?.nearestPlace && (
                      <div className="mt-2 text-xs">
                        <span className="px-2 py-1 bg-green-200 dark:bg-green-800 rounded-full">
                          自動分類: {detectedLocation.nearestPlace.place.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* キャプション入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            キャプション（任意）
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="写真について説明を追加..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* アップロードボタン */}
        <button
          onClick={handleUpload}
          disabled={!previewUrl || isUploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>アップロード中...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>写真をアップロード</span>
            </>
          )}
        </button>
      </div>

      {/* 注意事項 */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-xs text-yellow-800 dark:text-yellow-300">
          <p className="font-medium mb-1">ご注意</p>
          <ul className="space-y-1">
            <li>• 写真はブラウザのローカルストレージに保存されます</li>
            <li>• 大量の写真を保存するとブラウザの容量を圧迫する可能性があります</li>
            <li>• 定期的にデータ管理からバックアップを取ることをお勧めします</li>
          </ul>
        </div>
      </div>
    </div>
  );
}