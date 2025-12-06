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
  const { login } = useAuth();
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorTooltip("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      const userData = await login(email, password);
      setIsLoading(false);

      if (!userData) {
        showErrorTooltip("Email hoặc mật khẩu không đúng");
        return;
      }

      showSuccessTooltip("Đăng nhập thành công! Đang chuyển hướng...");

      setTimeout(() => {
        if (userData.role === "Caregiver") {
          router.replace("/caregiver");
        } else {
          router.replace("/careseeker/dashboard");
        }
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.message || "Email hoặc mật khẩu không đúng";
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
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  registerLink: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "600",
  },
});
