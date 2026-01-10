import apiClient from '../apiClient';
import { API_CONFIG } from '../config/api.config';

// Dispute Interfaces
export interface DisputeEvidence {
  type: 'image' | 'video' | 'document';
  url: string;
  description: string;
}

export interface RefundBankInfo {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankBranch: string;
}

export interface DisputeRequest {
  bookingId: string;
  complainantId: string;
  respondentId: string;
  disputeType: 'service_quality' | 'payment' | 'scheduling' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  evidence?: DisputeEvidence[];
  requestedResolution: 'refund' | 'apology' | 'service_redo' | 'compensation' | 'other';
  requestedAmount?: number;
  refundBankInfo?: RefundBankInfo;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface BookingDetail {
  _id: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  workLocation: string;
  totalPrice: number;
}

export interface TimelineEvent {
  _id: string;
  action: string;
  description: string;
  performedBy: User;
  performedAt: string;
}

export interface AdminDecision {
  decision: string;
  resolution: string;
  refundAmount: number;
  compensationAmount: number;
  actions: string[];
  decidedBy: User;
  decidedAt: string;
  notes: string;
}

export interface RespondentResponse {
  evidence: DisputeEvidence[];
}

export interface Dispute {
  _id: string;
  bookingId: string;
  complainant: string | User;
  respondent: string | User;
  booking?: BookingDetail;
  disputeType: string;
  severity: string;
  title: string;
  description: string;
  evidence: DisputeEvidence[];
  status: string;
  requestedResolution: string;
  requestedAmount?: number;
  refundBankInfo?: RefundBankInfo;
  respondentResponse?: RespondentResponse;
  adminDecision?: AdminDecision;
  timeline?: TimelineEvent[];
  priority?: string;
  deadline?: string;
  allowComplainantResponse?: boolean;
  allowRespondentResponse?: boolean;
  assignedTo?: User;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeResponse {
  success: boolean;
  message: string;
  data: {
    dispute: Dispute;
  };
}

export interface DisputesListResponse {
  success: boolean;
  data: {
    disputes: Dispute[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
    };
  };
}

export const DisputesAPI = {
  async createDispute(data: DisputeRequest): Promise<DisputeResponse> {
    const response = await apiClient.post<DisputeResponse>(
      API_CONFIG.ENDPOINTS.DISPUTES.CREATE,
      data
    );
    return response.data;
  },

  async getMyDisputes(page: number = 1, limit: number = 10): Promise<DisputesListResponse> {
    const response = await apiClient.get<DisputesListResponse>(
      `${API_CONFIG.ENDPOINTS.DISPUTES.GET_MY_DISPUTES}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getDisputeByBooking(bookingId: string): Promise<DisputeResponse> {
    const response = await apiClient.get<DisputeResponse>(
      API_CONFIG.ENDPOINTS.DISPUTES.GET_BY_BOOKING(bookingId)
    );
    return response.data;
  },

  async getDisputeById(disputeId: string): Promise<DisputeResponse> {
    const response = await apiClient.get<DisputeResponse>(
      `${API_CONFIG.ENDPOINTS.DISPUTES.CREATE}/${disputeId}`
    );
    return response.data;
  },

  async withdrawDispute(disputeId: string, reason: string): Promise<DisputeResponse> {
    const response = await apiClient.post<DisputeResponse>(
      API_CONFIG.ENDPOINTS.DISPUTES.WITHDRAW(disputeId),
      { reason }
    );
    return response.data;
  },
};
