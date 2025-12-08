import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    universityId: '',
    phone: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <LinearGradient 
      colors={['#EEEEFF', '#7F7CAF', '#9FB4C7', '#3A85BD', '#9FB798']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Create</Text>
              <Text style={styles.headerText}>Account</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(value) => handleChange('name', value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="example@university.edu"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(value) => handleChange('password', value)}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>University ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="U12345678"
                    placeholderTextColor="#9CA3AF"
                    value={formData.universityId}
                    onChangeText={(value) => handleChange('universityId', value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(value) => handleChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                  <Text style={styles.signUpButtonText}>SIGN UP</Text>
                </TouchableOpacity>

                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text style={styles.signInLink}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    marginBottom: 32,
  },
  headerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#7F7CAF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
  },
  signUpButton: {
    height: 56,
    backgroundColor: '#7F7CAF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
  },
  signInText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signInLink: {
    color: '#7F7CAF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
