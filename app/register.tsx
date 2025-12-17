import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    userType: "care-seeker",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  const { login } = useAuth();

  const validatePassword = (showTooltip = true) => {
    if (!formData.password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      if (showTooltip) showErrorTooltip("Vui lòng nhập mật khẩu");
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      if (showTooltip) showErrorTooltip("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (formData.password.length > 50) {
      setPasswordError("Mật khẩu không được quá 50 ký tự");
      if (showTooltip) showErrorTooltip("Mật khẩu không được quá 50 ký tự");
      return false;
    }
    if (!/[a-zA-Z]/.test(formData.password)) {
      setPasswordError("Mật khẩu phải chứa ít nhất 1 chữ cái");
      if (showTooltip) showErrorTooltip("Mật khẩu phải chứa ít nhất 1 chữ cái");
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      setPasswordError("Mật khẩu phải chứa ít nhất 1 chữ số");
      if (showTooltip) showErrorTooltip("Mật khẩu phải chứa ít nhất 1 chữ số");
      return false;
    }
    if (!formData.confirmPassword) {
      setPasswordError("Vui lòng xác nhận mật khẩu");
      if (showTooltip) showErrorTooltip("Vui lòng xác nhận mật khẩu");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      if (showTooltip) showErrorTooltip("Mật khẩu xác nhận không khớp");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Validate password on blur (real-time validation)
  const handlePasswordBlur = () => {
    if (formData.password) {
      validatePassword(false);
    }
  };

  // Validate confirm password on blur
  const handleConfirmPasswordBlur = () => {
    if (formData.confirmPassword) {
      validatePassword(false);
    }
  };

  const handleSubmit = async () => {
    // Validate email
    if (!formData.email) {
      setError("Vui lòng nhập email");
      showErrorTooltip("Vui lòng nhập email");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email không được chứa khoảng trắng");
      showErrorTooltip("Email không được chứa khoảng trắng");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      showErrorTooltip("Email không hợp lệ");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await AuthService.register({
        email: formData.email,
        password: formData.password,
        role: formData.userType,
      });

      showSuccessTooltip("Đăng ký thành công!");

      // Auto login after successful registration
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (err: any) {
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response) {
        const status = err.response.status;
        if (status === 400) {
          errorMessage = err.response.data?.message || "Thông tin không hợp lệ";
        } else if (status === 409) {
          errorMessage = "Email đã được đăng ký. Vui lòng sử dụng email khác";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = err.response.data?.message || "Đăng ký thất bại";
        }
      } else if (err?.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng";
      }
      
      setError(errorMessage);
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
            {/* Error message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#dc3545" />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email *</ThemedText>
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
                    setFormData({ ...formData, email: text });
                    if (error) setError("");
                  }}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Mật khẩu *</ThemedText>
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
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Xác nhận mật khẩu *</ThemedText>
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
                    if (passwordError) setPasswordError("");
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
              {passwordError ? (
                <View style={styles.passwordErrorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#dc3545" />
                  <ThemedText style={styles.passwordErrorText}>
                    {passwordError}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            {/* User Type Selection */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Bạn là: *</ThemedText>
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

            {/* Terms Note */}
            <ThemedText style={styles.note}>
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <ThemedText style={styles.noteLink}>Điều khoản sử dụng</ThemedText>{" "}
              và <ThemedText style={styles.noteLink}>Chính sách bảo mật</ThemedText>
            </ThemedText>

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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#dc3545",
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
  passwordErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  passwordErrorText: {
    fontSize: 13,
    color: "#dc3545",
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
  submitButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
  note: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  noteLink: {
    color: "#FF6B35",
    fontWeight: "600",
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
