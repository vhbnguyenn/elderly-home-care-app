import {
    useErrorNotification,
    useSuccessNotification,
} from '@/contexts/NotificationContext';
import { AuthService } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const steps = [
  {
    id: 1,
    question: 'Họ và tên của bạn?',
    placeholder: 'VD: Nguyễn Văn A',
    field: 'fullName',
    icon: 'person',
  },
  {
    id: 2,
    question: 'Email của bạn?',
    placeholder: 'VD: example@email.com',
    field: 'email',
    icon: 'mail',
    keyboardType: 'email-address' as const,
  },
  {
    id: 3,
    question: 'Số điện thoại của bạn?',
    placeholder: 'VD: 0901234567',
    field: 'phone',
    icon: 'call',
    keyboardType: 'phone-pad' as const,
  },
  {
    id: 4,
    question: 'Tạo mật khẩu',
    placeholder: 'Nhập mật khẩu (tối thiểu 6 ký tự)',
    field: 'password',
    icon: 'lock-closed',
    secureTextEntry: true,
  },
  {
    id: 5,
    question: 'Bạn là ai?',
    placeholder: 'Chọn vai trò của bạn',
    field: 'role',
    icon: 'people',
    options: [
      { label: 'Người tìm người chăm sóc', value: 'careseeker' },
      { label: 'Người chăm sóc', value: 'caregiver' },
    ],
  },
];

export default function RegisterFlowScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Get helper text for each field
  const getHelperText = () => {
    switch (currentStepData.field) {
      case 'email':
        return 'VD: example@email.com hoặc name+tag@gmail.com';
      case 'password':
        return 'Ít nhất 6 ký tự bao gồm: 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt';
      case 'phone':
        return 'Nhập số điện thoại 10-11 chữ số';
      case 'fullName':
        return 'Nhập họ và tên đầy đủ của bạn';
      default:
        return '';
    }
  };

  // Validate current field (for real-time validation)
  const validateCurrentField = (showTooltip = false) => {
    const value = formData[currentStepData.field as keyof typeof formData];
    
    if (!value) {
      setFieldError('Vui lòng điền thông tin');
      if (showTooltip) showErrorTooltip('Vui lòng điền thông tin');
      return false;
    }

    if (!value.toString().trim()) {
      setFieldError('Thông tin không được chứa toàn khoảng trắng');
      if (showTooltip) showErrorTooltip('Thông tin không được chứa toàn khoảng trắng');
      return false;
    }

    if (currentStepData.field === 'email') {
      // RFC 5322 compliant email regex with Gmail alias support
      const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
      
      // Simplified: just one error message for all email validation cases
      if (!emailRegex.test(value)) {
        setFieldError('Email không hợp lệ');
        if (showTooltip) showErrorTooltip('Email không hợp lệ');
        return false;
      }
    }

    if (currentStepData.field === 'password') {
      const errorMsg = 'Mật khẩu phải có ít nhất 6 ký tự bao gồm: 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt';
      
      // Check all password requirements at once
      if (value.length < 6 || 
          value.length > 50 ||
          !/[a-z]/.test(value) ||          // Có chữ thường
          !/[A-Z]/.test(value) ||          // Có chữ hoa
          !/[0-9]/.test(value) ||          // Có số
          !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {  // Có ký tự đặc biệt
        setFieldError(errorMsg);
        if (showTooltip) showErrorTooltip(errorMsg);
        return false;
      }
    }

    if (currentStepData.field === 'phone') {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        setFieldError('Số điện thoại không hợp lệ (10-11 chữ số)');
        if (showTooltip) showErrorTooltip('Số điện thoại không hợp lệ (10-11 chữ số)');
        return false;
      }
    }

    if (currentStepData.field === 'fullName') {
      if (value.length < 2) {
        setFieldError('Họ tên phải có ít nhất 2 ký tự');
        if (showTooltip) showErrorTooltip('Họ tên phải có ít nhất 2 ký tự');
        return false;
      }
      if (value.length > 100) {
        setFieldError('Họ tên không được quá 100 ký tự');
        if (showTooltip) showErrorTooltip('Họ tên không được quá 100 ký tự');
        return false;
      }
    }

    setFieldError('');
    return true;
  };

  // Handle blur event for real-time validation
  const handleFieldBlur = () => {
    const value = formData[currentStepData.field as keyof typeof formData];
    if (value) {
      validateCurrentField(false);
    }
  };

  const handleNext = () => {
    // Validate with tooltip
    if (!validateCurrentField(true)) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setFieldError(''); // Clear error when moving to next step
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      // Call real API to register user
      const userData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password, // Same as password for this flow
        phone: formData.phone,
        role: formData.role, // Already in correct format: 'careseeker' or 'caregiver'
      };

      console.log("[Register Flow] Sending data:", userData);

      await AuthService.register(userData);

      showSuccessTooltip('🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      setTimeout(() => {
        router.push({
          pathname: "/verify-code",
          params: { 
            email: formData.email,
            type: "verify-email"
          }
        });
      }, 1500);
      
    } catch (err: any) {
      console.error('Register error:', err);
      
      let errorMsg = 'Đăng ký thất bại';
      
      if (err?.message) {
        errorMsg = err.message;
        
        // Check for specific error messages from backend
        if (errorMsg.includes("Email đã tồn tại") || errorMsg.includes("Email already exists")) {
          errorMsg = "Email đã được đăng ký. Vui lòng sử dụng email khác";
        }
      } else if (err?.response) {
        const status = err.response.status;
        const responseData = err.response.data;
        
        if (status === 400) {
          // Show specific validation errors if available
          if (responseData?.errors && Array.isArray(responseData.errors)) {
            errorMsg = responseData.errors.join(". ");
          } else {
            errorMsg = responseData?.message || 'Thông tin không hợp lệ';
          }
        } else if (status === 409) {
          errorMsg = 'Email đã được đăng ký. Vui lòng sử dụng email khác';
        } else if (status >= 500) {
          errorMsg = 'Lỗi máy chủ. Vui lòng thử lại sau';
        } else {
          errorMsg = responseData?.message || 'Đăng ký thất bại';
        }
      } else if (err?.request) {
        errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
      }
      
      showErrorTooltip(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (value: string) => {
    setFormData({ ...formData, [currentStepData.field]: value });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          Bước {currentStep + 1} / {steps.length}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name={currentStepData.icon as any} size={60} color="#FF6B35" />
        </View>

        <Text style={styles.question}>{currentStepData.question}</Text>

        {currentStepData.options ? (
          <View style={styles.optionsContainer}>
            {currentStepData.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  formData[currentStepData.field as keyof typeof formData] === option.value &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => handleOptionSelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData[currentStepData.field as keyof typeof formData] === option.value &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {formData[currentStepData.field as keyof typeof formData] === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={currentStepData.placeholder}
                placeholderTextColor="#999"
                value={formData[currentStepData.field as keyof typeof formData]}
                onChangeText={(text) => {
                  // Auto-remove whitespace for email field
                  const cleanedText = currentStepData.field === 'email' ? text.replace(/\s/g, '') : text;
                  setFormData({ ...formData, [currentStepData.field]: cleanedText });
                  if (fieldError) setFieldError('');
                }}
                onBlur={handleFieldBlur}
                keyboardType={currentStepData.keyboardType}
                secureTextEntry={currentStepData.field === 'password' && !showPassword}
                autoFocus
                autoCapitalize={currentStepData.field === 'email' ? 'none' : 'words'}
              />
              {currentStepData.field === 'password' && (
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              )}
            </View>
            {fieldError ? (
              <View style={styles.helperContainer}>
                <Ionicons name="alert-circle" size={14} color="#FF6B35" />
                <Text style={styles.errorHelperText}>{fieldError}</Text>
              </View>
            ) : (
              getHelperText() && (
                <View style={styles.helperContainer}>
                  <Ionicons name="information-circle-outline" size={14} color="#999" />
                  <Text style={styles.helperText}>{getHelperText()}</Text>
                </View>
              )
            )}
          </View>
        )}
      </View>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Hoàn tất' : 'Tiếp tục'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  backButton: {
    marginBottom: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#EEE',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: '#1A1A1A',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    flex: 1,
  },
  errorHelperText: {
    fontSize: 13,
    color: '#FF6B35',
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#EEE',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
