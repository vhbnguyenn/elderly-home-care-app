import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import { API_CONFIG, HTTP_STATUS } from "./config/api.config";

// Public endpoints that don't require authentication
// These endpoints should not send tokens and should not trigger token refresh on 401
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/verify-code',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh-token',
  '/api/caregivers',
  '/api/match/caregivers',
  // Also match without /api prefix for flexibility
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/verify-code',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh-token'
];

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
      // Debug logging
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      
      // Check if this is a public endpoint that doesn't need authentication
      const shouldSkipToken = PUBLIC_ENDPOINTS.some(endpoint => config.url?.includes(endpoint));
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosInstance.ts:35',message:'Request Interceptor - URL Check',data:{url:config.url,shouldSkipToken,publicEndpoints:PUBLIC_ENDPOINTS},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'PATTERN_BUG'})}).catch(()=>{});
      // #endregion
      
      if (shouldSkipToken) {
        console.log(`[Token Debug] Public endpoint, skipping token`);
        return config;
      }
      
      const token = await AsyncStorage.getItem("auth_token");
      console.log(`[Token Debug] Token exists: ${!!token}`);
      if (token) {
        console.log(`[Token Debug] Token preview: ${token.substring(0, 20)}...`);
      }
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[Token Debug] Authorization header set`);
      } else {
        console.log(`[Token Debug] No token or headers, skipping Authorization`);
      }
      
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
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosInstance.ts:69',message:'Response Interceptor SUCCESS',data:{status:response.status,url:response.config.url,hasData:!!response.data,dataKeys:response.data?Object.keys(response.data):null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    return response;
  },
  async (error: AxiosError) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/0c807517-a964-4a11-887b-91a3baa99795',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosInstance.ts:75',message:'Response Interceptor ERROR',data:{status:error.response?.status,url:error.config?.url,hasResponse:!!error.response,responseData:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error (disabled console.error to hide gray toast)
    // console.error(
    //   `[API Error] ${error.response?.status || 'Network Error'} ${originalRequest?.url}`,
    //   error.response?.data
    // );

    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      // Don't try to refresh token for public endpoints (login, register, etc.)
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => originalRequest.url?.includes(endpoint));
      
      if (isPublicEndpoint) {
        // Just return the error for public endpoints
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

      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken }
          );

          // Backend returns: { success: true, data: { accessToken, refreshToken } }
          const responseData = response.data.data || response.data;
          const newAccessToken = responseData.accessToken || responseData.token;
          
          if (!newAccessToken) {
            console.error("[Token Refresh] No accessToken in response:", response.data);
            throw new Error("No access token in refresh response");
          }

          // Only save if newAccessToken is valid
          if (newAccessToken && typeof newAccessToken === 'string') {
            await AsyncStorage.setItem("auth_token", newAccessToken);
            console.log("[Token Refresh] ✅ New token saved");
          } else {
            throw new Error("Invalid access token received");
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No refresh token available");
        }
      } catch (refreshError) {
        console.error("[Token Refresh Error]", refreshError);
        
        // If refresh fails, clear auth and redirect to login
        await AsyncStorage.multiRemove(["auth_token", "refresh_token", "user_data"]);
        
        // Redirect to login (only if not already on login page)
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          router.replace('/login');
        }
        
        // Re-throw error to be handled by caller
        return Promise.reject(error);
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
