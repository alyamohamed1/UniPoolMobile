import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DUMMY_RATINGS = [
  {
    id: '1',
    from: 'Sarah Johnson',
    rating: 5,
    comment: 'Great rider! Very friendly and on time.',
    date: '2 days ago',
    type: 'received',
  },
  {
    id: '2',
    from: 'Mike Williams',
    rating: 4,
    comment: 'Good experience overall.',
    date: '1 week ago',
    type: 'received',
  },
  {
    id: '3',
    from: 'You rated Emma Davis',
    rating: 5,
    comment: 'Excellent driver, very professional!',
    date: '1 week ago',
    type: 'given',
  },
];

export default function RatingsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  const renderRating = ({ item }: any) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingName}>{item.from}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={styles.star}>
                {star <= item.rating ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}
    </View>
  );

  const filteredRatings = DUMMY_RATINGS.filter(r => r.type === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsCard}>
        <View style={styles.averageSection}>
          <Text style={styles.averageNumber}>4.9</Text>
          <Text style={styles.averageStars}>⭐⭐⭐⭐⭐</Text>
          <Text style={styles.averageText}>Based on 124 reviews</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'given' && styles.activeTab]}
          onPress={() => setActiveTab('given')}
        >
          <Text style={[styles.tabText, activeTab === 'given' && styles.activeTabText]}>
            Given
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRatings}
        renderItem={renderRating}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>No ratings yet</Text>
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
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  averageSection: {
    alignItems: 'center',
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7F7CAF',
    marginBottom: 8,
  },
  averageStars: {
    fontSize: 20,
    marginBottom: 8,
  },
  averageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
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
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  comment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  },
});
