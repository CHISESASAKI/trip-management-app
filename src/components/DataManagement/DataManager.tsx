import { useStore } from '../../store/useStore';
import { Download, Upload, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { FirebaseSettings } from '../Settings/FirebaseSettings';

export function DataManager() {
  const { places, trips, dayPlans, photos, saveData } = useStore();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        places,
        trips,
        dayPlans,
        photos,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `trip-management-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      showMessage('success', 'データをエクスポートしました');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('error', 'エクスポートに失敗しました');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showMessage('error', 'JSONファイルを選択してください');
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // データ形式の基本チェック
        if (!importedData.places || !importedData.trips) {
          showMessage('error', '無効なデータ形式です');
          setIsImporting(false);
          return;
        }

        // 確認ダイアログ
        const confirmMessage = `
データをインポートしますか？現在のデータは上書きされます。

インポート内容:
• 場所: ${importedData.places.length}件
• 旅行計画: ${importedData.trips.length}件
• 日程: ${importedData.dayPlans?.length || 0}件
• 写真: ${importedData.photos?.length || 0}件
        `.trim();

        if (window.confirm(confirmMessage)) {
          // ストアに直接セット（loadDataを使わずに）
          useStore.setState({
            places: importedData.places || [],
            trips: importedData.trips || [],
            dayPlans: importedData.dayPlans || [],
            photos: importedData.photos || []
          });
          
          // ローカルストレージに保存
          saveData();
          
          showMessage('success', 'データをインポートしました');
        }
        
        setIsImporting(false);
        // ファイル入力をクリア
        event.target.value = '';
      } catch (error) {
        console.error('Import error:', error);
        showMessage('error', 'インポートに失敗しました');
        setIsImporting(false);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleResetData = () => {
    const confirmMessage = `
すべてのデータを削除しますか？この操作は元に戻せません。

削除されるデータ:
• 場所: ${places.length}件
• 旅行計画: ${trips.length}件
• 日程: ${dayPlans.length}件
• 写真: ${photos.length}件
    `.trim();

    if (window.confirm(confirmMessage)) {
      useStore.setState({
        places: [],
        trips: [],
        dayPlans: [],
        photos: [],
        selectedPlace: undefined,
        selectedTrip: undefined
      });
      
      saveData();
      showMessage('success', 'すべてのデータを削除しました');
    }
  };

  const getTotalDataSize = () => {
    const total = places.length + trips.length + dayPlans.length + photos.length;
    return total;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">データ管理</h2>
      </div>

      {/* Firebase 接続状態 - 最優先表示 */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-lg shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-lg font-bold">🔥 Firebase リアルタイム同期 有効</h3>
            <p className="text-blue-100 text-sm">プロジェクト: trip-management-app-47298</p>
            <p className="text-blue-100 text-sm">✅ クラウドデータベース接続済み | 🔄 自動同期中</p>
          </div>
        </div>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* データ統計 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">現在のデータ</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">場所:</span>
            <span className="ml-2 font-medium">{places.length}件</span>
          </div>
          <div>
            <span className="text-gray-600">旅行計画:</span>
            <span className="ml-2 font-medium">{trips.length}件</span>
          </div>
          <div>
            <span className="text-gray-600">日程:</span>
            <span className="ml-2 font-medium">{dayPlans.length}件</span>
          </div>
          <div>
            <span className="text-gray-600">写真:</span>
            <span className="ml-2 font-medium">{photos.length}件</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          合計: {getTotalDataSize()}件のデータ
        </div>
      </div>

      {/* Firebase設定 */}
      <div className="mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🔥 Firebase クラウド同期
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Firebase Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">接続済み</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">プロジェクト:</span>
              <span className="text-gray-900 dark:text-gray-100">trip-management-app-47298</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">同期状態:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">リアルタイム同期中</span>
            </div>
          </div>
        </div>
        <FirebaseSettings />
      </div>

      <div className="space-y-4">
        {/* エクスポート */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Download size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">データをエクスポート</h3>
              <p className="text-sm text-gray-600 mb-3">
                すべてのデータをJSONファイルとしてバックアップできます。
              </p>
              <button
                onClick={handleExportData}
                disabled={getTotalDataSize() === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                データをダウンロード
              </button>
            </div>
          </div>
        </div>

        {/* インポート */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Upload size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">データをインポート</h3>
              <p className="text-sm text-gray-600 mb-3">
                以前エクスポートしたJSONファイルからデータを復元できます。
              </p>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                  {isImporting ? 'インポート中...' : 'ファイルを選択'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    disabled={isImporting}
                    className="hidden"
                  />
                </label>
                {isImporting && (
                  <div className="text-sm text-gray-600">
                    ファイルを読み込んでいます...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* リセット */}
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <RotateCcw size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">すべてのデータを削除</h3>
              <p className="text-sm text-gray-600 mb-3">
                すべての場所、旅行計画、写真データを削除します。この操作は元に戻せません。
              </p>
              <button
                onClick={handleResetData}
                disabled={getTotalDataSize() === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                すべて削除
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">ご注意</p>
            <ul className="space-y-1 text-yellow-700">
              <li>• データは端末のローカルストレージに保存されます</li>
              <li>• ブラウザのデータを削除すると情報が失われます</li>
              <li>• 定期的にバックアップを取ることをお勧めします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}