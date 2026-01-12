import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ElderlyProfileSelector } from '@/components/elderly/ElderlyProfileSelector';
import { AvailabilitySelector } from '@/components/caregiver/AvailabilitySelector';
import { ThemedText } from '@/components/themed-text';
import { Task, TaskSelector } from '@/components/ui/TaskSelector';
import { SERVICE_PACKAGES, getPackageById } from '@/constants/servicePackages';

interface Caregiver {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  experience: string;
  specialties: string[];
  hourlyRate: number;
  distance: string;
  isVerified: boolean;
  totalReviews: number;
}

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  currentCaregivers: number;
  family: string;
  healthStatus: 'good' | 'fair' | 'poor';
  avatar?: string;
  address?: string;
}

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  caregiver: Caregiver;
  elderlyProfiles: ElderlyProfile[];
  immediateOnly?: boolean;
}

type BookingType = 'immediate' | 'schedule';

export function BookingModal({ visible, onClose, caregiver, elderlyProfiles: initialProfiles, immediateOnly = false }: BookingModalProps) {
  const [elderlyProfiles, setElderlyProfiles] = useState(initialProfiles);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [bookingType] = useState<BookingType>('immediate'); // Always immediate
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Sync elderlyProfiles when initialProfiles changes
  useEffect(() => {
    setElderlyProfiles(initialProfiles);
  }, [initialProfiles]);

  // Use service packages from constants
  const servicePackages = SERVICE_PACKAGES;

  // Payment methods
  const paymentMethods = [
    {
      id: 'qr_code',
      name: 'Quét mã QR',
      icon: 'qr-code-outline',
      type: 'qr',
      description: 'Quét mã QR để thanh toán nhanh'
    }
  ];

  // Immediate hire form data
  const [immediateData, setImmediateData] = useState({
    workLocation: '123 Đường ABC, Quận 1, TP.HCM',
    salary: '',
    timeSlotGroups: [] as {
      id: string;
      days: string[];
      timeSlots: { slot: string; start: string; end: string }[];
    }[],
    tasks: [] as Task[],
    durationType: '',
    durationValue: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    selectedDate: '',
    selectedPackage: '',
    startHour: '',
    startMinute: '',
    note: '',
  });

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'hour' | 'minute'>('hour');

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleClose = () => {
    setSelectedProfiles([]);
    setCurrentStep(1);
    setIsSubmitting(false);
    setShowValidation(false);
    setShowLocationModal(false);
    setShowCustomLocationInput(false);
    setCustomLocation('');
    onClose();
  };

  const handleSelectLocation = (location: string) => {
    setImmediateData(prev => ({ ...prev, workLocation: location }));
    setShowLocationModal(false);
    setShowCustomLocationInput(false);
    setCustomLocation('');
  };

  const handleCustomLocationSelect = () => {
    setShowLocationModal(false);
    setShowCustomLocationInput(true);
  };

  const handleSaveCustomLocation = () => {
    if (customLocation.trim()) {
      setImmediateData(prev => ({ ...prev, workLocation: customLocation }));
      setShowCustomLocationInput(false);
      setCustomLocation('');
    }
  };

  const [showValidation, setShowValidation] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    tasks: false,
    duration: false,
    note: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper functions
  // Format salary display
  const formatSalary = (salary: string) => {
    if (!salary) return '';
    const num = parseInt(salary);
    return num.toLocaleString('vi-VN') + ' VNĐ/giờ';
  };

  const handleNext = () => {
    console.log('=== handleNext called ===');
    console.log('Current Step:', currentStep);
    
    if (currentStep === 1) {
      console.log('Step 1 validation');
      console.log('Selected Profiles:', selectedProfiles);
      
      if (!selectedProfiles || selectedProfiles.length === 0) {
        console.log('Validation failed: No profiles selected');
        setShowValidation(true);
        return;
      }
      
      console.log('Step 1 validation passed, moving to step 2');
      setShowValidation(false);
      setCurrentStep(2);
      
    } else if (currentStep === 2) {
      console.log('Step 2 validation');
      console.log('Selected Package:', immediateData.selectedPackage);
      console.log('Work Location:', immediateData.workLocation);
      console.log('Selected Date:', immediateData.selectedDate);
      console.log('Start Time:', immediateData.startTime);
      console.log('End Time:', immediateData.endTime);
      
      if (!immediateData.selectedPackage) {
        console.log('Validation failed: No package selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói dịch vụ');
        return;
      }
      
      if (!immediateData.selectedDate) {
        console.log('Validation failed: No date selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày và giờ từ lịch trống');
        return;
      }
      
      if (!immediateData.startTime || !immediateData.endTime) {
        console.log('Validation failed: No time selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn khung giờ từ lịch trống');
        return;
      }
      
      console.log('Step 2 validation passed, moving to step 3');
      setCurrentStep(3);
      
    } else if (currentStep === 3) {
      console.log('Step 3 validation passed, moving to step 4');
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    console.log('=== handleSubmit called ===');
    console.log('Selected Package:', immediateData.selectedPackage);
    console.log('Work Location:', immediateData.workLocation);
    console.log('Selected Profiles:', selectedProfiles);
    
    setIsSubmitting(true);
    
    // Simulate API call - Create booking without payment
    setTimeout(() => {
      console.log('=== API call completed ===');
      setIsSubmitting(false);
      console.log('Showing success modal');
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleSuccessClose = () => {
    console.log('Success modal closed');
    setShowSuccessModal(false);
    handleClose();
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Lỗi', 'Không thể sao chép');
    }
  };

  const handleAddNewProfile = (newProfile: Omit<ElderlyProfile, 'id'>) => {
    // Generate new ID
    const newId = `NEW_${Date.now()}`;
    const profileWithId = {
      ...newProfile,
      id: newId,
    };

    // Add to profiles list
    setElderlyProfiles(prev => [...prev, profileWithId]);

    // Auto-select the new profile
    setSelectedProfiles([newId]);

    Alert.alert('Thành công', 'Đã thêm người già mới thành công!');
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Chọn người cần chăm sóc</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Vui lòng chọn người thân cần được chăm sóc cho lịch hẹn này. Bạn có thể chọn 1 người hoặc thêm mới.
      </ThemedText>
      <ElderlyProfileSelector
        profiles={elderlyProfiles}
        selectedProfiles={selectedProfiles}
        onSelectionChange={setSelectedProfiles}
        showValidation={showValidation}
        hideTitle={true}
        onAddNewProfile={handleAddNewProfile}
      />
    </View>
  );

  const renderStep2 = () => {
    const selectedPackage = immediateData.selectedPackage 
      ? getPackageById(immediateData.selectedPackage)
      : null;
    
      return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Chọn gói dịch vụ và lịch trống</ThemedText>
          
          {/* Section 1: Service Package - FIRST */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>📦 Chọn gói dịch vụ</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            
            <View style={styles.sectionContent}>
              <View style={styles.packagesContainer}>
                {servicePackages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.packageCard,
                      immediateData.selectedPackage === pkg.id && styles.packageCardSelected
                    ]}
                    onPress={() => {
                      setImmediateData(prev => ({ 
                        ...prev, 
                        selectedPackage: pkg.id,
                        // Reset date/time when package changes
                        selectedDate: '',
                        startTime: '',
                        endTime: '',
                      }));
                    }}
                  >
                    {immediateData.selectedPackage === pkg.id && (
                      <View style={styles.packageCheckmark}>
                        <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                      </View>
                    )}
                    
                    <ThemedText style={styles.packageName}>{pkg.name}</ThemedText>
                    
                    <View style={styles.packageDetails}>
                      <View style={styles.packageDetailItem}>
                        <Ionicons name="time-outline" size={16} color="#6c757d" />
                        <ThemedText style={styles.packageDetailText}>{pkg.duration}h</ThemedText>
                      </View>
                      <ThemedText style={styles.packagePrice}>
                        {pkg.price.toLocaleString('vi-VN')} VNĐ
                      </ThemedText>
                    </View>
                    
                    <View style={styles.packageServices}>
                      <ThemedText style={styles.packageServicesTitle}>Dịch vụ bao gồm:</ThemedText>
                      {pkg.services.map((service, index) => (
                        <View key={index} style={styles.packageServiceItem}>
                          <Ionicons name="checkmark" size={16} color="#FF6B35" />
                          <ThemedText style={styles.packageServiceText}>{service}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Section 2: Availability Selection - Shows AFTER package is selected */}
          {immediateData.selectedPackage && selectedPackage && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>📅 Chọn lịch trống</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              
              <View style={styles.sectionContent}>
                <View style={styles.availabilityNotice}>
                  <Ionicons name="information-circle-outline" size={20} color="#3498DB" />
                  <ThemedText style={styles.availabilityNoticeText}>
                    Chỉ hiển thị các khung giờ mà người chăm sóc có thể nhận ca
                  </ThemedText>
                </View>
                
                <AvailabilitySelector
                  caregiverId={caregiver.id}
                  selectedDate={immediateData.selectedDate}
                  selectedTime={
                    immediateData.startTime && immediateData.endTime
                      ? { start: immediateData.startTime, end: immediateData.endTime }
                      : undefined
                  }
                  onSelect={(date, startTime, endTime) => {
                    // Format date for display
                    const dateObj = new Date(date);
                    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                    const dayName = dayNames[dateObj.getDay()];
                    const formattedDate = `${dayName}, ${dateObj.getDate()} Thg ${dateObj.getMonth() + 1} ${dateObj.getFullYear()}`;
                    
                    setImmediateData(prev => ({
                      ...prev,
                      selectedDate: formattedDate,
                      startDate: date,
                      startTime: startTime,
                      endTime: endTime,
                    }));
                  }}
                  packageDuration={selectedPackage.duration}
                />
              </View>
            </View>
          )}

          {/* Section 3: Basic Info */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('basicInfo')}
            >
              <ThemedText style={styles.sectionTitle}>📋 Địa điểm làm việc</ThemedText>
              <Ionicons 
                name={expandedSections.basicInfo ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#FF6B35" 
              />
            </TouchableOpacity>
            
            {expandedSections.basicInfo && (
              <View style={styles.sectionContent}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <ThemedText style={styles.inputLabel}>Địa điểm làm việc</ThemedText>
                    <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </View>

                  <TouchableOpacity 
                    style={styles.locationSelector}
                    onPress={() => setShowLocationModal(true)}
                  >
                    <View style={styles.locationContent}>
                      <Ionicons name="location" size={20} color="white" />
                      <View style={styles.locationTextContainer}>
                        <ThemedText style={styles.locationTitle}>
                          {immediateData.workLocation ? 'Địa chỉ đã chọn' : 'Chọn địa điểm làm việc'}
                        </ThemedText>
                        {immediateData.workLocation && (
                          <ThemedText style={styles.locationAddress}>
                            {immediateData.workLocation}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Section 4: Note */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('note')}
            >
              <ThemedText style={styles.sectionTitle}>📝 Ghi chú</ThemedText>
              <Ionicons 
                name={expandedSections.note ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#FF6B35" 
              />
            </TouchableOpacity>
            
            {expandedSections.note && (
              <View style={styles.sectionContent}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Ghi chú thêm</ThemedText>
                </View>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Nhập ghi chú của bạn..."
                  value={immediateData?.note || ''}
                  onChangeText={(text) => {
                    setImmediateData(prev => ({
                      ...prev,
                      note: text
                    }));
                  }}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            )}
          </View>

        </View>
      );
  };

  const renderStep3 = () => {
    console.log('=== Rendering Step 3 (Review) ===');
    console.log('immediateData:', immediateData);
    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Xem trước thông tin</ThemedText>
        
        <View style={styles.reviewContainer}>
          {/* Work Location */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>📍 Địa điểm làm việc:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.workLocation || 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Date and Time */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>📅 Ngày làm việc:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedDate || 'Chưa chọn'}
            </ThemedText>
          </View>

          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>⏰ Giờ làm việc:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.startTime && immediateData?.endTime
                ? `${immediateData.startTime} - ${immediateData.endTime}` 
                : 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Selected Package */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>📦 Gói dịch vụ:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedPackage ? 
                servicePackages.find(p => p.id === immediateData.selectedPackage)?.name : 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Total Price */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>💰 Tổng chi phí:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedPackage ? 
                `${servicePackages.find(p => p.id === immediateData.selectedPackage)?.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa tính'}
            </ThemedText>
          </View>

          {/* Note */}
          {immediateData?.note && (
            <View style={styles.reviewItem}>
              <ThemedText style={styles.reviewLabel}>📄 Ghi chú:</ThemedText>
              <ThemedText style={styles.reviewValue}>{immediateData.note}</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Payment step removed - payment will be done after caregiver completes the booking
  /*
  const renderStep4 = () => {
    console.log('=== Rendering Step 4 (Payment) ===');
    console.log('selectedPaymentMethod:', selectedPaymentMethod);
    
    const selectedPackage = servicePackages.find(p => p.id === immediateData.selectedPackage);
    const totalAmount = selectedPackage?.price || 0;
    
    // Generate booking ID for QR code
    const bookingId = `BK${Date.now().toString().slice(-8)}`;
    
    // Bank account info
    const bankInfo = {
      bankName: 'Ngân hàng TMCP Á Châu (ACB)',
      accountNumber: '123456789',
      accountName: 'NGUYEN VAN A',
      branch: 'Chi nhánh TP.HCM'
    };
    
    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Chọn phương thức thanh toán</ThemedText>
        
        <View style={styles.paymentContainer}>
          {/* Total Amount Display *\/}
          <View style={styles.paymentSummary}>
            <ThemedText style={styles.paymentSummaryLabel}>Tổng thanh toán:</ThemedText>
            <ThemedText style={styles.paymentSummaryAmount}>
              {totalAmount.toLocaleString('vi-VN')} VNĐ
            </ThemedText>
          </View>

          {/* Payment Methods *\/}
          <View style={styles.paymentMethodsContainer}>
            <ThemedText style={styles.sectionSubtitle}>Phương thức thanh toán</ThemedText>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={[
                    styles.paymentMethodIcon,
                    selectedPaymentMethod === method.id && styles.paymentMethodIconSelected
                  ]}>
                    <Ionicons 
                      name={method.icon as any} 
                      size={24} 
                      color={selectedPaymentMethod === method.id ? '#FF6B35' : '#6c757d'} 
                    />
                  </View>
                  <View style={styles.paymentMethodTextContainer}>
                    <ThemedText style={[
                      styles.paymentMethodName,
                      selectedPaymentMethod === method.id && styles.paymentMethodNameSelected
                    ]}>
                      {method.name}
                    </ThemedText>
                    <ThemedText style={styles.paymentMethodDescription}>
                      {method.description}
                    </ThemedText>
                  </View>
                </View>
                {selectedPaymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Details - QR Code *\/}
          {selectedPaymentMethod === 'qr_code' && (
            <View style={styles.paymentDetailsContainer}>
              <View style={styles.paymentDetailsHeader}>
                <Ionicons name="qr-code" size={24} color="#FF6B35" />
                <ThemedText style={styles.paymentDetailsTitle}>Quét mã QR để thanh toán</ThemedText>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code-outline" size={120} color="#FF6B35" />
                  <ThemedText style={styles.qrCodeText}>Mã QR thanh toán</ThemedText>
                  <ThemedText style={styles.qrCodeSubtext}>
                    {totalAmount.toLocaleString('vi-VN')} VNĐ
                  </ThemedText>
                </View>
                
                <View style={styles.qrCodeInfo}>
                  <ThemedText style={styles.qrCodeInfoText}>
                    Mã booking: <ThemedText style={styles.qrCodeInfoBold}>{bookingId}</ThemedText>
                  </ThemedText>
                  <ThemedText style={styles.qrCodeInfoText}>
                    Ngân hàng: <ThemedText style={styles.qrCodeInfoBold}>{bankInfo.bankName}</ThemedText>
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={20} color="#FF6B35" />
                <ThemedText style={styles.paymentNoteText}>
                  Mở ứng dụng ngân hàng và quét mã QR để thanh toán. Hệ thống sẽ tự động xác nhận sau khi thanh toán thành công.
                </ThemedText>
              </View>
            </View>
          )}

          {/* Default Note *\/}
          {!selectedPaymentMethod && (
            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={20} color="#FF6B35" />
              <ThemedText style={styles.paymentNoteText}>
                Vui lòng chọn phương thức thanh toán để tiếp tục.
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };
  */

  const renderCurrentStep = () => {
    console.log('=== renderCurrentStep ===');
    console.log('Current step:', currentStep);
    
    switch (currentStep) {
      case 1: 
        console.log('Rendering Step 1');
        return renderStep1();
      case 2: 
        console.log('Rendering Step 2');
        return renderStep2();
      case 3: 
        console.log('Rendering Step 3');
        return renderStep3();
      default: 
        console.log('Default: Rendering Step 1');
        return renderStep1();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Đặt lịch với {caregiver.name}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Bước {currentStep}/3
            </ThemedText>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / 3) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={() => setCurrentStep(prev => prev - 1)}>
              <Ionicons name="chevron-back" size={20} color="#FF6B35" />
              <ThemedText style={styles.previousButtonText}>Trước</ThemedText>
            </TouchableOpacity>
          )}
          
          <View style={styles.navigationSpacer} />
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => {
              console.log('=== Button clicked ===');
              console.log('Current Step:', currentStep);
              console.log('Is Submitting:', isSubmitting);
              
              if (currentStep === 1) {
                handleNext();
              } else if (currentStep === 2) {
                handleNext();
              } else if (currentStep === 3) {
                console.log('Calling handleSubmit');
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.nextButtonText}>
              {isSubmitting ? 'Đang xử lý...' : 
               currentStep === 2 ? 'Xem trước' : 
               currentStep === 3 ? 'Xác nhận đặt lịch' : 'Tiếp theo'}
            </ThemedText>
            {!isSubmitting && (
              <Ionicons name="chevron-forward" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Location Selection Modal */}
        <Modal
          visible={showLocationModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.locationModal}>
              <View style={styles.modalHeaderClose}>
                <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
                {/* Addresses from selected elderly profiles */}
                {selectedProfiles.length > 0 && (
                  <View style={styles.locationSection}>
                    <ThemedText style={styles.locationSectionTitle}>Địa chỉ người thân</ThemedText>
                    {elderlyProfiles
                      .filter(profile => selectedProfiles.includes(profile.id))
                      .map((profile) => (
                        <View
                          key={profile.id}
                          style={[
                            styles.locationOption,
                            immediateData.workLocation === profile.address && styles.locationOptionSelected
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.locationOptionTouchable}
                            onPress={() => handleSelectLocation(profile.address || '')}
                          >
                            <View style={styles.locationOptionContent}>
                              <View style={styles.locationOptionIcon}>
                                <Ionicons name="home" size={24} color="#FF6B35" />
                              </View>
                              <View style={styles.locationOptionText}>
                                <ThemedText style={styles.locationOptionName}>{profile.name}</ThemedText>
                                <ThemedText style={styles.locationOptionAddress}>
                                  {profile.address || 'Chưa có địa chỉ'}
                                </ThemedText>
                              </View>
                            </View>
                            {immediateData.workLocation === profile.address && (
                              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editLocationButton}
                            onPress={() => {
                              // Handle edit location
                              Alert.alert('Chỉnh sửa địa chỉ', `Chỉnh sửa địa chỉ của ${profile.name}`);
                            }}
                          >
                            <Ionicons name="create-outline" size={20} color="#FF6B35" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}

                {/* Custom location option */}
                <View style={styles.locationSection}>
                  <ThemedText style={styles.locationSectionTitle}>Địa chỉ khác</ThemedText>
                  <View style={styles.locationOption}>
                    <TouchableOpacity
                      style={styles.locationOptionTouchable}
                      onPress={handleCustomLocationSelect}
                    >
                      <View style={styles.locationOptionContent}>
                        <View style={styles.locationOptionIcon}>
                          <Ionicons name="add-circle" size={24} color="#FF6B35" />
                        </View>
                        <View style={styles.locationOptionText}>
                          <ThemedText style={styles.locationOptionName}>Nhập địa chỉ khác</ThemedText>
                          <ThemedText style={styles.locationOptionAddress}>Nhập địa chỉ tùy chỉnh</ThemedText>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6c757d" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Location Input Modal */}
        <Modal
          visible={showCustomLocationInput}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowCustomLocationInput(false);
            setCustomLocation('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.customLocationModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setShowCustomLocationInput(false);
                    setShowLocationModal(true);
                    setCustomLocation('');
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#FF6B35" />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Nhập địa chỉ</ThemedText>
                <TouchableOpacity onPress={() => {
                  setShowCustomLocationInput(false);
                  setCustomLocation('');
                }}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <View style={styles.customLocationContent}>
                <ThemedText style={styles.inputLabel}>Địa chỉ làm việc</ThemedText>
                <TextInput
                  style={styles.customLocationInput}
                  value={customLocation}
                  onChangeText={setCustomLocation}
                  placeholder="Nhập địa chỉ đầy đủ..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.saveLocationButton, !customLocation.trim() && styles.disabledButton]}
                  onPress={handleSaveCustomLocation}
                  disabled={!customLocation.trim()}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <ThemedText style={styles.saveLocationButtonText}>Xác nhận</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <ThemedText style={styles.pickerTitle}>Chọn ngày làm việc</ThemedText>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.pickerScroll}>
                <View style={styles.pickerContent}>
                  {(() => {
                    const dates = [];
                    const today = new Date();
                    
                    for (let i = 0; i < 30; i++) {
                      const date = new Date(today);
                      date.setDate(today.getDate() + i);
                      
                      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                      const monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 
                                        'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
                      
                      const dateStr = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                      dates.push(
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.pickerItem,
                            styles.datePickerItem,
                            immediateData.selectedDate === dateStr && styles.pickerItemSelected
                          ]}
                          onPress={() => {
                            setImmediateData(prev => ({ ...prev, selectedDate: dateStr }));
                            setShowDatePicker(false);
                          }}
                        >
                          <ThemedText style={[
                            styles.pickerText,
                            immediateData.selectedDate === dateStr && styles.pickerTextSelected
                          ]}>
                            {dateStr}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    }
                    return dates;
                  })()}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <ThemedText style={styles.pickerTitle}>
                  {timePickerType === 'hour' ? 'Chọn giờ' : 'Chọn phút'}
                </ThemedText>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.pickerScroll}>
                <View style={styles.pickerContent}>
                  {timePickerType === 'hour' 
                    ? Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.pickerItem,
                              immediateData.startHour === hour && styles.pickerItemSelected
                            ]}
                            onPress={() => {
                              setImmediateData(prev => ({ ...prev, startHour: hour }));
                              setShowTimePicker(false);
                            }}
                          >
                            <ThemedText style={[
                              styles.pickerText,
                              immediateData.startHour === hour && styles.pickerTextSelected
                            ]}>
                              {hour}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })
                    : Array.from({ length: 60 }, (_, i) => {
                        const minute = i.toString().padStart(2, '0');
                        return (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              styles.pickerItem,
                              immediateData.startMinute === minute && styles.pickerItemSelected
                            ]}
                            onPress={() => {
                              setImmediateData(prev => ({ ...prev, startMinute: minute }));
                              setShowTimePicker(false);
                            }}
                          >
                            <ThemedText style={[
                              styles.pickerText,
                              immediateData.startMinute === minute && styles.pickerTextSelected
                            ]}>
                              {minute}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })
                  }
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccessClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#FF6B35" />
              </View>
              
              <ThemedText style={styles.successTitle}>Đặt lịch thành công! 🎉</ThemedText>
              
              <ThemedText style={styles.successMessage}>
                Yêu cầu thuê ngay lập tức của bạn đã được gửi đi.
                {'\n\n'}
                Nhân viên chăm sóc sẽ liên hệ với bạn trong thời gian sớm nhất.
                {'\n\n'}
                <ThemedText style={styles.successMessageBold}>Lưu ý:</ThemedText> Bạn sẽ thanh toán sau khi nhân viên hoàn thành công việc.
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.successButton}
                onPress={handleSuccessClose}
              >
                <ThemedText style={styles.successButtonText}>Đóng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 20,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 0,
    textAlign: 'left',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionContent: {
    padding: 20,
  },
  requiredMark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#f0fdfa',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#FF6B35',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  optionDescriptionSelected: {
    color: '#FF6B35',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  previousButtonText: {
    marginLeft: 8,
    color: '#FF6B35',
    fontWeight: '600',
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    marginRight: 8,
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerButton: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#999',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 8,
    fontWeight: '500',
  },
  salaryDisplay: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 6,
    fontWeight: '600',
  },
  salaryHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Checkbox styles
  checkboxContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF6B35',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  locationSelector: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  changeLocationButton: {
    padding: 8,
  },
  // Duration Type Styles
  durationTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  durationTypeOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  durationTypeOptionSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#E74C3C',
  },
  durationTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  durationTypeTextSelected: {
    color: '#E74C3C',
  },
  durationTypeSubtext: {
    fontSize: 12,
    color: '#6c757d',
  },
  durationTypeSubtextSelected: {
    color: '#E74C3C',
  },
  // Date Selection Styles
  dateSelectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dateSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dateSelectionMonth: {
    fontSize: 14,
    color: '#6c757d',
  },
  dateScrollView: {
    flexGrow: 0,
  },
  dateCardsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  dateCardDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dateCardDaySelected: {
    color: 'white',
  },
  dateCardNumber: {
    fontSize: 12,
    color: '#6c757d',
  },
  dateCardNumberSelected: {
    color: 'white',
  },
  // Start Time Styles
  startTimeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startTimeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTimeLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
    minWidth: 40,
  },
  // Time Picker Styles
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timeInputBoxDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.6,
  },
  timeInputTextDisabled: {
    color: '#adb5bd',
  },
  // Warning Styles
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningText: {
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 8,
    flex: 1,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    maxHeight: 300,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pickerScroll: {
    maxHeight: 150,
    width: '100%',
  },
  pickerContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerItem: {
    height: 40,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 2,
  },
  datePickerItem: {
    width: '100%',
    paddingHorizontal: 16,
  },
  pickerItemSelected: {
    backgroundColor: '#FF6B35',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  pickerTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Summary Styles
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  // Task Styles
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 6,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  taskInput: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },
  // Note Styles
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 120,
  },
  // Review Styles
  reviewContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    width: 140,
    marginRight: 8,
  },
  reviewValue: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    flexWrap: 'wrap',
  },
  // Package Styles
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  packageCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#f0fdf4',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.15,
  },
  packageCheckmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  packageDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  packageDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageDetailText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  packagePrice: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  packageServices: {
    gap: 8,
  },
  packageServicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  packageServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageServiceText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  // Location Modal Styles
  locationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  locationList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  locationOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#f0fdf4',
  },
  locationOptionTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  editLocationButton: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationOptionText: {
    flex: 1,
  },
  locationOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  locationOptionAddress: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  // Custom Location Modal Styles
  customLocationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderClose: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  customLocationContent: {
    padding: 20,
  },
  customLocationInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveLocationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Success Modal Styles
  successModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successMessageBold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  successButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  // Payment Styles
  paymentContainer: {
    gap: 24,
  },
  paymentSummary: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  paymentSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#f0f8ff',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.15,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  paymentMethodIconSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#FF6B35',
  },
  paymentMethodTextContainer: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  paymentMethodNameSelected: {
    color: '#FF6B35',
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: '#6c757d',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  paymentDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 16,
  },
  paymentDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  paymentDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bankInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    minWidth: 100,
  },
  bankInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  bankInfoValueBold: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  bankInfoValueWithCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  bankInfoDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  qrCodeContainer: {
    alignItems: 'center',
    gap: 16,
  },
  qrCodePlaceholder: {
    width: 240,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    padding: 20,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
  },
  qrCodeSubtext: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
  },
  qrCodeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 8,
  },
  qrCodeInfoText: {
    fontSize: 14,
    color: '#6c757d',
  },
  qrCodeInfoBold: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  availabilityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  availabilityNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
});
