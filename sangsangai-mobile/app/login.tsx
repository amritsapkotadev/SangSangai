import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = () => {
    if (!email.includes('@')) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleLogin = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation', err);
      return;
    }
    
    setIsLoading(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // TODO: hook up auth - mocked for now
    router.replace('/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
      <View className="px-6 pt-12">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-white/80 shadow-sm items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-2xl text-gray-700">←</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 justify-center -mt-10">
        <View className="bg-white/95 rounded-3xl p-8 shadow-2xl" style={{ elevation: 10 }}>
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-gradient-to-br from-nepalRed to-mountainBlue rounded-2xl items-center justify-center shadow-lg mb-3">
              <Text className="text-4xl text-white">🏔️</Text>
            </View>
            <Text className="text-3xl font-extrabold text-gray-800 mt-2">Welcome back</Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">Sign in to continue your journey</Text>
          </View>

          <View className="mt-2 space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Email address</Text>
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 16,
                  backgroundColor: '#F9FAFB',
                  borderColor: emailFocused ? '#1C3F60' : '#E5E7EB',
                  overflow: 'hidden',
                }}
              >
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="hello@example.com"
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-3.5 text-gray-800"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Password</Text>
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 16,
                  backgroundColor: '#F9FAFB',
                  borderColor: passwordFocused ? '#1C3F60' : '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 px-4 py-3.5 text-gray-800"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword((s) => !s)} 
                  className="px-3"
                  activeOpacity={0.6}
                >
                  <Text className="text-sm font-medium text-mountainBlue">
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleLogin} 
              activeOpacity={0.85}
              disabled={isLoading}
              className="mt-4 bg-gradient-to-r from-nepalRed to-mountainBlue py-3.5 rounded-xl shadow-lg"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-center text-base tracking-wide">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity 
                onPress={() => router.push('/signup')}
                activeOpacity={0.7}
                className="py-1"
              >
                <Text className="text-sm font-semibold text-mountainBlue">Create new account →</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => Alert.alert('Reset Password', 'Password reset instructions will be sent to your email')}
                activeOpacity={0.7}
                className="py-1"
              >
                <Text className="text-sm text-gray-500 underline">Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-8 pt-6 border-t border-gray-200">
            <Text className="text-center text-xs text-gray-400">
              By signing in, you agree to our Terms of Service
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}