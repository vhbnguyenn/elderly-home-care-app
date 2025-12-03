import { StorageService, CaregiverStorage, STORAGE_KEYS } from './storage.service';
import { Caregiver } from './database.types';

/**
 * Get all caregivers
 */
export const getAllCaregivers = async (): Promise<Caregiver[]> => {
  return StorageService.getAll<Caregiver>(STORAGE_KEYS.CAREGIVERS);
};

/**
 * Get caregiver by ID
 */
export const getCaregiverById = async (id: string): Promise<Caregiver | null> => {
  return StorageService.getById<Caregiver>(STORAGE_KEYS.CAREGIVERS, id);
};

/**
 * Get available caregivers
 */
export const getAvailableCaregivers = async (): Promise<Caregiver[]> => {
  return CaregiverStorage.getAvailable();
};

/**
 * Get verified caregivers
 */
export const getVerifiedCaregivers = async (): Promise<Caregiver[]> => {
  return CaregiverStorage.getVerified();
};

/**
 * Search caregivers by specialization
 */
export const searchCaregiversBySpecialization = async (specialization: string): Promise<Caregiver[]> => {
  return CaregiverStorage.searchBySpecialization(specialization);
};

/**
 * Get top rated caregivers
 */
export const getTopRatedCaregivers = async (limit: number = 10): Promise<Caregiver[]> => {
  return CaregiverStorage.getTopRated(limit);
};

/**
 * Create a new caregiver
 */
export const createCaregiver = async (caregiver: Omit<Caregiver, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const id = `caregiver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newCaregiver: Caregiver = {
    ...caregiver,
    id,
    rating: caregiver.rating || 0,
    total_reviews: caregiver.total_reviews || 0,
    is_verified: caregiver.is_verified || false,
    is_available: caregiver.is_available ?? true,
  };
  
  await StorageService.create<Caregiver>(STORAGE_KEYS.CAREGIVERS, newCaregiver);
  return id;
};

/**
 * Update caregiver
 */
export const updateCaregiver = async (id: string, updates: Partial<Caregiver>): Promise<boolean> => {
  const result = await StorageService.update<Caregiver>(STORAGE_KEYS.CAREGIVERS, id, updates);
  return result !== null;
};

/**
 * Update caregiver rating
 */
export const updateCaregiverRating = async (id: string, newRating: number): Promise<boolean> => {
  const caregiver = await getCaregiverById(id);
  if (!caregiver) return false;
  
  const totalReviews = caregiver.total_reviews + 1;
  const rating = ((caregiver.rating * caregiver.total_reviews) + newRating) / totalReviews;
  
  return updateCaregiver(id, { rating, total_reviews: totalReviews });
};

/**
 * Toggle caregiver availability
 */
export const toggleCaregiverAvailability = async (id: string): Promise<boolean> => {
  const caregiver = await getCaregiverById(id);
  if (!caregiver) return false;
  
  return updateCaregiver(id, { is_available: !caregiver.is_available });
};

/**
 * Delete caregiver
 */
export const deleteCaregiver = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.CAREGIVERS, id);
};
