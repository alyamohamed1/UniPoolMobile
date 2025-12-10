import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Ride {
  id?: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  driverRating?: number;
  from: string;
  to: string;
  // GPS coordinates
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM
  totalSeats: number;
  availableSeats: number;
  price: number;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date | Timestamp;
}

export const rideService = {
  /**
   * Driver posts a ride
   */
  async createRide(rideData: Omit<Ride, 'id' | 'createdAt'>): Promise<{
    success: boolean;
    error?: string;
    rideId?: string;
  }> {
    try {
      // Validate required fields
      if (!rideData.driverId || !rideData.from || !rideData.to) {
        return {
          success: false,
          error: 'Missing required fields',
        };
      }

      // Validate GPS coordinates
      if (!rideData.pickupLat || !rideData.pickupLng || 
          !rideData.dropoffLat || !rideData.dropoffLng) {
        return {
          success: false,
          error: 'Missing GPS coordinates',
        };
      }

      // Validate seats
      if (rideData.totalSeats < 1 || rideData.totalSeats > 6) {
        return {
          success: false,
          error: 'Total seats must be between 1 and 6',
        };
      }

      // Validate price
      if (rideData.price < 0) {
        return {
          success: false,
          error: 'Price cannot be negative',
        };
      }

      // Add the ride to Firestore
      const docRef = await addDoc(collection(db, 'rides'), {
        ...rideData,
        createdAt: Timestamp.now(),
      });

      return {
        success: true,
        rideId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating ride:', error);
      return {
        success: false,
        error: 'Failed to create ride',
      };
    }
  },

  /**
   * Get all available rides for riders to browse - FIXED WITHOUT COMPOSITE INDEX
   */
  async getAvailableRides(): Promise<{
    success: boolean;
    error?: string;
    rides?: Ride[];
  }> {
    try {
      // ✅ FIXED: Query only by status first, then filter in memory
      // This avoids the composite index requirement
      const q = query(
        collection(db, 'rides'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      // ✅ Filter in memory for rides with available seats
      const rides: Ride[] = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))
        .filter((ride: any) => ride.availableSeats > 0) as Ride[];

      return {
        success: true,
        rides,
      };
    } catch (error) {
      console.error('Error getting available rides:', error);
      return {
        success: false,
        error: 'Failed to fetch rides',
        rides: [],
      };
    }
  },

  /**
   * Get all rides posted by a specific driver
   */
  async getDriverRides(driverId: string): Promise<{
    success: boolean;
    error?: string;
    rides?: Ride[];
  }> {
    try {
      const q = query(
        collection(db, 'rides'),
        where('driverId', '==', driverId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const rides: Ride[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Ride[];

      return {
        success: true,
        rides,
      };
    } catch (error) {
      console.error('Error getting driver rides:', error);
      return {
        success: false,
        error: 'Failed to fetch your rides',
        rides: [],
      };
    }
  },

  /**
   * Get a single ride by ID
   */
  async getRideById(rideId: string): Promise<{
    success: boolean;
    error?: string;
    ride?: Ride;
  }> {
    try {
      const docRef = doc(db, 'rides', rideId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const ride: Ride = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      } as Ride;

      return {
        success: true,
        ride,
      };
    } catch (error) {
      console.error('Error getting ride:', error);
      return {
        success: false,
        error: 'Failed to fetch ride details',
      };
    }
  },

  /**
   * Book a ride (decrement available seats)
   */
  async bookRide(rideId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // First check if ride exists and has available seats
      const rideDoc = await getDoc(doc(db, 'rides', rideId));

      if (!rideDoc.exists()) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const rideData = rideDoc.data() as Ride;

      if (rideData.availableSeats < 1) {
        return {
          success: false,
          error: 'No seats available',
        };
      }

      if (rideData.status !== 'active') {
        return {
          success: false,
          error: 'This ride is no longer active',
        };
      }

      // Update the ride, decrement available seats atomically
      await updateDoc(doc(db, 'rides', rideId), {
        availableSeats: increment(-1),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error booking ride:', error);
      return {
        success: false,
        error: 'Failed to book ride',
      };
    }
  },

  /**
   * Cancel a ride (Driver cancels their posted ride)
   */
  async cancelRide(rideId: string, driverId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify the ride belongs to this driver
      const rideDoc = await getDoc(doc(db, 'rides', rideId));

      if (!rideDoc.exists()) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const rideData = rideDoc.data() as Ride;

      if (rideData.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only cancel your own rides',
        };
      }

      // Update ride status to cancelled
      await updateDoc(doc(db, 'rides', rideId), {
        status: 'cancelled',
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error cancelling ride:', error);
      return {
        success: false,
        error: 'Failed to cancel ride',
      };
    }
  },

  /**
   * Delete a ride completely
   */
  async deleteRide(rideId: string, driverId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify the ride belongs to this driver
      const rideDoc = await getDoc(doc(db, 'rides', rideId));

      if (!rideDoc.exists()) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const rideData = rideDoc.data() as Ride;

      if (rideData.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only delete your own rides',
        };
      }

      // Delete the ride
      await deleteDoc(doc(db, 'rides', rideId));

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting ride:', error);
      return {
        success: false,
        error: 'Failed to delete ride',
      };
    }
  },

  /**
   * Update ride details
   */
  async updateRide(
    rideId: string,
    driverId: string,
    updates: Partial<Pick<Ride, 'time' | 'availableSeats' | 'price' | 'notes'>>
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify ownership
      const rideDoc = await getDoc(doc(db, 'rides', rideId));

      if (!rideDoc.exists()) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const rideData = rideDoc.data() as Ride;

      if (rideData.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only update your own rides',
        };
      }

      // Update the ride
      await updateDoc(doc(db, 'rides', rideId), updates);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error updating ride:', error);
      return {
        success: false,
        error: 'Failed to update ride',
      };
    }
  },
};