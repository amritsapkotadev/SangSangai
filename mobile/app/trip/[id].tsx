import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator,
  TextInput, ScrollView, Animated, Dimensions, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchMyMatches, acceptMatch, departMatch, completeMatch,
  confirmWaypoint,
  type MatchData, type MatchWaypointProgress,
} from '../../src/lib/tripApi';

const GREEN = '#059669';
const { width } = Dimensions.get('window');

type Step = 'trip' | 'review' | 'done';

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [step, setStep] = useState<Step>('trip');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const loadMatch = useCallback(async () => {
    try {
      const all = await fetchMyMatches();
      const found = all.find((m) => m.id === id);
      if (found) setMatch(found);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadMatch(); }, [loadMatch]);

  const animateTransition = (next: Step) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      .start(() => {
        setStep(next);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
  };

  const isGuide = match?.guideTrip.guide?.id === (match as any)?._guideId;
  const allConfirmed = match?.waypointProgresses?.every((wp) => wp.confirmedAt) ?? false;
  const confirmedCount = match?.waypointProgresses?.filter((wp) => wp.confirmedAt).length ?? 0;
  const totalWaypoints = match?.waypointProgresses?.length ?? 0;

  const handleDepart = async () => {
    Alert.alert('Confirm Departure', 'Have both you and the trekker started the trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Depart Now', style: 'default',
        onPress: async () => {
          setActionLoading(true);
          try {
            await departMatch(match!.id);
            await loadMatch();
            Alert.alert('✅ Departed!', 'Trip is now in progress. Confirm waypoints as you go.');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to depart');
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  const handleConfirmWaypoint = async (wpId: string) => {
    setActionLoading(true);
    try {
      await confirmWaypoint(wpId, match!.id);
      await loadMatch();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to confirm waypoint');
    } finally { setActionLoading(false); }
  };

  const handleCompleteTrip = async () => {
    if (!allConfirmed) {
      Alert.alert('Waypoints Not Confirmed', 'Please confirm all waypoints before completing the trip.');
      return;
    }
    Alert.alert('Complete Trip', 'Have you both safely completed the trek?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Complete!', style: 'default',
        onPress: async () => {
          setActionLoading(true);
          try {
            const result = await completeMatch(match!.id);
            setTxHash(result.transactionHash);
            await loadMatch();
            animateTransition('review');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to complete trip');
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { Alert.alert('Rating Required', 'Please select a star rating.'); return; }
    if (!reviewText.trim()) { Alert.alert('Review Required', 'Please write a review.'); return; }
    setSubmittingReview(true);
    try {
      const api = (await import('../../src/lib/api')).default;
      await api.post('/api/reviews', { matchId: id, rating, comment: reviewText.trim() });
    } catch {} finally {
      setSubmittingReview(false);
      animateTransition('done');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16, textAlign: 'center' }}>Trip not found</Text>
        <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>This trip may have been removed or you don't have access.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 14 }}>
          <Text style={{ color: '#ffffff', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const routeName = match.guideTrip.route?.name || 'Unknown Trek';
  const guide = match.guideTrip.guide;
  const trekker = match.trekkerTrip.trekker;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginLeft: 12 }}>Trip Details</Text>
        <View style={{ marginLeft: 'auto', backgroundColor: match.status === 'ACCEPTED' ? '#d1fae5' : match.status === 'DEPARTED' ? '#fef3c7' : match.status === 'COMPLETED' ? '#dbeafe' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: match.status === 'ACCEPTED' ? '#065f46' : match.status === 'DEPARTED' ? '#92400e' : match.status === 'COMPLETED' ? '#1e40af' : '#6b7280' }}>
            {match.status}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="flag-outline" size={40} color={GREEN} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937' }}>{routeName}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{match.guideTrip.route?.region}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>{guide?.name?.charAt(0) || 'G'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>Guide</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>{guide?.name || 'Unknown'}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280' }}>{trekker?.name?.charAt(0) || 'T'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>Trekker</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>{trekker?.name || 'You'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: '#f0fdf4', padding: 16, borderRadius: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#065f46', marginBottom: 12 }}>
            Waypoints ({confirmedCount}/{totalWaypoints} confirmed)
          </Text>
          {match.waypointProgresses.map((wp, idx) => {
            const isLast = idx === match.waypointProgresses.length - 1;
            return (
              <View key={wp.waypointId} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: isLast ? 0 : 12 }}>
                <View style={{ alignItems: 'center', width: 28 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14,
                    backgroundColor: wp.confirmedAt ? GREEN : '#d1d5db',
                    alignItems: 'center', justifyContent: 'center' }}>
                    {wp.confirmedAt ? (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>{wp.waypoint.order}</Text>
                    )}
                  </View>
                  {!isLast && <View style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: wp.confirmedAt ? GREEN : '#e5e7eb' }} />}
                </View>
                <View style={{ flex: 1, marginLeft: 12, paddingBottom: isLast ? 0 : 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>{wp.waypoint.name}</Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>{wp.waypoint.estimatedHours}h estimated</Text>
                    </View>
                    {match.status === 'DEPARTED' && !wp.confirmedAt && (
                      <TouchableOpacity onPress={() => handleConfirmWaypoint(wp.waypointId)}
                        disabled={actionLoading}
                        style={{ backgroundColor: GREEN, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 }}>
                        <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
                          {actionLoading ? '...' : 'Reached'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {wp.confirmedAt && (
                      <View style={{ backgroundColor: '#d1fae5', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 }}>
                        <Text style={{ color: '#065f46', fontSize: 11, fontWeight: '600' }}>✓ Confirmed</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {match.status === 'ACCEPTED' && (
          <TouchableOpacity onPress={handleDepart} disabled={actionLoading}
            style={{ backgroundColor: GREEN, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16 }}>
            {actionLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>Depart Now</Text>
            )}
          </TouchableOpacity>
        )}

        {match.status === 'DEPARTED' && (
          <TouchableOpacity onPress={handleCompleteTrip} disabled={actionLoading || !allConfirmed}
            style={{ backgroundColor: allConfirmed ? GREEN : '#d1d5db', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16 }}>
            {actionLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>
                {allConfirmed ? 'Complete Trip & Earn 200 SangPoints' : 'Confirm all waypoints first'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {(match.status === 'COMPLETED' || match.status === 'DEPARTED' || match.status === 'ACCEPTED') && (
          <View style={{ backgroundColor: '#fffbeb', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#fde68a' }}>
            <Text style={{ color: '#92400e', fontSize: 13, lineHeight: 20, textAlign: 'center' }}>
              {match.status === 'ACCEPTED' ? 'Once you depart, confirm each waypoint as you reach it.' :
               match.status === 'DEPARTED' ? 'Confirm all waypoints to complete the trip and earn SangPoints.' :
               'This trip is complete. SangPoints have been minted to the guide\'s wallet.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
