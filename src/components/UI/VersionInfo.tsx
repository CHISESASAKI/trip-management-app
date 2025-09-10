import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface VersionInfoProps {
  className?: string;
}

export function VersionInfo({ className = '' }: VersionInfoProps) {
  const [showDetail, setShowDetail] = useState(false);
  
  const version = "v3.2.1";
  const buildDate = "2025-09-10";
  const buildTime = "15:30:00";

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
                • UIスケーリング問題修正<br/>
                • POI表示持続性向上<br/>
                • モバイル地図操作性改善<br/>
                • 最終仕上げ完了
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