// auth.service.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "./axiosInstance";
import { API_CONFIG } from "./config/api.config";

export const AuthService = {
  // Login: Call real API
  login: async (email: string, password: string) => {
    try {
      console.log("[Auth] Attempting login:", email);
      
      const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      console.log("[Auth] Login response:", response.data);

      // Handle different response formats - API returns nested structure
      const responseData = response.data.data || response.data;
      const token = responseData.accessToken || responseData.token;
      const refreshToken = responseData.refreshToken;
      const user = responseData.user || responseData;

      // Debug logging
      console.log("[Auth] 🔍 Response data:", responseData);
      console.log("[Auth] 🔑 Token found:", !!token);
      console.log("[Auth] 🔄 RefreshToken found:", !!refreshToken);
      console.log("[Auth] 👤 User data found:", !!user);
      if (token) {
        console.log("[Auth] 🔑 Token preview:", token.substring(0, 30) + "...");
      }

      // Save tokens to AsyncStorage
      if (token) {
        await AsyncStorage.setItem("auth_token", token);
        console.log("[Auth] ✅ Token saved to AsyncStorage");
      } else {
        console.log("[Auth] ⚠️ No token to save!");
      }
      if (refreshToken) {
        await AsyncStorage.setItem("refresh_token", refreshToken);
        console.log("[Auth] ✅ RefreshToken saved to AsyncStorage");
      }
      if (user) {
        await AsyncStorage.setItem("user_data", JSON.stringify(user));
        console.log("[Auth] ✅ User data saved to AsyncStorage");
      }

      console.log("[Auth] Login successful - User object:", user);
      
      // Return only the user object, not the entire response with tokens
      return user;
    } catch (error: any) {
      // Return error object with message for better error handling
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Đăng nhập thất bại";
      
      // Only log errors that are NOT email verification issues (to avoid showing black toast)
      // Disabled console.error to hide gray toast
      // if (!errorMessage.includes("xác minh") && !errorMessage.includes("verify")) {
      //   console.error("[Auth] Login failed:", error.response?.data || error.message);
      // }
      
      throw new Error(errorMessage);
    }
  },

  // Register: Call real API
  register: async (payload: any) => {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        payload
      );

      console.log("[Auth] Register successful:", response.data);
      return response.data;
    } catch (error: any) {
      // Disabled console.error to hide gray toast
      // console.error("[Auth] Register failed:", error.response?.data || error.message);
      
      // Return error object with message for better error handling
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
    }
  },

  // Logout: Call real API and clear local storage
  logout: async () => {
    try {
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Disabled console.error to hide gray toast
      // console.error("[Auth] Logout API failed:", error);
    } finally {
      // Clear local storage regardless of API result
      await AsyncStorage.multiRemove(["auth_token", "refresh_token", "user_data"]);
      console.log("[Auth] Logged out and cleared storage");
    }
  },

  // Get current user from storage
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      // Disabled console.error to hide gray toast
      // console.error("[Auth] Get current user failed:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return !!token;
  },
};
