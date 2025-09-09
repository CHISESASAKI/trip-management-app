import { create } from 'zustand';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { PlaceService, TripService, PhotoService } from '../services/firestore';
import { onAuthStateChange, signInAnonymous, type AuthUser } from '../services/auth';
import { calculateDistance } from '../utils/exif';
import type { Place, Trip, ViewMode, DayPlan, DayPlaceItem, Photo } from '../types/base';

interface StoreActions {
  // Places
  addPlace: (place: Omit<Place, 'id'>) => Promise<void>;
  updatePlace: (id: string, updates: Partial<Place>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  setSelectedPlace: (place: Place | undefined) => void;
  
  // Trips
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  setSelectedTrip: (trip: Trip | undefined) => void;
  completeTrip: (tripId: string) => Promise<void>;
  generateTripRecord: (tripId: string) => Promise<void>;
  autoClassifyPhotosForTrip: (tripId: string) => Promise<void>;
  
  // Day Plans
  addDayPlan: (dayPlan: Omit<DayPlan, 'id'>) => void;
  updateDayPlan: (id: string, updates: Partial<DayPlan>) => void;
  deleteDayPlan: (id: string) => void;
  getDayPlansForTrip: (tripId: string) => DayPlan[];
  
  // Photos
  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt'>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  
  // View Mode
  setViewMode: (mode: ViewMode) => void;
  
  // Theme
  toggleTheme: () => void;
  
  // Map
  setMapViewState: (viewState: { center: [number, number]; zoom: number }) => void;
  
  // Data persistence
  saveData: () => void;
  loadData: () => void;
  
  // Firebase Authentication
  initializeAuth: () => void;
  signInAnonymously: () => Promise<void>;
  signOut: () => void;
  
  // Firebase Sync
  syncWithFirebase: () => Promise<void>;
  migrateLocalData: () => Promise<void>;
  
  // Sync status
  setSyncStatus: (status: 'syncing' | 'synced' | 'error' | 'offline') => void;
  setupRealtimeListeners: () => void;
  cleanupListeners: () => void;
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
  isDarkMode: boolean;
  mapViewState: { center: [number, number]; zoom: number };
  
  // Firebase state
  currentUser?: AuthUser | null;
  isOnline: boolean;
  syncStatus: 'syncing' | 'synced' | 'error' | 'offline';
  useFirebase: boolean;
  unsubscribeFunctions: (() => void)[];
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
  isDarkMode: typeof window !== 'undefined' ? 
    window.matchMedia('(prefers-color-scheme: dark)').matches : false,
  mapViewState: {
    center: [35.6762, 139.6503], // Tokyo
    zoom: 10
  },
  
  // Firebase state
  currentUser: null,
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'offline',
  useFirebase: false,
  unsubscribeFunctions: []
};

export const useStore = create<AppState & StoreActions>((set, get) => ({
  ...initialState,
  
  // Places
  addPlace: async (placeData) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await PlaceService.addPlace(state.currentUser.uid, placeData);
        // リアルタイムリスナーがUI更新を処理する
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to add place to Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカルに保存
        const place: Place = { ...placeData, id: generateId() };
        set((state) => ({
          places: [...state.places, place]
        }));
        get().saveData();
      }
    } else {
      const place: Place = { ...placeData, id: generateId() };
      set((state) => ({
        places: [...state.places, place]
      }));
      get().saveData();
    }
  },
  
  updatePlace: async (id, updates) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await PlaceService.updatePlace(id, updates);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to update place in Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル更新
        set((state) => ({
          places: state.places.map(place => 
            place.id === id ? { ...place, ...updates } : place
          )
        }));
        get().saveData();
      }
    } else {
      set((state) => ({
        places: state.places.map(place => 
          place.id === id ? { ...place, ...updates } : place
        )
      }));
      get().saveData();
    }
  },
  
  deletePlace: async (id) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await PlaceService.deletePlace(id);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to delete place from Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル削除
        set((state) => ({
          places: state.places.filter(place => place.id !== id),
          selectedPlace: state.selectedPlace?.id === id ? undefined : state.selectedPlace
        }));
        get().saveData();
      }
    } else {
      set((state) => ({
        places: state.places.filter(place => place.id !== id),
        selectedPlace: state.selectedPlace?.id === id ? undefined : state.selectedPlace
      }));
      get().saveData();
    }
  },
  
  setSelectedPlace: (place) => {
    set({ selectedPlace: place });
  },
  
  // Trips
  addTrip: async (tripData) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await TripService.addTrip(state.currentUser.uid, tripData);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to add trip to Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル保存
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
      }
    } else {
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
    }
  },
  
  updateTrip: async (id, updates) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await TripService.updateTrip(id, updates);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to update trip in Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル更新
        set((state) => ({
          trips: state.trips.map(trip => 
            trip.id === id ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip
          )
        }));
        get().saveData();
      }
    } else {
      set((state) => ({
        trips: state.trips.map(trip => 
          trip.id === id ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip
        )
      }));
      get().saveData();
    }
  },
  
  deleteTrip: async (id) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await TripService.deleteTrip(id);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to delete trip from Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル削除
        set((state) => ({
          trips: state.trips.filter(trip => trip.id !== id),
          selectedTrip: state.selectedTrip?.id === id ? undefined : state.selectedTrip
        }));
        get().saveData();
      }
    } else {
      set((state) => ({
        trips: state.trips.filter(trip => trip.id !== id),
        selectedTrip: state.selectedTrip?.id === id ? undefined : state.selectedTrip
      }));
      get().saveData();
    }
  },
  
  setSelectedTrip: (trip) => {
    set({ selectedTrip: trip });
  },

  completeTrip: async (tripId) => {
    const state = get();
    
    // 旅行を完了状態に更新
    await state.updateTrip(tripId, { status: 'completed' });
    
    // 旅行記録を自動生成
    await state.generateTripRecord(tripId);
    
    // 写真を自動分類
    await state.autoClassifyPhotosForTrip(tripId);
  },

  generateTripRecord: async (tripId) => {
    const state = get();
    const trip = state.trips.find(t => t.id === tripId);
    
    if (!trip) return;

    // 旅行に含まれる場所のステータスを'visited'に更新
    for (const placeId of trip.places) {
      const place = state.places.find(p => p.id === placeId);
      if (place && place.status !== 'visited') {
        await state.updatePlace(placeId, { status: 'visited' });
      }
    }

    // 基本的な日程データを自動生成（実際の訪問順序で）
    const tripPlaces = state.places.filter(p => trip.places.includes(p.id));
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const tripDays = Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // 既存の日程がない場合のみ自動生成
    const existingDayPlans = state.dayPlans.filter(dp => dp.tripId === tripId);
    if (existingDayPlans.length === 0 && tripPlaces.length > 0) {
      const placesPerDay = Math.ceil(tripPlaces.length / tripDays);
      
      for (let day = 0; day < tripDays; day++) {
        const dayDate = new Date(tripStart);
        dayDate.setDate(tripStart.getDate() + day);
        
        const dayPlaces = tripPlaces.slice(day * placesPerDay, (day + 1) * placesPerDay);
        
        if (dayPlaces.length > 0) {
          const dayPlaceItems: DayPlaceItem[] = dayPlaces.map((place, index) => {
            const startHour = 9 + (index * 2); // 9時開始で2時間間隔
            const endHour = startHour + 1.5;
            
            return {
              placeId: place.id,
              startTime: `${String(Math.floor(startHour)).padStart(2, '0')}:${String((startHour % 1) * 60).padStart(2, '0')}`,
              endTime: `${String(Math.floor(endHour)).padStart(2, '0')}:${String((endHour % 1) * 60).padStart(2, '0')}`,
              transportationToNext: index < dayPlaces.length - 1 ? 'walk' : undefined,
              notes: `${place.name}の訪問記録（自動生成）`
            };
          });

          state.addDayPlan({
            tripId,
            date: dayDate.toISOString().split('T')[0],
            places: dayPlaceItems,
            notes: `${trip.name} - ${day + 1}日目（自動生成）`
          });
        }
      }
    }
  },

  autoClassifyPhotosForTrip: async (tripId) => {
    const state = get();
    const trip = state.trips.find(t => t.id === tripId);
    
    if (!trip) return;

    const tripPlaces = state.places.filter(p => trip.places.includes(p.id));
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    
    // 旅行期間中の写真を抽出（まだ旅行に関連付けられていないもの）
    const candidatePhotos = state.photos.filter(photo => {
      // 旅行IDが未設定または異なる旅行に設定されている
      if (photo.tripId && photo.tripId === tripId) return false;
      
      // 撮影日が旅行期間内
      const photoDate = new Date(photo.takenAt || photo.createdAt);
      if (photoDate < tripStart || photoDate > tripEnd) return false;
      
      return true;
    });

    console.log(`Analyzing ${candidatePhotos.length} photos for trip ${trip.name}`);

    // 各写真について最寄りの旅行場所を探す
    for (const photo of candidatePhotos) {
      if (!photo.location) continue;

      let nearestPlace = null;
      let minDistance = Infinity;
      const maxDistance = 500; // 500m以内

      for (const place of tripPlaces) {
        const distance = calculateDistance(
          photo.location.lat,
          photo.location.lng,
          place.lat,
          place.lng
        );

        if (distance <= maxDistance && distance < minDistance) {
          minDistance = distance;
          nearestPlace = place;
        }
      }

      // 最寄りの場所が見つかった場合、写真を自動分類
      if (nearestPlace) {
        console.log(`Auto-classifying photo to ${nearestPlace.name} (${Math.round(minDistance)}m away)`);
        
        // 写真を更新して旅行と場所に関連付け
        const updatedPhoto = {
          ...photo,
          tripId,
          placeId: nearestPlace.id,
          autoClassified: true,
          classificationDistance: Math.round(minDistance)
        };

        // 写真リストを更新
        set((state) => ({
          photos: state.photos.map(p => 
            p.id === photo.id ? updatedPhoto : p
          )
        }));
      }
    }

    // データを保存
    state.saveData();
    
    // Firebase同期
    if (state.useFirebase) {
      try {
        await state.syncWithFirebase();
      } catch (error) {
        console.error('Failed to sync auto-classified photos:', error);
      }
    }
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
  addPhoto: async (photoData) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        const photoWithCreated = { ...photoData, createdAt: new Date().toISOString() };
        await PhotoService.addPhoto(state.currentUser.uid, photoWithCreated);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to add photo to Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル保存
        const photo: Photo = { 
          ...photoData, 
          id: generateId(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          photos: [...state.photos, photo]
        }));
        get().saveData();
      }
    } else {
      const photo: Photo = { 
        ...photoData, 
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      set((state) => ({
        photos: [...state.photos, photo]
      }));
      get().saveData();
    }
  },
  
  deletePhoto: async (id) => {
    const state = get();
    
    if (state.useFirebase && state.currentUser) {
      try {
        state.setSyncStatus('syncing');
        await PhotoService.deletePhoto(id);
        state.setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to delete photo from Firebase:', error);
        state.setSyncStatus('error');
        // フォールバックとしてローカル削除
        set((state) => ({
          photos: state.photos.filter(photo => photo.id !== id)
        }));
        get().saveData();
      }
    } else {
      set((state) => ({
        photos: state.photos.filter(photo => photo.id !== id)
      }));
      get().saveData();
    }
  },
  
  // View Mode
  setViewMode: (mode) => {
    set({ currentViewMode: mode });
  },
  
  // Theme
  toggleTheme: () => {
    set((state) => {
      const newIsDarkMode = !state.isDarkMode;
      // HTMLクラスを更新してTailwindのダークモードを適用
      if (typeof window !== 'undefined') {
        if (newIsDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: newIsDarkMode };
    });
    get().saveData();
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
      isDarkMode: state.isDarkMode,
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
      
      // ダークモード状態をHTMLクラスに適用
      if (typeof window !== 'undefined' && savedData.isDarkMode) {
        if (savedData.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  },
  
  // Firebase Authentication
  initializeAuth: () => {
    const state = get();
    
    // Firebase無効時は何もしない
    if (!state.useFirebase) {
      return;
    }
    
    // オンライン状態の監視
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        set({ isOnline: true });
        if (state.useFirebase) {
          get().syncWithFirebase();
        }
      });
      
      window.addEventListener('offline', () => {
        set({ isOnline: false, syncStatus: 'offline' });
      });
    }
    
    // 認証状態の監視
    const unsubscribe = onAuthStateChange((user) => {
      set({ currentUser: user });
      
      if (user && state.useFirebase) {
        // Firebase使用時はリアルタイムリスナーをセットアップ
        get().setupRealtimeListeners();
      } else if (!user && state.useFirebase) {
        // ログアウト時はリスナーをクリーンアップ
        get().cleanupListeners();
        set({ syncStatus: 'offline' });
      }
    });
    
    set((state) => ({
      unsubscribeFunctions: [...state.unsubscribeFunctions, unsubscribe]
    }));
  },
  
  signInAnonymously: async () => {
    const state = get();
    
    // Firebase無効時は何もしない
    if (!state.useFirebase) {
      return;
    }
    
    try {
      await signInAnonymous();
      set({ useFirebase: true, syncStatus: 'syncing' });
      await get().syncWithFirebase();
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      get().cleanupListeners();
      // サインアウト前にローカルデータをFirebaseに保存
      if (get().currentUser) {
        await get().syncWithFirebase();
      }
      
      set({ 
        currentUser: null, 
        useFirebase: false, 
        syncStatus: 'offline' 
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  },
  
  // Firebase Sync
  syncWithFirebase: async () => {
    const state = get();
    
    if (!state.currentUser || !state.isOnline) {
      return;
    }
    
    try {
      set({ syncStatus: 'syncing' });
      
      // Firebaseからデータを取得
      const [places, trips, photos] = await Promise.all([
        PlaceService.getPlaces(state.currentUser.uid),
        TripService.getTrips(state.currentUser.uid),
        PhotoService.getPhotos(state.currentUser.uid)
      ]);
      
      set({ 
        places, 
        trips, 
        photos, 
        syncStatus: 'synced' 
      });
      
      // リアルタイムリスナーをセットアップ
      get().setupRealtimeListeners();
      
    } catch (error) {
      console.error('Firebase sync failed:', error);
      set({ syncStatus: 'error' });
    }
  },
  
  migrateLocalData: async () => {
    const state = get();
    
    if (!state.currentUser || !state.isOnline) {
      throw new Error('User not authenticated or offline');
    }
    
    try {
      set({ syncStatus: 'syncing' });
      
      // ローカルデータをFirebaseに移行
      const migrationPromises: Promise<any>[] = [];
      
      // Places
      state.places.forEach(place => {
        const { id, ...placeData } = place;
        migrationPromises.push(
          PlaceService.addPlace(state.currentUser!.uid, placeData)
        );
      });
      
      // Trips  
      state.trips.forEach(trip => {
        const { id, ...tripData } = trip;
        migrationPromises.push(
          TripService.addTrip(state.currentUser!.uid, tripData)
        );
      });
      
      // Photos
      state.photos.forEach(photo => {
        const { id, ...photoData } = photo;
        migrationPromises.push(
          PhotoService.addPhoto(state.currentUser!.uid, photoData)
        );
      });
      
      await Promise.all(migrationPromises);
      
      // 移行完了後、Firebaseからデータを再同期
      await get().syncWithFirebase();
      
      set({ syncStatus: 'synced' });
      
    } catch (error) {
      console.error('Data migration failed:', error);
      set({ syncStatus: 'error' });
      throw error;
    }
  },
  
  setupRealtimeListeners: () => {
    const state = get();
    
    if (!state.currentUser) return;
    
    // 既存のリスナーをクリーンアップ
    get().cleanupListeners();
    
    // Places リスナー
    const unsubscribePlaces = PlaceService.subscribeToPlaces(
      state.currentUser.uid,
      (places) => {
        set({ places });
      }
    );
    
    // Trips リスナー
    const unsubscribeTrips = TripService.subscribeToTrips(
      state.currentUser.uid,
      (trips) => {
        set({ trips });
      }
    );
    
    // Photos リスナー
    const unsubscribePhotos = PhotoService.subscribeToPhotos(
      state.currentUser.uid,
      (photos) => {
        set({ photos });
      }
    );
    
    set((state) => ({
      unsubscribeFunctions: [
        ...state.unsubscribeFunctions,
        unsubscribePlaces,
        unsubscribeTrips,
        unsubscribePhotos
      ]
    }));
  },
  
  cleanupListeners: () => {
    const state = get();
    state.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    set({ unsubscribeFunctions: [] });
  },
  
  setSyncStatus: (status) => {
    set({ syncStatus: status });
  }
}));