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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/authStore';

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

const styles = StyleSheet.create({
  backdropStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    pointerEvents: 'box-none',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    pointerEvents: 'auto',
  },
  outerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

// Memoized modal component to prevent re-renders from parent state changes
const CreateTrekModalComponent = React.memo(({
  visible,
  newTrek,
  showDatePicker,
  creating,
  onClose,
  onTrekChange,
  onDatePickerToggle,
  onDateChange,
  onSubmit,
}: {
  visible: boolean;
  newTrek: any;
  showDatePicker: boolean;
  creating: boolean;
  onClose: () => void;
  onTrekChange: (trek: any) => void;
  onDatePickerToggle: (show: boolean) => void;
  onDateChange: (date: Date) => void;
  onSubmit: () => void;
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.outerBackdrop}>
      {/* Backdrop - completely separate, doesn't interfere */}
      <TouchableOpacity
        style={styles.backdropStyle}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* KeyboardAvoidingView with pointerEvents="box-none" */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
        pointerEvents="box-none"
      >
        {/* Modal content with pointerEvents="auto" */}
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>Plan Your Trek</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trek Title *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                  placeholder="e.g., Annapurna Base Camp Trek"
                  value={newTrek.title}
                  onChangeText={(t) => onTrekChange({ ...newTrek, title: t })}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Starting From *</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., Pokhara"
                    value={newTrek.source}
                    onChangeText={(t) => onTrekChange({ ...newTrek, source: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Destination *</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., ABC"
                    value={newTrek.destination}
                    onChangeText={(t) => onTrekChange({ ...newTrek, destination: t })}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trek Date</Text>
                <TouchableOpacity
                  onPress={() => onDatePickerToggle(true)}
                  style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  <Text style={{ marginLeft: 8, fontSize: 16, color: '#1f2937' }}>
                    {newTrek.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={newTrek.date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selectedDate) => {
                      onDatePickerToggle(false);
                      if (selectedDate) onDateChange(selectedDate);
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Duration *</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., 7 days"
                    value={newTrek.duration}
                    onChangeText={(t) => onTrekChange({ ...newTrek, duration: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Walking Hours</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., 60-70 hours"
                    value={newTrek.durationHours}
                    onChangeText={(t) => onTrekChange({ ...newTrek, durationHours: t })}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Budget (USD) *</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., 450"
                    keyboardType="numeric"
                    value={newTrek.budgetUSD}
                    onChangeText={(t) => onTrekChange({ ...newTrek, budgetUSD: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Budget (NPR)</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., 60000"
                    keyboardType="numeric"
                    value={newTrek.budgetNPR}
                    onChangeText={(t) => onTrekChange({ ...newTrek, budgetNPR: t })}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {['Stories', 'Tips', 'Questions', 'Emergency'].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => onTrekChange({ ...newTrek, category: cat })}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 24,
                          backgroundColor: newTrek.category === cat ? GREEN : '#f3f4f6',
                        }}
                      >
                        <Text style={{ color: newTrek.category === cat ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Description</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 16 }}
                  placeholder="Share details about your trek plan..."
                  multiline
                  value={newTrek.description}
                  onChangeText={(t) => onTrekChange({ ...newTrek, description: t })}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}
                >
                  <Text style={{ textAlign: 'center', color: '#6b7280', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onSubmit}
                  disabled={creating}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: GREEN }}
                >
                  {creating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Share Trek</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
));

CreateTrekModalComponent.displayName = 'CreateTrekModal';

export default function CommunityPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

  const [newTrek, setNewTrek] = useState({
    title: '',
    source: '',
    destination: '',
    date: new Date(),
    duration: '',
    durationHours: '',
    budgetUSD: '',
    budgetNPR: '',
    description: '',
    category: 'Stories',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedSource) params.set('source', selectedSource);
      if (selectedDestination) params.set('destination', selectedDestination);

      const res = await api.get(`/api/community?${params.toString()}`);
      setPosts(res.data.data);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSource, selectedDestination]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  const categories = ['All', 'Stories', 'Tips', 'Questions', 'Emergency'];

  const allSources = [...new Set(posts.map((p) => p.source))];
  const allDestinations = [...new Set(posts.map((p) => p.destination))];

  const toggleLike = async (postId: string) => {
    if (likingIds.has(postId)) return;
    setLikingIds((prev) => new Set(prev).add(postId));

    try {
      const res = await api.post(`/api/community/${postId}/like`);
      const { liked, likesCount } = res.data.data;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLiked: liked, likesCount } : p))
      );
    } catch (err: any) {
      console.error('Like error:', err);
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const toggleSave = async (postId: string) => {
    try {
      const res = await api.post(`/api/community/${postId}/save`);
      const { saved, savesCount } = res.data.data;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: saved, savesCount } : p))
      );
    } catch (err: any) {
      console.error('Save error:', err);
    }
  };

  const resetForm = useCallback(() => {
    setNewTrek({
      title: '',
      source: '',
      destination: '',
      date: new Date(),
      duration: '',
      durationHours: '',
      budgetUSD: '',
      budgetNPR: '',
      description: '',
      category: 'Stories',
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const handleAddTrek = useCallback(async () => {
    if (!newTrek.title.trim()) { Alert.alert('Error', 'Please enter trek title'); return; }
    if (!newTrek.source.trim()) { Alert.alert('Error', 'Please enter starting point'); return; }
    if (!newTrek.destination.trim()) { Alert.alert('Error', 'Please enter destination'); return; }
    if (!newTrek.duration.trim()) { Alert.alert('Error', 'Please enter duration'); return; }

    setCreating(true);
    try {
      const res = await api.post('/api/community', {
        title: newTrek.title,
        source: newTrek.source,
        destination: newTrek.destination,
        trekDate: newTrek.date.toISOString(),
        duration: newTrek.duration,
        durationHours: newTrek.durationHours || undefined,
        budgetUSD: newTrek.budgetUSD || undefined,
        budgetNPR: newTrek.budgetNPR || undefined,
        description: newTrek.description || undefined,
        category: newTrek.category,
      });

      setPosts((prev) => [res.data.data, ...prev]);
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Your trek plan has been shared with the community!');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to create post';
      Alert.alert('Error', msg);
    } finally {
      setCreating(false);
    }
  }, [newTrek, resetForm]);

  const onDateChange = useCallback((selectedDate: Date) => {
    if (selectedDate) setNewTrek((prev) => ({ ...prev, date: selectedDate }));
  }, []);

  const handleTrekChange = useCallback((updatedTrek: any) => {
    setNewTrek(updatedTrek);
  }, []);

  const TrekCard = ({ post }: { post: CommunityPost }) => {
    const isOwn = user?.id === post.userId;

    return (
      <View style={{
        backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 16, padding: 20,
        borderWidth: 1, borderColor: '#f0f0f0',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: post.user.role === 'NEPALI' ? GREEN : '#e5e7eb',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: post.user.role === 'NEPALI' ? '#ffffff' : '#6b7280' }}>
              {post.user.name.charAt(0)}
            </Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                {isOwn ? 'You' : post.user.name}
              </Text>
              {post.user.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={GREEN} style={{ marginLeft: 4 }} />
              )}
              <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>
                • {post.user.role === 'NEPALI' ? 'Guide' : post.user.role === 'FOREIGN' ? 'Trekker' : post.user.role}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                {timeAgo(post.createdAt)}
              </Text>
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#d1d5db', marginHorizontal: 6 }} />
              <View style={{
                paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
                backgroundColor: post.category === 'Stories' ? '#dbeafe'
                  : post.category === 'Tips' ? '#d1fae5'
                  : post.category === 'Questions' ? '#fed7aa' : '#fee2e2',
              }}>
                <Text style={{
                  fontSize: 11, fontWeight: '600',
                  color: post.category === 'Stories' ? '#1e40af'
                    : post.category === 'Tips' ? '#065f46'
                    : post.category === 'Questions' ? '#9a3412' : '#991b1b',
                }}>
                  {post.category}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 12, lineHeight: 28 }}>
          {post.title}
        </Text>

        <View style={{
          flexDirection: 'row', alignItems: 'center', marginBottom: 16,
          backgroundColor: '#f9fafb', padding: 12, borderRadius: 12,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Starting Point
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{post.source}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Destination
            </Text>
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
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>
                {post.trekDate ? new Date(post.trekDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </Text>
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
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              About this trek
            </Text>
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

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name="share-outline" size={22} color="#9ca3af" />
            <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280', fontWeight: '500' }}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleSave(post.id)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
            <Ionicons name={post.isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={post.isSaved ? GREEN : '#9ca3af'} />
            <Text style={{ marginLeft: 6, fontSize: 14, color: post.isSaved ? GREEN : '#6b7280', fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity onPress={() => setShowFilters(false)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}>
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Starting Point</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => setTempSource('')}
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
                          backgroundColor: tempSource === '' ? GREEN : '#f3f4f6', marginRight: 8 }}>
                        <Text style={{ color: tempSource === '' ? '#ffffff' : '#6b7280', fontWeight: '500' }}>All</Text>
                      </TouchableOpacity>
                      {allSources.map((source) => (
                        <TouchableOpacity key={source} onPress={() => setTempSource(source)}
                          style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
                            backgroundColor: tempSource === source ? GREEN : '#f3f4f6', marginRight: 8 }}>
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
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
                          backgroundColor: tempDestination === '' ? GREEN : '#f3f4f6', marginRight: 8 }}>
                        <Text style={{ color: tempDestination === '' ? '#ffffff' : '#6b7280', fontWeight: '500' }}>All</Text>
                      </TouchableOpacity>
                      {allDestinations.map((dest) => (
                        <TouchableOpacity key={dest} onPress={() => setTempDestination(dest)}
                          style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
                            backgroundColor: tempDestination === dest ? GREEN : '#f3f4f6', marginRight: 8 }}>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1f2937', letterSpacing: -0.5 }}>Discover Treks</Text>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 20, paddingVertical: 12 }}
          contentContainerStyle={{ paddingRight: 20 }}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
              style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24,
                backgroundColor: selectedCategory === cat ? GREEN : '#f3f4f6', marginRight: 8 }}>
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
                <TouchableOpacity onPress={() => setSelectedSource('')} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={14} color={GREEN} />
                </TouchableOpacity>
              </View>
            ) : null}
            {selectedDestination ? (
              <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flag-outline" size={14} color={GREEN} />
                <Text style={{ color: '#1e40af', fontSize: 12, marginLeft: 4 }}>To: {selectedDestination}</Text>
                <TouchableOpacity onPress={() => setSelectedDestination('')} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={14} color={GREEN} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>
          {loading ? 'Loading...' : `${posts.length} trek${posts.length !== 1 ? 's' : ''} found`}
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
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16 }}>No treks found</Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Try adjusting your filters</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity onPress={() => setShowCreateModal(true)}
        style={{
          position: 'absolute', bottom: 20, right: 20,
          width: 56, height: 56, borderRadius: 28, backgroundColor: GREEN,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
        }}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <FilterModal />
      <CreateTrekModalComponent
        visible={showCreateModal}
        newTrek={newTrek}
        showDatePicker={showDatePicker}
        creating={creating}
        onClose={handleCloseModal}
        onTrekChange={handleTrekChange}
        onDatePickerToggle={setShowDatePicker}
        onDateChange={onDateChange}
        onSubmit={handleAddTrek}
      />
    </SafeAreaView>
  );
}

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