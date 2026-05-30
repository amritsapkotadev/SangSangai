import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Search, Filter, Calendar, MapPin, Users, Star, X, ArrowRight } from 'lucide-react-native';

// Demo trek data from local people
const DEMO_TREKS = [
  {
    id: '1',
    title: 'Annapurna Base Camp Trek',
    localGuide: 'Rajesh Gurung',
    from: 'Pokhara',
    to: 'Annapurna Base Camp',
    duration: '7 days',
    difficulty: 'Easy',
    maxAltitude: '4,130m',
    price: '$450',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1536240474400-95a4e8b6736c?w=400',
    description: 'Classic trek to Annapurna Base Camp with stunning mountain views.',
    included: ['Meals', 'Accommodation', 'Guide', 'Permits'],
    likes: 89,
  },
  {
    id: '2',
    title: 'Everest Base Camp Trek',
    localGuide: 'Pasang Sherpa',
    from: 'Lukla',
    to: 'Everest Base Camp',
    duration: '12 days',
    difficulty: 'Hard',
    maxAltitude: '5,364m',
    price: '$850',
    rating: 4.9,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1526392060635-5d5b3eb48de2?w=400',
    description: 'Iconic trek to the base of the world\'s highest mountain.',
    included: ['Meals', 'Accommodation', 'Guide', 'Permits', 'Helicopter rescue'],
    likes: 156,
  },
  {
    id: '3',
    title: 'Langtang Valley Trek',
    localGuide: 'Karma Tamang',
    from: 'Syabrubesi',
    to: 'Langtang Valley',
    duration: '8 days',
    difficulty: 'Medium',
    maxAltitude: '3,800m',
    price: '$380',
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
    description: 'Beautiful valley trek with rich Tamang culture.',
    included: ['Meals', 'Accommodation', 'Guide'],
    likes: 67,
  },
  {
    id: '4',
    title: 'Poon Hill Trek',
    localGuide: 'Bishnu Thapa',
    from: 'Nayapul',
    to: 'Poon Hill',
    duration: '5 days',
    difficulty: 'Easy',
    maxAltitude: '3,210m',
    price: '$280',
    rating: 4.6,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400',
    description: 'Short trek with breathtaking sunrise views over Annapurna range.',
    included: ['Meals', 'Accommodation', 'Guide'],
    likes: 112,
  },
  {
    id: '5',
    title: 'Manaslu Circuit Trek',
    localGuide: 'Dawa Sherpa',
    from: 'Soti Khola',
    to: 'Dharapani',
    duration: '14 days',
    difficulty: 'Hard',
    maxAltitude: '5,106m',
    price: '$750',
    rating: 4.9,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400',
    description: 'Remote trek around Mount Manaslu with diverse landscapes.',
    included: ['Meals', 'Accommodation', 'Guide', 'Permits'],
    likes: 45,
  },
];

// Demo places for dropdown
const FROM_PLACES = ['Pokhara', 'Lukla', 'Syabrubesi', 'Nayapul', 'Soti Khola', 'Jiri', 'Kathmandu'];
const TO_PLACES = ['Annapurna Base Camp', 'Everest Base Camp', 'Langtang Valley', 'Poon Hill', 'Dharapani', 'Gokyo Lakes', 'Upper Mustang'];

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [likedTreks, setLikedTreks] = useState<string[]>([]);
  const [selectedTrek, setSelectedTrek] = useState(null);

  const toggleLike = (id: string) => {
    if (likedTreks.includes(id)) {
      setLikedTreks(likedTreks.filter(item => item !== id));
    } else {
      setLikedTreks([...likedTreks, id]);
    }
  };

  const filterTreks = () => {
    return DEMO_TREKS.filter(trek => {
      const matchesSearch = searchQuery === '' || 
        trek.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trek.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trek.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trek.localGuide.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = !selectedDifficulty || trek.difficulty === selectedDifficulty;
      const matchesFrom = !selectedFrom || trek.from === selectedFrom;
      const matchesTo = !selectedTo || trek.to === selectedTo;
      
      return matchesSearch && matchesDifficulty && matchesFrom && matchesTo;
    });
  };

  const clearFilters = () => {
    setSelectedDifficulty('');
    setSelectedFrom('');
    setSelectedTo('');
  };

  const TrekCard = ({ trek }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl mb-4 overflow-hidden"
      style={Platform.OS === "android" ? { elevation: 3 } : { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 }}
      onPress={() => setSelectedTrek(trek)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: trek.image }} 
        className="w-full h-48"
        style={{ resizeMode: 'cover' }}
      />
      <TouchableOpacity 
        className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
        onPress={() => toggleLike(trek.id)}
      >
        <Heart 
          size={20} 
          color={likedTreks.includes(trek.id) ? '#ec4899' : '#9ca3af'}
          fill={likedTreks.includes(trek.id) ? '#ec4899' : 'none'}
        />
      </TouchableOpacity>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{trek.title}</Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={14} color="#6b7280" />
              <Text className="text-gray-600 text-xs ml-1">{trek.from} → {trek.to}</Text>
            </View>
          </View>
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-lg">
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-green-700 font-semibold ml-1">{trek.rating}</Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-3">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-gray-600 text-xs ml-1">{trek.duration}</Text>
          </View>
          <View className="flex-row items-center">
            <Users size={14} color="#6b7280" />
            <Text className="text-gray-600 text-xs ml-1">by {trek.localGuide}</Text>
          </View>
          <Text className="text-blue-600 font-bold">{trek.price}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2 mt-3">
          <View className={`px-2 py-1 rounded ${
            trek.difficulty === 'Easy' ? 'bg-green-100' : 
            trek.difficulty === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs ${
              trek.difficulty === 'Easy' ? 'text-green-700' : 
              trek.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {trek.difficulty}
            </Text>
          </View>
          <View className="bg-gray-100 px-2 py-1 rounded">
            <Text className="text-gray-600 text-xs">Max: {trek.maxAltitude}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50" 
        activeOpacity={1}
        onPress={() => setShowFilters(false)}
      >
        <TouchableOpacity 
          className="bg-white rounded-t-3xl mt-20"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Filters</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-blue-600 font-semibold">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {/* From Location */}
            <View className="mb-6">
              <Text className="font-semibold text-gray-800 mb-3">Starting From</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                nestedScrollEnabled={true}
              >
                <View className="flex-row">
                  {FROM_PLACES.map(place => (
                    <TouchableOpacity
                      key={place}
                      className={`px-4 py-2 rounded-full mr-2 ${selectedFrom === place ? 'bg-blue-600' : 'bg-gray-100'}`}
                      onPress={() => setSelectedFrom(selectedFrom === place ? '' : place)}
                    >
                      <Text className={selectedFrom === place ? 'text-white' : 'text-gray-700'}>
                        {place}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* To Location */}
            <View className="mb-6">
              <Text className="font-semibold text-gray-800 mb-3">Destination</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                nestedScrollEnabled={true}
              >
                <View className="flex-row">
                  {TO_PLACES.map(place => (
                    <TouchableOpacity
                      key={place}
                      className={`px-4 py-2 rounded-full mr-2 ${selectedTo === place ? 'bg-blue-600' : 'bg-gray-100'}`}
                      onPress={() => setSelectedTo(selectedTo === place ? '' : place)}
                    >
                      <Text className={selectedTo === place ? 'text-white' : 'text-gray-700'}>
                        {place}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Difficulty Level */}
            <View className="mb-6">
              <Text className="font-semibold text-gray-800 mb-3">Difficulty Level</Text>
              <View className="flex-row gap-2">
                {['Easy', 'Medium', 'Hard'].map(level => (
                  <TouchableOpacity
                    key={level}
                    className={`flex-1 px-4 py-2 rounded-full ${selectedDifficulty === level ? 'bg-blue-600' : 'bg-gray-100'}`}
                    onPress={() => setSelectedDifficulty(selectedDifficulty === level ? '' : level)}
                  >
                    <Text className={`text-center ${selectedDifficulty === level ? 'text-white' : 'text-gray-700'}`}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              className="bg-blue-600 py-4 rounded-xl mb-6"
              onPress={() => setShowFilters(false)}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const TrekDetailModal = () => (
    <Modal
      visible={!!selectedTrek}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setSelectedTrek(null)}
    >
      <ScrollView className="flex-1 bg-white">
        {selectedTrek && (
          <>
            <Image 
              source={{ uri: selectedTrek.image }} 
              className="w-full h-64"
              style={{ resizeMode: 'cover' }}
            />
            <TouchableOpacity 
              className="absolute top-12 right-4 bg-white/90 rounded-full p-2"
              onPress={() => setSelectedTrek(null)}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <View className="p-4">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-800">{selectedTrek.title}</Text>
                  <View className="flex-row items-center mt-2">
                    <MapPin size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-1">{selectedTrek.from} → {selectedTrek.to}</Text>
                  </View>
                </View>
                <Text className="text-2xl font-bold text-blue-600">{selectedTrek.price}</Text>
              </View>

              <View className="flex-row justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                <View className="items-center">
                  <Text className="text-gray-600 text-sm">Duration</Text>
                  <Text className="font-semibold">{selectedTrek.duration}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-600 text-sm">Difficulty</Text>
                  <Text className="font-semibold">{selectedTrek.difficulty}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-600 text-sm">Max Altitude</Text>
                  <Text className="font-semibold">{selectedTrek.maxAltitude}</Text>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">About this trek</Text>
                <Text className="text-gray-600 leading-6">{selectedTrek.description}</Text>
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">What's included</Text>
                {selectedTrek.included.map((item, idx) => (
                  <View key={idx} className="flex-row items-center mt-2">
                    <View className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                    <Text className="text-gray-600">{item}</Text>
                  </View>
                ))}
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">Local Guide</Text>
                <View className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                    <Text className="text-2xl">👨‍🏫</Text>
                  </View>
                  <View className="ml-3">
                    <Text className="font-semibold text-gray-800">{selectedTrek.localGuide}</Text>
                    <View className="flex-row items-center">
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {selectedTrek.rating} ({selectedTrek.reviews} reviews)
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="bg-blue-600 py-4 rounded-xl mb-6">
                <Text className="text-white text-center font-semibold text-lg">
                  Request Booking
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </Modal>
  );

  const filteredTreks = filterTreks();
  const activeFilterCount = [selectedDifficulty, selectedFrom, selectedTo].filter(f => f && f !== '').length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-2" style={Platform.OS === "android" ? { elevation: 2 } : { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
        <Text className="text-2xl font-bold text-gray-800 mb-3">Explore Treks</Text>
        
        {/* Search Bar */}
        <View className="flex-row gap-2">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3">
            <Search size={20} color="#6b7280" />
            <TextInput
              className="flex-1 py-3 px-2 text-gray-800"
              placeholder="Search by trek, route, or guide..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity 
            className="bg-gray-100 px-4 rounded-xl items-center justify-center relative"
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#6b7280" />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-blue-600 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {selectedDifficulty && (
                <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-blue-700 text-xs">{selectedDifficulty}</Text>
                  <TouchableOpacity onPress={() => setSelectedDifficulty('')} className="ml-2">
                    <X size={12} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedFrom && (
                <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-blue-700 text-xs">From: {selectedFrom}</Text>
                  <TouchableOpacity onPress={() => setSelectedFrom('')} className="ml-2">
                    <X size={12} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedTo && (
                <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-blue-700 text-xs">To: {selectedTo}</Text>
                  <TouchableOpacity onPress={() => setSelectedTo('')} className="ml-2">
                    <X size={12} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Results Count */}
      <View className="px-4 py-3">
        <Text className="text-gray-600">
          Found {filteredTreks.length} trek{filteredTreks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Trek List */}
      <FlatList
        data={filteredTreks}
        renderItem={({ item }) => <TrekCard trek={item} />}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">🏔️</Text>
            <Text className="text-xl font-semibold text-gray-800 mb-2">No treks found</Text>
            <Text className="text-gray-600 text-center">
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      />

      {/* Modals */}
      <FilterModal />
      <TrekDetailModal />
    </SafeAreaView>
  );
}