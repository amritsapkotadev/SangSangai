import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator,
  Animated,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../src/constants/theme';

const GREEN = COLORS.primary;
const GREEN_LIGHT = COLORS.primaryLight;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) { Alert.alert('Validation Error', 'Please enter your email address.'); return; }
    if (!email.includes('@') || !email.includes('.')) { Alert.alert('Validation Error', 'Please enter a valid email address.'); return; }
    if (!password) { Alert.alert('Validation Error', 'Please enter your password.'); return; }
    if (password.length < 6) { Alert.alert('Validation Error', 'Password must be at least 6 characters.'); return; }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      console.log('[SangSangai] 🔐 Login error full:', err);
      console.log('[SangSangai] 🔐 Login error response:', err?.response?.status, JSON.stringify(err?.response?.data));
      console.log('[SangSangai] 🔐 Login error message:', err?.message);
      console.log('[SangSangai] 🔐 Login error code:', err?.code);

      let msg = 'Something went wrong. Please try again.';
      if (err?.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err?.code === 'ERR_NETWORK') {
        msg = 'Cannot reach the server. Make sure the web backend is running.';
      } else if (err?.code === 'ECONNREFUSED') {
        msg = 'Connection refused. Is the backend server running?';
      } else if (err?.code === 'ERR_BAD_RESPONSE') {
        msg = 'Server error (500). Check the backend logs.';
      } else if (err?.message?.includes('timeout')) {
        msg = 'Request timed out. Is the server reachable?';
      }
      Alert.alert('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 bg-white"
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1">
            <Animated.View style={{ opacity: fadeAnim }} className="px-6 pt-12">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
              className="flex-1 px-6 pt-8 pb-12"
            >
              <View className="items-center mb-8">
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="mb-4">
                  <LinearGradient
                    colors={[GREEN, GREEN_LIGHT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 80, height: 80, borderRadius: 24,
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="compass" size={40} color="#ffffff" />
                  </LinearGradient>
                </Animated.View>
                
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </Text>
                <Text className="text-gray-500 text-center text-base">
                  Sign in to continue your trekking journey
                </Text>
              </View>

              <View className="mb-6">
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Email Address
                  </Text>
                  <View
                    style={{
                      borderWidth: 1.5, borderRadius: 16,
                      backgroundColor: emailFocused ? '#ecfdf5' : '#f9fafb',
                      borderColor: emailFocused ? GREEN : '#e5e7eb',
                      flexDirection: 'row', alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="mail" size={20} color={emailFocused ? GREEN : '#9ca3af'} />
                    </View>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="hello@example.com"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 py-4 text-gray-800"
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                    {email.length > 0 && (
                      <TouchableOpacity onPress={() => setEmail('')} className="px-3">
                        <Feather name="x" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className="mb-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Password
                  </Text>
                  <View
                    style={{
                      borderWidth: 1.5, borderRadius: 16,
                      backgroundColor: passwordFocused ? '#ecfdf5' : '#f9fafb',
                      borderColor: passwordFocused ? GREEN : '#e5e7eb',
                      flexDirection: 'row', alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="lock" size={20} color={passwordFocused ? GREEN : '#9ca3af'} />
                    </View>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 py-4 text-gray-800"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)} 
                      className="px-3"
                    >
                      <Feather 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-3 mb-6">
                  <TouchableOpacity 
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <View className={`w-5 h-5 rounded-md border-2 mr-2 items-center justify-center ${
                      rememberMe ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 bg-white'
                    }`}>
                      {rememberMe && <Feather name="check" size={14} color="white" />}
                    </View>
                    <Text className="text-sm text-gray-600">Remember me</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => Alert.alert('Reset Password', 'Password reset link will be sent to your email')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-semibold text-emerald-600">Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={handleLogin} 
                  activeOpacity={0.85}
                  disabled={isLoading}
                  className="mb-6"
                >
                  <LinearGradient
                    colors={[GREEN, '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      shadowColor: GREEN,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    <View className="py-4 items-center justify-center">
                      {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="text-white font-bold text-base tracking-wide">
                          Sign In
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="mx-4 text-gray-400 text-sm">or continue with</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    onPress={() => Alert.alert('Social Login', 'Sign in with Google')}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-xl border border-gray-200 bg-white"
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="google" size={20} color="#ea4335" />
                    <Text className="ml-2 text-gray-700 font-medium">Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => Alert.alert('Social Login', 'Sign in with Apple')}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-xl border border-gray-200 bg-white"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-apple" size={20} color="#000000" />
                    <Text className="ml-2 text-gray-700 font-medium">Apple</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 text-sm">Don't have an account? </Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/signup')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-emerald-600 font-semibold text-sm">Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            <View className="pb-8 px-6">
              <Text className="text-center text-xs text-gray-400">
                By signing in, you agree to our{' '}
                <Text className="text-emerald-500">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-emerald-500">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
