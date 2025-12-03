import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

type FeedbackType = 'service' | 'video_call' | 'suggestion' | 'system';

interface FeedbackOption {
  id: FeedbackType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    id: 'service',
    title: 'Đánh giá dịch vụ',
    subtitle: 'Chất lượng chăm sóc, thái độ người chăm sóc',
    icon: 'star',
    color: '#FFD700',
  },
  {
    id: 'video_call',
    title: 'Đánh giá Video Call',
    subtitle: 'Chất lượng cuộc gọi, tính năng giám sát',
    icon: 'videocam',
    color: '#4CAF50',
  },
  {
    id: 'suggestion',
    title: 'Góp ý cải thiện',
    subtitle: 'Đề xuất cải tiến dịch vụ, tính năng mới',
    icon: 'bulb',
    color: '#FF9800',
  },
  {
    id: 'system',
    title: 'Phản hồi hệ thống',
    subtitle: 'Lỗi kỹ thuật, trải nghiệm ứng dụng',
    icon: 'settings',
    color: '#2196F3',
  },
];

const ratingLabels = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

export default function PostServiceFeedbackScreen() {
  const params = useLocalSearchParams();
  const appointmentId = params.appointmentId as string;
  const caregiverName = params.caregiverName as string || 'người chăm sóc';

  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Specific questions for each feedback type
  const [videoQuality, setVideoQuality] = useState(0);
  const [audioQuality, setAudioQuality] = useState(0);
  const [systemStability, setSystemStability] = useState(0);
  const [featureUsability, setFeatureUsability] = useState(0);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Thông báo', 'Vui lòng chọn loại đánh giá');
      return;
    }

    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn mức đánh giá');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API call to submit feedback
      const feedbackData = {
        appointment_id: appointmentId,
        type: selectedType,
        rating,
        comment,
        details: {
          video_quality: videoQuality,
          audio_quality: audioQuality,
          system_stability: systemStability,
          feature_usability: featureUsability,
        },
        created_at: new Date().toISOString(),
      };

      console.log('Submitting feedback:', feedbackData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Cảm ơn bạn!',
        'Đánh giá của bạn đã được ghi nhận. Chúng tôi sẽ không ngừng cải thiện chất lượng dịch vụ.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, onPress: (rating: number) => void, size = 40) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={size}
              color={star <= currentRating ? '#FFD700' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFeedbackTypeSelection = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Chọn loại đánh giá</ThemedText>
      <View style={styles.feedbackTypeGrid}>
        {feedbackOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.feedbackTypeCard,
              selectedType === option.id && styles.feedbackTypeCardSelected,
            ]}
            onPress={() => setSelectedType(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.feedbackTypeIcon, { backgroundColor: option.color + '20' }]}>
              <Ionicons name={option.icon as any} size={28} color={option.color} />
            </View>
            <ThemedText style={styles.feedbackTypeTitle}>{option.title}</ThemedText>
            <ThemedText style={styles.feedbackTypeSubtitle}>{option.subtitle}</ThemedText>
            {selectedType === option.id && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderServiceFeedback = () => (
    <>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Đánh giá dịch vụ của {caregiverName}
        </ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Chất lượng chăm sóc, thái độ phục vụ
        </ThemedText>
        {renderStars(rating, setRating)}
        {rating > 0 && (
          <ThemedText style={styles.ratingLabel}>{ratingLabels[rating - 1]}</ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Chi tiết đánh giá (tùy chọn)</ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ chăm sóc..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />
      </View>
    </>
  );

  const renderVideoCallFeedback = () => (
    <>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Chất lượng Video Call</ThemedText>
        <View style={styles.ratingItem}>
          <ThemedText style={styles.ratingItemLabel}>Chất lượng hình ảnh</ThemedText>
          {renderStars(videoQuality, setVideoQuality, 32)}
        </View>
        <View style={styles.ratingItem}>
          <ThemedText style={styles.ratingItemLabel}>Chất lượng âm thanh</ThemedText>
          {renderStars(audioQuality, setAudioQuality, 32)}
        </View>
        <View style={styles.ratingItem}>
          <ThemedText style={styles.ratingItemLabel}>Đánh giá chung</ThemedText>
          {renderStars(rating, setRating, 32)}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nhận xét thêm (tùy chọn)</ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Mô tả chi tiết về trải nghiệm video call..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />
      </View>
    </>
  );

  const renderSuggestionFeedback = () => (
    <>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mức độ hài lòng chung</ThemedText>
        {renderStars(rating, setRating)}
        {rating > 0 && (
          <ThemedText style={styles.ratingLabel}>{ratingLabels[rating - 1]}</ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Góp ý của bạn</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Chia sẻ ý tưởng cải tiến dịch vụ, tính năng mới
        </ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Ví dụ: Tôi muốn có thêm tính năng theo dõi sức khỏe hàng ngày, hoặc tích hợp chat với bác sĩ..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />
      </View>
    </>
  );

  const renderSystemFeedback = () => (
    <>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Trải nghiệm hệ thống</ThemedText>
        <View style={styles.ratingItem}>
          <ThemedText style={styles.ratingItemLabel}>Độ ổn định</ThemedText>
          {renderStars(systemStability, setSystemStability, 32)}
        </View>
        <View style={styles.ratingItem}>
          <ThemedText style={styles.ratingItemLabel}>Dễ sử dụng</ThemedText>
          {renderStars(featureUsability, setFeatureUsability, 32)}
        </View>
        <View style={styles.ratingItem}>
          <ThemedText style={styles.ratingItemLabel}>Đánh giá chung</ThemedText>
          {renderStars(rating, setRating, 32)}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mô tả vấn đề (nếu có)</ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Mô tả lỗi gặp phải, tính năng không hoạt động, hoặc góp ý cải thiện giao diện..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Đánh giá sau ca làm</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <ThemedText style={styles.infoText}>
            Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ
          </ThemedText>
        </View>

        {/* Feedback Type Selection */}
        {renderFeedbackTypeSelection()}

        {/* Conditional Feedback Forms */}
        {selectedType === 'service' && renderServiceFeedback()}
        {selectedType === 'video_call' && renderVideoCallFeedback()}
        {selectedType === 'suggestion' && renderSuggestionFeedback()}
        {selectedType === 'system' && renderSystemFeedback()}

        {/* Submit Button */}
        {selectedType && (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.submitButtonText}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </ThemedText>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
  },
  feedbackTypeGrid: {
    gap: 12,
  },
  feedbackTypeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  feedbackTypeCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  feedbackTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  feedbackTypeSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 8,
  },
  ratingItem: {
    marginBottom: 20,
  },
  ratingItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#2c3e50',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
