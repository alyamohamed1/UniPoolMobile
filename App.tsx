import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';

import WelcomeScreen from './app/screens/WelcomeScreen';
import SignInScreen from './app/screens/SignInScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import RoleSelectionScreen from './app/screens/RoleSelectionScreen';
import RiderMainScreen from './app/screens/RiderMainScreen';
import DriverMainScreen from './app/screens/DriverMainScreen';
import PostRideScreen from './app/screens/PostRideScreen';
import SearchDriversScreen from './app/screens/SearchDriversScreen';
import DriverDetailsScreen from './app/screens/DriverDetailsScreen';
import DriverRequestsScreen from './app/screens/DriverRequestsScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import EditProfileScreen from './app/screens/EditProfileScreen';
import ChatScreen from './app/screens/ChatScreen';
import RidesScreen from './app/screens/RidesScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';
import RatingsScreen from './app/screens/RatingsScreen';
import RewardsScreen from './app/screens/RewardsScreen';
import SafetyScreen from './app/screens/SafetyScreen';
import SafetyReportScreen from './app/screens/SafetyReportScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import RateDriverScreen from './app/screens/RateDriverScreen';
import RatePassengersScreen from './app/screens/RatePassengersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                  headerShown: false,
                  gestureEnabled: true,
                }}
              >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="RiderMain" component={RiderMainScreen} />
                <Stack.Screen name="DriverMain" component={DriverMainScreen} />
                <Stack.Screen name="PostRide" component={PostRideScreen} />
                <Stack.Screen name="SearchDrivers" component={SearchDriversScreen} />
                <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
                <Stack.Screen name="DriverRequests" component={DriverRequestsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="Rides" component={RidesScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="Ratings" component={RatingsScreen} />
                <Stack.Screen name="Rewards" component={RewardsScreen} />
                <Stack.Screen name="Safety" component={SafetyScreen} />
                <Stack.Screen name="SafetyReport" component={SafetyReportScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="RateDriver" component={RateDriverScreen} />
                <Stack.Screen name="RatePassengers" component={RatePassengersScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}