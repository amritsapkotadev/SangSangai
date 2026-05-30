import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>Settings</Text>
      <Text style={{ color: '#6b7280' }}>Account, Notifications, Privacy and App settings will be here.</Text>
    </ScrollView>
  );
}
