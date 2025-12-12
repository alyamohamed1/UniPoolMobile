import { Ride } from './ride.service';
import { Timestamp } from 'firebase/firestore';

interface LocationPoint {
  latitude: number;
  longitude: number;
}

interface TimeWindow {
  date: string;
  time: string;
}

interface MatchScore {
  rideId: string;
  totalScore: number;
  pickupDistanceScore: number;
  dropoffDistanceScore: number;
  timeScore: number;
  priceScore: number;
  ratingScore: number;
  pickupDistance: number;
  dropoffDistance: number;
  timeDifference: number; // in minutes
}

export interface RideMatch extends Ride {
  matchScore: MatchScore;
  matchPercentage: number; // 0-100
}

export const matchingService = {
  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    point1: LocationPoint,
    point2: LocationPoint
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) *
      Math.cos(this.toRad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  },

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Parse time string (e.g., "3:00 PM") and return minutes since midnight
   */
  parseTimeToMinutes(timeStr: string): number {
    try {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period?.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period?.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error parsing time:', error);
      return 0;
    }
  },

  /**
   * Calculate time difference in minutes between two time strings
   */
  calculateTimeDifference(time1: string, time2: string): number {
    const minutes1 = this.parseTimeToMinutes(time1);
    const minutes2 = this.parseTimeToMinutes(time2);
    return Math.abs(minutes1 - minutes2);
  },

  /**
   * Parse date string and compare with target date
   * Returns number of days difference
   */
  calculateDateDifference(date1: string, date2: string): number {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error parsing dates:', error);
      return 999; // Large number to indicate incompatible dates
    }
  },

  /**
   * Calculate match score for a ride based on rider preferences
   * Higher score = better match (max 100)
   */
  calculateMatchScore(
    ride: Ride,
    riderPickup: LocationPoint,
    riderDropoff: LocationPoint,
    riderDate: string,
    riderTime: string,
    preferences?: {
      maxPickupDistance?: number; // in km, default 5
      maxDropoffDistance?: number; // in km, default 5
      maxTimeDifference?: number; // in minutes, default 60
      maxPriceBudget?: number; // in BHD
      minDriverRating?: number; // 1-5
    }
  ): MatchScore {
    // Default preferences
    const prefs = {
      maxPickupDistance: preferences?.maxPickupDistance || 5,
      maxDropoffDistance: preferences?.maxDropoffDistance || 5,
      maxTimeDifference: preferences?.maxTimeDifference || 60,
      maxPriceBudget: preferences?.maxPriceBudget || 10,
      minDriverRating: preferences?.minDriverRating || 3,
    };

    // Calculate distances
    const pickupDistance = this.calculateDistance(
      riderPickup,
      { latitude: ride.pickupLat, longitude: ride.pickupLng }
    );

    const dropoffDistance = this.calculateDistance(
      riderDropoff,
      { latitude: ride.dropoffLat, longitude: ride.dropoffLng }
    );

    // Calculate time difference
    const timeDifference = this.calculateTimeDifference(riderTime, ride.time);
    const dateDifference = this.calculateDateDifference(riderDate, ride.date);

    // Score components (each 0-20 points, total 100)
    
    // 1. Pickup proximity score (20 points)
    // 0km = 20 points, maxDistance = 0 points
    const pickupDistanceScore = Math.max(
      0,
      20 * (1 - pickupDistance / prefs.maxPickupDistance)
    );

    // 2. Dropoff proximity score (20 points)
    const dropoffDistanceScore = Math.max(
      0,
      20 * (1 - dropoffDistance / prefs.maxDropoffDistance)
    );

    // 3. Time matching score (30 points - most important)
    // Same time = 30 points, maxTimeDiff = 0 points
    let timeScore = 0;
    if (dateDifference === 0) {
      // Same date
      timeScore = Math.max(
        0,
        30 * (1 - timeDifference / prefs.maxTimeDifference)
      );
    } else if (dateDifference === 1) {
      // Next day - reduced score
      timeScore = 5;
    }
    // Different dates beyond 1 day = 0 points

    // 4. Price score (15 points)
    // Lower price = better, but not too important
    const priceScore = Math.max(
      0,
      15 * (1 - ride.price / prefs.maxPriceBudget)
    );

    // 5. Driver rating score (15 points)
    // Assume ride has driverRating field, default to 4.0
    const driverRating = (ride as any).driverRating || 4.0;
    const ratingScore = (driverRating / 5) * 15;

    // Total score
    const totalScore = Math.max(
      0,
      pickupDistanceScore +
      dropoffDistanceScore +
      timeScore +
      priceScore +
      ratingScore
    );

    return {
      rideId: ride.id || '',
      totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal
      pickupDistanceScore: Math.round(pickupDistanceScore * 10) / 10,
      dropoffDistanceScore: Math.round(dropoffDistanceScore * 10) / 10,
      timeScore: Math.round(timeScore * 10) / 10,
      priceScore: Math.round(priceScore * 10) / 10,
      ratingScore: Math.round(ratingScore * 10) / 10,
      pickupDistance: Math.round(pickupDistance * 10) / 10,
      dropoffDistance: Math.round(dropoffDistance * 10) / 10,
      timeDifference,
    };
  },

  /**
   * Get recommended rides for a rider
   * Returns sorted array of rides with match scores
   */
  getRecommendedRides(
    availableRides: Ride[],
    riderPickup: LocationPoint,
    riderDropoff: LocationPoint,
    riderDate: string,
    riderTime: string,
    preferences?: {
      maxPickupDistance?: number;
      maxDropoffDistance?: number;
      maxTimeDifference?: number;
      maxPriceBudget?: number;
      minDriverRating?: number;
      minMatchScore?: number; // Only show rides above this score (default 40)
    }
  ): RideMatch[] {
    const minMatchScore = preferences?.minMatchScore || 40;

    // Calculate match score for each ride
    const matchedRides: RideMatch[] = availableRides
      .map((ride) => {
        const matchScore = this.calculateMatchScore(
          ride,
          riderPickup,
          riderDropoff,
          riderDate,
          riderTime,
          preferences
        );

        const matchPercentage = Math.round((matchScore.totalScore / 100) * 100);

        return {
          ...ride,
          matchScore,
          matchPercentage,
        };
      })
      .filter((ride) => ride.matchScore.totalScore >= minMatchScore) // Filter low matches
      .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore); // Sort by score

    return matchedRides;
  },

  /**
   * Get match quality label
   */
  getMatchQuality(matchPercentage: number): {
    label: string;
    color: string;
    icon: string;
  } {
    if (matchPercentage >= 80) {
      return { label: 'Excellent Match', color: '#10B981', icon: '🎯' };
    } else if (matchPercentage >= 65) {
      return { label: 'Great Match', color: '#3B82F6', icon: '⭐' };
    } else if (matchPercentage >= 50) {
      return { label: 'Good Match', color: '#F59E0B', icon: '👍' };
    } else {
      return { label: 'Fair Match', color: '#6B7280', icon: '✓' };
    }
  },

  /**
   * Format distance for display
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  },

  /**
   * Format time difference for display
   */
  formatTimeDifference(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  },

  /**
   * Get detailed match explanation
   */
  getMatchExplanation(matchScore: MatchScore): string[] {
    const explanations: string[] = [];

    if (matchScore.pickupDistance <= 1) {
      explanations.push(`📍 Very close pickup (${this.formatDistance(matchScore.pickupDistance)})`);
    } else if (matchScore.pickupDistance <= 3) {
      explanations.push(`📍 Near your pickup (${this.formatDistance(matchScore.pickupDistance)})`);
    }

    if (matchScore.dropoffDistance <= 1) {
      explanations.push(`🎯 Very close dropoff (${this.formatDistance(matchScore.dropoffDistance)})`);
    } else if (matchScore.dropoffDistance <= 3) {
      explanations.push(`🎯 Near your destination (${this.formatDistance(matchScore.dropoffDistance)})`);
    }

    if (matchScore.timeDifference <= 15) {
      explanations.push(`⏰ Perfect timing (${this.formatTimeDifference(matchScore.timeDifference)} difference)`);
    } else if (matchScore.timeDifference <= 30) {
      explanations.push(`⏰ Good timing (${this.formatTimeDifference(matchScore.timeDifference)} difference)`);
    }

    if (matchScore.ratingScore >= 12) {
      explanations.push('⭐ Highly rated driver');
    }

    if (matchScore.priceScore >= 12) {
      explanations.push('💰 Great price');
    }

    return explanations;
  },

  /**
   * Filter rides by hard constraints
   */
  filterByConstraints(
    rides: Ride[],
    constraints: {
      maxPickupDistance?: number;
      maxDropoffDistance?: number;
      sameDateOnly?: boolean;
      availableSeatsMin?: number;
    },
    riderPickup: LocationPoint,
    riderDropoff: LocationPoint,
    riderDate: string
  ): Ride[] {
    return rides.filter((ride) => {
      // Check available seats
      if (constraints.availableSeatsMin && ride.availableSeats < constraints.availableSeatsMin) {
        return false;
      }

      // Check date
      if (constraints.sameDateOnly && ride.date !== riderDate) {
        return false;
      }

      // Check pickup distance
      if (constraints.maxPickupDistance) {
        const pickupDist = this.calculateDistance(
          riderPickup,
          { latitude: ride.pickupLat, longitude: ride.pickupLng }
        );
        if (pickupDist > constraints.maxPickupDistance) {
          return false;
        }
      }

      // Check dropoff distance
      if (constraints.maxDropoffDistance) {
        const dropoffDist = this.calculateDistance(
          riderDropoff,
          { latitude: ride.dropoffLat, longitude: ride.dropoffLng }
        );
        if (dropoffDist > constraints.maxDropoffDistance) {
          return false;
        }
      }

      return true;
    });
  },
};