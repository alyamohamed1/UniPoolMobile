import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { bookingService, Booking } from '../../src/services/booking.service';
import { useToast } from '../../src/context/ToastContext';

export default function DriverRequestsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('pending');

  const loadBookings = async () => {
    if (!user) return;

    try {
      const result = await bookingService.getDriverBookings(user.uid);

      if (result.success && result.bookings) {
        setBookings(result.bookings);
      } else {
        showToast(result.error || 'Failed to load bookings', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleConfirmBooking = async (bookingId: string) => {
    Alert.alert(
      'Confirm Booking',
      'Accept this ride request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              if (!user) return;
              
              setProcessingId(bookingId);
              const result = await bookingService.confirmBooking(bookingId, user.uid);

              if (result.success) {
                showToast('Booking confirmed successfully!', 'success');
                loadBookings();
              } else {
                showToast(result.error || 'Failed to confirm booking', 'error');
              }
            } catch (error) {
              showToast('An unexpected error occurred', 'error');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectBooking = async (bookingId: string) => {
    Alert.alert(
      'Reject Booking',
      'Are you sure you want to reject this request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;
              
              setProcessingId(bookingId);
              const result = await bookingService.rejectBooking(bookingId, user.uid);

              if (result.success) {
                showToast('Booking rejected', 'info');
                loadBookings();
              } else {
                showToast(result.error || 'Failed to reject booking', 'error');
              }
            } catch (error) {
              showToast('An unexpected error occurred', 'error');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Confirmed Booking',
      'This will cancel the confirmed booking and restore the seats. Continue?',
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
                showToast('Booking cancelled successfully', 'success');
                loadBookings();
              } else {
                showToast(result.error || 'Failed to cancel booking', 'error');
              }
            } catch (error) {
              showToast('An unexpected error occurred', 'error');
            }
          },
        },
      ]
    );
  };

  const handleCompleteBooking = async (bookingId: string) => {
    if (!user) return;

    Alert.alert(
      'Mark as Completed',
      'Has this ride been completed? Both you and the rider will be able to leave ratings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            setProcessingId(bookingId);
            try {
              const result = await bookingService.completeBooking(bookingId, user.uid);

              if (result.success) {
                showToast('Ride marked as completed!', 'success');
                loadBookings();
              } else {
                showToast(result.error || 'Failed to complete booking', 'error');
              }
            } catch (error) {
              showToast('An unexpected error occurred', 'error');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FEF3C7';
      case 'confirmed':
        return '#D1FAE5';
      case 'rejected':
        return '#FEE2E2';
      case 'cancelled':
        return '#F3F4F6';
      default:
        return '#F9FAFB';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.riderInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.riderName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.riderDetails}>
              <Text style={styles.riderName}>{item.riderName}</Text>
              {item.riderPhone && (
                <Text style={styles.phoneText}>📞 {item.riderPhone}</Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>📍</Text>
            <View>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeText}>{item.from}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <Text style={styles.routeIcon}>🎯</Text>
            <View>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeText}>{item.to}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{item.date} • {item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💺</Text>
            <Text style={styles.detailText}>{item.seatsRequested} seat(s)</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💵</Text>
            <Text style={styles.detailText}>{item.price} BHD</Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleRejectBooking(item.id!)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.rejectText}>Reject</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleConfirmBooking(item.id!)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'confirmed' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelConfirmedButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleCancelBooking(item.id!)}
              disabled={isProcessing}
            >
              <Text style={styles.cancelConfirmedText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.completeButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleCompleteBooking(item.id!)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.completeText}>Complete Ride</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'rejected' && (
          <View style={styles.rejectedNote}>
            <Text style={styles.rejectedText}>You rejected this request</Text>
          </View>
        )}
      </View>
    );
  };

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'confirmed') return booking.status === 'confirmed';
    return true; // 'all'
  });

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#7F7CAF" />
        <Text style={styles.emptySubtext}>Loading bookings...</Text>
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
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'confirmed' && styles.filterTabActive]}
          onPress={() => setFilter('confirmed')}
        >
          <Text style={[styles.filterText, filter === 'confirmed' && styles.filterTextActive]}>
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({bookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id!}
        renderItem={renderBooking}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {filter === 'pending' ? 'No pending requests' :
               filter === 'confirmed' ? 'No confirmed bookings' :
               'No bookings yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'pending' 
                ? 'New booking requests will appear here'
                : 'When riders book your rides, they\'ll appear here'}
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
    color: '#3A85BD',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3A85BD',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3A85BD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 13,
    color: '#6B7280',
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
  routeContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  routeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelConfirmedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  cancelConfirmedText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rejectedNote: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  rejectedText: {
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
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
  },
});