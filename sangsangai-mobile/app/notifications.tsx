import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const NOTIFS = [
  { id: 'n1', title: 'Trip reminder', body: 'Your Mardi Himal trek starts tomorrow.' },
  { id: 'n2', title: 'Safety Tip', body: 'Carry extra water and a headlamp.' },
];

export default function NotificationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937' }}>Notifications</Text>
      </View>

      <FlatList
        data={NOTIFS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {}}>
            <Text style={{ fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.body}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
