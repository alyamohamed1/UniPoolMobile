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
import { bookingService } from '../../src/services/booking.service';

export default function RatePassengersScreen({ navigation, route }: any) {
  const { showToast } = useToast();
  const { bookingId } = route.params || {};
  
  const [booking, setBooking] = useState<any>(null);
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
        showToast('Failed to load booking details', 'error');
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

    try {
      setSubmitting(true);
      
      // Submit rating to your rating service
      // You'll need to implement this in your services
      const result = await bookingService.rateRider(bookingId, {
        rating,
        comment: comment.trim(),
        riderId: booking.riderId,
      });

      if (result.success) {
        showToast('Rating submitted successfully!', 'success');
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        showToast(result.error || 'Failed to submit rating', 'error');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('An error occurred', 'error');
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
        <Text style={styles.headerTitle}>Rate Passenger</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Help keep the community safe by rating your passenger
            </Text>
          </View>

          <View style={styles.passengerCard}>
            <View style={styles.passengerHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {booking.riderName?.charAt(0).toUpperCase() || '👤'}
                </Text>
              </View>
              <View style={styles.passengerInfo}>
                <Text style={styles.passengerName}>{booking.riderName || 'Rider'}</Text>
                <Text style={styles.rideDetails}>
                  {booking.from} → {booking.to}
                </Text>
                <Text style={styles.rideDate}>
                  {booking.date} • {booking.time}
                </Text>
              </View>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rate this passenger</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    disabled={submitting}
                  >
                    <Text style={styles.star}>
                      {star <= rating ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {rating > 0 && (
              <View style={styles.commentSection}>
                <Text style={styles.commentLabel}>Comments (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Any additional feedback..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  editable={!submitting}
                />
              </View>
            )}
          </View>

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
  infoCard: {
    backgroundColor: '#EEF2FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoText: {
    fontSize: 14,
    color: '#4338CA',
    textAlign: 'center',
  },
  passengerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  rideDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  rideDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingSection: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    fontSize: 36,
    marginHorizontal: 4,
  },
  commentSection: {
    marginTop: 12,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#7F7CAF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});