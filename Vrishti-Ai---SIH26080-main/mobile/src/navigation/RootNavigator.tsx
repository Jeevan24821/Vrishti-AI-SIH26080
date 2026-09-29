import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CloudRain,
  Map as MapIcon,
  Layers,
  Activity,
  Sparkles,
  Menu,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

// Screens
import { ForecastScreen } from '../screens/ForecastScreen';
import { MapScreen } from '../screens/MapScreen';
import { RegimeScreen } from '../screens/RegimeScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { ModelAblationScreen } from '../screens/ModelAblationScreen';
import { FeatureImportanceScreen } from '../screens/FeatureImportanceScreen';
import { CalibrationScreen } from '../screens/CalibrationScreen';
import { ModelSandboxScreen } from '../screens/ModelSandboxScreen';
import { SectorIntelligenceScreen } from '../screens/SectorIntelligenceScreen';
import { DataMethodologyScreen } from '../screens/DataMethodologyScreen';
import { JuryDefenseScreen } from '../screens/JuryDefenseScreen';
import { ScientificAuditScreen } from '../screens/ScientificAuditScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Forecast"
        component={ForecastScreen}
        options={{
          tabBarLabel: 'Forecast',
          tabBarIcon: ({ color, size }) => <CloudRain size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => <MapIcon size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Regimes"
        component={RegimeScreen}
        options={{
          tabBarLabel: 'Regimes',
          tabBarIcon: ({ color, size }) => <Layers size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Verification"
        component={VerificationScreen}
        options={{
          tabBarLabel: 'Verification',
          tabBarIcon: ({ color, size }) => <Activity size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AIAssistantScreen}
        options={{
          tabBarLabel: 'Copilot',
          tabBarIcon: ({ color, size }) => <Sparkles size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'Tools',
          tabBarIcon: ({ color, size }) => <Menu size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="SectorIntelligence" component={SectorIntelligenceScreen} />
      <Stack.Screen name="ModelAblation" component={ModelAblationScreen} />
      <Stack.Screen name="FeatureImportance" component={FeatureImportanceScreen} />
      <Stack.Screen name="Calibration" component={CalibrationScreen} />
      <Stack.Screen name="ModelSandbox" component={ModelSandboxScreen} />
      <Stack.Screen name="DataMethodology" component={DataMethodologyScreen} />
      <Stack.Screen name="JuryDefense" component={JuryDefenseScreen} />
      <Stack.Screen name="ScientificAudit" component={ScientificAuditScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0b1220',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    marginTop: 2,
  },
});
