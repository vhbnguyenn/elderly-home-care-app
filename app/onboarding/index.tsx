import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

type OnboardingStep = 'personal' | 'elderly';

interface PersonalInfo {
  name: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

interface ElderlyInfo {
  name: string;
  age: string;
  gender: 'male' | 'female';
  healthStatus: string;
  address: string;
  relationship: string;
}

export default function OnboardingScreen() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
  const [isLoading, setIsLoading] = useState(false);
  
  // Personal info state - Pre-fill with existing user data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
  });
  
  // Elderly info state (for careseeker)
  const [elderlyInfo, setElderlyInfo] = useState<ElderlyInfo>({
    name: '',
    age: '',
    gender: 'male',
    healthStatus: '',
    address: '',
    relationship: '',
  });

  const [addAnother, setAddAnother] = useState(false);

  const isCaregiver = user?.role?.toLowerCase() === 'caregiver';
  const totalSteps = isCaregiver ? 1 : 2;

  // Update personal info when user data loads
  React.useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    }
  }, [user]);

  const handleNext = async () => {
    // Validate current step - only check missing required fields
    if (currentStep === 'personal') {
      // Check required fields
      const missingFields = [];
      if (!personalInfo.name.trim()) missingFields.push('họ tên');
      if (!personalInfo.phone.trim()) missingFields.push('số điện thoại');
      if (!personalInfo.address.trim()) missingFields.push('địa chỉ');

      if (missingFields.length > 0) {
        showError(`Vui lòng nhập: ${missingFields.join(', ')}`);
        return;
      }

      // Check if any data changed (for update optimization)
      const hasChanges = 
        personalInfo.name !== (user?.name || '') ||
        personalInfo.phone !== (user?.phone || '') ||
        personalInfo.address !== (user?.address || '') ||
        personalInfo.dateOfBirth !== (user?.dateOfBirth || '');

      if (hasChanges) {
        // TODO: Save personal info to API only if changed
        // await UserAPI.updateProfile(personalInfo);
        console.log('[Onboarding] Saving personal info:', personalInfo);
      } else {
        console.log('[Onboarding] No changes in personal info, skipping save');
      }

      if (isCaregiver) {
        // Caregiver only needs personal info
        await handleComplete();
      } else {
        // Careseeker continues to elderly info
        setCurrentStep('elderly');
      }
    } else if (currentStep === 'elderly') {
      if (!elderlyInfo.name.trim()) {
        showError('Vui lòng nhập tên người thân');
        return;
      }
      if (!elderlyInfo.age.trim()) {
        showError('Vui lòng nhập tuổi');
        return;
      }
      if (!elderlyInfo.relationship.trim()) {
        showError('Vui lòng nhập mối quan hệ');
        return;
      }

      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // TODO: Save all info to API
      // await UserAPI.updateProfile(personalInfo);
      // if (!isCaregiver) {
      //   await ElderlyAPI.create(elderlyInfo);
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess('Hoàn tất thiết lập tài khoản! 🎉');
      
      // Navigate to appropriate dashboard
      setTimeout(() => {
        if (isCaregiver) {
          router.replace('/caregiver');
        } else {
          router.replace('/careseeker/dashboard');
        }
      }, 500);
    } catch (error) {
      console.error('Onboarding error:', error);
      showError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipElderly = () => {
    handleComplete();
  };

  const renderProgressBar = () => {
    const progress = currentStep === 'personal' ? 1 : 2;
    const percentage = (progress / totalSteps) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Bước {progress}/{totalSteps}
        </Text>
      </View>
    );
  };

  const renderPersonalInfoStep = () => (
    <ScrollView 
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Info Banner if user has some data */}
      {(user?.name || user?.phone || user?.address) && (
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Hoàn thiện thông tin</Text>
            <Text style={styles.infoBannerText}>
              Một số thông tin đã có sẵn. Vui lòng kiểm tra và bổ sung các thông tin còn thiếu.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={48} color="#FF6B35" />
        </View>
        <Text style={styles.stepTitle}>Thông tin cá nhân</Text>
        <Text style={styles.stepSubtitle}>
          {(user?.name || user?.phone || user?.address) 
            ? 'Kiểm tra và hoàn thiện thông tin của bạn'
            : 'Cho chúng tôi biết thêm về bạn'
          }
        </Text>
      </View>

      <View style={styles.form}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Họ và tên *</Text>
            {user?.name && (
              <View style={styles.filledBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.filledText}>Đã có</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.inputContainer,
            user?.name && styles.inputContainerFilled
          ]}>
            <Ionicons name="person-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nhập họ tên đầy đủ"
              placeholderTextColor="#BDC3C7"
              value={personalInfo.name}
              onChangeText={(text) => setPersonalInfo({ ...personalInfo, name: text })}
            />
            {personalInfo.name && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
          </View>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Số điện thoại *</Text>
            {user?.phone && (
              <View style={styles.filledBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.filledText}>Đã có</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.inputContainer,
            user?.phone && styles.inputContainerFilled
          ]}>
            <Ionicons name="call-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#BDC3C7"
              value={personalInfo.phone}
              onChangeText={(text) => setPersonalInfo({ ...personalInfo, phone: text })}
              keyboardType="phone-pad"
            />
            {personalInfo.phone && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#BDC3C7"
              value={personalInfo.dateOfBirth}
              onChangeText={(text) => setPersonalInfo({ ...personalInfo, dateOfBirth: text })}
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Địa chỉ *</Text>
            {user?.address && (
              <View style={styles.filledBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.filledText}>Đã có</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.inputContainer,
            user?.address && styles.inputContainerFilled
          ]}>
            <Ionicons name="location-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ"
              placeholderTextColor="#BDC3C7"
              value={personalInfo.address}
              onChangeText={(text) => setPersonalInfo({ ...personalInfo, address: text })}
              multiline
            />
            {personalInfo.address && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderElderlyInfoStep = () => (
    <ScrollView 
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={48} color="#FF6B35" />
        </View>
        <Text style={styles.stepTitle}>Người thân cần chăm sóc</Text>
        <Text style={styles.stepSubtitle}>
          Thêm thông tin người thân để tìm kiếm phù hợp hơn
        </Text>
      </View>

      <View style={styles.form}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ tên người thân *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nhập tên người thân"
              placeholderTextColor="#BDC3C7"
              value={elderlyInfo.name}
              onChangeText={(text) => setElderlyInfo({ ...elderlyInfo, name: text })}
            />
          </View>
        </View>

        {/* Age */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tuổi *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nhập tuổi"
              placeholderTextColor="#BDC3C7"
              value={elderlyInfo.age}
              onChangeText={(text) => setElderlyInfo({ ...elderlyInfo, age: text })}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới tính *</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                elderlyInfo.gender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => setElderlyInfo({ ...elderlyInfo, gender: 'male' })}
            >
              <Ionicons 
                name="male" 
                size={24} 
                color={elderlyInfo.gender === 'male' ? '#FFF' : '#7F8C8D'} 
              />
              <Text style={[
                styles.genderText,
                elderlyInfo.gender === 'male' && styles.genderTextActive,
              ]}>
                Nam
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                elderlyInfo.gender === 'female' && styles.genderButtonActive,
              ]}
              onPress={() => setElderlyInfo({ ...elderlyInfo, gender: 'female' })}
            >
              <Ionicons 
                name="female" 
                size={24} 
                color={elderlyInfo.gender === 'female' ? '#FFF' : '#7F8C8D'} 
              />
              <Text style={[
                styles.genderText,
                elderlyInfo.gender === 'female' && styles.genderTextActive,
              ]}>
                Nữ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Relationship */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mối quan hệ *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="heart-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Ông nội, Bà ngoại, Bố, Mẹ..."
              placeholderTextColor="#BDC3C7"}
              value={elderlyInfo.relationship}
              onChangeText={(text) => setElderlyInfo({ ...elderlyInfo, relationship: text })}
            />
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tình trạng sức khỏe</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="fitness-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Khỏe mạnh, Cần hỗ trợ..."
              placeholderTextColor="#BDC3C7"
              value={elderlyInfo.healthStatus}
              onChangeText={(text) => setElderlyInfo({ ...elderlyInfo, healthStatus: text })}
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Địa chỉ hiện tại</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ"
              placeholderTextColor="#BDC3C7"
              value={elderlyInfo.address}
              onChangeText={(text) => setElderlyInfo({ ...elderlyInfo, address: text })}
              multiline
            />
          </View>
        </View>

        {/* Skip option */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkipElderly}
        >
          <Text style={styles.skipText}>Bỏ qua, thêm sau</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#FFF5F5', '#FFFFFF', '#FFF9F5']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ElderCare</Text>
        </View>
        {renderProgressBar()}
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {currentStep === 'personal' ? renderPersonalInfoStep() : renderElderlyInfoStep()}
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#BDC3C7', '#95A5A6'] : ['#FF6B35', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 'elderly' || isCaregiver ? 'Hoàn tất' : 'Tiếp theo'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B35',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    gap: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  stepHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFE5DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  filledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
  },
  filledText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  inputContainerFilled: {
    backgroundColor: '#F0FDF4',
    borderColor: '#D1FAE5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  genderTextActive: {
    color: '#FFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#95A5A6',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

