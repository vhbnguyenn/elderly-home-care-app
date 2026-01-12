import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface PostServicePromptProps {
  visible: boolean;
  appointmentId: string;
  caregiverName: string;
  onClose: () => void;
  onLater: () => void;
}

export const PostServicePrompt: React.FC<PostServicePromptProps> = ({
  visible,
  appointmentId,
  caregiverName,
  onClose,
  onLater,
}) => {
  const handleFeedback = () => {
    onClose();
    router.push({
      pathname: '/careseeker/post-service-feedback',
      params: {
        appointmentId,
        caregiverName,
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>Ca làm đã hoàn thành!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Cảm ơn bạn đã sử dụng dịch vụ của {caregiverName}
          </ThemedText>

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Ionicons name="chatbubbles" size={24} color="#FF6B35" />
            <ThemedText style={styles.description}>
              Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ và hỗ trợ các gia đình khác đưa ra quyết định tốt hơn
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleFeedback}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <ThemedText style={styles.primaryButtonText}>Đánh giá ngay</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLater}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.secondaryButtonText}>Để sau</ThemedText>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  descriptionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 12,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
});
