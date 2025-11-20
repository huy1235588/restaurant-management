# 🚀 Đề xuất Tối ưu hóa Database - Hệ thống Quản lý Nhà hàng

> **Phân tích và đề xuất tối ưu hóa cho PostgreSQL + Prisma ORM**

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Index Optimization](#2-index-optimization)
3. [Query Optimization](#3-query-optimization)
4. [Schema Optimization](#4-schema-optimization)
5. [Performance Tuning](#5-performance-tuning)
6. [Partitioning Strategy](#6-partitioning-strategy)
7. [Caching Strategy](#7-caching-strategy)
8. [Monitoring & Maintenance](#8-monitoring--maintenance)

---

## 1. Tổng quan

### 1.1. Mục tiêu tối ưu hóa

✅ **Cải thiện tốc độ truy vấn** - Giảm thời gian response từ 500ms xuống <100ms  
✅ **Tăng throughput** - Xử lý nhiều request đồng thời  
✅ **Giảm tải database** - Tối ưu RAM và CPU usage  
✅ **Scalability** - Dễ dàng mở rộng khi tăng trưởng  

### 1.2. Phân tích hiện trạng

**Điểm mạnh:**
- ✅ Schema được thiết kế tốt với normalization hợp lý
- ✅ Có các index cơ bản trên foreign keys
- ✅ Sử dụng UUID cho các mã đơn hàng/hóa đơn

**Điểm cần cải thiện:**
- ⚠️ Thiếu composite indexes cho các truy vấn phức tạp
- ⚠️ Chưa có full-text search indexes
- ⚠️ Chưa có partitioning cho bảng lớn (orders, bills)
- ⚠️ Chưa tối ưu JSON queries (FloorPlanLayout.data)
- ⚠️ Thiếu materialized views cho báo cáo

---

## 2. Index Optimization

### 2.1. 🔴 **CRITICAL - Cần thêm ngay**

#### 2.1.1. Composite Indexes cho truy vấn phổ biến

```prisma
// schema.prisma - Thêm vào model tương ứng

model Order {
    // ... existing fields ...
    
    @@index([tableId, status]) // Tìm order theo bàn và trạng thái
    @@index([staffId, orderTime]) // Báo cáo hiệu suất nhân viên
    @@index([status, orderTime]) // Dashboard orders theo status
    @@index([reservationId, status]) // Link reservation với order
}

model Reservation {
    // ... existing fields ...
    
    @@index([reservationDate, reservationTime, status]) // Kiểm tra bàn trống
    @@index([tableId, reservationDate, status]) // Lịch đặt bàn theo bàn
    @@index([customerId, reservationDate]) // Lịch sử đặt bàn khách hàng
}

model Bill {
    // ... existing fields ...
    
    @@index([paymentStatus, createdAt]) // Báo cáo doanh thu
    @@index([staffId, paymentStatus, createdAt]) // Hiệu suất thu ngân
}

model KitchenOrder {
    // ... existing fields ...
    
    @@index([status, priority, createdAt]) // Kitchen queue optimization
    @@index([staffId, status, createdAt]) // Chef performance
}

model MenuItem {
    // ... existing fields ...
    
    @@index([categoryId, isActive, isAvailable]) // Menu filtering
}
```

#### 2.1.2. Indexes cho tìm kiếm văn bản

```sql
-- Migration file: Add full-text search indexes

-- Tìm kiếm món ăn theo tên
CREATE INDEX idx_menu_items_name_gin ON menu_items 
USING gin(to_tsvector('simple', item_name));

-- Tìm kiếm trong description
CREATE INDEX idx_menu_items_desc_gin ON menu_items 
USING gin(to_tsvector('simple', description));

-- Tìm kiếm khách hàng theo tên
CREATE INDEX idx_customers_name_gin ON customers 
USING gin(to_tsvector('simple', name));

-- Tìm kiếm nhân viên
CREATE INDEX idx_staff_name_gin ON staff 
USING gin(to_tsvector('simple', full_name));
```

#### 2.1.3. Partial Indexes (Indexes có điều kiện)

```sql
-- Chỉ index các records active/pending (giảm kích thước index)

-- Orders đang active
CREATE INDEX idx_orders_active ON orders(table_id, order_time) 
WHERE status NOT IN ('completed', 'cancelled');

-- Bills chưa thanh toán
CREATE INDEX idx_bills_unpaid ON bills(table_id, created_at) 
WHERE payment_status = 'pending';

-- Reservations sắp tới (trong 7 ngày)
CREATE INDEX idx_reservations_upcoming ON reservations(reservation_date, reservation_time) 
WHERE status IN ('pending', 'confirmed') 
AND reservation_date >= CURRENT_DATE 
AND reservation_date <= CURRENT_DATE + INTERVAL '7 days';

-- Kitchen orders đang xử lý
CREATE INDEX idx_kitchen_orders_active ON kitchen_orders(priority DESC, created_at) 
WHERE status NOT IN ('completed', 'cancelled');
```

### 2.2. 🟡 **MEDIUM Priority - Cải thiện performance**

#### 2.2.1. Indexes cho JSON columns

```sql
-- FloorPlanLayout.data JSON indexing
-- Giả sử structure: {"tables": [...], "walls": [...]}

-- Index GIN cho toàn bộ JSON
CREATE INDEX idx_floor_plan_data_gin ON floor_plan_layouts USING gin(data);

-- Index cụ thể cho tables array
CREATE INDEX idx_floor_plan_tables ON floor_plan_layouts USING gin((data->'tables'));
```

#### 2.2.2. Covering Indexes

```sql
-- Include thêm columns để tránh phải lookup table

-- Order list với thông tin cơ bản (không cần JOIN)
CREATE INDEX idx_orders_list_covering ON orders(order_time DESC) 
INCLUDE (order_number, table_id, staff_id, status, total_amount);

-- Bill list covering
CREATE INDEX idx_bills_list_covering ON bills(created_at DESC) 
INCLUDE (bill_number, order_id, total_amount, payment_status);
```

---

## 3. Query Optimization

### 3.1. 🔴 **N+1 Query Problems - Cần fix**

#### 3.1.1. Vấn đề hiện tại

```typescript
// ❌ BAD - N+1 queries
const orders = await prisma.order.findMany();
for (const order of orders) {
    // Mỗi lần loop = 1 query
    const items = await prisma.orderItem.findMany({
        where: { orderId: order.orderId }
    });
}
// Total: 1 + N queries
```

#### 3.1.2. Giải pháp

```typescript
// ✅ GOOD - 1 query với include
const orders = await prisma.order.findMany({
    include: {
        orderItems: {
            include: {
                menuItem: true
            }
        },
        table: true,
        staff: true
    }
});
// Total: 1 query
```

### 3.2. Tối ưu truy vấn phổ biến

#### 3.2.1. Dashboard - Active Orders

```typescript
// ✅ Optimized query
const activeOrders = await prisma.order.findMany({
    where: {
        status: {
            notIn: ['completed', 'cancelled']
        }
    },
    include: {
        table: {
            select: {
                tableNumber: true,
                section: true
            }
        },
        orderItems: {
            select: {
                quantity: true,
                totalPrice: true
            }
        }
    },
    orderBy: {
        orderTime: 'desc'
    }
});

// Aggregate trong database thay vì application
const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: {
        orderTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
    },
    _count: true,
    _sum: {
        finalAmount: true
    }
});
```

#### 3.2.2. Kiểm tra bàn trống

```typescript
// ✅ Optimized - 1 query với subquery
const availableTables = await prisma.$queryRaw`
    SELECT t.*
    FROM restaurant_tables t
    WHERE t.is_active = true
    AND t.capacity >= ${headCount}
    AND NOT EXISTS (
        SELECT 1 
        FROM reservations r
        WHERE r.table_id = t.table_id
        AND r.reservation_date = ${date}
        AND r.status IN ('confirmed', 'seated')
        AND ${time}::time < (r.reservation_time + (r.duration || ' minutes')::interval)
        AND (${time}::time + ${duration}::interval) > r.reservation_time
    )
    ORDER BY t.capacity, t.table_number
    LIMIT 20
`;
```

#### 3.2.3. Báo cáo doanh thu

```typescript
// ✅ Use aggregation pipeline
const dailyRevenue = await prisma.bill.groupBy({
    by: ['createdAt'],
    where: {
        createdAt: {
            gte: startDate,
            lte: endDate
        },
        paymentStatus: 'paid'
    },
    _sum: {
        totalAmount: true,
        taxAmount: true,
        discountAmount: true
    },
    _count: true
});

// Hoặc raw SQL cho complex queries
const topSellingItems = await prisma.$queryRaw`
    SELECT 
        m.item_id,
        m.item_name,
        c.category_name,
        COUNT(oi.order_item_id) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
    FROM order_items oi
    INNER JOIN menu_items m ON oi.item_id = m.item_id
    INNER JOIN categories c ON m.category_id = c.category_id
    INNER JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_time >= ${startDate}
    AND o.order_time < ${endDate}
    AND o.status != 'cancelled'
    GROUP BY m.item_id, m.item_name, c.category_name
    ORDER BY total_quantity DESC
    LIMIT 20
`;
```

### 3.3. Batch Operations

```typescript
// ✅ Batch insert thay vì insert từng item
await prisma.orderItem.createMany({
    data: items.map(item => ({
        orderId: order.orderId,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
    })),
    skipDuplicates: true
});

// ✅ Batch update
await prisma.orderItem.updateMany({
    where: {
        orderId: orderId
    },
    data: {
        status: 'preparing'
    }
});
```

---

## 4. Schema Optimization

### 4.1. 🔴 Thêm các trường computed/denormalized

#### 4.1.1. Order - Thêm trường tính toán sẵn

```prisma
model Order {
    orderId            Int      @id @default(autoincrement())
    // ... existing fields ...
    
    // ✅ THÊM: Denormalized fields để tránh JOIN/aggregate
    itemCount          Int      @default(0) // Số món trong order
    totalAmount        Decimal  @default(0) @db.Decimal(12, 2)
    discountAmount     Decimal  @default(0) @db.Decimal(12, 2)
    taxAmount          Decimal  @default(0) @db.Decimal(12, 2)
    finalAmount        Decimal  @default(0) @db.Decimal(12, 2)
    
    // ✅ THÊM: Timestamps để tracking
    confirmedAt        DateTime?
    completedAt        DateTime?
    cancelledAt        DateTime?
    cancellationReason String?  @db.Text
}
```

**⚠️ Lưu ý:** Cần update các trường này khi:
- Thêm/xóa OrderItem
- Áp dụng discount
- Tính thuế

```typescript
// Trigger hoặc application logic
async function updateOrderTotals(orderId: number) {
    const items = await prisma.orderItem.aggregate({
        where: { orderId },
        _sum: {
            totalPrice: true
        },
        _count: true
    });
    
    const subtotal = items._sum.totalPrice || 0;
    const taxAmount = subtotal * 0.08; // 8% tax
    const finalAmount = subtotal + taxAmount;
    
    await prisma.order.update({
        where: { orderId },
        data: {
            itemCount: items._count,
            totalAmount: subtotal,
            taxAmount,
            finalAmount
        }
    });
}
```

#### 4.1.2. MenuItem - Thêm statistics fields

```prisma
model MenuItem {
    itemId          Int      @id @default(autoincrement())
    // ... existing fields ...
    
    // ✅ THÊM: Statistics (update daily/weekly)
    totalOrdered    Int      @default(0) // Tổng số lần order
    totalRevenue    Decimal  @default(0) @db.Decimal(12, 2)
    lastOrderedAt   DateTime? // Lần cuối được order
    avgRating       Decimal?  @db.Decimal(3, 2) // Rating trung bình (nếu có review)
}
```

### 4.2. 🟡 Thêm soft delete

```prisma
model MenuItem {
    // ... existing fields ...
    
    deletedAt  DateTime? // NULL = active, có giá trị = deleted
    deletedBy  Int? // Người xóa
    
    @@index([deletedAt]) // Filter records chưa xóa
}

model Order {
    // ... existing fields ...
    
    deletedAt  DateTime?
    deletedBy  Int?
    
    @@index([deletedAt])
}
```

**Query với soft delete:**

```typescript
// Chỉ lấy records chưa xóa
const activeItems = await prisma.menuItem.findMany({
    where: {
        deletedAt: null,
        isActive: true
    }
});

// Soft delete
await prisma.menuItem.update({
    where: { itemId },
    data: {
        deletedAt: new Date(),
        deletedBy: staffId
    }
});
```

### 4.3. 🔵 Thêm Customer model đầy đủ

```prisma
// ✅ THÊM: Customer loyalty tracking
model Customer {
    customerId      Int       @id @default(autoincrement())
    name            String    @db.VarChar(255)
    phoneNumber     String    @unique @db.VarChar(20)
    email           String?   @unique @db.VarChar(255)
    birthday        DateTime? @db.Date
    
    // ✅ THÊM: Loyalty & Statistics
    totalVisits     Int       @default(0)
    totalSpent      Decimal   @default(0) @db.Decimal(12, 2)
    lastVisitDate   DateTime?
    isVip           Boolean   @default(false)
    loyaltyPoints   Int       @default(0)
    loyaltyTier     String?   @db.VarChar(20) // Bronze, Silver, Gold, Platinum
    
    // Preferences
    preferences     Json?     // {"favoriteItems": [], "allergies": [], "notes": ""}
    notes           String?   @db.Text
    
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
    
    reservations    Reservation[]
    orders          Order[]   @relation("CustomerOrders") // Thêm relation
    
    @@index([phoneNumber])
    @@index([email])
    @@index([isVip])
    @@index([loyaltyTier])
}
```

### 4.4. 🔵 Thêm Audit logs

```prisma
// ✅ THÊM: Audit trail cho compliance
model AuditLog {
    logId         Int       @id @default(autoincrement())
    tableName     String    @db.VarChar(100) // orders, bills, staff, etc.
    recordId      Int       // ID của record bị thay đổi
    action        String    @db.VarChar(50) // CREATE, UPDATE, DELETE
    userId        Int? // Staff thực hiện
    changes       Json? // {"before": {...}, "after": {...}}
    ipAddress     String?   @db.VarChar(45)
    userAgent     String?   @db.VarChar(500)
    createdAt     DateTime  @default(now())
    
    user          Staff?    @relation(fields: [userId], references: [staffId])
    
    @@index([tableName, recordId])
    @@index([userId, createdAt])
    @@index([createdAt])
}
```

---

## 5. Performance Tuning

### 5.1. PostgreSQL Configuration

```ini
# postgresql.conf - Tối ưu cho restaurant app (8GB RAM server)

# Memory Settings
shared_buffers = 2GB                    # 25% of RAM
effective_cache_size = 6GB              # 75% of RAM
maintenance_work_mem = 512MB
work_mem = 16MB

# Checkpoint Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Parallel Query Settings
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# Connection Settings
max_connections = 200

# Query Planner
random_page_cost = 1.1                  # For SSD
effective_io_concurrency = 200

# Logging (Development)
log_min_duration_statement = 1000       # Log slow queries > 1s
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

### 5.2. Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    
    // ✅ Connection pooling
    relationMode = "prisma"
}

// .env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant?connection_limit=20&pool_timeout=20"
```

**Hoặc dùng PgBouncer:**

```ini
# pgbouncer.ini
[databases]
restaurant = host=localhost port=5432 dbname=restaurant

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

### 5.3. Query Timeout

```typescript
// Prisma Client với timeout
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    // ✅ Set timeout để tránh slow queries
    log: ['query', 'error', 'warn'],
});

// Per-query timeout
await prisma.$queryRaw`
    SET LOCAL statement_timeout = '5s';
    SELECT * FROM orders WHERE ...;
`;
```

---

## 6. Partitioning Strategy

### 6.1. 🟡 Partition bảng orders (theo tháng)

```sql
-- Tạo bảng partitioned
CREATE TABLE orders_partitioned (
    LIKE orders INCLUDING ALL
) PARTITION BY RANGE (order_time);

-- Tạo partitions cho mỗi tháng
CREATE TABLE orders_2025_01 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE orders_2025_02 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- ... tạo partitions cho các tháng tiếp theo

-- Tạo partition mặc định cho tương lai
CREATE TABLE orders_default PARTITION OF orders_partitioned DEFAULT;

-- Migrate dữ liệu
INSERT INTO orders_partitioned SELECT * FROM orders;

-- Rename tables
ALTER TABLE orders RENAME TO orders_old;
ALTER TABLE orders_partitioned RENAME TO orders;
```

**Lợi ích:**
- ✅ Query nhanh hơn (chỉ scan partition cần thiết)
- ✅ Dễ archive dữ liệu cũ (DROP partition cũ)
- ✅ Vacuum/Analyze nhanh hơn

### 6.2. 🟡 Partition bảng bills

```sql
-- Tương tự orders
CREATE TABLE bills_partitioned (
    LIKE bills INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Tạo partitions theo tháng
CREATE TABLE bills_2025_01 PARTITION OF bills_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- ...
```

### 6.3. 🔵 Archive Strategy

```sql
-- Script tự động archive dữ liệu > 2 năm
-- Chạy monthly cron job

-- 1. Export dữ liệu cũ ra bảng archive
CREATE TABLE orders_archive_2023 AS 
SELECT * FROM orders 
WHERE order_time >= '2023-01-01' 
AND order_time < '2024-01-01';

-- 2. Backup ra file
pg_dump -t orders_archive_2023 restaurant > orders_2023_backup.sql

-- 3. Xóa khỏi production table
DELETE FROM orders 
WHERE order_time < '2023-01-01';

-- 4. VACUUM để reclaim space
VACUUM FULL orders;
```

---

## 7. Caching Strategy

### 7.1. 🔴 Redis Cache cho Menu

```typescript
// services/menu.service.ts
import Redis from 'ioredis';

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    db: 0
});

export class MenuService {
    // ✅ Cache menu trong 5 phút
    async getFullMenu() {
        const cacheKey = 'menu:full';
        
        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        
        // Query database
        const menu = await prisma.category.findMany({
            where: { isActive: true },
            include: {
                menuItems: {
                    where: {
                        isActive: true,
                        isAvailable: true
                    },
                    orderBy: { displayOrder: 'asc' }
                }
            },
            orderBy: { displayOrder: 'asc' }
        });
        
        // Cache for 5 minutes
        await redis.setex(cacheKey, 300, JSON.stringify(menu));
        
        return menu;
    }
    
    // ✅ Invalidate cache khi update
    async updateMenuItem(itemId: number, data: any) {
        await prisma.menuItem.update({
            where: { itemId },
            data
        });
        
        // Clear cache
        await redis.del('menu:full');
        await redis.del(`menu:item:${itemId}`);
    }
}
```

### 7.2. 🔴 Cache Table Status

```typescript
// Real-time table status (cache 10s)
export class TableService {
    async getTableStatus() {
        const cacheKey = 'tables:status';
        
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        
        const tables = await prisma.restaurantTable.findMany({
            where: { isActive: true },
            select: {
                tableId: true,
                tableNumber: true,
                status: true,
                capacity: true,
                floor: true,
                section: true
            },
            orderBy: { tableNumber: 'asc' }
        });
        
        await redis.setex(cacheKey, 10, JSON.stringify(tables));
        return tables;
    }
    
    // Update status và invalidate cache
    async updateTableStatus(tableId: number, status: string) {
        await prisma.restaurantTable.update({
            where: { tableId },
            data: { status }
        });
        
        await redis.del('tables:status');
        
        // Publish event qua WebSocket
        pubsub.publish('TABLE_STATUS_CHANGED', {
            tableId,
            status
        });
    }
}
```

### 7.3. 🟡 Cache cho Dashboard Stats

```typescript
// Cache dashboard metrics (30s)
export class DashboardService {
    async getDashboardStats() {
        const cacheKey = 'dashboard:stats';
        
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        
        const today = new Date().setHours(0, 0, 0, 0);
        
        const [
            activeOrders,
            todayRevenue,
            availableTables,
            pendingReservations
        ] = await Promise.all([
            prisma.order.count({
                where: {
                    status: {
                        notIn: ['completed', 'cancelled']
                    }
                }
            }),
            prisma.bill.aggregate({
                where: {
                    createdAt: { gte: new Date(today) },
                    paymentStatus: 'paid'
                },
                _sum: { totalAmount: true }
            }),
            prisma.restaurantTable.count({
                where: {
                    status: 'available',
                    isActive: true
                }
            }),
            prisma.reservation.count({
                where: {
                    status: 'pending'
                }
            })
        ]);
        
        const stats = {
            activeOrders,
            todayRevenue: todayRevenue._sum.totalAmount || 0,
            availableTables,
            pendingReservations
        };
        
        await redis.setex(cacheKey, 30, JSON.stringify(stats));
        return stats;
    }
}
```

### 7.4. Cache Patterns

```typescript
// Pattern 1: Cache-Aside (Lazy Loading)
async function getCachedData(key: string, fetchFn: () => Promise<any>, ttl: number) {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    
    const data = await fetchFn();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
}

// Pattern 2: Write-Through
async function updateWithCache(key: string, updateFn: () => Promise<any>) {
    const data = await updateFn();
    await redis.set(key, JSON.stringify(data));
    return data;
}

// Pattern 3: Cache Invalidation
async function invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}

// Usage
await invalidatePattern('menu:*'); // Clear all menu cache
await invalidatePattern('tables:*'); // Clear all table cache
```

---

## 8. Monitoring & Maintenance

### 8.1. 🔴 Query Performance Monitoring

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Most called queries
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- Queries với highest total time
SELECT 
    query,
    calls,
    total_exec_time,
    (total_exec_time / calls) as avg_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 8.2. 🔴 Index Usage Monitoring

```sql
-- Indexes không được sử dụng (có thể xóa)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pk_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Indexes được sử dụng nhiều nhất
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 20;

-- Table scans (nên có index)
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    seq_scan - idx_scan AS too_much_seq,
    CASE 
        WHEN seq_scan - idx_scan > 0 
        THEN 'Missing Index?'
        ELSE 'OK'
    END AS index_status
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY too_much_seq DESC
LIMIT 20;
```

### 8.3. 🟡 Database Size Monitoring

```sql
-- Kích thước database
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- Kích thước từng bảng
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Dead tuples (cần VACUUM)
SELECT
    schemaname,
    tablename,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;
```

### 8.4. 🟡 Automated Maintenance

```bash
#!/bin/bash
# maintenance.sh - Chạy daily cron job

# 1. Analyze statistics
psql -d restaurant -c "ANALYZE VERBOSE;"

# 2. Reindex nếu cần
psql -d restaurant -c "REINDEX DATABASE restaurant CONCURRENTLY;"

# 3. Vacuum tables
psql -d restaurant -c "VACUUM ANALYZE VERBOSE;"

# 4. Check bloat
psql -d restaurant -f check_bloat.sql

# 5. Backup
pg_dump restaurant | gzip > /backups/restaurant_$(date +%Y%m%d).sql.gz

# 6. Cleanup old backups (giữ 30 ngày)
find /backups -name "restaurant_*.sql.gz" -mtime +30 -delete

# 7. Update cache warmup
curl -X POST http://localhost:3000/api/admin/cache/warmup
```

```sql
-- check_bloat.sql - Kiểm tra bloat
WITH constants AS (
    SELECT current_setting('block_size')::numeric AS bs, 23 AS hdr, 4 AS ma
),
bloat_info AS (
    SELECT
        schemaname,
        tablename,
        pg_total_relation_size(schemaname||'.'||tablename) AS size,
        ROUND((CASE WHEN otta=0 THEN 0.0 ELSE sml.relpages/otta::numeric END)::numeric,1) AS ratio
    FROM (
        SELECT
            schemaname, tablename, cc.reltuples, cc.relpages, bs,
            CEIL((cc.reltuples*((datahdr+ma-(CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::float)) AS otta
        FROM (
            SELECT
                ma,bs,schemaname,tablename,
                (datawidth+(hdr+ma-(case when hdr%ma=0 THEN ma ELSE hdr%ma END)))::numeric AS datahdr,
                (maxfracsum*(nullhdr+ma-(case when nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
            FROM (
                SELECT
                    schemaname, tablename, hdr, ma, bs,
                    SUM((1-null_frac)*avg_width) AS datawidth,
                    MAX(null_frac) AS maxfracsum,
                    hdr+(
                        SELECT 1+count(*)/8
                        FROM pg_stats s2
                        WHERE null_frac<>0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
                    ) AS nullhdr
                FROM pg_stats s, constants
                WHERE schemaname NOT IN ('pg_catalog','information_schema')
                GROUP BY 1,2,3,4,5
            ) AS foo
        ) AS rs
        JOIN pg_class cc ON cc.relname = rs.tablename
        JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = rs.schemaname
    ) AS sml
)
SELECT *
FROM bloat_info
WHERE ratio > 1.5
ORDER BY size DESC;
```

### 8.5. 🔵 Application-level Monitoring

```typescript
// middleware/query-logger.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query'
        },
        {
            emit: 'event',
            level: 'error'
        }
    ]
});

// Log slow queries
prisma.$on('query', (e) => {
    if (e.duration > 1000) { // > 1s
        console.warn('Slow Query:', {
            query: e.query,
            duration: `${e.duration}ms`,
            params: e.params,
            timestamp: new Date().toISOString()
        });
        
        // Send to monitoring service (DataDog, New Relic, etc.)
        monitoring.trackSlowQuery({
            query: e.query,
            duration: e.duration,
            timestamp: Date.now()
        });
    }
});

// Log errors
prisma.$on('error', (e) => {
    console.error('Database Error:', e);
    monitoring.trackError(e);
});

export default prisma;
```

---

## 9. Implementation Checklist

### Phase 1: Critical (Làm ngay) ⏰ 1-2 ngày

- [ ] **Thêm composite indexes** cho orders, reservations, bills
- [ ] **Fix N+1 queries** trong các API endpoints chính
- [ ] **Setup Redis caching** cho menu và table status
- [ ] **Enable pg_stat_statements** và monitoring
- [ ] **Configure connection pooling** (PgBouncer)

### Phase 2: Important (Tuần 1-2) 📅

- [ ] **Full-text search indexes** cho menu items và customers
- [ ] **Partial indexes** cho active/pending records
- [ ] **Denormalize Order totals** (totalAmount, itemCount)
- [ ] **Add Customer statistics** (totalVisits, totalSpent)
- [ ] **Setup query timeout** và error handling

### Phase 3: Optimization (Tuần 3-4) 🚀

- [ ] **Partitioning** cho orders và bills
- [ ] **Materialized views** cho reporting
- [ ] **Archive strategy** cho dữ liệu cũ
- [ ] **Soft delete implementation**
- [ ] **Audit logging system**

### Phase 4: Advanced (Tháng 2+) 🎯

- [ ] **Read replicas** cho read-heavy queries
- [ ] **Database sharding** nếu scale lớn
- [ ] **Advanced caching strategies** (cache warming, invalidation)
- [ ] **Performance testing** và benchmarking
- [ ] **Automated maintenance scripts**

---

## 10. Metrics & KPIs

### 10.1. Performance Targets

| Metric                      | Current | Target  | Good    |
| --------------------------- | ------- | ------- | ------- |
| Average query time          | 500ms   | < 100ms | < 50ms  |
| P95 query time              | 2s      | < 500ms | < 200ms |
| Dashboard load time         | 3s      | < 1s    | < 500ms |
| Order creation time         | 2s      | < 500ms | < 200ms |
| Table status update         | 1s      | < 100ms | < 50ms  |
| Menu load time              | 1.5s    | < 300ms | < 100ms |

### 10.2. Resource Usage

| Metric              | Current | Target | Good  |
| ------------------- | ------- | ------ | ----- |
| Database size       | 2GB     | < 10GB | < 5GB |
| Index size          | 500MB   | < 2GB  | < 1GB |
| Connection pool     | 50      | 20-30  | 20    |
| CPU usage           | 60%     | < 50%  | < 30% |
| Memory usage        | 4GB     | < 6GB  | < 4GB |
| Cache hit ratio     | 70%     | > 90%  | > 95% |

---

## 11. Kết luận

Việc tối ưu hóa database là một **quá trình liên tục**, không phải one-time task. Các điểm chính:

✅ **Ưu tiên cao:**
1. Thêm indexes cho truy vấn phổ biến
2. Fix N+1 queries
3. Setup caching (Redis)
4. Monitoring và alerting

✅ **Lợi ích kỳ vọng:**
- 🚀 Tăng tốc độ truy vấn 5-10x
- 💰 Giảm cost infrastructure
- 📈 Scale tốt hơn khi tăng trưởng
- 😊 Trải nghiệm người dùng tốt hơn

✅ **Best Practices:**
- Measure trước khi optimize
- Test thoroughly trên staging
- Monitor metrics sau khi deploy
- Document mọi thay đổi

**Next Steps:** Bắt đầu với Phase 1 - Critical optimizations! 🚀
