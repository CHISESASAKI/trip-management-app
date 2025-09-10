import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Edit3, DollarSign, Receipt, TrendingUp, PieChart } from 'lucide-react';
import type { Trip } from '../../types/base';

interface Expense {
  id: string;
  tripId: string;
  placeId?: string;
  category: 'transport' | 'accommodation' | 'food' | 'sightseeing' | 'shopping' | 'other';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

interface ExpenseManagerProps {
  trip: Trip;
}

export function ExpenseManager({ trip }: ExpenseManagerProps) {
  const { places } = useStore();
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`expenses-${trip.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    category: 'food' as Expense['category'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    placeId: ''
  });

  const categoryLabels = {
    transport: '🚌 交通費',
    accommodation: '🏨 宿泊費', 
    food: '🍽️ 食費',
    sightseeing: '🎫 観光・入場料',
    shopping: '🛍️ ショッピング',
    other: '📝 その他'
  };

  const categoryColors = {
    transport: 'bg-blue-100 text-blue-800',
    accommodation: 'bg-purple-100 text-purple-800',
    food: 'bg-orange-100 text-orange-800',
    sightseeing: 'bg-green-100 text-green-800',
    shopping: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem(`expenses-${trip.id}`, JSON.stringify(newExpenses));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense: Expense = {
      id: editingExpense?.id || `expense-${Date.now()}`,
      tripId: trip.id,
      placeId: formData.placeId || undefined,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      createdAt: editingExpense?.createdAt || new Date().toISOString()
    };

    if (editingExpense) {
      saveExpenses(expenses.map(e => e.id === expense.id ? expense : e));
    } else {
      saveExpenses([...expenses, expense]);
    }

    // フォームリセット
    setFormData({
      category: 'food',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      placeId: ''
    });
    setShowAddForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date,
      placeId: expense.placeId || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm('この支出記録を削除しますか？')) {
      saveExpenses(expenses.filter(e => e.id !== expenseId));
    }
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {} as Record<Expense['category'], number>);

  const tripPlaces = places.filter(place => trip.places.includes(place.id));

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-800">総支出</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ¥{totalExpense.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-sm font-medium text-blue-800">総支出</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ¥{totalExpense.toLocaleString()}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-purple-800">記録数</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {expenses.length}件
          </div>
        </div>
      </div>

      {/* カテゴリ別内訳 */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-gray-600" size={20} />
            <h3 className="text-lg font-medium">カテゴリ別内訳</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="text-center">
                <div className={`px-3 py-2 rounded-lg ${categoryColors[category as Expense['category']]}`}>
                  <div className="text-sm font-medium">
                    {categoryLabels[category as Expense['category']]}
                  </div>
                  <div className="text-lg font-bold">
                    ¥{amount.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-75">
                    {((amount / totalExpense) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 支出記録一覧 */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">支出記録</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            支出を追加
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Receipt size={48} className="mx-auto text-gray-400 mb-2" />
              <p>まだ支出記録がありません</p>
              <p className="text-sm">「支出を追加」ボタンから記録を開始しましょう</p>
            </div>
          ) : (
            expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
              const place = expense.placeId ? places.find(p => p.id === expense.placeId) : null;
              return (
                <div key={expense.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category]}`}>
                          {categoryLabels[expense.category]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="font-medium">{expense.description}</div>
                      {place && (
                        <div className="text-sm text-gray-600 mt-1">
                          📍 {place.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold">
                        ¥{expense.amount.toLocaleString()}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 支出追加フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">
                {editingExpense ? '支出記録の編集' : '支出記録の追加'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingExpense(null);
                  setFormData({
                    category: 'food',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    placeId: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">カテゴリ</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as Expense['category']})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">金額（円）</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">内容</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: 昼食代、電車賃、お土産など"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">日付</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">関連する場所（任意）</label>
                <select
                  value={formData.placeId}
                  onChange={(e) => setFormData({...formData, placeId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">選択しない</option>
                  {tripPlaces.map(place => (
                    <option key={place.id} value={place.id}>{place.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingExpense ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}