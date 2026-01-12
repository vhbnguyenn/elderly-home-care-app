import Constants from 'expo-constants';
import * as Device from 'expo-device';
import apiClient from '../apiClient';
import { API_CONFIG } from '../config/api.config';

// Feedback Interfaces
export interface FeedbackAttachment {
  url: string;
  type: 'image' | 'video' | 'document';
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  osVersion: string;
  deviceModel: string;
}

export interface FeedbackRequest {
  feedbackType: 'bug_report' | 'feature_request' | 'general_feedback' | 'suggestion';
  category: 'booking' | 'payment' | 'profile' | 'ui' | 'performance' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  attachments?: FeedbackAttachment[];
  deviceInfo: DeviceInfo;
  satisfactionRating?: number;
  tags?: string[];
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data: any;
}

// Get device information
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const platform = Device.osName?.toLowerCase() === 'ios' ? 'ios' : 
                   Device.osName?.toLowerCase().includes('android') ? 'android' : 'web';
  
  return {
    platform,
    appVersion: Constants.expoConfig?.version || '1.0.0',
    osVersion: Device.osVersion || 'Unknown',
    deviceModel: Device.modelName || 'Unknown',
  };
};

export const FeedbackAPI = {
  /**
   * Submit system feedback
   */
  submitFeedback: async (feedback: FeedbackRequest): Promise<FeedbackResponse> => {
    const response = await apiClient.post<FeedbackResponse>(
      API_CONFIG.ENDPOINTS.FEEDBACK.SUBMIT,
      feedback
    );
    return response.data;
  },
};
