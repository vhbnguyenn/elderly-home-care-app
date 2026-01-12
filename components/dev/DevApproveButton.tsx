import { useAuth } from '@/contexts/AuthContext';
import { approveProfile } from '@/data/profileStore';
import { STORAGE_KEYS, StorageService } from '@/services/storage.service';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function DevApproveButton() {
  const { user, updateProfile } = useAuth();

  const handleApprove = async () => {
    if (!user || user.role !== 'Caregiver') {
      Alert.alert('Error', 'Only for caregiver users');
      return;
    }

    try {
      console.log('🔧 [DEV] Approving caregiver profile...');
      
      // Update in storage
      const users = await StorageService.getAll(STORAGE_KEYS.USERS);
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'approved',
          hasCompletedProfile: true,
        };
        await StorageService.setAll(STORAGE_KEYS.USERS, users);
      }
      
      // Update in profileStore
      approveProfile(user.id);
      
      // Update in AuthContext
      updateProfile({
        status: 'approved',
        hasCompletedProfile: true,
      });
      
      console.log('✅ [DEV] Profile approved successfully!');
      Alert.alert('Success', 'Profile approved! Please refresh the page.', [
        {
          text: 'OK',
          onPress: () => {
            // Force navigation to dashboard
            console.log('Refreshing...');
          }
        }
      ]);
    } catch (error) {
      console.error('❌ [DEV] Error approving profile:', error);
      Alert.alert('Error', 'Failed to approve profile');
    }
  };

  // Only show in development
  if (__DEV__ && user?.role === 'Caregiver') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleApprove}>
          <Text style={styles.buttonText}>🔧 DEV: Approve Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 9999,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
