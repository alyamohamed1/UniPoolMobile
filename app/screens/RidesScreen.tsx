import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { bookingService, Booking } from '../../src/services/booking.service';
import { useToast } from '../../src/context/ToastContext';

type TabType = 'upcoming' | 'past';

export default function RidesScreen({ navigation }: any) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('past');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await bookingService.getRiderBookings(user.uid);

      if (result.success && result.bookings) {
        setBookings(result.bookings);
      } else {
        showToast(result.error || 'Failed to load bookings', 'error');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getFilteredBookings = () => {
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      // Show pending and confirmed bookings
      return bookings.filter(b => 
        b.status === 'pending' || b.status === 'confirmed'
      );
    } else {
      // Show completed and cancelled bookings
      return bookings.filter(b => 
        b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected'
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#10B981';
      case 'completed':
        return '#6366F1';
      case 'cancelled':
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FEF3C7';
      case 'confirmed':
        return '#D1FAE5';
      case 'completed':
        return '#E0E7FF';
      case 'cancelled':
      case 'rejected':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'confirmed':
        return 'CONFIRMED';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      case 'rejected':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  const renderRideCard = ({ item }: { item: Booking }) => {
    // For now, always show rate button for completed rides
    // The ratings collection will prevent duplicate ratings
    const canRate = item.status === 'completed';

    return (
      <View style={styles.rideCard}>
        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>
              {item.driverName?.charAt(0).toUpperCase() || '🚗'}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{item.driverName || 'Driver'}</Text>
            <Text style={styles.priceText}>{item.price} BHD</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              ✓ {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={styles.routeDot} />
            <Text style={styles.routeText}>{item.from}</Text>
          </View>
          
          <View style={styles.routeLine} />
          
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <Text style={styles.routeText}>{item.to}</Text>
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            {item.date} • {item.time}
          </Text>
          <Text style={styles.detailText}>
            💺 {item.seatsRequested} seat(s)
          </Text>
        </View>

        {/* Rate Button - Only show for completed rides that haven't been rated */}
        {canRate && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => navigation.navigate('RateDriver', { 
              bookingId: item.id,
            })}
          >
            <Text style={styles.rateButtonText}>⭐ Rate Driver</Text>
          </TouchableOpacity>
        )}

        {/* Show if already rated */}
        {item.status === 'completed' && item.ratedAt && (
          <View style={styles.ratedBadge}>
            <Text style={styles.ratedText}>✓ Rated</Text>
          </View>
        )}
      </View>
    );
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F7CAF" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      </SafeAreaView>
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past Rides
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderRideCard}
        keyExtractor={(item, index) => item.id || `booking-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7F7CAF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' 
                ? 'You have no upcoming rides scheduled'
                : 'Your past rides will appear here'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#7F7CAF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#7F7CAF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  routeSection: {
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  routeDotEnd: {
    backgroundColor: '#EF4444',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  rateButton: {
    backgroundColor: '#7F7CAF',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  ratedBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  ratedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});