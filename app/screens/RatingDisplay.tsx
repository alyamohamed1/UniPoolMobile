import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { ratingService, Rating, UserRatingStats } from '../../src/services/rating.service';

interface RatingDisplayProps {
  userId: string;
  showDetails?: boolean;
}

export default function RatingDisplay({ userId, showDetails = false }: RatingDisplayProps) {
  const [stats, setStats] = useState<UserRatingStats | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Helper function to safely format dates
  const formatDate = (date: Date | any): string => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    // Fallback
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    loadRatings();
  }, [userId]);

  const loadRatings = async () => {
    try {
      const [statsResult, ratingsResult] = await Promise.all([
        ratingService.getUserRatingStats(userId),
        ratingService.getUserRatings(userId),
      ]);

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      if (ratingsResult.success && ratingsResult.ratings) {
        setRatings(ratingsResult.ratings);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starsRow}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={[styles.starIcon, { fontSize: size }]}>
            ⭐
          </Text>
        ))}
        {hasHalfStar && (
          <Text style={[styles.starIcon, { fontSize: size }]}>⭐</Text>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.starIcon, { fontSize: size, opacity: 0.3 }]}>
            ⭐
          </Text>
        ))}
      </View>
    );
  };

  const renderRatingBreakdown = () => {
    if (!stats || stats.totalRatings === 0) return null;

    const breakdown = [
      { stars: 5, count: stats.fiveStarCount },
      { stars: 4, count: stats.fourStarCount },
      { stars: 3, count: stats.threeStarCount },
      { stars: 2, count: stats.twoStarCount },
      { stars: 1, count: stats.oneStarCount },
    ];

    return (
      <View style={styles.breakdownContainer}>
        {breakdown.map(({ stars, count }) => {
          const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
          return (
            <View key={stars} style={styles.breakdownRow}>
              <Text style={styles.breakdownStars}>{stars}⭐</Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.breakdownCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRecentReviews = () => {
    if (ratings.length === 0) return null;

    const recentRatings = ratings.slice(0, 3);

    return (
      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewsTitle}>Recent Reviews</Text>
        {recentRatings.map((rating) => (
          <View key={rating.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{rating.raterName}</Text>
              {renderStars(rating.rating, 14)}
            </View>
            {rating.comment && (
              <Text style={styles.reviewComment} numberOfLines={2}>
                {rating.comment}
              </Text>
            )}
            <Text style={styles.reviewDate}>
              {formatDate(rating.createdAt)}
            </Text>
          </View>
        ))}
        {ratings.length > 3 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.viewAllText}>
              View All {ratings.length} Reviews
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAllReviewsModal = () => {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Reviews</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {ratings.map((rating) => (
              <View key={rating.id} style={styles.modalReviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{rating.raterName}</Text>
                  {renderStars(rating.rating, 14)}
                </View>
                {rating.comment && (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                )}
                <Text style={styles.reviewDate}>
                  {formatDate(rating.createdAt)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7F7CAF" />
      </View>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <View style={styles.noRatingsContainer}>
        <Text style={styles.noRatingsText}>No ratings yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.averageContainer}>
          <Text style={styles.averageNumber}>
            {stats.averageRating.toFixed(1)}
          </Text>
          {renderStars(stats.averageRating, 20)}
        </View>
        <Text style={styles.totalRatings}>
          {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
        </Text>
      </View>

      {showDetails && (
        <>
          {renderRatingBreakdown()}
          {renderRecentReviews()}
        </>
      )}

      {renderAllReviewsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noRatingsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noRatingsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  starsRow: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  totalRatings: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownStars: {
    fontSize: 12,
    width: 40,
    color: '#6B7280',
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: '#FCD34D',
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: 12,
    width: 30,
    textAlign: 'right',
    color: '#6B7280',
  },
  reviewsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewAllButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F7CAF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
    padding: 16,
  },
  modalReviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
});