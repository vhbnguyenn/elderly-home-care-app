import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';

import { EmergencyAlert } from '@/components/alerts/EmergencyAlert';
import { BookingModal } from '@/components/caregiver/BookingModal';
import { ElderlyProfiles } from '@/components/elderly/ElderlyProfiles';
import { RequestNotification } from '@/components/notifications/RequestNotification';
import { AppointmentScheduleToday } from '@/components/schedule/AppointmentScheduleToday';
import { ThemedText } from '@/components/themed-text';
import { AddElderlyModal } from '@/components/ui/AddElderlyModal';
import { CustomModal } from '@/components/ui/CustomModal';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { caregiverService, CaregiverProfile } from '@/services/caregiver.service';
import { ElderlyAPI, ElderlyProfile } from '@/services/api/elderly.api';
import { BookingAPI, Booking } from '@/services/api/booking.api';
import { groqMatchingService, GroqMatchRequest } from '@/services/groq-matching.service';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { emergencyAlertVisible, hideEmergencyAlert } = useNotification();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAddElderlyModal, setShowAddElderlyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Real data states
  const [recommendedCaregivers, setRecommendedCaregivers] = useState<CaregiverProfile[]>([]);
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(true);
  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfile[]>([]);
  const [isLoadingElderly, setIsLoadingElderly] = useState(true);
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState(false);
  const requestCount = 0;
  const showRequestNotification = false;
  
  const emergencyAlert = {
    caregiverName: 'Nguyễn Văn A',
    elderlyName: 'Bà Nguyễn Thị B',
    timestamp: new Date().toISOString(),
    location: '123 Đường ABC, Quận 1, TP.HCM',
    message: 'Người già có dấu hiệu khó thở, cần hỗ trợ y tế ngay lập tức!'
  };


  // Fetch recommended caregivers using AI matching
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setIsLoadingCaregivers(true);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:72',message:'fetchCaregivers started',data:{isLoadingElderly,elderlyProfilesCount:elderlyProfiles.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
        // #endregion
        
        // Wait for elderly profiles to load first
        if (isLoadingElderly) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:77',message:'Still loading elderly, skip',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
          // #endregion
          return;
        }

        // TEMPORARY: Disable Groq AI, use getAllCaregivers directly
        // TODO: Enable this when backend Groq AI endpoint is ready
        console.log('[Dashboard] 📋 Using getAllCaregivers (Groq AI disabled temporarily)');
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:82',message:'Calling getAllCaregivers',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6,H7'})}).catch(()=>{});
        // #endregion
        
        const caregivers = await caregiverService.getAllCaregivers();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:88',message:'getAllCaregivers response',data:{caregiversType:typeof caregivers,isArray:Array.isArray(caregivers),caregiversLength:caregivers?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
        // #endregion
        setRecommendedCaregivers(caregivers);

        /* GROQ AI CODE - Enable when backend is ready:
        
        // If user has elderly profiles, use Groq AI matching
        if (elderlyProfiles.length > 0) {
          const firstElderly = elderlyProfiles[0]; // Use first elderly profile for matching
          
          console.log('[Dashboard] 🤖 Using Groq AI matching with elderly profile:', firstElderly.name);
          
          // Build Groq match request
          const matchRequest: GroqMatchRequest = {
            seeker_name: user?.name || 'User',
            care_level: firstElderly.health_status === 'good' ? 1 : firstElderly.health_status === 'fair' ? 2 : 3,
            health_status: firstElderly.health_status || 'unknown',
            elderly_age: firstElderly.age || 70,
            caregiver_age_range: null,
            gender_preference: firstElderly.gender_preference || null,
            required_years_experience: null,
            overall_rating_range: [4.0, 5.0],
            personality: [],
            attitude: [],
            skills: {
              required_skills: firstElderly.required_skills || [],
              priority_skills: [],
            },
            time_slots: [],
            location: {
              lat: firstElderly.location?.coordinates?.[1] || 0,
              lon: firstElderly.location?.coordinates?.[0] || 0,
              address: firstElderly.address || '',
            },
            budget_per_hour: 50000,
            top_n: 10,
          };

          // Call Groq AI matching API
          const matchResponse = await groqMatchingService.findCaregivers(matchRequest);
          
          console.log('[Dashboard] ✅ Groq AI matching success:', matchResponse.matched_caregivers.length, 'caregivers');
          
          // Transform match response to CaregiverProfile format
          const matchedCaregivers: CaregiverProfile[] = matchResponse.matched_caregivers.map((rec) => ({
            id: rec.caregiver_id,
            user_id: rec.caregiver_id,
            personal_info: {
              full_name: rec.name,
              age: rec.age,
              gender: rec.gender,
              avatar_url: rec.avatar,
            },
            skills: rec.skills || [],
            specialties: rec.specialties || [],
            rating: {
              average_score: rec.rating || 0,
              total_reviews: rec.total_reviews || 0,
            },
            experience: {
              years_of_experience: rec.years_experience || 0,
            },
            pricing: {
              hourly_rate: rec.price_per_hour || 0,
            },
            availability: {
              is_available: true,
            },
            match_score: rec.match_score,
            match_percentage: rec.match_percentage,
          }));
          
          setRecommendedCaregivers(matchedCaregivers);
        } else {
          // No elderly profiles, fallback to getAllCaregivers
          console.log('[Dashboard] No elderly profiles, using getAllCaregivers');
          const caregivers = await caregiverService.getAllCaregivers();
          setRecommendedCaregivers(caregivers);
        }
        */
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:169',message:'Error in fetchCaregivers',data:{error:String(error),errorMessage:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6,H7,H8'})}).catch(()=>{});
        // #endregion
        console.log('[Dashboard] Error fetching caregivers:', error);
        // Fallback to getAllCaregivers on error
        try {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:173',message:'Trying fallback getAllCaregivers',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6,H7'})}).catch(()=>{});
          // #endregion
          const caregivers = await caregiverService.getAllCaregivers();
          setRecommendedCaregivers(caregivers);
        } catch (fallbackError) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:179',message:'Fallback also failed',data:{fallbackError:String(fallbackError),errorMessage:fallbackError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6,H7,H8'})}).catch(()=>{});
          // #endregion
          console.log('[Dashboard] Fallback also failed:', fallbackError);
          setRecommendedCaregivers([]);
        }
      } finally {
        setIsLoadingCaregivers(false);
      }
    };

    fetchCaregivers();
  }, [elderlyProfiles, isLoadingElderly, user]);

  // Fetch elderly profiles from API
  useEffect(() => {
    const fetchElderly = async () => {
      try {
        setIsLoadingElderly(true);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:190',message:'fetchElderly started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3'})}).catch(()=>{});
        // #endregion
        console.log('[Dashboard] 📞 Fetching elderly profiles from /api/elderly...');
        const profiles = await ElderlyAPI.getAll();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:195',message:'API returned profiles',data:{profilesType:typeof profiles,isArray:Array.isArray(profiles),profilesValue:profiles,profilesLength:profiles?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H4'})}).catch(()=>{});
        // #endregion
        console.log('[Dashboard] ✅ Elderly profiles loaded:', profiles.length, 'profiles');
        console.log('[Dashboard] 📋 Profiles data:', profiles);
        setElderlyProfiles(profiles);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:197',message:'State set with profiles',data:{profilesSet:profiles},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:200',message:'Error fetching elderly',data:{error:String(error),errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        console.log('[Dashboard] ❌ Error fetching elderly profiles:', error);
        setElderlyProfiles([]);
      } finally {
        setIsLoadingElderly(false);
      }
    };

    fetchElderly();
  }, []);

  // Check if user is new (no elderly profiles) and show welcome tutorial
  useEffect(() => {
    if (!isLoadingElderly && !isLoadingAppointments && elderlyProfiles.length === 0 && appointments.length === 0 && user?.name) {
      setShowWelcomeTutorial(true);
    }
  }, [isLoadingElderly, isLoadingAppointments, elderlyProfiles.length, appointments.length, user]);

  // Fetch appointments (bookings) from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        const response = await BookingAPI.getCareseekerBookings();
        
        // Filter only today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayAppointments = response.data.filter((booking: Booking) => {
          const bookingDate = new Date(booking.startDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        });
        
        // Map Booking to Appointment format for component
        const mappedAppointments = todayAppointments.map((booking: Booking) => {
          // Format time slot
          const startTime = new Date(booking.startDate);
          const endTime = new Date(booking.endDate);
          const timeSlot = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`;
          
          // Map status
          let status: 'completed' | 'upcoming' | 'in-progress' = 'upcoming';
          if (booking.status === 'completed') status = 'completed';
          else if (booking.status === 'in_progress') status = 'in-progress';
          
          return {
            id: booking.id || '',
            caregiverName: booking.caregiver?.fullName || 'Người chăm sóc',
            caregiverAvatar: booking.caregiver?.avatar || '',
            timeSlot: timeSlot,
            status: status,
            tasks: [], // Tasks can be added later if needed
            address: `${booking.address}, ${booking.district}, ${booking.city}`,
            rating: booking.caregiver?.rating || 0,
            isVerified: true, // Assume verified for now
          };
        });
        
        console.log('[Dashboard] ✅ Today appointments loaded:', mappedAppointments.length);
        setAppointments(mappedAppointments);
      } catch (error) {
        console.log('[Dashboard] Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  // Real notifications - for now empty array until notification API is ready
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleBookPress = (caregiver: any) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  const handleProfilePress = () => {
    setShowProfileModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowProfileModal(false);
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowProfileModal(false);
      setShowLogoutModal(false);
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };


  return (
    <View style={styles.container}>
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

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.avatarButton} onPress={handleProfilePress}>
              <LinearGradient
                colors={['#FF6B35', '#FF8E53']}
                style={styles.userAvatar}
              >
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Xin chào!</Text>
              <Text style={styles.userName}>
                {user?.name || user?.email?.split('@')[0] || 'Người dùng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Emergency Alert */}
          {emergencyAlertVisible && (
            <View style={styles.emergencyContainer}>
              <EmergencyAlert 
                alert={emergencyAlert}
                visible={emergencyAlertVisible}
                onDismiss={hideEmergencyAlert}
              />
            </View>
          )}

          {/* Request Notification */}
          {showRequestNotification && requestCount > 0 && (
            <View style={styles.requestNotificationContainer}>
              <RequestNotification 
                requestCount={requestCount} 
                visible={showRequestNotification} 
              />
            </View>
          )}

          {/* AI Recommended Caregivers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWithBadge}>
                <Text style={styles.sectionTitle}>Gợi ý phù hợp</Text>
                {elderlyProfiles.length > 0 && (
                  <View style={styles.aiPoweredBadge}>
                    <Ionicons name="sparkles" size={12} color="#3B82F6" />
                    <Text style={styles.aiPoweredText}>AI</Text>
                  </View>
                )}
              </View>
              {recommendedCaregivers.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/careseeker/caregiver-search')}>
                  <Text style={styles.seeAllText}>Xem tất cả →</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isLoadingCaregivers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : elderlyProfiles.length === 0 ? (
              <View style={styles.emptyCaregiverContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="sparkles-outline" size={56} color="#FF6B35" />
                </View>
                <Text style={styles.emptyTitle}>Thêm người thân để nhận gợi ý AI</Text>
                <Text style={styles.emptyDescription}>
                  Hãy thêm hồ sơ người thân của bạn. AI sẽ phân tích và tự động gợi ý những người chăm sóc phù hợp nhất dựa trên:
                </Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Tình trạng sức khỏe và tuổi tác</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Kỹ năng và kinh nghiệm cần thiết</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Vị trí và sở thích cá nhân</Text>
                  </View>
                </View>
                <View style={styles.emptyActionsRow}>
                  <TouchableOpacity 
                    style={styles.emptyActionButtonPrimary}
                    onPress={() => router.push('/careseeker/add-elderly')}
                  >
                    <LinearGradient
                      colors={['#FF6B35', '#FF8E53']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.emptyActionGradient}
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                      <Text style={styles.emptyActionTextPrimary}>Thêm hồ sơ ngay</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.emptyActionButton}
                    onPress={() => router.push('/careseeker/caregiver-search')}
                  >
                    <Text style={styles.emptyActionText}>Khám phá tất cả</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : recommendedCaregivers.length === 0 ? (
              <View style={styles.emptyCaregiverContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="people-outline" size={56} color="#FF6B35" />
                </View>
                <Text style={styles.emptyTitle}>Đang tìm kiếm người phù hợp</Text>
                <Text style={styles.emptyDescription}>
                  AI đang phân tích để tìm những người chăm sóc tốt nhất cho người thân của bạn
                </Text>
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={() => router.push('/careseeker/caregiver-search')}
                >
                  <Text style={styles.emptyActionText}>Xem tất cả người chăm sóc</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FF6B35" />
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.caregiverScroll}
              >
                {recommendedCaregivers.map((caregiver) => (
                  <View key={caregiver.id} style={styles.caregiverCard}>
                    <View style={styles.caregiverImageContainer}>
                      <Image 
                        source={{ uri: caregiver.personal_info?.avatar_url || 'https://via.placeholder.com/150' }} 
                        style={styles.caregiverImage}
                      />
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>
                          {caregiver.rating?.average_score?.toFixed(1) || '5.0'} ★
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.caregiverName}>
                      {caregiver.personal_info?.full_name || 'N/A'}, {caregiver.personal_info?.age || ''}
                    </Text>
                    
                    <View style={styles.specialtyContainer}>
                      {(caregiver.specialties || caregiver.skills || []).slice(0, 2).map((specialty, index) => (
                        <View key={index} style={styles.specialtyTag}>
                          <Text style={styles.specialtyText} numberOfLines={1}>
                            {specialty}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.bookButton}
                      onPress={() => handleBookPress(caregiver)}
                    >
                      <LinearGradient
                        colors={['#FF6B35', '#FF8E53']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bookButtonGradient}
                      >
                        <Ionicons name="calendar" size={16} color="#FFFFFF" />
                        <Text style={styles.bookButtonText}>Đặt lịch</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Elderly Profiles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hồ sơ người thân</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => router.push('/careseeker/add-elderly')}
                >
                  <Ionicons name="add-circle" size={24} color="#FF6B35" />
                </TouchableOpacity>
                {elderlyProfiles.length > 0 && (
                  <TouchableOpacity onPress={() => router.push('/careseeker/elderly-list')}>
                    <Text style={styles.seeAllText}>Xem tất cả →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {(() => {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:555',message:'Render elderly section',data:{isLoading:isLoadingElderly,profilesType:typeof elderlyProfiles,isArray:Array.isArray(elderlyProfiles),profilesLength:elderlyProfiles?.length,profilesValue:elderlyProfiles},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4,H5'})}).catch(()=>{});
              // #endregion
              console.log('[Dashboard] 🔍 Elderly state:', {
                isLoading: isLoadingElderly,
                count: elderlyProfiles?.length,
                profiles: elderlyProfiles
              });
              return null;
            })()}
            
            {isLoadingElderly ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
              </View>
            ) : elderlyProfiles.length === 0 ? (
              <View style={styles.emptyElderlyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="people-outline" size={56} color="#FF6B35" />
                </View>
                <Text style={styles.emptyTitle}>Bắt đầu bằng việc thêm người thân</Text>
                <Text style={styles.emptyDescription}>
                  Thêm thông tin người thân cần chăm sóc để chúng tôi giúp bạn tìm người chăm sóc phù hợp nhất
                </Text>
                <TouchableOpacity 
                  style={styles.addElderlyButton}
                  onPress={() => router.push('/careseeker/add-elderly')}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FF8E53']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addElderlyButtonGradient}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.addElderlyButtonText}>Thêm người thân</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.elderlyScrollView}
              >
                {elderlyProfiles.map((profile) => (
                  <TouchableOpacity
                    key={profile.id}
                    style={styles.elderlyCard}
                    onPress={() => router.push({
                      pathname: '/careseeker/elderly-detail',
                      params: { profileId: profile.id }
                    })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.elderlyImageContainer}>
                      <View style={[
                        styles.elderlyAvatar,
                        { backgroundColor: profile.gender === 'female' ? '#E91E63' : '#2196F3' }
                      ]}>
                        <Text style={styles.elderlyAvatarText}>
                          {profile.fullName?.split(' ').pop()?.charAt(0) || '?'}
                        </Text>
                      </View>
                      <View style={[
                        styles.genderBadge,
                        { backgroundColor: profile.gender === 'female' ? '#E91E63' : '#2196F3' }
                      ]}>
                        <Ionicons 
                          name={profile.gender === 'female' ? 'female' : 'male'} 
                          size={12} 
                          color="#FFFFFF" 
                        />
                      </View>
                    </View>
                    
                    <View style={styles.elderlyInfo}>
                      <Text style={styles.elderlyName}>{profile.fullName}</Text>
                      <Text style={styles.elderlyAge}>
                        {profile.dateOfBirth ? `${new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} tuổi` : 'N/A'}
                      </Text>
                      
                      <View style={styles.elderlyHealthContainer}>
                        <View style={[
                          styles.elderlyHealthDot,
                          { backgroundColor: profile.mobilityLevel === 'independent' ? '#27AE60' : '#F39C12' }
                        ]} />
                        <Text style={[
                          styles.elderlyHealthText,
                          { color: profile.mobilityLevel === 'independent' ? '#27AE60' : '#F39C12' }
                        ]}>
                          {profile.mobilityLevel === 'independent' ? 'Độc lập' : 'Cần hỗ trợ'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Appointments Today */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch hẹn hôm nay</Text>
            </View>
            
            {(() => {
              console.log('[Dashboard] 🔍 Appointments state:', {
                isLoading: isLoadingAppointments,
                count: appointments.length,
                appointments: appointments
              });
              return null;
            })()}
            
            {isLoadingAppointments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Đang tải lịch hẹn...</Text>
              </View>
            ) : appointments.length === 0 ? (
              <View style={styles.emptyAppointmentContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="calendar-outline" size={56} color="#FF6B35" />
                </View>
                <Text style={styles.emptyTitle}>Hôm nay chưa có lịch hẹn nào</Text>
                <Text style={styles.emptyDescription}>
                  Bạn có muốn đặt lịch với người chăm sóc không? Chọn người phù hợp và đặt lịch ngay bây giờ
                </Text>
                <View style={styles.emptyActionsRow}>
                  <TouchableOpacity 
                    style={styles.emptyActionButtonPrimary}
                    onPress={() => {
                      // Scroll to caregivers section or navigate to search
                      router.push('/careseeker/caregiver-search');
                    }}
                  >
                    <LinearGradient
                      colors={['#FF6B35', '#FF8E53']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.emptyActionGradient}
                    >
                      <Ionicons name="calendar" size={18} color="#FFF" />
                      <Text style={styles.emptyActionTextPrimary}>Đặt lịch ngay</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {recommendedCaregivers.length > 0 && (
                    <TouchableOpacity 
                      style={styles.emptyActionButton}
                      onPress={() => {
                        // Quick book with first recommended caregiver
                        if (recommendedCaregivers[0]) {
                          handleBookPress(recommendedCaregivers[0]);
                        }
                      }}
                    >
                      <Text style={styles.emptyActionText}>Chọn gợi ý</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FF6B35" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <AppointmentScheduleToday appointments={appointments} />
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Welcome Tutorial Modal for New Users */}
      <Modal
        visible={showWelcomeTutorial}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWelcomeTutorial(false)}
      >
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialContainer}>
            <LinearGradient
              colors={['#FF6B35', '#FF8E53']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tutorialHeader}
            >
              <Ionicons name="hand-right" size={48} color="#FFF" />
              <Text style={styles.tutorialTitle}>Chào mừng bạn đến với ElderCare!</Text>
              <Text style={styles.tutorialSubtitle}>
                Hãy bắt đầu bằng cách thêm thông tin người thân cần chăm sóc
              </Text>
            </LinearGradient>
            
            <View style={styles.tutorialContent}>
              <View style={styles.tutorialStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Thêm hồ sơ người thân</Text>
                  <Text style={styles.stepDesc}>
                    Cung cấp thông tin về người già trong gia đình để chúng tôi tìm người chăm sóc phù hợp
                  </Text>
                </View>
              </View>

              <View style={styles.tutorialStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Tìm kiếm người chăm sóc</Text>
                  <Text style={styles.stepDesc}>
                    Duyệt qua danh sách người chăm sóc được đề xuất phù hợp với nhu cầu của bạn
                  </Text>
                </View>
              </View>

              <View style={styles.tutorialStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Đặt lịch chăm sóc</Text>
                  <Text style={styles.stepDesc}>
                    Chọn người chăm sóc yêu thích và đặt lịch hẹn dễ dàng
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tutorialActions}>
              <TouchableOpacity 
                style={styles.tutorialSkipButton}
                onPress={() => setShowWelcomeTutorial(false)}
              >
                <Text style={styles.tutorialSkipText}>Bỏ qua</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tutorialStartButton}
                onPress={() => {
                  setShowWelcomeTutorial(false);
                  router.push('/careseeker/add-elderly');
                }}
              >
                <LinearGradient
                  colors={['#FF6B35', '#FF8E53']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tutorialStartButtonGradient}
                >
                  <Text style={styles.tutorialStartText}>Bắt đầu ngay</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={['#FF6B35', '#FF8E53']}
                style={styles.modalAvatar}
              >
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.modalName}>
                {user?.name || 'Người dùng'}
              </Text>
              <Text style={styles.modalEmail}>
                {user?.email}
              </Text>
            </View>

            <View style={styles.modalInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#6c757d" />
                <Text style={styles.infoText}>
                  {user?.phone || 'Chưa cập nhật'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#6c757d" />
                <Text style={styles.infoText}>
                  {user?.address || 'Chưa cập nhật'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#6c757d" />
                <Text style={styles.infoText}>
                  {user?.dateOfBirth || 'Chưa cập nhật'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.logoutButtonModal} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.logoutButtonGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Notification Dropdown */}
      {showNotificationModal && (
        <TouchableOpacity 
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationModal(false)}
        >
          <View style={styles.notificationDropdown}>
            <View style={styles.notificationArrow} />
            <NotificationPanel 
              notifications={notifications}
              onNotificationPress={(notification) => {
                setNotifications(prev => 
                  prev.map(notif => 
                    notif.id === notification.id 
                      ? { ...notif, isRead: true }
                      : notif
                  )
                );
              }}
              onMarkAsRead={(notificationId) => {
                setNotifications(prev => 
                  prev.map(notif => 
                    notif.id === notificationId 
                      ? { ...notif, isRead: true }
                      : notif
                  )
                );
              }}
              onMarkAllAsRead={() => {
                setNotifications(prev => 
                  prev.map(notif => ({ ...notif, isRead: true }))
                );
              }}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Add Elderly Modal */}
      <AddElderlyModal
        visible={showAddElderlyModal}
        onClose={() => setShowAddElderlyModal(false)}
        onSuccess={() => {
          console.log('Elderly profile created successfully');
        }}
      />

      {/* Logout Confirmation Modal */}
      <CustomModal
        visible={showLogoutModal}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        buttonText={isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        onPress={handleConfirmLogout}
        iconName="log-out-outline"
        iconColor="#E74C3C"
        buttonColors={['#E74C3C', '#C0392B']}
        isLoading={isLoggingOut}
        showCancelButton={true}
        cancelButtonText="Hủy"
        onCancel={() => setShowLogoutModal(false)}
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#FF6B35" />
          <Text style={[styles.navText, styles.navTextActive]}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/careseeker/appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Lịch hẹn</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/careseeker/hired-caregivers')}
        >
          <Ionicons name="people-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Đã thuê</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Cá nhân</Text>
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  decorativeBackground: {
    position: 'absolute',
    width: '100%',
    height: 300,
    top: 0,
    left: 0,
  },
  bgCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF572212',
    top: -50,
    right: -50,
  },
  bgCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FF572210',
    top: 100,
    left: -30,
  },
  bgCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF572208',
    top: 50,
    right: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    marginRight: 14,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  mainContent: {
    paddingTop: 10,
  },
  emergencyContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  requestNotificationContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiPoweredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  emptyCaregiverContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureList: {
    alignSelf: 'stretch',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  emptyActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF',
    gap: 6,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  emptyActionButtonPrimary: {
    flex: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
  },
  emptyActionTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyElderlyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  addElderlyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addElderlyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  addElderlyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  elderlyScrollView: {
    paddingHorizontal: 20,
  },
  elderlyCard: {
    width: 240,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  elderlyImageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  elderlyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elderlyAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  elderlyInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  elderlyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  elderlyAge: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  elderlyHealthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  elderlyHealthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  elderlyHealthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyAppointmentContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  caregiverScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  caregiverCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  caregiverImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  caregiverImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caregiverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  specialtyContainer: {
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: '#0284C7',
  },
  bookButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  tutorialHeader: {
    padding: 32,
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  tutorialSubtitle: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 20,
  },
  tutorialContent: {
    padding: 24,
  },
  tutorialStep: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  tutorialActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  tutorialSkipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  tutorialSkipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  tutorialStartButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tutorialStartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  tutorialStartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  modalEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  logoutButtonModal: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  notificationDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: width * 0.75,
    maxHeight: '80%',
    zIndex: 1001,
  },
  notificationArrow: {
    position: 'absolute',
    top: -8,
    right: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    zIndex: 1002,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});
