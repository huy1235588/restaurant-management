# Tài Liệu Chi Tiết Quản Lý Menu và Danh Mục

> **Cập nhật**: Tài liệu này đã được cập nhật để phản ánh chính xác hệ thống đã triển khai.

---

## 1. Giới Thiệu

Hệ thống quản lý menu và danh mục là một phần thiết yếu của ứng dụng quản lý nhà hàng. Nó cho phép quản lý nhà hàng tạo, chỉnh sửa, xóa và quản lý các danh mục thực phẩm cũng như các món ăn trong menu. Hệ thống hỗ trợ quản lý giá cả, trạng thái sẵn có (isAvailable), trạng thái hoạt động (isActive), ảnh sản phẩm, và thông tin chi tiết về từng món ăn.

---

## 2. Các Thành Phần Chính

### 2.1 Danh Mục (Category)

-   **Định nghĩa**: Nhóm các món ăn theo loại (Khai vị, Chính, Tráng miệng, Đồ uống, v.v.)
-   **Mục đích**: Tổ chức menu một cách logic, giúp khách hàng dễ dàng tìm kiếm
-   **Thông tin chứa** (theo Prisma schema):
    -   `categoryId`: ID tự động tăng
    -   `categoryName`: Tên danh mục (unique, bắt buộc)
    -   `description`: Mô tả chi tiết (tùy chọn)
    -   `displayOrder`: Thứ tự hiển thị (default: 0)
    -   `isActive`: Trạng thái hoạt động (default: true)
    -   `imagePath`: Đường dẫn ảnh (tùy chọn)
    -   `createdAt`, `updatedAt`: Thời gian tạo/cập nhật

### 2.2 Sản Phẩm (MenuItem)

-   **Định nghĩa**: Các món ăn, đồ uống cụ thể trong menu
-   **Mục đích**: Hiển thị danh sách các lựa chọn cho khách hàng
-   **Thông tin chứa** (theo Prisma schema):
    -   `itemId`: ID tự động tăng
    -   `itemCode`: Mã sản phẩm (unique, bắt buộc)
    -   `itemName`: Tên món ăn (bắt buộc)
    -   `categoryId`: FK liên kết đến Category
    -   `price`: Giá bán (bắt buộc, Decimal)
    -   `cost`: Giá vốn (tùy chọn, Decimal)
    -   `description`: Mô tả (tùy chọn)
    -   `imagePath`: Đường dẫn ảnh (tùy chọn)
    -   `isAvailable`: Có sẵn để đặt (default: true)
    -   `isActive`: Hiển thị trên menu (default: true)
    -   `preparationTime`: Thời gian chuẩn bị (phút, tùy chọn)
    -   `spicyLevel`: Độ cay (none/mild/medium/hot/extra_hot)
    -   `isVegetarian`: Món chay (default: false)
    -   `calories`: Calories (tùy chọn)
    -   `displayOrder`: Thứ tự hiển thị (default: 0)
    -   `createdAt`, `updatedAt`: Thời gian tạo/cập nhật

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Danh Mục

#### 3.1.1 Tạo Danh Mục

**Mục tiêu**: Tạo một danh mục mới để phân loại các món ăn

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `POST /categories`

**Request Body** (CreateCategoryDto):
```json
{
  "categoryName": "Khai vị",
  "description": "Các món ăn nhẹ trước bữa chính",
  "displayOrder": 1,
  "imagePath": "/uploads/categories/khai-vi.jpg",
  "isActive": true
}
```

**Response** (201 Created):
```json
{
  "categoryId": 1,
  "categoryName": "Khai vị",
  "description": "Các món ăn nhẹ trước bữa chính",
  "displayOrder": 1,
  "isActive": true,
  "imagePath": "/uploads/categories/khai-vi.jpg",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng (Manager/Admin) truy cập vào phần "Quản Lý Menu" → "Danh Mục"
2. **Bước 2**: Nhấn nút "Tạo Danh Mục Mới"
3. **Bước 3**: Điền thông tin:
    - **categoryName**: Nhập tên (bắt buộc, unique)
    - **description**: Nhập mô tả chi tiết (tùy chọn)
    - **imagePath**: Upload ảnh (tùy chọn)
    - **displayOrder**: Thứ tự hiển thị (default: 0)
    - **isActive**: Chọn trạng thái (default: true)
4. **Bước 4**: Hệ thống validate qua CreateCategoryDto
5. **Bước 5**: Kiểm tra categoryName unique
6. **Bước 6**: Nếu hợp lệ, Prisma create Category
7. **Bước 7**: Trả về 201 Created với category data

**Xử lý lỗi**:

-   `409 Conflict`: categoryName đã tồn tại
-   `400 Bad Request`: categoryName bắt buộc
-   `401 Unauthorized`: Chưa đăng nhập
-   `403 Forbidden`: Không có quyền (không phải admin/manager)

---

#### 3.1.2 Xem Danh Sách Danh Mục

**Mục tiêu**: Xem toàn bộ danh mục hiện có trong hệ thống

**Người tham gia chính**: Tất cả (Public endpoint)

**API Endpoint**: `GET /categories`

**Response** (200 OK):
```json
[
  {
    "categoryId": 1,
    "categoryName": "Khai vị",
    "description": "Các món ăn nhẹ",
    "displayOrder": 1,
    "isActive": true,
    "imagePath": "/uploads/categories/khai-vi.jpg",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z",
    "_count": {
      "menuItems": 5
    }
  }
]
```

**Các endpoint liên quan**:
- `GET /categories/:id` - Lấy chi tiết danh mục
- `GET /categories/:id/items` - Lấy sản phẩm trong danh mục
- `GET /categories/count` - Đếm số danh mục

---

#### 3.1.3 Chỉnh Sửa Danh Mục

**Mục tiêu**: Cập nhật thông tin của danh mục hiện có

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `PUT /categories/:id`

**Request Body** (UpdateCategoryDto):
```json
{
  "categoryName": "Khai vị (Appetizers)",
  "description": "Cập nhật mô tả mới",
  "displayOrder": 2,
  "isActive": true
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách danh mục, nhấn nút "Sửa"
2. **Bước 2**: Mở form chỉnh sửa với thông tin hiện tại
3. **Bước 3**: Cập nhật thông tin cần thiết
4. **Bước 4**: Nếu thay đổi ảnh, StorageService xóa ảnh cũ
5. **Bước 5**: Hệ thống validate UpdateCategoryDto
6. **Bước 6**: Prisma update Category
7. **Bước 7**: Trả về 200 OK với category đã cập nhật

**Xử lý lỗi**:

-   `404 Not Found`: categoryId không tồn tại
-   `409 Conflict`: categoryName mới đã tồn tại

---

#### 3.1.4 Xóa Danh Mục

**Mục tiêu**: Xóa danh mục khỏi hệ thống

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `DELETE /categories/:id`

**Điều kiện tiên quyết**:

-   Danh mục không chứa sản phẩm nào
-   Người dùng có quyền admin/manager

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách danh mục, nhấn nút "Xóa"
2. **Bước 2**: Hiển thị dialog xác nhận
3. **Bước 3**: Gọi API DELETE /categories/:id
4. **Bước 4**: Service kiểm tra MenuItem liên quan
5. **Bước 5**: Nếu có sản phẩm → trả về lỗi 400
6. **Bước 6**: StorageService xóa ảnh (nếu có)
7. **Bước 7**: Prisma delete Category
8. **Bước 8**: Trả về 200 OK

**Xử lý lỗi**:

-   `400 Bad Request`: Danh mục còn chứa sản phẩm
-   `404 Not Found`: categoryId không tồn tại

---

### 3.2 Quản Lý Sản Phẩm (MenuItem)

#### 3.2.1 Tạo Sản Phẩm Mới

**Mục tiêu**: Thêm một món ăn/đồ uống mới vào menu

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `POST /menu`

**Request Body** (CreateMenuItemDto):
```json
{
  "itemCode": "PHO-001",
  "itemName": "Phở Bò Tái",
  "categoryId": 1,
  "price": 50000,
  "cost": 25000,
  "description": "Phở bò truyền thống với thịt bò tái",
  "imagePath": "/uploads/menu/pho-bo.jpg",
  "isAvailable": true,
  "isActive": true,
  "preparationTime": 15,
  "spicyLevel": "none",
  "isVegetarian": false,
  "calories": 450,
  "displayOrder": 1
}
```

**Response** (201 Created):
```json
{
  "itemId": 1,
  "itemCode": "PHO-001",
  "itemName": "Phở Bò Tái",
  "categoryId": 1,
  "price": "50000",
  "cost": "25000",
  "description": "Phở bò truyền thống với thịt bò tái",
  "imagePath": "/uploads/menu/pho-bo.jpg",
  "isAvailable": true,
  "isActive": true,
  "preparationTime": 15,
  "spicyLevel": "none",
  "isVegetarian": false,
  "calories": 450,
  "displayOrder": 1,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

**Thông tin cần nhập**:

| Trường           | Loại    | Bắt buộc | Mô tả                                           |
| ---------------- | ------- | -------- | ----------------------------------------------- |
| itemCode         | String  | ✓        | Mã sản phẩm (unique)                            |
| itemName         | String  | ✓        | Tên món ăn                                      |
| categoryId       | Int     | ✓        | ID danh mục                                     |
| price            | Decimal | ✓        | Giá bán (> 0)                                   |
| cost             | Decimal | ✗        | Giá vốn                                         |
| description      | String  | ✗        | Mô tả                                           |
| imagePath        | String  | ✗        | Đường dẫn ảnh                                   |
| isAvailable      | Boolean | ✗        | Có sẵn (default: true)                          |
| isActive         | Boolean | ✗        | Hoạt động (default: true)                       |
| preparationTime  | Int     | ✗        | Thời gian chuẩn bị (phút)                       |
| spicyLevel       | Enum    | ✗        | Độ cay: none/mild/medium/hot/extra_hot          |
| isVegetarian     | Boolean | ✗        | Món chay (default: false)                       |
| calories         | Int     | ✗        | Calories                                        |
| displayOrder     | Int     | ✗        | Thứ tự hiển thị (default: 0)                    |

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Menu" → Nhấn "Thêm Sản Phẩm"
2. **Bước 2**: Điền form với các trường bắt buộc
3. **Bước 3**: Upload ảnh (tùy chọn)
4. **Bước 4**: Submit form → POST /menu
5. **Bước 5**: Service validate:
   - itemCode unique
   - categoryId tồn tại
   - price > 0
6. **Bước 6**: Prisma create MenuItem
7. **Bước 7**: Trả về 201 Created

**Xử lý lỗi**:

-   `409 Conflict`: itemCode đã tồn tại
-   `400 Bad Request`: categoryId không tồn tại, price <= 0
-   `403 Forbidden`: Không có quyền admin/manager

---

#### 3.2.2 Xem Danh Sách Sản Phẩm

**Mục tiêu**: Xem các sản phẩm trong menu

**Người tham gia chính**: Tất cả (Public endpoint)

**API Endpoints**:
- `GET /menu` - Lấy tất cả sản phẩm
- `GET /menu/:id` - Lấy chi tiết sản phẩm theo ID
- `GET /menu/code/:code` - Lấy sản phẩm theo mã
- `GET /menu/category/:categoryId` - Lấy sản phẩm theo danh mục
- `GET /menu/count` - Đếm số sản phẩm

**Response** (200 OK):
```json
[
  {
    "itemId": 1,
    "itemCode": "PHO-001",
    "itemName": "Phở Bò Tái",
    "categoryId": 1,
    "price": "50000",
    "description": "Phở bò truyền thống",
    "imagePath": "/uploads/menu/pho-bo.jpg",
    "isAvailable": true,
    "isActive": true,
    "preparationTime": 15,
    "spicyLevel": "none",
    "isVegetarian": false,
    "calories": 450,
    "displayOrder": 1,
    "category": {
      "categoryId": 1,
      "categoryName": "Món chính"
    }
  }
]
```

---

#### 3.2.3 Chỉnh Sửa Sản Phẩm

**Mục tiêu**: Cập nhật thông tin sản phẩm

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `PUT /menu/:id`

**Request Body** (UpdateMenuItemDto):
```json
{
  "itemName": "Phở Bò Tái Nạm",
  "price": 55000,
  "description": "Cập nhật mô tả mới"
}
```

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách sản phẩm, nhấn nút "Sửa"
2. **Bước 2**: Mở form chỉnh sửa với dữ liệu hiện tại
3. **Bước 3**: Cập nhật thông tin cần thiết
4. **Bước 4**: Nếu thay đổi ảnh, StorageService xóa ảnh cũ
5. **Bước 5**: Submit PUT /menu/:id
6. **Bước 6**: Prisma update MenuItem
7. **Bước 7**: Trả về 200 OK

> **Lưu ý**: Hệ thống hiện tại **không lưu lịch sử giá**. Giá được cập nhật trực tiếp.

---

#### 3.2.4 Cập Nhật Trạng Thái Sẵn Có (Availability)

**Mục tiêu**: Đánh dấu sản phẩm có sẵn hoặc hết hàng

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `PATCH /menu/:id/availability`

**Request Body**:
```json
{
  "isAvailable": false
}
```

**Response** (200 OK):
```json
{
  "itemId": 1,
  "itemCode": "PHO-001",
  "itemName": "Phở Bò Tái",
  "isAvailable": false,
  "isActive": true,
  ...
}
```

**Giải thích trạng thái**:

| isActive | isAvailable | Hiển thị | Đặt được |
|----------|-------------|----------|----------|
| true     | true        | ✓        | ✓        |
| true     | false       | ✓        | ✗ (Hết hàng) |
| false    | *           | ✗        | ✗        |

---

#### 3.2.5 Ẩn/Hiển thị Sản Phẩm (Toggle isActive)

**Mục tiêu**: Tạm thời ẩn sản phẩm khỏi menu mà không xóa dữ liệu

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `PUT /menu/:id`

**Request Body**:
```json
{
  "isActive": false
}
```

**Khác biệt giữa isActive và isAvailable**:

-   **isAvailable=false**: Sản phẩm vẫn hiển thị nhưng không thể đặt (tạm hết hàng)
-   **isActive=false**: Sản phẩm không hiển thị trên menu (ẩn lâu dài)

---

#### 3.2.6 Xóa Sản Phẩm

**Mục tiêu**: Xóa sản phẩm khỏi hệ thống

**Người tham gia chính**: Manager, Admin

**API Endpoint**: `DELETE /menu/:id`

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách sản phẩm, nhấn nút "Xóa"
2. **Bước 2**: Hiển thị dialog xác nhận
3. **Bước 3**: Gọi API DELETE /menu/:id
4. **Bước 4**: Service kiểm tra MenuItem tồn tại
5. **Bước 5**: StorageService xóa ảnh (nếu có)
6. **Bước 6**: Prisma delete MenuItem
7. **Bước 7**: Trả về 200 OK

**Xử lý lỗi**:

-   `404 Not Found`: itemId không tồn tại

> **Lưu ý**: Nếu sản phẩm đang trong OrderItem, việc xóa có thể bị ràng buộc bởi foreign key.

---

### 3.3 Quản Lý Hình Ảnh Sản Phẩm

Hệ thống sử dụng `StorageService` để quản lý file ảnh.

#### 3.3.1 Tải Lên Ảnh

**Upload endpoint**: Sử dụng endpoint riêng hoặc đính kèm khi tạo/sửa Category/MenuItem

**Quy trình**:

1. Chọn ảnh từ máy tính
2. Upload lên server
3. StorageService lưu vào `/uploads` folder
4. Trả về `imagePath` để lưu vào database

#### 3.3.2 Xóa Ảnh

**Quy trình**:

1. Khi xóa Category/MenuItem, StorageService tự động xóa ảnh
2. Khi thay đổi ảnh, StorageService xóa ảnh cũ trước khi lưu ảnh mới

---

## 4. Quy Trình Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│        QUẢN LÝ MENU VÀ DANH MỤC - QUY TRÌNH TỔNG       │
└─────────────────────────────────────────────────────────┘

1. CHUẨN BỊ BAN ĐẦU
   └─ POST /categories - Tạo danh mục
      └─ Upload ảnh danh mục (imagePath)

2. THÊM SẢN PHẨM
   └─ POST /menu - Tạo sản phẩm mới
      ├─ itemCode (unique)
      ├─ itemName, categoryId, price
      ├─ Upload ảnh (imagePath)
      └─ isActive=true, isAvailable=true

3. QUẢN LÝ HÀNG NGÀY
   ├─ PATCH /menu/:id/availability - Toggle isAvailable
   ├─ PUT /menu/:id - Cập nhật thông tin
   └─ PUT /menu/:id - Toggle isActive (ẩn/hiển thị)

4. HIỂN THỊ CHO KHÁCH
   ├─ GET /menu - Lấy danh sách sản phẩm
   ├─ GET /categories - Lấy danh mục
   └─ Filter theo isActive=true

5. BẢO TRÌ
   ├─ PUT /menu/:id (isActive=false) - Ẩn sản phẩm
   ├─ PUT /menu/:id - Cập nhật thông tin
   ├─ DELETE /menu/:id - Xóa sản phẩm
   └─ DELETE /categories/:id - Xóa danh mục
```

---

## 5. Các Tác Nhân (Actors) và Quyền Hạn

| Tác Nhân | GET (Xem) | POST (Tạo) | PUT (Sửa) | DELETE (Xóa) | PATCH availability |
|----------|-----------|------------|-----------|--------------|---------------------|
| Public   | ✓         | ✗          | ✗         | ✗            | ✗                   |
| staff    | ✓         | ✗          | ✗         | ✗            | ✗                   |
| chef     | ✓         | ✗          | ✗         | ✗            | ✗                   |
| manager  | ✓         | ✓          | ✓         | ✓            | ✓                   |
| admin    | ✓         | ✓          | ✓         | ✓            | ✓                   |

---

## 6. Công Nghệ và Công Cụ

### 6.1 Công Nghệ Đã Triển Khai

-   **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
-   **State Management**: Zustand
-   **Backend**: NestJS, TypeScript
-   **Database**: PostgreSQL, Prisma ORM
-   **Storage**: Local filesystem (/uploads)
-   **API**: RESTful API
-   **Authentication**: JWT (Access Token 15 phút, Refresh Token 7 ngày)
-   **Authorization**: Role-based (admin, manager)

### 6.2 API Endpoints Summary

**Categories:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /categories | Lấy tất cả danh mục | Public |
| GET | /categories/:id | Lấy chi tiết danh mục | Public |
| GET | /categories/:id/items | Lấy sản phẩm trong danh mục | Public |
| GET | /categories/count | Đếm số danh mục | Public |
| POST | /categories | Tạo danh mục mới | admin, manager |
| PUT | /categories/:id | Cập nhật danh mục | admin, manager |
| DELETE | /categories/:id | Xóa danh mục | admin, manager |

**Menu Items:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /menu | Lấy tất cả món ăn | Public |
| GET | /menu/:id | Lấy chi tiết món | Public |
| GET | /menu/code/:code | Lấy món theo mã | Public |
| GET | /menu/category/:categoryId | Lấy món theo danh mục | Public |
| GET | /menu/count | Đếm số món | Public |
| POST | /menu | Tạo món mới | admin, manager |
| PUT | /menu/:id | Cập nhật món | admin, manager |
| PATCH | /menu/:id/availability | Toggle trạng thái sẵn có | admin, manager |
| DELETE | /menu/:id | Xóa món | admin, manager |

---

## 7. Bảng Tóm Tắt Lỗi và Xử Lý

| HTTP Code | Lỗi | Nguyên Nhân | Cách Xử Lý |
|-----------|-----|-------------|------------|
| 400 | Bad Request | categoryName/itemCode bắt buộc, price <= 0 | Kiểm tra dữ liệu đầu vào |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn | Đăng nhập lại |
| 403 | Forbidden | Không có quyền (role không phải admin/manager) | Liên hệ admin |
| 404 | Not Found | categoryId/itemId không tồn tại | Kiểm tra ID |
| 409 | Conflict | categoryName/itemCode đã tồn tại | Đổi tên/mã khác |

---

## 8. Tính Năng Chưa Triển Khai

> Các tính năng sau được thiết kế nhưng **chưa triển khai** trong phiên bản hiện tại:

| Tính năng | Mô tả | Trạng thái |
|-----------|-------|------------|
| Allergens Management | Quản lý thành phần gây dị ứng | ❌ Chưa triển khai |
| Price History | Lịch sử thay đổi giá | ❌ Chưa triển khai |
| Bulk Import/Export | Nhập/xuất từ Excel/CSV | ❌ Chưa triển khai |
| Scheduled Updates | Menu theo giờ/ngày | ❌ Chưa triển khai |
| Reports & Analytics | Báo cáo sản phẩm bán chạy | ❌ Chưa triển khai |
| Activity Logging | Ghi log hành động chi tiết | ❌ Chưa triển khai |

---

## 9. Tính Năng Nâng Cao (Trong Tương Lai)

-   **Allergens Management**: Quản lý thành phần gây dị ứng
-   **Price History Tracking**: Lịch sử thay đổi giá
-   **AI Recommendation**: Gợi ý sản phẩm dựa trên lịch sử đặt hàng
-   **Multi-language Menu**: Menu đa ngôn ngữ
-   **QR Code Menu**: Menu điện tử qua QR code
-   **Menu theo mùa**: Lên lịch menu theo mùa vụ
-   **Nutritional Info**: Thêm thông tin dinh dưỡng
-   **Recipe Management**: Quản lý công thức nấu
-   **Supplier Integration**: Tích hợp nhà cung cấp
-   **Inventory Tracking**: Theo dõi tồn kho chi tiết
-   **Bulk Import/Export**: Nhập/xuất hàng loạt từ Excel/CSV

---

## 10. Kết Luận

Hệ thống quản lý menu và danh mục hiện tại đã triển khai đầy đủ các chức năng CRUD cơ bản:

### Đã triển khai:
- ✅ CRUD Category với validation unique categoryName
- ✅ CRUD MenuItem với validation unique itemCode
- ✅ Upload/Delete ảnh qua StorageService
- ✅ Toggle availability (isAvailable) cho trạng thái hết hàng
- ✅ Toggle active status (isActive) cho ẩn/hiển thị
- ✅ Role-based access control (admin, manager)
- ✅ Các trường bổ sung: spicyLevel, isVegetarian, calories, preparationTime

### Chưa triển khai:
- ❌ Allergens management
- ❌ Price history tracking
- ❌ Reports & Analytics
- ❌ Bulk import/export
- ❌ Scheduled menu updates
- ❌ Activity logging

Tài liệu này phản ánh chính xác hệ thống đã triển khai và có thể được sử dụng làm tài liệu tham khảo cho báo cáo khóa luận.
