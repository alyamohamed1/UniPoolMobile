import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../src/context/AuthContext';
import { bookingService } from '../../src/services/booking.service';
import { useToast } from '../../src/context/ToastContext';

export default function DriverDetailsScreen({ route, navigation }: any) {
  const { ride } = route.params;
  const { user, userData } = useAuth();
  const [booking, setBooking] = useState(false);
  const { showToast } = useToast();

  // Bahrain default coordinates (center of Bahrain)
  const BAHRAIN_CENTER = {
    latitude: 26.0667,
    longitude: 50.5577,
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate distance for display with fallback to Bahrain locations
  const distance = calculateDistance(
    ride.pickupLat || BAHRAIN_CENTER.latitude,
    ride.pickupLng || BAHRAIN_CENTER.longitude,
    ride.dropoffLat || 26.2575, // Another Bahrain location
    ride.dropoffLng || 50.6119
  ).toFixed(1);

  // Calculate map region to show both markers with Bahrain fallback
  const getMapRegion = () => {
    // Use ride coordinates with Bahrain fallback if not available
    const pickupLat = ride.pickupLat || BAHRAIN_CENTER.latitude;
    const pickupLng = ride.pickupLng || BAHRAIN_CENTER.longitude;
    const dropoffLat = ride.dropoffLat || 26.2575; // Another Bahrain location
    const dropoffLng = ride.dropoffLng || 50.6119;

    // Calculate center point
    const centerLat = (pickupLat + dropoffLat) / 2;
    const centerLng = (pickupLng + dropoffLng) / 2;

    // Calculate deltas with padding
    const latDelta = Math.abs(pickupLat - dropoffLat) * 2.5;
    const lngDelta = Math.abs(pickupLng - dropoffLng) * 2.5;

    // Minimum zoom level
    const minDelta = 0.05;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, minDelta),
      longitudeDelta: Math.max(lngDelta, minDelta),
    };
  };

  // Open navigation in Google Maps ONLY (no Apple Maps)
  const openInMaps = () => {
    // Use ride coordinates with Bahrain fallback
    const pickupLat = ride.pickupLat || BAHRAIN_CENTER.latitude;
    const pickupLng = ride.pickupLng || BAHRAIN_CENTER.longitude;
    const dropoffLat = ride.dropoffLat || 26.2575;
    const dropoffLng = ride.dropoffLng || 50.6119;

    const origin = `${pickupLat},${pickupLng}`;
    const destination = `${dropoffLat},${dropoffLng}`;

    // Google Maps URLs only
    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`,
      android: `google.navigation:q=${destination}&origin=${origin}`,
    });

    // Web fallback for Google Maps
    const webFallback = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    // First try to open Google Maps app
    if (googleMapsUrl) {
      Linking.canOpenURL(googleMapsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(googleMapsUrl);
        } else {
          // If Google Maps app not installed, use web version
          Linking.openURL(webFallback);
        }
      });
    } else {
      Linking.openURL(webFallback);
    }
  };

  const handleBooking = async () => {
    if (!user || !userData) {
      showToast('You must be signed in', 'error');
      return;
    }

    if (ride.availableSeats < 1) {
      showToast('No seats available for this ride', 'warning');
      return;
    }

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
        showToast('Ride booked successfully!', 'success');
        setTimeout(() => navigation.navigate('RiderMain'), 1500);
      } else {
        showToast(result.error || 'Failed to book ride', 'error');
      }
    } catch (error) {
      setBooking(false);
      showToast('An unexpected error occurred', 'error');
      console.error('Booking error:', error);
    }
  };

  const handleCallDriver = () => {
    if (ride.driverPhone) {
      Linking.openURL(`tel:${ride.driverPhone}`);
    } else {
      showToast('Driver phone number not available', 'error');
    }
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
        {/* Map with route and markers */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={getMapRegion()}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Pickup Marker */}
            <Marker
              coordinate={{
                latitude: ride.pickupLat || BAHRAIN_CENTER.latitude,
                longitude: ride.pickupLng || BAHRAIN_CENTER.longitude,
              }}
              title="Pickup"
              description={ride.from}
              pinColor="#4285F4"
            />

            {/* Dropoff Marker */}
            <Marker
              coordinate={{
                latitude: ride.dropoffLat || 26.2575,
                longitude: ride.dropoffLng || 50.6119,
              }}
              title="Dropoff"
              description={ride.to}
              pinColor="#EA4335"
            />

            {/* Route line between markers */}
            <Polyline
              coordinates={[
                {
                  latitude: ride.pickupLat || BAHRAIN_CENTER.latitude,
                  longitude: ride.pickupLng || BAHRAIN_CENTER.longitude,
                },
                {
                  latitude: ride.dropoffLat || 26.2575,
                  longitude: ride.dropoffLng || 50.6119,
                },
              ]}
              strokeColor="#3A85BD"
              strokeWidth={3}
            />
          </MapView>

          {/* Get Directions button overlay - No emoji */}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={openInMaps}
          >
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>

          {/* Distance overlay */}
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distance} km</Text>
          </View>
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
                <Text style={styles.ratingText}>• Verified Driver</Text>
              </View>
              <Text style={styles.phoneText}>📞 {ride.driverPhone || 'Not provided'}</Text>
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

        {/* Route Details with distance */}
        <View style={styles.section}>
          <View style={styles.routeHeader}>
            <Text style={styles.sectionTitle}>Route</Text>
            <Text style={styles.distanceDisplay}>~{distance} km</Text>
          </View>
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

            <View style={styles.routeLine} />

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
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{ride.date}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{ride.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💺</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Available Seats</Text>
                <Text style={styles.detailValue}>
                  {ride.availableSeats} / {ride.totalSeats}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💵</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Price per Seat</Text>
                <Text style={styles.detailValue}>{ride.price} BHD</Text>
              </View>
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
    height: 300,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  distanceBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3A85BD',
  },
  section: {
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  distanceDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A85BD',
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
    marginBottom: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
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
  routeLine: {
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
    width: 30,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
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