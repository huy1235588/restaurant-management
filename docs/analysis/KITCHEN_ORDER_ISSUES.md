# Restaurant Management System - Issues Analysis

## 🚨 Vấn Đề Đã Phát Hiện

### 1. Kitchen và Order Module Issues

#### 1.1 Real-time Sync Issues
**Vấn đề:**
- Khi thêm món mới vào order đã nhận được notification
- Khi Order hoặc kitchen hủy đơn hàng, không có notification cho bên còn lại
- WebSocket events không đồng bộ giữa Order và Kitchen namespaces

**Ảnh hưởng:**
- Bếp không biết khi order thêm món
- Waiter không biết khi bếp hủy đơn
- Dữ liệu hiển thị không đồng nhất

#### 1.2 Luồng Dữ Liệu Không Hợp Lý
**Vấn đề:**
- Khi order thêm món mới vào đơn đã completed, OrderKitchen vẫn là completed
- Order chưa có link Reservation (thiếu reservationId trong Order table)
- Kitchen order được tạo ngay khi create order (nên tạo khi confirmed)

**Ảnh hưởng:**
- Logic nghiệp vụ không đúng
- Khó tracking order từ reservation
- Bếp nhận quá nhiều đơn không cần thiết

#### 1.3 Order Status Flow Quá Phức Tạp
**Vấn đề:**
- Quá nhiều trạng thái: pending → confirmed → preparing → ready → served → completed → cancelled
- Độ ưu tiên ở cả Order và KitchenOrder gây nhầm lẫn
- Không phù hợp với quy mô đồ án tốt nghiệp

**Đề xuất:**
- Đơn giản hóa flow: pending → confirmed → serving → completed
- Chỉ giữ priority ở KitchenOrder
- Bỏ OrderPriority enum

#### 1.4 UI/UX Issues
**Vấn đề:**
- Mã đơn hàng của kitchen và order không giống nhau
- Không có thống nhất trong cách hiển thị order number

---

### 2. Reservation System Issues

#### 2.1 Business Logic Validation
**Vấn đề phát hiện:**
- Validation quá nghiêm ngặt cho đồ án (MIN_ADVANCE_BOOKING = 30 phút, MAX = 90 ngày)
- Không có grace period cho late arrivals
- Thiếu automatic no-show marking sau khi quá thời gian

**Ảnh hưởng:**
- Khó test trong development
- Không linh hoạt cho demo

#### 2.2 Double Booking Prevention
**Tốt - không có vấn đề:**
- Có overlap detection với duration-based checking
- Table availability validation hoạt động đúng
- Reservation-to-Order linking đã implement

**Lưu ý:**
- Cần test kỹ concurrent reservations (optimistic locking)

---

### 3. Bill & Payment Issues

#### 3.1 Payment Logic Simplification
**Vấn đề:**
- Hỗ trợ partial payment nhưng không cần thiết cho đồ án
- Payment calculation có nhiều bước (tax, service charge, discount) - có thể đơn giản hóa
- Không có validation cho negative amounts

**Đề xuất:**
- Chỉ hỗ trợ full payment
- Đơn giản hóa calculation (có thể bỏ service charge)
- Add validation cho amount > 0

#### 3.2 Bill Number Format
**Vấn đề nhỏ:**
- Format BILL-XXXXXXXX có thể ngắn hơn cho dễ đọc
- Nên dùng date-based format: BILL-YYYYMMDD-XXX

---

### 4. Inventory Management - Missing Implementation

#### 4.1 Core Features Chưa Implement
**Phát hiện nghiêm trọng:**
- ❌ Không có code implementation cho Inventory module
- ❌ Chỉ có documentation chi tiết nhưng thiếu code
- ❌ Các table trong schema.prisma KHÔNG TỒN TẠI:
  - `ingredients`
  - `ingredient_categories`
  - `ingredient_batches`
  - `stock_transactions`
  - `stock_alerts`
  - `recipes`
  - `purchase_orders`
  - `suppliers`

**Ảnh hưởng:**
- Không thể quản lý nguyên liệu
- Không thể track ingredient usage
- Không có stock deduction khi order
- Missing major feature cho đồ án

**Đề xuất:**
- Option 1: Implement simplified inventory (khuyến nghị)
- Option 2: Remove from documentation nếu không implement

#### 4.2 Recipe & Auto-Deduction
**Documentation vs Reality:**
- Docs mô tả: Auto xuất kho khi order status = "preparing"
- Reality: Không có Recipe table, không có logic xuất kho

---

### 5. WebSocket Implementation Issues

#### 5.1 Namespace Organization
**Phát hiện:**
- Có 2 namespaces riêng: `/orders` và `/kitchen`
- Events emit độc lập, không sync giữa các namespace
- Thiếu centralized event emitter

**Ảnh hưởng:**
- Order events không đến kitchen
- Kitchen events không đến waiters
- Duplicate event handling logic

**Giải pháp:**
- Sử dụng SocketEmitterService đã có
- Emit to multiple rooms cùng lúc
- Standardize event names

#### 5.2 Event Naming Inconsistency
**Vấn đề:**
```
Order Gateway: order:created, order:updated, order:cancelled
Kitchen Gateway: kitchen:new_order, kitchen:order_update, kitchen:order_ready
Docs: order:new, kitchen:preparing, kitchen:ready
```

**Đề xuất:** Standardize theo pattern: `<module>:<action>`
- `order:created`, `order:confirmed`, `order:cancelled`
- `kitchen:new`, `kitchen:preparing`, `kitchen:ready`, `kitchen:completed`

---

### 6. Database Schema Issues

#### 6.1 Missing Columns
**Order table:**
- ❌ Thiếu `reservationId` để link với Reservation
- ✅ Đã có đầy đủ financial fields

**KitchenOrder table:**
- ✅ Đã có `orderId` UNIQUE (1:1 relationship)
- ⚠️ Có thể thêm `notes` field cho chef notes

#### 6.2 Enum Mismatches
**KitchenOrderStatus:**
```prisma
// Schema hiện tại
enum KitchenOrderStatus {
    pending
    preparing
    completed
    cancelled
}
```
- ✅ Đúng - đã simplified
- ⚠️ Docs còn mention "ready" status (cần update docs)

**OrderStatus:**
```prisma
enum OrderStatus {
    pending
    confirmed
    ready      // ← Không cần thiết
    serving
    completed
    cancelled
}
```
- ⚠️ Nên bỏ `ready` status

---

### 7. Code Quality Issues

#### 7.1 No TODO/FIXME Comments Found
**Tốt:** Code clean, không có technical debt markers

#### 7.2 Error Handling
**Phát hiện:**
- Reservation module có custom exceptions tốt
- Order/Kitchen module thiếu custom exceptions
- Generic BadRequestException được dùng nhiều

**Đề xuất:**
- Tạo custom exceptions cho Order module
- Consistent error messages

---

### 8. Frontend-Backend Type Mismatches

#### 8.1 KitchenOrder Interface
**Frontend (kitchen.types.ts):**
```typescript
status: 'pending' | 'preparing' | 'completed' | 'cancelled'
priority: 'low' | 'normal' | 'high' | 'urgent'
```

**Backend (Prisma):**
```prisma
enum KitchenOrderStatus { pending, preparing, completed, cancelled }
enum KitchenPriority { low, normal, high, urgent }
```
- ✅ Match hoàn toàn

#### 8.2 Order Interface  
**Cần check:**
- Frontend có đủ fields từ backend không
- Status enums có match không

---

## 📊 Tổng Kết Mức Độ Ưu Tiên

### 🔴 Critical (Phải fix ngay)
1. **Inventory module missing** - Core feature không có code
2. **Order-Reservation link missing** - Business logic thiếu
3. **WebSocket sync issues** - Real-time không hoạt động đúng

### 🟡 High (Nên fix)
4. **Kitchen order creation timing** - Tạo sai thời điểm
5. **WebSocket event naming** - Không consistent
6. **Order status flow** - Quá phức tạp

### 🟢 Medium (Có thể cải thiện)
7. **Payment simplification** - Đơn giản hóa cho đồ án
8. **Error handling** - Custom exceptions
9. **Bill number format** - UX improvement

### ⚪ Low (Nice to have)
10. **Reservation validation** - Quá strict
11. **UI/UX polish** - Order number display

---

## 🎯 Đề Xuất Hành Động

### Phase 1: Critical Fixes (Week 1)
1. ✅ Implement basic Inventory module (simplified)
2. ✅ Add reservationId to Order
3. ✅ Fix WebSocket sync (use SocketEmitterService)
4. ✅ Standardize event names

### Phase 2: High Priority (Week 2)  
5. ✅ Move kitchen order creation to confirmed status
6. ✅ Simplify order status flow
7. ✅ Add custom exceptions
8. ✅ Update documentation

### Phase 3: Improvements (Week 3)
9. ⚪ Simplify payment logic
10. ⚪ Improve UI/UX
11. ⚪ Add comprehensive testing

---

## 📝 Notes

- Đồ án tốt nghiệp - ưu tiên hoàn chỉnh features hơn là optimization
- Focus vào core workflows: Reservation → Order → Kitchen → Bill
- Real-time updates là điểm mạnh cần demonstrate
- Inventory có thể simplified (không cần full FIFO, batch tracking)