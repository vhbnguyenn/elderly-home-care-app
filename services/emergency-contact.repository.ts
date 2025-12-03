import { StorageService, STORAGE_KEYS } from './storage.service';
import { EmergencyContact } from './database.types';

/**
 * Get all emergency contacts for a user
 */
export const getEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
  return StorageService.getByField<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, 'user_id', userId);
};

/**
 * Get emergency contacts for an elderly profile
 */
export const getEmergencyContactsByElderlyProfile = async (elderlyProfileId: string): Promise<EmergencyContact[]> => {
  return StorageService.getByField<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, 'elderly_profile_id', elderlyProfileId);
};

/**
 * Get primary emergency contact
 */
export const getPrimaryEmergencyContact = async (userId: string): Promise<EmergencyContact | null> => {
  const contacts = await getEmergencyContacts(userId);
  return contacts.find(c => c.is_primary) || null;
};

/**
 * Create a new emergency contact
 */
export const createEmergencyContact = async (contact: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const id = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // If this is marked as primary, unset other primary contacts
  if (contact.is_primary) {
    const existingContacts = await getEmergencyContacts(contact.user_id);
    for (const existing of existingContacts) {
      if (existing.is_primary) {
        await updateEmergencyContact(existing.id, { is_primary: false });
      }
    }
  }
  
  const newContact: EmergencyContact = {
    ...contact,
    id,
  };
  
  await StorageService.create<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, newContact);
  return id;
};

/**
 * Update emergency contact
 */
export const updateEmergencyContact = async (id: string, updates: Partial<EmergencyContact>): Promise<boolean> => {
  // If setting as primary, unset other primary contacts
  if (updates.is_primary) {
    const contact = await StorageService.getById<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, id);
    if (contact) {
      const existingContacts = await getEmergencyContacts(contact.user_id);
      for (const existing of existingContacts) {
        if (existing.id !== id && existing.is_primary) {
          await StorageService.update<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, existing.id, { is_primary: false });
        }
      }
    }
  }
  
  const result = await StorageService.update<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, id, updates);
  return result !== null;
};

/**
 * Delete emergency contact
 */
export const deleteEmergencyContact = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.EMERGENCY_CONTACTS, id);
};
