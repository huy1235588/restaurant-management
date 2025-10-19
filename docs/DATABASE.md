# 📊 Tài liệu Cơ sở dữ liệu - Hệ thống Quản lý Nhà hàng

> Tài liệu chi tiết về cấu trúc cơ sở dữ liệu PostgreSQL cho hệ thống quản lý nhà hàng

## 📑 Mục lục

- [Tổng quan](#-tổng-quan)
- [Sơ đồ ERD](#-sơ-đồ-erd)
- [Danh sách Bảng](#-danh-sách-bảng)
- [Chi tiết Bảng](#-chi-tiết-bảng)
  - [Xác thực & Quản lý Người dùng](#xác-thực--quản-lý-người-dùng)
  - [Quản lý Thực đơn](#quản-lý-thực-đơn)
  - [Quản lý Bàn](#quản-lý-bàn)
  - [Hệ thống Đặt bàn](#hệ-thống-đặt-bàn)
  - [Quản lý Đơn hàng](#quản-lý-đơn-hàng)
  - [Quản lý Bếp](#quản-lý-bếp)
  - [Thanh toán & Hóa đơn](#thanh-toán--hóa-đơn)
- [Các Truy vấn Thường dùng](#-các-truy-vấn-thường-dùng)
- [Chiến lược Đánh chỉ mục](#-chiến-lược-đánh-chỉ-mục)
- [Mối quan hệ giữa các Bảng](#-mối-quan-hệ-giữa-các-bảng)

---

## 🎯 Tổng quan

### Giới thiệu
Hệ thống quản lý nhà hàng sử dụng PostgreSQL làm cơ sở dữ liệu chính với Prisma ORM. Database được thiết kế để hỗ trợ:

- ✅ Quản lý nhân viên và phân quyền
- ✅ Quản lý thực đơn và danh mục món ăn
- ✅ Hệ thống đặt bàn trực tuyến
- ✅ Quản lý đơn hàng và bếp
- ✅ Thanh toán và hóa đơn
- ✅ Theo dõi lịch sử giao dịch

### Công nghệ
- **Database**: PostgreSQL 16+
- **ORM**: Prisma
- **Kiến trúc**: Relational Database với Foreign Keys
- **Đặc điểm**: ACID compliance, Transaction support

---

## 📐 Sơ đồ ERD

```mermaid
erDiagram
    %% Authentication & User Management
    ACCOUNTS ||--o| STAFF : has
    ACCOUNTS ||--o{ REFRESH_TOKENS : has
    
    %% Menu Management
    CATEGORIES ||--o{ MENU_ITEMS : contains
    
    %% Table & Reservation
    RESTAURANT_TABLES ||--o{ RESERVATIONS : books
    RESTAURANT_TABLES ||--o{ ORDERS : serves
    RESTAURANT_TABLES ||--o{ BILLS : generates
    
    %% Reservation & Orders
    RESERVATIONS ||--o{ ORDERS : creates
    
    %% Orders
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ KITCHEN_ORDERS : sends_to
    ORDERS ||--o| BILLS : generates
    STAFF ||--o{ ORDERS : takes
    MENU_ITEMS ||--o{ ORDER_ITEMS : ordered_in
    
    %% Kitchen
    STAFF ||--o{ KITCHEN_ORDERS : assigned_to
    
    %% Billing & Payment
    BILLS ||--o{ BILL_ITEMS : contains
    BILLS ||--o{ PAYMENTS : receives
    STAFF ||--o{ BILLS : processes
    MENU_ITEMS ||--o{ BILL_ITEMS : billed_in
    
    ACCOUNTS {
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
    
    REFRESH_TOKENS {
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
    
    STAFF {
        int staffId PK
        int accountId FK_UK
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
    
    CATEGORIES {
        int categoryId PK
        string categoryName UK
        string description
        int displayOrder
        boolean isActive
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }
    
    MENU_ITEMS {
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
    
    RESTAURANT_TABLES {
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
    
    RESERVATIONS {
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
    
    ORDERS {
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
    
    ORDER_ITEMS {
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
    
    KITCHEN_ORDERS {
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
    
    BILLS {
        int billId PK
        string billNumber UK
        int orderId FK_UK
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
    
    BILL_ITEMS {
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
    
    PAYMENTS {
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

---

## 📋 Danh sách Bảng

### Bảng Hiện có (13 bảng)

| STT | Tên Bảng | Mục đích | Số trường |
|-----|----------|----------|-----------|
| 1 | `accounts` | Quản lý tài khoản đăng nhập | 9 |
| 2 | `refresh_tokens` | Quản lý token làm mới | 9 |
| 3 | `staff` | Thông tin nhân viên | 11 |
| 4 | `categories` | Danh mục món ăn | 8 |
| 5 | `menu_items` | Món ăn trong thực đơn | 17 |
| 6 | `restaurant_tables` | Bàn trong nhà hàng | 12 |
| 7 | `reservations` | Đặt bàn trước | 15 |
| 8 | `orders` | Đơn hàng | 15 |
| 9 | `order_items` | Chi tiết đơn hàng | 9 |
| 10 | `kitchen_orders` | Đơn hàng cho bếp | 10 |
| 11 | `bills` | Hóa đơn thanh toán | 17 |
| 12 | `bill_items` | Chi tiết hóa đơn | 10 |
| 13 | `payments` | Giao dịch thanh toán | 11 |

### Các ENUM Types

| Tên ENUM | Giá trị | Mô tả |
|----------|---------|-------|
| `Role` | admin, manager, waiter, chef, bartender, cashier | Vai trò nhân viên |
| `TableStatus` | available, occupied, reserved, maintenance | Trạng thái bàn |
| `OrderStatus` | pending, confirmed, preparing, ready, served, cancelled | Trạng thái đơn hàng |
| `PaymentStatus` | pending, paid, refunded, cancelled | Trạng thái thanh toán |
| `PaymentMethod` | cash, card, momo, bank_transfer | Phương thức thanh toán |
| `ReservationStatus` | pending, confirmed, seated, completed, cancelled, no_show | Trạng thái đặt bàn |

---

## 📝 Chi tiết Bảng

### Xác thực & Quản lý Người dùng

#### 1. Bảng `accounts` (Tài khoản)

**Mô tả**: Lưu trữ thông tin tài khoản đăng nhập của người dùng hệ thống

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| accountId | INTEGER | PK, AUTO INCREMENT | ID tài khoản duy nhất |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email |
| phoneNumber | VARCHAR(20) | UNIQUE, NOT NULL | Số điện thoại |
| password | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa |
| isActive | BOOLEAN | DEFAULT true | Trạng thái kích hoạt |
| lastLogin | TIMESTAMP | NULLABLE | Lần đăng nhập cuối |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `accountId`
- UNIQUE INDEX: `username`, `email`, `phoneNumber`
- INDEX: `email`, `username`

**Relationships**:
- One-to-One với `staff` (1 account → 1 staff hoặc null)
- One-to-Many với `refresh_tokens` (1 account → nhiều tokens)

**Ví dụ dữ liệu**:
```sql
INSERT INTO accounts (username, email, phoneNumber, password, isActive)
VALUES ('admin01', 'admin@restaurant.com', '0901234567', '$2b$10$...hashed...', true);
```

---

#### 2. Bảng `refresh_tokens` (Token làm mới)

**Mô tả**: Quản lý refresh tokens cho JWT authentication

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| tokenId | INTEGER | PK, AUTO INCREMENT | ID token |
| accountId | INTEGER | FK, NOT NULL | ID tài khoản |
| token | TEXT | UNIQUE, NOT NULL | Token string |
| expiresAt | TIMESTAMP | NOT NULL | Thời gian hết hạn |
| deviceInfo | VARCHAR(500) | NULLABLE | Thông tin thiết bị |
| ipAddress | VARCHAR(45) | NULLABLE | Địa chỉ IP |
| isRevoked | BOOLEAN | DEFAULT false | Token đã bị thu hồi |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| revokedAt | TIMESTAMP | NULLABLE | Thời gian thu hồi |

**Indexes**:
- PRIMARY KEY: `tokenId`
- UNIQUE INDEX: `token`
- INDEX: `accountId`, `expiresAt`

**Foreign Keys**:
- `accountId` → `accounts(accountId)` ON DELETE CASCADE

---

#### 3. Bảng `staff` (Nhân viên)

**Mô tả**: Thông tin chi tiết về nhân viên nhà hàng

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| staffId | INTEGER | PK, AUTO INCREMENT | ID nhân viên |
| accountId | INTEGER | FK, UNIQUE, NOT NULL | ID tài khoản liên kết |
| fullName | VARCHAR(255) | NOT NULL | Họ tên đầy đủ |
| address | VARCHAR(500) | NULLABLE | Địa chỉ |
| dateOfBirth | DATE | NULLABLE | Ngày sinh |
| hireDate | DATE | DEFAULT now() | Ngày tuyển dụng |
| salary | DECIMAL(12,2) | NULLABLE | Lương |
| role | ENUM Role | NOT NULL | Vai trò (admin/manager/waiter/...) |
| isActive | BOOLEAN | DEFAULT true | Đang làm việc |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `staffId`
- UNIQUE INDEX: `accountId`
- INDEX: `role`, `isActive`

**Foreign Keys**:
- `accountId` → `accounts(accountId)` ON DELETE CASCADE

**Relationships**:
- Many-to-One với `accounts`
- One-to-Many với `orders`, `bills`, `kitchen_orders`

---

### Quản lý Thực đơn

#### 4. Bảng `categories` (Danh mục món ăn)

**Mô tả**: Phân loại món ăn theo danh mục

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| categoryId | INTEGER | PK, AUTO INCREMENT | ID danh mục |
| categoryName | VARCHAR(100) | UNIQUE, NOT NULL | Tên danh mục |
| description | VARCHAR(500) | NULLABLE | Mô tả |
| displayOrder | INTEGER | DEFAULT 0 | Thứ tự hiển thị |
| isActive | BOOLEAN | DEFAULT true | Đang hoạt động |
| imageUrl | VARCHAR(500) | NULLABLE | URL hình ảnh |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `categoryId`
- UNIQUE INDEX: `categoryName`
- INDEX: `isActive`

**Ví dụ dữ liệu**:
```sql
INSERT INTO categories (categoryName, description, displayOrder, isActive)
VALUES 
    ('Món Khai Vị', 'Các món ăn khai vị', 1, true),
    ('Món Chính', 'Món ăn chính', 2, true),
    ('Đồ Uống', 'Nước uống các loại', 3, true);
```

---

#### 5. Bảng `menu_items` (Món ăn)

**Mô tả**: Chi tiết thông tin món ăn trong thực đơn

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| itemId | INTEGER | PK, AUTO INCREMENT | ID món ăn |
| itemCode | VARCHAR(20) | UNIQUE, NOT NULL | Mã món ăn |
| itemName | VARCHAR(100) | NOT NULL | Tên món ăn |
| categoryId | INTEGER | FK, NOT NULL | ID danh mục |
| price | DECIMAL(10,2) | NOT NULL | Giá bán |
| cost | DECIMAL(10,2) | NULLABLE | Giá vốn |
| description | VARCHAR(1000) | NULLABLE | Mô tả món ăn |
| imageUrl | VARCHAR(500) | NULLABLE | URL hình ảnh |
| isAvailable | BOOLEAN | DEFAULT true | Còn hàng |
| isActive | BOOLEAN | DEFAULT true | Đang kinh doanh |
| preparationTime | INTEGER | NULLABLE | Thời gian chế biến (phút) |
| spicyLevel | INTEGER | DEFAULT 0 | Độ cay (0-5) |
| isVegetarian | BOOLEAN | DEFAULT false | Món chay |
| calories | INTEGER | NULLABLE | Lượng calo |
| displayOrder | INTEGER | DEFAULT 0 | Thứ tự hiển thị |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `itemId`
- UNIQUE INDEX: `itemCode`
- INDEX: `categoryId`, `isAvailable`, `isActive`

**Foreign Keys**:
- `categoryId` → `categories(categoryId)` ON DELETE RESTRICT

**Business Rules**:
- `spicyLevel`: 0 (không cay) đến 5 (rất cay)
- `preparationTime`: tính bằng phút
- `price` phải > 0
- `cost` nên ≤ `price`

---

### Quản lý Bàn

#### 6. Bảng `restaurant_tables` (Bàn ăn)

**Mô tả**: Quản lý bàn ăn trong nhà hàng

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| tableId | INTEGER | PK, AUTO INCREMENT | ID bàn |
| tableNumber | VARCHAR(20) | UNIQUE, NOT NULL | Số bàn |
| tableName | VARCHAR(50) | NULLABLE | Tên bàn |
| capacity | INTEGER | NOT NULL | Sức chứa tối đa |
| minCapacity | INTEGER | DEFAULT 1 | Sức chứa tối thiểu |
| floor | INTEGER | DEFAULT 1 | Tầng |
| section | VARCHAR(50) | NULLABLE | Khu vực (VIP, Garden, ...) |
| status | ENUM TableStatus | DEFAULT available | Trạng thái |
| qrCode | VARCHAR(255) | UNIQUE, NULLABLE | Mã QR code |
| isActive | BOOLEAN | DEFAULT true | Đang hoạt động |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `tableId`
- UNIQUE INDEX: `tableNumber`, `qrCode`
- INDEX: `status`, `floor`, `isActive`

**Enum Values**:
- `TableStatus`: available, occupied, reserved, maintenance

**Business Rules**:
- `capacity` > 0
- `minCapacity` ≤ `capacity`
- `floor` ≥ 1

---

### Hệ thống Đặt bàn

#### 7. Bảng `reservations` (Đặt bàn)

**Mô tả**: Quản lý đặt bàn trước của khách hàng

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| reservationId | INTEGER | PK, AUTO INCREMENT | ID đặt bàn |
| reservationCode | VARCHAR(50) | UNIQUE, DEFAULT uuid() | Mã đặt bàn |
| customerName | VARCHAR(255) | NOT NULL | Tên khách hàng |
| phoneNumber | VARCHAR(20) | NOT NULL | Số điện thoại |
| email | VARCHAR(255) | NULLABLE | Email |
| tableId | INTEGER | FK, NOT NULL | ID bàn |
| reservationDate | DATE | NOT NULL | Ngày đặt |
| reservationTime | TIME | NOT NULL | Giờ đặt |
| duration | INTEGER | DEFAULT 120 | Thời gian (phút) |
| headCount | INTEGER | NOT NULL | Số người |
| specialRequest | TEXT | NULLABLE | Yêu cầu đặc biệt |
| depositAmount | DECIMAL(10,2) | NULLABLE | Tiền đặt cọc |
| status | ENUM ReservationStatus | DEFAULT pending | Trạng thái |
| notes | TEXT | NULLABLE | Ghi chú |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `reservationId`
- UNIQUE INDEX: `reservationCode`
- INDEX: `reservationDate`, `status`, `phoneNumber`, `tableId`

**Foreign Keys**:
- `tableId` → `restaurant_tables(tableId)` ON DELETE RESTRICT

**Enum Values**:
- `ReservationStatus`: pending, confirmed, seated, completed, cancelled, no_show

**Business Rules**:
- `duration` mặc định 120 phút (2 giờ)
- `headCount` phải phù hợp với `capacity` của bàn
- `reservationDate` + `reservationTime` phải trong tương lai

**Workflow**:
1. **pending**: Khách đặt bàn, chờ xác nhận
2. **confirmed**: Nhà hàng xác nhận
3. **seated**: Khách đã đến và ngồi
4. **completed**: Hoàn thành
5. **cancelled**: Khách hủy
6. **no_show**: Khách không đến

---

### Quản lý Đơn hàng

#### 8. Bảng `orders` (Đơn hàng)

**Mô tả**: Quản lý đơn gọi món của khách hàng

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| orderId | INTEGER | PK, AUTO INCREMENT | ID đơn hàng |
| orderNumber | VARCHAR(50) | UNIQUE, DEFAULT uuid() | Số đơn hàng |
| tableId | INTEGER | FK, NOT NULL | ID bàn |
| staffId | INTEGER | FK, NULLABLE | ID nhân viên phục vụ |
| reservationId | INTEGER | FK, NULLABLE | ID đặt bàn (nếu có) |
| customerName | VARCHAR(255) | NULLABLE | Tên khách hàng |
| customerPhone | VARCHAR(20) | NULLABLE | SĐT khách hàng |
| headCount | INTEGER | DEFAULT 1 | Số người |
| status | ENUM OrderStatus | DEFAULT pending | Trạng thái |
| notes | TEXT | NULLABLE | Ghi chú |
| orderTime | TIMESTAMP | DEFAULT now() | Thời gian đặt |
| confirmedAt | TIMESTAMP | NULLABLE | Thời gian xác nhận |
| completedAt | TIMESTAMP | NULLABLE | Thời gian hoàn thành |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `orderId`
- UNIQUE INDEX: `orderNumber`
- INDEX: `tableId`, `status`, `orderTime`

**Foreign Keys**:
- `tableId` → `restaurant_tables(tableId)` ON DELETE RESTRICT
- `staffId` → `staff(staffId)` ON DELETE SET NULL
- `reservationId` → `reservations(reservationId)` ON DELETE SET NULL

**Enum Values**:
- `OrderStatus`: pending, confirmed, preparing, ready, served, cancelled

---

#### 9. Bảng `order_items` (Chi tiết đơn hàng)

**Mô tả**: Lưu chi tiết món ăn trong đơn hàng

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| orderItemId | INTEGER | PK, AUTO INCREMENT | ID chi tiết |
| orderId | INTEGER | FK, NOT NULL | ID đơn hàng |
| itemId | INTEGER | FK, NOT NULL | ID món ăn |
| quantity | INTEGER | NOT NULL | Số lượng |
| unitPrice | DECIMAL(10,2) | NOT NULL | Đơn giá |
| subtotal | DECIMAL(10,2) | NOT NULL | Thành tiền |
| specialRequest | VARCHAR(500) | NULLABLE | Yêu cầu đặc biệt |
| status | ENUM OrderStatus | DEFAULT pending | Trạng thái |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `orderItemId`
- INDEX: `orderId`, `itemId`, `status`

**Foreign Keys**:
- `orderId` → `orders(orderId)` ON DELETE CASCADE
- `itemId` → `menu_items(itemId)` ON DELETE RESTRICT

**Business Rules**:
- `quantity` > 0
- `subtotal` = `quantity` × `unitPrice`

---

### Quản lý Bếp

#### 10. Bảng `kitchen_orders` (Đơn bếp)

**Mô tả**: Quản lý đơn hàng gửi cho bếp

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| kitchenOrderId | INTEGER | PK, AUTO INCREMENT | ID đơn bếp |
| orderId | INTEGER | FK, NOT NULL | ID đơn hàng |
| staffId | INTEGER | FK, NULLABLE | ID đầu bếp |
| priority | INTEGER | DEFAULT 0 | Độ ưu tiên |
| status | ENUM OrderStatus | DEFAULT pending | Trạng thái |
| startedAt | TIMESTAMP | NULLABLE | Thời gian bắt đầu |
| completedAt | TIMESTAMP | NULLABLE | Thời gian hoàn thành |
| estimatedTime | INTEGER | NULLABLE | Thời gian ước tính (phút) |
| notes | TEXT | NULLABLE | Ghi chú |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `kitchenOrderId`
- INDEX: `orderId`, `status`, `priority`

**Foreign Keys**:
- `orderId` → `orders(orderId)` ON DELETE CASCADE
- `staffId` → `staff(staffId)` ON DELETE SET NULL

**Business Rules**:
- `priority`: số càng lớn, độ ưu tiên càng cao
- `estimatedTime`: tính bằng phút

---

### Thanh toán & Hóa đơn

#### 11. Bảng `bills` (Hóa đơn)

**Mô tả**: Quản lý hóa đơn thanh toán

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| billId | INTEGER | PK, AUTO INCREMENT | ID hóa đơn |
| billNumber | VARCHAR(50) | UNIQUE, DEFAULT uuid() | Số hóa đơn |
| orderId | INTEGER | FK, UNIQUE, NOT NULL | ID đơn hàng |
| tableId | INTEGER | FK, NOT NULL | ID bàn |
| staffId | INTEGER | FK, NULLABLE | ID thu ngân |
| subtotal | DECIMAL(12,2) | NOT NULL | Tổng tiền hàng |
| taxAmount | DECIMAL(12,2) | DEFAULT 0 | Tiền thuế |
| taxRate | DECIMAL(5,2) | DEFAULT 0 | Tỷ lệ thuế (%) |
| discountAmount | DECIMAL(12,2) | DEFAULT 0 | Tiền giảm giá |
| serviceCharge | DECIMAL(12,2) | DEFAULT 0 | Phí dịch vụ |
| totalAmount | DECIMAL(12,2) | NOT NULL | Tổng cộng |
| paidAmount | DECIMAL(12,2) | DEFAULT 0 | Tiền đã trả |
| changeAmount | DECIMAL(12,2) | DEFAULT 0 | Tiền thối lại |
| paymentStatus | ENUM PaymentStatus | DEFAULT pending | Trạng thái |
| paymentMethod | ENUM PaymentMethod | NULLABLE | Phương thức |
| notes | TEXT | NULLABLE | Ghi chú |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |
| paidAt | TIMESTAMP | NULLABLE | Thời gian thanh toán |
| updatedAt | TIMESTAMP | AUTO UPDATE | Thời gian cập nhật |

**Indexes**:
- PRIMARY KEY: `billId`
- UNIQUE INDEX: `billNumber`, `orderId`
- INDEX: `paymentStatus`, `createdAt`

**Foreign Keys**:
- `orderId` → `orders(orderId)` ON DELETE RESTRICT
- `tableId` → `restaurant_tables(tableId)` ON DELETE RESTRICT
- `staffId` → `staff(staffId)` ON DELETE SET NULL

**Enum Values**:
- `PaymentStatus`: pending, paid, refunded, cancelled
- `PaymentMethod`: cash, card, momo, bank_transfer

**Business Rules**:
- `totalAmount` = `subtotal` + `taxAmount` + `serviceCharge` - `discountAmount`
- `changeAmount` = `paidAmount` - `totalAmount` (nếu `paidAmount` > `totalAmount`)

---

#### 12. Bảng `bill_items` (Chi tiết hóa đơn)

**Mô tả**: Chi tiết món ăn trong hóa đơn

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| billItemId | INTEGER | PK, AUTO INCREMENT | ID chi tiết |
| billId | INTEGER | FK, NOT NULL | ID hóa đơn |
| itemId | INTEGER | FK, NOT NULL | ID món ăn |
| itemName | VARCHAR(100) | NOT NULL | Tên món (snapshot) |
| quantity | INTEGER | NOT NULL | Số lượng |
| unitPrice | DECIMAL(10,2) | NOT NULL | Đơn giá |
| subtotal | DECIMAL(10,2) | NOT NULL | Tạm tính |
| discount | DECIMAL(10,2) | DEFAULT 0 | Giảm giá |
| total | DECIMAL(10,2) | NOT NULL | Thành tiền |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |

**Indexes**:
- PRIMARY KEY: `billItemId`
- INDEX: `billId`

**Foreign Keys**:
- `billId` → `bills(billId)` ON DELETE CASCADE
- `itemId` → `menu_items(itemId)` ON DELETE RESTRICT

**Business Rules**:
- `total` = `subtotal` - `discount`
- `subtotal` = `quantity` × `unitPrice`

---

#### 13. Bảng `payments` (Thanh toán)

**Mô tả**: Ghi nhận các giao dịch thanh toán

**Cấu trúc**:

| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| paymentId | INTEGER | PK, AUTO INCREMENT | ID thanh toán |
| billId | INTEGER | FK, NOT NULL | ID hóa đơn |
| paymentMethod | ENUM PaymentMethod | NOT NULL | Phương thức |
| amount | DECIMAL(12,2) | NOT NULL | Số tiền |
| transactionId | VARCHAR(100) | NULLABLE | Mã giao dịch |
| cardNumber | VARCHAR(20) | NULLABLE | Số thẻ (4 số cuối) |
| cardHolderName | VARCHAR(255) | NULLABLE | Tên chủ thẻ |
| status | ENUM PaymentStatus | DEFAULT pending | Trạng thái |
| notes | TEXT | NULLABLE | Ghi chú |
| paymentDate | TIMESTAMP | DEFAULT now() | Ngày thanh toán |
| createdAt | TIMESTAMP | DEFAULT now() | Thời gian tạo |

**Indexes**:
- PRIMARY KEY: `paymentId`
- INDEX: `billId`, `transactionId`

**Foreign Keys**:
- `billId` → `bills(billId)` ON DELETE CASCADE

**Security Notes**:
- Chỉ lưu 4 số cuối của thẻ
- Không lưu CVV hoặc PIN
- Mã hóa `transactionId`

---

## 🔍 Các Truy vấn Thường dùng

### 1. Truy vấn Đơn hàng

#### Lấy danh sách đơn hàng đang hoạt động
```sql
SELECT 
    o.orderId,
    o.orderNumber,
    t.tableNumber,
    s.fullName AS waiterName,
    o.headCount,
    o.status,
    o.orderTime,
    COUNT(oi.orderItemId) AS totalItems
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.status IN ('pending', 'confirmed', 'preparing', 'ready')
GROUP BY o.orderId, t.tableNumber, s.fullName
ORDER BY o.orderTime DESC;
```

#### Chi tiết đơn hàng với món ăn
```sql
SELECT 
    o.orderNumber,
    o.orderTime,
    t.tableNumber,
    mi.itemName,
    oi.quantity,
    oi.unitPrice,
    oi.subtotal,
    oi.specialRequest,
    oi.status
FROM orders o
INNER JOIN order_items oi ON o.orderId = oi.orderId
INNER JOIN menu_items mi ON oi.itemId = mi.itemId
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
WHERE o.orderNumber = 'ORDER-12345'
ORDER BY oi.createdAt;
```

### 2. Truy vấn Bàn & Đặt bàn

#### Kiểm tra bàn trống
```sql
SELECT 
    tableId,
    tableNumber,
    tableName,
    capacity,
    floor,
    section,
    status
FROM restaurant_tables
WHERE status = 'available'
    AND isActive = true
    AND capacity >= 4  -- Số người cần
ORDER BY floor, tableNumber;
```

#### Lấy lịch đặt bàn theo ngày
```sql
SELECT 
    r.reservationCode,
    r.customerName,
    r.phoneNumber,
    t.tableNumber,
    r.reservationDate,
    r.reservationTime,
    r.duration,
    r.headCount,
    r.status,
    r.specialRequest
FROM reservations r
INNER JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.reservationDate = '2025-10-20'
    AND r.status IN ('confirmed', 'pending')
ORDER BY r.reservationTime;
```

#### Kiểm tra bàn có trống không (theo thời gian)
```sql
SELECT tableId, tableNumber
FROM restaurant_tables t
WHERE t.isActive = true
    AND t.capacity >= 4
    AND NOT EXISTS (
        SELECT 1 
        FROM reservations r
        WHERE r.tableId = t.tableId
            AND r.reservationDate = '2025-10-20'
            AND r.status IN ('confirmed', 'seated')
            AND '18:00:00' BETWEEN r.reservationTime 
                AND (r.reservationTime + (r.duration || ' minutes')::INTERVAL)
    );
```

### 3. Truy vấn Hóa đơn & Doanh thu

#### Doanh thu theo ngày
```sql
SELECT 
    DATE(createdAt) AS date,
    COUNT(*) AS totalBills,
    SUM(subtotal) AS subtotal,
    SUM(taxAmount) AS taxAmount,
    SUM(discountAmount) AS discountAmount,
    SUM(totalAmount) AS totalRevenue
FROM bills
WHERE paymentStatus = 'paid'
    AND createdAt >= '2025-10-01'
    AND createdAt < '2025-11-01'
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

#### Top món bán chạy
```sql
SELECT 
    mi.itemName,
    mi.itemCode,
    c.categoryName,
    COUNT(bi.billItemId) AS orderCount,
    SUM(bi.quantity) AS totalQuantity,
    SUM(bi.total) AS totalRevenue
FROM bill_items bi
INNER JOIN menu_items mi ON bi.itemId = mi.itemId
INNER JOIN categories c ON mi.categoryId = c.categoryId
INNER JOIN bills b ON bi.billId = b.billId
WHERE b.paymentStatus = 'paid'
    AND b.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mi.itemId, mi.itemName, mi.itemCode, c.categoryName
ORDER BY totalQuantity DESC
LIMIT 10;
```

#### Chi tiết hóa đơn
```sql
SELECT 
    b.billNumber,
    b.createdAt AS billDate,
    t.tableNumber,
    s.fullName AS cashierName,
    bi.itemName,
    bi.quantity,
    bi.unitPrice,
    bi.discount,
    bi.total,
    b.subtotal,
    b.taxAmount,
    b.discountAmount,
    b.serviceCharge,
    b.totalAmount,
    b.paymentMethod,
    b.paymentStatus
FROM bills b
INNER JOIN bill_items bi ON b.billId = bi.billId
INNER JOIN restaurant_tables t ON b.tableId = t.tableId
LEFT JOIN staff s ON b.staffId = s.staffId
WHERE b.billNumber = 'BILL-12345'
ORDER BY bi.billItemId;
```

### 4. Truy vấn Nhân viên

#### Hiệu suất nhân viên phục vụ
```sql
SELECT 
    s.staffId,
    s.fullName,
    s.role,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    COUNT(DISTINCT b.billId) AS totalBills,
    SUM(b.totalAmount) AS totalRevenue,
    AVG(b.totalAmount) AS avgBillAmount
FROM staff s
LEFT JOIN orders o ON s.staffId = o.staffId
LEFT JOIN bills b ON o.orderId = b.orderId
WHERE s.role IN ('waiter', 'manager')
    AND s.isActive = true
    AND b.paymentStatus = 'paid'
    AND b.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.staffId, s.fullName, s.role
ORDER BY totalRevenue DESC;
```

### 5. Truy vấn Thực đơn

#### Món ăn theo danh mục (có sẵn)
```sql
SELECT 
    c.categoryName,
    c.displayOrder AS categoryOrder,
    mi.itemCode,
    mi.itemName,
    mi.price,
    mi.description,
    mi.preparationTime,
    mi.spicyLevel,
    mi.isVegetarian,
    mi.imageUrl
FROM menu_items mi
INNER JOIN categories c ON mi.categoryId = c.categoryId
WHERE mi.isActive = true
    AND mi.isAvailable = true
    AND c.isActive = true
ORDER BY c.displayOrder, mi.displayOrder, mi.itemName;
```

#### Phân tích giá vốn - giá bán
```sql
SELECT 
    mi.itemCode,
    mi.itemName,
    mi.cost,
    mi.price,
    (mi.price - mi.cost) AS profit,
    ROUND((mi.price - mi.cost) / mi.price * 100, 2) AS profitMargin
FROM menu_items mi
WHERE mi.cost IS NOT NULL
    AND mi.isActive = true
ORDER BY profitMargin DESC;
```

### 6. Truy vấn Bếp

#### Danh sách đơn bếp đang chờ
```sql
SELECT 
    ko.kitchenOrderId,
    ko.priority,
    o.orderNumber,
    t.tableNumber,
    ko.status,
    ko.estimatedTime,
    ko.createdAt,
    COUNT(oi.orderItemId) AS totalItems,
    s.fullName AS chefName
FROM kitchen_orders ko
INNER JOIN orders o ON ko.orderId = o.orderId
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN staff s ON ko.staffId = s.staffId
WHERE ko.status IN ('pending', 'preparing')
GROUP BY ko.kitchenOrderId, o.orderNumber, t.tableNumber, s.fullName
ORDER BY ko.priority DESC, ko.createdAt;
```

#### Thời gian chế biến trung bình
```sql
SELECT 
    DATE(ko.createdAt) AS date,
    AVG(EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60) AS avgPrepTimeMinutes,
    COUNT(*) AS totalOrders
FROM kitchen_orders ko
WHERE ko.status = 'ready'
    AND ko.startedAt IS NOT NULL
    AND ko.completedAt IS NOT NULL
    AND ko.createdAt >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(ko.createdAt)
ORDER BY date DESC;
```

---

## 📊 Chiến lược Đánh chỉ mục

### Indexes Hiện có

#### Bảng accounts
- `PRIMARY KEY (accountId)` - Tìm kiếm theo ID
- `UNIQUE (username, email, phoneNumber)` - Đảm bảo unique
- `INDEX (email)` - Tìm kiếm login
- `INDEX (username)` - Tìm kiếm login

#### Bảng refresh_tokens
- `PRIMARY KEY (tokenId)` - Tìm kiếm theo ID
- `UNIQUE (token)` - Validate token
- `INDEX (accountId)` - Tìm tokens của user
- `INDEX (expiresAt)` - Xóa tokens hết hạn

#### Bảng staff
- `PRIMARY KEY (staffId)` - Tìm kiếm theo ID
- `UNIQUE (accountId)` - 1-1 relationship
- `INDEX (role)` - Lọc theo vai trò
- `INDEX (isActive)` - Lọc nhân viên active

#### Bảng categories
- `PRIMARY KEY (categoryId)` - Tìm kiếm theo ID
- `UNIQUE (categoryName)` - Đảm bảo unique
- `INDEX (isActive)` - Lọc danh mục active

#### Bảng menu_items
- `PRIMARY KEY (itemId)` - Tìm kiếm theo ID
- `UNIQUE (itemCode)` - Đảm bảo unique
- `INDEX (categoryId)` - Join với categories
- `INDEX (isAvailable)` - Lọc món còn hàng
- `INDEX (isActive)` - Lọc món đang bán

#### Bảng restaurant_tables
- `PRIMARY KEY (tableId)` - Tìm kiếm theo ID
- `UNIQUE (tableNumber, qrCode)` - Đảm bảo unique
- `INDEX (status)` - Tìm bàn trống
- `INDEX (floor)` - Lọc theo tầng
- `INDEX (isActive)` - Lọc bàn active

#### Bảng reservations
- `PRIMARY KEY (reservationId)` - Tìm kiếm theo ID
- `UNIQUE (reservationCode)` - Tracking
- `INDEX (reservationDate)` - Lọc theo ngày
- `INDEX (status)` - Lọc theo trạng thái
- `INDEX (phoneNumber)` - Tìm theo SĐT
- `INDEX (tableId)` - Join với tables

#### Bảng orders
- `PRIMARY KEY (orderId)` - Tìm kiếm theo ID
- `UNIQUE (orderNumber)` - Tracking
- `INDEX (tableId)` - Join với tables
- `INDEX (status)` - Lọc theo trạng thái
- `INDEX (orderTime)` - Sắp xếp theo thời gian

#### Bảng order_items
- `PRIMARY KEY (orderItemId)` - Tìm kiếm theo ID
- `INDEX (orderId)` - Join với orders
- `INDEX (itemId)` - Join với menu_items
- `INDEX (status)` - Lọc theo trạng thái

#### Bảng kitchen_orders
- `PRIMARY KEY (kitchenOrderId)` - Tìm kiếm theo ID
- `INDEX (orderId)` - Join với orders
- `INDEX (status)` - Lọc theo trạng thái
- `INDEX (priority)` - Sắp xếp ưu tiên

#### Bảng bills
- `PRIMARY KEY (billId)` - Tìm kiếm theo ID
- `UNIQUE (billNumber, orderId)` - Tracking & 1-1
- `INDEX (paymentStatus)` - Lọc theo trạng thái
- `INDEX (createdAt)` - Báo cáo doanh thu

#### Bảng bill_items
- `PRIMARY KEY (billItemId)` - Tìm kiếm theo ID
- `INDEX (billId)` - Join với bills

#### Bảng payments
- `PRIMARY KEY (paymentId)` - Tìm kiếm theo ID
- `INDEX (billId)` - Join với bills
- `INDEX (transactionId)` - Tracking giao dịch

### Lợi ích Indexing

1. **Tìm kiếm nhanh**: PRIMARY KEY và UNIQUE indexes
2. **Join hiệu quả**: Foreign key indexes
3. **Lọc dữ liệu**: Status, date indexes
4. **Báo cáo**: Date range queries
5. **Xóa dữ liệu**: Expired tokens cleanup

### Maintenance Tips

```sql
-- Phân tích và tối ưu indexes
ANALYZE menu_items;
REINDEX TABLE orders;

-- Kiểm tra index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Tìm indexes không được sử dụng
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexname NOT LIKE '%_pkey';
```

---

## 🔗 Mối quan hệ giữa các Bảng

### Relationships Map

#### 1. Authentication Flow
```
accounts (1) ←→ (1) staff
accounts (1) → (N) refresh_tokens
```

#### 2. Menu Structure
```
categories (1) → (N) menu_items
```

#### 3. Table & Reservation
```
restaurant_tables (1) → (N) reservations
restaurant_tables (1) → (N) orders
restaurant_tables (1) → (N) bills
```

#### 4. Order Flow
```
reservations (1) → (N) orders
orders (1) → (N) order_items
orders (1) → (N) kitchen_orders
orders (1) → (1) bills
staff (1) → (N) orders (waiter)
menu_items (1) → (N) order_items
```

#### 5. Kitchen Flow
```
orders (1) → (N) kitchen_orders
staff (1) → (N) kitchen_orders (chef)
```

#### 6. Billing Flow
```
bills (1) → (N) bill_items
bills (1) → (N) payments
staff (1) → (N) bills (cashier)
menu_items (1) → (N) bill_items
```

### Cascade Rules

| Relationship | ON DELETE |
|--------------|-----------|
| account → staff | CASCADE |
| account → refresh_tokens | CASCADE |
| order → order_items | CASCADE |
| order → kitchen_orders | CASCADE |
| bill → bill_items | CASCADE |
| bill → payments | CASCADE |
| category → menu_items | RESTRICT |
| table → reservations | RESTRICT |
| table → orders | RESTRICT |
| table → bills | RESTRICT |
| staff → orders | SET NULL |
| staff → bills | SET NULL |

---

## 📈 Tối ưu hóa & Best Practices

### 1. Performance Tips

- Sử dụng connection pooling
- Batch insert cho nhiều records
- Pagination cho danh sách lớn
- Cache các truy vấn thường dùng
- Sử dụng prepared statements

### 2. Data Integrity

- Foreign keys đảm bảo referential integrity
- UNIQUE constraints ngăn duplicate
- CHECK constraints validate business rules
- NOT NULL cho required fields
- Default values hợp lý

### 3. Security

- Hash passwords với bcrypt
- Không lưu thông tin thẻ đầy đủ
- Encrypt sensitive data
- Audit logs cho các thao tác quan trọng
- Row-level security nếu cần

### 4. Backup Strategy

```bash
# Daily backup
pg_dump -U postgres -d restaurant_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d restaurant_db < backup_20251020.sql
```

### 5. Monitoring Queries

```sql
-- Slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Database size
SELECT 
    pg_size_pretty(pg_database_size('restaurant_db')) AS db_size;

-- Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚀 Migration & Setup

### Prisma Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Create new migration
pnpm prisma migrate dev --name add_new_feature

# Reset database (development only)
pnpm prisma migrate reset

# Seed database
pnpm prisma db seed

# Open Prisma Studio
pnpm prisma studio
```

### Environment Setup

```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db?schema=public"
```

---

## 📝 Ghi chú

### Future Enhancements

Các bảng có thể bổ sung trong tương lai theo yêu cầu từ issue:

#### Quản lý Tồn kho
- `ingredients` - Nguyên liệu
- `suppliers` - Nhà cung cấp
- `recipe` - Công thức món ăn
- `stock_transactions` - Giao dịch tồn kho
- `purchase_orders` - Đơn đặt hàng
- `purchase_order_items` - Chi tiết đơn đặt hàng
- `ingredient_batches` - Lô nguyên liệu
- `stock_alerts` - Cảnh báo tồn kho

#### Đặt bàn nâng cao
- `reservation_history` - Lịch sử đặt bàn
- `table_availability` - Lịch trống bàn
- `reservation_notifications` - Thông báo đặt bàn

#### Khác
- `customers` - Khách hàng thường xuyên
- `promotions` - Chương trình khuyến mãi
- `loyalty_points` - Điểm thưởng
- `reviews` - Đánh giá món ăn

### Version History

- **v1.0** - Initial schema (2025-10-14)
  - Core tables: accounts, staff, menu, tables, orders, bills
  - Reservation system
  - Kitchen management
  - Payment processing

---

## 📞 Liên hệ & Hỗ trợ

- **Repository**: https://github.com/huy1235588/restaurant-management
- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues

---

**Tài liệu được tạo bởi**: @huy1235588
**Cập nhật lần cuối**: 2025-10-19
