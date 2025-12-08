import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ACTIVE_RIDES = [
  {
    id: '1',
    from: 'Campus Building A',
    to: 'Downtown Mall',
    time: '3:00 PM',
    date: 'Today',
    seats: 4,
    requests: 3,
  },
];

export default function DriverMainScreen({ navigation }: any) {
  const [isAvailable, setIsAvailable] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A85BD', '#9FB798']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Driver Dashboard</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
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

        {/* POST RIDE BUTTON */}
        <TouchableOpacity 
          style={styles.postRideButton}
          onPress={() => navigation.navigate('PostRide')}
        >
          <LinearGradient
            colors={['#3A85BD', '#2563EB']}
            style={styles.postRideGradient}
          >
            <Text style={styles.postRideIcon}>➕</Text>
            <View style={styles.postRideContent}>
              <Text style={styles.postRideTitle}>Post a New Ride</Text>
              <Text style={styles.postRideSubtitle}>Set your route and availability</Text>
            </View>
            <Text style={styles.postRideArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ACTIVE RIDES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Rides</Text>
          
          {ACTIVE_RIDES.length > 0 ? (
            ACTIVE_RIDES.map((ride) => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={styles.rideHeader}>
                  <Text style={styles.rideDate}>{ride.date}</Text>
                  <View style={styles.requestsBadge}>
                    <Text style={styles.requestsText}>{ride.requests} requests</Text>
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
                    <Text style={styles.rideInfoText}>💺 {ride.seats} seats</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewRequestsButton}
                    onPress={() => navigation.navigate('DriverRequests')}
                  >
                    <Text style={styles.viewRequestsText}>View Requests</Text>
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
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>$0</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0h</Text>
              <Text style={styles.statLabel}>Online</Text>
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
          <Text style={styles.navText}>Requests</Text>
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
  requestsBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
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