import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface UserProfile {
  id?: string;
  email?: string;
  fullName: string;
  phone: string;
  role?: "caregiver" | "careseeker";
  dateOfBirth?: string;
  address?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserProfilePayload extends Partial<UserProfile> {}

// User API Service
export const UserAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PROFILES.GET_USER_PROFILE
    );
    
    // Update local storage
    if (response.data) {
      await AsyncStorage.setItem("user_data", JSON.stringify(response.data));
    }
    
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (payload: UpdateUserProfilePayload): Promise<UserProfile> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.PROFILES.UPDATE_USER_PROFILE,
      payload
    );
    
    // Update local storage
    if (response.data) {
      await AsyncStorage.setItem("user_data", JSON.stringify(response.data));
    }
    
    return response.data;
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.PROFILES.DEACTIVATE
    );
    
    // Clear local storage
    await AsyncStorage.multiRemove([
      "auth_token",
      "refresh_token",
      "user_data",
    ]);
    
    return response.data;
  },
};
