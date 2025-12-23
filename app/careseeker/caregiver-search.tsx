import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AIMatchingModal } from '@/components/caregiver/AIMatchingModal';
import { AIRecommendations } from '@/components/caregiver/AIRecommendations';
import { BookingModal } from '@/components/caregiver/BookingModal';
import { CaregiverCard, type Caregiver } from '@/components/caregiver/CaregiverCard';
import { SearchFilters, type FilterOption } from '@/components/caregiver/SearchFilters';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { CaregiverRecommendation, MatchResponse } from '@/services/types';

// TODO: Replace with real API data - fetch from elderly service and caregiver service
const mockElderlyProfiles: any[] = [];
const mockCaregivers: Caregiver[] = [];

const filterOptions: FilterOption[] = [
  { id: 'all', label: 'Tất cả', icon: 'grid' },
  { id: 'nearby', label: 'Gần nhất', icon: 'location' },
  { id: 'topRated', label: 'Đánh giá cao', icon: 'star' },
];

export default function CaregiverSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [caregivers] = useState<Caregiver[]>(mockCaregivers);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<CaregiverRecommendation[]>([]);
  const [showAIResults, setShowAIResults] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showFloatingAI, setShowFloatingAI] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const { user } = useAuth();

  // Floating AI position state
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const translateX = useSharedValue(screenWidth - 80); // Initial position (right side)
  const translateY = useSharedValue(screenHeight - 200); // Initial position (bottom)

  // TODO: Should fetch from elderly API
  const elderlyProfiles: any[] = [];

  const handleCaregiverPress = (caregiver: Caregiver) => {
    router.push('/careseeker/caregiver-detail');
  };

  const handleChatPress = (caregiver: Caregiver) => {
    router.push({
      pathname: '/careseeker/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      }
    });
  };

  const handleBookNow = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  const handleAIMatching = () => {
    // Open booking modal with first caregiver or null
    setSelectedCaregiver(mockCaregivers[0] || null);
    setShowBookingModal(true);
  };

  const handleGetAIRecommendations = (response: MatchResponse) => {
    console.log('AI Recommendations received:', response);
    setAiRecommendations(response.recommendations);
    setShowAIResults(true);
    setShowAIModal(false);
    setIsAILoading(false);
  };

  const handleRefreshAI = () => {
    setIsAILoading(true);
    // In real app, this would refresh AI recommendations
    setTimeout(() => {
      setIsAILoading(false);
    }, 1000);
  };

  // Gesture handler for floating AI button
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial position
    })
    .onUpdate((event) => {
      translateX.value = event.absoluteX - 28; // Center the button
      translateY.value = event.absoluteY - 28;
    })
    .onEnd(() => {
      // Snap to edges
      const buttonSize = 56;
      const margin = 20;
      
      if (translateX.value < screenWidth / 2) {
        // Snap to left edge
        translateX.value = withSpring(margin);
      } else {
        // Snap to right edge
        translateX.value = withSpring(screenWidth - buttonSize - margin);
      }
      
      // Keep Y within screen bounds
      translateY.value = withSpring(
        Math.max(margin, Math.min(screenHeight - buttonSize - margin, translateY.value))
      );
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFF5F5', '#FFFFFF', '#FFF9F5']}
        style={styles.backgroundGradient}
      />

      {/* Decorative Background */}
      <View style={styles.decorativeBackground}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
      </View>

      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tìm người chăm sóc</ThemedText>
        </View>
        
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, kỹ năng, khu vực..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <SearchFilters
        filters={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Results */}
      {showAIResults ? (
        <AIRecommendations
          recommendations={aiRecommendations}
          onCaregiverPress={handleCaregiverPress}
          onBookPress={handleBookNow}
          onChatPress={handleChatPress}
          onRefresh={handleRefreshAI}
          isLoading={isAILoading}
        />
      ) : (
        <ScrollView
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <ThemedText style={styles.resultsCount}>
              Tìm thấy {caregivers.length} người chăm sóc
            </ThemedText>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={16} color="#667eea" />
              <ThemedText style={styles.sortButtonText}>Sắp xếp</ThemedText>
            </TouchableOpacity>
          </View>

          {caregivers.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={64} color="#FF6B35" />
              </View>
              <ThemedText style={styles.emptyTitle}>Chưa có người chăm sóc</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác để tìm người chăm sóc phù hợp
              </ThemedText>
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={handleAIMatching}
              >
                <LinearGradient
                  colors={['#FF6B35', '#FF8E53']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyActionGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#FFF" />
                  <ThemedText style={styles.emptyActionText}>Dùng AI tìm kiếm</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.caregiversList}>
              {caregivers.map((caregiver) => (
                <CaregiverCard
                  key={caregiver.id}
                  caregiver={caregiver}
                  onPress={handleCaregiverPress}
                  onBookPress={handleBookNow}
                  onChatPress={handleChatPress}
                />
              ))}
            </View>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Floating AI Button */}
      {showFloatingAI && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.floatingAIContainer, animatedStyle]}>
            <TouchableOpacity style={styles.floatingAIButton} onPress={handleAIMatching}>
              <Ionicons name="sparkles" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeFloatingButton} 
              onPress={() => setShowFloatingAI(false)}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      )}

      {/* AI Matching Modal */}
      <AIMatchingModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGetRecommendations={handleGetAIRecommendations}
        elderlyProfiles={mockElderlyProfiles}
      />

      {/* Booking Modal */}
      {selectedCaregiver && (
        <BookingModal
          visible={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedCaregiver(null);
          }}
          caregiver={selectedCaregiver}
          elderlyProfiles={elderlyProfiles}
        />
      )}

      {/* Navigation Bar */}
      <SimpleNavBar />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingBottom: 100, // Space for navigation bar
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 142, 83, 0.08)',
    top: 150,
    left: -50,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 107, 53, 0.06)',
    bottom: 100,
    right: 30,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  floatingAIContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingAIButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  closeFloatingButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  caregiversList: {
    padding: 20,
    gap: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

