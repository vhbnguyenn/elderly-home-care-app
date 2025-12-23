import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';

interface CaregiverDetail {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  age: number;
  gender: 'male' | 'female';
  specialties: string[];
  description: string;
  education: string[];
  certifications: string[];
  languages: string[];
  experience: string;
  location: string;
  phone: string;
  email: string;
  reviews: Review[];
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export default function CaregiverDetailScreen() {
  const [selectedTab, setSelectedTab] = useState<'info' | 'reviews'>('info');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { id } = useLocalSearchParams();

  // TODO: Replace with real API data from elderly service
  const elderlyProfiles: any[] = [];

  // TODO: Replace with real API data from caregiver service
  const caregiverMap: { [key: string]: CaregiverDetail } = {
    // Mock data removed - TODO: fetch from API by id
  };

  const caregiver = caregiverMap[id as string] || caregiverMap['1'];

  const handleBook = () => {
    setShowBookingModal(true);
  };

  const handleCall = () => {
    console.log('handleCall clicked', caregiver.name);
    try {
      router.push({
        pathname: '/careseeker/video-call',
        params: {
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
        }
      });
    } catch (error) {
      console.error('Error opening video call:', error);
      Alert.alert('Lá»—i', 'KhÃ´ng thá»ƒ thá»±c hiá»‡n cuá»™c gá»i');
    }
  };

  const handleChat = () => {
    console.log('handleChat clicked', caregiver.id, caregiver.name);
    try {
      router.push({
        pathname: '/careseeker/chat',
        params: {
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
        }
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Alert.alert('Lá»—i', 'KhÃ´ng thá»ƒ má»Ÿ trang chat');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.reviewAvatarPlaceholder}>
            <ThemedText style={styles.reviewAvatarText}>
              {review.userName.charAt(0)}
            </ThemedText>
          </View>
          <View style={styles.reviewUserInfo}>
            <ThemedText style={styles.reviewUserName}>{review.userName}</ThemedText>
            <View style={styles.reviewRating}>
              {renderStars(review.rating)}
            </View>
          </View>
        </View>
        <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
      </View>
      <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Chi tiáº¿t ngÆ°á»i chÄƒm sÃ³c</ThemedText>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: caregiver.avatar }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.caregiverName}>{caregiver.name}, {caregiver.age}</ThemedText>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {renderStars(caregiver.rating)}
              </View>
              <ThemedText style={styles.ratingText}>
                {caregiver.rating} ({caregiver.reviews.length} Ä‘Ã¡nh giÃ¡)
              </ThemedText>
            </View>
            <ThemedText style={styles.experience}>{caregiver.experience}</ThemedText>
            <ThemedText style={styles.location}>ðŸ“ {caregiver.location}</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.chatButton} 
            onPress={handleChat}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#68C2E8" />
            <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={20} color="white" />
            <ThemedText style={styles.callButtonText}>Gá»i</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBook}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <ThemedText style={styles.bookButtonText}>Äáº·t lá»‹ch</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'info' && styles.activeTab]}
            onPress={() => setSelectedTab('info')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'info' && styles.activeTabText]}>
              ThÃ´ng tin
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
            onPress={() => setSelectedTab('reviews')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>
              ÄÃ¡nh giÃ¡ ({caregiver.reviews.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'info' ? (
          <View style={styles.infoContent}>
            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Giá»›i thiá»‡u</ThemedText>
              <ThemedText style={styles.sectionContent}>{caregiver.description}</ThemedText>
            </View>

            {/* Specialties */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>ChuyÃªn mÃ´n</ThemedText>
              <View style={styles.specialtiesContainer}>
                {caregiver.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <ThemedText style={styles.specialtyText}>{specialty}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Education */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Há»c váº¥n</ThemedText>
              {caregiver.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <Ionicons name="school-outline" size={16} color="#68C2E8" />
                  <ThemedText style={styles.educationText}>{edu}</ThemedText>
                </View>
              ))}
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Chá»©ng chá»‰</ThemedText>
              {caregiver.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <Ionicons name="ribbon-outline" size={16} color="#68C2E8" />
                  <ThemedText style={styles.certificationText}>{cert}</ThemedText>
                </View>
              ))}
            </View>

            {/* Languages */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>NgÃ´n ngá»¯</ThemedText>
              <View style={styles.languagesContainer}>
                {caregiver.languages.map((lang, index) => (
                  <View key={index} style={styles.languageTag}>
                    <ThemedText style={styles.languageText}>{lang}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>LiÃªn há»‡</ThemedText>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={16} color="#68C2E8" />
                <ThemedText style={styles.contactText}>{caregiver.phone}</ThemedText>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={16} color="#68C2E8" />
                <ThemedText style={styles.contactText}>{caregiver.email}</ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            {caregiver.reviews.map(renderReview)}
          </View>
        )}
      </ScrollView>
      
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        caregiver={caregiver as any}
        elderlyProfiles={elderlyProfiles}
        immediateOnly={true}
      />

      <SimpleNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9ecef',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#28a745',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  experience: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#68C2E8',
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#68C2E8',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#68C2E8',
  },
  infoContent: {
    backgroundColor: 'white',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#e6f4fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  specialtyText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  educationText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  certificationText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageTag: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  languageText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  reviewsContent: {
    backgroundColor: 'white',
    paddingBottom: 100,
  },
  reviewItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  reviewComment: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});

