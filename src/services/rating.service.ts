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
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Rating {
  id?: string;
  bookingId: string;
  rideId: string;
  raterId: string; // Person giving the rating
  raterName: string;
  raterRole: 'driver' | 'rider'; // Role of person giving rating
  rateeId: string; // Person being rated
  rateeName: string;
  rateeRole: 'driver' | 'rider'; // Role of person being rated
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date | Timestamp;
}

export interface UserRatingStats {
  userId: string;
  totalRatings: number;
  averageRating: number;
  oneStarCount: number;
  twoStarCount: number;
  threeStarCount: number;
  fourStarCount: number;
  fiveStarCount: number;
}

export const ratingService = {
  /**
   * Submit a rating for a user after a completed ride
   */
  async submitRating(
    bookingId: string,
    rideId: string,
    raterId: string,
    raterName: string,
    raterRole: 'driver' | 'rider',
    rateeId: string,
    rateeName: string,
    rateeRole: 'driver' | 'rider',
    rating: number,
    comment?: string
  ): Promise<{
    success: boolean;
    error?: string;
    ratingId?: string;
  }> {
    try {
      // Validate rating is between 1-5
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5 stars',
        };
      }

      // Check if user has already rated this booking
      const existingRating = await getDocs(
        query(
          collection(db, 'ratings'),
          where('bookingId', '==', bookingId),
          where('raterId', '==', raterId)
        )
      );

      if (!existingRating.empty) {
        return {
          success: false,
          error: 'You have already rated this ride',
        };
      }

      // Create the rating
      const ratingData: Omit<Rating, 'id'> = {
        bookingId,
        rideId,
        raterId,
        raterName,
        raterRole,
        rateeId,
        rateeName,
        rateeRole,
        rating,
        comment,
        createdAt: Timestamp.now(),
      };

      const batch = writeBatch(db);

      // Add the rating
      const ratingRef = doc(collection(db, 'ratings'));
      batch.set(ratingRef, ratingData);

      // Update the user's rating statistics
      const statsRef = doc(db, 'userRatingStats', rateeId);
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        // Update existing stats
        const currentStats = statsDoc.data();
        const newTotalRatings = currentStats.totalRatings + 1;
        const newTotalScore = currentStats.averageRating * currentStats.totalRatings + rating;
        const newAverageRating = newTotalScore / newTotalRatings;

        const updateData: any = {
          totalRatings: increment(1),
          averageRating: newAverageRating,
        };

        // Increment the appropriate star count
        switch (rating) {
          case 1:
            updateData.oneStarCount = increment(1);
            break;
          case 2:
            updateData.twoStarCount = increment(1);
            break;
          case 3:
            updateData.threeStarCount = increment(1);
            break;
          case 4:
            updateData.fourStarCount = increment(1);
            break;
          case 5:
            updateData.fiveStarCount = increment(1);
            break;
        }

        batch.update(statsRef, updateData);
      } else {
        // Create new stats document
        const newStats: UserRatingStats = {
          userId: rateeId,
          totalRatings: 1,
          averageRating: rating,
          oneStarCount: rating === 1 ? 1 : 0,
          twoStarCount: rating === 2 ? 1 : 0,
          threeStarCount: rating === 3 ? 1 : 0,
          fourStarCount: rating === 4 ? 1 : 0,
          fiveStarCount: rating === 5 ? 1 : 0,
        };

        batch.set(statsRef, newStats);
      }

      // Update the user's profile with the new average rating
      const userRef = doc(db, 'users', rateeId);
      const calculatedAverage = statsDoc.exists()
        ? (statsDoc.data().averageRating * statsDoc.data().totalRatings + rating) /
          (statsDoc.data().totalRatings + 1)
        : rating;

      batch.update(userRef, {
        rating: calculatedAverage,
        totalRatings: increment(1),
      });

      await batch.commit();

      return {
        success: true,
        ratingId: ratingRef.id,
      };
    } catch (error) {
      console.error('Error submitting rating:', error);
      return {
        success: false,
        error: 'Failed to submit rating',
      };
    }
  },

  /**
   * Check if user has rated a specific booking
   */
  async hasRated(bookingId: string, raterId: string): Promise<{
    success: boolean;
    hasRated: boolean;
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('bookingId', '==', bookingId),
        where('raterId', '==', raterId)
      );

      const querySnapshot = await getDocs(q);

      return {
        success: true,
        hasRated: !querySnapshot.empty,
      };
    } catch (error) {
      console.error('Error checking rating status:', error);
      return {
        success: false,
        hasRated: false,
        error: 'Failed to check rating status',
      };
    }
  },

  /**
   * Get all ratings for a user
   */
  async getUserRatings(userId: string): Promise<{
    success: boolean;
    ratings?: Rating[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('rateeId', '==', userId)
      );

      const querySnapshot = await getDocs(q);

      const ratings: Rating[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        } as Rating;
      });

      return {
        success: true,
        ratings,
      };
    } catch (error) {
      console.error('Error getting user ratings:', error);
      return {
        success: false,
        error: 'Failed to fetch ratings',
      };
    }
  },

  /**
   * Get rating statistics for a user
   */
  async getUserRatingStats(userId: string): Promise<{
    success: boolean;
    stats?: UserRatingStats;
    error?: string;
  }> {
    try {
      const statsDoc = await getDoc(doc(db, 'userRatingStats', userId));

      if (!statsDoc.exists()) {
        // Return default stats if none exist
        return {
          success: true,
          stats: {
            userId,
            totalRatings: 0,
            averageRating: 0,
            oneStarCount: 0,
            twoStarCount: 0,
            threeStarCount: 0,
            fourStarCount: 0,
            fiveStarCount: 0,
          },
        };
      }

      return {
        success: true,
        stats: statsDoc.data() as UserRatingStats,
      };
    } catch (error) {
      console.error('Error getting rating stats:', error);
      return {
        success: false,
        error: 'Failed to fetch rating statistics',
      };
    }
  },

  /**
   * Get ratings given by a specific user
   */
  async getRatingsGivenByUser(userId: string): Promise<{
    success: boolean;
    ratings?: Rating[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('raterId', '==', userId)
      );

      const querySnapshot = await getDocs(q);

      const ratings: Rating[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        } as Rating;
      });

      return {
        success: true,
        ratings,
      };
    } catch (error) {
      console.error('Error getting ratings given by user:', error);
      return {
        success: false,
        error: 'Failed to fetch ratings',
      };
    }
  },

  /**
   * Get ratings for a specific ride
   */
  async getRideRatings(rideId: string): Promise<{
    success: boolean;
    ratings?: Rating[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('rideId', '==', rideId)
      );

      const querySnapshot = await getDocs(q);

      const ratings: Rating[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        } as Rating;
      });

      return {
        success: true,
        ratings,
      };
    } catch (error) {
      console.error('Error getting ride ratings:', error);
      return {
        success: false,
        error: 'Failed to fetch ride ratings',
      };
    }
  },
};