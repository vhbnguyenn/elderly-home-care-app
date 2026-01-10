import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { Lesson as APILesson, LessonsAPI, NextLesson } from "@/services/api/lessons.api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from 'react-native-webview';

// Helper to strip HTML tags from content
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

// Helper function to format duration from seconds to readable format
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}phút`;
};

export default function TrainingLessonDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as {
    lessonId: string;
    courseId?: string;
    courseTitle?: string;
  } | undefined;

  const [lesson, setLesson] = useState<APILesson | null>(null);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch lesson details
  const fetchLessonDetail = useCallback(async () => {
    if (!params?.lessonId) {
      Alert.alert("Lỗi", "Không tìm thấy ID bài học");
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const response = await LessonsAPI.getLessonById(params.lessonId);
      
      if (response.success) {
        setLesson(response.data.lesson);
        setNextLesson(response.data.nextLesson);
      }
    } catch (error: any) {
      console.error("Error fetching lesson detail:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải chi tiết bài học. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [params?.lessonId, navigation]);

  useEffect(() => {
    fetchLessonDetail();
  }, [fetchLessonDetail]);

  const handleMarkComplete = async () => {
    if (!params?.lessonId) return;

    try {
      const response = await LessonsAPI.completeLesson(params.lessonId);
      
      if (response.success) {
        setIsCompleted(true);
        
        // Refresh lesson detail to get updated data
        await fetchLessonDetail();
        
        Alert.alert(
          "Hoàn thành!",
          "Bạn đã hoàn thành bài học này.",
          [
            {
              text: "OK"
            }
          ]
        );
      }
    } catch (error: any) {
      console.error("Error completing lesson:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể đánh dấu hoàn thành. Vui lòng thử lại."
      );
    }
  };

  const handleNextLesson = () => {
    if (!isCompleted) {
      Alert.alert(
        "Hoàn thành bài học",
        "Vui lòng nhấn 'Đánh dấu hoàn thành' trước khi sang bài tiếp theo."
      );
      return;
    }
    
    if (!nextLesson) {
      // No next lesson, go back to course detail with refresh flag
      navigation.navigate("Chi tiết khóa học", { 
        id: params?.courseId,
        refresh: Date.now() // Force refresh
      });
      return;
    }

    // Navigate to next lesson
    navigation.push("Chi tiết bài học", {
      lessonId: nextLesson._id,
      courseId: params?.courseId,
      courseTitle: params?.courseTitle,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
        <CaregiverBottomNav activeTab="profile" />
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy bài học</Text>
        </View>
        <CaregiverBottomNav activeTab="profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Info Card */}
        <View style={styles.lessonInfoCard}>
          <Text style={styles.moduleTitle}>{lesson.module.title}</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDuration}>{formatDuration(lesson.duration)}</Text>
        </View>

        {/* Video Player Section */}
        {lesson.videoUrl && (
          <View style={styles.videoPlayerContainer}>
            <WebView
              source={{ uri: lesson.videoUrl }}
              style={styles.videoPlayer}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        )}

        {/* Content Section */}
        <View style={styles.contentCard}>
          {/* Mô tả bài học */}
          {lesson.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả bài học</Text>
              <Text style={styles.sectionText}>{lesson.description}</Text>
            </View>
          )}

          {/* Nội dung bài học */}
          {lesson.content && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung bài học</Text>
              <Text style={styles.sectionText}>{stripHtml(lesson.content)}</Text>
            </View>
          )}

          {/* Hoặc hiển thị HTML trong WebView nếu cần */}
          {lesson.content && lesson.content.includes('<') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chi tiết bài học</Text>
              <View style={styles.htmlContainer}>
                <WebView
                  source={{ html: `
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body {
                            font-family: -apple-system, system-ui;
                            font-size: 14px;
                            line-height: 1.6;
                            color: #4B5563;
                            padding: 0;
                            margin: 0;
                          }
                          h2 { color: #1F2937; font-size: 18px; margin-top: 16px; }
                          p { margin: 8px 0; }
                        </style>
                      </head>
                      <body>${lesson.content}</body>
                    </html>
                  ` }}
                  style={styles.htmlWebView}
                  scrollEnabled={false}
                />
              </View>
            </View>
          )}

          {/* Mục tiêu học tập */}
          {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mục tiêu học tập</Text>
              {lesson.learningObjectives.map((objective: string, index: number) => (
                <View key={index} style={styles.objectiveItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Đánh dấu hoàn thành Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleted && styles.completeButtonCompleted,
            ]}
            onPress={handleMarkComplete}
            activeOpacity={0.8}
            disabled={isCompleted}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.completeButtonText}>
              {isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Lesson Button - Outside content card */}
        {nextLesson && (
          <View style={styles.nextButtonWrapper}>
            <TouchableOpacity
              style={[styles.nextButton, !isCompleted && styles.nextButtonDisabled]}
              onPress={handleNextLesson}
              activeOpacity={0.8}
              disabled={!isCompleted}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.nextButtonText, !isCompleted && styles.nextButtonTextDisabled]}>
                Bài tiếp theo: {nextLesson.title}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing for bottom nav */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  lessonInfoCard: {
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  moduleTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  lessonDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  videoPlayerContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#000",
    borderRadius: 12,
    height: 220,
    overflow: 'hidden',
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
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
  htmlContainer: {
    minHeight: 200,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    overflow: 'hidden',
  },
  htmlWebView: {
    backgroundColor: "transparent",
    minHeight: 200,
  },
  contentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
    marginTop: 7,
    marginRight: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  completeButtonCompleted: {
    backgroundColor: "#10B981",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  nextButtonWrapper: {
    alignItems: "flex-end",
    marginTop: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  nextButtonTextDisabled: {
    color: "#F9FAFB",
  },
});

