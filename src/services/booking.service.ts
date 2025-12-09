import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  Timestamp,
  orderBy,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { rideService } from './ride.service';

export interface Booking {
  id?: string;
  rideId: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookedAt: Date | Timestamp;
}

export const bookingService = {
  /**
   * Create a new booking (Rider books a ride)
   */
  async createBooking(
    rideId: string,
    riderId: string,
    riderName: string,
    riderPhone?: string
  ): Promise<{
    success: boolean;
    error?: string;
    bookingId?: string;
  }> {
    try {
      // First, get the ride details
      const rideResult = await rideService.getRideById(rideId);

      if (!rideResult.success || !rideResult.ride) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const ride = rideResult.ride;

      // Check if ride is still available
      if (ride.availableSeats < 1) {
        return {
          success: false,
          error: 'No seats available for this ride',
        };
      }

      if (ride.status !== 'active') {
        return {
          success: false,
          error: 'This ride is no longer active',
        };
      }

      // Check if rider already booked this ride
      const existingBooking = await getDocs(
        query(
          collection(db, 'bookings'),
          where('rideId', '==', rideId),
          where('riderId', '==', riderId),
          where('status', '!=', 'cancelled')
        )
      );

      if (!existingBooking.empty) {
        return {
          success: false,
          error: 'You have already booked this ride',
        };
      }

      // Create the booking
      const bookingData: Omit<Booking, 'id'> = {
        rideId,
        riderId,
        riderName,
        riderPhone,
        driverId: ride.driverId,
        driverName: ride.driverName,
        from: ride.from,
        to: ride.to,
        pickupLat: ride.pickupLat,
        pickupLng: ride.pickupLng,
        dropoffLat: ride.dropoffLat,
        dropoffLng: ride.dropoffLng,
        date: ride.date,
        time: ride.time,
        price: ride.price,
        status: 'confirmed',
        bookedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      // Update the ride - decrement available seats
      const bookRideResult = await rideService.bookRide(rideId);

      if (!bookRideResult.success) {
        // If booking the ride failed, we should cancel this booking
        await updateDoc(doc(db, 'bookings', docRef.id), {
          status: 'cancelled',
        });

        return {
          success: false,
          error: bookRideResult.error,
        };
      }

      return {
        success: true,
        bookingId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: 'Failed to book ride',
      };
    }
  },

  /**
   * Get all bookings for a specific ride (Driver sees who booked their ride)
   */
  async getRideBookings(rideId: string): Promise<{
    success: boolean;
    error?: string;
    bookings?: Booking[];
  }> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('rideId', '==', rideId),
        where('status', '==', 'confirmed'),
        orderBy('bookedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        bookedAt: doc.data().bookedAt?.toDate() || new Date(),
      })) as Booking[];

      return {
        success: true,
        bookings,
      };
    } catch (error) {
      console.error('Error getting ride bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch bookings',
        bookings: [],
      };
    }
  },

  /**
   * Get all bookings for a specific driver (all their rides)
   */
  async getDriverBookings(driverId: string): Promise<{
    success: boolean;
    error?: string;
    bookings?: Booking[];
  }> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('driverId', '==', driverId),
        where('status', '==', 'confirmed'),
        orderBy('bookedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        bookedAt: doc.data().bookedAt?.toDate() || new Date(),
      })) as Booking[];

      return {
        success: true,
        bookings,
      };
    } catch (error) {
      console.error('Error getting driver bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch your bookings',
        bookings: [],
      };
    }
  },

  /**
   * Get all bookings made by a specific rider
   */
  async getRiderBookings(riderId: string): Promise<{
    success: boolean;
    error?: string;
    bookings?: Booking[];
  }> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('riderId', '==', riderId),
        orderBy('bookedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        bookedAt: doc.data().bookedAt?.toDate() || new Date(),
      })) as Booking[];

      return {
        success: true,
        bookings,
      };
    } catch (error) {
      console.error('Error getting rider bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch your bookings',
        bookings: [],
      };
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get booking details
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

      if (!bookingDoc.exists()) {
        return {
          success: false,
          error: 'Booking not found',
        };
      }

      const booking = bookingDoc.data() as Booking;

      // Verify user can cancel (either rider or driver)
      if (booking.riderId !== userId && booking.driverId !== userId) {
        return {
          success: false,
          error: 'You cannot cancel this booking',
        };
      }

      // Update booking status
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
      });

      // Increment available seats back
      await updateDoc(doc(db, 'rides', booking.rideId), {
        availableSeats: increment(1),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: 'Failed to cancel booking',
      };
    }
  },

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<{
    success: boolean;
    error?: string;
    booking?: Booking;
  }> {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

      if (!bookingDoc.exists()) {
        return {
          success: false,
          error: 'Booking not found',
        };
      }

      const booking: Booking = {
        id: bookingDoc.id,
        ...bookingDoc.data(),
        bookedAt: bookingDoc.data().bookedAt?.toDate() || new Date(),
      } as Booking;

      return {
        success: true,
        booking,
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      return {
        success: false,
        error: 'Failed to fetch booking details',
      };
    }
  },
};