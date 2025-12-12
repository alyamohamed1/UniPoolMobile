import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { ratingService } from '../../src/services/rating.service';
import { bookingService, Booking } from '../../src/services/booking.service';

export default function RatingScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const { user, userData } = useAuth();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    if (!user) return;

    try {
      // Get booking details
      const bookingsResult = await bookingService.getRiderBookings(user.uid);
      if (bookingsResult.success && bookingsResult.bookings) {
        const foundBooking = bookingsResult.bookings.find(b => b.id === bookingId);
        if (foundBooking) {
          setBooking(foundBooking);
        }
      }

      // If not found in rider bookings, check driver bookings
      if (!booking) {
        const driverResult = await bookingService.getDriverBookings(user.uid);
        if (driverResult.success && driverResult.bookings) {
          const foundBooking = driverResult.bookings.find(b => b.id === bookingId);
          if (foundBooking) {
            setBooking(foundBooking);
          }
        }
      }

      // Check if user has already rated
      const ratingCheck = await ratingService.hasRated(bookingId, user.uid);
      if (ratingCheck.success) {
        setHasRated(ratingCheck.hasRated);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user || !userData || !booking) return;

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    setSubmitting(true);

    try {
      // Determine who is rating whom
      const isDriver = userData.role === 'driver';
      const rateeId = isDriver ? booking.riderId : booking.driverId;
      const rateeName = isDriver ? booking.riderName : booking.driverName;
      const rateeRole = isDriver ? 'rider' : 'driver';

      const result = await ratingService.submitRating(
        bookingId,
        booking.rideId,
        user.uid,
        userData.name,
        userData.role as 'driver' | 'rider',
        rateeId,
        rateeName,
        rateeRole,
        rating,
        comment.trim() || undefined
      );

      if (result.success) {
        Alert.alert(
          'Success',
          'Thank you for your rating!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={hasRated}
          >
            <Text style={styles.star}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#7F7CAF" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Booking not found</Text>
      </SafeAreaView>
    );
  }

  if (hasRated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.alreadyRatedContainer}>
          <Text style={styles.alreadyRatedIcon}>✅</Text>
          <Text style={styles.alreadyRatedTitle}>Already Rated</Text>
          <Text style={styles.alreadyRatedText}>
            You have already submitted a rating for this ride.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isDriver = userData?.role === 'driver';
  const rateeRole = isDriver ? 'rider' : 'driver';
  const rateeName = isDriver ? booking.riderName : booking.driverName;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Your {rateeRole === 'driver' ? 'Driver' : 'Rider'}</Text>
          <Text style={styles.subtitle}>{rateeName}</Text>
        </View>

        <View style={styles.rideInfo}>
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>📍</Text>
            <Text style={styles.routeText}>{booking.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>🎯</Text>
            <Text style={styles.routeText}>{booking.to}</Text>
          </View>
          <Text style={styles.rideDate}>
            {booking.date} • {booking.time}
          </Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How was your experience?</Text>
          {renderStars()}
          <Text style={styles.ratingText}>
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>
            Additional Comments (Optional)
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share more about your experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {comment.length}/500
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
  },
  rideInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  routeText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 10,
    marginVertical: 4,
  },
  rideDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  star: {
    fontSize: 48,
  },
  ratingText: {
    fontSize: 16,
    color: '#7F7CAF',
    fontWeight: '600',
  },
  commentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#7F7CAF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  alreadyRatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  alreadyRatedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  alreadyRatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  alreadyRatedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#7F7CAF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});