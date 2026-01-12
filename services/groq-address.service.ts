// Groq AI Service for Address Parsing (via Backend)
import axiosInstance from './axiosInstance';
import { API_CONFIG } from './config/api.config';

export interface ParsedAddress {
  street?: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  districtCode?: string;
  province?: string;
  provinceCode?: string;
  fullAddress: string;
  confidence: number; // 0-1
}

class GroqAddressService {
  /**
   * Parse natural language address into structured components via Backend API
   * Endpoint: POST /api/parse-address
   * Example: "123 Nguyễn Huệ quận 1 Hồ Chí Minh" 
   * → { street: "123 Nguyễn Huệ", district: "Quận 1", province: "TP. Hồ Chí Minh" }
   */
  async parseAddress(addressText: string): Promise<ParsedAddress> {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.ADDRESS.PARSE,
        { text: addressText }
      );

      return response.data;
    } catch (error) {
      console.error('[GroqAddress] Parse error:', error);
      throw new Error('Không thể phân tích địa chỉ. Vui lòng thử lại.');
    }
  }

  /**
   * Get address suggestions from partial input via Backend API
   * Endpoint: POST /api/parse-address/suggestions
   */
  async suggestAddress(partialAddress: string): Promise<string[]> {
    try {
      console.log('[GroqAddress] 📤 Requesting suggestions for:', partialAddress);
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.ADDRESS.SUGGESTIONS,
        { text: partialAddress }
      );

      console.log('[GroqAddress] 📥 Raw response:', JSON.stringify(response.data, null, 2));
      console.log('[GroqAddress] 📥 Response type:', typeof response.data);
      console.log('[GroqAddress] 📥 Is Array?', Array.isArray(response.data));
      console.log('[GroqAddress] 📥 Has suggestions key?', 'suggestions' in (response.data || {}));
      
      // Try different response formats
      if (Array.isArray(response.data)) {
        console.log('[GroqAddress] ✅ Direct array format');
        return response.data;
      } else if (response.data?.suggestions && Array.isArray(response.data.suggestions)) {
        console.log('[GroqAddress] ✅ Nested suggestions format');
        return response.data.suggestions;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('[GroqAddress] ✅ Nested data format');
        return response.data.data;
      }
      
      console.warn('[GroqAddress] ⚠️ Unknown response format, returning empty');
      return [];
    } catch (error) {
      console.error('[GroqAddress] Suggest error:', error);
      return [];
    }
  }
}

export const groqAddressService = new GroqAddressService();

