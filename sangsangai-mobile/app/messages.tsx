import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const MESSAGES = [
  { id: 'm1', from: 'Laxmi', preview: 'Are you joining the trek on Saturday?' },
  { id: 'm2', from: 'Guide: Hari', preview: 'Please pack warm layers for the summit.' },
];

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937' }}>Messages</Text>
      </View>

      <FlatList
        data={MESSAGES}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {}}>
            <Text style={{ fontWeight: '700' }}>{item.from}</Text>
            <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.preview}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
