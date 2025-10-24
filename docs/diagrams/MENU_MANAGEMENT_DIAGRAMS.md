# Biểu Đồ Quản Lý Menu và Danh Mục

## 1. Biểu Đồ Quy Trình Tổng Thể (Flowchart)

```mermaid
flowchart TD
    A[Chuẩn Bị Ban Đầu] --> B[Tạo Danh Mục]
    B --> C[Tải Lên Ảnh Danh Mục]
    C --> D[Thêm Sản Phẩm]
    D --> E[Tạo Sản Phẩm Mới]
    E --> F{Nhập Đầy Đủ<br/>Thông Tin?}
    F -->|Không| G[Hiển Thị Lỗi]
    G --> E
    F -->|Có| H[Tải Lên Ảnh]
    H --> I[Chọn Allergens]
    I --> J[Lưu Sản Phẩm]
    J --> K[Quản Lý Hàng Ngày]
    K --> L{Cập Nhật<br/>Trạng Thái?}
    L -->|Có Sẵn| M[Cập Nhật Trạng Thái]
    L -->|Hết Hàng| M
    M --> N[Ghi Log Thay Đổi]
    N --> O[Hiển Thị Cho Khách]
    O --> P[Khách Xem & Đặt Hàng]
    P --> Q[Phân Tích & Báo Cáo]
    Q --> R[Xem Sản Phẩm Bán Chạy]
    Q --> S[Xem Sản Phẩm Bán Chậm]
    Q --> T[Phân Tích Doanh Thu]
    R --> U[Điều Chỉnh Chiến Lược Menu]
    S --> U
    T --> U
    U --> V[Bảo Trì]
    V --> W{Thao Tác<br/>Cần Thiết?}
    W -->|Ẩn| X[Ẩn Sản Phẩm]
    W -->|Sửa| Y[Cập Nhật Thông Tin]
    W -->|Xóa| Z[Xóa Sản Phẩm]
    X --> AA[Sao Lưu Dữ Liệu]
    Y --> AA
    Z --> AA
    AA --> K
```

---

## 2. Biểu Đồ Quản Lý Danh Mục (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User as Quản Lý
    participant UI as Giao Diện
    participant API as Backend API
    participant DB as Database
    participant Storage as File Storage

    User ->> UI: Nhấn "Tạo Danh Mục"
    UI ->> API: POST /categories
    API ->> API: Kiểm tra tên duy nhất

    alt Tên Trùng
        API -->> UI: Lỗi - Tên đã tồn tại
        UI -->> User: Hiển thị cảnh báo
    else Tên Mới
        API ->> Storage: Lưu ảnh
        API ->> DB: Lưu danh mục
        DB -->> API: Thành công
        API ->> DB: Ghi log
        API -->> UI: Thành công
        UI -->> User: Hiển thị thành công
    end

    User ->> UI: Nhấn "Sửa Danh Mục"
    UI ->> API: PUT /categories/:id
    API ->> DB: Cập nhật thông tin
    DB -->> API: Thành công
    API ->> DB: Ghi log thay đổi
    API -->> UI: Thành công

    User ->> UI: Nhấn "Xóa Danh Mục"
    UI ->> API: DELETE /categories/:id
    API ->> API: Kiểm tra sản phẩm

    alt Có Sản Phẩm
        API -->> UI: Lỗi - Còn sản phẩm
        UI -->> User: Hiển thị thông báo
    else Không Có Sản Phẩm
        API ->> Storage: Xóa ảnh
        API ->> DB: Xóa danh mục
        DB -->> API: Thành công
        API ->> DB: Ghi log xóa
        API -->> UI: Thành công
    end
```

---

## 3. Biểu Đồ Quản Lý Sản Phẩm (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Draft

    Draft --> Active: Lưu & Xuất Bản
    Draft --> [*]: Hủy

    Active --> Available: Có Sẵn
    Active --> OutOfStock: Hết Hàng
    Active --> Hidden: Ẩn
    Active --> Deleted: Xóa

    Available --> OutOfStock: Báo Hết Hàng
    Available --> Hidden: Ẩn
    Available --> Editing: Chỉnh Sửa

    OutOfStock --> Available: Có Hàng Lại
    OutOfStock --> Hidden: Ẩn
    OutOfStock --> Editing: Chỉnh Sửa

    Hidden --> Available: Hiển Thị Lại
    Hidden --> OutOfStock: Hiển Thị Lại
    Hidden --> Deleted: Xóa

    Editing --> Available: Lưu Thay Đổi
    Editing --> OutOfStock: Lưu Thay Đổi
    Editing --> Hidden: Lưu Thay Đổi

    Deleted --> [*]
```

---

## 4. Biểu Đồ Cấu Trúc Dữ Liệu (Entity Relationship)

```mermaid
erDiagram
    CATEGORIES ||--o{ MENU_ITEMS : contains
    MENU_ITEMS ||--o{ PRICE_HISTORY : has
    MENU_ITEMS ||--o{ ALLERGENS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : "ordered in"

    CATEGORIES {
        int id PK
        string name UK
        string description
        string image_url
        int display_order
        string status
        timestamp created_at
        timestamp updated_at
    }

    MENU_ITEMS {
        int id PK
        int category_id FK
        string name
        string short_description
        string detailed_description
        decimal price
        string image_url
        int prep_time_minutes
        string availability_status
        string notes
        timestamp created_at
        timestamp updated_at
    }

    PRICE_HISTORY {
        int id PK
        int menu_item_id FK
        decimal old_price
        decimal new_price
        string reason
        timestamp changed_at
        int changed_by_user_id FK
    }

    ALLERGENS {
        int id PK
        int menu_item_id FK
        string allergen_name
        string notes
    }

    ORDER_ITEMS {
        int id PK
        int menu_item_id FK
        int order_id FK
        int quantity
        decimal price_at_order
        timestamp ordered_at
    }
```

---

## 5. Biểu Đồ Quy Trình Tạo Sản Phẩm Chi Tiết (Activity Diagram)

```mermaid
graph LR
    A["🔵 Người Dùng: Nhấn 'Thêm Sản Phẩm'"] --> B["📋 Mở Form Nhập Thông Tin"]
    B --> C["✏️ Nhập Tên Sản Phẩm"]
    C --> D["✏️ Nhập Mô Tả Ngắn & Chi Tiết"]
    D --> E["💰 Nhập Giá Tiền"]
    E --> F["🏷️ Chọn Danh Mục"]
    F --> G{"Có Tải<br/>Ảnh?"}
    G -->|Có| H["🖼️ Tải Lên Ảnh"]
    G -->|Không| I["🔖 Chọn Allergens"]
    H --> J["⏱️ Nhập Thời Gian Chuẩn Bị"]
    I --> J
    J --> K["📝 Nhập Ghi Chú"]
    K --> L["⚙️ Kiểm Tra Dữ Liệu"]
    L --> M{"Dữ Liệu<br/>Hợp Lệ?"}
    M -->|Không| N["❌ Hiển Thị Lỗi"]
    N --> O["🔄 Quay Lại Bước Sửa"]
    O --> L
    M -->|Có| P["💾 Lưu Sản Phẩm Vào Database"]
    P --> Q["📸 Xử Lý & Lưu Ảnh"]
    Q --> R["📋 Cập Nhật Danh Mục"]
    R --> S["📝 Ghi Log Hành Động"]
    S --> T["✅ Thông Báo Thành Công"]
    T --> U["🔵 Kết Thúc"]
```

---

## 6. Biểu Đồ Phân Quyền (Permission Matrix)

```mermaid
graph TB
    A["Phân Quyền Hệ Thống Menu"] --> B["👥 Vai Trò"]
    B --> C["👤 Khách Hàng"]
    B --> D["👨‍💼 Nhân Viên Phục Vụ"]
    B --> E["👨‍🍳 Đầu Bếp"]
    B --> F["💼 Quản Lý"]
    B --> G["🔐 Admin"]

    C --> C1["✓ Xem Menu"]
    C --> C2["✗ Tạo"]
    C --> C3["✗ Sửa"]

    D --> D1["✓ Xem Menu"]
    D --> D2["✗ Tạo"]
    D --> D3["✗ Sửa"]

    E --> E1["✓ Xem Menu"]
    E --> E2["✗ Tạo"]
    E --> E3["✗ Sửa"]
    E --> E4["✓ Cập Nhật Trạng Thái"]

    F --> F1["✓ Xem Menu"]
    F --> F2["✓ Tạo"]
    F --> F3["✓ Sửa"]
    F --> F4["✓ Xóa"]
    F --> F5["✓ Ẩn/Hiển Thị"]

    G --> G1["✓ Xem Menu"]
    G --> G2["✓ Tạo"]
    G --> G3["✓ Sửa"]
    G --> G4["✓ Xóa"]
    G --> G5["✓ Ẩn/Hiển Thị"]
```

---

## 7. Biểu Đồ Cập Nhật Giá Sản Phẩm (Flow)

```mermaid
flowchart TD
    A["👤 Quản Lý Nhấn<br/>'Cập Nhật Giá'"] --> B["📊 Hiển Thị Form"]
    B --> C["📌 Giá Cũ: 50,000 VND<br/>Read-only"]
    C --> D["✏️ Nhập Giá Mới"]
    D --> E["📝 Nhập Lý Do Thay Đổi<br/>Tùy Chọn"]
    E --> F["📅 Chọn Ngày Có Hiệu Lực<br/>Default: Hôm Nay"]
    F --> G["🆗 Xác Nhận Cập Nhật"]
    G --> H{"Giá Mới<br/>Hợp Lệ?"}
    H -->|Không| I["❌ Hiển Thị Lỗi<br/>Giá phải > 0"]
    I --> D
    H -->|Có| J["💾 Lưu Giá Mới"]
    J --> K["📖 Lưu Lịch Sử Giá"]
    K --> L["🔄 Cập Nhật Menu"]
    L --> M["📝 Ghi Log Thay Đổi"]
    M --> N["✅ Thông Báo Thành Công"]
    N --> O["🎯 Kết Thúc"]

    style K fill:#e1f5ff
    style M fill:#f3e5f5
```

---

## 8. Biểu Đồ Quản Lý Trạng Thái Sẵn Có (Swimlanes)

```mermaid
graph LR
    subgraph Khách["👥 Khách Hàng"]
        K1["Xem Menu"]
        K2["Đặt Hàng"]
    end

    subgraph Bếp["👨‍🍳 Đầu Bếp"]
        B1["Báo Hết Hàng"]
        B2["Cập Nhật Trạng Thái"]
    end

    subgraph Nhân["👨‍💼 Nhân Viên"]
        N1["Xem Trạng Thái"]
        N2["Thông Báo Khách"]
    end

    subgraph Hệ["⚙️ Hệ Thống"]
        H1["Có Sẵn"]
        H2["Hết Hàng"]
        H3["Ẩn"]
    end

    K1 --> H1
    K2 --> N2
    B1 --> B2
    B2 --> H2
    H1 --> N1
    H2 --> N1
    N1 --> N2
    N2 --> K2
```

---

## 9. Biểu Đồ Xử Lý Lỗi (Error Handling Tree)

```mermaid
graph TD
    A["❌ Lỗi Hệ Thống"] --> B{Loại Lỗi}

    B -->|Tên Trùng| C["Lỗi: Danh Mục/Sản Phẩm<br/>Đã Tồn Tại"]
    C --> C1["Cách Xử Lý: Thay Đổi Tên"]

    B -->|Ảnh Quá Lớn| D["Lỗi: File > 5MB"]
    D --> D1["Cách Xử Lý: Nén Ảnh"]

    B -->|Ảnh Không Hợp Lệ| E["Lỗi: Định Dạng Không<br/>Được Phép"]
    E --> E1["Cách Xử Lý: Dùng JPG/PNG/WebP"]

    B -->|Không Xóa Được| F["Lỗi: Còn Dữ Liệu<br/>Liên Quan"]
    F --> F1["Cách Xử Lý: Xóa/Chuyển Trước"]

    B -->|Giá Không Hợp Lệ| G["Lỗi: Giá ≤ 0"]
    G --> G1["Cách Xử Lý: Nhập Giá > 0"]

    B -->|Lỗi Kết Nối| H["Lỗi: Không Thể Kết Nối"]
    H --> H1["Cách Xử Lý: Refresh/Thử Lại"]

    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style G fill:#ffcdd2
    style H fill:#ffcdd2
```

---

## 10. Biểu Đồ Báo Cáo & Phân Tích (Pie Chart Concept)

```mermaid
pie title Phân Tích Sản Phẩm Bán Chạy Nhất Tháng 10
    "Phở Bò" : 350
    "Cơm Tấm" : 280
    "Bánh Mì" : 210
    "Cà Phê" : 190
    "Trà Đá" : 160
    "Khác" : 220
```

---

## 11. Biểu Đồ Dòng Thời Gian (Timeline)

```mermaid
timeline
    title Hành Trình Sản Phẩm Từ Tạo Đến Xóa

    section Tạo
        Nhân viên nhấn 'Thêm' : crit, 2h
        Nhập thông tin : crit, 3h
        Chọn ảnh : crit, 1h
        Xác nhận : crit, 0.5h

    section Hoạt Động
        Sản phẩm có sẵn : active, 7d
        Cập nhật giá : 1d
        Thay đổi mô tả : 1d

    section Không Hoạt Động
        Sản phẩm hết hàng : crit, 2d
        Báo hết hàng : crit, 1d
        Có sẵn lại : 1d

    section Xóa
        Ẩn sản phẩm : crit, 1d
        Xóa vĩnh viễn : crit, 0.5h
```

---

## 12. Biểu Đồ Kiến Trúc Thành Phần (Component Diagram)

```mermaid
graph TB
    subgraph Client["📱 Frontend - Next.js/React"]
        UI["🎨 UI Components"]
        Forms["📋 Forms & Validation"]
        State["🔄 State Management"]
    end

    subgraph API["🔌 Backend API - Node.js/Express"]
        Controllers["⚙️ Controllers"]
        Services["🛠️ Services"]
        Middlewares["🚪 Middlewares"]
    end

    subgraph Data["💾 Data Layer"]
        ORM["📊 Prisma ORM"]
        DB["🗄️ PostgreSQL"]
    end

    subgraph Storage["💿 File Storage"]
        LocalStorage["📁 Local Storage"]
        CloudStorage["☁️ Cloud S3"]
    end

    UI --> Forms
    Forms --> State
    State --> Controllers
    Controllers --> Services
    Services --> Middlewares
    Middlewares --> ORM
    ORM --> DB
    Services --> LocalStorage
    Services --> CloudStorage

    style Client fill:#e3f2fd
    style API fill:#f3e5f5
    style Data fill:#e8f5e9
    style Storage fill:#fff3e0
```

---

## 13. Biểu Đồ Dòng Dữ Liệu (Data Flow)

```mermaid
graph LR
    A["👤 Người Dùng"] -->|Nhập Dữ Liệu| B["📱 UI Form"]
    B -->|Gửi Request| C["🔌 API Endpoint"]
    C -->|Xác Thực| D["🚪 Middleware"]
    D -->|Kiểm Tra| E["⚙️ Business Logic"]
    E -->|Lưu Dữ Liệu| F["🗄️ Database"]
    E -->|Lưu File| G["💿 Storage"]
    F -->|Trả Về Data| H["📊 Response"]
    G -->|Trả Về URL| H
    H -->|Cập Nhật UI| B
    B -->|Hiển Thị Kết Quả| A
```

---

## 14. Biểu Đồ Vòng Đời Sản Phẩm (Lifecycle)

```mermaid
graph TD
    A["🆕 Sản Phẩm Mới<br/>Trạng Thái: Draft"] --> B["📝 Nhập Thông Tin"]
    B --> C["✅ Kiểm Tra & Xác Nhận"]
    C --> D["🎯 Xuất Bản<br/>Trạng Thái: Active"]
    D --> E{Điều Hành}

    E -->|Hàng Ngày| F["📊 Cập Nhật Trạng Thái"]
    E -->|Cần Sửa| G["🔧 Chỉnh Sửa Thông Tin"]
    E -->|Cần Ẩn| H["👁️ Ẩn Tạm Thời"]

    F --> I{Trạng Thái Nào?}
    I -->|Có Sẵn| J["✓ Có Sẵn"]
    I -->|Hết Hàng| K["✗ Hết Hàng"]

    J --> L{Cập Nhật Giá?}
    L -->|Có| M["💰 Cập Nhật Giá"]
    L -->|Không| N["📈 Tiếp Tục Bán"]

    K --> O["⏱️ Chờ Hàng Về"]
    O --> J

    G --> F
    H --> P{Quyết Định}
    P -->|Hiển Thị Lại| J
    P -->|Xóa Vĩnh Viễn| Q["🗑️ Xóa Sản Phẩm"]

    M --> F
    N --> F
    Q --> R["❌ Kết Thúc"]

    style A fill:#c8e6c9
    style D fill:#ffccbc
    style R fill:#ffcdd2
```

---

## 15. Biểu Đồ Tương Tác Người Dùng (Use Case Diagram)

```mermaid
graph TB
    subgraph System["🏪 Hệ Thống Quản Lý Menu"]
        UC1["Tạo Danh Mục"]
        UC2["Xem Danh Mục"]
        UC3["Chỉnh Sửa Danh Mục"]
        UC4["Xóa Danh Mục"]
        UC5["Tạo Sản Phẩm"]
        UC6["Xem Sản Phẩm"]
        UC7["Chỉnh Sửa Sản Phẩm"]
        UC8["Xóa Sản Phẩm"]
        UC9["Cập Nhật Giá"]
        UC10["Cập Nhật Trạng Thái"]
        UC11["Báo Cáo & Phân Tích"]
    end

    A["👤 Khách Hàng"] -->|Sử Dụng| UC2
    A -->|Sử Dụng| UC6
    A -->|Sử Dụng| UC11

    B["👨‍💼 Nhân Viên Phục Vụ"] -->|Sử Dụng| UC2
    B -->|Sử Dụng| UC6

    C["👨‍🍳 Đầu Bếp"] -->|Sử Dụng| UC2
    C -->|Sử Dụng| UC6
    C -->|Sử Dụng| UC10

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

    E["🔐 Admin"] -->|Sử Dụng| UC1
    E -->|Sử Dụng| UC3
    E -->|Sử Dụng| UC4
    E -->|Sử Dụng| UC5
    E -->|Sử Dụng| UC7
    E -->|Sử Dụng| UC8
    E -->|Sử Dụng| UC9
    E -->|Sử Dụng| UC10
    E -->|Sử Dụng| UC11

    style System fill:#e3f2fd
```

---

## 16. Biểu Đồ Quy Trình Xóa Sản Phẩm (Decision Tree)

```mermaid
graph TD
    A["🗑️ Bắt Đầu: Xóa Sản Phẩm"] --> B{"Sản phẩm có<br/>trong đơn<br/>chưa thanh toán?"}

    B -->|Có| C["⚠️ Cảnh Báo:<br/>Còn đơn liên quan"]
    C --> D["❓ Yêu Cầu:<br/>Xóa/Chuyển đơn?"]
    D -->|Xóa| E["🔄 Quay Lại"]
    D -->|Chuyển| F["🔄 Quay Lại"]
    E --> A
    F --> A

    B -->|Không| G["📋 Hiển Thị<br/>Hộp Thoại Xác Nhận"]
    G --> H["❓ Người Dùng<br/>Xác Nhận Xóa?"]

    H -->|Không| I["🚫 Hủy"]
    H -->|Có| J["🗑️ Xóa Sản Phẩm"]

    J --> K["🖼️ Xóa Ảnh"]
    K --> L["📊 Xóa Lịch Sử Giá"]
    L --> M["📝 Ghi Log Xóa"]
    M --> N["✅ Thông Báo Thành Công"]
    N --> O["✔️ Kết Thúc"]

    I --> P["🔴 Kết Thúc: Hủy"]

    style G fill:#fff3e0
    style N fill:#c8e6c9
    style P fill:#ffcdd2
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
2. Các công cụ khác có thể cần plugin (Notion, Confluence, v.v.)
3. Online editor: https://mermaid.live
