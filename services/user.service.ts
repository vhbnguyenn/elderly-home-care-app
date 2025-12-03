import { StorageService, UserStorage, STORAGE_KEYS } from './storage.service';

export const UserService = {
  getAllUsers: async () => {
    return StorageService.getAll(STORAGE_KEYS.USERS);
  },
  
  getUserById: async (id: string) => {
    return StorageService.getById(STORAGE_KEYS.USERS, id);
  },
  
  getUserByEmail: async (email: string) => {
    return UserStorage.findByEmail(email);
  },
  
  getUserByPhone: async (phone: string) => {
    return UserStorage.findByPhone(phone);
  },
  
  createUser: async (user: any) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return StorageService.create(STORAGE_KEYS.USERS, { ...user, id });
  },
  
  updateUser: async (id: string, updates: any) => {
    return StorageService.update(STORAGE_KEYS.USERS, id, updates);
  },
  
  deleteUser: async (id: string) => {
    return StorageService.delete(STORAGE_KEYS.USERS, id);
  },
};
