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
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { rideService } from '../../src/services/ride.service';
import { getCurrentLocation, getAddressFromCoords } from '../../src/utils/location';

export default function PostRideScreen({ navigation }: any) {
  const { user, userData } = useAuth();
  
  const [pickupLocation, setPickupLocation] = useState({
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [dropoffLocation, setDropoffLocation] = useState({
    address: '',
    latitude: 0,
    longitude: 0,
  });
  
  const [rideData, setRideData] = useState({
    date: '',
    time: '',
    seats: '4',
    pricePerSeat: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setRideData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePickupAddress = (text: string) => {
    setPickupLocation((prev) => ({ ...prev, address: text }));
  };

  const updateDropoffAddress = (text: string) => {
    setDropoffLocation((prev) => ({ ...prev, address: text }));
  };

  const useCurrentLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        const address = await getAddressFromCoords(coords.latitude, coords.longitude);
        setPickupLocation({
          address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        Alert.alert('Success', `Current location: ${address}`);
      } else {
        Alert.alert('Error', 'Could not get your location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Make sure location is enabled.');
    }
  };

  const handlePostRide = async () => {
    if (!user || !userData) {
      Alert.alert('Error', 'You must be signed in');
      return;
    }

    if (!pickupLocation.address || !dropoffLocation.address) {
      Alert.alert('Error', 'Please enter pickup and dropoff locations');
      return;
    }

    if (!rideData.date || !rideData.time || !rideData.seats) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const finalPickupLat = pickupLocation.latitude || 26.0667; 
    const finalPickupLng = pickupLocation.longitude || 50.5577;
    const finalDropoffLat = dropoffLocation.latitude || 26.0778;
    const finalDropoffLng = dropoffLocation.longitude || 50.5688;

    setLoading(true);

    try {
      const result = await rideService.createRide({
        driverId: user.uid,
        driverName: userData.name,
        driverPhone: userData.phone,
        driverRating: userData.rating,
        from: pickupLocation.address,
        to: dropoffLocation.address,
        pickupLat: finalPickupLat,
        pickupLng: finalPickupLng,
        dropoffLat: finalDropoffLat,
        dropoffLng: finalDropoffLng,
        date: rideData.date,
        time: rideData.time,
        totalSeats: parseInt(rideData.seats),
        availableSeats: parseInt(rideData.seats),
        price: rideData.pricePerSeat ? parseFloat(rideData.pricePerSeat) : 0,
        notes: rideData.notes,
        status: 'active',
      });

      setLoading(false);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your ride has been posted',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('DriverMain'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to post ride');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred');
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
                    value={pickupLocation.address}
                    onChangeText={updatePickupAddress}
                    editable={!loading}
                  />
                </View>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={useCurrentLocation}
                  disabled={loading}
                >
                  <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Drop-off Location *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🎯</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Downtown Mall"
                    placeholderTextColor="#9CA3AF"
                    value={dropoffLocation.address}
                    onChangeText={updateDropoffAddress}
                    editable={!loading}
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
                    placeholder="YYYY-MM-DD (e.g., 2024-12-15)"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.date}
                    onChangeText={(value) => handleChange('date', value)}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Departure Time *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🕐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM (e.g., 15:00)"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.time}
                    onChangeText={(value) => handleChange('time', value)}
                    editable={!loading}
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
                      disabled={loading}
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
                <Text style={styles.label}>Price per Seat (BHD, optional)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>💵</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 5"
                    placeholderTextColor="#9CA3AF"
                    value={rideData.pricePerSeat}
                    onChangeText={(value) => handleChange('pricePerSeat', value)}
                    keyboardType="decimal-pad"
                    editable={!loading}
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
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.postButton, loading && styles.buttonDisabled]}
            onPress={handlePostRide}
            disabled={loading}
          >
            {loading ? (
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#E0F2FE',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
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
    marginBottom: 16,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  seatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
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
  locationButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#3A85BD',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  postButton: {
    margin: 16,
    backgroundColor: '#3A85BD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});