# Biểu Đồ Quản Lý Menu và Danh Mục

> **Cập nhật**: Tài liệu này đã được cập nhật để phản ánh chính xác hệ thống đã triển khai.

---

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
    H --> J[Lưu Sản Phẩm]
    J --> K[Quản Lý Hàng Ngày]
    K --> L{Cập Nhật<br/>Trạng Thái?}
    L -->|Có Sẵn| M[Toggle isAvailable]
    L -->|Không Sẵn| M
    M --> N[Cập Nhật Database]
    N --> O[Hiển Thị Cho Khách]
    O --> P[Khách Xem & Đặt Hàng]
    P --> U[Điều Chỉnh Menu]
    U --> V[Bảo Trì]
    V --> W{Thao Tác<br/>Cần Thiết?}
    W -->|Ẩn| X[Toggle isActive]
    W -->|Sửa| Y[Cập Nhật Thông Tin]
    W -->|Xóa| Z[Xóa Sản Phẩm]
    X --> K
    Y --> K
    Z --> K
```

---

## 2. Biểu Đồ Quản Lý Danh Mục (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User as Quản Lý/Admin
    participant UI as Giao Diện
    participant API as Backend API
    participant DB as Database
    participant Storage as File Storage

    Note over User,Storage: Tạo Danh Mục Mới
    User ->> UI: Nhấn "Tạo Danh Mục"
    UI ->> API: POST /categories
    API ->> API: Validate DTO (categoryName, description, displayOrder, imagePath, isActive)
    API ->> API: Kiểm tra categoryName duy nhất

    alt Tên Trùng
        API -->> UI: 409 Conflict - Danh mục đã tồn tại
        UI -->> User: Hiển thị lỗi
    else Tên Mới
        API ->> DB: Prisma create Category
        DB -->> API: Trả về category mới
        API -->> UI: 201 Created + category data
        UI -->> User: Hiển thị thành công
    end

    Note over User,Storage: Cập Nhật Danh Mục
    User ->> UI: Nhấn "Sửa Danh Mục"
    UI ->> API: PUT /categories/:id
    API ->> DB: Prisma findUnique(categoryId)
    alt Không Tìm Thấy
        API -->> UI: 404 Not Found
    else Tìm Thấy
        API ->> DB: Prisma update Category
        DB -->> API: Trả về category đã cập nhật
        API -->> UI: 200 OK + category data
    end

    Note over User,Storage: Xóa Danh Mục
    User ->> UI: Nhấn "Xóa Danh Mục"
    UI ->> API: DELETE /categories/:id
    API ->> DB: Kiểm tra MenuItem liên quan

    alt Có Sản Phẩm
        API -->> UI: 400 Bad Request - Còn sản phẩm trong danh mục
        UI -->> User: Hiển thị thông báo
    else Không Có Sản Phẩm
        API ->> Storage: Xóa ảnh (nếu có)
        API ->> DB: Prisma delete Category
        DB -->> API: Thành công
        API -->> UI: 200 OK
    end
```

---

## 3. Biểu Đồ Quản Lý Sản Phẩm (State Diagram)

> **Lưu ý**: Hệ thống sử dụng 2 boolean flags đơn giản thay vì state machine phức tạp.

```mermaid
stateDiagram-v2
    [*] --> Created

    Created --> Active_Available: isActive=true, isAvailable=true
    
    state "Trạng Thái Hoạt Động" as ActiveState {
        Active_Available: Hiển thị & Có thể đặt
        Active_Unavailable: Hiển thị nhưng Không thể đặt
        
        Active_Available --> Active_Unavailable: PATCH /menu/:id/availability (isAvailable=false)
        Active_Unavailable --> Active_Available: PATCH /menu/:id/availability (isAvailable=true)
    }

    Active_Available --> Inactive: PUT /menu/:id (isActive=false)
    Active_Unavailable --> Inactive: PUT /menu/:id (isActive=false)
    
    Inactive: Ẩn khỏi menu
    Inactive --> Active_Available: PUT /menu/:id (isActive=true, isAvailable=true)
    
    Active_Available --> Deleted: DELETE /menu/:id
    Active_Unavailable --> Deleted: DELETE /menu/:id
    Inactive --> Deleted: DELETE /menu/:id
    
    Deleted --> [*]
```

### Giải thích trạng thái:
| isActive | isAvailable | Trạng thái | Mô tả |
|----------|-------------|------------|-------|
| true | true | Có sẵn | Hiển thị trên menu, khách có thể đặt |
| true | false | Hết hàng | Hiển thị trên menu nhưng không thể đặt |
| false | * | Ẩn | Không hiển thị trên menu khách hàng |

---

## 4. Biểu Đồ Quy Trình Tạo Sản Phẩm Chi Tiết (Activity Diagram)

```mermaid
graph LR
    A["🔵 Manager/Admin:<br/>Nhấn 'Thêm Sản Phẩm'"] --> B["📋 Mở Form Nhập"]
    B --> C["✏️ Nhập itemCode (bắt buộc, unique)"]
    C --> D["✏️ Nhập itemName (bắt buộc)"]
    D --> E["🏷️ Chọn categoryId (bắt buộc)"]
    E --> F["💰 Nhập price (bắt buộc, > 0)"]
    F --> G{"Có thêm<br/>thông tin?"}
    G -->|Có| H["📝 Nhập các trường tùy chọn:<br/>cost, description, preparationTime,<br/>spicyLevel, isVegetarian, calories"]
    G -->|Không| I["🖼️ Upload ảnh (tùy chọn)"]
    H --> I
    I --> J["⚙️ Validate DTO"]
    J --> K{"Dữ Liệu<br/>Hợp Lệ?"}
    K -->|Không| L["❌ Hiển Thị Lỗi"]
    L --> M["🔄 Quay Lại Sửa"]
    M --> J
    K -->|Có| N["🔍 Kiểm tra itemCode unique"]
    N --> O{"itemCode<br/>trùng?"}
    O -->|Có| P["❌ Lỗi: Mã sản phẩm đã tồn tại"]
    P --> C
    O -->|Không| Q["🔍 Kiểm tra categoryId tồn tại"]
    Q --> R{"Category<br/>tồn tại?"}
    R -->|Không| S["❌ Lỗi: Danh mục không tồn tại"]
    S --> E
    R -->|Có| T["💾 Prisma create MenuItem"]
    T --> U["✅ Trả về 201 Created"]
    U --> V["🔵 Kết Thúc"]
```

---

## 5. Biểu Đồ Phân Quyền (Permission Matrix)

```mermaid
graph TB
    A["Phân Quyền Hệ Thống Menu"] --> B["👥 Vai Trò"]
    B --> C["👤 staff"]
    B --> D["👨‍🍳 chef"]
    B --> E["💼 manager"]
    B --> F["🔐 admin"]

    C --> C1["✓ GET /categories"]
    C --> C2["✓ GET /menu"]
    C --> C3["✗ POST/PUT/DELETE"]

    D --> D1["✓ GET /categories"]
    D --> D2["✓ GET /menu"]
    D --> D3["✗ POST/PUT/DELETE"]

    E --> E1["✓ GET /categories"]
    E --> E2["✓ POST /categories"]
    E --> E3["✓ PUT /categories/:id"]
    E --> E4["✓ DELETE /categories/:id"]
    E --> E5["✓ CRUD /menu"]
    E --> E6["✓ PATCH /menu/:id/availability"]

    F --> F1["✓ Full Access"]
    F --> F2["✓ GET /categories"]
    F --> F3["✓ POST /categories"]
    F --> F4["✓ PUT /categories/:id"]
    F --> F5["✓ DELETE /categories/:id"]
    F --> F6["✓ CRUD /menu"]
    F --> F7["✓ PATCH /menu/:id/availability"]
```

---

## 7. Biểu Đồ Cập Nhật Giá Sản Phẩm (Flow)

> **Lưu ý**: Hệ thống hiện tại **không lưu lịch sử giá**. Giá được cập nhật trực tiếp.

```mermaid
flowchart TD
    A["👤 Manager/Admin<br/>Mở form sửa sản phẩm"] --> B["📊 Hiển Thị Form với giá hiện tại"]
    B --> C["✏️ Nhập Giá Mới"]
    C --> D["🆗 Submit PUT /menu/:id"]
    D --> E{"price > 0?"}
    E -->|Không| F["❌ Validation Error<br/>price must be positive"]
    F --> C
    E -->|Có| G["💾 Prisma update MenuItem"]
    G --> H["🔄 Cập nhật updatedAt"]
    H --> I["✅ Trả về 200 OK"]
    I --> J["🎯 Kết Thúc"]

    style F fill:#ffcdd2
    style I fill:#c8e6c9
```

---

## 8. Biểu Đồ Quản Lý Trạng Thái Sẵn Có (Swimlanes)

```mermaid
graph TB
    subgraph Kitchen["👨‍🍳 Bếp/Staff"]
        K1["Báo hết nguyên liệu"]
    end

    subgraph Manager["💼 Manager/Admin"]
        M1["PATCH /menu/:id/availability"]
        M2["Toggle isAvailable"]
    end

    subgraph System["⚙️ Hệ Thống"]
        S1["Cập nhật Database"]
        S2["Trả về MenuItem mới"]
    end

    subgraph Customer["👥 Khách Hàng"]
        C1["GET /menu"]
        C2["Xem menu có filter isAvailable"]
    end

    K1 --> M1
    M1 --> M2
    M2 --> S1
    S1 --> S2
    S2 --> C1
    C1 --> C2
```

---

## 9. Biểu Đồ Xử Lý Lỗi (Error Handling Tree)

```mermaid
graph TD
    A["❌ Lỗi API"] --> B{Loại Lỗi}

    B -->|400| C["Bad Request"]
    C --> C1["- itemCode/categoryName required"]
    C --> C2["- price must be positive"]
    C --> C3["- Danh mục còn sản phẩm"]

    B -->|404| D["Not Found"]
    D --> D1["- Category not found"]
    D --> D2["- MenuItem not found"]

    B -->|409| E["Conflict"]
    E --> E1["- itemCode đã tồn tại"]
    E --> E2["- categoryName đã tồn tại"]

    B -->|401| F["Unauthorized"]
    F --> F1["- Token không hợp lệ"]
    F --> F2["- Token hết hạn"]

    B -->|403| G["Forbidden"]
    G --> G1["- Không đủ quyền (role)"]

    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style G fill:#ffcdd2
```

---

## 10. Biểu Đồ Kiến Trúc Thành Phần (Component Diagram)

```mermaid
graph TB
    subgraph Client["📱 Frontend - Next.js"]
        UI["🎨 UI Components"]
        Forms["📋 React Hook Form + Zod"]
        State["🔄 Zustand Store"]
        API_Client["🔌 API Client (axios/fetch)"]
    end

    subgraph Server["🔌 Backend - NestJS"]
        Controllers["⚙️ CategoryController<br/>MenuController"]
        Services["🛠️ CategoryService<br/>MenuService"]
        Guards["🚪 JwtAuthGuard<br/>RolesGuard"]
        DTOs["📋 CreateCategoryDto<br/>CreateMenuItemDto"]
    end

    subgraph Data["💾 Data Layer"]
        Prisma["📊 Prisma Client"]
        DB["🗄️ PostgreSQL"]
    end

    subgraph Storage["💿 File Storage"]
        StorageService["📁 StorageService"]
        Uploads["📂 /uploads folder"]
    end

    UI --> Forms
    Forms --> State
    State --> API_Client
    API_Client --> Guards
    Guards --> Controllers
    Controllers --> DTOs
    DTOs --> Services
    Services --> Prisma
    Prisma --> DB
    Services --> StorageService
    StorageService --> Uploads

    style Client fill:#e3f2fd
    style Server fill:#f3e5f5
    style Data fill:#e8f5e9
    style Storage fill:#fff3e0
```

---

## 11. Biểu Đồ Dòng Dữ Liệu (Data Flow)

```mermaid
graph LR
    A["👤 Manager/Admin"] -->|Request| B["📱 Frontend Form"]
    B -->|POST/PUT/DELETE| C["🔌 API Endpoint"]
    C -->|Validate| D["🚪 JwtAuthGuard + RolesGuard"]
    D -->|Check Role| E{"admin/manager?"}
    E -->|No| F["403 Forbidden"]
    E -->|Yes| G["⚙️ Controller"]
    G -->|Call| H["🛠️ Service"]
    H -->|Prisma Query| I["🗄️ PostgreSQL"]
    I -->|Return Data| J["📊 Response DTO"]
    J -->|JSON| B
    B -->|Display| A
```

---

## 12. Biểu Đồ Vòng Đời Sản Phẩm (Lifecycle)

```mermaid
graph TD
    A["🆕 POST /menu<br/>Tạo MenuItem mới"] --> B["✅ isActive=true<br/>isAvailable=true"]
    B --> C{Điều Hành Hàng Ngày}

    C -->|Hết hàng| D["PATCH /menu/:id/availability<br/>isAvailable=false"]
    C -->|Cập nhật| E["PUT /menu/:id<br/>Sửa thông tin"]
    C -->|Tạm ẩn| F["PUT /menu/:id<br/>isActive=false"]

    D --> G["Trạng thái: Hết hàng<br/>Hiển thị nhưng không đặt được"]
    E --> C
    F --> H["Trạng thái: Ẩn<br/>Không hiển thị trên menu"]

    G -->|Có hàng lại| I["PATCH /menu/:id/availability<br/>isAvailable=true"]
    I --> C

    H -->|Hiển thị lại| J["PUT /menu/:id<br/>isActive=true"]
    J --> C

    H -->|Xóa| K["DELETE /menu/:id"]
    K --> L["🗑️ MenuItem bị xóa"]
    L --> M["❌ Kết Thúc"]

    style A fill:#c8e6c9
    style L fill:#ffcdd2
```

---

## 13. Biểu Đồ API Endpoints

```mermaid
graph TB
    subgraph Categories["📁 /categories"]
        C1["GET /categories<br/>Lấy tất cả danh mục"]
        C2["GET /categories/:id<br/>Lấy chi tiết danh mục"]
        C3["GET /categories/:id/items<br/>Lấy sản phẩm trong danh mục"]
        C4["GET /categories/count<br/>Đếm số danh mục"]
        C5["POST /categories<br/>Tạo danh mục mới"]
        C6["PUT /categories/:id<br/>Cập nhật danh mục"]
        C7["DELETE /categories/:id<br/>Xóa danh mục"]
    end

    subgraph Menu["🍽️ /menu"]
        M1["GET /menu<br/>Lấy tất cả món ăn"]
        M2["GET /menu/:id<br/>Lấy chi tiết món"]
        M3["GET /menu/code/:code<br/>Lấy món theo mã"]
        M4["GET /menu/category/:categoryId<br/>Lấy món theo danh mục"]
        M5["GET /menu/count<br/>Đếm số món"]
        M6["POST /menu<br/>Tạo món mới"]
        M7["PUT /menu/:id<br/>Cập nhật món"]
        M8["PATCH /menu/:id/availability<br/>Toggle trạng thái sẵn có"]
        M9["DELETE /menu/:id<br/>Xóa món"]
    end

    subgraph Auth["🔐 Authorization"]
        A1["Public: GET endpoints"]
        A2["Protected: POST/PUT/PATCH/DELETE"]
        A3["Roles: admin, manager"]
    end

    C1 --> A1
    C2 --> A1
    C3 --> A1
    C4 --> A1
    C5 --> A2
    C6 --> A2
    C7 --> A2

    M1 --> A1
    M2 --> A1
    M3 --> A1
    M4 --> A1
    M5 --> A1
    M6 --> A2
    M7 --> A2
    M8 --> A2
    M9 --> A2

    A2 --> A3

    style Categories fill:#e3f2fd
    style Menu fill:#fff3e0
    style Auth fill:#f3e5f5
```

---

## Ghi Chú

### Các tính năng đã triển khai:
- ✅ CRUD Category với validation unique categoryName
- ✅ CRUD MenuItem với validation unique itemCode
- ✅ Upload/Delete ảnh qua StorageService
- ✅ Toggle availability (isAvailable)
- ✅ Toggle active status (isActive)
- ✅ Role-based access control (admin, manager)
- ✅ Pagination và filtering

### Các tính năng chưa triển khai:
- ❌ Allergens management (thành phần gây dị ứng)
- ❌ Price history tracking (lịch sử giá)
- ❌ Bulk import/export từ Excel/CSV
- ❌ Scheduled menu updates (menu theo giờ)
- ❌ Reports & Analytics (báo cáo phân tích)
- ❌ Activity logging (ghi log hành động)

### Công nghệ sử dụng:
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Zustand
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (Access Token 15 phút, Refresh Token 7 ngày)
- **Storage**: Local filesystem (/uploads)

Các biểu đồ này được tạo bằng **Mermaid** và có thể được:
- Chỉnh sửa trực tiếp trong markdown
- Xuất thành hình ảnh PNG/SVG
- Nhúng vào tài liệu web hoặc wiki

**Để sử dụng Mermaid:**
1. GitHub hỗ trợ mermaid trực tiếp trong markdown
2. Online editor: https://mermaid.live
