import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from './screens/DashboardScreen';
import SOSScreen from './screens/SOSScreen';
import MapScreen from './screens/MapScreen';
import ChatbotScreen from './screens/ChatbotScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E2C', // Dark mode background for premium aesthetics
          },
          headerTintColor: '#FF4A6B', // Dynamic crimson theme accent color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'AEGIS - Women Safety' }}
        />
        <Stack.Screen 
          name="SOS" 
          component={SOSScreen} 
          options={{ title: 'Emergency SOS Mode' }}
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'AI Safe Route Navigator' }}
        />
        <Stack.Screen 
          name="Chatbot" 
          component={ChatbotScreen} 
          options={{ title: 'AI Safety Assistant' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
