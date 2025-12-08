import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DUMMY_REQUESTS = [
  {
    id: '1',
    rider: 'John Smith',
    rating: 4.8,
    totalRides: 24,
    from: 'Campus Building A',
    to: 'Downtown Mall',
    pickupTime: '3:00 PM',
    seats: 1,
    message: 'Hi! I need to get to the mall for shopping. Thanks!',
  },
  {
    id: '2',
    rider: 'Emma Wilson',
    rating: 5.0,
    totalRides: 89,
    from: 'Campus Building A',
    to: 'Downtown Mall',
    pickupTime: '3:00 PM',
    seats: 2,
    message: 'Going with a friend, need 2 seats please.',
  },
  {
    id: '3',
    rider: 'Mike Johnson',
    rating: 4.6,
    totalRides: 15,
    from: 'Campus Building A',
    to: 'Airport Terminal',
    pickupTime: '3:00 PM',
    seats: 1,
    message: 'Can you drop me at the airport? Will tip extra!',
  },
];

export default function DriverRequestsScreen({ navigation }: any) {
  const [requests, setRequests] = useState(DUMMY_REQUESTS);

  const handleAccept = (requestId: string, riderName: string) => {
    Alert.alert(
      'Accept Request',
      `Accept ride request from ${riderName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => {
            setRequests(requests.filter(r => r.id !== requestId));
            Alert.alert('Success', `You accepted ${riderName}'s request. They have been notified.`);
          },
        },
      ]
    );
  };

  const handleDecline = (requestId: string, riderName: string) => {
    Alert.alert(
      'Decline Request',
      `Decline ride request from ${riderName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setRequests(requests.filter(r => r.id !== requestId));
            Alert.alert('Request Declined', `You declined ${riderName}'s request.`);
          },
        },
      ]
    );
  };

  const renderRequest = ({ item }: any) => (
    <View style={styles.requestCard}>
      {/* Rider Info Header */}
      <View style={styles.requestHeader}>
        <View style={styles.riderInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>{item.rider}</Text>
            <View style={styles.riderStats}>
              <Text style={styles.rating}>⭐ {item.rating}</Text>
              <Text style={styles.totalRides}>• {item.totalRides} rides</Text>
            </View>
          </View>
        </View>
        <View style={styles.seatsInfo}>
          <Text style={styles.seatsNumber}>{item.seats}</Text>
          <Text style={styles.seatsLabel}>seat{item.seats > 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Route Info */}
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
            <Text style={styles.routeLabel}>Drop-off</Text>
            <Text style={styles.routeText}>{item.to}</Text>
          </View>
        </View>
      </View>

      {/* Time */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeIcon}>🕐</Text>
        <Text style={styles.timeText}>Requested pickup at {item.pickupTime}</Text>
      </View>

      {/* Message */}
      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={() => handleDecline(item.id, item.rider)}
        >
          <Text style={styles.declineText}>✕ Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAccept(item.id, item.rider)}
        >
          <Text style={styles.acceptText}>✓ Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Requests</Text>
        <View style={styles.placeholder} />
      </View>

      {requests.length > 0 && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            {requests.length} pending request{requests.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📨</Text>
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubtext}>
              Requests will appear here when riders want to join your ride
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
  infoBar: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    textAlign: 'center',
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
    fontSize: 24,
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
  riderStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  totalRides: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  seatsInfo: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  seatsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A85BD',
  },
  seatsLabel: {
    fontSize: 12,
    color: '#6B7280',
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  declineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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