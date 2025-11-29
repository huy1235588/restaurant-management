## 1. Audit Phase (Kiểm tra hiện trạng)

- [x] 1.1 Kiểm tra module `categories` - liệt kê hardcoded strings
- [x] 1.2 Kiểm tra module `kitchen` - liệt kê hardcoded strings  
- [x] 1.3 Kiểm tra module `products` - liệt kê hardcoded strings (thư mục views/components trống - skip)
- [x] 1.4 Kiểm tra module `tables` - đã có useTranslation
- [x] 1.5 Kiểm tra module `menu` - xác định missing translation keys
- [x] 1.6 Kiểm tra module `order` - đã có useTranslation 
- [x] 1.7 Kiểm tra module `bills` - đã có useTranslation
- [x] 1.8 Kiểm tra module `reservations` - xác định missing translation keys
- [x] 1.9 Tổng hợp danh sách tất cả translation keys cần thêm

## 2. Cập nhật Locale Files

- [x] 2.1 Thêm section `categories` vào en.json và vi.json
- [x] 2.2 Thêm/cập nhật section `kitchen` vào en.json và vi.json
- [x] 2.3 Thêm section `products` vào en.json và vi.json (không cần - dùng chung với menu)
- [x] 2.4 Bổ sung missing keys cho section `tables` (đã đầy đủ)
- [x] 2.5 Bổ sung missing keys cho section `menu`
- [x] 2.6 Bổ sung missing keys cho section `orders` (đã đầy đủ)
- [x] 2.7 Bổ sung missing keys cho section `bills/billing` (đã đầy đủ)
- [x] 2.8 Bổ sung missing keys cho section `reservations`
- [x] 2.9 Thêm section `common` cho các key dùng chung

## 3. Refactor Module Categories

- [x] 3.1 Thêm useTranslation hook vào CategoryList.tsx
- [x] 3.2 Thêm useTranslation hook vào CategoryCard.tsx
- [x] 3.3 Thêm useTranslation hook vào CategoryForm.tsx
- [x] 3.4 Thay thế tất cả hardcoded strings bằng t() function
- [ ] 3.5 Kiểm tra hiển thị với cả EN và VI

## 4. Refactor Module Kitchen

- [x] 4.1 Thêm useTranslation hook vào KitchenDisplayView.tsx
- [x] 4.2 Thêm useTranslation hook vào KitchenOrderCard.tsx
- [x] 4.3 Thêm useTranslation hook vào KitchenStats.tsx
- [x] 4.4 Thêm useTranslation hook vào các component khác (LoadingState, ErrorState, EmptyState, OrderStatusBadge, OrderItemsList, PrepTimeIndicator)
- [x] 4.5 Thay thế tất cả hardcoded strings bằng t() function
- [x] 4.6 Chuẩn hóa keyboard help dialog (đang mix EN/VI - fixed)
- [ ] 4.7 Kiểm tra hiển thị với cả EN và VI

## 5. Refactor Module Products

- [x] 5.1 Kiểm tra các component trong module products (thư mục trống - skip)
- [x] 5.2 Module products sử dụng components từ menu module
- [x] 5.3 Không cần refactor riêng
- [x] 5.4 N/A

## 6. Review và bổ sung các module đã có i18n

- [x] 6.1 Review module `tables` - đã có đầy đủ translations
- [x] 6.2 Review module `menu` - bổ sung missing keys và refactor components
- [x] 6.3 Review module `order` - refactored tất cả components và views:
  - OrderListView, OrderCard, OrderErrorBoundary, OrderSummaryCard, OrderItemList, OrderTimeline
  - ShoppingCart, KitchenStatusBadge, MenuItemSelector, TableSelector
  - EditOrderView, OrderDetailView, CreateOrderView
  - CancelOrderDialog, CancelItemDialog
- [x] 6.4 Review module `bills` - đã có đầy đủ translations
- [x] 6.5 Review module `reservations` - bổ sung missing keys và refactor components

## 7. Quality Assurance

- [x] 7.1 Grep để kiểm tra không còn hardcoded English/Vietnamese strings trong components
- [ ] 7.2 Kiểm tra chuyển đổi ngôn ngữ EN → VI hoạt động đúng
- [ ] 7.3 Kiểm tra chuyển đổi ngôn ngữ VI → EN hoạt động đúng
- [x] 7.4 Kiểm tra tất cả các translation keys có fallback text hợp lý
- [x] 7.5 Kiểm tra locale files có format JSON hợp lệ

## 8. Refactor các files ngoài modules

- [x] 8.1 Refactor ErrorBoundary.tsx - sử dụng i18n instance trực tiếp
- [x] 8.2 Refactor dashboard layout - thay thế "Verifying session..."
- [x] 8.3 Refactor dashboard page - thay thế "Dashboard" và "Coming soon..."
- [x] 8.4 Thêm section `errors` vào locale files
- [x] 8.5 Cập nhật title attributes (keyboard shortcuts) trong các views

## Dependencies

- Task 1.x phải hoàn thành trước khi bắt đầu Task 2.x
- Task 2.x phải hoàn thành trước khi bắt đầu Task 3.x, 4.x, 5.x, 6.x
- Task 3.x, 4.x, 5.x, 6.x có thể thực hiện song song
- Task 7.x phải thực hiện sau khi tất cả các task khác hoàn thành

## Ước tính thời gian

- Phase 1 (Audit): ~1-2 giờ
- Phase 2 (Locale files): ~2-3 giờ  
- Phase 3-6 (Refactor): ~4-6 giờ
- Phase 7 (QA): ~1 giờ

**Tổng cộng**: ~8-12 giờ làm việc
