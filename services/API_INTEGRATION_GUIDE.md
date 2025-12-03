# Backend API Integration Guide

## 📋 Overview

Backend API đã được tích hợp hoàn toàn vào React Native app với cấu trúc service đầy đủ.

**Base URL:** `https://elderly-home-care-backend.onrender.com`  
**Swagger Docs:** `https://elderly-home-care-backend.onrender.com/api-docs`

---

## 🗂️ Cấu trúc Files

```
services/
├── config/
│   └── api.config.ts          # API endpoints & configuration
├── api/
│   ├── index.ts               # Export all API services
│   ├── auth.api.ts            # Authentication APIs
│   ├── caregiver.api.ts       # Caregiver APIs
│   ├── elderly.api.ts         # Elderly profile APIs
│   ├── booking.api.ts         # Booking APIs
│   ├── review.api.ts          # Review APIs
│   └── error.handler.ts       # Error handling utility
└── axiosInstance.ts           # Axios config with interceptors

screens/
├── LoginExample.tsx           # Example: Login component
├── CaregiverListExample.tsx   # Example: Caregiver list
└── CreateBookingExample.tsx   # Example: Create booking
```

---

## 🔧 Core Features

### 1. Axios Instance with Interceptors

**File:** `services/axiosInstance.ts`

#### Request Interceptor
- Tự động thêm `Bearer {token}` vào headers
- Token lấy từ AsyncStorage key: `auth_token`
- Log requests cho debugging

#### Response Interceptor
- Handle 401 errors → Auto refresh token
- Nếu refresh thất bại → Clear auth & redirect to login
- Log responses và errors
- Parse error messages cho user-friendly

```typescript
// Auto token injection
config.headers.Authorization = `Bearer ${token}`;

// Auto redirect on 401
if (error.status === 401) {
  await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
  router.replace('/login');
}
```

---

## 📚 API Services

### Auth API (`services/api/auth.api.ts`)

```typescript
import { AuthAPI } from '@/services/api';

// Register
const response = await AuthAPI.register({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'Nguyễn Văn A',
  phone: '0901234567',
  role: 'careseeker', // or 'caregiver'
});

// Login
const response = await AuthAPI.login({
  email: 'user@example.com',
  password: 'password123',
});
// Token & user data auto saved to AsyncStorage

// Logout
await AuthAPI.logout();
// Clears all auth data from AsyncStorage

// Check auth status
const isAuth = await AuthAPI.isAuthenticated();

// Get current user
const user = await AuthAPI.getCurrentUser();
```

**AsyncStorage Keys:**
- `auth_token` - JWT access token
- `refresh_token` - Refresh token (if available)
- `user_data` - User object (JSON string)

---

### Caregiver API (`services/api/caregiver.api.ts`)

```typescript
import { CaregiverAPI } from '@/services/api';

// Create profile
const profile = await CaregiverAPI.createProfile({
  fullName: 'Nguyễn Thị B',
  bio: 'Kinh nghiệm 5 năm chăm sóc người cao tuổi',
  specializations: ['Alzheimer', 'Stroke Recovery'],
  experience: 5,
  hourlyRate: 50000,
  availability: [
    { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
  ],
  // ... other fields
});

// Get own profile
const myProfile = await CaregiverAPI.getOwnProfile();

// Update profile
const updated = await CaregiverAPI.updateProfile({
  hourlyRate: 60000,
  isAvailable: true,
});

// Get all profiles (admin or public search)
const response = await CaregiverAPI.getAllProfiles({
  page: 1,
  limit: 10,
});

// Search with filters
const results = await CaregiverAPI.searchCaregivers({
  specialization: 'Dementia',
  minRating: 4.0,
  city: 'Hồ Chí Minh',
  maxHourlyRate: 80000,
});
```

---

### Elderly API (`services/api/elderly.api.ts`)

```typescript
import { ElderlyAPI } from '@/services/api';

// Create elderly profile
const profile = await ElderlyAPI.create({
  fullName: 'Trần Văn C',
  dateOfBirth: '1950-05-15',
  gender: 'male',
  healthConditions: ['Diabetes', 'High Blood Pressure'],
  mobilityLevel: 'assisted',
  emergencyContact: {
    name: 'Trần Thị D',
    phone: '0912345678',
    relationship: 'Con gái',
  },
  // ... other fields
});

// Get all elderly profiles
const profiles = await ElderlyAPI.getAll();

// Get by ID
const profile = await ElderlyAPI.getById('elderly_id');

// Update profile
const updated = await ElderlyAPI.update('elderly_id', {
  healthConditions: ['Diabetes', 'High Blood Pressure', 'Arthritis'],
});

// Delete profile
await ElderlyAPI.delete('elderly_id');

// Add medication
await ElderlyAPI.addMedication('elderly_id', {
  name: 'Metformin',
  dosage: '500mg',
  frequency: '2 lần/ngày',
  notes: 'Uống sau bữa ăn',
});
```

---

### Booking API (`services/api/booking.api.ts`)

```typescript
import { BookingAPI } from '@/services/api';

// Create booking
const booking = await BookingAPI.create({
  caregiverId: 'caregiver_id',
  elderlyProfileId: 'elderly_id',
  startDate: '2024-01-01T08:00:00Z',
  endDate: '2024-01-31T17:00:00Z',
  serviceType: 'daily',
  totalCost: 5000000,
  address: '123 Nguyễn Huệ',
  city: 'Hồ Chí Minh',
  district: 'Quận 1',
  notes: 'Cần chăm sóc đặc biệt',
});

// Get caregiver's bookings
const response = await BookingAPI.getCaregiverBookings({
  status: 'confirmed',
  page: 1,
  limit: 10,
});

// Get careseeker's bookings
const response = await BookingAPI.getCareseekerBookings();

// Get by ID
const booking = await BookingAPI.getById('booking_id');

// Update status
await BookingAPI.updateStatus('booking_id', {
  status: 'confirmed',
});

// Quick actions
await BookingAPI.confirm('booking_id');
await BookingAPI.reject('booking_id', 'Không thể nhận booking này');
await BookingAPI.cancel('booking_id', 'Có việc đột xuất');
await BookingAPI.start('booking_id');
await BookingAPI.complete('booking_id');

// Get upcoming bookings
const upcoming = await BookingAPI.getUpcoming('careseeker');

// Get history
const history = await BookingAPI.getHistory('caregiver');
```

---

### Review API (`services/api/review.api.ts`)

```typescript
import { ReviewAPI } from '@/services/api';

// Create review
const review = await ReviewAPI.create({
  bookingId: 'booking_id',
  caregiverId: 'caregiver_id',
  rating: 5,
  comment: 'Dịch vụ tuyệt vời!',
  pros: ['Nhiệt tình', 'Chuyên nghiệp', 'Đúng giờ'],
  cons: [],
  wouldRecommend: true,
});

// Get reviews for caregiver
const response = await ReviewAPI.getByCaregiverId('caregiver_id', {
  page: 1,
  limit: 10,
  minRating: 4,
});
// Returns: { data, total, averageRating, ratingDistribution }

// Get review for specific booking
const review = await ReviewAPI.getByBookingId('booking_id');

// Update review
const updated = await ReviewAPI.update('review_id', {
  rating: 4,
  comment: 'Cập nhật đánh giá',
});

// Delete review
await ReviewAPI.delete('review_id');

// Check if can review
const { canReview, reason } = await ReviewAPI.canReview('booking_id');
```

---

## 🎯 Error Handling

### Using Error Handler

```typescript
import { useApiError } from '@/services/api/error.handler';

function MyComponent() {
  const { handleError } = useApiError();

  try {
    await AuthAPI.login({ email, password });
  } catch (error) {
    // Converts error to user-friendly Vietnamese message
    const message = handleError(error, 'Login');
    Alert.alert('Lỗi', message);
  }
}
```

### Error Messages (Vietnamese)

- **Network Error**: "Không thể kết nối đến server"
- **401**: "Phiên đăng nhập đã hết hạn"
- **403**: "Bạn không có quyền thực hiện thao tác này"
- **404**: "Không tìm thấy dữ liệu"
- **500**: "Lỗi server"

---

## 📱 Example Usage in Components

### 1. Login Screen

```typescript
import { AuthAPI } from '@/services/api';
import { useApiError } from '@/services/api/error.handler';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleError } = useApiError();

  const handleLogin = async () => {
    try {
      const response = await AuthAPI.login({ email, password });
      
      // Token auto saved, navigate based on role
      if (response.user.role === 'caregiver') {
        router.replace('/caregiver/dashboard');
      } else {
        router.replace('/careseeker/dashboard');
      }
    } catch (error) {
      Alert.alert('Lỗi', handleError(error, 'Login'));
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Đăng nhập" onPress={handleLogin} />
    </View>
  );
}
```

### 2. Caregiver List

```typescript
import { CaregiverAPI } from '@/services/api';

export default function CaregiverList() {
  const [caregivers, setCaregivers] = useState([]);

  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async () => {
    try {
      const response = await CaregiverAPI.getAllProfiles();
      setCaregivers(response.data);
    } catch (error) {
      console.error('Load caregivers failed:', error);
    }
  };

  return (
    <FlatList
      data={caregivers}
      renderItem={({ item }) => <CaregiverCard caregiver={item} />}
    />
  );
}
```

### 3. Create Booking

```typescript
import { BookingAPI } from '@/services/api';

const handleCreateBooking = async () => {
  try {
    const booking = await BookingAPI.create({
      caregiverId: selectedCaregiver.id,
      elderlyProfileId: selectedElderly.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      serviceType: 'hourly',
      totalCost: calculateCost(),
      address: address,
      city: city,
      district: district,
    });

    Alert.alert('Thành công', 'Đã tạo booking!');
    router.back();
  } catch (error) {
    Alert.alert('Lỗi', handleError(error));
  }
};
```

---

## 🔐 Auth Flow

```
1. User login → AuthAPI.login()
2. Token saved to AsyncStorage ('auth_token')
3. All subsequent requests auto include token
4. If 401 error → Try refresh token
5. If refresh fails → Clear auth → Redirect to login
```

---

## 📝 Type Safety

All APIs are fully typed with TypeScript:

```typescript
import type { 
  LoginPayload, 
  AuthResponse,
  CaregiverProfile,
  Booking,
  Review 
} from '@/services/api';
```

---

## 🧪 Testing API Integration

### Quick Test in Component

```typescript
import { AuthAPI, CaregiverAPI, BookingAPI } from '@/services/api';

useEffect(() => {
  testAPI();
}, []);

const testAPI = async () => {
  try {
    // Test login
    const auth = await AuthAPI.login({
      email: 'test@example.com',
      password: 'test123',
    });
    console.log('✅ Login OK:', auth.user);

    // Test get caregivers
    const caregivers = await CaregiverAPI.getAllProfiles();
    console.log('✅ Caregivers loaded:', caregivers.data.length);

    // Test get bookings
    const bookings = await BookingAPI.getCareseekerBookings();
    console.log('✅ Bookings loaded:', bookings.data.length);
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
};
```

---

## 🚀 Next Steps

1. **Replace old service files** với API mới:
   - Thay `auth.service.ts` → `api/auth.api.ts`
   - Thay `caregiver.service.ts` → `api/caregiver.api.ts`

2. **Update AuthContext** để sử dụng `AuthAPI`

3. **Update all screens** để gọi API thật thay vì mockAPI

4. **Test authentication flow** đầy tiên:
   - Login → Save token
   - Navigate
   - Token persist
   - Logout → Clear token

5. **Implement remaining features** từ Swagger docs

---

## 📞 Support

- **Backend API Docs**: https://elderly-home-care-backend.onrender.com/api-docs
- **Test API**: Dùng Swagger UI hoặc Postman
- **Debugging**: Check console logs (request/response logs enabled)

---

## ✅ Checklist

- [x] Axios instance with interceptors
- [x] Auto token injection
- [x] Auto 401 handling & redirect
- [x] Auth API (login, register, logout)
- [x] Caregiver API (CRUD, search)
- [x] Elderly API (CRUD)
- [x] Booking API (CRUD, status updates)
- [x] Review API (CRUD, ratings)
- [x] Error handler với Vietnamese messages
- [x] TypeScript types cho tất cả APIs
- [x] Example components (Login, List, Create)
- [ ] Replace old services in app
- [ ] Test all endpoints với backend
- [ ] Update AuthContext
- [ ] Implement remaining features

---

**🎉 Ready to integrate! Tất cả API services đã được setup và sẵn sàng sử dụng.**
