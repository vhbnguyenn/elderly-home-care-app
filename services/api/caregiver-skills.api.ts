import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Skill Interface
export interface CaregiverSkill {
  _id: string;
  name: string;
  description: string;
  icon: string;
  caregiverId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSkillInput {
  name: string;
  description: string;
  icon: string;
}

export interface UpdateSkillInput {
  name?: string;
  description?: string;
  icon?: string;
  isDisplayedOnProfile?: boolean;
}

// Caregiver Skills API Service
export const CaregiverSkillsAPI = {
  /**
   * Create a new skill for the current caregiver
   */
  createSkill: async (skillData: CreateSkillInput) => {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.CAREGIVER_SKILLS.CREATE,
        skillData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating caregiver skill:", error);
      throw error;
    }
  },

  /**
   * Get all skills for the current caregiver
   */
  getMySkills: async () => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.CAREGIVER_SKILLS.GET_MY_SKILLS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching my skills:", error);
      throw error;
    }
  },

  /**
   * Update a skill by ID
   */
  updateSkill: async (skillId: string, skillData: UpdateSkillInput) => {
    try {
      const response = await axiosInstance.put(
        API_CONFIG.ENDPOINTS.CAREGIVER_SKILLS.UPDATE(skillId),
        skillData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating skill:", error);
      throw error;
    }
  },

  /**
   * Delete a skill by ID
   */
  deleteSkill: async (skillId: string) => {
    try {
      const response = await axiosInstance.delete(
        API_CONFIG.ENDPOINTS.CAREGIVER_SKILLS.DELETE(skillId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting skill:", error);
      throw error;
    }
  },

  /**
   * Toggle skill display on profile (toggle isDisplayedOnProfile)
   */
  toggleSkillDisplay: async (skillId: string) => {
    try {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.CAREGIVER_SKILLS.TOGGLE_DISPLAY(skillId)
      );
      return response.data;
    } catch (error) {
      console.error("Error toggling skill display:", error);
      throw error;
    }
  },
};
