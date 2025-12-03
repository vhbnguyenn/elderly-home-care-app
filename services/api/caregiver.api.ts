import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Types
export interface CaregiverProfile {
  id?: string;
  userId?: string;
  fullName: string;
  bio?: string;
  specializations: string[];
  experience: number; // years
  certifications: string[];
  hourlyRate: number;
  availability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }[];
  languages: string[];
  skills: string[];
  rating?: number;
  totalReviews?: number;
  avatar?: string;
  address?: string;
  city?: string;
  district?: string;
  isVerified?: boolean;
  isAvailable?: boolean;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface SearchCaregiverParams {
  specialization?: string;
  minExperience?: number;
  maxHourlyRate?: number;
  minRating?: number;
  city?: string;
  district?: string;
  availability?: string; // ISO date string
  page?: number;
  limit?: number;
}

export interface CaregiverListResponse {
  data: CaregiverProfile[];
  total: number;
  page: number;
  limit: number;
}

// Caregiver API Service
export const CaregiverAPI = {
  /**
   * Create caregiver profile
   */
  createProfile: async (payload: CaregiverProfile): Promise<CaregiverProfile> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.CAREGIVER.CREATE_PROFILE,
      payload
    );
    return response.data;
  },

  /**
   * Get own caregiver profile
   */
  getOwnProfile: async (): Promise<CaregiverProfile> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.CAREGIVER.GET_OWN_PROFILE
    );
    return response.data;
  },

  /**
   * Update caregiver profile
   */
  updateProfile: async (payload: Partial<CaregiverProfile>): Promise<CaregiverProfile> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.CAREGIVER.UPDATE_PROFILE,
      payload
    );
    return response.data;
  },

  /**
   * Get all caregiver profiles (admin only)
   */
  getAllProfiles: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<CaregiverListResponse> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.CAREGIVER.GET_ALL_PROFILES,
      { params }
    );
    return response.data;
  },

  /**
   * Get caregiver profile by ID
   */
  getProfileById: async (id: string): Promise<CaregiverProfile> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.CAREGIVER.GET_PROFILE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Search caregivers with filters
   */
  searchCaregivers: async (params: SearchCaregiverParams): Promise<CaregiverListResponse> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.CAREGIVER.SEARCH,
      { params }
    );
    return response.data;
  },

  /**
   * Update caregiver availability
   */
  updateAvailability: async (availability: CaregiverProfile['availability']): Promise<{ message: string }> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.CAREGIVER.AVAILABILITY,
      { availability }
    );
    return response.data;
  },

  /**
   * Toggle caregiver active status
   */
  toggleActiveStatus: async (isAvailable: boolean): Promise<CaregiverProfile> => {
    const response = await axiosInstance.patch(
      API_CONFIG.ENDPOINTS.CAREGIVER.UPDATE_PROFILE,
      { isAvailable }
    );
    return response.data;
  },
};
