import { StorageService, AvailabilityStorage, ScheduleStorage, STORAGE_KEYS } from './storage.service';
import {
  CaregiverAvailability,
  CaregiverSchedule,
  AvailableTimeSlot,
  TimeSlot
} from './database.types';

// ============= CAREGIVER AVAILABILITY CRUD =============

/**
 * Get all availability slots for a caregiver
 */
export const getCaregiverAvailability = async (caregiverId: string): Promise<CaregiverAvailability[]> => {
  const availabilities = await AvailabilityStorage.getByCaregiverId(caregiverId);
  return availabilities.filter(av => av.is_active);
};

/**
 * Create availability slot
 */
export const createAvailability = async (
  availability: Omit<CaregiverAvailability, 'id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  const id = `avail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newAvailability: CaregiverAvailability = {
    ...availability,
    id,
    is_active: availability.is_active ?? true,
  };
  
  await StorageService.create<CaregiverAvailability>(STORAGE_KEYS.CAREGIVER_AVAILABILITY, newAvailability);
  return id;
};

/**
 * Update availability slot
 */
export const updateAvailability = async (
  id: string,
  updates: Partial<CaregiverAvailability>
): Promise<boolean> => {
  const result = await StorageService.update<CaregiverAvailability>(
    STORAGE_KEYS.CAREGIVER_AVAILABILITY,
    id,
    updates
  );
  return result !== null;
};

/**
 * Delete availability slot
 */
export const deleteAvailability = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.CAREGIVER_AVAILABILITY, id);
};

/**
 * Set default availability (Mon-Fri, 9 AM - 5 PM)
 */
export const setDefaultAvailability = async (caregiverId: string): Promise<void> => {
  const workingDays = [1, 2, 3, 4, 5]; // Mon-Fri
  
  for (const day of workingDays) {
    await createAvailability({
      caregiver_id: caregiverId,
      day_of_week: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      start_time: '09:00',
      end_time: '17:00',
      is_active: true,
    });
  }
};

// ============= CAREGIVER SCHEDULE (BLOCKED TIMES) CRUD =============

/**
 * Get all schedules for a caregiver
 */
export const getCaregiverSchedules = async (caregiverId: string): Promise<CaregiverSchedule[]> => {
  return ScheduleStorage.getByCaregiverId(caregiverId);
};

/**
 * Get schedules for a specific date
 */
export const getSchedulesByDate = async (caregiverId: string, date: string): Promise<CaregiverSchedule[]> => {
  return ScheduleStorage.getByDate(caregiverId, date);
};

/**
 * Create a schedule entry (appointment, break, or blocked time)
 */
export const createSchedule = async (
  schedule: Omit<CaregiverSchedule, 'id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  const id = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newSchedule: CaregiverSchedule = {
    ...schedule,
    id,
  };
  
  await StorageService.create<CaregiverSchedule>(STORAGE_KEYS.CAREGIVER_SCHEDULES, newSchedule);
  return id;
};

/**
 * Update schedule entry
 */
export const updateSchedule = async (
  id: string,
  updates: Partial<CaregiverSchedule>
): Promise<boolean> => {
  const result = await StorageService.update<CaregiverSchedule>(
    STORAGE_KEYS.CAREGIVER_SCHEDULES,
    id,
    updates
  );
  return result !== null;
};

/**
 * Delete schedule entry
 */
export const deleteSchedule = async (id: string): Promise<boolean> => {
  return StorageService.delete(STORAGE_KEYS.CAREGIVER_SCHEDULES, id);
};

/**
 * Delete schedule entries by appointment ID
 */
export const deleteScheduleByAppointment = async (appointmentId: string): Promise<void> => {
  const schedules = await ScheduleStorage.getByAppointmentId(appointmentId);
  
  for (const schedule of schedules) {
    await deleteSchedule(schedule.id);
  }
};

// ============= AVAILABILITY CHECKING LOGIC =============

/**
 * Check if caregiver is available at specific time
 */
export const isAvailable = async (
  caregiverId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  
  // Check if caregiver has availability for this day
  const availabilities = await AvailabilityStorage.getByDayOfWeek(caregiverId, dayOfWeek);
  
  if (availabilities.length === 0) {
    return false; // No availability set for this day
  }
  
  // Check if requested time falls within any availability window
  const hasMatchingAvailability = availabilities.some(av => {
    return startTime >= av.start_time && endTime <= av.end_time;
  });
  
  if (!hasMatchingAvailability) {
    return false; // Time not within available hours
  }
  
  // Check for conflicts with existing schedules
  const schedules = await getSchedulesByDate(caregiverId, date);
  
  const hasConflict = schedules.some(schedule => {
    // Check for time overlap
    return !(endTime <= schedule.start_time || startTime >= schedule.end_time);
  });
  
  return !hasConflict; // Available if no conflicts
};

/**
 * Get available time slots for next N days
 */
export const getAvailableSlots = async (
  caregiverId: string,
  daysAhead: number = 14,
  slotDuration: number = 120 // minutes
): Promise<AvailableTimeSlot[]> => {
  const result: AvailableTimeSlot[]  = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    // Get availability for this day
    const availabilities = await AvailabilityStorage.getByDayOfWeek(caregiverId, dayOfWeek);
    
    if (availabilities.length === 0) {
      result.push({
        date: dateString,
        dayName: dayNames[dayOfWeek],
        slots: [],
      });
      continue;
    }
    
    // Get existing schedules for this date
    const schedules = await getSchedulesByDate(caregiverId, dateString);
    
    // Generate time slots
    const slots: TimeSlot[] = [];
    
    for (const availability of availabilities) {
      const startHour = parseInt(availability.start_time.split(':')[0]);
      const startMinute = parseInt(availability.start_time.split(':')[1]);
      const endHour = parseInt(availability.end_time.split(':')[0]);
      const endMinute = parseInt(availability.end_time.split(':')[1]);
      
      let currentSlotStart = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      
      while (currentSlotStart + slotDuration <= endTimeMinutes) {
        const slotStartHour = Math.floor(currentSlotStart / 60);
        const slotStartMinute = currentSlotStart % 60;
        const slotEndMinutes = currentSlotStart + slotDuration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMinute = slotEndMinutes % 60;
        
        const slotStartTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`;
        const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;
        
        // Check for conflicts
        const hasConflict = schedules.some(schedule => {
          return !(slotEndTime <= schedule.start_time || slotStartTime >= schedule.end_time);
        });
        
        const conflictingSchedule = schedules.find(schedule => {
          return !(slotEndTime <= schedule.start_time || slotStartTime >= schedule.end_time);
        });
        
        slots.push({
          startTime: slotStartTime,
          endTime: slotEndTime,
          isAvailable: !hasConflict,
          reason: hasConflict ? `Đã có lịch: ${conflictingSchedule?.type}` : undefined,
        });
        
        currentSlotStart += slotDuration;
      }
    }
    
    result.push({
      date: dateString,
      dayName: dayNames[dayOfWeek],
      slots,
    });
  }
  
  return result;
};

/**
 * Block time for a caregiver (for breaks, personal time, etc.)
 */
export const blockTime = async (
  caregiverId: string,
  date: string,
  startTime: string,
  endTime: string,
  notes?: string
): Promise<string> => {
  return createSchedule({
    caregiver_id: caregiverId,
    date,
    start_time: startTime,
    end_time: endTime,
    type: 'blocked',
    notes,
  });
};

/**
 * Add break time
 */
export const addBreak = async (
  caregiverId: string,
  date: string,
  startTime: string,
  endTime: string,
  notes?: string
): Promise<string> => {
  return createSchedule({
    caregiver_id: caregiverId,
    date,
    start_time: startTime,
    end_time: endTime,
    type: 'break',
    notes,
  });
};
