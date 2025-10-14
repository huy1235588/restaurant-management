# Restaurant Management System - API Documentation

## Tổng quan các API đã triển khai

Hệ thống quản lý nhà hàng hiện tại đã triển khai đầy đủ các API sau:

### 1. Authentication API (`/api/auth`)
- **POST** `/login` - Đăng nhập
- **POST** `/register` - Đăng ký tài khoản
- **POST** `/logout` - Đăng xuất
- **GET** `/me` - Lấy thông tin user hiện tại

### 2. Order API (`/api/orders`)
- **GET** `/` - Lấy danh sách tất cả orders
- **GET** `/:id` - Lấy chi tiết order
- **POST** `/` - Tạo order mới
- **PUT** `/:id` - Cập nhật order
- **PATCH** `/:id/status` - Cập nhật trạng thái order
- **DELETE** `/:id` - Xóa order

### 3. Bill API (`/api/bills`)
- **GET** `/` - Lấy danh sách tất cả bills
- **GET** `/:id` - Lấy chi tiết bill
- **POST** `/` - Tạo bill mới
- **PUT** `/:id` - Cập nhật bill
- **PATCH** `/:id/payment` - Xử lý thanh toán bill
- **DELETE** `/:id` - Xóa bill

### 4. Category API (`/api/categories`)
- **GET** `/` - Lấy danh sách tất cả categories
  - Query params: `isActive` (boolean)
- **GET** `/:id` - Lấy chi tiết category
- **GET** `/:id/items` - Lấy category với danh sách menu items
- **POST** `/` - Tạo category mới
  ```json
  {
    "categoryName": "string",
    "description": "string",
    "displayOrder": number,
    "isActive": boolean,
    "imageUrl": "string"
  }
  ```
- **PUT** `/:id` - Cập nhật category
- **DELETE** `/:id` - Xóa category

### 5. Menu API (`/api/menu`)
- **GET** `/` - Lấy danh sách tất cả menu items
  - Query params: `categoryId`, `isAvailable`, `isActive`, `search`
- **GET** `/:id` - Lấy chi tiết menu item
- **GET** `/code/:code` - Lấy menu item theo mã code
- **GET** `/category/:categoryId` - Lấy menu items theo category
- **POST** `/` - Tạo menu item mới
  ```json
  {
    "itemCode": "string",
    "itemName": "string",
    "categoryId": number,
    "price": number,
    "cost": number,
    "description": "string",
    "imageUrl": "string",
    "isAvailable": boolean,
    "preparationTime": number,
    "spicyLevel": number,
    "isVegetarian": boolean,
    "calories": number
  }
  ```
- **PUT** `/:id` - Cập nhật menu item
- **PATCH** `/:id/availability` - Cập nhật trạng thái availability
- **DELETE** `/:id` - Xóa menu item

### 6. Table API (`/api/tables`)
- **GET** `/` - Lấy danh sách tất cả tables
  - Query params: `status`, `floor`, `isActive`
- **GET** `/available` - Lấy danh sách tables đang trống
  - Query params: `capacity`, `floor`
- **GET** `/:id` - Lấy chi tiết table
- **GET** `/number/:number` - Lấy table theo số bàn
- **GET** `/:id/current-order` - Lấy table với order hiện tại
- **POST** `/` - Tạo table mới
  ```json
  {
    "tableNumber": "string",
    "tableName": "string",
    "capacity": number,
    "minCapacity": number,
    "floor": number,
    "section": "string",
    "status": "available|occupied|reserved|maintenance"
  }
  ```
- **PUT** `/:id` - Cập nhật table
- **PATCH** `/:id/status` - Cập nhật trạng thái table
- **DELETE** `/:id` - Xóa table

### 7. Reservation API (`/api/reservations`)
- **GET** `/` - Lấy danh sách tất cả reservations
  - Query params: `status`, `date`, `tableId`
- **GET** `/:id` - Lấy chi tiết reservation
- **GET** `/code/:code` - Lấy reservation theo mã code
- **GET** `/phone/:phone` - Lấy reservations theo số điện thoại
- **GET** `/check-availability` - Kiểm tra availability của table
  - Query params: `tableId`, `date`, `time`, `duration`
- **POST** `/` - Tạo reservation mới
  ```json
  {
    "customerName": "string",
    "phoneNumber": "string",
    "email": "string",
    "tableId": number,
    "reservationDate": "date",
    "reservationTime": "time",
    "duration": number,
    "headCount": number,
    "specialRequest": "string",
    "depositAmount": number
  }
  ```
- **PUT** `/:id` - Cập nhật reservation
- **PATCH** `/:id/cancel` - Hủy reservation
- **PATCH** `/:id/confirm` - Xác nhận reservation
- **PATCH** `/:id/seated` - Đánh dấu khách đã ngồi

### 8. Kitchen API (`/api/kitchen`)
- **GET** `/` - Lấy danh sách tất cả kitchen orders
  - Query params: `status`, `priority`
- **GET** `/pending` - Lấy danh sách orders đang chờ
- **GET** `/:id` - Lấy chi tiết kitchen order
- **GET** `/chef/:staffId` - Lấy orders của chef
- **POST** `/` - Tạo kitchen order mới
  ```json
  {
    "orderId": number,
    "staffId": number,
    "priority": number,
    "estimatedTime": number,
    "notes": "string"
  }
  ```
- **PUT** `/:id` - Cập nhật kitchen order
- **PATCH** `/:id/start` - Bắt đầu chuẩn bị order
- **PATCH** `/:id/complete` - Hoàn thành order
- **PATCH** `/:id/priority` - Cập nhật độ ưu tiên
- **PATCH** `/:id/assign` - Gán chef cho order

### 9. Staff API (`/api/staff`)
- **GET** `/` - Lấy danh sách tất cả staff
  - Query params: `role`, `isActive`
- **GET** `/:id` - Lấy chi tiết staff
- **GET** `/role/:role` - Lấy staff theo vai trò
  - Roles: `admin`, `manager`, `waiter`, `chef`, `bartender`, `cashier`
- **GET** `/:id/performance` - Lấy thống kê hiệu suất làm việc
  - Query params: `startDate`, `endDate`
- **POST** `/` - Tạo staff mới
  ```json
  {
    "accountId": number,
    "fullName": "string",
    "address": "string",
    "dateOfBirth": "date",
    "hireDate": "date",
    "salary": number,
    "role": "admin|manager|waiter|chef|bartender|cashier"
  }
  ```
- **PUT** `/:id` - Cập nhật thông tin staff
- **PATCH** `/:id/activate` - Kích hoạt staff
- **PATCH** `/:id/deactivate` - Vô hiệu hóa staff
- **PATCH** `/:id/role` - Cập nhật vai trò staff
- **DELETE** `/:id` - Xóa staff

### 10. Payment API (`/api/payments`)
- **GET** `/` - Lấy danh sách tất cả payments
  - Query params: `billId`, `status`, `paymentMethod`
- **GET** `/:id` - Lấy chi tiết payment
- **GET** `/bill/:billId` - Lấy payments của bill
- **GET** `/transaction/:transactionId` - Xác minh transaction
- **POST** `/` - Tạo payment mới
- **POST** `/process` - Xử lý thanh toán
  ```json
  {
    "billId": number,
    "paymentMethod": "cash|card|momo|bank_transfer",
    "amount": number,
    "transactionId": "string",
    "cardNumber": "string",
    "cardHolderName": "string"
  }
  ```
- **PATCH** `/:id/refund` - Hoàn tiền
- **PATCH** `/:id/cancel` - Hủy payment

## Authentication

Tất cả các API (trừ `/auth/login` và `/auth/register`) đều yêu cầu JWT token trong header:

```
Authorization: Bearer <token>
```

## Response Format

Tất cả các response đều có format chuẩn:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | array
}
```

## Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (chỉ trong development mode)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

Xem file `prisma/schema.prisma` để biết chi tiết về cấu trúc database.

## Enums

### OrderStatus
- `pending` - Đơn hàng đang chờ
- `confirmed` - Đã xác nhận
- `preparing` - Đang chuẩn bị
- `ready` - Sẵn sàng
- `served` - Đã phục vụ
- `cancelled` - Đã hủy

### TableStatus
- `available` - Trống
- `occupied` - Có khách
- `reserved` - Đã đặt trước
- `maintenance` - Đang bảo trì

### ReservationStatus
- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận
- `seated` - Đã ngồi
- `completed` - Hoàn thành
- `cancelled` - Đã hủy
- `no_show` - Không đến

### PaymentStatus
- `pending` - Chờ thanh toán
- `paid` - Đã thanh toán
- `refunded` - Đã hoàn tiền
- `cancelled` - Đã hủy

### PaymentMethod
- `cash` - Tiền mặt
- `card` - Thẻ
- `momo` - MoMo
- `bank_transfer` - Chuyển khoản

### Role
- `admin` - Quản trị viên
- `manager` - Quản lý
- `waiter` - Phục vụ
- `chef` - Đầu bếp
- `bartender` - Pha chế
- `cashier` - Thu ngân

## Ghi chú

- Tất cả các endpoint đều đã được protect bằng authentication middleware
- Các endpoint write (POST, PUT, PATCH, DELETE) có thể cần thêm authorization check dựa trên role
- Một số repository methods còn thiếu sẽ cần được implement (như `findByName`, `findByPhone`, `findAvailable`, v.v.)
