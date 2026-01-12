import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CaregiverBottomNav from "../../components/navigation/CaregiverBottomNav";
import { Review, ReviewsAPI } from "../../services/api/reviews.api";

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await ReviewsAPI.getReceivedReviews(currentPage, 10);
      
      if (response.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.pagination.totalPages);
        setTotalReviews(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchReviews();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSatisfactionLabel = (satisfaction: string) => {
    const labels: { [key: string]: { label: string; color: string; icon: string } } = {
      very_satisfied: { label: 'Rất hài lòng', color: '#10B981', icon: 'emoticon-excited' },
      satisfied: { label: 'Hài lòng', color: '#34D399', icon: 'emoticon-happy' },
      neutral: { label: 'Trung bình', color: '#F59E0B', icon: 'emoticon-neutral' },
      dissatisfied: { label: 'Không hài lòng', color: '#F97316', icon: 'emoticon-sad' },
      very_dissatisfied: { label: 'Rất không hài lòng', color: '#EF4444', icon: 'emoticon-angry' },
    };
    return labels[satisfaction] || labels.neutral;
  };

  const getStrengthLabel = (strength: string) => {
    const labels: { [key: string]: string } = {
      professional_skills: 'Kỹ năng chuyên môn',
      attitude: 'Thái độ',
      punctuality: 'Đúng giờ',
      care_quality: 'Chất lượng chăm sóc',
      communication: 'Giao tiếp',
    };
    return labels[strength] || strength;
  };

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color={star <= rating ? "#FCD34D" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  const renderReviewCard = (review: Review) => {
    const satisfactionInfo = getSatisfactionLabel(review.overallSatisfaction);
    const avgRating = parseFloat(review.averageRating);

    return (
      <View key={review.id} style={styles.reviewCard}>
        {/* Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={24} color="#fff" />
            </View>
            <View style={styles.reviewerDetails}>
              <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>{avgRating.toFixed(1)}</Text>
            <MaterialCommunityIcons name="star" size={20} color="#FCD34D" />
          </View>
        </View>

        {/* Booking Info */}
        <View style={styles.bookingInfo}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.bookingText}>
            Làm việc ngày {formatDate(review.booking.bookingDate)} • {review.booking.duration}h
          </Text>
        </View>

        {/* Satisfaction Badge */}
        <View style={[styles.satisfactionBadge, { backgroundColor: `${satisfactionInfo.color}15` }]}>
          <MaterialCommunityIcons 
            name={satisfactionInfo.icon as any} 
            size={20} 
            color={satisfactionInfo.color} 
          />
          <Text style={[styles.satisfactionText, { color: satisfactionInfo.color }]}>
            {satisfactionInfo.label}
          </Text>
        </View>

        {/* Detailed Ratings */}
        <View style={styles.ratingsSection}>
          <Text style={styles.sectionTitle}>Chi tiết đánh giá:</Text>
          <View style={styles.ratingsGrid}>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Chuyên môn</Text>
              {renderRatingStars(review.ratings.professionalism)}
              <Text style={styles.ratingValue}>{review.ratings.professionalism}/5</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Thái độ</Text>
              {renderRatingStars(review.ratings.attitude)}
              <Text style={styles.ratingValue}>{review.ratings.attitude}/5</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Đúng giờ</Text>
              {renderRatingStars(review.ratings.punctuality)}
              <Text style={styles.ratingValue}>{review.ratings.punctuality}/5</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Chất lượng</Text>
              {renderRatingStars(review.ratings.careQuality)}
              <Text style={styles.ratingValue}>{review.ratings.careQuality}/5</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Giao tiếp</Text>
              {renderRatingStars(review.ratings.communication)}
              <Text style={styles.ratingValue}>{review.ratings.communication}/5</Text>
            </View>
          </View>
        </View>

        {/* Strengths */}
        {review.strengths.length > 0 && (
          <View style={styles.strengthsSection}>
            <Text style={styles.sectionTitle}>Điểm mạnh:</Text>
            <View style={styles.tagsContainer}>
              {review.strengths.map((strength, index) => (
                <View key={index} style={styles.strengthTag}>
                  <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                  <Text style={styles.strengthText}>{getStrengthLabel(strength)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Notes */}
        {review.additionalNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Nhận xét:</Text>
            <Text style={styles.notesText}>{review.additionalNotes}</Text>
          </View>
        )}

        {/* Would Use Again */}
        <View style={styles.useAgainSection}>
          <MaterialCommunityIcons 
            name={review.wouldUseAgain === 'definitely' || review.wouldUseAgain === 'probably' ? 'thumb-up' : 'thumb-down'} 
            size={16} 
            color={review.wouldUseAgain === 'definitely' || review.wouldUseAgain === 'probably' ? '#10B981' : '#EF4444'} 
          />
          <Text style={styles.useAgainText}>
            {review.wouldUseAgain === 'definitely' ? 'Chắc chắn sẽ thuê lại' :
             review.wouldUseAgain === 'probably' ? 'Có thể sẽ thuê lại' :
             review.wouldUseAgain === 'maybe' ? 'Chưa chắc chắn' : 'Không muốn thuê lại'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá từ khách hàng</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
        </View>
        <CaregiverBottomNav activeTab="profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá từ khách hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalReviews}</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statRating}>
            <Text style={styles.statNumber}>
              {reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + parseFloat(r.averageRating), 0) / reviews.length).toFixed(1)
                : '0.0'}
            </Text>
            <MaterialCommunityIcons name="star" size={24} color="#FCD34D" />
          </View>
          <Text style={styles.statLabel}>Trung bình</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentPage}/{totalPages}</Text>
          <Text style={styles.statLabel}>Trang</Text>
        </View>
      </View>

      {/* Reviews List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
        }
      >
        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="star-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
            <Text style={styles.emptyText}>
              Bạn chưa nhận được đánh giá nào từ khách hàng
            </Text>
          </View>
        ) : (
          <>
            {reviews.map((review) => renderReviewCard(review))}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <MaterialCommunityIcons 
                    name="chevron-left" 
                    size={20} 
                    color={currentPage === 1 ? "#9CA3AF" : "#1F2937"} 
                  />
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  Trang {currentPage} / {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                  onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color={currentPage === totalPages ? "#9CA3AF" : "#1F2937"} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  scrollView: {
    flex: 1,
    marginBottom: 80,
  },
  reviewCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerDetails: {
    gap: 2,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  bookingText: {
    fontSize: 13,
    color: "#6B7280",
  },
  satisfactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  satisfactionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  ratingsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  ratingsGrid: {
    gap: 12,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
    color: "#6B7280",
    width: 80,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    flex: 1,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    width: 40,
    textAlign: "right",
  },
  strengthsSection: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  strengthTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  notesSection: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    fontStyle: "italic",
  },
  useAgainSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  useAgainText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 20,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
});
