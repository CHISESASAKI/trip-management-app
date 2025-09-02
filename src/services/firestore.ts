import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Place, Trip, Photo } from '../types/base';

// Firestoreドキュメントの型定義
export interface FirestorePlace extends Omit<Place, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreTrip extends Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestorePhoto extends Omit<Photo, 'id' | 'takenAt'> {
  userId: string;
  takenAt: Timestamp;
}

// Places操作
export class PlaceService {
  static async getPlaces(userId: string): Promise<Place[]> {
    try {
      const q = query(
        collection(db, 'places'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString()
        } as unknown as Place;
      });
    } catch (error) {
      console.error('Failed to get places:', error);
      throw error;
    }
  }

  static async addPlace(userId: string, place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'places'), {
        ...place,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Failed to add place:', error);
      throw error;
    }
  }

  static async updatePlace(placeId: string, updates: Partial<Place>): Promise<void> {
    try {
      const placeRef = doc(db, 'places', placeId);
      await updateDoc(placeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update place:', error);
      throw error;
    }
  }

  static async deletePlace(placeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'places', placeId));
    } catch (error) {
      console.error('Failed to delete place:', error);
      throw error;
    }
  }

  static subscribeToPlaces(userId: string, callback: (places: Place[]) => void) {
    const q = query(
      collection(db, 'places'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const places = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString()
        } as unknown as Place;
      });
      callback(places);
    });
  }
}

// Trips操作
export class TripService {
  static async getTrips(userId: string): Promise<Trip[]> {
    try {
      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString()
        } as unknown as Trip;
      });
    } catch (error) {
      console.error('Failed to get trips:', error);
      throw error;
    }
  }

  static async addTrip(userId: string, trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'trips'), {
        ...trip,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Failed to add trip:', error);
      throw error;
    }
  }

  static async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  }

  static async deleteTrip(tripId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'trips', tripId));
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  }

  static subscribeToTrips(userId: string, callback: (trips: Trip[]) => void) {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString()
        } as unknown as Trip;
      });
      callback(trips);
    });
  }
}

// Photos操作
export class PhotoService {
  static async getPhotos(userId: string): Promise<Photo[]> {
    try {
      const q = query(
        collection(db, 'photos'),
        where('userId', '==', userId),
        orderBy('takenAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          takenAt: data.takenAt?.toDate().toISOString()
        } as unknown as Photo;
      });
    } catch (error) {
      console.error('Failed to get photos:', error);
      throw error;
    }
  }

  static async addPhoto(userId: string, photo: Omit<Photo, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'photos'), {
        ...photo,
        userId,
        takenAt: photo.takenAt ? Timestamp.fromDate(new Date(photo.takenAt)) : serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Failed to add photo:', error);
      throw error;
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'photos', photoId));
    } catch (error) {
      console.error('Failed to delete photo:', error);
      throw error;
    }
  }

  static subscribeToPhotos(userId: string, callback: (photos: Photo[]) => void) {
    const q = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      orderBy('takenAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          takenAt: data.takenAt?.toDate().toISOString()
        } as unknown as Photo;
      });
      callback(photos);
    });
  }
}