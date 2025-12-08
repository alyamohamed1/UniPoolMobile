import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DUMMY_DRIVERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    rating: 4.9,
    reviews: 124,
    car: 'Toyota Camry',
    price: '$5',
    seats: 3,
  },
  {
    id: '2',
    name: 'Mike Williams',
    rating: 5.0,
    reviews: 89,
    car: 'Honda Civic',
    price: '$4',
    seats: 2,
  },
];

export default function SearchDriversScreen({ navigation }: any) {
  const renderDriver = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.driverCard}
      onPress={() => navigation.navigate('DriverDetails', { id: item.id })}
    >
      <View style={styles.driverAvatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.name}</Text>
        <Text style={styles.driverCar}>🚗 {item.car}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} reviews)</Text>
        </View>
      </View>
      <View style={styles.driverMeta}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.seats}>💺 {item.seats} seats</Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Available Drivers</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={DUMMY_DRIVERS}
        renderItem={renderDriver}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
    fontSize: 30,
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
  driverCar: {
    fontSize: 14,
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
  },
  seats: {
    fontSize: 12,
    color: '#6B7280',
  },
});