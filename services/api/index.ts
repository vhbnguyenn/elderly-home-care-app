// Export all API services
export { AuthAPI } from './auth.api';
export type {
    AuthResponse,
    ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordPayload
} from './auth.api';

export { UserAPI } from './user.api';
export type {
    UpdateUserProfilePayload, UserProfile
} from './user.api';

export { CaregiverAPI } from './caregiver.api';
export type {
    CaregiverListResponse, CaregiverProfile,
    SearchCaregiverParams
} from './caregiver.api';

export { ElderlyAPI } from './elderly.api';
export type {
    CreateElderlyPayload, ElderlyProfile, UpdateElderlyPayload
} from './elderly.api';

export { BookingAPI } from './booking.api';
export type {
    Booking,
    CreateBookingPayload,
    UpdateBookingStatusPayload
} from './booking.api';

export { ReviewAPI } from './review.api';
export type {
    CreateReviewPayload, Review, UpdateReviewPayload
} from './review.api';

export { ChatAPI } from './chat.api';
export type {
    ChatDetail,
    ChatDetailResponse, ChatLastMessage,
    ChatListItem,
    ChatListResponse, ChatMessage,
    ChatMessagesResponse, ChatParticipant,
    ChatResponse
} from './chat.api';

