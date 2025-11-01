# Biểu Đồ Quản Lý Nhân Sự

## 1. Biểu Đồ Quy Trình Tổng Thể (Flowchart)

```mermaid
flowchart TD
    A[Tuyển Dụng Nhân Viên Mới] --> B[Admin Tạo Tài Khoản]
    B --> C[Nhập Thông Tin]
    C --> D[Gán Vai Trò]
    D --> E[Gửi Email Thông Báo]
    E --> F[Nhân Viên Đăng Nhập Lần Đầu]
    F --> G[Đổi Mật Khẩu]
    G --> H[Hoàn Tất Hồ Sơ]
    H --> I[Manager Xếp Ca Làm]
    I --> J[Gửi Thông Báo Ca Làm]
    J --> K[Nhân Viên Xác Nhận]
    K --> L[Làm Việc Hàng Ngày]
    L --> M[Chấm Công Vào/Ra]
    M --> N[Đánh Giá Định Kỳ]
    N --> O{Hiệu Suất?}
    O -->|Tốt| P[Khen Thưởng/Tăng Lương]
    O -->|Cần Cải Thiện| Q[Đào Tạo Thêm]
    O -->|Kém| R[Cảnh Cáo/Kỷ Luật]
    P --> L
    Q --> L
    R --> S{Cải Thiện?}
    S -->|Có| L
    S -->|Không| T[Nghỉ Việc]
    T --> U[Khóa Tài Khoản]
    U --> V[Lưu Trữ Hồ Sơ]
```

---

## 2. Biểu Đồ Quản Lý Tài Khoản (Sequence Diagram)

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Giao Diện
    participant API as Backend API
    participant DB as Database
    participant Email as Email Service
    actor Staff as Nhân Viên

    Admin ->> UI: Tạo nhân viên mới
    UI ->> API: POST /staff
    API ->> DB: Kiểm tra username/email
    
    alt Username/Email Đã Tồn Tại
        DB -->> API: Trùng
        API -->> UI: Lỗi: Đã tồn tại
        UI -->> Admin: Thông báo lỗi
    else Hợp Lệ
        API ->> API: Mã hóa mật khẩu
        API ->> DB: Tạo Account
        API ->> DB: Tạo Staff
        DB -->> API: Thành công
        
        API ->> Email: Gửi thông tin đăng nhập
        Email -->> Staff: Email chào mừng
        
        API -->> UI: Tạo thành công
        UI -->> Admin: Hiển thị thông báo
    end
    
    Note over Staff: Lần đầu đăng nhập
    Staff ->> UI: Đăng nhập
    UI ->> API: POST /auth/login
    API ->> DB: Xác thực
    DB -->> API: Thành công
    API -->> UI: Token + Yêu cầu đổi MK
    UI -->> Staff: Form đổi mật khẩu
    Staff ->> UI: Nhập mật khẩu mới
    UI ->> API: PUT /auth/change-password
    API ->> DB: Cập nhật mật khẩu
    DB -->> API: Hoàn tất
    API -->> UI: Thành công
    UI -->> Staff: Chuyển đến trang chủ
```

---

## 3. Biểu Đồ Trạng Thái Nhân Viên (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Pending: Tạo tài khoản
    
    Pending --> Active: Đăng nhập lần đầu & đổi MK
    
    Active --> OnLeave: Xin nghỉ phép
    OnLeave --> Active: Hết thời gian nghỉ
    
    Active --> Suspended: Vi phạm quy định
    Suspended --> Active: Hết thời gian phạt
    Suspended --> Terminated: Vi phạm nghiêm trọng
    
    Active --> Terminated: Nghỉ việc
    
    Terminated --> [*]
    
    note right of Active
        Đang làm việc
        Có thể chấm công
    end note
    
    note right of Suspended
        Tạm khóa
        Không thể đăng nhập
    end note
    
    note right of Terminated
        Đã nghỉ việc
        Tài khoản vô hiệu hóa
    end note
```

---

## 4. Biểu Đồ Cấu Trúc Dữ Liệu (Entity Relationship)

```mermaid
erDiagram
    ACCOUNT ||--|| STAFF : has
    STAFF ||--o{ ORDER : creates
    STAFF ||--o{ BILL : processes
    STAFF ||--o{ KITCHEN_ORDER : handles
    STAFF ||--o{ PURCHASE_ORDER : manages
    STAFF ||--o{ STOCK_TRANSACTION : performs
    STAFF ||--o{ TIMESHEET : has
    STAFF ||--o{ PERFORMANCE_REVIEW : receives

    ACCOUNT {
        int accountId PK
        string username UK
        string email UK
        string phoneNumber UK
        string password
        boolean isActive
        timestamp lastLogin
        timestamp createdAt
    }

    STAFF {
        int staffId PK
        int accountId FK UK
        string fullName
        string address
        date dateOfBirth
        date hireDate
        decimal salary
        string role
        boolean isActive
        timestamp createdAt
    }

    TIMESHEET {
        int timesheetId PK
        int staffId FK
        date workDate
        time checkIn
        time checkOut
        decimal totalHours
        string shift
        string status
    }

    PERFORMANCE_REVIEW {
        int reviewId PK
        int staffId FK
        int reviewerId FK
        string period
        int rating
        string comments
        timestamp reviewDate
    }
```

---

## 5. Biểu Đồ Xếp Ca Làm Việc (Activity Diagram)

```mermaid
graph LR
    A["📅 Manager: Chọn Tuần"] --> B["👥 Xem Danh Sách NV"]
    B --> C["⏰ Chọn Ca Làm"]
    C --> D["✋ Chọn Nhân Viên"]
    D --> E{"Kiểm Tra<br/>Hợp Lệ?"}
    E -->|Trùng Ca| F["⚠️ Cảnh Báo Trùng"]
    F --> D
    E -->|Quá Giờ| G["⚠️ Cảnh Báo Quá Giờ"]
    G --> D
    E -->|Hợp Lệ| H["✅ Gán Vào Ca"]
    H --> I{"Còn Ca<br/>Khác?"}
    I -->|Có| C
    I -->|Không| J["💾 Lưu Lịch"]
    J --> K["📧 Gửi Thông Báo"]
    K --> L["📱 Nhân Viên Nhận"]
    L --> M["✓ Xác Nhận"]
    M --> N["✅ Hoàn Tất"]
```

---

## 6. Biểu Đồ Chấm Công (Flow)

```mermaid
flowchart TD
    A["👤 Nhân Viên Đến"] --> B["🔍 Xác Thực"]
    B --> C{Phương Thức?}
    C -->|Vân Tay| D["👆 Quét Vân Tay"]
    C -->|QR Code| E["📱 Quét QR"]
    C -->|Thẻ| F["💳 Quẹt Thẻ"]
    D --> G["✓ Xác Thực Thành Công"]
    E --> G
    F --> G
    G --> H{Loại?}
    H -->|Check-in| I["⏰ Ghi Giờ Vào"]
    H -->|Check-out| J["⏰ Ghi Giờ Ra"]
    I --> K["📊 Hiển Thị: Chào [Tên]"]
    K --> L["📝 Lưu Bản Ghi"]
    J --> M["🧮 Tính Tổng Giờ"]
    M --> N["📊 Hiển thị: [X] giờ"]
    N --> O{"Có<br/>Overtime?"}
    O -->|Có| P["⏰ Ghi Nhận Overtime"]
    O -->|Không| Q["📝 Lưu Bản Ghi"]
    P --> Q
    L --> R["✅ Hoàn Tất"]
    Q --> R
```

---

## 7. Biểu Đồ Phân Quyền (Permission Matrix)

```mermaid
graph TB
    A["Phân Quyền Hệ Thống"] --> B["👥 Vai Trò"]
    
    B --> C["🔐 Admin"]
    B --> D["💼 Manager"]
    B --> E["👨‍💼 Waiter"]
    B --> F["👨‍ Chef"]
    B --> H["💰 Cashier"]

    C --> C1["✓ Toàn quyền hệ thống"]
    C --> C2["✓ Quản lý nhân viên"]
    C --> C3["✓ Đổi vai trò"]
    C --> C4["✓ Xem tất cả báo cáo"]
    C --> C5["✓ Cấu hình hệ thống"]

    D --> D1["✓ Quản lý nhân viên (giới hạn)"]
    D --> D2["✓ Xếp ca làm việc"]
    D --> D3["✓ Chấm công"]
    D --> D4["✓ Đánh giá hiệu suất"]
    D --> D5["✓ Xem báo cáo"]
    D --> D6["✗ Đổi vai trò"]
    D --> D7["✗ Xóa nhân viên"]

    E --> E1["✓ Xem thông tin cá nhân"]
    E --> E2["✓ Đổi mật khẩu"]
    E --> E3["✓ Xem lịch ca của mình"]
    E --> E4["✓ Chấm công"]
    E --> E5["✓ Tạo đơn hàng"]
    E --> E6["✗ Quản lý nhân viên khác"]

    F --> F1["✓ Xem thông tin cá nhân"]
    F --> F2["✓ Chấm công"]
    F --> F3["✓ Xem đơn bếp"]
    F --> F4["✓ Cập nhật tiến độ nấu"]
    F --> F5["✗ Tạo đơn hàng"]

    G --> G1["✓ Tương tự Waiter"]
    G --> G2["✓ Quản lý đồ uống"]

    H --> H1["✓ Xem thông tin cá nhân"]
    H --> H2["✓ Chấm công"]
    H --> H3["✓ Xử lý thanh toán"]
    H --> H4["✓ Xem hóa đơn"]
    H --> H5["✗ Tạo đơn hàng"]
```

---

## 8. Biểu Đồ Đánh Giá Hiệu Suất (Process Flow)

```mermaid
graph TD
    A["📅 Đến Kỳ Đánh Giá"] --> B["🤖 Hệ Thống Thu Thập Dữ Liệu"]
    B --> C["📊 Tạo Báo Cáo Tự Động"]
    C --> D["📈 Số Giờ Làm Việc"]
    C --> E["📋 Số Đơn Hàng"]
    C --> F["⭐ Đánh Giá Khách"]
    C --> G["⏰ Chấm Công"]
    C --> H["⚠️ Vi Phạm"]
    D --> I["💼 Manager Xem Báo Cáo"]
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J["✍️ Đánh Giá Thủ Công"]
    J --> K["📝 Nhập Nhận Xét"]
    K --> L["🎯 Đặt Mục Tiêu"]
    L --> M["💾 Lưu Đánh Giá"]
    M --> N["👥 Gặp 1-1 Nhân Viên"]
    N --> O["📢 Thảo Luận Kết Quả"]
    O --> P["👂 Lắng Nghe Phản Hồi"]
    P --> Q["✅ NV Xác Nhận"]
    Q --> R["📝 Ghi Log"]
    R --> S{Kết Quả?}
    S -->|Tốt| T["🏆 Khen Thưởng"]
    S -->|Trung Bình| U["📚 Đào Tạo"]
    S -->|Kém| V["⚠️ Cảnh Cáo"]
```

---

## 9. Biểu Đồ Timeline Chu Kỳ Nhân Viên

```mermaid
timeline
    title Vòng Đời Nhân Viên
    
    section Tuyển Dụng
        Tạo tài khoản : Admin tạo
                      : Gửi thông tin
                      : NV nhận email
    
    section Onboarding
        Ngày đầu : Đăng nhập lần đầu
                 : Đổi mật khẩu
                 : Hoàn tất hồ sơ
                 : Đào tạo cơ bản
    
    section Làm Việc
        Hàng ngày : Chấm công vào
                  : Làm việc theo ca
                  : Chấm công ra
        Hàng tuần : Nhận lịch ca mới
        Hàng tháng : Đánh giá ngắn hạn
    
    section Phát Triển
        Hàng quý : Đánh giá trung hạn
                 : Đề xuất tăng lương
                 : Đào tạo nâng cao
        Hàng năm : Đánh giá tổng thể
                 : Xem xét thăng tiến
    
    section Kết Thúc
        Nghỉ việc : Thông báo
                  : Bàn giao công việc
                  : Khóa tài khoản
                  : Thanh toán cuối
```

---

## 10. Biểu Đồ Kiến Trúc Hệ Thống (Component)

```mermaid
graph TB
    subgraph Client["📱 Frontend"]
        AdminUI["🔐 Admin Dashboard"]
        ManagerUI["💼 Manager Dashboard"]
        StaffUI["👤 Staff Portal"]
        TimeClockUI["⏰ Time Clock Interface"]
    end

    subgraph API["🔌 Backend Services"]
        AuthAPI["🔐 Authentication"]
        StaffAPI["👥 Staff Management"]
        TimeAPI["⏰ Time Tracking"]
        PerformanceAPI["📊 Performance Review"]
        ReportAPI["📈 Reporting"]
    end

    subgraph Data["💾 Database"]
        AccountDB["👤 Accounts"]
        StaffDB["👥 Staff Data"]
        TimesheetDB["⏰ Timesheets"]
        ReviewDB["📊 Reviews"]
    end

    subgraph External["🌐 External"]
        EmailService["📧 Email Service"]
        BiometricDevice["👆 Biometric Scanner"]
        PayrollSystem["💰 Payroll Integration"]
    end

    AdminUI --> StaffAPI
    ManagerUI --> StaffAPI
    ManagerUI --> TimeAPI
    ManagerUI --> PerformanceAPI
    StaffUI --> AuthAPI
    StaffUI --> TimeAPI
    TimeClockUI --> TimeAPI
    
    StaffAPI --> AccountDB
    StaffAPI --> StaffDB
    TimeAPI --> TimesheetDB
    PerformanceAPI --> ReviewDB
    ReportAPI --> StaffDB
    ReportAPI --> TimesheetDB
    
    AuthAPI --> EmailService
    StaffAPI --> EmailService
    TimeAPI --> BiometricDevice
    ReportAPI --> PayrollSystem
    
    style Client fill:#e3f2fd
    style API fill:#f3e5f5
    style Data fill:#e8f5e9
    style External fill:#fff3e0
```

---

## 11. Biểu Đồ Use Case

```mermaid
graph TB
    subgraph System["🏪 Hệ Thống Quản Lý Nhân Sự"]
        UC1["Tạo Nhân Viên"]
        UC2["Xem Nhân Viên"]
        UC3["Sửa Thông Tin"]
        UC4["Đổi Vai Trò"]
        UC5["Khóa/Mở Tài Khoản"]
        UC6["Xếp Ca Làm"]
        UC7["Chấm Công"]
        UC8["Đánh Giá Hiệu Suất"]
        UC9["Xem Báo Cáo"]
        UC10["Đổi Mật Khẩu"]
    end

    A["🔐 Admin"] -->|Sử Dụng| UC1
    A -->|Sử Dụng| UC2
    A -->|Sử Dụng| UC3
    A -->|Sử Dụng| UC4
    A -->|Sử Dụng| UC5
    A -->|Sử Dụng| UC6
    A -->|Sử Dụng| UC7
    A -->|Sử Dụng| UC8
    A -->|Sử Dụng| UC9

    B["💼 Manager"] -->|Sử Dụng| UC1
    B -->|Sử Dụng| UC2
    B -->|Sử Dụng| UC3
    B -->|Sử Dụng| UC5
    B -->|Sử Dụng| UC6
    B -->|Sử Dụng| UC7
    B -->|Sử Dụng| UC8
    B -->|Sử Dụng| UC9

    C["👤 Nhân Viên"] -->|Sử Dụng| UC2
    C -->|Sử Dụng| UC7
    C -->|Sử Dụng| UC10

    style System fill:#e3f2fd
```

---

## 12. Biểu Đồ Xử Lý Lỗi

```mermaid
graph TD
    A["❌ Lỗi Xảy Ra"] --> B{Loại Lỗi?}
    
    B -->|Username Trùng| C["Lỗi: Username đã tồn tại"]
    C --> C1["Đề xuất username khác"]
    C1 --> C2["Yêu cầu nhập lại"]
    
    B -->|Email Trùng| D["Lỗi: Email đã được sử dụng"]
    D --> D1["Kiểm tra email"]
    D1 --> D2["Yêu cầu email khác"]
    
    B -->|Trùng Ca| E["Lỗi: Nhân viên đã có ca"]
    E --> E1["Hiển thị ca hiện tại"]
    E1 --> E2["Đề xuất thời gian khác"]
    
    B -->|Quên Chấm Công| F["Lỗi: Không có bản ghi"]
    F --> F1["Manager sửa thủ công"]
    F1 --> F2["Ghi chú lý do"]
    
    B -->|Không Có Quyền| G["Lỗi: Access Denied"]
    G --> G1["Thông báo không đủ quyền"]
    G1 --> G2["Liên hệ Admin"]
    
    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style G fill:#ffcdd2
```

---

## 13. Biểu Đồ Báo Cáo Nhân Sự

```mermaid
graph LR
    A["📊 Yêu Cầu Báo Cáo"] --> B{Loại Báo Cáo?}
    
    B -->|Tổng Quan| C["👥 Báo Cáo Tổng Quan"]
    C --> C1["Tổng số NV"]
    C --> C2["Phân bổ vai trò"]
    C --> C3["Active/Inactive"]
    
    B -->|Chấm Công| D["⏰ Báo Cáo Chấm Công"]
    D --> D1["Tổng giờ làm"]
    D --> D2["Overtime"]
    D --> D3["Đến muộn/Về sớm"]
    
    B -->|Hiệu Suất| E["📈 Báo Cáo Hiệu Suất"]
    E --> E1["Top nhân viên"]
    E --> E2["Đánh giá TB"]
    E --> E3["Xu hướng"]
    
    B -->|Lương| F["💰 Báo Cáo Lương"]
    F --> F1["Tổng lương"]
    F --> F2["Chi tiết NV"]
    F --> F3["So sánh tháng"]
    
    C1 --> G["📄 Tạo Báo Cáo"]
    C2 --> G
    C3 --> G
    D1 --> G
    D2 --> G
    D3 --> G
    E1 --> G
    E2 --> G
    E3 --> G
    F1 --> G
    F2 --> G
    F3 --> G
    
    G --> H["📊 Biểu Đồ & Bảng"]
    H --> I{Xuất?}
    I -->|PDF| J["📕 File PDF"]
    I -->|Excel| K["�� File Excel"]
    I -->|CSV| L["📄 File CSV"]
```

---

## 14. Biểu Đồ Dòng Dữ Liệu

```mermaid
graph LR
    A["👨‍💼 Admin<br/>Tạo NV"] -->|POST| B["🔌 Staff API"]
    B -->|Validate| C["✅ Validator"]
    C -->|Check Unique| D["💾 Database"]
    D -->|Unique OK| B
    B -->|Hash Password| E["🔐 bcrypt"]
    E -->|Save| D
    B -->|Generate Email| F["📧 Email Service"]
    F -->|Send| G["👤 Nhân Viên"]
    
    G -->|Login| H["🔌 Auth API"]
    H -->|Verify| D
    D -->|Return User| H
    H -->|Generate| I["🎫 JWT Token"]
    I -->|Return| G
    
    G -->|Daily| J["⏰ Time Clock"]
    J -->|Check-in/out| K["🔌 Time API"]
    K -->|Save| L["💾 Timesheet DB"]
    
    K -->|Calculate| M["🧮 Calculator"]
    M -->|Overtime?| K
    K -->|Update| L
    
    style A fill:#e3f2fd
    style G fill:#e3f2fd
```

---

## 15. Biểu Đồ So Sánh Vai Trò

```mermaid
graph TB
    A["Vai Trò Trong Hệ Thống"] --> B["Quyền Hạn"]
    
    B --> C["🔐 Admin"]
    C --> C1["Level: 5/5"]
    C --> C2["Toàn quyền"]
    
    B --> D["💼 Manager"]
    D --> D1["Level: 4/5"]
    D --> D2["Quản lý giới hạn"]
    
    B --> E["💰 Cashier"]
    E --> E1["Level: 2/5"]
    E --> E2["Thanh toán only"]
    
    B --> F["👨‍💼 Waiter"]
    F --> F1["Level: 2/5"]
    F --> F2["Đơn hàng only"]
    
    B --> G["👨‍🍳 Chef"]
    G --> G1["Level: 2/5"]
    G --> G2["Bếp only"]
```

---

## 16. Biểu Đồ Quy Trình Nghỉ Việc

```mermaid
flowchart TD
    A["📝 Nhân Viên Thông Báo Nghỉ"] --> B["💼 Manager Nhận Thông Báo"]
    B --> C["📅 Xác Định Ngày Cuối"]
    C --> D["📋 Tạo Checklist Bàn Giao"]
    D --> E["👥 Gán Người Nhận Bàn Giao"]
    E --> F["📦 Bàn Giao Công Việc"]
    F --> G["✅ Xác Nhận Hoàn Tất"]
    G --> H["💰 Tính Lương Cuối"]
    H --> I["🔐 Admin Khóa Tài Khoản"]
    I --> J["💾 Lưu Trữ Hồ Sơ"]
    J --> K["📧 Gửi Email Chia Tay"]
    K --> L["✅ Hoàn Tất"]
    
    style A fill:#fff3cd
    style I fill:#ffcdd2
    style L fill:#c8e6c9
```

---

## Ghi Chú

Các biểu đồ này được tạo bằng **Mermaid** và có thể được:

-   Chỉnh sửa trực tiếp trong markdown
-   Xuất thành hình ảnh PNG/SVG
-   Nhúng vào tài liệu web hoặc wiki
-   Tích hợp vào các công cụ quản lý dự án

**Để sử dụng Mermaid:**

1. GitHub hỗ trợ mermaid trực tiếp trong markdown
2. GitLab cũng hỗ trợ mermaid native
3. Các công cụ khác có thể cần plugin
4. Online editor: https://mermaid.live

**Ứng dụng thực tế:**

-   Đào tạo nhân viên mới về quy trình làm việc
-   Tài liệu hướng dẫn cho quản lý nhân sự
-   Phân tích và tối ưu quy trình quản lý
-   Phát triển và bảo trì hệ thống
