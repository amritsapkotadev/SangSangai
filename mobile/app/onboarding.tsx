import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from '../src/lib/storage';
import { COLORS } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'map-plus',
    title: 'Post Your Trek',
    description: 'Local guides share their treks — routes, dates, and group size. Anyone can add a trek they know.',
    gradient: ['#059669', '#047857'],
  },
  {
    id: '2',
    icon: 'handshake',
    title: 'Connect & Approve',
    description: 'Interested trekkers send a request. You review their profile and approve the ones you trust.',
    gradient: ['#059669', '#065f46'],
  },
  {
    id: '3',
    icon: 'pine-tree',
    title: 'Trek Together',
    description: 'Once approved, both sides see each other\'s details. Meet up, hit the trail, and earn SangPoints.',
    gradient: ['#047857', '#064e3b'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  }, [currentIndex]);

  const handleGetStarted = useCallback(async () => {
    await storage.setOnboardingSeen(true);
    router.replace('/login');
  }, [router]);

  const handleSkip = useCallback(async () => {
    await storage.setOnboardingSeen(true);
    router.replace('/login');
  }, [router]);

  const renderItem = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const iconRotate = scrollX.interpolate({
      inputRange,
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }, { rotate: iconRotate }], opacity }]}>
          <LinearGradient
            colors={item.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBg}
          >
            <MaterialCommunityIcons name={item.icon as any} size={80} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        <View style={styles.slideTextWrap}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDesc}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.headerCounter}>
          <Text style={styles.counterText}>{currentIndex + 1} / {SLIDES.length}</Text>
        </View>
      </View>

      <AnimatedFlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item: any) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: COLORS.primary }]}
              />
            );
          })}
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextBtn}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtnGradient}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  headerCounter: {
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconWrap: {
    marginBottom: 48,
  },
  iconBg: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  slideTextWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  paginator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextBtn: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  nextBtnGradient: {
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
