# Tài Liệu Chi Tiết Quản Lý Xác Thực và Tài Khoản

## 1. Giới Thiệu

Hệ thống quản lý xác thực và tài khoản là nền tảng bảo mật cho toàn bộ ứng dụng quản lý nhà hàng. Module này đảm bảo rằng chỉ những người dùng được ủy quyền mới có thể truy cập hệ thống, và mỗi người dùng chỉ có quyền thực hiện các thao tác phù hợp với vai trò của họ. Hệ thống sử dụng JWT (JSON Web Tokens) cho authentication và RBAC (Role-Based Access Control) cho authorization.

---

## 2. Các Thành Phần Chính

### 2.1 Tài Khoản Người Dùng (User Accounts)

-   **Định nghĩa**: Thông tin đăng nhập và định danh người dùng
-   **Mục đích**: Quản lý quyền truy cập hệ thống
-   **Thông tin chứa**:
    -   ID tài khoản (Account ID)
    -   Tên đăng nhập (Username) - duy nhất
    -   Email - duy nhất
    -   Số điện thoại - duy nhất
    -   Mật khẩu (hashed với bcrypt)
    -   Trạng thái (Active/Inactive)
    -   Thời gian đăng nhập cuối
    -   Thời gian tạo/cập nhật

### 2.2 JWT Tokens

-   **Access Token**: Token ngắn hạn (15-30 phút) để xác thực các request
-   **Refresh Token**: Token dài hạn (7-30 ngày) để tạo access token mới
-   **Thông tin trong token**:
    -   User ID
    -   Username
    -   Role
    -   Expiration time

### 2.3 Vai Trò và Quyền Hạn (Roles & Permissions)

-   **Admin**: Toàn quyền quản trị hệ thống
-   **Manager**: Quản lý nhà hàng, xem báo cáo
-   **Waiter**: Phục vụ, tạo đơn hàng
-   **Chef**: Quản lý bếp, cập nhật đơn hàng
-   **Cashier**: Thu ngân, thanh toán

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Đăng Ký Tài Khoản

#### 3.1.1 Đăng Ký Tài Khoản Mới (cho nhân viên)

**Mục tiêu**: Tạo tài khoản mới cho nhân viên

**Người tham gia chính**: Admin, Manager

**Điều kiện tiên quyết**:
-   Người tạo có quyền quản lý nhân viên
-   Email, username, số điện thoại chưa tồn tại

**Quy trình chi tiết**:

1. **Bước 1**: Admin/Manager truy cập "Tạo Nhân Viên Mới"
2. **Bước 2**: Điền form đăng ký:
    - Username (4-20 ký tự, không dấu)
    - Email (định dạng hợp lệ)
    - Số điện thoại (10-11 số)
    - Mật khẩu tạm (tối thiểu 8 ký tự)
    - Xác nhận mật khẩu
3. **Bước 3**: Hệ thống validate:
    - Username không trùng
    - Email không trùng
    - Số điện thoại không trùng
    - Mật khẩu đủ mạnh
    - Các trường bắt buộc đầy đủ
4. **Bước 4**: Nếu hợp lệ:
    - Hash mật khẩu với bcrypt (salt rounds: 10)
    - Tạo record Account trong DB
    - Tạo record Staff liên kết
    - Gán vai trò mặc định
5. **Bước 5**: Gửi email thông báo:
    - Username
    - Mật khẩu tạm
    - Link đăng nhập
    - Hướng dẫn đổi mật khẩu
6. **Bước 6**: Ghi log tạo tài khoản
7. **Bước 7**: Hiển thị thông báo thành công

**Công thức mã hóa mật khẩu**:
```
hashedPassword = bcrypt.hash(plainPassword, saltRounds)
saltRounds = 10
```

**Xử lý lỗi**:
-   Username đã tồn tại: "Tên đăng nhập đã được sử dụng"
-   Email đã tồn tại: "Email đã được đăng ký"
-   Số điện thoại đã tồn tại: "Số điện thoại đã được sử dụng"
-   Mật khẩu yếu: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"

**Ghi log**:
-   Người tạo: [admin_username]
-   Hành động: Tạo tài khoản
-   Username mới: [new_username]
-   Email: [email]
-   Thời gian: [timestamp]

---

### 3.2 Đăng Nhập

#### 3.2.1 Đăng Nhập Với Username/Email

**Mục tiêu**: Cho phép người dùng đăng nhập vào hệ thống

**Người tham gia**: Tất cả người dùng có tài khoản

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng truy cập trang đăng nhập
2. **Bước 2**: Nhập thông tin:
    - Username hoặc Email
    - Mật khẩu
3. **Bước 3**: Hệ thống validate input:
    - Không để trống
    - Định dạng hợp lệ
4. **Bước 4**: Tìm kiếm tài khoản:
    - Query DB với username hoặc email
    - Kiểm tra tài khoản tồn tại
5. **Bước 5**: Kiểm tra trạng thái tài khoản:
    - Tài khoản có active không
    - Tài khoản có bị khóa không
6. **Bước 6**: Xác thực mật khẩu:
    - So sánh mật khẩu nhập vào với hash trong DB
    - `bcrypt.compare(inputPassword, hashedPassword)`
7. **Bước 7**: Nếu xác thực thành công:
    - Tạo Access Token (expires: 30 phút)
    - Tạo Refresh Token (expires: 7 ngày)
    - Lưu Refresh Token vào DB
    - Cập nhật lastLogin
8. **Bước 8**: Trả về response:
    ```json
    {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "waiter"
      }
    }
    ```
9. **Bước 9**: Client lưu tokens:
    - Access Token: localStorage hoặc memory
    - Refresh Token: httpOnly cookie (bảo mật hơn)
10. **Bước 10**: Ghi log đăng nhập
11. **Bước 11**: Chuyển đến trang chủ

**Xử lý lỗi**:
-   Tài khoản không tồn tại: "Tên đăng nhập hoặc mật khẩu không đúng"
-   Mật khẩu sai: "Tên đăng nhập hoặc mật khẩu không đúng"
-   Tài khoản bị khóa: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên"
-   Tài khoản inactive: "Tài khoản chưa được kích hoạt"

**Rate Limiting**: Giới hạn 5 lần đăng nhập sai trong 15 phút

**Ghi log**:
-   Username: [username]
-   Hành động: Đăng nhập
-   Kết quả: Thành công/Thất bại
-   IP Address: [ip]
-   User Agent: [user_agent]
-   Thời gian: [timestamp]

---

#### 3.2.2 Đăng Nhập Với Mã QR (cho nhân viên)

**Mục tiêu**: Đăng nhập nhanh bằng mã QR

**Quy trình chi tiết**:

1. **Bước 1**: Nhân viên vào trang đăng nhập
2. **Bước 2**: Chọn "Đăng nhập bằng QR"
3. **Bước 3**: Hệ thống tạo mã QR động:
    - Tạo session ID ngẫu nhiên
    - Mã QR có giá trị trong 2 phút
    - Hiển thị mã QR trên màn hình
4. **Bước 4**: Nhân viên quét mã QR bằng app di động
5. **Bước 5**: App gửi request xác thực với session ID
6. **Bước 6**: Hệ thống xác thực và tạo tokens
7. **Bước 7**: Trang web tự động đăng nhập

---

### 3.3 Làm Mới Token (Refresh Token)

**Mục tiêu**: Tạo Access Token mới khi token cũ hết hạn

**Quy trình chi tiết**:

1. **Bước 1**: Access Token hết hạn
2. **Bước 2**: Client phát hiện lỗi 401 Unauthorized
3. **Bước 3**: Client gửi request làm mới token:
    - Endpoint: POST /auth/refresh
    - Body: { refreshToken: "..." }
4. **Bước 4**: Hệ thống kiểm tra Refresh Token:
    - Token có hợp lệ không
    - Token có hết hạn không
    - Token có tồn tại trong DB không
5. **Bước 5**: Nếu hợp lệ:
    - Tạo Access Token mới
    - (Tùy chọn) Tạo Refresh Token mới
    - Vô hiệu hóa Refresh Token cũ
6. **Bước 6**: Trả về tokens mới
7. **Bước 7**: Client cập nhật tokens
8. **Bước 8**: Thử lại request ban đầu

**Xử lý lỗi**:
-   Refresh Token không hợp lệ: Yêu cầu đăng nhập lại
-   Refresh Token hết hạn: Yêu cầu đăng nhập lại
-   Refresh Token không tồn tại: Yêu cầu đăng nhập lại

---

### 3.4 Đăng Xuất

#### 3.4.1 Đăng Xuất Khỏi Một Thiết Bị

**Mục tiêu**: Đăng xuất khỏi thiết bị hiện tại

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng nhấn "Đăng xuất"
2. **Bước 2**: Client gửi request đăng xuất với Refresh Token
3. **Bước 3**: Hệ thống:
    - Xóa Refresh Token khỏi DB
    - Thêm Access Token vào blacklist (cho đến khi hết hạn)
4. **Bước 4**: Client xóa tokens khỏi storage
5. **Bước 5**: Ghi log đăng xuất
6. **Bước 6**: Chuyển về trang đăng nhập

---

#### 3.4.2 Đăng Xuất Khỏi Tất Cả Thiết Bị

**Mục tiêu**: Đăng xuất khỏi tất cả thiết bị (security feature)

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng chọn "Đăng xuất tất cả thiết bị"
2. **Bước 2**: Yêu cầu xác nhận mật khẩu
3. **Bước 3**: Nếu mật khẩu đúng:
    - Xóa tất cả Refresh Tokens của user
    - Thêm tất cả Access Tokens vào blacklist
4. **Bước 4**: Ghi log đăng xuất hàng loạt
5. **Bước 5**: Tất cả thiết bị khác bị đăng xuất

**Use case**: Khi nghi ngờ tài khoản bị xâm nhập

---

### 3.5 Quên Mật Khẩu

#### 3.5.1 Yêu Cầu Reset Mật Khẩu

**Mục tiêu**: Gửi link reset mật khẩu cho người dùng quên mật khẩu

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng nhấn "Quên mật khẩu?"
2. **Bước 2**: Nhập email đã đăng ký
3. **Bước 3**: Hệ thống kiểm tra email tồn tại
4. **Bước 4**: Nếu tồn tại:
    - Tạo reset token (UUID, expires trong 1 giờ)
    - Lưu token vào DB
    - Tạo link reset: `https://app.com/reset-password?token=xxx`
    - Gửi email với link
5. **Bước 5**: Hiển thị thông báo:
    - "Nếu email tồn tại, bạn sẽ nhận được link reset mật khẩu"
    - (Không tiết lộ email có tồn tại hay không - bảo mật)
6. **Bước 6**: Ghi log yêu cầu reset

**Rate Limiting**: Tối đa 3 request/giờ cho mỗi email

---

#### 3.5.2 Reset Mật Khẩu

**Mục tiêu**: Đặt mật khẩu mới

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng nhấn vào link trong email
2. **Bước 2**: Hệ thống kiểm tra token:
    - Token có hợp lệ không
    - Token có hết hạn không (1 giờ)
    - Token đã được sử dụng chưa
3. **Bước 3**: Nếu hợp lệ, hiển thị form đổi mật khẩu:
    - Mật khẩu mới
    - Xác nhận mật khẩu mới
4. **Bước 4**: Validate mật khẩu mới:
    - Tối thiểu 8 ký tự
    - Có chữ hoa, chữ thường, số
    - Không trùng với 5 mật khẩu gần nhất
5. **Bước 5**: Nếu hợp lệ:
    - Hash mật khẩu mới
    - Cập nhật mật khẩu trong DB
    - Đánh dấu token đã sử dụng
    - Xóa tất cả Refresh Tokens (đăng xuất tất cả)
6. **Bước 6**: Gửi email xác nhận đổi mật khẩu
7. **Bước 7**: Ghi log đổi mật khẩu
8. **Bước 8**: Chuyển đến trang đăng nhập

---

### 3.6 Đổi Mật Khẩu

#### 3.6.1 Đổi Mật Khẩu (khi đã đăng nhập)

**Mục tiêu**: Thay đổi mật khẩu hiện tại

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng vào "Cài đặt" > "Đổi mật khẩu"
2. **Bước 2**: Nhập:
    - Mật khẩu hiện tại
    - Mật khẩu mới
    - Xác nhận mật khẩu mới
3. **Bước 3**: Validate:
    - Mật khẩu hiện tại đúng
    - Mật khẩu mới đủ mạnh
    - Mật khẩu mới khác mật khẩu cũ
    - Xác nhận khớp với mật khẩu mới
4. **Bước 4**: Nếu hợp lệ:
    - Hash mật khẩu mới
    - Cập nhật trong DB
    - Lưu vào lịch sử mật khẩu
    - Đăng xuất các thiết bị khác
5. **Bước 5**: Gửi email thông báo đổi mật khẩu
6. **Bước 6**: Ghi log
7. **Bước 7**: Hiển thị thông báo thành công

---

### 3.7 Xác Thực Hai Yếu Tố (2FA)

#### 3.7.1 Bật 2FA

**Mục tiêu**: Tăng cường bảo mật với 2FA

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng vào "Cài đặt" > "Bảo mật" > "Bật 2FA"
2. **Bước 2**: Chọn phương thức 2FA:
    - **Authenticator App** (Google Authenticator, Authy)
    - **SMS** (Gửi mã qua SMS)
    - **Email** (Gửi mã qua email)
3. **Bước 3**: Nếu chọn Authenticator App:
    - Hệ thống tạo secret key
    - Hiển thị mã QR
    - Người dùng quét mã bằng app
    - Nhập mã 6 số để xác nhận
4. **Bước 4**: Nếu chọn SMS/Email:
    - Gửi mã xác nhận
    - Người dùng nhập mã
5. **Bước 5**: Xác nhận thành công:
    - Lưu cấu hình 2FA
    - Tạo backup codes (10 mã dự phòng)
    - Hiển thị backup codes cho người dùng lưu
6. **Bước 6**: Ghi log bật 2FA

---

#### 3.7.2 Đăng Nhập Với 2FA

**Quy trình chi tiết**:

1. Đăng nhập bình thường (username + password)
2. Sau khi xác thực thành công, hệ thống yêu cầu mã 2FA
3. Người dùng nhập mã từ app/SMS/email
4. Hệ thống verify mã
5. Nếu đúng, tạo tokens và cho phép đăng nhập

---

### 3.8 Quản Lý Phiên (Session Management)

#### 3.8.1 Xem Các Phiên Đăng Nhập

**Mục tiêu**: Xem danh sách thiết bị đang đăng nhập

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng vào "Cài đặt" > "Phiên đăng nhập"
2. **Bước 2**: Hiển thị danh sách phiên:
    - Thiết bị (Desktop, Mobile, Tablet)
    - Trình duyệt (Chrome, Firefox, Safari)
    - IP Address
    - Vị trí (ước lượng từ IP)
    - Thời gian đăng nhập
    - Phiên hiện tại (đánh dấu)
3. **Bước 3**: Tùy chọn:
    - Đăng xuất một phiên cụ thể
    - Đăng xuất tất cả phiên khác

---

### 3.9 Phân Quyền (Authorization)

#### 3.9.1 Kiểm Tra Quyền Truy Cập

**Mục tiêu**: Đảm bảo user chỉ truy cập resource được phép

**Cơ chế**:

1. **Middleware kiểm tra authentication**:
    ```javascript
    function authenticate(req, res, next) {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token' });
      
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    ```

2. **Middleware kiểm tra authorization**:
    ```javascript
    function authorize(...allowedRoles) {
      return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        
        next();
      };
    }
    ```

3. **Sử dụng**:
    ```javascript
    // Chỉ Admin và Manager
    router.get('/reports', authenticate, authorize('admin', 'manager'), getReports);
    
    // Tất cả các vai trò đã đăng nhập
    router.get('/profile', authenticate, getProfile);
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

## 5. Bảo Mật và Best Practices

### 5.1 Bảo Mật Mật Khẩu

-   **Hashing**: Sử dụng bcrypt với salt rounds >= 10
-   **Không lưu plain text**: Không bao giờ lưu mật khẩu dạng text
-   **Yêu cầu mật khẩu mạnh**:
    -   Tối thiểu 8 ký tự
    -   Có chữ hoa, chữ thường
    -   Có số
    -   Có ký tự đặc biệt (khuyến nghị)
-   **Lịch sử mật khẩu**: Không cho dùng lại 5 mật khẩu gần nhất

### 5.2 Bảo Mật JWT

-   **Secret key mạnh**: Random, dài, phức tạp
-   **Thời gian hết hạn ngắn**: Access token 15-30 phút
-   **HTTPS only**: Chỉ truyền token qua HTTPS
-   **httpOnly cookies**: Lưu refresh token trong httpOnly cookie

### 5.3 Rate Limiting

-   **Đăng nhập**: 5 lần/15 phút
-   **Reset password**: 3 lần/giờ
-   **API calls**: 100 requests/phút

### 5.4 Audit Logging

-   Ghi log tất cả:
    -   Đăng nhập/Đăng xuất
    -   Đổi mật khẩu
    -   Thay đổi vai trò
    -   Truy cập resource nhạy cảm

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

Hệ thống xác thực và phân quyền là nền tảng bảo mật cho toàn bộ ứng dụng. Một hệ thống tốt:

-   **Bảo mật cao**: Bảo vệ dữ liệu và tài khoản người dùng
-   **Dễ sử dụng**: UX/UI đơn giản, rõ ràng
-   **Linh hoạt**: Hỗ trợ nhiều phương thức xác thực
-   **Có thể mở rộng**: Dễ dàng thêm vai trò và quyền mới
-   **Tuân thủ**: Đáp ứng các tiêu chuẩn bảo mật

Tài liệu này cung cấp hướng dẫn toàn diện cho việc phát triển và triển khai hệ thống xác thực an toàn.
