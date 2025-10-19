-- ============================================
-- Restaurant Management System - Common Queries
-- ============================================
-- This file contains frequently used SQL queries for the restaurant
-- management system, organized by functional area.
-- ============================================

-- ============================================
-- TABLE MANAGEMENT QUERIES
-- ============================================

-- Get all available tables
SELECT * 
FROM restaurant_tables 
WHERE status = 'available' 
  AND isActive = true
ORDER BY floor, tableNumber;

-- Find tables by capacity for a party
SELECT * 
FROM restaurant_tables 
WHERE capacity >= :headCount 
  AND minCapacity <= :headCount
  AND status = 'available'
  AND isActive = true
ORDER BY capacity ASC;

-- Get table status summary by floor
SELECT 
  floor,
  COUNT(*) as total_tables,
  SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
  SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
  SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
  SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
FROM restaurant_tables
WHERE isActive = true
GROUP BY floor
ORDER BY floor;

-- Get current occupancy rate
SELECT 
  COUNT(*) as total_tables,
  SUM(CASE WHEN status IN ('occupied', 'reserved') THEN 1 ELSE 0 END) as busy_tables,
  ROUND(100.0 * SUM(CASE WHEN status IN ('occupied', 'reserved') THEN 1 ELSE 0 END) / COUNT(*), 2) as occupancy_rate
FROM restaurant_tables
WHERE isActive = true;

-- ============================================
-- RESERVATION QUERIES
-- ============================================

-- Check table availability for a specific date and time
SELECT t.tableId, t.tableNumber, t.capacity, t.section
FROM restaurant_tables t
WHERE t.capacity >= :headCount 
  AND t.isActive = true
  AND t.tableId NOT IN (
    SELECT r.tableId 
    FROM reservations r
    WHERE r.reservationDate = :date
      AND r.status IN ('pending', 'confirmed', 'seated')
      AND (
        -- Check for time overlap
        (r.reservationTime <= :time AND 
         (r.reservationTime + (r.duration || ' minutes')::INTERVAL) > :time)
        OR
        (r.reservationTime < (:time + :duration * INTERVAL '1 minute') AND
         r.reservationTime >= :time)
      )
  )
ORDER BY t.capacity ASC;

-- Get today's reservations
SELECT 
  r.*,
  t.tableNumber,
  t.section
FROM reservations r
JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.reservationDate = CURRENT_DATE
  AND r.status IN ('pending', 'confirmed', 'seated')
ORDER BY r.reservationTime;

-- Get upcoming reservations for next 7 days
SELECT 
  r.reservationDate,
  r.reservationTime,
  r.customerName,
  r.phoneNumber,
  r.headCount,
  t.tableNumber,
  r.status
FROM reservations r
JOIN restaurant_tables t ON r.tableId = t.tableId
WHERE r.reservationDate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND r.status IN ('pending', 'confirmed')
ORDER BY r.reservationDate, r.reservationTime;

-- Get reservation fulfillment statistics
SELECT 
  DATE(reservationDate) as date,
  COUNT(*) as total_reservations,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as fulfillment_rate
FROM reservations
WHERE reservationDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(reservationDate)
ORDER BY date DESC;

-- Find customers with multiple reservations (loyalty tracking)
SELECT 
  phoneNumber,
  customerName,
  COUNT(*) as total_reservations,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_reservations,
  MAX(reservationDate) as last_visit
FROM reservations
WHERE reservationDate >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY phoneNumber, customerName
HAVING COUNT(*) >= 3
ORDER BY total_reservations DESC;

-- ============================================
-- ORDER MANAGEMENT QUERIES
-- ============================================

-- Get active orders for kitchen display
SELECT 
  o.orderId,
  o.orderNumber,
  o.tableId,
  t.tableNumber,
  o.headCount,
  o.orderTime,
  o.status,
  json_agg(
    json_build_object(
      'itemName', mi.itemName,
      'quantity', oi.quantity,
      'specialRequest', oi.specialRequest,
      'status', oi.status
    )
  ) as items
FROM orders o
JOIN restaurant_tables t ON o.tableId = t.tableId
JOIN order_items oi ON o.orderId = oi.orderId
JOIN menu_items mi ON oi.itemId = mi.itemId
WHERE o.status IN ('pending', 'confirmed', 'preparing')
GROUP BY o.orderId, o.orderNumber, o.tableId, t.tableNumber, o.headCount, o.orderTime, o.status
ORDER BY o.orderTime ASC;

-- Get order details with all items
SELECT 
  o.*,
  t.tableNumber,
  s.fullName as waiterName,
  json_agg(
    json_build_object(
      'itemId', oi.itemId,
      'itemName', mi.itemName,
      'quantity', oi.quantity,
      'unitPrice', oi.unitPrice,
      'subtotal', oi.subtotal,
      'specialRequest', oi.specialRequest
    )
  ) as items
FROM orders o
JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON o.staffId = s.staffId
LEFT JOIN order_items oi ON o.orderId = oi.orderId
LEFT JOIN menu_items mi ON oi.itemId = mi.itemId
WHERE o.orderId = :orderId
GROUP BY o.orderId, t.tableNumber, s.fullName;

-- Get orders by table
SELECT 
  o.orderId,
  o.orderNumber,
  o.orderTime,
  o.status,
  COUNT(oi.orderItemId) as item_count,
  SUM(oi.subtotal) as order_total
FROM orders o
LEFT JOIN order_items oi ON o.orderId = oi.orderId
WHERE o.tableId = :tableId
  AND o.status != 'cancelled'
GROUP BY o.orderId, o.orderNumber, o.orderTime, o.status
ORDER BY o.orderTime DESC;

-- Get pending kitchen orders with priority
SELECT 
  ko.*,
  o.orderNumber,
  t.tableNumber,
  s.fullName as chefName
FROM kitchen_orders ko
JOIN orders o ON ko.orderId = o.orderId
JOIN restaurant_tables t ON o.tableId = t.tableId
LEFT JOIN staff s ON ko.staffId = s.staffId
WHERE ko.status IN ('pending', 'preparing')
ORDER BY ko.priority DESC, ko.createdAt ASC;

-- Get order preparation time statistics
SELECT 
  AVG(EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60) as avg_prep_time_minutes,
  MIN(EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60) as min_prep_time_minutes,
  MAX(EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60) as max_prep_time_minutes
FROM kitchen_orders ko
WHERE ko.startedAt IS NOT NULL
  AND ko.completedAt IS NOT NULL
  AND ko.completedAt >= CURRENT_DATE - INTERVAL '7 days';

-- ============================================
-- MENU & SALES QUERIES
-- ============================================

-- Get menu items by category with availability
SELECT 
  c.categoryName,
  mi.itemName,
  mi.price,
  mi.isAvailable,
  mi.preparationTime,
  mi.spicyLevel,
  mi.isVegetarian
FROM menu_items mi
JOIN categories c ON mi.categoryId = c.categoryId
WHERE mi.isActive = true
  AND c.isActive = true
ORDER BY c.displayOrder, mi.displayOrder;

-- Get most popular menu items (last 30 days)
SELECT 
  mi.itemId,
  mi.itemName,
  mi.categoryId,
  c.categoryName,
  COUNT(oi.orderItemId) as times_ordered,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.subtotal) as total_revenue,
  AVG(oi.unitPrice) as avg_price
FROM menu_items mi
JOIN categories c ON mi.categoryId = c.categoryId
JOIN order_items oi ON mi.itemId = oi.itemId
JOIN orders o ON oi.orderId = o.orderId
WHERE o.createdAt >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY mi.itemId, mi.itemName, mi.categoryId, c.categoryName
ORDER BY times_ordered DESC
LIMIT 20;

-- Get least popular menu items (slow movers)
SELECT 
  mi.itemId,
  mi.itemName,
  mi.categoryId,
  c.categoryName,
  COALESCE(COUNT(oi.orderItemId), 0) as times_ordered,
  COALESCE(SUM(oi.quantity), 0) as total_quantity
FROM menu_items mi
JOIN categories c ON mi.categoryId = c.categoryId
LEFT JOIN order_items oi ON mi.itemId = oi.itemId 
  AND oi.createdAt >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN orders o ON oi.orderId = o.orderId
  AND o.status != 'cancelled'
WHERE mi.isActive = true
GROUP BY mi.itemId, mi.itemName, mi.categoryId, c.categoryName
ORDER BY times_ordered ASC, total_quantity ASC
LIMIT 20;

-- Get revenue by category
SELECT 
  c.categoryId,
  c.categoryName,
  COUNT(DISTINCT oi.orderItemId) as items_sold,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.subtotal) as total_revenue
FROM categories c
JOIN menu_items mi ON c.categoryId = mi.categoryId
JOIN order_items oi ON mi.itemId = oi.itemId
JOIN orders o ON oi.orderId = o.orderId
WHERE o.createdAt >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY c.categoryId, c.categoryName
ORDER BY total_revenue DESC;

-- ============================================
-- BILLING & PAYMENT QUERIES
-- ============================================

-- Get unpaid bills
SELECT 
  b.billId,
  b.billNumber,
  o.orderNumber,
  t.tableNumber,
  b.totalAmount,
  b.paidAmount,
  b.totalAmount - b.paidAmount as balance,
  b.createdAt
FROM bills b
JOIN orders o ON b.orderId = o.orderId
JOIN restaurant_tables t ON b.tableId = t.tableId
WHERE b.paymentStatus = 'pending'
ORDER BY b.createdAt ASC;

-- Get bill details with line items
SELECT 
  b.*,
  t.tableNumber,
  s.fullName as cashierName,
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
JOIN restaurant_tables t ON b.tableId = t.tableId
LEFT JOIN staff s ON b.staffId = s.staffId
LEFT JOIN bill_items bi ON b.billId = bi.billId
WHERE b.billId = :billId
GROUP BY b.billId, t.tableNumber, s.fullName;

-- Get daily revenue report
SELECT 
  DATE(createdAt) as date,
  COUNT(*) as total_bills,
  SUM(subtotal) as subtotal,
  SUM(taxAmount) as tax,
  SUM(discountAmount) as discounts,
  SUM(serviceCharge) as service_charges,
  SUM(totalAmount) as total_revenue,
  AVG(totalAmount) as average_bill
FROM bills
WHERE paymentStatus = 'paid'
  AND createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- Get revenue by payment method
SELECT 
  paymentMethod,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM payments
WHERE status = 'paid'
  AND paymentDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY paymentMethod
ORDER BY total_amount DESC;

-- Get hourly sales distribution
SELECT 
  EXTRACT(HOUR FROM createdAt) as hour,
  COUNT(*) as bill_count,
  SUM(totalAmount) as revenue,
  AVG(totalAmount) as avg_bill
FROM bills
WHERE paymentStatus = 'paid'
  AND createdAt >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM createdAt)
ORDER BY hour;

-- ============================================
-- STAFF PERFORMANCE QUERIES
-- ============================================

-- Get staff performance summary
SELECT 
  s.staffId,
  s.fullName,
  s.role,
  COUNT(DISTINCT o.orderId) as orders_handled,
  COUNT(DISTINCT b.billId) as bills_processed,
  COALESCE(SUM(b.totalAmount), 0) as total_sales,
  COALESCE(AVG(b.totalAmount), 0) as avg_bill_value
FROM staff s
LEFT JOIN orders o ON s.staffId = o.staffId
  AND o.createdAt >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN bills b ON s.staffId = b.staffId
  AND b.createdAt >= CURRENT_DATE - INTERVAL '30 days'
  AND b.paymentStatus = 'paid'
WHERE s.isActive = true
GROUP BY s.staffId, s.fullName, s.role
ORDER BY total_sales DESC;

-- Get chef performance (kitchen orders)
SELECT 
  s.staffId,
  s.fullName,
  COUNT(*) as orders_completed,
  AVG(EXTRACT(EPOCH FROM (ko.completedAt - ko.startedAt))/60) as avg_prep_time_minutes,
  SUM(CASE WHEN ko.completedAt <= ko.startedAt + (ko.estimatedTime || ' minutes')::INTERVAL 
      THEN 1 ELSE 0 END) as on_time_orders,
  ROUND(100.0 * SUM(CASE WHEN ko.completedAt <= ko.startedAt + (ko.estimatedTime || ' minutes')::INTERVAL 
      THEN 1 ELSE 0 END) / COUNT(*), 2) as on_time_rate
FROM staff s
JOIN kitchen_orders ko ON s.staffId = ko.staffId
WHERE ko.status = 'served'
  AND ko.startedAt IS NOT NULL
  AND ko.completedAt IS NOT NULL
  AND ko.completedAt >= CURRENT_DATE - INTERVAL '30 days'
  AND s.role IN ('chef', 'bartender')
GROUP BY s.staffId, s.fullName
ORDER BY on_time_rate DESC;

-- Get active staff by role
SELECT 
  role,
  COUNT(*) as staff_count
FROM staff
WHERE isActive = true
GROUP BY role
ORDER BY staff_count DESC;

-- ============================================
-- INVENTORY MANAGEMENT QUERIES
-- ============================================

-- Get current stock levels
SELECT 
  i.ingredientId,
  i.ingredientCode,
  i.ingredientName,
  i.unit,
  i.currentStock,
  i.minimumStock,
  i.currentStock - i.minimumStock as stock_difference,
  ROUND(100.0 * i.currentStock / NULLIF(i.minimumStock, 0), 2) as stock_percentage,
  s.supplierName
FROM ingredients i
LEFT JOIN suppliers s ON i.supplierId = s.supplierId
WHERE i.isActive = true
ORDER BY stock_percentage ASC;

-- Get low stock alerts
SELECT 
  i.ingredientId,
  i.ingredientCode,
  i.ingredientName,
  i.currentStock,
  i.minimumStock,
  i.unit,
  s.supplierName,
  s.phoneNumber as supplier_phone
FROM ingredients i
LEFT JOIN suppliers s ON i.supplierId = s.supplierId
WHERE i.currentStock <= i.minimumStock
  AND i.isActive = true
ORDER BY (i.currentStock / NULLIF(i.minimumStock, 0)) ASC;

-- Get ingredients at or below reorder point
SELECT 
  i.ingredientId,
  i.ingredientCode,
  i.ingredientName,
  i.currentStock,
  i.reorderPoint,
  i.maximumStock,
  i.maximumStock - i.currentStock as suggested_order_quantity,
  i.unitCost,
  (i.maximumStock - i.currentStock) * i.unitCost as estimated_cost,
  s.supplierName
FROM ingredients i
LEFT JOIN suppliers s ON i.supplierId = s.supplierId
WHERE i.currentStock <= i.reorderPoint
  AND i.isActive = true
ORDER BY estimated_cost DESC;

-- Get expiring batches (next 7 days)
SELECT 
  ib.batchId,
  ib.batchNumber,
  i.ingredientName,
  ib.remainingQuantity,
  i.unit,
  ib.expiryDate,
  EXTRACT(DAY FROM (ib.expiryDate - CURRENT_DATE)) as days_until_expiry,
  ib.storageLocation
FROM ingredient_batches ib
JOIN ingredients i ON ib.ingredientId = i.ingredientId
WHERE ib.expiryDate <= CURRENT_DATE + INTERVAL '7 days'
  AND ib.status = 'active'
  AND ib.remainingQuantity > 0
ORDER BY ib.expiryDate ASC;

-- Get expired batches
SELECT 
  ib.batchId,
  ib.batchNumber,
  i.ingredientName,
  ib.remainingQuantity,
  i.unit,
  ib.expiryDate,
  ib.storageLocation
FROM ingredient_batches ib
JOIN ingredients i ON ib.ingredientId = i.ingredientId
WHERE ib.expiryDate < CURRENT_DATE
  AND ib.status = 'active'
  AND ib.remainingQuantity > 0
ORDER BY ib.expiryDate ASC;

-- Get ingredient usage statistics
SELECT 
  i.ingredientName,
  i.unit,
  COUNT(st.transactionId) as transaction_count,
  SUM(CASE WHEN st.transactionType = 'usage' THEN st.quantity ELSE 0 END) as total_usage,
  SUM(CASE WHEN st.transactionType = 'purchase' THEN st.quantity ELSE 0 END) as total_purchased,
  SUM(CASE WHEN st.transactionType = 'waste' THEN st.quantity ELSE 0 END) as total_waste,
  SUM(CASE WHEN st.transactionType = 'usage' THEN st.totalCost ELSE 0 END) as usage_cost
FROM ingredients i
LEFT JOIN stock_transactions st ON i.ingredientId = st.ingredientId
  AND st.transactionDate >= CURRENT_DATE - INTERVAL '30 days'
WHERE i.isActive = true
GROUP BY i.ingredientId, i.ingredientName, i.unit
ORDER BY total_usage DESC;

-- Get ingredient cost analysis
SELECT 
  i.ingredientId,
  i.ingredientName,
  i.currentStock,
  i.unitCost,
  i.currentStock * i.unitCost as stock_value,
  COUNT(DISTINCT st.transactionId) as transaction_count,
  SUM(CASE WHEN st.transactionType = 'usage' THEN st.quantity ELSE 0 END) as total_usage,
  SUM(CASE WHEN st.transactionType = 'usage' THEN st.totalCost ELSE 0 END) as total_cost
FROM ingredients i
LEFT JOIN stock_transactions st ON i.ingredientId = st.ingredientId
  AND st.transactionDate >= CURRENT_DATE - INTERVAL '30 days'
WHERE i.isActive = true
GROUP BY i.ingredientId, i.ingredientName, i.currentStock, i.unitCost
ORDER BY stock_value DESC;

-- ============================================
-- RECIPE & COST QUERIES
-- ============================================

-- Get recipe ingredients for a menu item
SELECT 
  mi.itemName,
  i.ingredientName,
  ri.quantity,
  ri.unit,
  i.unitCost,
  ri.quantity * i.unitCost as ingredient_cost,
  ri.notes
FROM menu_items mi
JOIN recipe_items ri ON mi.itemId = ri.itemId
JOIN ingredients i ON ri.ingredientId = i.ingredientId
WHERE mi.itemId = :itemId
ORDER BY ingredient_cost DESC;

-- Calculate menu item cost (based on recipe)
SELECT 
  mi.itemId,
  mi.itemName,
  mi.price,
  mi.cost as recorded_cost,
  SUM(ri.quantity * i.unitCost) as calculated_cost,
  mi.price - SUM(ri.quantity * i.unitCost) as gross_profit,
  ROUND(100.0 * (mi.price - SUM(ri.quantity * i.unitCost)) / NULLIF(mi.price, 0), 2) as profit_margin
FROM menu_items mi
JOIN recipe_items ri ON mi.itemId = ri.itemId
JOIN ingredients i ON ri.ingredientId = i.ingredientId
WHERE mi.isActive = true
GROUP BY mi.itemId, mi.itemName, mi.price, mi.cost
ORDER BY profit_margin DESC;

-- Check if menu item can be made (ingredient availability)
SELECT 
  mi.itemName,
  i.ingredientName,
  ri.quantity as required_quantity,
  i.currentStock,
  ri.unit,
  CASE 
    WHEN i.currentStock >= ri.quantity THEN 'Available'
    ELSE 'Insufficient'
  END as availability_status,
  FLOOR(i.currentStock / NULLIF(ri.quantity, 0)) as max_servings_possible
FROM menu_items mi
JOIN recipe_items ri ON mi.itemId = ri.itemId
JOIN ingredients i ON ri.ingredientId = i.ingredientId
WHERE mi.itemId = :itemId
ORDER BY availability_status DESC, i.ingredientName;

-- ============================================
-- PURCHASE ORDER QUERIES
-- ============================================

-- Get pending purchase orders
SELECT 
  po.poNumber,
  s.supplierName,
  po.orderDate,
  po.expectedDate,
  po.totalAmount,
  po.status,
  COUNT(poi.poItemId) as item_count
FROM purchase_orders po
JOIN suppliers s ON po.supplierId = s.supplierId
LEFT JOIN purchase_order_items poi ON po.purchaseOrderId = poi.purchaseOrderId
WHERE po.status IN ('pending', 'confirmed')
GROUP BY po.purchaseOrderId, po.poNumber, s.supplierName, po.orderDate, po.expectedDate, po.totalAmount, po.status
ORDER BY po.expectedDate ASC;

-- Get purchase order details with items
SELECT 
  po.*,
  s.supplierName,
  s.contactPerson,
  s.phoneNumber,
  json_agg(
    json_build_object(
      'ingredientName', i.ingredientName,
      'quantity', poi.quantity,
      'receivedQuantity', poi.receivedQuantity,
      'unitPrice', poi.unitPrice,
      'subtotal', poi.subtotal
    )
  ) as items
FROM purchase_orders po
JOIN suppliers s ON po.supplierId = s.supplierId
LEFT JOIN purchase_order_items poi ON po.purchaseOrderId = poi.purchaseOrderId
LEFT JOIN ingredients i ON poi.ingredientId = i.ingredientId
WHERE po.purchaseOrderId = :purchaseOrderId
GROUP BY po.purchaseOrderId, s.supplierName, s.contactPerson, s.phoneNumber;

-- Get supplier performance
SELECT 
  s.supplierId,
  s.supplierName,
  COUNT(DISTINCT po.purchaseOrderId) as total_orders,
  SUM(po.totalAmount) as total_spent,
  AVG(po.totalAmount) as avg_order_value,
  AVG(EXTRACT(DAY FROM (po.receivedDate - po.orderDate))) as avg_delivery_days,
  SUM(CASE WHEN po.status = 'received' AND po.receivedDate <= po.expectedDate 
      THEN 1 ELSE 0 END) as on_time_deliveries,
  ROUND(100.0 * SUM(CASE WHEN po.status = 'received' AND po.receivedDate <= po.expectedDate 
      THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT po.purchaseOrderId), 0), 2) as on_time_rate
FROM suppliers s
JOIN purchase_orders po ON s.supplierId = po.supplierId
WHERE po.orderDate >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY s.supplierId, s.supplierName
ORDER BY total_spent DESC;

-- ============================================
-- STOCK TRANSACTION QUERIES
-- ============================================

-- Get recent stock transactions
SELECT 
  st.transactionId,
  st.transactionDate,
  st.transactionType,
  i.ingredientName,
  st.quantity,
  st.unit,
  st.balanceBefore,
  st.balanceAfter,
  st.notes,
  s.fullName as staff_name
FROM stock_transactions st
JOIN ingredients i ON st.ingredientId = i.ingredientId
LEFT JOIN staff s ON st.staffId = s.staffId
WHERE st.transactionDate >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY st.transactionDate DESC
LIMIT 100;

-- Get stock transaction summary by type
SELECT 
  transactionType,
  COUNT(*) as transaction_count,
  SUM(ABS(quantity)) as total_quantity,
  SUM(COALESCE(totalCost, 0)) as total_cost
FROM stock_transactions
WHERE transactionDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY transactionType
ORDER BY transaction_count DESC;

-- Get ingredient transaction history
SELECT 
  st.transactionDate,
  st.transactionType,
  st.quantity,
  st.unit,
  st.unitCost,
  st.totalCost,
  st.balanceAfter,
  st.notes,
  s.fullName as staff_name
FROM stock_transactions st
LEFT JOIN staff s ON st.staffId = s.staffId
WHERE st.ingredientId = :ingredientId
ORDER BY st.transactionDate DESC
LIMIT 50;

-- ============================================
-- STOCK ALERTS QUERIES
-- ============================================

-- Get active stock alerts
SELECT 
  sa.alertId,
  sa.alertType,
  i.ingredientName,
  sa.currentStock,
  sa.thresholdValue,
  i.unit,
  sa.severity,
  sa.createdAt,
  s.supplierName
FROM stock_alerts sa
JOIN ingredients i ON sa.ingredientId = i.ingredientId
LEFT JOIN suppliers s ON i.supplierId = s.supplierId
WHERE sa.status = 'active'
ORDER BY 
  CASE sa.severity 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  sa.createdAt ASC;

-- Get alert statistics
SELECT 
  alertType,
  COUNT(*) as alert_count,
  SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
  SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_count,
  SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_count,
  SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_count
FROM stock_alerts
WHERE status = 'active'
GROUP BY alertType;

-- ============================================
-- ANALYTICS & REPORTING QUERIES
-- ============================================

-- Get monthly revenue trend (last 12 months)
SELECT 
  TO_CHAR(DATE_TRUNC('month', createdAt), 'YYYY-MM') as month,
  COUNT(*) as bill_count,
  SUM(totalAmount) as revenue,
  AVG(totalAmount) as avg_bill,
  SUM(taxAmount) as total_tax
FROM bills
WHERE paymentStatus = 'paid'
  AND createdAt >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', createdAt)
ORDER BY month DESC;

-- Get customer visit patterns by day of week
SELECT 
  TO_CHAR(createdAt, 'Day') as day_of_week,
  EXTRACT(DOW FROM createdAt) as dow,
  COUNT(*) as order_count,
  SUM(totalAmount) as revenue,
  AVG(totalAmount) as avg_order_value
FROM bills
WHERE paymentStatus = 'paid'
  AND createdAt >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY TO_CHAR(createdAt, 'Day'), EXTRACT(DOW FROM createdAt)
ORDER BY dow;

-- Get comprehensive restaurant statistics
SELECT 
  (SELECT COUNT(*) FROM restaurant_tables WHERE isActive = true) as total_tables,
  (SELECT COUNT(*) FROM restaurant_tables WHERE status = 'available' AND isActive = true) as available_tables,
  (SELECT COUNT(*) FROM menu_items WHERE isActive = true) as active_menu_items,
  (SELECT COUNT(*) FROM staff WHERE isActive = true) as active_staff,
  (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'confirmed', 'preparing')) as active_orders,
  (SELECT COUNT(*) FROM reservations WHERE reservationDate = CURRENT_DATE AND status IN ('pending', 'confirmed')) as todays_reservations,
  (SELECT COUNT(*) FROM ingredients WHERE currentStock <= minimumStock AND isActive = true) as low_stock_items,
  (SELECT SUM(totalAmount) FROM bills WHERE paymentStatus = 'paid' AND DATE(createdAt) = CURRENT_DATE) as today_revenue;

-- ============================================
-- END OF COMMON QUERIES
-- ============================================

-- Note: Replace :parameter placeholders with actual values when executing queries
-- Example: :orderId, :tableId, :ingredientId, :purchaseOrderId, :billId, etc.
