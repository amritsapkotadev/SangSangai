import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
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
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGlow}
          >
            <MaterialCommunityIcons name="pine-tree" size={64} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.textWrap,
            { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
          ]}
        >
          <Text style={styles.title}>SangSangai</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineRow, { opacity: taglineOpacity }]}>
          <View style={styles.line} />
          <Text style={styles.tagline}>Safe trekking, side by side</Text>
          <View style={styles.line} />
        </Animated.View>
      </View>
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
    marginBottom: 36,
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
  textWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1.2,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
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
});
