import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CaregiverBottomNav from "../../components/navigation/CaregiverBottomNav";
import { FeedbackAPI, getDeviceInfo } from "../../services/api/feedback.api";

// Star Rating Component
const StarRating = ({
  rating,
  onRatingChange,
  maxStars = 5,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
}) => {
  return (
    <View style={styles.starContainer}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange(starValue)}
            style={styles.starButton}
          >
            <MaterialCommunityIcons
              name={starValue <= rating ? "star" : "star-outline"}
              size={32}
              color={starValue <= rating ? "#FCD34D" : "#D1D5DB"}
            />
          </TouchableOpacity>
        );
      })}
      {rating > 0 && (
        <Text style={styles.ratingText}>{rating} / {maxStars}</Text>
      )}
    </View>
  );
};

interface FeedbackData {
  feedbackType: 'bug_report' | 'feature_request' | 'general_feedback' | 'suggestion' | '';
  category: 'booking' | 'payment' | 'profile' | 'ui' | 'performance' | 'other' | '';
  priority: 'low' | 'medium' | 'high' | '';
  title: string;
  description: string;
  satisfactionRating: number;
  tags: string[];
}

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { fromScreen?: string } | undefined;
  
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    feedbackType: '',
    category: '',
    priority: '',
    title: '',
    description: '',
    satisfactionRating: 0,
    tags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const feedbackTypeOptions = [
    { value: 'bug_report', label: '🐛 Báo lỗi', icon: 'bug', color: '#EF4444' },
    { value: 'feature_request', label: '✨ Yêu cầu tính năng', icon: 'lightbulb-on', color: '#F59E0B' },
    { value: 'general_feedback', label: '💬 Góp ý chung', icon: 'message-text', color: '#10B981' },
    { value: 'suggestion', label: '💡 Đề xuất', icon: 'comment-question', color: '#3B82F6' },
  ];

  const categoryOptions = [
    { value: 'booking', label: '📅 Đặt lịch', icon: 'calendar-check' },
    { value: 'payment', label: '💰 Thanh toán', icon: 'cash' },
    { value: 'profile', label: '👤 Hồ sơ', icon: 'account' },
    { value: 'ui', label: '🎨 Giao diện', icon: 'palette' },
    { value: 'performance', label: '⚡ Hiệu suất', icon: 'speedometer' },
    { value: 'other', label: '📦 Khác', icon: 'dots-horizontal' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Thấp', color: '#10B981' },
    { value: 'medium', label: 'Trung bình', color: '#F59E0B' },
    { value: 'high', label: 'Cao', color: '#EF4444' },
  ];

  const addTag = () => {
    if (tagInput.trim() && !feedbackData.tags.includes(tagInput.trim())) {
      setFeedbackData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFeedbackData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!feedbackData.feedbackType || !feedbackData.category || !feedbackData.priority || !feedbackData.title || !feedbackData.description) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get device info
      const deviceInfo = await getDeviceInfo();

      // Submit feedback
      const response = await FeedbackAPI.submitFeedback({
        feedbackType: feedbackData.feedbackType as 'bug_report' | 'feature_request' | 'general_feedback' | 'suggestion',
        category: feedbackData.category as 'booking' | 'payment' | 'profile' | 'ui' | 'performance' | 'other',
        priority: feedbackData.priority as 'low' | 'medium' | 'high',
        title: feedbackData.title,
        description: feedbackData.description,
        deviceInfo,
        satisfactionRating: feedbackData.satisfactionRating,
        tags: feedbackData.tags,
      });

      if (response.success) {
        Alert.alert(
          "Thành công",
          response.message || "Cảm ơn bạn đã góp ý! Góp ý của bạn sẽ giúp chúng tôi cải thiện hệ thống.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate về FAQ nếu đến từ FAQ, ngược lại goBack
                if (params?.fromScreen === "faq") {
                  navigation.navigate("Câu hỏi thường gặp" as never);
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể gửi góp ý. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="comment-text-multiple" size={48} color="#10B981" />
          <Text style={styles.headerTitle}>Góp ý của bạn rất quan trọng!</Text>
          <Text style={styles.headerSubtitle}>
            Giúp chúng tôi cải thiện dịch vụ và trải nghiệm của bạn
          </Text>
        </View>

        {/* Loại góp ý */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
              <MaterialCommunityIcons name="format-list-bulleted-type" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Loại góp ý <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.typeGrid}>
            {feedbackTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.typeCard,
                  feedbackData.feedbackType === option.value && {
                    borderColor: option.color,
                    borderWidth: 2,
                    backgroundColor: `${option.color}10`,
                  },
                ]}
                onPress={() => setFeedbackData({ ...feedbackData, feedbackType: option.value as any })}
              >
                <MaterialCommunityIcons 
                  name={option.icon as any} 
                  size={28} 
                  color={feedbackData.feedbackType === option.value ? option.color : '#9CA3AF'} 
                />
                <Text style={[
                  styles.typeLabel,
                  feedbackData.feedbackType === option.value && { color: option.color, fontWeight: '700' }
                ]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Danh mục */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
              <MaterialCommunityIcons name="tag" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Danh mục <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.categoryGrid}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.categoryChip,
                  feedbackData.category === option.value && styles.categoryChipSelected,
                ]}
                onPress={() => setFeedbackData({ ...feedbackData, category: option.value as any })}
              >
                <MaterialCommunityIcons 
                  name={option.icon as any} 
                  size={18} 
                  color={feedbackData.category === option.value ? '#fff' : '#6B7280'} 
                />
                <Text style={[
                  styles.categoryLabel,
                  feedbackData.category === option.value && styles.categoryLabelSelected
                ]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mức độ ưu tiên */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
              <MaterialCommunityIcons name="flag" size={24} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Mức độ ưu tiên <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.priorityRow}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityButton,
                  feedbackData.priority === option.value && {
                    backgroundColor: option.color,
                    borderColor: option.color,
                  },
                ]}
                onPress={() => setFeedbackData({ ...feedbackData, priority: option.value as any })}
              >
                <Text style={[
                  styles.priorityLabel,
                  feedbackData.priority === option.value && styles.priorityLabelSelected
                ]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tiêu đề */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#E0E7FF" }]}>
              <MaterialCommunityIcons name="format-title" size={24} color="#6366F1" />
            </View>
            <Text style={styles.cardTitle}>Tiêu đề <Text style={styles.required}>*</Text></Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề ngắn gọn (VD: Lỗi không thể đặt lịch)"
            value={feedbackData.title}
            onChangeText={(text) => setFeedbackData({ ...feedbackData, title: text })}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Mô tả chi tiết */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}>
              <MaterialCommunityIcons name="text" size={24} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Mô tả chi tiết <Text style={styles.required}>*</Text></Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết vấn đề hoặc góp ý của bạn..."
            value={feedbackData.description}
            onChangeText={(text) => setFeedbackData({ ...feedbackData, description: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Đánh giá hài lòng */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
              <MaterialCommunityIcons name="star" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Đánh giá mức độ hài lòng</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Bạn hài lòng như thế nào với hệ thống?
          </Text>
          <StarRating
            rating={feedbackData.satisfactionRating}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, satisfactionRating: rating })
            }
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Rất không hài lòng</Text>
            <Text style={styles.ratingLabelRight}>Rất hài lòng</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#E0E7FF" }]}>
              <MaterialCommunityIcons name="tag-multiple" size={24} color="#6366F1" />
            </View>
            <Text style={styles.cardTitle}>Thẻ liên quan</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Thêm các từ khóa giúp phân loại góp ý
          </Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Nhập tag (VD: urgent, ui-bug)"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.tagAddButton} onPress={addTag}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {feedbackData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {feedbackData.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            if (params?.fromScreen === "faq") {
              navigation.navigate("Câu hỏi thường gặp" as never);
            } else {
              navigation.goBack();
            }
          }}
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
              <Text style={styles.submitButtonText}>Gửi góp ý</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
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
  header: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  required: {
    color: "#EF4444",
  },
  cardQuestion: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    gap: 8,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryLabelSelected: {
    color: "#fff",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  priorityLabelSelected: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  ratingLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  ratingLabelLeft: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  ratingLabelRight: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  tagAddButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    gap: 6,
  },
  tagChipText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  bottomButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    marginBottom: 90,
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
    backgroundColor: "#10B981",
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
});

