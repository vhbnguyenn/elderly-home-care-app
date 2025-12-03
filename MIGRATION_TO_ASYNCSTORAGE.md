# 🔄 Migration từ SQLite sang AsyncStorage

## ✅ Hoàn tất

Đã chuyển đổi thành công toàn bộ hệ thống từ SQLite sang AsyncStorage (Local Storage).

## 📦 Các thay đổi chính

### 1. Gỡ bỏ SQLite
- ❌ Đã xóa `expo-sqlite` package
- ❌ Đã xóa tất cả SQL queries
- ✅ Sử dụng `@react-native-async-storage/async-storage`

### 2. Storage Service mới
**File: `services/storage.service.ts`**
- Generic CRUD operations cho tất cả entities
- Helper methods cho từng loại data:
  - `UserStorage`: Tìm user by email/phone
  - `CaregiverStorage`: Lọc available, verified, top rated
  - `AppointmentStorage`: Upcoming, past, by status
  - `AvailabilityStorage`: By caregiver, by day
  - `ScheduleStorage`: By date, by appointment
  - `FeedbackStorage`: By type, statistics
  - `NotificationStorage`: Unread, mark as read

### 3. Repositories đã update
✅ `appointment.repository.ts` - AsyncStorage CRUD
✅ `availability.repository.ts` - Availability checking logic
✅ `caregiver.repository.ts` - Search, filter caregivers
✅ `feedback.repository.ts` - Feedback with statistics
✅ `review.repository.ts` - Reviews CRUD
✅ `complaint.repository.ts` - Complaints management
✅ `notification.repository.ts` - Notifications
✅ `emergency-contact.repository.ts` - Emergency contacts
✅ `elderly.repository.ts` - Elderly profiles
✅ `user.service.ts` - User authentication

### 4. Database Service
**File: `services/database.service.ts`**
```typescript
export const initializeStorage = async () => {
  // AsyncStorage tự động khả dụng
  return true;
};

export const getDatabase = async () => {
  return StorageService;
};

export const resetDatabase = async () => {
  await StorageService.clearAll();
};
```

### 5. Seed Data
**File: `services/database.seed.ts`**
- `seedUsers()`: 3 test users (2 seeker, 1 giver)
- `seedCaregivers()`: 3 caregivers with profiles
- `seedCaregiverAvailability()`: Mon-Fri 9AM-5PM
- `seedBlockedTimes()`: Sample blocked times
- `seedElderlyProfiles()`: 1 elderly profile
- `seedAll()`: Seed toàn bộ

## 🚀 Cách sử dụng

### Seed data lần đầu
```typescript
import { seedAll, clearAll } from '@/services/database.seed';

// Clear old data
await clearAll();

// Seed new data
await seedAll();
```

### Test accounts
```
📧 seeker@test.com | 🔒 123456 (Care Seeker)
📧 seeker2@test.com | 🔒 123456 (Care Seeker)
📧 giver@test.com | 🔒 123456 (Caregiver)
```

### CRUD Operations
```typescript
// Users
import { StorageService, STORAGE_KEYS } from '@/services/storage.service';

const users = await StorageService.getAll(STORAGE_KEYS.USERS);
const user = await StorageService.getById(STORAGE_KEYS.USERS, 'user_id');
await StorageService.create(STORAGE_KEYS.USERS, newUser);
await StorageService.update(STORAGE_KEYS.USERS, 'user_id', { name: 'New Name' });
await StorageService.delete(STORAGE_KEYS.USERS, 'user_id');

// Caregivers
import { getAllCaregivers, getAvailableCaregivers } from '@/services/caregiver.repository';

const all = await getAllCaregivers();
const available = await getAvailableCaregivers();

// Appointments
import { createAppointment, getAllAppointments } from '@/services/appointment.repository';

const appointmentId = await createAppointment({
  user_id: 'user_1',
  caregiver_id: 'caregiver_1',
  // ... other fields
});

const myAppointments = await getAllAppointments('user_1');

// Availability
import { isAvailable, getAvailableSlots } from '@/services/availability.repository';

const canBook = await isAvailable('caregiver_1', '2025-12-05', '10:00', '12:00');
const slots = await getAvailableSlots('caregiver_1', 14, 120);

// Feedback
import { createFeedback, getFeedbackStatistics } from '@/services/feedback.repository';

await createFeedback({
  appointment_id: 'apt_1',
  user_id: 'user_1',
  type: 'service',
  rating: 5,
  comment: 'Great service!',
});

const stats = await getFeedbackStatistics();
// { total: 150, byType: { service: 80, ... }, averageRating: 4.5 }
```

## 📱 Kiểm tra trong app

### 1. Login
```typescript
import { AuthService } from '@/services/auth.service';

const user = await AuthService.login('seeker@test.com', '123456');
if (user) {
  // Login success
}
```

### 2. Booking với availability check
- Chọn caregiver
- Chọn package (để biết duration)
- Xem available slots (14 ngày)
- Chọn slot
- Book

### 3. Feedback sau appointment
- Complete appointment
- PostServicePrompt xuất hiện
- Chọn 1 trong 4 feedback types:
  - Service evaluation
  - Video call quality
  - Improvement suggestions
  - System feedback
- Submit

## 🔍 Debug

### View storage data
```typescript
import { STORAGE_KEYS } from '@/services/storage.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// View all keys
const keys = await AsyncStorage.getAllKeys();
console.log('Storage keys:', keys);

// View specific collection
const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
console.log('Users:', JSON.parse(users || '[]'));

// Clear all
await AsyncStorage.clear();
```

### React Native Debugger
1. Install React Native Debugger
2. Enable "Debug JS Remotely"
3. Check AsyncStorage tab

## ⚠️ Lưu ý

### Data structure
- Mỗi collection là 1 array JSON
- Tất cả có `id`, `created_at`, `updated_at`
- JSON fields (arrays, objects) tự động serialize

### Performance
- AsyncStorage là key-value store
- Mỗi collection load toàn bộ vào memory
- Phù hợp cho app nhỏ/medium
- Nếu data lớn (>1000 items), cân nhắc:
  - Pagination
  - Caching
  - Hoặc quay lại SQLite

### Data persistence
- AsyncStorage lưu permanent
- Không mất khi close app
- Mất khi uninstall app
- Backup/export data nếu cần

## 📊 So sánh

| Feature | SQLite | AsyncStorage |
|---------|--------|--------------|
| Query | SQL | Filter/map JS |
| Indexes | ✅ | ❌ |
| Relations | ✅ | Manual |
| Speed | Fast | Medium |
| Complexity | High | Low |
| Web support | ❌ | ✅ |
| Setup | Complex | Simple |

## 🎯 Kết luận

✅ Migration thành công
✅ Tất cả features hoạt động
✅ Data persistence
✅ Easy to debug
✅ Web compatible
✅ Simpler codebase

🚀 App sẵn sàng chạy với AsyncStorage!
