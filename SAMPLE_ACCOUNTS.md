# Sample Test Accounts

Dưới đây là các tài khoản test cho từng role trong hệ thống.

## 🧓 Care Seeker (Người tìm dịch vụ chăm sóc)

**Account 1:**
```
Email: seeker1@test.com
Password: seeker123
Role: careseeker
Name: Nguyễn Văn An
Phone: 0901234567
```

**Account 2:**
```
Email: seeker2@test.com
Password: seeker123
Role: careseeker
Name: Trần Thị Bình
Phone: 0902345678
```

---

## 👨‍⚕️ Caregiver (Người chăm sóc)

**Account 1:**
```
Email: caregiver1@test.com
Password: giver123
Role: caregiver
Name: Trần Văn Nam
Phone: 0911234567
Experience: 8 năm
Specializations: Chăm sóc người già, Vật lý trị liệu
Rating: 4.8/5.0
Hourly Rate: 50,000 VND
```

**Account 2:**
```
Email: caregiver2@test.com
Password: giver123
Role: caregiver
Name: Nguyễn Thị Mai
Phone: 0912345678
Experience: 5 năm
Specializations: Chăm sóc người già, Massage trị liệu
Rating: 4.5/5.0
Hourly Rate: 45,000 VND
```

**Account 3:**
```
Email: caregiver3@test.com
Password: giver123
Role: caregiver
Name: Phạm Văn Hùng
Phone: 0923456789
Experience: 12 năm
Specializations: Chăm sóc người già, Vật lý trị liệu, Y tá
Rating: 4.9/5.0
Hourly Rate: 60,000 VND
```

---

## 🔑 Quick Login

### Care Seeker (Test booking flow)
```
seeker1@test.com / seeker123
```

### Caregiver (Test receiving appointments)
```
caregiver1@test.com / giver123
```

---

## 📝 Notes

1. **Default Availability**: Tất cả caregivers mặc định có lịch làm việc:
   - Thứ 2 - Thứ 6: 9:00 AM - 5:00 PM
   - Thứ 7 & CN: Không làm việc

2. **Test Blocked Times**: Caregiver1 (Trần Văn Nam) có một số thời gian đã được block để test:
   - Ngày mai: 2:00 PM - 4:00 PM (Giờ nghỉ trưa)
   - Ngày kia: 10:00 AM - 2:00 PM (Đã có lịch hẹn)

3. **Test Flow**:
   - Login as seeker1@test.com
   - Browse caregivers
   - Select caregiver1 (Trần Văn Nam)
   - Try booking → See availability calendar
   - Notice blocked times are greyed out
   - Select available slot → Complete booking

4. **Database**: 
   - Chạy seed data để có đầy đủ caregivers và availability
   - Command: `npm run seed` hoặc trong app Settings → Seed Data

---

## 🧪 Testing Scenarios

### Scenario 1: Book Available Slot ✅
1. Login as seeker1@test.com
2. Go to Caregivers tab
3. Select any caregiver
4. Choose package (e.g., 4 giờ)
5. See green available slots
6. Select one → Confirm booking
7. **Expected**: Booking successful, schedule entry created

### Scenario 2: Try Booking Unavailable Slot ❌
1. Login as seeker1@test.com
2. Select caregiver1 (has blocked times)
3. Choose package
4. See tomorrow 2-4 PM is greyed out
5. **Expected**: Cannot select blocked slot

### Scenario 3: Caregiver View ✅
1. Login as caregiver1@test.com
2. Go to Dashboard
3. See upcoming appointments
4. **Expected**: Only accepted/upcoming appointments shown

---

## 🔧 Admin/Development

Để tạo thêm accounts, update file `backend_ai/requests.json` hoặc sử dụng API:

```bash
POST /users
{
  "email": "newuser@test.com",
  "password": "password123",
  "role": "careseeker", // or "caregiver"
  "name": "New User",
  "phone": "0901234567"
}
```
