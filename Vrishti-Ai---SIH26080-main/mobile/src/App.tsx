import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { ForecastProvider } from './context/ForecastContext';
import { RootNavigator } from './navigation/RootNavigator';
import { COLORS } from './constants/theme';

const appNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ForecastProvider>
          <NavigationContainer theme={appNavigationTheme}>
            <View style={styles.rootContainer}>
              <StatusBar style="light" backgroundColor={COLORS.surface} translucent={false} />
              <RootNavigator />
            </View>
          </NavigationContainer>
        </ForecastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
