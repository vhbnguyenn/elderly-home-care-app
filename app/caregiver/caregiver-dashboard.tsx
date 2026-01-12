import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { hasProfile, setProfileStatus } from "@/data/profileStore";
import { ChatAPI } from "@/services/api/chat.api";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const CARD_PADDING = 16; // paddingHorizontal của statsOuterContainer
const CARD_GAP = 12; // gap giữa các card
const CARD_WIDTH = (screenWidth - CARD_PADDING * 2 - CARD_GAP) / 2;

// Map appointment status to dashboard status display
const mapStatusToDashboard = (status: string | undefined) => {
  switch (status) {
    case "new":
    case "pending":
      return { text: "Yêu cầu mới", color: "#3B82F6" };
    case "confirmed":
      return { text: "Chờ thực hiện", color: "#F59E0B" };
    case "in-progress":
      return { text: "Đang thực hiện", color: "#8B5CF6" };
    case "completed":
      return { text: "Hoàn thành", color: "#6B7280" };
    case "cancelled":
      return { text: "Đã hủy", color: "#EF4444" };
    case "rejected":
      return { text: "Đã từ chối", color: "#DC2626" };
    default:
      return { text: "Đang thực hiện", color: "#8B5CF6" };
  }
};

const caregiverStats = {
  totalJobs: 12,
  monthlyIncome: 8.5,
  rating: 4.9,
  completionRate: 80,
  satisfactionRate: 95,
};

export default function CaregiverDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, updateProfile } = useAuth();
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's bookings from API
  const fetchTodayBookings = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all caregiver bookings
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKING.GET_CAREGIVER_BOOKINGS);
      const allBookings = response.data.data || response.data || [];
      
      // Fetch elderly profiles for each booking if needed
      const bookingsWithElderlyInfo = await Promise.all(
        allBookings.map(async (booking: any) => {
          // If elderlyProfile is just an ID, fetch the full profile
          if (booking.elderlyProfile && typeof booking.elderlyProfile === 'string') {
            try {
              const elderlyResponse = await axiosInstance.get(
                API_CONFIG.ENDPOINTS.ELDERLY.GET_BY_ID(booking.elderlyProfile)
              );
              booking.elderlyProfile = elderlyResponse.data.data || elderlyResponse.data;
            } catch (error) {
              console.error('Error fetching elderly profile:', error);
            }
          }
          return booking;
        })
      );
      
      // Filter for today's bookings
      const todayBookingsFiltered = bookingsWithElderlyInfo.filter((booking: any) => {
        const bookingDate = booking.bookingDate?.split('T')[0] || booking.startDate?.split('T')[0] || booking.start_date?.split('T')[0];
        return bookingDate === today;
      });
      
      // Count pending bookings
      const pendingCount = allBookings.filter((booking: any) => booking.status === 'pending').length;
      setPendingBookingsCount(pendingCount);
      
      setTodayBookings(todayBookingsFiltered);
    } catch (err: any) {
      console.error('Error fetching today bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, today]);

  // Fetch bookings on mount
  useEffect(() => {
    if (user?.role === "Caregiver") {
      fetchTodayBookings();
    }
  }, [user?.role, fetchTodayBookings]);

  // Fetch caregiver profile to get latest profileStatus
  const fetchCaregiverProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.CAREGIVER.GET_OWN_PROFILE);
      
      // Handle nested response structure: response.data.data contains the actual profile
      const profileData = response.data.data || response.data;

      // Get status from profile
      const statusValue = profileData.profileStatus || profileData.profile_status || profileData.status;

      // Update user context with profileStatus
      if (statusValue) {
        updateProfile({ status: statusValue });
        
        // Also update profileStore
        if (statusValue === "approved") {
          setProfileStatus(user.id, "approved");
        } else if (statusValue === "rejected") {
          setProfileStatus(user.id, "rejected", "Hồ sơ không đáp ứng yêu cầu");
        } else {
          setProfileStatus(user.id, "pending");
        }
        
        // Return the status so caller can use it
        return statusValue;
      }
    } catch (error: any) {
      // If 404, profile doesn't exist yet - that's ok
      if (error.response?.status !== 404) {
        console.error("Profile fetch error:", error);
      }
      return null; // No profile exists
    }
  }, [user?.id, updateProfile]);

  // Check profile status and navigate accordingly
  useFocusEffect(
    useCallback(() => {
      if (user && user.role === "Caregiver") {
        // Fetch latest profile status first, then decide navigation
        const checkAndNavigate = async () => {
          // Fetch latest profile from API
          const latestStatus = await fetchCaregiverProfile();
          
          // Priority 1: If API returned approved status, stay on dashboard
          if (latestStatus === "approved") {
            return; // Stay on dashboard - profile is approved
          }
          
          // Priority 2: Check user.status from AuthContext (already updated by fetchCaregiverProfile)
          if (user.status === "approved") {
            return; // Stay on dashboard - profile is approved
          }
          
          // Priority 3: If profile exists but is pending or rejected, navigate to status screen
          if (latestStatus === "pending" || latestStatus === "rejected") {
            setTimeout(() => navigation.navigate("Trạng thái hồ sơ"), 100);
            return;
          }
          
          if (user.status === "pending" || user.status === "rejected") {
            setTimeout(() => navigation.navigate("Trạng thái hồ sơ"), 100);
            return;
          }
          
          // Priority 4: If no profile exists (404 error or null status), navigate to complete profile
          if (!latestStatus) {
            const hasProfileInStore = hasProfile(user.id);
            
            if (!hasProfileInStore) {
              setTimeout(() => {
                navigation.navigate("Hoàn thiện hồ sơ", {
                  email: user.email,
                  fullName: user.name || "",
                });
              }, 100);
            }
          }
        };
        
        checkAndNavigate();
      }
    }, [user, navigation, fetchCaregiverProfile])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DC2D7" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
        <CaregiverBottomNav />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Lỗi: {error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTodayBookings}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <CaregiverBottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Xin chào</Text>
              <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
            </View>
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => navigation.navigate("Danh sách tin nhắn")}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => {/* Navigate to notifications */}}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        

        {/* New Requests Alert */}
        {pendingBookingsCount > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate("Yêu cầu dịch vụ", { initialTab: "Mới" })}
          >
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>🔔</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{pendingBookingsCount} yêu cầu mới</Text>
              <Text style={styles.alertSubtitle}>Hãy phản hồi để nhận việc</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}

      {/* Today's Schedule */}
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>Lịch hôm nay</Text>
        </View>

        {todayBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có lịch hẹn nào hôm nay</Text>
          </View>
        ) : (
          todayBookings.map((booking: any) => {
            const statusInfo = mapStatusToDashboard(booking.status);
            
            // Extract elderly profile data
            const elderlyProfile = booking.elderlyProfile;
            const elderlyAvatar = elderlyProfile?.profileImage || elderlyProfile?.avatar;
            const elderlyName = elderlyProfile?.fullName || elderlyProfile?.name || 'Người cao tuổi';
            const elderlyAge = elderlyProfile?.age || elderlyProfile?.dateOfBirth ? 
              (new Date().getFullYear() - new Date(elderlyProfile.dateOfBirth).getFullYear()) : null;
            
            // Extract booking data
            const bookingId = booking._id || booking.id;
            const packageInfo = booking.package;
            const packageName = packageInfo?.name || packageInfo?.packageName || 'Gói cơ bản';
            const bookingTime = booking.bookingTime || '--:--';
            const duration = booking.duration || 0;
            const endTimeCalculated = duration > 0 ? 
              `${String(parseInt(bookingTime.split(':')[0]) + duration).padStart(2, '0')}:${bookingTime.split(':')[1] || '00'}` : '--:--';
            const workLocation = booking.workLocation || 'Chưa có địa chỉ';
            const careseekerPhone = booking.careseeker?.phone || 'Chưa có SĐT';
            const userId = booking.careseeker?._id;
            
            return (
              <TouchableOpacity 
                key={bookingId} 
                style={styles.appointmentCard}
                onPress={() => navigation.navigate("Appointment Detail", { appointmentId: bookingId, fromScreen: "dashboard" })}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    {elderlyAvatar ? (
                      <Image 
                        source={{ uri: elderlyAvatar }} 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                      </View>
                    )}
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentName}>
                        {elderlyName}{elderlyAge ? `, ${elderlyAge} tuổi` : ''}
                      </Text>
                      <Text style={styles.appointmentMeta}>
                        {packageName}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
                  </View>
                </View>

                <View style={styles.appointmentFooter}>
                  <View style={styles.appointmentTimeLocation}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeIcon}>🕐</Text>
                      <Text style={styles.timeText}>{bookingTime} - {endTimeCalculated} ({duration}h)</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>{workLocation}</Text>
                    </View>
                    <View style={styles.phoneRow}>
                      <Text style={styles.phoneIcon}>📞</Text>
                      <Text style={styles.phoneText}>{careseekerPhone}</Text>
                    </View>
                  </View>

                  <View style={styles.appointmentActions}>
                    <TouchableOpacity 
                      style={styles.detailButton}
                      onPress={() => navigation.navigate("Appointment Detail", { appointmentId: bookingId, fromScreen: "dashboard" })}
                    >
                      <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.contactButton}
                      onPress={async () => {
                        try {
                          if (!userId) {
                            Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
                            return;
                          }
                          
                          // Get all chats to check if chat with this user already exists
                          const chatsResponse = await ChatAPI.getMyChats();
                          const existingChat = chatsResponse.data.find((chat) => 
                            chat.participants.some((p) => p._id === userId)
                          );
                          
                          let chatId: string;
                          
                          if (existingChat) {
                            // Chat already exists, use existing chatId
                            chatId = existingChat._id;
                          } else {
                            // Chat doesn't exist, create new one
                            const chatResponse = await ChatAPI.createOrGetChat(userId);
                            chatId = chatResponse._id;
                          }
                          
                          navigation.navigate("Tin nhắn", { 
                            clientId: userId,
                            clientName: elderlyName,
                            chatId: chatId,
                            participantId: userId,
                            fromScreen: "dashboard"
                          });
                        } catch (error: any) {
                          console.error("Error creating/getting chat:", error);
                          Alert.alert(
                            "Lỗi", 
                            error?.response?.data?.message || "Không thể tạo cuộc trò chuyện. Vui lòng thử lại."
                          );
                        }
                      }}
                    >
                      <Text style={styles.contactButtonText}>Liên hệ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsOuterContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📄</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.totalJobs}</Text>
              <Text style={styles.statLabel}>Lịch hẹn tháng này</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>💰</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.monthlyIncome}M</Text>
              <Text style={styles.statLabel}>Thu nhập tháng</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.rating}</Text>
              <Text style={styles.statLabel}>Đánh giá tổng</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#EDE7F6" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.completionRate}%</Text>
              <Text style={styles.statLabel}>Tỷ lệ hoàn thành nhiệm vụ</Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2DC2D7',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  scrollContainer: {
    flex: 1,
  },

  // Header wrapper
  headerWrapper: {
    backgroundColor: "#7CBCFF",
    paddingBottom: 20,
  },

  // Header styles
  header: {
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  headerIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },

  // Stats outer container
  statsOuterContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  // Statistics styles
  statsContainer: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  // Alert card styles
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  alertArrow: {
    fontSize: 24,
    color: "#FF9800",
    fontWeight: "700",
  },

  // Schedule card styles
  scheduleCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scheduleLink: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
  },

  // Appointment card styles
  appointmentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  appointmentInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  appointmentMeta: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentFooter: {
    marginTop: 12,
  },
  appointmentTimeLocation: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#374151",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  phoneText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  contactButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
});
