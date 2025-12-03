import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'heart-circle',
    title: 'Chăm sóc tận tâm',
    description: 'Đội ngũ người chăm sóc chuyên nghiệp, được đào tạo bài bản và có chứng chỉ',
    color: '#FF6B6B',
  },
  {
    id: '2',
    icon: 'people',
    title: 'Kết nối tin cậy',
    description: 'Hơn 500+ người chăm sóc uy tín, được xác minh và đánh giá bởi cộng đồng',
    color: '#4CAF50',
  },
  {
    id: '3',
    icon: 'calendar',
    title: 'Linh hoạt thời gian',
    description: 'Đặt lịch dễ dàng, theo dõi tiến trình và nhận thông báo thời gian thực',
    color: '#2196F3',
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    title: 'An tâm tuyệt đối',
    description: 'Hỗ trợ 24/7, bảo hiểm toàn diện và cam kết chất lượng dịch vụ',
    color: '#FF9800',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      // Đến trang hỏi có tài khoản chưa
      router.push('/account-check');
    }
  };

  const handleSkip = () => {
    router.push('/account-check');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={80} color={item.color} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#FF6B6B',
    width: 30,
  },
  inactiveDot: {
    backgroundColor: '#DDD',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#999',
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
