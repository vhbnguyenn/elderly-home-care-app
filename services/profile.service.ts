import axiosInstance from "./axiosInstance";
import { API_CONFIG } from "./config/api.config";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export interface DashboardStats {
  totalElderly: number;
  activeBookings: number;
  upcomingAppointments: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export class ProfileService {
  /**
   * Get current user profile
   */
  async getMe(): Promise<UserProfile> {
    try {
      console.log('[Profile] Fetching user profile...');
      
      // Debug: Check if token exists
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('auth_token');
      console.log('[Profile] 🔑 Token exists:', !!token);
      if (token) {
        console.log('[Profile] 🔑 Token preview:', token.substring(0, 30) + '...');
      } else {
        console.log('[Profile] ❌ No token found in AsyncStorage!');
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.AUTH.GET_ME);
      console.log('[Profile] ✅ User profile loaded:', response.data);
      // Backend returns { success, data }
      const userData = response.data.data || response.data;
      return userData;
    } catch (error: any) {
      console.error('[Profile] ❌ Get me error:', error);
      console.error('[Profile] ❌ Error response:', error.response?.data);
      console.error('[Profile] ❌ Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user profile');
    }
  }

  /**
   * Get dashboard stats
   * Note: This endpoint might not exist on backend, caller should handle error
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('[Profile] Fetching dashboard stats...');
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.GET_STATS);
      console.log('[Profile] ✅ Dashboard stats loaded:', response.data);
      // Backend returns { success, data }
      const statsData = response.data.data || response.data;
      return statsData;
    } catch (error: any) {
      console.error('[Profile] ❌ Get stats error:', error.response?.status, error.response?.data);
      // Re-throw to let caller handle fallback
      throw error;
    }
  }

  /**
   * Get dashboard counts (alternative endpoint)
   */
  async getDashboardCounts(): Promise<DashboardStats> {
    try {
      console.log('[Profile] Fetching dashboard counts...');
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.GET_COUNTS);
      console.log('[Profile] ✅ Dashboard counts loaded:', response.data);
      const countsData = response.data.data || response.data;
      
      // Map counts fields to stats fields
      return {
        totalElderly: countsData.elderlyCount || countsData.totalElderly || 0,
        activeBookings: countsData.activeBookingsCount || countsData.activeBookings || 0,
        upcomingAppointments: countsData.appointmentsCount || countsData.upcomingAppointments || 0,
      };
    } catch (error: any) {
      console.error('[Profile] ❌ Get counts error:', error.response?.status);
      throw error;
    }
  }

  /**
   * Update user profile (including avatar)
   */
  async updateProfile(data: FormData | Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log('[Profile] Updating profile...');
      
      const config = data instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await axiosInstance.put(
        API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE,
        data,
        config
      );
      
      console.log('[Profile] ✅ Profile updated:', response.data);
      // Backend returns { success, data }
      const userData = response.data.data || response.data;
      return userData;
    } catch (error: any) {
      console.error('[Profile] ❌ Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  /**
   * Get family members
   */
  async getFamilyMembers(): Promise<FamilyMember[]> {
    try {
      console.log('[Profile] Fetching family members...');
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.FAMILY.GET_MEMBERS);
      console.log('[Profile] ✅ Family members loaded:', response.data);
      // Backend returns { success, data }
      const membersData = response.data.data || response.data;
      return Array.isArray(membersData) ? membersData : [];
    } catch (error: any) {
      console.error('[Profile] ❌ Get family members error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch family members');
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
