import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface VersionInfoProps {
  className?: string;
}

export function VersionInfo({ className = '' }: VersionInfoProps) {
  const [showDetail, setShowDetail] = useState(false);
  
  const version = "v3.4.0";
  const buildDate = "2025-01-27";
  const buildTime = "22:15:00";

  if (showDetail) {
    return (
      <div className={`fixed bottom-4 right-4 z-[1002] ${className}`}>
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">アプリ情報</h4>
            <button
              onClick={() => setShowDetail(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>バージョン:</span>
              <span className="font-mono font-medium">{version}</span>
            </div>
            <div className="flex justify-between">
              <span>ビルド日:</span>
              <span className="font-mono">{buildDate}</span>
            </div>
            <div className="flex justify-between">
              <span>ビルド時刻:</span>
              <span className="font-mono">{buildTime}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span>更新内容:</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                • 旅行計画に場所選択・順序機能追加<br/>
                • 検索欄とサイドバーの重なり修正<br/>
                • 展示情報の表示切替機能追加<br/>
                • 不要なフィールド（予算・天気）削除
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowDetail(true)}
      className={`fixed bottom-4 right-4 z-[1040] bg-blue-600 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all duration-200 hover:scale-110 ${className}`}
      title={`バージョン ${version} - クリックで詳細`}
    >
      <Info size={16} className="md:w-[18px] md:h-[18px]" />
    </button>
  );
}