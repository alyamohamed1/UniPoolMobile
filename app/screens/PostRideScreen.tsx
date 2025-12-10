import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { rideService } from '../../src/services/ride.service';
import { useToast } from '../../src/context/ToastContext';

export default function PostRideScreen({ navigation }: any) {
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  const [rideData, setRideData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    date: '',
    time: '',
    seats: '4',
    pricePerSeat: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setRideData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostRide = async () => {
    if (!user || !userData) {
      showToast('You must be signed in', 'error');
      return;
    }

    // Validate fields
    if (!rideData.pickupLocation || !rideData.dropoffLocation || !rideData.time || !rideData.seats) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      // Use dummy GPS coordinates (Bahrain default)
      const result = await rideService.createRide({
        driverId: user.uid,
        driverName: userData.name,
        driverPhone: userData.phone,
        driverRating: userData.rating,
        from: rideData.pickupLocation,
        to: rideData.dropoffLocation,
        pickupLat: 26.0667, // Bahrain center
        pickupLng: 50.5577,
        dropoffLat: 26.0778,
        dropoffLng: 50.5688,
        date: rideData.date || new Date().toISOString().split('T')[0],
        time: rideData.time,
        totalSeats: parseInt(rideData.seats),
        availableSeats: parseInt(rideData.seats),
        price: rideData.pricePerSeat ? parseFloat(rideData.pricePerSeat) : 0,
        notes: rideData.notes,
        status: 'active',
      });

      if (result.success) {
        showToast('Ride posted successfully!', 'success');
        setTimeout(() => navigation.navigate('DriverMain'), 1000);
      } else {
        showToast(result.error || 'Failed to post ride', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
      console.error('Post ride error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A85BD', '#9FB798']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Ride</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🚗</Text>
            <Text style={styles.infoText}>
              Post your ride and riders will send you requests to join
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Route Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pickup Location *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Campus Building A"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.pickupLocation}
                    onChangeText={(value) => handleChange('pickupLocation', value)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Drop-off Location *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🎯</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Downtown Mall"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.dropoffLocation}
                    onChangeText={(value) => handleChange('dropoffLocation', value)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📅</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.date}
                    onChangeText={(value) => handleChange('date', value)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Departure Time *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🕐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 3:00 PM"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.time}
                    onChangeText={(value) => handleChange('time', value)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ride Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Available Seats *</Text>
                <View style={styles.seatsContainer}>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.seatButton,
                        rideData.seats === num.toString() && styles.seatButtonActive,
                      ]}
                      onPress={() => handleChange('seats', num.toString())}
                    >
                      <Text
                        style={[
                          styles.seatButtonText,
                          rideData.seats === num.toString() && styles.seatButtonTextActive,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price per Seat (optional)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>💵</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., $5"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.pricePerSeat}
                    onChangeText={(value) => handleChange('pricePerSeat', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Additional Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any additional information for riders..."
                  placeholderTextColor="#9CA3AF"
                  value={rideData.notes}
                  onChangeText={(value) => handleChange('notes', value)}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.postButton}
            onPress={handlePostRide}
          >
            <Text style={styles.postButtonText}>POST RIDE</Text>
          </TouchableOpacity>
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
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7DD3FC',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  seatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  seatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatButtonActive: {
    backgroundColor: '#3A85BD',
    borderColor: '#3A85BD',
  },
  seatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  seatButtonTextActive: {
    color: '#FFFFFF',
  },
  postButton: {
    backgroundColor: '#3A85BD',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
