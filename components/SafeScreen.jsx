import { View, Text } from 'react-native'
import React from 'react'
import { COLORS } from '@/constants/colors.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeScreen({ children }) {
    const insets = useSafeAreaInsets();
  return (
    <View style={{paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1, backgroundColor: COLORS.background }}>
      {children}
    </View>
  )
}