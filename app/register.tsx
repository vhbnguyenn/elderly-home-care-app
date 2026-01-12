import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import {
    useErrorNotification,
    useSuccessNotification,
} from "@/contexts/NotificationContext";
import { AuthService } from "@/services/auth.service";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  const { login } = useAuth();

  // Validate email field only
  const validateEmailField = (showTooltip = false) => {
    // Check if email is empty
    if (!formData.email || !formData.email.trim()) {
      setEmailError("Email không hợp lệ");
      if (showTooltip) showErrorTooltip("Email không hợp lệ");
      return false;
    }
    
    // RFC 5322 compliant email regex with Gmail alias support
    // Supports: letters, numbers, dots, underscores, plus signs, hyphens
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(formData.email)) {
      setEmailError("Email không hợp lệ");
      if (showTooltip) showErrorTooltip("Email không hợp lệ");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  // Validate email on blur (real-time validation)
  const handleEmailBlur = () => {
    // Only validate if email has some content (not just whitespace)
    if (formData.email && formData.email.trim()) {
      validateEmailField(false);
    }
  };

  // Validate password field only
  const validatePasswordField = (showTooltip = false) => {
    const errorMsg = "Mật khẩu phải có ít nhất 6 ký tự bao gồm: 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt";
    
    // Check all password requirements at once
    if (!formData.password || 
        formData.password.length < 6 || 
        formData.password.length > 50 ||
        !/[a-z]/.test(formData.password) ||          // Có chữ thường
        !/[A-Z]/.test(formData.password) ||          // Có chữ hoa
        !/[0-9]/.test(formData.password) ||          // Có số
        !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {  // Có ký tự đặc biệt
      setPasswordError(errorMsg);
      if (showTooltip) showErrorTooltip(errorMsg);
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  // Validate confirm password field only
  const validateConfirmPasswordField = (showTooltip = false) => {
    const errorMsg = "Mật khẩu xác nhận không khớp. Vui lòng nhập lại chính xác";
    
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      setConfirmPasswordError(errorMsg);
      if (showTooltip) showErrorTooltip(errorMsg);
      return false;
    }
    
    setConfirmPasswordError("");
    return true;
  };

  // Validate both password fields (for form submission)
  const validatePassword = (showTooltip = true) => {
    const passwordValid = validatePasswordField(showTooltip);
    const confirmPasswordValid = validateConfirmPasswordField(showTooltip);
    return passwordValid && confirmPasswordValid;
  };

  // Validate password on blur (real-time validation)
  const handlePasswordBlur = () => {
    if (formData.password) {
      validatePasswordField(false);
    }
  };

  // Validate confirm password on blur
  const handleConfirmPasswordBlur = () => {
    if (formData.confirmPassword) {
      validateConfirmPasswordField(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const emailValid = validateEmailField(true);
    const passwordValid = validatePassword(true);

    if (!emailValid || !passwordValid) {
      return;
    }

    // Check if user type is selected
    if (!formData.userType) {
      showErrorTooltip("Vui lòng chọn loại tài khoản");
      return;
    }

    // Check if user agreed to terms
    if (!agreeToTerms) {
      showErrorTooltip("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật");
      return;
    }

    setIsLoading(true);

    try {
      // Format role to match backend expectation (lowercase)
      const role = formData.userType === "care-seeker" ? "careseeker" : "caregiver";
      
      // Generate a valid name (only letters, spaces, hyphens)
      // Don't auto-generate name - let user fill in onboarding
      const registerData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: role,
      };
      
      console.log("[Register] Sending data:", registerData);
      
      const response = await AuthService.register(registerData);

      showSuccessTooltip("Đăng ký thành công! Đang chuyển đến trang xác thực...");

      // Navigate to verify code screen for email verification
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
      console.error("[Register] Error:", err);
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      
      if (err?.message) {
        errorMessage = err.message;
        
        // Check for specific error messages from backend
        if (errorMessage.includes("Email đã tồn tại") || errorMessage.includes("Email already exists")) {
          errorMessage = "Email đã được đăng ký. Vui lòng sử dụng email khác";
        }
      } else if (err?.response) {
        const status = err.response.status;
        const responseData = err.response.data;
        
        if (status === 400) {
          // Show specific validation errors if available
          if (responseData?.errors && Array.isArray(responseData.errors)) {
            errorMessage = responseData.errors.join(". ");
          } else {
            errorMessage = responseData?.message || "Thông tin không hợp lệ";
          }
        } else if (status === 409) {
          errorMessage = "Email đã được đăng ký. Vui lòng sử dụng email khác";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = responseData?.message || "Đăng ký thất bại";
        }
      } else if (err?.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng";
      }
      
      showErrorTooltip(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.gradient} />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <ThemedText style={styles.title}>Tạo tài khoản mới</ThemedText>
            <ThemedText style={styles.subtitle}>
              Đăng ký để bắt đầu sử dụng dịch vụ
            </ThemedText>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => {
                    // Remove any whitespace automatically
                    const cleanedEmail = text.replace(/\s/g, '');
                    setFormData({ ...formData, email: cleanedEmail });
                    // Clear error when user is typing
                    if (emailError) setEmailError("");
                  }}
                  onBlur={handleEmailBlur}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {emailError ? (
                <View style={styles.helperContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF6B35" />
                  <ThemedText style={styles.errorHelperText}>
                    {emailError}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.helperContainer}>
                  <Ionicons name="information-circle-outline" size={14} color="#999" />
                  <ThemedText style={styles.helperText}>
                    VD: example@email.com hoặc name+tag@gmail.com
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Mật khẩu <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (passwordError) setPasswordError("");
                  }}
                  onBlur={handlePasswordBlur}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.helperContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF6B35" />
                  <ThemedText style={styles.errorHelperText}>
                    {passwordError}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.helperContainer}>
                  <Ionicons name="information-circle-outline" size={14} color="#999" />
                  <ThemedText style={styles.helperText}>
                    Ít nhất 6 ký tự bao gồm: 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Xác nhận mật khẩu <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  onBlur={handleConfirmPasswordBlur}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <View style={styles.helperContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF6B35" />
                  <ThemedText style={styles.errorHelperText}>
                    {confirmPasswordError}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.helperContainer}>
                  <Ionicons name="information-circle-outline" size={14} color="#999" />
                  <ThemedText style={styles.helperText}>
                    Nhập lại mật khẩu giống ở trên để xác nhận
                  </ThemedText>
                </View>
              )}
            </View>

            {/* User Type Selection */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Bạn là: <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.userType === "care-seeker" &&
                      styles.radioOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, userType: "care-seeker" })
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      formData.userType === "care-seeker" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {formData.userType === "care-seeker" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <ThemedText
                    style={[
                      styles.radioText,
                      formData.userType === "care-seeker" &&
                        styles.radioTextSelected,
                    ]}
                  >
                    Người cần dịch vụ chăm sóc
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.userType === "caregiver" &&
                      styles.radioOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, userType: "caregiver" })
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      formData.userType === "caregiver" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {formData.userType === "caregiver" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <ThemedText
                    style={[
                      styles.radioText,
                      formData.userType === "caregiver" &&
                        styles.radioTextSelected,
                    ]}
                  >
                    Người chăm sóc chuyên nghiệp
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <ThemedText style={styles.termsText}>
                Tôi đồng ý với{" "}
                <ThemedText 
                  style={styles.termsLink}
                  onPress={() => router.push("/terms-of-service")}
                >
                  Điều khoản sử dụng
                </ThemedText>
                {" "}và{" "}
                <ThemedText 
                  style={styles.termsLink}
                  onPress={() => router.push("/privacy-policy")}
                >
                  Chính sách bảo mật
                </ThemedText>
              </ThemedText>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF6B35", "#FF8E53"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              >
                <ThemedText style={styles.submitButtonText}>
                  {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>
                Đã có tài khoản?{" "}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <ThemedText style={styles.loginLink}>Đăng nhập</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.4,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: "#fff",
    top: -width * 0.3,
    right: -width * 0.3,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "#fff",
    top: height * 0.15,
    left: -width * 0.2,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: "#FF5722",
    top: height * 0.25,
    right: -width * 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF6B35",
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 4,
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    flex: 1,
  },
  errorHelperText: {
    fontSize: 12,
    color: "#FF6B35",
    flex: 1,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  radioOptionSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#fff5f2",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#FF6B35",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B35",
  },
  radioText: {
    flex: 1,
    fontSize: 15,
    color: "#666",
  },
  radioTextSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  termsLink: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginText: {
    fontSize: 15,
    color: "#666",
  },
  loginLink: {
    fontSize: 15,
    color: "#FF6B35",
    fontWeight: "600",
  },
});
