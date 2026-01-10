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
      REFRESH: '/api/auth/refresh-token',
      VERIFY_EMAIL: '/api/auth/verify-code',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    // Profiles (User profile for all roles)
    PROFILES: {
      GET_USER_PROFILE: '/api/profiles/user',
      UPDATE_USER_PROFILE: '/api/profiles/user',
      CHANGE_PASSWORD: '/api/profiles/change-password',
      DEACTIVATE: '/api/profiles/deactivate',
    },
    // Caregiver
    CAREGIVER: {
      CREATE_PROFILE: '/api/caregivers/profile',
      GET_OWN_PROFILE: '/api/caregivers/profile',
      UPDATE_PROFILE: '/api/caregivers/profile',
      GET_ALL_PROFILES: '/api/caregivers/profiles',
      GET_PROFILE_BY_ID: (id: string) => `/api/caregivers/profiles/${id}`,
      SEARCH: '/api/caregivers/search',
    },
    // Caregiver Availability
    CAREGIVER_AVAILABILITY: {
      CREATE: '/api/caregiver-availability',
      GET_MY_SCHEDULES: '/api/caregiver-availability/my-schedules',
      GET_BY_CAREGIVER: (caregiverId: string) => `/api/caregiver-availability/caregiver/${caregiverId}`,
      UPDATE: (id: string) => `/api/caregiver-availability/${id}`,
      DELETE: (id: string) => `/api/caregiver-availability/${id}`,
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
      GET_ALL: '/api/bookings/all', // Admin only
      GET_BY_ID: (id: string) => `/api/bookings/${id}`,
      UPDATE_STATUS: (id: string) => `/api/bookings/${id}/status`,
      CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    },
    // Reviews - Careseeker đánh giá Caregiver (Caregiver review Careseeker không được phép)
    REVIEW: {
      CREATE: '/api/careseeker-reviews',
      GET_MY_REVIEWS: '/api/careseeker-reviews/my-reviews',
      GET_BY_CAREGIVER: (caregiverId: string) => `/api/careseeker-reviews/caregiver/${caregiverId}`,
      GET_BY_BOOKING: (bookingId: string) => `/api/caregiver-reviews/booking/${bookingId}`,
      GET_BY_ID: (id: string) => `/api/careseeker-reviews/${id}`,
      UPDATE: (id: string) => `/api/careseeker-reviews/${id}`,
      DELETE: (id: string) => `/api/careseeker-reviews/${id}`,
    },
    // AI Matching (Groq)
    AI_MATCHING: {
      FIND_CAREGIVERS: '/api/groq-matching/find-caregivers',
      COMPARE: '/api/groq-matching/compare',
      TEST: '/api/groq-matching/test',
    },
    // Wallet
    WALLET: {
      MY_WALLET: '/api/wallet/my-wallet',
      TRANSACTIONS: '/api/wallet/transactions',
    },
    // Certificates
    CERTIFICATES: {
      MY_CERTIFICATES: '/api/certificates/my',
      GET_BY_ID: (id: string) => `/api/certificates/${id}`,
      CREATE: '/api/certificates',
      UPDATE: (id: string) => `/api/certificates/${id}`,
      DELETE: (id: string) => `/api/certificates/${id}`,
    },
    // Caregiver Skills
    CAREGIVER_SKILLS: {
      CREATE: '/api/caregiver-skills',
      GET_MY_SKILLS: '/api/caregiver-skills/my-skills',
      UPDATE: (id: string) => `/api/caregiver-skills/${id}`,
      DELETE: (id: string) => `/api/caregiver-skills/${id}`,
      TOGGLE_DISPLAY: (id: string) => `/api/caregiver-skills/${id}/toggle-display`,
    },
    // Courses
    COURSES: {
      GET_ALL: '/api/courses',
      GET_BY_ID: (id: string) => `/api/courses/${id}`,
      ENROLL: (id: string) => `/api/courses/${id}/enroll`,
      MY_ENROLLMENTS: '/api/courses/my-enrollments',
      GET_PROGRESS: (id: string) => `/api/courses/${id}/progress`,
    },
    // Lessons
    LESSONS: {
      GET_BY_ID: (id: string) => `/api/courses/lesson/${id}`,
      COMPLETE: (id: string) => `/api/courses/lesson/${id}/complete`,
    },
    // Feedback
    FEEDBACK: {
      SUBMIT: '/api/system-feedback',
    },
    // Reviews
    REVIEWS: {
      RECEIVED: '/api/careseeker-reviews/received',
    },
    // Disputes
    DISPUTES: {
      CREATE: '/api/disputes',
      GET_MY_DISPUTES: '/api/disputes/my-disputes',
      GET_BY_BOOKING: (bookingId: string) => `/api/disputes/booking/${bookingId}`,
      WITHDRAW: (id: string) => `/api/disputes/${id}/withdraw`,
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
