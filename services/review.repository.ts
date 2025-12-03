import { StorageService, STORAGE_KEYS } from './storage.service';
import { Review } from './database.types';

/**
 * Create a new review
 */
export const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<string> => {
  const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newReview: Review = {
    ...review,
    id,
  };
  
  await StorageService.create<Review>(STORAGE_KEYS.REVIEWS, newReview);
  return id;
};

/**
 * Get reviews by caregiver ID
 */
export const getReviewsByCaregiver = async (caregiverId: string): Promise<Review[]> => {
  return StorageService.getByField<Review>(STORAGE_KEYS.REVIEWS, 'caregiver_id', caregiverId);
};

/**
 * Get reviews by user ID
 */
export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  return StorageService.getByField<Review>(STORAGE_KEYS.REVIEWS, 'user_id', userId);
};

/**
 * Get review by appointment ID
 */
export const getReviewByAppointment = async (appointmentId: string): Promise<Review | null> => {
  const reviews = await StorageService.getByField<Review>(STORAGE_KEYS.REVIEWS, 'appointment_id', appointmentId);
  return reviews[0] || null;
};

/**
 * Delete review
 */
export const deleteReview = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.REVIEWS, id);
};
