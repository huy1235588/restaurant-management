# 📊 Tài liệu Cơ sở Dữ liệu - Hệ thống Quản lý Nhà hàng

> **Dự án tốt nghiệp** - Hệ thống quản lý nhà hàng toàn diện  
> **Công nghệ**: PostgreSQL 16 + Prisma ORM + TypeScript

## Mục lục

- [1. Tổng quan](#1-tổng-quan)
- [2. Các Enum Types](#2-các-enum-types)
- [3. Mô tả chi tiết các bảng](#3-mô-tả-chi-tiết-các-bảng)
  - [3.1 Authentication & User Management](#31-authentication--user-management)
  - [3.2 Menu & Category Management](#32-menu--category-management)
  - [3.3 Table Management](#33-table-management)
  - [3.4 Reservation & Customer Management](#34-reservation--customer-management)
  - [3.5 Order Management](#35-order-management)
  - [3.6 Kitchen Management](#36-kitchen-management)
  - [3.7 Billing & Payment](#37-billing--payment)
- [4. Mối quan hệ giữa các bảng](#4-mối-quan-hệ-giữa-các-bảng)
- [5. Chiến lược đánh chỉ mục](#5-chiến-lược-đánh-chỉ-mục)
- [6. Các truy vấn thường dùng](#6-các-truy-vấn-thường-dùng)

---

## 1. Tổng quan

### 1.1. Giới thiệu

Đây là tài liệu cơ sở dữ liệu cho **dự án tốt nghiệp** về hệ thống quản lý nhà hàng. Hệ thống được thiết kế để hỗ trợ các nghiệp vụ cốt lõi của nhà hàng:

✅ **Các chức năng chính:**
- Quản lý tài khoản và phân quyền nhân viên
- Quản lý thực đơn và danh mục món ăn
- Quản lý bàn ăn
- Hệ thống đặt bàn trực tuyến
- Quản lý khách hàng
- Quản lý đơn hàng và bếp (Kitchen Display System)
- Quản lý thanh toán và hóa đơn

### 1.2. Công nghệ sử dụng

- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Language**: TypeScript
- **Backend**: Node.js + NestJS
- **Frontend**: Next.js 16 + React 19

### 1.3. Cấu trúc tổng thể

Cơ sở dữ liệu được chia thành 8 module chính với **17 bảng**:

| STT | Module                      | Bảng chính                                      | Mô tả                           |
| --- | --------------------------- | ----------------------------------------------- | ------------------------------- |
| 1   | **Authentication**          | accounts, refresh_tokens                        | Xác thực và bảo mật             |
| 2   | **Staff Management**        | staff                                           | Quản lý nhân viên               |
| 3   | **Menu Management**         | categories, menu_items                          | Quản lý thực đơn                |
| 4   | **Table Management**        | restaurant_tables                               | Quản lý bàn ăn                  |
| 5   | **Reservation & Customer**  | reservations, customers, reservation_audits    | Đặt bàn & quản lý khách         |
| 6   | **Order Management**        | orders, order_items                             | Quản lý đơn hàng                |
| 7   | **Kitchen Management**      | kitchen_orders, kitchen_stations                | Quản lý bếp                     |
| 8   | **Billing & Payment**       | bills, bill_items, payments                     | Thanh toán và hóa đơn           |

---

## 2. Các Enum Types

### Role - Vai trò nhân viên
- `admin` - Quản trị viên (toàn quyền)
- `manager` - Quản lý (quản lý nhân viên, báo cáo)
- `waiter` - Nhân viên phục vụ (nhận đơn, phục vụ)
- `chef` - Đầu bếp (xử lý đơn bếp)
- `cashier` - Thu ngân (xử lý thanh toán)

### TableStatus - Trạng thái bàn
- `available` - Có sẵn (bàn trống)
- `occupied` - Đang sử dụng (có khách)
- `reserved` - Đã đặt (được đặt trước)
- `maintenance` - Đang bảo trì (không dùng)

### OrderStatus - Trạng thái đơn hàng
- `pending` - Chờ xác nhận (mới tạo)
- `confirmed` - Đã xác nhận (gửi bếp)
- `preparing` - Đang chuẩn bị (bếp đang nấu)
- `ready` - Sẵn sàng (món đã xong)
- `serving` - Đang phục vụ (đã mang ra bàn)
- `completed` - Hoàn thành (đã thanh toán)
- `cancelled` - Đã hủy

### OrderItemStatus - Trạng thái chi tiết đơn
- `pending` - Chưa bắt đầu
- `preparing` - Đang nấu
- `ready` - Đã xong
- `served` - Đã phục vụ
- `cancelled` - Đã hủy

### KitchenOrderStatus - Trạng thái đơn bếp
- `pending` - Đơn mới, chưa được xác nhận
- `confirmed` - Đầu bếp đã xác nhận
- `preparing` - Đang nấu
- `almost_ready` - Sắp xong
- `ready` - Sẵn sàng lấy
- `completed` - Đã lấy
- `cancelled` - Đã hủy

### OrderPriority - Độ ưu tiên đơn
- `normal` - Đơn bình thường
- `express` - Gấp (khách vội)
- `vip` - VIP

### StationType - Loại trạm bếp
- `grill` - Nướng
- `fry` - Chiên
- `steam` - Hấp
- `dessert` - Tráng miệng
- `drinks` - Đồ uống

### PaymentStatus - Trạng thái thanh toán
- `pending` - Chờ thanh toán
- `paid` - Đã thanh toán
- `refunded` - Đã hoàn tiền
- `cancelled` - Đã hủy

### PaymentMethod - Phương thức thanh toán
- `cash` - Tiền mặt
- `card` - Thẻ ngân hàng
- `momo` - Ví MoMo
- `bank_transfer` - Chuyển khoản

### ReservationStatus - Trạng thái đặt bàn
- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận
- `seated` - Đã ngồi vào bàn
- `completed` - Hoàn thành
- `cancelled` - Đã hủy
- `no_show` - Không đến

---

## 3. Mô tả chi tiết các bảng

### 3.1. Authentication & User Management

#### Account (accounts)

Lưu trữ thông tin đăng nhập.

| Trường      | Kiểu         | Ràng buộc        | Mô tả              |
| ----------- | ------------ | ---------------- | ------------------ |
| accountId   | INT          | PK, Auto         | ID tài khoản       |
| username    | VARCHAR(50)  | UNIQUE, NOT NULL | Tên đăng nhập      |
| email       | VARCHAR(255) | UNIQUE, NOT NULL | Email              |
| phoneNumber | VARCHAR(20)  | UNIQUE, NOT NULL | Số điện thoại      |
| password    | VARCHAR(255) | NOT NULL         | Mật khẩu (hashed)  |
| isActive    | BOOLEAN      | DEFAULT true     | Đang hoạt động     |
| lastLogin   | TIMESTAMP    | NULL             | Lần đăng nhập cuối |
| createdAt   | TIMESTAMP    | DEFAULT now()    | Ngày tạo           |
| updatedAt   | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật      |

**Indexes**: `email`, `username`  
**Quan hệ**: 1:1 với `staff`; 1:N với `refresh_tokens`

---

#### RefreshToken (refresh_tokens)

Quản lý refresh tokens cho JWT.

| Trường     | Kiểu         | Ràng buộc        | Mô tả             |
| ---------- | ------------ | ---------------- | ----------------- |
| tokenId    | INT          | PK, Auto         | ID token          |
| accountId  | INT          | FK, NOT NULL     | ID tài khoản      |
| token      | TEXT         | UNIQUE, NOT NULL | Token string      |
| expiresAt  | TIMESTAMP    | NOT NULL         | Thời gian hết hạn |
| deviceInfo | VARCHAR(500) | NULL             | Thông tin thiết bị |
| ipAddress  | VARCHAR(45)  | NULL             | Địa chỉ IP        |
| isRevoked  | BOOLEAN      | DEFAULT false    | Đã thu hồi        |
| createdAt  | TIMESTAMP    | DEFAULT now()    | Ngày tạo          |
| revokedAt  | TIMESTAMP    | NULL             | Ngày thu hồi      |

**Indexes**: `accountId`, `token`, `expiresAt`  
**Quan hệ**: N:1 với `accounts` (CASCADE DELETE)

---

#### Staff (staff)

Thông tin chi tiết nhân viên.

| Trường      | Kiểu          | Ràng buộc            | Mô tả         |
| ----------- | ------------- | -------------------- | ------------- |
| staffId     | INT           | PK, Auto             | ID nhân viên  |
| accountId   | INT           | FK, UNIQUE, NOT NULL | ID tài khoản  |
| fullName    | VARCHAR(255)  | NOT NULL             | Họ và tên     |
| address     | VARCHAR(500)  | NULL                 | Địa chỉ       |
| dateOfBirth | DATE          | NULL                 | Ngày sinh     |
| hireDate    | DATE          | DEFAULT now()        | Ngày vào làm  |
| salary      | DECIMAL(12,2) | NULL                 | Lương         |
| role        | ENUM(Role)    | NOT NULL             | Vai trò       |
| isActive    | BOOLEAN       | DEFAULT true         | Đang làm việc |
| createdAt   | TIMESTAMP     | DEFAULT now()        | Ngày tạo      |
| updatedAt   | TIMESTAMP    | AUTO UPDATE          | Ngày cập nhật |

**Indexes**: `role`, `isActive`  
**Quan hệ**: 1:1 với `accounts` (CASCADE DELETE); 1:N với `orders`; 1:N với `bills`; 1:N với `kitchen_orders`; 1:N với `reservations`

---

### 3.2. Menu & Category Management

#### Category (categories)

Danh mục món ăn.

| Trường       | Kiểu         | Ràng buộc        | Mô tả           |
| ------------ | ------------ | ---------------- | --------------- |
| categoryId   | INT          | PK, Auto         | ID danh mục     |
| categoryName | VARCHAR(100) | UNIQUE, NOT NULL | Tên danh mục    |
| description  | VARCHAR(500) | NULL             | Mô tả           |
| displayOrder | INT          | DEFAULT 0        | Thứ tự hiển thị |
| isActive     | BOOLEAN      | DEFAULT true     | Đang hoạt động  |
| imageUrl     | VARCHAR(500) | NULL             | URL hình ảnh    |
| imagePath    | VARCHAR(500) | NULL             | Đường dẫn file  |
| createdAt    | TIMESTAMP    | DEFAULT now()    | Ngày tạo        |
| updatedAt    | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật   |

**Indexes**: `isActive`  
**Quan hệ**: 1:N với `menu_items`

---

#### MenuItem (menu_items)

Thông tin chi tiết các món ăn.

| Trường          | Kiểu          | Ràng buộc        | Mô tả                     |
| --------------- | ------------- | ---------------- | ------------------------- |
| itemId          | INT           | PK, Auto         | ID món ăn                 |
| itemCode        | VARCHAR(20)   | UNIQUE, NOT NULL | Mã món                    |
| itemName        | VARCHAR(100)  | NOT NULL         | Tên món                   |
| categoryId      | INT           | FK, NOT NULL     | ID danh mục               |
| price           | DECIMAL(10,2) | NOT NULL         | Giá bán                   |
| cost            | DECIMAL(10,2) | NULL             | Giá vốn                   |
| description     | VARCHAR(1000) | NULL             | Mô tả                     |
| imageUrl        | VARCHAR(500)  | NULL             | URL hình ảnh              |
| imagePath       | VARCHAR(500)  | NULL             | Đường dẫn file            |
| isAvailable     | BOOLEAN       | DEFAULT true     | Còn hàng                  |
| isActive        | BOOLEAN       | DEFAULT true     | Đang bán                  |
| preparationTime | INT           | NULL             | Thời gian chế biến (phút) |
| spicyLevel      | INT           | DEFAULT 0        | Độ cay (0-5)              |
| isVegetarian    | BOOLEAN       | DEFAULT false    | Món chay                  |
| calories        | INT           | NULL             | Calo                      |
| displayOrder    | INT           | DEFAULT 0        | Thứ tự hiển thị           |
| createdAt       | TIMESTAMP     | DEFAULT now()    | Ngày tạo                  |
| updatedAt       | TIMESTAMP     | AUTO UPDATE      | Ngày cập nhật             |

**Indexes**: `categoryId`, `isAvailable`, `isActive`  
**Quan hệ**: N:1 với `categories` (RESTRICT); 1:N với `order_items`; 1:N với `bill_items`

---

### 3.3. Table Management

#### RestaurantTable (restaurant_tables)

Quản lý bàn ăn.

| Trường      | Kiểu              | Ràng buộc         | Mô tả                    |
| ----------- | ----------------- | ----------------- | ------------------------ |
| tableId     | INT               | PK, Auto          | ID bàn                   |
| tableNumber | VARCHAR(20)       | UNIQUE, NOT NULL  | Số bàn                   |
| tableName   | VARCHAR(50)       | NULL              | Tên bàn                  |
| capacity    | INT               | NOT NULL          | Sức chứa                 |
| minCapacity | INT               | DEFAULT 1         | Sức chứa tối thiểu       |
| floor       | INT               | DEFAULT 1         | Tầng                     |
| section     | VARCHAR(50)       | NULL              | Khu vực (VIP, Garden...) |
| status      | ENUM(TableStatus) | DEFAULT available | Trạng thái               |
| qrCode      | VARCHAR(255)      | UNIQUE, NULL      | Mã QR                    |
| isActive    | BOOLEAN           | DEFAULT true      | Đang sử dụng             |
| createdAt   | TIMESTAMP         | DEFAULT now()     | Ngày tạo                 |
| updatedAt   | TIMESTAMP         | AUTO UPDATE       | Ngày cập nhật            |

**Indexes**: `status`, `floor`, `isActive`  
**Quan hệ**: 1:N với `reservations`; 1:N với `orders`; 1:N với `bills`

---

### 3.4. Reservation & Customer Management

#### Customer (customers)

Quản lý khách hàng.

| Trường      | Kiểu         | Ràng buộc        | Mô tả          |
| ----------- | ------------ | ---------------- | -------------- |
| customerId  | INT          | PK, Auto         | ID khách hàng  |
| name        | VARCHAR(255) | NOT NULL         | Tên khách      |
| phoneNumber | VARCHAR(20)  | UNIQUE, NOT NULL | Số điện thoại  |
| email       | VARCHAR(255) | UNIQUE, NULL     | Email          |
| birthday    | DATE         | NULL             | Ngày sinh      |
| preferences | JSON         | NULL             | Sở thích       |
| notes       | TEXT         | NULL             | Ghi chú        |
| isVip       | BOOLEAN      | DEFAULT false    | Là VIP         |
| createdAt   | TIMESTAMP    | DEFAULT now()    | Ngày tạo       |
| updatedAt   | TIMESTAMP    | AUTO UPDATE      | Ngày cập nhật  |

**Indexes**: `name`  
**Quan hệ**: 1:N với `reservations`

---

#### Reservation (reservations)

Quản lý đặt bàn.

| Trường             | Kiểu                    | Ràng buộc       | Mô tả                  |
| ------------------ | ----------------------- | --------------- | ---------------------- |
| reservationId      | INT                     | PK, Auto        | ID đặt bàn             |
| reservationCode    | VARCHAR(50)             | UNIQUE, UUID    | Mã đặt bàn             |
| customerName       | VARCHAR(255)            | NOT NULL        | Tên khách              |
| phoneNumber        | VARCHAR(20)             | NOT NULL        | SĐT khách              |
| email              | VARCHAR(255)            | NULL            | Email khách            |
| customerId         | INT                     | FK, NULL        | ID khách hàng          |
| tableId            | INT                     | FK, NOT NULL    | ID bàn                 |
| reservationDate    | DATE                    | NOT NULL        | Ngày đặt               |
| reservationTime    | TIME                    | NOT NULL        | Giờ đặt                |
| duration           | INT                     | DEFAULT 120     | Thời lượng (phút)      |
| headCount          | INT                     | NOT NULL        | Số người               |
| specialRequest     | TEXT                    | NULL            | Yêu cầu đặc biệt       |
| depositAmount      | DECIMAL(10,2)           | NULL            | Tiền cọc               |
| status             | ENUM(ReservationStatus) | DEFAULT pending | Trạng thái             |
| notes              | TEXT                    | NULL            | Ghi chú                |
| tags               | TEXT[]                  | DEFAULT []      | Tags                   |
| createdBy          | INT                     | FK, NULL        | Tạo bởi (staff)        |
| confirmedAt        | TIMESTAMP               | NULL            | Thời gian xác nhận     |
| seatedAt           | TIMESTAMP               | NULL            | Thời gian ngồi vào     |
| completedAt        | TIMESTAMP               | NULL            | Thời gian hoàn thành   |
| cancelledAt        | TIMESTAMP               | NULL            | Thời gian hủy          |
| cancellationReason | TEXT                    | NULL            | Lý do hủy              |
| createdAt          | TIMESTAMP               | DEFAULT now()   | Ngày tạo               |
| updatedAt          | TIMESTAMP               | AUTO UPDATE     | Ngày cập nhật          |

**Indexes**: `reservationDate`, `reservationTime`, `status`, `phoneNumber`, `tableId`, `customerId`  
**Quan hệ**: N:1 với `restaurant_tables` (RESTRICT); N:1 với `customers` (SET NULL); N:1 với `staff` (SET NULL); 1:N với `orders`; 1:N với `reservation_audits`

---

#### ReservationAudit (reservation_audits)

Audit log cho đặt bàn.

| Trường        | Kiểu      | Ràng buộc       | Mô tả            |
| ------------- | --------- | --------------- | ---------------- |
| auditId       | INT       | PK, Auto        | ID audit         |
| reservationId | INT       | FK, NOT NULL    | ID đặt bàn       |
| action        | VARCHAR   | NOT NULL        | Hành động         |
| userId        | INT       | FK, NULL        | ID nhân viên      |
| changes       | JSON      | NULL            | Thay đổi          |
| createdAt     | TIMESTAMP | DEFAULT now()   | Ngày tạo          |

**Indexes**: `reservationId`, `createdAt`  
**Quan hệ**: N:1 với `reservations` (CASCADE); N:1 với `staff` (SET NULL)

---

### 3.5. Order Management

#### Order (orders)

Đơn hàng.

| Trường             | Kiểu              | Ràng buộc       | Mô tả                |
| ------------------ | ----------------- | --------------- | -------------------- |
| orderId            | INT               | PK, Auto        | ID đơn hàng          |
| orderNumber        | VARCHAR(50)       | UNIQUE, UUID    | Mã đơn hàng          |
| tableId            | INT               | FK, NOT NULL    | ID bàn               |
| staffId            | INT               | FK, NULL        | ID nhân viên phục vụ |
| reservationId      | INT               | FK, NULL        | ID đặt bàn           |
| customerName       | VARCHAR(255)      | NULL            | Tên khách            |
| customerPhone      | VARCHAR(20)       | NULL            | SĐT khách            |
| headCount          | INT               | DEFAULT 1       | Số người             |
| status             | ENUM(OrderStatus) | DEFAULT pending | Trạng thái           |
| notes              | TEXT              | NULL            | Ghi chú              |
| totalAmount        | DECIMAL(12,2)     | DEFAULT 0       | Tổng tiền hàng       |
| discountAmount     | DECIMAL(12,2)     | DEFAULT 0       | Tiền giảm giá        |
| taxAmount          | DECIMAL(12,2)     | DEFAULT 0       | Tiền thuế            |
| finalAmount        | DECIMAL(12,2)     | DEFAULT 0       | Tổng cộng            |
| orderTime          | TIMESTAMP         | DEFAULT now()   | Giờ đặt              |
| confirmedAt        | TIMESTAMP         | NULL            | Giờ xác nhận         |
| completedAt        | TIMESTAMP         | NULL            | Giờ hoàn thành       |
| cancelledAt        | TIMESTAMP         | NULL            | Giờ hủy              |
| cancellationReason | TEXT              | NULL            | Lý do hủy            |
| createdAt          | TIMESTAMP         | DEFAULT now()   | Ngày tạo             |
| updatedAt          | TIMESTAMP         | AUTO UPDATE     | Ngày cập nhật        |

**Indexes**: `orderNumber`, `tableId`, `staffId`, `status`, `orderTime`, `createdAt`  
**Quan hệ**: N:1 với `restaurant_tables` (RESTRICT); N:1 với `staff` (SET NULL); N:1 với `reservations` (SET NULL); 1:N với `order_items`; 1:N với `kitchen_orders`; 1:1 với `bills`

---

#### OrderItem (order_items)

Chi tiết đơn hàng.

| Trường         | Kiểu                  | Ràng buộc       | Mô tả            |
| -------------- | --------------------- | --------------- | ---------------- |
| orderItemId    | INT                   | PK, Auto        | ID chi tiết      |
| orderId        | INT                   | FK, NOT NULL    | ID đơn hàng      |
| itemId         | INT                   | FK, NOT NULL    | ID món ăn        |
| quantity       | INT                   | NOT NULL        | Số lượng         |
| unitPrice      | DECIMAL(10,2)         | NOT NULL        | Đơn giá          |
| totalPrice     | DECIMAL(10,2)         | NOT NULL        | Thành tiền       |
| specialRequest | VARCHAR(500)          | NULL            | Yêu cầu đặc biệt |
| status         | ENUM(OrderItemStatus) | DEFAULT pending | Trạng thái       |
| createdAt      | TIMESTAMP             | DEFAULT now()   | Ngày tạo         |
| updatedAt      | TIMESTAMP             | AUTO UPDATE     | Ngày cập nhật    |

**Indexes**: `orderId`, `itemId`, `status`  
**Quan hệ**: N:1 với `orders` (CASCADE); N:1 với `menu_items` (RESTRICT)

---

### 3.6. Kitchen Management

#### KitchenOrder (kitchen_orders)

Đơn bếp.

| Trường             | Kiểu                    | Ràng buộc       | Mô tả                       |
| ------------------ | ----------------------- | --------------- | --------------------------- |
| kitchenOrderId     | INT                     | PK, Auto        | ID đơn bếp                  |
| orderId            | INT                     | FK, UNIQUE      | ID đơn hàng (1:1)           |
| staffId            | INT                     | FK, NULL        | ID đầu bếp                  |
| stationId          | INT                     | FK, NULL        | ID trạm bếp                 |
| priority           | ENUM(OrderPriority)     | DEFAULT normal  | Độ ưu tiên                  |
| status             | ENUM(KitchenOrderStatus)| DEFAULT pending | Trạng thái                  |
| prepTimeEstimated  | INT                     | NULL            | Thời gian ước tính (phút)   |
| prepTimeActual     | INT                     | NULL            | Thời gian thực tế (phút)    |
| startedAt          | TIMESTAMP               | NULL            | Giờ bắt đầu                 |
| completedAt        | TIMESTAMP               | NULL            | Giờ hoàn thành              |
| notes              | TEXT                    | NULL            | Ghi chú                     |
| createdAt          | TIMESTAMP               | DEFAULT now()   | Ngày tạo                    |
| updatedAt          | TIMESTAMP               | AUTO UPDATE     | Ngày cập nhật               |

**Indexes**: `orderId`, `staffId`, `stationId`, `status`, `priority`, `createdAt`  
**Quan hệ**: 1:1 với `orders` (CASCADE); N:1 với `staff` (SET NULL); N:1 với `kitchen_stations` (SET NULL)

---

#### KitchenStation (kitchen_stations)

Trạm bếp.

| Trường    | Kiểu             | Ràng buộc       | Mô tả         |
| --------- | ---------------- | --------------- | ------------- |
| stationId | INT              | PK, Auto        | ID trạm bếp   |
| name      | VARCHAR(100)     | NOT NULL        | Tên trạm      |
| type      | ENUM(StationType)| NOT NULL        | Loại trạm     |
| isActive  | BOOLEAN          | DEFAULT true    | Đang hoạt động|
| createdAt | TIMESTAMP        | DEFAULT now()   | Ngày tạo      |
| updatedAt | TIMESTAMP        | AUTO UPDATE     | Ngày cập nhật |

**Indexes**: `type`, `isActive`  
**Quan hệ**: 1:N với `kitchen_orders`

---

### 3.7. Billing & Payment

#### Bill (bills)

Hóa đơn.

| Trường         | Kiểu                | Ràng buộc            | Mô tả           |
| -------------- | ------------------- | -------------------- | --------------- |
| billId         | INT                 | PK, Auto             | ID hóa đơn      |
| billNumber     | VARCHAR(50)         | UNIQUE, UUID         | Mã hóa đơn      |
| orderId        | INT                 | FK, UNIQUE, NOT NULL | ID đơn hàng     |
| tableId        | INT                 | FK, NOT NULL         | ID bàn          |
| staffId        | INT                 | FK, NULL             | ID thu ngân     |
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

**Indexes**: `billNumber`, `orderId`, `paymentStatus`, `createdAt`  
**Quan hệ**: 1:1 với `orders` (RESTRICT); N:1 với `restaurant_tables` (RESTRICT); N:1 với `staff` (SET NULL); 1:N với `bill_items`; 1:N với `payments`

---

#### BillItem (bill_items)

Chi tiết hóa đơn.

| Trường     | Kiểu          | Ràng buộc     | Mô tả              |
| ---------- | ------------- | ------------- | ------------------ |
| billItemId | INT           | PK, Auto      | ID chi tiết HĐ     |
| billId     | INT           | FK, NOT NULL  | ID hóa đơn         |
| itemId     | INT           | FK, NOT NULL  | ID món ăn          |
| itemName   | VARCHAR(100)  | NOT NULL      | Tên món (snapshot) |
| quantity   | INT           | NOT NULL      | Số lượng           |
| unitPrice  | DECIMAL(10,2) | NOT NULL      | Đơn giá            |
| subtotal   | DECIMAL(10,2) | NOT NULL      | Thành tiền         |
| discount   | DECIMAL(10,2) | DEFAULT 0     | Giảm giá           |
| total      | DECIMAL(10,2) | NOT NULL      | Tổng               |
| createdAt  | TIMESTAMP     | DEFAULT now() | Ngày tạo           |

**Indexes**: `billId`  
**Quan hệ**: N:1 với `bills` (CASCADE); N:1 với `menu_items` (RESTRICT)

---

#### Payment (payments)

Thanh toán.

| Trường         | Kiểu                | Ràng buộc       | Mô tả              |
| -------------- | ------------------- | --------------- | ------------------ |
| paymentId      | INT                 | PK, Auto        | ID thanh toán      |
| billId         | INT                 | FK, NOT NULL    | ID hóa đơn         |
| paymentMethod  | ENUM(PaymentMethod) | NOT NULL        | Phương thức TT     |
| amount         | DECIMAL(12,2)       | NOT NULL        | Số tiền            |
| transactionId  | VARCHAR(100)        | NULL            | Mã giao dịch       |
| cardNumber     | VARCHAR(20)         | NULL            | Số thẻ (4 số cuối) |
| cardHolderName | VARCHAR(255)        | NULL            | Tên chủ thẻ        |
| status         | ENUM(PaymentStatus) | DEFAULT pending | Trạng thái         |
| notes          | TEXT                | NULL            | Ghi chú            |
| paymentDate    | TIMESTAMP           | DEFAULT now()   | Ngày thanh toán    |
| createdAt      | TIMESTAMP           | DEFAULT now()   | Ngày tạo           |

**Indexes**: `billId`, `transactionId`  
**Quan hệ**: N:1 với `bills` (CASCADE)

---

## 4. Mối quan hệ giữa các bảng

### 4.1. Sơ đồ quan hệ

```
Authentication Flow:
  Account (1) ─── (1) Staff
    │
    └── (N) RefreshToken

Menu Hierarchy:
  Category (1) ─── (N) MenuItem

Table & Reservation:
  RestaurantTable (1) ─┬─ (N) Reservation
                      ├─ (N) Order
                      └─ (N) Bill

Complete Business Flow:
  Customer ──────┐
                 │
  Reservation ───┼─→ Order ──→ OrderItem ──→ MenuItem
                 │              │
  Staff ─────────┘              ├─→ KitchenOrder ──→ KitchenStation
                                │       │
                                │       └─→ Staff (chef)
                                │
                                └─→ Bill ──→ BillItem ──→ MenuItem
                                     │
                                     └─→ Payment
```

### 4.2. Foreign Key Constraints

| Bảng con          | Khóa ngoại    | Bảng cha          | Hành động xóa |
| ----------------- | ------------- | ----------------- | ------------- |
| staff             | accountId     | accounts          | CASCADE       |
| refresh_tokens    | accountId     | accounts          | CASCADE       |
| menu_items        | categoryId    | categories        | RESTRICT      |
| reservations      | tableId       | restaurant_tables | RESTRICT      |
| reservations      | customerId    | customers         | SET NULL      |
| reservations      | createdBy     | staff             | SET NULL      |
| reservation_audits| reservationId | reservations      | CASCADE       |
| reservation_audits| userId        | staff             | SET NULL      |
| orders            | tableId       | restaurant_tables | RESTRICT      |
| orders            | staffId       | staff             | SET NULL      |
| orders            | reservationId | reservations      | SET NULL      |
| order_items       | orderId       | orders            | CASCADE       |
| order_items       | itemId        | menu_items        | RESTRICT      |
| kitchen_orders    | orderId       | orders            | CASCADE       |
| kitchen_orders    | staffId       | staff             | SET NULL      |
| kitchen_orders    | stationId     | kitchen_stations  | SET NULL      |
| bills             | orderId       | orders            | RESTRICT      |
| bills             | tableId       | restaurant_tables | RESTRICT      |
| bills             | staffId       | staff             | SET NULL      |
| bill_items        | billId        | bills             | CASCADE       |
| bill_items        | itemId        | menu_items        | RESTRICT      |
| payments          | billId        | bills             | CASCADE       |

---

## 5. Chiến lược đánh chỉ mục

### Unique Indexes
```sql
accounts: username, email, phoneNumber
refresh_tokens: token
staff: accountId
categories: categoryName
menu_items: itemCode
customers: phoneNumber, email
reservations: reservationCode
restaurant_tables: tableNumber, qrCode
orders: orderNumber
bills: billNumber, orderId
kitchen_orders: orderId
```

### Regular Indexes
Tất cả foreign keys và fields thường xuyên trong WHERE clauses:
- accounts: email, username
- refresh_tokens: accountId, token, expiresAt
- staff: role, isActive
- categories: isActive
- menu_items: categoryId, isAvailable, isActive
- customers: name
- reservations: reservationDate, reservationTime, status, phoneNumber, tableId, customerId
- restaurant_tables: status, floor, isActive
- orders: orderNumber, tableId, staffId, status, orderTime, createdAt
- order_items: orderId, itemId, status
- kitchen_orders: orderId, staffId, stationId, status, priority, createdAt
- kitchen_stations: type, isActive
- bills: billNumber, orderId, paymentStatus, createdAt
- bill_items: billId
- payments: billId, transactionId
- reservation_audits: reservationId, createdAt

---

## 6. Các truy vấn thường dùng

### Đăng nhập
```sql
SELECT a.*, s.staffId, s.role, s.fullName
FROM accounts a
LEFT JOIN staff s ON a.accountId = s.accountId
WHERE a.email = $1 AND a.isActive = true;
```

### Lấy thực đơn theo danh mục
```sql
SELECT c.categoryId, c.categoryName, 
  json_agg(json_build_object('itemId', m.itemId, 'itemName', m.itemName, 'price', m.price)) as items
FROM categories c
LEFT JOIN menu_items m ON c.categoryId = m.categoryId AND m.isActive = true
WHERE c.isActive = true
GROUP BY c.categoryId, c.categoryName
ORDER BY c.displayOrder;
```

### Kiểm tra bàn trống
```sql
WITH ActiveReservations AS (
  SELECT tableId, reservationTime, reservationTime + (duration || ' minutes')::interval as endTime
  FROM reservations
  WHERE reservationDate = $1 AND status IN ('confirmed', 'seated')
)
SELECT t.* FROM restaurant_tables t
WHERE NOT EXISTS (
  SELECT 1 FROM ActiveReservations ar
  WHERE ar.tableId = t.tableId
  AND $2 < ar.endTime AND ($2 + $3::interval) > ar.reservationTime
)
AND t.capacity >= $4 AND t.isActive = true;
```

### Danh sách đơn hàng đang hoạt động
```sql
SELECT o.*, t.tableNumber, s.fullName as waiterName,
  COUNT(oi.orderItemId) as itemCount, SUM(oi.totalPrice) as totalAmount
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.status NOT IN ('completed', 'cancelled')
GROUP BY o.orderId, t.tableNumber, s.fullName
ORDER BY o.orderTime DESC;
```

### Doanh thu theo ngày
```sql
SELECT DATE(createdAt) as date,
  COUNT(*) as totalBills,
  SUM(totalAmount) as totalRevenue,
  SUM(CASE WHEN paymentStatus = 'paid' THEN totalAmount ELSE 0 END) as paidRevenue
FROM bills
WHERE createdAt >= $1 AND createdAt < $2
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

### Món ăn bán chạy
```sql
SELECT m.itemId, m.itemName, COUNT(oi.orderItemId) as orderCount,
  SUM(oi.quantity) as totalQuantity, SUM(oi.totalPrice) as totalRevenue
FROM order_items oi
INNER JOIN menu_items m ON oi.itemId = m.itemId
INNER JOIN orders o ON oi.orderId = o.orderId
WHERE o.orderTime >= $1 AND o.orderTime < $2 AND o.status != 'cancelled'
GROUP BY m.itemId, m.itemName
ORDER BY totalQuantity DESC;
```

---

**Tài liệu được cập nhật lần cuối: 20/11/2025**  
**Dựa trên schema.prisma từ dự án**
