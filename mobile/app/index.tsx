import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { storage } from '../src/lib/storage';
import { COLORS } from '../src/constants/theme';

export default function SplashEntryScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(40)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  const navigateNext = useCallback(async () => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
      return;
    }

    const onboardingSeen = await storage.getOnboardingSeen();
    if (!onboardingSeen) {
      router.replace('/onboarding');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 3,
          tension: 35,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(navigateNext, 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(navigateNext, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoOuter,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGlow}
          >
            <View style={styles.logoInner}>
              <MaterialCommunityIcons name="compass" size={56} color="#ffffff" />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>SangSangai</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>Safe trekking, side by side</Text>
          <View style={styles.taglineLine} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: taglineOpacity }]}>
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, styles.loadingDotActive]} />
        <View style={styles.loadingDot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoOuter: {
    marginBottom: 40,
  },
  logoGlow: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1.5,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taglineLine: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 60,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  loadingDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
