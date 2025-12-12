import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Ride {
  id?: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  driverRating?: number; // Average rating for matching
  from: string;
  to: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  date: string;
  time: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'active' | 'completed' | 'cancelled';
  passengers?: string[];
  createdAt: Date | Timestamp;
}

export const rideService = {
  /**
   * Get all active rides available for booking
   */
  async getActiveRides(): Promise<{
    success: boolean;
    rides?: Ride[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, 'rides'),
        where('status', '==', 'active'),
        where('availableSeats', '>', 0),
        orderBy('availableSeats', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const rides: Ride[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        } as Ride;
      });

      return {
        success: true,
        rides,
      };
    } catch (error) {
      console.error('Error getting active rides:', error);
      return {
        success: false,
        error: 'Failed to fetch active rides',
      };
    }
  },

  /**
   * Get a single ride by ID
   */
  async getRideById(rideId: string): Promise<{
    success: boolean;
    ride?: Ride;
    error?: string;
  }> {
    try {
      const rideDoc = await getDoc(doc(db, 'rides', rideId));

      if (!rideDoc.exists()) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const data = rideDoc.data();
      const ride: Ride = {
        id: rideDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
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
   * Get all rides posted by a specific driver
   */
  async getDriverRides(driverId: string): Promise<{
    success: boolean;
    rides?: Ride[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, 'rides'),
        where('driverId', '==', driverId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const rides: Ride[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        } as Ride;
      });

      return {
        success: true,
        rides,
      };
    } catch (error) {
      console.error('Error getting driver rides:', error);
      return {
        success: false,
        error: 'Failed to fetch driver rides',
      };
    }
  },

  /**
   * Create a new ride
   */
  async createRide(params: {
    driverId: string;
    driverName: string;
    driverPhone?: string;
    driverRating?: number;
    from: string;
    to: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    date: string;
    time: string;
    price: number;
    totalSeats: number;
    availableSeats: number;
    notes?: string;
    status: 'active' | 'completed' | 'cancelled';
  }): Promise<{
    success: boolean;
    rideId?: string;
    error?: string;
  }> {
    try {
      const rideData: Omit<Ride, 'id'> = {
        driverId: params.driverId,
        driverName: params.driverName,
        driverPhone: params.driverPhone,
        driverRating: params.driverRating,
        from: params.from,
        to: params.to,
        pickupLat: params.pickupLat,
        pickupLng: params.pickupLng,
        dropoffLat: params.dropoffLat,
        dropoffLng: params.dropoffLng,
        date: params.date,
        time: params.time,
        price: params.price,
        totalSeats: params.totalSeats,
        availableSeats: params.availableSeats || params.totalSeats,
        status: params.status || 'active',
        passengers: [],
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'rides'), rideData);

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
   * Update ride details
   */
  async updateRide(
    rideId: string,
    updates: Partial<Ride>
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await updateDoc(doc(db, 'rides', rideId), updates as any);

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

  /**
   * Delete a ride
   */
  async deleteRide(
    rideId: string,
    driverId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify ownership
      const rideResult = await this.getRideById(rideId);
      if (!rideResult.success || !rideResult.ride) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      if (rideResult.ride.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only delete your own rides',
        };
      }

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
   * Cancel a ride
   */
  async cancelRide(
    rideId: string,
    driverId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify ownership
      const rideResult = await this.getRideById(rideId);
      if (!rideResult.success || !rideResult.ride) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      if (rideResult.ride.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only cancel your own rides',
        };
      }

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
};