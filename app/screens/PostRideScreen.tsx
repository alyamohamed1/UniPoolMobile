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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuth } from '../../src/context/AuthContext';
import { rideService } from '../../src/services/ride.service';
import { useToast } from '../../src/context/ToastContext';

export default function PostRideScreen({ navigation }: any) {
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<any>(null);

  const [rideData, setRideData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    date: '',
    time: '',
    seats: '4',
    pricePerSeat: '',
    notes: '',
  });

  useEffect(() => {
    getCurrentLocation();
    setDefaultDate();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc.coords);
      }
    } catch (error) {
      console.error('Location error:', error);
      // Use default Bahrain coordinates
      setLocation({
        latitude: 26.0667,
        longitude: 50.5577,
      });
    }
  };

  const setDefaultDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    setRideData(prev => ({ ...prev, date: formattedDate }));
  };

  const handleChange = (field: string, value: string) => {
    setRideData((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = (): boolean => {
    if (!rideData.pickupLocation.trim()) {
      showToast('Please enter pickup location', 'warning');
      return false;
    }

    if (!rideData.dropoffLocation.trim()) {
      showToast('Please enter drop-off location', 'warning');
      return false;
    }

    if (!rideData.date) {
      showToast('Please select a date', 'warning');
      return false;
    }

    if (!rideData.time.trim()) {
      showToast('Please enter departure time', 'warning');
      return false;
    }

    if (!rideData.seats || parseInt(rideData.seats) < 1) {
      showToast('Please select number of seats', 'warning');
      return false;
    }

    return true;
  };

  const handlePostRide = async () => {
    if (!user || !userData) {
      showToast('You must be signed in', 'error');
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setSubmitting(true);

    try {
      // Use current location or default Bahrain coordinates
      const pickupCoords = location || { latitude: 26.0667, longitude: 50.5577 };
      
      // For demo, use slightly offset coordinates for dropoff
      // In production, you'd geocode the actual addresses
      const dropoffCoords = {
        latitude: pickupCoords.latitude + 0.01,
        longitude: pickupCoords.longitude + 0.01,
      };

      const result = await rideService.createRide({
        driverId: user.uid,
        driverName: userData.name,
        driverPhone: userData.phone,
        driverRating: userData.rating || 5.0,
        from: rideData.pickupLocation,
        to: rideData.dropoffLocation,
        pickupLat: pickupCoords.latitude,
        pickupLng: pickupCoords.longitude,
        dropoffLat: dropoffCoords.latitude,
        dropoffLng: dropoffCoords.longitude,
        date: rideData.date,
        time: rideData.time,
        totalSeats: parseInt(rideData.seats),
        availableSeats: parseInt(rideData.seats),
        price: rideData.pricePerSeat ? parseFloat(rideData.pricePerSeat) : 0,
        notes: rideData.notes,
        status: 'active',
      });

      setSubmitting(false);

      if (result.success) {
        showToast('Ride posted successfully!', 'success');
        setTimeout(() => {
          navigation.navigate('DriverMain');
        }, 1000);
      } else {
        showToast(result.error || 'Failed to post ride', 'error');
      }
    } catch (error) {
      setSubmitting(false);
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
          disabled={submitting}
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
                    editable={!submitting}
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
                    editable={!submitting}
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
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.date}
                    onChangeText={(value) => handleChange('date', value)}
                    editable={!submitting}
                  />
                </View>
                <Text style={styles.helperText}>Format: {new Date().toISOString().split('T')[0]}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Departure Time *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🕐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 3:00 PM or 15:00"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.time}
                    onChangeText={(value) => handleChange('time', value)}
                    editable={!submitting}
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
                      disabled={submitting}
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
                <Text style={styles.label}>Price per Seat (BHD)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>💵</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 2"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.pricePerSeat}
                    onChangeText={(value) => handleChange('pricePerSeat', value)}
                    keyboardType="decimal-pad"
                    editable={!submitting}
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
                  editable={!submitting}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.postButton, submitting && styles.postButtonDisabled]}
            onPress={handlePostRide}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>POST RIDE</Text>
            )}
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
