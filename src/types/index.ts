export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: 'museum' | 'gallery' | 'landmark' | 'restaurant' | 'other';
  status: 'interested' | 'planned' | 'visited';
  notes?: string;
  openingHours?: string;
  website?: string;
  phone?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  theme?: string;
  status: 'planned' | 'in_progress' | 'completed';
  places: string[]; // Place IDs
  notes?: string;
  weather?: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  placeId?: string;
  tripId: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  filename: string;
}

export interface Schedule {
  id: string;
  tripId: string;
  placeId: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  transportation?: string;
}

export interface Exhibition {
  id: string;
  placeId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price?: string;
  website?: string;
}

export type ViewMode = 'places' | 'planning' | 'records';

export interface MapViewState {
  center: [number, number];
  zoom: number;
}

export interface AppState {
  places: Place[];
  trips: Trip[];
  photos: Photo[];
  schedules: Schedule[];
  exhibitions: Exhibition[];
  currentViewMode: ViewMode;
  selectedPlace?: Place;
  selectedTrip?: Trip;
  mapViewState: MapViewState;
}