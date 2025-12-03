import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Types
export interface ElderlyProfile {
  id?: string;
  userId?: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  healthConditions: string[];
  allergies?: string[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    notes?: string;
  }[];
  mobilityLevel: "independent" | "assisted" | "wheelchair" | "bedridden";
  cognitiveStatus: "normal" | "mild_impairment" | "moderate_impairment" | "severe_impairment";
  specialNeeds?: string[];
  dietaryRestrictions?: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
    address?: string;
  };
  address?: string;
  city?: string;
  district?: string;
  notes?: string;
  avatar?: string;
  weight?: number;
  height?: number;
  bloodType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateElderlyPayload extends Omit<ElderlyProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

export interface UpdateElderlyPayload extends Partial<CreateElderlyPayload> {}

// Elderly API Service
export const ElderlyAPI = {
  /**
   * Create elderly profile
   */
  create: async (payload: CreateElderlyPayload): Promise<ElderlyProfile> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.ELDERLY.CREATE,
      payload
    );
    return response.data;
  },

  /**
   * Get all elderly profiles of current user
   */
  getAll: async (): Promise<ElderlyProfile[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.ELDERLY.GET_ALL
    );
    return response.data;
  },

  /**
   * Get elderly profile by ID
   */
  getById: async (id: string): Promise<ElderlyProfile> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.ELDERLY.GET_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update elderly profile
   */
  update: async (id: string, payload: UpdateElderlyPayload): Promise<ElderlyProfile> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.ELDERLY.UPDATE(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete elderly profile
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.ELDERLY.DELETE(id)
    );
    return response.data;
  },

  /**
   * Add medication to elderly profile
   */
  addMedication: async (
    id: string,
    medication: ElderlyProfile['medications'][0]
  ): Promise<ElderlyProfile> => {
    const profile = await ElderlyAPI.getById(id);
    const updatedMedications = [...(profile.medications || []), medication];
    
    return await ElderlyAPI.update(id, {
      medications: updatedMedications,
    });
  },

  /**
   * Remove medication from elderly profile
   */
  removeMedication: async (
    id: string,
    medicationName: string
  ): Promise<ElderlyProfile> => {
    const profile = await ElderlyAPI.getById(id);
    const updatedMedications = (profile.medications || []).filter(
      (med) => med.name !== medicationName
    );
    
    return await ElderlyAPI.update(id, {
      medications: updatedMedications,
    });
  },

  /**
   * Update emergency contact
   */
  updateEmergencyContact: async (
    id: string,
    emergencyContact: ElderlyProfile['emergencyContact']
  ): Promise<ElderlyProfile> => {
    return await ElderlyAPI.update(id, { emergencyContact });
  },
};
