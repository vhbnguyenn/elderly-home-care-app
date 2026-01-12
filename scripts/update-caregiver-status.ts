/**
 * Script to update caregiver profile status to approved
 * Run this to approve an existing caregiver user
 */

import { STORAGE_KEYS, StorageService } from '../services/storage.service';

export async function updateCaregiverStatus(email: string) {
  try {
    console.log('🔧 Updating caregiver status for:', email);
    
    // Get all users
    const users = await StorageService.getAll(STORAGE_KEYS.USERS);
    
    // Find the caregiver user
    const userIndex = users.findIndex((u: any) => u.email === email);
    
    if (userIndex === -1) {
      console.log('❌ User not found:', email);
      return false;
    }
    
    const user = users[userIndex];
    
    if (user.role !== 'caregiver' && user.role !== 'Caregiver') {
      console.log('❌ User is not a caregiver:', email);
      return false;
    }
    
    // Update user with approved status
    users[userIndex] = {
      ...user,
      status: 'approved',
      hasCompletedProfile: true,
    };
    
    // Save back to storage
    await StorageService.setAll(STORAGE_KEYS.USERS, users);
    
    console.log('✅ Caregiver status updated successfully!');
    console.log('Updated user:', users[userIndex]);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating caregiver status:', error);
    return false;
  }
}

// For manual execution in console
if (typeof global !== 'undefined') {
  (global as any).updateCaregiverStatus = updateCaregiverStatus;
}
