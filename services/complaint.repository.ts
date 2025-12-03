import { StorageService, STORAGE_KEYS } from './storage.service';
import { Complaint } from './database.types';

/**
 * Create a new complaint
 */
export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const id = `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newComplaint: Complaint = {
    ...complaint,
    id,
    status: complaint.status || 'pending',
    priority: complaint.priority || 'medium',
  };
  
  await StorageService.create<Complaint>(STORAGE_KEYS.COMPLAINTS, newComplaint);
  return id;
};

/**
 * Get complaints by user ID
 */
export const getComplaintsByUser = async (userId: string): Promise<Complaint[]> => {
  return StorageService.getByField<Complaint>(STORAGE_KEYS.COMPLAINTS, 'user_id', userId);
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (id: string): Promise<Complaint | null> => {
  return StorageService.getById<Complaint>(STORAGE_KEYS.COMPLAINTS, id);
};

/**
 * Update complaint
 */
export const updateComplaint = async (id: string, updates: Partial<Complaint>): Promise<boolean> => {
  const result = await StorageService.update<Complaint>(STORAGE_KEYS.COMPLAINTS, id, updates);
  return result !== null;
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (id: string, status: string, response?: string): Promise<boolean> => {
  const updates: Partial<Complaint> = { status: status as any };
  if (response) {
    updates.response = response;
  }
  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  }
  return updateComplaint(id, updates);
};

/**
 * Delete complaint
 */
export const deleteComplaint = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.COMPLAINTS, id);
};
