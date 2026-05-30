import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, CheckCircle, Clock } from "lucide-react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeTrip = {
    id: "trip-123",
    destination: "Mardi Himal Base Camp",
    trekker: "Leon S.",
    status: "DEPARTED",
    nextWaypoint: "Forest Camp (12h)",
    progress: 50,
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800 mb-2">Namaste, Aarav</Text>
        <Text className="text-gray-500 mb-6">You have 1 active trip right now.</Text>

        {/* Active Trip Card */}
        <View
          className="bg-white rounded-2xl p-5 mb-6 border border-gray-100"
          style={Platform.OS === "android" ? { elevation: 3 } : { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-bold text-xs tracking-wider">ACTIVE</Text>
            </View>
            <Text className="text-gray-400 text-sm">Trip #{activeTrip.id.slice(-4)}</Text>
          </View>

          <Text className="text-2xl font-extrabold text-gray-800 mb-1">{activeTrip.destination}</Text>
          <Text className="text-gray-500 mb-4">Trekking with {activeTrip.trekker}</Text>

          {/* Progress Bar */}
          <View className="w-full bg-gray-100 h-2 rounded-full mb-4">
            <View className="bg-red-500 h-2 rounded-full" style={{ width: `${activeTrip.progress}%` }} />
          </View>

          <View className="flex-row items-center mb-6 bg-blue-50 p-3 rounded-lg">
            <MapPin color="#1C3F60" size={20} />
            <Text className="ml-2 text-gray-700 font-medium">Next Waypoint: {activeTrip.nextWaypoint}</Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1 bg-blue-700 py-3 rounded-xl items-center flex-row justify-center"
            >
              <CheckCircle color="#fff" size={18} />
              <Text className="text-white font-bold ml-2">Confirm Arrival</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/trip/${activeTrip.id}`)}
              className="bg-gray-100 py-3 px-5 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-bold">Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-4">Upcoming Trips</Text>
        <View className="bg-white rounded-2xl p-5 border border-dashed border-gray-300 items-center py-8">
          <Clock color="#9CA3AF" size={32} className="mb-2" />
          <Text className="text-gray-500 text-center">No upcoming trips scheduled yet.{'\n'}Browse matching requests to connect with trekkers.</Text>
        </View>
      </View>
    </ScrollView>
  );
}
