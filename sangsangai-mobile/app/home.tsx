import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

type Item = { id: string; title: string; subtitle: string; image?: string };

const sampleData: Item[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `trip-${i + 1}`,
  title: ['Mardi Himal', 'Annapurna Circuit', 'Langtang', 'Everest View'][i % 4] + ` • ${i + 1}d`,
  subtitle: 'Guided trek with local experts',
}));

export default function HomeScreen() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const perPage = 6;

  const pages = useMemo(() => {
    const chunks: Item[][] = [];
    for (let i = 0; i < sampleData.length; i += perPage) chunks.push(sampleData.slice(i, i + perPage));
    return chunks;
  }, []);

  const data = pages[page] ?? [];

  return (
    <View className="flex-1 bg-gradient-to-b from-white to-gray-50">
      <View className="p-6 pt-10 flex-1">
        <View>
          <Text className="text-3xl font-extrabold text-mountainBlue">Discover Treks</Text>
          <Text className="text-gray-500 mt-1">Hand-picked routes & experienced guides</Text>
        </View>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingVertical: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/trip/${item.id}`)}
              className="bg-white rounded-2xl p-3 mb-4 w-[48%] shadow"
            >
              <View className="h-32 bg-gray-100 rounded-xl mb-3 items-center justify-center">
                <Text className="text-3xl">🏔️</Text>
              </View>
              <Text className="font-bold text-gray-800">{item.title}</Text>
              <Text className="text-sm text-gray-500 mt-1">{item.subtitle}</Text>
            </TouchableOpacity>
          )}
        />

        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity
            onPress={() => setPage((p) => Math.max(0, p - 1))}
            className={`px-4 py-2 rounded-xl ${page === 0 ? 'bg-gray-100' : 'bg-white'} shadow`}
            disabled={page === 0}
          >
            <Text className={`text-sm ${page === 0 ? 'text-gray-400' : 'text-gray-700'}`}>Previous</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-sm text-gray-600">Page {page + 1} of {pages.length}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            className={`px-4 py-2 rounded-xl ${page === pages.length - 1 ? 'bg-gray-100' : 'bg-nepalRed' } shadow`}
            disabled={page === pages.length - 1}
          >
            <Text className={`text-sm ${page === pages.length - 1 ? 'text-gray-400' : 'text-white'}`}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
