# Tài Liệu Chi Tiết Quản Lý Xác Thực và Tài Khoản

## 1. Giới Thiệu

Hệ thống quản lý xác thực và tài khoản là nền tảng bảo mật cho toàn bộ ứng dụng quản lý nhà hàng. Module này đảm bảo rằng chỉ những người dùng được ủy quyền mới có thể truy cập hệ thống, và mỗi người dùng chỉ có quyền thực hiện các thao tác phù hợp với vai trò của họ. Hệ thống sử dụng JWT (JSON Web Tokens) cho authentication và RBAC (Role-Based Access Control) cho authorization.

### Công nghệ sử dụng:
- **Backend**: NestJS với Passport JWT Strategy
- **Frontend**: Next.js với Zustand state management
- **Database**: PostgreSQL với Prisma ORM
- **Mã hóa**: bcrypt với salt rounds 12

---

## 2. Các Thành Phần Chính

### 2.1 Tài Khoản Người Dùng (Account)

-   **Định nghĩa**: Thông tin đăng nhập và định danh người dùng
-   **Mục đích**: Quản lý quyền truy cập hệ thống
-   **Thông tin chứa**:
    -   `accountId`: ID tài khoản (Primary Key, auto increment)
    -   `username`: Tên đăng nhập (Unique, VarChar 50)
    -   `email`: Email (Unique, VarChar 255)
    -   `phoneNumber`: Số điện thoại (Unique, VarChar 20)
    -   `password`: Mật khẩu (bcrypt hash, VarChar 255)
    -   `isActive`: Trạng thái hoạt động (Boolean, default true)
    -   `lastLogin`: Thời gian đăng nhập cuối (DateTime, nullable)
    -   `createdAt`, `updatedAt`: Thời gian tạo/cập nhật

### 2.2 Nhân Viên (Staff)

-   **Liên kết**: Mỗi Staff có đúng 1 Account (1:1)
-   **Thông tin chứa**:
    -   `staffId`: ID nhân viên (Primary Key)
    -   `accountId`: Liên kết với Account (Foreign Key, Unique)
    -   `fullName`: Họ tên (đầy đủ (VarChar 255)
    -   `address`: Địa chỉ (nullable)
    -   `dateOfBirth`: Ngày sinh (nullable)
    -   `hireDate`: Ngày vào làm (default now)
    -   `salary`: Lương (Decimal, nullable)
    -   `role`: Vai trò (Enum: admin, manager, waiter, chef, cashier)
    -   `isActive`: Trạng thái hoạt động

### 2.3 JWT Tokens

-   **Access Token**: Token ngắn hạn (15 phút) để xác thực các request
    -   Lưu trong cookie `accessToken` (httpOnly trong production)
    -   Cũng lưu trong memory (Zustand store) cho client
-   **Refresh Token**: Token dài hạn (7 ngày) để tạo access token mới
    -   Lưu trong cookie `refreshToken` (httpOnly)
    -   Lưu trong database table `refresh_tokens`
-   **Thông tin trong token (TokenPayload)**:
    -   `accountId`: ID tài khoản
    -   `staffId`: ID nhân viên
    -   `username`: Tên đăng nhập
    -   `role`: Vai trò

### 2.4 Vai Trò và Quyền Hạn (Roles)

-   **admin**: Toàn quyền quản trị hệ thống
-   **manager**: Quản lý nhà hàng, xem báo cáo, quản lý menu
-   **waiter**: Phục vụ, tạo đơn hàng, tạo hóa đơn
-   **chef**: Quản lý bếp, cập nhật trạng thái món ăn
-   **cashier**: Thu ngân, thanh toán hóa đơn

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Đăng Ký Tài Khoản

#### 3.1.1 Tạo Tài Khoản Nhân Viên Mới

**API Endpoint**: `POST /auth/staff`

**Mục tiêu**: Tạo tài khoản mới cho nhân viên (Account + Staff)

**Người tham gia chính**: Admin, Manager

**Điều kiện tiên quyết**:
-   Người tạo có quyền quản lý nhân viên
-   Email, username, số điện thoại chưa tồn tại

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+84123456789",
  "password": "password123",
  "fullName": "John Doe",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01",
  "hireDate": "2024-01-15",
  "salary": 10000000,
  "role": "waiter"
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Admin/Manager gọi API `/auth/staff`
2. **Bước 2**: Hệ thống validate input (class-validator):
    - Username: bắt buộc, không trống
    - Email: định dạng hợp lệ
    - Số điện thoại: bắt buộc
    - Mật khẩu: tối thiểu 6 ký tự
    - fullName: bắt buộc
    - role: enum hợp lệ
3. **Bước 3**: Kiểm tra trùng lặp:
    - Username không trùng
    - Email không trùng
    - Số điện thoại không trùng
4. **Bước 4**: Nếu hợp lệ:
    - Hash mật khẩu với bcrypt (salt rounds: 12)
    - Tạo Staff với nested create Account (Prisma)
5. **Bước 5**: Ghi log tạo tài khoản (Logger)
6. **Bước 6**: Trả về thông tin staff đã tạo

**Công thức mã hóa mật khẩu**:
```typescript
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(plainPassword, salt);
```

**Response thành công (201 Created)**:
```json
{
  "message": "Staff created successfully",
  "data": {
    "staffId": 1,
    "accountId": 1,
    "fullName": "John Doe",
    "role": "waiter"
  }
}
```

**Xử lý lỗi (409 Conflict)**:
-   `"Username already exists"`
-   `"Email already exists"`
-   `"Phone number already exists"`

---

### 3.2 Đăng Nhập

#### 3.2.1 Đăng Nhập Với Username

**API Endpoint**: `POST /auth/login`

**Mục tiêu**: Cho phép người dùng đăng nhập vào hệ thống

**Người tham gia**: Tất cả người dùng có tài khoản

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng truy cập trang `/login`
2. **Bước 2**: Nhập thông tin:
    - Username
    - Mật khẩu (tối thiểu 6 ký tự)
3. **Bước 3**: Client validate input (Zod schema):
    - Username không để trống, tối thiểu 3 ký tự
    - Password tối thiểu 6 ký tự
4. **Bước 4**: Server tìm kiếm tài khoản:
    - `AccountRepository.findByUsername(username)`
    - Kiểm tra tài khoản tồn tại
5. **Bước 5**: Kiểm tra trạng thái tài khoản:
    - `account.isActive === true`
6. **Bước 6**: Xác thực mật khẩu:
    - `bcrypt.compare(password, account.password)`
7. **Bước 7**: Lấy thông tin Staff:
    - `StaffRepository.findByAccountId(accountId)`
8. **Bước 8**: Nếu xác thực thành công:
    - Cập nhật `account.lastLogin`
    - Tạo Access Token (expires: 15 phút)
    - Tạo Refresh Token (expires: 7 ngày)
    - Lưu Refresh Token vào DB với deviceInfo và ipAddress
9. **Bước 9**: Set cookies và trả về response:
    - Cookie `accessToken` (15 phút, httpOnly trong production)
    - Cookie `refreshToken` (7 ngày, httpOnly)
10. **Bước 10**: Client lưu tokens:
    - Access Token trong memory (Zustand store)
    - User info trong Zustand store
11. **Bước 11**: Redirect theo role:
    - admin/manager → `/admin/dashboard`
    - waiter → `/admin/orders`
    - chef → `/admin/kitchen`
    - cashier → `/admin/bills`

**Response thành công (200 OK)**:
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "accountId": 1,
      "staffId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "waiter"
    },
    "accessToken": "eyJhbGc..."
  }
}
```

**Xử lý lỗi (401 Unauthorized)**:
-   `"Invalid username or password"` - Username không tồn tại hoặc mật khẩu sai
-   `"Account is inactive"` - Tài khoản bị vô hiệu hóa

**Xử lý lỗi (404 Not Found)**:
-   `"Staff profile not found"` - Không tìm thấy thông tin nhân viên

---

### 3.3 Làm Mới Token (Refresh Token)

**API Endpoint**: `POST /auth/refresh`

**Mục tiêu**: Tạo Access Token mới khi token cũ hết hạn

**Quy trình chi tiết**:

1. **Bước 1**: Access Token hết hạn (sau 15 phút)
2. **Bước 2**: Client nhận lỗi 401 Unauthorized
3. **Bước 3**: Client tự động gọi `POST /auth/refresh`
    - Refresh Token được gửi qua httpOnly cookie (tự động)
4. **Bước 4**: Server kiểm tra Refresh Token:
    - Verify JWT signature
    - Tìm trong DB: `RefreshTokenRepository.findByToken(token)`
    - Kiểm tra: tồn tại, không bị revoke, chưa hết hạn
    - Kiểm tra account vẫn active
5. **Bước 5**: Nếu hợp lệ:
    - Tạo Access Token mới (expires: 15 phút)
    - Set cookie `accessToken` mới
6. **Bước 6**: Client cập nhật access token trong memory
7. **Bước 7**: Retry request ban đầu

**Response thành công (200 OK)**:
```json
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

**Xử lý lỗi (401 Unauthorized)**:
-   `"No refresh token provided"` - Không có refresh token
-   `"Invalid refresh token"` - Token không hợp lệ hoặc không tồn tại
-   `"Account is inactive or not found"` - Tài khoản bị vô hiệu hóa

---

### 3.4 Đăng Xuất

#### 3.4.1 Đăng Xuất Khỏi Thiết Bị Hiện Tại

**API Endpoint**: `POST /auth/logout`

**Mục tiêu**: Đăng xuất khỏi thiết bị hiện tại

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng nhấn "Đăng xuất"
2. **Bước 2**: Client gọi `POST /auth/logout`
    - Refresh Token được gửi qua httpOnly cookie
3. **Bước 3**: Server xóa Refresh Token khỏi DB:
    - `RefreshTokenRepository.deleteByToken(refreshToken)`
4. **Bước 4**: Server xóa cookies:
    - `res.clearCookie('accessToken')`
    - `res.clearCookie('refreshToken')`
5. **Bước 5**: Client xóa auth state (Zustand store)
6. **Bước 6**: Redirect về trang đăng nhập

**Response thành công (200 OK)**:
```json
{
  "message": "Logout successful"
}
```

---

#### 3.4.2 Đăng Xuất Khỏi Tất Cả Thiết Bị

**API Endpoint**: `POST /auth/logout-all`

**Mục tiêu**: Đăng xuất khỏi tất cả thiết bị (security feature)

**Yêu cầu**: Phải đăng nhập (đã có access token hợp lệ)

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng chọn "Đăng xuất tất cả thiết bị"
2. **Bước 2**: Client gọi `POST /auth/logout-all`
3. **Bước 3**: Server revoke tất cả Refresh Tokens của account:
    - `RefreshTokenRepository.revokeAllByAccountId(accountId)`
    - Set `isRevoked = true`, `revokedAt = now()` cho tất cả
4. **Bước 4**: Server xóa cookies hiện tại
5. **Bước 5**: Ghi log
6. **Bước 6**: Tất cả thiết bị khác bị đăng xuất (refresh token không còn hợp lệ)

**Response thành công (200 OK)**:
```json
{
  "message": "Logged out from all devices"
}
```

**Use case**: Khi nghi ngờ tài khoản bị xâm nhập

---

### 3.5 Đổi Mật Khẩu

**API Endpoint**: `PUT /auth/change-password`

**Mục tiêu**: Thay đổi mật khẩu hiện tại (khi đã đăng nhập)

**Yêu cầu**: Phải đăng nhập (đã có access token hợp lệ)

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng vào "Cài đặt" > "Đổi mật khẩu"
2. **Bước 2**: Nhập:
    - Mật khẩu hiện tại
    - Mật khẩu mới (tối thiểu 6 ký tự)
3. **Bước 3**: Client gọi `PUT /auth/change-password`
4. **Bước 4**: Server validate:
    - JwtAuthGuard verify access token
    - Tìm account theo accountId từ token
    - Xác thực mật khẩu hiện tại: `bcrypt.compare(currentPassword, hash)`
5. **Bước 5**: Nếu mật khẩu hiện tại đúng:
    - Hash mật khẩu mới: `bcrypt.hash(newPassword, 12)`
    - Cập nhật trong DB: `AccountRepository.update(accountId, { password })`
6. **Bước 6**: Ghi log
7. **Bước 7**: Trả về thông báo thành công

**Response thành công (200 OK)**:
```json
{
  "message": "Password changed successfully"
}
```

**Xử lý lỗi (401 Unauthorized)**:
-   `"Current password is incorrect"` - Mật khẩu hiện tại không đúng

**Xử lý lỗi (404 Not Found)**:
-   `"Account not found"` - Không tìm thấy tài khoản

---

### 3.6 Cập Nhật Thông Tin Cá Nhân

**API Endpoint**: `PUT /auth/profile`

**Mục tiêu**: Cập nhật thông tin cá nhân

**Yêu cầu**: Phải đăng nhập

**Request Body** (tất cả đều optional):
```json
{
  "email": "newemail@example.com",
  "phoneNumber": "+84987654321",
  "fullName": "John Doe Updated",
  "address": "456 New Street"
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng vào trang Profile
2. **Bước 2**: Client lấy thông tin hiện tại: `GET /auth/me`
3. **Bước 3**: Người dùng sửa thông tin
4. **Bước 4**: Client gọi `PUT /auth/profile`
5. **Bước 5**: Server validate:
    - Nếu email thay đổi, kiểm tra email chưa tồn tại
    - Nếu phoneNumber thay đổi, kiểm tra số điện thoại chưa tồn tại
6. **Bước 6**: Cập nhật:
    - Account: email, phoneNumber
    - Staff: fullName, address
7. **Bước 7**: Trả về thông tin mới

**Response thành công (200 OK)**:
```json
{
  "message": "Profile updated successfully",
  "data": {
    "accountId": 1,
    "staffId": 1,
    "username": "john_doe",
    "email": "newemail@example.com",
    "phoneNumber": "+84987654321",
    "fullName": "John Doe Updated",
    "role": "waiter",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

**Xử lý lỗi (409 Conflict)**:
-   `"Email already exists"` - Email đã được sử dụng
-   `"Phone number already exists"` - Số điện thoại đã được sử dụng

---

### 3.7 Lấy Thông Tin Người Dùng Hiện Tại

**API Endpoint**: `GET /auth/me`

**Mục tiêu**: Lấy thông tin người dùng đang đăng nhập

**Yêu cầu**: Phải đăng nhập

**Response thành công (200 OK)**:
```json
{
  "message": "User info retrieved successfully",
  "data": {
    "accountId": 1,
    "staffId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phoneNumber": "+84123456789",
    "fullName": "John Doe",
    "role": "waiter",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3.8 Phân Quyền (Authorization)

**Cơ chế trong NestJS**:

1. **JwtAuthGuard** - Kiểm tra authentication:
    ```typescript
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtected(@CurrentUser() user: JwtPayload) {
      return user;
    }
    ```

2. **JwtStrategy** - Decode và validate JWT:
    ```typescript
    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
      async validate(payload: TokenPayload) {
        return {
          accountId: payload.accountId,
          staffId: payload.staffId,
          username: payload.username,
          role: payload.role,
        };
      }
    }
    ```

3. **CurrentUser Decorator** - Lấy thông tin user:
    ```typescript
    export const CurrentUser = createParamDecorator(
      (data: unknown, ctx: ExecutionContext): JwtPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      },
    );
    ```

4. **Public Decorator** - Bỏ qua authentication:
    ```typescript
    @Public()
    @Post('login')
    login(@Body() loginDto: LoginDto) {
      // Không cần JWT
    }
    ```

---

## 4. Ma Trận Phân Quyền Chi Tiết

| Resource          | Admin | Manager | Waiter | Chef | Cashier |
| ----------------- | ----- | ------- | ------ | ---- | ------- |
| **Tài Khoản**     |       |         |        |      |         |
| Tạo tài khoản     | ✓     | ✓*      | ✗      | ✗    | ✗       |
| Xem tài khoản     | ✓     | ✓       | ✓**    | ✓**  | ✓**     |
| Sửa tài khoản     | ✓     | ✓*      | ✓**    | ✓**  | ✓**     |
| Xóa tài khoản     | ✓     | ✗       | ✗      | ✗    | ✗       |
| Đổi vai trò       | ✓     | ✗       | ✗      | ✗    | ✗       |
| Khóa/mở tài khoản | ✓     | ✓       | ✗      | ✗    | ✗       |
| **Menu**          |       |         |        |      |         |
| Tạo món ăn        | ✓     | ✓       | ✗      | ✗    | ✗       |
| Xem menu          | ✓     | ✓       | ✓      | ✓    | ✓       |
| **Đơn Hàng**      |       |         |        |      |         |
| Tạo đơn           | ✓     | ✓       | ✓      | ✗    | ✗       |
| Xem đơn           | ✓     | ✓       | ✓      | ✓    | ✓       |
| Cập nhật đơn bếp  | ✓     | ✓       | ✗      | ✓    | ✗       |
| **Thanh Toán**    |       |         |        |      |         |
| Tạo hóa đơn       | ✓     | ✓       | ✓      | ✗    | ✓       |
| Thanh toán        | ✓     | ✓       | ✓      | ✗    | ✓       |
| Hoàn tiền         | ✓     | ✓       | ✗      | ✗    | ✗       |
| **Báo Cáo**       |       |         |        |      |         |
| Xem báo cáo       | ✓     | ✓       | ✗      | ✗    | ✗       |

\*: Có giới hạn  
\*\*: Chỉ tài khoản của mình

---

## 5. Bảo Mật và Best Practices (Đã Triển Khai)

### 5.1 Bảo Mật Mật Khẩu

-   ✅ **Hashing**: Sử dụng bcrypt với salt rounds = 12
-   ✅ **Không lưu plain text**: Mật khẩu luôn được hash trước khi lưu
-   ✅ **Yêu cầu mật khẩu**: Tối thiểu 6 ký tự (class-validator)

### 5.2 Bảo Mật JWT

-   ✅ **Secret key**: Cấu hình qua environment variable `JWT_SECRET`
-   ✅ **Thời gian hết hạn ngắn**: Access token 15 phúit
-   ✅ **Refresh token dài hạn**: 7 ngày, lưu trong DB
-   ✅ **httpOnly cookies**: Refresh token lưu trong httpOnly cookie
-   ✅ **Token payload tối thiểu**: Chỉ chứa accountId, staffId, username, role

### 5.3 Bảo Mật Khác

-   ✅ **Secure cookies trong production**: `sameSite: 'strict'`, `secure: true`
-   ✅ **Revoke token**: Refresh token có cờ `isRevoked` trong DB
-   ✅ **Track device info**: Lưu `deviceInfo` và `ipAddress` của mỗi refresh token
-   ✅ **Cleanup expired tokens**: Có phương thức `cleanupExpiredTokens()`

---

## 6. Bảng Tóm Tắt Lỗi

| Mã Lỗi | Lỗi                      | Nguyên Nhân           | Xử Lý                        |
| ------ | ------------------------ | --------------------- | ---------------------------- |
| 401    | Unauthorized             | Không có token        | Yêu cầu đăng nhập            |
| 401    | Unauthorized             | Token không hợp lệ    | Yêu cầu đăng nhập            |
| 401    | Unauthorized             | Token hết hạn         | Refresh token hoặc đăng nhập |
| 403    | Forbidden                | Không đủ quyền        | Thông báo không có quyền     |
| 409    | Conflict                 | Username đã tồn tại   | Chọn username khác           |
| 409    | Conflict                 | Email đã tồn tại      | Sử dụng email khác           |
| 429    | Too Many Requests        | Vượt quá rate limit   | Đợi và thử lại               |

---

## 7. Kết Luận

Hệ thống xác thực và phân quyền đã được triển khai với các tính năng chính:

### Tính năng đã triển khai:
-   ✅ Đăng nhập với username/password
-   ✅ JWT Access Token (15 phút) + Refresh Token (7 ngày)
-   ✅ Lưu token trong httpOnly cookies
-   ✅ Tạo tài khoản nhân viên (Account + Staff)
-   ✅ Làm mới token tự động
-   ✅ Đăng xuất (thiết bị đơn và tất cả)
-   ✅ Đổi mật khẩu
-   ✅ Cập nhật thông tin cá nhân
-   ✅ Phân quyền theo 5 role: admin, manager, waiter, chef, cashier

### Công nghệ sử dụng:
-   **Backend**: NestJS, Passport JWT, bcrypt, class-validator
-   **Frontend**: Next.js, Zustand, React Hook Form, Zod
-   **Database**: PostgreSQL với Prisma ORM

### API Endpoints:
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/staff` | Tạo nhân viên |
| POST | `/auth/register` | Đăng ký (chỉ account) |
| POST | `/auth/refresh` | Làm mới token |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/logout-all` | Đăng xuất tất cả |
| GET | `/auth/me` | Lấy thông tin user |
| PUT | `/auth/profile` | Cập nhật profile |
| PUT | `/auth/change-password` | Đổi mật khẩu |
