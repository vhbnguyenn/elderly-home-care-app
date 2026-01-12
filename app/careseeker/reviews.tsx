import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

interface VideoConsultationReview {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  rating: number;
  comment: string;
  date: string;
  duration: number; // phÃºt
  isVerified: boolean;
}

interface ServiceReview {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  rating: number;
  comment: string;
  date: string;
  elderlyName: string;
  familyName: string;
  totalHours: number;
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
  isVerified: boolean;
}

interface SystemReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  category: string; // 'app_performance', 'ui_ux', 'features', 'support'
  isVerified: boolean;
}

interface ComplaintReview {
  id: string;
  complainantName: string;
  complainantAvatar: string;
  accusedName: string;
  accusedAvatar: string;
  adminName: string;
  adminAvatar: string;
  date: string;
  time: string;
  status: 'pending' | 'resolved' | 'rejected';
  category: string;
  isVerified: boolean;
}

type ReviewTab = 'video' | 'service' | 'system' | 'complaint';
type ReviewSubTab = 'completed' | 'pending';

export default function ReviewsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReviewTab>('video');
  const [activeSubTab, setActiveSubTab] = useState<ReviewSubTab>('completed');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]); // New state for images
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);

  // TODO: Replace with real API data from elderly service
  const elderlyProfiles: any[] = [];

  // TODO: Replace with real API data from review service
  const videoReviews: VideoConsultationReview[] = [];
  const serviceReviews: ServiceReview[] = [];
  const systemReviews: SystemReview[] = [];
  const complaintReviews: ComplaintReview[] = [];

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#ffd700"
          />
        ))}
      </View>
    );
  };

  const handleReviewPress = (item: any) => {
    setSelectedReviewItem(item);
    setRating(0);
    setComment('');
    setImages([]); // Reset images
    setShowReviewModal(true);
  };

  const handleImagePicker = async () => {
    Alert.alert(
      'Chá»n áº£nh',
      'Báº¡n muá»‘n chá»n tá»« thÆ° viá»‡n hay chá»¥p áº£nh má»›i?',
      [
        { text: 'Há»§y', style: 'cancel' },
        { text: 'ThÆ° viá»‡n', onPress: handlePickFromLibrary },
        { text: 'Chá»¥p áº£nh', onPress: handleTakePhoto },
      ]
    );
  };

  const handlePickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('ThÃ´ng bÃ¡o', 'Cáº§n quyá»n truy cáº­p thÆ° viá»‡n áº£nh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('ThÃ´ng bÃ¡o', 'Cáº§n quyá»n truy cáº­p camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemPress = (item: any) => {
    setSelectedDetailItem(item);
    setShowDetailModal(true);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert('Vui lÃ²ng chá»n sá»‘ sao Ä‘Ã¡nh giÃ¡');
      return;
    }
    
    // TODO: Submit review to API
    console.log('Submitting review:', {
      item: selectedReviewItem,
      rating,
      comment,
      user: user?.email
    });
    
    // Close review modal and show confirmation modal
    setShowReviewModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmationChoice = (choice: 'hire' | 'not_hire') => {
    setShowConfirmationModal(false);
    
    if (choice === 'hire') {
      // Show booking modal for immediate hire only
      setSelectedCaregiver({
        id: selectedReviewItem.caregiverId || '1',
        name: selectedReviewItem.caregiverName,
        avatar: selectedReviewItem.caregiverAvatar,
        hourlyRate: 150000, // Mock rate
        specialties: ['ChÄƒm sÃ³c ngÆ°á»i giÃ ', 'TÆ° váº¥n sá»©c khá»e'],
        experience: '5 nÄƒm',
        rating: 4.5,
        reviews: 120,
        location: 'Há»“ ChÃ­ Minh',
        isOnline: true,
        isVerified: true,
      });
      setShowBookingModal(true);
    } else {
      // Just show success message
      alert('ÄÃ¡nh giÃ¡ Ä‘Ã£ Ä‘Æ°á»£c gá»­i thÃ nh cÃ´ng!');
    }
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCaregiver(null);
  };

  const renderRatingStars = (currentRating: number, onPress: (rating: number) => void) => {
    return (
      <View style={styles.ratingStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={32}
              color={star <= currentRating ? '#ffd700' : '#ddd'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'app_performance': return 'Hiá»‡u suáº¥t á»©ng dá»¥ng';
      case 'ui_ux': return 'Giao diá»‡n ngÆ°á»i dÃ¹ng';
      case 'features': return 'TÃ­nh nÄƒng';
      case 'support': return 'Há»— trá»£';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'resolved': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Háº¿t háº¡n';
      case 'resolved': return 'ÄÃ£ giáº£i quyáº¿t';
      case 'rejected': return 'ÄÃ£ tá»« chá»‘i';
      default: return 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
    }
  };

  const renderVideoReview = ({ item }: { item: VideoConsultationReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.caregiverInfo}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {item.caregiverName ? item.caregiverName.split(' ').pop()?.charAt(0) : '?'}
            </ThemedText>
          </View>
          <View style={styles.caregiverDetails}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <ThemedText style={styles.videoDuration}>Thá»i lÆ°á»£ng: {item.duration} phÃºt</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.comment}>{item.comment}</ThemedText>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>ÄÃ£ xÃ¡c thá»±c</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderServiceReview = ({ item }: { item: ServiceReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.caregiverInfo}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {item.caregiverName ? item.caregiverName.split(' ').pop()?.charAt(0) : '?'}
            </ThemedText>
          </View>
          <View style={styles.caregiverDetails}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <ThemedText style={styles.caregiverRole}>Dá»‹ch vá»¥ chÄƒm sÃ³c</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.comment}>{item.comment}</ThemedText>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>ÄÃ£ xÃ¡c thá»±c</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSystemReview = ({ item }: { item: SystemReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.systemInfo}>
          <Ionicons name="settings" size={24} color="#FF8E53" />
          <View style={styles.systemDetails}>
            <ThemedText style={styles.systemCategory}>{getCategoryText(item.category)}</ThemedText>
            <ThemedText style={styles.systemDate}>{item.date}</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.comment}>{item.comment}</ThemedText>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>ÄÃ£ xÃ¡c thá»±c</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderComplaintReview = ({ item }: { item: ComplaintReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.complaintInfo}>
          <View style={styles.complaintIcon}>
            <Ionicons name="warning" size={24} color="#ff4757" />
          </View>
          <View style={styles.complaintDetails}>
            <ThemedText style={styles.complaintTitle}>Khiáº¿u náº¡i</ThemedText>
            <ThemedText style={styles.complaintCategory}>{item.category}</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>ÄÃ£ xÃ¡c thá»±c</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPendingReview = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        {item.type === 'video' && (
          <View style={styles.caregiverInfo}>
            <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
            <View style={styles.caregiverDetails}>
              <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
              <ThemedText style={styles.serviceInfo}>Video tÆ° váº¥n â€¢ {item.duration}</ThemedText>
            </View>
          </View>
        )}
        
        {item.type === 'service' && (
          <View style={styles.caregiverInfo}>
            <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
            <View style={styles.caregiverDetails}>
              <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
              <ThemedText style={styles.serviceInfo}>Dá»‹ch vá»¥ chÄƒm sÃ³c</ThemedText>
              <ThemedText style={styles.elderlyInfo}>{item.elderlyName} â€¢ {item.familyName}</ThemedText>
            </View>
          </View>
        )}
        
        {item.type === 'system' && (
          <View style={styles.systemInfo}>
            <View style={styles.systemIcon}>
              <Ionicons name="settings" size={24} color="#FF8E53" />
            </View>
            <View style={styles.systemDetails}>
              <ThemedText style={styles.systemTitle}>ÄÃ¡nh giÃ¡ há»‡ thá»‘ng</ThemedText>
              <ThemedText style={styles.systemCategory}>{item.category}</ThemedText>
            </View>
          </View>
        )}
        
        {item.type === 'complaint' && (
          <View style={styles.complaintInfo}>
            <View style={styles.complaintIcon}>
              <Ionicons name="warning" size={24} color="#ff4757" />
            </View>
            <View style={styles.complaintDetails}>
              <ThemedText style={styles.complaintTitle}>Khiáº¿u náº¡i</ThemedText>
              <ThemedText style={styles.complaintCategory}>{item.category}</ThemedText>
              <ThemedText style={styles.complaintPeople}>
                {item.complainantName} â†’ {item.accusedName}
              </ThemedText>
            </View>
          </View>
        )}
        
        <View style={styles.ratingContainer}>
          {item.isExpired ? (
            <View style={styles.expiredBadge}>
              <ThemedText style={styles.expiredText}>Háº¿t háº¡n</ThemedText>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => handleReviewPress(item)}
            >
              <ThemedText style={styles.reviewButtonText}>ÄÃ¡nh giÃ¡</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.serviceDate || item.date}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>ÄÃ¡nh giÃ¡</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Cháº¥t lÆ°á»£ng dá»‹ch vá»¥</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'video' && styles.tabActive]}
            onPress={() => setActiveTab('video')}
          >
            <Ionicons 
              name="videocam" 
              size={16} 
              color={activeTab === 'video' ? '#FF8E53' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'video' && styles.tabTextActive]}>
              Video tÆ° váº¥n ({videoReviews.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'service' && styles.tabActive]}
            onPress={() => setActiveTab('service')}
          >
            <Ionicons 
              name="medical" 
              size={16} 
              color={activeTab === 'service' ? '#FF8E53' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'service' && styles.tabTextActive]}>
              Dá»‹ch vá»¥ ({serviceReviews.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'system' && styles.tabActive]}
            onPress={() => setActiveTab('system')}
          >
            <Ionicons 
              name="settings" 
              size={16} 
              color={activeTab === 'system' ? '#FF8E53' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'system' && styles.tabTextActive]}>
              Há»‡ thá»‘ng ({systemReviews.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'complaint' && styles.tabActive]}
            onPress={() => setActiveTab('complaint')}
          >
            <Ionicons 
              name="warning" 
              size={16} 
              color={activeTab === 'complaint' ? '#FF8E53' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'complaint' && styles.tabTextActive]}>
              Khiáº¿u náº¡i ({complaintReviews.length})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'completed' && styles.subTabActive]}
            onPress={() => setActiveSubTab('completed')}
          >
            <ThemedText style={[styles.subTabText, activeSubTab === 'completed' && styles.subTabTextActive]}>
              ÄÃ£ Ä‘Ã¡nh giÃ¡
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'pending' && styles.subTabActive]}
            onPress={() => setActiveSubTab('pending')}
          >
            <ThemedText style={[styles.subTabText, activeSubTab === 'pending' && styles.subTabTextActive]}>
              Chá» Ä‘Ã¡nh giÃ¡
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeSubTab === 'completed' && (
          <>
            {activeTab === 'video' && (
              <FlatList
                data={videoReviews}
                renderItem={renderVideoReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
            {activeTab === 'service' && (
              <FlatList
                data={serviceReviews}
                renderItem={renderServiceReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
            {activeTab === 'system' && (
              <FlatList
                data={systemReviews}
                renderItem={renderSystemReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
            {activeTab === 'complaint' && (
              <FlatList
                data={complaintReviews}
                renderItem={renderComplaintReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
        
        {activeSubTab === 'pending' && (
          <FlatList
            data={pendingReviews.filter(item => item.type === activeTab)}
            renderItem={renderPendingReview}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowReviewModal(false)}
            >
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>ÄÃ¡nh giÃ¡</ThemedText>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Review Item Info */}
            <View style={styles.reviewItemInfo}>
              {selectedReviewItem?.type === 'video' && (
                <View style={styles.itemInfo}>
                  <Image source={{ uri: selectedReviewItem.caregiverAvatar }} style={styles.itemAvatar} />
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Video tÆ° váº¥n</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.caregiverName}</ThemedText>
                    <ThemedText style={styles.itemInfo}>{selectedReviewItem.duration}</ThemedText>
                  </View>
                </View>
              )}
              
              {selectedReviewItem?.type === 'service' && (
                <View style={styles.itemInfo}>
                  <Image source={{ uri: selectedReviewItem.caregiverAvatar }} style={styles.itemAvatar} />
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Dá»‹ch vá»¥ chÄƒm sÃ³c</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.caregiverName}</ThemedText>
                    <ThemedText style={styles.itemInfo}>{selectedReviewItem.elderlyName} â€¢ {selectedReviewItem.familyName}</ThemedText>
                  </View>
                </View>
              )}
              
              {selectedReviewItem?.type === 'system' && (
                <View style={styles.itemInfo}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="settings" size={24} color="#FF8E53" />
                  </View>
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>ÄÃ¡nh giÃ¡ há»‡ thá»‘ng</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.category}</ThemedText>
                  </View>
                </View>
              )}
              
              {selectedReviewItem?.type === 'complaint' && (
                <View style={styles.itemInfo}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="warning" size={24} color="#ff4757" />
                  </View>
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Khiáº¿u náº¡i</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.category}</ThemedText>
                    <ThemedText style={styles.itemInfo}>{selectedReviewItem.complainantName} â†’ {selectedReviewItem.accusedName}</ThemedText>
                  </View>
                </View>
              )}
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <ThemedText style={styles.ratingTitle}>ÄÃ¡nh giÃ¡ cá»§a báº¡n</ThemedText>
              {renderRatingStars(rating, setRating)}
              <ThemedText style={styles.ratingText}>
                {rating === 0 ? 'Chá»n sá»‘ sao' : 
                 rating === 1 ? 'Ráº¥t tá»‡' :
                 rating === 2 ? 'Tá»‡' :
                 rating === 3 ? 'BÃ¬nh thÆ°á»ng' :
                 rating === 4 ? 'Tá»‘t' : 'Ráº¥t tá»‘t'}
              </ThemedText>
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <ThemedText style={styles.commentTitle}>Nháº­n xÃ©t (tÃ¹y chá»n)</ThemedText>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sáº» tráº£i nghiá»‡m cá»§a báº¡n..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Image Upload Section */}
            <View style={styles.imageSection}>
              <ThemedText style={styles.imageSectionTitle}>áº¢nh Ä‘Ã­nh kÃ¨m (tÃ¹y chá»n)</ThemedText>
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={handleImagePicker}
              >
                <Ionicons name="camera-outline" size={20} color="#FF8E53" />
                <ThemedText style={styles.addImageButtonText}>Chá»n áº£nh hoáº·c chá»¥p áº£nh</ThemedText>
              </TouchableOpacity>
              
              {/* Image List */}
              {images.length > 0 && (
                <View style={styles.imageListContainer}>
                  {images.map((imageUri, index) => (
                    <View key={index} style={styles.imageItemContainer}>
                      <Image source={{ uri: imageUri }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={rating === 0}
            >
              <ThemedText style={[styles.submitButtonText, rating === 0 && styles.submitButtonTextDisabled]}>
                Gá»­i Ä‘Ã¡nh giÃ¡
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Chi tiáº¿t</ThemedText>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Detail Content based on type */}
            {selectedDetailItem && (
              <>
                {/* Video Consultation Detail */}
                {selectedDetailItem.type === 'video' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Image source={{ uri: selectedDetailItem.caregiverAvatar }} style={styles.detailAvatar} />
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Video tÆ° váº¥n</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.caregiverName}</ThemedText>
                        <ThemedText style={styles.detailText}>{selectedDetailItem.duration}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÆ°á»i chÄƒm sÃ³c:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.caregiverName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÃ y tÆ° váº¥n:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.serviceDate}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Giá» tÆ° váº¥n:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.time || '14:00 - 15:00'}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Thá»i lÆ°á»£ng:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.duration}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Tráº¡ng thÃ¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Háº¿t háº¡n' : 'CÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Service Detail */}
                {selectedDetailItem.type === 'service' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Image source={{ uri: selectedDetailItem.caregiverAvatar }} style={styles.detailAvatar} />
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Dá»‹ch vá»¥ chÄƒm sÃ³c</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.caregiverName}</ThemedText>
                        <ThemedText style={styles.detailText}>{selectedDetailItem.elderlyName} â€¢ {selectedDetailItem.familyName}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÆ°á»i chÄƒm sÃ³c:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.caregiverName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÆ°á»i thuÃª:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.familyName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÆ°á»i Ä‘Æ°á»£c chÄƒm sÃ³c:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.elderlyName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÃ y dá»‹ch vá»¥:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.serviceDate}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Giá» dá»‹ch vá»¥:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.time || '08:00 - 17:00'}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Thá»i lÆ°á»£ng:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.duration || '8 giá»'}</ThemedText>
                      </View>
                      
                      {/* Service Statistics */}
                      <View style={styles.statsSection}>
                        <ThemedText style={styles.statsTitle}>Thá»‘ng kÃª dá»‹ch vá»¥</ThemedText>
                        <View style={styles.statsGrid}>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>120</ThemedText>
                            <ThemedText style={styles.statLabel}>Tá»•ng giá» lÃ m</ThemedText>
                          </View>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>45</ThemedText>
                            <ThemedText style={styles.statLabel}>Task hoÃ n thÃ nh</ThemedText>
                          </View>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>5</ThemedText>
                            <ThemedText style={styles.statLabel}>Task chÆ°a hoÃ n thÃ nh</ThemedText>
                          </View>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>50</ThemedText>
                            <ThemedText style={styles.statLabel}>Tá»•ng task</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Tráº¡ng thÃ¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Háº¿t háº¡n' : 'CÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* System Detail */}
                {selectedDetailItem.type === 'system' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="settings" size={24} color="#FF8E53" />
                      </View>
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>ÄÃ¡nh giÃ¡ há»‡ thá»‘ng</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.category}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Danh má»¥c Ä‘Ã¡nh giÃ¡:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.category}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÃ y Ä‘Ã¡nh giÃ¡:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.date}</ThemedText>
                      </View>
                      
                      {/* System Evaluation */}
                      <View style={styles.evaluationSection}>
                        <ThemedText style={styles.evaluationTitle}>ÄÃ¡nh giÃ¡ há»‡ thá»‘ng</ThemedText>
                        <View style={styles.evaluationContent}>
                          <ThemedText style={styles.evaluationText}>
                            Há»‡ thá»‘ng hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh, giao diá»‡n thÃ¢n thiá»‡n vá»›i ngÆ°á»i dÃ¹ng. 
                            Tá»‘c Ä‘á»™ táº£i trang nhanh, tÃ­nh nÄƒng Ä‘áº§y Ä‘á»§ vÃ  dá»… sá»­ dá»¥ng.
                          </ThemedText>
                        </View>
                      </View>
                      
                      {/* Feedback Section */}
                      <View style={styles.feedbackSection}>
                        <ThemedText style={styles.feedbackTitle}>GÃ³p Ã½ cáº£i thiá»‡n</ThemedText>
                        <View style={styles.feedbackContent}>
                          <ThemedText style={styles.feedbackText}>
                            â€¢ Cáº£i thiá»‡n tá»‘c Ä‘á»™ pháº£n há»“i cá»§a há»‡ thá»‘ng{'\n'}
                            â€¢ ThÃªm tÃ­nh nÄƒng thÃ´ng bÃ¡o push{'\n'}
                            â€¢ Tá»‘i Æ°u hÃ³a giao diá»‡n trÃªn mobile{'\n'}
                            â€¢ ThÃªm tÃ­nh nÄƒng backup dá»¯ liá»‡u
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Tráº¡ng thÃ¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Háº¿t háº¡n' : 'CÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Complaint Detail */}
                {selectedDetailItem.type === 'complaint' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="warning" size={24} color="#ff4757" />
                      </View>
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Khiáº¿u náº¡i</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.category}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÆ°á»i khiáº¿u náº¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.complainantName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÆ°á»i bá»‹ khiáº¿u náº¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.accusedName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Danh má»¥c:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.category}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÃ y khiáº¿u náº¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.date}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Thá»i gian:</ThemedText>
                        <ThemedText style={styles.detailValue}>14:30</ThemedText>
                      </View>
                      
                      {/* Admin Information */}
                      <View style={styles.adminSection}>
                        <ThemedText style={styles.adminTitle}>ThÃ´ng tin Admin xá»­ lÃ½</ThemedText>
                        <View style={styles.adminInfo}>
                          <View style={styles.adminAvatar}>
                            <ThemedText style={styles.adminAvatarText}>A</ThemedText>
                          </View>
                          <View style={styles.adminDetails}>
                            <ThemedText style={styles.adminName}>Admin LÃª</ThemedText>
                            <ThemedText style={styles.adminRole}>Quáº£n trá»‹ viÃªn há»‡ thá»‘ng</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      {/* Complaint Details */}
                      <View style={styles.complaintDetailsSection}>
                        <ThemedText style={styles.complaintDetailsTitle}>Chi tiáº¿t khiáº¿u náº¡i</ThemedText>
                        <View style={styles.complaintDetailsContent}>
                          <ThemedText style={styles.complaintDetailsText}>
                            NgÆ°á»i chÄƒm sÃ³c cÃ³ thÃ¡i Ä‘á»™ khÃ´ng tá»‘t, khÃ´ng tuÃ¢n thá»§ quy trÃ¬nh chÄƒm sÃ³c 
                            vÃ  cÃ³ hÃ nh vi thiáº¿u tÃ´n trá»ng vá»›i ngÆ°á»i giÃ . Cáº§n xem xÃ©t vÃ  xá»­ lÃ½ nghiÃªm kháº¯c.
                          </ThemedText>
                        </View>
                      </View>
                      
                      {/* Decision */}
                      <View style={styles.decisionSection}>
                        <ThemedText style={styles.decisionTitle}>Quyáº¿t Ä‘á»‹nh xá»­ lÃ½</ThemedText>
                        <View style={styles.decisionContent}>
                          <View style={styles.decisionStatus}>
                            <View style={[styles.statusBadge, { backgroundColor: '#2ed573' }]}>
                              <ThemedText style={styles.statusText}>ÄÃ£ giáº£i quyáº¿t</ThemedText>
                            </View>
                          </View>
                          <ThemedText style={styles.decisionText}>
                            ÄÃ£ tiáº¿n hÃ nh cáº£nh cÃ¡o vÃ  yÃªu cáº§u ngÆ°á»i chÄƒm sÃ³c cáº£i thiá»‡n thÃ¡i Ä‘á»™. 
                            Sáº½ theo dÃµi vÃ  Ä‘Ã¡nh giÃ¡ láº¡i trong 30 ngÃ y tá»›i.
                          </ThemedText>
                          <View style={styles.decisionDate}>
                            <ThemedText style={styles.decisionDateText}>NgÃ y quyáº¿t Ä‘á»‹nh: 15/01/2024</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Tráº¡ng thÃ¡i:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Háº¿t háº¡n' : 'CÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Completed Review Detail */}
                {!selectedDetailItem.type && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailAvatar}>
                        <ThemedText style={styles.detailAvatarText}>
                          {selectedDetailItem.caregiverName ? selectedDetailItem.caregiverName.split(' ').pop()?.charAt(0) : '?'}
                        </ThemedText>
                      </View>
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>
                          {selectedDetailItem.caregiverName || 'ÄÃ¡nh giÃ¡ há»‡ thá»‘ng'}
                        </ThemedText>
                        <ThemedText style={styles.detailSubtitle}>
                          {selectedDetailItem.category ? getCategoryText(selectedDetailItem.category) : 'ÄÃ¡nh giÃ¡ Ä‘Ã£ hoÃ n thÃ nh'}
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      {/* Service Information */}
                      {selectedDetailItem.caregiverName && (
                        <>
                          <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>NgÆ°á»i chÄƒm sÃ³c:</ThemedText>
                            <ThemedText style={styles.detailValue}>{selectedDetailItem.caregiverName}</ThemedText>
                          </View>
                          {selectedDetailItem.familyName && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>NgÆ°á»i thuÃª:</ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.familyName}</ThemedText>
                            </View>
                          )}
                          {selectedDetailItem.elderlyName && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>NgÆ°á»i Ä‘Æ°á»£c chÄƒm sÃ³c:</ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.elderlyName}</ThemedText>
                            </View>
                          )}
                          <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>
                              {selectedDetailItem.type === 'video' ? 'NgÃ y tÆ° váº¥n:' : 'NgÃ y dá»‹ch vá»¥:'}
                            </ThemedText>
                            <ThemedText style={styles.detailValue}>{selectedDetailItem.serviceDate || selectedDetailItem.date}</ThemedText>
                          </View>
                          {selectedDetailItem.time && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>
                                {selectedDetailItem.type === 'video' ? 'Giá» tÆ° váº¥n:' : 'Giá» dá»‹ch vá»¥:'}
                              </ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.time}</ThemedText>
                            </View>
                          )}
                          {selectedDetailItem.duration && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>Thá»i lÆ°á»£ng:</ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.duration}</ThemedText>
                            </View>
                          )}
                          
                          {/* Service Statistics for Service Reviews */}
                          {(selectedDetailItem.type === 'service' || (selectedDetailItem.familyName && selectedDetailItem.elderlyName)) && (
                            <View style={styles.statsSection}>
                              <ThemedText style={styles.statsTitle}>Thá»‘ng kÃª dá»‹ch vá»¥</ThemedText>
                              <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.totalHours || 120}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Tá»•ng giá» lÃ m</ThemedText>
                                </View>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.completedTasks || 45}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Task hoÃ n thÃ nh</ThemedText>
                                </View>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.pendingTasks || 5}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Task chÆ°a hoÃ n thÃ nh</ThemedText>
                                </View>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.totalTasks || 50}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Tá»•ng task</ThemedText>
                                </View>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>ÄÃ¡nh giÃ¡:</ThemedText>
                        <View style={styles.detailRating}>
                          {renderStars(selectedDetailItem.rating)}
                          <ThemedText style={styles.detailRatingText}>{selectedDetailItem.rating}/5</ThemedText>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Nháº­n xÃ©t:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.comment}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>NgÃ y Ä‘Ã¡nh giÃ¡:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.date}</ThemedText>
                      </View>
                      {selectedDetailItem.isVerified && (
                        <View style={styles.detailRow}>
                          <ThemedText style={styles.detailLabel}>Tráº¡ng thÃ¡i:</ThemedText>
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                            <ThemedText style={styles.verifiedText}>ÄÃ£ xÃ¡c thá»±c</ThemedText>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowConfirmationModal(false)}
            >
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>XÃ¡c nháº­n Ä‘Ã¡nh giÃ¡</ThemedText>
            <View style={styles.modalPlaceholder} />
          </View>

          <View style={styles.confirmationContent}>
            <View style={styles.confirmationStars}>
              {renderStars(rating)}
            </View>
            
            <ThemedText style={styles.confirmationTitle}>
              Báº¡n Ä‘Ã¡nh giÃ¡ ngÆ°á»i nÃ y {rating} sao
            </ThemedText>
            
            <ThemedText style={styles.confirmationQuestion}>
              Váº­y báº¡n cÃ³ muá»‘n tiáº¿p tá»¥c thuÃª ngÆ°á»i nÃ y khÃ´ng?
            </ThemedText>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.confirmationButton}
                onPress={() => handleConfirmationChoice('not_hire')}
              >
                <ThemedText style={styles.confirmationButtonText}>
                  Gá»­i Ä‘Ã¡nh giÃ¡ vÃ  khÃ´ng thuÃª
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.confirmationButton, styles.confirmationButtonPrimary]}
                onPress={() => handleConfirmationChoice('hire')}
              >
                <ThemedText style={[styles.confirmationButtonText, styles.confirmationButtonTextPrimary]}>
                  Gá»­i Ä‘Ã¡nh giÃ¡ vÃ  thuÃª
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Booking Modal */}
      {selectedCaregiver && (
        <BookingModal
          visible={showBookingModal}
          onClose={handleCloseBookingModal}
          caregiver={selectedCaregiver}
          elderlyProfiles={elderlyProfiles}
          immediateOnly={true} // Only show immediate hire option
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#FF8E53',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
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
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF8E53',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF8E53',
    fontWeight: '600',
  },
  // Sub Tabs Styles
  subTabsContainer: {
    backgroundColor: 'white',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  subTabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subTabActive: {
    backgroundColor: '#FF8E53',
    borderColor: '#FF8E53',
  },
  subTabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  subTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caregiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF8E53',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  elderlyName: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  familyName: {
    fontSize: 12,
    color: '#6c757d',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  comment: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#2ed573',
    fontWeight: '500',
  },
  // New styles for different review types
  videoDuration: {
    fontSize: 12,
    color: '#FF8E53',
    fontWeight: '500',
  },
  serviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemDetails: {
    marginLeft: 12,
  },
  systemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  systemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  complaintHeader: {
    marginBottom: 16,
  },
  complaintInfo: {
    marginBottom: 12,
  },
  complaintPeople: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8E53',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  personAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  personRole: {
    fontSize: 12,
    color: '#6c757d',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  adminAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8E53',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  adminAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 10,
    color: '#6c757d',
  },
  complaintStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  complaintDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  complaintCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  complaintDateTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  // Pending Reviews Styles
  pendingSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  pendingSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  pendingListContainer: {
    gap: 12,
  },
  pendingReviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caregiverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  serviceInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  elderlyInfo: {
    fontSize: 12,
    color: '#95a5a6',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  systemDetails: {
    flex: 1,
  },
  systemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  systemCategory: {
    fontSize: 14,
    color: '#6c757d',
  },
  complaintInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  complaintIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  complaintDetails: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  complaintCategory: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  complaintPeople: {
    fontSize: 12,
    color: '#95a5a6',
  },
  pendingStatus: {
    alignItems: 'flex-end',
  },
  serviceDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  expiredBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expiredText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#FF8E53',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  // Review Item Info Styles
  reviewItemInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#FF8E53',
    fontWeight: '500',
    marginBottom: 2,
  },
  // Rating Styles
  ratingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 16,
    color: '#FF8E53',
    fontWeight: '500',
  },
  // Comment Styles
  commentSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    minHeight: 100,
  },
  // Image Upload Styles
  imageSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF8E53',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F0FDFB',
    gap: 8,
  },
  addImageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8E53',
  },
  imageListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  imageItemContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  // Submit Button Styles
  submitButton: {
    backgroundColor: '#FF8E53',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ddd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  // Detail Modal Styles
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  detailIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#FF8E53',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
  },
  detailContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRatingText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  // Stats Section Styles
  statsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8E53',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  // Evaluation Section Styles
  evaluationSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  evaluationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  evaluationContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  evaluationText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  // Feedback Section Styles
  feedbackSection: {
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  feedbackContent: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB84D',
  },
  feedbackText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  // Admin Section Styles
  adminSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8E53',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 12,
    color: '#6c757d',
  },
  // Complaint Details Section Styles
  complaintDetailsSection: {
    marginTop: 16,
  },
  complaintDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  complaintDetailsContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  complaintDetailsText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  // Decision Section Styles
  decisionSection: {
    marginTop: 16,
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  decisionContent: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA07A',
  },
  decisionStatus: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  decisionText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
    marginBottom: 8,
  },
  decisionDate: {
    alignItems: 'flex-end',
  },
  decisionDateText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  // Confirmation Modal Styles
  confirmationContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationStars: {
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmationQuestion: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  confirmationButtons: {
    width: '100%',
    gap: 16,
  },
  confirmationButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmationButtonPrimary: {
    backgroundColor: '#FF8E53',
    borderColor: '#FF8E53',
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  confirmationButtonTextPrimary: {
    color: 'white',
  },
});
