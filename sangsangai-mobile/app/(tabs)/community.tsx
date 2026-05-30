import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  
  // New Trek Form States
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
  
  // Filter states
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Trek data
  const [treks, setTreks] = useState([
    {
      id: '1',
      title: 'Annapurna Base Camp Trek',
      source: 'Pokhara',
      destination: 'Annapurna Base Camp',
      date: 'June 15, 2024',
      duration: '7 days',
      durationHours: '60-70 hours',
      budget: '$450',
      budgetNPR: 'Rs. 60,000',
      description: 'Classic trek through rhododendron forests with stunning views of Annapurna range. Suitable for beginners with good fitness. The trail offers teahouse accommodation and beautiful mountain vistas. You will witness sunrise over Machapuchare and Annapurna South.',
      category: 'Stories',
      user: {
        name: 'You',
        role: 'Trekker',
        isVerified: false,
      },
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
    },
    {
      id: '2',
      title: 'Everest Base Camp Trek',
      source: 'Lukla',
      destination: 'Everest Base Camp',
      date: 'October 1, 2024',
      duration: '12 days',
      durationHours: '110-120 hours',
      budget: '$850',
      budgetNPR: 'Rs. 110,000',
      description: 'Iconic trek to the base of world\'s highest mountain. Challenging but rewarding with incredible mountain views. Requires good physical fitness and acclimatization. The trek includes visits to Namche Bazaar, Tengboche Monastery, and Kala Patthar.',
      category: 'Tips',
      user: {
        name: 'Pasang Sherpa',
        role: 'Guide',
        isVerified: true,
      },
      likes: 234,
      comments: 56,
      timestamp: '1 day ago',
    },
    {
      id: '3',
      title: 'Langtang Valley Trek',
      source: 'Syabrubesi',
      destination: 'Langtang Valley',
      date: 'September 20, 2024',
      duration: '8 days',
      durationHours: '70-80 hours',
      budget: '$380',
      budgetNPR: 'Rs. 50,000',
      description: 'Beautiful valley trek with rich Tamang culture and stunning Himalayan views. Less crowded than other major treks, perfect for peaceful nature experience. The trail follows the Langtang River and offers views of Langtang Lirung.',
      category: 'Questions',
      user: {
        name: 'Karma Tamang',
        role: 'Guide',
        isVerified: false,
      },
      likes: 89,
      comments: 18,
      timestamp: '3 days ago',
    },
    {
      id: '4',
      title: 'Poon Hill Sunrise Trek',
      source: 'Nayapul',
      destination: 'Poon Hill',
      date: 'November 5, 2024',
      duration: '5 days',
      durationHours: '40-45 hours',
      budget: '$280',
      budgetNPR: 'Rs. 37,000',
      description: 'Short trek with breathtaking sunrise views over Annapurna and Dhaulagiri ranges. Perfect for beginners and families with children. The trek offers stunning 360-degree mountain views from Poon Hill at sunrise.',
      category: 'Stories',
      user: {
        name: 'Bishnu Thapa',
        role: 'Guide',
        isVerified: true,
      },
      likes: 156,
      comments: 32,
      timestamp: '5 days ago',
    },
    {
      id: '5',
      title: 'Manaslu Circuit Trek',
      source: 'Soti Khola',
      destination: 'Dharapani',
      date: 'August 10, 2024',
      duration: '14 days',
      durationHours: '130-140 hours',
      budget: '$750',
      budgetNPR: 'Rs. 98,000',
      description: 'Remote circuit trek around Mount Manaslu. Requires special permits and good physical preparation. Offers diverse landscapes from subtropical forests to alpine zones. This restricted area trek provides authentic cultural experiences.',
      category: 'Tips',
      user: {
        name: 'Dawa Sherpa',
        role: 'Guide',
        isVerified: true,
      },
      likes: 67,
      comments: 12,
      timestamp: '1 week ago',
    },
  ]);

  const allSources = [...new Set(treks.map(t => t.source))];
  const allDestinations = [...new Set(treks.map(t => t.destination))];
  const categories = ['All', 'Stories', 'Tips', 'Questions', 'Emergency'];

  const filteredTreks = treks.filter(trek => {
    const matchesSource = !selectedSource || trek.source === selectedSource;
    const matchesDestination = !selectedDestination || trek.destination === selectedDestination;
    const matchesCategory = selectedCategory === 'All' || trek.category === selectedCategory;
    return matchesSource && matchesDestination && matchesCategory;
  });

  const toggleLike = (id: string) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter(p => p !== id));
      setTreks(treks.map(t => t.id === id ? { ...t, likes: t.likes - 1 } : t));
    } else {
      setLikedPosts([...likedPosts, id]);
      setTreks(treks.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t));
    }
  };

  const toggleSave = (id: string) => {
    if (savedPosts.includes(id)) {
      setSavedPosts(savedPosts.filter(p => p !== id));
    } else {
      setSavedPosts([...savedPosts, id]);
    }
  };

  const handleAddTrek = () => {
    // Validation
    if (!newTrek.title.trim()) {
      Alert.alert('Error', 'Please enter trek title');
      return;
    }
    if (!newTrek.source.trim()) {
      Alert.alert('Error', 'Please enter starting point');
      return;
    }
    if (!newTrek.destination.trim()) {
      Alert.alert('Error', 'Please enter destination');
      return;
    }
    if (!newTrek.duration.trim()) {
      Alert.alert('Error', 'Please enter duration');
      return;
    }
    if (!newTrek.budgetUSD.trim()) {
      Alert.alert('Error', 'Please enter budget');
      return;
    }

    const formattedDate = newTrek.date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const newTrekPost = {
      id: Date.now().toString(),
      title: newTrek.title,
      source: newTrek.source,
      destination: newTrek.destination,
      date: formattedDate,
      duration: newTrek.duration,
      durationHours: newTrek.durationHours || 'N/A',
      budget: `$${newTrek.budgetUSD}`,
      budgetNPR: `Rs. ${newTrek.budgetNPR}`,
      description: newTrek.description,
      category: newTrek.category,
      user: {
        name: 'You',
        role: 'Trekker',
        isVerified: false,
      },
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
    };

    setTreks([newTrekPost, ...treks]);
    setShowCreateModal(false);
    resetForm();
    Alert.alert('Success', 'Your trek plan has been shared with the community!');
  };

  const resetForm = () => {
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
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTrek({ ...newTrek, date: selectedDate });
    }
  };

  const CreateTrekModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowCreateModal(false);
        resetForm();
      }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          />
          <View style={{ 
            backgroundColor: '#ffffff', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.9,
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>Plan Your Trek</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }} 
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Trek Title */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trek Title *</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                    placeholder="e.g., Annapurna Base Camp Trek"
                    value={newTrek.title}
                    onChangeText={(text) => setNewTrek({ ...newTrek, title: text })}
                  />
                </View>

                {/* From and To in same row */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Starting From *</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., Pokhara"
                      value={newTrek.source}
                      onChangeText={(text) => setNewTrek({ ...newTrek, source: text })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Destination *</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., Annapurna Base Camp"
                      value={newTrek.destination}
                      onChangeText={(text) => setNewTrek({ ...newTrek, destination: text })}
                    />
                  </View>
                </View>

                {/* Date Picker */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Trek Date</Text>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
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
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>

                {/* Duration and Budget */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Duration *</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 7 days"
                      value={newTrek.duration}
                      onChangeText={(text) => setNewTrek({ ...newTrek, duration: text })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Walking Hours</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 60-70 hours"
                      value={newTrek.durationHours}
                      onChangeText={(text) => setNewTrek({ ...newTrek, durationHours: text })}
                    />
                  </View>
                </View>

                {/* Budget USD and NPR */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Budget (USD) *</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 450"
                      keyboardType="numeric"
                      value={newTrek.budgetUSD}
                      onChangeText={(text) => setNewTrek({ ...newTrek, budgetUSD: text })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Budget (NPR)</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16 }}
                      placeholder="e.g., 60000"
                      keyboardType="numeric"
                      value={newTrek.budgetNPR}
                      onChangeText={(text) => setNewTrek({ ...newTrek, budgetNPR: text })}
                    />
                  </View>
                </View>

                {/* Category */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['Stories', 'Tips', 'Questions', 'Emergency'].map(cat => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => setNewTrek({ ...newTrek, category: cat })}
                          style={{ 
                            paddingHorizontal: 16, 
                            paddingVertical: 8, 
                            borderRadius: 24, 
                            backgroundColor: newTrek.category === cat ? '#3b82f6' : '#f3f4f6'
                          }}
                        >
                          <Text style={{ color: newTrek.category === cat ? '#ffffff' : '#6b7280', fontWeight: '500' }}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Description */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Description</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 16 }}
                    placeholder="Share details about your trek plan..."
                    multiline
                    value={newTrek.description}
                    onChangeText={(text) => setNewTrek({ ...newTrek, description: text })}
                  />
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}
                  >
                    <Text style={{ textAlign: 'center', color: '#6b7280', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleAddTrek}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#3b82f6' }}
                  >
                    <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Share Trek</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const TrekCard = ({ trek }: { trek: typeof treks[0] }) => {
    const isLiked = likedPosts.includes(trek.id);
    const isSaved = savedPosts.includes(trek.id);
    
    return (
      <View style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: 20, 
        marginBottom: 16, 
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
      }}>
        {/* User Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: trek.user.role === 'Guide' ? '#3b82f6' : '#e5e7eb',
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: trek.user.role === 'Guide' ? '#ffffff' : '#6b7280' }}>
              {trek.user.name.charAt(0)}
            </Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>{trek.user.name}</Text>
              {trek.user.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#3b82f6" style={{ marginLeft: 4 }} />
              )}
              <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>• {trek.user.role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>{trek.timestamp}</Text>
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#d1d5db', marginHorizontal: 6 }} />
              <View style={{ 
                paddingHorizontal: 8, 
                paddingVertical: 2, 
                borderRadius: 12,
                backgroundColor: 
                  trek.category === 'Stories' ? '#dbeafe' :
                  trek.category === 'Tips' ? '#d1fae5' :
                  trek.category === 'Questions' ? '#fed7aa' : '#fee2e2'
              }}>
                <Text style={{ 
                  fontSize: 11, 
                  fontWeight: '600',
                  color: 
                    trek.category === 'Stories' ? '#1e40af' :
                    trek.category === 'Tips' ? '#065f46' :
                    trek.category === 'Questions' ? '#9a3412' : '#991b1b'
                }}>
                  {trek.category}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Trek Title */}
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 12, lineHeight: 28 }}>
          {trek.title}
        </Text>

        {/* Route Information */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 16, 
          backgroundColor: '#f9fafb', 
          padding: 12, 
          borderRadius: 12 
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Starting Point
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{trek.source}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Destination
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 }}>{trek.destination}</Text>
          </View>
        </View>

        {/* Trek Details */}
        <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>Date</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>{trek.date}</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="time-outline" size={16} color="#10b981" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>Duration</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>{trek.duration}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>{trek.durationHours}</Text>
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
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>{trek.budget}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>{trek.budgetNPR}</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="flag-outline" size={16} color="#f59e0b" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>Difficulty</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1f2937' }}>
                {trek.duration === '5 days' ? 'Easy' : 
                 trek.duration === '7 days' ? 'Moderate' : 
                 trek.duration === '8 days' ? 'Moderate' : 
                 trek.duration === '12 days' ? 'Challenging' : 'Very Challenging'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            About this trek
          </Text>
          <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 22 }}>
            {trek.description}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingTop: 12, 
          borderTopWidth: 1, 
          borderTopColor: '#f3f4f6' 
        }}>
          <TouchableOpacity onPress={() => toggleLike(trek.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#ef4444" : "#9ca3af"} />
            <Text style={{ marginLeft: 6, fontSize: 14, color: isLiked ? '#ef4444' : '#6b7280', fontWeight: '500' }}>{trek.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name="chatbubble-outline" size={22} color="#9ca3af" />
            <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280', fontWeight: '500' }}>{trek.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name="share-outline" size={22} color="#9ca3af" />
            <Text style={{ marginLeft: 6, fontSize: 14, color: '#6b7280', fontWeight: '500' }}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleSave(trek.id)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={isSaved ? "#3b82f6" : "#9ca3af"} />
            <Text style={{ marginLeft: 6, fontSize: 14, color: isSaved ? '#3b82f6' : '#6b7280', fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const FilterModal = () => {
    const [tempSource, setTempSource] = useState(selectedSource);
    const [tempDestination, setTempDestination] = useState(selectedDestination);

    return (
      <Modal 
        visible={showFilters} 
        animationType="slide" 
        transparent={true} 
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setShowFilters(false)}
          />
          <View style={{ 
            backgroundColor: '#ffffff', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.8,
          }}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>Filters</Text>
                <TouchableOpacity 
                  onPress={() => setShowFilters(false)} 
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}>
                {/* Source Filter */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Starting Point</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity 
                        onPress={() => setTempSource('')}
                        style={{ 
                          paddingHorizontal: 16, 
                          paddingVertical: 10, 
                          borderRadius: 24, 
                          backgroundColor: tempSource === '' ? '#3b82f6' : '#f3f4f6',
                          marginRight: 8
                        }}
                      >
                        <Text style={{ color: tempSource === '' ? '#ffffff' : '#6b7280', fontWeight: '500' }}>All</Text>
                      </TouchableOpacity>
                      {allSources.map(source => (
                        <TouchableOpacity 
                          key={source}
                          onPress={() => setTempSource(source)}
                          style={{ 
                            paddingHorizontal: 16, 
                            paddingVertical: 10, 
                            borderRadius: 24, 
                            backgroundColor: tempSource === source ? '#3b82f6' : '#f3f4f6',
                            marginRight: 8
                          }}
                        >
                          <Text style={{ color: tempSource === source ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{source}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Destination Filter */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Destination</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity 
                        onPress={() => setTempDestination('')}
                        style={{ 
                          paddingHorizontal: 16, 
                          paddingVertical: 10, 
                          borderRadius: 24, 
                          backgroundColor: tempDestination === '' ? '#3b82f6' : '#f3f4f6',
                          marginRight: 8
                        }}
                      >
                        <Text style={{ color: tempDestination === '' ? '#ffffff' : '#6b7280', fontWeight: '500' }}>All</Text>
                      </TouchableOpacity>
                      {allDestinations.map(dest => (
                        <TouchableOpacity 
                          key={dest}
                          onPress={() => setTempDestination(dest)}
                          style={{ 
                            paddingHorizontal: 16, 
                            paddingVertical: 10, 
                            borderRadius: 24, 
                            backgroundColor: tempDestination === dest ? '#3b82f6' : '#f3f4f6',
                            marginRight: 8
                          }}
                        >
                          <Text style={{ color: tempDestination === dest ? '#ffffff' : '#6b7280', fontWeight: '500' }}>{dest}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <TouchableOpacity 
                  onPress={() => {
                    setTempSource('');
                    setTempDestination('');
                  }}
                  style={{ marginBottom: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6' }}
                >
                  <Text style={{ textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>Reset All Filters</Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity 
                onPress={() => {
                  setSelectedSource(tempSource);
                  setSelectedDestination(tempDestination);
                  setShowFilters(false);
                }}
                style={{ marginTop: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: '#3b82f6' }}
              >
                <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const activeFilterCount = [selectedSource, selectedDestination].filter(f => f).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1f2937', letterSpacing: -0.5 }}>Discover Treks</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Find your next adventure</Text>
          </View>
          <TouchableOpacity onPress={() => setShowFilters(true)} style={{ position: 'relative' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="options-outline" size={24} color="#3b82f6" />
            </View>
            {activeFilterCount > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 20, paddingVertical: 12 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{ 
                paddingHorizontal: 20, 
                paddingVertical: 8, 
                borderRadius: 24, 
                backgroundColor: selectedCategory === cat ? '#3b82f6' : '#f3f4f6',
                marginRight: 8
              }}
            >
              <Text style={{ color: selectedCategory === cat ? '#ffffff' : '#6b7280', fontWeight: '500' }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {selectedSource && (
              <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={14} color="#3b82f6" />
                <Text style={{ color: '#1e40af', fontSize: 12, marginLeft: 4 }}>From: {selectedSource}</Text>
                <TouchableOpacity onPress={() => setSelectedSource('')} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={14} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            )}
            {selectedDestination && (
              <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flag-outline" size={14} color="#3b82f6" />
                <Text style={{ color: '#1e40af', fontSize: 12, marginLeft: 4 }}>To: {selectedDestination}</Text>
                <TouchableOpacity onPress={() => setSelectedDestination('')} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={14} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Results Count */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>
          {filteredTreks.length} trek{filteredTreks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Trek List */}
      <FlatList
        data={filteredTreks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TrekCard trek={item} />}
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

      {/* FAB Button */}
      <TouchableOpacity 
        onPress={() => setShowCreateModal(true)}
        style={{ 
          position: 'absolute', 
          bottom: 20, 
          right: 20, 
          width: 56, 
          height: 56, 
          borderRadius: 28, 
          backgroundColor: '#3b82f6', 
          alignItems: 'center', 
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Modals */}
      <FilterModal />
      <CreateTrekModal />
    </SafeAreaView>
  );
}