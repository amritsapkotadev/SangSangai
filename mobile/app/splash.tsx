import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }).start();

    const t = setTimeout(() => {
      router.replace('/(tabs)/dashboard');
    }, 2000);

    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 bg-gradient-to-b from-mountainBlue/80 to-nepalRed/80 items-center justify-center">
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <View className="w-36 h-36 bg-white/10 rounded-3xl items-center justify-center shadow-lg">
          <Text className="text-6xl">🏔️</Text>
        </View>

        <Text className="text-4xl text-white font-extrabold mt-6">SangSangai</Text>
        <Text className="text-white/90 mt-2 text-center px-8">Safe trekking, side by side — find guides and trekkers near you.</Text>
      </Animated.View>
    </View>
  );
}
