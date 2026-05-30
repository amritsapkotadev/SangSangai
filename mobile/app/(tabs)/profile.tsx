import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Coins } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { API_BASE_URL } from '../../src/lib/env';
import api from '../../src/lib/api';

const GREEN = '#059669';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [sangPointsBalance, setSangPointsBalance] = useState<number>(0);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  useEffect(() => {
    if (user?.role !== "NEPALI") return;
    (async () => {
      try {
        const res = await api.get('/api/users/me/sangpoints');
        if (res.data?.success && res.data?.data?.balance != null) {
          setSangPointsBalance(Number(res.data.data.balance));
        }
      } catch { /* backend unreachable — show 0 */ }
    })();
  }, [user?.role]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const avatarSource = user?.avatarUrl
    ? { uri: `${API_BASE_URL}${user.avatarUrl}` }
    : null;

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  }, [logout, router]);

  const StatCard = ({ value, label }: { value: string; label: string }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: '#8E8E93' }}>{label}</Text>
    </View>
  );

  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true, rightElement }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      }}
    >
      <View style={{ width: 36, marginRight: 12 }}>
        <Ionicons name={icon} size={22} color={GREEN} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#1A1A1A', marginBottom: subtitle ? 2 : 0 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: '#8E8E93' }}>{subtitle}</Text>
        )}
      </View>
      {rightElement ? rightElement : (showArrow && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F8F9FA' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover Image & Profile Header */}
      <View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' }}
          style={{ width: '100%', height: 180 }}
        />

        <View style={{ alignItems: 'center', marginTop: -50, marginBottom: 20 }}>
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 4,
                borderColor: '#FFFFFF',
              }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: GREEN,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 36, fontWeight: '700', color: '#FFFFFF' }}>
                {user ? getInitials(user.name) : '?'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* User Info */}
      <View style={{ paddingHorizontal: 20, alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
          {user?.name || 'User'}
        </Text>
        <Text style={{ fontSize: 14, color: '#8E8E93', marginBottom: 4 }}>
          {user?.email || ''}
        </Text>
        {user?.nationality && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="location-outline" size={14} color="#8E8E93" />
            <Text style={{ fontSize: 13, color: '#8E8E93', marginLeft: 4 }}>{user.nationality}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: GREEN }}>
              {user?.role === 'NEPALI' ? '🏔️ Guide' : user?.role === 'FOREIGN' ? '🎒 Trekker' : '👑 Admin'}
            </Text>
          </View>
          {user?.isVerified && (
            <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, color: GREEN }}>✓ Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <StatCard value="0" label="Trips" />
        {user?.role === "NEPALI" && (
          <>
            <View style={{ width: 1, height: 30, backgroundColor: '#F0F0F0', marginHorizontal: 16 }} />
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View className="flex-row items-center gap-1 mb-1">
                <Coins color={GREEN} size={18} />
                <Text style={{ fontSize: 22, fontWeight: '700', color: GREEN }}>{sangPointsBalance}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#8E8E93' }}>SangPoints</Text>
            </View>
          </>
        )}
      </View>

      {/* Menu Sections */}
      <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, letterSpacing: 0.5 }}>
          MY ACTIVITY
        </Text>
        <MenuItem icon="calendar-outline" title="My Trips" subtitle="View all your bookings" onPress={() => {}} />
        <MenuItem icon="heart-outline" title="Saved Places" subtitle="Destinations saved" onPress={() => {}} />
        <MenuItem icon="star-outline" title="Reviews" subtitle="Reviews written" onPress={() => {}} />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, letterSpacing: 0.5 }}>
          PREFERENCES
        </Text>
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Trip updates and offers"
          rightElement={
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E5EA', true: GREEN }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem
          icon="mail-outline"
          title="Email Updates"
          subtitle="Booking confirmations"
          rightElement={
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E5E5EA', true: GREEN }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, letterSpacing: 0.5 }}>
          SUPPORT
        </Text>
        <MenuItem icon="help-circle-outline" title="Help Center" onPress={() => {}} />
        <MenuItem icon="chatbubble-outline" title="Contact Support" onPress={() => {}} />
        <MenuItem icon="share-social-outline" title="Share Profile" onPress={() => {}} />
        <MenuItem icon="document-text-outline" title="Terms & Privacy" onPress={() => {}} showArrow={false} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 20,
          marginBottom: 40,
          paddingVertical: 14,
          backgroundColor: '#FFF5F5',
          borderRadius: 12,
          gap: 8,
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF385C" />
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FF385C' }}>Log Out</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', fontSize: 12, color: '#C7C7CC', marginBottom: 20 }}>Version 1.0.0</Text>
    </ScrollView>
  );
}
