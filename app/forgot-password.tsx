import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const handleSendCode = async () => {
    // Validate email
    if (!email || !email.trim()) {
      showErrorTooltip("Vui lòng nhập email");
      return;
    }

    // Auto-remove whitespace
    const cleanEmail = email.replace(/\s/g, '');
    
    // RFC 5322 compliant email regex with Gmail alias support
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      showErrorTooltip("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      // Clean email by removing whitespace
      const cleanEmail = email.replace(/\s/g, '');
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: cleanEmail,
      });

      showSuccessTooltip("Mã xác thực đã được gửi đến email của bạn!");
      
      // Navigate to verify code screen
      setTimeout(() => {
        router.push({
          pathname: "/verify-code",
          params: { email: cleanEmail },
        });
      }, 1500);
    } catch (error: any) {
      let errorMessage = "Không thể gửi mã xác thực";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = "Email chưa được đăng ký";
        } else if (status === 429) {
          errorMessage = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || "Không thể gửi mã xác thực";
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
          <Text style={styles.title}>Quên Mật Khẩu</Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>
            Nhập email của bạn để nhận mã xác thực
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail-outline" size={20} color="#FF5722" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendCode}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#FF5722", "#FF5722DD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.sendButtonText}>Đang gửi...</Text>
              ) : (
                <>
                  <Text style={styles.sendButtonText}>Gửi mã xác thực</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            Mã xác thực sẽ được gửi đến email của bạn và có hiệu lực trong 15 phút
          </Text>
        </View>

        {/* Back to Login */}
        <View style={styles.backToLoginContainer}>
          <Text style={styles.backToLoginText}>Đã nhớ mật khẩu? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.backToLoginLink}>Đăng nhập ngay</Text>
          </TouchableOpacity>
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
    marginBottom: 30,
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
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  sendButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  sendButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 8,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  backToLoginLink: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "600",
  },
});
