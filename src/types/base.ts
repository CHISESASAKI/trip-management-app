export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: 'museum' | 'gallery' | 'landmark' | 'restaurant' | 'cafe' | 'other';
  status: 'interested' | 'planned' | 'visited';
  notes?: string;
  openingHours?: string;
  website?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  theme?: string;
  status: 'planned' | 'in_progress' | 'completed';
  places: string[]; // Place IDs
  notes?: string;
  images?: string[]; // Image URLs or base64
  createdAt: string;
  updatedAt: string;
}

// 旅行計画の1日のスケジュール
export interface DayPlan {
  id: string;
  tripId: string;
  date: string;
  places: DayPlaceItem[];
  notes?: string;
}

// 1日の中での場所と時間
export interface DayPlaceItem {
  placeId: string;
  startTime?: string;
  endTime?: string;
  transportationToNext?: 'walk' | 'train' | 'bus' | 'taxi' | 'car';
  estimatedTravelTime?: number; // minutes
  notes?: string;
}

// 写真・記録
export interface Photo {
  id: string;
  tripId?: string;
  placeId?: string;
  url: string; // base64 or URL
  caption?: string;
  takenAt: string; // ISO string
  location?: {
    lat: number;
    lng: number;
  };
  autoClassified?: boolean;
  classificationDistance?: number;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'places' | 'planning' | 'records' | 'timeline';