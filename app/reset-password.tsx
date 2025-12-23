import {
    useErrorNotification,
    useSuccessNotification,
} from "@/contexts/NotificationContext";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ResetPasswordScreen() {
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Vui lòng nhập mật khẩu mới";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password.length > 50) {
      return "Mật khẩu không được quá 50 ký tự";
    }
    // Check for at least one letter and one number
    if (!/[a-zA-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ cái";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ số";
    }
    return "";
  };

  const handlePasswordChange = (text: string) => {
    setNewPassword(text);
    if (text) {
      const error = validatePassword(text);
      setPasswordError(error);
    } else {
      setPasswordError("");
    }
    // Clear confirm password error if passwords now match
    if (confirmPassword && text === confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text && newPassword) {
      if (text !== newPassword) {
        setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      } else {
        setConfirmPasswordError("");
      }
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleResetPassword = async () => {
    // Validate password
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setPasswordError(pwdError);
      showErrorTooltip(pwdError);
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu");
      showErrorTooltip("Vui lòng xác nhận mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      showErrorTooltip("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        code,
        newPassword,
      });

      showSuccessTooltip("Đặt lại mật khẩu thành công!");
      
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: any) {
      let errorMessage = "Không thể đặt lại mật khẩu";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = error.response.data?.message || "Thông tin không hợp lệ";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy yêu cầu đặt lại mật khẩu";
        } else if (status === 410) {
          errorMessage = "Mã xác thực đã hết hạn. Vui lòng thử lại";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || "Không thể đặt lại mật khẩu";
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorTooltip(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={["#FFF5F5", "#FFFFFF", "#FFF9F5"]}
        style={styles.backgroundGradient}
      />

      {/* Decorative Background */}
      <View style={styles.decorativeBackground}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2C3E50" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Đặt Lại Mật Khẩu</Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>
            Tạo mật khẩu mới cho tài khoản của bạn
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={20} color="#FF5722" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : null]}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={confirmPasswordError ? "#EF4444" : "#FF5722"} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#FF5722", "#FF5722DD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resetButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.resetButtonText}>Đang xử lý...</Text>
              ) : (
                <>
                  <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={newPassword.length >= 6 ? "#10B981" : "#9CA3AF"} 
            />
            <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/[a-zA-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={/[a-zA-Z]/.test(newPassword) ? "#10B981" : "#9CA3AF"} 
            />
            <Text style={styles.requirementText}>Chứa ít nhất 1 chữ cái</Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={/[0-9]/.test(newPassword) ? "#10B981" : "#9CA3AF"} 
            />
            <Text style={styles.requirementText}>Chứa ít nhất 1 chữ số</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  bgCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#FF572212",
    top: -150,
    right: -150,
  },
  bgCircle2: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#FF572210",
    bottom: -100,
    left: -100,
  },
  bgCircle3: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#FF572208",
    top: "40%",
    right: -80,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  underline: {
    width: 40,
    height: 3,
    backgroundColor: "#FF5722",
    borderRadius: 1.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emailInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "600",
  },
  form: {
    gap: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: -12,
    marginLeft: 4,
    marginBottom: 4,
  },
  eyeButton: {
    padding: 4,
  },
  resetButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  resetButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 8,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "600",
  },
  requirementsContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#6B7280",
  },
});
