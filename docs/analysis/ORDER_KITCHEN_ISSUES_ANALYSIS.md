# Phân Tích Vấn Đề - Module Order và Kitchen

## 📋 Tổng Quan

Tài liệu này phân tích chi tiết các vấn đề và điểm yếu trong thiết kế và triển khai của hai module **Order Management** và **Kitchen Management** trong hệ thống quản lý nhà hàng.

**Ngày phân tích**: 23/11/2025  
**Phiên bản hệ thống**: v1.0  
**Người phân tích**: AI Assistant

---

## 🔍 Phương Pháp Phân Tích

Phân tích được thực hiện dựa trên:
1. **Code Review**: Đọc toàn bộ source code của modules Order và Kitchen
2. **API Documentation**: Phân tích tài liệu API ORDER_API.md và KITCHEN_API.md
3. **Database Schema**: Kiểm tra schema Prisma và các mối quan hệ
4. **Business Logic**: Đối chiếu với tài liệu use case ORDER_MANAGEMENT.md
5. **Implementation Review**: Kiểm tra code thực tế trong services, controllers, gateways

---

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG

### 1. **TRẠNG THÁI KHÔNG ĐỒNG BỘ GIỮA ORDER VÀ KITCHEN**

#### 📌 Mô Tả Vấn Đề

Có sự **mâu thuẫn và không đồng bộ** giữa trạng thái Order và KitchenOrder:

**Order Status Flow** (OrderStatus enum):
```
pending → confirmed → preparing → ready → serving → completed
   ↓         ↓           ↓          ↓        ↓
cancelled
```

**Kitchen Status Flow** (KitchenOrderStatus enum):
```
pending → ready → completed
   ↓
cancelled
```

#### 🔴 Vấn Đề Cụ Thể

1. **Thiếu trạng thái "preparing" trong Kitchen**
   - Order có trạng thái `preparing` (đang chuẩn bị)
   - Kitchen chỉ có `pending` và `ready`
   - Không có cách nào biết đầu bếp đang nấu món

2. **Mapping không nhất quán**
   - Khi Kitchen `startPreparing()` → Kitchen status = `ready` (SAI!)
   - Theo logic đúng phải là `preparing`
   - Code hiện tại:
   ```typescript
   // kitchen.service.ts line 144
   async startPreparing(kitchenOrderId: number, staffId?: number) {
       // ...
       const updated = await this.kitchenRepository.update(kitchenOrderId, {
           status: KitchenOrderStatus.ready, // ❌ SAI! Phải là "preparing"
           startedAt: new Date(),
           // ...
       });
   }
   ```

3. **Quá nhiều trạng thái trung gian**
   - Flow hiện tại: pending → preparing → ready → completed (4 bước)
   - Quá phức tạp cho dự án sinh viên
   - Bếp phải thao tác nhiều lần: nhận đơn → bắt đầu nấu → đánh dấu xong → hoàn thành

#### 💥 Hệ Quả

- Bếp phải thao tác quá nhiều lần (4 bước)
- Logic nghiệp vụ phức tạp không cần thiết
- Dễ gây nhầm lẫn giữa `ready` và `completed`
- Không phù hợp với quy mô dự án sinh viên

#### ✅ Giải Pháp Đề Xuất

**Thêm trạng thái "preparing" và loại bỏ "ready" để đơn giản hóa:**

```prisma
enum KitchenOrderStatus {
    pending    // Chờ đầu bếp nhận
    preparing  // ✅ THÊM MỚI: Đang nấu
    completed  // Đã hoàn thành và giao cho phục vụ
    cancelled  // Đã hủy
}
```

**Flow mới (Đơn giản cho dự án sinh viên):**
```
pending → preparing → completed
   ↓         ↓
cancelled
```

**Mapping rõ ràng:**
- `startPreparing()` → status = `preparing` (Bếp bắt đầu nấu)
- `completeOrder()` → status = `completed` (Món xong, giao cho phục vụ)
- `cancelOrder()` → status = `cancelled` (Hủy đơn)

**Lưu ý:** Loại bỏ trạng thái `ready` trung gian để đơn giản hóa. Bếp chỉ cần 2 thao tác chính:
1. Nhận đơn và bắt đầu nấu (`preparing`)
2. Hoàn thành và giao món (`completed`)

---

### 2. **LOGIC TẠO KITCHEN ORDER KHÔNG ĐÚNG**

#### 📌 Mô Tả Vấn Đề

Kitchen order được tạo **SAI thời điểm** và **thiếu xử lý**:

**Vấn đề 1: Tạo kitchen order khi tạo Order**
```typescript
// order.service.ts line 172-177
async createOrder(data: CreateOrderDto, staffId: number) {
    // ...
    const order = await this.prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({...});
        
        // ❌ Tạo kitchen order ngay lập tức
        await tx.kitchenOrder.create({
            data: {
                orderId: newOrder.orderId,
                status: KitchenOrderStatus.pending,
            },
        });
    });
}
```

**Theo tài liệu API và use case:**
- Kitchen order chỉ nên được tạo khi Order status = `confirmed`
- Không phải mọi order đều cần gửi bếp ngay (có thể chỉ order đồ uống)

**Vấn đề 2: Không có hàm createKitchenOrder riêng biệt**
- Có hàm `createKitchenOrder()` trong `kitchen.service.ts` nhưng **KHÔNG BAO GIỜ ĐƯỢC GỌI**
- Hàm này check điều kiện đúng (Order phải confirmed) nhưng không được sử dụng

```typescript
// kitchen.service.ts line 59
async createKitchenOrder(orderId: number) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({...});
    
    // ✅ Đúng: Check order phải confirmed
    if (order.status !== OrderStatus.confirmed) {
        throw new OrderNotConfirmedException(orderId, order.status);
    }
    
    // Nhưng hàm này KHÔNG BAO GIỜ được gọi!
}
```

#### 💥 Hệ Quả

- Tất cả order đều tạo kitchen order ngay lập tức (dù chưa confirmed)
- Kitchen nhận quá nhiều đơn không cần thiết
- Không thể phân biệt đơn nào cần gửi bếp, đơn nào không
- Logic nghiệp vụ sai so với tài liệu

#### ✅ Giải Pháp Đề Xuất

1. **Xóa việc tạo kitchen order trong createOrder()**
2. **Tạo kitchen order khi updateOrderStatus() → confirmed:**

```typescript
async updateOrderStatus(orderId: number, data: UpdateOrderStatusDto) {
    const order = await this.getOrderById(orderId);
    
    // Update order status
    const updatedOrder = await this.orderRepository.update(orderId, {
        status: data.status,
        confirmedAt: data.status === OrderStatus.confirmed ? new Date() : undefined,
    });
    
    // ✅ Tạo kitchen order khi confirmed
    if (data.status === OrderStatus.confirmed) {
        await this.kitchenService.createKitchenOrder(orderId);
    }
    
    return updatedOrder;
}
```

3. **Sử dụng hàm createKitchenOrder đã có sẵn trong KitchenService**

---

### 3. **WEBSOCKET EVENTS KHÔNG ĐỒNG NHẤT**

#### 📌 Mô Tả Vấn Đề

**Order Gateway** và **Kitchen Gateway** emit events khác nhau:

**Order Gateway** (order.gateway.ts):
```typescript
// Sử dụng SocketEmitterService - cấu trúc chuẩn
emitOrderCreated(order: OrderEventData): void {
    this.socketEmitter.emitOrderCreated(order);
}
```

**Kitchen Gateway** (kitchen.gateway.ts):
```typescript
// ❌ Emit trực tiếp - cấu trúc khác
emitNewOrder(order: Partial<KitchenOrder>) {
    this.server.emit('order:new', {
        event: 'order:new',
        data: order,
        timestamp: new Date().toISOString(),
    });
}
```

#### 🔴 Vấn Đề Cụ Thể

1. **Tên events không nhất quán:**
   - Order: `order:created`, `order:updated`, `order:cancelled`
   - Kitchen: `order:new`, `order:update`, `order:completed`
   - Frontend phải subscribe nhiều events khác nhau cho cùng một hành động

2. **Cấu trúc data khác nhau:**
   - Order events có type `OrderEventData`
   - Kitchen events có type `Partial<KitchenOrder>`

3. **Namespace riêng biệt:**
   - Order namespace: `/orders`
   - Kitchen namespace: `/kitchen`
   - Không có room hoặc broadcast chung

4. **Thiếu events quan trọng:**
   - Cần event `kitchen:preparing` (món bắt đầu nấu)
   - **Không cần** event riêng cho `ready` (gộp vào completed)

#### 💥 Hệ Quả

- Frontend khó đồng bộ dữ liệu
- Phải kết nối nhiều namespaces
- Logic xử lý events phức tạp
- Dễ miss events khi có thay đổi

#### ✅ Giải Pháp Đề Xuất

1. **Thống nhất cấu trúc events:**
```typescript
// Tất cả events đều có format:
{
    event: string;        // 'order:created', 'kitchen:preparing', etc.
    data: T;             // OrderEventData | KitchenEventData
    timestamp: string;   // ISO 8601
    source: 'order' | 'kitchen'; // Nguồn phát event
}
```

2. **Tên events theo convention (Đơn giản hóa):**
   - `order:created` - Đơn mới tạo
   - `order:confirmed` - Đơn đã xác nhận
   - `kitchen:preparing` - Bếp bắt đầu nấu
   - `kitchen:completed` - Món xong, sẵn sàng phục vụ
   - `order:cancelled` - Đơn bị hủy

3. **Sử dụng rooms để broadcast:**
```typescript
// Join rooms based on role
socket.join(`kitchen`);           // All kitchen staff
socket.join(`waiter:${staffId}`); // Specific waiter
socket.join(`table:${tableId}`);  // Specific table
```

---

### 4. **THIẾU VALIDATION VÀ BUSINESS RULES**

#### 📌 Mô Tả Vấn Đề

Nhiều business rules trong tài liệu **KHÔNG ĐƯỢC IMPLEMENT**:

#### 🔴 Vấn Đề Cụ Thể

1. **Không có priority system:**
   - Database có field `priority` (OrderPriority enum)
   - API doc nói có priority `urgent | high | normal | low`
   - Nhưng **KHÔNG BAO GIỜ SET** priority khi tạo kitchen order
   - Default luôn là `normal`

2. **Không validate status transitions:**
   - Có `KITCHEN_STATUS_FLOW` constant định nghĩa transitions hợp lệ
   - Có hàm `isValidStatusTransition()` trong helper
   - Nhưng **KHÔNG BAO GIỜ ĐƯỢC GỌI** để validate

```typescript
// Ví dụ: Có thể update bất kỳ status nào mà không check
async updateOrderStatus(orderId: number, data: UpdateOrderStatusDto) {
    // ❌ Không check transition hợp lệ
    const updatedOrder = await this.orderRepository.update(orderId, {
        status: data.status, // Có thể nhảy từ pending → completed (SAI!)
    });
}
```

#### 💥 Hệ Quả

- Dữ liệu không nhất quán
- Có thể tạo states không hợp lệ
- Priority luôn là `normal`, không ưu tiên đơn khẩn cấp

#### ✅ Giải Pháp Đề Xuất

**Implement đầy đủ business rules:**

```typescript
async updateOrderStatus(orderId: number, data: UpdateOrderStatusDto) {
    const order = await this.getOrderById(orderId);
    
    // ✅ Validate status transition
    if (!KitchenHelper.isValidStatusTransition(order.status, data.status)) {
        throw new InvalidStatusTransitionException(order.status, data.status);
    }
    
    // Update...
}

async createKitchenOrder(orderId: number, priority?: KitchenPriority) {
    // ✅ Set priority (mặc định: normal)
    const kitchenOrder = await this.kitchenRepository.create({
        orderId,
        status: KitchenOrderStatus.pending,
        priority: priority || 'normal',
    });
}
```

---

## ⚠️ VẤN ĐỀ QUAN TRỌNG

### 5. **DATABASE SCHEMA KHÔNG TỐI ƯU**

#### 📌 Mô Tả Vấn Đề

1. **Redundant fields trong Order:**
```prisma
model Order {
    totalAmount    Decimal // Tính từ orderItems
    discountAmount Decimal // Không dùng (nên ở Bill)
    taxAmount      Decimal // Không dùng (nên ở Bill)
    finalAmount    Decimal // Không dùng (nên ở Bill)
}
```
- Các field về thuế, giảm giá nên ở `Bill`, không phải `Order`
- `totalAmount` có thể tính động, không cần lưu

2. **Priority type không khớp:**
```prisma
// Database
priority OrderPriority // enum: normal | express | vip

// API Doc & Code
priority: 'low' | 'normal' | 'high' | 'urgent' // ❌ KHÁC NHAU!
```

#### ✅ Giải Pháp Đề Xuất

**Update Prisma schema:**
```prisma
model Order {
    // Xóa các field thuộc Bill
    // totalAmount Decimal // ❌ Xóa
    // discountAmount Decimal // ❌ Xóa
    // taxAmount Decimal // ❌ Xóa
    // finalAmount Decimal // ❌ Xóa
}

model KitchenOrder {
    kitchenOrderId   Int
    orderId          Int
    staffId          Int?
    status           KitchenOrderStatus
    priority         KitchenPriority
    prepTimeActual   Int? // Thời gian thực tế (tính từ startedAt → completedAt)
    startedAt        DateTime?
    completedAt      DateTime?
}

enum KitchenPriority {
    low      // ✅ Thay vì OrderPriority
    normal
    high
    urgent
}
```

---

### 6. **THIẾU XỬ LÝ EDGE CASES**

#### 📌 Mô Tả Vấn Đề

Nhiều tình huống đặc biệt không được xử lý:

1. **Thêm món khi order đang ở trạng thái serving:**
   - Code check `completed` và `cancelled` nhưng không check `serving`
   - Khách có thể gọi thêm khi đang ăn

2. **Hủy món khi đã serving:**
   - Logic chỉ check `completed` và `cancelled`
   - Không xử lý trường hợp món đã phục vụ nhưng khách không ăn

3. **Kitchen order bị orphan:**
   - Nếu Order bị xóa (soft delete) nhưng Kitchen order còn?
   - Không có cascade delete hoặc soft delete sync

4. **Duplicate kitchen orders:**
   - Có check `existing kitchen order` khi create
   - Nhưng không có unique constraint trong database

5. **Concurrent updates:**
   - Nhiều chef có thể claim cùng 1 order
   - Không có optimistic locking

#### ✅ Giải Pháp Đề Xuất

```typescript
// 1. Check serving status
async addItemsToOrder(orderId: number, data: AddItemsDto) {
    const order = await this.getOrderById(orderId);
    
    if ([OrderStatus.completed, OrderStatus.cancelled, OrderStatus.serving].includes(order.status)) {
        throw new CannotModifyOrderException(order.status);
    }
    // ...
}

// 2. Handle orphan kitchen orders
model KitchenOrder {
    order Order @relation(fields: [orderId], references: [orderId], onDelete: Cascade)
}

// 3. Unique constraint
model KitchenOrder {
    orderId Int @unique // ✅ 1 order chỉ có 1 kitchen order
}

// 4. Optimistic locking
async startPreparing(kitchenOrderId: number, staffId: number) {
    const result = await this.prisma.kitchenOrder.updateMany({
        where: {
            kitchenOrderId,
            chefId: null, // ✅ Chỉ update nếu chưa có chef
            status: KitchenOrderStatus.pending
        },
        data: {
            chefId: staffId,
            status: KitchenOrderStatus.preparing,
            startedAt: new Date()
        }
    });
    
    if (result.count === 0) {
        throw new OrderAlreadyClaimedException();
    }
}
```

---

### 7. **PERFORMANCE ISSUES**

#### 📌 Mô Tả Vấn Đề

1. **N+1 Query Problem:**
```typescript
// getAllKitchenOrders không có include relations
async getAllKitchenOrders(filters?: KitchenOrderFilters) {
    return this.kitchenRepository.findAll(filters);
}

// Frontend phải gọi nhiều requests để lấy order details
```

2. **Không có pagination cho kitchen orders:**
```typescript
// API doc nói có pagination, nhưng code không có
async getAllKitchenOrders(filters?: KitchenOrderFilters) {
    // ❌ Trả về TẤT CẢ orders, không phân trang
    return this.kitchenRepository.findAll(filters);
}
```

3. **Không cache frequently accessed data:**
   - Menu items (lấy mỗi lần tạo order)
   - Active orders (query liên tục)

4. **Inefficient WebSocket broadcasting:**
```typescript
// Broadcast tới TẤT CẢ clients thay vì specific rooms
this.server.emit('order:new', data); // ❌ Tất cả nhận
```

#### ✅ Giải Pháp Đề Xuất

```typescript
// 1. Include relations
async getAllKitchenOrders(filters?: KitchenOrderFilters) {
    return this.kitchenRepository.findAll({
        ...filters,
        include: {
            order: {
                include: {
                    table: true,
                    orderItems: {
                        include: { menuItem: true }
                    }
                }
            },
            chef: true
        }
    });
}

// 2. Add pagination
async getAllKitchenOrders(filters?: KitchenOrderFilters, page = 1, limit = 20) {
    return this.kitchenRepository.findAll({
        ...filters,
        skip: (page - 1) * limit,
        take: limit,
    });
}

// 3. Use Redis cache
@Cacheable({ ttl: 300 }) // 5 minutes
async getActiveOrders() {
    return this.orderRepository.findAll({
        where: { status: { not: OrderStatus.completed } }
    });
}

// 4. Target rooms
this.server.to('kitchen').emit('order:new', data); // ✅ Chỉ kitchen nhận
```

---

## 📊 TỔNG KẾT VẤN ĐỀ

### Mức Độ Nghiêm Trọng

| # | Vấn Đề | Mức Độ | Ảnh Hưởng | Độ Khó Sửa |
|---|--------|---------|-----------|------------|
| 1 | Trạng thái không đồng bộ Order-Kitchen | 🔴 Critical | Cao | Trung bình |
| 2 | Logic tạo Kitchen Order sai | 🔴 Critical | Cao | Dễ |
| 3 | WebSocket events không đồng nhất | 🟠 High | Trung bình | Trung bình |
| 4 | Thiếu validation và business rules | 🟠 High | Cao | Trung bình |
| 5 | Database schema không tối ưu | 🟡 Medium | Trung bình | Khó |
| 6 | Thiếu xử lý edge cases | 🟡 Medium | Trung bình | Dễ |
| 7 | Performance issues | 🟡 Medium | Cao | Trung bình |

### Thống Kê

- **Tổng số vấn đề**: 7 vấn đề chính
- **Critical**: 2 vấn đề (29%)
- **High**: 2 vấn đề (29%)
- **Medium**: 3 vấn đề (42%)

---

## 🎯 ƯU TIÊN SỬA CHỮA

### Phase 1: Critical Fixes (Tuần 1)
1. ✅ Thêm status `preparing` vào KitchenOrderStatus
2. ✅ Fix logic tạo kitchen order (chỉ khi confirmed)
3. ✅ Implement validation status transitions

### Phase 2: High Priority (Tuần 2)
4. ✅ Thống nhất WebSocket events structure
5. ✅ Implement business rules (priority, timeout, max concurrent)
6. ✅ Add pagination và optimize queries

### Phase 3: Medium Priority (Tuần 3-4)
7. ✅ Update database schema (migration)
8. ✅ Handle edge cases
9. ✅ Add caching layer
10. ✅ Improve error handling

---

## 📝 KẾT LUẬN

Hệ thống Order và Kitchen có **foundation tốt** nhưng cần **cải thiện đáng kể** để:

### ✅ Điểm Mạnh
- Cấu trúc module rõ ràng, tách biệt Order và Kitchen
- Có WebSocket real-time (dù chưa tối ưu)
- Có unit tests và error handling cơ bản
- Documentation đầy đủ (API docs, use cases)

### ❌ Điểm Yếu
- **Logic nghiệp vụ sai**: Status flow không đúng, tạo kitchen order sai thời điểm
- **Thiếu validation**: Nhiều business rules không được implement
- **Performance kém**: N+1 queries, không pagination, không cache
- **Không nhất quán**: Events, status, priority không đồng bộ
- **Edge cases**: Nhiều tình huống đặc biệt chưa xử lý

### 🎯 Mục Tiêu
Sau khi fix các vấn đề trên, hệ thống sẽ:
- ✅ Đồng bộ status giữa Order và Kitchen
- ✅ Logic nghiệp vụ đúng theo use case
- ✅ Performance tốt hơn (pagination, cache, optimize queries)
- ✅ Handle đầy đủ edge cases
- ✅ WebSocket events nhất quán
- ✅ Full validation và business rules

---

---

## 🎨 VẤN ĐỀ FRONTEND

### 8. **WEBSOCKET CONNECTION KHÔNG ĐỒNG BỘ GIỮA ORDER VÀ KITCHEN**

#### 📌 Mô Tả Vấn Đề

Frontend có 2 hook WebSocket **HOÀN TOÀN KHÁC NHAU** cho Order và Kitchen:

**Order Module** (`useOrderSocket.ts`):
```typescript
// Singleton pattern - chia sẻ socket instance
let globalSocket: Socket | null = null;
let socketRefCount = 0;

// Connect tới base URL (không có namespace)
globalSocket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    // ...
});

// Listen events:
socket.on("order:created", handleOrderCreated);
socket.on("order:updated", handleOrderUpdated);
socket.on("kitchen:order-ready", handleKitchenReady);
```

**Kitchen Module** (`useKitchenSocket.ts`):
```typescript
// Tạo socket mới mỗi component - KHÔNG SINGLETON
const socket = io(`${SOCKET_URL}/kitchen`, { // ❌ Namespace khác
    transports: ["websocket", "polling"],
    // ...
});

// Listen events:
socket.on(KitchenSocketEvents.NEW_ORDER, handleNewOrder); // order:new
socket.on(KitchenSocketEvents.ORDER_UPDATED, handleOrderUpdate);
```

#### 🔴 Vấn Đề Cụ Thể

1. **Namespace không khớp với backend:**
   - Backend Order Gateway: namespace = `/orders`
   - Backend Kitchen Gateway: namespace = `/kitchen`
   - Frontend Order: connect tới base URL (sai!)
   - Frontend Kitchen: connect tới `/kitchen` (đúng)

2. **Event names không nhất quán:**
   ```typescript
   // Frontend Order listen
   "order:created"        // ❌ Backend emit gì?
   "order:updated"
   "kitchen:order-ready"  // ❌ Backend không emit event này
   
   // Frontend Kitchen listen
   "order:new"           // ✅ Match backend
   "order:update"        // ✅ Match backend
   "order:completed"     // ✅ Match backend
   ```

3. **Singleton vs Non-singleton:**
   - Order module dùng singleton pattern (tốt)
   - Kitchen module tạo socket mới mỗi component (waste resources)

4. **Missing events:**
   - Backend emit `kitchen:order_ready` nhưng frontend Order listen `kitchen:order-ready` (dash vs underscore)
   - Backend emit `kitchen:order_update` nhưng không ai listen

#### 💥 Hệ Quả

- Order module **KHÔNG NHẬN ĐƯỢC EVENTS** từ backend (sai namespace)
- Kitchen module hoạt động nhưng không tối ưu (tạo nhiều connections)
- Real-time updates không hoạt động cho Order
- Lãng phí tài nguyên (multiple connections thay vì 1)

#### ✅ Giải Pháp Đề Xuất

**1. Fix Order namespace:**
```typescript
// useOrderSocket.ts
const socket = io(`${SOCKET_URL}/orders`, { // ✅ Thêm namespace
    transports: ["websocket", "polling"],
    // ...
});
```

**2. Thống nhất event names:**
```typescript
// Backend phải emit với underscore
this.server.to('orders').emit('kitchen:order_ready', data);

// Frontend listen đúng tên
socket.on('kitchen:order_ready', handleKitchenReady);
```

**3. Dùng singleton cho Kitchen:**
```typescript
// useKitchenSocket.ts - apply singleton pattern như Order
let globalKitchenSocket: Socket | null = null;
let kitchenSocketRefCount = 0;
```

---

### 9. **TYPE DEFINITIONS KHÔNG KHỚP GIỮA FRONTEND-BACKEND**

#### 📌 Mô Tả Vấn Đề

**Frontend Order Types** (`order.types.ts`):
```typescript
export interface Order {
    orderId: number;
    orderNumber: string;
    // Financial fields
    totalAmount: number;      // ❌ Backend trả về Decimal → string
    discountAmount: number;   // ❌ Backend trả về Decimal → string
    taxAmount: number;        // ❌ Backend trả về Decimal → string
    finalAmount: number;      // ❌ Backend trả về Decimal → string
}
```

**Backend Response:**
```typescript
// Prisma Decimal được serialize thành string
{
    totalAmount: "150000.00",    // String, không phải number!
    discountAmount: "0.00",
    taxAmount: "15000.00",
    finalAmount: "165000.00"
}
```

**Frontend Kitchen Types** (`kitchen.types.ts`):
```typescript
export enum KitchenOrderStatus {
    PENDING = "pending",
    READY = "ready",      // ❌ Thiếu "preparing"
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export type KitchenPriority = "low" | "normal" | "high" | "urgent";
// ✅ Đúng với backend
```

#### 🔴 Vấn Đề Cụ Thể

1. **Number vs String mismatch:**
   - Frontend expect `number` cho financial fields
   - Backend trả về `string` (Prisma Decimal)
   - Runtime errors khi tính toán: `"150000" + 1000 = "1500001000"`

2. **Missing status "preparing" và thừa status "ready":**
   - Backend (sau khi fix) sẽ có status `preparing`
   - Frontend có status `ready` không cần thiết (loại bỏ)
   - UI cần cập nhật: chỉ hiển thị pending → preparing → completed

3. **OrderItemStatus mismatch:**
   ```typescript
   // Frontend
   type OrderItemStatus = "pending" | "ready" | "served" | "cancelled";
   
   // Backend (Prisma schema)
   enum OrderItemStatus {
       pending
       ready    // ❌ Backend không có, có "active" thay vì "ready"
       served
       cancelled
   }
   ```

4. **WebSocket event types:**
   ```typescript
   // Frontend định nghĩa events nhưng structure khác backend
   export interface OrderCreatedEvent {
       orderId: number;
       orderNumber: string;
       // ... missing fields
   }
   
   // Backend emit toàn bộ order object
   ```

#### 💥 Hệ Quả

- Type errors at runtime
- Calculations sai (string concatenation thay vì addition)
- UI hiển thị sai data
- Missing status colors/labels

#### ✅ Giải Pháp Đề Xuất

**1. Fix financial types:**
```typescript
// order.types.ts
export interface Order {
    // Use string for Decimal fields, convert when needed
    totalAmount: string;
    discountAmount: string;
    taxAmount: string;
    finalAmount: string;
}

// Helper function to convert
export const parseDecimal = (value: string): number => {
    return parseFloat(value) || 0;
};
```

**2. Update enums to match backend:**
```typescript
export enum KitchenOrderStatus {
    PENDING = "pending",
    PREPARING = "preparing",  // ✅ Thêm
    COMPLETED = "completed",  // ✅ Gộp ready + completed
    CANCELLED = "cancelled",
}

export enum OrderItemStatus {
    PENDING = "pending",
    ACTIVE = "active",     // ✅ Sửa từ "ready" → "active"
    SERVED = "served",
    CANCELLED = "cancelled",
}
```

**3. Generate types from backend:**
```typescript
// Use tool to auto-generate types from Prisma schema
// Or create shared types package
```

---

### 10. **VALIDATION SCHEMAS KHÔNG ĐẦY ĐỦ**

#### 📌 Mô Tả Vấn Đề

**Order Schemas** (`order.schemas.ts`):
```typescript
export const step2CustomerSchema = z.object({
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),  // ❌ Không validate format
    partySize: z.number().min(1),          // ❌ Không có max
    specialRequests: z.string().optional(),
});
```

**Backend Validation:**
```typescript
// DTO có validation đầy đủ hơn
@IsString()
@Length(10, 11)
@Matches(/^[0-9]+$/)
customerPhone?: string;

@IsInt()
@Min(1)
@Max(50)
partySize: number;
```

#### 🔴 Vấn Đề Cụ Thể

1. **Phone validation:**
   - Frontend không validate phone format
   - Backend reject → poor UX (submit mới biết sai)

2. **Missing constraints:**
   - `partySize` không có max (có thể nhập 999999)
   - `specialRequests` không có max length
   - `quantity` không validate (có thể nhập số âm)

3. **No real-time validation:**
   - Chỉ validate khi submit form
   - Không có feedback ngay lập tức

4. **Missing required fields:**
   ```typescript
   // CreateOrderDto backend
   @IsNotEmpty()
   tableId: number;         // Required
   
   @ArrayMinSize(1)
   items: OrderItemInput[]; // Required
   
   // Frontend schema thiếu @IsNotEmpty equivalent
   ```

#### ✅ Giải Pháp Đề Xuất

```typescript
export const step2CustomerSchema = z.object({
    customerName: z.string().max(100).optional(),
    customerPhone: z
        .string()
        .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .optional(),
    partySize: z.number().int().min(1).max(50),
    specialRequests: z.string().max(500).optional(),
});

export const createOrderItemSchema = z.object({
    itemId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
    specialRequest: z.string().max(200).optional(),
});
```

---

### 11. **ERROR HANDLING KHÔNG NHẤT QUÁN**

#### 📌 Mô Tả Vấn Đề

**Order Service:**
```typescript
// order.service.ts
export const orderApi = {
    create: async (data: CreateOrderDto): Promise<Order> => {
        // ❌ Không có try-catch
        const response = await axiosInstance.post<ApiResponse<Order>>(
            "/orders",
            data
        );
        return response.data.data;
    },
}
```

**Kitchen Service:**
```typescript
// kitchen.service.ts
export const kitchenApi = {
    async startPreparing(id: number): Promise<KitchenOrder> {
        // ❌ Cũng không có try-catch
        const response = await axiosInstance.patch(`/kitchen/orders/${id}/start`);
        return response.data.data || response.data;
    },
}
```

**React Query Hooks:**
```typescript
// useCreateOrder.ts
export function useCreateOrder() {
    const router = useRouter();
    
    return useMutation({
        mutationFn: orderApi.create,
        onSuccess: (order) => {
            toast.success('Đơn hàng đã được tạo thành công!');
            router.push(`/orders/${order.orderId}`);
        },
        // ❌ Không có onError - error không được handle
    });
}
```

#### 🔴 Vấn Đề Cụ Thể

1. **No error handling trong services:**
   - Errors được throw nhưng không được catch
   - Không parse error messages từ backend

2. **Inconsistent error display:**
   - Một số mutation có `onError`, một số không
   - Toast notifications không nhất quán
   - Không có error boundary

3. **Poor error messages:**
   ```typescript
   // Backend trả về:
   {
       message: "Table already has an active order",
       error: "Table Occupied",
       statusCode: 409,
       existingOrderNumber: "ORD-00000456"
   }
   
   // Frontend chỉ show: "Error" (generic message)
   ```

4. **No retry logic:**
   - Network errors không tự retry
   - User phải manually refresh

#### ✅ Giải Pháp Đề Xuất

**1. Add error interceptor:**
```typescript
// axios.ts
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Đã có lỗi xảy ra';
        toast.error(message);
        return Promise.reject(error);
    }
);
```

**2. Consistent error handling in hooks:**
```typescript
export function useCreateOrder() {
    const queryClient = useQueryClient();
    const router = useRouter();
    
    return useMutation({
        mutationFn: orderApi.create,
        onSuccess: (order) => {
            toast.success('Đơn hàng đã được tạo thành công!');
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            router.push(`/orders/${order.orderId}`);
        },
        onError: (error: AxiosError<ApiError>) => {
            const message = error.response?.data?.message || 'Không thể tạo đơn hàng';
            toast.error(message);
        },
        retry: 1, // Retry once on failure
    });
}
```

**3. Error boundary component:**
```typescript
export function OrderErrorBoundary({ children }) {
    return (
        <ErrorBoundary
            fallback={<ErrorState />}
            onError={(error) => {
                console.error('Order error:', error);
                toast.error('Đã có lỗi xảy ra');
            }}
        >
            {children}
        </ErrorBoundary>
    );
}
```

---

### 12. **PERFORMANCE ISSUES TRONG FRONTEND**

#### 📌 Mô Tả Vấn Đề

**1. Unnecessary re-renders:**
```typescript
// CreateOrderView.tsx
export function CreateOrderView() {
    const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    
    // ❌ Mỗi lần cartItems thay đổi → re-render toàn bộ component
    // ❌ Tất cả steps re-render dù chỉ 1 step active
    
    useEffect(() => {
        // ❌ Save tới localStorage mỗi lần state change
        if (hasUnsavedChanges) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        }
    }, [currentStep, selectedTableId, cartItems, customerForm, hasUnsavedChanges]);
}
```

**2. No memoization:**
```typescript
// KitchenDisplayView.tsx
const filteredOrders = orders
    ? KitchenHelpers.sortOrdersByPriority(
        KitchenHelpers.filterOrdersByPriority(
            KitchenHelpers.filterOrdersByStatus(orders, statusFilter),
            priorityFilter
        )
    )
    : [];
// ❌ Tính lại mỗi render, dù orders/filters không đổi
```

**3. WebSocket không debounce:**
```typescript
socket.on("order:updated", (event) => {
    // ❌ Invalidate query mỗi event → nhiều requests
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
});
```

**4. No virtual scrolling:**
```typescript
// Render tất cả orders cùng lúc
{filteredOrders.map(order => (
    <KitchenOrderCard key={order.kitchenOrderId} order={order} />
))}
// ❌ Với 100+ orders → lag
```

#### ✅ Giải Pháp Đề Xuất

**1. Memoization:**
```typescript
const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return KitchenHelpers.sortOrdersByPriority(
        KitchenHelpers.filterOrdersByPriority(
            KitchenHelpers.filterOrdersByStatus(orders, statusFilter),
            priorityFilter
        )
    );
}, [orders, statusFilter, priorityFilter]);
```

**2. Debounce localStorage:**
```typescript
const debouncedSave = useDebouncedCallback((draft) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}, 1000);

useEffect(() => {
    if (hasUnsavedChanges) {
        debouncedSave(draft);
    }
}, [currentStep, selectedTableId, cartItems]);
```

**3. Debounce invalidations:**
```typescript
const debouncedInvalidate = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
}, 500);

socket.on("order:updated", (event) => {
    debouncedInvalidate();
});
```

**4. Virtual scrolling:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const virtualizer = useVirtualizer({
    count: filteredOrders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
});
```

---

### 13. **ACCESSIBILITY ISSUES**

#### 📌 Mô Tả Vấn Đề

1. **Missing ARIA labels:**
```tsx
<Button onClick={handleStart}>
    Start Preparing  {/* ❌ No aria-label */}
</Button>
```

2. **No keyboard navigation:**
   - Không thể navigate bằng Tab/Enter
   - No keyboard shortcuts (F5 refresh, Esc close dialog)

3. **Poor contrast:**
   - Status colors có thể khó đọc trên background
   - No high-contrast mode

4. **No screen reader support:**
   - Dynamic content updates không announce
   - Loading states không có ARIA live regions

#### ✅ Giải Pháp Đề Xuất

```typescript
<Button 
    onClick={handleStart}
    aria-label="Bắt đầu chuẩn bị đơn hàng"
>
    Start Preparing
</Button>

<div role="status" aria-live="polite" aria-atomic="true">
    {isLoading && "Đang tải..."}
</div>

// Keyboard shortcuts
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'F5') {
            e.preventDefault();
            refetch();
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 📊 TỔNG KẾT VẤN ĐỀ (Cập Nhật)

### Mức Độ Nghiêm Trọng

| # | Vấn Đề | Mức Độ | Ảnh Hưởng | Độ Khó Sửa |
|---|--------|---------|-----------|------------|
| **BACKEND** |
| 1 | Trạng thái không đồng bộ Order-Kitchen | 🔴 Critical | Cao | Trung bình |
| 2 | Logic tạo Kitchen Order sai | 🔴 Critical | Cao | Dễ |
| 3 | WebSocket events không đồng nhất | 🟠 High | Trung bình | Trung bình |
| 4 | Thiếu validation và business rules | 🟠 High | Cao | Trung bình |
| 5 | Database schema không tối ưu | 🟡 Medium | Trung bình | Khó |
| 6 | Thiếu xử lý edge cases | 🟡 Medium | Trung bình | Dễ |
| 7 | Performance issues | 🟡 Medium | Cao | Trung bình |
| **FRONTEND** |
| 8 | WebSocket connection không đồng bộ | 🔴 Critical | Cao | Dễ |
| 9 | Type definitions không khớp | 🟠 High | Cao | Trung bình |
| 10 | Validation schemas không đầy đủ | 🟠 High | Trung bình | Dễ |
| 11 | Error handling không nhất quán | 🟡 Medium | Trung bình | Dễ |
| 12 | Performance issues frontend | 🟡 Medium | Cao | Trung bình |
| 13 | Accessibility issues | 🟡 Medium | Thấp | Trung bình |

### Thống Kê Cập Nhật

- **Tổng số vấn đề**: 13 vấn đề
  - Backend: 7 vấn đề
  - Frontend: 6 vấn đề
- **Critical**: 3 vấn đề (23%)
- **High**: 4 vấn đề (31%)
- **Medium**: 6 vấn đề (46%)

---

## 🎯 ƯU TIÊN SỬA CHỮA (Cập Nhật)

### Phase 1: Critical Fixes (Tuần 1)
1. ✅ **Backend**: Thêm status `preparing` vào KitchenOrderStatus
2. ✅ **Backend**: Fix logic tạo kitchen order
3. ✅ **Frontend**: Fix WebSocket namespaces và event names
4. ✅ **Frontend**: Fix type definitions (Decimal → string)

### Phase 2: High Priority (Tuần 2)
5. ✅ **Backend**: Thống nhất WebSocket events structure
6. ✅ **Backend**: Implement business rules
7. ✅ **Frontend**: Update validation schemas
8. ✅ **Frontend**: Thêm error handling đầy đủ

### Phase 3: Medium Priority (Tuần 3-4)
9. ✅ **Backend**: Update database schema
10. ✅ **Backend**: Handle edge cases
11. ✅ **Backend**: Add pagination và optimize queries
12. ✅ **Frontend**: Performance optimizations
13. ✅ **Frontend**: Accessibility improvements

---

---

## 📝 LƯU Ý VỀ SCOPE DỰ ÁN

**Đây là dự án tốt nghiệp sinh viên** - Một số tính năng phức tạp đã được đơn giản hóa hoặc loại bỏ:

### ❌ Tính Năng Không Implement (Quá Phức Tạp)

1. **Trạm bếp (Kitchen Stations)**
   - Không cần phân chia grill, fry, steam, dessert
   - Tất cả order được xử lý chung trong bếp

2. **Thời gian dự kiến (Prep Time Estimate)**
   - Không cần tính toán thời gian chuẩn bị dự kiến
   - Chỉ ghi nhận thời gian thực tế (startedAt → completedAt)

3. **Auto-cancel timeout**
   - Không tự động hủy order sau X phút
   - Bếp/quản lý tự quyết định hủy manual

4. **Max concurrent orders limit**
   - Không giới hạn số order đồng thời
   - Bếp tự quản lý capacity

5. **Ghi chú riêng cho bếp (Kitchen notes)**
   - Dùng chung `specialRequest` của từng món
   - Không cần field `notes` riêng trong KitchenOrder

### ✅ Tính Năng Core (Đủ Cho Tốt Nghiệp)

1. **Order Management**
   - Tạo đơn, thêm món, hủy món, hủy đơn
   - Theo dõi trạng thái cơ bản

2. **Kitchen Management (Đơn giản hóa)**
   - Nhận đơn từ order (khi confirmed)
   - **Chỉ 2 thao tác**: Bắt đầu nấu (`preparing`) → Hoàn thành (`completed`)
   - Priority cơ bản (normal, high, urgent) - tùy chọn

3. **Real-time Updates**
   - WebSocket cơ bản cho order và kitchen
   - Thông báo khi có đơn mới, món sẵn sàng

4. **Basic Validation**
   - Status transitions
   - Required fields
   - Simple business rules

### 🎯 Mục Tiêu Dự Án

- Chứng minh hiểu biết về full-stack development
- Implement CRUD operations đầy đủ
- Real-time với WebSocket
- Database design hợp lý
- Frontend-Backend integration
- **KHÔNG CẦN** implement các tính năng enterprise phức tạp

---

**Tài liệu này được tạo tự động bởi AI Assistant**  
**Đã điều chỉnh scope phù hợp với dự án tốt nghiệp sinh viên**
