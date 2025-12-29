import axios from 'axios';
import { API_CONFIG } from './config/api.config';

// Tạo axios instance với base URL
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để log
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📦 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để log
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.statusText);
    console.log('📊 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

