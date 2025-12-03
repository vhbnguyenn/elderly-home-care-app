import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG, HTTP_STATUS } from "./config/api.config";
import { router } from "expo-router";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      
      return config;
    } catch (error) {
      console.error("[Request Interceptor Error]", error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error
    console.error(
      `[API Error] ${error.response?.status || 'Network Error'} ${originalRequest?.url}`,
      error.response?.data
    );

    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken }
          );

          const { token } = response.data;
          await AsyncStorage.setItem("auth_token", token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("[Token Refresh Error]", refreshError);
      }

      // If refresh fails, clear auth and redirect to login
      await AsyncStorage.multiRemove(["auth_token", "refresh_token", "user_data"]);
      
      // Redirect to login (only if not already on login page)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        router.replace('/login');
      }
    }

    // Handle other error codes
    const errorMessage = 
      (error.response?.data as any)?.message || 
      error.message || 
      "Đã xảy ra lỗi. Vui lòng thử lại.";

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default axiosInstance;
