import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import api from '../../src/lib/api';
import { storage } from '../../src/lib/storage';
import { useAuthStore } from '../../src/stores/authStore';
import {
  fetchOpenTrips,
  fetchMyMatches,
  createMatch,
  acceptMatch,
  createTrip,
  fetchUserProfile,
  fetchRoutes,
  type TripData,
  type MatchData,
  type UserProfile,
} from '../../src/lib/tripApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const GREEN = '#059669';

interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  source: string;
  destination: string;
  trekDate: string | null;
  duration: string;
  durationHours: string | null;
  budgetUSD: string | null;
  budgetNPR: string | null;
  description: string | null;
  category: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
    isVerified: boolean;
    avatarUrl: string | null;
  };
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

const CreateTrekModalComponent = React.memo(({
  visible, newTrek, showDatePicker, creating,
  onClose, onTrekChange, onDatePickerToggle, onDateChange, onSubmit,
}: {
  visible: boolean; newTrek: any; showDatePicker: boolean; creating: boolean;
  onClose: () => void; onTrekChange: (trek: any) => void;
  onDatePickerToggle: (show: boolean) => void; onDateChange: (date: Date) => void; onSubmit: () => void;
}) => (
  <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: SCREEN_HEIGHT * 0.85, width: '100%' }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 20 : 10 }}>
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>Plan Your Trek</Text>
                  <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trek Title *</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., Annapurna Base Camp Trek" value={newTrek.title}
                    onChangeText={(t) => onTrekChange({ ...newTrek, title: t })} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Starting From *</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., Pokhara" value={newTrek.source}
                      onChangeText={(t) => onTrekChange({ ...newTrek, source: t })} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Destination *</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., ABC" value={newTrek.destination}
                      onChangeText={(t) => onTrekChange({ ...newTrek, destination: t })} />
                  </View>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trek Date</Text>
                  <TouchableOpacity onPress={() => onDatePickerToggle(true)}
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    <Text style={{ marginLeft: 8, fontSize: 16, color: '#1f2937' }}>
                      {newTrek.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker value={newTrek.date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(_, selectedDate) => { onDatePickerToggle(false); if (selectedDate) onDateChange(selectedDate); }}
                      minimumDate={new Date()} />
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Duration *</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 7 days" value={newTrek.duration}
                      onChangeText={(t) => onTrekChange({ ...newTrek, duration: t })} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Walking Hours</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 60-70 hours" value={newTrek.durationHours}
                      onChangeText={(t) => onTrekChange({ ...newTrek, durationHours: t })} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Budget (USD) *</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 450" keyboardType="numeric" value={newTrek.budgetUSD}
                      onChangeText={(t) => onTrekChange({ ...newTrek, budgetUSD: t })} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Budget (NPR)</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 60000" keyboardType="numeric" value={newTrek.budgetNPR}
                      onChangeText={(t) => onTrekChange({ ...newTrek, budgetNPR: t })} />
                  </View>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['Stories', 'Tips', 'Questions', 'Emergency'].map((cat) => (
                        <TouchableOpacity key={cat} onPress={() => onTrekChange({ ...newTrek, category: cat })}
                          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, backgroundColor: newTrek.category === cat ? GREEN : '#f3f4f6' }}>
                          <Text style={{ color: newTrek.category === cat ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Description</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 16 }}
                    placeholder="Share details about your trek plan..." multiline value={newTrek.description}
                    onChangeText={(t) => onTrekChange({ ...newTrek, description: t })} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: Platform.OS === 'ios' ? 30 : 20 }}>
                  <TouchableOpacity onPress={onClose}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                    <Text style={{ textAlign: 'center', color: '#6b7280', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onSubmit} disabled={creating}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: GREEN }}>
                    {creating ? <ActivityIndicator color="#ffffff" /> : <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Share Trek</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </Modal>
));

CreateTrekModalComponent.displayName = 'CreateTrekModal';

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CommunityPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [pageTab, setPageTab] = useState<'discover' | 'requests'>('discover');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [openTrips, setOpenTrips] = useState<TripData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactProfile, setContactProfile] = useState<UserProfile | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [requestingTrip, setRequestingTrip] = useState<TripData | null>(null);
  const [reqTravellerCount, setReqTravellerCount] = useState('1');
  const [reqMessage, setReqMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

  const [newTrek, setNewTrek] = useState({
    title: '', source: '', destination: '', date: new Date(),
    duration: '', durationHours: '', budgetUSD: '', budgetNPR: '',
    description: '', category: 'Stories',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [communityPosts, tripsData, matchesData] = await Promise.allSettled([
        (async () => {
          const params = new URLSearchParams();
          if (selectedCategory !== 'All') params.set('category', selectedCategory);
          if (selectedSource) params.set('source', selectedSource);
          if (selectedDestination) params.set('destination', selectedDestination);
          const qs = params.toString();
          const res = await api.get(`/api/community${qs ? `?${qs}` : ''}`);
          setPosts(res.data.data);
        })(),
        fetchOpenTrips().then(setOpenTrips).catch(() => {}),
        fetchMyMatches().then(setMatches).catch(() => {}),
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSource, selectedDestination]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const categories = ['All', 'Stories', 'Tips', 'Questions', 'Emergency'];
  const allSources = [...new Set(posts.map((p) => p.source))];
  const allDestinations = [...new Set(posts.map((p) => p.destination))];

  const toggleLike = async (postId: string) => {
    if (likingIds.has(postId)) return;
    setLikingIds((prev) => new Set(prev).add(postId));
    try {
      const res = await api.post(`/api/community/${postId}/like`);
      const { liked, likesCount } = res.data.data;
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLiked: liked, likesCount } : p)));
    } catch {} finally {
      setLikingIds((prev) => { const n = new Set(prev); n.delete(postId); return n; });
    }
  };

  const toggleSave = async (postId: string) => {
    try {
      const res = await api.post(`/api/community/${postId}/save`);
      const { saved, savesCount } = res.data.data;
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isSaved: saved, savesCount } : p)));
    } catch {}
  };

  const resetForm = useCallback(() => {
    setNewTrek({ title: '', source: '', destination: '', date: new Date(), duration: '', durationHours: '', budgetUSD: '', budgetNPR: '', description: '', category: 'Stories' });
  }, []);

  const handleCloseModal = useCallback(() => { setShowCreateModal(false); resetForm(); }, [resetForm]);

  const handleAddTrek = useCallback(async () => {
    if (!newTrek.title.trim()) { Alert.alert('Error', 'Please enter trek title'); return; }
    if (!newTrek.source.trim()) { Alert.alert('Error', 'Please enter starting point'); return; }
    if (!newTrek.destination.trim()) { Alert.alert('Error', 'Please enter destination'); return; }
    if (!newTrek.duration.trim()) { Alert.alert('Error', 'Please enter duration'); return; }
    setCreating(true);
    try {
      const res = await api.post('/api/community', {
        title: newTrek.title, source: newTrek.source, destination: newTrek.destination,
        trekDate: newTrek.date.toISOString(), duration: newTrek.duration,
        durationHours: newTrek.durationHours || undefined, budgetUSD: newTrek.budgetUSD || undefined,
        budgetNPR: newTrek.budgetNPR || undefined, description: newTrek.description || undefined,
        category: newTrek.category,
      });
      const newPost = { ...res.data.data, userId: user?.id || res.data.data.userId };
      setPosts((prev) => [newPost, ...prev]);
      setShowCreateModal(false);
      resetForm();

      try {
        const routes = await fetchRoutes(newTrek.destination);
        if (routes.length > 0) {
          const route = routes[0];
          const startDate = newTrek.date.toISOString();
          const endDate = new Date(newTrek.date.getTime() + route.durationDays * 86400000).toISOString();
          const trip = await createTrip({ routeId: route.id, startDate, endDate });
          setOpenTrips((prev) => [trip, ...prev]);
        }
      } catch (tripErr) {
        console.log('Auto-create trip failed (post still created):', tripErr);
      }

      Alert.alert('Success', 'Your trek plan has been shared with the community!');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create post');
    } finally { setCreating(false); }
  }, [newTrek, resetForm, user]);

  const onDateChange = useCallback((selectedDate: Date) => {
    if (selectedDate) setNewTrek((prev) => ({ ...prev, date: selectedDate }));
  }, []);

  const handleTrekChange = useCallback((updatedTrek: any) => { setNewTrek(updatedTrek); }, []);

  const handleSendRequestToTrip = useCallback(async () => {
    if (!requestingTrip) return;
    if (requestingTrip.guide.id === user?.id) {
      Alert.alert('Cannot Request', 'You cannot request to join your own trip.');
      setShowRequestModal(false);
      setRequestingTrip(null);
      return;
    }
    if (!reqMessage.trim()) {
      Alert.alert('Message Required', 'Please write a brief message to the guide.');
      return;
    }
    try {
      await createMatch(requestingTrip.id, requestingTrip.id);
      Alert.alert('✅ Request Sent!', 'The guide will review your request and respond soon.');
      fetchMyMatches().then(setMatches).catch(() => {});
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to send request');
    }
    setShowRequestModal(false);
    setReqMessage('');
    setReqTravellerCount('1');
    setRequestingTrip(null);
  }, [requestingTrip, reqMessage, user]);

  const handleApproveRequest = async (matchId: string) => {
    Alert.alert('Approve Request', 'Once approved, the trekker will be able to see your contact details and trip information.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', style: 'default',
        onPress: async () => {
          try {
            await acceptMatch(matchId);
            setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: 'ACCEPTED' } : m));
            Alert.alert('✅ Approved!', 'The trekker has been notified and can now view your details.');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to approve');
          }
        },
      },
    ]);
  };

  const handleShowContact = useCallback(async (personId: string | undefined) => {
    if (!personId) { Alert.alert('Error', 'Contact details not available yet.'); return; }
    setLoadingContact(true);
    try {
      const profile = await fetchUserProfile(personId);
      setContactProfile(profile);
      setShowContactModal(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to load contact details');
    } finally {
      setLoadingContact(false);
    }
  }, []);

  const handleRequestOnPost = useCallback(async (post: CommunityPost) => {
    try {
      const trips = await fetchOpenTrips();
      const guideTrip = trips.find((t) => t.guide.id === post.userId);
      if (guideTrip) {
        setOpenTrips(trips);
        setRequestingTrip(guideTrip);
        setShowRequestModal(true);
      } else {
        Alert.alert('No Trip Available', 'This user hasn\'t created an open trip yet. They need to create a post with a valid route first.');
      }
    } catch {
      Alert.alert('Error', 'Failed to load open trips. Check your connection.');
    }
  }, []);

  const TrekCard = ({ post }: { post: CommunityPost }) => {
    const isOwn = user?.id === post.userId;
    const userMatch = matches.find((m) =>
      m.guideTrip.route?.name === post.destination &&
      (m.guideTrip.guide?.id === user?.id || m.trekkerTrip.trekker?.id === user?.id)
    );
    const myStatus = userMatch?.status || null;

    return (
      <View style={{ backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 16, padding: 20, borderWidth: 1, borderColor: '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: post.user.role === 'NEPALI' ? GREEN : '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: post.user.role === 'NEPALI' ? '#ffffff' : '#6b7280' }}>{post.user.name.charAt(0)}</Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>{isOwn ? 'You' : post.user.name}</Text>
              {post.user.isVerified && <Ionicons name="checkmark-circle" size={16} color={GREEN} style={{ marginLeft: 4 }} />}
              <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>• {post.user.role === 'NEPALI' ? 'Guide' : post.user.role === 'FOREIGN' ? 'Trekker' : post.user.role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>{timeAgo(post.createdAt)}</Text>
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#d1d5db', marginHorizontal: 6 }} />
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
                backgroundColor: post.category === 'Stories' ? '#dbeafe' : post.category === 'Tips' ? '#d1fae5' : post.category === 'Questions' ? '#fed7aa' : '#fee2e2' }}>
                <Text style={{ fontSize: 11, fontWeight: '600',
                  color: post.category === 'Stories' ? '#1e40af' : post.category === 'Tips' ? '#065f46' : post.category === 'Questions' ? '#9a3412' : '#991b1b' }}>
                  {post.category}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 12, lineHeight: 28 }}>{post.title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#f9fafb', padding: 12, borderRadius: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Starting Point</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{post.source}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Destination</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{post.destination}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>Date</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>{post.trekDate ? formatDate(post.trekDate) : 'TBD'}</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="time-outline" size={16} color="#10b981" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>Duration</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>{post.duration}</Text>
              {post.durationHours && <Text style={{ fontSize: 11, color: '#9ca3af' }}>{post.durationHours}</Text>}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="cash-outline" size={16} color="#8b5cf6" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>Budget</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>{post.budgetUSD ? `$${post.budgetUSD}` : 'N/A'}</Text>
              {post.budgetNPR && <Text style={{ fontSize: 11, color: '#9ca3af' }}>Rs. {post.budgetNPR}</Text>}
            </View>
          </View>
        </View>

        {post.description && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>About this trek</Text>
            <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 22 }}>{post.description}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
          <TouchableOpacity onPress={() => toggleLike(post.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={22} color={post.isLiked ? '#ef4444' : '#9ca3af'} />
            <Text style={{ marginLeft: 6, fontSize: 14, color: post.isLiked ? '#ef4444' : '#6b7280', fontWeight: '500' }}>{post.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name="chatbubble-outline" size={22} color="#9ca3af" />
            <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280', fontWeight: '500' }}>{post.commentsCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleSave(post.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name={post.isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={post.isSaved ? GREEN : '#9ca3af'} />
            <Text style={{ marginLeft: 6, fontSize: 14, color: post.isSaved ? GREEN : '#6b7280', fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>

          {isOwn ? (
            <TouchableOpacity onPress={() => setPageTab('requests')}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: '#ecfdf5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 }}>
              <Ionicons name="people-outline" size={16} color={GREEN} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: GREEN }}>Requests</Text>
            </TouchableOpacity>
          ) : myStatus === 'ACCEPTED' || myStatus === 'DEPARTED' || myStatus === 'COMPLETED' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: '#d1fae5', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, gap: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color="#065f46" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#065f46' }}>
                {myStatus === 'COMPLETED' ? 'Completed' : 'Approved'}
              </Text>
            </View>
          ) : myStatus === 'PENDING' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: '#fef3c7', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, gap: 6 }}>
              <Ionicons name="time-outline" size={16} color="#92400e" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#92400e' }}>Pending</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleRequestOnPost(post)}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: GREEN, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 12, gap: 6 }}>
              <Ionicons name="arrow-forward-circle-outline" size={16} color="#ffffff" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffff' }}>Request to Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const TripCard = ({ trip }: { trip: TripData }) => {
    const isOwn = trip.guide.id === user?.id;
    const match = matches.find((m) =>
      m.guideTrip.id === trip.id || m.trekkerTrip.id === trip.id
    );
    const userIsInvolved = match && (match.guideTrip.guide?.id === user?.id || match.trekkerTrip.trekker?.id === user?.id);

    return (
      <View style={{ backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 16, padding: 20, borderWidth: 1, borderColor: '#dbeafe', borderLeftWidth: 4, borderLeftColor: GREEN }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="flag-outline" size={22} color="#ffffff" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 11, color: GREEN, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Open Trip</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginTop: 2 }}>{trip.route.name}</Text>
          </View>
          {isOwn && (
            <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: GREEN, fontWeight: '600', fontSize: 12 }}>Guide</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="person-outline" size={16} color="#065f46" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#065f46', marginLeft: 6 }}>Guide: {trip.guide.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="map-outline" size={16} color="#065f46" />
            <Text style={{ fontSize: 13, color: '#065f46', marginLeft: 6 }}>{trip.route.region} • {trip.route.durationDays} days • {trip.route.difficulty}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 10, borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>Start</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{formatDate(trip.startDate)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 10, borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>End</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{formatDate(trip.endDate)}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#f9fafb', padding: 10, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', marginBottom: 4 }}>Waypoints</Text>
          {trip.route.waypoints.map((wp) => (
            <View key={wp.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: GREEN }}>{wp.order}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#374151' }}>{wp.name} ({wp.estimatedHours}h)</Text>
            </View>
          ))}
        </View>

        {!isOwn && (
          userIsInvolved ? (
            match?.status === 'ACCEPTED' || match?.status === 'DEPARTED' || match?.status === 'COMPLETED' ? (
              <View style={{ backgroundColor: '#d1fae5', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle" size={18} color="#065f46" />
                <Text style={{ color: '#065f46', fontSize: 13, flex: 1, fontWeight: '600' }}>
                  {match.status === 'COMPLETED' ? 'Trip completed' : 'You are matched with this guide'}
                </Text>
              </View>
            ) : (
              <View style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time-outline" size={18} color="#92400e" />
                <Text style={{ color: '#92400e', fontSize: 13, flex: 1 }}>Your request is pending. Waiting for guide to respond.</Text>
              </View>
            )
          ) : (
            <TouchableOpacity onPress={() => { setRequestingTrip(trip); setShowRequestModal(true); }}
              style={{ backgroundColor: GREEN, paddingVertical: 12, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Ionicons name="arrow-forward-circle-outline" size={18} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 15 }}>Request to Join</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    );
  };

  const handleOpenTripsTab = () => {
    const section = document?.getElementById?.('open-trips-section');
    section?.scrollIntoView?.({ behavior: 'smooth' });
  };

  const RequestsTab = () => {
    const [reqFilter, setReqFilter] = useState<'incoming' | 'sent'>('incoming');
    const myMatches = matches.filter((m) =>
      reqFilter === 'incoming'
        ? m.guideTrip.guide?.id === user?.id
        : m.trekkerTrip.trekker?.id === user?.id
    );
    const pendingCount = myMatches.filter((m) => m.status === 'PENDING').length;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>{pendingCount} Pending</Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>• {myMatches.filter((m) => m.status === 'ACCEPTED').length} Approved</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 3 }}>
          <TouchableOpacity onPress={() => setReqFilter('incoming')}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: reqFilter === 'incoming' ? '#ffffff' : 'transparent' }}>
            <Text style={{ fontWeight: '600', color: reqFilter === 'incoming' ? '#1f2937' : '#6b7280', fontSize: 13 }}>Incoming</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setReqFilter('sent')}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: reqFilter === 'sent' ? '#ffffff' : 'transparent' }}>
            <Text style={{ fontWeight: '600', color: reqFilter === 'sent' ? '#1f2937' : '#6b7280', fontSize: 13 }}>Sent</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={myMatches}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => {
            const isGuide = item.guideTrip.guide?.id === user?.id;
            const otherPerson = isGuide ? item.trekkerTrip.trekker : item.guideTrip.guide;
            const otherName = otherPerson?.name || 'Unknown';
            const routeName = item.guideTrip.route?.name || 'Unknown Trek';
            const createdAt = item.createdAt || new Date().toISOString();

            return (
              <View style={{ backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 16, padding: 20,
                borderWidth: 1, borderColor: item.status === 'ACCEPTED' ? '#d1fae5' : item.status === 'COMPLETED' ? '#dbeafe' : '#f0f0f0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>{otherName.charAt(0)}</Text>
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>{otherName}</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      {isGuide ? 'Trekker' : 'Guide'} • {timeAgo(createdAt)}
                    </Text>
                  </View>
                  {(item.status === 'ACCEPTED' || item.status === 'COMPLETED') && (
                    <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ color: '#065f46', fontWeight: '600', fontSize: 12 }}>
                        {item.status === 'COMPLETED' ? 'Completed' : 'Approved'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>TREK</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{routeName}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.guideTrip.route?.region}</Text>
                </View>

                {item.status === 'PENDING' && reqFilter === 'incoming' && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}>
                      <Text style={{ color: '#6b7280', fontWeight: '600' }}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleApproveRequest(item.id)}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center' }}>
                      <Text style={{ color: '#ffffff', fontWeight: '600' }}>Approve ✓</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'PENDING' && reqFilter === 'sent' && (
                  <View style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="time-outline" size={18} color="#92400e" />
                    <Text style={{ color: '#92400e', fontSize: 13, flex: 1 }}>
                      Waiting for the guide to review your request.
                    </Text>
                  </View>
                )}

                {item.status === 'ACCEPTED' && (
                  <View style={{ backgroundColor: '#d1fae5', padding: 12, borderRadius: 12, gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="checkmark-circle" size={18} color="#065f46" />
                      <Text style={{ color: '#065f46', fontSize: 13, flex: 1, fontWeight: '600' }}>
                        {isGuide ? `${otherPerson?.name || 'Trekker'} approved!` : `Approved by ${otherPerson?.name || 'guide'}!`}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {otherPerson?.id ? (
                        <TouchableOpacity onPress={() => handleShowContact(otherPerson.id)} disabled={loadingContact}
                          style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: GREEN, paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                          {loadingContact ? (
                            <ActivityIndicator size="small" color={GREEN} />
                          ) : (
                            <Ionicons name="person-circle-outline" size={16} color={GREEN} />
                          )}
                          <Text style={{ color: GREEN, fontWeight: '600' }}>{loadingContact ? 'Loading...' : 'Contact'}</Text>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity onPress={() => router.push(`/trip/${item.id}`)}
                        style={{ flex: 1, backgroundColor: GREEN, paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                        <Ionicons name="flag-outline" size={16} color="#ffffff" />
                        <Text style={{ color: '#ffffff', fontWeight: '600' }}>View Trip</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {item.status === 'COMPLETED' && (
                  <View style={{ backgroundColor: '#dbeafe', padding: 12, borderRadius: 12, gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="checkmark-done-circle" size={18} color="#1e40af" />
                      <Text style={{ color: '#1e40af', fontSize: 13, flex: 1 }}>This trip has been completed.</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <Ionicons name={reqFilter === 'incoming' ? 'mail-unread-outline' : 'paper-plane-outline'} size={80} color="#d1d5db" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16 }}>
                {reqFilter === 'incoming' ? 'No incoming requests' : 'No sent requests'}
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                {reqFilter === 'incoming'
                  ? 'When trekkers request to join your treks, they\'ll appear here.'
                  : 'When you request to join a trek, it will appear here.'}
              </Text>
            </View>
          )}
        />

        {myMatches.length > 0 && (
          <TouchableOpacity onPress={() => setPageTab('discover')}
            style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#f3f4f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="compass-outline" size={20} color={GREEN} />
            <Text style={{ color: GREEN, fontWeight: '600' }}>Discover</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const FilterModal = () => {
    const [tempSource, setTempSource] = useState(selectedSource);
    const [tempDestination, setTempDestination] = useState(selectedDestination);

    return (
      <Modal visible={showFilters} animationType="slide" transparent={true} onRequestClose={() => setShowFilters(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowFilters(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: SCREEN_HEIGHT * 0.8 }}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}>
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Starting Point</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => setTempSource('')}
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: tempSource === '' ? GREEN : '#f3f4f6', marginRight: 8 }}>
                        <Text style={{ color: tempSource === '' ? '#ffffff' : '#6b7280', fontWeight: '500' }}>All</Text>
                      </TouchableOpacity>
                      {allSources.map((source) => (
                        <TouchableOpacity key={source} onPress={() => setTempSource(source)}
                          style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: tempSource === source ? GREEN : '#f3f4f6', marginRight: 8 }}>
                          <Text style={{ color: tempSource === source ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{source}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Destination</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => setTempDestination('')}
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: tempDestination === '' ? GREEN : '#f3f4f6', marginRight: 8 }}>
                        <Text style={{ color: tempDestination === '' ? '#ffffff' : '#6b7280', fontWeight: '500' }}>All</Text>
                      </TouchableOpacity>
                      {allDestinations.map((dest) => (
                        <TouchableOpacity key={dest} onPress={() => setTempDestination(dest)}
                          style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: tempDestination === dest ? GREEN : '#f3f4f6', marginRight: 8 }}>
                          <Text style={{ color: tempDestination === dest ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{dest}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                <TouchableOpacity onPress={() => { setTempSource(''); setTempDestination(''); }}
                  style={{ marginBottom: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6' }}>
                  <Text style={{ textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>Reset All Filters</Text>
                </TouchableOpacity>
              </ScrollView>
              <TouchableOpacity onPress={() => { setSelectedSource(tempSource); setSelectedDestination(tempDestination); setShowFilters(false); }}
                style={{ marginTop: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: GREEN }}>
                <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const activeFilterCount = [selectedSource, selectedDestination].filter(Boolean).length;
  const matchPendingCount = matches.filter((m) => m.status === 'PENDING' && (m.guideTrip.guide?.id === user?.id || m.trekkerTrip.trekker?.id === user?.id)).length;

  const RequestToJoinModal = () => {
    if (!requestingTrip) return null;
    return (
      <Modal visible={showRequestModal} animationType="slide" transparent={true} onRequestClose={() => { setShowRequestModal(false); setRequestingTrip(null); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} pointerEvents="box-none">
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setShowRequestModal(false); setRequestingTrip(null); }} />
            <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: SCREEN_HEIGHT * 0.85 }} pointerEvents="auto">
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={{ padding: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937' }}>Request to Join</Text>
                    <TouchableOpacity onPress={() => { setShowRequestModal(false); setRequestingTrip(null); }}
                      style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="close" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ backgroundColor: '#f9fafb', padding: 14, borderRadius: 14, marginBottom: 20 }}>
                    <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600' }}>TREK</Text>
                    <Text style={{ fontWeight: '700', color: '#1f2937', marginTop: 2 }}>{requestingTrip.route.name}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{requestingTrip.route.region} • {requestingTrip.route.durationDays} days</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>{requestingTrip.guide.name.charAt(0)}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: '#374151' }}>Guide: {requestingTrip.guide.name}</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trekkers</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['1', '2', '3', '4', '5+'].map((num) => (
                        <TouchableOpacity key={num} onPress={() => setReqTravellerCount(num)}
                          style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                            backgroundColor: reqTravellerCount === num ? GREEN : '#f3f4f6' }}>
                          <Text style={{ fontWeight: '600', color: reqTravellerCount === num ? '#ffffff' : '#6b7280', fontSize: 13 }}>{num}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Message to Guide</Text>
                    <TextInput style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, height: 100, textAlignVertical: 'top', fontSize: 15 }}
                      placeholder="Hi! I'm interested in this trek. I have experience with..." multiline value={reqMessage} onChangeText={setReqMessage} />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => { setShowRequestModal(false); setRequestingTrip(null); }}
                      style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}>
                      <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSendRequestToTrip}
                      style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: GREEN, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                      <Ionicons name="send" size={18} color="#ffffff" />
                      <Text style={{ color: '#ffffff', fontWeight: '600' }}>Send Request</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const ContactModal = () => {
    if (!contactProfile) return null;
    return (
      <Modal visible={showContactModal} animationType="slide" transparent={true} onRequestClose={() => setShowContactModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowContactModal(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <View style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937' }}>Contact Details</Text>
                <TouchableOpacity onPress={() => setShowContactModal(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#ffffff' }}>{contactProfile.name?.charAt(0)}</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937', marginTop: 12 }}>{contactProfile.name}</Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>{contactProfile.role === 'NEPALI' ? 'Guide' : 'Trekker'}{contactProfile.nationality ? ` • ${contactProfile.nationality}` : ''}</Text>
              </View>
              <View style={{ backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, gap: 16 }}>
                {contactProfile.email ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="mail-outline" size={20} color={GREEN} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>Email</Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>{contactProfile.email}</Text>
                    </View>
                  </View>
                ) : null}
                {contactProfile.phone ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="call-outline" size={20} color={GREEN} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>Phone</Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>{contactProfile.phone}</Text>
                    </View>
                  </View>
                ) : null}
                {contactProfile.emergencyContact ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="medkit-outline" size={20} color="#dc2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>Emergency Contact</Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>{contactProfile.emergencyContact}</Text>
                      {contactProfile.emergencyPhone ? (
                        <Text style={{ fontSize: 13, color: '#6b7280' }}>{contactProfile.emergencyPhone}</Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => setShowContactModal(false)}
                style={{ marginTop: 24, backgroundColor: GREEN, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 3 }}>
          <TouchableOpacity onPress={() => setPageTab('discover')}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: pageTab === 'discover' ? '#ffffff' : 'transparent' }}>
            <Text style={{ fontWeight: '600', color: pageTab === 'discover' ? '#1f2937' : '#6b7280' }}>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setPageTab('requests'); fetchMyMatches().then(setMatches).catch(() => {}); }}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: pageTab === 'requests' ? '#ffffff' : 'transparent' }}>
            <Text style={{ fontWeight: '600', color: pageTab === 'requests' ? '#1f2937' : '#6b7280' }}>Requests</Text>
            {matchPendingCount > 0 && (
              <View style={{ backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{matchPendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {pageTab === 'requests' ? (
        <RequestsTab />
      ) : (
        <>
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 32, fontWeight: '700', color: '#1f2937', letterSpacing: -0.5 }}>Discover</Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Find your next adventure</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFilters(true)} style={{ position: 'relative' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="options-outline" size={24} color={GREEN} />
                </View>
                {activeFilterCount > 0 && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 20, paddingVertical: 12 }} contentContainerStyle={{ paddingRight: 20 }}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
                  style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24, backgroundColor: selectedCategory === cat ? GREEN : '#f3f4f6', marginRight: 8 }}>
                  <Text style={{ color: selectedCategory === cat ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {activeFilterCount > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {selectedSource ? (
                  <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-outline" size={14} color={GREEN} />
                    <Text style={{ color: '#1e40af', fontSize: 12, marginLeft: 4 }}>From: {selectedSource}</Text>
                    <TouchableOpacity onPress={() => setSelectedSource('')} style={{ marginLeft: 8 }}><Ionicons name="close" size={14} color={GREEN} /></TouchableOpacity>
                  </View>
                ) : null}
                {selectedDestination ? (
                  <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="flag-outline" size={14} color={GREEN} />
                    <Text style={{ color: '#1e40af', fontSize: 12, marginLeft: 4 }}>To: {selectedDestination}</Text>
                    <TouchableOpacity onPress={() => setSelectedDestination('')} style={{ marginLeft: 8 }}><Ionicons name="close" size={14} color={GREEN} /></TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          )}

          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>
              {loading ? 'Loading...' : `${posts.length} trek${posts.length !== 1 ? 's' : ''} • ${user?.role === 'NEPALI' ? 'Post a trek to get requests' : 'Request to join any trek'}`}
            </Text>
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={GREEN} />
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TrekCard post={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                  <Ionicons name="compass-outline" size={80} color="#d1d5db" />
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16 }}>Nothing here yet</Text>
                  <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Create a post to start.</Text>
                </View>
              )}
            />
          )}

          <TouchableOpacity onPress={() => setShowCreateModal(true)}
            style={{ position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: GREEN,
              alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}>
            <Ionicons name="add" size={32} color="#ffffff" />
          </TouchableOpacity>

          <FilterModal />
          <RequestToJoinModal />
          <ContactModal />
          <CreateTrekModalComponent
            visible={showCreateModal} newTrek={newTrek} showDatePicker={showDatePicker}
            creating={creating} onClose={handleCloseModal} onTrekChange={handleTrekChange}
            onDatePickerToggle={setShowDatePicker} onDateChange={onDateChange} onSubmit={handleAddTrek}
          />
        </>
      )}
    </SafeAreaView>
  );
}
