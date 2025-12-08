import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DUMMY_RIDES = [
  {
    id: '1',
    driver: 'Sarah Johnson',
    from: 'Campus Building A',
    to: 'Downtown Mall',
    date: 'Dec 5, 2025',
    time: '10:30 AM',
    price: '$5',
    status: 'completed',
  },
  {
    id: '2',
    driver: 'Mike Williams',
    from: 'Dorm Hall',
    to: 'Airport',
    date: 'Dec 3, 2025',
    time: '3:00 PM',
    price: '$15',
    status: 'completed',
  },
];

export default function RidesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('past');

  const renderRideItem = ({ item }: any) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideName}>🚗 {item.driver}</Text>
        <Text style={styles.ridePrice}>{item.price}</Text>
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
        <Text style={styles.rideDate}>{item.date} • {item.time}</Text>
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => navigation.navigate('RateDriver', { id: item.id })}
        >
          <Text style={styles.rateButtonText}>Rate</Text>
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
        <Text style={styles.headerTitle}>My Rides</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
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

      <FlatList
        data={activeTab === 'past' ? DUMMY_RIDES : []}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
  rideDate: {
    fontSize: 12,
    color: '#9CA3AF',
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