# Implement Dashboard Overview

## Why
Trang Dashboard hiện tại chỉ hiển thị placeholder "Coming soon". Dashboard Overview là trang đầu tiên admin/manager thấy khi đăng nhập - cần cung cấp cái nhìn tổng quan về hoạt động nhà hàng trong ngày, giúp ra quyết định nhanh.

Khác biệt với Reports (phân tích chi tiết theo thời gian), Dashboard Overview tập trung vào:
- **Trạng thái hiện tại** (real-time): bàn trống, đơn đang xử lý, bếp
- **KPIs hôm nay**: doanh thu, đơn hàng, đặt bàn
- **Quick actions**: tạo đơn mới, xem đơn chờ xử lý
- **Hoạt động gần đây**: 5-10 đơn hàng/đặt bàn mới nhất

## What Changes

### Backend (NestJS)
- Tái sử dụng `ReportsService.getOverview()` cho KPIs
- Thêm endpoint `/dashboard/status` cho trạng thái real-time (tables, kitchen queue)
- Thêm endpoint `/dashboard/recent-activity` cho hoạt động gần đây

### Frontend (Next.js)
- Triển khai `DashboardView.tsx` trong `modules/admin/dashboard/`
- Tạo components:
  - `TodayStats.tsx` - KPI cards cho hôm nay
  - `TableOverview.tsx` - Tóm tắt trạng thái bàn
  - `KitchenQueue.tsx` - Số đơn đang chờ/đang làm trong bếp
  - `RecentActivity.tsx` - Timeline hoạt động gần đây
  - `QuickActions.tsx` - Buttons tắt cho các thao tác phổ biến
- Update page `/admin/dashboard/page.tsx`

### Phạm vi (Phù hợp đồ án)

1. **Today Stats (KPIs)**
   - Doanh thu hôm nay
   - Số đơn hàng hôm nay
   - Số đặt bàn hôm nay
   - So sánh với hôm qua (%)

2. **Real-time Status**
   - Trạng thái bàn: X available / Y occupied / Z reserved
   - Kitchen queue: X đơn pending, Y đơn preparing

3. **Quick Actions**
   - Tạo đơn hàng mới
   - Tạo đặt bàn mới
   - Xem Kitchen Display
   - Xem Reports

4. **Recent Activity**
   - 10 hoạt động gần nhất (đơn hàng, đặt bàn, thanh toán)
   - Timeline với timestamp

### Không bao gồm (Out of scope)
- WebSocket real-time updates (có thể thêm sau)
- Custom dashboard widgets/layouts
- Dashboard cho từng role khác nhau (chung 1 view)
- Notifications center (separate feature)

## Impact
- **Affected specs**: Thêm spec mới `dashboard-overview`
- **Affected code**:
  - `app/server/src/modules/dashboard/` (mới)
  - `app/client/src/modules/admin/dashboard/` (cập nhật - hiện trống)
  - `app/client/src/app/admin/dashboard/page.tsx` (cập nhật)
- **Dependencies**: 
  - Tái sử dụng logic từ `reports` module
  - Sử dụng types từ `tables`, `orders` modules
- **Database**: Chỉ đọc dữ liệu, không thay đổi schema
