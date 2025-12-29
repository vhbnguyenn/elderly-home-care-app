import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const { login } = useAuth();
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip, hideErrorTooltip } = useErrorNotification();

  const handleLogin = async () => {
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

    // Validate password
    if (!password) {
      showErrorTooltip("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      showErrorTooltip("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    
    try {
      // IMPORTANT: Clear any old tokens before login to prevent token refresh loops
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      
      // Clean email by removing whitespace
      const cleanEmail = email.replace(/\s/g, '');
      const userData = await login(cleanEmail, password);
      setIsLoading(false);

      if (!userData) {
        showErrorTooltip("Email hoặc mật khẩu không đúng");
        return;
      }

      console.log("✅ Login success - User data:", userData);
      console.log("✅ User role:", userData.role);

      showSuccessTooltip("Đăng nhập thành công! Đang chuyển hướng...");

      setTimeout(() => {
        // Check role case-insensitively
        const role = userData.role.toLowerCase();
        console.log("🔄 Redirecting for role:", role);
        
        if (role === "caregiver") {
          console.log("➡️ Navigating to /caregiver");
          router.replace("/caregiver");
        } else {
          console.log("➡️ Navigating to /careseeker/(tabs)/dashboard");
          router.replace("/careseeker/(tabs)/dashboard");
        }
      }, 500);
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle specific error cases
      let errorMessage = "Đăng nhập thất bại";
      
      if (error.message) {
        errorMessage = error.message;
        
        // Check if email not verified
        if (errorMessage.includes("chưa được xác thực") || 
            errorMessage.includes("not verified") ||
            errorMessage.includes("Email chưa xác thực") ||
            errorMessage.includes("xác minh email") ||
            errorMessage.includes("Vui lòng xác minh")) {
          // Show verify prompt modal instead of navigating
          setShowVerifyPrompt(true);
          return;
        }
      } else if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        // Check if email not verified (403 with specific message)
        if (status === 403 && 
            (responseData?.message?.includes("chưa được xác thực") ||
             responseData?.message?.includes("not verified") ||
             responseData?.message?.includes("Email chưa xác thực") ||
             responseData?.message?.includes("xác minh email") ||
             responseData?.message?.includes("Vui lòng xác minh"))) {
          // Show verify prompt modal instead of navigating
          setShowVerifyPrompt(true);
          return;
        }
        
        if (status === 401) {
          errorMessage = "Email hoặc mật khẩu không đúng";
        } else if (status === 403) {
          errorMessage = "Tài khoản của bạn đã bị khóa";
        } else if (status === 404) {
          errorMessage = "Email chưa được đăng ký";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = responseData?.message || "Email hoặc mật khẩu không đúng";
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng";
      }
      
      showErrorTooltip(errorMessage);
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
          <Text style={styles.title}>Đăng Nhập</Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail-outline" size={20} color="#FF5722" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={20} color="#FF5722" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#FF5722", "#FF5722DD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Verify Email Prompt Modal */}
      {showVerifyPrompt && (
        <View style={styles.promptOverlay}>
          <View style={styles.promptBox}>
            <Ionicons name="mail-outline" size={48} color="#FF5722" />
            <Text style={styles.promptTitle}>Email chưa được xác thực</Text>
            <Text style={styles.promptMessage}>
              Bạn cần xác thực email để đăng nhập.{"\n"}
              Chuyển đến trang xác thực?
            </Text>
            <View style={styles.promptButtons}>
              <TouchableOpacity 
                style={styles.promptButtonCancel}
                onPress={() => setShowVerifyPrompt(false)}
              >
                <Text style={styles.promptButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.promptButtonConfirm}
                onPress={() => {
                  setShowVerifyPrompt(false);
                  router.push({
                    pathname: "/verify-code",
                    params: { 
                      email: email.replace(/\s/g, ''),
                      type: "verify-email"
                    }
                  });
                }}
              >
                <LinearGradient
                  colors={["#FF5722", "#FF5722DD"]}
                  style={styles.promptButtonGradient}
                >
                  <Text style={styles.promptButtonConfirmText}>Xác thực ngay</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    marginBottom: 40,
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
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "500",
  },
  promptOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    paddingHorizontal: 32,
  },
  promptBox: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 12,
  },
  promptMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  promptButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  promptButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  promptButtonCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  promptButtonConfirm: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  promptButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  promptButtonConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
