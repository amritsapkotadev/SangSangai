import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  StatusBar,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Animated FlatList to support native-driven onScroll
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const FEATURES = [
  { 
    id: 'f1', 
    title: 'Connect with Local Experts',
    desc: 'Find verified local guides who know every trail and can ensure your safety.',
    icon: 'account-group',
    color: '#6366f1'
  },
  { 
    id: 'f2', 
    title: 'Live Trek Tracking',
    desc: 'Share your real-time location with family and friends for complete peace of mind.',
    icon: 'map-marker-path',
    color: '#f59e0b'
  },
  { 
    id: 'f3', 
    title: 'Secure Transactions',
    desc: 'Pay with confidence using our escrow system that protects both trekkers and guides.',
    icon: 'shield-lock',
    color: '#10b981'
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width, paddingHorizontal: 40, justifyContent: 'center' }}>
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
          }}
        >
          <View className="items-center">
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 40,
                backgroundColor: item.color,
              }}
            >
              <MaterialCommunityIcons name={item.icon} size={64} color="#ffffff" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
              {item.title}
            </Text>
            
            <Text className="text-base text-gray-600 text-center leading-6">
              {item.desc}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View className="items-center pt-16 pb-8">
            <View className="w-24 h-24 bg-white/10 rounded-2xl items-center justify-center mb-4 backdrop-blur-lg border border-white/20">
              <MaterialCommunityIcons name="compass" size={48} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-white">SangSangai</Text>
            <Text className="text-indigo-200 mt-2">Safe trekking, side by side</Text>
          </View>

          {/* Carousel */}
          <View style={{ flex: 1 }}>
            <AnimatedFlatList
              ref={flatListRef}
              data={FEATURES}
              keyExtractor={(item: any) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={renderItem}
            />
          </View>

          {/* Pagination */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            {FEATURES.map((_, index) => {
              const active = currentIndex === index;
              return (
                <View
                  key={index}
                  style={{
                    height: 8,
                    width: active ? 32 : 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: active ? '#6366f1' : 'rgba(99,102,241,0.28)'
                  }}
                />
              );
            })}
          </View>

          {/* Buttons */}
          <View className="px-8 pb-12">
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={{ marginBottom: 12 }}
            >
              <View
                style={{
                  backgroundColor: '#6366f1',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold text-lg">Get Started</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/signup')}
              className="py-4 rounded-xl items-center border border-indigo-500/30"
            >
              <Text className="text-indigo-300 font-semibold">Create New Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/home')}
              className="mt-6 items-center"
            >
              <Text className="text-gray-400 text-sm">Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}