import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RiderMainScreen({ navigation }: any) {
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  
  // Location selection states
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [currentLocationCoords, setCurrentLocationCoords] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  
  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [tempMarkerLocation, setTempMarkerLocation] = useState<any>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please enable location in settings.');
        setLoading(false);
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        // Use default Bahrain location
        const defaultLocation = {
          latitude: 26.0667,
          longitude: 50.5577,
        };
        setLocation(defaultLocation);
        setMapRegion({
          latitude: 26.0667,
          longitude: 50.5577,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);
      setMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg('Failed to get your location. Using default location.');
      setLoading(false);
      
      // Set default location (Bahrain center)
      const defaultLocation = {
        latitude: 26.0667,
        longitude: 50.5577,
      };
      setLocation(defaultLocation);
      setMapRegion({
        latitude: 26.0667,
        longitude: 50.5577,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleRetryLocation = () => {
    setLoading(true);
    setErrorMsg(null);
    requestLocationPermission();
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setTempMarkerLocation(coordinate);
  };

  const handleSelectCurrentLocation = () => {
    setShowLocationModal(true);
    setTempMarkerLocation(location);
  };

  const handleSelectDestination = () => {
    setShowDestinationModal(true);
    setTempMarkerLocation(location);
  };

  const confirmCurrentLocation = async () => {
    if (tempMarkerLocation) {
      setCurrentLocationCoords(tempMarkerLocation);
      
      // Get address from coordinates
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: tempMarkerLocation.latitude,
          longitude: tempMarkerLocation.longitude,
        });

        if (result.length > 0) {
          const addr = result[0];
          const parts = [];
          if (addr.street) parts.push(addr.street);
          if (addr.city) parts.push(addr.city);
          if (addr.region) parts.push(addr.region);
          
          const addressString = parts.length > 0 
            ? parts.join(', ') 
            : `${tempMarkerLocation.latitude.toFixed(4)}, ${tempMarkerLocation.longitude.toFixed(4)}`;
          
          setCurrentLocation(addressString);
        } else {
          setCurrentLocation(`${tempMarkerLocation.latitude.toFixed(4)}, ${tempMarkerLocation.longitude.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Error getting address:', error);
        setCurrentLocation(`${tempMarkerLocation.latitude.toFixed(4)}, ${tempMarkerLocation.longitude.toFixed(4)}`);
      }
    }
    setShowLocationModal(false);
    setTempMarkerLocation(null);
  };

  const confirmDestination = async () => {
    if (tempMarkerLocation) {
      setDestinationCoords(tempMarkerLocation);
      
      // Get address from coordinates
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: tempMarkerLocation.latitude,
          longitude: tempMarkerLocation.longitude,
        });

        if (result.length > 0) {
          const addr = result[0];
          const parts = [];
          if (addr.street) parts.push(addr.street);
          if (addr.city) parts.push(addr.city);
          if (addr.region) parts.push(addr.region);
          
          const addressString = parts.length > 0 
            ? parts.join(', ') 
            : `${tempMarkerLocation.latitude.toFixed(4)}, ${tempMarkerLocation.longitude.toFixed(4)}`;
          
          setDestination(addressString);
        } else {
          setDestination(`${tempMarkerLocation.latitude.toFixed(4)}, ${tempMarkerLocation.longitude.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Error getting address:', error);
        setDestination(`${tempMarkerLocation.latitude.toFixed(4)}, ${tempMarkerLocation.longitude.toFixed(4)}`);
      }
    }
    setShowDestinationModal(false);
    setTempMarkerLocation(null);
  };

  const handleSearchDrivers = () => {
    if (!currentLocation || !destination) {
      Alert.alert('Missing Information', 'Please select both pickup and destination locations');
      return;
    }
    navigation.navigate('SearchDrivers');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#7F7CAF', '#9FB4C7']} style={styles.header}>
        <Text style={styles.headerTitle}>Find a Ride</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#7F7CAF" />
              <Text style={styles.mapSubtext}>Loading map...</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>🗺️</Text>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetryLocation}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : location && mapRegion ? (
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              loadingEnabled={true}
            >
              {/* User's current location */}
              <Marker
                coordinate={location}
                title="Your Location"
                description="You are here"
                pinColor="blue"
              />
              
              {/* Selected pickup location */}
              {currentLocationCoords && (
                <Marker
                  coordinate={currentLocationCoords}
                  title="Pickup Location"
                  description={currentLocation}
                  pinColor="green"
                />
              )}
              
              {/* Selected destination */}
              {destinationCoords && (
                <Marker
                  coordinate={destinationCoords}
                  title="Destination"
                  description={destination}
                  pinColor="red"
                />
              )}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>🗺️</Text>
              <Text style={styles.mapSubtext}>Unable to load map</Text>
            </View>
          )}
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.sectionTitle}>Where to?</Text>

          <TouchableOpacity 
            style={styles.inputButton}
            onPress={handleSelectCurrentLocation}
          >
            <Text style={styles.inputIcon}>📍</Text>
            <Text style={[
              styles.inputPlaceholder,
              currentLocation && styles.inputFilled
            ]}>
              {currentLocation || 'Current Location'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputButton}
            onPress={handleSelectDestination}
          >
            <Text style={styles.inputIcon}>🎯</Text>
            <Text style={[
              styles.inputPlaceholder,
              destination && styles.inputFilled
            ]}>
              {destination || 'Where are you going?'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.searchButton,
              (!currentLocation || !destination) && styles.searchButtonDisabled
            ]}
            onPress={handleSearchDrivers}
            disabled={!currentLocation || !destination}
          >
            <Text style={styles.searchButtonText}>SEARCH DRIVERS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Rides')}
            >
              <Text style={styles.actionIcon}>🚗</Text>
              <Text style={styles.actionText}>My Rides</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Rewards')}
            >
              <Text style={styles.actionIcon}>🎁</Text>
              <Text style={styles.actionText}>Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Safety')}
            >
              <Text style={styles.actionIcon}>🛡️</Text>
              <Text style={styles.actionText}>Safety</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Pickup Location</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.modalMap}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
          >
            {tempMarkerLocation && (
              <Marker
                coordinate={tempMarkerLocation}
                title="Pickup Location"
                pinColor="green"
              />
            )}
          </MapView>

          <View style={styles.modalFooter}>
            <Text style={styles.modalInstruction}>Tap on the map to select your pickup location</Text>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !tempMarkerLocation && styles.confirmButtonDisabled
              ]}
              onPress={confirmCurrentLocation}
              disabled={!tempMarkerLocation}
            >
              <Text style={styles.confirmButtonText}>CONFIRM LOCATION</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Destination Selection Modal */}
      <Modal
        visible={showDestinationModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Destination</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDestinationModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.modalMap}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
          >
            {tempMarkerLocation && (
              <Marker
                coordinate={tempMarkerLocation}
                title="Destination"
                pinColor="red"
              />
            )}
          </MapView>

          <View style={styles.modalFooter}>
            <Text style={styles.modalInstruction}>Tap on the map to select your destination</Text>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !tempMarkerLocation && styles.confirmButtonDisabled
              ]}
              onPress={confirmDestination}
              disabled={!tempMarkerLocation}
            >
              <Text style={styles.confirmButtonText}>CONFIRM DESTINATION</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Rides')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Rides</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
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
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#E5E7EB',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#7F7CAF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  inputFilled: {
    color: '#1F2937',
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#7F7CAF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    padding: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
  },
  navTextActive: {
    fontSize: 12,
    color: '#7F7CAF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#6B7280',
  },
  modalMap: {
    flex: 1,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalInstruction: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#7F7CAF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});