# Add Reports & Analytics Module

## Why
Đồ án tốt nghiệp cần chức năng báo cáo để demo khả năng phân tích dữ liệu kinh doanh nhà hàng. Hiện tại hệ thống chỉ có dữ liệu giao dịch nhưng chưa có trang báo cáo để quản lý xem tổng quan và phân tích hoạt động kinh doanh.

## What Changes

### Backend (NestJS)
- Thêm module `reports` với các endpoint báo cáo
- Tạo các service để aggregate dữ liệu từ các bảng hiện có

### Frontend (Next.js)
- Thêm trang `/reports` trong dashboard
- Tạo các component biểu đồ sử dụng Recharts (đã có trong project)
- Hỗ trợ lọc theo khoảng thời gian

### Phạm vi báo cáo (Phù hợp đồ án)

1. **Dashboard Overview** (Tổng quan)
   - Doanh thu hôm nay/tuần/tháng
   - Số đơn hàng
   - Số đặt bàn
   - Giá trị trung bình mỗi đơn

2. **Báo cáo Doanh thu**
   - Biểu đồ doanh thu theo ngày/tuần/tháng
   - Doanh thu theo phương thức thanh toán
   - So sánh với kỳ trước (nếu có dữ liệu)

3. **Báo cáo Món ăn**
   - Top 10 món bán chạy
   - Món bán chậm
   - Doanh thu theo danh mục

4. **Báo cáo Đơn hàng**
   - Số đơn theo trạng thái
   - Thời gian phục vụ trung bình
   - Đơn hàng theo giờ (phân tích giờ cao điểm)

### Không bao gồm (Out of scope cho đồ án)
- Xuất PDF/Excel (phức tạp, không cần thiết cho demo)
- Gửi email báo cáo tự động
- Báo cáo kho/inventory (chưa có module inventory)
- Báo cáo nhân viên chi tiết

## Impact
- **Affected specs**: Thêm spec mới `reports-analytics`
- **Affected code**:
  - `app/server/src/modules/reports/` (mới)
  - `app/client/src/app/(dashboard)/reports/` (mới)
  - `app/client/src/modules/admin/reports/` (mới)
- **Dependencies**: Sử dụng Recharts (đã có), date-fns (đã có)
- **Database**: Chỉ đọc dữ liệu, không thay đổi schema
