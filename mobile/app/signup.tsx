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

const GREEN = '#059669';
const GREEN_LIGHT = '#34d399';

type Role = 'NEPALI' | 'FOREIGN';

const ROLE_OPTIONS: { value: Role; label: string; icon: string; desc: string }[] = [
  { value: 'NEPALI', label: 'Guide', icon: 'compass', desc: 'I am a local guide' },
  { value: 'FOREIGN', label: 'Trekker', icon: 'hiking', desc: 'I am a traveler' },
];

export default function SignupScreen() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

  const validate = () => {
    if (name.trim().length < 2) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@') || !email.includes('.')) return 'Please enter a valid email address.';
    if (!password || password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!role) return 'Please select your role.';
    if (!agreeToTerms) return 'Please agree to the Terms of Service and Privacy Policy.';
    return '';
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) { Alert.alert('Validation Error', err); return; }

    setIsLoading(true);
    try {
      await signup({ email, password, name, role: role! });
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      console.log('[SangSangai] 🔐 Signup error full:', err);
      console.log('[SangSangai] 🔐 Signup error response:', err?.response?.status, JSON.stringify(err?.response?.data));

      let msg = 'Something went wrong. Please try again.';
      if (err?.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err?.code === 'ERR_NETWORK') {
        msg = 'Cannot reach the server. Make sure the web backend is running.';
      } else if (err?.code === 'ECONNREFUSED') {
        msg = 'Connection refused. Is the backend server running?';
      }
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = ['#ef4444', '#f59e0b', '#fbbf24', '#10b981'];
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'];

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
              className="flex-1 px-6 pt-4 pb-12"
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
                    <MaterialCommunityIcons name="account-group" size={40} color="#ffffff" />
                  </LinearGradient>
                </Animated.View>
                
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Create Account
                </Text>
                <Text className="text-gray-500 text-center text-base">
                  Join our community of trekkers and guides
                </Text>
              </View>

              <View className="mb-6">
                {/* Role Selector */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3 ml-1">
                    I am a...
                  </Text>
                  <View className="flex-row gap-3">
                    {ROLE_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setRole(opt.value)}
                        activeOpacity={0.7}
                        className="flex-1"
                      >
                        <View
                          style={{
                            borderWidth: 2,
                            borderRadius: 16,
                            borderColor: role === opt.value ? GREEN : '#e5e7eb',
                            backgroundColor: role === opt.value ? '#ecfdf5' : '#f9fafb',
                            padding: 16,
                            alignItems: 'center',
                          }}
                        >
                          <MaterialCommunityIcons
                            name={opt.icon as any}
                            size={28}
                            color={role === opt.value ? GREEN : '#9ca3af'}
                          />
                          <Text
                            className="font-semibold text-sm mt-2"
                            style={{ color: role === opt.value ? GREEN : '#6b7280' }}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">{opt.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Name Input */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Full Name
                  </Text>
                  <View
                    style={{
                      borderWidth: 1.5, borderRadius: 16,
                      backgroundColor: nameFocused ? '#ecfdf5' : '#f9fafb',
                      borderColor: nameFocused ? GREEN : '#e5e7eb',
                      flexDirection: 'row', alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="user" size={20} color={nameFocused ? GREEN : '#9ca3af'} />
                    </View>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="John Doe"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 py-4 text-gray-800"
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                    />
                    {name.length > 0 && (
                      <TouchableOpacity onPress={() => setName('')} className="px-3">
                        <Feather name="x" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Email Input */}
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

                {/* Password Input */}
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
                      placeholder="Create a strong password"
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
                  
                  {password.length > 0 && (
                    <View className="mt-2">
                      <View className="flex-row gap-1 mb-1">
                        {[0, 1, 2, 3].map((index) => (
                          <View
                            key={index}
                            style={{
                              flex: 1, height: 4, borderRadius: 2,
                              backgroundColor: index < passwordStrength ? strengthColors[passwordStrength - 1] : '#e5e7eb',
                            }}
                          />
                        ))}
                      </View>
                      <Text className="text-xs text-gray-500">
                        Password strength:{' '}
                        <Text style={{ color: strengthColors[passwordStrength - 1] }}>
                          {passwordStrength > 0 ? strengthText[passwordStrength - 1] : 'Too weak'}
                        </Text>
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Confirm Password
                  </Text>
                  <View
                    style={{
                      borderWidth: 1.5, borderRadius: 16,
                      backgroundColor: confirmPasswordFocused ? '#ecfdf5' : '#f9fafb',
                      borderColor: confirmPasswordFocused ? GREEN : '#e5e7eb',
                      flexDirection: 'row', alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="check-circle" size={20} color={confirmPasswordFocused ? GREEN : '#9ca3af'} />
                    </View>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9ca3af"
                      className="flex-1 py-4 text-gray-800"
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="px-3"
                    >
                      <Feather 
                        name={showConfirmPassword ? "eye-off" : "eye"} 
                        size={20} color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      Passwords do not match
                    </Text>
                  )}
                </View>

                {/* Terms and Conditions */}
                <TouchableOpacity 
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  className="flex-row items-start mt-2 mb-6"
                  activeOpacity={0.7}
                >
                  <View className={`w-5 h-5 rounded-md border-2 mr-3 mt-0.5 items-center justify-center ${
                    agreeToTerms ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 bg-white'
                  }`}>
                    {agreeToTerms && <Feather name="check" size={14} color="white" />}
                  </View>
                  <Text className="flex-1 text-sm text-gray-600">
                    I agree to the{' '}
                    <Text className="text-emerald-600 font-semibold">Terms of Service</Text>
                    {' '}and{' '}
                    <Text className="text-emerald-600 font-semibold">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Signup Button */}
                <TouchableOpacity 
                  onPress={handleSignup} 
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
                          Create Account
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="mx-4 text-gray-400 text-sm">or sign up with</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    onPress={() => Alert.alert('Social Signup', 'Sign up with Google')}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-xl border border-gray-200 bg-white"
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="google" size={20} color="#ea4335" />
                    <Text className="ml-2 text-gray-700 font-medium">Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => Alert.alert('Social Signup', 'Sign up with Apple')}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-xl border border-gray-200 bg-white"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-apple" size={20} color="#000000" />
                    <Text className="ml-2 text-gray-700 font-medium">Apple</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 text-sm">Already have an account? </Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/login')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-emerald-600 font-semibold text-sm">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            <View className="pb-8 px-6">
              <Text className="text-center text-xs text-gray-400">
                By creating an account, you agree to our
                {' '}<Text className="text-emerald-500">Terms</Text> and{' '}
                <Text className="text-emerald-500">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
