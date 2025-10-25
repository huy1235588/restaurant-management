# Biểu Đồ Quản Lý Đặt Bàn

## 1. Biểu Đồ Quy Trình Tổng Thể (Flowchart)

```mermaid
flowchart TD
    A[Chuẩn Bị: Tạo Bàn] --> B[Cấu Hình Thông Tin Bàn]
    B --> C[Khách Đặt Bàn]
    C --> D{Kiểm Tra<br/>Bàn Trống?}
    D -->|Không| E[Đề Xuất Thời Gian Khác]
    E --> C
    D -->|Có| F[Tạo Đặt Bàn]
    F --> G[Gửi Mã Xác Nhận]
    G --> H[Nhân Viên Xác Nhận]
    H --> I[Gửi Nhắc Lịch 24h Trước]
    I --> J{Khách<br/>Xác Nhận?}
    J -->|Hủy| K[Hủy Đặt Bàn]
    K --> L[Giải Phóng Bàn]
    J -->|Xác Nhận| M[Ngày Hẹn Đến]
    M --> N{Khách<br/>Đến?}
    N -->|Không| O[No-show]
    O --> L
    N -->|Có| P[Check-in]
    P --> Q[Dẫn Khách Đến Bàn]
    Q --> R[Tạo Đơn Hàng]
    R --> S[Phục Vụ Khách]
    S --> T[Khách Thanh Toán]
    T --> U[Hoàn Tất Đặt Bàn]
    U --> V[Dọn Dẹp Bàn]
    V --> W[Bàn Sẵn Sàng]
    W --> C
```

---

## 2. Biểu Đồ Quản Lý Đặt Bàn (Sequence Diagram)

```mermaid
sequenceDiagram
    actor Customer as Khách Hàng
    participant UI as Giao Diện
    participant API as Backend API
    participant DB as Database
    participant SMS as SMS Service
    participant Email as Email Service

    Customer ->> UI: Nhập thông tin đặt bàn
    UI ->> API: POST /reservations
    API ->> DB: Kiểm tra bàn trống
    
    alt Không Có Bàn Trống
        DB -->> API: Không có bàn phù hợp
        API -->> UI: Lỗi - Không có bàn
        UI -->> Customer: Đề xuất thời gian khác
    else Có Bàn Trống
        API ->> DB: Tạo đặt bàn mới
        DB -->> API: Thành công
        API ->> DB: Cập nhật trạng thái bàn
        API ->> API: Tạo mã đặt bàn
        
        par Gửi Xác Nhận
            API ->> SMS: Gửi SMS xác nhận
            SMS -->> Customer: Nhận SMS
        and
            API ->> Email: Gửi Email xác nhận
            Email -->> Customer: Nhận Email
        end
        
        API -->> UI: Thành công
        UI -->> Customer: Hiển thị thông tin đặt bàn
    end

    Note over API,DB: 24 giờ trước giờ đặt
    API ->> SMS: Gửi nhắc lịch
    SMS -->> Customer: Nhận nhắc lịch
    
    Note over Customer,UI: Ngày hẹn
    Customer ->> UI: Check-in tại nhà hàng
    UI ->> API: PUT /reservations/:id/checkin
    API ->> DB: Cập nhật trạng thái "Đã ngồi"
    DB -->> API: Thành công
    API -->> UI: Xác nhận check-in
```

---

## 3. Biểu Đồ Trạng Thái Đặt Bàn (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Pending: Tạo mới

    Pending --> Confirmed: Xác nhận
    Pending --> Cancelled: Hủy
    
    Confirmed --> Seated: Check-in
    Confirmed --> Cancelled: Hủy
    Confirmed --> NoShow: Quá giờ không đến
    
    Seated --> Completed: Hoàn tất
    
    Completed --> [*]
    Cancelled --> [*]
    NoShow --> [*]

    note right of Pending
        Chờ xác nhận
        Vừa tạo đặt bàn
    end note

    note right of Confirmed
        Đã xác nhận
        Đang chờ khách đến
    end note

    note right of Seated
        Khách đã đến
        Đang phục vụ
    end note

    note right of Completed
        Hoàn tất
        Khách đã thanh toán
    end note
```

---

## 4. Biểu Đồ Trạng Thái Bàn (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Available

    Available --> Reserved: Có đặt bàn
    Available --> Occupied: Khách ngồi trực tiếp
    Available --> Maintenance: Cần bảo trì
    
    Reserved --> Occupied: Khách check-in
    Reserved --> Available: Hủy/No-show
    
    Occupied --> Available: Khách rời đi
    
    Maintenance --> Available: Hoàn tất bảo trì

    note right of Available
        Trống - Sẵn sàng
    end note

    note right of Reserved
        Đã đặt trước
    end note

    note right of Occupied
        Đang sử dụng
    end note

    note right of Maintenance
        Bảo trì
    end note
```

---

## 5. Biểu Đồ Cấu Trúc Dữ Liệu (Entity Relationship)

```mermaid
erDiagram
    RESTAURANT_TABLE ||--o{ RESERVATION : has
    RESERVATION ||--o{ ORDER : "generates"
    RESERVATION ||--o| BILL : "results in"
    STAFF ||--o{ RESERVATION : manages

    RESTAURANT_TABLE {
        int tableId PK
        string tableNumber UK
        string tableName
        int capacity
        int minCapacity
        int floor
        string section
        string status
        string qrCode UK
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    RESERVATION {
        int reservationId PK
        string reservationCode UK
        string customerName
        string phoneNumber
        string email
        int tableId FK
        date reservationDate
        time reservationTime
        int duration
        int headCount
        string specialRequest
        decimal depositAmount
        string status
        string notes
        timestamp createdAt
        timestamp updatedAt
    }

    ORDER {
        int orderId PK
        int reservationId FK
        int tableId FK
        string status
        decimal totalAmount
        timestamp createdAt
    }

    BILL {
        int billId PK
        int reservationId FK
        decimal totalAmount
        string paymentStatus
        timestamp createdAt
    }

    STAFF {
        int staffId PK
        string name
        string role
    }
```

---

## 6. Biểu Đồ Quy Trình Tạo Đặt Bàn Chi Tiết (Activity Diagram)

```mermaid
graph LR
    A["🔵 Khách: Truy cập đặt bàn"] --> B["📋 Chọn ngày & giờ"]
    B --> C["👥 Nhập số lượng khách"]
    C --> D["🔍 Hệ thống tìm bàn"]
    D --> E{"Có bàn<br/>phù hợp?"}
    E -->|Không| F["💡 Đề xuất thời gian khác"]
    F --> B
    E -->|Có| G["📝 Nhập thông tin khách"]
    G --> H["📋 Tên khách hàng"]
    H --> I["📞 Số điện thoại"]
    I --> J["📧 Email (tùy chọn)"]
    J --> K["✍️ Yêu cầu đặc biệt"]
    K --> L["🏦 Đặt cọc (nếu cần)"]
    L --> M["⚙️ Kiểm tra dữ liệu"]
    M --> N{"Dữ liệu<br/>hợp lệ?"}
    N -->|Không| O["❌ Hiển thị lỗi"]
    O --> G
    N -->|Có| P["💾 Lưu đặt bàn"]
    P --> Q["🔢 Tạo mã đặt bàn"]
    Q --> R["📱 Gửi SMS xác nhận"]
    R --> S["📧 Gửi Email xác nhận"]
    S --> T["🔄 Cập nhật trạng thái bàn"]
    T --> U["📝 Ghi log"]
    U --> V["✅ Thành công"]
    V --> W["🔵 Kết thúc"]
```

---

## 7. Biểu Đồ Quy Trình Check-in (Flow)

```mermaid
flowchart TD
    A["👤 Khách đến nhà hàng"] --> B["🔍 Nhân viên tra cứu đặt bàn"]
    B --> C{"Tìm thấy<br/>đặt bàn?"}
    C -->|Không| D["❌ Thông báo không tìm thấy"]
    D --> E["📞 Xác nhận thông tin"]
    E --> F{"Đúng<br/>thông tin?"}
    F -->|Không| G["⚠️ Tạo đặt bàn mới"]
    F -->|Có| H["🔄 Tìm lại"]
    H --> C
    C -->|Có| I["✅ Xác nhận thông tin"]
    I --> J{"Bàn<br/>sẵn sàng?"}
    J -->|Không| K["⏳ Yêu cầu chờ"]
    K --> L["🔔 Thông báo khi sẵn sàng"]
    L --> J
    J -->|Có| M["✓ Check-in"]
    M --> N["🔄 Cập nhật trạng thái đặt bàn"]
    N --> O["🪑 Cập nhật trạng thái bàn"]
    O --> P["🚶 Dẫn khách đến bàn"]
    P --> Q["📋 Tạo đơn hàng"]
    Q --> R["📝 Ghi log check-in"]
    R --> S["✅ Hoàn tất"]

    style M fill:#c8e6c9
    style S fill:#c8e6c9
```

---

## 8. Biểu Đồ Phân Quyền (Permission Matrix)

```mermaid
graph TB
    A["Phân Quyền Quản Lý Đặt Bàn"] --> B["👥 Vai Trò"]
    B --> C["👤 Khách Hàng"]
    B --> D["🎫 Nhân Viên Tiếp Nhận"]
    B --> E["👨‍💼 Nhân Viên Phục Vụ"]
    B --> F["💼 Quản Lý"]
    B --> G["🔐 Admin"]

    C --> C1["✓ Tạo đặt bàn online"]
    C --> C2["✓ Xem đặt bàn của mình"]
    C --> C3["✓ Sửa đặt bàn của mình"]
    C --> C4["✓ Hủy đặt bàn của mình"]
    C --> C5["✗ Xác nhận"]
    C --> C6["✗ Check-in"]

    D --> D1["✓ Tạo đặt bàn"]
    D --> D2["✓ Xem tất cả đặt bàn"]
    D --> D3["✓ Sửa đặt bàn"]
    D --> D4["✓ Xác nhận"]
    D --> D5["✓ Check-in"]
    D --> D6["✓ Hủy"]
    D --> D7["✓ Đánh dấu no-show"]

    E --> E1["✓ Xem đặt bàn"]
    E --> E2["✗ Tạo/Sửa/Xóa"]

    F --> F1["✓ Tất cả quyền"]
    F --> F2["✓ Xem báo cáo"]
    F --> F3["✓ Quản lý bàn"]

    G --> G1["✓ Tất cả quyền"]
    G --> G2["✓ Cấu hình hệ thống"]
```

---

## 9. Biểu Đồ Nhắc Lịch Tự Động (Timeline)

```mermaid
timeline
    title Quy Trình Nhắc Lịch Tự Động
    
    section Tạo Đặt Bàn
        Khách đặt bàn : Tạo yêu cầu
                      : Gửi xác nhận ngay
    
    section 24 Giờ Trước
        Nhắc lịch lần 1 : Gửi SMS/Email
                        : Yêu cầu xác nhận
                        : Link hủy/thay đổi
    
    section 4 Giờ Trước
        Nhắc lịch lần 2 : Gửi lại nếu chưa xác nhận
                        : Nhắc đúng giờ
    
    section 1 Giờ Trước
        Nhắc lịch cuối : SMS nhắc cuối cùng
                       : Chuẩn bị đón khách
    
    section Giờ Hẹn
        Khách đến : Check-in
                  : Phục vụ
```

---

## 10. Biểu Đồ Xử Lý Lỗi (Error Handling Tree)

```mermaid
graph TD
    A["❌ Lỗi Đặt Bàn"] --> B{Loại Lỗi}

    B -->|Không có bàn| C["Lỗi: Không có bàn trống"]
    C --> C1["Cách Xử Lý: Đề xuất thời gian khác<br/>hoặc bàn thay thế"]

    B -->|Thông tin không hợp lệ| D["Lỗi: SĐT/Email không đúng"]
    D --> D1["Cách Xử Lý: Yêu cầu nhập lại<br/>đúng định dạng"]

    B -->|Thời gian quá khứ| E["Lỗi: Thời gian đã qua"]
    E --> E1["Cách Xử Lý: Chỉ cho phép<br/>đặt trong tương lai"]

    B -->|Số khách vượt quá| F["Lỗi: Vượt sức chứa"]
    F --> F1["Cách Xử Lý: Liên hệ trực tiếp<br/>hoặc giảm số khách"]

    B -->|Bàn đã được đặt| G["Lỗi: Bàn không còn trống"]
    G --> G1["Cách Xử Lý: Chọn bàn khác<br/>hoặc thời gian khác"]

    B -->|Không thể hủy| H["Lỗi: Đặt bàn đã hoàn tất"]
    H --> H1["Cách Xử Lý: Chỉ cho phép hủy<br/>đặt bàn chưa hoàn tất"]

    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style G fill:#ffcdd2
    style H fill:#ffcdd2
```

---

## 11. Biểu Đồ Thống Kê Đặt Bàn (Pie Chart)

```mermaid
pie title Phân Bổ Trạng Thái Đặt Bàn Tháng 10
    "Hoàn tất" : 450
    "Đã xác nhận" : 120
    "Đã ngồi" : 80
    "Đã hủy" : 65
    "Không đến" : 35
    "Chờ xác nhận" : 50
```

---

## 12. Biểu Đồ Kiến Trúc Hệ Thống (Component Diagram)

```mermaid
graph TB
    subgraph Client["📱 Frontend - Next.js/React"]
        UI["🎨 UI Components"]
        Calendar["📅 Calendar View"]
        Forms["📋 Booking Forms"]
        State["🔄 State Management"]
    end

    subgraph API["🔌 Backend API"]
        Controllers["⚙️ Reservation Controllers"]
        Services["🛠️ Reservation Services"]
        Validators["✅ Validators"]
        Schedulers["⏰ Job Schedulers"]
    end

    subgraph Data["💾 Data Layer"]
        ORM["📊 Prisma ORM"]
        DB["🗄️ PostgreSQL"]
        Cache["⚡ Redis Cache"]
    end

    subgraph External["🌐 External Services"]
        SMS["📱 SMS Gateway"]
        Email["📧 Email Service"]
        QR["📷 QR Generator"]
    end

    UI --> Forms
    Calendar --> State
    Forms --> State
    State --> Controllers
    Controllers --> Services
    Services --> Validators
    Services --> Schedulers
    Services --> ORM
    ORM --> DB
    ORM --> Cache
    Schedulers --> SMS
    Schedulers --> Email
    Services --> QR

    style Client fill:#e3f2fd
    style API fill:#f3e5f5
    style Data fill:#e8f5e9
    style External fill:#fff3e0
```

---

## 13. Biểu Đồ Quy Trình No-show (Decision Tree)

```mermaid
graph TD
    A["⏰ Giờ Hẹn Đã Qua"] --> B{"Khách<br/>đã đến?"}
    
    B -->|Có| C["✅ Check-in"]
    C --> Z["🎉 Kết thúc"]
    
    B -->|Không| D["⏳ Chờ 15 phút"]
    D --> E{"Khách<br/>đến?"}
    
    E -->|Có| C
    E -->|Không| F["📞 Gọi điện cho khách"]
    
    F --> G{"Liên lạc<br/>được?"}
    
    G -->|Có| H{"Khách<br/>có đến?"}
    H -->|Có| I["⏳ Chờ thêm"]
    I --> J{"Đến<br/>trong 15p?"}
    J -->|Có| C
    J -->|Không| K["❌ Đánh dấu No-show"]
    
    H -->|Không| L["🗑️ Hủy đặt bàn"]
    L --> M["💰 Giữ tiền cọc"]
    
    G -->|Không| K
    
    K --> N["🆓 Giải phóng bàn"]
    N --> O["💰 Không hoàn tiền cọc"]
    O --> P["📝 Ghi vào lịch sử khách"]
    P --> Q["📊 Cập nhật thống kê"]
    Q --> R["🔴 Kết thúc"]
    
    M --> N
    
    style C fill:#c8e6c9
    style K fill:#ffcdd2
    style L fill:#ffcdd2
```

---

## 14. Biểu Đồ Gợi Ý Bàn Thông Minh (Flow)

```mermaid
flowchart TD
    A["🔍 Yêu Cầu: Tìm bàn phù hợp"] --> B["📊 Input:<br/>Số khách, Ngày giờ, Thời gian"]
    B --> C["1️⃣ Lọc theo sức chứa"]
    C --> D["capacity ≥ headCount<br/>≥ minCapacity"]
    D --> E["2️⃣ Kiểm tra bàn trống"]
    E --> F["Bàn không có đặt bàn<br/>trong khung giờ"]
    F --> G["3️⃣ Tính điểm ưu tiên"]
    G --> H["Điểm sức chứa:<br/>Bàn vừa đủ = +10"]
    H --> I["Điểm vị trí:<br/>VIP = +5, Thường = +0"]
    I --> J["Điểm lịch sử:<br/>Khách từng ngồi = +3"]
    J --> K["4️⃣ Sắp xếp theo điểm"]
    K --> L["Từ cao đến thấp"]
    L --> M["5️⃣ Trả về Top 3"]
    M --> N["🎯 Gợi ý bàn tốt nhất"]
    
    style A fill:#e3f2fd
    style N fill:#c8e6c9
```

---

## 15. Biểu Đồ Use Case (Tương tác người dùng)

```mermaid
graph TB
    subgraph System["🏪 Hệ Thống Quản Lý Đặt Bàn"]
        UC1["Tạo Bàn"]
        UC2["Xem Danh Sách Bàn"]
        UC3["Chỉnh Sửa Bàn"]
        UC4["Xóa Bàn"]
        UC5["Tạo Đặt Bàn"]
        UC6["Xem Đặt Bàn"]
        UC7["Chỉnh Sửa Đặt Bàn"]
        UC8["Xác Nhận Đặt Bàn"]
        UC9["Check-in Khách"]
        UC10["Hủy Đặt Bàn"]
        UC11["Đánh Dấu No-show"]
        UC12["Báo Cáo & Phân Tích"]
    end

    A["👤 Khách Hàng"] -->|Sử Dụng| UC5
    A -->|Sử Dụng| UC6
    A -->|Sử Dụng| UC7
    A -->|Sử Dụng| UC10

    B["🎫 Nhân Viên Tiếp Nhận"] -->|Sử Dụng| UC2
    B -->|Sử Dụng| UC5
    B -->|Sử Dụng| UC6
    B -->|Sử Dụng| UC7
    B -->|Sử Dụng| UC8
    B -->|Sử Dụng| UC9
    B -->|Sử Dụng| UC10
    B -->|Sử Dụng| UC11

    C["👨‍💼 Nhân Viên Phục Vụ"] -->|Sử Dụng| UC2
    C -->|Sử Dụng| UC6

    D["💼 Quản Lý"] -->|Sử Dụng| UC1
    D -->|Sử Dụng| UC2
    D -->|Sử Dụng| UC3
    D -->|Sử Dụng| UC4
    D -->|Sử Dụng| UC5
    D -->|Sử Dụng| UC6
    D -->|Sử Dụng| UC7
    D -->|Sử Dụng| UC8
    D -->|Sử Dụng| UC9
    D -->|Sử Dụng| UC10
    D -->|Sử Dụng| UC11
    D -->|Sử Dụng| UC12

    E["🔐 Admin"] -->|Sử Dụng| UC1
    E -->|Sử Dụng| UC3
    E -->|Sử Dụng| UC4
    E -->|Sử Dụng| UC8
    E -->|Sử Dụng| UC12

    style System fill:#e3f2fd
```

---

## 16. Biểu Đồ Dòng Dữ Liệu (Data Flow)

```mermaid
graph LR
    A["👤 Người Dùng"] -->|Nhập Thông Tin| B["📱 UI Form"]
    B -->|POST Request| C["🔌 API Endpoint"]
    C -->|Xác Thực| D["🚪 Middleware"]
    D -->|Validate| E["✅ Validator"]
    E -->|Check Availability| F["⚙️ Reservation Service"]
    F -->|Query| G["🗄️ Database"]
    G -->|Return Tables| F
    F -->|Create Reservation| G
    F -->|Generate Code| H["🔢 Code Generator"]
    F -->|Send Notification| I["📧 Notification Service"]
    I -->|SMS| J["📱 SMS Gateway"]
    I -->|Email| K["✉️ Email Service"]
    G -->|Response Data| L["📊 Response"]
    L -->|Update UI| B
    B -->|Display| A
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
3. Các công cụ khác có thể cần plugin (Notion, Confluence, v.v.)
4. Online editor: https://mermaid.live

**Lợi ích của việc sử dụng Mermaid:**

-   Dễ dàng cập nhật và bảo trì
-   Không cần công cụ vẽ đồ họa
-   Có thể version control cùng với code
-   Hiển thị trực tiếp trên GitHub/GitLab
-   Tự động render trong các nền tảng hỗ trợ
