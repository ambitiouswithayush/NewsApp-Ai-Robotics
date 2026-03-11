import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Bookmark } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // Ultra dark background
          borderTopColor: '#27272a',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#52525b',
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ tabBarIcon: ({ color }) => <Search color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Saved" 
        component={BookmarksScreen} 
        options={{ tabBarIcon: ({ color }) => <Bookmark color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}
