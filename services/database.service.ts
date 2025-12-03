import { StorageService } from './storage.service';

/**
 * Initialize storage - ensures all collections are created
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    console.log('Initializing AsyncStorage...');
    // Storage is automatically available, no initialization needed
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

/**
 * Get storage service (kept for compatibility with existing code)
 */
export const getDatabase = async (): Promise<typeof StorageService> => {
  return StorageService;
};

/**
 * Close database (no-op for AsyncStorage, kept for compatibility)
 */
export const closeDatabase = async (): Promise<void> => {
  console.log('AsyncStorage does not require closing');
};

/**
 * Reset all data (for testing)
 */
export const resetDatabase = async (): Promise<boolean> => {
  try {
    await StorageService.clearAll();
    console.log('All storage cleared successfully');
    return true;
  } catch (error) {
    console.error('Error resetting storage:', error);
    return false;
  }
};

// Export storage service for direct access
export { StorageService };
