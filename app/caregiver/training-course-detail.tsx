import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { CoursesAPI } from "@/services/api/courses.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Lesson {
  _id: string;
  title: string;
  duration: number; // in minutes
  order: number;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  totalLessons: number;
  totalDuration: number;
  lessons: Lesson[];
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  level: string;
  duration: number;
  totalLessons: number;
  totalModules: number;
  enrollmentCount: number;
  category: string;
  tags: string[];
  isEnrolled: boolean;
  enrollment: any | null;
  modules: Module[];
}

// Helper function to format duration
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

export default function TrainingCourseDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id, refresh } = route.params as { id: string; refresh?: number };
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Fetch course details
  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CoursesAPI.getCourseById(id);
      
      if (response.success) {
        setCourse(response.data);
        // Expand first module by default
        if (response.data.modules.length > 0) {
          setExpandedModules(new Set([response.data.modules[0]._id]));
        }
        
        // Fetch progress if enrolled
        if (response.data.isEnrolled) {
          fetchCourseProgress();
        }
      }
    } catch (error: any) {
      console.error("Error fetching course detail:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải chi tiết khóa học. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch course progress
  const fetchCourseProgress = useCallback(async () => {
    try {
      const response = await CoursesAPI.getCourseProgress(id);
      
      if (response.success) {
        setProgress(response.data.enrollment.progress);
        
        // Build set of completed lesson IDs
        const completedIds = new Set(
          response.data.lessons
            .filter(l => l.isCompleted)
            .map(l => l.lesson._id)
        );
        setCompletedLessons(completedIds);
      }
    } catch (error: any) {
      console.error("Error fetching course progress:", error);
      // Don't show alert for progress errors
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail, refresh]); // Re-fetch when refresh param changes

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải khóa học...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
      </View>
    );
  }

  const handleEnroll = async () => {
    // Nếu đã đăng ký, vào học luôn
    if (course.isEnrolled) {
      // Tìm bài học đầu tiên
      if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
        const firstLesson = course.modules[0].lessons[0];
        navigation.navigate("Chi tiết bài học", {
          lessonId: firstLesson._id,
          courseId: course._id,
          courseTitle: course.title,
        });
      } else {
        Alert.alert("Thông báo", "Khóa học chưa có bài học nào");
      }
      return;
    }

    // Nếu chưa đăng ký, gọi API đăng ký
    try {
      const response = await CoursesAPI.enrollCourse(course._id);
      
      if (response.success) {
        Alert.alert(
          "Thành công",
          "Bạn đã đăng ký khóa học thành công!",
          [
            {
              text: "OK",
              onPress: () => {
                // Refresh course data
                fetchCourseDetail();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error("Error enrolling course:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể đăng ký khóa học. Vui lòng thử lại."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={["#6366F1", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroSection}
        >
          {/* Category Tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>

          {/* Course Title */}
          <Text style={styles.heroTitle}>{course.title}</Text>

          {/* Course Description */}
          <Text style={styles.heroDescription}>{course.description}</Text>

          {/* Meta Information */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group" size={18} color="#fff" />
              <Text style={styles.metaText}>{course.enrollmentCount.toLocaleString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#fff" />
              <Text style={styles.metaText}>{formatDuration(course.duration)}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="book-open-variant" size={18} color="#fff" />
              <Text style={styles.metaText}>{course.totalLessons} bài</Text>
            </View>
          </View>

          {/* Instructor */}
          <View style={styles.instructorRow}>
            <Image
              source={{ uri: course.instructor.avatar }}
              defaultSource={require('@/assets/images/partial-react-logo.png')}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{course.instructor.name}</Text>
              <Text style={styles.instructorTitle}>{course.instructor.title}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Section - Only show if enrolled */}
        {course.isEnrolled && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ học tập</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedLessons.size} / {course.totalLessons} bài học đã hoàn thành
            </Text>
          </View>
        )}

        {/* Course Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Nội dung khóa học</Text>
          <Text style={styles.contentSummary}>
            {course.totalModules} modules • {course.totalLessons} bài học
          </Text>

          {/* Modules List */}
          {course.modules.map((module) => {
            const isExpanded = expandedModules.has(module._id);
            return (
              <TouchableOpacity
                key={module._id}
                style={styles.moduleCard}
                onPress={() => toggleModule(module._id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleHeaderContent}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                    <Text style={styles.moduleLessonCount}>
                      {module.lessons.length} bài học
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#4B5563"
                  />
                </View>

                {/* Lessons List (when expanded) */}
                {isExpanded && (
                  <View style={styles.lessonsList}>
                    {module.lessons.map((lesson, index) => {
                      const isCompleted = completedLessons.has(lesson._id);
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.lessonItem}
                          onPress={() =>
                            navigation.navigate("Chi tiết bài học", {
                              lessonId: lesson._id,
                              courseId: course._id,
                              courseTitle: course.title,
                            })
                          }
                          activeOpacity={0.7}
                        >
                          <View style={styles.playIconContainer}>
                            {isCompleted ? (
                              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            ) : (
                              <Ionicons name="play-circle" size={24} color="#6366F1" />
                            )}
                          </View>
                          <View style={styles.lessonContent}>
                            <Text style={[styles.lessonTitle, isCompleted && styles.lessonTitleCompleted]}>
                              {lesson.title}
                            </Text>
                            <View style={styles.lessonDuration}>
                              <Ionicons name="time-outline" size={14} color="#6B7280" />
                              <Text style={styles.lessonDurationText}>{formatDuration(lesson.duration)}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={[styles.enrollButton, course.isEnrolled && styles.enrolledButton]} 
          activeOpacity={0.8} 
          onPress={handleEnroll}
        >
          <Text style={styles.enrollButtonText}>
            {course.isEnrolled ? "TIẾP TỤC HỌC" : "ĐĂNG KÝ NGAY"}
          </Text>
        </TouchableOpacity>
      </View>

      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 32,
    paddingHorizontal: 16,
    position: "relative",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    lineHeight: 32,
  },
  heroDescription: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.95,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  instructorTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  progressSection: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366F1",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  contentSummary: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  moduleCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
  },
  moduleHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    lineHeight: 20,
  },
  moduleLessonCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  lessonsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  playIconContainer: {
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  lessonTitleCompleted: {
    color: "#10B981",
    textDecorationLine: "line-through",
    textDecorationColor: "#10B981",
  },
  lessonDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lessonDurationText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  enrollButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  enrolledButton: {
    backgroundColor: "#10B981",
  },
  enrollButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
});
