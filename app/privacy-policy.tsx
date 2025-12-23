import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

const { width, height } = Dimensions.get("window");

export default function PrivacyPolicyScreen() {
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
        <ThemedText style={styles.headerTitle}>Chính sách bảo mật</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.sectionTitle}>1. Thông tin chúng tôi thu thập</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi thu thập các loại thông tin sau:
          {"\n"}• Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ
          {"\n"}• Thông tin tài khoản: Tên đăng nhập, mật khẩu (được mã hóa)
          {"\n"}• Thông tin dịch vụ: Lịch sử đặt lịch, đánh giá, phản hồi
          {"\n"}• Thông tin thiết bị: Địa chỉ IP, loại thiết bị, hệ điều hành
          {"\n"}• Thông tin vị trí: GPS, địa chỉ để cung cấp dịch vụ tốt hơn
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>2. Cách chúng tôi sử dụng thông tin</ThemedText>
        <ThemedText style={styles.paragraph}>
          Thông tin của bạn được sử dụng để:
          {"\n"}• Cung cấp và cải thiện dịch vụ của chúng tôi
          {"\n"}• Kết nối bạn với người chăm sóc phù hợp
          {"\n"}• Xử lý thanh toán và giao dịch
          {"\n"}• Gửi thông báo về dịch vụ và cập nhật quan trọng
          {"\n"}• Phân tích và cải thiện trải nghiệm người dùng
          {"\n"}• Ngăn chặn gian lận và bảo vệ an ninh
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>3. Chia sẻ thông tin</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi có thể chia sẻ thông tin của bạn với:
          {"\n"}• Người chăm sóc: Để họ có thể cung cấp dịch vụ
          {"\n"}• Đối tác thanh toán: Để xử lý giao dịch
          {"\n"}• Nhà cung cấp dịch vụ: Hỗ trợ vận hành ứng dụng
          {"\n"}• Cơ quan pháp luật: Khi được yêu cầu theo quy định pháp luật
          {"\n\n"}
          Chúng tôi KHÔNG bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>4. Bảo mật thông tin</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin của bạn:
          {"\n"}• Mã hóa dữ liệu nhạy cảm (SSL/TLS)
          {"\n"}• Lưu trữ an toàn trên máy chủ được bảo vệ
          {"\n"}• Giới hạn quyền truy cập chỉ cho nhân viên được ủy quyền
          {"\n"}• Kiểm tra bảo mật định kỳ
          {"\n"}• Xác thực đa yếu tố cho tài khoản quan trọng
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>5. Quyền của bạn</ThemedText>
        <ThemedText style={styles.paragraph}>
          Bạn có các quyền sau đối với thông tin cá nhân:
          {"\n"}• Quyền truy cập: Xem thông tin chúng tôi có về bạn
          {"\n"}• Quyền sửa đổi: Cập nhật thông tin không chính xác
          {"\n"}• Quyền xóa: Yêu cầu xóa thông tin của bạn
          {"\n"}• Quyền từ chối: Từ chối việc xử lý thông tin trong một số trường hợp
          {"\n"}• Quyền rút lại đồng ý: Hủy bỏ sự đồng ý đã cấp trước đó
          {"\n"}• Quyền khiếu nại: Gửi khiếu nại đến cơ quan có thẩm quyền
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>6. Cookie và công nghệ theo dõi</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi sử dụng cookies và công nghệ tương tự để:
          {"\n"}• Ghi nhớ tùy chọn của bạn
          {"\n"}• Phân tích lưu lượng truy cập
          {"\n"}• Cải thiện hiệu suất ứng dụng
          {"\n"}• Cung cấp nội dung được cá nhân hóa
          {"\n\n"}
          Bạn có thể tắt cookies trong cài đặt trình duyệt của mình.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>7. Lưu trữ dữ liệu</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi lưu trữ thông tin của bạn trong thời gian:
          {"\n"}• Khi bạn còn sử dụng dịch vụ của chúng tôi
          {"\n"}• Theo yêu cầu pháp lý (thường là 5-7 năm)
          {"\n"}• Khi cần thiết để giải quyết tranh chấp
          {"\n\n"}
          Sau khi xóa tài khoản, một số thông tin có thể được lưu giữ trong bản sao lưu tối đa 90 ngày.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>8. Trẻ em</ThemedText>
        <ThemedText style={styles.paragraph}>
          Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin từ trẻ em. Nếu bạn phát hiện trẻ em đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>9. Thay đổi chính sách</ThemedText>
        <ThemedText style={styles.paragraph}>
          Chúng tôi có thể cập nhật Chính sách bảo mật này định kỳ. Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc thông báo trong ứng dụng. Ngày "Cập nhật lần cuối" ở cuối tài liệu cho biết thời điểm thay đổi gần nhất.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>10. Liên hệ</ThemedText>
        <ThemedText style={styles.paragraph}>
          Nếu bạn có câu hỏi về Chính sách bảo mật hoặc muốn thực hiện quyền của mình:
          {"\n"}• Email: privacy@elderlyhomecare.com
          {"\n"}• Điện thoại: 1900-xxxx
          {"\n"}• Địa chỉ: [Địa chỉ công ty]
          {"\n"}• Thời gian hỗ trợ: 8:00 - 17:00 (Thứ 2 - Thứ 6)
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

