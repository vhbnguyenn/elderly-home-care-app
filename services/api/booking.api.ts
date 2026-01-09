import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "../config/api.config";

// Detailed booking response with all populated fields
export interface BookingDetail {
  _id: string;
  careseeker: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  caregiver: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  caregiverProfile: {
    _id: string;
    yearsOfExperience?: number;
    education?: string;
    certificates?: Array<{
      name: string;
      issueDate?: string;
      expirationDate?: string;
      issuingOrganization?: string;
      certificateType?: string;
      certificateImage?: string;
      _id?: string;
    }>;
    profileImage?: string;
    bio?: string;
  };
  elderlyProfile: {
    _id: string;
    careseeker: string;
    fullName: string;
    age: number;
    gender: string;
    address: string;
    phone: string;
    avatar?: string;
    bloodType?: string;
    medicalConditions?: string[];
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      allergies?: string;
      _id?: string;
    }>;
    allergies?: string;
    selfCareActivities?: Array<{
      activity: string;
      needHelp: boolean;
      _id?: string;
    }>;
    specialNotes?: string;
    livingEnvironment?: {
      type: string;
      hasFamily: boolean;
      familyNote?: string;
    };
    preferences?: {
      hobbies?: string[];
      favoriteFoods?: string[];
      dietaryRestrictions?: string;
    };
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
  package: {
    _id: string;
    packageName: string;
    description: string;
    price: number;
    packageType: string;
    duration: number;
    paymentCycle: string;
    services: string[];
    customServices: any[];
    notes?: string;
    isPopular: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
  bookingDate: string;
  bookingTime: string;
  duration: number;
  workLocation: string;
  services: Array<{
    name: string;
    description: string;
    selected: boolean;
    _id: string;
  }>;
  tasks: Array<{
    taskName: string;
    description: string;
    isCompleted: boolean;
    _id: string;
    completedAt?: string;
    completedBy?: string;
  }>;
  totalPrice: number;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "rejected";
  specialRequests?: string;
  checkIn?: {
    actualStartTime?: string;
    checkInTime?: string;
    confirmedBy?: string;
    verificationImage?: string;
  };
  payment: {
    status: "pending" | "paid" | "refunded";
    method?: "cash" | "bank_transfer" | "e_wallet";
    transferredToCaregiver?: boolean;
    paidAt?: string;
    transactionId?: string;
    transferredAt?: string;
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Types based on actual API response
export interface CaregiverBooking {
  _id: string;
  careseeker: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  caregiver: string; // caregiver ID
  caregiverProfile: {
    _id: string;
    profileImage?: string;
    bio?: string;
  };
  elderlyProfile: string | {
    _id: string;
    fullName?: string;
    dateOfBirth?: string;
    profileImage?: string;
    avatar?: string;
    age?: number;
  }; // elderly profile ID or populated object
  package: string | {
    _id: string;
    packageName?: string;
    packageType?: string;
    duration?: number;
    price?: number;
  }; // package ID or populated object
  bookingDate: string; // ISO date
  bookingTime: string; // time like "07:00"
  duration: number; // hours
  workLocation: string;
  services: Array<{
    name: string;
    description: string;
    selected: boolean;
    _id: string;
  }>;
  tasks: Array<{
    taskName: string;
    description: string;
    isCompleted: boolean;
    _id: string;
    completedAt?: string;
    completedBy?: string;
  }>;
  totalPrice: number;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "rejected";
  specialRequests?: string;
  checkIn?: {
    actualStartTime?: string;
    checkInTime?: string;
    confirmedBy?: string;
    verificationImage?: string;
  };
  payment: {
    status: "pending" | "paid" | "refunded";
    method?: "cash" | "bank_transfer" | "e_wallet";
    transferredToCaregiver?: boolean;
    qrCode?: string;
    paidAt?: string;
    transactionId?: string;
    transferredAt?: string;
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Legacy Booking interface for backward compatibility
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
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: CaregiverBooking[];
    totalPages: number;
    currentPage: number;
    total: number;
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
   * Get booking by ID - returns detailed booking with populated fields
   */
  getById: async (id: string): Promise<{
    success: boolean;
    message: string;
    data: BookingDetail;
  }> => {
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

  /**
   * Add note to booking - Caregiver only
   */
  addNote: async (id: string, content: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const response = await axiosInstance.post(
      `/api/bookings/${id}/notes`,
      { content }
    );
    return response.data;
  },

  /**
   * Get notes for a booking
   */
  getNotes: async (id: string): Promise<{
    success: boolean;
    data: {
      bookingId: string;
      notes: Array<{
        _id: string;
        booking: string;
        caregiver: {
          _id: string;
          name: string;
          avatar?: string;
        };
        content: string;
        createdAt: string;
        updatedAt: string;
      }>;
    };
    total: number;
  }> => {
    const response = await axiosInstance.get(
      `/api/bookings/${id}/notes`
    );
    return response.data;
  },

  /**
   * Update task status in booking - Caregiver only
   */
  updateTaskStatus: async (
    bookingId: string, 
    taskId: string, 
    isCompleted: boolean
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const response = await axiosInstance.put(
      `/api/bookings/${bookingId}/tasks/${taskId}`,
      { isCompleted }
    );
    return response.data;
  },

  /**
   * Check-in to start work - Caregiver only
   * Automatically updates booking status to "in-progress"
   */
  checkIn: async (
    bookingId: string,
    verificationImage: string,
    actualStartTime: string
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      bookingId: string;
      checkInTime: string;
      actualStartTime: string;
      verificationImage: string;
      earnings: number;
      status: string;
    };
  }> => {
    const response = await axiosInstance.post(
      `/api/bookings/${bookingId}/checkin`,
      {
        verificationImage,
        actualStartTime,
      }
    );
    return response.data;
  },

  /**
   * Create caregiver review - Caregiver rates the careseeker
   */
  createCaregiverReview: async (reviewData: {
    bookingId: string;
    ratings: {
      cooperation: number;
      communication: number;
      respect: number;
      readiness: number;
      workingEnvironment: number;
    };
    familySupport: string;
    issues: string[];
    recommendation: string;
    additionalNotes: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const response = await axiosInstance.post(
      `/api/caregiver-reviews`,
      reviewData
    );
    return response.data;
  },

  /**
   * Get caregiver review details by ID
   */
  getCaregiverReview: async (reviewId: string): Promise<{
    success: boolean;
    data: {
      _id: string;
      booking: string;
      caregiver: {
        _id: string;
        name: string;
      };
      careseeker: {
        _id: string;
        name: string;
      };
      ratings: {
        cooperation: number;
        communication: number;
        respect: number;
        readiness: number;
        workingEnvironment: number;
      };
      familySupport: string;
      issues: string[];
      recommendation: string;
      additionalNotes: string;
      createdAt: string;
      updatedAt: string;
    };
  }> => {
    const response = await axiosInstance.get(
      `/api/caregiver-reviews/${reviewId}`
    );
    return response.data;
  },

  /**
   * Get caregiver review by booking ID
   */
  getCaregiverReviewByBooking: async (bookingId: string): Promise<{
    success: boolean;
    data: any;
  } | null> => {
    try {
      const response = await axiosInstance.get(
        `/api/caregiver-reviews/booking/${bookingId}`
      );
      return response.data;
    } catch (error: any) {
      // 404 means no review found - this is expected for bookings without reviews
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
