import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={['#EEEEFF', '#7F7CAF', '#9FB4C7', '#3A85BD', '#9FB798']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/assets/fulllogowhite.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.welcomeText}>Welcome Back</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signUpButtonText}>SIGN UP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 48,
    width: width * 0.7,
    height: 120,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  signInButton: {
    height: 56,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});