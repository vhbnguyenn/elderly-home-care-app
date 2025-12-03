import { StorageService, AppointmentStorage, STORAGE_KEYS } from './storage.service';
import { Appointment } from './database.types';
import { createSchedule, deleteScheduleByAppointment } from './availability.repository';

/**
 * Get all appointments for a user
 */
export const getAllAppointments = async (userId: string): Promise<Appointment[]> => {
  return AppointmentStorage.getByUserId(userId);
};

/**
 * Get appointments by status
 */
export const getAppointmentsByStatus = async (userId: string, status: string): Promise<Appointment[]> => {
  const appointments = await AppointmentStorage.getByUserId(userId);
  return appointments.filter(apt => apt.status === status);
};

/**
 * Get an appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  return StorageService.getById<Appointment>(STORAGE_KEYS.APPOINTMENTS, id);
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const id = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newAppointment: Appointment = {
    ...appointment,
    id,
    status: appointment.status || 'pending',
    payment_status: appointment.payment_status || 'pending',
  };
  
  await StorageService.create<Appointment>(STORAGE_KEYS.APPOINTMENTS, newAppointment);
  
  // Automatically create schedule entry to block caregiver's time
  if (appointment.caregiver_id && appointment.start_date && appointment.start_time && appointment.end_time) {
    await createSchedule({
      caregiver_id: appointment.caregiver_id,
      appointment_id: id,
      date: appointment.start_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      type: 'appointment',
      notes: 'Auto-created from appointment',
    });
  }
  
  return id;
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<boolean> => {
  const result = await StorageService.update<Appointment>(STORAGE_KEYS.APPOINTMENTS, id, updates);
  return result !== null;
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (id: string, status: string): Promise<boolean> => {
  return updateAppointment(id, { status: status as any });
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (id: string, cancelReason?: string): Promise<boolean> => {
  const result = await updateAppointment(id, { 
    status: 'cancelled',
    notes: cancelReason 
  });
  
  if (result) {
    // Delete associated schedule entry
    await deleteScheduleByAppointment(id);
  }
  
  return result;
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id: string): Promise<boolean> => {
  // Delete associated schedule entry first
  await deleteScheduleByAppointment(id);
  
  return StorageService.delete(STORAGE_KEYS.APPOINTMENTS, id);
};

/**
 * Get upcoming appointments for a user
 */
export const getUpcomingAppointments = async (userId: string): Promise<Appointment[]> => {
  return AppointmentStorage.getUpcoming(userId);
};

/**
 * Get past appointments for a user
 */
export const getPastAppointments = async (userId: string): Promise<Appointment[]> => {
  return AppointmentStorage.getPast(userId);
};

/**
 * Get appointments for a caregiver
 */
export const getCaregiverAppointments = async (caregiverId: string): Promise<Appointment[]> => {
  return AppointmentStorage.getByCaregiverId(caregiverId);
};

/**
 * Get appointments by date range
 */
export const getAppointmentsByDateRange = async (userId: string, startDate: string, endDate: string): Promise<Appointment[]> => {
  const appointments = await AppointmentStorage.getByUserId(userId);
  return appointments.filter(apt => {
    return apt.start_date >= startDate && apt.start_date <= endDate;
  });
};

/**
 * Count appointments by status
 */
export const countAppointmentsByStatus = async (userId: string): Promise<{ [key: string]: number }> => {
  const appointments = await AppointmentStorage.getByUserId(userId);
  return appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
};

/**
 * Get today's appointments
 */
export const getTodayAppointments = async (userId: string): Promise<Appointment[]> => {
  const today = new Date().toISOString().split('T')[0];
  const appointments = await AppointmentStorage.getByUserId(userId);
  return appointments.filter(apt => apt.start_date === today);
};

/**
 * Mark appointment as completed
 */
export const completeAppointment = async (id: string): Promise<boolean> => {
  return updateAppointmentStatus(id, 'completed');
};

/**
 * Mark appointment feedback as complete
 */
export const markAppointmentFeedbackComplete = async (appointmentId: string): Promise<boolean> => {
  return updateAppointment(appointmentId, { has_feedback: true } as any);
};
