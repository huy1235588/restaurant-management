# Prisma - Restaurant Management Database

## Tổng quan

Dự án sử dụng Prisma ORM với PostgreSQL để quản lý database. Schema được định nghĩa trong file `schema.prisma` với các bảng chính: accounts, staff, categories, menu_items, restaurant_tables, reservations, orders, bills, v.v.

## Khởi tạo bảng (Database Setup)

### 1. Chuẩn bị môi trường

Trước khi khởi tạo bảng, đảm bảo:

- Database PostgreSQL đang chạy
- Biến môi trường `DATABASE_URL` được thiết lập trong file `.env`:
  ```
  DATABASE_URL="postgresql://restaurant_admin:restaurant_password@localhost:5432/restaurant_db?schema=public"
  ```
- Dependencies đã được cài đặt:
  ```bash
  cd server
  pnpm install
  ```

### 2. Tạo và áp dụng migrations

#### Chạy trên máy local (development)

```bash
# Tạo migration và áp dụng lên database
pnpm exec prisma migrate dev --name init

# Hoặc đẩy schema trực tiếp (không tạo lịch sử migration)
pnpm exec prisma db push

# Generate Prisma Client
pnpm run prisma:generate
```

#### Chạy với Docker Compose

Nếu sử dụng Docker:

```bash
# Khởi động database container
docker-compose up -d postgres redis

# Chạy migration trong container server
docker-compose run --rm server pnpm exec prisma migrate dev --name init

# Hoặc chạy script package.json
docker-compose run --rm server pnpm run prisma:migrate -- --name init
```

### 3. Kiểm tra kết quả

- Mở Prisma Studio để xem các bảng:
  ```bash
  pnpm run prisma:studio
  ```

- Kiểm tra kết nối database:
  ```bash
  pnpm exec prisma db pull
  ```

### 4. Lưu ý quan trọng

- **Development**: Sử dụng `prisma migrate dev` để tạo lịch sử migrations
- **Production**: Sử dụng `prisma migrate deploy` để áp dụng migrations đã tạo
- Nếu gặp lỗi kết nối, kiểm tra `DATABASE_URL` và trạng thái database
- Để reset database: `pnpm run prisma:reset` (cẩn thận, sẽ xóa toàn bộ dữ liệu)

## Hướng dẫn sử dụng

### 1. Cài đặt dependencies (nếu chưa có)

```bash
cd server
pnpm install
```

### 2. Chạy seed data

Có 3 cách để chạy seed:

#### Cách 1: Sử dụng Prisma CLI (Khuyến nghị)
```bash
pnpm prisma db seed
```

#### Cách 2: Sử dụng npm script
```bash
pnpm prisma:seed
```

#### Cách 3: Chạy trực tiếp file seed
```bash
pnpm ts-node prisma/seed.ts
```

### 3. Reset database và seed lại

Nếu muốn reset database về trạng thái ban đầu và seed lại:

```bash
pnpm prisma migrate reset
```

Lệnh này sẽ:
1. Xóa toàn bộ database
2. Tạo lại database
3. Chạy tất cả migrations
4. Tự động chạy seed

## Dữ liệu được tạo

### Tài khoản (Accounts)
- **7 tài khoản** với các vai trò khác nhau
- Mật khẩu cho tất cả: `admin123`

| Username   | Email                      | Role      |
|-----------|----------------------------|-----------|
| admin     | admin@restaurant.com       | admin     |
| manager01 | manager@restaurant.com     | manager   |
| waiter01  | waiter1@restaurant.com     | waiter    |
| waiter02  | waiter2@restaurant.com     | waiter    |
| chef01    | chef1@restaurant.com       | chef      |
| chef02    | chef2@restaurant.com       | chef      |
| cashier01 | cashier@restaurant.com     | cashier   |

### Nhân viên (Staff)
- **7 nhân viên** tương ứng với 7 tài khoản
- Thông tin đầy đủ: tên, địa chỉ, ngày sinh, ngày vào làm, lương

### Danh mục (Categories)
- **9 danh mục** món ăn:
  1. Khai vị
  2. Súp
  3. Salad
  4. Món chính
  5. Hải sản
  6. Mì & Cơm
  7. Tráng miệng
  8. Đồ uống
  9. Rượu & Bia

### Món ăn (Menu Items)
- **43 món ăn** đa dạng với thông tin chi tiết:
  - Mã món, tên món, giá bán, giá vốn
  - Mô tả, hình ảnh (URL)
  - Thời gian chuẩn bị
  - Độ cay (0-5)
  - Món chay/không
  - Lượng calo

### Bàn ăn (Tables)
- **15 bàn** phân bổ theo:
  - Tầng 1: 6 bàn Indoor, 3 bàn Outdoor
  - Tầng 2: 3 bàn VIP, 3 bàn Garden
  - Sức chứa từ 2-12 người

### Đặt bàn (Reservations)
- **2 đặt bàn mẫu** cho ngày mai:
  - 1 bàn thường (4 người)
  - 1 bàn VIP (8 người - tiệc sinh nhật)

## Lưu ý

- Seed sẽ **xóa toàn bộ dữ liệu cũ** trước khi tạo dữ liệu mới
- Chỉ nên chạy seed trong môi trường development
- **KHÔNG chạy seed trên production database!**

## Kiểm tra dữ liệu

Sau khi seed, bạn có thể:

1. **Sử dụng Prisma Studio**:
   ```bash
   pnpm prisma studio
   ```

2. **Kết nối trực tiếp database** và kiểm tra:
   ```sql
   SELECT COUNT(*) FROM accounts;
   SELECT COUNT(*) FROM menu_items;
   SELECT * FROM categories;
   ```

3. **Test API** với tài khoản đã tạo

## Troubleshooting

### Lỗi: Cannot find module '@prisma/client'
```bash
pnpm prisma generate
```

### Lỗi: Cannot find name 'process'
```bash
pnpm add -D @types/node
```

### Lỗi: Cannot find module 'bcryptjs'
```bash
pnpm add -D @types/bcryptjs
```

### Lỗi kết nối database
Kiểm tra file `.env` có đúng `DATABASE_URL` không:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"
```

## Tùy chỉnh dữ liệu seed

Để thêm hoặc sửa dữ liệu seed, chỉnh sửa file `prisma/seed.ts`:

1. Tìm phần tương ứng (ví dụ: Menu Items)
2. Thêm/sửa dữ liệu trong mảng
3. Chạy lại seed

```typescript
// Ví dụ: Thêm món ăn mới
await prisma.menuItem.create({
  data: {
    itemCode: 'MC006',
    itemName: 'Món mới',
    categoryId: categories[3].categoryId,
    price: 100000,
    // ... các trường khác
  },
});
```
