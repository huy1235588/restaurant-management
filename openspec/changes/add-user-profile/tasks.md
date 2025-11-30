# Tasks: Hồ Sơ Cá Nhân (User Profile)

## 1. Backend API

- [x] **1.1** Tạo `UpdateProfileDto`
  - File: `src/modules/auth/dto/update-profile.dto.ts`
  - Fields: email (optional), phoneNumber (optional), fullName (optional), address (optional)
  - Validation: @IsEmail, @IsString, @IsOptional

- [x] **1.2** Implement `updateProfile` trong AuthService
  - Check unique email/phoneNumber (exclude current user)
  - Update Account table: email, phoneNumber
  - Update Staff table: fullName, address
  - Return updated user info

- [x] **1.3** Implement `changePassword` trong AuthService
  - Verify current password với bcrypt.compare
  - Hash new password
  - Update Account.password
  - Revoke all refresh tokens (optional)

- [x] **1.4** Thêm endpoints trong AuthController
  - `PUT /auth/profile` - Update profile (auth required)
  - `PUT /auth/change-password` - Change password (auth required)

- [x] **1.5** Export DTOs trong index.ts

## 2. Frontend Module Structure

- [x] **2.1** Tạo module structure
  ```
  src/modules/admin/profile/
  ├── index.ts
  ├── components/
  │   ├── ProfileInfoCard.tsx
  │   ├── EditProfileDialog.tsx
  │   └── ChangePasswordDialog.tsx
  ├── views/
  │   └── ProfileView.tsx
  ├── services/
  │   └── profile.service.ts
  ├── hooks/
  │   └── useProfile.ts
  ├── types/
  │   └── index.ts
  └── utils/
      └── validation.ts
  ```

## 3. Frontend Types & Validation

- [x] **3.1** Định nghĩa types
  - `ProfileData` - Dữ liệu profile từ API
  - `UpdateProfileData` - Dữ liệu cập nhật profile
  - `ChangePasswordData` - Dữ liệu đổi mật khẩu

- [x] **3.2** Tạo Zod validation schemas
  - `updateProfileSchema`
  - `changePasswordSchema` (với confirmPassword)

## 4. Frontend Services & Hooks

- [x] **4.1** Implement profile.service.ts
  - `getProfile()` - GET /auth/me
  - `updateProfile(data)` - PUT /auth/profile
  - `changePassword(data)` - PUT /auth/change-password

- [x] **4.2** Implement useProfile hook
  - `useProfile()` - Fetch profile data
  - `useUpdateProfile()` - Mutation hook
  - `useChangePassword()` - Mutation hook

## 5. Frontend Components

- [x] **5.1** ProfileInfoCard
  - Hiển thị thông tin account: username, email, SĐT
  - Hiển thị thông tin staff: họ tên, địa chỉ, ngày sinh, ngày vào làm
  - Hiển thị role với badge màu
  - Hiển thị avatar với fallback initials

- [x] **5.2** EditProfileDialog
  - Form với fields: email, phoneNumber, fullName, address
  - Validation với Zod
  - Toast notification on success/error
  - Close dialog on success

- [x] **5.3** ChangePasswordDialog
  - Form với fields: currentPassword, newPassword, confirmPassword
  - Show/hide password toggle
  - Validation: min 6 chars, confirm match
  - Toast notification on success/error

## 6. Frontend Views & Routes

- [x] **6.1** ProfileView
  - Layout với ProfileInfoCard
  - Buttons: "Chỉnh sửa", "Đổi mật khẩu"
  - Dialogs integration

- [x] **6.2** Tạo route page
  - File: `src/app/admin/profile/page.tsx`
  - Import ProfileView từ module

## 7. Translations

- [x] **7.1** Thêm translations vi.json
  ```json
  "profile": {
    "title": "Hồ Sơ Cá Nhân",
    "editProfile": "Chỉnh Sửa Thông Tin",
    "changePassword": "Đổi Mật Khẩu",
    "accountInfo": "Thông Tin Tài Khoản",
    "personalInfo": "Thông Tin Cá Nhân",
    "currentPassword": "Mật khẩu hiện tại",
    "newPassword": "Mật khẩu mới",
    "confirmPassword": "Xác nhận mật khẩu",
    "passwordMismatch": "Mật khẩu không khớp",
    "profileUpdated": "Cập nhật thông tin thành công",
    "passwordChanged": "Đổi mật khẩu thành công"
  }
  ```

- [x] **7.2** Thêm translations en.json
  ```json
  "profile": {
    "title": "My Profile",
    "editProfile": "Edit Profile",
    "changePassword": "Change Password",
    "accountInfo": "Account Information",
    "personalInfo": "Personal Information",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmPassword": "Confirm Password",
    "passwordMismatch": "Passwords do not match",
    "profileUpdated": "Profile updated successfully",
    "passwordChanged": "Password changed successfully"
  }
  ```

## 8. Testing & Polish

- [x] **8.1** Test API endpoints
  - Test update profile với valid/invalid data
  - Test change password với correct/incorrect current password
  - Test unique constraint violations

- [x] **8.2** Test Frontend
  - Test form validation
  - Test dialog open/close
  - Test toast notifications
  - Test responsive design

