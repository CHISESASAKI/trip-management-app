import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { checkFirebaseConfig } from '../../utils/firebaseCheck';
import { Cloud, CloudOff, Database, Wifi, WifiOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function FirebaseSettings() {
  const { 
    currentUser, 
    isOnline, 
    syncStatus, 
    useFirebase,
    signInAnonymously,
    signOut,
    migrateLocalData,
    syncWithFirebase
  } = useStore();

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [configCheck] = useState(checkFirebaseConfig());


  const handleSignIn = async () => {
    try {
      await signInAnonymously();
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('サインインに失敗しました。環境変数の設定を確認してください。');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleMigrateData = async () => {
    if (!currentUser) {
      alert('まずFirebaseにサインインしてください。');
      return;
    }

    const confirmed = confirm(
      'ローカルデータをFirebaseに移行しますか？\n' +
      'この操作により、現在のデータがクラウドに保存され、複数のデバイス間で同期できるようになります。'
    );

    if (!confirmed) return;

    setIsMigrating(true);
    setMigrationError(null);

    try {
      await migrateLocalData();
      alert('データ移行が完了しました！');
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationError('データ移行に失敗しました。もう一度お試しください。');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) {
      alert('まずFirebaseにサインインしてください。');
      return;
    }

    try {
      await syncWithFirebase();
      alert('同期が完了しました！');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('同期に失敗しました。もう一度お試しください。');
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'syncing':
        return <Loader size={16} className="animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'offline':
      default:
        return <CloudOff size={16} className="text-gray-400" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return '同期済み';
      case 'syncing':
        return '同期中...';
      case 'error':
        return 'エラー';
      case 'offline':
      default:
        return 'オフライン';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          クラウド同期設定
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Firebaseを使用してデータをクラウドに保存し、複数のデバイス間で同期できます。
        </p>
      </div>

      {/* Firebase設定状態 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Firebase設定完了
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Firebaseプロジェクト: trip-management-app-47298
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              リアルタイム同期が有効になっています。
            </p>
          </div>
        </div>
      </div>

      {/* 接続状態 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                インターネット接続
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isOnline 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {isOnline ? 'オンライン' : 'オフライン'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {useFirebase ? (
                <Cloud size={16} className="text-blue-500" />
              ) : (
                <CloudOff size={16} className="text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Firebase接続
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              useFirebase 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {useFirebase ? '接続済み' : '未接続'}
            </span>
          </div>

          {useFirebase && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSyncStatusIcon()}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  同期状態
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : syncStatus === 'error'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getSyncStatusText()}
              </span>
            </div>
          )}

          {currentUser && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ユーザーID
                </span>
                <span className="text-xs font-mono text-gray-800 dark:text-gray-300">
                  {currentUser.uid.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  認証タイプ
                </span>
                <span className="text-xs text-gray-800 dark:text-gray-300">
                  {currentUser.isAnonymous ? '匿名' : 'メール'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        {!currentUser ? (
          <button
            onClick={handleSignIn}
            disabled={!configCheck.isValid}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              configCheck.isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Cloud size={16} />
            Firebaseに接続
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleManualSync}
                disabled={!isOnline || syncStatus === 'syncing'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Database size={16} />
                手動同期
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <CloudOff size={16} />
                接続解除
              </button>
            </div>

            <button
              onClick={handleMigrateData}
              disabled={isMigrating || !isOnline}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isMigrating ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Database size={16} />
              )}
              {isMigrating ? 'データ移行中...' : 'ローカルデータをクラウドに移行'}
            </button>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {migrationError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                エラーが発生しました
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {migrationError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-yellow-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              ご注意
            </p>
            <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>• Firebaseを使用するには適切な環境変数の設定が必要です</li>
              <li>• データはGoogleのFirebaseサーバーに保存されます</li>
              <li>• オフライン時はローカルデータが使用されます</li>
              <li>• ネットワーク復旧時に自動的に同期されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}