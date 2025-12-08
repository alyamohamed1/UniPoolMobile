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

export default function RateDriverScreen({ navigation, route }: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const TAGS = ['Friendly', 'Punctual', 'Clean Car', 'Safe Driver', 'Great Music', 'Good Conversation'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    // Submit rating logic
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Ride</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.driverCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.driverName}>Sarah Johnson</Text>
            <Text style={styles.carInfo}>Toyota Camry • ABC 1234</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How was your ride?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Text style={styles.star}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 ? 'Tap to rate' : 
               rating === 1 ? 'Poor' :
               rating === 2 ? 'Fair' :
               rating === 3 ? 'Good' :
               rating === 4 ? 'Very Good' :
               'Excellent'}
            </Text>
          </View>

          {rating > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What did you like?</Text>
                <View style={styles.tagsContainer}>
                  {TAGS.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tag,
                        selectedTags.includes(tag) && styles.tagSelected,
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          selectedTags.includes(tag) && styles.tagTextSelected,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
                <TextInput
                  style={styles.textArea}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share more about your experience..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>SUBMIT RATING</Text>
              </TouchableOpacity>
            </>
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
  driverCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  carInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  star: {
    fontSize: 48,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#7F7CAF',
    textAlign: 'center',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tagSelected: {
    backgroundColor: '#7F7CAF',
    borderColor: '#7F7CAF',
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    height: 100,
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