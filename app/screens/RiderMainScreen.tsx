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

// Bahrain center coordinates
const BAHRAIN_CENTER = {
  latitude: 26.0667,
  longitude: 50.5577,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

// Common Bahrain locations
const BAHRAIN_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  'aubh': { lat: 26.0667, lng: 50.5577 },
  'american university': { lat: 26.0667, lng: 50.5577 },
  'sakhir': { lat: 26.1833, lng: 50.5500 },
  'muharraq': { lat: 26.2575, lng: 50.6119 },
  'manama': { lat: 26.2285, lng: 50.5860 },
  'riffa': { lat: 26.1299, lng: 50.5550 },
  'isa town': { lat: 26.1736, lng: 50.5478 },
  'hamad town': { lat: 26.1147, lng: 50.5028 },
  'city centre': { lat: 26.2285, lng: 50.5860 },
  'seef': { lat: 26.2361, lng: 50.5339 },
  'bahrain mall': { lat: 26.2167, lng: 50.5861 },
  'airport': { lat: 26.2708, lng: 50.6336 },
  'amwaj': { lat: 26.2857, lng: 50.6595 },
  'budaiya': { lat: 26.1500, lng: 50.4667 },
  'juffair': { lat: 26.2236, lng: 50.6086 },
  'adliya': { lat: 26.2167, lng: 50.5833 },
};

export default function RiderMainScreen({ navigation }: any) {
  const [location, setLocation] = useState<any>(BAHRAIN_CENTER);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(BAHRAIN_CENTER);
  
  // Location selection states
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [currentLocationCoords, setCurrentLocationCoords] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  
  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [tempMarkerLocation, setTempMarkerLocation] = useState<any>(null);
  
  // Manual input states
  const [manualLocationInput, setManualLocationInput] = useState<string>('');
  const [manualDestinationInput, setManualDestinationInput] = useState<string>('');
  const [searchingAddress, setSearchingAddress] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        // Check if location is in Bahrain (rough bounds)
        if (coords.latitude >= 25.5 && coords.latitude <= 26.5 &&
            coords.longitude >= 50.0 && coords.longitude <= 51.0) {
          setLocation(coords);
          setMapRegion({
            ...coords,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        } else {
          // Outside Bahrain, use default
          setLocation(BAHRAIN_CENTER);
          setMapRegion(BAHRAIN_CENTER);
        }
      } else {
        setLocation(BAHRAIN_CENTER);
        setMapRegion(BAHRAIN_CENTER);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      setLocation(BAHRAIN_CENTER);
      setMapRegion(BAHRAIN_CENTER);
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setTempMarkerLocation(coordinate);
  };

  const handleSelectCurrentLocation = () => {
    setManualLocationInput('');
    setShowLocationModal(true);
    setTempMarkerLocation(location);
  };

  const handleSelectDestination = () => {
    setManualDestinationInput('');
    setShowDestinationModal(true);
    setTempMarkerLocation(location);
  };

  const searchAddressForLocation = async () => {
    if (!manualLocationInput.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setSearchingAddress(true);
    
    // Check if it's a known location
    const normalizedInput = manualLocationInput.toLowerCase().trim();
    for (const [key, coords] of Object.entries(BAHRAIN_LOCATIONS)) {
      if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
        setTempMarkerLocation({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        setMapRegion({
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setSearchingAddress(false);
        Alert.alert('Success', 'Location found! You can adjust the marker if needed.');
        return;
      }
    }

    // Try geocoding
    try {
      const results = await Location.geocodeAsync(manualLocationInput + ', Bahrain');
      
      if (results.length > 0) {
        const coords = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
        setTempMarkerLocation(coords);
        setMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        Alert.alert('Success', 'Location found! You can adjust the marker if needed.');
      } else {
        Alert.alert('Not Found', 'Could not find that location. Try: AUBH, Manama, Riffa, etc.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Could not search for that location. Try using the map instead.');
    } finally {
      setSearchingAddress(false);
    }
  };

  const searchAddressForDestination = async () => {
    if (!manualDestinationInput.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setSearchingAddress(true);
    
    // Check if it's a known location
    const normalizedInput = manualDestinationInput.toLowerCase().trim();
    for (const [key, coords] of Object.entries(BAHRAIN_LOCATIONS)) {
      if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
        setTempMarkerLocation({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        setMapRegion({
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setSearchingAddress(false);
        Alert.alert('Success', 'Destination found! You can adjust the marker if needed.');
        return;
      }
    }

    // Try geocoding
    try {
      const results = await Location.geocodeAsync(manualDestinationInput + ', Bahrain');
      
      if (results.length > 0) {
        const coords = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
        setTempMarkerLocation(coords);
        setMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        Alert.alert('Success', 'Destination found! You can adjust the marker if needed.');
      } else {
        Alert.alert('Not Found', 'Could not find that destination. Try: City Centre, Seef, Juffair, etc.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Could not search for that destination. Try using the map instead.');
    } finally {
      setSearchingAddress(false);
    }
  };

  const confirmCurrentLocation = async () => {
    if (!tempMarkerLocation) {
      Alert.alert('Error', 'Please select a location on the map or search for an address');
      return;
    }

    setCurrentLocationCoords(tempMarkerLocation);
    
    if (manualLocationInput.trim()) {
      setCurrentLocation(manualLocationInput);
    } else {
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
    setManualLocationInput('');
  };

  const confirmDestination = async () => {
    if (!tempMarkerLocation) {
      Alert.alert('Error', 'Please select a destination on the map or search for an address');
      return;
    }

    setDestinationCoords(tempMarkerLocation);
    
    if (manualDestinationInput.trim()) {
      setDestination(manualDestinationInput);
    } else {
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
    setManualDestinationInput('');
  };

  // ✅ FIXED: Now properly passes all required parameters
  const handleSearchDrivers = () => {
    // Validate that locations are selected
    if (!currentLocation || !destination) {
      Alert.alert('Missing Information', 'Please select both pickup and destination locations');
      return;
    }

    // Validate that coordinates exist
    if (!currentLocationCoords || !destinationCoords) {
      Alert.alert('Error', 'Could not determine coordinates for your locations. Please try selecting them again.');
      return;
    }

    // Validate coordinates have required properties
    if (!currentLocationCoords.latitude || !currentLocationCoords.longitude ||
        !destinationCoords.latitude || !destinationCoords.longitude) {
      Alert.alert('Error', 'Invalid location coordinates. Please select locations again.');
      return;
    }

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = currentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // ✅ Navigate with ALL required parameters
    navigation.navigate('SearchDrivers', {
      pickup: {
        latitude: currentLocationCoords.latitude,
        longitude: currentLocationCoords.longitude,
      },
      dropoff: {
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude,
      },
      pickupAddress: currentLocation,
      dropoffAddress: destination,
      date: formattedDate,
      time: formattedTime,
    });
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
          ) : (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {currentLocationCoords && (
                <Marker
                  coordinate={currentLocationCoords}
                  title="Pickup Location"
                  description={currentLocation}
                  pinColor="green"
                />
              )}
              
              {destinationCoords && (
                <Marker
                  coordinate={destinationCoords}
                  title="Destination"
                  description={destination}
                  pinColor="red"
                />
              )}
            </MapView>
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
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Select Pickup Location</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowLocationModal(false);
                  setManualLocationInput('');
                  setTempMarkerLocation(null);
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchInputSection}>
            <Text style={styles.searchInputLabel}>Type address or tap on map:</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="e.g., AUBH, Manama, Riffa"
                placeholderTextColor="#9CA3AF"
                value={manualLocationInput}
                onChangeText={setManualLocationInput}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={styles.searchButton2}
                onPress={searchAddressForLocation}
                disabled={searchingAddress}
              >
                {searchingAddress ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchButtonIcon}>🔍</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
            
          <View style={styles.mapSection}>
            <MapView
              style={styles.fullMap}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
            >
              {tempMarkerLocation && (
                <Marker
                  coordinate={tempMarkerLocation}
                  title="Pickup Location"
                  pinColor="green"
                  draggable
                  onDragEnd={(e) => setTempMarkerLocation(e.nativeEvent.coordinate)}
                />
              )}
            </MapView>
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.modalInstruction}>
              {tempMarkerLocation 
                ? 'Perfect! Tap confirm or drag the marker to adjust'
                : 'Tap on the map or type an address above'}
            </Text>
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
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Select Destination</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowDestinationModal(false);
                  setManualDestinationInput('');
                  setTempMarkerLocation(null);
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchInputSection}>
            <Text style={styles.searchInputLabel}>Type address or tap on map:</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="e.g., City Centre, Seef, Juffair"
                placeholderTextColor="#9CA3AF"
                value={manualDestinationInput}
                onChangeText={setManualDestinationInput}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={styles.searchButton2}
                onPress={searchAddressForDestination}
                disabled={searchingAddress}
              >
                {searchingAddress ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchButtonIcon}>🔍</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
            
          <View style={styles.mapSection}>
            <MapView
              style={styles.fullMap}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
            >
              {tempMarkerLocation && (
                <Marker
                  coordinate={tempMarkerLocation}
                  title="Destination"
                  pinColor="red"
                  draggable
                  onDragEnd={(e) => setTempMarkerLocation(e.nativeEvent.coordinate)}
                />
              )}
            </MapView>
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.modalInstruction}>
              {tempMarkerLocation 
                ? 'Perfect! Tap confirm or drag the marker to adjust'
                : 'Tap on the map or type an address above'}
            </Text>
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
  mapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  searchInputSection: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    marginRight: 8,
  },
  searchButton2: {
    backgroundColor: '#7F7CAF',
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonIcon: {
    fontSize: 18,
  },
  mapSection: {
    flex: 1,
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
  modalFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalInstruction: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: '#7F7CAF',
    paddingVertical: 14,
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
    letterSpacing: 0.5,
  },
});