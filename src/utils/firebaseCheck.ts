// Firebase設定チェック用ユーティリティ
export function checkFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const missing: string[] = [];
  const invalid: string[] = [];

  // 必要な値のチェック
  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!config.messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');

  // プレースホルダー値のチェック
  if (config.apiKey?.includes('placeholder')) invalid.push('VITE_FIREBASE_API_KEY');
  if (config.appId?.includes('placeholder')) invalid.push('VITE_FIREBASE_APP_ID');

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    config
  };
}

export function getFirebaseSetupInstructions() {
  return `
Firebase設定の完了手順：

1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. プロジェクト "trip-management-app-47298" を選択
3. 左メニューから "Project Settings" (⚙️ 歯車アイコン) をクリック
4. "General" タブの "Your apps" セクションで "Web" アプリを追加
5. アプリ名を入力（例：Trip Management Web App）
6. 生成されたconfig値をコピーして.env.localファイルを更新

必要な設定値：
- VITE_FIREBASE_API_KEY (apiKey)
- VITE_FIREBASE_APP_ID (appId)

その他の設定：
- Firestore Database を有効化（テストモードで開始）
- Authentication を有効化（Anonymous認証を有効にする）
- 必要に応じて Storage を有効化
  `;
}