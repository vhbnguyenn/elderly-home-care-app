# Post-Service Feedback System

## 📝 Tổng quan

Hệ thống đánh giá sau mỗi ca làm với **4 loại feedback**:

### 1. 🌟 Đánh giá dịch vụ
- Đánh giá chất lượng chăm sóc
- Thái độ của người chăm sóc
- 5 sao rating
- Nhận xét chi tiết

### 2. 📹 Đánh giá Video Call
- Chất lượng hình ảnh (5 sao)
- Chất lượng âm thanh (5 sao)
- Đánh giá chung (5 sao)
- Nhận xét về tính năng giám sát

### 3. 💡 Góp ý cải thiện
- Đề xuất tính năng mới
- Ý kiến cải tiến dịch vụ
- Mức độ hài lòng chung
- Chia sẻ ý tưởng

### 4. ⚙️ Phản hồi hệ thống
- Đánh giá độ ổn định (5 sao)
- Đánh giá dễ sử dụng (5 sao)
- Báo cáo lỗi kỹ thuật
- Góp ý giao diện/UX

## 🗂️ Cấu trúc Files

```
app/careseeker/
  └── post-service-feedback.tsx     # Main feedback screen

components/feedback/
  └── PostServicePrompt.tsx          # Popup sau khi hoàn thành ca

services/
  ├── feedback.repository.ts         # CRUD operations
  └── database.types.ts              # Feedback interfaces
```

## 💾 Database Schema

```sql
CREATE TABLE feedbacks (
  id TEXT PRIMARY KEY,
  appointment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('service', 'video_call', 'suggestion', 'system')),
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  details TEXT,  -- JSON: {video_quality, audio_quality, system_stability, feature_usability}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Cách sử dụng

### 1. Hiển thị prompt sau khi hoàn thành ca

```tsx
import { PostServicePrompt } from '@/components/feedback/PostServicePrompt';

const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

// Khi appointment status = 'completed'
useEffect(() => {
  if (appointment.status === 'completed' && !appointment.has_feedback) {
    setShowFeedbackPrompt(true);
  }
}, [appointment]);

<PostServicePrompt
  visible={showFeedbackPrompt}
  appointmentId={appointment.id}
  caregiverName={appointment.caregiver_name}
  onClose={() => setShowFeedbackPrompt(false)}
  onLater={() => {
    // Remind later
    setShowFeedbackPrompt(false);
  }}
/>
```

### 2. Navigate trực tiếp đến feedback screen

```tsx
import { router } from 'expo-router';

router.push({
  pathname: '/careseeker/post-service-feedback',
  params: {
    appointmentId: 'apt_123',
    caregiverName: 'Trần Văn Nam',
  },
});
```

### 3. Submit feedback

```tsx
import { createFeedback } from '@/services/feedback.repository';

const feedback = await createFeedback({
  appointment_id: 'apt_123',
  user_id: 'user_123',
  type: 'service',
  rating: 5,
  comment: 'Dịch vụ rất tốt!',
  details: {
    video_quality: 4,
    audio_quality: 5,
    system_stability: 4,
    feature_usability: 5,
  },
});
```

### 4. Query feedbacks

```tsx
import { 
  getFeedbacksByAppointment,
  getFeedbacksByUser,
  getFeedbacksByType,
  getFeedbackStatistics 
} from '@/services/feedback.repository';

// Get by appointment
const feedbacks = await getFeedbacksByAppointment('apt_123');

// Get by user
const userFeedbacks = await getFeedbacksByUser('user_123');

// Get by type
const serviceFeedbacks = await getFeedbacksByType('service');

// Get statistics
const stats = await getFeedbackStatistics();
// {
//   total: 150,
//   byType: { service: 80, video_call: 30, suggestion: 25, system: 15 },
//   averageRating: 4.5
// }
```

## 🎨 UI Features

### 1. Feedback Type Selection
- 4 loại feedback cards
- Icon màu sắc riêng
- Mô tả ngắn gọn
- Selected state với checkmark

### 2. Star Rating
- 5 stars interactive
- Rating labels: Rất tệ → Xuất sắc
- Multiple rating fields cho video call & system

### 3. Comment Input
- Multiline TextInput
- Placeholder tùy theo type
- Optional field

### 4. Submit Button
- Validate rating > 0
- Loading state
- Success alert với animation

## 📊 Feedback Types Details

| Type | Fields | Purpose |
|------|--------|---------|
| **Service** | rating, comment | Đánh giá người chăm sóc |
| **Video Call** | video_quality, audio_quality, rating, comment | Đánh giá tính năng giám sát |
| **Suggestion** | rating, comment | Góp ý cải thiện |
| **System** | system_stability, feature_usability, rating, comment | Báo lỗi kỹ thuật |

## 🔔 Reminder Flow

1. **Immediately after appointment**: Hiện PostServicePrompt
2. **User clicks "Để sau"**: Lưu reminder
3. **Next app open**: Hiện notification badge
4. **After 24h**: Push notification nhắc nhở
5. **After 7 days**: Disable reminder (expired)

## 🧪 Testing

```tsx
// Test với appointment mẫu
const testAppointment = {
  id: 'apt_test_123',
  caregiver_name: 'Trần Văn Nam',
  status: 'completed',
  end_time: '2025-11-26 18:00',
};

// Navigate to feedback
router.push({
  pathname: '/careseeker/post-service-feedback',
  params: {
    appointmentId: testAppointment.id,
    caregiverName: testAppointment.caregiver_name,
  },
});
```

## 📈 Analytics

Track feedback metrics:
- Total feedbacks per type
- Average ratings per type
- Response rate (feedbacks / completed appointments)
- Time to feedback (appointment end → feedback submit)

## 🎯 Future Enhancements

- [ ] Photo/video upload trong feedback
- [ ] Voice note feedback
- [ ] Feedback templates/quick replies
- [ ] Reward points cho feedback
- [ ] Admin dashboard cho feedback analysis
- [ ] Auto-categorize feedback với AI
- [ ] Feedback trend reports
