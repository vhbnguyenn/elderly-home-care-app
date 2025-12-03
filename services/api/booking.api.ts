import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Types
export interface Booking {
  id?: string;
  careseekerId?: string;
  caregiverId: string;
  elderlyProfileId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  serviceType: "hourly" | "daily" | "live-in" | "respite" | "specialized";
  serviceDetails?: string;
  totalHours?: number;
  totalCost: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "rejected";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: "cash" | "bank_transfer" | "e_wallet" | "credit_card";
  notes?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  address: string;
  city: string;
  district: string;
  caregiver?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
    specializations: string[];
  };
  elderly?: {
    id: string;
    fullName: string;
    age: number;
    healthConditions: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  caregiverId: string;
  elderlyProfileId: string;
  startDate: string;
  endDate: string;
  serviceType: Booking['serviceType'];
  serviceDetails?: string;
  totalHours?: number;
  totalCost: number;
  address: string;
  city: string;
  district: string;
  notes?: string;
  paymentMethod?: Booking['paymentMethod'];
}

export interface UpdateBookingStatusPayload {
  status: Booking['status'];
  reason?: string; // For cancellation or rejection
}

// Booking API Service
export const BookingAPI = {
  /**
   * Create new booking
   */
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.BOOKING.CREATE,
      payload
    );
    return response.data;
  },

  /**
   * Get bookings for caregiver
   */
  getCaregiverBookings: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Booking[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.BOOKING.GET_CAREGIVER_BOOKINGS,
      { params }
    );
    return response.data;
  },

  /**
   * Get bookings for careseeker
   */
  getCareseekerBookings: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Booking[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.BOOKING.GET_CARESEEKER_BOOKINGS,
      { params }
    );
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.BOOKING.GET_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update booking status
   */
  updateStatus: async (
    id: string,
    payload: UpdateBookingStatusPayload
  ): Promise<Booking> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.BOOKING.UPDATE_STATUS(id),
      payload
    );
    return response.data;
  },

  /**
   * Cancel booking
   */
  cancel: async (id: string, reason: string): Promise<Booking> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.BOOKING.CANCEL(id),
      { reason }
    );
    return response.data;
  },

  /**
   * Confirm booking (caregiver accepts)
   */
  confirm: async (id: string): Promise<Booking> => {
    return await BookingAPI.updateStatus(id, { status: "confirmed" });
  },

  /**
   * Reject booking (caregiver rejects)
   */
  reject: async (id: string, reason: string): Promise<Booking> => {
    return await BookingAPI.updateStatus(id, { 
      status: "rejected",
      reason 
    });
  },

  /**
   * Start booking (mark as in progress)
   */
  start: async (id: string): Promise<Booking> => {
    return await BookingAPI.updateStatus(id, { status: "in_progress" });
  },

  /**
   * Complete booking
   */
  complete: async (id: string): Promise<Booking> => {
    return await BookingAPI.updateStatus(id, { status: "completed" });
  },

  /**
   * Get upcoming bookings
   */
  getUpcoming: async (userType: "caregiver" | "careseeker"): Promise<Booking[]> => {
    const now = new Date().toISOString();
    const endpoint = userType === "caregiver" 
      ? BookingAPI.getCaregiverBookings 
      : BookingAPI.getCareseekerBookings;
    
    const response = await endpoint({
      status: "confirmed",
      startDate: now,
    });
    
    return response.data;
  },

  /**
   * Get booking history
   */
  getHistory: async (userType: "caregiver" | "careseeker"): Promise<Booking[]> => {
    const endpoint = userType === "caregiver" 
      ? BookingAPI.getCaregiverBookings 
      : BookingAPI.getCareseekerBookings;
    
    const response = await endpoint({
      status: "completed",
    });
    
    return response.data;
  },
};
