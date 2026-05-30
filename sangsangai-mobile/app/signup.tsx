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

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validate = () => {
    if (name.trim().length === 0) {
      return 'Please enter your full name.';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    if (!email.trim()) {
      return 'Please enter your email address.';
    }
    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address.';
    }
    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    if (!agreeToTerms) {
      return 'Please agree to the Terms of Service and Privacy Policy.';
    }
    return '';
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation Error', err);
      return;
    }
    
    setIsLoading(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    // TODO: actual signup flow
    Alert.alert(
      'Success!',
      'Your account has been created successfully.',
      [{ text: 'Continue', onPress: () => router.replace('/(tabs)/dashboard') }]
    );
  };

  const handleSocialSignup = (provider: string) => {
    Alert.alert('Social Signup', `Sign up with ${provider}`);
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
            {/* Back Button */}
            <Animated.View 
              style={{ opacity: fadeAnim }}
              className="px-6 pt-12"
            >
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
            </Animated.View>

            {/* Main Content */}
            <Animated.View 
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
              className="flex-1 px-6 pt-4 pb-12"
            >
              {/* Header Section */}
              <View className="items-center mb-8">
                <Animated.View 
                  style={{ transform: [{ scale: scaleAnim }] }}
                  className="mb-4"
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6', '#a78bfa']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="account-plus" size={40} color="#ffffff" />
                  </LinearGradient>
                </Animated.View>
                
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Create Account
                </Text>
                <Text className="text-gray-500 text-center text-base">
                  Join our community and start learning today
                </Text>
              </View>

              {/* Form Section */}
              <View className="mb-6">
                {/* Name Input */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Full Name
                  </Text>
                  <View
                    style={{
                      borderWidth: 1.5,
                      borderRadius: 16,
                      backgroundColor: nameFocused ? '#fef3c7' : '#f9fafb',
                      borderColor: nameFocused ? '#f59e0b' : '#e5e7eb',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="user" size={20} color={nameFocused ? '#f59e0b' : '#9ca3af'} />
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
                      borderWidth: 1.5,
                      borderRadius: 16,
                      backgroundColor: emailFocused ? '#fef3c7' : '#f9fafb',
                      borderColor: emailFocused ? '#f59e0b' : '#e5e7eb',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="mail" size={20} color={emailFocused ? '#f59e0b' : '#9ca3af'} />
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
                      borderWidth: 1.5,
                      borderRadius: 16,
                      backgroundColor: passwordFocused ? '#fef3c7' : '#f9fafb',
                      borderColor: passwordFocused ? '#f59e0b' : '#e5e7eb',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="lock" size={20} color={passwordFocused ? '#f59e0b' : '#9ca3af'} />
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
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <View className="mt-2">
                      <View className="flex-row gap-1 mb-1">
                        {[0, 1, 2, 3].map((index) => (
                          <View
                            key={index}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: index < passwordStrength ? strengthColors[passwordStrength - 1] : '#e5e7eb',
                            }}
                          />
                        ))}
                      </View>
                      <Text className="text-xs text-gray-500">
                        Password strength: <Text style={{ color: strengthColors[passwordStrength - 1] }}>
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
                      borderWidth: 1.5,
                      borderRadius: 16,
                      backgroundColor: confirmPasswordFocused ? '#fef3c7' : '#f9fafb',
                      borderColor: confirmPasswordFocused ? '#f59e0b' : '#e5e7eb',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View className="px-3">
                      <Feather name="check-circle" size={20} color={confirmPasswordFocused ? '#f59e0b' : '#9ca3af'} />
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
                        size={20} 
                        color="#9ca3af" 
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
                    agreeToTerms ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                  }`}>
                    {agreeToTerms && <Feather name="check" size={14} color="white" />}
                  </View>
                  <Text className="flex-1 text-sm text-gray-600">
                    I agree to the{' '}
                    <Text className="text-indigo-600 font-semibold">Terms of Service</Text>
                    {' '}and{' '}
                    <Text className="text-indigo-600 font-semibold">Privacy Policy</Text>
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
                    colors={['#6366f1', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      shadowColor: '#6366f1',
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

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="mx-4 text-gray-400 text-sm">or sign up with</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Social Signup Buttons */}
                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    onPress={() => handleSocialSignup('Google')}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-xl border border-gray-200 bg-white"
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="google" size={20} color="#ea4335" />
                    <Text className="ml-2 text-gray-700 font-medium">Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleSocialSignup('Apple')}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-xl border border-gray-200 bg-white"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-apple" size={20} color="#000000" />
                    <Text className="ml-2 text-gray-700 font-medium">Apple</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 text-sm">Already have an account? </Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/login')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-indigo-600 font-semibold text-sm">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* Footer */}
            <View className="pb-8 px-6">
              <Text className="text-center text-xs text-gray-400">
                By creating an account, you agree to our
                {' '}<Text className="text-indigo-500">Terms</Text> and <Text className="text-indigo-500">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}