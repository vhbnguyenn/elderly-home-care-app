import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Course Interfaces
export interface CourseInstructor {
  name: string;
  title: string;
  avatar: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: CourseInstructor;
  level: string;
  duration: number;
  totalLessons: number;
  totalModules: number;
  enrollmentCount: number;
  isPublished: boolean;
  isActive: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  enrollment: any | null;
  isEnrolled: boolean;
}

export interface CoursesResponse {
  success: boolean;
  count: number;
  data: Course[];
}

export interface LessonProgress {
  _id: string;
  enrollment: string;
  lesson: {
    _id: string;
    module: {
      _id: string;
      title: string;
      order: number;
    };
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    duration: number;
    learningObjectives: string[];
    order: number;
    isActive: boolean;
    resources: any[];
    createdAt: string;
    updatedAt: string;
  };
  user: string;
  isCompleted: boolean;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  videoProgress: {
    currentTime: number;
    watchPercentage: number;
  };
}

export interface CourseProgress {
  enrollment: {
    _id: string;
    user: string;
    course: Course;
    status: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    enrolledAt: string;
    lastAccessedAt: string;
    createdAt: string;
    updatedAt: string;
    certificate: {
      issued: boolean;
    };
  };
  lessons: LessonProgress[];
}

export interface CourseProgressResponse {
  success: boolean;
  data: CourseProgress;
}

// Courses API Service
export const CoursesAPI = {
  /**
   * Get all courses
   */
  getCourses: async () => {
    try {
      const response = await axiosInstance.get<CoursesResponse>(
        API_CONFIG.ENDPOINTS.COURSES.GET_ALL
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: string) => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.COURSES.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  /**
   * Enroll in a course
   */
  enrollCourse: async (courseId: string) => {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.COURSES.ENROLL(courseId)
      );
      return response.data;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  },

  /**
   * Get my enrolled courses
   */
  getMyEnrollments: async () => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.COURSES.MY_ENROLLMENTS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching my enrollments:", error);
      throw error;
    }
  },

  /**
   * Get course progress
   */
  getCourseProgress: async (courseId: string): Promise<CourseProgressResponse> => {
    try {
      const response = await axiosInstance.get<CourseProgressResponse>(
        API_CONFIG.ENDPOINTS.COURSES.GET_PROGRESS(courseId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course progress:", error);
      throw error;
    }
  },
};
