import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Types
export interface Review {
  id?: string;
  bookingId: string;
  caregiverId: string;
  careseekerId?: string;
  rating: number; // 1-5
  comment?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  caregiver?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  careseeker?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewPayload {
  bookingId: string;
  caregiverId: string;
  rating: number;
  comment?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
}

// Review API Service
export const ReviewAPI = {
  /**
   * Create new review
   */
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.REVIEW.CREATE,
      payload
    );
    return response.data;
  },

  /**
   * Get reviews for a caregiver
   */
  getByCaregiverId: async (caregiverId: string, params?: {
    page?: number;
    limit?: number;
    minRating?: number;
  }): Promise<{
    data: Review[];
    total: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.REVIEW.GET_BY_CAREGIVER(caregiverId),
      { params }
    );
    return response.data;
  },

  /**
   * Get review for a specific booking
   */
  getByBookingId: async (bookingId: string): Promise<Review | null> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.REVIEW.GET_BY_BOOKING(bookingId)
    );
    return response.data;
  },

  /**
   * Update review
   */
  update: async (id: string, payload: UpdateReviewPayload): Promise<Review> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.REVIEW.UPDATE(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete review
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.REVIEW.DELETE(id)
    );
    return response.data;
  },

  /**
   * Check if user can review a booking
   */
  canReview: async (bookingId: string): Promise<{
    canReview: boolean;
    reason?: string;
  }> => {
    try {
      const existingReview = await ReviewAPI.getByBookingId(bookingId);
      if (existingReview) {
        return {
          canReview: false,
          reason: "Bạn đã đánh giá booking này rồi",
        };
      }
      return { canReview: true };
    } catch (error) {
      // If review not found (404), user can review
      return { canReview: true };
    }
  },
};
