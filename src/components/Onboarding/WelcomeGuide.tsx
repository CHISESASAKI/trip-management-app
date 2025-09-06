import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, ChevronRight, ChevronLeft, MapPin, Calendar, Camera, Clock } from 'lucide-react';

interface WelcomeGuideProps {
  onClose: () => void;
}

export function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const { setViewMode } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🎉 一人旅管理アプリへようこそ！",
      description: "このアプリで旅行の計画から記録まで、すべてを管理できます。",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ できること</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-500" size={16} />
                <span className="text-sm">行きたい場所の管理</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-green-500" size={16} />
                <span className="text-sm">旅行計画の作成</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="text-purple-500" size={16} />
                <span className="text-sm">思い出の写真管理</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-orange-500" size={16} />
                <span className="text-sm">旅行履歴の振り返り</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            まずは簡単な4ステップの使い方を見てみましょう 👉
          </p>
        </div>
      )
    },
    {
      title: "📍 ステップ1: 場所を管理する",
      description: "行きたい場所を登録して、旅行計画の準備をしましょう。",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">地図で見つける</h4>
                  <p className="text-sm text-gray-600">地図を拡大すると美術館やカフェが表示されます</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">場所を追加</h4>
                  <p className="text-sm text-gray-600">POIをクリックして「マイリストに追加」</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">手動追加も可能</h4>
                  <p className="text-sm text-gray-600">「新しい場所を追加」ボタンで直接登録</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode('places');
              onClose();
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            場所管理タブを開く
          </button>
        </div>
      )
    },
    {
      title: "🧳 ステップ2: 旅行を計画する",
      description: "登録した場所を使って、具体的な旅行計画を立てます。",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">旅行プランを作成</h4>
                  <p className="text-sm text-gray-600">日程、予算、テーマを設定</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">場所を旅行に追加</h4>
                  <p className="text-sm text-gray-600">場所詳細から「旅行に追加」をクリック</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">写真をアップロード</h4>
                  <p className="text-sm text-gray-600">旅行カードの「+」ボタンから思い出を記録</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode('planning');
              onClose();
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            旅行計画タブを開く
          </button>
        </div>
      )
    },
    {
      title: "📸 ステップ3: 思い出を記録する",
      description: "旅行中や旅行後に、写真と共に思い出を残しましょう。",
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">写真をアップロード</h4>
                  <p className="text-sm text-gray-600">位置情報があれば自動で場所を判定</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">写真を分類・編集</h4>
                  <p className="text-sm text-gray-600">場所や旅行との紐付けを手動で調整</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">場所別で閲覧</h4>
                  <p className="text-sm text-gray-600">各場所の写真ギャラリーで思い出を振り返り</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-center text-gray-600">
            💡 写真に位置情報がなくても、手動で場所を設定できます
          </div>
        </div>
      )
    },
    {
      title: "🕒 ステップ4: 履歴を振り返る",
      description: "完了した旅行をタイムラインで振り返り、記録を編集できます。",
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">旅行を完了にする</h4>
                  <p className="text-sm text-gray-600">旅行計画のステータスを「完了」に変更</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">タイムラインで閲覧</h4>
                  <p className="text-sm text-gray-600">年別・月別で旅行履歴を表示</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">記録を充実させる</h4>
                  <p className="text-sm text-gray-600">感想、費用、場所別メモを追加</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode('timeline');
              onClose();
            }}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            旅行履歴タブを開く
          </button>
        </div>
      )
    },
    {
      title: "🚀 準備完了！",
      description: "これで一人旅管理アプリの使い方は完璧です。素敵な旅の記録を始めましょう！",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center">
            <div className="mb-4">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900">完了！</h3>
            </div>
            <p className="text-gray-600 mb-4">
              あとは実際に使ってみるだけです。<br />
              困ったときは各タブの💡使い方ヒントを参考にしてください。
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => {
                  setViewMode('places');
                  onClose();
                }}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                場所管理から始める
              </button>
              <button
                onClick={() => {
                  setViewMode('planning');
                  onClose();
                }}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                旅行計画から始める
              </button>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
            >
              アプリを使い始める
            </button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🗺️</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 進行状況 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>ステップ {currentStep + 1} / {steps.length}</span>
            <span>{Math.round((currentStep + 1) / steps.length * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep + 1) / steps.length * 100}%` }}
            ></div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {steps[currentStep].content}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            前へ
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : index < currentStep 
                      ? 'bg-blue-300' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              次へ
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
            >
              完了
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}