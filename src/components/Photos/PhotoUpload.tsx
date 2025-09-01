import { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Camera, Upload, X } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trip = tripId ? trips.find(t => t.id === tripId) : undefined;
  const place = placeId ? places.find(p => p.id === placeId) : undefined;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) {
      alert('写真を選択してください');
      return;
    }

    setIsUploading(true);

    try {
      // Base64データとして保存（本来はクラウドストレージに保存すべき）
      const photoData = {
        tripId,
        placeId,
        url: previewUrl, // Base64 URL
        caption: caption.trim() || undefined,
        takenAt: new Date().toISOString(),
        location: place ? { lat: place.lat, lng: place.lng } : undefined
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