# 📊 Tài liệu Cơ sở Dữ liệu - Hệ thống Quản lý Nhà hàng

> **Dự án tốt nghiệp** - Hệ thống quản lý nhà hàng toàn diện  
> **Công nghệ**: PostgreSQL 16 + Prisma ORM + TypeScript

## Mục lục

-   [1. Tổng quan](#1-tổng-quan)
-   [2. Sơ đồ ERD](#2-sơ-đồ-erd)
-   [3. Mô tả chi tiết các bảng](#3-mô-tả-chi-tiết-các-bảng)
    -   [3.1 Authentication & User Management](#31-authentication--user-management)
    -   [3.2 Menu & Category Management](#32-menu--category-management)
    -   [3.3 Table Management](#33-table-management)
    -   [3.4 Reservation Management](#34-reservation-management)
    -   [3.5 Order Management](#35-order-management)
    -   [3.6 Kitchen Management](#36-kitchen-management)
    -   [3.7 Billing & Payment](#37-billing--payment)
-   [4. Mối quan hệ giữa các bảng](#4-mối-quan-hệ-giữa-các-bảng)
-   [5. Chiến lược đánh chỉ mục](#5-chiến-lược-đánh-chỉ-mục)
-   [6. Các truy vấn thường dùng](#6-các-truy-vấn-thường-dùng)
-   [7. Hệ thống đặt bàn](#7-hệ-thống-đặt-bàn)
-   [8. Kết luận](#8-kết-luận)
-   [9. Phụ lục](#9-phụ-lục)

---

## 1. Tổng quan

### 1.1. Giới thiệu

Đây là tài liệu cơ sở dữ liệu cho **dự án tốt nghiệp** về hệ thống quản lý nhà hàng. Hệ thống được thiết kế để hỗ trợ các nghiệp vụ cốt lõi của nhà hàng:

✅ **Các chức năng chính:**
-   Quản lý tài khoản và phân quyền nhân viên
-   Quản lý thực đơn và danh mục món ăn
-   Quản lý bàn ăn và sơ đồ mặt bằng
-   Hệ thống đặt bàn trực tuyến
-   Quản lý đơn hàng và bếp (Kitchen Display System)
-   Quản lý thanh toán và hóa đơn

### 1.2. Công nghệ sử dụng

-   **Database**: PostgreSQL 16 (Hệ quản trị CSDL quan hệ)
-   **ORM**: Prisma (Object-Relational Mapping)
-   **Language**: TypeScript
-   **Backend**: Node.js + Express
-   **Frontend**: Next.js 16 + React 19

### 1.3. Cấu trúc tổng thể

Cơ sở dữ liệu được chia thành 7 module chính với **15 bảng**:

| STT | Module               | Bảng chính                      | Mô tả                          |
| --- | -------------------- | ------------------------------- | ------------------------------ |
| 1   | **Authentication**   | accounts, refresh_tokens        | Xác thực và bảo mật            |
| 2   | **Staff Management** | staff                           | Quản lý nhân viên              |
| 3   | **Menu Management**  | categories, menu_items          | Quản lý thực đơn               |
| 4   | **Table Management** | restaurant_tables               | Quản lý bàn ăn                 |
| 5   | **Reservation**      | reservations                    | Đặt bàn trực tuyến             |
| 6   | **Order Management** | orders, order_items             | Quản lý đơn hàng               |
| 7   | **Kitchen**          | kitchen_orders                  | Quản lý bếp (KDS)              |
| 8   | **Billing**          | bills, bill_items, payments     | Thanh toán và hóa đơn          |

---

## 2. Sơ đồ ERD

### 2.1. Sơ đồ quan hệ giữa các bảng (ERD)

```mermaid
erDiagram
    %% ============================================
    %% AUTHENTICATION & USER MANAGEMENT
    %% ============================================
    Account ||--o{ RefreshToken : "has"
    Account ||--o| Staff : "has profile"

    %% ============================================
    %% MENU MANAGEMENT
    %% ============================================
    Category ||--o{ MenuItem : "contains"

    %% ============================================
    %% TABLE & RESERVATION FLOW
    %% ============================================
    RestaurantTable ||--o{ Reservation : "booked for"
    RestaurantTable ||--o{ Order : "serves at"
    RestaurantTable ||--o{ Bill : "generates from"
    
    Reservation ||--o{ Order : "creates"

    %% ============================================
    %% ORDER MANAGEMENT FLOW
    %% ============================================
    Order ||--o{ OrderItem : "contains"
    Order ||--o{ KitchenOrder : "sends to kitchen"
    Order ||--o| Bill : "generates bill"
    
    MenuItem ||--o{ OrderItem : "ordered as"
    Staff ||--o{ Order : "serves by"
    Staff ||--o{ KitchenOrder : "prepared by"

    %% ============================================
    %% BILLING & PAYMENT FLOW
    %% ============================================
    Bill ||--o{ BillItem : "itemizes"
    Bill ||--o{ Payment : "paid by"
    
    MenuItem ||--o{ BillItem : "charged as"
    Staff ||--o{ Bill : "processed by"

    %% ============================================
    %% TABLE DEFINITIONS
    %% ============================================
    
    Account {
        int accountId PK
        string username UK
        string email UK
        string phoneNumber UK
        string password "hashed"
        boolean isActive
        datetime lastLogin
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        int tokenId PK
        int accountId FK
        string token UK
        datetime expiresAt
        string deviceInfo
        string ipAddress
        boolean isRevoked
        datetime createdAt
    }

    Staff {
        int staffId PK
        int accountId FK UK
        string fullName
        string address
        date dateOfBirth
        date hireDate
        decimal salary
        enum role "admin|manager|waiter|chef|cashier"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Category {
        int categoryId PK
        string categoryName UK
        string description
        int displayOrder
        boolean isActive
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }

    MenuItem {
        int itemId PK
        string itemCode UK
        string itemName
        int categoryId FK
        decimal price
        decimal cost
        string description
        string imageUrl
        boolean isAvailable
        boolean isActive
        int preparationTime "minutes"
        int spicyLevel "0-5"
        boolean isVegetarian
        int calories
        int displayOrder
        datetime createdAt
        datetime updatedAt
    }

    RestaurantTable {
        int tableId PK
        string tableNumber UK
        string tableName
        int capacity
        int minCapacity
        int floor
        string section "VIP|Garden|Indoor"
        enum status "available|occupied|reserved|maintenance"
        string qrCode UK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Reservation {
        int reservationId PK
        string reservationCode UK
        string customerName
        string phoneNumber
        string email
        int tableId FK
        date reservationDate
        time reservationTime
        int duration "minutes"
        int headCount
        string specialRequest
        decimal depositAmount
        enum status "pending|confirmed|seated|completed|cancelled|no_show"
        string notes
        datetime createdAt
        datetime updatedAt
    }

    Order {
        int orderId PK
        string orderNumber UK
        int tableId FK
        int staffId FK
        int reservationId FK
        string customerName
        string customerPhone
        int headCount
        enum status "pending|confirmed|preparing|ready|served|cancelled"
        string notes
        datetime orderTime
        datetime confirmedAt
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        int orderItemId PK
        int orderId FK
        int itemId FK
        int quantity
        decimal unitPrice
        decimal subtotal
        string specialRequest
        enum status
        datetime createdAt
        datetime updatedAt
    }

    KitchenOrder {
        int kitchenOrderId PK
        int orderId FK
        int staffId FK "chef"
        int priority
        enum status
        datetime startedAt
        datetime completedAt
        int estimatedTime "minutes"
        string notes
        datetime createdAt
        datetime updatedAt
    }

    Bill {
        int billId PK
        string billNumber UK
        int orderId FK UK
        int tableId FK
        int staffId FK "cashier"
        decimal subtotal
        decimal taxAmount
        decimal taxRate "percentage"
        decimal discountAmount
        decimal serviceCharge
        decimal totalAmount
        decimal paidAmount
        decimal changeAmount
        enum paymentStatus "pending|paid|refunded|cancelled"
        enum paymentMethod "cash|card|momo|bank_transfer"
        string notes
        datetime createdAt
        datetime paidAt
        datetime updatedAt
    }

    BillItem {
        int billItemId PK
        int billId FK
        int itemId FK
        string itemName "snapshot"
        int quantity
        decimal unitPrice
        decimal subtotal
        decimal discount
        decimal total
        datetime createdAt
    }

    Payment {
        int paymentId PK
        int billId FK
        enum paymentMethod
        decimal amount
        string transactionId
        string cardNumber "last 4 digits"
        string cardHolderName
        enum status
        string notes
        datetime paymentDate
        datetime createdAt
    }
```

### 2.2. Các kiểu dữ liệu Enum

Database sử dụng các **Enum** để đảm bảo tính nhất quán và an toàn dữ liệu:

#### 📌 Role - Vai trò nhân viên

| Giá trị   | Mô tả          | Quyền hạn chính                  |
| --------- | -------------- | -------------------------------- |
| `admin`   | Quản trị viên  | Toàn quyền hệ thống              |
| `manager` | Quản lý        | Quản lý nhân viên, báo cáo       |
| `waiter`  | Nhân viên phục vụ | Nhận đơn, phục vụ khách      |
| `chef`    | Đầu bếp        | Xử lý đơn bếp, cập nhật món      |
| `cashier` | Thu ngân       | Xử lý thanh toán, in hóa đơn     |

#### 📌 TableStatus - Trạng thái bàn

| Giá trị       | Mô tả         | Màu hiển thị | Mô tả chi tiết              |
| ------------- | ------------- | ------------ | --------------------------- |
| `available`   | Có sẵn        | 🟢 Xanh     | Bàn trống, sẵn sàng phục vụ |
| `occupied`    | Đang sử dụng  | 🔴 Đỏ       | Có khách đang ngồi          |
| `reserved`    | Đã đặt        | 🟡 Vàng     | Đã được đặt trước           |
| `maintenance` | Đang bảo trì  | ⚫ Xám      | Đang sửa chữa, không dùng   |

#### 📌 OrderStatus - Trạng thái đơn hàng

| Giá trị      | Mô tả           | Giai đoạn           |
| ------------ | --------------- | ------------------- |
| `pending`    | Chờ xác nhận    | Mới tạo             |
| `confirmed`  | Đã xác nhận     | Đã tiếp nhận        |
| `preparing`  | Đang chuẩn bị   | Bếp đang nấu        |
| `ready`      | Sẵn sàng        | Món đã xong         |
| `served`     | Đã phục vụ      | Đã mang ra bàn      |
| `cancelled`  | Đã hủy          | Hủy đơn             |

#### 📌 PaymentStatus - Trạng thái thanh toán

| Giá trị     | Mô tả             |
| ----------- | ----------------- |
| `pending`   | Chờ thanh toán    |
| `paid`      | Đã thanh toán     |
| `refunded`  | Đã hoàn tiền      |
| `cancelled` | Đã hủy            |

#### 📌 PaymentMethod - Phương thức thanh toán

| Giá trị         | Mô tả              | Icon |
| --------------- | ------------------ | ---- |
| `cash`          | Tiền mặt           | 💵   |
| `card`          | Thẻ ngân hàng      | 💳   |
| `momo`          | Ví MoMo            | 📱   |
| `bank_transfer` | Chuyển khoản       | 🏦   |

#### 📌 ReservationStatus - Trạng thái đặt bàn

| Giá trị     | Mô tả            | Mô tả chi tiết                  |
| ----------- | ---------------- | ------------------------------- |
| `pending`   | Chờ xác nhận     | Vừa mới đặt, chưa xác nhận      |
| `confirmed` | Đã xác nhận      | Nhân viên đã xác nhận đặt bàn   |
| `seated`    | Đã đến ngồi      | Khách đã tới và ngồi vào bàn    |
| `completed` | Hoàn thành       | Đã dùng xong và rời đi          |
| `cancelled` | Đã hủy           | Khách hoặc nhà hàng hủy         |
| `no_show`   | Không đến        | Khách đặt nhưng không tới       |

---

## 3. Mô tả chi tiết các bảng

### 3.1. Authentication & User Management

#### 3.1.1. accounts (Tài khoản)

Lưu trữ thông tin đăng nhập của nhân viên.

| Trường      | Kiểu         | Ràng buộc        | Mô tả                |
| ----------- | ------------ | ---------------- | -------------------- |
| accountId   | INTEGER      | PK, Auto         | ID tài khoản         |
| username    | VARCHAR(50)  | UNIQUE, NOT NULL | Tên đăng nhập        |
| email       | VARCHAR(255) | UNIQUE, NOT NULL | Email                |
| phoneNumber | VARCHAR(20)  | UNIQUE, NOT NULL | Số điện thoại        |
| password    | VARCHAR(255) | NOT NULL         | Mật khẩu (hashed)    |
| isActive    | BOOLEAN      | DEFAULT true     | Trạng thái hoạt động |
| lastLogin   | TIMESTAMP    | NULL             | Lần đăng nhập cuối   |
| createdAt   | TIMESTAMP    | DEFAULT now()    | Ngày tạo             |
| updatedAt   | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật        |

**Ví dụ dữ liệu:**

```json
{
    "accountId": 1,
    "username": "admin001",
    "email": "admin@restaurant.com",
    "phoneNumber": "0938123456",
    "password": "$2b$10$...",
    "isActive": true,
    "lastLogin": "2025-10-24T14:30:00Z",
    "createdAt": "2025-10-14T07:55:00Z",
    "updatedAt": "2025-10-24T14:30:00Z"
}
```

**Indexes:**

-   `idx_accounts_email` trên `email`
-   `idx_accounts_username` trên `username`

**Quan hệ:**

-   1:1 với `staff`
-   1:N với `refresh_tokens`

---

#### 3.1.2. refresh_tokens (Token làm mới)

Quản lý refresh tokens cho JWT authentication.

| Trường     | Kiểu         | Ràng buộc        | Mô tả              |
| ---------- | ------------ | ---------------- | ------------------ |
| tokenId    | INTEGER      | PK, Auto         | ID token           |
| accountId  | INTEGER      | FK, NOT NULL     | ID tài khoản       |
| token      | TEXT         | UNIQUE, NOT NULL | Token string       |
| expiresAt  | TIMESTAMP    | NOT NULL         | Thời gian hết hạn  |
| deviceInfo | VARCHAR(500) | NULL             | Thông tin thiết bị |
| ipAddress  | VARCHAR(45)  | NULL             | Địa chỉ IP         |
| isRevoked  | BOOLEAN      | DEFAULT false    | Đã thu hồi         |
| createdAt  | TIMESTAMP    | DEFAULT now()    | Ngày tạo           |
| revokedAt  | TIMESTAMP    | NULL             | Ngày thu hồi       |

**Indexes:**

-   `idx_refresh_tokens_accountId` trên `accountId`
-   `idx_refresh_tokens_token` trên `token`
-   `idx_refresh_tokens_expiresAt` trên `expiresAt`

**Quan hệ:**

-   N:1 với `accounts` (CASCADE DELETE)

---

#### 3.1.3. staff (Nhân viên)

Thông tin chi tiết về nhân viên.

| Trường      | Kiểu          | Ràng buộc            | Mô tả         |
| ----------- | ------------- | -------------------- | ------------- |
| staffId     | INTEGER       | PK, Auto             | ID nhân viên  |
| accountId   | INTEGER       | FK, UNIQUE, NOT NULL | ID tài khoản  |
| fullName    | VARCHAR(255)  | NOT NULL             | Họ và tên     |
| address     | VARCHAR(500)  | NULL                 | Địa chỉ       |
| dateOfBirth | DATE          | NULL                 | Ngày sinh     |
| hireDate    | DATE          | DEFAULT now()        | Ngày vào làm  |
| salary      | DECIMAL(12,2) | NULL                 | Lương         |
| role        | ENUM(Role)    | NOT NULL             | Vai trò       |
| isActive    | BOOLEAN       | DEFAULT true         | Đang làm việc |
| createdAt   | TIMESTAMP     | DEFAULT now()        | Ngày tạo      |
| updatedAt   | TIMESTAMP     | AUTO UPDATE          | Ngày cập nhật |

**Indexes:**

-   `idx_staff_role` trên `role`
-   `idx_staff_isActive` trên `isActive`

**Quan hệ:**

-   1:1 với `accounts` (CASCADE DELETE)
-   1:N với `orders` (waiter)
-   1:N với `bills` (cashier)
-   1:N với `kitchen_orders` (chef)

---

### 3.2. Menu Management

#### 3.2.1. categories (Danh mục)

Danh mục món ăn (Appetizer, Main Course, Dessert, Beverage, v.v.)

| Trường       | Kiểu         | Ràng buộc        | Mô tả           |
| ------------ | ------------ | ---------------- | --------------- |
| categoryId   | INTEGER      | PK, Auto         | ID danh mục     |
| categoryName | VARCHAR(100) | UNIQUE, NOT NULL | Tên danh mục    |
| description  | VARCHAR(500) | NULL             | Mô tả           |
| displayOrder | INTEGER      | DEFAULT 0        | Thứ tự hiển thị |
| isActive     | BOOLEAN      | DEFAULT true     | Đang hoạt động  |
| imageUrl     | VARCHAR(500) | NULL             | URL hình ảnh    |
| createdAt    | TIMESTAMP    | DEFAULT now()    | Ngày tạo        |
| updatedAt    | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật   |

**Indexes:**

-   `idx_categories_isActive` trên `isActive`

**Quan hệ:**

-   1:N với `menu_items`

---

#### 3.2.2. menu_items (Món ăn)

Thông tin chi tiết về các món ăn trong thực đơn.

| Trường          | Kiểu          | Ràng buộc        | Mô tả                     |
| --------------- | ------------- | ---------------- | ------------------------- |
| itemId          | INTEGER       | PK, Auto         | ID món ăn                 |
| itemCode        | VARCHAR(20)   | UNIQUE, NOT NULL | Mã món                    |
| itemName        | VARCHAR(100)  | NOT NULL         | Tên món                   |
| categoryId      | INTEGER       | FK, NOT NULL     | ID danh mục               |
| price           | DECIMAL(10,2) | NOT NULL         | Giá bán                   |
| cost            | DECIMAL(10,2) | NULL             | Giá vốn                   |
| description     | VARCHAR(1000) | NULL             | Mô tả                     |
| imageUrl        | VARCHAR(500)  | NULL             | URL hình ảnh              |
| isAvailable     | BOOLEAN       | DEFAULT true     | Còn hàng                  |
| isActive        | BOOLEAN       | DEFAULT true     | Đang bán                  |
| preparationTime | INTEGER       | NULL             | Thời gian chế biến (phút) |
| spicyLevel      | INTEGER       | DEFAULT 0        | Độ cay (0-5)              |
| isVegetarian    | BOOLEAN       | DEFAULT false    | Món chay                  |
| calories        | INTEGER       | NULL             | Calo                      |
| displayOrder    | INTEGER       | DEFAULT 0        | Thứ tự hiển thị           |
| createdAt       | TIMESTAMP     | DEFAULT now()    | Ngày tạo                  |
| updatedAt       | TIMESTAMP     | AUTO UPDATE      | Ngày cập nhật             |

**Indexes:**

-   `idx_menu_items_categoryId` trên `categoryId`
-   `idx_menu_items_isAvailable` trên `isAvailable`
-   `idx_menu_items_isActive` trên `isActive`

**Quan hệ:**

-   N:1 với `categories` (RESTRICT DELETE)
-   1:N với `order_items`
-   1:N với `bill_items`

---

### 3.3. Table Management

#### 3.3.1. restaurant_tables (Bàn ăn)

Quản lý bàn ăn trong nhà hàng.

| Trường      | Kiểu              | Ràng buộc         | Mô tả                       |
| ----------- | ----------------- | ----------------- | --------------------------- |
| tableId     | INTEGER           | PK, Auto          | ID bàn                      |
| tableNumber | VARCHAR(20)       | UNIQUE, NOT NULL  | Số bàn                      |
| tableName   | VARCHAR(50)       | NULL              | Tên bàn                     |
| capacity    | INTEGER           | NOT NULL          | Sức chứa                    |
| minCapacity | INTEGER           | DEFAULT 1         | Sức chứa tối thiểu          |
| floor       | INTEGER           | DEFAULT 1         | Tầng                        |
| section     | VARCHAR(50)       | NULL              | Khu vực (VIP, Garden, v.v.) |
| status      | ENUM(TableStatus) | DEFAULT available | Trạng thái                  |
| qrCode      | VARCHAR(255)      | UNIQUE, NULL      | Mã QR                       |
| isActive    | BOOLEAN           | DEFAULT true      | Đang sử dụng                |
| createdAt   | TIMESTAMP         | DEFAULT now()     | Ngày tạo                    |
| updatedAt   | TIMESTAMP         | AUTO UPDATE       | Ngày cập nhật               |

**Indexes:**

-   `idx_restaurant_tables_status` trên `status`
-   `idx_restaurant_tables_floor` trên `floor`
-   `idx_restaurant_tables_isActive` trên `isActive`

**Quan hệ:**

-   1:N với `reservations`
-   1:N với `orders`
-   1:N với `bills`

---

### 3.4. Reservation Management

#### 3.4.1. reservations (Đặt bàn)

Quản lý đặt bàn trực tuyến.

| Trường          | Kiểu                    | Ràng buộc       | Mô tả             |
| --------------- | ----------------------- | --------------- | ----------------- |
| reservationId   | INTEGER                 | PK, Auto        | ID đặt bàn        |
| reservationCode | VARCHAR(50)             | UNIQUE, UUID    | Mã đặt bàn        |
| customerName    | VARCHAR(255)            | NOT NULL        | Tên khách         |
| phoneNumber     | VARCHAR(20)             | NOT NULL        | SĐT khách         |
| email           | VARCHAR(255)            | NULL            | Email khách       |
| tableId         | INTEGER                 | FK, NOT NULL    | ID bàn            |
| reservationDate | DATE                    | NOT NULL        | Ngày đặt          |
| reservationTime | TIME                    | NOT NULL        | Giờ đặt           |
| duration        | INTEGER                 | DEFAULT 120     | Thời lượng (phút) |
| headCount       | INTEGER                 | NOT NULL        | Số người          |
| specialRequest  | TEXT                    | NULL            | Yêu cầu đặc biệt  |
| depositAmount   | DECIMAL(10,2)           | NULL            | Tiền cọc          |
| status          | ENUM(ReservationStatus) | DEFAULT pending | Trạng thái        |
| notes           | TEXT                    | NULL            | Ghi chú           |
| createdAt       | TIMESTAMP               | DEFAULT now()   | Ngày tạo          |
| updatedAt       | TIMESTAMP               | AUTO UPDATE     | Ngày cập nhật     |

**Indexes:**

-   `idx_reservations_reservationDate` trên `reservationDate`
-   `idx_reservations_status` trên `status`
-   `idx_reservations_phoneNumber` trên `phoneNumber`
-   `idx_reservations_tableId` trên `tableId`

**Quan hệ:**

-   N:1 với `restaurant_tables` (RESTRICT DELETE)
-   1:N với `orders`

---

### 3.5. Order Management

#### 3.5.1. orders (Đơn hàng)

Đơn hàng của khách tại bàn.

| Trường        | Kiểu              | Ràng buộc       | Mô tả                |
| ------------- | ----------------- | --------------- | -------------------- |
| orderId       | INTEGER           | PK, Auto        | ID đơn hàng          |
| orderNumber   | VARCHAR(50)       | UNIQUE, UUID    | Mã đơn hàng          |
| tableId       | INTEGER           | FK, NOT NULL    | ID bàn               |
| staffId       | INTEGER           | FK, NULL        | ID nhân viên phục vụ |
| reservationId | INTEGER           | FK, NULL        | ID đặt bàn           |
| customerName  | VARCHAR(255)      | NULL            | Tên khách            |
| customerPhone | VARCHAR(20)       | NULL            | SĐT khách            |
| headCount     | INTEGER           | DEFAULT 1       | Số người             |
| status        | ENUM(OrderStatus) | DEFAULT pending | Trạng thái           |
| notes         | TEXT              | NULL            | Ghi chú              |
| orderTime     | TIMESTAMP         | DEFAULT now()   | Giờ đặt              |
| confirmedAt   | TIMESTAMP         | NULL            | Giờ xác nhận         |
| completedAt   | TIMESTAMP         | NULL            | Giờ hoàn thành       |
| createdAt     | TIMESTAMP         | DEFAULT now()   | Ngày tạo             |
| updatedAt     | TIMESTAMP         | AUTO UPDATE     | Ngày cập nhật        |

**Indexes:**

-   `idx_orders_orderNumber` trên `orderNumber`
-   `idx_orders_tableId` trên `tableId`
-   `idx_orders_status` trên `status`
-   `idx_orders_orderTime` trên `orderTime`

**Quan hệ:**

-   N:1 với `restaurant_tables` (RESTRICT DELETE)
-   N:1 với `staff` (SET NULL)
-   N:1 với `reservations` (SET NULL)
-   1:N với `order_items`
-   1:N với `kitchen_orders`
-   1:1 với `bills`

---

#### 3.5.2. order_items (Chi tiết đơn hàng)

Chi tiết các món trong đơn hàng.

| Trường         | Kiểu              | Ràng buộc       | Mô tả            |
| -------------- | ----------------- | --------------- | ---------------- |
| orderItemId    | INTEGER           | PK, Auto        | ID chi tiết      |
| orderId        | INTEGER           | FK, NOT NULL    | ID đơn hàng      |
| itemId         | INTEGER           | FK, NOT NULL    | ID món ăn        |
| quantity       | INTEGER           | NOT NULL        | Số lượng         |
| unitPrice      | DECIMAL(10,2)     | NOT NULL        | Đơn giá          |
| subtotal       | DECIMAL(10,2)     | NOT NULL        | Thành tiền       |
| specialRequest | VARCHAR(500)      | NULL            | Yêu cầu đặc biệt |
| status         | ENUM(OrderStatus) | DEFAULT pending | Trạng thái       |
| createdAt      | TIMESTAMP         | DEFAULT now()   | Ngày tạo         |
| updatedAt      | TIMESTAMP         | AUTO UPDATE     | Ngày cập nhật    |

**Indexes:**

-   `idx_order_items_orderId` trên `orderId`
-   `idx_order_items_itemId` trên `itemId`
-   `idx_order_items_status` trên `status`

**Quan hệ:**

-   N:1 với `orders` (CASCADE DELETE)
-   N:1 với `menu_items` (RESTRICT DELETE)

---

### 3.6. Kitchen Management

#### 3.6.1. kitchen_orders (Đơn bếp)

Quản lý đơn hàng trong bếp.

| Trường         | Kiểu              | Ràng buộc       | Mô tả                     |
| -------------- | ----------------- | --------------- | ------------------------- |
| kitchenOrderId | INTEGER           | PK, Auto        | ID đơn bếp                |
| orderId        | INTEGER           | FK, NOT NULL    | ID đơn hàng               |
| staffId        | INTEGER           | FK, NULL        | ID đầu bếp                |
| priority       | INTEGER           | DEFAULT 0       | Độ ưu tiên                |
| status         | ENUM(OrderStatus) | DEFAULT pending | Trạng thái                |
| startedAt      | TIMESTAMP         | NULL            | Giờ bắt đầu               |
| completedAt    | TIMESTAMP         | NULL            | Giờ hoàn thành            |
| estimatedTime  | INTEGER           | NULL            | Thời gian ước tính (phút) |
| notes          | TEXT              | NULL            | Ghi chú                   |
| createdAt      | TIMESTAMP         | DEFAULT now()   | Ngày tạo                  |
| updatedAt      | TIMESTAMP         | AUTO UPDATE     | Ngày cập nhật             |

**Indexes:**

-   `idx_kitchen_orders_orderId` trên `orderId`
-   `idx_kitchen_orders_status` trên `status`
-   `idx_kitchen_orders_priority` trên `priority`

**Quan hệ:**

-   N:1 với `orders` (CASCADE DELETE)
-   N:1 với `staff` (SET NULL)

---

### 3.7. Billing & Payment

#### 3.7.1. bills (Hóa đơn)

Hóa đơn thanh toán.

| Trường         | Kiểu                | Ràng buộc            | Mô tả           |
| -------------- | ------------------- | -------------------- | --------------- |
| billId         | INTEGER             | PK, Auto             | ID hóa đơn      |
| billNumber     | VARCHAR(50)         | UNIQUE, UUID         | Mã hóa đơn      |
| orderId        | INTEGER             | FK, UNIQUE, NOT NULL | ID đơn hàng     |
| tableId        | INTEGER             | FK, NOT NULL         | ID bàn          |
| staffId        | INTEGER             | FK, NULL             | ID thu ngân     |
| subtotal       | DECIMAL(12,2)       | NOT NULL             | Tổng tiền hàng  |
| taxAmount      | DECIMAL(12,2)       | DEFAULT 0            | Tiền thuế       |
| taxRate        | DECIMAL(5,2)        | DEFAULT 0            | Tỷ lệ thuế (%)  |
| discountAmount | DECIMAL(12,2)       | DEFAULT 0            | Tiền giảm giá   |
| serviceCharge  | DECIMAL(12,2)       | DEFAULT 0            | Phí phục vụ     |
| totalAmount    | DECIMAL(12,2)       | NOT NULL             | Tổng cộng       |
| paidAmount     | DECIMAL(12,2)       | DEFAULT 0            | Đã thanh toán   |
| changeAmount   | DECIMAL(12,2)       | DEFAULT 0            | Tiền thối       |
| paymentStatus  | ENUM(PaymentStatus) | DEFAULT pending      | Trạng thái TT   |
| paymentMethod  | ENUM(PaymentMethod) | NULL                 | Phương thức TT  |
| notes          | TEXT                | NULL                 | Ghi chú         |
| createdAt      | TIMESTAMP           | DEFAULT now()        | Ngày tạo        |
| paidAt         | TIMESTAMP           | NULL                 | Ngày thanh toán |
| updatedAt      | TIMESTAMP           | AUTO UPDATE          | Ngày cập nhật   |

**Indexes:**

-   `idx_bills_billNumber` trên `billNumber`
-   `idx_bills_orderId` trên `orderId`
-   `idx_bills_paymentStatus` trên `paymentStatus`
-   `idx_bills_createdAt` trên `createdAt`

**Quan hệ:**

-   1:1 với `orders` (RESTRICT DELETE)
-   N:1 với `restaurant_tables` (RESTRICT DELETE)
-   N:1 với `staff` (SET NULL)
-   1:N với `bill_items`
-   1:N với `payments`

---

#### 3.7.2. bill_items (Chi tiết hóa đơn)

Chi tiết các món trong hóa đơn.

| Trường     | Kiểu          | Ràng buộc     | Mô tả              |
| ---------- | ------------- | ------------- | ------------------ |
| billItemId | INTEGER       | PK, Auto      | ID chi tiết HĐ     |
| billId     | INTEGER       | FK, NOT NULL  | ID hóa đơn         |
| itemId     | INTEGER       | FK, NOT NULL  | ID món ăn          |
| itemName   | VARCHAR(100)  | NOT NULL      | Tên món (snapshot) |
| quantity   | INTEGER       | NOT NULL      | Số lượng           |
| unitPrice  | DECIMAL(10,2) | NOT NULL      | Đơn giá            |
| subtotal   | DECIMAL(10,2) | NOT NULL      | Thành tiền         |
| discount   | DECIMAL(10,2) | DEFAULT 0     | Giảm giá           |
| total      | DECIMAL(10,2) | NOT NULL      | Tổng               |
| createdAt  | TIMESTAMP     | DEFAULT now() | Ngày tạo           |

**Indexes:**

-   `idx_bill_items_billId` trên `billId`

**Quan hệ:**

-   N:1 với `bills` (CASCADE DELETE)
-   N:1 với `menu_items` (RESTRICT DELETE)

---

#### 3.7.3. payments (Thanh toán)

Các khoản thanh toán cho hóa đơn.

| Trường         | Kiểu                | Ràng buộc       | Mô tả              |
| -------------- | ------------------- | --------------- | ------------------ |
| paymentId      | INTEGER             | PK, Auto        | ID thanh toán      |
| billId         | INTEGER             | FK, NOT NULL    | ID hóa đơn         |
| paymentMethod  | ENUM(PaymentMethod) | NOT NULL        | Phương thức TT     |
| amount         | DECIMAL(12,2)       | NOT NULL        | Số tiền            |
| transactionId  | VARCHAR(100)        | NULL            | Mã giao dịch       |
| cardNumber     | VARCHAR(20)         | NULL            | Số thẻ (4 số cuối) |
| cardHolderName | VARCHAR(255)        | NULL            | Tên chủ thẻ        |
| status         | ENUM(PaymentStatus) | DEFAULT pending | Trạng thái         |
| notes          | TEXT                | NULL            | Ghi chú            |
| paymentDate    | TIMESTAMP           | DEFAULT now()   | Ngày thanh toán    |
| createdAt      | TIMESTAMP           | DEFAULT now()   | Ngày tạo           |

**Indexes:**

-   `idx_payments_billId` trên `billId`
-   `idx_payments_transactionId` trên `transactionId`

**Quan hệ:**

-   N:1 với `bills` (CASCADE DELETE)

**Indexes:**

-   `idx_accounts_email` trên `email`
-   `idx_accounts_username` trên `username`

**Quan hệ:**

-   1:1 với `staff`
-   1:N với `refresh_tokens`

---

#### 3.1.2. refresh_tokens (Token làm mới)

Quản lý refresh tokens cho JWT authentication.

| Trường     | Kiểu         | Ràng buộc        | Mô tả              |
| ---------- | ------------ | ---------------- | ------------------ |
| tokenId    | INTEGER      | PK, Auto         | ID token           |
| accountId  | INTEGER      | FK, NOT NULL     | ID tài khoản       |
| token      | TEXT         | UNIQUE, NOT NULL | Token string       |
| expiresAt  | TIMESTAMP    | NOT NULL         | Thời gian hết hạn  |
| deviceInfo | VARCHAR(500) | NULL             | Thông tin thiết bị |
| ipAddress  | VARCHAR(45)  | NULL             | Địa chỉ IP         |
| isRevoked  | BOOLEAN      | DEFAULT false    | Đã thu hồi         |
| createdAt  | TIMESTAMP    | DEFAULT now()    | Ngày tạo           |
| revokedAt  | TIMESTAMP    | NULL             | Ngày thu hồi       |

**Indexes:**

-   `idx_refresh_tokens_accountId` trên `accountId`
-   `idx_refresh_tokens_token` trên `token`
-   `idx_refresh_tokens_expiresAt` trên `expiresAt`

**Quan hệ:**

-   N:1 với `accounts` (CASCADE DELETE)

---

#### 3.1.3. staff (Nhân viên)

Thông tin chi tiết về nhân viên.

| Trường      | Kiểu          | Ràng buộc            | Mô tả         |
| ----------- | ------------- | -------------------- | ------------- |
| staffId     | INTEGER       | PK, Auto             | ID nhân viên  |
| accountId   | INTEGER       | FK, UNIQUE, NOT NULL | ID tài khoản  |
| fullName    | VARCHAR(255)  | NOT NULL             | Họ và tên     |
| address     | VARCHAR(500)  | NULL                 | Địa chỉ       |
| dateOfBirth | DATE          | NULL                 | Ngày sinh     |
| hireDate    | DATE          | DEFAULT now()        | Ngày vào làm  |
| salary      | DECIMAL(12,2) | NULL                 | Lương         |
| role        | ENUM(Role)    | NOT NULL             | Vai trò       |
| isActive    | BOOLEAN       | DEFAULT true         | Đang làm việc |
| createdAt   | TIMESTAMP     | DEFAULT now()        | Ngày tạo      |
| updatedAt   | TIMESTAMP     | AUTO UPDATE          | Ngày cập nhật |

**Indexes:**

-   `idx_staff_role` trên `role`
-   `idx_staff_isActive` trên `isActive`

**Quan hệ:**

-   1:1 với `accounts` (CASCADE DELETE)
-   1:N với `orders` (waiter)
-   1:N với `bills` (cashier)
-   1:N với `kitchen_orders` (chef)

---

## 4. Mối quan hệ giữa các bảng

### 4.1. Mối quan hệ chính

#### Authentication Flow

```
Account (1) ─── (1) Staff
  │
  └── (N) RefreshToken
```

#### Menu Hierarchy

```
Category (1) ─── (N) MenuItem
```

#### Table & Reservation

```
RestaurantTable (1) ─── (N) Reservation
                 │
                 ├── (N) Order
                 │
                 └── (N) Bill
```

#### Order Flow

```
Reservation (1) ─── (N) Order
         │
         ├── Staff (waiter)
         │
         ├── OrderItem (N)
         │     └── MenuItem
         │
         ├── KitchenOrder (N)
         │     └── Staff (chef)
         │
         └── Bill (1)
              ├── BillItem (N)
              │     └── MenuItem
              │
              └── Payment (N)
```

### 4.2. Ràng buộc tham chiếu (Foreign Keys)

Danh sách các ràng buộc khóa ngoại trong database:

| Bảng con       | Khóa ngoại    | Bảng cha          | Hành động xóa | Mô tả                                     |
| -------------- | ------------- | ----------------- | ------------- | ----------------------------------------- |
| refresh_tokens | accountId     | accounts          | CASCADE       | Xóa token khi xóa tài khoản               |
| staff          | accountId     | accounts          | CASCADE       | Xóa nhân viên khi xóa tài khoản           |
| menu_items     | categoryId    | categories        | RESTRICT      | Không cho xóa danh mục nếu còn món        |
| reservations   | tableId       | restaurant_tables | RESTRICT      | Không cho xóa bàn nếu có đặt chỗ          |
| orders         | tableId       | restaurant_tables | RESTRICT      | Không cho xóa bàn nếu còn đơn hàng        |
| orders         | staffId       | staff             | SET NULL      | Set NULL khi xóa nhân viên                |
| orders         | reservationId | reservations      | SET NULL      | Set NULL khi xóa đặt bàn                  |
| order_items    | orderId       | orders            | CASCADE       | Xóa chi tiết khi xóa đơn hàng             |
| order_items    | itemId        | menu_items        | RESTRICT      | Không cho xóa món nếu đã trong đơn        |
| kitchen_orders | orderId       | orders            | CASCADE       | Xóa đơn bếp khi xóa đơn hàng              |
| kitchen_orders | staffId       | staff             | SET NULL      | Set NULL khi xóa đầu bếp                  |
| bills          | orderId       | orders            | RESTRICT      | Không cho xóa đơn nếu đã có hóa đơn       |
| bills          | tableId       | restaurant_tables | RESTRICT      | Không cho xóa bàn nếu có hóa đơn          |
| bills          | staffId       | staff             | SET NULL      | Set NULL khi xóa thu ngân                 |
| bill_items     | billId        | bills             | CASCADE       | Xóa chi tiết khi xóa hóa đơn              |
| bill_items     | itemId        | menu_items        | RESTRICT      | Không cho xóa món nếu đã trong hóa đơn    |
| payments       | billId        | bills             | CASCADE       | Xóa thanh toán khi xóa hóa đơn            |

**Giải thích các hành động xóa:**

-   **CASCADE**: Tự động xóa các bản ghi con khi xóa bản ghi cha
-   **RESTRICT**: Ngăn không cho xóa bản ghi cha nếu còn bản ghi con tham chiếu
-   **SET NULL**: Đặt giá trị NULL cho khóa ngoại khi xóa bản ghi cha

---

## 5. Chiến lược đánh chỉ mục

### 5.1. Primary Keys

Tất cả các bảng đều có primary key tự động tăng (AUTO_INCREMENT):

-   Tối ưu cho INSERT operations
-   Đảm bảo tính duy nhất
-   Hiệu suất cao cho JOIN operations

### 5.2. Unique Indexes

Các trường có ràng buộc UNIQUE:

| Bảng             | Trường                       | Mục đích                 |
| ---------------- | ---------------------------- | ------------------------ |
| accounts         | username, email, phoneNumber | Đăng nhập và liên hệ     |
| refresh_tokens   | token                        | Bảo mật token            |
| categories       | categoryName                 | Không trùng tên danh mục |
| menu_items       | itemCode                     | Mã món duy nhất          |
| restaurant_tables| tableNumber, qrCode          | Số bàn và QR             |
| reservations     | reservationCode              | Mã đặt bàn               |
| orders           | orderNumber                  | Mã đơn hàng              |
| bills            | billNumber, orderId          | Mã hóa đơn               |

### 5.3. Regular Indexes

Các index thông thường để tối ưu truy vấn:

#### Lookup Indexes (Tìm kiếm nhanh)

```sql
-- Authentication
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Menu
CREATE INDEX idx_menu_items_categoryId ON menu_items(categoryId);

-- Orders
CREATE INDEX idx_orders_orderNumber ON orders(orderNumber);
CREATE INDEX idx_order_items_orderId ON order_items(orderId);

-- Bills
CREATE INDEX idx_bills_billNumber ON bills(billNumber);
CREATE INDEX idx_payments_transactionId ON payments(transactionId);

-- Inventory
CREATE INDEX idx_ingredients_categoryId ON ingredients(categoryId);
CREATE INDEX idx_purchase_orders_orderNumber ON purchase_orders(orderNumber);
CREATE INDEX idx_purchase_order_items_purchaseOrderId ON purchase_order_items(purchaseOrderId);
CREATE INDEX idx_purchase_order_items_ingredientId ON purchase_order_items(ingredientId);
CREATE INDEX idx_stock_transactions_ingredientId ON stock_transactions(ingredientId);
CREATE INDEX idx_ingredient_batches_ingredientId ON ingredient_batches(ingredientId);
CREATE INDEX idx_ingredient_batches_purchaseOrderId ON ingredient_batches(purchaseOrderId);
```

#### Filter Indexes (Lọc theo điều kiện)

```sql
-- Status filters
CREATE INDEX idx_staff_isActive ON staff(isActive);
CREATE INDEX idx_categories_isActive ON categories(isActive);
CREATE INDEX idx_menu_items_isAvailable ON menu_items(isAvailable);
CREATE INDEX idx_restaurant_tables_status ON restaurant_tables(status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_bills_paymentStatus ON bills(paymentStatus);

-- Role filter
CREATE INDEX idx_staff_role ON staff(role);
```

#### Time-based Indexes (Truy vấn theo thời gian)

```sql
CREATE INDEX idx_refresh_tokens_expiresAt ON refresh_tokens(expiresAt);
CREATE INDEX idx_reservations_reservationDate ON reservations(reservationDate);
CREATE INDEX idx_orders_orderTime ON orders(orderTime);
CREATE INDEX idx_bills_createdAt ON bills(createdAt);
```

#### Location Indexes (Truy vấn theo vị trí)

```sql
CREATE INDEX idx_restaurant_tables_floor ON restaurant_tables(floor);
CREATE INDEX idx_reservations_tableId ON reservations(tableId);
```

#### Contact Indexes (Tìm kiếm khách hàng)

```sql
CREATE INDEX idx_reservations_phoneNumber ON reservations(phoneNumber);
```

### 5.4. Composite Indexes (Đề xuất thêm)

Để tối ưu các truy vấn phức tạp:

```sql
-- Tìm đặt bàn theo ngày và trạng thái
CREATE INDEX idx_reservations_date_status
ON reservations(reservationDate, status);

-- Tìm đơn hàng theo bàn và trạng thái
CREATE INDEX idx_orders_table_status
ON orders(tableId, status);

-- Báo cáo doanh thu theo ngày
CREATE INDEX idx_bills_date_status
ON bills(DATE(createdAt), paymentStatus);

-- Kitchen orders by priority and status
CREATE INDEX idx_kitchen_orders_priority_status
ON kitchen_orders(priority DESC, status);
```

### 5.5. Index Performance Tips

#### Khi nên sử dụng Index:

✅ Cột thường xuyên trong WHERE clause
✅ Cột trong JOIN conditions
✅ Cột trong ORDER BY
✅ Cột có tính chọn lọc cao (selectivity)
✅ Foreign key columns

#### Khi không nên sử dụng Index:

❌ Bảng nhỏ (< 1000 rows)
❌ Cột có nhiều giá trị NULL
❌ Cột ít được truy vấn
❌ Bảng có nhiều INSERT/UPDATE/DELETE

---

## 6. Các truy vấn thường dùng

### 6.1. Authentication Queries

#### Đăng nhập

```sql
-- Lấy thông tin tài khoản và nhân viên
SELECT
    a.accountId,
    a.username,
    a.email,
    a.isActive,
    s.staffId,
    s.fullName,
    s.role,
    s.isActive as staffIsActive
FROM accounts a
LEFT JOIN staff s ON a.accountId = s.accountId
WHERE a.email = $1 AND a.isActive = true;
```

#### Làm mới token

```sql
-- Kiểm tra refresh token
SELECT
    rt.*,
    a.isActive as accountIsActive
FROM refresh_tokens rt
INNER JOIN accounts a ON rt.accountId = a.accountId
WHERE rt.token = $1
    AND rt.isRevoked = false
    AND rt.expiresAt > NOW();
```

#### Thu hồi tokens cũ

```sql
-- Thu hồi tất cả tokens của user
UPDATE refresh_tokens
SET isRevoked = true, revokedAt = NOW()
WHERE accountId = $1 AND isRevoked = false;
```

---

### 6.2. Menu Queries

#### Lấy thực đơn đầy đủ

```sql
-- Thực đơn theo danh mục
SELECT
    c.categoryId,
    c.categoryName,
    c.description as categoryDescription,
    c.imageUrl as categoryImage,
    json_agg(
        json_build_object(
            'itemId', m.itemId,
            'itemCode', m.itemCode,
            'itemName', m.itemName,
            'price', m.price,
            'description', m.description,
            'imageUrl', m.imageUrl,
            'preparationTime', m.preparationTime,
            'spicyLevel', m.spicyLevel,
            'isVegetarian', m.isVegetarian,
            'calories', m.calories,
            'isAvailable', m.isAvailable
        ) ORDER BY m.displayOrder
    ) as items
FROM categories c
LEFT JOIN menu_items m ON c.categoryId = m.categoryId
    AND m.isActive = true
WHERE c.isActive = true
GROUP BY c.categoryId, c.categoryName, c.description, c.imageUrl
ORDER BY c.displayOrder;
```

#### Tìm món ăn

```sql
-- Tìm kiếm món theo tên hoặc mô tả
SELECT
    m.*,
    c.categoryName
FROM menu_items m
INNER JOIN categories c ON m.categoryId = c.categoryId
WHERE m.isActive = true
    AND m.isAvailable = true
    AND (
        m.itemName ILIKE '%' || $1 || '%'
        OR m.description ILIKE '%' || $1 || '%'
    )
ORDER BY m.itemName;
```

---

### 6.3. Table Management Queries

#### Lấy danh sách bàn có sẵn

```sql
-- Bàn trống theo sức chứa
SELECT *
FROM restaurant_tables
WHERE isActive = true
    AND status = 'available'
    AND capacity >= $1
ORDER BY capacity, floor, tableNumber;
```

#### Cập nhật trạng thái bàn

```sql
-- Đổi trạng thái bàn
UPDATE restaurant_tables
SET status = $1, updatedAt = NOW()
WHERE tableId = $2;
```

#### Thống kê bàn theo trạng thái

```sql
-- Đếm bàn theo trạng thái
SELECT
    status,
    COUNT(*) as count,
    SUM(capacity) as totalCapacity
FROM restaurant_tables
WHERE isActive = true
GROUP BY status;
```

---

### 6.4. Reservation Queries

#### Tạo đặt bàn mới

```sql
-- Insert reservation
INSERT INTO reservations (
    customerName,
    phoneNumber,
    email,
    tableId,
    reservationDate,
    reservationTime,
    duration,
    headCount,
    specialRequest,
    status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
RETURNING *;
```

#### Kiểm tra bàn có sẵn cho đặt chỗ

```sql
-- Tìm bàn trống trong khung giờ
WITH ReservationTimes AS (
    SELECT
        tableId,
        reservationDate,
        reservationTime,
        reservationTime + (duration || ' minutes')::interval as endTime
    FROM reservations
    WHERE reservationDate = $1
        AND status IN ('confirmed', 'seated')
)
SELECT t.*
FROM restaurant_tables t
LEFT JOIN ReservationTimes r ON t.tableId = r.tableId
    AND $2 < r.endTime
    AND ($2 + $3::interval) > r.reservationTime
WHERE t.isActive = true
    AND t.status IN ('available', 'reserved')
    AND t.capacity >= $4
    AND r.tableId IS NULL
ORDER BY t.capacity, t.tableNumber;
```

#### Danh sách đặt bàn theo ngày

```sql
-- Reservations by date
SELECT
    r.*,
    t.tableNumber,
    t.capacity,
    t.section
FROM reservations r
INNER JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.reservationDate = $1
ORDER BY r.reservationTime, r.tableId;
```

#### Cập nhật trạng thái đặt bàn

```sql
-- Xác nhận đặt bàn
UPDATE reservations
SET status = 'confirmed', updatedAt = NOW()
WHERE reservationId = $1;

-- Khách đã đến
UPDATE reservations
SET status = 'seated', updatedAt = NOW()
WHERE reservationId = $1;
```

---

### 6.5. Order Management Queries

#### Tạo đơn hàng mới

```sql
-- Insert order
INSERT INTO orders (
    tableId,
    staffId,
    reservationId,
    customerName,
    customerPhone,
    headCount,
    status,
    notes
) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
RETURNING *;

-- Insert order items
INSERT INTO order_items (
    orderId,
    itemId,
    quantity,
    unitPrice,
    subtotal,
    specialRequest
) VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
```

#### Lấy chi tiết đơn hàng

```sql
-- Order details with items
SELECT
    o.*,
    t.tableNumber,
    s.fullName as waiterName,
    json_agg(
        json_build_object(
            'orderItemId', oi.orderItemId,
            'itemName', m.itemName,
            'quantity', oi.quantity,
            'unitPrice', oi.unitPrice,
            'subtotal', oi.subtotal,
            'specialRequest', oi.specialRequest,
            'status', oi.status
        )
    ) as items
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN menu_items m ON oi.itemId = m.itemId
WHERE o.orderId = $1
GROUP BY o.orderId, t.tableNumber, s.fullName;
```

#### Danh sách đơn hàng đang hoạt động

```sql
-- Active orders
SELECT
    o.orderId,
    o.orderNumber,
    o.orderTime,
    o.status,
    o.headCount,
    t.tableNumber,
    t.section,
    s.fullName as waiterName,
    COUNT(oi.orderItemId) as itemCount,
    SUM(oi.subtotal) as totalAmount
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.status NOT IN ('served', 'cancelled')
GROUP BY o.orderId, t.tableNumber, t.section, s.fullName
ORDER BY o.orderTime DESC;
```

---

### 6.6. Kitchen Management Queries

#### Tạo kitchen order

```sql
-- Create kitchen order
INSERT INTO kitchen_orders (
    orderId,
    priority,
    status,
    estimatedTime
) VALUES ($1, $2, 'pending', $3)
RETURNING *;
```

#### Danh sách đơn bếp

```sql
-- Kitchen orders queue
SELECT
    ko.*,
    o.orderNumber,
    o.orderTime,
    t.tableNumber,
    json_agg(
        json_build_object(
            'itemName', m.itemName,
            'quantity', oi.quantity,
            'specialRequest', oi.specialRequest
        )
    ) as items
FROM kitchen_orders ko
INNER JOIN orders o ON ko.orderId = o.orderId
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN menu_items m ON oi.itemId = m.itemId
WHERE ko.status NOT IN ('ready', 'served', 'cancelled')
GROUP BY ko.kitchenOrderId, o.orderNumber, o.orderTime, t.tableNumber
ORDER BY ko.priority DESC, ko.createdAt ASC;
```

#### Cập nhật trạng thái bếp

```sql
-- Start cooking
UPDATE kitchen_orders
SET status = 'preparing',
    staffId = $2,
    startedAt = NOW(),
    updatedAt = NOW()
WHERE kitchenOrderId = $1;

-- Mark as ready
UPDATE kitchen_orders
SET status = 'ready',
    completedAt = NOW(),
    updatedAt = NOW()
WHERE kitchenOrderId = $1;
```

---

### 6.7. Billing & Payment Queries

#### Tạo hóa đơn

```sql
-- Create bill from order
WITH OrderTotal AS (
    SELECT
        orderId,
        SUM(subtotal) as subtotal
    FROM order_items
    WHERE orderId = $1
    GROUP BY orderId
)
INSERT INTO bills (
    orderId,
    tableId,
    staffId,
    subtotal,
    taxRate,
    taxAmount,
    serviceCharge,
    totalAmount
)
SELECT
    o.orderId,
    o.tableId,
    $2 as staffId,
    ot.subtotal,
    $3 as taxRate,
    ROUND(ot.subtotal * $3 / 100, 2) as taxAmount,
    $4 as serviceCharge,
    ot.subtotal + ROUND(ot.subtotal * $3 / 100, 2) + $4 as totalAmount
FROM orders o
INNER JOIN OrderTotal ot ON o.orderId = ot.orderId
WHERE o.orderId = $1
RETURNING *;

-- Copy order items to bill items
INSERT INTO bill_items (
    billId,
    itemId,
    itemName,
    quantity,
    unitPrice,
    subtotal,
    discount,
    total
)
SELECT
    $1 as billId,
    oi.itemId,
    m.itemName,
    oi.quantity,
    oi.unitPrice,
    oi.subtotal,
    0 as discount,
    oi.subtotal as total
FROM order_items oi
INNER JOIN menu_items m ON oi.itemId = m.itemId
WHERE oi.orderId = $2;
```

#### Chi tiết hóa đơn

```sql
-- Bill details
SELECT
    b.*,
    t.tableNumber,
    s.fullName as cashierName,
    o.orderNumber,
    o.orderTime,
    json_agg(
        json_build_object(
            'itemName', bi.itemName,
            'quantity', bi.quantity,
            'unitPrice', bi.unitPrice,
            'subtotal', bi.subtotal,
            'discount', bi.discount,
            'total', bi.total
        )
    ) as items
FROM bills b
INNER JOIN orders o ON b.orderId = o.orderId
INNER JOIN restaurant_tables t ON b.tableId = t.tableId
LEFT JOIN staff s ON b.staffId = s.staffId
LEFT JOIN bill_items bi ON b.billId = bi.billId
WHERE b.billId = $1
GROUP BY b.billId, t.tableNumber, s.fullName, o.orderNumber, o.orderTime;
```

#### Thanh toán hóa đơn

```sql
-- Record payment
INSERT INTO payments (
    billId,
    paymentMethod,
    amount,
    transactionId,
    status
) VALUES ($1, $2, $3, $4, 'paid')
RETURNING *;

-- Update bill status
UPDATE bills
SET paymentStatus = 'paid',
    paidAmount = $2,
    changeAmount = $3,
    paymentMethod = $4,
    paidAt = NOW(),
    updatedAt = NOW()
WHERE billId = $1;
```

---

### 6.8. Reporting Queries

#### Doanh thu theo ngày

```sql
-- Daily revenue report
SELECT
    DATE(createdAt) as date,
    COUNT(*) as totalBills,
    SUM(subtotal) as subtotal,
    SUM(taxAmount) as taxAmount,
    SUM(discountAmount) as discountAmount,
    SUM(serviceCharge) as serviceCharge,
    SUM(totalAmount) as totalRevenue,
    SUM(CASE WHEN paymentStatus = 'paid' THEN totalAmount ELSE 0 END) as paidRevenue
FROM bills
WHERE createdAt >= $1 AND createdAt < $2
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

#### Món ăn bán chạy

```sql
-- Best selling items
SELECT
    m.itemId,
    m.itemCode,
    m.itemName,
    c.categoryName,
    COUNT(oi.orderItemId) as orderCount,
    SUM(oi.quantity) as totalQuantity,
    SUM(oi.subtotal) as totalRevenue
FROM order_items oi
INNER JOIN menu_items m ON oi.itemId = m.itemId
INNER JOIN categories c ON m.categoryId = c.categoryId
INNER JOIN orders o ON oi.orderId = o.orderId
WHERE o.orderTime >= $1 AND o.orderTime < $2
    AND o.status != 'cancelled'
GROUP BY m.itemId, m.itemCode, m.itemName, c.categoryName
ORDER BY totalQuantity DESC
LIMIT 20;
```

#### Hiệu suất nhân viên

```sql
-- Staff performance
SELECT
    s.staffId,
    s.fullName,
    s.role,
    COUNT(DISTINCT o.orderId) as ordersServed,
    COUNT(DISTINCT b.billId) as billsProcessed,
    SUM(b.totalAmount) as totalRevenue
FROM staff s
LEFT JOIN orders o ON s.staffId = o.staffId
LEFT JOIN bills b ON s.staffId = b.staffId
WHERE (o.orderTime >= $1 AND o.orderTime < $2)
    OR (b.createdAt >= $1 AND b.createdAt < $2)
GROUP BY s.staffId, s.fullName, s.role
ORDER BY totalRevenue DESC;
```

#### Tỷ lệ sử dụng bàn

```sql
-- Table occupancy rate
SELECT
    t.tableId,
    t.tableNumber,
    t.capacity,
    t.section,
    COUNT(o.orderId) as totalOrders,
    SUM(EXTRACT(EPOCH FROM (o.completedAt - o.orderTime))/3600) as totalHours,
    AVG(o.headCount) as avgHeadCount
FROM restaurant_tables t
LEFT JOIN orders o ON t.tableId = o.tableId
    AND o.orderTime >= $1
    AND o.orderTime < $2
    AND o.status IN ('served', 'completed')
GROUP BY t.tableId, t.tableNumber, t.capacity, t.section
ORDER BY totalOrders DESC;
```

---

## 7. Hệ thống đặt bàn

### 7.1. Tổng quan

Hệ thống đặt bàn trực tuyến cho phép khách hàng đặt bàn trước, quản lý lịch đặt bàn và tối ưu hóa việc sử dụng bàn.

### 7.2. Quy trình đặt bàn

#### 7.2.1. Flow đặt bàn

```
Khách hàng → Chọn ngày/giờ → Chọn số người
    ↓
Hệ thống kiểm tra bàn trống
    ↓
Hiển thị danh sách bàn phù hợp
    ↓
Khách chọn bàn → Nhập thông tin
    ↓
Tạo reservation (status: pending)
    ↓
Nhân viên xác nhận → status: confirmed
    ↓
Khách đến → status: seated → Tạo order
    ↓
Hoàn thành → status: completed
```

#### 7.2.2. Các trạng thái đặt bàn

| Status      | Mô tả                   | Hành động tiếp theo        |
| ----------- | ----------------------- | -------------------------- |
| `pending`   | Chờ xác nhận            | Nhân viên xác nhận/từ chối |
| `confirmed` | Đã xác nhận             | Đợi khách đến              |
| `seated`    | Khách đã đến, đang ngồi | Tạo order                  |
| `completed` | Hoàn thành              | Đóng reservation           |
| `cancelled` | Đã hủy                  | Giải phóng bàn             |
| `no_show`   | Khách không đến         | Giải phóng bàn             |

### 7.3. Cấu trúc bảng đặt bàn

#### reservations

Bảng chính lưu thông tin đặt bàn (đã mô tả ở section 3.4.1)

**Các trường quan trọng:**

-   `reservationCode`: Mã đặt bàn duy nhất (UUID)
-   `reservationDate` + `reservationTime`: Thời gian đặt
-   `duration`: Thời lượng dự kiến (mặc định 120 phút)
-   `headCount`: Số người
-   `depositAmount`: Tiền cọc (nếu có)
-   `specialRequest`: Yêu cầu đặc biệt (sinh nhật, anniversary, v.v.)

### 7.4. Quy tắc nghiệp vụ

#### 7.4.1. Kiểm tra bàn trống

```sql
-- Logic kiểm tra bàn có sẵn
-- Bàn được coi là trống nếu:
-- 1. Không có reservation nào trong khung giờ
-- 2. Hoặc reservation đã cancelled/no_show
-- 3. Hoặc thời gian không trùng lặp

WITH ActiveReservations AS (
    SELECT
        tableId,
        reservationTime,
        reservationTime + (duration || ' minutes')::interval as endTime
    FROM reservations
    WHERE reservationDate = $1
        AND status IN ('confirmed', 'seated')
)
SELECT t.*
FROM restaurant_tables t
WHERE NOT EXISTS (
    SELECT 1 FROM ActiveReservations ar
    WHERE ar.tableId = t.tableId
        AND $2 < ar.endTime
        AND ($2 + $3::interval) > ar.reservationTime
)
AND t.capacity >= $4
AND t.isActive = true;
```

#### 7.4.2. Quy tắc đặt bàn

1. **Thời gian trước tối thiểu**: 2 giờ
2. **Thời gian trước tối đa**: 30 ngày
3. **Thời lượng mặc định**: 120 phút
4. **Sức chứa**: Số người phải phù hợp với sức chứa bàn
5. **Buffer time**: 30 phút giữa các reservation (để dọn dẹp)

### 7.5. Hệ thống thông báo

#### 7.5.1. Loại thông báo

| Sự kiện          | Người nhận | Kênh      | Nội dung                        |
| ---------------- | ---------- | --------- | ------------------------------- |
| Đặt bàn mới      | Nhân viên  | Email/SMS | Có reservation mới cần xác nhận |
| Xác nhận đặt bàn | Khách hàng | Email/SMS | Đặt bàn đã được xác nhận        |
| Nhắc nhở         | Khách hàng | SMS       | Nhắc 2h trước giờ đặt           |
| Hủy bàn          | Cả hai     | Email/SMS | Thông báo hủy                   |

#### 7.5.2. Template thông báo

**Email xác nhận (Tiếng Việt):**

```
Kính chào {customerName},

Cảm ơn bạn đã đặt bàn tại nhà hàng chúng tôi!

Thông tin đặt bàn:
- Mã đặt bàn: {reservationCode}
- Ngày: {reservationDate}
- Giờ: {reservationTime}
- Số người: {headCount}
- Bàn số: {tableNumber}

Vui lòng đến trước giờ đặt 10 phút.

Liên hệ: {restaurantPhone}
```

**SMS nhắc nhở:**

```
[Restaurant] Nhac nho: Ban da dat ban vao {time} hom nay, {headCount} nguoi, ban {tableNumber}. Ma: {code}
```

### 7.6. Tích hợp với hệ thống đặt món

#### 7.6.1. Khi khách đến (Seated)

```sql
-- 1. Update reservation status
UPDATE reservations
SET status = 'seated', updatedAt = NOW()
WHERE reservationId = $1;

-- 2. Update table status
UPDATE restaurant_tables
SET status = 'occupied', updatedAt = NOW()
WHERE tableId = (
    SELECT tableId FROM reservations WHERE reservationId = $1
);

-- 3. Create order linked to reservation
INSERT INTO orders (
    tableId,
    reservationId,
    customerName,
    customerPhone,
    headCount,
    staffId,
    status
)
SELECT
    tableId,
    reservationId,
    customerName,
    phoneNumber,
    headCount,
    $2 as staffId,
    'pending' as status
FROM reservations
WHERE reservationId = $1
RETURNING *;
```

#### 7.6.2. Khi hoàn thành

```sql
-- 1. Complete order
UPDATE orders
SET status = 'served', completedAt = NOW()
WHERE reservationId = $1;

-- 2. Complete reservation
UPDATE reservations
SET status = 'completed', updatedAt = NOW()
WHERE reservationId = $1;

-- 3. Free up table
UPDATE restaurant_tables
SET status = 'available', updatedAt = NOW()
WHERE tableId = (
    SELECT tableId FROM reservations WHERE reservationId = $1
);
```

### 7.7. Báo cáo đặt bàn

#### 7.7.1. Thống kê theo trạng thái

```sql
SELECT
    status,
    COUNT(*) as count,
    SUM(headCount) as totalGuests
FROM reservations
WHERE reservationDate >= $1 AND reservationDate <= $2
GROUP BY status;
```

#### 7.7.2. Tỷ lệ no-show

```sql
SELECT
    DATE(reservationDate) as date,
    COUNT(*) as totalReservations,
    SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as noShows,
    ROUND(
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
        2
    ) as noShowRate
FROM reservations
WHERE reservationDate >= $1 AND reservationDate <= $2
GROUP BY DATE(reservationDate)
ORDER BY date DESC;
```

#### 7.7.3. Giờ cao điểm

```sql
SELECT
    EXTRACT(HOUR FROM reservationTime) as hour,
    COUNT(*) as reservationCount,
    AVG(headCount) as avgHeadCount
FROM reservations
WHERE reservationDate >= $1
    AND reservationDate <= $2
    AND status IN ('confirmed', 'seated', 'completed')
GROUP BY EXTRACT(HOUR FROM reservationTime)
ORDER BY hour;
```

### 7.8. Tối ưu hóa

#### 7.8.1. Indexes cho reservation

```sql
-- Already created in schema
CREATE INDEX idx_reservations_reservationDate ON reservations(reservationDate);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_phoneNumber ON reservations(phoneNumber);
CREATE INDEX idx_reservations_tableId ON reservations(tableId);

-- Additional composite index
CREATE INDEX idx_reservations_date_time_status
ON reservations(reservationDate, reservationTime, status);
```

#### 7.8.2. Partitioning (Đề xuất cho database lớn)

```sql
-- Partition reservations by date (monthly)
CREATE TABLE reservations_template (LIKE reservations INCLUDING ALL);

CREATE TABLE reservations_2024_01
PARTITION OF reservations_template
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Repeat for other months
```

---

## 8. Kết luận

### 8.1. Tóm tắt

Tài liệu này cung cấp cái nhìn toàn diện về cơ sở dữ liệu hệ thống quản lý nhà hàng cho **dự án tốt nghiệp**, bao gồm:

✅ **Các chức năng đã triển khai:**

1. **Hệ thống xác thực** - Đăng nhập, phân quyền, JWT tokens
2. **Quản lý nhân viên** - Thông tin nhân viên, vai trò, lương
3. **Quản lý thực đơn** - Danh mục món ăn, giá cả, hình ảnh
4. **Quản lý bàn ăn** - Sơ đồ mặt bằng, trạng thái bàn, QR code
5. **Hệ thống đặt bàn** - Đặt bàn trực tuyến, xác nhận tự động
6. **Quản lý đơn hàng** - Tạo đơn, theo dõi trạng thái
7. **Kitchen Display System (KDS)** - Màn hình bếp thời gian thực
8. **Thanh toán & Hóa đơn** - Nhiều phương thức thanh toán

### 8.2. Thống kê Cơ sở dữ liệu

| Thông số         | Giá trị |
| ---------------- | ------- |
| **Tổng số bảng** | 15      |
| **Enums**        | 6       |
| **Foreign Keys** | 18      |
| **Indexes**      | 30+     |

### 8.3. Tổng quan các Module

| STT | Module            | Số bảng | Trạng thái    | Mức độ hoàn thiện |
| --- | ----------------- | ------- | ------------- | ----------------- |
| 1   | Authentication    | 2       | ✅ Hoàn thành | 100%              |
| 2   | Staff Management  | 1       | ✅ Hoàn thành | 100%              |
| 3   | Menu Management   | 2       | ✅ Hoàn thành | 100%              |
| 4   | Table Management  | 1       | ✅ Hoàn thành | 100%              |
| 5   | Reservation       | 1       | ✅ Hoàn thành | 100%              |
| 6   | Order Management  | 2       | ✅ Hoàn thành | 100%              |
| 7   | Kitchen           | 1       | ✅ Hoàn thành | 100%              |
| 8   | Billing & Payment | 3       | ✅ Hoàn thành | 100%              |

### 8.4. Nguyên tắc thiết kế Database

#### ✅ Database Design Principles

-   **Chuẩn hóa**: Tuân thủ chuẩn Third Normal Form (3NF)
-   **Foreign Keys**: Sử dụng đúng cascade rules (CASCADE, RESTRICT, SET NULL)
-   **Indexes**: Đặt index trên các cột thường xuyên query
-   **ENUMs**: Sử dụng cho các giá trị cố định, dễ quản lý
-   **UUID**: Dùng cho mã đơn hàng, hóa đơn để tránh conflict
-   **Timestamps**: Luôn có `createdAt` và `updatedAt`
-   **Soft Delete**: Dùng `isActive` thay vì xóa hẳn dữ liệu quan trọng

#### 🔒 Bảo mật (Security)

-   **Password**: Hash bằng bcrypt (bcryptjs), không lưu plaintext
-   **Payment Info**: Chỉ lưu 4 số cuối của thẻ tín dụng
-   **JWT Tokens**: Sử dụng access token (15 phút) + refresh token (7 ngày)
-   **API Security**: Rate limiting, CORS, Helmet middleware
-   **SQL Injection**: Prisma ORM tự động prevent SQL injection

#### ⚡ Hiệu suất (Performance)

-   **Index Optimization**: Index trên foreign keys và search fields
-   **Connection Pooling**: Sử dụng Prisma connection pool
-   **Query Optimization**: Tránh N+1 queries, dùng `include` và `select` hợp lý
-   **Caching**: Cache menu, categories ít thay đổi
-   **Pagination**: Phân trang cho danh sách lớn (orders, bills)

### 8.5. Hướng dẫn Maintenance

#### 📅 Tác vụ định kỳ

| Tần suất      | Công việc                          |
| ------------- | ---------------------------------- |
| **Hàng ngày** | Backup database                    |
| **Hàng tuần** | Analyze slow queries               |
| **Hàng tháng** | Review indexes, Archive old data  |
| **Hàng quý**  | Performance tuning, vacuum DB      |

#### 📊 Giám sát (Monitoring)

-   Database size và tốc độ tăng trưởng
-   Slow query log (queries > 1s)
-   Connection pool status
-   Error logs
-   Backup status

### 8.6. Khả năng mở rộng tương lai

Các tính năng có thể bổ sung trong giai đoạn sau:

1. **📦 Quản lý tồn kho (Inventory)** - Nguyên liệu, nhà cung cấp, lô hàng
2. **👥 Customer Management** - Hồ sơ khách hàng, lịch sử đơn hàng
3. **🎁 Loyalty Program** - Tích điểm, ưu đãi, khuyến mãi
4. **📊 Advanced Analytics** - Dashboard phân tích doanh thu chi tiết
5. **🏢 Multi-branch** - Hỗ trợ nhiều chi nhánh
6. **📱 Mobile App API** - API cho ứng dụng mobile
7. **🔔 Real-time Notifications** - WebSocket notifications
8. **📄 E-Invoice** - Hóa đơn điện tử

### 8.7. Tài liệu tham khảo

-   **Prisma ORM**: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
-   **PostgreSQL 16**: [https://www.postgresql.org/docs/16/](https://www.postgresql.org/docs/16/)
-   **Database Design**: [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
-   **SQL Best Practices**: [Use The Index, Luke!](https://use-the-index-luke.com/)

---

## 9. Phụ lục

### 9.1. Vị trí file Prisma Schema

```
app/server/prisma/schema.prisma
```

### 9.2. Các Enum Types trong Database

Tất cả các enums được định nghĩa trong schema Prisma:

```prisma
enum Role {
  admin
  manager
  waiter
  chef
  cashier
}

enum TableStatus {
  available
  occupied
  reserved
  maintenance
}

enum OrderStatus {
  pending
  confirmed
  preparing
  ready
  served
  cancelled
}

enum PaymentStatus {
  pending
  paid
  refunded
  cancelled
}

enum PaymentMethod {
  cash
  card
  momo
  bank_transfer
}

enum ReservationStatus {
  pending
  confirmed
  seated
  completed
  cancelled
  no_show
}
```

### 9.3. Lệnh Prisma Migration

Các lệnh thường dùng để quản lý database schema:

```bash
# 1. Generate Prisma Client (sau khi sửa schema)
pnpm prisma:generate

# 2. Xem trạng thái migrations
pnpm prisma migrate status

# 3. Tạo migration mới (development)
pnpm prisma migrate dev --name ten_migration

# 4. Deploy migration (production)
pnpm prisma migrate deploy

# 5. Reset database (⚠️ CHỈ dùng trong Development)
pnpm prisma migrate reset

# 6. Mở Prisma Studio (GUI để xem dữ liệu)
pnpm prisma studio

# 7. Seed dữ liệu mẫu
pnpm prisma:seed
```

### 9.4. Backup & Restore Database

**Backup database (PostgreSQL với Docker):**

```bash
# Backup đơn giản
docker exec postgres pg_dump -U postgres restaurant_db > backup.sql

# Backup nén (tiết kiệm dung lượng)
docker exec postgres pg_dump -U postgres restaurant_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup với custom format (nhanh hơn cho restore)
docker exec postgres pg_dump -U postgres -Fc restaurant_db > backup.dump
```

**Restore database:**

```bash
# Restore từ file .sql
docker exec -i postgres psql -U postgres restaurant_db < backup.sql

# Restore từ file nén
zcat backup.sql.gz | docker exec -i postgres psql -U postgres restaurant_db

# Restore từ custom format
docker exec postgres pg_restore -U postgres -d restaurant_db backup.dump
```

### 9.5. Các truy vấn SQL hữu ích

#### Kiểm tra kích thước database

```sql
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;
```

#### Kiểm tra kích thước các bảng

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Kiểm tra missing indexes

```sql
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND n_distinct > 100
    AND correlation < 0.1
ORDER BY abs(correlation) DESC;
```

#### Queries chậm nhất

```sql
SELECT
    mean_exec_time,
    calls,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 9.6. Connection String Format

Format chuẩn cho PostgreSQL:

```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

**Ví dụ:**

```
postgresql://postgres:password@localhost:5432/restaurant_db?schema=public
```

### 9.7. Environment Variables (.env)

File cấu hình môi trường cho dự án:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/restaurant_db?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CLIENT_URL=http://localhost:3000

# Optional: Email (nếu có tính năng gửi email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 9.8. ERD Diagram

Xem sơ đồ ERD đầy đủ tại:
- **File Mermaid**: `docs/ERD.mmd`
- **Hình ảnh**: `docs/diagrams/`

---

## 📝 Lịch sử Cập nhật

| Phiên bản | Ngày       | Thay đổi                                         |
| --------- | ---------- | ------------------------------------------------ |
| 1.0       | 2024-10-19 | Phiên bản khởi tạo                               |
| 2.0       | 2025-11-15 | Đơn giản hóa cho dự án tốt nghiệp                |
|           |            | - Loại bỏ Inventory Management                  |
|           |            | - Tập trung 8 module cốt lõi (15 bảng)          |
|           |            | - Cải thiện tài liệu cho sinh viên              |
|           |            | - Thêm phần hướng dẫn chi tiết hơn              |

---

**📅 Ngày cập nhật**: 15/11/2025  
**📌 Phiên bản**: 2.0 - Simplified for Graduation Project  
**👨‍💻 Tác giả**: Restaurant Management Team  
**✅ Trạng thái**: Hoàn thành - Dành cho Dự án Tốt nghiệp
