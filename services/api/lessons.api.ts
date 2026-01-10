import apiClient from '../apiClient';
import { API_CONFIG } from '../config/api.config';

// Interfaces
export interface LessonModule {
  _id: string;
  course: {
    _id: string;
    title: string;
    isPublished: boolean;
  };
  title: string;
  order: number;
}

export interface Lesson {
  _id: string;
  module: LessonModule;
  title: string;
  description: string;
  content: string; // HTML content
  videoUrl: string;
  duration: number; // in seconds
  learningObjectives: string[];
  order: number;
  isActive: boolean;
  resources: any[];
  createdAt: string;
  updatedAt: string;
}

export interface NextLesson {
  _id: string;
  title: string;
}

export interface LessonDetailResponse {
  success: boolean;
  data: {
    lesson: Lesson;
    nextLesson: NextLesson | null;
  };
}

export const LessonsAPI = {
  /**
   * Get lesson by ID
   */
  getLessonById: async (lessonId: string): Promise<LessonDetailResponse> => {
    const response = await apiClient.get<LessonDetailResponse>(
      API_CONFIG.ENDPOINTS.LESSONS.GET_BY_ID(lessonId)
    );
    return response.data;
  },

  /**
   * Mark lesson as completed
   */
  completeLesson: async (lessonId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.LESSONS.COMPLETE(lessonId)
    );
    return response.data;
  },
};
