import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import SOSScreen from './screens/SOSScreen';
import MapScreen from './screens/MapScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ProfileScreen from './screens/ProfileScreen';
import FakeCallScreen from './screens/FakeCallScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#161626',
            shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#2F2F45',
          },
          headerTintColor: '#FF4A6B',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#FFFFFF',
            fontSize: 17,
          },
          cardStyle: {
            backgroundColor: '#0F0F1A',
          },
        }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: '🛡️ AEGIS SAFETY' }}
        />
        <Stack.Screen
          name="SOS"
          component={SOSScreen}
          options={{ title: '⚠️ EMERGENCY SOS', headerLeft: null }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: '🗺️ AI Safe Routes' }}
        />
        <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{ title: '🤖 AI Safety Assistant' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: '👤 Medical & Contacts' }}
        />
        <Stack.Screen
          name="FakeCall"
          component={FakeCallScreen}
          options={{ title: '📞 Escape Call Generator' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
