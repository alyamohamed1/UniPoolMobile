import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../src/context/AuthContext';
import { rideService, Ride } from '../../src/services/ride.service';

const { width } = Dimensions.get('window');

// Bahrain center coordinates
const BAHRAIN_CENTER = {
  latitude: 26.0667,
  longitude: 50.5577,
  latitudeDelta: 0.4,
  longitudeDelta: 0.4,
};

export default function DriverMainScreen({ navigation }: any) {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(BAHRAIN_CENTER);

  useEffect(() => {
    loadActiveRides();
  }, [user]);

  useEffect(() => {
    // Adjust map region to show all active rides, or show Bahrain if none
    if (activeRides.length > 0) {
      const lats = activeRides.flatMap(r => [r.pickupLat, r.dropoffLat]);
      const lngs = activeRides.flatMap(r => [r.pickupLng, r.dropoffLng]);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = Math.max((maxLat - minLat) * 1.5, 0.1);
      const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.1);
      
      setMapRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
    } else {
      // No active rides, show full Bahrain view
      setMapRegion(BAHRAIN_CENTER);
    }
  }, [activeRides]);

  const loadActiveRides = async () => {
    if (!user) return;
    
    try {
      const result = await rideService.getDriverRides(user.uid);
      
      if (result.success && result.rides) {
        const active = result.rides.filter(
          r => r.status === 'active' && r.availableSeats >= 0
        );
        setActiveRides(active);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A85BD', '#9FB798']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Availability</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#E5E7EB', true: '#3A85BD' }}
              thumbColor={isAvailable ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
          <Text style={styles.statusText}>
            {isAvailable ? '🟢 You are available for rides' : '🔴 You are offline'}
          </Text>
        </View>

        {/* MAP VIEW - Clean style with hide/show toggle */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>
              {activeRides.length > 0 ? 'Active Routes' : 'Map View'}
            </Text>
            <TouchableOpacity onPress={() => setShowMap(!showMap)}>
              <Text style={styles.toggleMapText}>
                {showMap ? 'Hide Map' : 'Show Map'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showMap && (
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {activeRides.map((ride) => (
                  <React.Fragment key={ride.id}>
                    <Marker
                      coordinate={{
                        latitude: ride.pickupLat,
                        longitude: ride.pickupLng,
                      }}
                      title="Pickup"
                      description={ride.from}
                      pinColor="#10B981"
                    />
                    <Marker
                      coordinate={{
                        latitude: ride.dropoffLat,
                        longitude: ride.dropoffLng,
                      }}
                      title="Drop-off"
                      description={ride.to}
                      pinColor="#EF4444"
                    />
                    <Polyline
                      coordinates={[
                        {
                          latitude: ride.pickupLat,
                          longitude: ride.pickupLng,
                        },
                        {
                          latitude: ride.dropoffLat,
                          longitude: ride.dropoffLng,
                        },
                      ]}
                      strokeColor="#3A85BD"
                      strokeWidth={3}
                    />
                  </React.Fragment>
                ))}
              </MapView>
            </View>
          )}
        </View>

        {/* POST RIDE BUTTON */}
        <TouchableOpacity 
          style={styles.postRideButton}
          onPress={() => navigation.navigate('PostRide')}
        >
          <LinearGradient
            colors={['#3A85BD', '#9FB798']}
            style={styles.postRideGradient}
          >
            <Text style={styles.postRideIcon}>➕</Text>
            <View style={styles.postRideContent}>
              <Text style={styles.postRideTitle}>Post a New Ride</Text>
              <Text style={styles.postRideSubtitle}>Set your route on the map</Text>
            </View>
            <Text style={styles.postRideArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ACTIVE RIDES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Rides</Text>
          
          {activeRides.length > 0 ? (
            activeRides.map((ride) => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={styles.rideHeader}>
                  <Text style={styles.rideDate}>{ride.date}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText2}>Active</Text>
                  </View>
                </View>
                
                <View style={styles.routeContainer}>
                  <View style={styles.routeItem}>
                    <Text style={styles.routeIcon}>📍</Text>
                    <Text style={styles.routeText}>{ride.from}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routeItem}>
                    <Text style={styles.routeIcon}>🎯</Text>
                    <Text style={styles.routeText}>{ride.to}</Text>
                  </View>
                </View>

                <View style={styles.rideFooter}>
                  <View style={styles.rideInfo}>
                    <Text style={styles.rideInfoText}>🕐 {ride.time}</Text>
                    <Text style={styles.rideInfoText}>
                      💺 {ride.availableSeats}/{ride.totalSeats} seats
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewRequestsButton}
                    onPress={() => navigation.navigate('DriverRequests')}
                  >
                    <Text style={styles.viewRequestsText}>View Bookings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyText}>No active rides</Text>
              <Text style={styles.emptySubtext}>Post a ride to start receiving requests</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{activeRides.length}</Text>
              <Text style={styles.statLabel}>Active Rides</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {activeRides.reduce((sum, r) => sum + (r.totalSeats - r.availableSeats), 0)}
              </Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {activeRides.reduce((sum, r) => sum + r.price * (r.totalSeats - r.availableSeats), 0)} BD
              </Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5.0⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Rides')}
          >
            <Text style={styles.actionIcon}>🚗</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Rides</Text>
              <Text style={styles.actionSubtitle}>View ride history</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Rewards')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Earnings</Text>
              <Text style={styles.actionSubtitle}>View your earnings</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Ratings')}
          >
            <Text style={styles.actionIcon}>⭐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ratings & Reviews</Text>
              <Text style={styles.actionSubtitle}>See what riders say</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('DriverRequests')}
        >
          <Text style={styles.navIcon}>📨</Text>
          <Text style={styles.navText}>Bookings</Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusText2: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  mapSection: {
    margin: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  toggleMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A85BD',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  postRideButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  postRideGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  postRideIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  postRideContent: {
    flex: 1,
  },
  postRideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  postRideSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  postRideArrow: {
    fontSize: 24,
    color: '#FFFFFF',
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
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
    marginBottom: 8,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rideInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  rideInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewRequestsButton: {
    backgroundColor: '#3A85BD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  viewRequestsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A85BD',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionArrow: {
    fontSize: 24,
    color: '#9CA3AF',
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
    color: '#3A85BD',
    fontWeight: '600',
  },
});