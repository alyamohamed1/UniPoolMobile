import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../src/context/AuthContext';
import { bookingService } from '../../src/services/booking.service';

export default function DriverDetailsScreen({ route, navigation }: any) {
  const { ride } = route.params;
  const { user, userData } = useAuth();
  const [booking, setBooking] = useState(false);

  const handleBooking = async () => {
    if (!user || !userData) {
      Alert.alert('Error', 'You must be signed in');
      return;
    }

    if (ride.availableSeats < 1) {
      Alert.alert('Sorry', 'No seats available for this ride');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book this ride for ${ride.price} BHD?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setBooking(true);

            try {
              const result = await bookingService.createBooking(
                ride.id,
                user.uid,
                userData.name,
                userData.phone
              );

              setBooking(false);

              if (result.success) {
                Alert.alert(
                  'Success!',
                  'Ride booked successfully! The driver will be notified.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('RiderMain'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to book ride');
              }
            } catch (error) {
              setBooking(false);
              Alert.alert('Error', 'An unexpected error occurred');
              console.error('Booking error:', error);
            }
          },
        },
      ]
    );
  };

  const handleCallDriver = () => {
    if (ride.driverPhone) {
      Linking.openURL(`tel:${ride.driverPhone}`);
    } else {
      Alert.alert('Error', 'Driver phone number not available');
    }
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${ride.pickupLat},${ride.pickupLng}&destination=${ride.dropoffLat},${ride.dropoffLng}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: ride.pickupLat,
              longitude: ride.pickupLng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Pickup Marker */}
            <Marker
              coordinate={{
                latitude: ride.pickupLat,
                longitude: ride.pickupLng,
              }}
              title="Pickup"
              description={ride.from}
              pinColor="green"
            />

            {/* Dropoff Marker */}
            <Marker
              coordinate={{
                latitude: ride.dropoffLat,
                longitude: ride.dropoffLng,
              }}
              title="Dropoff"
              description={ride.to}
              pinColor="red"
            />
          </MapView>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Text style={styles.directionsButtonText}>🗺️ Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Driver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>
                {ride.driverName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ride.driverName}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {ride.driverRating || 5.0}</Text>
              </View>
            </View>
            {ride.driverPhone && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDriver}
              >
                <Text style={styles.callButtonText}>📞</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Route Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeIconContainer}>
                <Text style={styles.routeIcon}>📍</Text>
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeLocation}>{ride.from}</Text>
              </View>
            </View>

            <View style={styles.routeDivider} />

            <View style={styles.routeRow}>
              <View style={styles.routeIconContainer}>
                <Text style={styles.routeIcon}>🎯</Text>
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Dropoff</Text>
                <Text style={styles.routeLocation}>{ride.to}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Schedule & Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{ride.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{ride.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💺</Text>
              <Text style={styles.detailLabel}>Available Seats</Text>
              <Text style={styles.detailValue}>
                {ride.availableSeats} / {ride.totalSeats}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💵</Text>
              <Text style={styles.detailLabel}>Price per Seat</Text>
              <Text style={styles.detailValue}>{ride.price} BHD</Text>
            </View>
          </View>
        </View>

        {/* Additional Notes */}
        {ride.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{ride.notes}</Text>
            </View>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>{ride.price} BHD</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (booking || ride.availableSeats < 1) && styles.bookButtonDisabled,
          ]}
          onPress={handleBooking}
          disabled={booking || ride.availableSeats < 1}
        >
          {booking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.bookButtonText}>
              {ride.availableSeats < 1 ? 'FULLY BOOKED' : 'BOOK RIDE'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  backButton: {
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
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#3A85BD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeIcon: {
    fontSize: 20,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  routeLocation: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  routeDivider: {
    height: 30,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginLeft: 19,
    marginVertical: 8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7F7CAF',
  },
  bookButton: {
    backgroundColor: '#7F7CAF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});