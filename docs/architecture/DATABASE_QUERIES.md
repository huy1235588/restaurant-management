# 🔍 Các Truy vấn Thường dùng - Hệ thống Quản lý Nhà hàng

> **Tài liệu này chứa các SQL queries thường dùng và query optimization patterns**

## Mục lục

1. [Authentication Queries](#1-authentication-queries)
2. [Menu Queries](#2-menu-queries)
3. [Table Management Queries](#3-table-management-queries)
4. [Reservation Queries](#4-reservation-queries)
5. [Order Management Queries](#5-order-management-queries)
6. [Kitchen Management Queries](#6-kitchen-management-queries)
7. [Billing & Payment Queries](#7-billing--payment-queries)
8. [Reporting Queries](#8-reporting-queries)

---

## 1. Authentication Queries

### Đăng nhập

```sql
-- Lấy thông tin tài khoản và nhân viên
SELECT
    a.accountId,
    a.username,
    a.email,
    a.isActive,
    s.staffId,
    s.fullName,
    s.role,
    s.isActive as staffIsActive
FROM accounts a
LEFT JOIN staff s ON a.accountId = s.accountId
WHERE a.email = $1 AND a.isActive = true;
```

### Làm mới token

```sql
-- Kiểm tra refresh token
SELECT
    rt.*,
    a.isActive as accountIsActive
FROM refresh_tokens rt
INNER JOIN accounts a ON rt.accountId = a.accountId
WHERE rt.token = $1
    AND rt.isRevoked = false
    AND rt.expiresAt > NOW();
```

### Thu hồi tokens cũ

```sql
-- Thu hồi tất cả tokens của user
UPDATE refresh_tokens
SET isRevoked = true, revokedAt = NOW()
WHERE accountId = $1 AND isRevoked = false;
```

---

## 2. Menu Queries

### Lấy thực đơn đầy đủ

```sql
-- Thực đơn theo danh mục
SELECT
    c.categoryId,
    c.categoryName,
    c.description as categoryDescription,
    c.imageUrl as categoryImage,
    json_agg(
        json_build_object(
            'itemId', m.itemId,
            'itemCode', m.itemCode,
            'itemName', m.itemName,
            'price', m.price,
            'description', m.description,
            'imageUrl', m.imageUrl,
            'preparationTime', m.preparationTime,
            'spicyLevel', m.spicyLevel,
            'isVegetarian', m.isVegetarian,
            'calories', m.calories,
            'isAvailable', m.isAvailable
        ) ORDER BY m.displayOrder
    ) as items
FROM categories c
LEFT JOIN menu_items m ON c.categoryId = m.categoryId
    AND m.isActive = true
WHERE c.isActive = true
GROUP BY c.categoryId, c.categoryName, c.description, c.imageUrl
ORDER BY c.displayOrder;
```

### Tìm món ăn

```sql
-- Tìm kiếm món theo tên hoặc mô tả
SELECT
    m.*,
    c.categoryName
FROM menu_items m
INNER JOIN categories c ON m.categoryId = c.categoryId
WHERE m.isActive = true
    AND m.isAvailable = true
    AND (
        m.itemName ILIKE '%' || $1 || '%'
        OR m.description ILIKE '%' || $1 || '%'
    )
ORDER BY m.itemName;
```

---

## 3. Table Management Queries

### Lấy danh sách bàn có sẵn

```sql
-- Bàn trống theo sức chứa
SELECT *
FROM restaurant_tables
WHERE isActive = true
    AND status = 'available'
    AND capacity >= $1
ORDER BY capacity, floor, tableNumber;
```

### Cập nhật trạng thái bàn

```sql
-- Đổi trạng thái bàn
UPDATE restaurant_tables
SET status = $1, updatedAt = NOW()
WHERE tableId = $2;
```

### Thống kê bàn theo trạng thái

```sql
-- Đếm bàn theo trạng thái
SELECT
    status,
    COUNT(*) as count,
    SUM(capacity) as totalCapacity
FROM restaurant_tables
WHERE isActive = true
GROUP BY status;
```

---

## 4. Reservation Queries

### Tạo đặt bàn mới

```sql
-- Insert reservation
INSERT INTO reservations (
    customerName,
    phoneNumber,
    email,
    tableId,
    reservationDate,
    reservationTime,
    duration,
    partySize,
    specialRequest,
    status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
RETURNING *;
```

### Kiểm tra bàn có sẵn cho đặt chỗ

```sql
-- Tìm bàn trống trong khung giờ
WITH ReservationTimes AS (
    SELECT
        tableId,
        reservationDate,
        reservationTime,
        reservationTime + (duration || ' minutes')::interval as endTime
    FROM reservations
    WHERE reservationDate = $1
        AND status IN ('confirmed', 'seated')
)
SELECT t.*
FROM restaurant_tables t
LEFT JOIN ReservationTimes r ON t.tableId = r.tableId
    AND $2 < r.endTime
    AND ($2 + $3::interval) > r.reservationTime
WHERE t.isActive = true
    AND t.status IN ('available', 'reserved')
    AND t.capacity >= $4
    AND r.tableId IS NULL
ORDER BY t.capacity, t.tableNumber;
```

### Danh sách đặt bàn theo ngày

```sql
-- Reservations by date
SELECT
    r.*,
    t.tableNumber,
    t.capacity,
    t.section
FROM reservations r
INNER JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.reservationDate = $1
ORDER BY r.reservationTime, r.tableId;
```

### Cập nhật trạng thái đặt bàn

```sql
-- Xác nhận đặt bàn
UPDATE reservations
SET status = 'confirmed', updatedAt = NOW()
WHERE reservationId = $1;

-- Khách đã đến
UPDATE reservations
SET status = 'seated', updatedAt = NOW()
WHERE reservationId = $1;
```

---

## 5. Order Management Queries

### Tạo đơn hàng mới

```sql
-- Insert order
INSERT INTO orders (
    tableId,
    staffId,
    reservationId,
    customerName,
    customerPhone,
    partySize,
    status,
    notes
) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
RETURNING *;

-- Insert order items
INSERT INTO order_items (
    orderId,
    itemId,
    quantity,
    unitPrice,
    totalPrice,
    specialRequest
) VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
```

### Lấy chi tiết đơn hàng

```sql
-- Order details with items
SELECT
    o.*,
    t.tableNumber,
    s.fullName as waiterName,
    json_agg(
        json_build_object(
            'orderItemId', oi.orderItemId,
            'itemName', m.itemName,
            'quantity', oi.quantity,
            'unitPrice', oi.unitPrice,
            'totalPrice', oi.totalPrice,
            'specialRequest', oi.specialRequest,
            'status', oi.status
        )
    ) as items
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN menu_items m ON oi.itemId = m.itemId
WHERE o.orderId = $1
GROUP BY o.orderId, t.tableNumber, s.fullName;
```

### Danh sách đơn hàng đang hoạt động

```sql
-- Active orders
SELECT
    o.orderId,
    o.orderNumber,
    o.orderTime,
    o.status,
    o.partySize,
    t.tableNumber,
    t.section,
    s.fullName as waiterName,
    COUNT(oi.orderItemId) as itemCount,
    SUM(oi.totalPrice) as totalAmount
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.status NOT IN ('completed', 'cancelled')
GROUP BY o.orderId, t.tableNumber, t.section, s.fullName
ORDER BY o.orderTime DESC;
```

---

## 6. Kitchen Management Queries

### Tạo kitchen order

```sql
-- Create kitchen order
INSERT INTO kitchen_orders (
    orderId,
    priority,
    status,
    prepTimeEstimated
) VALUES ($1, $2, 'pending', $3)
RETURNING *;
```

### Danh sách đơn bếp

```sql
-- Kitchen orders queue
SELECT
    ko.*,
    o.orderNumber,
    o.orderTime,
    t.tableNumber,
    json_agg(
        json_build_object(
            'itemName', m.itemName,
            'quantity', oi.quantity,
            'specialRequest', oi.specialRequest
        )
    ) as items
FROM kitchen_orders ko
INNER JOIN orders o ON ko.orderId = o.orderId
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN menu_items m ON oi.itemId = m.itemId
WHERE ko.status NOT IN ('ready', 'completed', 'cancelled')
GROUP BY ko.kitchenOrderId, o.orderNumber, o.orderTime, t.tableNumber
ORDER BY ko.priority DESC, ko.createdAt ASC;
```

### Cập nhật trạng thái bếp

```sql
-- Start cooking
UPDATE kitchen_orders
SET status = 'preparing',
    staffId = $2,
    startedAt = NOW(),
    updatedAt = NOW()
WHERE kitchenOrderId = $1;

-- Mark as ready
UPDATE kitchen_orders
SET status = 'ready',
    completedAt = NOW(),
    updatedAt = NOW()
WHERE kitchenOrderId = $1;
```

---

## 7. Billing & Payment Queries

### Tạo hóa đơn

```sql
-- Create bill from order
WITH OrderTotal AS (
    SELECT
        orderId,
        SUM(totalPrice) as subtotal
    FROM order_items
    WHERE orderId = $1
    GROUP BY orderId
)
INSERT INTO bills (
    orderId,
    tableId,
    staffId,
    subtotal,
    taxRate,
    taxAmount,
    serviceCharge,
    totalAmount
)
SELECT
    o.orderId,
    o.tableId,
    $2 as staffId,
    ot.subtotal,
    $3 as taxRate,
    ROUND(ot.subtotal * $3 / 100, 2) as taxAmount,
    $4 as serviceCharge,
    ot.subtotal + ROUND(ot.subtotal * $3 / 100, 2) + $4 as totalAmount
FROM orders o
INNER JOIN OrderTotal ot ON o.orderId = ot.orderId
WHERE o.orderId = $1
RETURNING *;

-- Copy order items to bill items
INSERT INTO bill_items (
    billId,
    itemId,
    itemName,
    quantity,
    unitPrice,
    subtotal,
    discount,
    total
)
SELECT
    $1 as billId,
    oi.itemId,
    m.itemName,
    oi.quantity,
    oi.unitPrice,
    oi.totalPrice,
    0 as discount,
    oi.totalPrice as total
FROM order_items oi
INNER JOIN menu_items m ON oi.itemId = m.itemId
WHERE oi.orderId = $2;
```

### Chi tiết hóa đơn

```sql
-- Bill details
SELECT
    b.*,
    t.tableNumber,
    s.fullName as cashierName,
    o.orderNumber,
    o.orderTime,
    json_agg(
        json_build_object(
            'itemName', bi.itemName,
            'quantity', bi.quantity,
            'unitPrice', bi.unitPrice,
            'subtotal', bi.subtotal,
            'discount', bi.discount,
            'total', bi.total
        )
    ) as items
FROM bills b
INNER JOIN orders o ON b.orderId = o.orderId
INNER JOIN restaurant_tables t ON b.tableId = t.tableId
LEFT JOIN staff s ON b.staffId = s.staffId
LEFT JOIN bill_items bi ON b.billId = bi.billId
WHERE b.billId = $1
GROUP BY b.billId, t.tableNumber, s.fullName, o.orderNumber, o.orderTime;
```

### Thanh toán hóa đơn

```sql
-- Record payment
INSERT INTO payments (
    billId,
    paymentMethod,
    amount,
    transactionId,
    status
) VALUES ($1, $2, $3, $4, 'paid')
RETURNING *;

-- Update bill status
UPDATE bills
SET paymentStatus = 'paid',
    paidAmount = $2,
    changeAmount = $3,
    paymentMethod = $4,
    paidAt = NOW(),
    updatedAt = NOW()
WHERE billId = $1;
```

---

## 8. Reporting Queries

### Doanh thu theo ngày

```sql
-- Daily revenue report
SELECT
    DATE(createdAt) as date,
    COUNT(*) as totalBills,
    SUM(subtotal) as subtotal,
    SUM(taxAmount) as taxAmount,
    SUM(discountAmount) as discountAmount,
    SUM(serviceCharge) as serviceCharge,
    SUM(totalAmount) as totalRevenue,
    SUM(CASE WHEN paymentStatus = 'paid' THEN totalAmount ELSE 0 END) as paidRevenue
FROM bills
WHERE createdAt >= $1 AND createdAt < $2
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

### Món ăn bán chạy

```sql
-- Best selling items
SELECT
    m.itemId,
    m.itemCode,
    m.itemName,
    c.categoryName,
    COUNT(oi.orderItemId) as orderCount,
    SUM(oi.quantity) as totalQuantity,
    SUM(oi.totalPrice) as totalRevenue
FROM order_items oi
INNER JOIN menu_items m ON oi.itemId = m.itemId
INNER JOIN categories c ON m.categoryId = c.categoryId
INNER JOIN orders o ON oi.orderId = o.orderId
WHERE o.orderTime >= $1 AND o.orderTime < $2
    AND o.status != 'cancelled'
GROUP BY m.itemId, m.itemCode, m.itemName, c.categoryName
ORDER BY totalQuantity DESC
LIMIT 20;
```

### Hiệu suất nhân viên

```sql
-- Staff performance
SELECT
    s.staffId,
    s.fullName,
    s.role,
    COUNT(DISTINCT o.orderId) as ordersServed,
    COUNT(DISTINCT b.billId) as billsProcessed,
    SUM(b.totalAmount) as totalRevenue
FROM staff s
LEFT JOIN orders o ON s.staffId = o.staffId
LEFT JOIN bills b ON s.staffId = b.staffId
WHERE (o.orderTime >= $1 AND o.orderTime < $2)
    OR (b.createdAt >= $1 AND b.createdAt < $2)
GROUP BY s.staffId, s.fullName, s.role
ORDER BY totalRevenue DESC;
```

### Tỷ lệ sử dụng bàn

```sql
-- Table occupancy rate
SELECT
    t.tableId,
    t.tableNumber,
    t.capacity,
    t.section,
    COUNT(o.orderId) as totalOrders,
    SUM(EXTRACT(EPOCH FROM (o.completedAt - o.orderTime))/3600) as totalHours,
    AVG(o.partySize) as avgPartySize
FROM restaurant_tables t
LEFT JOIN orders o ON t.tableId = o.tableId
    AND o.orderTime >= $1
    AND o.orderTime < $2
    AND o.status IN ('completed')
GROUP BY t.tableId, t.tableNumber, t.capacity, t.section
ORDER BY totalOrders DESC;
```
