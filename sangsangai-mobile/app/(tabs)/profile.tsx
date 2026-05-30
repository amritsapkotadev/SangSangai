import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function ProfileScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sangPoints, setSangPoints] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
        const res = await axios.get(`${API_URL}/users/me/sangpoints`);
        if (res.data && res.data.success) {
          setSangPoints(res.data.sangPoints);
          setWalletAddress(res.data.walletAddress);
        }
      } catch (err) {
        console.warn("Failed to fetch SangPoints:", err);
      }
    };
    fetchPoints();
  }, []);

  const StatCard = ({ value, label }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: '#8E8E93' }}>{label}</Text>
    </View>
  );

  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true, rightElement }) => (
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
        <Ionicons name={icon} size={22} color="#FF385C" />
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
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 8,
            borderRadius: 20,
          }}
        >
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center', marginTop: -50, marginBottom: 20 }}>
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: '#FF385C',
            alignItems: 'center', 
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }}>
            <Text style={{ fontSize: 48 }}>✈️</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF385C' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={{ paddingHorizontal: 20, alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Aarav</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="location-outline" size={14} color="#8E8E93" />
          <Text style={{ fontSize: 13, color: '#8E8E93', marginLeft: 4 }}>New York, USA</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>🌍 Explorer</Text>
          </View>
          <View style={{ backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>⭐ 4.8</Text>
          </View>
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
        <StatCard value="12" label="Trips" />
        <View style={{ width: 1, height: 30, backgroundColor: '#F0F0F0', marginHorizontal: 16 }} />
        <StatCard value="8" label="Countries" />
        <View style={{ width: 1, height: 30, backgroundColor: '#F0F0F0', marginHorizontal: 16 }} />
        <StatCard value="156" label="Photos" />
      </View>

      {/* Blockchain Wallet Card */}
      <View style={{
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#1C3F60',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>SANGPOINTS WALLET</Text>
          <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>POLYGON AMOY</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '800' }}>
            {sangPoints !== null ? sangPoints : '0'}
          </Text>
          <Text style={{ color: '#FF385C', fontSize: 16, fontWeight: '700', marginLeft: 6 }}>SANG</Text>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}>Wallet Address</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }} numberOfLines={1} ellipsizeMode="middle">
            {walletAddress || "0xeC5eA63092348C7B473678F2F41875963527a895"}
          </Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, letterSpacing: 0.5 }}>
          MY ACTIVITY
        </Text>
        <MenuItem 
          icon="calendar-outline" 
          title="My Trips" 
          subtitle="View all your bookings"
          onPress={() => console.log('My Trips')}
        />
        <MenuItem 
          icon="heart-outline" 
          title="Saved Places" 
          subtitle="12 destinations saved"
          onPress={() => console.log('Saved')}
        />
        <MenuItem 
          icon="star-outline" 
          title="Reviews" 
          subtitle="8 reviews written"
          onPress={() => console.log('Reviews')}
        />
        <MenuItem 
          icon="camera-outline" 
          title="My Photos" 
          subtitle="156 memories shared"
          onPress={() => console.log('Photos')}
          showArrow={false}
        />
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
              trackColor={{ false: '#E5E5EA', true: '#FF385C' }}
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
              trackColor={{ false: '#E5E5EA', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem 
          icon="moon-outline" 
          title="Dark Mode" 
          subtitle="Theme preference"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E5E5EA', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, letterSpacing: 0.5 }}>
          SUPPORT
        </Text>
        <MenuItem 
          icon="help-circle-outline" 
          title="Help Center" 
          onPress={() => console.log('Help')}
        />
        <MenuItem 
          icon="chatbubble-outline" 
          title="Contact Support" 
          onPress={() => console.log('Contact')}
        />
        <MenuItem 
          icon="share-social-outline" 
          title="Share Profile" 
          onPress={() => console.log('Share')}
        />
        <MenuItem 
          icon="document-text-outline" 
          title="Terms & Privacy" 
          onPress={() => console.log('Terms')}
          showArrow={false}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive' }
        ])}
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