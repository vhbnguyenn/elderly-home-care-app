import { appointmentsDataMap } from "@/app/caregiver/appointment-detail";
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentHasComplained, getAppointmentHasReviewed, getAppointmentStatus, subscribeToStatusChanges, updateAppointmentStatus } from "@/data/appointmentStore";
import { BookingAPI, CaregiverBooking } from "@/services/api/booking.api";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BookingStatus = "Mới" | "Chờ thực hiện" | "Đang thực hiện" | "Hoàn thành" | "Đã hủy";

interface Booking {
  id: string;
  elderName: string;
  age: number;
  location: string;
  packageType: string;
  packageDetail: string;
  date: string;
  time: string;
  address: string;
  phone: string;
  price: number;
  status: BookingStatus;
  statusBadge: string;
  avatar: string;
  responseDeadline?: string; // ISO string for deadline
}

const mockBookings: Booking[] = [
  {
    id: "1",
    elderName: "Bà Nguyễn Thị Lan",
    age: 75,
    location: "Q7, TP.HCM",
    packageType: "Gói Cao Cấp",
    packageDetail: "Gói Cao Cấp",
    date: "Thứ 6, 25/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "123 Nguyễn Văn Linh, P. Tân Phú, Q.7, TP.HCM",
    phone: "0909 123 456",
    price: 1100000,
    status: "Đang thực hiện",
    statusBadge: "Đang thực hiện",
    avatar: "👵",
  },
  {
    id: "2",
    elderName: "Ông Trần Văn Hùng",
    age: 68,
    location: "Q9, TP.HCM",
    packageType: "Gói Chuyên Nghiệp",
    packageDetail: "Gói Chuyên Nghiệp",
    date: "Thứ 7, 26/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "456 Lê Văn Việt, P. Tăng Nhơn Phú A, Q.9, TP.HCM",
    phone: "0909 456 789",
    price: 750000,
    status: "Chờ thực hiện",
    statusBadge: "Chờ thực hiện",
    avatar: "👴",
  },
  {
    id: "3",
    elderName: "Bà Lê Thị Hoa",
    age: 82,
    location: "Q1, TP.HCM",
    packageType: "Gói Cơ Bản",
    packageDetail: "Gói Cơ Bản",
    date: "Thứ ba, 11/11/2025",
    time: "8:00 - 12:00 (4 giờ)",
    address: "789 Pasteur, P. Bến Nghé, Q.1, TP.HCM",
    phone: "0909 789 123",
    price: 400000,
    status: "Mới",
    statusBadge: "Mới",
    avatar: "👵",
    // Calculate deadline: 3 days before appointment date at 23:59:59
    responseDeadline: (() => {
      const appointmentDate = new Date(2025, 10, 11); // Month is 0-indexed, so 10 = November
      const deadline = new Date(appointmentDate);
      deadline.setDate(deadline.getDate() - 3);
      deadline.setHours(23, 59, 59, 999);
      return deadline.toISOString();
    })(),
  },
  {
    id: "4",
    elderName: "Ông Phạm Văn Đức",
    age: 70,
    location: "Q2, TP.HCM",
    packageType: "Gói Chuyên Nghiệp",
    packageDetail: "Gói Chuyên Nghiệp",
    date: "Thứ 2, 20/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "321 Nguyễn Duy Trinh, P. Bình Trưng Đông, Q.2, TP.HCM",
    phone: "0909 321 654",
    price: 750000,
    status: "Hoàn thành",
    statusBadge: "Hoàn thành",
    avatar: "👴",
  },
];

export default function BookingManagement() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { initialTab?: BookingStatus } | undefined;
  
  const [activeTab, setActiveTab] = useState<BookingStatus>(params?.initialTab || "Mới");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apiBookings, setApiBookings] = useState<CaregiverBooking[]>([]);
  const [elderlyCache, setElderlyCache] = useState<Map<string, any>>(new Map());
  const [packageCache, setPackageCache] = useState<Map<string, any>>(new Map());
  const [reviewStatusCache, setReviewStatusCache] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Check-in modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInImage, setCheckInImage] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>("");

  // Get status color based on BookingStatus
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case "Mới":
        return "#3B82F6"; // Blue
      case "Chờ thực hiện":
        return "#10B981"; // Green
      case "Đang thực hiện":
        return "#8B5CF6"; // Purple
      case "Hoàn thành":
        return "#6B7280"; // Gray
      case "Đã hủy":
        return "#EF4444"; // Red
      default:
        return "#6B7280";
    }
  };

  // Get status label
  const getStatusLabel = (status: BookingStatus): string => {
    return status;
  };

  // Map API status to UI status
  const mapApiStatusToUI = (apiStatus: CaregiverBooking['status']): BookingStatus => {
    switch (apiStatus) {
      case "pending":
        return "Mới";
      case "confirmed":
        return "Chờ thực hiện";
      case "in-progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
      case "rejected":
        return "Đã hủy";
      default:
        return "Mới";
    }
  };

  // Map UI status to API status
  const mapUIStatusToApi = (uiStatus: BookingStatus): string => {
    switch (uiStatus) {
      case "Mới":
        return "pending";
      case "Chờ thực hiện":
        return "confirmed";
      case "Đang thực hiện":
        return "in-progress";
      case "Hoàn thành":
        return "completed";
      case "Đã hủy":
        return "cancelled,rejected";
      default:
        return "";
    }
  };

  // Fetch elderly profile by ID
  const fetchElderlyProfile = async (elderlyId: string) => {
    // Check cache first
    if (elderlyCache.has(elderlyId)) {
      return elderlyCache.get(elderlyId);
    }

    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.ELDERLY.GET_BY_ID(elderlyId)
      );
      const elderlyData = response.data.data || response.data;
      
      // Cache the result
      setElderlyCache(prev => new Map(prev).set(elderlyId, elderlyData));
      
      return elderlyData;
    } catch (error) {
      console.error("Error fetching elderly profile:", elderlyId, error);
      return null;
    }
  };

  // Fetch package by ID
  const fetchPackage = async (packageId: string) => {
    // Check cache first
    if (packageCache.has(packageId)) {
      return packageCache.get(packageId);
    }

    try {
      const response = await axiosInstance.get(
        `/api/packages/${packageId}`
      );
      const packageData = response.data.data || response.data;
      
      // Cache the result
      setPackageCache(prev => new Map(prev).set(packageId, packageData));
      
      return packageData;
    } catch (error) {
      console.error("Error fetching package:", packageId, error);
      return null;
    }
  };

  // Fetch review status for a booking
  const fetchReviewStatus = async (bookingId: string, forceRefresh: boolean = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh && reviewStatusCache.has(bookingId)) {
      return reviewStatusCache.get(bookingId);
    }

    try {
      // Try to fetch caregiver review by booking ID
      const reviewResponse = await BookingAPI.getCaregiverReviewByBooking(bookingId);
      const hasReview = !!reviewResponse?.data;
      
      // Cache the result
      setReviewStatusCache(prev => new Map(prev).set(bookingId, hasReview));
      
      // Also update local store if different
      const localHasReviewed = getAppointmentHasReviewed(bookingId);
      if (hasReview !== localHasReviewed && hasReview) {
        const { markAppointmentAsReviewed } = require("@/data/appointmentStore");
        const reviewId = reviewResponse?.data?._id;
        markAppointmentAsReviewed(bookingId, { reviewId });
      }
      
      return hasReview;
    } catch (error) {
      // If API fails (404 is expected when no review exists), fallback to local store
      const localHasReviewed = getAppointmentHasReviewed(bookingId);
      setReviewStatusCache(prev => new Map(prev).set(bookingId, localHasReviewed));
      return localHasReviewed;
    }
  };

  // Transform API booking to UI booking
  const transformApiBooking = async (apiBooking: CaregiverBooking): Promise<Booking> => {
    const bookingDate = new Date(apiBooking.bookingDate);
    const daysOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayOfWeek = daysOfWeek[bookingDate.getDay()];
    const formattedDate = `${dayOfWeek}, ${bookingDate.getDate()}/${bookingDate.getMonth() + 1}/${bookingDate.getFullYear()}`;
    
    const endHour = parseInt(apiBooking.bookingTime.split(':')[0]) + apiBooking.duration;
    const endTime = `${endHour}:${apiBooking.bookingTime.split(':')[1] || '00'}`;

    // Get package name
    let packageName = "Gói dịch vụ";
    if (typeof apiBooking.package === 'object' && apiBooking.package) {
      // Package is populated
      packageName = apiBooking.package.packageName || apiBooking.package.packageType || "Gói dịch vụ";
    } else if (typeof apiBooking.package === 'string') {
      // Package is just an ID, fetch it
      const packageData = await fetchPackage(apiBooking.package);
      if (packageData) {
        packageName = packageData.packageName || packageData.packageType || "Gói dịch vụ";
      }
    }

    // Get elderly info
    let elderlyAge = 0;
    let elderlyAvatar = "👵";
    let elderlyName = apiBooking.careseeker.name;

    // If elderlyProfile is populated
    if (typeof apiBooking.elderlyProfile === 'object' && apiBooking.elderlyProfile) {
      elderlyName = apiBooking.elderlyProfile.fullName || elderlyName;
      elderlyAvatar = apiBooking.elderlyProfile.profileImage || apiBooking.elderlyProfile.avatar || elderlyAvatar;
      
      if (apiBooking.elderlyProfile.dateOfBirth) {
        const birthDate = new Date(apiBooking.elderlyProfile.dateOfBirth);
        const today = new Date();
        elderlyAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          elderlyAge--;
        }
      } else if (apiBooking.elderlyProfile.age) {
        elderlyAge = apiBooking.elderlyProfile.age;
      }
    } 
    // If elderlyProfile is just an ID, fetch it
    else if (typeof apiBooking.elderlyProfile === 'string') {
      const elderlyData = await fetchElderlyProfile(apiBooking.elderlyProfile);
      if (elderlyData) {
        elderlyName = elderlyData.fullName || elderlyName;
        elderlyAvatar = elderlyData.profileImage || elderlyData.avatar || elderlyAvatar;
        
        if (elderlyData.dateOfBirth) {
          const birthDate = new Date(elderlyData.dateOfBirth);
          const today = new Date();
          elderlyAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            elderlyAge--;
          }
        } else if (elderlyData.age) {
          elderlyAge = elderlyData.age;
        }
      }
    }

    return {
      id: apiBooking._id,
      elderName: elderlyName,
      age: elderlyAge,
      location: apiBooking.workLocation,
      packageType: packageName,
      packageDetail: apiBooking.services.map(s => s.name).join(", "),
      date: formattedDate,
      time: `${apiBooking.bookingTime} - ${endTime} (${apiBooking.duration} giờ)`,
      address: apiBooking.workLocation,
      phone: apiBooking.careseeker.phone,
      price: apiBooking.totalPrice,
      status: mapApiStatusToUI(apiBooking.status),
      statusBadge: mapApiStatusToUI(apiBooking.status),
      avatar: elderlyAvatar,
    };
  };

  // Fetch bookings from API
  const fetchBookings = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) setLoading(true);

      // Fetch all bookings (don't filter by status here, filter on frontend)
      const response = await BookingAPI.getCaregiverBookings({
        page,
        limit: 10,
      });

      if (response.success) {
        setApiBookings(append ? [...apiBookings, ...response.data] : response.data);
        
        // Transform bookings (with elderly data fetched)
        const transformed = await Promise.all(
          response.data.map(booking => transformApiBooking(booking))
        );
        
        setBookings(append ? [...bookings, ...transformed] : transformed);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        setHasMore(response.currentPage < response.totalPages);

        // Fetch review status for completed bookings (force refresh to get latest from API)
        const allBookings = append ? [...bookings, ...transformed] : transformed;
        const completedBookings = allBookings.filter(b => b.status === "Hoàn thành");
        // Use Promise.all to wait for all review status fetches to complete
        await Promise.all(
          completedBookings.map(booking => fetchReviewStatus(booking.id, true))
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách lịch hẹn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchBookings(1, false);
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    // Clear review status cache to fetch fresh data
    setReviewStatusCache(new Map());
    fetchBookings(1, false);
  }, []);

  // Load more handler
  const loadMore = () => {
    if (hasMore && !loading && currentPage < totalPages) {
      fetchBookings(currentPage + 1, true);
    }
  };
  
  // Map appointment status to booking status
  const mapStatusToBookingStatus = (status: string): BookingStatus => {
    switch (status) {
      case "new": return "Mới";
      case "pending": return "Chờ thực hiện";
      case "confirmed": return "Chờ thực hiện";
      case "in-progress": return "Đang thực hiện";
      case "completed": return "Hoàn thành";
      case "cancelled": return "Đã hủy";
      case "rejected": return "Đã hủy";
      default: return "Mới";
    }
  };

  // Update active tab when params change
  useEffect(() => {
    if (params?.initialTab) {
      setActiveTab(params.initialTab);
    }
  }, [params?.initialTab]);
  
  // Subscribe to status changes from global store
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      // Trigger re-render when appointment status changes
      setRefreshKey(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Calculate tabs count using real-time status from global store
  // Re-calculate when refreshKey changes to ensure counts are updated
  const tabs: { label: BookingStatus; count: number }[] = React.useMemo(() => {
    const countByStatus = (status: BookingStatus) => {
      return bookings.filter((b) => {
        const globalStatus = getAppointmentStatus(b.id);
        const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
        return currentStatus === status;
      }).length;
    };

    return [
      { label: "Mới", count: countByStatus("Mới") },
      { label: "Chờ thực hiện", count: countByStatus("Chờ thực hiện") },
      { label: "Đang thực hiện", count: countByStatus("Đang thực hiện") },
      { label: "Hoàn thành", count: countByStatus("Hoàn thành") },
      { label: "Đã hủy", count: countByStatus("Đã hủy") },
    ];
  }, [bookings, refreshKey]);

  const canCancelBooking = (dateStr: string): boolean => {
    const bookingDate = new Date(dateStr.split(", ")[1].split("/").reverse().join("-"));
    const today = new Date();
    const diffTime = bookingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  };

  // Calculate time remaining for deadline
  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isExpired: false };
  };

  const handleAccept = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.responseDeadline) {
      const remaining = calculateTimeRemaining(booking.responseDeadline);
      if (remaining.isExpired) {
        Alert.alert("Đã quá hạn", "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.");
        return;
      }
    }
    
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn chấp nhận yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chấp nhận",
        onPress: async () => {
          try {
            await BookingAPI.confirm(bookingId);
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, status: "Chờ thực hiện" } : b
              )
            );
            // Update global store
            updateAppointmentStatus(bookingId, "pending");
            Alert.alert("Thành công", "Đã chấp nhận yêu cầu");
          } catch (error) {
            console.error("Error accepting booking:", error);
            Alert.alert("Lỗi", "Không thể chấp nhận yêu cầu. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const handleReject = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.responseDeadline) {
      const remaining = calculateTimeRemaining(booking.responseDeadline);
      if (remaining.isExpired) {
        Alert.alert("Đã quá hạn", "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.");
        return;
      }
    }
    
    Alert.alert("Từ chối", "Bạn có chắc chắn muốn từ chối yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Từ chối",
        style: "destructive",
        onPress: async () => {
          try {
            await BookingAPI.reject(bookingId, "Không thể nhận lịch này");
            setBookings((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: "Đã hủy" } : b))
            );
            // Update global store
            updateAppointmentStatus(bookingId, "rejected");
            Alert.alert("Đã từ chối", "Yêu cầu đã bị từ chối");
          } catch (error) {
            console.error("Error rejecting booking:", error);
            Alert.alert("Lỗi", "Không thể từ chối yêu cầu. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const handleCancel = (bookingId: string, dateStr: string) => {
    if (!canCancelBooking(dateStr)) {
      Alert.alert(
        "Không thể hủy",
        "Bạn chỉ có thể hủy lịch hẹn trước 3 ngày. Lịch hẹn này còn ít hơn 3 ngày nên không thể hủy."
      );
      return;
    }

    Alert.alert("Hủy lịch hẹn", "Bạn có chắc chắn muốn hủy lịch hẹn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy lịch",
        style: "destructive",
        onPress: async () => {
          try {
            await BookingAPI.cancel(bookingId, "Có việc đột xuất");
            setBookings((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: "Đã hủy" } : b))
            );
            // Update global store
            updateAppointmentStatus(bookingId, "cancelled");
            Alert.alert("Đã hủy", "Lịch hẹn đã được hủy");
          } catch (error) {
            console.error("Error cancelling booking:", error);
            Alert.alert("Lỗi", "Không thể hủy lịch hẹn. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  // Check if there's a conflict with other in-progress appointments
  const checkStartConflict = (targetAppointmentId: string) => {
    const targetAppointment = appointmentsDataMap[targetAppointmentId];
    if (!targetAppointment) return null;

    const targetContact = targetAppointment.elderly?.emergencyContact;
    const targetAddress = targetAppointment.elderly?.address;

    // Check all appointments (except current one) that are in-progress
    for (const [id, appointment] of Object.entries(appointmentsDataMap)) {
      if (id === targetAppointmentId) continue;

      const globalStatus = getAppointmentStatus(id);
      const currentStatus = globalStatus || appointment.status;

      // If another appointment is in-progress
      if (currentStatus === "in-progress") {
        const otherContact = appointment.elderly?.emergencyContact;
        const otherAddress = appointment.elderly?.address;

        // Check if same contact (prefer phone number, fallback to name)
        const sameContact = targetContact?.phone && otherContact?.phone
          ? targetContact.phone === otherContact.phone
          : targetContact?.name === otherContact?.name;
        
        // Normalize addresses for comparison (remove extra spaces, case insensitive)
        const normalizeAddress = (addr: string) => addr?.trim().toLowerCase() || "";
        const sameAddress = normalizeAddress(targetAddress) === normalizeAddress(otherAddress);

        // Only allow if same contact AND same address
        if (!(sameContact && sameAddress)) {
          return {
            conflictingAppointmentId: id,
            conflictingElderlyName: appointment.elderly?.name || "Không xác định",
            conflictingAddress: otherAddress || "Không xác định",
          };
        }
      }
    }

    return null; // No conflict
  };

  const handleStart = (bookingId: string) => {
    // Show check-in modal for this booking
    setSelectedBookingId(bookingId);
    setShowCheckInModal(true);
  };

  const handleTakeCheckInPhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền sử dụng camera để chụp ảnh check-in.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCheckInImage(result.assets[0].uri);
        // Capture current time
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setCheckInTime(timeString);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInImage || !selectedBookingId) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chụp ảnh xác nhận vị trí trước khi check-in.');
      return;
    }

    try {
      setIsCheckingIn(true);
      
      // Get current time in HH:mm format
      const now = new Date();
      const actualStartTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Call check-in API (this also updates status to "in-progress")
      await BookingAPI.checkIn(selectedBookingId, checkInImage, actualStartTime);
      
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBookingId ? { ...b, status: "Đang thực hiện" } : b
        )
      );
      
      // Update global store
      updateAppointmentStatus(selectedBookingId, "in-progress");
      
      // Close modal and reset
      setShowCheckInModal(false);
      setCheckInImage(null);
      setSelectedBookingId(null);
      setCheckInTime("");
      
      Alert.alert('Thành công', 'Đã check-in và bắt đầu công việc!');
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleComplete = (bookingId: string) => {
    // Helper function to get appointment tasks data
    // In real app, this would come from API or context
    const getAppointmentTasks = (id: string) => {
      // Mock task data - in real app, get from API/store
      const mockTasks: { [key: string]: any } = {
        "1": {
          fixed: [
            { id: "F1", title: "Đo huyết áp và đường huyết", completed: false },
            { id: "F2", title: "Hỗ trợ vệ sinh cá nhân", completed: false },
            { id: "F3", title: "Chuẩn bị bữa sáng", completed: false },
            { id: "F4", title: "Uống thuốc", completed: false },
          ],
          flexible: [
            { id: "FL1", title: "Vận động nhẹ", completed: false },
            { id: "FL2", title: "Dọn dẹp phòng ngủ", completed: false },
            { id: "FL3", title: "Giặt quần áo", completed: false },
          ],
        },
        "2": {
          fixed: [
            { id: "F1", title: "Đo huyết áp", completed: false },
            { id: "F2", title: "Hỗ trợ vận động nhẹ", completed: false },
            { id: "F3", title: "Uống thuốc", completed: false },
          ],
          flexible: [
            { id: "FL1", title: "Trò chuyện, đọc báo", completed: false },
          ],
        },
        "3": {
          fixed: [
            { id: "F1", title: "Hỗ trợ vệ sinh cá nhân", completed: false },
            { id: "F2", title: "Chuẩn bị bữa sáng", completed: false },
            { id: "F3", title: "Uống thuốc", completed: false },
          ],
          flexible: [
            { id: "FL1", title: "Trò chuyện, xem ảnh", completed: false },
            { id: "FL2", title: "Dọn dẹp phòng", completed: false },
          ],
        },
      };
      return mockTasks[id] || { fixed: [], flexible: [] };
    };

    // Validate tasks before completing
    const tasks = getAppointmentTasks(bookingId);
    const incompleteFixedTasks = tasks.fixed.filter((task: any) => !task.completed);
    const incompleteFlexibleTasks = tasks.flexible.filter((task: any) => !task.completed);

    if (incompleteFixedTasks.length > 0 || incompleteFlexibleTasks.length > 0) {
      const missingTasks = [];
      if (incompleteFixedTasks.length > 0) {
        missingTasks.push("Nhiệm vụ cố định:");
        incompleteFixedTasks.forEach((t: any) => missingTasks.push(`• ${t.title}`));
      }
      if (incompleteFlexibleTasks.length > 0) {
        missingTasks.push("Nhiệm vụ linh hoạt:");
        incompleteFlexibleTasks.forEach((t: any) => missingTasks.push(`• ${t.title}`));
      }

      Alert.alert(
        "Chưa hoàn thành nhiệm vụ",
        `Vui lòng hoàn thành tất cả nhiệm vụ cố định và linh hoạt trước khi kết thúc ca!\n\nCòn thiếu:\n${missingTasks.join("\n")}\n\nVui lòng vào trang chi tiết để hoàn thành các nhiệm vụ.`,
        [
          { text: "OK" },
          {
            text: "Xem chi tiết",
            onPress: () => {
              navigation.navigate("Appointment Detail" as never, { appointmentId: bookingId, fromScreen: "booking" } as never);
            },
          },
        ]
      );
      return;
    }

    Alert.alert("Hoàn thành", "Xác nhận hoàn thành công việc?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Hoàn thành",
        onPress: async () => {
          try {
            await BookingAPI.complete(bookingId);
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, status: "Hoàn thành" } : b
              )
            );
            // Update global store
            updateAppointmentStatus(bookingId, "completed");
            Alert.alert("Thành công", "Công việc đã hoàn thành");
          } catch (error) {
            console.error("Error completing booking:", error);
            Alert.alert("Lỗi", "Không thể hoàn thành công việc. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const handleReview = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const hasReviewed = getAppointmentHasReviewed(bookingId);
      if (hasReviewed) {
        // Đã đánh giá rồi - Xem đánh giá
        (navigation.navigate as any)("View Review", {
          appointmentId: booking.id,
          elderlyName: booking.elderName,
          fromScreen: "booking",
        });
      } else {
        // Chưa đánh giá - Đánh giá mới
        (navigation.navigate as any)("Review", {
          appointmentId: booking.id,
          elderlyName: booking.elderName,
          fromScreen: "booking",
        });
      }
    }
  };

  const handleComplaint = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const hasComplained = getAppointmentHasComplained(bookingId);
      if (hasComplained) {
        // Đã khiếu nại rồi - Xem khiếu nại (vẫn navigate đến complaint screen nhưng ở view mode)
        (navigation.navigate as any)("Complaint", {
          bookingId: booking.id,
          elderlyName: booking.elderName,
          date: booking.date,
          time: booking.time,
          packageName: booking.packageType,
          viewMode: true,
          fromScreen: "booking",
        });
      } else {
        // Chưa khiếu nại - Tạo khiếu nại mới
        (navigation.navigate as any)("Complaint", {
          bookingId: booking.id,
          elderlyName: booking.elderName,
          date: booking.date,
          time: booking.time,
          packageName: booking.packageType,
          fromScreen: "booking",
        });
      }
    }
  };

  const handleViewDetail = (bookingId: string) => {
    navigation.navigate("Appointment Detail" as never, { appointmentId: bookingId, fromScreen: "booking" } as never);
  };

  // Format deadline to "Phản hồi trước DD/MM"
  const formatDeadlineDisplay = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const day = deadlineDate.getDate();
    const month = deadlineDate.getMonth() + 1; // Month is 0-indexed
    return `Phản hồi trước ${day}/${month}`;
  };

  // Booking Card Component
  const BookingCard = ({ item }: { item: Booking }) => {
    // Get real-time status from global store
    const globalStatus = getAppointmentStatus(item.id);
    const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : item.status;
    const hasComplained = getAppointmentHasComplained(item.id);
    
    // Check if deadline is expired (simple check, no countdown)
    const isDeadlineExpired = item.responseDeadline 
      ? new Date(item.responseDeadline).getTime() <= new Date().getTime()
      : false;
    
    return (
      <TouchableOpacity 
        style={[
          styles.card,
          hasComplained && styles.cardWithComplaint
        ]}
        onPress={() => handleViewDetail(item.id)}
        activeOpacity={0.7}
      >
        {/* Complaint Warning Badge */}
        {hasComplained && (
          <View style={styles.complaintWarningBadge}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.complaintWarningText}>Khiếu nại</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            {item.avatar.startsWith('http') ? (
              <Image 
                source={{ uri: item.avatar }} 
                style={styles.avatarImage}
                defaultSource={require('@/assets/images/partial-react-logo.png')}
              />
            ) : (
              <Text style={styles.avatarEmoji}>{item.avatar}</Text>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.elderName}>{item.elderName}</Text>
            <View style={styles.elderMeta}>
              <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.age} tuổi</Text>
            </View>
          </View>
          {/* <View style={[styles.cardStatusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <Text style={styles.cardStatusText}>{getStatusLabel(currentStatus)}</Text>
          </View> */}
        </View>

        {/* Package Name */}
        <View style={styles.packageDetail}>
          <MaterialCommunityIcons name="package-variant" size={16} color="#8B5CF6" />
          <Text style={styles.packageDetailText}>{item.packageType}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.address}</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceIcon}>💰</Text>
          <Text style={styles.priceText}>{item.price.toLocaleString()}đ</Text>
        </View>

        {/* Deadline Display - Only for new bookings */}
        {currentStatus === "Mới" && item.responseDeadline && (
          <View style={[
            styles.deadlineDisplay,
            isDeadlineExpired && styles.deadlineDisplayExpired
          ]}>
            <MaterialCommunityIcons 
              name={isDeadlineExpired ? "clock-alert" : "clock-outline"} 
              size={16} 
              color={isDeadlineExpired ? "#EF4444" : "#F59E0B"} 
            />
            <Text style={[
              styles.deadlineDisplayText,
              isDeadlineExpired && styles.deadlineDisplayTextExpired
            ]}>
              {isDeadlineExpired 
                ? "Đã quá hạn phản hồi" 
                : formatDeadlineDisplay(item.responseDeadline)
              }
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {currentStatus === "Mới" && (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.rejectButton,
                  isDeadlineExpired && styles.actionButtonDisabled
                ]}
                onPress={() => handleReject(item.id)}
                disabled={isDeadlineExpired}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.acceptButton,
                  isDeadlineExpired && styles.actionButtonDisabled
                ]}
                onPress={() => handleAccept(item.id)}
                disabled={isDeadlineExpired}
              >
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>Chấp nhận</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStatus === "Chờ thực hiện" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancel(item.id, item.date)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleStart(item.id)}
              >
                {/* <MaterialCommunityIcons name="play" size={16} color="#fff" /> */}
                <Text style={styles.acceptButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStatus === "Đang thực hiện" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleComplete(item.id)}
            >
              <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          )}

          {currentStatus === "Hoàn thành" && (() => {
            const hasReviewed = reviewStatusCache.get(item.id) ?? getAppointmentHasReviewed(item.id);
            const globalHasComplained = getAppointmentHasComplained(item.id);
            return (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.complaintButton]}
                  onPress={() => handleComplaint(item.id)}
                >
                  <MaterialCommunityIcons name={globalHasComplained ? "eye" : "alert-circle"} size={16} color="#EF4444" />
                  <Text style={styles.complaintButtonText}>{globalHasComplained ? "Xem khiếu nại" : "Khiếu nại"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.reviewButton]}
                  onPress={() => handleReview(item.id)}
                >
                  <MaterialCommunityIcons name={hasReviewed ? "eye" : "star"} size={16} color="#F59E0B" />
                  <Text style={styles.reviewButtonText}>{hasReviewed ? "Xem đánh giá" : "Đánh giá"}</Text>
                </TouchableOpacity>
              </>
            );
          })()}

          {currentStatus === "Đã hủy" && (
            <View style={styles.cancelledInfo}>
              <Text style={styles.cancelledText}>Lịch hẹn đã bị hủy</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingCard = ({ item, index }: { item: Booking; index: number }) => {
    return <BookingCard item={item} />;
  };

  // Filter bookings by activeTab, using real-time status from global store
  // Re-calculate when refreshKey changes to ensure filtered list is updated
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const globalStatus = getAppointmentStatus(b.id);
      const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
      return currentStatus === activeTab;
    });
  }, [bookings, activeTab, refreshKey]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.title}>Quản lý yêu cầu đặt lịch</Text> */}
        <Text style={styles.subtitle}>
          Theo dõi và xử lý các yêu cầu lịch chăm sóc theo trạng thái.
        </Text>
      </View>

      {/* 5 Status Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              style={[styles.tab, activeTab === tab.label && styles.tabActive]}
              onPress={() => setActiveTab(tab.label)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.label && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Booking List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F6FEB" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          extraData={refreshKey}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1F6FEB"]}
              tintColor="#1F6FEB"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loading && currentPage > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#1F6FEB" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
                Không có yêu cầu nào
              </Text>
            </View>
          }
        />
      )}

      {/* Check-in Modal */}
      <Modal
        visible={showCheckInModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCheckInModal(false);
          setCheckInImage(null);
          setSelectedBookingId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Check-in Bắt Đầu Ca</Text>
                <Text style={styles.modalSubtitle}>Xác nhận vị trí làm việc</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowCheckInModal(false);
                  setCheckInImage(null);
                  setSelectedBookingId(null);
                  setCheckInTime("");
                }}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Time Display - Show first if available */}
              {checkInTime && (
                <View style={styles.timeCard}>
                  <View style={styles.timeIconContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#10B981" />
                  </View>
                  <View style={styles.timeTextContainer}>
                    <Text style={styles.timeLabel}>Thời gian chụp ảnh</Text>
                    <Text style={styles.timeValue}>{checkInTime}</Text>
                  </View>
                </View>
              )}

              {/* Image preview or camera button */}
              {checkInImage ? (
                <View style={styles.imageSection}>
                  <Text style={styles.sectionLabel}>Ảnh xác nhận</Text>
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: checkInImage }} 
                      style={styles.checkInImagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.retakeButton}
                      onPress={handleTakeCheckInPhoto}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="camera" size={18} color="#fff" />
                      <Text style={styles.retakeButtonText}>Chụp lại</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.cameraSection}>
                  <Text style={styles.sectionLabel}>Chụp ảnh check-in</Text>
                  <TouchableOpacity 
                    style={styles.cameraButton}
                    onPress={handleTakeCheckInPhoto}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cameraIconContainer}>
                      <MaterialCommunityIcons name="camera" size={40} color="#3B82F6" />
                    </View>
                    <Text style={styles.cameraButtonTitle}>Chụp ảnh xác nhận</Text>
                    <Text style={styles.cameraButtonSubtitle}>Chụp ảnh tại vị trí làm việc</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Confirm button */}
              <TouchableOpacity
                style={[
                  styles.confirmCheckInButton,
                  (!checkInImage || isCheckingIn) && styles.confirmCheckInButtonDisabled
                ]}
                onPress={handleConfirmCheckIn}
                disabled={!checkInImage || isCheckingIn}
                activeOpacity={0.8}
              >
                {isCheckingIn ? (
                  <>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.confirmCheckInButtonText}>Đang xử lý...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                    <Text style={styles.confirmCheckInButtonText}>Xác nhận check-in</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="jobs" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 18 : 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  tabContainer: {
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
    height: 40,
  },
  tabActive: {
    backgroundColor: "#1F6FEB",
  },
  tabText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#1F6FEB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardWithComplaint: {
    borderLeftColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  elderName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  elderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  metaDot: {
    fontSize: 13,
    color: "#6B7280",
    marginHorizontal: 2,
  },
  cardStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardStatusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  packageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  packageUrgent: {
    backgroundColor: "#FEE2E2",
  },
  packageText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  packageTextUrgent: {
    color: "#EF4444",
  },
  packageDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  packageDetailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
    gap: 6,
  },
  priceIcon: {
    fontSize: 18,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  detailButton: {
    backgroundColor: "#1F6FEB",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  reviewButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },
  complaintButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  complaintButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  cancelledInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  cancelledText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  complaintWarningBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    zIndex: 10,
  },
  complaintWarningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  deadlineExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineTextExpired: {
    color: "#991B1B",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  deadlineDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  deadlineDisplayExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineDisplayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineDisplayTextExpired: {
    color: "#991B1B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timeTextContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: "#059669",
    marginBottom: 4,
    fontWeight: "500",
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#047857",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 24,
  },
  cameraSection: {
    marginBottom: 24,
  },
  cameraButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  cameraIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cameraButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  cameraButtonSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  checkInImagePreview: {
    width: "100%",
    height: 280,
  },
  retakeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retakeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmCheckInButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmCheckInButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmCheckInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});