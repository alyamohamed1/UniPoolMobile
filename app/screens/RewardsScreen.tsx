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

const REWARDS = [
  { id: '1', title: '$5 Ride Credit', points: 100, available: true },
  { id: '2', title: '$10 Ride Credit', points: 200, available: true },
  { id: '3', title: 'Free Premium Month', points: 500, available: false },
];

export default function RewardsScreen({ navigation }: any) {
  const currentPoints = 120;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <LinearGradient
          colors={['#7F7CAF', '#9FB4C7']}
          style={styles.pointsCard}
        >
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsNumber}>{currentPoints}</Text>
          <Text style={styles.pointsSubtext}>Keep riding to earn more!</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Earn Points</Text>
          <View style={styles.earnCard}>
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>🚗</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Complete a Ride</Text>
                <Text style={styles.earnSubtitle}>Earn 10 points per ride</Text>
              </View>
              <Text style={styles.earnPoints}>+10</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>⭐</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Get 5-Star Rating</Text>
                <Text style={styles.earnSubtitle}>Bonus points for excellence</Text>
              </View>
              <Text style={styles.earnPoints}>+5</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>👥</Text>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Refer a Friend</Text>
                <Text style={styles.earnSubtitle}>When they complete first ride</Text>
              </View>
              <Text style={styles.earnPoints}>+50</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redeem Rewards</Text>
          {REWARDS.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardPoints}>
                  {reward.points} points
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  !reward.available && styles.redeemButtonDisabled,
                ]}
                disabled={!reward.available}
              >
                <Text
                  style={[
                    styles.redeemText,
                    !reward.available && styles.redeemTextDisabled,
                  ]}
                >
                  {reward.available ? 'Redeem' : 'Locked'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
  pointsCard: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  pointsNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointsSubtext: {
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
  earnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  earnIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  earnInfo: {
    flex: 1,
  },
  earnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  earnSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  earnPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7F7CAF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 14,
    color: '#7F7CAF',
  },
  redeemButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#7F7CAF',
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  redeemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redeemTextDisabled: {
    color: '#9CA3AF',
  },
});