import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SafetyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyTitle}>Emergency</Text>
          <Text style={styles.emergencySubtitle}>
            Call emergency services immediately if you feel unsafe
          </Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <Text style={styles.emergencyButtonText}>CALL 911</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📍</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Share Trip Status</Text>
              <Text style={styles.actionSubtitle}>
                Let friends and family track your ride
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('SafetyReport')}
          >
            <Text style={styles.actionIcon}>⚠️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Report Safety Issue</Text>
              <Text style={styles.actionSubtitle}>
                Report incidents or concerns
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🛡️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Trusted Contacts</Text>
              <Text style={styles.actionSubtitle}>
                Manage your emergency contacts
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>✓</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Verify Your Driver</Text>
              <Text style={styles.tipText}>
                Check the driver's photo, name, and vehicle details before getting in
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>✓</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Share Your Trip</Text>
              <Text style={styles.tipText}>
                Always share your trip details with someone you trust
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>✓</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Trust Your Instincts</Text>
              <Text style={styles.tipText}>
                If something doesn't feel right, don't hesitate to end the ride
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>✓</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Seatbelt Always</Text>
              <Text style={styles.tipText}>
                Always wear your seatbelt for the entire journey
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Guidelines</Text>
          <TouchableOpacity style={styles.linkCard}>
            <Text style={styles.linkIcon}>📄</Text>
            <Text style={styles.linkText}>View Community Standards</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard}>
            <Text style={styles.linkIcon}>📖</Text>
            <Text style={styles.linkText}>Safety Resources</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
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
  emergencyCard: {
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  emergencyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipIcon: {
    fontSize: 20,
    color: '#10B981',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  linkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
});
