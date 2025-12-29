import axiosInstance from './axiosInstance';
import { API_CONFIG } from './config/api.config';

/**
 * Groq AI Matching Service
 * Tích hợp với backend API Groq AI để tìm caregivers phù hợp
 */

export interface GroqMatchRequest {
  seeker_name: string;
  care_level: number; // 1-5
  health_status?: string;
  elderly_age?: number;
  caregiver_age_range?: [number, number] | null;
  gender_preference?: string | null;
  required_years_experience?: number | null;
  overall_rating_range?: [number, number];
  personality?: string[];
  attitude?: string[];
  skills?: {
    required_skills?: string[];
    priority_skills?: string[];
  };
  time_slots?: string[];
  location?: {
    lat?: number;
    lon?: number;
    address?: string;
  };
  budget_per_hour?: number;
  top_n?: number;
}

export interface GroqMatchedCaregiver {
  caregiver_id: string;
  name: string;
  age: number;
  gender: string;
  avatar?: string;
  skills: string[];
  specialties: string[];
  rating: number;
  total_reviews: number;
  years_experience: number;
  price_per_hour: number;
  match_score: number;
  match_percentage: number;
  match_reasons: string[];
}

export interface GroqMatchResponse {
  success: boolean;
  matched_caregivers: GroqMatchedCaregiver[];
  total_matches: number;
  ai_summary?: string;
}

export class GroqMatchingService {
  /**
   * Tìm caregivers phù hợp sử dụng Groq AI
   */
  async findCaregivers(request: GroqMatchRequest): Promise<GroqMatchResponse> {
    try {
      console.log('🤖 [GroqMatching] Finding caregivers with AI:', request);

      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.AI_MATCHING.FIND_CAREGIVERS,
        request
      );

      console.log('✅ [GroqMatching] AI matching success:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [GroqMatching] Error:', error);
      
      if (error.response) {
        throw new Error(
          `Groq AI error: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        );
      } else if (error.request) {
        throw new Error('Network error: No response from AI server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * So sánh Groq AI với Rule-based matching
   */
  async compareMatching(request: GroqMatchRequest): Promise<any> {
    try {
      console.log('🔍 [GroqMatching] Comparing AI vs Rule-based');

      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.AI_MATCHING.COMPARE,
        request
      );

      console.log('✅ [GroqMatching] Compare success:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [GroqMatching] Compare error:', error);
      throw new Error(`Compare failed: ${error.message}`);
    }
  }

  /**
   * Test Groq AI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.AI_MATCHING.TEST
      );

      console.log('✅ [GroqMatching] Connection test:', response.data);
      
      return response.data.success || true;
    } catch (error: any) {
      console.error('❌ [GroqMatching] Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const groqMatchingService = new GroqMatchingService();

