import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function DriverDetailsScreen({ navigation, route }: any) {
  const driverId = route?.params?.id || '1';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <LinearGradient
          colors={['#7F7CAF', '#9FB4C7']}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.driverName}>Sarah Johnson</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ 4.9</Text>
            <Text style={styles.ratingCount}>(124 reviews)</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Car Model</Text>
              <Text style={styles.infoValue}>Toyota Camry 2022</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Plate</Text>
              <Text style={styles.infoValue}>ABC 1234</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Color</Text>
              <Text style={styles.infoValue}>Silver</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available Seats</Text>
              <Text style={styles.infoValue}>3</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>📍</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeText}>Campus Building A</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>🎯</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Destination</Text>
                <Text style={styles.routeText}>Downtown Mall</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Departure Time</Text>
              <Text style={styles.infoValue}>3:00 PM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price per Seat</Text>
              <Text style={styles.priceValue}>$5</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>Mike W.</Text>
              <Text style={styles.reviewRating}>⭐⭐⭐⭐⭐</Text>
            </View>
            <Text style={styles.reviewText}>
              Great driver! Very punctual and friendly. Smooth ride.
            </Text>
            <Text style={styles.reviewDate}>2 days ago</Text>
          </View>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>Emily D.</Text>
              <Text style={styles.reviewRating}>⭐⭐⭐⭐⭐</Text>
            </View>
            <Text style={styles.reviewText}>
              Clean car and safe driving. Would ride again!
            </Text>
            <Text style={styles.reviewDate}>1 week ago</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>REQUEST RIDE</Text>
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
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 50,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ratingCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7F7CAF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    fontSize: 24,
    marginRight: 12,
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
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginLeft: 11,
    marginVertical: 8,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  requestButton: {
    backgroundColor: '#7F7CAF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});