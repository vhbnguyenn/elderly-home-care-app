// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://elderly-home-care-backend.onrender.com',
  SWAGGER_URL: 'https://elderly-home-care-backend.onrender.com/api-docs',
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY_EMAIL: '/api/auth/verify-email',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    // Caregiver
    CAREGIVER: {
      CREATE_PROFILE: '/api/caregiver/profile',
      GET_OWN_PROFILE: '/api/caregiver/profile',
      UPDATE_PROFILE: '/api/caregiver/profile',
      GET_ALL_PROFILES: '/api/caregiver/profiles',
      GET_PROFILE_BY_ID: (id: string) => `/api/caregiver/profiles/${id}`,
      SEARCH: '/api/caregiver/search',
      AVAILABILITY: '/api/caregiver/availability',
    },
    // Elderly
    ELDERLY: {
      CREATE: '/api/elderly',
      GET_ALL: '/api/elderly',
      GET_BY_ID: (id: string) => `/api/elderly/${id}`,
      UPDATE: (id: string) => `/api/elderly/${id}`,
      DELETE: (id: string) => `/api/elderly/${id}`,
    },
    // Booking
    BOOKING: {
      CREATE: '/api/bookings',
      GET_CAREGIVER_BOOKINGS: '/api/bookings/caregiver',
      GET_CARESEEKER_BOOKINGS: '/api/bookings/careseeker',
      GET_BY_ID: (id: string) => `/api/bookings/${id}`,
      UPDATE_STATUS: (id: string) => `/api/bookings/${id}/status`,
      CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    },
    // Review
    REVIEW: {
      CREATE: '/api/reviews',
      GET_BY_CAREGIVER: (caregiverId: string) => `/api/reviews/caregiver/${caregiverId}`,
      GET_BY_BOOKING: (bookingId: string) => `/api/reviews/booking/${bookingId}`,
      UPDATE: (id: string) => `/api/reviews/${id}`,
      DELETE: (id: string) => `/api/reviews/${id}`,
    },
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
