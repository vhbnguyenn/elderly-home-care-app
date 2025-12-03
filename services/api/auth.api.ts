import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Types
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: "caregiver" | "careseeker";
  dateOfBirth?: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    avatar?: string;
    isVerified?: boolean;
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

// Auth API Service
export const AuthAPI = {
  /**
   * Register new user
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      payload
    );
    
    // Save token and user data
    if (response.data.token) {
      await AsyncStorage.setItem("auth_token", response.data.token);
      if (response.data.refreshToken) {
        await AsyncStorage.setItem("refresh_token", response.data.refreshToken);
      }
      await AsyncStorage.setItem("user_data", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Login user
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      payload
    );

    // Save token and user data
    if (response.data.token) {
      await AsyncStorage.setItem("auth_token", response.data.token);
      if (response.data.refreshToken) {
        await AsyncStorage.setItem("refresh_token", response.data.refreshToken);
      }
      await AsyncStorage.setItem("user_data", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage regardless of API call result
      await AsyncStorage.multiRemove([
        "auth_token",
        "refresh_token",
        "user_data",
      ]);
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    );
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      payload
    );
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    // Update token in storage
    if (response.data.token) {
      await AsyncStorage.setItem("auth_token", response.data.token);
    }

    return response.data;
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Get current token from storage
   */
  getToken: async () => {
    return await AsyncStorage.getItem("auth_token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem("auth_token");
    return !!token;
  },
};
