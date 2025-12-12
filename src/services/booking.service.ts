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
  increment,
  writeBatch,
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
  seatsRequested: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  bookedAt: Date | Timestamp;
  respondedAt?: Date | Timestamp;
}

export const bookingService = {
  /**
   * Create a new booking request (Rider books a ride - immediately reserves seats)
   */
  async createBooking(
    rideId: string,
    riderId: string,
    riderName: string,
    seatsRequested: number = 1,
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
      if (ride.availableSeats < seatsRequested) {
        return {
          success: false,
          error: `Only ${ride.availableSeats} seat(s) available`,
        };
      }

      if (ride.status !== 'active') {
        return {
          success: false,
          error: 'This ride is no longer active',
        };
      }

      // Check if rider is trying to book their own ride
      if (ride.driverId === riderId) {
        return {
          success: false,
          error: 'You cannot book your own ride',
        };
      }

      // Check if rider already has a pending or confirmed booking for this ride
      const existingBooking = await getDocs(
        query(
          collection(db, 'bookings'),
          where('rideId', '==', rideId),
          where('riderId', '==', riderId),
          where('status', 'in', ['pending', 'confirmed'])
        )
      );

      if (!existingBooking.empty) {
        return {
          success: false,
          error: 'You already have a booking request for this ride',
        };
      }

      // Create the booking with PENDING status and IMMEDIATELY decrement seats
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
        price: ride.price * seatsRequested,
        seatsRequested,
        status: 'pending', // Starts as pending, driver must confirm
        bookedAt: Timestamp.now(),
      };

      // Use batch to create booking and decrement seats atomically
      const batch = writeBatch(db);

      // Create the booking
      const bookingRef = doc(collection(db, 'bookings'));
      batch.set(bookingRef, bookingData);

      // Immediately decrement available seats
      batch.update(doc(db, 'rides', rideId), {
        availableSeats: increment(-seatsRequested),
      });

      await batch.commit();

      return {
        success: true,
        bookingId: bookingRef.id,
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: 'Failed to create booking request',
      };
    }
  },

  /**
   * Driver confirms a booking request (seats already reserved)
   */
  async confirmBooking(
    bookingId: string,
    driverId: string
  ): Promise<{
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

      // Verify this is the driver's booking to confirm
      if (booking.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only confirm your own ride bookings',
        };
      }

      // Check if already confirmed or rejected
      if (booking.status !== 'pending') {
        return {
          success: false,
          error: `This booking is already ${booking.status}`,
        };
      }

      // Update booking status to confirmed
      // Note: Seats were already decremented when booking was created
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'confirmed',
        respondedAt: Timestamp.now(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error confirming booking:', error);
      return {
        success: false,
        error: 'Failed to confirm booking',
      };
    }
  },

  /**
   * Driver rejects a booking request
   */
  async rejectBooking(
    bookingId: string,
    driverId: string
  ): Promise<{
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

      // Verify this is the driver's booking to reject
      if (booking.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only reject your own ride bookings',
        };
      }

      // Check if already rejected or cancelled
      if (booking.status !== 'pending') {
        return {
          success: false,
          error: `This booking is already ${booking.status}`,
        };
      }

      // Update booking status to rejected
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'rejected',
        respondedAt: Timestamp.now(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error rejecting booking:', error);
      return {
        success: false,
        error: 'Failed to reject booking',
      };
    }
  },

  /**
   * Get all bookings for a specific ride (Driver sees who requested their ride)
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
        orderBy('bookedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          bookedAt: data.bookedAt?.toDate?.() || data.bookedAt || new Date(),
          respondedAt: data.respondedAt?.toDate?.() || data.respondedAt,
        } as Booking;
      });

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
        orderBy('bookedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          bookedAt: data.bookedAt?.toDate?.() || data.bookedAt || new Date(),
          respondedAt: data.respondedAt?.toDate?.() || data.respondedAt,
        } as Booking;
      });

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
   * Get pending booking requests for a driver
   */
  async getPendingBookings(driverId: string): Promise<{
    success: boolean;
    error?: string;
    bookings?: Booking[];
  }> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('driverId', '==', driverId),
        where('status', '==', 'pending'),
        orderBy('bookedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const bookings: Booking[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          bookedAt: data.bookedAt?.toDate?.() || data.bookedAt || new Date(),
        } as Booking;
      });

      return {
        success: true,
        bookings,
      };
    } catch (error) {
      console.error('Error getting pending bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch pending requests',
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

      const bookings: Booking[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          bookedAt: data.bookedAt?.toDate?.() || data.bookedAt || new Date(),
          respondedAt: data.respondedAt?.toDate?.() || data.respondedAt,
        } as Booking;
      });

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
   * Cancel a booking (can be done by rider or driver)
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

      // If booking was confirmed, need to restore seats
      const wasConfirmed = booking.status === 'confirmed';

      // Use batch to update both booking and ride (if needed)
      const batch = writeBatch(db);

      // Update booking status
      batch.update(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
      });

      // If was confirmed, restore the seats
      if (wasConfirmed) {
        batch.update(doc(db, 'rides', booking.rideId), {
          availableSeats: increment(booking.seatsRequested),
        });
      }

      await batch.commit();

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
        respondedAt: bookingDoc.data().respondedAt?.toDate(),
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

  /**
   * Get count of pending bookings for a driver (for badge/notification)
   */
  async getPendingBookingCount(driverId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('driverId', '==', driverId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting pending count:', error);
      return 0;
    }
  },
};