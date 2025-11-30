# Tasks - Add Reports & Analytics

## 1. Backend - Reports Module

- [x] 1.1 Tạo cấu trúc module `app/server/src/modules/reports/`
- [x] 1.2 Tạo DTOs cho query params và response types
- [x] 1.3 Implement `ReportsService` với các method:
  - [x] 1.3.1 `getOverview()` - KPIs tổng quan
  - [x] 1.3.2 `getRevenueReport()` - Doanh thu theo thời gian
  - [x] 1.3.3 `getTopItems()` - Top món bán chạy
  - [x] 1.3.4 `getOrdersReport()` - Phân tích đơn hàng
  - [x] 1.3.5 `getPaymentMethodsReport()` - Thống kê phương thức thanh toán
- [x] 1.4 Tạo `ReportsController` với các endpoints
- [x] 1.5 Thêm Swagger documentation cho API
- [x] 1.6 Register module trong `app.module.ts`

## 2. Frontend - Reports Module

- [x] 2.1 Tạo cấu trúc module `app/client/src/modules/admin/reports/`
- [x] 2.2 Định nghĩa types trong `types/report.types.ts`
- [x] 2.3 Tạo `reports.service.ts` với API calls
- [x] 2.4 Tạo hook `useReports.ts` cho data fetching

## 3. Frontend - Components

- [x] 3.1 Tạo `ReportCard.tsx` - Card hiển thị KPI
- [x] 3.2 Tạo `RevenueChart.tsx` - Biểu đồ doanh thu (Line/Bar)
- [x] 3.3 Tạo `TopItemsChart.tsx` - Top món bán chạy (Horizontal Bar)
- [x] 3.4 Tạo `PaymentMethodChart.tsx` - Pie chart phương thức thanh toán
- [x] 3.5 Tạo `OrdersChart.tsx` - Đơn hàng theo giờ/trạng thái
- [x] 3.6 Tạo `DateRangePicker.tsx` - Chọn khoảng thời gian

## 4. Frontend - Page & View

- [x] 4.1 Tạo `ReportsView.tsx` - Main view component
- [x] 4.2 Tạo page `app/client/src/app/admin/reports/page.tsx`
- [x] 4.3 Thêm menu item "Báo cáo" vào sidebar navigation (đã có sẵn)

## 5. Internationalization (i18n)

- [x] 5.1 Thêm translations cho tiếng Việt (`locales/vi.json`)
- [x] 5.2 Thêm translations cho tiếng Anh (`locales/en.json`)

## 6. Testing & Validation

- [ ] 6.1 Test API endpoints với Swagger UI
- [ ] 6.2 Test UI components với different date ranges
- [ ] 6.3 Verify responsive design trên mobile
- [ ] 6.4 Verify dark mode compatibility

## 7. Documentation

- [x] 7.1 Cập nhật README của module reports (backend)
- [x] 7.2 Tạo README cho module reports (frontend)

## 8. Finalization

- [x] 8.1 Run `openspec validate add-reports-analytics --strict`
- [ ] 8.2 Review và merge code
- [ ] 8.3 Archive change với `openspec archive add-reports-analytics`
