import apiClient from '../apiClient';
import { API_CONFIG } from '../config/api.config';

// Review Interfaces
export interface ReviewRatings {
  professionalism: number;
  attitude: number;
  punctuality: number;
  careQuality: number;
  communication: number;
}

export interface Reviewer {
  _id: string;
  name: string;
}

export interface BookingInfo {
  _id: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  workLocation: string;
}

export interface Review {
  _id: string;
  ratings: ReviewRatings;
  reviewer: Reviewer;
  caregiver: string;
  caregiverProfile: string;
  booking: BookingInfo;
  overallSatisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied';
  strengths: string[];
  improvements: string[];
  wouldUseAgain: 'definitely' | 'probably' | 'maybe' | 'probably_not' | 'definitely_not';
  additionalNotes: string;
  status: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating: string;
  id: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
    };
  };
}

export const ReviewsAPI = {
  async getReceivedReviews(page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(
      `${API_CONFIG.ENDPOINTS.REVIEWS.RECEIVED}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
