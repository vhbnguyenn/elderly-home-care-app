import { StorageService, FeedbackStorage, STORAGE_KEYS } from './storage.service';
import { Feedback } from './database.types';

/**
 * Create a new feedback
 */
export const createFeedback = async (feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newFeedback: Feedback = {
    ...feedback,
    id,
  };
  
  await StorageService.create<Feedback>(STORAGE_KEYS.FEEDBACKS, newFeedback);
  return id;
};

/**
 * Get feedbacks by appointment ID
 */
export const getFeedbacksByAppointment = async (appointmentId: string): Promise<Feedback[]> => {
  return FeedbackStorage.getByAppointmentId(appointmentId);
};

/**
 * Get feedbacks by user ID
 */
export const getFeedbacksByUser = async (userId: string): Promise<Feedback[]> => {
  return FeedbackStorage.getByUserId(userId);
};

/**
 * Get feedbacks by type
 */
export const getFeedbacksByType = async (type: string): Promise<Feedback[]> => {
  return FeedbackStorage.getByType(type);
};

/**
 * Get feedback statistics
 */
export const getFeedbackStatistics = async (): Promise<{
  total: number;
  byType: { [key: string]: number };
  averageRating: number;
}> => {
  return FeedbackStorage.getStatistics();
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (id: string): Promise<Feedback | null> => {
  return StorageService.getById<Feedback>(STORAGE_KEYS.FEEDBACKS, id);
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.FEEDBACKS, id);
};
