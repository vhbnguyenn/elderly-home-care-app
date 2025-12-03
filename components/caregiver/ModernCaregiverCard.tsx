import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface CaregiverCardProps {
  id: string;
  name: string;
  avatar?: string;
  experience: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  specializations: string[];
  isVerified?: boolean;
  distance?: string;
  onPress?: () => void;
  onBookPress?: () => void;
}

export const ModernCaregiverCard: React.FC<CaregiverCardProps> = ({
  name,
  avatar,
  experience,
  rating,
  reviews,
  hourlyRate,
  specializations,
  isVerified = false,
  distance,
  onPress,
  onBookPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatar || 'https://via.placeholder.com/60' }}
            style={styles.avatar}
          />
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {name}
            </ThemedText>
            {distance && (
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={12} color="#FF6B6B" />
                <ThemedText style={styles.distance}>{distance}</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <ThemedText style={styles.experience}>{experience}</ThemedText>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.rating}>
              {rating.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.reviews}>({reviews} đánh giá)</ThemedText>
          </View>

          <View style={styles.specializationsContainer}>
            {specializations.slice(0, 2).map((spec, index) => (
              <View key={index} style={styles.specializationChip}>
                <ThemedText style={styles.specializationText} numberOfLines={1}>
                  {spec}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Price and Book Button */}
        <View style={styles.actionContainer}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>
              {hourlyRate.toLocaleString('vi-VN')}₫
            </ThemedText>
            <ThemedText style={styles.priceUnit}>/giờ</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={onBookPress}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.bookButtonText}>Đặt lịch</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 11,
    color: '#FF6B6B',
    marginLeft: 2,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  experience: {
    fontSize: 12,
    color: '#6c757d',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specializationChip: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specializationText: {
    fontSize: 11,
    color: '#68C2E8',
    fontWeight: '500',
  },
  actionContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  priceUnit: {
    fontSize: 11,
    color: '#6c757d',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
