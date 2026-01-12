import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface RecentBooking {
  id: string;
  caregiverName: string;
  caregiverAvatar?: string;
  serviceType: string;
  date: string;
  status: 'completed' | 'upcoming' | 'in-progress';
}

interface RecentlyBookedProps {
  bookings: RecentBooking[];
  onBookingPress?: (booking: RecentBooking) => void;
  onSeeAllPress?: () => void;
}

export const RecentlyBooked: React.FC<RecentlyBookedProps> = ({
  bookings,
  onBookingPress,
  onSeeAllPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'upcoming':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'upcoming':
        return 'Sắp tới';
      default:
        return status;
    }
  };

  const renderBooking = ({ item }: { item: RecentBooking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => onBookingPress?.(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.caregiverAvatar || 'https://via.placeholder.com/100' }}
        style={styles.caregiverImage}
      />
      <View style={styles.badgeContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>
            {getStatusText(item.status)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.bookingInfo}>
        <ThemedText style={styles.caregiverName} numberOfLines={1}>
          {item.caregiverName}
        </ThemedText>
        <ThemedText style={styles.serviceType} numberOfLines={1}>
          {item.serviceType}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (!bookings || bookings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Đặt lịch gần đây</ThemedText>
        <TouchableOpacity onPress={onSeeAllPress}>
          <View style={styles.seeAllButton}>
            <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
          </View>
        </TouchableOpacity>
      </View>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginRight: 4,
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  bookingCard: {
    width: 140,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  caregiverImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookingInfo: {
    padding: 12,
  },
  caregiverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 12,
    color: '#6c757d',
  },
});
