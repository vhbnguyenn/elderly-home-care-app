import { StorageService, STORAGE_KEYS } from './storage.service';
import { ElderlyProfile } from './database.types';

/**
 * Get all elderly profiles for a user
 */
export const getElderlyProfiles = async (userId: string): Promise<ElderlyProfile[]> => {
  return StorageService.getByField<ElderlyProfile>(STORAGE_KEYS.ELDERLY_PROFILES, 'user_id', userId);
};

/**
 * Get elderly profile by ID
 */
export const getElderlyProfileById = async (id: string): Promise<ElderlyProfile | null> => {
  return StorageService.getById<ElderlyProfile>(STORAGE_KEYS.ELDERLY_PROFILES, id);
};

/**
 * Create a new elderly profile
 */
export const createElderlyProfile = async (profile: Omit<ElderlyProfile, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const id = `elderly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newProfile: ElderlyProfile = {
    ...profile,
    id,
  };
  
  await StorageService.create<ElderlyProfile>(STORAGE_KEYS.ELDERLY_PROFILES, newProfile);
  return id;
};

/**
 * Update elderly profile
 */
export const updateElderlyProfile = async (id: string, updates: Partial<ElderlyProfile>): Promise<boolean> => {
  const result = await StorageService.update<ElderlyProfile>(STORAGE_KEYS.ELDERLY_PROFILES, id, updates);
  return result !== null;
};

/**
 * Delete elderly profile
 */
export const deleteElderlyProfile = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.ELDERLY_PROFILES, id);
};
