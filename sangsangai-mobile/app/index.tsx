import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
// Pagination is shown as page indicator (Page X of Y)

const { width } = Dimensions.get('window');

const FEATURES = [
  { id: 'f1', title: 'Find Local Guides', desc: 'Discover trusted, experienced guides in your area.' },
  { id: 'f2', title: 'Track Treks', desc: 'Real-time trip status and location updates.' },
  { id: 'f3', title: 'Secure Payments', desc: 'Safe and transparent payments between trekkers and guides.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const ref = useRef<FlatList>(null);
  const [page, setPage] = useState(0);

  return (
    <View className="flex-1 bg-white">
      <View className="items-center justify-center p-8 pt-12">
        <View className="w-28 h-28 bg-nepalRed rounded-2xl items-center justify-center shadow-md">
          <Text className="text-5xl text-white">🏔️</Text>
        </View>
        <Text className="text-4xl font-extrabold text-mountainBlue mt-4">SangSangai</Text>
        <Text className="text-gray-500 mt-2 text-center">Safe trekking, side by side.</Text>
      </View>

      <View style={{ height: 220 }}>
        <FlatList
          ref={ref}
          data={FEATURES}
          keyExtractor={(i) => i.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(ev) => {
            const newIndex = Math.round(ev.nativeEvent.contentOffset.x / width);
            setPage(newIndex);
          }}
          renderItem={({ item }) => (
            <View style={{ width, padding: 24 }} className="items-center justify-center">
              <View className="w-64 h-40 bg-gradient-to-r from-mountainBlue/10 to-nepalRed/10 rounded-3xl items-center justify-center shadow">
                <Text className="text-2xl font-bold text-mountainBlue">{item.title}</Text>
              </View>
              <Text className="text-center text-gray-600 mt-4 px-6">{item.desc}</Text>
            </View>
          )}
        />
      </View>

      <View className="items-center mt-4">
        <Text className="text-sm text-gray-600">Page {page + 1} of {FEATURES.length}</Text>
      </View>

      <View className="px-6 mt-8">
        <TouchableOpacity onPress={() => router.push('/login')} className="w-full bg-nepalRed py-4 rounded-xl items-center mb-3">
          <Text className="text-white font-bold text-lg">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/signup')} className="w-full bg-white border border-gray-200 py-4 rounded-xl items-center mb-3">
          <Text className="text-mountainBlue font-bold text-lg">Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/home')} className="w-full items-center mt-2">
          <Text className="text-gray-500">Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
