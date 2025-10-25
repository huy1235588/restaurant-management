# Biểu Đồ Quản Lý Xác Thực và Tài Khoản

## 1. Biểu Đồ Tổng Quan Hệ Thống Xác Thực

```mermaid
flowchart TB
    Start([Người dùng]) --> Login{Đăng nhập}
    Login -->|Username/Password| Auth[Xác thực]
    Login -->|QR Code| QRAuth[Xác thực QR]
    Login -->|OAuth| OAuth[Xác thực OAuth]
    
    Auth --> Validate{Valid?}
    Validate -->|No| Error[Lỗi đăng nhập]
    Validate -->|Yes| Check2FA{2FA enabled?}
    
    Check2FA -->|No| CreateTokens[Tạo Tokens]
    Check2FA -->|Yes| Verify2FA[Nhập mã 2FA]
    Verify2FA --> Valid2FA{Valid?}
    Valid2FA -->|No| Error
    Valid2FA -->|Yes| CreateTokens
    
    CreateTokens --> AccessToken[Access Token<br/>expires: 30min]
    CreateTokens --> RefreshToken[Refresh Token<br/>expires: 7 days]
    
    AccessToken --> Success[Đăng nhập<br/>thành công]
    RefreshToken --> Success
    
    Success --> App[Truy cập ứng dụng]
    
    Error --> Retry{Retry?}
    Retry -->|Yes| Login
    Retry -->|No| End([Kết thúc])
    
    App --> End
```

## 2. Biểu Đồ Luồng Đăng Ký Tài Khoản

```mermaid
sequenceDiagram
    participant A as Admin/Manager
    participant S as System
    participant DB as Database
    participant E as Email Service
    participant L as Logger
    
    A->>S: POST /api/accounts/create
    Note over A,S: {username, email, phone, password}
    
    S->>S: Validate input
    S->>DB: Check username exists
    DB-->>S: Not exists
    
    S->>DB: Check email exists
    DB-->>S: Not exists
    
    S->>DB: Check phone exists
    DB-->>S: Not exists
    
    S->>S: Hash password (bcrypt)
    Note over S: saltRounds: 10
    
    S->>DB: INSERT Account
    DB-->>S: Account created
    
    S->>DB: INSERT Staff (link to Account)
    DB-->>S: Staff created
    
    S->>DB: Assign default role
    DB-->>S: Role assigned
    
    S->>E: Send welcome email
    Note over E: Username + temp password<br/>+ login link
    E-->>S: Email sent
    
    S->>L: Log account creation
    L-->>S: Logged
    
    S-->>A: 201 Created
    Note over S,A: {id, username, email, role}
```

## 3. Biểu Đồ Trạng Thái Tài Khoản

```mermaid
stateDiagram-v2
    [*] --> Pending: Tạo tài khoản
    Pending --> Active: Kích hoạt
    Pending --> Expired: Quá hạn kích hoạt
    
    Active --> Locked: Khóa tài khoản
    Active --> Suspended: Tạm ngưng
    Active --> Inactive: Vô hiệu hóa
    
    Locked --> Active: Mở khóa
    Suspended --> Active: Kích hoạt lại
    Inactive --> Active: Kích hoạt lại
    
    Expired --> [*]: Xóa
    Locked --> Deleted: Admin xóa
    Suspended --> Deleted: Admin xóa
    Inactive --> Deleted: Admin xóa
    
    Deleted --> [*]
    
    note right of Active
        Trạng thái hoạt động
        - Đăng nhập được
        - Có quyền truy cập
    end note
    
    note right of Locked
        Bị khóa do:
        - Vi phạm chính sách
        - Đăng nhập sai nhiều lần
        - Admin khóa
    end note
```

## 4. Biểu Đồ Luồng Đăng Nhập JWT

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database
    participant L as Logger
    
    U->>C: Nhập username + password
    C->>S: POST /api/auth/login
    
    S->>DB: Find user by username
    DB-->>S: User data
    
    S->>S: Check account status
    alt Account inactive or locked
        S-->>C: 403 Forbidden
        C-->>U: Tài khoản bị khóa
    end
    
    S->>S: Compare password
    Note over S: bcrypt.compare(input, hash)
    
    alt Password incorrect
        S->>L: Log failed attempt
        S-->>C: 401 Unauthorized
        C-->>U: Sai mật khẩu
    else Password correct
        S->>S: Generate Access Token
        Note over S: JWT expires: 30min
        S->>S: Generate Refresh Token
        Note over S: JWT expires: 7 days
        
        S->>DB: Save refresh token
        S->>DB: Update lastLogin
        S->>L: Log successful login
        
        S-->>C: 200 OK
        Note over C,S: {accessToken, refreshToken, user}
        
        C->>C: Store tokens
        Note over C: Access: memory<br/>Refresh: httpOnly cookie
        
        C-->>U: Chuyển đến trang chủ
    end
```

## 5. Biểu Đồ Vòng Đời JWT Token

```mermaid
flowchart TB
    Start([Đăng nhập]) --> Create[Tạo Access Token]
    Create --> Store[Lưu token<br/>expires: 30 phút]
    
    Store --> Use[Sử dụng token<br/>cho API requests]
    
    Use --> Check{Token<br/>còn hạn?}
    Check -->|Yes| Valid[Request thành công]
    Check -->|No| Expired[Token hết hạn]
    
    Expired --> Refresh[Gọi /refresh]
    Refresh --> CheckRefresh{Refresh token<br/>hợp lệ?}
    
    CheckRefresh -->|Yes| NewAccess[Tạo Access token mới]
    CheckRefresh -->|No| ReLogin[Yêu cầu đăng nhập lại]
    
    NewAccess --> Store
    Valid --> Continue{Tiếp tục<br/>sử dụng?}
    
    Continue -->|Yes| Use
    Continue -->|No| Logout[Đăng xuất]
    
    Logout --> Blacklist[Thêm vào blacklist]
    Blacklist --> End([Kết thúc])
    ReLogin --> End
```

## 6. Biểu Đồ Làm Mới Token

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database
    participant BL as Blacklist
    
    C->>S: API Request with Access Token
    S->>S: Verify token
    S-->>C: 401 Token expired
    
    C->>S: POST /api/auth/refresh
    Note over C,S: {refreshToken}
    
    S->>S: Verify refresh token
    
    alt Invalid refresh token
        S-->>C: 401 Unauthorized
        C->>C: Clear all tokens
        C-->>C: Redirect to login
    else Valid refresh token
        S->>DB: Check token exists
        DB-->>S: Token found
        
        S->>S: Generate new Access Token
        Note over S: expires: 30 min
        
        opt Generate new Refresh Token
            S->>S: Generate new Refresh Token
            S->>DB: Save new refresh token
            S->>DB: Delete old refresh token
        end
        
        S-->>C: 200 OK
        Note over C,S: {accessToken, refreshToken?}
        
        C->>C: Update tokens
        C->>S: Retry original request
        S-->>C: 200 OK
    end
```

## 7. Biểu Đồ Đăng Xuất

```mermaid
flowchart TB
    Start([User nhấn Đăng xuất]) --> Choice{Đăng xuất<br/>khỏi?}
    
    Choice -->|Thiết bị này| SingleLogout[Đăng xuất đơn]
    Choice -->|Tất cả thiết bị| AllLogout[Đăng xuất tất cả]
    
    SingleLogout --> DeleteRT[Xóa Refresh Token hiện tại]
    SingleLogout --> AddBL[Thêm Access Token<br/>vào Blacklist]
    
    AllLogout --> Confirm{Xác nhận<br/>mật khẩu?}
    Confirm -->|No| End([Hủy])
    Confirm -->|Yes| DeleteAllRT[Xóa tất cả<br/>Refresh Tokens]
    DeleteAllRT --> AddAllBL[Thêm tất cả<br/>Access Tokens vào Blacklist]
    
    AddBL --> ClearClient[Xóa tokens<br/>trên Client]
    AddAllBL --> ClearClient
    
    ClearClient --> Log[Ghi log]
    Log --> Redirect[Chuyển về<br/>trang đăng nhập]
    
    Redirect --> End
```

## 8. Biểu Đồ Quên Mật Khẩu

```mermaid
sequenceDiagram
    participant U as User
    participant S as System
    participant DB as Database
    participant E as Email Service
    
    U->>S: POST /api/auth/forgot-password
    Note over U,S: {email}
    
    S->>DB: Find user by email
    
    alt Email not found
        S-->>U: 200 OK (không tiết lộ)
        Note over S,U: "Nếu email tồn tại,<br/>bạn sẽ nhận được link"
    else Email found
        S->>S: Generate reset token (UUID)
        Note over S: expires: 1 hour
        
        S->>DB: Save reset token
        DB-->>S: Saved
        
        S->>S: Create reset link
        Note over S: https://app.com/reset?token=xxx
        
        S->>E: Send email with link
        E-->>S: Sent
        
        S-->>U: 200 OK
        Note over S,U: "Nếu email tồn tại,<br/>bạn sẽ nhận được link"
    end
    
    U->>U: Click link in email
    U->>S: GET /reset-password?token=xxx
    
    S->>DB: Verify token
    
    alt Token invalid or expired
        S-->>U: 400 Bad Request
    else Token valid
        S-->>U: Show reset form
        
        U->>S: POST /api/auth/reset-password
        Note over U,S: {token, newPassword}
        
        S->>S: Validate password strength
        S->>S: Hash new password
        S->>DB: Update password
        S->>DB: Mark token as used
        S->>DB: Delete all refresh tokens
        
        S->>E: Send confirmation email
        
        S-->>U: 200 OK
        U->>U: Redirect to login
    end
```

## 9. Biểu Đồ Đổi Mật Khẩu

```mermaid
flowchart TB
    Start([User vào Settings]) --> Form[Form đổi mật khẩu]
    
    Form --> Input[Nhập:<br/>- Old password<br/>- New password<br/>- Confirm password]
    
    Input --> Submit[Submit]
    
    Submit --> VerifyOld{Old password<br/>đúng?}
    VerifyOld -->|No| ErrorOld[Lỗi: Mật khẩu cũ sai]
    VerifyOld -->|Yes| CheckStrength{New password<br/>đủ mạnh?}
    
    CheckStrength -->|No| ErrorWeak[Lỗi: Mật khẩu yếu]
    CheckStrength -->|Yes| CheckSame{New khác Old?}
    
    CheckSame -->|No| ErrorSame[Lỗi: Phải khác mật khẩu cũ]
    CheckSame -->|Yes| CheckConfirm{Confirm khớp?}
    
    CheckConfirm -->|No| ErrorConfirm[Lỗi: Xác nhận không khớp]
    CheckConfirm -->|Yes| CheckHistory{Trong lịch sử<br/>5 mật khẩu?}
    
    CheckHistory -->|Yes| ErrorHistory[Lỗi: Đã dùng gần đây]
    CheckHistory -->|No| Hash[Hash mật khẩu mới]
    
    Hash --> Update[Cập nhật DB]
    Update --> SaveHistory[Lưu vào lịch sử]
    SaveHistory --> LogoutOthers[Đăng xuất<br/>các thiết bị khác]
    
    LogoutOthers --> SendEmail[Gửi email thông báo]
    SendEmail --> Success[Thành công]
    
    Success --> End([Kết thúc])
    ErrorOld --> End
    ErrorWeak --> End
    ErrorSame --> End
    ErrorConfirm --> End
    ErrorHistory --> End
```

## 10. Biểu Đồ Bật 2FA

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server
    participant DB as Database
    participant A as Authenticator App
    
    U->>S: POST /api/auth/2fa/enable
    
    S->>S: Generate secret key
    Note over S: Base32 encoded
    
    S->>S: Generate QR code
    Note over S: otpauth://totp/App:user@email?secret=xxx
    
    S->>DB: Save secret (temporary)
    
    S-->>U: 200 OK
    Note over S,U: {qrCode, secret, backupCodes}
    
    U->>A: Scan QR code
    A->>A: Add account
    A-->>U: Display 6-digit code
    
    U->>S: POST /api/auth/2fa/verify
    Note over U,S: {code}
    
    S->>S: Verify code with secret
    Note over S: TOTP algorithm
    
    alt Code invalid
        S-->>U: 400 Invalid code
    else Code valid
        S->>DB: Enable 2FA for user
        S->>DB: Save secret (permanent)
        S->>DB: Generate 10 backup codes
        
        S-->>U: 200 OK
        Note over S,U: {success, backupCodes}
        
        U->>U: Save backup codes
    end
```

## 11. Biểu Đồ Đăng Nhập Với 2FA

```mermaid
flowchart TB
    Start([Đăng nhập]) --> Creds[Nhập username/password]
    
    Creds --> Auth{Xác thực}
    Auth -->|Sai| Error[Lỗi đăng nhập]
    Auth -->|Đúng| Check2FA{2FA enabled?}
    
    Check2FA -->|No| CreateTokens[Tạo tokens]
    Check2FA -->|Yes| Show2FA[Hiển thị form 2FA]
    
    Show2FA --> Input2FA[Nhập mã 6 số]
    Input2FA --> Verify{Verify code}
    
    Verify -->|Invalid| Retry{Thử lại?}
    Retry -->|Yes| Input2FA
    Retry -->|No| UseBackup{Dùng backup code?}
    
    UseBackup -->|Yes| InputBackup[Nhập backup code]
    InputBackup --> VerifyBackup{Valid?}
    VerifyBackup -->|No| Error
    VerifyBackup -->|Yes| MarkUsed[Đánh dấu code đã dùng]
    MarkUsed --> CreateTokens
    
    UseBackup -->|No| Error
    Verify -->|Valid| CreateTokens
    
    CreateTokens --> Success[Đăng nhập thành công]
    Success --> End([Kết thúc])
    Error --> End
```

## 12. Biểu Đồ ERD Xác Thực

```mermaid
erDiagram
    ACCOUNTS ||--o{ REFRESH_TOKENS : has
    ACCOUNTS ||--o{ PASSWORD_HISTORY : has
    ACCOUNTS ||--|| TWO_FACTOR_AUTH : has
    ACCOUNTS ||--o{ LOGIN_HISTORY : has
    ACCOUNTS }o--|| ROLES : has
    ROLES ||--o{ PERMISSIONS : has
    
    ACCOUNTS {
        int id PK
        string username UK
        string email UK
        string phone UK
        string password_hash
        int role_id FK
        enum status
        datetime last_login
        datetime created_at
        datetime updated_at
    }
    
    REFRESH_TOKENS {
        int id PK
        int account_id FK
        string token UK
        string device_info
        string ip_address
        datetime expires_at
        datetime created_at
    }
    
    PASSWORD_HISTORY {
        int id PK
        int account_id FK
        string password_hash
        datetime changed_at
    }
    
    TWO_FACTOR_AUTH {
        int id PK
        int account_id FK
        string secret
        boolean enabled
        json backup_codes
        datetime created_at
    }
    
    LOGIN_HISTORY {
        int id PK
        int account_id FK
        string ip_address
        string user_agent
        boolean success
        datetime timestamp
    }
    
    ROLES {
        int id PK
        string name UK
        string description
    }
    
    PERMISSIONS {
        int id PK
        int role_id FK
        string resource
        string action
    }
```

## 13. Biểu Đồ Ma Trận Phân Quyền

```mermaid
graph TB
    subgraph Roles
        Admin[Admin<br/>Toàn quyền]
        Manager[Manager<br/>Quản lý]
        Waiter[Waiter<br/>Phục vụ]
        Chef[Chef<br/>Đầu bếp]
        Cashier[Cashier<br/>Thu ngân]
    end
    
    subgraph Resources
        Users[User Management]
        Menu[Menu Management]
        Orders[Order Management]
        Bills[Bill Management]
        Reports[Reports]
    end
    
    Admin -.->|Full Access| Users
    Admin -.->|Full Access| Menu
    Admin -.->|Full Access| Orders
    Admin -.->|Full Access| Bills
    Admin -.->|Full Access| Reports
    
    Manager -.->|Limited| Users
    Manager -.->|Full Access| Menu
    Manager -.->|Read| Orders
    Manager -.->|Read| Bills
    Manager -.->|Full Access| Reports
    
    Waiter -.->|Self Only| Users
    Waiter -.->|Read| Menu
    Waiter -.->|Create/Update| Orders
    Waiter -.->|Create| Bills
    
    Chef -.->|Self Only| Users
    Chef -.->|Read| Menu
    Chef -.->|Update Status| Orders
    
    Cashier -.->|Self Only| Users
    Cashier -.->|Read| Menu
    Cashier -.->|Read| Orders
    Cashier -.->|Full Access| Bills
```

## 14. Biểu Đồ Kiểm Tra Quyền (Authorization)

```mermaid
flowchart TB
    Start([API Request]) --> HasToken{Has<br/>Token?}
    
    HasToken -->|No| Return401[401 Unauthorized]
    HasToken -->|Yes| ValidToken{Token<br/>Valid?}
    
    ValidToken -->|No| Return401
    ValidToken -->|Yes| Decode[Decode JWT]
    
    Decode --> ExtractUser[Extract user info<br/>userId, role]
    ExtractUser --> CheckPermission{Has<br/>Permission?}
    
    CheckPermission -->|No| Return403[403 Forbidden]
    CheckPermission -->|Yes| CheckOwnership{Ownership<br/>Required?}
    
    CheckOwnership -->|No| AllowAccess[Allow Access]
    CheckOwnership -->|Yes| IsOwner{Is Owner?}
    
    IsOwner -->|No| Return403
    IsOwner -->|Yes| AllowAccess
    
    AllowAccess --> Execute[Execute Business Logic]
    Execute --> Return200[200 OK]
    
    Return401 --> End([End])
    Return403 --> End
    Return200 --> End
```

## 15. Biểu Đồ Session Management

```mermaid
flowchart TB
    Start([User Settings]) --> ViewSessions[Xem Phiên Đăng Nhập]
    
    ViewSessions --> Display[Hiển thị danh sách:<br/>- Device<br/>- Browser<br/>- IP<br/>- Location<br/>- Last activity]
    
    Display --> Choice{Chọn<br/>hành động}
    
    Choice -->|View Details| Details[Chi tiết phiên]
    Details --> Display
    
    Choice -->|Logout One| Confirm1{Xác nhận?}
    Confirm1 -->|No| Display
    Confirm1 -->|Yes| DeleteOne[Xóa 1 refresh token]
    DeleteOne --> BlacklistOne[Thêm access token<br/>vào blacklist]
    BlacklistOne --> Success1[Thông báo thành công]
    Success1 --> Display
    
    Choice -->|Logout All Others| Confirm2{Xác nhận<br/>mật khẩu?}
    Confirm2 -->|No| Display
    Confirm2 -->|Yes| DeleteOthers[Xóa tất cả tokens khác]
    DeleteOthers --> BlacklistOthers[Blacklist tất cả<br/>access tokens khác]
    BlacklistOthers --> Success2[Thông báo thành công]
    Success2 --> Display
    
    Choice -->|Close| End([Kết thúc])
```

## 16. Biểu Đồ Audit Logging

```mermaid
sequenceDiagram
    participant U as User Action
    participant S as System
    participant L as Logger
    participant DB as Log Database
    participant A as Alert System
    
    U->>S: Perform action
    Note over U,S: Login, Logout, Change password,<br/>Access sensitive data, etc.
    
    S->>S: Execute action
    
    par Log to Database
        S->>L: Create log entry
        Note over L: {<br/>  userId, username,<br/>  action, resource,<br/>  ip, userAgent,<br/>  timestamp, result<br/>}
        
        L->>DB: INSERT log
        DB-->>L: Logged
    and Check Security Rules
        S->>S: Evaluate security rules
        
        alt Suspicious Activity
            S->>A: Trigger alert
            Note over A: Multiple failed logins<br/>Access from new location<br/>Unusual activity pattern
            
            A->>A: Notify admins
            A->>A: Lock account (if needed)
        end
    end
    
    S-->>U: Action response
    
    Note over DB: Logs retained for:<br/>- Security: 1 year<br/>- Audit: 7 years<br/>- Compliance: As required
```

---

## Kết Luận

Các biểu đồ trên mô tả chi tiết:
- Quy trình xác thực và ủy quyền
- Vòng đời JWT tokens
- Quản lý phiên đăng nhập
- Bảo mật 2FA
- Phân quyền và kiểm soát truy cập
- Audit logging và monitoring

Tất cả sử dụng cú pháp Mermaid để dễ dàng hiển thị trên GitHub/GitLab.
