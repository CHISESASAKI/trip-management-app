import { useStore } from '../../store/useStore';
import type { Trip } from '../../types/base';
import { Calendar, MapPin, Edit3, Trash2, DollarSign, Clock, Camera } from 'lucide-react';
import { useState } from 'react';
import { TripForm } from './TripForm';

export function TripList() {
  const { trips, deleteTrip, setSelectedTrip } = useStore();
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>();

  const handleDeleteTrip = (trip: Trip) => {
    if (window.confirm(`「${trip.name}」を削除しますか？`)) {
      deleteTrip(trip.id);
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setShowTripForm(true);
  };

  const handleAddTrip = () => {
    setEditingTrip(undefined);
    setShowTripForm(true);
  };

  const handleCloseForm = () => {
    setShowTripForm(false);
    setEditingTrip(undefined);
  };

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Trip['status']) => {
    switch (status) {
      case 'planned': return '計画中';
      case 'in_progress': return '実行中';
      case 'completed': return '完了';
      default: return '未設定';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays}日間`;
  };

  const groupedTrips = trips.reduce((groups, trip) => {
    const status = trip.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(trip);
    return groups;
  }, {} as Record<Trip['status'], Trip[]>);

  // 各グループを日付順にソート
  Object.keys(groupedTrips).forEach(status => {
    groupedTrips[status as Trip['status']].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 md:p-4 border-b">
        <h2 className="text-base md:text-lg font-semibold">旅行計画</h2>
        <button
          onClick={handleAddTrip}
          className="px-2 md:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs md:text-sm"
        >
          <span className="hidden md:inline">新しい計画を作成</span>
          <span className="md:hidden">新規作成</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {trips.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">旅行計画がありません</p>
            <p className="text-gray-400 text-sm">
              上のボタンから新しい旅行計画を作成してください
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 計画中 */}
            {groupedTrips.planned && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  計画中 ({groupedTrips.planned.length})
                </h3>
                <div className="space-y-3">
                  {groupedTrips.planned.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                      onClick={handleTripClick}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      formatDate={formatDate}
                      getDuration={getDuration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 実行中 */}
            {groupedTrips.in_progress && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  実行中 ({groupedTrips.in_progress.length})
                </h3>
                <div className="space-y-3">
                  {groupedTrips.in_progress.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                      onClick={handleTripClick}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      formatDate={formatDate}
                      getDuration={getDuration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 完了 */}
            {groupedTrips.completed && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  完了 ({groupedTrips.completed.length})
                </h3>
                <div className="space-y-3">
                  {groupedTrips.completed.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onEdit={handleEditTrip}
                      onDelete={handleDeleteTrip}
                      onClick={handleTripClick}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      formatDate={formatDate}
                      getDuration={getDuration}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trip Form Modal */}
      {showTripForm && (
        <TripForm 
          trip={editingTrip}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onClick: (trip: Trip) => void;
  getStatusColor: (status: Trip['status']) => string;
  getStatusText: (status: Trip['status']) => string;
  formatDate: (date: string) => string;
  getDuration: (start: string, end: string) => string;
}

function TripCard({
  trip,
  onEdit,
  onDelete,
  onClick,
  getStatusColor,
  getStatusText,
  formatDate,
  getDuration
}: TripCardProps) {
  return (
    <div 
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick(trip)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <h4 className="font-semibold text-gray-900 truncate">{trip.name}</h4>
          </div>
          
          {trip.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{trip.description}</p>
          )}
          
          <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{getDuration(trip.startDate, trip.endDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {getStatusText(trip.status)}
            </span>
            
            {trip.theme && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {trip.theme}
              </span>
            )}
            
            {trip.budget && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <DollarSign size={12} />
                <span>{trip.budget.toLocaleString()}円</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>場所: {trip.places.length}箇所</span>
            {trip.images && trip.images.length > 0 && (
              <div className="flex items-center gap-1">
                <Camera size={12} />
                <span>{trip.images.length}枚</span>
              </div>
            )}
          </div>

          {trip.notes && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{trip.notes}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trip);
            }}
            className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="編集"
          >
            <Edit3 size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip);
            }}
            className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="削除"
          >
            <Trash2 size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}