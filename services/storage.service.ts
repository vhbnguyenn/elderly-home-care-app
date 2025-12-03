import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'users',
  CAREGIVERS: 'caregivers',
  ELDERLY_PROFILES: 'elderly_profiles',
  APPOINTMENTS: 'appointments',
  CAREGIVER_AVAILABILITY: 'caregiver_availability',
  CAREGIVER_SCHEDULES: 'caregiver_schedules',
  FEEDBACKS: 'feedbacks',
  REVIEWS: 'reviews',
  COMPLAINTS: 'complaints',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  FAVORITE_CAREGIVERS: 'favorite_caregivers',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications',
  CURRENT_USER: 'current_user',
};

// Generic CRUD operations
export const StorageService = {
  // Get all items from a collection
  async getAll<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting all ${key}:`, error);
      return [];
    }
  },

  // Get single item by ID
  async getById<T extends { id: string }>(key: string, id: string): Promise<T | null> {
    try {
      const items = await this.getAll<T>(key);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting ${key} by ID:`, error);
      return null;
    }
  },

  // Get items by field value
  async getByField<T>(key: string, field: string, value: any): Promise<T[]> {
    try {
      const items = await this.getAll<T>(key);
      return items.filter(item => (item as any)[field] === value);
    } catch (error) {
      console.error(`Error getting ${key} by field:`, error);
      return [];
    }
  },

  // Create new item
  async create<T extends { id: string }>(key: string, item: T): Promise<T> {
    try {
      const items = await this.getAll<T>(key);
      const timestamp = new Date().toISOString();
      const newItem = {
        ...item,
        created_at: timestamp,
        updated_at: timestamp,
      };
      items.push(newItem);
      await AsyncStorage.setItem(key, JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error(`Error creating ${key}:`, error);
      throw error;
    }
  },

  // Update existing item
  async update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const items = await this.getAll<T>(key);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;

      const updatedItem = {
        ...items[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      items[index] = updatedItem;
      await AsyncStorage.setItem(key, JSON.stringify(items));
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      return null;
    }
  },

  // Delete item
  async delete(key: string, id: string): Promise<boolean> {
    try {
      const items = await this.getAll<any>(key);
      const filteredItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
      return false;
    }
  },

  // Clear all items in a collection
  async clearCollection(key: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error(`Error clearing ${key}:`, error);
      return false;
    }
  },

  // Clear all storage (for testing/reset)
  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all storage:', error);
      return false;
    }
  },

  // Get multiple items at once
  async getMultiple<T>(key: string, ids: string[]): Promise<T[]> {
    try {
      const items = await this.getAll<T>(key);
      return items.filter(item => ids.includes((item as any).id));
    } catch (error) {
      console.error(`Error getting multiple ${key}:`, error);
      return [];
    }
  },

  // Query with complex conditions
  async query<T>(key: string, predicate: (item: T) => boolean): Promise<T[]> {
    try {
      const items = await this.getAll<T>(key);
      return items.filter(predicate);
    } catch (error) {
      console.error(`Error querying ${key}:`, error);
      return [];
    }
  },

  // Count items
  async count(key: string): Promise<number> {
    try {
      const items = await this.getAll<any>(key);
      return items.length;
    } catch (error) {
      console.error(`Error counting ${key}:`, error);
      return 0;
    }
  },

  // Check if item exists
  async exists(key: string, id: string): Promise<boolean> {
    try {
      const item = await this.getById(key, id);
      return item !== null;
    } catch (error) {
      console.error(`Error checking existence in ${key}:`, error);
      return false;
    }
  },

  // Batch operations
  async batchCreate<T extends { id: string }>(key: string, items: T[]): Promise<T[]> {
    try {
      const existingItems = await this.getAll<T>(key);
      const timestamp = new Date().toISOString();
      const newItems = items.map(item => ({
        ...item,
        created_at: timestamp,
        updated_at: timestamp,
      }));
      await AsyncStorage.setItem(key, JSON.stringify([...existingItems, ...newItems]));
      return newItems;
    } catch (error) {
      console.error(`Error batch creating ${key}:`, error);
      throw error;
    }
  },

  // Set entire collection (replace all)
  async setAll<T>(key: string, items: T[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error(`Error setting all ${key}:`, error);
      return false;
    }
  },
};

// Specific storage methods for common operations
export const UserStorage = {
  async getCurrentUser() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  async setCurrentUser(user: any) {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  async clearCurrentUser() {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async findByEmail(email: string) {
    const users = await StorageService.getAll<any>(STORAGE_KEYS.USERS);
    return users.find(user => user.email === email) || null;
  },

  async findByPhone(phone: string) {
    const users = await StorageService.getAll<any>(STORAGE_KEYS.USERS);
    return users.find(user => user.phone === phone) || null;
  },
};

export const CaregiverStorage = {
  async getAvailable() {
    return StorageService.query<any>(STORAGE_KEYS.CAREGIVERS, caregiver => caregiver.is_available);
  },

  async getVerified() {
    return StorageService.query<any>(STORAGE_KEYS.CAREGIVERS, caregiver => caregiver.is_verified);
  },

  async searchBySpecialization(specialization: string) {
    const caregivers = await StorageService.getAll<any>(STORAGE_KEYS.CAREGIVERS);
    return caregivers.filter(caregiver => 
      caregiver.specializations?.includes(specialization)
    );
  },

  async getTopRated(limit: number = 10) {
    const caregivers = await StorageService.getAll<any>(STORAGE_KEYS.CAREGIVERS);
    return caregivers
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },
};

export const AppointmentStorage = {
  async getByUserId(userId: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.APPOINTMENTS, 'user_id', userId);
  },

  async getByCaregiverId(caregiverId: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.APPOINTMENTS, 'caregiver_id', caregiverId);
  },

  async getByStatus(status: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.APPOINTMENTS, 'status', status);
  },

  async getUpcoming(userId: string) {
    const appointments = await this.getByUserId(userId);
    const now = new Date();
    return appointments.filter(apt => {
      const startDate = new Date(apt.start_date);
      return startDate > now && ['pending', 'confirmed'].includes(apt.status);
    });
  },

  async getPast(userId: string) {
    const appointments = await this.getByUserId(userId);
    const now = new Date();
    return appointments.filter(apt => {
      const startDate = new Date(apt.start_date);
      return startDate <= now || apt.status === 'completed';
    });
  },
};

export const AvailabilityStorage = {
  async getByCaregiverId(caregiverId: string) {
    return StorageService.getByField<any>(
      STORAGE_KEYS.CAREGIVER_AVAILABILITY,
      'caregiver_id',
      caregiverId
    );
  },

  async getByDayOfWeek(caregiverId: string, dayOfWeek: number) {
    const availabilities = await this.getByCaregiverId(caregiverId);
    return availabilities.filter(av => av.day_of_week === dayOfWeek && av.is_active);
  },
};

export const ScheduleStorage = {
  async getByCaregiverId(caregiverId: string) {
    return StorageService.getByField<any>(
      STORAGE_KEYS.CAREGIVER_SCHEDULES,
      'caregiver_id',
      caregiverId
    );
  },

  async getByDate(caregiverId: string, date: string) {
    const schedules = await this.getByCaregiverId(caregiverId);
    return schedules.filter(schedule => schedule.date === date);
  },

  async getByAppointmentId(appointmentId: string) {
    return StorageService.getByField<any>(
      STORAGE_KEYS.CAREGIVER_SCHEDULES,
      'appointment_id',
      appointmentId
    );
  },
};

export const FeedbackStorage = {
  async getByAppointmentId(appointmentId: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.FEEDBACKS, 'appointment_id', appointmentId);
  },

  async getByUserId(userId: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.FEEDBACKS, 'user_id', userId);
  },

  async getByType(type: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.FEEDBACKS, 'type', type);
  },

  async getStatistics() {
    const feedbacks = await StorageService.getAll<any>(STORAGE_KEYS.FEEDBACKS);
    const total = feedbacks.length;
    const byType = feedbacks.reduce((acc: any, fb: any) => {
      acc[fb.type] = (acc[fb.type] || 0) + 1;
      return acc;
    }, {});
    const averageRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / total;

    return { total, byType, averageRating };
  },
};

export const NotificationStorage = {
  async getByUserId(userId: string) {
    return StorageService.getByField<any>(STORAGE_KEYS.NOTIFICATIONS, 'user_id', userId);
  },

  async getUnread(userId: string) {
    const notifications = await this.getByUserId(userId);
    return notifications.filter(n => !n.is_read);
  },

  async markAsRead(notificationId: string) {
    return StorageService.update<any>(STORAGE_KEYS.NOTIFICATIONS, notificationId, { is_read: true });
  },

  async markAllAsRead(userId: string) {
    const notifications = await this.getByUserId(userId);
    const updates = notifications.map(n => 
      StorageService.update<any>(STORAGE_KEYS.NOTIFICATIONS, n.id, { is_read: true })
    );
    await Promise.all(updates);
  },
};

export { STORAGE_KEYS };
