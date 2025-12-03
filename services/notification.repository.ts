import { StorageService, NotificationStorage, STORAGE_KEYS } from './storage.service';
import { Notification } from './database.types';

/**
 * Create a new notification
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<string> => {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newNotification: Notification = {
    ...notification,
    id,
    is_read: false,
  };
  
  await StorageService.create<Notification>(STORAGE_KEYS.NOTIFICATIONS, newNotification);
  return id;
};

/**
 * Get notifications by user ID
 */
export const getNotificationsByUser = async (userId: string): Promise<Notification[]> => {
  return NotificationStorage.getByUserId(userId);
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  return NotificationStorage.getUnread(userId);
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  return NotificationStorage.markAsRead(id);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  return NotificationStorage.markAllAsRead(userId);
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.NOTIFICATIONS, id);
};

/**
 * Clear all notifications for a user
 */
export const clearUserNotifications = async (userId: string): Promise<void> => {
  const notifications = await getNotificationsByUser(userId);
  for (const notification of notifications) {
    await deleteNotification(notification.id);
  }
};
