import { Tabs } from "expo-router";
import { Map, Users, User, Bell, MessageCircle, Mountain, Mail, Settings, Heart } from "lucide-react-native";
import { View, Text, Platform } from "react-native";



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
          color: "#1f2937",
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "My Trips",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Map color={color} size={22} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#6366f1",
                }} />
              )}
            </View>
          ),
        }}
      />
      
      
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Users color={color} size={22} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#6366f1",
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Mail color={color} size={22} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#6366f1'
                }} />
              )}
              {/* Optional: Message badge */}
              <View style={{
                position: 'absolute',
                top: -6,
                right: -10,
                backgroundColor: '#ef4444',
                borderRadius: 10,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>2</Text>
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Bell color={color} size={22} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#6366f1'
                }} />
              )}
              {/* Optional: Notification badge */}
              <View style={{
                position: 'absolute',
                top: -6,
                right: -10,
                backgroundColor: '#ef4444',
                borderRadius: 10,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>5</Text>
              </View>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <User color={color} size={22} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#6366f1",
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Settings color={color} size={22} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#6366f1'
                }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}