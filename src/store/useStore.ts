import { create } from 'zustand';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import type { Place, Trip, ViewMode, DayPlan, Photo } from '../types/base';

interface StoreActions {
  // Places
  addPlace: (place: Omit<Place, 'id'>) => void;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  setSelectedPlace: (place: Place | undefined) => void;
  
  // Trips
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setSelectedTrip: (trip: Trip | undefined) => void;
  
  // Day Plans
  addDayPlan: (dayPlan: Omit<DayPlan, 'id'>) => void;
  updateDayPlan: (id: string, updates: Partial<DayPlan>) => void;
  deleteDayPlan: (id: string) => void;
  getDayPlansForTrip: (tripId: string) => DayPlan[];
  
  // Photos
  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  deletePhoto: (id: string) => void;
  
  // View Mode
  setViewMode: (mode: ViewMode) => void;
  
  // Map
  setMapViewState: (viewState: { center: [number, number]; zoom: number }) => void;
  
  // Data persistence
  saveData: () => void;
  loadData: () => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

interface AppState {
  places: Place[];
  trips: Trip[];
  dayPlans: DayPlan[];
  photos: Photo[];
  schedules: any[];
  exhibitions: any[];
  currentViewMode: ViewMode;
  selectedPlace?: Place;
  selectedTrip?: Trip;
  mapViewState: { center: [number, number]; zoom: number };
}

const initialState: AppState = {
  places: [],
  trips: [],
  dayPlans: [],
  photos: [],
  schedules: [],
  exhibitions: [],
  currentViewMode: 'places',
  selectedPlace: undefined,
  selectedTrip: undefined,
  mapViewState: {
    center: [35.6762, 139.6503], // Tokyo
    zoom: 10
  }
};

export const useStore = create<AppState & StoreActions>((set, get) => ({
  ...initialState,
  
  // Places
  addPlace: (placeData) => {
    const place: Place = { ...placeData, id: generateId() };
    set((state) => ({
      places: [...state.places, place]
    }));
    get().saveData();
  },
  
  updatePlace: (id, updates) => {
    set((state) => ({
      places: state.places.map(place => 
        place.id === id ? { ...place, ...updates } : place
      )
    }));
    get().saveData();
  },
  
  deletePlace: (id) => {
    set((state) => ({
      places: state.places.filter(place => place.id !== id),
      selectedPlace: state.selectedPlace?.id === id ? undefined : state.selectedPlace
    }));
    get().saveData();
  },
  
  setSelectedPlace: (place) => {
    set({ selectedPlace: place });
  },
  
  // Trips
  addTrip: (tripData) => {
    const now = new Date().toISOString();
    const trip: Trip = { 
      ...tripData, 
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({
      trips: [...state.trips, trip]
    }));
    get().saveData();
  },
  
  updateTrip: (id, updates) => {
    set((state) => ({
      trips: state.trips.map(trip => 
        trip.id === id ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip
      )
    }));
    get().saveData();
  },
  
  deleteTrip: (id) => {
    set((state) => ({
      trips: state.trips.filter(trip => trip.id !== id),
      selectedTrip: state.selectedTrip?.id === id ? undefined : state.selectedTrip
    }));
    get().saveData();
  },
  
  setSelectedTrip: (trip) => {
    set({ selectedTrip: trip });
  },
  
  // Day Plans
  addDayPlan: (dayPlanData) => {
    const dayPlan: DayPlan = { ...dayPlanData, id: generateId() };
    set((state) => ({
      dayPlans: [...state.dayPlans, dayPlan]
    }));
    get().saveData();
  },
  
  updateDayPlan: (id, updates) => {
    set((state) => ({
      dayPlans: state.dayPlans.map(plan => 
        plan.id === id ? { ...plan, ...updates } : plan
      )
    }));
    get().saveData();
  },
  
  deleteDayPlan: (id) => {
    set((state) => ({
      dayPlans: state.dayPlans.filter(plan => plan.id !== id)
    }));
    get().saveData();
  },
  
  getDayPlansForTrip: (tripId) => {
    return get().dayPlans.filter(plan => plan.tripId === tripId);
  },
  
  // Photos
  addPhoto: (photoData) => {
    const photo: Photo = { 
      ...photoData, 
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    set((state) => ({
      photos: [...state.photos, photo]
    }));
    get().saveData();
  },
  
  deletePhoto: (id) => {
    set((state) => ({
      photos: state.photos.filter(photo => photo.id !== id)
    }));
    get().saveData();
  },
  
  // View Mode
  setViewMode: (mode) => {
    set({ currentViewMode: mode });
  },
  
  // Map
  setMapViewState: (viewState) => {
    set({ mapViewState: viewState });
  },
  
  // Data persistence
  saveData: () => {
    const state = get();
    const dataToSave = {
      places: state.places,
      trips: state.trips,
      dayPlans: state.dayPlans,
      photos: state.photos,
      schedules: state.schedules,
      exhibitions: state.exhibitions,
      mapViewState: state.mapViewState
    };
    saveToLocalStorage('tripManagementData', dataToSave);
  },
  
  loadData: () => {
    const savedData = loadFromLocalStorage('tripManagementData');
    if (savedData) {
      set((state) => ({
        ...state,
        ...savedData
      }));
    }
  }
}));