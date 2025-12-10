import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { rideService, Ride } from '../../src/services/ride.service';
import { useToast } from '../../src/context/ToastContext';

export default function SearchDriversScreen({ navigation }: any) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRides = async () => {
    try {
      const result = await rideService.getAvailableRides();

      if (result.success && result.rides) {
        setRides(result.rides);
        if (result.rides.length === 0) {
          showToast('No rides available at the moment', 'info', 2000);
        }
      } else {
        showToast(result.error || 'Failed to load rides', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
      console.error('Load rides error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const handleRidePress = (ride: Ride) => {
    navigation.navigate('DriverDetails', { ride });
  };

  const renderRide = ({ item }: { item: Ride }) => {
    // Get driver's initials for avatar
    const initials = item.driverName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    return (
      <TouchableOpacity
        style={styles.driverCard}
        onPress={() => handleRidePress(item)}
      >
        <View style={styles.driverAvatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.driverName}</Text>
          <Text style={styles.route}>
            {item.from} → {item.to}
          </Text>
          <Text style={styles.schedule}>
            {item.date} at {item.time}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {item.driverRating || 5.0}</Text>
          </View>
        </View>

        <View style={styles.driverMeta}>
          <Text style={styles.price}>{item.price} BHD</Text>
          <Text style={styles.seats}>
            {item.availableSeats} {item.availableSeats === 1 ? 'seat' : 'seats'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7F7CAF" />
        <Text style={styles.loadingText}>Loading rides...</Text>
      </View>
    );
  } 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={rides} // ✅ CHANGED FROM DUMMY_DRIVERS
        renderItem={renderRide} // ✅ CHANGED FROM renderDriver
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.list}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No rides available</Text>
            <Text style={styles.emptySubtext}>
              Check back later or post your own ride!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: { // ✅ ADDED MISSING STYLE
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { // ✅ ADDED
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
  list: {
    padding: 16,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  route: { 
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  schedule: { 
    fontSize: 13,
    color: '#6B7280',
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
    marginRight: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  driverMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7F7CAF',
    marginBottom: 4,
  },
  seats: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: { 
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: { 
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});