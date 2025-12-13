import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '../../src/context/ToastContext';
import { bookingService, Booking } from '../../src/services/booking.service';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

export default function RateDriverScreen({ navigation, route }: any) {
  const { showToast } = useToast();
  const { bookingId } = route.params || {};
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    if (!bookingId) {
      showToast('No booking ID provided', 'error');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      
      const result = await bookingService.getBookingById(bookingId);
      
      if (result.success && result.booking) {
        setBooking(result.booking);
      } else {
        showToast(result.error || 'Failed to load booking details', 'error');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      showToast('An error occurred', 'error');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Please select a rating', 'warning');
      return;
    }

    if (!booking) {
      showToast('Missing booking data', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      // Update booking with driver rating
      await updateDoc(doc(db, 'bookings', bookingId), {
        driverRating: rating,
        driverComment: comment.trim(),
        ratedAt: Timestamp.now(),
      });

      // Update driver's average rating
      try {
        const userDoc = doc(db, 'users', booking.driverId);
        const { getDoc } = await import('firebase/firestore');
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const currentRating = userData.avgRating || 0;
          const currentRatingCount = userData.ratingCount || 0;
          
          const newRatingCount = currentRatingCount + 1;
          const newAvgRating = ((currentRating * currentRatingCount) + rating) / newRatingCount;
          
          await updateDoc(userDoc, {
            avgRating: newAvgRating,
            ratingCount: newRatingCount,
            lastRatedAt: Timestamp.now(),
          });
        }
      } catch (userError) {
        console.warn('Could not update driver average rating:', userError);
      }

      showToast('Rating submitted successfully!', 'success');
      setTimeout(() => navigation.goBack(), 1000);
      
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      showToast(error.message || 'Failed to submit rating', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F7CAF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Ride</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          {/* Driver Info Card */}
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {booking.driverName?.charAt(0).toUpperCase() || '🚗'}
              </Text>
            </View>
            <Text style={styles.driverName}>{booking.driverName || 'Driver'}</Text>
            {booking.driverPhone && (
              <Text style={styles.driverDetails}>
                {booking.driverPhone}
              </Text>
            )}
          </View>

          {/* Rating Section */}
          <View style={styles.ratingCard}>
            <Text style={styles.ratingQuestion}>How was your ride?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  disabled={submitting}
                  style={styles.starButton}
                >
                  <Text style={styles.star}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.tapToRate}>Tap to rate</Text>
          </View>

          {/* Comment Section - Only show after rating */}
          {rating > 0 && (
            <View style={styles.commentCard}>
              <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Share your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                editable={!submitting}
              />
            </View>
          )}

          {/* Submit Button */}
          {rating > 0 && (
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>SUBMIT RATING</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Ride Details */}
          <View style={styles.rideDetailsCard}>
            <Text style={styles.rideDetailsTitle}>Ride Details</Text>
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>📍</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>From</Text>
                <Text style={styles.routeText}>{booking.from}</Text>
              </View>
            </View>
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>🎯</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routeText}>{booking.to}</Text>
              </View>
            </View>
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>📅</Text>
              <Text style={styles.routeText}>{booking.date} • {booking.time}</Text>
            </View>
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>💵</Text>
              <Text style={styles.routeText}>{booking.price} BHD</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#7F7CAF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#7F7CAF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  driverAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  driverDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 48,
    marginHorizontal: 2,
  },
  tapToRate: {
    fontSize: 14,
    color: '#7F7CAF',
    fontWeight: '500',
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#7F7CAF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideDetailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});