import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { rideService, Ride } from '../../src/services/ride.service';
import { matchingService, RideMatch } from '../../src/services/matching.service';

export default function SearchDriversScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { pickup, dropoff, date, time } = route.params || {};
  
  const [rides, setRides] = useState<RideMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'time'>('match');

  useEffect(() => {
    if (!pickup || !dropoff) {
      // Navigate back if required params are missing
      navigation.goBack();
      return;
    }
    loadAvailableRides();
  }, [sortBy, pickup, dropoff]);

  const loadAvailableRides = async () => {
    // Safety check
    if (!pickup || !dropoff || !pickup.latitude || !dropoff.latitude) {
      console.error('Missing location data');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get all active rides
      const result = await rideService.getActiveRides();

      if (result.success && result.rides) {
        // Filter out rides from the current user
        const availableRides = result.rides.filter(
          (ride) => ride.driverId !== user?.uid
        );

        // Apply intelligent matching
        const matchedRides = matchingService.getRecommendedRides(
          availableRides,
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: dropoff.latitude, longitude: dropoff.longitude },
          date,
          time,
          {
            maxPickupDistance: 5, // 5km
            maxDropoffDistance: 5, // 5km
            maxTimeDifference: 90, // 90 minutes
            minMatchScore: 30, // Show rides with at least 30% match
          }
        );

        // Apply sorting
        const sortedRides = sortRides(matchedRides, sortBy);
        setRides(sortedRides);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sortRides = (ridesArray: RideMatch[], sortType: string): RideMatch[] => {
    const sorted = [...ridesArray];
    
    switch (sortType) {
      case 'match':
        return sorted.sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'time':
        return sorted.sort((a, b) => 
          a.matchScore.timeDifference - b.matchScore.timeDifference
        );
      default:
        return sorted;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAvailableRides();
  };

  const renderMatchBadge = (ride: RideMatch) => {
    const { label, color, icon } = matchingService.getMatchQuality(ride.matchPercentage);
    
    return (
      <View style={[styles.matchBadge, { backgroundColor: color + '20' }]}>
        <Text style={styles.matchIcon}>{icon}</Text>
        <Text style={[styles.matchText, { color }]}>
          {ride.matchPercentage}% Match
        </Text>
      </View>
    );
  };

  const renderMatchDetails = (ride: RideMatch) => {
    const explanations = matchingService.getMatchExplanation(ride.matchScore);
    
    return (
      <View style={styles.matchDetails}>
        {explanations.slice(0, 2).map((explanation, index) => (
          <Text key={index} style={styles.matchDetailText}>
            {explanation}
          </Text>
        ))}
      </View>
    );
  };

  const renderRideCard = ({ item }: { item: RideMatch }) => {
    const { matchScore } = item;

    return (
      <TouchableOpacity
        style={styles.rideCard}
        onPress={() => navigation.navigate('DriverDetails', { ride: item })}
      >
        {/* Match Badge */}
        {renderMatchBadge(item)}

        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>
              {item.driverName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{item.driverName}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>⭐ 4.8</Text>
              <Text style={styles.seatsText}>
                💺 {item.availableSeats}/{item.totalSeats} seats
              </Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>{item.price}</Text>
            <Text style={styles.priceCurrency}>BHD</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={styles.routeDot} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeText}>{item.from}</Text>
              <Text style={styles.distanceText}>
                ~{matchingService.formatDistance(matchScore.pickupDistance)} away
              </Text>
            </View>
          </View>
          
          <View style={styles.routeLine} />
          
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeText}>{item.to}</Text>
              <Text style={styles.distanceText}>
                ~{matchingService.formatDistance(matchScore.dropoffDistance)} from destination
              </Text>
            </View>
          </View>
        </View>

        {/* Time Info */}
        <View style={styles.timeSection}>
          <View style={styles.timeItem}>
            <Text style={styles.timeIcon}>📅</Text>
            <Text style={styles.timeText}>{item.date}</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeText}>{item.time}</Text>
            {matchScore.timeDifference > 0 && (
              <Text style={styles.timeDiffText}>
                (±{matchingService.formatTimeDifference(matchScore.timeDifference)})
              </Text>
            )}
          </View>
        </View>

        {/* Match Explanation */}
        {renderMatchDetails(item)}

        {/* View Details Button */}
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details & Book →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSortOptions = () => {
    return (
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'match' && styles.sortButtonActive]}
            onPress={() => setSortBy('match')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'match' && styles.sortButtonTextActive]}>
              🎯 Best Match
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonTextActive]}>
              💰 Price
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'time' && styles.sortButtonActive]}
            onPress={() => setSortBy('time')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'time' && styles.sortButtonTextActive]}>
              ⏰ Time
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <Text style={styles.headerSubtitle}>
          Found {rides.length} ride{rides.length !== 1 ? 's' : ''} matching your route
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F7CAF" />
          <Text style={styles.loadingText}>Finding best rides for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if required params are missing
  if (!pickup || !dropoff) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>Missing Location Data</Text>
          <Text style={styles.emptyText}>
            Please select pickup and dropoff locations first
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={rides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id || ''}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSortOptions()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or check back later
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7F7CAF']}
          />
        }
        contentContainerStyle={styles.listContent}
      />
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#7F7CAF',
    borderColor: '#7F7CAF',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
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
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  matchIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  matchText: {
    fontSize: 14,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
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
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  seatsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7F7CAF',
  },
  priceCurrency: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeSection: {
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
    marginTop: 4,
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
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: '#7F7CAF',
    fontStyle: 'italic',
  },
  timeSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  timeDiffText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  matchDetails: {
    marginBottom: 12,
  },
  matchDetailText: {
    fontSize: 13,
    color: '#10B981',
    marginBottom: 4,
  },
  viewButton: {
    backgroundColor: '#7F7CAF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    paddingHorizontal: 40,
  },
  backButton: {
    backgroundColor: '#7F7CAF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});