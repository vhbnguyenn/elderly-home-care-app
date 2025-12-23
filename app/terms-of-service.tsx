import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

const { width, height } = Dimensions.get("window");

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.gradient} />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Điều khoản sử dụng</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.sectionTitle}>1. Chấp nhận điều khoản</ThemedText>
        <ThemedText style={styles.paragraph}>
          Bằng cách truy cập và sử dụng ứng dụng Elderly Home Care, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>2. Mô tả dịch vụ</ThemedText>
        <ThemedText style={styles.paragraph}>
          Elderly Home Care là nền tảng kết nối người cần chăm sóc người cao tuổi với những người chăm sóc chuyên nghiệp. Chúng tôi cung cấp dịch vụ tìm kiếm, đặt lịch và quản lý dịch vụ chăm sóc tại nhà.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>3. Đăng ký tài khoản</ThemedText>
        <ThemedText style={styles.paragraph}>
          • Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản{"\n"}
          • Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình{"\n"}
          • Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản{"\n"}
          • Bạn không được tạo nhiều tài khoản hoặc sử dụng tài khoản của người khác
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>4. Quyền và trách nhiệm của người dùng</ThemedText>
        <ThemedText style={styles.paragraph}>
          • Sử dụng dịch vụ một cách hợp pháp và có trách nhiệm{"\n"}
          • Không đăng tải nội dung vi phạm pháp luật, xúc phạm hoặc lừa đảo{"\n"}
          • Tôn trọng quyền riêng tư của người khác{"\n"}
          • Thanh toán đầy đủ các khoản phí dịch vụ đã sử dụng{"\n"}
          • Tuân thủ các quy định về an toàn và sức khỏe
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>5. Thanh toán và hoàn tiền</ThemedText>
        <ThemedText style={styles.paragraph}>
          • Tất cả các khoản phí được niêm yết rõ ràng trên ứng dụng{"\n"}
          • Thanh toán được thực hiện qua các phương thức được chỉ định{"\n"}
          • Chính sách hoàn tiền được áp dụng theo từng trường hợp cụ thể{"\n"}
          • Bạn có thể hủy dịch vụ theo quy định về thời gian hủy
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>6. Giới hạn trách nhiệm</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi không chịu trách nhiệm về:
          {"\n"}• Thiệt hại trực tiếp hoặc gián tiếp phát sinh từ việc sử dụng dịch vụ
          {"\n"}• Hành vi của người chăm sóc hoặc người dùng dịch vụ
          {"\n"}• Gián đoạn hoặc lỗi kỹ thuật của hệ thống
          {"\n"}• Mất mát dữ liệu hoặc thông tin cá nhân do lỗi bảo mật
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>7. Sửa đổi điều khoản</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên ứng dụng. Việc bạn tiếp tục sử dụng dịch vụ sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>8. Liên hệ</ThemedText>
        <ThemedText style={styles.paragraph}>
          Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ với chúng tôi qua:
          {"\n"}• Email: support@elderlyhomecare.com
          {"\n"}• Điện thoại: 1900-xxxx
          {"\n"}• Địa chỉ: [Địa chỉ công ty]
        </ThemedText>

          <ThemedText style={styles.lastUpdated}>
            Cập nhật lần cuối: Tháng 12, 2024
          </ThemedText>
        </ScrollView>
      </View>
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
    height: height * 0.3,
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
    top: height * 0.12,
    left: -width * 0.2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FF6B35",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginTop: 32,
    marginBottom: 20,
    textAlign: "center",
  },
});

