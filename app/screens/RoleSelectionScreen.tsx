import React, { useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { authService } from '../../src/services/auth.service';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../src/context/ToastContext';

export default function RoleSelectionScreen({ navigation }: any) {
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleRoleSelection = async (role: 'driver' | 'rider') => {
    if (!user) {
      showToast('You must be signed in', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.updateUserRole(user.uid, role);

      if (result.success) {
        showToast('Role updated successfully!', 'success');
        // Refresh user data to get updated role
        await refreshUserData();

        // Navigate based on role
        setTimeout(() => {
          if (role === 'driver') {
            navigation.navigate('DriverMain');
          } else {
            navigation.navigate('RiderMain');
          }
        }, 1000);
      } else {
        showToast(result.error || 'Failed to update role', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/assets/logomulti.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Choose your Path</Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            onPress={() => handleRoleSelection('rider')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#7F7CAF', '#9FB4C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.roleCard}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>👥</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.roleTitle}>RIDER</Text>
                <Text style={styles.roleDescription}>
                  Request a ride from approved drivers following your route. Enjoy a
                  convenient and reliable way to reach your destination.
                </Text>
              </View>
              <View style={styles.dotsCircle}>
                <Text style={styles.dotsText}>⋯</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSelection('driver')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#3A85BD', '#9FB798']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.roleCard}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🚗</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.roleTitle}>DRIVER</Text>
                <Text style={styles.roleDescription}>
                  Offer your ride to others heading the same way. Set your route, choose
                  who joins, and make commuting easier for everyone.
                </Text>
              </View>
              <View style={styles.dotsCircle}>
                <Text style={styles.dotsText}>⋯</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#7F7CAF',
  },
  menuIcon: {
    fontSize: 20,
    color: '#7F7CAF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    width: 80,
    height: 80,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3A85BD',
    textAlign: 'center',
    marginBottom: 48,
  },
  cardsContainer: {
    flex: 1,
    gap: 24,
  },
  roleCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  dotsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dotsText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  nextButton: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9FB4C7',
  },
});