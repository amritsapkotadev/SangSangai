import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validate = () => {
    if (name.trim().length === 0) return 'Please enter your full name.';
    if (!email.includes('@')) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleSignup = () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation', err);
      return;
    }
    // TODO: actual signup flow
    router.replace('/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-50">
      <View className="px-6 pt-6">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center">
          <Text className="text-xl">‹</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 justify-center">
        <View className="bg-white rounded-3xl p-6 shadow-lg">
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-mountainBlue rounded-2xl items-center justify-center shadow-sm">
              <Text className="text-2xl text-white">✨</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mt-4">Create Account</Text>
            <Text className="text-gray-500 mt-1 text-center">Sign up to join the SangSangai community of trekkers and guides.</Text>
          </View>

          <View className="mt-4 space-y-3">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Full name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Your full name" className="border border-gray-200 rounded-lg px-3 py-3 bg-white" placeholderTextColor="#9CA3AF" />
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Email</Text>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" className="border border-gray-200 rounded-lg px-3 py-3 bg-white" placeholderTextColor="#9CA3AF" />
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Password</Text>
              <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Choose a strong password" className="border border-gray-200 rounded-lg px-3 py-3 bg-white" placeholderTextColor="#9CA3AF" />
            </View>

            <TouchableOpacity onPress={handleSignup} className="mt-3 bg-gradient-to-r from-mountainBlue to-nepalRed py-3 rounded-xl items-center">
              <Text className="text-white font-bold">Create account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')} className="items-center mt-3">
              <Text className="text-sm text-gray-600">Already have an account? <Text className="text-mountainBlue font-semibold">Log in</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
