import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyCodeScreen() {
  const { email, type } = useLocalSearchParams<{ email: string; type?: string }>();
  const isEmailVerification = type === "verify-email";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const codeString = code.join("");
    
    if (!codeString) {
      showErrorTooltip("Vui lòng nhập mã xác thực");
      return;
    }

    if (codeString.length !== 6) {
      showErrorTooltip("Mã xác thực phải có 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      if (isEmailVerification) {
        // Verify email after registration
        const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, {
          email: email,
          code: codeString,
        });

        showSuccessTooltip("Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.");
        
        // Navigate to login screen
        setTimeout(() => {
          router.replace("/login");
        }, 1500);
      } else {
        // Verify code for password reset
        const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
          email,
          code: codeString,
          verifyOnly: true,
        });

        showSuccessTooltip("Mã xác thực hợp lệ!");
        
        // Navigate to reset password screen
        setTimeout(() => {
          router.push({
            pathname: "/reset-password",
            params: { email, code: codeString },
          });
        }, 1000);
      }
    } catch (error: any) {
      let errorMessage = "Mã xác thực không hợp lệ";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = "Mã xác thực không hợp lệ";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy yêu cầu xác thực. Vui lòng thử gửi lại mã.";
        } else if (status === 410) {
          errorMessage = "Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || "Mã xác thực không hợp lệ";
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

  const handleResendCode = async () => {
    if (isSending || resendCountdown > 0) return;

    setIsSending(true);
    try {
      // Backend không có endpoint resend-verification riêng
      // Chỉ có thể dùng forgot-password để gửi lại code
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });

      showSuccessTooltip("Mã xác thực mới đã được gửi!");
      setCode(["", "", "", "", "", ""]); // Clear all inputs
      setResendCountdown(60); // Start 60s countdown
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      let errorMessage = "Không thể gửi lại mã";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 429) {
          errorMessage = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau";
        } else if (status >= 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau";
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || "Không thể gửi lại mã";
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorTooltip(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Handle send code button
  const handleSendCode = async () => {
    if (isSending || resendCountdown > 0) return;

    setIsSending(true);
    try {
      // Backend không có endpoint resend-verification riêng
      // Chỉ có thể dùng forgot-password để gửi lại code
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      showSuccessTooltip("Mã xác thực đã được gửi đến email của bạn!");
      setCodeSent(true);
      setResendCountdown(60);
      // Focus first input after sending
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      let errorMessage = "Không thể gửi mã xác thực";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showErrorTooltip(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

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
          <Text style={styles.title}>
            {isEmailVerification ? "Xác Thực Email" : "Xác Thực Mã"}
          </Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>
            {isEmailVerification 
              ? codeSent
                ? "Nhập mã 6 chữ số đã được gửi đến email để hoàn tất đăng ký"
                : "Nhấn nút bên dưới để nhận mã xác thực qua email"
              : codeSent 
                ? "Nhập mã 6 chữ số đã được gửi đến email của bạn"
                : "Nhấn nút bên dưới để nhận mã xác thực qua email"}
          </Text>
        </View>

        {/* Email Info */}
        <View style={styles.emailInfo}>
          <Ionicons name="mail" size={18} color="#FF5722" />
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!codeSent ? (
            /* Send Code Button - Show when code not sent yet */
            <TouchableOpacity
              style={styles.sendCodeButton}
              onPress={handleSendCode}
              disabled={isSending}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isSending ? ["#9CA3AF", "#9CA3AFDD"] : ["#FF5722", "#FF5722DD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendCodeButtonGradient}
              >
                {isSending ? (
                  <Text style={styles.sendCodeButtonText}>Đang gửi...</Text>
                ) : (
                  <>
                    <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.sendCodeButtonText}>Gửi mã xác thực</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* 6 Code Input Boxes - Show after code sent */
            <View style={styles.codeInputContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    digit ? styles.codeInputFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!isLoading}
                  autoFocus={false}
                  selectTextOnFocus
                />
              ))}
            </View>
          )}

          {codeSent && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyCode}
              disabled={isLoading || code.join("").length !== 6}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  code.join("").length === 6
                    ? ["#FF5722", "#FF5722DD"]
                    : ["#9CA3AF", "#9CA3AFDD"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyButtonGradient}
              >
                {isLoading ? (
                  <Text style={styles.verifyButtonText}>Đang xác thực...</Text>
                ) : (
                  <>
                    <Text style={styles.verifyButtonText}>Xác thực</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            Mã xác thực có hiệu lực trong 15 phút. Vui lòng kiểm tra hộp thư đến
            hoặc thư mục spam.
          </Text>
        </View>

        {/* Resend Code - Only show after code sent */}
        {codeSent && (
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Không nhận được mã? </Text>
            <TouchableOpacity 
              onPress={handleResendCode} 
              disabled={isSending || resendCountdown > 0}
            >
              <Text style={[
                styles.resendLink,
                (isSending || resendCountdown > 0) && styles.resendLinkDisabled
              ]}>
                {isSending 
                  ? "Đang gửi..." 
                  : resendCountdown > 0 
                    ? `Gửi lại (${resendCountdown}s)`
                    : "Gửi lại"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 30,
    gap: 8,
  },
  emailText: {
    fontSize: 15,
    color: "#FF5722",
    fontWeight: "600",
  },
  form: {
    gap: 24,
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 8,
  },
  codeInput: {
    flex: 1,
    height: 60,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
  },
  codeInputFilled: {
    borderColor: "#FF5722",
    backgroundColor: "#FFF5F5",
  },
  sendCodeButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  sendCodeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 10,
  },
  sendCodeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  verifyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 8,
  },
  verifyButtonText: {
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
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  resendLinkDisabled: {
    color: "#9CA3AF",
  },
});
