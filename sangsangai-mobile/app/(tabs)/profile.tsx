import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { User } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 items-center">
        <View className="w-20 h-20 rounded-2xl bg-white items-center justify-center shadow mb-4">
          <User color="#1f2937" size={36} />
        </View>
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
        <Text className="text-gray-500 mt-2 text-center">View and edit your profile, manage bookings, and update settings.</Text>
      </View>
    </ScrollView>
  );
}
