import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "care-seeker", // 'care-seeker' hoặc 'caregiver'
  });
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  const { login } = useAuth();

  // Validate password
  const validatePassword = () => {
    if (!formData.password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (!formData.confirmPassword) {
      setPasswordError("Vui lòng xác nhận mật khẩu");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      showErrorTooltip("Vui lòng nhập email");
      return;
    }

    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      // Gọi API mockapi tạo user
      const newUser = {
        email: formData.email,
        password: formData.password,
        role: formData.userType === "care-seeker" ? "Care Seeker" : "Caregiver",
        fullName: "",
        status: formData.userType === "caregiver" ? "pending" : "approved",
        hasCompletedProfile: formData.userType === "caregiver" ? false : true,
      };

      await AuthService.register(newUser);

      // If caregiver, auto login and navigate to complete profile
      if (formData.userType === "caregiver") {
        showSuccessTooltip("🎉 Đăng ký thành công! Đang chuyển hướng...");
        const userData = await login(formData.email, formData.password);
        if (userData) {
          // Store email for complete profile screen
          setTimeout(() => {
            router.replace("/caregiver");
            // Navigate to complete profile after caregiver screen loads
            setTimeout(() => {
              // This will be handled by checking if profile is incomplete
            }, 500);
          }, 1000);
        } else {
          router.replace("/login");
        }
      } else {
        showSuccessTooltip("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
        router.replace("/login");
      }
    } catch (err: any) {
      console.error("Register error:", err.response || err.message);
      showErrorTooltip("Có lỗi xảy ra khi đăng ký!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Đăng ký tài khoản</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Nhập địa chỉ email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Mật khẩu *</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
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

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Xác nhận mật khẩu *</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Bạn là:</ThemedText>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setFormData({ ...formData, userType: "care-seeker" })
                }
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.userType === "care-seeker" && styles.radioSelected,
                  ]}
                />
                <ThemedText style={styles.radioText}>
                  Người cần dịch vụ chăm sóc
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setFormData({ ...formData, userType: "caregiver" })
                }
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.userType === "caregiver" && styles.radioSelected,
                  ]}
                />
                <ThemedText style={styles.radioText}>
                  Người chăm sóc chuyên nghiệp
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <ThemedText style={styles.submitButtonText}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.note}>
            * Bằng cách đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách
            bảo mật.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: "bold", color: "#2c3e50" },
  content: { padding: 20 },
  form: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#2c3e50", marginBottom: 8 },
  passwordContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  inputError: { borderColor: "#FF6B35", backgroundColor: "#fff5f5" },
  errorText: { fontSize: 12, color: "#FF6B35", marginTop: 4 },
  radioGroup: { marginTop: 8 },
  radioOption: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#dee2e6",
    marginRight: 12,
  },
  radioSelected: { borderColor: "#FF6B35", backgroundColor: "#FF6B35" },
  radioText: { fontSize: 16, color: "#495057" },
  submitButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  note: { fontSize: 12, color: "#6c757d", textAlign: "center", lineHeight: 18 },
});
