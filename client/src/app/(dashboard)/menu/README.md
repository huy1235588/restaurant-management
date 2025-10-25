# Menu Management Page

## Mô tả
Trang quản lý thực đơn cho phép quản lý toàn bộ các món ăn trong nhà hàng với đầy đủ chức năng CRUD (Create, Read, Update, Delete).

## Tính năng

### 1. Danh sách món ăn
- Hiển thị danh sách tất cả món ăn dạng bảng
- Hiển thị hình ảnh, tên, mã, danh mục, giá, tình trạng
- Phân trang (10 món/trang)
- Responsive design

### 2. Tìm kiếm và lọc
- **Tìm kiếm**: Tìm kiếm theo tên hoặc mã món ăn
- **Lọc theo danh mục**: Lọc món ăn theo danh mục cụ thể
- **Lọc theo tình trạng**: Lọc món còn hàng/hết hàng

### 3. Thêm món ăn mới
- Form nhập đầy đủ thông tin món ăn:
  - Mã món (bắt buộc)
  - Tên món (bắt buộc)
  - Danh mục (bắt buộc)
  - Giá bán (bắt buộc)
  - Giá vốn (tùy chọn)
  - Mô tả
  - URL hình ảnh
  - Thời gian chuẩn bị
  - Độ cay (0-5)
  - Calories
  - Món chay (checkbox)
  - Tình trạng còn hàng (switch)
  - Trạng thái hoạt động (switch)
- Validation form đầy đủ
- Thông báo thành công/lỗi

### 4. Xem chi tiết món ăn
- Hiển thị đầy đủ thông tin món ăn
- Hiển thị hình ảnh lớn
- Tính toán và hiển thị lợi nhuận (nếu có giá vốn)
- Hiển thị các badge: món chay, độ cay, calories
- Hiển thị ngày tạo và cập nhật

### 5. Chỉnh sửa món ăn
- Form tương tự form thêm mới
- Tự động điền thông tin hiện tại
- Cập nhật realtime

### 6. Xóa món ăn
- Dialog xác nhận trước khi xóa
- Thông báo thành công/lỗi

### 7. Bật/tắt tình trạng còn hàng
- Toggle nhanh trạng thái còn hàng/hết hàng
- Cập nhật ngay lập tức không cần reload

## Components

### 1. `page.tsx`
Component chính của trang quản lý menu, bao gồm:
- State management cho danh sách, filters, pagination
- API calls để load, create, update, delete món ăn
- Dialog management
- UI layout chính

### 2. `MenuItemForm.tsx`
Component form để thêm/sửa món ăn:
- React Hook Form để quản lý form
- Validation rules
- Support cả create và edit mode
- Responsive layout

### 3. `MenuItemDetail.tsx`
Component hiển thị chi tiết món ăn:
- Layout 2 cột với hình ảnh
- Hiển thị tất cả thông tin
- Tính toán lợi nhuận
- Format currency và date

## API Integration

Sử dụng `menu.service.ts` với các endpoints:
- `getAll()`: Lấy danh sách món ăn (có pagination và filters)
- `getById()`: Lấy thông tin 1 món ăn
- `create()`: Tạo món ăn mới
- `update()`: Cập nhật món ăn
- `updateAvailability()`: Cập nhật tình trạng còn hàng
- `delete()`: Xóa món ăn

## UI Components từ shadcn/ui
- Button
- Input
- Select
- Card
- Table
- Dialog
- Alert Dialog
- Badge
- Form
- Textarea
- Switch
- Separator

## Internationalization (i18n)
Hỗ trợ đa ngôn ngữ (Tiếng Anh và Tiếng Việt) với các translation keys trong:
- `locales/en.json`
- `locales/vi.json`

## Styling
- Tailwind CSS
- Dark mode support
- Responsive design
- Consistent với design system

## Permissions
Yêu cầu quyền `menu.read` để xem trang (được kiểm tra ở layout)

## Screenshot Layout
```
┌─────────────────────────────────────────────────────────┐
│ Menu Management                          [+ Add Item]   │
│ Manage your restaurant menu items                       │
├─────────────────────────────────────────────────────────┤
│ Filters                                                  │
│ [Search...] [Category ▼] [Availability ▼]              │
├─────────────────────────────────────────────────────────┤
│ Menu Items (50)                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Code │ Name │ Category │ Price │ Avail │ Status │ │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ...  │ ...  │ ...      │ ...   │ ...   │ ...    │ │ │
│ └─────────────────────────────────────────────────────┘ │
│ Showing 1-10 of 50 items              [◀ Previous] [Next ▶] │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements
- [ ] Bulk import/export món ăn (CSV/Excel)
- [ ] Upload hình ảnh trực tiếp
- [ ] Quản lý nguyên liệu cho mỗi món
- [ ] Thiết lập combo/set meals
- [ ] Analytics và báo cáo món bán chạy
- [ ] In menu/QR code
