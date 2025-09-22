// src/components/AppLogo.tsx
import React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLogo() {
  const insets = useSafeAreaInsets(); // respeta notch
  return (
    <View style={{ paddingTop: insets.top ? 4 : 0 }}>
      <Image
        source={require('../assets/images/logo-horizontal.png')}
        style={{ height: 22, width: 120 }}
        resizeMode="contain"
      />
    </View>
  );
}