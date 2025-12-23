import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { RequestTabs } from '@/components/requests/RequestTabs';
import { ThemedText } from '@/components/themed-text';

export default function RequestsScreen() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);

  // TODO: Replace with real API data from elderly service
  const elderlyProfiles: any[] = [];

  const handleChatPress = (caregiver: any) => {
    // Navigate to chat with specific caregiver
    console.log('Chat with:', caregiver.name);
    router.push({
      pathname: '/careseeker/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      }
    });
  };

  const handleBookPress = (caregiver: any) => {
    // Open booking modal directly (same as caregiver-search)
    console.log('Book caregiver:', caregiver.name);
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };


  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Yêu cầu</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <RequestTabs 
        onChatPress={handleChatPress}
        onBookPress={handleBookPress}
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
    backgroundColor: '#9B59B6',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
});