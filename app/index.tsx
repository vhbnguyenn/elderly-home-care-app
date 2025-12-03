import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Chăm sóc người thân an tâm hơn',
    subtitle: 'Gửi trọn an tâm - Vẹn tròn chữ hiếu',
    description: 'An toàn – Uy tín – Được chứng nhận bởi các tổ chức y tế',
    icon: 'heart-circle-outline',
    color: '#FF5722',
    bgColor: '#FFF5F5',
  },
  {
    id: '2',
    title: 'Tại sao nên chọn chúng tôi?',
    subtitle: 'Cam kết chất lượng hàng đầu',
    description: 'Đội ngũ chuyên nghiệp với chứng chỉ, giá cả minh bạch và đánh giá thực tế 4.8⭐',
    icon: 'shield-checkmark',
    color: '#FF5722',
    bgColor: '#FFF8F5',
  },
  {
    id: '3',
    title: 'Hoạt động như thế nào?',
    subtitle: 'Đơn giản chỉ với 3 bước',
    description: 'Chọn dịch vụ → Ghép với người phù hợp → Theo dõi & hỗ trợ 24/7',
    icon: 'git-network-outline',
    color: '#FF5722',
    bgColor: '#FFF9F5',
  },
  {
    id: '4',
    title: 'Bạn cần hỗ trợ điều gì?',
    subtitle: 'Tùy chỉnh theo nhu cầu của bạn',
    description: 'Chọn dịch vụ phù hợp: chăm sóc người già, sau xuất viện, dọn nhà, nấu ăn...',
    icon: 'options-outline',
    color: '#FF5722',
    bgColor: '#FFFAF7',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/account-check');
    }
  };

  const handleSkip = () => {
    router.push('/account-check');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        {/* Logo - Top Left Corner */}
        <View style={styles.topBrandContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.topLogo}
            resizeMode="contain"
          />
        </View>

        {/* Decorative Background Elements - Different for each slide */}
        <View style={styles.decorativeBackground}>
          {index === 0 && (
            <>
              <View style={[styles.bgCircle1, { backgroundColor: item.color + '08' }]} />
              <View style={[styles.bgCircle2, { backgroundColor: item.color + '06' }]} />
              <View style={[styles.bgCircle3, { backgroundColor: item.color + '05' }]} />
            </>
          )}
          {index === 1 && (
            <>
              <View style={[styles.bgSquare1, { backgroundColor: item.color + '08' }]} />
              <View style={[styles.bgSquare2, { backgroundColor: item.color + '06' }]} />
              <View style={[styles.bgCircle4, { backgroundColor: item.color + '05' }]} />
            </>
          )}
          {index === 2 && (
            <>
              <View style={[styles.bgWave1, { backgroundColor: item.color + '08' }]} />
              <View style={[styles.bgWave2, { backgroundColor: item.color + '06' }]} />
              <View style={[styles.bgCircle5, { backgroundColor: item.color + '05' }]} />
            </>
          )}
          {index === 3 && (
            <>
              <View style={[styles.bgDiamond1, { backgroundColor: item.color + '08' }]} />
              <View style={[styles.bgDiamond2, { backgroundColor: item.color + '06' }]} />
              <View style={[styles.bgCircle6, { backgroundColor: item.color + '05' }]} />
            </>
          )}
        </View>

        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>

          {/* Icon Container - Modern 3-Layer Circle Design */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconOuterCircle, { backgroundColor: item.color + '15' }]}>
              <View style={[styles.iconMiddleCircle, { backgroundColor: item.color + '25' }]}>
                <View style={[styles.iconInnerCircle, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={48} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>

          {/* Title & Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={[styles.underline, { backgroundColor: item.color }]} />
            <Text style={[styles.subtitle, { color: item.color }]}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Features Badge */}
          <View style={styles.featuresContainer}>
            {index === 1 && (
              <>
                <View style={[styles.featureBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="ribbon" size={18} color={item.color} />
                  <Text style={[styles.featureText, { color: item.color }]}>Chứng nhận</Text>
                </View>
                <View style={[styles.featureBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="pricetag" size={18} color={item.color} />
                  <Text style={[styles.featureText, { color: item.color }]}>Giá minh bạch</Text>
                </View>
                <View style={[styles.featureBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="star" size={18} color={item.color} />
                  <Text style={[styles.featureText, { color: item.color }]}>Đánh giá 4.8+</Text>
                </View>
              </>
            )}
            {index === 2 && (
              <>
                <View style={[styles.stepBadge, { backgroundColor: '#FFFFFF', borderColor: item.color + '30' }]}>
                  <View style={[styles.stepNumber, { backgroundColor: item.color }]}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: item.color }]}>Chọn dịch vụ</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={item.color} />
                <View style={[styles.stepBadge, { backgroundColor: '#FFFFFF', borderColor: item.color + '30' }]}>
                  <View style={[styles.stepNumber, { backgroundColor: item.color }]}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: item.color }]}>Ghép người</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={item.color} />
                <View style={[styles.stepBadge, { backgroundColor: '#FFFFFF', borderColor: item.color + '30' }]}>
                  <View style={[styles.stepNumber, { backgroundColor: item.color }]}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: item.color }]}>Theo dõi</Text>
                </View>
              </>
            )}
            {index === 3 && (
              <>
                <View style={[styles.serviceBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="person-outline" size={16} color={item.color} />
                  <Text style={[styles.serviceText, { color: item.color }]}>Chăm sóc người già</Text>
                </View>
                <View style={[styles.serviceBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="medical-outline" size={16} color={item.color} />
                  <Text style={[styles.serviceText, { color: item.color }]}>Sau xuất viện</Text>
                </View>
                <View style={[styles.serviceBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="home-outline" size={16} color={item.color} />
                  <Text style={[styles.serviceText, { color: item.color }]}>Dọn nhà</Text>
                </View>
                <View style={[styles.serviceBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="restaurant-outline" size={16} color={item.color} />
                  <Text style={[styles.serviceText, { color: item.color }]}>Nấu ăn</Text>
                </View>
              </>
            )}
            {index === 0 && (
              <>
                <View style={[styles.featureBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="checkmark-circle" size={18} color={item.color} />
                  <Text style={[styles.featureText, { color: item.color }]}>An toàn</Text>
                </View>
                <View style={[styles.featureBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="shield-checkmark" size={18} color={item.color} />
                  <Text style={[styles.featureText, { color: item.color }]}>Uy tín</Text>
                </View>
                <View style={[styles.featureBadge, { borderColor: item.color + '30', backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name="ribbon" size={18} color={item.color} />
                  <Text style={[styles.featureText, { color: item.color }]}>Chứng nhận</Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      {/* Pagination - Minimalist */}
      <View style={styles.pagination}>
        {slides.map((slide, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 3, 1],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={slide.id}
              style={[
                styles.paginationDot,
                {
                  opacity,
                  backgroundColor: slide.color,
                  transform: [{ scaleX: scale }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Bottom Actions - Modern */}
      <View style={styles.bottomContainer}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[slides[currentIndex].color, slides[currentIndex].color + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Hoàn tất' : currentIndex === 0 ? 'Bắt đầu' : 'Tiếp tục'}
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
    paddingHorizontal: 35,
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -150,
    right: -150,
  },
  bgCircle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    bottom: -100,
    left: -100,
  },
  bgCircle3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: '40%',
    right: -80,
  },
  // Slide 2 - Squares + Circle
  bgSquare1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 40,
    top: -120,
    left: -100,
  },
  bgSquare2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 35,
    bottom: -120,
    right: -90,
  },
  bgCircle4: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: '35%',
    left: -70,
  },
  // Slide 3 - Waves + Circle
  bgWave1: {
    position: 'absolute',
    width: 450,
    height: 450,
    borderRadius: 225,
    top: -200,
    right: -200,
  },
  bgWave2: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    bottom: -150,
    left: -150,
  },
  bgCircle5: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: '45%',
    right: -60,
  },
  // Slide 4 - Diamonds (rotated squares) + Circle
  bgDiamond1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 30,
    top: -100,
    right: -120,
    transform: [{ rotate: '45deg' }],
  },
  bgDiamond2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 25,
    bottom: -90,
    left: -110,
    transform: [{ rotate: '45deg' }],
  },
  bgCircle6: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: '38%',
    left: -50,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
  },
  topBrandContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  topLogo: {
    width: 48,
    height: 48,
  },
  stepIndicator: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  iconWrapper: {
    marginBottom: 40,
  },
  iconOuterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconMiddleCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  underline: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0,
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 5,
    fontWeight: '400',
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  // New layout styles
  textContainerTop: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 5,
  },
  featureCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 11,
    color: '#5D6D7E',
    textAlign: 'center',
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  textRight: {
    flex: 1,
  },
  titleLeft: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
    lineHeight: 30,
  },
  subtitleSmall: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionCenter: {
    fontSize: 15,
    color: '#5D6D7E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  textContainerCompact: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  iconCircleMedium: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  descriptionSmall: {
    fontSize: 14,
    color: '#5D6D7E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  serviceGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 45,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
    letterSpacing: 0,
  },
  nextButton: {
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0,
  },
});
