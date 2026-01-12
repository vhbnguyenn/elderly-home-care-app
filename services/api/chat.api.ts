import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

export interface ChatResponse {
  _id: string;
  participantId: string;
  // Add other fields as needed based on actual API response
}

export interface ChatParticipant {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  profileImage?: string;
}

export interface ChatLastMessage {
  content: string;
  sender: {
    _id: string;
    name: string;
  };
  timestamp: string;
}

export interface ChatListItem {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatLastMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatListResponse {
  success: boolean;
  count: number;
  data: ChatListItem[];
}

export interface ChatDetail {
  _id: string;
  participants: ChatParticipant[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatDetailResponse {
  success: boolean;
  data: ChatDetail;
}

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isDeleted: boolean;
}

export interface ChatMessagesResponse {
  success: boolean;
  count: number;
  data: ChatMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ChatAPI = {
  /**
   * Create or get existing chat conversation
   * @param participantId - ID of the participant to chat with
   * @returns Chat conversation object
   */
  createOrGetChat: async (participantId: string): Promise<ChatResponse> => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}/api/chats`,
        { participantId }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating/getting chat:", error);
      throw error;
    }
  },

  /**
   * Get all chats for current user
   * @returns List of chat conversations
   */
  getMyChats: async (): Promise<ChatListResponse> => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}/api/chats`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching chats:", error);
      throw error;
    }
  },

  /**
   * Get chat detail by ID
   * @param chatId - ID of the chat
   * @returns Chat detail
   */
  getChatDetail: async (chatId: string): Promise<ChatDetailResponse> => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}/api/chats/${chatId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching chat detail:", error);
      throw error;
    }
  },

  /**
   * Get messages for a chat
   * @param chatId - ID of the chat
   * @returns List of messages
   */
  getChatMessages: async (chatId: string): Promise<ChatMessagesResponse> => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}/api/chats/${chatId}/messages`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      throw error;
    }
  },

  /**
   * Send a message in a chat
   * @param chatId - ID of the chat
   * @param content - Message content
   * @returns Sent message
   */
  sendMessage: async (chatId: string, content: string): Promise<{ success: boolean; data: ChatMessage }> => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}/api/chats/${chatId}/messages`,
        { content }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};
