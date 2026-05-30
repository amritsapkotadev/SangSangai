import React, { useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Switch, 
  StyleSheet, Alert, RefreshControl, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_NOTIFS = [
  { 
    id: '1', 
    title: 'Trip reminder', 
    body: 'Your Mardi Himal trek starts tomorrow at 8:00 AM.',
    time: '2 hours ago',
    type: 'reminder',
    read: false,
    icon: 'alarm-outline'
  },
  { 
    id: '2', 
    title: 'Safety Tip', 
    body: 'Carry extra water, a headlamp, and warm layers for high altitudes.',
    time: '1 day ago',
    type: 'tip',
    read: false,
    icon: 'shield-outline'
  },
  { 
    id: '3', 
    title: 'Booking Confirmed', 
    body: 'Your flight to Kathmandu has been confirmed. Check your email for details.',
    time: '2 days ago',
    type: 'booking',
    read: true,
    icon: 'checkmark-circle-outline'
  },
  { 
    id: '4', 
    title: 'Special Offer', 
    body: '20% off on all trekking gear at Mountain Shop. Limited time only!',
    time: '3 days ago',
    type: 'offer',
    read: true,
    icon: 'pricetag-outline'
  },
  { 
    id: '5', 
    title: 'Weather Alert', 
    body: 'Rain expected in Pokhara tomorrow. Pack your raincoat!',
    time: '5 days ago',
    type: 'alert',
    read: false,
    icon: 'cloudy-outline'
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Mark all as read',
      `Mark all ${unreadCount} unread notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark All', 
          onPress: () => setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
          )
        }
      ]
    );
  };

  const deleteNotification = (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setNotifications(prev => prev.filter(n => n.id !== id))
        }
      ]
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'This action cannot be undone. All notifications will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setNotifications(INITIAL_NOTIFS);
      setRefreshing(false);
    }, 1500);
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  };

  const NotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
      onLongPress={() => deleteNotification(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={20} color="#8E8E93" />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.itemTitle, !item.read && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.itemBody}>{item.body}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#C7C7CC" style={{ marginBottom: 16 }} />
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptyText}>
        When you receive notifications, they'll appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
              <Ionicons name="checkmark-done-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'unread' && styles.activeFilter]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'read' && styles.activeFilter]}
            onPress={() => setFilter('read')}
          >
            <Text style={[styles.filterText, filter === 'read' && styles.activeFilterText]}>
              Read ({notifications.length - unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
        contentContainerStyle={notifications.length === 0 && { flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  unreadCount: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  unreadItem: {
    backgroundColor: '#F0F7FF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  unreadText: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 8,
  },
  itemBody: {
    fontSize: 14,
    color: '#6C6C70',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});