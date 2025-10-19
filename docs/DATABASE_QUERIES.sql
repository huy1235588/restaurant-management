-- =====================================================
-- Restaurant Management System - Common SQL Queries
-- Các truy vấn SQL thường dùng cho hệ thống
-- =====================================================

-- =====================================
-- 1. QUẢN LÝ ĐƠN HÀNG (ORDERS)
-- =====================================

-- 1.1. Lấy danh sách đơn hàng đang hoạt động
SELECT 
    o.orderId,
    o.orderNumber,
    t.tableNumber,
    t.tableName,
    s.fullName AS waiterName,
    o.headCount,
    o.status,
    o.orderTime,
    COUNT(oi.orderItemId) AS totalItems,
    SUM(oi.subtotal) AS orderTotal
FROM orders o
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.status IN ('pending', 'confirmed', 'preparing', 'ready')
GROUP BY o.orderId, t.tableNumber, t.tableName, s.fullName
ORDER BY o.orderTime DESC;

-- 1.2. Chi tiết đơn hàng với món ăn
SELECT 
    o.orderNumber,
    o.orderTime,
    t.tableNumber,
    mi.itemCode,
    mi.itemName,
    c.categoryName,
    oi.quantity,
    oi.unitPrice,
    oi.subtotal,
    oi.specialRequest,
    oi.status AS itemStatus
FROM orders o
INNER JOIN order_items oi ON o.orderId = oi.orderId
INNER JOIN menu_items mi ON oi.itemId = mi.itemId
INNER JOIN categories c ON mi.categoryId = c.categoryId
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
WHERE o.orderNumber = 'ORDER-12345'  -- Replace with actual order number
ORDER BY oi.createdAt;

-- 1.3. Tổng hợp đơn hàng theo bàn
SELECT 
    t.tableNumber,
    t.tableName,
    t.floor,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    SUM(oi.subtotal) AS totalRevenue,
    AVG(o.headCount) AS avgHeadCount
FROM restaurant_tables t
LEFT JOIN orders o ON t.tableId = o.tableId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.orderTime >= CURRENT_DATE - INTERVAL '30 days'
    AND o.status != 'cancelled'
GROUP BY t.tableId, t.tableNumber, t.tableName, t.floor
ORDER BY totalRevenue DESC;

-- 1.4. Thời gian xử lý đơn hàng trung bình
SELECT 
    DATE(o.orderTime) AS orderDate,
    COUNT(*) AS totalOrders,
    AVG(EXTRACT(EPOCH FROM (o.confirmedAt - o.orderTime))/60) AS avgConfirmMinutes,
    AVG(EXTRACT(EPOCH FROM (o.completedAt - o.confirmedAt))/60) AS avgPrepMinutes
FROM orders o
WHERE o.status = 'served'
    AND o.confirmedAt IS NOT NULL
    AND o.completedAt IS NOT NULL
    AND o.orderTime >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(o.orderTime)
ORDER BY orderDate DESC;

-- =====================================
-- 2. QUẢN LÝ BÀN & ĐẶT BÀN
-- =====================================

-- 2.1. Kiểm tra bàn trống
SELECT 
    tableId,
    tableNumber,
    tableName,
    capacity,
    minCapacity,
    floor,
    section,
    status
FROM restaurant_tables
WHERE status = 'available'
    AND isActive = true
    AND capacity >= 4  -- Số người cần
ORDER BY floor, tableNumber;

-- 2.2. Lịch đặt bàn theo ngày
SELECT 
    r.reservationCode,
    r.customerName,
    r.phoneNumber,
    r.email,
    t.tableNumber,
    t.tableName,
    r.reservationDate,
    r.reservationTime,
    r.reservationTime + (r.duration || ' minutes')::INTERVAL AS endTime,
    r.duration,
    r.headCount,
    r.status,
    r.specialRequest,
    r.depositAmount
FROM reservations r
INNER JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.reservationDate = '2025-10-20'  -- Replace with target date
    AND r.status IN ('confirmed', 'pending', 'seated')
ORDER BY r.reservationTime;

-- 2.3. Kiểm tra bàn có trống không (theo thời gian cụ thể)
-- Tìm các bàn không có reservation trong khoảng thời gian mong muốn
WITH desired_time AS (
    SELECT 
        '2025-10-20'::DATE AS res_date,
        '18:00:00'::TIME AS res_time,
        120 AS duration_minutes,  -- 2 hours
        4 AS required_capacity
)
SELECT 
    t.tableId,
    t.tableNumber,
    t.tableName,
    t.capacity,
    t.floor,
    t.section
FROM restaurant_tables t
CROSS JOIN desired_time dt
WHERE t.isActive = true
    AND t.capacity >= dt.required_capacity
    AND t.status = 'available'
    AND NOT EXISTS (
        SELECT 1 
        FROM reservations r
        WHERE r.tableId = t.tableId
            AND r.reservationDate = dt.res_date
            AND r.status IN ('confirmed', 'seated')
            AND (
                -- Check if desired time overlaps with existing reservation
                dt.res_time BETWEEN r.reservationTime 
                    AND (r.reservationTime + (r.duration || ' minutes')::INTERVAL)
                OR
                (dt.res_time + (dt.duration_minutes || ' minutes')::INTERVAL) BETWEEN r.reservationTime 
                    AND (r.reservationTime + (r.duration || ' minutes')::INTERVAL)
            )
    )
ORDER BY t.floor, t.capacity, t.tableNumber;

-- 2.4. Lịch sử đặt bàn của khách hàng
SELECT 
    r.reservationCode,
    r.reservationDate,
    r.reservationTime,
    t.tableNumber,
    r.headCount,
    r.status,
    r.createdAt,
    CASE 
        WHEN r.status = 'completed' THEN 'Đã hoàn thành'
        WHEN r.status = 'cancelled' THEN 'Đã hủy'
        WHEN r.status = 'no_show' THEN 'Không đến'
        ELSE r.status
    END AS statusVN
FROM reservations r
INNER JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.phoneNumber = '0901234567'  -- Replace with customer phone
ORDER BY r.reservationDate DESC, r.reservationTime DESC
LIMIT 10;

-- =====================================
-- 3. DOANH THU & BÁO CÁO TÀI CHÍNH
-- =====================================

-- 3.1. Doanh thu theo ngày
SELECT 
    DATE(createdAt) AS date,
    COUNT(*) AS totalBills,
    SUM(subtotal) AS subtotal,
    SUM(taxAmount) AS taxAmount,
    SUM(discountAmount) AS discountAmount,
    SUM(serviceCharge) AS serviceCharge,
    SUM(totalAmount) AS totalRevenue,
    ROUND(AVG(totalAmount), 2) AS avgBillAmount
FROM bills
WHERE paymentStatus = 'paid'
    AND createdAt >= '2025-10-01'
    AND createdAt < '2025-11-01'
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- 3.2. Doanh thu theo phương thức thanh toán
SELECT 
    paymentMethod,
    COUNT(*) AS totalTransactions,
    SUM(totalAmount) AS totalRevenue,
    ROUND(AVG(totalAmount), 2) AS avgAmount,
    ROUND(SUM(totalAmount) * 100.0 / SUM(SUM(totalAmount)) OVER (), 2) AS percentageOfTotal
FROM bills
WHERE paymentStatus = 'paid'
    AND createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY paymentMethod
ORDER BY totalRevenue DESC;

-- 3.3. Top món bán chạy
SELECT 
    mi.itemCode,
    mi.itemName,
    c.categoryName,
    COUNT(bi.billItemId) AS orderCount,
    SUM(bi.quantity) AS totalQuantity,
    SUM(bi.total) AS totalRevenue,
    ROUND(AVG(bi.unitPrice), 2) AS avgPrice
FROM bill_items bi
INNER JOIN menu_items mi ON bi.itemId = mi.itemId
INNER JOIN categories c ON mi.categoryId = c.categoryId
INNER JOIN bills b ON bi.billId = b.billId
WHERE b.paymentStatus = 'paid'
    AND b.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mi.itemId, mi.itemCode, mi.itemName, c.categoryName
ORDER BY totalQuantity DESC
LIMIT 20;

-- 3.4. Phân tích doanh thu theo danh mục món ăn
SELECT 
    c.categoryName,
    COUNT(DISTINCT bi.billItemId) AS totalOrders,
    SUM(bi.quantity) AS totalQuantity,
    SUM(bi.total) AS totalRevenue,
    ROUND(AVG(bi.unitPrice), 2) AS avgPrice,
    ROUND(SUM(bi.total) * 100.0 / SUM(SUM(bi.total)) OVER (), 2) AS percentageOfRevenue
FROM categories c
INNER JOIN menu_items mi ON c.categoryId = mi.categoryId
INNER JOIN bill_items bi ON mi.itemId = bi.itemId
INNER JOIN bills b ON bi.billId = b.billId
WHERE b.paymentStatus = 'paid'
    AND b.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.categoryId, c.categoryName
ORDER BY totalRevenue DESC;

-- 3.5. Chi tiết hóa đơn
SELECT 
    b.billNumber,
    b.createdAt AS billDate,
    t.tableNumber,
    s.fullName AS cashierName,
    bi.itemName,
    bi.quantity,
    bi.unitPrice,
    bi.discount,
    bi.total,
    b.subtotal AS billSubtotal,
    b.taxAmount,
    b.discountAmount,
    b.serviceCharge,
    b.totalAmount AS billTotal,
    b.paymentMethod,
    b.paymentStatus
FROM bills b
INNER JOIN bill_items bi ON b.billId = bi.billId
INNER JOIN restaurant_tables t ON b.tableId = t.tableId
LEFT JOIN staff s ON b.staffId = s.staffId
WHERE b.billNumber = 'BILL-12345'  -- Replace with actual bill number
ORDER BY bi.billItemId;

-- 3.6. Doanh thu theo giờ trong ngày (peak hours analysis)
SELECT 
    EXTRACT(HOUR FROM createdAt) AS hour,
    COUNT(*) AS totalBills,
    SUM(totalAmount) AS totalRevenue,
    ROUND(AVG(totalAmount), 2) AS avgBillAmount
FROM bills
WHERE paymentStatus = 'paid'
    AND createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM createdAt)
ORDER BY hour;

-- =====================================
-- 4. HIỆU SUẤT NHÂN VIÊN
-- =====================================

-- 4.1. Hiệu suất nhân viên phục vụ (waiter)
SELECT 
    s.staffId,
    s.fullName,
    s.role,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    COUNT(DISTINCT b.billId) AS totalBills,
    SUM(b.totalAmount) AS totalRevenue,
    ROUND(AVG(b.totalAmount), 2) AS avgBillAmount,
    ROUND(SUM(b.totalAmount) / NULLIF(COUNT(DISTINCT o.orderId), 0), 2) AS revenuePerOrder
FROM staff s
LEFT JOIN orders o ON s.staffId = o.staffId
LEFT JOIN bills b ON o.orderId = b.orderId
WHERE s.role IN ('waiter', 'manager')
    AND s.isActive = true
    AND b.paymentStatus = 'paid'
    AND b.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.staffId, s.fullName, s.role
ORDER BY totalRevenue DESC;

-- 4.2. Hiệu suất đầu bếp (chef)
SELECT 
    s.staffId,
    s.fullName,
    COUNT(DISTINCT ko.kitchenOrderId) AS totalKitchenOrders,
    COUNT(CASE WHEN ko.status = 'ready' THEN 1 END) AS completedOrders,
    ROUND(
        AVG(
            CASE 
                WHEN ko.completedAt IS NOT NULL AND ko.startedAt IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60 
            END
        ), 
        2
    ) AS avgPrepTimeMinutes
FROM staff s
INNER JOIN kitchen_orders ko ON s.staffId = ko.staffId
WHERE s.role IN ('chef', 'bartender')
    AND ko.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.staffId, s.fullName
ORDER BY completedOrders DESC;

-- 4.3. Bảng chấm công (orders handled per day)
SELECT 
    s.fullName,
    DATE(o.orderTime) AS workDate,
    COUNT(DISTINCT o.orderId) AS ordersHandled,
    SUM(b.totalAmount) AS dailyRevenue
FROM staff s
INNER JOIN orders o ON s.staffId = o.staffId
INNER JOIN bills b ON o.orderId = b.orderId
WHERE s.role = 'waiter'
    AND b.paymentStatus = 'paid'
    AND o.orderTime >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY s.staffId, s.fullName, DATE(o.orderTime)
ORDER BY workDate DESC, dailyRevenue DESC;

-- =====================================
-- 5. QUẢN LÝ THỰC ĐƠN
-- =====================================

-- 5.1. Danh sách thực đơn theo danh mục (available items)
SELECT 
    c.categoryName,
    c.displayOrder AS categoryOrder,
    mi.itemCode,
    mi.itemName,
    mi.price,
    mi.description,
    mi.preparationTime,
    mi.spicyLevel,
    mi.isVegetarian,
    mi.calories,
    mi.imageUrl
FROM menu_items mi
INNER JOIN categories c ON mi.categoryId = c.categoryId
WHERE mi.isActive = true
    AND mi.isAvailable = true
    AND c.isActive = true
ORDER BY c.displayOrder, mi.displayOrder, mi.itemName;

-- 5.2. Phân tích giá vốn - giá bán (profit margin)
SELECT 
    mi.itemCode,
    mi.itemName,
    c.categoryName,
    mi.cost,
    mi.price,
    (mi.price - mi.cost) AS profit,
    ROUND((mi.price - mi.cost) / mi.price * 100, 2) AS profitMarginPercent
FROM menu_items mi
INNER JOIN categories c ON mi.categoryId = c.categoryId
WHERE mi.cost IS NOT NULL
    AND mi.isActive = true
ORDER BY profitMarginPercent DESC;

-- 5.3. Món ăn ít bán hoặc không bán (slow-moving items)
SELECT 
    mi.itemCode,
    mi.itemName,
    c.categoryName,
    mi.price,
    COALESCE(COUNT(bi.billItemId), 0) AS orderCount,
    COALESCE(SUM(bi.quantity), 0) AS totalQuantity,
    MAX(b.createdAt) AS lastOrderDate
FROM menu_items mi
INNER JOIN categories c ON mi.categoryId = c.categoryId
LEFT JOIN bill_items bi ON mi.itemId = bi.itemId
LEFT JOIN bills b ON bi.billId = b.billId AND b.paymentStatus = 'paid'
WHERE mi.isActive = true
    AND (b.createdAt IS NULL OR b.createdAt >= CURRENT_DATE - INTERVAL '30 days')
GROUP BY mi.itemId, mi.itemCode, mi.itemName, c.categoryName, mi.price
HAVING COALESCE(COUNT(bi.billItemId), 0) < 5
ORDER BY totalQuantity ASC, lastOrderDate ASC NULLS FIRST;

-- =====================================
-- 6. QUẢN LÝ BẾP (KITCHEN)
-- =====================================

-- 6.1. Danh sách đơn bếp đang chờ
SELECT 
    ko.kitchenOrderId,
    ko.priority,
    o.orderNumber,
    t.tableNumber,
    o.headCount,
    ko.status,
    ko.estimatedTime,
    ko.createdAt,
    COUNT(oi.orderItemId) AS totalItems,
    STRING_AGG(mi.itemName, ', ') AS itemsList,
    s.fullName AS chefName
FROM kitchen_orders ko
INNER JOIN orders o ON ko.orderId = o.orderId
INNER JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN menu_items mi ON oi.itemId = mi.itemId
LEFT JOIN staff s ON ko.staffId = s.staffId
WHERE ko.status IN ('pending', 'preparing')
GROUP BY ko.kitchenOrderId, o.orderNumber, t.tableNumber, o.headCount, s.fullName
ORDER BY ko.priority DESC, ko.createdAt;

-- 6.2. Thời gian chế biến trung bình theo món
SELECT 
    mi.itemName,
    c.categoryName,
    mi.preparationTime AS estimatedTime,
    COUNT(ko.kitchenOrderId) AS orderCount,
    ROUND(
        AVG(
            CASE 
                WHEN ko.completedAt IS NOT NULL AND ko.startedAt IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60 
            END
        ), 
        2
    ) AS actualAvgTimeMinutes
FROM menu_items mi
INNER JOIN categories c ON mi.categoryId = c.categoryId
INNER JOIN order_items oi ON mi.itemId = oi.itemId
INNER JOIN kitchen_orders ko ON oi.orderId = ko.orderId
WHERE ko.status = 'ready'
    AND ko.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mi.itemId, mi.itemName, c.categoryName, mi.preparationTime
HAVING COUNT(ko.kitchenOrderId) >= 5
ORDER BY actualAvgTimeMinutes DESC;

-- 6.3. Hiệu suất bếp theo ngày
SELECT 
    DATE(ko.createdAt) AS date,
    COUNT(*) AS totalOrders,
    COUNT(CASE WHEN ko.status = 'ready' THEN 1 END) AS completedOrders,
    ROUND(
        AVG(
            CASE 
                WHEN ko.completedAt IS NOT NULL AND ko.startedAt IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60 
            END
        ), 
        2
    ) AS avgPrepTimeMinutes
FROM kitchen_orders ko
WHERE ko.createdAt >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(ko.createdAt)
ORDER BY date DESC;

-- =====================================
-- 7. PHÂN TÍCH & BÁO CÁO
-- =====================================

-- 7.1. Phân tích theo khung giờ (rush hours)
SELECT 
    CASE 
        WHEN EXTRACT(HOUR FROM orderTime) BETWEEN 6 AND 10 THEN 'Sáng (6-10h)'
        WHEN EXTRACT(HOUR FROM orderTime) BETWEEN 11 AND 14 THEN 'Trưa (11-14h)'
        WHEN EXTRACT(HOUR FROM orderTime) BETWEEN 17 AND 21 THEN 'Tối (17-21h)'
        ELSE 'Khác'
    END AS timeSlot,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    AVG(o.headCount) AS avgHeadCount,
    SUM(b.totalAmount) AS totalRevenue,
    ROUND(AVG(b.totalAmount), 2) AS avgBillAmount
FROM orders o
INNER JOIN bills b ON o.orderId = b.orderId
WHERE b.paymentStatus = 'paid'
    AND o.orderTime >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY timeSlot
ORDER BY totalRevenue DESC;

-- 7.2. Tỷ lệ hủy đơn
SELECT 
    DATE(orderTime) AS date,
    COUNT(*) AS totalOrders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelledOrders,
    ROUND(
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) AS cancellationRate
FROM orders
WHERE orderTime >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(orderTime)
ORDER BY date DESC;

-- 7.3. Phân tích khách hàng (top customers by reservations)
SELECT 
    customerName,
    phoneNumber,
    email,
    COUNT(*) AS totalReservations,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completedReservations,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) AS noShowCount,
    MAX(reservationDate) AS lastReservationDate
FROM reservations
WHERE createdAt >= CURRENT_DATE - INTERVAL '180 days'
GROUP BY customerName, phoneNumber, email
HAVING COUNT(*) >= 3
ORDER BY totalReservations DESC, noShowCount ASC
LIMIT 50;

-- =====================================
-- 8. DATABASE MAINTENANCE
-- =====================================

-- 8.1. Xóa refresh tokens đã hết hạn
DELETE FROM refresh_tokens
WHERE expiresAt < NOW()
    OR isRevoked = true;

-- 8.2. Phân tích và tối ưu indexes
ANALYZE accounts;
ANALYZE orders;
ANALYZE bills;
ANALYZE menu_items;

-- 8.3. Kiểm tra kích thước database
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 8.4. Kiểm tra hiệu suất indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- =====================================
-- END OF QUERY EXAMPLES
-- =====================================================
