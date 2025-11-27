# Tasks: Triển Khai Thanh Toán Frontend

## 1. Foundation - Types, Constants, Services

- [x] 1.1 Tạo `types/billing.types.ts` với Bill, BillItem, Payment, PaymentMethod types
- [x] 1.2 Tạo `constants/billing.constants.ts` với messages, payment methods, status configs
- [x] 1.3 Tạo `services/billing.service.ts` với API calls:
  - `getBills(filters)` - GET /bills
  - `getBillById(id)` - GET /bills/:id
  - `createBill(orderId)` - POST /bills
  - `applyDiscount(id, data)` - PATCH /bills/:id/discount
  - `processPayment(id, data)` - POST /bills/:id/payment
  - `voidBill(id, reason)` - DELETE /bills/:id
- [x] 1.4 Tạo `index.ts` barrel exports

## 2. Hooks

- [x] 2.1 Tạo `hooks/useBills.ts` - useQuery cho danh sách hóa đơn với pagination
- [x] 2.2 Tạo `hooks/useBill.ts` - useQuery cho single bill với relations
- [x] 2.3 Tạo `hooks/useBillMutations.ts` - useMutation cho create, discount, payment, void
- [x] 2.4 Tạo `hooks/index.ts` exports

## 3. UI Components

- [x] 3.1 Tạo `components/BillCard.tsx` - Card hiển thị thông tin hóa đơn
  - Số hóa đơn, bàn, tổng tiền, trạng thái
  - Actions: Xem chi tiết, Thanh toán (nếu pending)
- [x] 3.2 Tạo `components/BillCardSkeleton.tsx` - Loading skeleton
- [x] 3.3 Tạo `components/BillItemList.tsx` - Danh sách món trong hóa đơn
- [x] 3.4 Tạo `components/BillSummary.tsx` - Tổng hợp: subtotal, tax, service, discount, total
- [x] 3.5 Tạo `components/PaymentMethodSelector.tsx` - 4 nút chọn phương thức
- [x] 3.6 Tạo `components/BillStatusBadge.tsx` - Badge cho trạng thái thanh toán
- [x] 3.7 Tạo `components/index.ts` exports

## 4. Dialogs

- [x] 4.1 Tạo `dialogs/CreateBillDialog.tsx`
  - Nhận orderId, hiển thị preview hóa đơn
  - Confirm để tạo hóa đơn
- [x] 4.2 Tạo `dialogs/ApplyDiscountDialog.tsx`
  - Input: Giảm theo % hoặc số tiền cố định
  - Input: Lý do giảm giá (required)
  - Preview tổng tiền mới
- [x] 4.3 Tạo `dialogs/ProcessPaymentDialog.tsx`
  - Chọn phương thức thanh toán
  - Input số tiền khách đưa (cash)
  - Hiển thị tiền thối
  - Card info fields (nếu card)
  - Confirm thanh toán
- [x] 4.4 Tạo `dialogs/BillDetailDialog.tsx`
  - Hiển thị full bill info
  - List items, summary, payment history
- [x] 4.5 Tạo `dialogs/VoidBillDialog.tsx` (admin only)
  - Input lý do hủy
  - Warning về side effects
- [x] 4.6 Tạo `dialogs/index.ts` exports

## 5. Views

- [x] 5.1 Tạo `views/BillListView.tsx`
  - Header với title và actions
  - Filters: status, date range, search
  - Grid of BillCards với pagination
  - Empty state
- [x] 5.2 Tạo `views/BillDetailView.tsx`
  - Full bill detail page
  - Actions: Apply discount, Process payment, Print, Void
- [x] 5.3 Tạo `views/index.ts` exports

## 6. Pages

- [x] 6.1 Tạo `app/(dashboard)/bills/page.tsx` - Trang danh sách hóa đơn
- [x] 6.2 Tạo `app/(dashboard)/bills/[id]/page.tsx` - Trang chi tiết hóa đơn
- [x] 6.3 Sidebar đã có menu item "Hóa đơn" (/bills)

## 7. Integration với Order Module

- [x] 7.1 Cập nhật `OrderCard.tsx` - Thêm nút "Tạo hóa đơn" khi status = "confirmed" hoặc "completed"
- [x] 7.2 Thêm `canCreateBill` helper function trong order utils

## 8. Translations

- [x] 8.1 Thêm billing translations vào `locales/en.json`
- [x] 8.2 Thêm billing translations vào `locales/vi.json`

## 9. Utils & Helpers

- [x] 9.1 Tạo `utils/billing.utils.ts`
  - `formatCurrency(amount)` - Format VND
  - `calculateChange(paid, total)` - Tính tiền thối
  - `getPaymentMethodLabel(method)` - Label cho phương thức

## 10. Testing & Documentation

- [x] 10.1 TypeScript compilation passed (npx tsc --noEmit)
- [ ] 10.2 Manual testing: Order → Create Bill → Apply Discount → Pay → Complete
- [ ] 10.3 Tạo `README.md` cho billing module (optional)

---

**Status:** ✅ Implementation Complete

**Files Created:**
- `modules/billing/types/billing.types.ts`
- `modules/billing/constants/billing.constants.ts`
- `modules/billing/services/billing.service.ts`
- `modules/billing/hooks/useBills.ts`
- `modules/billing/hooks/useBill.ts`
- `modules/billing/hooks/useBillMutations.ts`
- `modules/billing/utils/billing.utils.ts`
- `modules/billing/components/BillStatusBadge.tsx`
- `modules/billing/components/BillCard.tsx`
- `modules/billing/components/BillCardSkeleton.tsx`
- `modules/billing/components/BillItemList.tsx`
- `modules/billing/components/BillSummary.tsx`
- `modules/billing/components/PaymentMethodSelector.tsx`
- `modules/billing/dialogs/CreateBillDialog.tsx`
- `modules/billing/dialogs/ApplyDiscountDialog.tsx`
- `modules/billing/dialogs/ProcessPaymentDialog.tsx`
- `modules/billing/dialogs/BillDetailDialog.tsx`
- `modules/billing/dialogs/VoidBillDialog.tsx`
- `modules/billing/views/BillListView.tsx`
- `modules/billing/views/BillDetailView.tsx`
- `app/(dashboard)/bills/page.tsx`
- `app/(dashboard)/bills/[id]/page.tsx`
- `app/(dashboard)/bills/create/page.tsx`
- All index.ts barrel exports

**Files Modified:**
- `modules/order/components/OrderCard.tsx` - Added Create Bill button
- `modules/order/utils/order.utils.ts` - Added canCreateBill helper
- `locales/en.json` - Added billing translations
- `locales/vi.json` - Added billing translations
