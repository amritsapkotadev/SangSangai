import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { MapPin, ShieldCheck, ArrowLeft } from "lucide-react-native";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Fallback to localhost:3000 if not running on physical device
  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

  const handleCompleteTrip = async () => {
    Alert.alert(
      "Complete Trip",
      "Are you sure you want to end this trip? You will receive 200 SangPoints.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Complete", 
          style: "default",
          onPress: async () => {
            setLoading(true);
            try {
              // Call our backend API to complete trip and mint points on Polygon
              const res = await axios.post(`${API_URL}/matches/${id}/complete`);
              if (res.data.success) {
                setCompleted(true);
                setTxHash(res.data.txHash);
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to complete trip. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft color="#1C3F60" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-mountainBlue ml-2">Trip Details</Text>
      </View>

      <View className="p-6 flex-1">
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
            <MapPin color="#1C3F60" size={40} />
          </View>
          <Text className="text-3xl font-extrabold text-gray-800">Mardi Himal</Text>
          <Text className="text-gray-500 text-lg mt-1">Trip ID: {id}</Text>
        </View>

        {completed ? (
          <View className="bg-green-50 p-6 rounded-2xl items-center border border-green-200 shadow-sm mt-4">
            <ShieldCheck color="#059669" size={60} className="mb-4" />
            <Text className="text-2xl font-bold text-green-700 mb-2">Trip Completed!</Text>
            <Text className="text-green-800 text-center mb-4">
              You've safely completed this journey and earned <Text className="font-bold">200 SangPoints</Text>.
            </Text>
            {txHash && (
              <View className="bg-white p-3 rounded-lg w-full border border-green-100">
                <Text className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Blockchain TX Hash</Text>
                <Text className="text-xs text-gray-600 font-mono" numberOfLines={1} ellipsizeMode="middle">
                  {txHash}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              onPress={() => router.replace("/(tabs)/dashboard")}
              className="mt-6 bg-green-600 w-full py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-lg">Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-auto">
            <View className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
              <Text className="text-orange-800 text-center">
                Only complete the trip once both you and the trekker have safely reached the final destination.
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleCompleteTrip}
              disabled={loading}
              className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-md ${loading ? 'bg-gray-400' : 'bg-nepalRed'}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg tracking-wide">Complete Trip & Claim Points</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
