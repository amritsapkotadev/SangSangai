import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Heart } from 'lucide-react-native';

export default function BrowseScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 items-center">
        <View className="w-20 h-20 rounded-2xl bg-white items-center justify-center shadow mb-4">
          <Heart color="#ec4899" size={36} />
        </View>
        <Text className="text-2xl font-bold text-gray-800">Explore</Text>
        <Text className="text-gray-500 mt-2 text-center">Discover recommended treks, nearby guides, and trending routes.</Text>
      </View>
    </ScrollView>
  );
}
