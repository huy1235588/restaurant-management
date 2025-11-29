## Why

Frontend hiện tại có sự không nhất quán trong việc sử dụng i18n:
- Một số module (tables, menu, reservations, orders, billing) sử dụng `useTranslation` hook nhưng không đầy đủ
- Một số module (categories, kitchen, products) có nhiều hardcoded strings chưa được i18n hóa
- Các file locale (en.json, vi.json) thiếu nhiều translation keys
- Mix giữa tiếng Anh và tiếng Việt trong cùng một file (ví dụ: Kitchen Display có keyboard help bằng tiếng Việt nhưng UI chính bằng tiếng Anh)

## What Changes

### Phase 1: Audit các module
- [ ] Kiểm tra từng module và liệt kê các hardcoded strings
- [ ] Xác định các translation keys còn thiếu
- [ ] Tạo danh sách chi tiết các thay đổi cần thực hiện cho từng module

### Phase 2: Cập nhật locale files
- [ ] Thêm các translation keys còn thiếu vào `en.json` và `vi.json`
- [ ] Chuẩn hóa naming convention cho translation keys
- [ ] Đảm bảo tất cả các keys có cả phiên bản EN và VI

### Phase 3: Refactor các module
- [ ] **categories module**: Thêm useTranslation và thay thế hardcoded strings
- [ ] **kitchen module**: Thêm useTranslation và thay thế hardcoded strings  
- [ ] **products module**: Thêm useTranslation và thay thế hardcoded strings
- [ ] **tables module**: Bổ sung các translation keys còn thiếu
- [ ] **menu module**: Kiểm tra và bổ sung các translation keys còn thiếu
- [ ] **order module**: Kiểm tra và bổ sung các translation keys còn thiếu
- [ ] **bills module**: Kiểm tra và bổ sung các translation keys còn thiếu
- [ ] **reservations module**: Kiểm tra và bổ sung các translation keys còn thiếu

### Phase 4: Quality Assurance
- [ ] Kiểm tra không còn hardcoded strings trong UI
- [ ] Kiểm tra chuyển đổi ngôn ngữ hoạt động đúng
- [ ] Kiểm tra fallback text hiển thị đúng

## Impact

- **Affected modules**: 
  - `app/client/src/modules/categories/` - Cần thêm i18n
  - `app/client/src/modules/kitchen/` - Cần thêm i18n
  - `app/client/src/modules/products/` - Cần thêm i18n
  - `app/client/src/modules/tables/` - Cần bổ sung keys
  - `app/client/src/modules/menu/` - Cần review
  - `app/client/src/modules/order/` - Cần review
  - `app/client/src/modules/bills/` - Cần review
  - `app/client/src/modules/reservations/` - Cần review

- **Affected locale files**:
  - `app/client/locales/en.json`
  - `app/client/locales/vi.json`

- **Độ ưu tiên**: Trung bình (không breaking change, chỉ cải thiện UX)

- **Rủi ro**: Thấp - chỉ thay đổi text hiển thị, không ảnh hưởng logic

## Scope của thay đổi

Đây là thay đổi **refactoring** và **enhancement** thuần túy:
- Không thay đổi business logic
- Không thay đổi API
- Không thay đổi database schema
- Không cần migration

## Kết quả mong đợi

Sau khi hoàn thành:
1. Tất cả các module sử dụng i18n một cách nhất quán
2. Người dùng có thể chuyển đổi giữa EN và VI mà không thấy text bị lẫn lộn
3. Code dễ bảo trì hơn với tất cả text tập trung trong locale files
4. Sẵn sàng để thêm các ngôn ngữ mới nếu cần trong tương lai
