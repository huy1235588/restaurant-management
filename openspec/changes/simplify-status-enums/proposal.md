# Simplify Status Enums

## Why

Hệ thống hiện tại có **quá nhiều status enum** gây ra sự phức tạp không cần thiết:

1. **OrderStatus** (7 trạng thái): pending → confirmed → preparing → ready → serving → completed → cancelled
2. **OrderItemStatus** (4 trạng thái): pending → preparing → ready → served → cancelled
3. **KitchenOrderStatus** (7 trạng thái): pending → confirmed → preparing → almost_ready → ready → completed → cancelled

**Vấn đề:**
- **Trùng lặp nghiệp vụ**: OrderStatus và KitchenOrderStatus có quá nhiều trạng thái chồng chéo (preparing, ready, etc.)
- **Khó đồng bộ**: 3 bảng với 3 bộ status riêng → dễ mất đồng bộ khi cập nhật
- **Logic phức tạp**: Phải xử lý 18+ trạng thái tổng cộng, nhiều chuyển đổi phức tạp
- **Frontend khó hiểu**: UI phải xử lý quá nhiều trường hợp status
- **Không khớp thực tế**: Nhà hàng thực tế chỉ cần 4-5 trạng thái chính

## What Changes

### 1. Đơn giản hóa OrderStatus (7 → 4 trạng thái)
**Trước:**
```prisma
enum OrderStatus {
    pending    // Mới tạo
    confirmed  // Đã xác nhận
    preparing  // Đang chuẩn bị ← DƯ THỪA (có KitchenOrder)
    ready      // Sẵn sàng ← DƯ THỪA (có KitchenOrder)
    serving    // Đang phục vụ ← DƯ THỪA
    completed  // Hoàn thành
    cancelled  // Đã hủy
}
```

**Sau:**
```prisma
enum OrderStatus {
    pending    // Mới tạo, chưa gửi bếp
    confirmed  // Đã gửi bếp, đang xử lý
    completed  // Hoàn thành (đã thanh toán)
    cancelled  // Đã hủy
}
```

### 2. Đơn giản hóa KitchenOrderStatus (7 → 4 trạng thái)
**Trước:**
```prisma
enum KitchenOrderStatus {
    pending      // Chờ xác nhận ← DƯ THỪA
    confirmed    // Đã xác nhận ← DƯ THỪA
    preparing    // Đang nấu
    almost_ready // Sắp xong ← DƯ THỪA (không cần thiết)
    ready        // Sẵn sàng
    completed    // Đã lấy
    cancelled    // Đã hủy
}
```

**Sau:**
```prisma
enum KitchenOrderStatus {
    pending    // Đơn mới, chờ đầu bếp bắt đầu
    preparing  // Đang nấu
    ready      // Món đã xong, chờ phục vụ lấy
    completed  // Đã phục vụ lấy đi
}
```

**Lưu ý**: Bỏ `cancelled` - khi Order bị hủy thì xóa KitchenOrder luôn (không cần status cancelled)

### 3. **BREAKING** Đơn giản hóa OrderItemStatus (4 → 3 trạng thái)
**Trước:**
```prisma
enum OrderItemStatus {
    pending    // Chưa bắt đầu
    preparing  // Đang nấu ← DƯ THỪA (có KitchenOrder)
    ready      // Đã xong
    served     // Đã phục vụ ← DƯ THỪA
    cancelled  // Đã hủy
}
```

**Sau:**
```prisma
enum OrderItemStatus {
    pending    // Chưa sẵn sàng (default)
    ready      // Đã sẵn sàng
    cancelled  // Đã hủy
}
```

### 4. Mapping logic mới

| Hành động | OrderStatus | KitchenOrderStatus | Ý nghĩa |
|-----------|-------------|-------------------|---------|
| Tạo đơn | `pending` | - | Đơn mới, chưa gửi bếp |
| Gửi bếp | `confirmed` | `pending` | Đã gửi bếp, chờ đầu bếp |
| Bếp bắt đầu | `confirmed` | `preparing` | Đang nấu |
| Món xong | `confirmed` | `ready` | Món đã xong, chờ lấy |
| Phục vụ lấy món | `confirmed` | `completed` | Đã mang ra bàn |
| Thanh toán xong | `completed` | `completed` | Hoàn thành đơn hàng |
| **Gọi thêm món** | `confirmed` | `pending` (new) | **Reopen order, tạo KitchenOrder mới** |
| Hủy đơn | `cancelled` | Xóa KitchenOrder | Đơn bị hủy |

### 5. Use Case: Khách gọi thêm món sau khi đã phục vụ

**Scenario:**
1. Khách đặt món A, B → Order (`confirmed`) → KitchenOrder (`completed`)
2. Khách gọi thêm món C

**Solution với status mới:**

**Current approach (giữ nguyên):**
- API endpoint: `POST /orders/:id/items` (addItemsToOrder)
- Logic:
  1. Thêm OrderItem mới (món C) vào Order hiện tại
  2. Nếu Order đã `completed` → đổi về `confirmed` (reopen)
  3. Tạo **KitchenOrder mới** với status `pending` cho món mới
  4. Món cũ (A, B) giữ nguyên status `ready`/`served`
  5. Món mới (C) có status `pending`

**Advantages:**
- ✅ Giữ nguyên logic hiện tại (đã implement)
- ✅ 1 Order cho toàn bộ bữa ăn → Bill đơn giản
- ✅ Tracking đầy đủ: biết món nào gọi lúc nào
- ✅ Kitchen nhận đơn mới rõ ràng

**Example Flow:**
```
Time 1: Order #123 created
- Items: [A, B] 
- Order.status: pending
- KitchenOrder: null

Time 2: Send to kitchen
- Order.status: confirmed
- KitchenOrder.status: pending

Time 3: Chef cooking
- Order.status: confirmed
- KitchenOrder.status: preparing

Time 4: Food ready
- Order.status: confirmed
- KitchenOrder.status: ready

Time 5: Waiter pickup
- Order.status: confirmed
- KitchenOrder.status: completed

Time 6: Payment (before adding items)
- Order.status: completed
- KitchenOrder.status: completed

Time 7: Customer wants more (Item C)
- POST /orders/123/items { items: [C] }
- Order.status: completed → confirmed (REOPEN)
- Old KitchenOrder: completed (archived)
- New KitchenOrder: pending (only Item C)
- Items A, B: status = ready
- Item C: status = pending

Time 8: Chef cooks Item C
- Order.status: confirmed
- New KitchenOrder.status: preparing

Time 9: Item C ready
- New KitchenOrder.status: ready

Time 10: Final payment
- Order.status: completed
- All KitchenOrders: completed
```

### 6. Migration Strategy
- Database migration để update existing records
- Update codebase (backend validation, frontend UI)
- Cập nhật documentation
- **Important:** Logic thêm món (addItemsToOrder) giữ nguyên - đã compatible

## Impact

**Affected specs:**
- `order-management`
- `kitchen-management`
- `billing-management` (phụ thuộc OrderStatus)

**Affected code:**
- Backend: `app/server/prisma/schema.prisma`
- Backend: `app/server/src/modules/order/`
- Backend: `app/server/src/modules/kitchen/`
- Frontend: `app/client/src/modules/order/`
- Frontend: `app/client/src/modules/kitchen/`
- Docs: `docs/architecture/DATABASE.md`

**Benefits:**
- ✅ Giảm 11 trạng thái → 11 trạng thái (50% reduction: 18 → 11)
- ✅ Logic đơn giản hơn, ít bug hơn
- ✅ Dễ maintain và extend
- ✅ Frontend dễ hiểu, ít UI states
- ✅ Khớp với quy trình thực tế của nhà hàng

**Migration effort:**
- Database: Medium (cần migration script)
- Backend: Medium (update DTOs, services, validation)
- Frontend: Medium (update UI components, constants)
- Testing: Medium (update test cases)
- Estimated: **3-5 days**
