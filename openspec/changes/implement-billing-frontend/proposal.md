# Proposal: Triển Khai Thanh Toán Frontend

## Why

Backend billing API đã được triển khai đầy đủ (tạo hóa đơn, áp dụng giảm giá, xử lý thanh toán, hủy hóa đơn) nhưng frontend chưa có implementation. Module `billing/` trong client chỉ có cấu trúc thư mục rỗng. Cần triển khai giao diện thanh toán để nhân viên thu ngân và phục vụ có thể:
- Xem danh sách hóa đơn
- Tạo hóa đơn từ đơn hàng đã xác nhận
- Áp dụng giảm giá
- Xử lý thanh toán (tiền mặt, thẻ, ví điện tử, chuyển khoản)
- In hóa đơn

## What Changes

### Frontend (app/client)

1. **Types & Constants**
   - `types/billing.types.ts` - Bill, BillItem, Payment types
   - `constants/billing.constants.ts` - Messages, status configs

2. **Services**
   - `services/billing.service.ts` - API calls (CRUD bills, payments)

3. **Hooks**
   - `hooks/useBills.ts` - Fetch bills with filters & pagination
   - `hooks/useBill.ts` - Fetch single bill
   - `hooks/useBillMutations.ts` - Create, update, pay, void bills

4. **Components**
   - `components/BillCard.tsx` - Bill summary card
   - `components/BillItemList.tsx` - List of bill items
   - `components/BillSummary.tsx` - Subtotal, tax, discount, total
   - `components/PaymentMethodSelector.tsx` - Cash/Card/E-wallet/Transfer buttons

5. **Dialogs**
   - `dialogs/CreateBillDialog.tsx` - Tạo hóa đơn từ order
   - `dialogs/ApplyDiscountDialog.tsx` - Nhập giảm giá (% hoặc số tiền)
   - `dialogs/ProcessPaymentDialog.tsx` - Chọn phương thức và xử lý thanh toán
   - `dialogs/BillDetailDialog.tsx` - Xem chi tiết hóa đơn

6. **Views**
   - `views/BillListView.tsx` - Danh sách hóa đơn với filters
   - `views/BillDetailView.tsx` - Chi tiết hóa đơn

7. **Pages**
   - `app/(dashboard)/billing/page.tsx` - Trang quản lý hóa đơn
   - `app/(dashboard)/billing/[id]/page.tsx` - Chi tiết hóa đơn

8. **Integration với Order**
   - Thêm nút "Tạo hóa đơn" vào OrderCard khi status = "confirmed"
   - Sau khi thanh toán, cập nhật order status thành "completed"

## Impact

- **Affected specs**: Chưa có spec (sẽ tạo mới)
- **Affected code**:
  - `app/client/src/modules/billing/` - Toàn bộ module mới
  - `app/client/src/modules/order/components/OrderCard.tsx` - Thêm nút tạo hóa đơn
  - `app/client/src/app/(dashboard)/billing/` - Pages mới
  - `locales/en.json`, `locales/vi.json` - Thêm translations
- **Dependencies**: 
  - Backend billing API đã sẵn sàng
  - Sử dụng existing UI components (Button, Dialog, Input, etc.)
  - Pattern tương tự module `order` và `menu`
