import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { bookingService, Booking } from '../../src/services/booking.service';
import { rideService, Ride } from '../../src/services/ride.service';

export default function RidesScreen({ navigation }: any) {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Determine if user is a driver or rider
  const isDriver = userData?.role === 'driver';

  const loadData = async () => {
    if (!user) return;

    try {
      if (isDriver) {
        // Load driver's posted rides
        const result = await rideService.getDriverRides(user.uid);
        if (result.success && result.rides) {
          setRides(result.rides);
        }
      } else {
        // Load rider's bookings
        const result = await bookingService.getRiderBookings(user.uid);
        if (result.success && result.bookings) {
          setBookings(result.bookings);
        } else {
          Alert.alert('Error', result.error || 'Failed to load rides');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Load rides error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, userData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCancelRide = (bookingId: string) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;

              const result = await bookingService.cancelBooking(bookingId, user.uid);

              if (result.success) {
                Alert.alert('Success', 'Ride cancelled successfully');
                loadData(); // Refresh list
              } else {
                Alert.alert('Error', result.error || 'Failed to cancel ride');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRide = (rideId: string) => {
    Alert.alert(
      'Delete Ride',
      'Are you sure you want to delete this ride? All bookings will be cancelled.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;

              const result = await rideService.deleteRide(rideId, user.uid);

              if (result.success) {
                Alert.alert('Success', 'Ride deleted successfully');
                loadData();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete ride');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  // Render for RIDER (bookings)
  const renderRiderRide = ({ item }: { item: Booking }) => {
    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideName}>🚗 {item.driverName}</Text>
          <Text style={styles.ridePrice}>{item.price} BHD</Text>
        </View>
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          item.status === 'pending' && styles.pendingBadge,
          item.status === 'confirmed' && styles.confirmedBadge,
          item.status === 'rejected' && styles.rejectedBadge,
          item.status === 'cancelled' && styles.cancelledBadge,
          item.status === 'completed' && styles.completedBadge,
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'pending' && '⏳ PENDING APPROVAL'}
            {item.status === 'confirmed' && '✅ CONFIRMED'}
            {item.status === 'rejected' && '❌ REJECTED'}
            {item.status === 'cancelled' && '🚫 CANCELLED'}
            {item.status === 'completed' && '✓ COMPLETED'}
          </Text>
        </View>
        
        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>📍</Text>
            <Text style={styles.routeText}>{item.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>🎯</Text>
            <Text style={styles.routeText}>{item.to}</Text>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <View>
            <Text style={styles.rideDate}>{item.date} • {item.time}</Text>
            <Text style={styles.seatsInfo}>💺 {item.seatsRequested} seat(s)</Text>
          </View>
          
          {item.status === 'pending' && (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>Waiting for driver</Text>
            </View>
          )}
          
          {item.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelRide(item.id!)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {item.status === 'completed' && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => navigation.navigate('Rating', { bookingId: item.id })}
            >
              <Text style={styles.rateButtonText}>Rate</Text>
            </TouchableOpacity>
          )}

          {item.status === 'rejected' && (
            <View style={styles.rejectedInfo}>
              <Text style={styles.rejectedInfoText}>Request was declined</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render for DRIVER (posted rides)
  const renderDriverRide = ({ item }: { item: Ride }) => {
    const isActive = item.status === 'active';
    const isPast = item.status === 'completed' || item.status === 'cancelled';

    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideName}>
            {item.status === 'active' ? '🟢 Active' : 
             item.status === 'completed' ? '✅ Completed' : 
             '❌ Cancelled'}
          </Text>
          <Text style={styles.ridePrice}>{item.price} BHD/seat</Text>
        </View>
        
        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>📍</Text>
            <Text style={styles.routeText}>{item.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>🎯</Text>
            <Text style={styles.routeText}>{item.to}</Text>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <View style={styles.rideDetails}>
            <Text style={styles.rideDate}>{item.date} • {item.time}</Text>
            <Text style={styles.seatsInfo}>
              💺 {item.availableSeats}/{item.totalSeats} seats available
            </Text>
          </View>
          
          {item.status === 'active' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewBookingsButton}
                onPress={() => navigation.navigate('DriverRequests')}
              >
                <Text style={styles.viewBookingsText}>Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRide(item.id!)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Filter data based on active tab and user role
  const getFilteredData = () => {
    if (isDriver) {
      // Filter driver's rides
      if (activeTab === 'upcoming') {
        return rides.filter(r => r.status === 'active');
      } else {
        return rides.filter(r => r.status === 'completed' || r.status === 'cancelled');
      }
    } else {
      // Filter rider's bookings
      if (activeTab === 'upcoming') {
        // Show both pending (waiting approval) and confirmed (approved) bookings
        return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
      } else {
        // Show completed, cancelled, and rejected bookings
        return bookings.filter(b => 
          b.status === 'completed' || 
          b.status === 'cancelled' || 
          b.status === 'rejected'
        );
      }
    }
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7F7CAF" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
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
        <Text style={styles.headerTitle}>My Rides</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            {isDriver ? 'Active' : 'Upcoming'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past Rides
          </Text>
        </TouchableOpacity>
      </View>

      {isDriver ? (
        // Driver view - show posted rides
        <FlatList
          data={filteredData as Ride[]}
          renderItem={renderDriverRide}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming' ? 'No active rides' : 'No past rides yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'upcoming' 
                  ? 'Post a ride to start earning!' 
                  : 'Your ride history will appear here'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => navigation.navigate('PostRide')}
                >
                  <Text style={styles.searchButtonText}>Post a Ride</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      ) : (
        // Rider view - show bookings
        <FlatList
          data={filteredData as Booking[]}
          renderItem={renderRiderRide}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming' ? 'No upcoming rides' : 'No past rides yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'upcoming' 
                  ? 'Book a ride to get started!' 
                  : 'Your ride history will appear here'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => navigation.navigate('SearchDrivers')}
                >
                  <Text style={styles.searchButtonText}>Search Rides</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#7F7CAF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rideName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7F7CAF',
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
  },
  rideDetails: {
    flex: 1,
  },
  rideDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBookingsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#7F7CAF',
    borderRadius: 16,
  },
  viewBookingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EF4444',
    borderRadius: 16,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rateButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#7F7CAF',
    borderRadius: 16,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 16,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelledBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  cancelledText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: '#7F7CAF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Status Badge Styles
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  confirmedBadge: {
    backgroundColor: '#D1FAE5',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  completedBadge: {
    backgroundColor: '#E0E7FF',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  waitingBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  waitingText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },
  rejectedInfo: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  rejectedInfoText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '600',
  },
  seatsInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});