// Export all API services
export { AuthAPI } from './auth.api';
export type { 
  RegisterPayload, 
  LoginPayload, 
  AuthResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from './auth.api';

export { UserAPI } from './user.api';
export type { 
  UserProfile,
  UpdateUserProfilePayload,
} from './user.api';

export { CaregiverAPI } from './caregiver.api';
export type { 
  CaregiverProfile, 
  SearchCaregiverParams,
  CaregiverListResponse,
} from './caregiver.api';

export { ElderlyAPI } from './elderly.api';
export type { 
  ElderlyProfile,
  CreateElderlyPayload,
  UpdateElderlyPayload,
} from './elderly.api';

export { BookingAPI } from './booking.api';
export type { 
  Booking,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from './booking.api';

export { ReviewAPI } from './review.api';
export type { 
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
} from './review.api';
