import { createAvailability, createSchedule } from './availability.repository';
import { createCaregiver } from './caregiver.repository';
import { createElderlyProfile } from './elderly.repository';
import { STORAGE_KEYS, StorageService } from './storage.service';

/**
 * Seed sample caregivers
 */
export const seedCaregivers = async (): Promise<string[]> => {
  const caregiverIds: string[] = [];
  
  const caregivers = [
    {
      name: 'Trần Văn Nam',
      age: 35,
      gender: 'male' as const,
      avatar: 'https://ui-avatars.com/api/?name=Tran+Van+Nam&background=4CAF50&color=fff',
      phone: '0901234567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      experience_years: 8,
      rating: 4.8,
      total_reviews: 156,
      hourly_rate: 50000,
      specializations: ['Chăm sóc người già', 'Vật lý trị liệu', 'Chế độ ăn dinh dưỡng'],
      certificates: ['Chứng chỉ điều dưỡng viên', 'Chứng chỉ sơ cấp cứu'],
      languages: ['Tiếng Việt', 'Tiếng Anh'],
      bio: 'Tôi có 8 năm kinh nghiệm chăm sóc người cao tuổi với sự tận tâm và chu đáo.',
      is_verified: true,
      is_available: true,
    },
    {
      name: 'Nguyễn Thị Mai',
      age: 28,
      gender: 'female' as const,
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Thi+Mai&background=2196F3&color=fff',
      phone: '0912345678',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      experience_years: 5,
      rating: 4.5,
      total_reviews: 89,
      hourly_rate: 45000,
      specializations: ['Chăm sóc người già', 'Massage trị liệu'],
      certificates: ['Chứng chỉ điều dưỡng viên'],
      languages: ['Tiếng Việt'],
      bio: 'Nhiệt tình, chu đáo, có kinh nghiệm chăm sóc người cao tuổi.',
      is_verified: true,
      is_available: true,
    },
    {
      name: 'Phạm Văn Hùng',
      age: 42,
      gender: 'male' as const,
      avatar: 'https://ui-avatars.com/api/?name=Pham+Van+Hung&background=FF9800&color=fff',
      phone: '0923456789',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      experience_years: 12,
      rating: 4.9,
      total_reviews: 234,
      hourly_rate: 60000,
      specializations: ['Chăm sóc người già', 'Vật lý trị liệu', 'Y tá'],
      certificates: ['Bằng điều dưỡng', 'Chứng chỉ vật lý trị liệu', 'Chứng chỉ sơ cấp cứu'],
      languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp'],
      bio: 'Với hơn 12 năm kinh nghiệm, tôi cam kết mang đến dịch vụ chăm sóc chất lượng cao nhất.',
      is_verified: true,
      is_available: true,
    },
  ];
  
  for (const caregiver of caregivers) {
    const id = await createCaregiver(caregiver);
    caregiverIds.push(id);
  }
  
  console.log('✅ Seeded', caregiverIds.length, 'caregivers successfully');
  return caregiverIds;
};

/**
 * Seed caregiver availability (Mon-Fri 9AM-5PM)
 */
export const seedCaregiverAvailability = async (caregiverId: string): Promise<void> => {
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
  
  console.log('✅ Seeded availability for caregiver', caregiverId);
};

/**
 * Seed blocked times for testing
 */
export const seedBlockedTimes = async (caregiverId: string): Promise<void> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Block 10:00-12:00 tomorrow
  await createSchedule({
    caregiver_id: caregiverId,
    date: tomorrowStr,
    start_time: '10:00',
    end_time: '12:00',
    type: 'blocked',
    notes: 'Bận việc riêng',
  });
  
  console.log('✅ Seeded blocked time for caregiver', caregiverId);
};

/**
 * Seed sample elderly profiles
 */
export const seedElderlyProfiles = async (userId: string): Promise<string[]> => {
  const profileIds: string[] = [];
  
  const profiles = [
    {
      user_id: userId,
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      gender: 'female' as const,
      avatar: 'https://ui-avatars.com/api/?name=Ba+Nguyen+Thi+Lan&background=E91E63&color=fff',
      address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
      phone: '0901234567',
      blood_type: 'O+',
      health_condition: 'Tiểu đường, Huyết áp cao',
      underlying_diseases: ['Tiểu đường type 2', 'Huyết áp cao'],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: '2 lần/ngày' },
        { name: 'Amlodipine', dosage: '5mg', frequency: '1 lần/ngày' },
      ],
      allergies: ['Penicillin'],
      special_conditions: ['Khó đi lại', 'Cần hỗ trợ vệ sinh'],
      independence_level: {
        eating: 'assisted' as const,
        bathing: 'dependent' as const,
        mobility: 'assisted' as const,
        toileting: 'assisted' as const,
        dressing: 'assisted' as const,
      },
      living_environment: {
        houseType: 'apartment' as const,
        livingWith: ['Con trai', 'Con dâu'],
        accessibility: ['Có thang máy', 'Có tay vịn'],
      },
      hobbies: ['Nghe nhạc', 'Xem TV'],
      favorite_activities: ['Đọc sách', 'Nghe radio'],
      food_preferences: ['Ăn nhạt', 'Thích cháo'],
      emergency_contact: {
        name: 'Nguyễn Văn A',
        relationship: 'Con trai',
        phone: '0909123456',
      },
    },
  ];
  
  for (const profile of profiles) {
    const id = await createElderlyProfile(profile);
    profileIds.push(id);
  }
  
  console.log('✅ Seeded', profileIds.length, 'elderly profiles successfully');
  return profileIds;
};

/**
 * Seed sample users
 */
export const seedUsers = async (): Promise<string[]> => {
  const users = [
    {
      id: 'user_careseeker_1',
      email: 'seeker@test.com',
      password: '123456',
      phone: '0901111111',
      full_name: 'Nguyễn Văn A',
      role: 'careseeker',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=9C27B0&color=fff',
    },
    {
      id: 'user_careseeker_2',
      email: 'seeker2@test.com',
      password: '123456',
      phone: '0902222222',
      full_name: 'Trần Thị B',
      role: 'careseeker',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=3F51B5&color=fff',
    },
    {
      id: 'user_caregiver_1',
      email: 'giver@test.com',
      password: '123456',
      phone: '0903333333',
      full_name: 'Trần Văn Nam',
      role: 'caregiver',
      status: 'approved', // Caregiver profile is already approved
      hasCompletedProfile: true,
      avatar: 'https://ui-avatars.com/api/?name=Tran+Van+Nam&background=4CAF50&color=fff',
    },
  ];
  
  await StorageService.setAll(STORAGE_KEYS.USERS, users);
  console.log('✅ Seeded', users.length, 'users successfully');
  return users.map(u => u.id);
};

/**
 * Seed all data
 */
export const seedAll = async (): Promise<void> => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed users
    const userIds = await seedUsers();
    
    // Seed caregivers
    const caregiverIds = await seedCaregivers();
    
    // Seed availability for each caregiver
    for (const caregiverId of caregiverIds) {
      await seedCaregiverAvailability(caregiverId);
      await seedBlockedTimes(caregiverId);
    }
    
    // Seed elderly profiles for first user
    await seedElderlyProfiles(userIds[0]);
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Clear all data
 */
export const clearAll = async (): Promise<void> => {
  await StorageService.clearAll();
  console.log('✅ All data cleared');
};
