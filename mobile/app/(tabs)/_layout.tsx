import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';

const GREEN = '#059669';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: Platform.OS === 'ios' ? 83 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: '#000000',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, { color: focused ? GREEN : '#8E8E93' }]}>
              🏔️
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="browse"
        options={{
          headerShown: false,
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, { color: focused ? GREEN : '#8E8E93' }]}>
              🔍
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          headerShown: false,
          title: 'Community',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, { color: focused ? GREEN : '#8E8E93' }]}>
              👥
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          title: 'Activity',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, { color: focused ? GREEN : '#8E8E93' }]}>
              🔔
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, { color: focused ? GREEN : '#8E8E93' }]}>
              👤
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 22 },
});