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
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Create Animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const FEATURES = [
  { 
    id: '1', 
    title: 'Connect with Local Experts',
    desc: 'Find verified local guides who know every trail and can ensure your safety.',
    icon: 'account-group',
    color: '#6366f1'
  },
  { 
    id: '2', 
    title: 'Live Trek Tracking',
    desc: 'Share your real-time location with family and friends for complete peace of mind.',
    icon: 'map-marker-path',
    color: '#f59e0b'
  },
  { 
    id: '3', 
    title: 'Secure Transactions',
    desc: 'Pay with confidence using our escrow system that protects both trekkers and guides.',
    icon: 'shield-lock',
    color: '#10b981'
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
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
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 40,
              backgroundColor: item.color,
            }}>
              <MaterialCommunityIcons name={item.icon as any} size={64} color="#ffffff" />
            </View>
            
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 12 }}>
              {item.title}
            </Text>
            
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 }}>
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
          <View style={{ alignItems: 'center', paddingTop: 64, paddingBottom: 32 }}>
            <View style={{
              width: 96,
              height: 96,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}>
              <MaterialCommunityIcons name="compass" size={48} color="#ffffff" />
            </View>
             <Text style={{ color: '#a5b4fc', marginTop: 8 }}>Safe trekking, side by side</Text>
          </View>

          {/* Carousel */}
          <View style={{ flex: 1 }}>
            <AnimatedFlatList
              ref={flatListRef}
              data={FEATURES}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true } // Now this works with AnimatedFlatList
              )}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={renderItem}
            />
          </View>

          {/* Pagination */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
            {FEATURES.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: currentIndex === index ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                  width: currentIndex === index ? 32 : 8,
                }}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={{ paddingHorizontal: 32, paddingBottom: 48 }}>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={{
                backgroundColor: '#6366f1',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/signup')}
              style={{
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(99, 102, 241, 0.3)',
              }}
            >
              <Text style={{ color: '#c7d2fe', fontWeight: '600' }}>Create New Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/home')}
              style={{ marginTop: 24, alignItems: 'center' }}
            >
              <Text style={{ color: '#6b7280', fontSize: 14 }}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}