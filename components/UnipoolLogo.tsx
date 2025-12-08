import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface UnipoolLogoProps {
  variant?: 'default' | 'white';
  size?: 'small' | 'medium' | 'large';
}

export default function UnipoolLogo({ variant = 'default', size = 'medium' }: UnipoolLogoProps) {
  const fontSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
  const color = variant === 'white' ? COLORS.white : COLORS.primary;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.logo, { fontSize, color }]}>UNIPOOL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});