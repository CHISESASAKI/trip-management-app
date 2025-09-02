# 🗺️ 一人旅管理アプリ

地図ベースで旅行の計画・実行・記録を一元管理できるWebアプリケーション

## ✨ 機能

### 🗺️ 地図機能
- **インタラクティブ地図**: OpenStreetMapベースの見やすい地図
- **POI表示**: 美術館・博物館・レストラン・カフェなどを自動表示
- **地図クリック**: 地図上をクリックして場所を簡単追加

### 📍 場所管理
- **場所の追加・編集・削除**: 興味のある場所を管理
- **ステータス管理**: 興味あり→計画中→訪問済みの進捗管理
- **カテゴリ分類**: 博物館・美術館・レストラン・カフェ等で分類
- **詳細情報**: 営業時間・ウェブサイト・メモなどの保存

#### 🗓️ 旅行計画
- **旅行プラン作成**: 複数の場所をまとめて旅行計画を作成
- **日程管理**: 日付ごとの計画作成
- **ステータス追跡**: 計画中→実行中→完了の進捗管理

### 📸 写真管理
- **写真アップロード**: 旅行の思い出をアップロード
- **位置情報連携**: 場所と写真の自動関連付け
- **キャプション**: 写真に説明を追加

### 🗺️ 高度な地図機能
- **ルート表示**: 旅行計画の場所間ルートを自動表示
- **距離・時間計算**: 徒歩での所要時間を表示
- **ダークモード**: 見やすいダークテーマ対応

### 💾 データ管理
- **ローカル保存**: ブラウザで自動データ保存
- **クラウド同期**: Firebaseでデバイス間データ同期（オプション）
- **バックアップ**: JSONファイルでのデータエクスポート/インポート
- **PWA対応**: オフラインでも動作

## 🚀 使い方

1. **地図を拡大**: ズーム14以上で美術館・お店が表示
2. **POIクリック**: 表示されたPOIをクリック→「マイリストに追加」
3. **場所管理**: サイドパネルで場所の編集・削除
4. **地図探索**: 東京・大阪・京都など各都市で試してみよう

## 🛠️ 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **地図**: React-Leaflet + OpenStreetMap
- **UI**: Tailwind CSS + Lucide React
- **状態管理**: Zustand
- **データベース**: Firebase Firestore (オプション)
- **認証**: Firebase Authentication
- **ホスティング**: Firebase Hosting
- **PWA**: Service Worker + Web App Manifest
- **API**: OpenStreetMap Overpass API, OpenRouteService

## 📦 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
```

## ☁️ Firebase設定（オプション）

クラウド同期機能を使用する場合は以下の手順でFirebaseを設定してください：

### 1. Firebaseプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：trip-management-app）

### 2. Webアプリの追加
1. Firebase Console で作成したプロジェクトを選択
2. 「⚙️ Project Settings」→「General」→「Your apps」
3. 「</> Web」をクリックしてWebアプリを追加
4. アプリ名を入力
5. 設定オブジェクトをコピー

### 3. 環境変数の設定
`.env.local`ファイルを作成し、Firebase設定を追加：

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase サービスの有効化
1. **Authentication**: Anonymous認証を有効化
2. **Firestore Database**: テストモードで開始
3. **Storage**: テストモードで開始

### 5. デプロイ
```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# デプロイ
npm run deploy
```

## 📱 PWA機能

このアプリはPWA（Progressive Web App）対応しており、以下の機能を提供します：

- **オフライン動作**: インターネット接続がなくても基本機能が動作
- **ホーム画面追加**: スマートフォンのホーム画面にアプリとして追加可能
- **自動更新**: 新しいバージョンが自動的に適用
- **キャッシュ機能**: 地図データや画像の効率的なキャッシュ

## ✅ 実装済み機能

- [x] **基本地図機能**: OpenStreetMapベースのインタラクティブ地図
- [x] **場所管理**: POI表示、場所の追加・編集・削除
- [x] **旅行計画**: 旅行プランの作成・管理
- [x] **写真管理**: 写真アップロード・位置情報連携
- [x] **ルート表示**: 場所間のルート自動表示・距離計算
- [x] **ダークモード**: 見やすいダークテーマ
- [x] **PWA対応**: オフライン動作・ホーム画面追加
- [x] **データ管理**: ローカル保存・JSONエクスポート/インポート
- [x] **検索・フィルタ**: 場所と旅行の高度な検索機能
- [x] **Firebase連携**: クラウド同期・リアルタイム更新

## 🎯 今後の拡張予定

- [ ] **多言語対応**: 英語・中国語・韓国語対応
- [ ] **地図カスタマイズ**: 複数の地図スタイル選択
- [ ] **ソーシャル機能**: 旅行プランの共有
- [ ] **統計・分析**: 訪問場所の統計表示
- [ ] **外部API連携**: 天気・交通情報の表示

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**