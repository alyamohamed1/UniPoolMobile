import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PASSENGERS = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Emma Wilson' },
];

export default function RatePassengersScreen({ navigation, route }: any) {
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const setRating = (passengerId: string, rating: number) => {
    setRatings({ ...ratings, [passengerId]: rating });
  };

  const setComment = (passengerId: string, comment: string) => {
    setComments({ ...comments, [passengerId]: comment });
  };

  const handleSubmit = () => {
    // Submit ratings logic
    navigation.goBack();
  };

  const allRated = PASSENGERS.every(p => ratings[p.id] > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Passengers</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Help keep the community safe by rating your passengers
            </Text>
          </View>

          {PASSENGERS.map((passenger) => (
            <View key={passenger.id} style={styles.passengerCard}>
              <View style={styles.passengerHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.name}</Text>
                </View>
              </View>

              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Rate this passenger</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(passenger.id, star)}
                    >
                      <Text style={styles.star}>
                        {star <= (ratings[passenger.id] || 0) ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {ratings[passenger.id] > 0 && (
                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Comments (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={comments[passenger.id] || ''}
                    onChangeText={(text) => setComment(passenger.id, text)}
                    placeholder="Any additional feedback..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            </View>
          ))}

          {allRated && (
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>SUBMIT RATINGS</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoText: {
    fontSize: 14,
    color: '#4338CA',
    textAlign: 'center',
  },
  passengerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingSection: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    fontSize: 36,
    marginHorizontal: 4,
  },
  commentSection: {
    marginTop: 12,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#7F7CAF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
