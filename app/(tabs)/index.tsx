import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ModernCaregiverCard } from '@/components/caregiver/ModernCaregiverCard';
import { useNavigation } from '@/components/navigation/NavigationHelper';
import { ThemedText } from '@/components/themed-text';
import { ModernHeader } from '@/components/ui/ModernHeader';
import { RecentlyBooked } from '@/components/ui/RecentlyBooked';
import { ServiceCategories } from '@/components/ui/ServiceCategories';

export default function GuestHomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Sample recent bookings for demo
  const recentBookings = [
    {
      id: '1',
      caregiverName: 'Trần Văn Nam',
      caregiverAvatar: 'https://ui-avatars.com/api/?name=Tran+Van+Nam&background=4CAF50&color=fff',
      serviceType: 'Chăm sóc tại nhà',
      date: 'Hôm nay, 08:00',
      status: 'completed' as const,
    },
    {
      id: '2',
      caregiverName: 'Nguyễn Thị Mai',
      caregiverAvatar: 'https://ui-avatars.com/api/?name=Nguyen+Thi+Mai&background=9C27B0&color=fff',
      serviceType: 'Vật lý trị liệu',
      date: 'Hôm nay, 14:00',
      status: 'in-progress' as const,
    },
    {
      id: '3',
      caregiverName: 'Lê Thị Hoa',
      caregiverAvatar: 'https://ui-avatars.com/api/?name=Le+Thi+Hoa&background=2196F3&color=fff',
      serviceType: 'Đồng hành',
      date: 'Ngày mai, 09:00',
      status: 'upcoming' as const,
    },
  ];

  // Sample caregivers data
  const caregivers = [
    {
      id: '1',
      name: 'Trần Văn Nam',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Van+Nam&background=4CAF50&color=fff',
      experience: '8 năm kinh nghiệm',
      rating: 4.8,
      reviews: 156,
      hourlyRate: 50000,
      specializations: ['Chăm sóc người già', 'Vật lý trị liệu', 'Dinh dưỡng'],
      isVerified: true,
      distance: '2.5km',
    },
    {
      id: '2',
      name: 'Nguyễn Thị Mai',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Thi+Mai&background=9C27B0&color=fff',
      experience: '5 năm kinh nghiệm',
      rating: 4.5,
      reviews: 89,
      hourlyRate: 45000,
      specializations: ['Chăm sóc người già', 'Massage trị liệu'],
      isVerified: true,
      distance: '1.8km',
    },
    {
      id: '3',
      name: 'Phạm Văn Hùng',
      avatar: 'https://ui-avatars.com/api/?name=Pham+Van+Hung&background=FF9800&color=fff',
      experience: '12 năm kinh nghiệm',
      rating: 4.9,
      reviews: 234,
      hourlyRate: 60000,
      specializations: ['Chăm sóc người già', 'Y tá', 'Vật lý trị liệu'],
      isVerified: true,
      distance: '3.2km',
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleBookPress = (caregiver: any) => {
    Alert.alert(
      'Đăng nhập để đặt lịch',
      `Bạn cần đăng nhập để đặt lịch với ${caregiver.name}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('/login') },
      ]
    );
  };

  const handleCaregiverPress = (caregiver: any) => {
    Alert.alert('Thông tin', `Xem chi tiết ${caregiver.name}`);
  };

  const handleCategoryPress = (category: any) => {
    Alert.alert('Dịch vụ', `Bạn đã chọn: ${category.title}`);
  };

  const handleSearchPress = () => {
    Alert.alert('Tìm kiếm', 'Vui lòng đăng nhập để tìm kiếm');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Modern Header with Gradient */}
        <ModernHeader
          userName="Guest"
          onSearchPress={handleSearchPress}
          onNotificationPress={() => Alert.alert('Thông báo', 'Vui lòng đăng nhập')}
          onProfilePress={() => navigation.navigate('/login')}
        />

        {/* Service Categories */}
        <ServiceCategories onCategoryPress={handleCategoryPress} />

        {/* Recently Booked */}
        <RecentlyBooked
          bookings={recentBookings}
          onBookingPress={(booking) => {
            Alert.alert('Chi tiết đặt lịch', `Lịch hẹn với ${booking.caregiverName}`);
          }}
          onSeeAllPress={() => {
            Alert.alert('Đăng nhập', 'Vui lòng đăng nhập để xem tất cả');
          }}
        />

        {/* Caregivers List */}
        <View style={styles.caregiversSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Người chăm sóc người thân
            </ThemedText>
            <TouchableOpacity onPress={() => Alert.alert('Bộ lọc', 'Vui lòng đăng nhập')}>
              <View style={styles.filterButton}>
                <ThemedText style={styles.filterText}>Bộ lọc</ThemedText>
                <Ionicons name="filter" size={16} color="#FF6B6B" />
              </View>
            </TouchableOpacity>
          </View>

          {caregivers.map((caregiver) => (
            <ModernCaregiverCard
              key={caregiver.id}
              {...caregiver}
              onPress={() => handleCaregiverPress(caregiver)}
              onBookPress={() => handleBookPress(caregiver)}
            />
          ))}
        </View>

        {/* Login CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Ionicons name="heart-circle" size={48} color="#FF6B6B" />
            <ThemedText style={styles.ctaTitle}>
              Bắt đầu chăm sóc ngay hôm nay
            </ThemedText>
            <ThemedText style={styles.ctaDescription}>
              Đăng nhập để đặt lịch và quản lý chăm sóc người thân yêu
            </ThemedText>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('/login')}
            >
              <ThemedText style={styles.ctaButtonText}>Đăng nhập</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaButtonSecondary}
              onPress={() => navigation.navigate('/register')}
            >
              <ThemedText style={styles.ctaButtonSecondaryText}>Tạo tài khoản mới</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  caregiversSection: {
    marginTop: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginRight: 4,
  },
  ctaSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  ctaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  ctaButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  bottomSpacing: {
    height: 40,
  },
});
