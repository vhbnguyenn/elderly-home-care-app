import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { Course as APICourse, CoursesAPI } from "@/services/api/courses.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  enrollmentCount: number;
  duration: number; // in minutes
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  thumbnail: string;
  category: string;
  isEnrolled: boolean;
}

// Helper function to format duration from minutes to readable format
const formatDuration = (minutes: number): string => {
  // Dưới 1 giờ
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  // Dưới 1 ngày (1440 phút = 24h)
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}phút`;
  }
  
  // Dưới 1 tháng (43200 phút = 30 ngày)
  if (minutes < 43200) {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    
    if (remainingHours === 0) {
      return `${days} ngày`;
    }
    
    return `${days} ngày ${remainingHours}h`;
  }
  
  // Dưới 1 năm (525600 phút = 365 ngày)
  if (minutes < 525600) {
    const months = Math.floor(minutes / 43200);
    const remainingDays = Math.floor((minutes % 43200) / 1440);
    
    if (remainingDays === 0) {
      return `${months} tháng`;
    }
    
    return `${months} tháng ${remainingDays} ngày`;
  }
  
  // Từ 1 năm trở lên
  const years = Math.floor(minutes / 525600);
  const remainingMonths = Math.floor((minutes % 525600) / 43200);
  
  if (remainingMonths === 0) {
    return `${years} năm`;
  }
  
  return `${years} năm ${remainingMonths} tháng`;
};

// Course Card Component
const CourseCard = ({ item, onPress }: { item: Course; onPress: () => void }) => {
  const getCategoryColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "cơ bản":
        return "#10B981";
      case "trung cấp":
        return "#F59E0B";
      case "nâng cao":
        return "#EF4444";
      default:
        return "#10B981";
    }
  };

  const hasValidAvatar = item.instructor?.avatar && 
    typeof item.instructor.avatar === 'string' && 
    item.instructor.avatar.trim().length > 0;

  return (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Course Image */}
      <View style={styles.courseImageContainer}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.courseImage}
          resizeMode="cover"
        />
        {item.isEnrolled && (
          <View style={styles.enrolledBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#FFF" />
            <Text style={styles.enrolledText}>Đã đăng ký</Text>
          </View>
        )}
      </View>

      {/* Course Content */}
      <View style={styles.courseContent}>
        {/* Category Tag */}
        <View style={styles.courseHeader}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.level) }]}>
            <Text style={styles.categoryText}>{item.level}</Text>
          </View>
        </View>

        {/* Course Title */}
        <Text style={styles.courseTitle}>{item.title}</Text>

        {/* Course Description */}
        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Participants and Duration */}
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{item.enrollmentCount.toLocaleString()} học viên</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>

        {/* Instructor */}
        <View style={styles.instructorContainer}>
          {hasValidAvatar ? (
            <Image 
              source={{ uri: item.instructor.avatar }} 
              style={styles.instructorAvatar}
              defaultSource={require('@/assets/images/partial-react-logo.png')}
            />
          ) : (
            <View style={[styles.instructorAvatar, styles.avatarPlaceholder]}>
              <MaterialCommunityIcons name="account" size={24} color="#9CA3AF" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.instructorName}>{item.instructor?.name || 'Giảng viên'}</Text>
            <Text style={styles.instructorTitle}>{item.instructor?.title || 'Chuyên gia'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TrainingCoursesMobile({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CoursesAPI.getCourses();
      
      // Map API data to component format
      const mappedCourses: Course[] = response.data.map((course: APICourse) => ({
        id: course._id,
        title: course.title,
        description: course.description,
        level: course.level,
        enrollmentCount: course.enrollmentCount,
        duration: course.duration,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        category: course.category,
        isEnrolled: course.isEnrolled,
      }));
      
      setCourses(mappedCourses);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách khóa học. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseCard = ({ item }: { item: Course }) => (
    <CourseCard
      item={item}
      onPress={() => navigation.navigate("Chi tiết khóa học", { id: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#2563EB", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>
            Đào Tạo Chăm Sóc{"\n"}Người Cao Tuổi
          </Text>
          <Text style={styles.heroSubtitle}>
            Học các kỹ năng chuyên nghiệp từ các chuyên gia hàng đầu
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm khóa học..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        {/* Featured Courses Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Khóa Học Nổi Bật</Text>
          <Text style={styles.sectionSubtitle}>
            Khám phá các khóa học được đánh giá cao nhất
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Đang tải khóa học...</Text>
            </View>
          ) : filteredCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="book-open-variant" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {searchQuery ? "Không tìm thấy khóa học phù hợp" : "Chưa có khóa học nào"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCourses}
              renderItem={renderCourseCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.coursesList}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    opacity: 0.95,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
  },
  featuredSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  courseImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  enrolledBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enrolledText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  instructorName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  instructorTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
