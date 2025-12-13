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
  driverPhone?: string;
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
  completedAt?: Date | Timestamp;
  // Rating fields
  riderRating?: number;
  riderComment?: string;
  ratedAt?: Date | Timestamp;
}

export const bookingService = {
  /**
   * ✅ FIXED: Create a new booking request (Rider books a ride - seats NOT decremented until confirmed)
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

      // Check if ride is still available (has at least 1 seat)
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

      // ✅ FIXED: Create the booking with PENDING status WITHOUT decrementing seats
      // Seats will only be decremented when driver confirms the booking
      const bookingData: Omit<Booking, 'id'> = {
        rideId,
        riderId,
        riderName,
        riderPhone,
        driverId: ride.driverId,
        driverName: ride.driverName,
        driverPhone: ride.driverPhone,
        from: ride.from,
        to: ride.to,
        pickupLat: ride.pickupLat,
        pickupLng: ride.pickupLng,
        dropoffLat: ride.dropoffLat,
        dropoffLng: ride.dropoffLng,
        date: ride.date,
        time: ride.time,
        price: ride.price, // Price for 1 seat (seatsRequested is always 1 for now)
        seatsRequested: 1, // Currently only supporting 1 seat per booking
        status: 'pending', // Starts as pending, driver must confirm
        bookedAt: Timestamp.now(),
      };

      // ✅ Simply create the booking without touching ride seats
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);

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
   * ✅ FIXED: Driver confirms a booking request (NOW decrements seats)
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

      // ✅ Check if ride still has available seats
      const rideResult = await rideService.getRideById(booking.rideId);
      if (!rideResult.success || !rideResult.ride) {
        return {
          success: false,
          error: 'Ride not found',
        };
      }

      const ride = rideResult.ride;
      if (ride.availableSeats < booking.seatsRequested) {
        return {
          success: false,
          error: 'Not enough seats available for this booking',
        };
      }

      // ✅ Use batch to update booking status AND decrement seats atomically
      const batch = writeBatch(db);

      // Update booking status to confirmed
      batch.update(doc(db, 'bookings', bookingId), {
        status: 'confirmed',
        respondedAt: Timestamp.now(),
      });

      // ✅ NOW decrement the available seats
      batch.update(doc(db, 'rides', booking.rideId), {
        availableSeats: increment(-booking.seatsRequested),
      });

      await batch.commit();

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
   * ✅ FIXED: Driver rejects a booking request (no seat restoration needed since seats were never decremented)
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

      // ✅ Simply update booking status to rejected
      // No need to restore seats since they were never decremented
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
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          ratedAt: data.ratedAt?.toDate?.() || data.ratedAt,
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
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          ratedAt: data.ratedAt?.toDate?.() || data.ratedAt,
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
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          ratedAt: data.ratedAt?.toDate?.() || data.ratedAt,
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
   * ✅ FIXED: Cancel a booking (restore seats only if booking was confirmed)
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

      // Check if booking can be cancelled
      if (booking.status === 'cancelled') {
        return {
          success: false,
          error: 'This booking is already cancelled',
        };
      }

      if (booking.status === 'completed') {
        return {
          success: false,
          error: 'Cannot cancel a completed booking',
        };
      }

      // ✅ FIXED: Only restore seats if booking was confirmed
      // If pending or rejected, seats were never decremented
      const shouldRestoreSeats = booking.status === 'confirmed';

      // Use batch to update both booking and ride (if needed)
      const batch = writeBatch(db);

      // Update booking status
      batch.update(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
      });

      // ✅ Only restore seats if booking was confirmed
      if (shouldRestoreSeats) {
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
   * Get booking details by ID
   */
  async getBookingById(bookingId: string): Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
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
        completedAt: bookingDoc.data().completedAt?.toDate(),
        ratedAt: bookingDoc.data().ratedAt?.toDate(),
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

  /**
   * Complete a booking after the ride is finished (Driver only)
   */
  async completeBooking(
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

      // Verify this is the driver's booking
      if (booking.driverId !== driverId) {
        return {
          success: false,
          error: 'You can only complete your own ride bookings',
        };
      }

      // Check if booking is confirmed
      if (booking.status !== 'confirmed') {
        return {
          success: false,
          error: 'Only confirmed bookings can be completed',
        };
      }

      // Update booking status to completed
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed',
        completedAt: Timestamp.now(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error completing booking:', error);
      return {
        success: false,
        error: 'Failed to complete booking',
      };
    }
  },

  /**
   * Complete all bookings for a ride (Driver marks entire ride as complete)
   */
  async completeRide(
    rideId: string,
    driverId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get all confirmed bookings for this ride
      const q = query(
        collection(db, 'bookings'),
        where('rideId', '==', rideId),
        where('driverId', '==', driverId),
        where('status', '==', 'confirmed')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'No confirmed bookings found for this ride',
        };
      }

      // Update all bookings to completed
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'completed',
          completedAt: Timestamp.now(),
        });
      });

      // Update ride status to completed
      batch.update(doc(db, 'rides', rideId), {
        status: 'completed',
      });

      await batch.commit();

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error completing ride:', error);
      return {
        success: false,
        error: 'Failed to complete ride',
      };
    }
  },

  /**
   * Submit rider rating for a completed booking
   */
  async rateRider(
    bookingId: string,
    ratingData: { rating: number; comment: string; riderId: string }
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

      // Verify the rider ID matches
      if (booking.riderId !== ratingData.riderId) {
        return {
          success: false,
          error: 'Rider ID does not match booking',
        };
      }

      // Check if booking is completed (can only rate completed bookings)
      if (booking.status !== 'completed') {
        return {
          success: false,
          error: 'Can only rate riders for completed bookings',
        };
      }

      // Check if rating is valid (1-5)
      if (ratingData.rating < 1 || ratingData.rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5',
        };
      }

      // Check if rider has already been rated for this booking
      if (booking.riderRating) {
        return {
          success: false,
          error: 'Rider has already been rated for this booking',
        };
      }

      // Update booking with rider rating and comment
      await updateDoc(doc(db, 'bookings', bookingId), {
        riderRating: ratingData.rating,
        riderComment: ratingData.comment,
        ratedAt: Timestamp.now(),
      });

      // Update rider's average rating in users collection
      try {
        const userRef = doc(db, 'users', ratingData.riderId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentRating = userData.avgRating || 0;
          const currentRatingCount = userData.ratingCount || 0;
          
          // Calculate new average rating
          const newRatingCount = currentRatingCount + 1;
          const newAvgRating = ((currentRating * currentRatingCount) + ratingData.rating) / newRatingCount;
          
          await updateDoc(userRef, {
            avgRating: newAvgRating,
            ratingCount: newRatingCount,
            lastRatedAt: Timestamp.now(),
          });
        }
      } catch (userError) {
        console.warn('Could not update rider average rating:', userError);
        // Continue anyway - the booking rating was saved successfully
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error rating rider:', error);
      return {
        success: false,
        error: 'Failed to submit rating',
      };
    }
  },
};