import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, this would call our /api/auth/login endpoint
    // For now, we mock success and go straight to the tabs
    router.replace("/(tabs)/dashboard");
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="w-full items-center mb-12">
        <View className="w-24 h-24 bg-nepalRed rounded-full items-center justify-center mb-6 shadow-lg shadow-nepalRed/30">
          <Text className="text-white text-4xl font-bold">🏔️</Text>
        </View>
        <Text className="text-4xl font-extrabold text-mountainBlue tracking-tight">SangSangai</Text>
        <Text className="text-gray-500 mt-2 text-center text-lg">Safe trekking, side by side.</Text>
      </View>

      <View className="w-full space-y-4">
        <TouchableOpacity 
          onPress={handleLogin}
          className="w-full bg-nepalRed py-4 rounded-xl shadow-md active:opacity-90"
        >
          <Text className="text-white text-center font-bold text-lg">Login as Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace("/(tabs)/browse")}
          className="w-full bg-mountainBlue py-4 rounded-xl shadow-md active:opacity-90"
        >
          <Text className="text-white text-center font-bold text-lg">Login as Trekker</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
