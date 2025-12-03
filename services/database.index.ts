// Storage Service
export { StorageService, initializeStorage, getDatabase, closeDatabase, resetDatabase } from './database.service';
export * from './storage.service';

// Types
export * from './database.types';

// Re-export commonly used functions
export {
  getElderlyProfiles,
  getElderlyProfileById,
  createElderlyProfile,
  updateElderlyProfile,
  deleteElderlyProfile,
} from './elderly.repository';

export {
  getAllAppointments,
  getAppointmentsByStatus,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentsByDateRange,
  getPastAppointments,
  getCaregiverAppointments,
  cancelAppointment,
  completeAppointment,
} from './appointment.repository';

export {
  getAllCaregivers,
  getAvailableCaregivers,
  getCaregiverById,
  searchCaregiversBySpecialization,
  getTopRatedCaregivers,
  getVerifiedCaregivers,
  createCaregiver,
  updateCaregiverRating,
  toggleCaregiverAvailability,
} from './caregiver.repository';

export * from './availability.repository';
export * from './feedback.repository';
export * from './review.repository';
export * from './complaint.repository';
export * from './notification.repository';
export * from './emergency-contact.repository';
