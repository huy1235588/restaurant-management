# Biểu Đồ Quản Lý Xác Thực và Tài Khoản

## 1. Biểu Đồ Tổng Quan Hệ Thống Xác Thực

```mermaid
flowchart TB
    Start([Người dùng]) --> Login[Trang đăng nhập]
    Login --> Input[Nhập Username/Password]
    
    Input --> Auth[Xác thực]
    Auth --> Validate{Valid?}
    
    Validate -->|No| Error[Lỗi đăng nhập]
    Validate -->|Yes| CheckStatus{Account<br/>Active?}
    
    CheckStatus -->|No| ErrorInactive[Tài khoản<br/>không hoạt động]
    CheckStatus -->|Yes| CreateTokens[Tạo Tokens]
    
    CreateTokens --> AccessToken[Access Token<br/>expires: 15min]
    CreateTokens --> RefreshToken[Refresh Token<br/>expires: 7 days]
    
    AccessToken --> SetCookie[Lưu vào Cookie]
    RefreshToken --> SetCookie
    
    SetCookie --> Success[Đăng nhập<br/>thành công]
    Success --> Redirect[Chuyển hướng<br/>theo Role]
    
    Redirect --> App[Truy cập ứng dụng]
    
    Error --> Retry{Thử lại?}
    ErrorInactive --> Retry
    Retry -->|Yes| Input
    Retry -->|No| End([Kết thúc])
    
    App --> End
```

## 2. Biểu Đồ Luồng Đăng Ký Tài Khoản

```mermaid
sequenceDiagram
    participant A as Admin/Manager
    participant S as Server (NestJS)
    participant DB as Database (PostgreSQL)
    
    A->>S: POST /auth/staff
    Note over A,S: {username, email, phoneNumber,<br/>password, fullName, role, ...}
    
    S->>S: Validate input (class-validator)
    
    S->>DB: Check username exists
    DB-->>S: Not exists
    
    S->>DB: Check email exists
    DB-->>S: Not exists
    
    S->>DB: Check phoneNumber exists
    DB-->>S: Not exists
    
    S->>S: Hash password (bcrypt)
    Note over S: saltRounds: 12
    
    S->>DB: CREATE Staff with Account
    Note over S,DB: Prisma nested create
    DB-->>S: Staff + Account created
    
    S->>S: Log account creation
    
    S-->>A: 201 Created
    Note over S,A: {staffId, accountId, fullName, role}
```

## 3. Biểu Đồ Trạng Thái Tài Khoản

```mermaid
stateDiagram-v2
    [*] --> Active: Tạo tài khoản
    
    Active --> Inactive: Vô hiệu hóa (isActive = false)
    Inactive --> Active: Kích hoạt lại (isActive = true)
    
    Active --> Deleted: Admin xóa
    Inactive --> Deleted: Admin xóa
    
    Deleted --> [*]
    
    note right of Active
        Trạng thái hoạt động (isActive = true)
        - Đăng nhập được
        - Có quyền truy cập theo Role
    end note
    
    note right of Inactive
        Bị vô hiệu hóa (isActive = false)
        - Không thể đăng nhập
        - Trả về "Account is inactive"
    end note
```

## 4. Biểu Đồ Luồng Đăng Nhập JWT

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Next.js)
    participant S as Server (NestJS)
    participant DB as Database (PostgreSQL)
    
    U->>C: Nhập username + password
    C->>S: POST /auth/login
    Note over C,S: {username, password}
    
    S->>DB: Find account by username
    DB-->>S: Account data
    
    alt Account not found
        S-->>C: 401 Unauthorized
        C-->>U: Sai tên đăng nhập hoặc mật khẩu
    end
    
    S->>S: Check account.isActive
    alt Account inactive
        S-->>C: 401 Unauthorized
        C-->>U: Tài khoản không hoạt động
    end
    
    S->>S: bcrypt.compare(password, hash)
    alt Password incorrect
        S-->>C: 401 Unauthorized
        C-->>U: Sai tên đăng nhập hoặc mật khẩu
    else Password correct
        S->>DB: Get Staff by accountId
        DB-->>S: Staff data (fullName, role)
        
        S->>S: Generate Access Token
        Note over S: JWT expires: 15min
        S->>S: Generate Refresh Token
        Note over S: JWT expires: 7 days
        
        S->>DB: Save RefreshToken
        Note over S,DB: {token, accountId, deviceInfo, ipAddress, expiresAt}
        S->>DB: Update account.lastLogin
        
        S-->>C: 200 OK + Set-Cookie
        Note over C,S: Cookie: accessToken (15min)<br/>Cookie: refreshToken (7 days, httpOnly)
        Note over C,S: Body: {user, accessToken}
        
        C->>C: Store accessToken in memory
        C->>C: Store user in Zustand
        
        C-->>U: Redirect theo role
        Note over U,C: admin/manager → /admin/dashboard<br/>waiter → /admin/orders<br/>chef → /admin/kitchen<br/>cashier → /admin/bills
    end
```

## 5. Biểu Đồ Vòng Đời JWT Token

```mermaid
flowchart TB
    Start([Đăng nhập]) --> Create[Tạo Access Token]
    Create --> Store[Lưu token trong memory<br/>expires: 15 phút]
    
    Store --> Use[Sử dụng token<br/>cho API requests]
    
    Use --> Check{Token<br/>còn hạn?}
    Check -->|Yes| Valid[Request thành công]
    Check -->|No| Expired[Token hết hạn]
    
    Expired --> Refresh[Gọi POST /auth/refresh<br/>với cookie refreshToken]
    Refresh --> CheckRefresh{Refresh token<br/>hợp lệ?}
    
    CheckRefresh -->|Yes| NewAccess[Tạo Access token mới]
    CheckRefresh -->|No| ReLogin[Yêu cầu đăng nhập lại]
    
    NewAccess --> Store
    Valid --> Continue{Tiếp tục<br/>sử dụng?}
    
    Continue -->|Yes| Use
    Continue -->|No| Logout[Đăng xuất]
    
    Logout --> RevokeToken[Revoke RefreshToken trong DB]
    RevokeToken --> ClearCookie[Xóa Cookie]
    ClearCookie --> End([Kết thúc])
    ReLogin --> End
```

## 6. Biểu Đồ Làm Mới Token

```mermaid
sequenceDiagram
    participant C as Client (Next.js)
    participant S as Server (NestJS)
    participant DB as Database
    
    C->>S: API Request with Access Token
    S->>S: Verify token (JwtAuthGuard)
    S-->>C: 401 Token expired
    
    C->>S: POST /auth/refresh
    Note over C,S: Cookie: refreshToken (httpOnly)
    
    S->>S: Extract refreshToken from cookie
    S->>S: Verify JWT signature
    
    alt Invalid JWT
        S-->>C: 401 Unauthorized
        C->>C: Clear auth state
        C-->>C: Redirect to /login
    else Valid JWT
        S->>DB: Find RefreshToken by token
        Note over S,DB: Check: exists, not revoked, not expired
        
        alt Token not found or revoked
            S-->>C: 401 Invalid refresh token
            C-->>C: Redirect to /login
        else Token valid
            S->>S: Generate new Access Token
            Note over S: expires: 15 min
            
            S-->>C: 200 OK + Set-Cookie
            Note over C,S: Cookie: accessToken (15min)
            Note over C,S: Body: {accessToken}
            
            C->>C: Update accessToken in memory
            C->>S: Retry original request
            S-->>C: 200 OK
        end
    end
```

## 7. Biểu Đồ Đăng Xuất

```mermaid
flowchart TB
    Start([User nhấn Đăng xuất]) --> Choice{Đăng xuất<br/>khỏi?}
    
    Choice -->|Thiết bị này| SingleLogout[POST /auth/logout]
    Choice -->|Tất cả thiết bị| AllLogout[POST /auth/logout-all]
    
    SingleLogout --> DeleteRT[Xóa RefreshToken hiện tại<br/>khỏi Database]
    
    AllLogout --> RevokeAllRT[Revoke tất cả RefreshTokens<br/>của Account]
    
    DeleteRT --> ClearCookie[Server xóa Cookie<br/>accessToken, refreshToken]
    RevokeAllRT --> ClearCookie
    
    ClearCookie --> ClearClient[Client xóa auth state<br/>Zustand store]
    
    ClearClient --> Redirect[Chuyển về<br/>trang đăng nhập]
    
    Redirect --> End([Kết thúc])
```

## 8. Biểu Đồ Đổi Mật Khẩu

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Next.js)
    participant S as Server (NestJS)
    participant DB as Database
    
    U->>C: Vào Settings > Đổi mật khẩu
    C->>C: Hiển thị form
    U->>C: Nhập currentPassword + newPassword
    
    C->>S: PUT /auth/change-password
    Note over C,S: {currentPassword, newPassword}
    Note over C,S: Header: Authorization Bearer token
    
    S->>S: JwtAuthGuard verify token
    S->>S: Extract accountId from token
    
    S->>DB: Find Account by accountId
    DB-->>S: Account data
    
    S->>S: bcrypt.compare(currentPassword, hash)
    
    alt Current password incorrect
        S-->>C: 401 Current password is incorrect
        C-->>U: Hiển thị lỗi
    else Password correct
        S->>S: bcrypt.hash(newPassword, 12)
        S->>DB: Update account.password
        DB-->>S: Updated
        
        S-->>C: 200 Password changed successfully
        C-->>U: Thông báo thành công
    end
```

## 9. Biểu Đồ Cập Nhật Profile

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Next.js)
    participant S as Server (NestJS)
    participant DB as Database
    
    U->>C: Vào Profile Settings
    C->>S: GET /auth/me
    S-->>C: User info
    C->>C: Hiển thị form với dữ liệu hiện tại
    
    U->>C: Sửa thông tin (email, phone, fullName, address)
    C->>S: PUT /auth/profile
    Note over C,S: {email?, phoneNumber?, fullName?, address?}
    
    S->>S: JwtAuthGuard verify token
    
    alt Email bị thay đổi
        S->>DB: Check email exists
        alt Email đã tồn tại
            S-->>C: 409 Email already exists
        end
    end
    
    alt Phone bị thay đổi
        S->>DB: Check phoneNumber exists
        alt Phone đã tồn tại
            S-->>C: 409 Phone number already exists
        end
    end
    
    S->>DB: Update Account (email, phoneNumber)
    S->>DB: Update Staff (fullName, address)
    
    S-->>C: 200 Profile updated successfully
    C-->>U: Thông báo thành công
```

## 10. Biểu Đồ ERD Xác Thực (Thực tế Triển Khai)

```mermaid
erDiagram
    ACCOUNTS ||--|| STAFF : has
    ACCOUNTS ||--o{ REFRESH_TOKENS : has
    STAFF }o--|| ROLE : has
    
    ACCOUNTS {
        int accountId PK
        string username UK "VarChar(50)"
        string email UK "VarChar(255)"
        string phoneNumber UK "VarChar(20)"
        string password "VarChar(255) bcrypt hash"
        boolean isActive "default true"
        datetime lastLogin "nullable"
        datetime createdAt
        datetime updatedAt
    }
    
    STAFF {
        int staffId PK
        int accountId FK UK
        string fullName "VarChar(255)"
        string address "VarChar(500) nullable"
        date dateOfBirth "nullable"
        date hireDate "default now()"
        decimal salary "Decimal(12,2) nullable"
        enum role "admin|manager|waiter|chef|cashier"
        boolean isActive "default true"
        datetime createdAt
        datetime updatedAt
    }
    
    REFRESH_TOKENS {
        int tokenId PK
        int accountId FK
        string token UK "Text"
        datetime expiresAt
        string deviceInfo "VarChar(500) nullable"
        string ipAddress "VarChar(45) nullable"
        boolean isRevoked "default false"
        datetime createdAt
        datetime revokedAt "nullable"
    }
    
    ROLE {
        enum_value admin
        enum_value manager
        enum_value waiter
        enum_value chef
        enum_value cashier
    }
```

## 11. Biểu Đồ Ma Trận Phân Quyền

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

## 12. Biểu Đồ Kiểm Tra Quyền (Authorization)

```mermaid
flowchart TB
    Start([API Request]) --> HasToken{Có Cookie<br/>accessToken?}
    
    HasToken -->|No| Return401[401 Unauthorized]
    HasToken -->|Yes| JwtGuard[JwtAuthGuard]
    
    JwtGuard --> ValidToken{Token<br/>hợp lệ?}
    
    ValidToken -->|No| TryRefresh{Có refreshToken<br/>cookie?}
    TryRefresh -->|No| Return401
    TryRefresh -->|Yes| RefreshFlow[Gọi /auth/refresh]
    RefreshFlow --> ValidToken
    
    ValidToken -->|Yes| Decode[Decode JWT<br/>JwtStrategy]
    
    Decode --> ExtractUser[Extract: accountId,<br/>staffId, username, role]
    ExtractUser --> AttachUser[Attach to request.user]
    
    AttachUser --> RolesGuard{RolesGuard<br/>kiểm tra role?}
    
    RolesGuard -->|Không yêu cầu| AllowAccess[Allow Access]
    RolesGuard -->|Yêu cầu role| CheckRole{User.role<br/>trong allowedRoles?}
    
    CheckRole -->|No| Return403[403 Forbidden]
    CheckRole -->|Yes| AllowAccess
    
    AllowAccess --> Execute[Execute Controller Method]
    Execute --> Return200[200 OK]
    
    Return401 --> End([End])
    Return403 --> End
    Return200 --> End
```

---

## Kết Luận

Các biểu đồ trên mô tả chi tiết hệ thống xác thực **đã được triển khai**:

### Tính năng đã triển khai:
- ✅ Quy trình đăng nhập với JWT (Access Token 15 phút, Refresh Token 7 ngày)
- ✅ Đăng ký tài khoản nhân viên (Account + Staff)
- ✅ Làm mới token tự động qua httpOnly cookie
- ✅ Đăng xuất (thiết bị đơn và tất cả thiết bị)
- ✅ Đổi mật khẩu
- ✅ Cập nhật thông tin cá nhân
- ✅ Phân quyền theo Role (admin, manager, waiter, chef, cashier)
- ✅ Bảo mật token với httpOnly cookie

### Công nghệ sử dụng:
- **Backend**: NestJS, Passport JWT, bcrypt (salt rounds: 12)
- **Frontend**: Next.js, Zustand, httpOnly cookies
- **Database**: PostgreSQL với Prisma ORM

Tất cả biểu đồ sử dụng cú pháp Mermaid để dễ dàng hiển thị trên GitHub/GitLab.
