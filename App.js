import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Login, Signup, Welcome, AdminScreen, Notification, Profile, UserScreen } from "./screens";
import Ionicons from 'react-native-vector-icons/Ionicons'; // For icons

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab screen component
function TabScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Admin') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Admin" component={AdminScreen} />
      <Tab.Screen name="Notification" component={Notification} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='UserScreen'>
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="AdminTabs" component={TabScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserScreen" component={UserScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
