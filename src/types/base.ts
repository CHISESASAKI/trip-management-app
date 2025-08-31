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
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  theme?: string;
  status: 'planned' | 'in_progress' | 'completed';
  places: string[];
  notes?: string;
  weather?: string;
}

export type ViewMode = 'places' | 'planning' | 'records';