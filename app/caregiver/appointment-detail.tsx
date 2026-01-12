import { PaymentCode } from "@/components/caregiver/PaymentCode";
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentHasComplained, getAppointmentHasReviewed, getAppointmentReview, getAppointmentStatus, subscribeToStatusChanges, updateAppointmentStatus } from "@/data/appointmentStore";
import { BookingAPI } from "@/services/api/booking.api";
import { ChatAPI } from "@/services/api/chat.api";
import { ReviewAPI } from "@/services/api/review.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data - Multiple appointments
export const appointmentsDataMap: { [key: string]: any } = {
  "1": {
    id: "APT001",
    status: "in-progress", // new, pending, confirmed, in-progress, completed, cancelled, rejected
    date: "2025-10-25",
    timeSlot: "08:00 - 16:00",
    userId: "677cdd7cd85e80a1eb92b57a", // ID của careseeker (người đặt lịch)
    duration: "8 giờ",
    packageType: "Gói Cao Cấp",
    
    // Elderly Info
    elderly: {
      id: "E001",
      name: "Bà Nguyễn Thị Lan",
    age: 75,
    gender: "Nữ",
    avatar: "https://via.placeholder.com/100",
    address: "123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM",
    phone: "0901234567",
    
    // Medical Information
    bloodType: "O+",
    healthCondition: "Tiểu đường, Huyết áp cao",
    underlyingDiseases: ["Tiểu đường type 2", "Huyết áp cao"],
    medications: [
      {
        name: "Metformin 500mg",
        dosage: "1 viên",
        frequency: "2 lần/ngày (sáng, tối)",
      },
      {
        name: "Losartan 50mg",
        dosage: "1 viên",
        frequency: "1 lần/ngày (sáng)",
      },
    ],
    allergies: ["Penicillin"],
    specialConditions: ["Cần theo dõi đường huyết thường xuyên", "Chế độ ăn ít muối, ít đường"],
    
    // Independence Level
    independenceLevel: {
      eating: "assisted", // independent, assisted, dependent
      bathing: "dependent",
      mobility: "assisted",
      toileting: "assisted",
      dressing: "dependent",
    },
    
    // Living Environment
    livingEnvironment: {
      houseType: "apartment", // private_house, apartment, nursing_home
      livingWith: ["Con trai", "Con dâu"],
      accessibility: ["Có thang máy", "Không có bậc thềm", "Tay vịn phòng tắm"],
    },
    
    // Preferences
    hobbies: ["Nghe nhạc trữ tình", "Xem truyền hình", "Làm vườn"],
    favoriteActivities: ["Trò chuyện", "Đọc báo"],
    foodPreferences: ["Cháo", "Rau luộc", "Cá hấp"],
    
    emergencyContact: {
      name: "Nguyễn Văn A",
      relationship: "Con trai",
      phone: "0912345678",
    },
  },
  
  // Tasks
  tasks: {
    fixed: [
      {
        id: "F1",
        time: "08:00",
        title: "Đo huyết áp và đường huyết",
        description: "Đo và ghi chép chỉ số huyết áp, đường huyết buổi sáng",
        completed: false,
        required: true,
      },
      {
        id: "F2",
        time: "08:30",
        title: "Hỗ trợ vệ sinh cá nhân",
        description: "Giúp đỡ tắm rửa, thay quần áo sạch sẽ",
        completed: false,
        required: true,
      },
      {
        id: "F3",
        time: "09:00",
        title: "Chuẩn bị bữa sáng",
        description: "Cháo thịt băm, rau luộc theo thực đơn",
        completed: false,
        required: true,
      },
      {
        id: "F4",
        time: "10:00",
        title: "Uống thuốc",
        description: "Nhắc nhở và hỗ trợ uống thuốc theo đơn bác sĩ",
        completed: false,
        required: true,
      },
    ],
    flexible: [
      {
        id: "FL1",
        title: "Vận động nhẹ",
        description: "Hướng dẫn các bài tập vận động nhẹ nhàng trong 15-20 phút",
        completed: false,
      },
      {
        id: "FL2",
        title: "Dọn dẹp phòng ngủ",
        description: "Lau dọn, thay ga giường, sắp xếp đồ đạc gọn gàng",
        completed: false,
      },
      {
        id: "FL3",
        title: "Giặt quần áo",
        description: "Giặt và phơi quần áo của người già",
        completed: false,
      },
    ],
    optional: [
      {
        id: "O1",
        title: "Đọc báo, trò chuyện",
        description: "Dành thời gian đọc báo hoặc trò chuyện cùng người già",
        completed: false,
      },
      {
        id: "O2",
        title: "Massage nhẹ",
        description: "Massage nhẹ tay, chân để lưu thông máu",
        completed: false,
      },
    ],
  },
  
  // Notes
  notes: [
    {
      id: "N1",
      time: "07:45",
      author: "Caregiver",
      content: "Đã đến nơi, người già tỉnh táo, tinh thần tốt",
      type: "info",
    },
    {
      id: "N2",
      time: "08:15",
      author: "Caregiver",
      content: "Chỉ số huyết áp: 130/85 mmHg, Đường huyết: 6.5 mmol/L - Bình thường",
      type: "health",
    },
  ],
  
  // Special Instructions
  specialInstructions: "Bà có biến chứng tiểu đường, cần chú ý chế độ ăn nhạt, ít đường. Tránh để bà ngồi một chỗ quá lâu.",
  },
  "2": {
    id: "APT002",
    status: "pending",
    date: "2025-10-26",
    timeSlot: "08:00 - 16:00",
    duration: "8 giờ",
    packageType: "Gói Chuyên Nghiệp",
    
    elderly: {
      id: "E002",
      name: "Ông Trần Văn Hùng",
      age: 68,
      gender: "Nam",
      avatar: "https://via.placeholder.com/100",
      address: "456 Lê Văn Việt, P. Tăng Nhơn Phú A, Q.9, TP.HCM",
      phone: "0909456789",
      
      bloodType: "A+",
      healthCondition: "Đau khớp, Tim mạch",
      underlyingDiseases: ["Viêm khớp", "Tăng huyết áp nhẹ"],
      medications: [
        {
          name: "Glucosamine 1500mg",
          dosage: "1 viên",
          frequency: "1 lần/ngày (sáng)",
        },
      ],
      allergies: ["Không"],
      specialConditions: ["Cần hỗ trợ vận động nhẹ nhàng", "Tránh vận động mạnh"],
      
      independenceLevel: {
        eating: "independent",
        bathing: "assisted",
        mobility: "assisted",
        toileting: "independent",
        dressing: "assisted",
      },
      
      livingEnvironment: {
        houseType: "apartment",
        livingWith: ["Vợ"],
        accessibility: ["Có thang máy", "Tay vịn hành lang"],
      },
      
      hobbies: ["Đọc báo", "Nghe radio"],
      favoriteActivities: ["Đi dạo buổi sáng"],
      foodPreferences: ["Cơm", "Thịt hầm", "Canh rau"],
      
      emergencyContact: {
        name: "Trần Thị C",
        relationship: "Vợ",
        phone: "0912345679",
      },
    },
    
    tasks: {
      fixed: [
        {
          id: "F1",
          time: "14:00",
          title: "Đo huyết áp",
          description: "Đo và ghi chép chỉ số huyết áp",
          completed: false,
          required: true,
        },
        {
          id: "F2",
          time: "14:30",
          title: "Hỗ trợ vận động nhẹ",
          description: "Đi bộ trong nhà 15 phút",
          completed: false,
          required: true,
        },
        {
          id: "F3",
          time: "15:30",
          title: "Uống thuốc",
          description: "Nhắc nhở và hỗ trợ uống thuốc",
          completed: false,
          required: true,
        },
      ],
      flexible: [
        {
          id: "FL1",
          title: "Trò chuyện, đọc báo",
          description: "Dành thời gian trò chuyện và đọc báo cùng",
          completed: false,
        },
      ],
      optional: [
        {
          id: "O1",
          title: "Massage nhẹ tay chân",
          description: "Massage nhẹ nhàng để giảm đau khớp",
          completed: false,
        },
      ],
    },
    
    notes: [],
    
    specialInstructions: "Ông có vấn đề về khớp, cần hỗ trợ nhẹ nhàng. Tránh để ông đứng hoặc ngồi quá lâu.",
  },
  "3": {
    id: "APT003",
    status: "new",
    date: "2025-11-11",
    timeSlot: "08:00 - 12:00",
    duration: "4 giờ",
    packageType: "Gói Cơ Bản",
    // Calculate deadline: 3 days before appointment date at 23:59:59
    responseDeadline: (() => {
      const appointmentDate = new Date("2025-11-11");
      const deadline = new Date(appointmentDate);
      deadline.setDate(deadline.getDate() - 3);
      deadline.setHours(23, 59, 59, 999);
      return deadline.toISOString();
    })(),
    
    elderly: {
      id: "E003",
      name: "Bà Lê Thị Hoa",
      age: 82,
      gender: "Nữ",
      avatar: "https://via.placeholder.com/100",
      address: "789 Pasteur, P. Bến Nghé, Q.1, TP.HCM",
      phone: "0909789123",
      
      bloodType: "B+",
      healthCondition: "Suy giảm trí nhớ nhẹ",
      underlyingDiseases: ["Suy giảm trí nhớ", "Loãng xương"],
      medications: [
        {
          name: "Canxi 500mg",
          dosage: "1 viên",
          frequency: "1 lần/ngày (sáng)",
        },
      ],
      allergies: ["Không"],
      specialConditions: ["Cần nhắc nhở thường xuyên", "Theo dõi sát để tránh ngã"],
      
      independenceLevel: {
        eating: "assisted",
        bathing: "dependent",
        mobility: "assisted",
        toileting: "assisted",
        dressing: "dependent",
      },
      
      livingEnvironment: {
        houseType: "private_house",
        livingWith: ["Con gái"],
        accessibility: ["Tay vịn cầu thang", "Phòng tắm có ghế"],
      },
      
      hobbies: ["Nghe nhạc", "Xem ảnh gia đình"],
      favoriteActivities: ["Ngồi trong vườn"],
      foodPreferences: ["Cháo", "Súp", "Trái cây mềm"],
      
      emergencyContact: {
        name: "Lê Thị D",
        relationship: "Con gái",
        phone: "0912345680",
      },
    },
    
    tasks: {
      fixed: [
        {
          id: "F1",
          time: "08:00",
          title: "Hỗ trợ vệ sinh cá nhân",
          description: "Giúp đỡ tắm rửa, thay quần áo",
          completed: false,
          required: true,
        },
        {
          id: "F2",
          time: "09:00",
          title: "Chuẩn bị bữa sáng",
          description: "Cháo thịt băm, dễ nuốt",
          completed: false,
          required: true,
        },
        {
          id: "F3",
          time: "10:00",
          title: "Uống thuốc",
          description: "Nhắc nhở uống canxi",
          completed: false,
          required: true,
        },
      ],
      flexible: [
        {
          id: "FL1",
          title: "Trò chuyện, xem ảnh",
          description: "Kích thích trí nhớ qua ảnh gia đình",
          completed: false,
        },
        {
          id: "FL2",
          title: "Dọn dẹp phòng",
          description: "Lau dọn, sắp xếp đồ đạc",
          completed: false,
        },
      ],
      optional: [
        {
          id: "O1",
          title: "Ngồi trong vườn",
          description: "Đưa ra vườn hít thở không khí trong lành",
          completed: false,
        },
      ],
    },
    
    notes: [],
    
    specialInstructions: "Bà có suy giảm trí nhớ nhẹ, cần nhắc nhở nhẹ nhàng và kiên nhẫn. Theo dõi sát để tránh ngã.",
  },
  "4": {
    id: "APT004",
    status: "completed",
    date: "2025-10-20",
    timeSlot: "08:00 - 16:00",
    duration: "8 giờ",
    packageType: "Gói Chuyên Nghiệp",
    
    elderly: {
      id: "E004",
      name: "Ông Phạm Văn Đức",
      age: 70,
      gender: "Nam",
      avatar: "https://via.placeholder.com/100",
      address: "321 Nguyễn Duy Trinh, P. Bình Trưng Đông, Q.2, TP.HCM",
      phone: "0909321654",
      
      bloodType: "A+",
      healthCondition: "Huyết áp cao",
      underlyingDiseases: ["Huyết áp cao"],
      medications: [
        {
          name: "Amlodipine 5mg",
          dosage: "1 viên",
          frequency: "1 lần/ngày (sáng)",
        },
      ],
      allergies: ["Không"],
      specialConditions: ["Theo dõi huyết áp thường xuyên", "Chế độ ăn ít muối"],
      
      independenceLevel: {
        eating: "independent",
        bathing: "assisted",
        mobility: "independent",
        toileting: "independent",
        dressing: "assisted",
      },
      
      livingEnvironment: {
        houseType: "apartment",
        livingWith: ["Vợ"],
        accessibility: ["Có thang máy", "Tay vịn phòng tắm"],
      },
      
      hobbies: ["Đọc báo", "Nghe đài", "Đi bộ"],
      favoriteActivities: ["Đi bộ buổi sáng", "Đọc báo"],
      foodPreferences: ["Cơm", "Rau xào", "Cá kho"],
      
      emergencyContact: {
        name: "Phạm Thị E",
        relationship: "Vợ",
        phone: "0912345681",
      },
    },
    
    tasks: {
      fixed: [
        {
          id: "F1",
          time: "08:00",
          title: "Đo huyết áp",
          description: "Đo và ghi chép chỉ số huyết áp buổi sáng",
          completed: true,
          required: true,
        },
        {
          id: "F2",
          time: "08:30",
          title: "Hỗ trợ vệ sinh cá nhân",
          description: "Giúp đỡ tắm rửa, thay quần áo",
          completed: true,
          required: true,
        },
        {
          id: "F3",
          time: "09:00",
          title: "Chuẩn bị bữa sáng",
          description: "Cơm trắng, cá kho, rau xào",
          completed: true,
          required: true,
        },
        {
          id: "F4",
          time: "10:00",
          title: "Uống thuốc",
          description: "Nhắc nhở và hỗ trợ uống thuốc huyết áp",
          completed: true,
          required: true,
        },
        {
          id: "F5",
          time: "14:00",
          title: "Đo huyết áp",
          description: "Đo và ghi chép chỉ số huyết áp buổi chiều",
          completed: true,
          required: true,
        },
      ],
      flexible: [
        {
          id: "FL1",
          title: "Đi bộ buổi sáng",
          description: "Đi bộ nhẹ nhàng trong khu vực",
          completed: true,
        },
        {
          id: "FL2",
          title: "Đọc báo",
          description: "Hỗ trợ đọc báo và trò chuyện",
          completed: true,
        },
        {
          id: "FL3",
          title: "Dọn dẹp phòng",
          description: "Lau dọn, sắp xếp đồ đạc",
          completed: true,
        },
      ],
      optional: [
        {
          id: "O1",
          title: "Massage thư giãn",
          description: "Massage nhẹ nhàng để thư giãn",
          completed: true,
        },
      ],
    },
    
    notes: [
      {
        id: "N1",
        time: "08:15",
        author: "Caregiver",
        content: "Huyết áp sáng: 130/85 mmHg - bình thường",
        type: "info",
      },
      {
        id: "N2",
        time: "14:30",
        author: "Caregiver",
        content: "Huyết áp chiều: 135/88 mmHg - hơi cao một chút, đã nhắc nhở nghỉ ngơi",
        type: "warning",
      },
    ],
    
    specialInstructions: "Ông có huyết áp cao, cần đo huyết áp 2 lần/ngày (sáng và chiều). Chế độ ăn ít muối, tránh thức ăn mặn.",
  },
};

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as { appointmentId?: string; fromScreen?: string } | undefined;
  const appointmentId = params?.appointmentId || "1";
  const fromScreen = params?.fromScreen;
  
  // State for API data
  const [appointmentData, setAppointmentData] = useState<any>(appointmentsDataMap[appointmentId] || appointmentsDataMap["1"]);
  const [loading, setLoading] = useState(true);
  
  // Fetch appointment data from API
  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      const response = await BookingAPI.getById(appointmentId);
      
      if (response.success && response.data) {
        // Transform API data to match UI format
        const apiData = response.data;
        const transformed = {
          id: apiData._id,
          status: mapApiStatusToUI(apiData.status),
          date: new Date(apiData.bookingDate).toISOString().split('T')[0],
          timeSlot: `${apiData.bookingTime} - ${calculateEndTime(apiData.bookingTime, apiData.duration)}`,
          duration: `${apiData.duration} giờ`,
          packageType: apiData.package.packageName,
          
          elderly: {
            id: apiData.elderlyProfile._id,
            name: apiData.elderlyProfile.fullName,
            age: apiData.elderlyProfile.age,
            gender: apiData.elderlyProfile.gender,
            avatar: apiData.elderlyProfile.avatar || "https://via.placeholder.com/100",
            address: apiData.elderlyProfile.address,
            phone: apiData.elderlyProfile.phone,
            bloodType: apiData.elderlyProfile.bloodType,
            healthCondition: apiData.elderlyProfile.medicalConditions?.join(", "),
            underlyingDiseases: apiData.elderlyProfile.medicalConditions || [],
            medications: apiData.elderlyProfile.medications || [],
            allergies: apiData.elderlyProfile.allergies ? [apiData.elderlyProfile.allergies] : [],
            specialConditions: apiData.elderlyProfile.specialNotes ? [apiData.elderlyProfile.specialNotes] : [],
            independenceLevel: {
              eating: "assisted",
              bathing: "dependent",
              mobility: "assisted",
              toileting: "assisted",
              dressing: "dependent",
            },
            livingEnvironment: {
              houseType: apiData.elderlyProfile.livingEnvironment?.type || "apartment",
              livingWith: apiData.elderlyProfile.livingEnvironment?.hasFamily ? ["Gia đình"] : [],
              accessibility: [],
            },
            hobbies: apiData.elderlyProfile.preferences?.hobbies || [],
            favoriteActivities: [],
            foodPreferences: apiData.elderlyProfile.preferences?.favoriteFoods || [],
            emergencyContact: apiData.elderlyProfile.emergencyContact,
          },
          
          tasks: {
            fixed: apiData.tasks
              .filter((t: any) => t.isCompleted !== undefined)
              .map((t: any, index: number) => ({
                id: t._id,
                time: apiData.bookingTime,
                title: t.taskName,
                description: t.description || "",
                completed: t.isCompleted,
                required: true,
              })),
            flexible: [],
            optional: [],
          },
          
          services: apiData.tasks.map((s: any, index: number) => ({
            id: s._id,
            title: s.taskName,
            description: s.description || "",
            completed: s.isCompleted || false,
          })),
          
          notes: [],
          specialInstructions: apiData.specialRequests || apiData.elderlyProfile.specialNotes || "",
          checkIn: apiData.checkIn,
          payment: apiData.payment,
        };
        
        setAppointmentData(transformed);
        // Update services state with API data
        setServices(transformed.services);
        
        // Fetch notes separately
        try {
          const notesResponse = await BookingAPI.getNotes(appointmentId);
          if (notesResponse.success && notesResponse.data.notes) {
            const transformedNotes = notesResponse.data.notes.map((note: any) => ({
              id: note._id,
              time: new Date(note.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              author: note.caregiver.name || "Caregiver",
              content: note.content,
              type: "info",
            }));
            setNotes(transformedNotes);
          }
        } catch (noteError) {
          console.error("Error fetching notes:", noteError);
          // Continue without notes if fetch fails
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết lịch hẹn");
      // Fallback to mock data
      setAppointmentData(appointmentsDataMap[appointmentId] || appointmentsDataMap["1"]);
    } finally {
      setLoading(false);
    }
  };
  
  // Map API status to UI status
  const mapApiStatusToUI = (apiStatus: string): string => {
    switch (apiStatus) {
      case "pending": return "new";
      case "confirmed": return "pending";
      case "in-progress": return "in-progress";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      case "rejected": return "rejected";
      default: return apiStatus;
    }
  };
  
  // Calculate end time from start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + duration;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Fetch on mount and when appointmentId changes
  useEffect(() => {
    fetchAppointmentData();
  }, [appointmentId]);
  
  const [selectedTab, setSelectedTab] = useState<"tasks" | "notes">("tasks");
  
  // Get services based on package type
  const getServicesByPackage = (packageType: string) => {
    const packageName = packageType.toLowerCase();
    
    if (packageName.includes("cơ bản") || packageName.includes("co ban")) {
      return [
        { id: "S1", title: "Tắm rửa", description: "Hỗ trợ tắm rửa và vệ sinh cá nhân", completed: false },
        { id: "S2", title: "Hỗ trợ ăn uống", description: "Chuẩn bị và hỗ trợ bữa ăn", completed: false },
        { id: "S3", title: "Massage cơ bản", description: "Massage nhẹ nhàng để thư giãn", completed: false },
        { id: "S4", title: "Trò chuyện cùng người già", description: "Dành thời gian trò chuyện và giao tiếp", completed: false },
      ];
    } else if (packageName.includes("chuyên nghiệp") || packageName.includes("chuyen nghiep")) {
      return [
        { id: "S1", title: "Tập vật lí trị liệu", description: "Hướng dẫn và hỗ trợ các bài tập phục hồi chức năng", completed: false },
        { id: "S2", title: "Massage phục hồi chức năng", description: "Massage chuyên sâu hỗ trợ phục hồi", completed: false },
        { id: "S3", title: "Theo dõi tiến trình trị liệu", description: "Ghi chép và theo dõi tiến trình hồi phục", completed: false },
      ];
    } else if (packageName.includes("cao cấp") || packageName.includes("cao cap")) {
      return [
        { id: "S1", title: "Tắm rửa", description: "Hỗ trợ tắm rửa và vệ sinh cá nhân", completed: false },
        { id: "S2", title: "Hỗ trợ ăn uống", description: "Chuẩn bị và hỗ trợ bữa ăn", completed: false },
        { id: "S3", title: "Massage cơ bản", description: "Massage nhẹ nhàng để thư giãn", completed: false },
        { id: "S4", title: "Trò chuyện cùng người già", description: "Dành thời gian trò chuyện và giao tiếp", completed: false },
        { id: "S5", title: "Nấu ăn", description: "Chuẩn bị các bữa ăn dinh dưỡng theo yêu cầu", completed: false },
        { id: "S6", title: "Dọn dẹp", description: "Vệ sinh và dọn dẹp không gian sống", completed: false },
        { id: "S7", title: "Hỗ trợ y tế", description: "Theo dõi sức khỏe và hỗ trợ các vấn đề y tế", completed: false },
      ];
    }
    // Default: Gói cơ bản
    return [
      { id: "S1", title: "Tắm rửa", description: "Hỗ trợ tắm rửa và vệ sinh cá nhân", completed: false },
      { id: "S2", title: "Hỗ trợ ăn uống", description: "Chuẩn bị và hỗ trợ bữa ăn", completed: false },
      { id: "S3", title: "Massage cơ bản", description: "Massage nhẹ nhàng để thư giãn", completed: false },
      { id: "S4", title: "Trò chuyện cùng người già", description: "Dành thời gian trò chuyện và giao tiếp", completed: false },
    ];
  };

  const [services, setServices] = useState(() => getServicesByPackage(appointmentData.packageType));
  
  // Get status from global store first, fallback to appointmentData.status
  const initialGlobalStatus = getAppointmentStatus(appointmentId);
  const [status, setStatus] = useState(initialGlobalStatus || appointmentData.status);
  
  // Check if already reviewed
  const initialHasReviewed = getAppointmentHasReviewed(appointmentId);
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
  
  // Check if has complaint
  const hasComplained = getAppointmentHasComplained(appointmentId);
  
  // Notes state
  const [notes, setNotes] = useState(appointmentData.notes);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  
  // Payment code modal state
  const [showPaymentCodeModal, setShowPaymentCodeModal] = useState(false);
  
  // Check-in modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInImage, setCheckInImage] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>("");

  // Check if deadline is expired (simple check, no countdown)
  const isDeadlineExpired = appointmentData.responseDeadline 
    ? new Date(appointmentData.responseDeadline).getTime() <= new Date().getTime()
    : false;

  // Format deadline to "Phản hồi trước DD/MM"
  const formatDeadlineDisplay = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const day = deadlineDate.getDate();
    const month = deadlineDate.getMonth() + 1; // Month is 0-indexed
    return `Phản hồi trước ${day}/${month}`;
  };

  // Setup header back button based on fromScreen param
  useEffect(() => {
    const handleBack = () => {
      if (fromScreen) {
        // Navigate to specific screen based on fromScreen param
        switch (fromScreen) {
          case "dashboard":
            (navigation.navigate as any)("Trang chủ");
            break;
          case "booking":
            (navigation.navigate as any)("Yêu cầu dịch vụ");
            break;
          case "availability":
            (navigation.navigate as any)("Quản lý lịch");
            break;
          default:
            navigation.goBack();
        }
      } else {
        // Fallback to goBack if no fromScreen param
        navigation.goBack();
      }
    };

    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBack}
          style={{ marginLeft: 15 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, fromScreen]);

  // Update services and status when appointmentId changes
  useEffect(() => {
    // Only use getServicesByPackage if services not provided from API
    if (!appointmentData.services || appointmentData.services.length === 0) {
      setServices(getServicesByPackage(appointmentData.packageType));
    } else {
      setServices(appointmentData.services);
    }
    // Get status from global store first, fallback to appointmentData.status
    const globalStatus = getAppointmentStatus(appointmentId);
    setStatus(globalStatus || appointmentData.status);
    setNotes(appointmentData.notes);
  }, [appointmentId, appointmentData.packageType, appointmentData.status, appointmentData.notes, appointmentData.services]);

  // Sync status and review status from global store when component mounts or refocuses
  useFocusEffect(
    React.useCallback(() => {
      const syncData = async () => {
        // Sync status from global store
        const globalStatus = getAppointmentStatus(appointmentId);
        if (globalStatus) {
          setStatus(globalStatus);
        }
        
        // Check review status from API first
        try {
          const review = await ReviewAPI.getByBookingId(appointmentId);
          const hasReviewFromAPI = !!review;
          setHasReviewed(hasReviewFromAPI);
          
          // If different from local store, update local store
          const globalHasReviewed = getAppointmentHasReviewed(appointmentId);
          if (hasReviewFromAPI !== globalHasReviewed) {
            if (hasReviewFromAPI && review) {
              // Mark as reviewed in local store with review data
              const { markAppointmentAsReviewed } = require("@/data/appointmentStore");
              markAppointmentAsReviewed(appointmentId, {
                reviewId: review.id,
                // Add other review data if needed
              });
            }
          }
        } catch (error) {
          // If API fails, fallback to local store
          console.log("Failed to fetch review from API, using local store:", error);
          const globalHasReviewed = getAppointmentHasReviewed(appointmentId);
          setHasReviewed(globalHasReviewed);
        }
      };
      
      syncData();
      
      // Subscribe to status changes
      const unsubscribe = subscribeToStatusChanges(() => {
        syncData();
      });
      
      return () => {
        unsubscribe();
      };
    }, [appointmentId])
  );

  const toggleServiceComplete = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const newCompletedState = !service.completed;

    try {
      // Call API to update task status
      await BookingAPI.updateTaskStatus(appointmentId, serviceId, newCompletedState);
      
      // Update local state on success
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, completed: newCompletedState } : s
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái công việc. Vui lòng thử lại.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "#3B82F6"; // Blue
      case "pending":
        return "#F59E0B"; // Orange
      case "confirmed":
        return "#10B981"; // Green - Chờ thực hiện
      case "in-progress":
        return "#8B5CF6"; // Purple
      case "completed":
        return "#6B7280"; // Gray
      case "cancelled":
        return "#EF4444"; // Red
      case "rejected":
        return "#DC2626"; // Dark Red
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "Yêu cầu mới";
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Chờ thực hiện";
      case "in-progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };
  
  // Xử lý các action buttons
  const handleAccept = () => {
    if (isDeadlineExpired) {
      Alert.alert("Đã quá hạn", "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.");
      return;
    }
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn chấp nhận lịch hẹn này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chấp nhận",
        onPress: async () => {
          try {
            await BookingAPI.confirm(appointmentId);
            const newStatus = "pending";
            setStatus(newStatus);
            updateAppointmentStatus(appointmentId, newStatus);
            Alert.alert("Thành công", "Đã chấp nhận lịch hẹn");
          } catch (error) {
            console.error("Error accepting appointment:", error);
            Alert.alert("Lỗi", "Không thể chấp nhận lịch hẹn. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    if (isDeadlineExpired) {
      Alert.alert("Đã quá hạn", "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.");
      return;
    }
    Alert.alert("Từ chối", "Bạn có chắc chắn muốn từ chối lịch hẹn này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Từ chối",
        style: "destructive",
        onPress: async () => {
          try {
            await BookingAPI.reject(appointmentId, "Không thể nhận lịch này");
            const newStatus = "rejected";
            setStatus(newStatus);
            updateAppointmentStatus(appointmentId, newStatus);
            Alert.alert("Đã từ chối", "Lịch hẹn đã bị từ chối");
          } catch (error) {
            console.error("Error rejecting appointment:", error);
            Alert.alert("Lỗi", "Không thể từ chối lịch hẹn. Vui lòng thử lại.");
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

  const handleStart = () => {
    console.log('=== handleStart called ===');
    console.log('showCheckInModal before:', showCheckInModal);
    
    // Note: Conflict check removed since we're using API data now
    // The backend should handle conflict validation
    
    // Show check-in modal
    setShowCheckInModal(true);
    console.log('setShowCheckInModal(true) called');
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
    if (!checkInImage) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chụp ảnh xác nhận vị trí trước khi check-in.');
      return;
    }

    try {
      setIsCheckingIn(true);
      
      // Get current time in HH:mm format
      const now = new Date();
      const actualStartTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Call check-in API (this also updates status to "in-progress")
      await BookingAPI.checkIn(appointmentId, checkInImage, actualStartTime);
      
      // Update local state
      const newStatus = "in-progress";
      setStatus(newStatus);
      updateAppointmentStatus(appointmentId, newStatus);
      
      // Close modal and reset
      setShowCheckInModal(false);
      setCheckInImage(null);
      setCheckInTime("");
      
      Alert.alert('Thành công', 'Đã check-in và bắt đầu công việc!');
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCancel = async () => {
    try {
      await BookingAPI.cancel(appointmentId, "Có việc đột xuất");
      const newStatus = "cancelled";
      setStatus(newStatus);
      updateAppointmentStatus(appointmentId, newStatus);
      alert("Đã hủy lịch hẹn");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      Alert.alert("Lỗi", "Không thể hủy lịch hẹn. Vui lòng thử lại.");
    }
  };

  const handleComplete = () => {
    // Validate: Kiểm tra tất cả dịch vụ đã hoàn thành chưa
    const incompleteServices = services.filter(service => !service.completed);
    
    if (incompleteServices.length > 0) {
      const missingServices = ["Còn thiếu các dịch vụ:"];
      incompleteServices.forEach(s => missingServices.push(`• ${s.title}`));
      
      Alert.alert(
        "Chưa hoàn thành dịch vụ",
        `Vui lòng hoàn thành tất cả dịch vụ trước khi kết thúc ca!\n\n${missingServices.join("\n")}`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Confirm trước khi hoàn thành
    Alert.alert(
      "Xác nhận hoàn thành",
      "Bạn có chắc chắn muốn hoàn thành ca làm việc này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Hoàn thành", 
          onPress: async () => {
            try {
              await BookingAPI.complete(appointmentId);
              const newStatus = "completed";
              setStatus(newStatus);
              updateAppointmentStatus(appointmentId, newStatus);
              // Show payment code modal instead of alert
              setShowPaymentCodeModal(true);
            } catch (error) {
              console.error("Error completing appointment:", error);
              Alert.alert("Lỗi", "Không thể hoàn thành công việc. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  const handleReview = () => {
    if (hasReviewed) {
      // Đã đánh giá rồi - Xem đánh giá
      const reviewData = getAppointmentReview(appointmentId);
      (navigation.navigate as any)("View Review", {
        appointmentId: appointmentId,
        elderlyName: appointmentData.elderly?.name || "Người được chăm sóc",
        fromScreen: "appointment-detail",
        reviewId: reviewData?.reviewId, // Pass reviewId to fetch from API
      });
    } else {
      // Chưa đánh giá - Đánh giá mới
      (navigation.navigate as any)("Review", {
        appointmentId: appointmentId,
        elderlyName: appointmentData.elderly?.name || "Người được chăm sóc",
        fromScreen: "appointment-detail",
      });
    }
  };

  const handleComplaint = () => {
    const hasComplained = getAppointmentHasComplained(appointmentId);
    const params = {
      bookingId: appointmentId,
      elderlyName: appointmentData.elderly?.name || "Người được chăm sóc",
      date: appointmentData.date,
      time: appointmentData.timeSlot,
      packageName: appointmentData.packageType,
      userId: appointmentData.userId || appointmentData.elderly?.userId || "",
      fromScreen: "appointment-detail",
    };
    
    if (hasComplained) {
      // Đã khiếu nại rồi - Xem khiếu nại
      (navigation.navigate as any)("Complaint", {
        ...params,
        viewMode: true,
      });
    } else {
      // Chưa khiếu nại - Tạo khiếu nại mới
      (navigation.navigate as any)("Complaint", params);
    }
  };

  const handleMessage = async () => {
    try {
      // Lấy thông tin người được chăm sóc (ưu tiên) hoặc người liên hệ khẩn cấp (fallback)
      const contactName = appointmentData.elderly?.name || appointmentData.elderly?.emergencyContact?.name || "Người dùng";
      
      // Tạo avatar emoji dựa trên giới tính hoặc sử dụng emoji mặc định
      let contactAvatar = "👤"; // Default
      if (appointmentData.elderly?.gender === "Nam") {
        contactAvatar = "👨";
      } else if (appointmentData.elderly?.gender === "Nữ") {
        contactAvatar = "👩";
      }
      
      // Get participant ID from appointment data
      const participantId = appointmentData.elderly?.id;
      
      if (!participantId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }
      
      // Call API to create or get chat
      const chatResponse = await ChatAPI.createOrGetChat(participantId);
      
      // Navigate to chat screen with contact information and chat ID
      (navigation.navigate as any)("Tin nhắn", {
        clientName: contactName,
        clientAvatar: contactAvatar,
        chatName: contactName, // Fallback for chat.tsx
        chatAvatar: contactAvatar, // Fallback for chat.tsx
        chatId: chatResponse._id,
        participantId: participantId,
        fromScreen: "appointment-detail",
        appointmentId: appointmentId,
      });
    } catch (error: any) {
      console.error("Error creating/getting chat:", error);
      Alert.alert(
        "Lỗi", 
        error?.response?.data?.message || "Không thể tạo cuộc trò chuyện. Vui lòng thử lại."
      );
    }
  };

  // Note handlers
  const canAddNote = status === "in-progress" || status === "confirmed";

  const handleOpenNoteModal = () => {
    if (!canAddNote) {
      alert("Chỉ có thể thêm ghi chú khi đang thực hiện công việc");
      return;
    }
    setIsNoteModalVisible(true);
  };

  const handleCloseNoteModal = () => {
    setIsNoteModalVisible(false);
    setNewNoteContent("");
  };

  const handleSaveNote = async () => {
    if (newNoteContent.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      // Call API to create note
      const response = await BookingAPI.addNote(appointmentId, newNoteContent.trim());
      
      if (response.success) {
        // Add note to local state
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newNote = {
          id: response.data._id || `N${notes.length + 1}`,
          time: timeStr,
          author: "Caregiver",
          content: newNoteContent.trim(),
          type: "info",
        };

        setNotes([newNote, ...notes]);
        handleCloseNoteModal();
        Alert.alert("Thành công", "Đã thêm ghi chú mới");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      Alert.alert("Lỗi", "Không thể thêm ghi chú. Vui lòng thử lại.");
    }
  };

  // Check if can cancel booking (more than 3 days before appointment)
  const canCancelBooking = () => {
    const appointmentDate = new Date(appointmentData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 3;
  };

  // Render bottom action buttons dựa trên trạng thái
  const renderBottomActions = () => {
    switch (status) {
      case "new":
        // Yêu cầu mới: Từ chối / Chấp nhận
        return (
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={[
                styles.actionButtonDanger,
                isDeadlineExpired && styles.actionButtonDisabled
              ]}
              onPress={handleReject}
              disabled={isDeadlineExpired}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonDangerText}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.actionButtonSuccess,
                isDeadlineExpired && styles.actionButtonDisabled
              ]}
              onPress={handleAccept}
              disabled={isDeadlineExpired}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonSuccessText}>Chấp nhận</Text>
            </TouchableOpacity>
          </View>
        );
      
      case "pending":
      case "confirmed":
        // Chờ thực hiện / Đã xác nhận: Nhắn tin / (Hủy nếu còn >= 3 ngày) / Bắt đầu
        const showCancelButton = canCancelBooking();
        return (
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#10B981" />
              <Text style={styles.actionButtonSecondaryText}>Nhắn tin</Text>
            </TouchableOpacity>
            {showCancelButton && (
              <TouchableOpacity 
                style={styles.actionButtonWarning}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonWarningText}>Hủy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={handleStart}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonPrimaryText}>Bắt đầu</Text>
            </TouchableOpacity>
          </View>
        );
      
      case "in-progress":
        // Đang thực hiện: Nhắn tin / Hoàn thành ca
        return (
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#10B981" />
              <Text style={styles.actionButtonSecondaryText}>Nhắn tin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButtonSuccess}
              onPress={handleComplete}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonSuccessText}>Hoàn thành ca</Text>
            </TouchableOpacity>
          </View>
        );
      
      case "completed":
        // Đã hoàn thành: Khiếu nại / Đánh giá hoặc Xem đánh giá
        const hasComplained = getAppointmentHasComplained(appointmentId);
        return (
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={handleComplaint}
            >
              <Ionicons name={hasComplained ? "eye-outline" : "alert-circle-outline"} size={20} color="#EF4444" />
              <Text style={[styles.actionButtonSecondaryText, { color: "#EF4444" }]}>{hasComplained ? "Xem khiếu nại" : "Khiếu nại"}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={handleReview}
            >
              <Ionicons name={hasReviewed ? "eye-outline" : "star"} size={20} color="#fff" />
              <Text style={styles.actionButtonPrimaryText}>
                {hasReviewed ? "Xem đánh giá" : "Đánh giá"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case "cancelled":
      case "rejected":
        // Đã hủy/từ chối: Không có action
        return null;
      
      default:
        return null;
    }
  };

  const getIndependenceColor = (level: string) => {
    switch (level) {
      case "independent": return "#10B981";
      case "assisted": return "#F59E0B";
      case "dependent": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getIndependenceText = (level: string) => {
    switch (level) {
      case "independent": return "Tự lập";
      case "assisted": return "Cần hỗ trợ";
      case "dependent": return "Phụ thuộc";
      default: return "Không rõ";
    }
  };

  const renderService = (service: any) => {
    // Chỉ cho phép tick service khi đang thực hiện
    const canEditService = status === "in-progress" || status === "confirmed";
    
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.taskCard, !canEditService && styles.taskCardDisabled]}
        onPress={() => canEditService && toggleServiceComplete(service.id)}
        disabled={!canEditService}
        activeOpacity={canEditService ? 0.7 : 1}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskLeft}>
            <View
              style={[
                styles.checkbox,
                service.completed && styles.checkboxCompleted,
                !canEditService && styles.checkboxDisabled,
              ]}
            >
              {service.completed && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.taskTitle,
                  service.completed && styles.taskTitleCompleted,
                  !canEditService && styles.textDisabled,
                ]}
              >
                {service.title}
              </Text>
              <Text style={[styles.taskDescription, !canEditService && styles.textDisabled]}>
                {service.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1F6FEB" />
        <Text style={styles.loadingText}>Đang tải chi tiết lịch hẹn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={appointmentData.specialInstructions ? { paddingTop: 100 } : { paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={styles.statusBadgeRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(status)}
              </Text>
            </View>
            {hasComplained && (
              <View style={styles.complaintWarningBadge}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.complaintWarningText}>Khiếu nại</Text>
              </View>
            )}
          </View>
          <Text style={styles.appointmentId}>#{appointmentData.id}</Text>
        </View>

        {/* Deadline Display - Only for new appointments */}
        {status === "new" && appointmentData.responseDeadline && (
          <View style={[
            styles.deadlineDisplay,
            isDeadlineExpired && styles.deadlineDisplayExpired
          ]}>
            <MaterialCommunityIcons 
              name={isDeadlineExpired ? "clock-alert" : "clock-outline"} 
              size={18} 
              color={isDeadlineExpired ? "#EF4444" : "#F59E0B"} 
            />
            <Text style={[
              styles.deadlineDisplayText,
              isDeadlineExpired && styles.deadlineDisplayTextExpired
            ]}>
              {isDeadlineExpired 
                ? "Đã quá hạn phản hồi" 
                : formatDeadlineDisplay(appointmentData.responseDeadline)
              }
            </Text>
          </View>
        )}

        {/* Appointment Info */}
        <View style={[styles.section, styles.firstSection]}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày</Text>
                <Text style={styles.infoValue}>{appointmentData.date}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>{appointmentData.timeSlot}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gói dịch vụ</Text>
                <Text style={styles.infoValue}>{appointmentData.packageType}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời lượng</Text>
                <Text style={styles.infoValue}>{appointmentData.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Elderly Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người cao tuổi</Text>
          <View style={styles.card}>
            <View style={styles.elderlyHeader}>
              <Image
                source={{ uri: appointmentData.elderly.avatar }}
                style={styles.avatar}
              />
              <View style={styles.elderlyInfo}>
                <Text style={styles.elderlyName}>{appointmentData.elderly.name}</Text>
                <Text style={styles.elderlyMeta}>
                  {appointmentData.elderly.age} tuổi • {appointmentData.elderly.gender}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{appointmentData.elderly.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{appointmentData.elderly.phone}</Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Blood Type */}
            <View style={styles.infoRow}>
              <Ionicons name="water" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nhóm máu</Text>
                <Text style={styles.infoValue}>{appointmentData.elderly.bloodType}</Text>
              </View>
            </View>
            
            {/* Health Conditions */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="medical-bag" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bệnh nền</Text>
                {appointmentData.elderly.underlyingDiseases.map((disease, index) => (
                  <View key={index} style={styles.diseaseTag}>
                    <MaterialCommunityIcons name="circle-small" size={16} color="#EF4444" />
                    <Text style={styles.diseaseText}>{disease}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Medications */}
            <View style={styles.medicationSection}>
              <Text style={styles.subsectionTitle}>Thuốc đang sử dụng:</Text>
              {appointmentData.elderly.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationDot} />
                  <View style={styles.medicationDetails}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>
                      {med.dosage} - {med.frequency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            {/* Allergies */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dị ứng</Text>
                <View style={styles.allergyContainer}>
                  {appointmentData.elderly.allergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyTag}>
                      <MaterialCommunityIcons name="alert" size={14} color="#EF4444" />
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Independence Level */}
            <View style={styles.independenceSection}>
              <Text style={styles.subsectionTitle}>Mức độ tự lập:</Text>
              <View style={styles.independenceGrid}>
                <View style={styles.independenceItem}>
                  <Ionicons name="restaurant" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Ăn uống</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.eating) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.eating)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="water" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Tắm rửa</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.bathing) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.bathing)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="walk" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Di chuyển</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.mobility) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.mobility)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="shirt" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Mặc đồ</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.dressing) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.dressing)}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Living Environment */}
            <View style={styles.livingEnvSection}>
              <Text style={styles.subsectionTitle}>Môi trường sống:</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="home" size={18} color="#6B7280" />
                <Text style={styles.infoText}>Căn hộ chung cư</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account-multiple" size={18} color="#6B7280" />
                <Text style={styles.infoText}>Sống cùng: {appointmentData.elderly.livingEnvironment.livingWith.join(", ")}</Text>
              </View>
              <View style={styles.accessibilityTags}>
                {appointmentData.elderly.livingEnvironment.accessibility.map((item, index) => (
                  <View key={index} style={styles.accessibilityTag}>
                    <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.accessibilityText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Hobbies & Preferences */}
            <View style={styles.preferencesSection}>
              <Text style={styles.subsectionTitle}>Sở thích & Ưa thích:</Text>
              <View style={styles.hobbyTags}>
                {appointmentData.elderly.hobbies.map((hobby, index) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.preferencesLabel}>Món ăn yêu thích:</Text>
              <View style={styles.foodTags}>
                {appointmentData.elderly.foodPreferences.map((food, index) => (
                  <View key={index} style={styles.foodTag}>
                    <Ionicons name="restaurant" size={14} color="#10B981" />
                    <Text style={styles.foodText}>{food}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            <View style={styles.emergencyContact}>
              <Text style={styles.emergencyTitle}>
                <Ionicons name="warning-outline" size={16} color="#EF4444" /> Liên hệ khẩn cấp
              </Text>
              <Text style={styles.emergencyName}>
                {appointmentData.elderly.emergencyContact.name} ({appointmentData.elderly.emergencyContact.relationship})
              </Text>
              <Text style={styles.emergencyPhone}>
                {appointmentData.elderly.emergencyContact.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "tasks" && styles.tabActive]}
            onPress={() => setSelectedTab("tasks")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "tasks" && styles.tabTextActive,
              ]}
            >
              Nhiệm vụ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "notes" && styles.tabActive]}
            onPress={() => setSelectedTab("notes")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "notes" && styles.tabTextActive,
              ]}
            >
              Ghi chú
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Tab */}
        {selectedTab === "tasks" && (
          <View style={styles.section}>
            <View style={styles.taskSection}>
              <View style={styles.taskSectionHeader}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#10B981" />
                <Text style={styles.taskSectionTitle}>Dịch vụ {appointmentData.packageType}</Text>
                <View style={styles.taskBadge}>
                  <Text style={styles.taskBadgeText}>
                    {services.filter((s) => s.completed).length}/{services.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskSectionDesc}>
                Các dịch vụ cần thực hiện trong ca làm việc
              </Text>
              {services.map((service) => renderService(service))}
            </View>
          </View>
        )}

        {/* Notes Tab */}
        {selectedTab === "notes" && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={[
                styles.addNoteButton,
                !canAddNote && styles.addNoteButtonDisabled
              ]}
              onPress={handleOpenNoteModal}
              disabled={!canAddNote}
              activeOpacity={canAddNote ? 0.7 : 1}
            >
              <Ionicons name="add-circle" size={20} color={canAddNote ? "#10B981" : "#9CA3AF"} />
              <Text style={[
                styles.addNoteText,
                !canAddNote && styles.addNoteTextDisabled
              ]}>
                {canAddNote ? "Thêm ghi chú mới" : "Chỉ có thể thêm ghi chú khi đang thực hiện"}
              </Text>
            </TouchableOpacity>

            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteAuthor}>
                    <Ionicons
                      name={note.type === "health" ? "medical" : "person-circle"}
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.noteAuthorText}>{note.author}</Text>
                  </View>
                  <Text style={styles.noteTime}>{note.time}</Text>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 180 }} />

    </ScrollView>

    {/* Special Instructions Header - Sticky */}
    {appointmentData.specialInstructions && (
      <View style={styles.stickyHeaderContainer}>
        <View style={styles.stickyHeaderContent}>
          <Text style={styles.stickyHeaderTitle}>Lưu ý đặc biệt</Text>
          <View style={styles.stickyHeaderCard}>
            <MaterialCommunityIcons name="information" size={20} color="#F59E0B" />
            <Text style={styles.instructionsText}>
              {appointmentData.specialInstructions}
            </Text>
          </View>
        </View>
      </View>
    )}

    {/* Bottom Actions - Dynamic based on status */}
    {renderBottomActions()}

    {/* Bottom Navigation - No active tab for detail page */}
    <CaregiverBottomNav activeTab="jobs" />

    {/* Add Note Modal */}
    <Modal
      visible={isNoteModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseNoteModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm ghi chú mới</Text>
            <TouchableOpacity onPress={handleCloseNoteModal}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Nội dung ghi chú</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Nhập nội dung ghi chú..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              autoFocus
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={handleCloseNoteModal}
            >
              <Text style={styles.modalButtonCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSave}
              onPress={handleSaveNote}
            >
              <Text style={styles.modalButtonSaveText}>Lưu ghi chú</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Check-in Modal */}
    <Modal
      visible={showCheckInModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCheckInModal(false)}
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
                setCheckInTime("");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Time Display - Show first if available */}
            {checkInTime && (
              <View style={styles.timeCard}>
                <View style={styles.timeIconContainer}>
                  <Ionicons name="time" size={24} color="#10B981" />
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
                    <Ionicons name="camera" size={18} color="#fff" />
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
                    <Ionicons name="camera" size={40} color="#3B82F6" />
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
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.confirmCheckInButtonText}>Xác nhận check-in</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Payment Code Modal */}
    <PaymentCode
      visible={showPaymentCodeModal}
      onClose={() => setShowPaymentCodeModal(false)}
      bookingId={appointmentData.id}
      amount={250000} // You can calculate this based on package type
      caregiverName="Người chăm sóc" // Or get from auth context
      completedAt={new Date()}
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  complaintWarningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  complaintWarningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  appointmentId: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  firstSection: {
    marginTop: -8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  elderlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  elderlyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  elderlyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  elderlyMeta: {
    fontSize: 14,
    color: "#6B7280",
  },
  emergencyContact: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 6,
  },
  emergencyName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 4,
  },
  emergencyPhone: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  instructionsCard: {
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    marginLeft: 8,
    lineHeight: 20,
  },
  stickyHeaderContainer: {
    position: "absolute",
    top: 0, // Thử đặt ở vị trí 0
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFFBEB",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  stickyHeaderContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 0,
  },
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 0,
    paddingTop: 0,
  },
  stickyHeaderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  taskSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  taskBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  taskSectionDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 28,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskLeft: {
    flexDirection: "row",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  taskInfo: {
    flex: 1,
  },
  taskTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  requiredBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  textDisabled: {
    color: "#9CA3AF",
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
    borderStyle: "dashed",
    marginBottom: 12,
  },
  addNoteButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
    opacity: 0.7,
  },
  addNoteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 6,
  },
  addNoteTextDisabled: {
    color: "#9CA3AF",
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  noteAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteAuthorText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 6,
  },
  noteTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  noteContent: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  bottomActions: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 90,
  flexDirection: "row",
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: "#FFFFFF",
  borderTopWidth: 1,
  borderTopColor: "#F3F4F6",
  gap: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 5,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  // New button styles
  actionButtonSuccess: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonSuccessText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  actionButtonDanger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDangerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  actionButtonWarning: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonWarningText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  // New styles for elderly info
  diseaseTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  diseaseText: {
    fontSize: 13,
    color: "#1F2937",
    marginLeft: 4,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 8,
  },
  medicationSection: {
    marginTop: 8,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  medicationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginTop: 6,
    marginRight: 8,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  medicationDosage: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  allergyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  allergyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  allergyText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  specialConditionsSection: {
    marginTop: 8,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 6,
  },
  conditionText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  independenceSection: {
    marginTop: 8,
  },
  independenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  independenceItem: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  independenceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 6,
  },
  independenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  independenceBadgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  livingEnvSection: {
    marginTop: 8,
  },
  accessibilityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  accessibilityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  accessibilityText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "500",
  },
  preferencesSection: {
    marginTop: 8,
  },
  preferencesLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 6,
  },
  hobbyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  hobbyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  hobbyText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
  foodTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  foodTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  foodText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
    maxHeight: 200,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButtonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalButtonSave: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },
  modalButtonSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  deadlineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    gap: 12,
  },
  deadlineCardExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  deadlineTitleExpired: {
    color: "#991B1B",
  },
  deadlineTime: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
  },
  deadlineTimeExpired: {
    color: "#991B1B",
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
    width: "100%",
  },
  deadlineExpired: {
    backgroundColor: "#FEE2E2",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  deadlineDisplayExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineDisplayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineDisplayTextExpired: {
    color: "#991B1B",
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
