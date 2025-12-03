import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { ModernCaregiverCard } from '@/components/caregiver/ModernCaregiverCard';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { CustomModal } from '@/components/ui/CustomModal';
import { ModernHeader } from '@/components/ui/ModernHeader';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import { RecentlyBooked } from '@/components/ui/RecentlyBooked';
import { ServiceCategories } from '@/components/ui/ServiceCategories';
import { useAuth } from '@/contexts/AuthContext';

export default function ModernDashboard() {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Sample recent bookings data
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleBookPress = (caregiver: any) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  const handleCaregiverPress = (caregiver: any) => {
    Alert.alert('Thông tin', `Xem chi tiết ${caregiver.name}`);
  };

  const handleCategoryPress = (category: any) => {
    Alert.alert('Dịch vụ', `Bạn đã chọn: ${category.title}`);
  };

  const handleSearchPress = () => {
    router.push('/careseeker/caregiver-search');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await logout();
      setShowLogoutModal(false);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <SimpleNavBar
        title=""
        onNotificationPress={() => setShowNotificationModal(true)}
        showNotificationBadge={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Modern Header with Gradient */}
        <ModernHeader
          userName={user?.name || 'User'}
          onSearchPress={handleSearchPress}
          onNotificationPress={() => setShowNotificationModal(true)}
          onProfilePress={() => setShowProfileModal(true)}
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
            router.push('/careseeker/appointments');
          }}
        />

        {/* Caregivers List */}
        <View style={styles.caregiversSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Người chăm sóc người thân
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/careseeker/caregiver-search')}>
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

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        caregiver={selectedCaregiver}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedCaregiver(null);
        }}
        onSuccess={() => {
          setShowBookingModal(false);
          setSelectedCaregiver(null);
          Alert.alert('Thành công', 'Đặt lịch thành công!');
        }}
      />

      {/* Profile Modal */}
      <CustomModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Tài khoản"
      >
        <View style={styles.modalContent}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <ThemedText style={styles.profileAvatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <ThemedText style={styles.profileName}>{user?.name}</ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email}</ThemedText>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowProfileModal(false);
              router.push('/careseeker/profile');
            }}
          >
            <Ionicons name="person-outline" size={24} color="#2c3e50" />
            <ThemedText style={styles.menuItemText}>Thông tin cá nhân</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowProfileModal(false);
              router.push('/careseeker/appointments');
            }}
          >
            <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
            <ThemedText style={styles.menuItemText}>Lịch hẹn của tôi</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowProfileModal(false);
              router.push('/careseeker/elderly-list');
            }}
          >
            <Ionicons name="people-outline" size={24} color="#2c3e50" />
            <ThemedText style={styles.menuItemText}>Hồ sơ người thân</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              setShowProfileModal(false);
              setShowLogoutModal(true);
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
            <ThemedText style={[styles.menuItemText, styles.logoutText]}>
              Đăng xuất
            </ThemedText>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <NotificationPanel onClose={() => setShowNotificationModal(false)} />
      </Modal>

      {/* Logout Confirmation Modal */}
      <CustomModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Xác nhận đăng xuất"
      >
        <View style={styles.logoutModalContent}>
          <ThemedText style={styles.logoutMessage}>
            Bạn có chắc chắn muốn đăng xuất?
          </ThemedText>
          <View style={styles.logoutButtons}>
            <TouchableOpacity
              style={[styles.logoutButton, styles.cancelButton]}
              onPress={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutButton, styles.confirmButton]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <ThemedText style={styles.confirmButtonText}>
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
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
  bottomSpacing: {
    height: 100,
  },
  modalContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  logoutText: {
    color: '#E74C3C',
  },
  logoutModalContent: {
    padding: 20,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
