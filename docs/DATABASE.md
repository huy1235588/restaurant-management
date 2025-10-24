# 📊 Tài liệu Cơ sở Dữ liệu - Hệ thống Quản lý Nhà hàng

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
    -   [3.8 Inventory Management](#38-inventory-management)
-   [4. Mối quan hệ giữa các bảng](#4-mối-quan-hệ-giữa-các-bảng)
-   [5. Chiến lược đánh chỉ mục](#5-chiến-lược-đánh-chỉ-mục)
-   [6. Các truy vấn thường dùng](#6-các-truy-vấn-thường-dùng)
-   [7. Hệ thống đặt bàn](#7-hệ-thống-đặt-bàn)
-   [8. Quản lý tồn kho](#8-quản-lý-tồn-kho)
-   [9. Kết luận](#9-kết-luận)
-   [10. Phụ lục](#10-phụ-lục)
-   [11. Lịch sử Thay đổi](#11-lịch-sử-thay-đổi)

---

## 1. Tổng quan

### 1.1. Giới thiệu

Cơ sở dữ liệu hệ thống quản lý nhà hàng được thiết kế để hỗ trợ toàn bộ hoạt động của nhà hàng, bao gồm:

-   Quản lý nhân viên và phân quyền
-   Quản lý thực đơn và danh mục
-   Quản lý bàn và đặt bàn
-   Quản lý đơn hàng và bếp
-   Quản lý thanh toán và hóa đơn
-   Hệ thống đặt bàn trực tuyến
-   **Quản lý tồn kho và nguyên liệu** 🆕

### 1.2. Công nghệ

-   **Database**: PostgreSQL 16
-   **ORM**: Prisma
-   **Language**: TypeScript

### 1.3. Cấu trúc tổng thể

Cơ sở dữ liệu được chia thành các module chính:

| Module               | Bảng chính                                                                   | Mô tả               |
| -------------------- | ---------------------------------------------------------------------------- | ------------------- |
| **Authentication**   | accounts, refresh_tokens                                                     | Xác thực và bảo mật |
| **Staff Management** | staff                                                                        | Quản lý nhân viên   |
| **Menu Management**  | categories, menu_items, recipes                                              | Quản lý thực đơn    |
| **Table Management** | restaurant_tables                                                            | Quản lý bàn ăn      |
| **Reservation**      | reservations                                                                 | Đặt bàn trực tuyến  |
| **Order Management** | orders, order_items                                                          | Quản lý đơn hàng    |
| **Kitchen**          | kitchen_orders                                                               | Quản lý bếp         |
| **Billing**          | bills, bill_items, payments                                                  | Thanh toán          |
| **Inventory** 🆕     | ingredients, suppliers, purchase_orders, stock_transactions, batches, alerts | Quản lý tồn kho     |

---

## 2. Sơ đồ ERD

### 2.1. Sơ đồ tổng thể (Mermaid)

```mermaid
erDiagram
    %% Authentication & User Management
    Account ||--o{ RefreshToken : "has"
    Account ||--o| Staff : "has"

    %% Menu Management
    Category ||--o{ MenuItem : "contains"

    %% Table & Reservation
    RestaurantTable ||--o{ Reservation : "has"
    RestaurantTable ||--o{ Order : "serves"
    RestaurantTable ||--o{ Bill : "generates"

    %% Reservation
    Reservation ||--o{ Order : "creates"

    %% Order Management
    Order ||--o{ OrderItem : "contains"
    Order ||--o{ KitchenOrder : "sends_to"
    Order ||--o| Bill : "generates"
    Staff ||--o{ Order : "takes"

    %% Order Items
    MenuItem ||--o{ OrderItem : "ordered_as"

    %% Kitchen
    Staff ||--o{ KitchenOrder : "prepares"

    %% Billing
    Bill ||--o{ BillItem : "contains"
    Bill ||--o{ Payment : "receives"
    MenuItem ||--o{ BillItem : "billed_as"
    Staff ||--o{ Bill : "processes"

    %% Core Tables
    Account {
        int accountId PK
        string username UK
        string email UK
        string phoneNumber UK
        string password
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
        datetime revokedAt
    }

    Staff {
        int staffId PK
        int accountId FK
        string fullName
        string address
        date dateOfBirth
        date hireDate
        decimal salary
        enum role
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
        int preparationTime
        int spicyLevel
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
        string section
        enum status
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
        int duration
        int headCount
        string specialRequest
        decimal depositAmount
        enum status
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
        enum status
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
        int staffId FK
        int priority
        enum status
        datetime startedAt
        datetime completedAt
        int estimatedTime
        string notes
        datetime createdAt
        datetime updatedAt
    }

    Bill {
        int billId PK
        string billNumber UK
        int orderId FK
        int tableId FK
        int staffId FK
        decimal subtotal
        decimal taxAmount
        decimal taxRate
        decimal discountAmount
        decimal serviceCharge
        decimal totalAmount
        decimal paidAmount
        decimal changeAmount
        enum paymentStatus
        enum paymentMethod
        string notes
        datetime createdAt
        datetime paidAt
        datetime updatedAt
    }

    BillItem {
        int billItemId PK
        int billId FK
        int itemId FK
        string itemName
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
        string cardNumber
        string cardHolderName
        enum status
        string notes
        datetime paymentDate
        datetime createdAt
    }
```

### 2.2. Các Enum Types

#### Role (Vai trò nhân viên)

```typescript
enum Role {
  admin      // Quản trị viên
  manager    // Quản lý
  waiter     // Phục vụ
  chef       // Đầu bếp
  bartender  // Pha chế
  cashier    // Thu ngân
}
```

#### TableStatus (Trạng thái bàn)

```typescript
enum TableStatus {
  available    // Có sẵn
  occupied     // Đang sử dụng
  reserved     // Đã đặt
  maintenance  // Bảo trì
}
```

#### OrderStatus (Trạng thái đơn hàng)

```typescript
enum OrderStatus {
  pending     // Chờ xác nhận
  confirmed   // Đã xác nhận
  preparing   // Đang chuẩn bị
  ready       // Sẵn sàng
  served      // Đã phục vụ
  cancelled   // Đã hủy
}
```

#### PaymentStatus (Trạng thái thanh toán)

```typescript
enum PaymentStatus {
  pending     // Chờ thanh toán
  paid        // Đã thanh toán
  refunded    // Đã hoàn tiền
  cancelled   // Đã hủy
}
```

#### PaymentMethod (Phương thức thanh toán)

```typescript
enum PaymentMethod {
  cash           // Tiền mặt
  card           // Thẻ ngân hàng
  momo           // Ví MoMo
  bank_transfer  // Chuyển khoản
}
```

#### ReservationStatus (Trạng thái đặt bàn)

```typescript
enum ReservationStatus {
  pending     // Chờ xác nhận
  confirmed   // Đã xác nhận
  seated      // Đã đến ngồi
  completed   // Hoàn thành
  cancelled   // Đã hủy
  no_show     // Không đến
}
```

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
-   1:N với `purchase_orders` (staff)
-   1:N với `stock_transactions` (staff)
-   1:N với `stock_alerts` (resolver)

---

### 3.8. Inventory Management

#### 3.8.1. ingredient_categories (Danh mục nguyên liệu)

Phân loại các nguyên liệu đầu bếp.

| Trường       | Kiểu         | Ràng buộc        | Mô tả          |
| ------------ | ------------ | ---------------- | -------------- |
| categoryId   | INTEGER      | PK, Auto         | ID danh mục    |
| categoryName | VARCHAR(100) | UNIQUE, NOT NULL | Tên danh mục   |
| description  | TEXT         | NULL             | Mô tả          |
| isActive     | BOOLEAN      | DEFAULT true     | Đang hoạt động |
| createdAt    | TIMESTAMP    | DEFAULT now()    | Ngày tạo       |
| updatedAt    | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật  |

**Indexes:**

-   `idx_ingredient_categories_isActive` trên `isActive`

**Quan hệ:**

-   1:N với `ingredients`

---

#### 3.8.2. ingredients (Nguyên liệu)

Quản lý nguyên liệu sử dụng trong nhà bếp.

| Trường         | Kiểu          | Ràng buộc        | Mô tả                      |
| -------------- | ------------- | ---------------- | -------------------------- |
| ingredientId   | INTEGER       | PK, Auto         | ID nguyên liệu             |
| ingredientCode | VARCHAR(20)   | UNIQUE, NOT NULL | Mã nguyên liệu             |
| ingredientName | VARCHAR(100)  | NOT NULL         | Tên nguyên liệu            |
| unit           | VARCHAR(20)   | NOT NULL         | Đơn vị (kg, g, lít, ml...) |
| categoryId     | INTEGER       | FK, NULL         | ID danh mục                |
| minimumStock   | DECIMAL(10,2) | DEFAULT 0        | Mức tồn kho tối thiểu      |
| currentStock   | DECIMAL(10,2) | DEFAULT 0        | Tồn kho hiện tại           |
| unitCost       | DECIMAL(10,2) | NULL             | Giá vốn/đơn vị             |
| isActive       | BOOLEAN       | DEFAULT true     | Đang sử dụng               |
| createdAt      | TIMESTAMP     | DEFAULT now()    | Ngày tạo                   |
| updatedAt      | TIMESTAMP     | AUTO UPDATE      | Ngày cập nhật              |

**Indexes:**

-   `idx_ingredients_categoryId` trên `categoryId`
-   `idx_ingredients_isActive` trên `isActive`
-   `idx_ingredients_currentStock` trên `currentStock`

**Quan hệ:**

-   N:1 với `ingredient_categories` (SET NULL)
-   1:N với `recipes`
-   1:N với `stock_transactions`
-   1:N với `ingredient_batches`
-   1:N với `stock_alerts` (CASCADE DELETE)
-   1:N với `purchase_order_items`

---

#### 3.8.3. recipes (Công thức món ăn)

Mối quan hệ giữa món ăn và nguyên liệu cần thiết.

| Trường       | Kiểu          | Ràng buộc     | Mô tả                    |
| ------------ | ------------- | ------------- | ------------------------ |
| recipeId     | INTEGER       | PK, Auto      | ID công thức             |
| itemId       | INTEGER       | FK, NOT NULL  | ID món ăn                |
| ingredientId | INTEGER       | FK, NOT NULL  | ID nguyên liệu           |
| quantity     | DECIMAL(10,3) | NOT NULL      | Số lượng nguyên liệu cần |
| unit         | VARCHAR(20)   | NOT NULL      | Đơn vị                   |
| notes        | TEXT          | NULL          | Ghi chú                  |
| createdAt    | TIMESTAMP     | DEFAULT now() | Ngày tạo                 |
| updatedAt    | TIMESTAMP     | AUTO UPDATE   | Ngày cập nhật            |

**Unique Constraint:**

-   `UNIQUE(itemId, ingredientId)`

**Indexes:**

-   `idx_recipes_itemId` trên `itemId`
-   `idx_recipes_ingredientId` trên `ingredientId`

**Quan hệ:**

-   N:1 với `menu_items` (CASCADE DELETE)
-   N:1 với `ingredients` (RESTRICT DELETE)

---

#### 3.8.4. suppliers (Nhà cung cấp)

Thông tin nhà cung cấp nguyên liệu.

| Trường        | Kiểu         | Ràng buộc        | Mô tả            |
| ------------- | ------------ | ---------------- | ---------------- |
| supplierId    | INTEGER      | PK, Auto         | ID nhà cung cấp  |
| supplierCode  | VARCHAR(20)  | UNIQUE, NOT NULL | Mã nhà cung cấp  |
| supplierName  | VARCHAR(255) | NOT NULL         | Tên nhà cung cấp |
| contactPerson | VARCHAR(255) | NULL             | Người liên hệ    |
| phoneNumber   | VARCHAR(20)  | NULL             | Số điện thoại    |
| email         | VARCHAR(255) | NULL             | Email            |
| address       | TEXT         | NULL             | Địa chỉ          |
| taxCode       | VARCHAR(50)  | NULL             | Mã số thuế       |
| paymentTerms  | VARCHAR(100) | NULL             | Điều khoản TT    |
| isActive      | BOOLEAN      | DEFAULT true     | Đang hoạt động   |
| createdAt     | TIMESTAMP    | DEFAULT now()    | Ngày tạo         |
| updatedAt     | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật    |

**Indexes:**

-   `idx_suppliers_isActive` trên `isActive`

**Quan hệ:**

-   1:N với `purchase_orders`

---

#### 3.8.5. purchase_orders (Đơn đặt hàng)

Quản lý đơn đặt hàng từ nhà cung cấp.

| Trường          | Kiểu                      | Ràng buộc       | Mô tả                    |
| --------------- | ------------------------- | --------------- | ------------------------ |
| purchaseOrderId | INTEGER                   | PK, Auto        | ID đơn đặt hàng          |
| orderNumber     | VARCHAR(50)               | UNIQUE, UUID    | Mã đơn đặt hàng          |
| supplierId      | INTEGER                   | FK, NOT NULL    | ID nhà cung cấp          |
| staffId         | INTEGER                   | FK, NULL        | ID nhân viên (người tạo) |
| orderDate       | TIMESTAMP                 | DEFAULT now()   | Ngày đặt                 |
| expectedDate    | DATE                      | NULL            | Ngày dự kiến nhận        |
| receivedDate    | TIMESTAMP                 | NULL            | Ngày nhận thực tế        |
| status          | ENUM(PurchaseOrderStatus) | DEFAULT pending | Trạng thái               |
| subtotal        | DECIMAL(12,2)             | NOT NULL        | Tổng tiền hàng           |
| taxAmount       | DECIMAL(12,2)             | DEFAULT 0       | Tiền thuế                |
| totalAmount     | DECIMAL(12,2)             | NOT NULL        | Tổng cộng                |
| notes           | TEXT                      | NULL            | Ghi chú                  |
| createdAt       | TIMESTAMP                 | DEFAULT now()   | Ngày tạo                 |
| updatedAt       | TIMESTAMP                 | AUTO UPDATE     | Ngày cập nhật            |

**Enum Status:**

-   `pending`: Chờ đặt
-   `ordered`: Đã đặt
-   `received`: Đã nhận
-   `cancelled`: Đã hủy

**Indexes:**

-   `idx_purchase_orders_orderNumber` trên `orderNumber`
-   `idx_purchase_orders_supplierId` trên `supplierId`
-   `idx_purchase_orders_status` trên `status`
-   `idx_purchase_orders_orderDate` trên `orderDate`

**Quan hệ:**

-   N:1 với `suppliers` (RESTRICT DELETE)
-   N:1 với `staff` (SET NULL)
-   1:N với `purchase_order_items`
-   1:N với `ingredient_batches`

---

#### 3.8.6. purchase_order_items (Chi tiết đơn đặt hàng)

Chi tiết các mặt hàng trong đơn đặt hàng.

| Trường           | Kiểu          | Ràng buộc     | Mô tả            |
| ---------------- | ------------- | ------------- | ---------------- |
| itemId           | INTEGER       | PK, Auto      | ID chi tiết      |
| purchaseOrderId  | INTEGER       | FK, NOT NULL  | ID đơn đặt hàng  |
| ingredientId     | INTEGER       | FK, NOT NULL  | ID nguyên liệu   |
| quantity         | DECIMAL(10,2) | NOT NULL      | Số lượng đặt     |
| unit             | VARCHAR(20)   | NOT NULL      | Đơn vị           |
| unitPrice        | DECIMAL(10,2) | NOT NULL      | Đơn giá          |
| subtotal         | DECIMAL(10,2) | NOT NULL      | Thành tiền       |
| receivedQuantity | DECIMAL(10,2) | DEFAULT 0     | Số lượng đã nhận |
| createdAt        | TIMESTAMP     | DEFAULT now() | Ngày tạo         |

**Indexes:**

-   `idx_purchase_order_items_purchaseOrderId` trên `purchaseOrderId`
-   `idx_purchase_order_items_ingredientId` trên `ingredientId`

**Quan hệ:**

-   N:1 với `purchase_orders` (CASCADE DELETE)
-   N:1 với `ingredients` (RESTRICT DELETE)

---

#### 3.8.7. stock_transactions (Giao dịch tồn kho)

Ghi nhận tất cả các thay đổi về tồn kho.

| Trường          | Kiểu                  | Ràng buộc     | Mô tả                                               |
| --------------- | --------------------- | ------------- | --------------------------------------------------- |
| transactionId   | INTEGER               | PK, Auto      | ID giao dịch                                        |
| ingredientId    | INTEGER               | FK, NOT NULL  | ID nguyên liệu                                      |
| transactionType | ENUM(TransactionType) | NOT NULL      | Loại: in, out, adjustment, waste                    |
| quantity        | DECIMAL(10,2)         | NOT NULL      | Số lượng                                            |
| unit            | VARCHAR(20)           | NOT NULL      | Đơn vị                                              |
| referenceType   | VARCHAR(50)           | NULL          | Loại tham chiếu (purchase_order, order, adjustment) |
| referenceId     | INTEGER               | NULL          | ID tham chiếu                                       |
| staffId         | INTEGER               | FK, NULL      | ID nhân viên (người thực hiện)                      |
| notes           | TEXT                  | NULL          | Ghi chú                                             |
| transactionDate | TIMESTAMP             | DEFAULT now() | Ngày/giờ giao dịch                                  |
| createdAt       | TIMESTAMP             | DEFAULT now() | Ngày tạo                                            |

**Indexes:**

-   `idx_stock_transactions_ingredientId` trên `ingredientId`
-   `idx_stock_transactions_transactionType` trên `transactionType`
-   `idx_stock_transactions_transactionDate` trên `transactionDate`
-   `idx_stock_transactions_reference` trên `(referenceType, referenceId)`

**Quan hệ:**

-   N:1 với `ingredients` (RESTRICT DELETE)
-   N:1 với `staff` (SET NULL)

---

#### 3.8.8. ingredient_batches (Lô hàng)

Theo dõi từng lô hàng, hạn sử dụng và số lượng còn lại.

| Trường            | Kiểu          | Ràng buộc     | Mô tả              |
| ----------------- | ------------- | ------------- | ------------------ |
| batchId           | INTEGER       | PK, Auto      | ID lô hàng         |
| ingredientId      | INTEGER       | FK, NOT NULL  | ID nguyên liệu     |
| purchaseOrderId   | INTEGER       | FK, NULL      | ID đơn đặt hàng    |
| batchNumber       | VARCHAR(50)   | NOT NULL      | Mã lô (batch code) |
| quantity          | DECIMAL(10,2) | NOT NULL      | Số lượng ban đầu   |
| remainingQuantity | DECIMAL(10,2) | NOT NULL      | Số lượng còn lại   |
| unit              | VARCHAR(20)   | NOT NULL      | Đơn vị             |
| unitCost          | DECIMAL(10,2) | NULL          | Giá vốn/đơn vị     |
| expiryDate        | DATE          | NULL          | Ngày hết hạn       |
| receivedDate      | DATE          | NOT NULL      | Ngày nhận          |
| createdAt         | TIMESTAMP     | DEFAULT now() | Ngày tạo           |
| updatedAt         | TIMESTAMP     | AUTO UPDATE   | Ngày cập nhật      |

**Indexes:**

-   `idx_ingredient_batches_ingredientId` trên `ingredientId`
-   `idx_ingredient_batches_purchaseOrderId` trên `purchaseOrderId`
-   `idx_ingredient_batches_expiryDate` trên `expiryDate`
-   `idx_ingredient_batches_remaining` trên `remainingQuantity` (WHERE remainingQuantity > 0)

**Quan hệ:**

-   N:1 với `ingredients` (RESTRICT DELETE)
-   N:1 với `purchase_orders` (SET NULL)

---

#### 3.8.9. stock_alerts (Cảnh báo tồn kho)

Theo dõi các cảnh báo về tồn kho thấp, hạn sử dụng sắp hết, v.v.

| Trường       | Kiểu                 | Ràng buộc     | Mô tả                                   |
| ------------ | -------------------- | ------------- | --------------------------------------- |
| alertId      | INTEGER              | PK, Auto      | ID cảnh báo                             |
| ingredientId | INTEGER              | FK, NOT NULL  | ID nguyên liệu                          |
| alertType    | ENUM(StockAlertType) | NOT NULL      | Loại: low_stock, expiring_soon, expired |
| message      | TEXT                 | NOT NULL      | Nội dung cảnh báo                       |
| isResolved   | BOOLEAN              | DEFAULT false | Đã xử lý                                |
| resolvedAt   | TIMESTAMP            | NULL          | Ngày xử lý                              |
| resolvedBy   | INTEGER              | FK, NULL      | ID nhân viên xử lý                      |
| createdAt    | TIMESTAMP            | DEFAULT now() | Ngày tạo                                |

**Indexes:**

-   `idx_stock_alerts_ingredientId` trên `ingredientId`
-   `idx_stock_alerts_alertType` trên `alertType`
-   `idx_stock_alerts_isResolved` trên `isResolved`

**Quan hệ:**

-   N:1 với `ingredients` (CASCADE DELETE)
-   N:1 với `staff` (SET NULL)

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

### 4.2. Ràng buộc tham chiếu (Foreign Keys) - CẬP NHẬT

| Bảng con                 | Khóa ngoại          | Bảng cha                  | Hành động xóa |
| ------------------------ | ------------------- | ------------------------- | ------------- |
| refresh_tokens           | accountId           | accounts                  | CASCADE       |
| staff                    | accountId           | accounts                  | CASCADE       |
| menu_items               | categoryId          | categories                | RESTRICT      |
| recipes                  | itemId              | menu_items                | CASCADE       |
| recipes                  | ingredientId        | ingredients               | RESTRICT      |
| reservations             | tableId             | restaurant_tables         | RESTRICT      |
| orders                   | tableId             | restaurant_tables         | RESTRICT      |
| orders                   | staffId             | staff                     | SET NULL      |
| orders                   | reservationId       | reservations              | SET NULL      |
| order_items              | orderId             | orders                    | CASCADE       |
| order_items              | itemId              | menu_items                | RESTRICT      |
| kitchen_orders           | orderId             | orders                    | CASCADE       |
| kitchen_orders           | staffId             | staff                     | SET NULL      |
| bills                    | orderId             | orders                    | RESTRICT      |
| bills                    | tableId             | restaurant_tables         | RESTRICT      |
| bills                    | staffId             | staff                     | SET NULL      |
| bill_items               | billId              | bills                     | CASCADE       |
| bill_items               | itemId              | menu_items                | RESTRICT      |
| payments                 | billId              | bills                     | CASCADE       |
| **ingredients**          | **categoryId**      | **ingredient_categories** | **SET NULL**  |
| **purchase_orders**      | **supplierId**      | **suppliers**             | **RESTRICT**  |
| **purchase_orders**      | **staffId**         | **staff**                 | **SET NULL**  |
| **purchase_order_items** | **purchaseOrderId** | **purchase_orders**       | **CASCADE**   |
| **purchase_order_items** | **ingredientId**    | **ingredients**           | **RESTRICT**  |
| **stock_transactions**   | **ingredientId**    | **ingredients**           | **RESTRICT**  |
| **stock_transactions**   | **staffId**         | **staff**                 | **SET NULL**  |
| **ingredient_batches**   | **ingredientId**    | **ingredients**           | **RESTRICT**  |
| **ingredient_batches**   | **purchaseOrderId** | **purchase_orders**       | **SET NULL**  |
| **stock_alerts**         | **ingredientId**    | **ingredients**           | **CASCADE**   |
| **stock_alerts**         | **resolvedBy**      | **staff**                 | **SET NULL**  |

**Giải thích:**

-   **CASCADE**: Xóa bản ghi con khi xóa bản ghi cha
-   **RESTRICT**: Không cho phép xóa bản ghi cha nếu còn bản ghi con
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

| Bảng                  | Trường                       | Mục đích                     |
| --------------------- | ---------------------------- | ---------------------------- |
| accounts              | username, email, phoneNumber | Đăng nhập và liên hệ         |
| refresh_tokens        | token                        | Bảo mật token                |
| categories            | categoryName                 | Không trùng tên danh mục     |
| ingredient_categories | categoryName                 | Không trùng tên danh mục     |
| menu_items            | itemCode                     | Mã món duy nhất              |
| restaurant_tables     | tableNumber, qrCode          | Số bàn và QR                 |
| reservations          | reservationCode              | Mã đặt bàn                   |
| orders                | orderNumber                  | Mã đơn hàng                  |
| bills                 | billNumber, orderId          | Mã hóa đơn                   |
| **ingredients**       | **ingredientCode**           | **Mã nguyên liệu duy nhất**  |
| **suppliers**         | **supplierCode**             | **Mã nhà cung cấp duy nhất** |
| **purchase_orders**   | **orderNumber**              | **Mã đơn đặt hàng duy nhất** |
| **recipes**           | **(itemId, ingredientId)**   | **Không trùng công thức**    |

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
CREATE INDEX idx_recipes_itemId ON recipes(itemId);
CREATE INDEX idx_recipes_ingredientId ON recipes(ingredientId);

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

-- Inventory filters
CREATE INDEX idx_ingredients_isActive ON ingredients(isActive);
CREATE INDEX idx_ingredients_currentStock ON ingredients(currentStock);
CREATE INDEX idx_ingredient_categories_isActive ON ingredient_categories(isActive);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplierId ON purchase_orders(supplierId);
CREATE INDEX idx_stock_transactions_transactionType ON stock_transactions(transactionType);
CREATE INDEX idx_stock_alerts_isResolved ON stock_alerts(isResolved);
CREATE INDEX idx_stock_alerts_alertType ON stock_alerts(alertType);
```

#### Time-based Indexes (Truy vấn theo thời gian)

```sql
CREATE INDEX idx_refresh_tokens_expiresAt ON refresh_tokens(expiresAt);
CREATE INDEX idx_reservations_reservationDate ON reservations(reservationDate);
CREATE INDEX idx_orders_orderTime ON orders(orderTime);
CREATE INDEX idx_bills_createdAt ON bills(createdAt);

-- Inventory time-based
CREATE INDEX idx_stock_transactions_transactionDate ON stock_transactions(transactionDate);
CREATE INDEX idx_purchase_orders_orderDate ON purchase_orders(orderDate);
CREATE INDEX idx_ingredient_batches_expiryDate ON ingredient_batches(expiryDate);
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

-- Inventory batch tracking
CREATE INDEX idx_ingredient_batches_remaining
ON ingredient_batches(remainingQuantity)
WHERE remainingQuantity > 0;

-- Stock transaction references
CREATE INDEX idx_stock_transactions_reference
ON stock_transactions(referenceType, referenceId);
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

## 8. Quản lý tồn kho

### 8.1. Tổng quan

⚠️ **LƯU Ý**: Hệ thống quản lý tồn kho chưa được triển khai trong schema hiện tại.

Section này mô tả thiết kế đề xuất cho tính năng quản lý tồn kho trong tương lai.

### 8.2. Thiết kế đề xuất

#### 8.2.1. Các bảng cần thêm

**ingredients (Nguyên liệu)**

```sql
CREATE TABLE ingredients (
    ingredientId SERIAL PRIMARY KEY,
    ingredientCode VARCHAR(20) UNIQUE NOT NULL,
    ingredientName VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- kg, g, lít, ml, etc.
    categoryId INT REFERENCES ingredient_categories(categoryId),
    minimumStock DECIMAL(10, 2) DEFAULT 0,
    currentStock DECIMAL(10, 2) DEFAULT 0,
    unitCost DECIMAL(10, 2),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

**ingredient_categories (Danh mục nguyên liệu)**

```sql
CREATE TABLE ingredient_categories (
    categoryId SERIAL PRIMARY KEY,
    categoryName VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

**recipes (Công thức món ăn)**

```sql
CREATE TABLE recipes (
    recipeId SERIAL PRIMARY KEY,
    itemId INT NOT NULL REFERENCES menu_items(itemId),
    ingredientId INT NOT NULL REFERENCES ingredients(ingredientId),
    quantity DECIMAL(10, 3) NOT NULL, -- Số lượng nguyên liệu cần
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(itemId, ingredientId)
);
```

**suppliers (Nhà cung cấp)**

```sql
CREATE TABLE suppliers (
    supplierId SERIAL PRIMARY KEY,
    supplierCode VARCHAR(20) UNIQUE NOT NULL,
    supplierName VARCHAR(255) NOT NULL,
    contactPerson VARCHAR(255),
    phoneNumber VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    taxCode VARCHAR(50),
    paymentTerms VARCHAR(100),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

**purchase_orders (Đơn đặt hàng)**

```sql
CREATE TABLE purchase_orders (
    purchaseOrderId SERIAL PRIMARY KEY,
    orderNumber VARCHAR(50) UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    supplierId INT NOT NULL REFERENCES suppliers(supplierId),
    staffId INT REFERENCES staff(staffId),
    orderDate TIMESTAMP DEFAULT NOW(),
    expectedDate DATE,
    receivedDate TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, ordered, received, cancelled
    subtotal DECIMAL(12, 2) NOT NULL,
    taxAmount DECIMAL(12, 2) DEFAULT 0,
    totalAmount DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

**purchase_order_items (Chi tiết đơn đặt hàng)**

```sql
CREATE TABLE purchase_order_items (
    itemId SERIAL PRIMARY KEY,
    purchaseOrderId INT NOT NULL REFERENCES purchase_orders(purchaseOrderId) ON DELETE CASCADE,
    ingredientId INT NOT NULL REFERENCES ingredients(ingredientId),
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unitPrice DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    receivedQuantity DECIMAL(10, 2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT NOW()
);
```

**stock_transactions (Giao dịch tồn kho)**

```sql
CREATE TABLE stock_transactions (
    transactionId SERIAL PRIMARY KEY,
    ingredientId INT NOT NULL REFERENCES ingredients(ingredientId),
    transactionType VARCHAR(20) NOT NULL, -- in, out, adjustment, waste
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    referenceType VARCHAR(50), -- purchase_order, order, adjustment
    referenceId INT,
    staffId INT REFERENCES staff(staffId),
    notes TEXT,
    transactionDate TIMESTAMP DEFAULT NOW(),
    createdAt TIMESTAMP DEFAULT NOW()
);
```

**ingredient_batches (Lô hàng và hạn sử dụng)**

```sql
CREATE TABLE ingredient_batches (
    batchId SERIAL PRIMARY KEY,
    ingredientId INT NOT NULL REFERENCES ingredients(ingredientId),
    purchaseOrderId INT REFERENCES purchase_orders(purchaseOrderId),
    batchNumber VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    remainingQuantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unitCost DECIMAL(10, 2),
    expiryDate DATE,
    receivedDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

**stock_alerts (Cảnh báo tồn kho)**

```sql
CREATE TABLE stock_alerts (
    alertId SERIAL PRIMARY KEY,
    ingredientId INT NOT NULL REFERENCES ingredients(ingredientId),
    alertType VARCHAR(20) NOT NULL, -- low_stock, expiring_soon, expired
    message TEXT NOT NULL,
    isResolved BOOLEAN DEFAULT false,
    resolvedAt TIMESTAMP,
    resolvedBy INT REFERENCES staff(staffId),
    createdAt TIMESTAMP DEFAULT NOW()
);
```

### 8.3. Quy trình nghiệp vụ

#### 8.3.1. Nhập kho (Stock In)

```
Tạo Purchase Order → Nhà cung cấp giao hàng
    ↓
Kiểm tra hàng → Cập nhật received_quantity
    ↓
Tạo ingredient_batch → Ghi stock_transaction (type: in)
    ↓
Cập nhật currentStock trong ingredients
    ↓
Kiểm tra minimum stock → Xóa alert (nếu có)
```

#### 8.3.2. Xuất kho tự động (Auto Deduction)

```
Order được tạo → Lấy recipes của các món
    ↓
Kiểm tra tồn kho đủ không?
    ↓
Trừ currentStock theo FIFO (First In First Out)
    ↓
Ghi stock_transaction (type: out, referenceType: order)
    ↓
Cập nhật remainingQuantity trong batches
    ↓
Kiểm tra minimumStock → Tạo alert nếu thấp
```

#### 8.3.3. Kiểm kê (Inventory Adjustment)

```
Đếm thực tế → So sánh với hệ thống
    ↓
Tạo stock_transaction (type: adjustment)
    ↓
Cập nhật currentStock
    ↓
Ghi nhận chênh lệch trong notes
```

### 8.4. Các truy vấn tồn kho

#### 8.4.1. Kiểm tra tồn kho

```sql
-- Current stock levels with alerts
SELECT
    i.ingredientId,
    i.ingredientCode,
    i.ingredientName,
    i.unit,
    i.currentStock,
    i.minimumStock,
    i.unitCost,
    i.currentStock * i.unitCost as totalValue,
    CASE
        WHEN i.currentStock <= i.minimumStock THEN 'LOW'
        WHEN i.currentStock <= i.minimumStock * 1.5 THEN 'WARNING'
        ELSE 'OK'
    END as stockStatus
FROM ingredients i
WHERE i.isActive = true
ORDER BY
    CASE
        WHEN i.currentStock <= i.minimumStock THEN 1
        WHEN i.currentStock <= i.minimumStock * 1.5 THEN 2
        ELSE 3
    END,
    i.ingredientName;
```

#### 8.4.2. Tính nguyên liệu cần cho món ăn

```sql
-- Calculate ingredients needed for an order
SELECT
    i.ingredientId,
    i.ingredientName,
    i.unit,
    SUM(r.quantity * oi.quantity) as quantityNeeded,
    i.currentStock,
    CASE
        WHEN i.currentStock >= SUM(r.quantity * oi.quantity) THEN 'OK'
        ELSE 'INSUFFICIENT'
    END as availability
FROM order_items oi
INNER JOIN recipes r ON oi.itemId = r.itemId
INNER JOIN ingredients i ON r.ingredientId = i.ingredientId
WHERE oi.orderId = $1
GROUP BY i.ingredientId, i.ingredientName, i.unit, i.currentStock;
```

#### 8.4.3. Hạn sử dụng sắp hết

```sql
-- Expiring ingredients (next 7 days)
SELECT
    ib.*,
    i.ingredientName,
    i.unit,
    ib.expiryDate,
    ib.expiryDate - CURRENT_DATE as daysLeft
FROM ingredient_batches ib
INNER JOIN ingredients i ON ib.ingredientId = i.ingredientId
WHERE ib.remainingQuantity > 0
    AND ib.expiryDate <= CURRENT_DATE + INTERVAL '7 days'
    AND ib.expiryDate >= CURRENT_DATE
ORDER BY ib.expiryDate;
```

#### 8.4.4. Báo cáo nhập xuất

```sql
-- Stock movement report
SELECT
    DATE(st.transactionDate) as date,
    st.transactionType,
    COUNT(*) as transactionCount,
    SUM(st.quantity * i.unitCost) as totalValue
FROM stock_transactions st
INNER JOIN ingredients i ON st.ingredientId = i.ingredientId
WHERE st.transactionDate >= $1 AND st.transactionDate < $2
GROUP BY DATE(st.transactionDate), st.transactionType
ORDER BY date DESC, st.transactionType;
```

#### 8.4.5. Giá trị tồn kho

```sql
-- Total inventory value
SELECT
    ic.categoryName,
    COUNT(i.ingredientId) as itemCount,
    SUM(i.currentStock * i.unitCost) as totalValue
FROM ingredients i
LEFT JOIN ingredient_categories ic ON i.categoryId = ic.categoryId
WHERE i.isActive = true
GROUP BY ic.categoryName
ORDER BY totalValue DESC;
```

### 8.5. Triggers tự động

#### 8.5.1. Tự động trừ kho khi đặt món

```sql
CREATE OR REPLACE FUNCTION auto_deduct_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert stock transactions for each ingredient in recipes
    INSERT INTO stock_transactions (
        ingredientId,
        transactionType,
        quantity,
        unit,
        referenceType,
        referenceId,
        transactionDate
    )
    SELECT
        r.ingredientId,
        'out',
        -(r.quantity * NEW.quantity),
        r.unit,
        'order',
        NEW.orderId,
        NOW()
    FROM recipes r
    WHERE r.itemId = NEW.itemId;

    -- Update current stock
    UPDATE ingredients i
    SET currentStock = currentStock - (r.quantity * NEW.quantity),
        updatedAt = NOW()
    FROM recipes r
    WHERE i.ingredientId = r.ingredientId
        AND r.itemId = NEW.itemId;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_deduct_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION auto_deduct_stock();
```

#### 8.5.2. Cảnh báo tồn kho thấp

```sql
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.currentStock <= NEW.minimumStock THEN
        INSERT INTO stock_alerts (
            ingredientId,
            alertType,
            message,
            createdAt
        ) VALUES (
            NEW.ingredientId,
            'low_stock',
            format('Stock for %s is low: %s %s (minimum: %s %s)',
                NEW.ingredientName,
                NEW.currentStock,
                NEW.unit,
                NEW.minimumStock,
                NEW.unit
            ),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE OF currentStock ON ingredients
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();
```

### 8.6. Indexes đề xuất cho inventory

```sql
-- Ingredients
CREATE INDEX idx_ingredients_categoryId ON ingredients(categoryId);
CREATE INDEX idx_ingredients_currentStock ON ingredients(currentStock);
CREATE INDEX idx_ingredients_isActive ON ingredients(isActive);

-- Recipes
CREATE INDEX idx_recipes_itemId ON recipes(itemId);
CREATE INDEX idx_recipes_ingredientId ON recipes(ingredientId);

-- Stock transactions
CREATE INDEX idx_stock_transactions_ingredientId ON stock_transactions(ingredientId);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(transactionType);
CREATE INDEX idx_stock_transactions_date ON stock_transactions(transactionDate);
CREATE INDEX idx_stock_transactions_reference
ON stock_transactions(referenceType, referenceId);

-- Batches
CREATE INDEX idx_ingredient_batches_ingredientId ON ingredient_batches(ingredientId);
CREATE INDEX idx_ingredient_batches_expiryDate ON ingredient_batches(expiryDate);
CREATE INDEX idx_ingredient_batches_remaining
ON ingredient_batches(remainingQuantity) WHERE remainingQuantity > 0;

-- Purchase orders
CREATE INDEX idx_purchase_orders_supplierId ON purchase_orders(supplierId);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_orderDate ON purchase_orders(orderDate);
```

---

## 9. Kết luận

### 9.1. Tóm tắt

Tài liệu này cung cấp cái nhìn toàn diện về cơ sở dữ liệu hệ thống quản lý nhà hàng, bao gồm:

✅ **Đã triển khai (Hiện hành):**

-   Hệ thống xác thực và phân quyền
-   Quản lý nhân viên
-   Quản lý thực đơn và danh mục
-   Quản lý bàn ăn
-   Hệ thống đặt bàn trực tuyến
-   Quản lý đơn hàng và bếp
-   Hệ thống thanh toán và hóa đơn
-   **Hệ thống quản lý tồn kho (Inventory Management)** 🆕
-   **Quản lý nguyên liệu và công thức** 🆕
-   **Theo dõi lô hàng và hạn sử dụng** 🆕
-   **Hệ thống đặt hàng nhà cung cấp** 🆕

### 9.2. Thống kê Cơ sở dữ liệu

| Loại             | Số lượng    |
| ---------------- | ----------- |
| **Bảng**         | 24          |
| **Enums**        | 9           |
| **Foreign Keys** | 31          |
| **Indexes**      | 50+         |
| **Triggers**     | 2 (Đề xuất) |

### 9.3. Module / Chức năng

| Module            | Bảng                                                                                      | Trạng thái        |
| ----------------- | ----------------------------------------------------------------------------------------- | ----------------- |
| Authentication    | accounts, refresh_tokens                                                                  | ✅ Hoàn thành     |
| Staff Management  | staff                                                                                     | ✅ Hoàn thành     |
| Menu Management   | categories, menu_items, recipes                                                           | ✅ Hoàn thành     |
| Table Management  | restaurant_tables                                                                         | ✅ Hoàn thành     |
| Reservation       | reservations                                                                              | ✅ Hoàn thành     |
| Order Management  | orders, order_items                                                                       | ✅ Hoàn thành     |
| Kitchen           | kitchen_orders                                                                            | ✅ Hoàn thành     |
| Billing & Payment | bills, bill_items, payments                                                               | ✅ Hoàn thành     |
| **Inventory**     | **ingredients, recipes, suppliers, purchase_orders, stock_transactions, batches, alerts** | **✅ Hoàn thành** |

### 9.4. Best Practices

#### Database Design

-   ✅ Sử dụng Foreign Keys đúng cách với cascade rules hợp lý
-   ✅ Indexes được đặt trên các cột thường xuyên query
-   ✅ Sử dụng ENUMs cho các giá trị cố định
-   ✅ UUID cho các mã code để tránh conflict
-   ✅ Timestamp tracking (createdAt, updatedAt)
-   ✅ FIFO (First In First Out) cho quản lý lô hàng
-   ✅ Soft delete pattern (isActive flags) cho dữ liệu quan trọng

#### Security

-   🔒 Không lưu password plaintext (sử dụng bcrypt)
-   🔒 Chỉ lưu 4 số cuối của thẻ tín dụng
-   🔒 Sử dụng refresh token với expiry time
-   🔒 Row-level security cho multi-tenancy (nếu cần)
-   🔒 Audit logging cho các thay đổi nhạy cảm

#### Performance

-   ⚡ Index optimization cho queries thường dùng
-   ⚡ Connection pooling
-   ⚡ Query optimization (avoid N+1)
-   ⚡ Caching cho data ít thay đổi (menu, categories)
-   ⚡ Pagination cho large datasets
-   ⚡ Partitioning cho historical data (optional)

### 9.5. Maintenance

#### Regular Tasks

-   📅 **Daily**: Backup database, Monitor stock alerts
-   📅 **Weekly**: Analyze slow queries, Check inventory discrepancies
-   📅 **Monthly**: Review and optimize indexes, Archive old transactions
-   📅 **Quarterly**: Archive old data, Performance tuning

#### Monitoring

-   📊 Query performance metrics
-   📊 Database size and growth
-   📊 Connection pool status
-   📊 Slow query log
-   📊 Stock alert frequency
-   📊 Ingredient expiry notifications

### 9.6. Đề xuất cải tiến tương lai

1. **Audit Logging**: Thêm bảng audit_logs để ghi lại tất cả các thay đổi quan trọng
2. **Multi-location Support**: Hỗ trợ quản lý nhiều chi nhánh nhà hàng
3. **Loyalty Program**: Thêm customer profiles và reward system
4. **Advanced Analytics**: Dashboard with real-time metrics
5. **Document Management**: Hóa đơn điện tử, giấy phép
6. **Barcode/QR Integration**: Quét mã vạch cho nguyên liệu
7. **API Rate Limiting**: Bảng tracking API usage
8. **Notifications Queue**: Async notification system

### 9.7. Tài liệu tham khảo

-   **Prisma Documentation**: https://www.prisma.io/docs/
-   **PostgreSQL Documentation**: https://www.postgresql.org/docs/
-   **Database Normalization**: https://en.wikipedia.org/wiki/Database_normalization
-   **SQL Performance Best Practices**: https://use-the-index-luke.com/
-   **Inventory Management Best Practices**: https://en.wikipedia.org/wiki/Inventory_management

---

## 10. Phụ lục

### 10.1. Prisma Schema Location

```
server/prisma/schema.prisma
```

### 10.2. Database Enums

Tất cả các enums được định nghĩa trong schema Prisma:

```prisma
enum Role { admin, manager, waiter, chef, bartender, cashier }
enum TableStatus { available, occupied, reserved, maintenance }
enum OrderStatus { pending, confirmed, preparing, ready, served, cancelled }
enum PaymentStatus { pending, paid, refunded, cancelled }
enum PaymentMethod { cash, card, momo, bank_transfer }
enum ReservationStatus { pending, confirmed, seated, completed, cancelled, no_show }
enum TransactionType { in, out, adjustment, waste }
enum PurchaseOrderStatus { pending, ordered, received, cancelled }
enum StockAlertType { low_stock, expiring_soon, expired }
```

### 10.3. Migration Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# View migrations status
pnpm prisma migrate status

# Create migration
pnpm prisma migrate dev --name migration_name

# Deploy migration (production)
pnpm prisma migrate deploy

# Reset database (⚠️ Development only)
pnpm prisma migrate reset

# Open Prisma Studio (GUI)
pnpm prisma studio
```

### 10.4. Backup & Restore

```bash
# Backup PostgreSQL database
docker exec postgres pg_dump -U postgres restaurant_db > backup.sql

# Restore from backup
docker exec -i postgres psql -U postgres restaurant_db < backup.sql

# Backup with compression
docker exec postgres pg_dump -U postgres restaurant_db | gzip > backup.sql.gz

# Restore from compressed backup
zcat backup.sql.gz | docker exec -i postgres psql -U postgres restaurant_db
```

### 10.5. Useful SQL Queries

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

### 10.6. Connection String Format

```
postgresql://user:password@host:port/database?schema=public
```

**Example:**

```
postgresql://postgres:password@localhost:5432/restaurant_db?schema=public
```

### 10.7. Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db?schema=public"

# API
API_PORT=3001
API_HOST=http://localhost:3001

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (nếu có)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 10.8. Database Diagram Mermaid (Simplified)

Xem file `ERD.mmd` trong thư mục `docs/` để xem sơ đồ ERD đầy đủ.

---

## 11. Lịch sử Thay đổi

| Phiên bản | Ngày       | Thay đổi                                      |
| --------- | ---------- | --------------------------------------------- |
| 1.0       | 2025-10-19 | Tài liệu khởi tạo                             |
| 1.1       | 2025-10-24 | Thêm Inventory Management System - Hoàn chỉnh |
|           |            | - Thêm 9 bảng cho quản lý tồn kho             |
|           |            | - Thêm 30+ indexes cho inventory              |
|           |            | - Cập nhật ERD và Foreign Keys                |
|           |            | - Thêm Enum types cho inventory               |
|           |            | - Cập nhật Best Practices                     |
|           |            | - Thêm Database Enums reference               |
|           |            | - Cập nhật Maintenance tasks                  |

---

**Ngày cập nhật**: 2025-10-24  
**Phiên bản**: 1.1  
**Tác giả**: Le Huy  
**Trạng thái**: ✅ Hoàn thành  
**Lần cuối chỉnh sửa**: Cập nhật và bổ sung Inventory Management System
