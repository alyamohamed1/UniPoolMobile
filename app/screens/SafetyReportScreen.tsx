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

const ISSUE_TYPES = [
  { id: '1', label: 'Unsafe Driving' },
  { id: '2', label: 'Harassment' },
  { id: '3', label: 'Vehicle Condition' },
  { id: '4', label: 'Route Issue' },
  { id: '5', label: 'Other' },
];

export default function SafetyReportScreen({ navigation }: any) {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Submit report logic
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
        <Text style={styles.headerTitle}>Report Safety Issue</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              If you're in immediate danger, please call emergency services (911) right away.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type of Issue</Text>
            {ISSUE_TYPES.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.issueOption,
                  selectedIssue === issue.id && styles.issueOptionSelected,
                ]}
                onPress={() => setSelectedIssue(issue.id)}
              >
                <View style={styles.radioButton}>
                  {selectedIssue === issue.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.issueLabel}>{issue.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Please provide details about what happened..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.infoText}>
              Your report will be reviewed by our safety team. All reports are taken seriously and investigated promptly.
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedIssue || !description) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedIssue || !description}
          >
            <Text style={styles.submitButtonText}>SUBMIT REPORT</Text>
          </TouchableOpacity>
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
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
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
  issueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  issueOptionSelected: {
    borderColor: '#7F7CAF',
    borderWidth: 2,
    backgroundColor: '#F3F4F6',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7F7CAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7F7CAF',
  },
  issueLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    height: 150,
    textAlignVertical: 'top',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
