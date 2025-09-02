#!/bin/bash

# Firebase セキュリティルールをデプロイするスクリプト

echo "🔥 Firebase Firestore Rules をデプロイします..."

# Firestoreルールの内容を表示
echo "📋 適用されるルール:"
cat firestore.rules

echo ""
echo "⚠️  注意: このルールにより、認証されたユーザーは自分のデータのみアクセス可能になります"
echo ""

# Firebase Console でルールを手動で設定する場合の手順を表示
cat << 'EOF'
🖥️  Firebase Console での手動設定手順:

1. Firebase Console (https://console.firebase.google.com/) を開く
2. trip-management-app-47298 プロジェクトを選択  
3. Firestore Database → ルール タブをクリック
4. 以下のルールをコピー&ペーストして「公開」をクリック:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /places/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /trips/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /photos/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}

EOF