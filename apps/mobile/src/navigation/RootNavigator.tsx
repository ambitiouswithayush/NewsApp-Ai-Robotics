import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import MainTabs from './MainTabs';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isFirstLaunch, checkFirstLaunch } = useAuthStore();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
      {isFirstLaunch ? (
        <Stack.Screen name="Language" component={LanguageSelectionScreen as any} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs as any} />
      )}
    </Stack.Navigator>
  );
}
