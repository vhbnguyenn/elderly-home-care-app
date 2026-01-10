import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentComplaint, getAppointmentHasComplained, getHasComplaintFeedback, markAppointmentAsComplained } from "@/data/appointmentStore";
import { BookingAPI } from "@/services/api/booking.api";
import { DisputesAPI } from "@/services/api/disputes.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const complaintTypes = [
  { id: "service_quality", label: "Chất lượng dịch vụ kém", icon: "star-off" },
  { id: "payment", label: "Vấn đề thanh toán", icon: "cash" },
  { id: "cancellation", label: "Hủy dịch vụ", icon: "cancel" },
  { id: "scheduling", label: "Vấn đề lịch hẹn", icon: "clock-alert" },
  { id: "other", label: "Khác", icon: "help-circle" },
];

export default function ComplaintScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as {
    bookingId?: string;
    elderlyName?: string;
    date?: string;
    time?: string;
    packageName?: string;
    userId?: string;
    viewMode?: boolean;
    fromScreen?: string;
  } | undefined;

  // Use params if available, otherwise use mock data
  const appointmentInfo = {
    id: params?.bookingId || "APT001",
    elderName: params?.elderlyName || "Bà Nguyễn Thị Lan",
    date: params?.date || "2024-01-15",
    timeSlot: params?.time || "08:00 - 12:00",
    packageName: params?.packageName || "Gói chăm sóc cơ bản",
  };

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [uploadedFiles, setUploadedFiles] = useState<{ uri: string; type: string; name: string; size?: number }[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disputeDetail, setDisputeDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<{
    selectedTypes: string[];
    description: string;
    urgency: "low" | "medium" | "high";
    uploadedFiles: { uri: string; type: string; name: string; size?: number }[];
    submittedAt: string;
    status?: "pending" | "reviewing" | "need_more_info" | "resolved" | "refunded" | "rejected";
  } | null>(null);
  const [viewMode, setViewMode] = useState(params?.viewMode || false);
  const [hasComplaintFeedback, setHasComplaintFeedback] = useState(
    appointmentInfo.id ? getHasComplaintFeedback(appointmentInfo.id) : false
  );
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Sync complaint feedback status when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (appointmentInfo.id) {
        const hasFeedback = getHasComplaintFeedback(appointmentInfo.id);
        setHasComplaintFeedback(hasFeedback);
      }
    }, [appointmentInfo.id])
  );

  // Nếu có viewMode từ params, load dispute detail từ API
  React.useEffect(() => {
    const loadDisputeDetail = async () => {
      if (params?.viewMode && appointmentInfo.id) {
        setLoadingDetail(true);
        try {
          // Try to get dispute by booking ID
          const response = await DisputesAPI.getDisputeByBooking(appointmentInfo.id);
          if (response.success && response.data.dispute) {
            setDisputeDetail(response.data.dispute);
            setIsSubmitted(true);
            setViewMode(true);
          }
        } catch (error) {
          console.error('Error loading dispute detail:', error);
          // Fallback to local data if API fails
          const hasComplained = getAppointmentHasComplained(appointmentInfo.id);
          if (hasComplained) {
            const complaintData = getAppointmentComplaint(appointmentInfo.id);
            if (complaintData) {
              setSubmittedComplaint(complaintData);
              setIsSubmitted(true);
              setViewMode(true);
            }
          }
        } finally {
          setLoadingDetail(false);
        }
      }
    };
    loadDisputeDetail();
  }, [params?.viewMode, appointmentInfo.id]);

  const toggleComplaintType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const getUrgencyColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handlePickDocument = async () => {
    Alert.alert(
      "Chọn tài liệu",
      "Bạn muốn chọn loại tài liệu nào?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Ảnh/Video", onPress: handlePickImageOrVideo },
        { text: "Chụp ảnh", onPress: handleTakePhoto },
      ]
    );
  };

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập thư viện để chọn ảnh/video."
        );
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập camera để chụp ảnh."
        );
        return false;
      }
    }
    return true;
  };

  const handlePickImageOrVideo = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets
          .filter((asset) => {
            const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
            if (fileSizeInMB > 10) {
              Alert.alert(
                "File quá lớn",
                `File ${asset.fileName || "không tên"} vượt quá 10MB. Vui lòng chọn file nhỏ hơn.`
              );
              return false;
            }
            return true;
          })
          .map((asset) => ({
            uri: asset.uri,
            type: asset.type || "image",
            name: asset.fileName || `file_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
            size: asset.fileSize,
          }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error("Error picking image/video:", error);
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
        
        if (fileSizeInMB > 10) {
          Alert.alert("File quá lớn", "File vượt quá 10MB. Vui lòng chụp lại.");
          return;
        }

        const newFile = {
          uri: asset.uri,
          type: "image",
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
        };

        setUploadedFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một loại khiếu nại");
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert("Lỗi", "Vui lòng mô tả chi tiết ít nhất 20 ký tự");
      return;
    }

    Alert.alert(
      "Xác nhận gửi khiếu nại",
      "Khiếu nại của bạn sẽ được gửi đến bộ phận hỗ trợ. Bạn có chắc chắn muốn tiếp tục?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              // Get respondent ID (careseeker who booked the appointment)
              let respondentId = params?.userId || '';
              
              // If no userId in params, try to fetch from booking API
              if (!respondentId && appointmentInfo.id) {
                try {
                  console.log('Fetching booking details to get userId...');
                  
                  // Use BookingAPI.getById - it has token refresh interceptor
                  const bookingData = await BookingAPI.getById(appointmentInfo.id);
                  
                  console.log('Booking data received:', bookingData);
                  
                  // careseeker is the ObjectId string (userId) directly
                  respondentId = bookingData.data?.careseeker?._id || 
                                 bookingData.data?.booking?.careseeker ||
                                 '';
                  console.log('Extracted respondentId (careseeker ID):', respondentId);
                } catch (fetchError: any) {
                  console.error('Error fetching booking details:', fetchError?.message || fetchError);
                  // Continue with empty respondentId - will show error later
                }
              }
              
              console.log('Submitting dispute with data:', {
                bookingId: appointmentInfo.id,
                respondentId,
                params,
                appointmentInfo,
              });
              
              if (!respondentId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người đặt lịch. Vui lòng thử lại từ trang chi tiết lịch hẹn.");
                setIsSubmitting(false);
                return;
              }
              
              // Map UI complaint type to API dispute type
              // Backend only accepts: service_quality, payment, scheduling, other
              // Map 'cancellation' to 'other' since backend doesn't accept it
              let disputeType = selectedTypes[0];
              if (disputeType === 'cancellation') {
                disputeType = 'other';
              }
              const apiDisputeType = disputeType as 'service_quality' | 'payment' | 'scheduling' | 'other';
              
              // Create title from selected types
              const title = complaintTypes
                .filter(t => selectedTypes.includes(t.id))
                .map(t => t.label)
                .join(', ');
              
              // Map urgency to severity
              const severity = urgency as 'low' | 'medium' | 'high';
              
              // Get complainant ID (current caregiver user)
              const userDataStr = await AsyncStorage.getItem('user_data');
              
              console.log('user_data from storage:', userDataStr);
              
              const userData = userDataStr ? JSON.parse(userDataStr) : null;
              
              console.log('Parsed user_data:', userData);
              
              const complainantId = userData?.userId || 
                                   userData?.id || 
                                   userData?._id || 
                                   '';
              
              console.log('Extracted complainantId:', complainantId);
              
              if (!complainantId) {
                Alert.alert(
                  "Lỗi", 
                  "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.",
                  [{ text: "OK" }]
                );
                setIsSubmitting(false);
                return;
              }
              
              const requestData = {
                bookingId: appointmentInfo.id,
                complainantId,
                respondentId,
                disputeType: apiDisputeType,
                severity,
                title,
                description: description.trim(),
                evidence: uploadedFiles.map(file => ({
                  type: file.type.startsWith('image') ? 'image' as const : 'document' as const,
                  url: file.uri,
                  description: file.name,
                })),
                requestedResolution: 'refund' as const,
              };
              
              console.log('Request data to send:', JSON.stringify(requestData, null, 2));
              console.log('Field values:', {
                bookingId: requestData.bookingId,
                complainantId: requestData.complainantId,
                respondentId: requestData.respondentId,
                disputeType: requestData.disputeType,
                severity: requestData.severity,
                title: requestData.title,
                description: requestData.description,
                requestedResolution: requestData.requestedResolution,
              });
              
              // Check all required fields before sending
              if (!requestData.bookingId || !requestData.complainantId || !requestData.respondentId || 
                  !requestData.disputeType || !requestData.severity || !requestData.title || 
                  !requestData.description || !requestData.requestedResolution) {
                console.error('Missing required fields!', {
                  hasBookingId: !!requestData.bookingId,
                  hasComplainantId: !!requestData.complainantId,
                  hasRespondentId: !!requestData.respondentId,
                  hasDisputeType: !!requestData.disputeType,
                  hasSeverity: !!requestData.severity,
                  hasTitle: !!requestData.title,
                  hasDescription: !!requestData.description,
                  hasRequestedResolution: !!requestData.requestedResolution,
                });
                Alert.alert("Lỗi", "Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ form.");
                setIsSubmitting(false);
                return;
              }
              
              console.log('About to call DisputesAPI.createDispute...');
              
              // Submit dispute via API
              const response = await DisputesAPI.createDispute(requestData);
              
              if (response.success) {
                // Lưu thông tin khiếu nại đã gửi
                const complaintData = {
                  selectedTypes,
                  description,
                  urgency,
                  uploadedFiles,
                  submittedAt: new Date().toISOString(),
                  status: "reviewing" as const,
                  disputeId: response.data.dispute._id,
                };
                setSubmittedComplaint(complaintData);
                setIsSubmitted(true);
                
                // Load dispute detail
                setDisputeDetail(response.data.dispute);
                
                // Đánh dấu appointment đã khiếu nại
                if (appointmentInfo.id) {
                  markAppointmentAsComplained(appointmentInfo.id, complaintData);
                }
                
                Alert.alert(
                  "Đã gửi khiếu nại",
                  response.message || "Khiếu nại của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Chuyển sang view mode để xem khiếu nại
                        setViewMode(true);
                      },
                    },
                  ]
                );
              }
            } catch (error: any) {
              console.error("Error submitting dispute:", error);
              console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              Alert.alert(
                "Lỗi gửi khiếu nại",
                error.response?.data?.message || error.message || "Không thể gửi khiếu nại. Vui lòng kiểm tra kết nối và thử lại."
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleViewComplaint = () => {
    setViewMode(true);
  };

  const handleBack = () => {
    if (params?.fromScreen) {
      switch (params.fromScreen) {
        case "booking":
          navigation.navigate("Yêu cầu dịch vụ");
          break;
        case "appointment-detail":
          // Navigate về appointment detail với appointmentId
          if (appointmentInfo.id) {
            navigation.navigate("Appointment Detail", { 
              appointmentId: appointmentInfo.id,
              fromScreen: "complaint" 
            });
          } else {
            navigation.goBack();
          }
          break;
        case "complaint-feedback":
          // Đã ở trang complaint rồi, không cần làm gì
          navigation.goBack();
          break;
        default:
          navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const handleCancelComplaint = () => {
    setShowWithdrawDialog(true);
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy khiếu nại");
      return;
    }

    setIsWithdrawing(true);
    try {
      const disputeId = disputeDetail?._id || submittedComplaint?.disputeId;
      if (!disputeId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin khiếu nại");
        return;
      }

      const response = await DisputesAPI.withdrawDispute(disputeId, withdrawReason.trim());
      
      if (response.success) {
        // Xóa khiếu nại khỏi local state
        setIsSubmitted(false);
        setSubmittedComplaint(null);
        setDisputeDetail(null);
        setSelectedTypes([]);
        setDescription("");
        setUploadedFiles([]);
        setViewMode(false);
        setShowWithdrawDialog(false);
        setWithdrawReason("");
        
        Alert.alert(
          "Thành công", 
          response.message || "Đã hủy khiếu nại thành công",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error withdrawing dispute:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể hủy khiếu nại. Vui lòng thử lại."
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleEditComplaint = () => {
    // Chuyển sang chế độ chỉnh sửa
    setViewMode(false);
    setIsSubmitted(false); // Cho phép chỉnh sửa lại form
    // Form đã có sẵn dữ liệu từ submittedComplaint
    if (submittedComplaint) {
      setSelectedTypes(submittedComplaint.selectedTypes);
      setDescription(submittedComplaint.description);
      setUrgency(submittedComplaint.urgency);
      setUploadedFiles(submittedComplaint.uploadedFiles);
    }
  };

  const handleRateComplaint = () => {
    if (hasComplaintFeedback) {
      // Đã đánh giá rồi - Xem đánh giá (navigate với viewMode)
      navigation.navigate("Complaint Feedback", {
        appointmentId: appointmentInfo.id,
        complaintId: appointmentInfo.id,
        fromScreen: "complaint",
        viewMode: true,
      });
    } else {
      // Chưa đánh giá - Đánh giá mới
      navigation.navigate("Complaint Feedback", {
        appointmentId: appointmentInfo.id,
        complaintId: appointmentInfo.id,
        fromScreen: "complaint",
      });
    }
  };

  const getComplaintStatusText = (status?: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "reviewing":
        return "Đang xem xét";
      case "need_more_info":
        return "Chờ bổ sung";
      case "resolved":
        return "Đã giải quyết";
      case "refunded":
        return "Đã hoàn tiền";
      case "rejected":
        return "Từ chối";
      default:
        return "Đang xem xét";
    }
  };

  const getComplaintStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "#6B7280"; // Gray
      case "reviewing":
        return "#3B82F6"; // Blue
      case "need_more_info":
        return "#F59E0B"; // Orange
      case "resolved":
        return "#10B981"; // Green
      case "refunded":
        return "#10B981"; // Green
      case "rejected":
        return "#EF4444"; // Red
      default:
        return "#3B82F6"; // Blue
    }
  };

  const getComplaintStatusBgColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "#F3F4F6"; // Light gray
      case "reviewing":
        return "#DBEAFE"; // Light blue
      case "need_more_info":
        return "#FEF3C7"; // Light orange
      case "resolved":
        return "#D1FAE5"; // Light green
      case "refunded":
        return "#D1FAE5"; // Light green
      case "rejected":
        return "#FEE2E2"; // Light red
      default:
        return "#DBEAFE"; // Light blue
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loadingDetail ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.loadingText}>Đang tải thông tin khiếu nại...</Text>
          </View>
        ) : viewMode && disputeDetail ? (
          /* View Mode - Hiển thị chi tiết dispute từ API */
          <>
            {/* Success Banner */}
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" />
              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Khiếu nại đã được gửi</Text>
                <Text style={styles.successText}>
                  Mã khiếu nại: #{disputeDetail._id?.slice(-8)?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.section}>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: getComplaintStatusBgColor(disputeDetail.status),
                  borderColor: getComplaintStatusColor(disputeDetail.status),
                }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getComplaintStatusColor(disputeDetail.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getComplaintStatusColor(disputeDetail.status) }
                ]}>
                  {getComplaintStatusText(disputeDetail.status)}
                </Text>
              </View>
            </View>

            {/* Dispute Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khiếu nại</Text>
              
              <View style={styles.card}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.detailLabel}>Loại:</Text>
                  <Text style={styles.detailValue}>{disputeDetail.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="speedometer" size={18} color="#F59E0B" />
                  <Text style={styles.detailLabel}>Mức độ:</Text>
                  <Text style={[styles.detailValue, { color: getUrgencyColor(disputeDetail.severity) }]}>
                    {getUrgencyText(disputeDetail.severity)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" />
                  <Text style={styles.detailLabel}>Ngày tạo:</Text>
                  <Text style={styles.detailValue}>{formatDate(disputeDetail.createdAt)}</Text>
                </View>
                {disputeDetail.deadline && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-alert" size={18} color="#EF4444" />
                    <Text style={styles.detailLabel}>Hạn xử lý:</Text>
                    <Text style={styles.detailValue}>{formatDate(disputeDetail.deadline)}</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Mô tả chi tiết</Text>
                <View style={[styles.textArea, styles.textAreaReadOnly]}>
                  <Text style={styles.descriptionText}>{disputeDetail.description}</Text>
                </View>
              </View>

              {/* Evidence */}
              {disputeDetail.evidence && disputeDetail.evidence.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionSubtitle}>Bằng chứng đính kèm</Text>
                  <View style={styles.uploadedFilesContainer}>
                    {disputeDetail.evidence.map((evidence: any, index: number) => (
                      <View key={index} style={styles.fileItem}>
                        {evidence.type === "image" ? (
                          <Image source={{ uri: evidence.url }} style={styles.filePreview} />
                        ) : (
                          <View style={styles.videoPreview}>
                            <MaterialCommunityIcons name="file-document" size={32} color="#6B7280" />
                          </View>
                        )}
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {evidence.description || `Evidence ${index + 1}`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Admin Decision */}
              {disputeDetail.adminDecision && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Quyết định của Admin</Text>
                  <View style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="gavel" size={18} color="#F59E0B" />
                      <Text style={styles.detailLabel}>Quyết định:</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700' }]}>
                        {disputeDetail.adminDecision.decision === 'favor_complainant' ? 'Ủng hộ người khiếu nại' :
                         disputeDetail.adminDecision.decision === 'favor_respondent' ? 'Ủng hộ người bị khiếu nại' :
                         'Thỏa thuận'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="account" size={18} color="#F59E0B" />
                      <Text style={styles.detailLabel}>Người quyết định:</Text>
                      <Text style={styles.detailValue}>{disputeDetail.adminDecision.decidedBy?.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar-check" size={18} color="#F59E0B" />
                      <Text style={styles.detailLabel}>Ngày quyết định:</Text>
                      <Text style={styles.detailValue}>{formatDate(disputeDetail.adminDecision.decidedAt)}</Text>
                    </View>
                    {disputeDetail.adminDecision.resolution && (
                      <View style={styles.section}>
                        <Text style={styles.sectionSubtitle}>Giải pháp:</Text>
                        <Text style={styles.descriptionText}>{disputeDetail.adminDecision.resolution}</Text>
                      </View>
                    )}
                    {disputeDetail.adminDecision.notes && (
                      <View style={styles.section}>
                        <Text style={styles.sectionSubtitle}>Ghi chú:</Text>
                        <Text style={styles.descriptionText}>{disputeDetail.adminDecision.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Timeline */}
              {disputeDetail.timeline && disputeDetail.timeline.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Lịch sử xử lý</Text>
                  {disputeDetail.timeline.slice().reverse().slice(0, 5).map((event: any, index: number) => (
                    <View key={event._id} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineAction}>{event.description}</Text>
                        <Text style={styles.timelineDate}>{formatDate(event.performedAt)}</Text>
                        {event.performedBy && (
                          <Text style={styles.timelineUser}>Bởi: {event.performedBy.name}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={{ height: 100 }} />
          </>
        ) : viewMode && submittedComplaint ? (
          /* View Mode - Hiển thị khiếu nại local khi không load được API */
          <>
            {/* Success Banner */}
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Đã gửi khiếu nại</Text>
                <Text style={styles.successText}>
                  Khiếu nại của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.section}>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: getComplaintStatusBgColor(submittedComplaint.status),
                  borderColor: getComplaintStatusColor(submittedComplaint.status),
                }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getComplaintStatusColor(submittedComplaint.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getComplaintStatusColor(submittedComplaint.status) }
                ]}>
                  {getComplaintStatusText(submittedComplaint.status)}
                </Text>
              </View>
            </View>

            {/* Appointment Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
              <View style={styles.appointmentCard}>
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Mã: #{appointmentInfo.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Người cao tuổi: {appointmentInfo.elderName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Ngày: {appointmentInfo.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Giờ: {appointmentInfo.timeSlot}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="package-variant" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Gói dịch vụ: {appointmentInfo.packageName}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Submitted Complaint Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khiếu nại</Text>
              
              {/* Urgency Level */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Mức độ khẩn cấp</Text>
                <View style={styles.urgencyContainer}>
                  <View
                    style={[
                      styles.urgencyButton,
                      {
                        backgroundColor: getUrgencyColor(submittedComplaint.urgency),
                        borderColor: getUrgencyColor(submittedComplaint.urgency),
                      },
                    ]}
                  >
                    <Text style={styles.urgencyTextActive}>
                      {getUrgencyText(submittedComplaint.urgency)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Complaint Types */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Loại khiếu nại</Text>
                <View style={styles.typesGrid}>
                  {submittedComplaint.selectedTypes.map((typeId) => {
                    const type = complaintTypes.find((t) => t.id === typeId);
                    return (
                      <View key={typeId} style={[styles.typeCard, styles.typeCardActive]}>
                        <MaterialCommunityIcons
                          name={type?.icon as any}
                          size={24}
                          color="#10B981"
                        />
                        <Text style={[styles.typeLabel, styles.typeLabelActive]}>
                          {type?.label || typeId}
                        </Text>
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Mô tả chi tiết</Text>
                <View style={[styles.textArea, styles.textAreaReadOnly]}>
                  <Text style={styles.descriptionText}>{submittedComplaint.description}</Text>
                </View>
              </View>

              {/* Evidence */}
              {submittedComplaint.uploadedFiles.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionSubtitle}>Tài liệu đính kèm</Text>
                  <View style={styles.uploadedFilesContainer}>
                    {submittedComplaint.uploadedFiles.map((file, index) => (
                      <View key={index} style={styles.fileItem}>
                        {file.type === "image" ? (
                          <Image source={{ uri: file.uri }} style={styles.filePreview} />
                        ) : (
                          <View style={styles.videoPreview}>
                            <Ionicons name="videocam" size={32} color="#6B7280" />
                          </View>
                        )}
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          {file.size && (
                            <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Submitted Date */}
              <View style={styles.section}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Thời gian gửi: {formatDate(submittedComplaint.submittedAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Guidelines */}
            <View style={styles.guidelinesCard}>
              <MaterialCommunityIcons name="information" size={20} color="#2563EB" />
              <View style={styles.guidelinesContent}>
                <Text style={styles.guidelinesTitle}>Quy trình xử lý</Text>
                <Text style={styles.guidelinesText}>
                  • Khiếu nại sẽ được xem xét trong vòng 24-48 giờ{"\n"}
                  • Bạn sẽ nhận được thông báo qua email và ứng dụng{"\n"}
                  • Chúng tôi có thể liên hệ để xác minh thông tin{"\n"}
                  • Kết quả xử lý sẽ được thông báo qua hệ thống
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        ) : (
          /* Form Mode - Hiển thị form khiếu nại */
          <>
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#DC2626" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Lưu ý quan trọng</Text>
                <Text style={styles.warningText}>
                  Khiếu nại sẽ được xem xét kỹ lưỡng. Vui lòng cung cấp thông tin chính xác và chi tiết.
                </Text>
              </View>
            </View>

            {/* Status Badge - Hiển thị khi đã submit */}
            {isSubmitted && submittedComplaint && (
              <View style={styles.section}>
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getComplaintStatusBgColor(submittedComplaint.status),
                    borderColor: getComplaintStatusColor(submittedComplaint.status),
                  }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getComplaintStatusColor(submittedComplaint.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getComplaintStatusColor(submittedComplaint.status) }
                  ]}>
                    {getComplaintStatusText(submittedComplaint.status)}
                  </Text>
                </View>
              </View>
            )}

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="document-text" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Mã: #{appointmentInfo.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Người cao tuổi: {appointmentInfo.elderName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Ngày: {appointmentInfo.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Giờ: {appointmentInfo.timeSlot}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="package-variant" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Gói dịch vụ: {appointmentInfo.packageName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức độ khẩn cấp</Text>
          <View style={styles.urgencyContainer}>
            {["low", "medium", "high"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyButton,
                  urgency === level && {
                    backgroundColor: getUrgencyColor(level),
                    borderColor: getUrgencyColor(level),
                  },
                  isSubmitted && !viewMode && styles.disabledButton,
                ]}
                onPress={() => !isSubmitted && setUrgency(level as any)}
                disabled={isSubmitted && !viewMode}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === level && styles.urgencyTextActive,
                  ]}
                >
                  {getUrgencyText(level)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Complaint Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại khiếu nại *</Text>
          <Text style={styles.sectionSubtitle}>Chọn một hoặc nhiều loại</Text>
          <View style={styles.typesGrid}>
            {complaintTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedTypes.includes(type.id) && styles.typeCardActive,
                  isSubmitted && !viewMode && styles.disabledButton,
                ]}
                onPress={() => !isSubmitted && toggleComplaintType(type.id)}
                disabled={isSubmitted && !viewMode}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={24}
                  color={selectedTypes.includes(type.id) ? "#10B981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    selectedTypes.includes(type.id) && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
                {selectedTypes.includes(type.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết *</Text>
          <Text style={styles.sectionSubtitle}>
            Vui lòng mô tả chi tiết vấn đề (tối thiểu 20 ký tự)
          </Text>
          <TextInput
            style={[
              styles.textArea,
              isSubmitted && !viewMode && styles.textAreaReadOnly,
            ]}
            placeholder="Nhập mô tả chi tiết về vấn đề bạn gặp phải..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
            editable={!isSubmitted || viewMode}
          />
          <Text style={styles.charCount}>{description.length}/1000 ký tự</Text>
        </View>

        {/* Evidence (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài liệu đính kèm (Tùy chọn)</Text>
          <Text style={styles.sectionSubtitle}>
            Ảnh, video hoặc file ghi âm minh chứng
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              isSubmitted && !viewMode && styles.disabledButton,
            ]}
            onPress={handlePickDocument}
            disabled={isSubmitted && !viewMode}
          >
            <Ionicons name="cloud-upload" size={24} color="#6B7280" />
            <Text style={styles.uploadText}>Tải lên tài liệu</Text>
            <Text style={styles.uploadSubtext}>PNG, JPG, MP4 (Max 10MB)</Text>
          </TouchableOpacity>

          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <View style={styles.uploadedFilesContainer}>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  {file.type === "image" ? (
                    <Image source={{ uri: file.uri }} style={styles.filePreview} />
                  ) : (
                    <View style={styles.videoPreview}>
                      <Ionicons name="videocam" size={32} color="#6B7280" />
                    </View>
                  )}
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    {file.size && (
                      <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFile(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

            {/* Guidelines */}
            <View style={styles.guidelinesCard}>
              <MaterialCommunityIcons name="information" size={20} color="#2563EB" />
              <View style={styles.guidelinesContent}>
                <Text style={styles.guidelinesTitle}>Quy trình xử lý</Text>
                <Text style={styles.guidelinesText}>
                  • Khiếu nại sẽ được xem xét trong vòng 24-48 giờ{"\n"}
                  • Bạn sẽ nhận được thông báo qua email và ứng dụng{"\n"}
                  • Chúng tôi có thể liên hệ để xác minh thông tin{"\n"}
                  • Kết quả xử lý sẽ được thông báo qua hệ thống
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {isSubmitted && viewMode ? (
          /* Nút khi đã gửi và đang xem - Thay đổi theo trạng thái */
          (() => {
            const status = submittedComplaint?.status;
            let buttonText = "Đánh giá khiếu nại";
            let buttonIcon: "star-outline" | "close-circle-outline" | "create-outline" | "eye-outline" = "star-outline";
            let buttonColor = "#2563EB";
            let onPressHandler = handleRateComplaint;

            if (status === "pending" || status === "reviewing") {
              // Đang chờ duyệt hoặc đang xem xét -> Hủy khiếu nại
              buttonText = "Hủy khiếu nại";
              buttonIcon = "close-circle-outline";
              buttonColor = "#EF4444";
              onPressHandler = handleCancelComplaint;
            } else if (status === "need_more_info") {
              // Chờ bổ sung -> Sửa khiếu nại
              buttonText = "Sửa khiếu nại";
              buttonIcon = "create-outline";
              buttonColor = "#F59E0B";
              onPressHandler = handleEditComplaint;
            } else if (hasComplaintFeedback) {
              // Đã đánh giá -> Xem đánh giá
              buttonText = "Xem đánh giá";
              buttonIcon = "eye-outline";
              buttonColor = "#2563EB";
              onPressHandler = handleRateComplaint;
            } else {
              // Chưa đánh giá -> Đánh giá khiếu nại
              buttonText = "Đánh giá khiếu nại";
              buttonIcon = "star-outline";
              buttonColor = "#2563EB";
              onPressHandler = handleRateComplaint;
            }

            return (
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, backgroundColor: buttonColor }]}
                onPress={onPressHandler}
              >
                <Ionicons name={buttonIcon} size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            );
          })()
        ) : isSubmitted && !viewMode ? (
          /* Nút khi đã gửi nhưng đang ở form - Xem khiếu nại */
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
            >
              <Text style={styles.cancelButtonText}>Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#2563EB" }]}
              onPress={handleViewComplaint}
            >
              <MaterialCommunityIcons name="eye" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Xem khiếu nại</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Nút khi chưa gửi - Gửi khiếu nại */
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Đang gửi...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Gửi khiếu nại</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Withdraw Dialog */}
      <Modal
        visible={showWithdrawDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="alert-circle" size={40} color="#EF4444" />
              <Text style={styles.modalTitle}>Hủy khiếu nại</Text>
            </View>

            <Text style={styles.modalDescription}>
              Vui lòng cho biết lý do bạn muốn hủy khiếu nại này:
            </Text>

            <TextInput
              style={styles.withdrawReasonInput}
              placeholder="Nhập lý do hủy khiếu nại..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={withdrawReason}
              onChangeText={setWithdrawReason}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowWithdrawDialog(false);
                  setWithdrawReason("");
                }}
                disabled={isWithdrawing}
              >
                <Text style={styles.modalCancelButtonText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton, isWithdrawing && styles.submitButtonDisabled]}
                onPress={handleWithdrawSubmit}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.modalSubmitButtonText}>Đang xử lý...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#fff" />
                    <Text style={styles.modalSubmitButtonText}>Xác nhận hủy</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#991B1B",
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
  },
  urgencyContainer: {
    flexDirection: "row",
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  urgencyTextActive: {
    color: "#fff",
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    position: "relative",
  },
  typeCardActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  typeLabelActive: {
    color: "#10B981",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  uploadedFilesContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  filePreview: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  videoPreview: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#6B7280",
  },
  removeButton: {
    padding: 4,
  },
  guidelinesCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  guidelinesContent: {
    flex: 1,
    marginLeft: 12,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
  },
  bottomAction: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    marginBottom: 90, // Để không bị che bởi bottom nav
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  successBanner: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  successContent: {
    flex: 1,
    marginLeft: 12,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 4,
  },
  successText: {
    fontSize: 13,
    color: "#065F46",
    lineHeight: 18,
  },
  textAreaReadOnly: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  descriptionText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    minWidth: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginTop: 4,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#F3F4F6',
    paddingLeft: 12,
    marginLeft: -6,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  timelineUser: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  withdrawReasonInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSubmitButton: {
    backgroundColor: '#EF4444',
  },
  modalSubmitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
