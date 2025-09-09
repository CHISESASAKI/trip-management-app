import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = "地図を読み込み中..." }: LoadingOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      // Show overlay after 500ms delay to avoid flash
      timer = setTimeout(() => {
        setShowOverlay(true);
      }, 500);
    } else {
      setShowOverlay(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  if (!showOverlay) return null;

  return (
    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        
        <p className="text-gray-600 text-sm font-medium">{message}</p>
        <p className="text-gray-500 text-xs mt-2">
          地図データを取得しています...
        </p>
      </div>
    </div>
  );
}