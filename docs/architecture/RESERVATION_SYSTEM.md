# 📅 Hệ thống Đặt bàn - Hệ thống Quản lý Nhà hàng

> **Tài liệu chi tiết về quy trình đặt bàn, quy tắc nghiệp vụ và tích hợp**

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Quy trình đặt bàn](#2-quy-trình-đặt-bàn)
3. [Các trạng thái đặt bàn](#3-các-trạng-thái-đặt-bàn)
4. [Cấu trúc bảng](#4-cấu-trúc-bảng)
5. [Quy tắc nghiệp vụ](#5-quy-tắc-nghiệp-vụ)
6. [Hệ thống thông báo](#6-hệ-thống-thông-báo)
7. [Tích hợp với hệ thống đặt món](#7-tích-hợp-với-hệ-thống-đặt-món)

---

## 1. Tổng quan

Hệ thống đặt bàn trực tuyến cho phép khách hàng đặt bàn trước, quản lý lịch đặt bàn và tối ưu hóa việc sử dụng bàn.

### Lợi ích

✅ Tăng tỷ lệ sử dụng bàn  
✅ Cải thiện trải nghiệm khách hàng  
✅ Giảm thời gian chờ đợi  
✅ Quản lý dữ liệu khách hàng  
✅ Hỗ trợ tiếp thị (email/SMS)  

---

## 2. Quy trình đặt bàn

### 2.1. Flow đặt bàn

```
Khách hàng → Chọn ngày/giờ → Chọn số người
    ↓
Hệ thống kiểm tra bàn trống
    ↓
Hiển thị danh sách bàn phù hợp
    ↓
Khách chọn bàn → Nhập thông tin
    ↓
Tạo reservation (status: pending)
    ↓
Nhân viên xác nhận → status: confirmed
    ↓
Khách đến → status: seated → Tạo order
    ↓
Hoàn thành → status: completed
```

### 2.2. Các bước chi tiết

**Bước 1: Chọn ngày giờ và số người**
- Khách nhập ngày đặt, giờ đặt, số người
- Hệ thống kiểm tra tính hợp lệ

**Bước 2: Kiểm tra bàn trống**
- Query database để tìm bàn có sẵn
- Lọc theo sức chứa và khoảng thời gian
- Ưu tiên bàn phù hợp nhất

**Bước 3: Lựa chọn bàn**
- Hiển thị danh sách bàn khả dụng
- Cho phép khách chọn bàn yêu thích
- Hiển thị vị trí bàn (nếu có)

**Bước 4: Nhập thông tin khách**
- Họ tên, số điện thoại, email
- Yêu cầu đặc biệt (sinh nhật, kỷ niệm, etc.)
- Tiền cọc (nếu cần)

**Bước 5: Xác nhận đặt bàn**
- Tạo record trong bảng `reservations`
- Gửi email/SMS xác nhận cho khách
- Gửi thông báo cho nhân viên

---

## 3. Các trạng thái đặt bàn

| Status      | Mô tả                   | Hành động tiếp theo        | Màu   |
| ----------- | ----------------------- | -------------------------- | ----- |
| `pending`   | Chờ xác nhận            | Nhân viên xác nhận/từ chối  | 🟡   |
| `confirmed` | Đã xác nhận             | Đợi khách đến              | 🟢   |
| `seated`    | Khách đã đến, đang ngồi | Tạo order                  | 🔵   |
| `completed` | Hoàn thành              | Đóng reservation           | ⚪   |
| `cancelled` | Đã hủy                  | Giải phóng bàn             | ⚫   |
| `no_show`   | Khách không đến         | Giải phóng bàn             | 🔴   |

### Chuyển trạng thái

```
pending ──→ confirmed ──→ seated ──→ completed
   │
   ├──────────→ cancelled
   
confirmed ──→ no_show (nếu khách không đến)
```

---

## 4. Cấu trúc bảng

### Bảng: reservations

| Trường          | Kiểu         | Mô tả                         |
| --------------- | ------------ | ----------------------------- |
| reservationId   | INTEGER      | ID đặt bàn (PK)               |
| reservationCode | VARCHAR(50)  | Mã đặt bàn (UUID) - dùng cho khách |
| customerName    | VARCHAR(255) | Tên khách                     |
| phoneNumber     | VARCHAR(20)  | SĐT khách                     |
| email           | VARCHAR(255) | Email khách                   |
| customerId      | INTEGER      | FK → customers (optional)     |
| tableId         | INTEGER      | FK → restaurant_tables        |
| reservationDate | DATE         | Ngày đặt (YYYY-MM-DD)         |
| reservationTime | TIME         | Giờ đặt (HH:MM:SS)            |
| duration        | INTEGER      | Thời lượng dự kiến (phút)     |
| partySize       | INTEGER      | Số người                      |
| specialRequest  | TEXT         | Yêu cầu đặc biệt (sinh nhật, etc.) |
| depositAmount   | DECIMAL      | Tiền cọc                      |
| status          | ENUM         | Trạng thái (pending, confirmed, etc.) |
| notes           | TEXT         | Ghi chú nội bộ                |
| tags            | STRING[]     | Tags (VIP, urgent, etc.)      |
| createdBy       | INTEGER      | FK → staff (nhân viên tạo)    |
| confirmedAt     | TIMESTAMP    | Thời điểm xác nhận            |
| seatedAt        | TIMESTAMP    | Thời điểm khách ngồi          |
| completedAt     | TIMESTAMP    | Thời điểm hoàn thành          |
| cancelledAt     | TIMESTAMP    | Thời điểm hủy                 |
| cancellationReason | TEXT      | Lý do hủy                     |
| createdAt       | TIMESTAMP    | Ngày tạo                      |
| updatedAt       | TIMESTAMP    | Ngày cập nhật                 |

### Bảng: reservation_audits (Audit trail)

| Trường        | Kiểu         | Mô tả                     |
| ------------- | ------------ | ------------------------- |
| auditId       | INTEGER      | ID audit log (PK)         |
| reservationId | INTEGER      | FK → reservations         |
| action        | VARCHAR(100) | Hành động (CREATE, UPDATE, CONFIRM, CANCEL) |
| userId        | INTEGER      | FK → staff (người thực hiện) |
| changes       | JSON         | Thay đổi (before/after)   |
| createdAt     | TIMESTAMP    | Thời điểm thay đổi        |

---

## 5. Quy tắc nghiệp vụ

### 5.1. Kiểm tra bàn trống

**Điều kiện để bàn được coi là có sẵn:**

1. Bàn đang active (`isActive = true`)
2. Trạng thái là `available` hoặc `reserved`
3. Không có reservation nào khác trong khung giờ
4. Sức chứa >= số người yêu cầu

**SQL Logic:**

```sql
WITH ActiveReservations AS (
    SELECT
        tableId,
        reservationTime,
        reservationTime + (duration || ' minutes')::interval as endTime
    FROM reservations
    WHERE reservationDate = $1
        AND status IN ('confirmed', 'seated')
)
SELECT t.*
FROM restaurant_tables t
WHERE NOT EXISTS (
    SELECT 1 FROM ActiveReservations ar
    WHERE ar.tableId = t.tableId
        AND $2 < ar.endTime
        AND ($2 + $3::interval) > ar.reservationTime
)
AND t.capacity >= $4
AND t.isActive = true;
```

### 5.2. Quy tắc thời gian

| Quy tắc                   | Giá trị   | Mô tả                           |
| ------------------------- | --------- | ------------------------------- |
| Thời gian trước tối thiểu  | 2 giờ     | Khách phải đặt trước 2h         |
| Thời gian trước tối đa     | 30 ngày   | Không được đặt quá 30 ngày      |
| Thời lượng mặc định        | 120 phút  | Khách ngồi trung bình 2h        |
| Buffer time giữa orders    | 30 phút   | Để dọn dẹp giữa các khách       |
| Nhắc nhở khách             | 2 giờ     | Gửi SMS 2h trước giờ đặt        |

### 5.3. Quy tắc sức chứa

```
minCapacity ≤ partySize ≤ capacity

Ví dụ: Bàn 6 người (minCapacity=2, capacity=6)
- Có thể đặt cho 2, 3, 4, 5, hoặc 6 người
- Không thể đặt cho 1 người (< minCapacity)
- Không thể đặt cho 7 người (> capacity)
```

### 5.4. Quy tắc tiền cọc

- **Optional**: Có thể cọc hoặc không
- **Ngưỡng**: VIP customers luôn phải cọc
- **Tính toán**: Có thể là % của estimated bill hoặc fixed amount
- **Refund**: Hoàn lại nếu khách cancelled trước 24h

---

## 6. Hệ thống thông báo

### 6.1. Loại thông báo

| Sự kiện          | Người nhận | Kênh      | Thời gian             |
| ---------------- | ---------- | --------- | --------------------- |
| Đặt bàn mới      | Nhân viên  | Email/SMS | Ngay khi khách đặt    |
| Xác nhận đặt bàn | Khách      | Email/SMS | Khi nhân viên xác nhận |
| Nhắc nhở         | Khách      | SMS       | 2h trước giờ đặt      |
| Hủy bàn          | Cả hai     | Email/SMS | Khi hủy đặt bàn       |
| No-show          | Nhân viên  | SMS       | Sau khi quá giờ đặt   |

### 6.2. Template thông báo

**Email xác nhận (cho khách hàng):**

```
Kính chào [customerName],

Cảm ơn bạn đã đặt bàn tại nhà hàng chúng tôi!

🎯 THÔNG TIN ĐẶT BÀN
━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Mã đặt bàn: [reservationCode]
✓ Ngày: [reservationDate]
✓ Giờ: [reservationTime]
✓ Số người: [headCount]
✓ Bàn số: [tableNumber]
✓ Khu vực: [section]

💡 LƯU Ý
━━━━━━━━━━━━━━━━━━━━━━━━━
• Vui lòng đến trước giờ đặt 10 phút
• Giữ mã đặt bàn để xác nhận khi đến
• Nếu có thay đổi, liên hệ sớm nhất có thể

📞 LIÊN HỆ
━━━━━━━━━━━━━━━━━━━━━━━━━
Điện thoại: [restaurantPhone]
Email: [restaurantEmail]
Website: [restaurantWebsite]

Xin cảm ơn!
```

**SMS nhắc nhở (cho khách hàng):**

```
[Restaurant] Nhac nho: Ban da dat ban vao [TIME] hom nay, [HEADCOUNT] nguoi, ban [TABLENUMBER]. 
Ma: [CODE]. Lien he: [PHONE] neu co thay doi.
```

**Email thông báo (cho nhân viên):**

```
🔔 ĐẶT BÀN MỚI

Khách hàng: [customerName]
SĐT: [phoneNumber]
Email: [email]

Bàn: [tableNumber] (Sức chứa: [capacity])
Ngày: [reservationDate]
Giờ: [reservationTime]
Số người: [headCount]
Thời lượng: [duration] phút

Yêu cầu đặc biệt: [specialRequest]
Tiền cọc: [depositAmount]

Hành động: Vui lòng xác nhận hoặc từ chối đặt bàn này
```

---

## 7. Tích hợp với hệ thống đặt món

### 7.1. Khi khách đến (Seated)

**SQL Transactions:**

```sql
BEGIN;

-- 1. Cập nhật reservation status
UPDATE reservations
SET status = 'seated', 
    seatedAt = NOW(),
    updatedAt = NOW()
WHERE reservationId = $1;

-- 2. Cập nhật table status
UPDATE restaurant_tables
SET status = 'occupied', 
    updatedAt = NOW()
WHERE tableId = (
    SELECT tableId FROM reservations WHERE reservationId = $1
);

-- 3. Tạo order liên kết với reservation
INSERT INTO orders (
    tableId,
    reservationId,
    customerName,
    customerPhone,
    partySize,
    staffId,
    status,
    orderTime
)
SELECT
    tableId,
    reservationId,
    customerName,
    phoneNumber as customerPhone,
    partySize,
    $2 as staffId,
    'pending' as status,
    NOW()
FROM reservations
WHERE reservationId = $1
RETURNING *;

-- 4. Ghi audit log
INSERT INTO reservation_audits (
    reservationId,
    action,
    userId,
    changes
) VALUES (
    $1,
    'SEATED',
    $2,
    jsonb_build_object('status', 'seated', 'seatedAt', NOW())
);

COMMIT;
```

### 7.2. Khi hoàn thành (Complete)

```sql
BEGIN;

-- 1. Lấy orderId từ reservation
WITH orderData AS (
    SELECT o.orderId
    FROM orders o
    WHERE o.reservationId = $1
    LIMIT 1
)

-- 2. Hoàn thành order
UPDATE orders
SET status = 'completed',
    completedAt = NOW(),
    updatedAt = NOW()
FROM orderData
WHERE orderId = orderData.orderId;

-- 3. Hoàn thành reservation
UPDATE reservations
SET status = 'completed',
    completedAt = NOW(),
    updatedAt = NOW()
WHERE reservationId = $1;

-- 4. Giải phóng bàn
UPDATE restaurant_tables
SET status = 'available',
    updatedAt = NOW()
WHERE tableId = (
    SELECT tableId FROM reservations WHERE reservationId = $1
);

-- 5. Ghi audit log
INSERT INTO reservation_audits (
    reservationId,
    action,
    userId,
    changes
) VALUES (
    $1,
    'COMPLETED',
    $2,
    jsonb_build_object('status', 'completed', 'completedAt', NOW())
);

COMMIT;
```

### 7.3. Khi hủy (Cancel)

```sql
BEGIN;

-- 1. Cập nhật reservation status
UPDATE reservations
SET status = 'cancelled',
    cancelledAt = NOW(),
    cancellationReason = $2,
    updatedAt = NOW()
WHERE reservationId = $1;

-- 2. Giải phóng bàn
UPDATE restaurant_tables
SET status = 'available',
    updatedAt = NOW()
WHERE tableId = (
    SELECT tableId FROM reservations WHERE reservationId = $1
);

-- 3. Nếu có order, đánh dấu cancelled
UPDATE orders
SET status = 'cancelled',
    cancelledAt = NOW(),
    cancellationReason = $2
WHERE reservationId = $1
AND status NOT IN ('completed');

-- 4. Ghi audit log
INSERT INTO reservation_audits (
    reservationId,
    action,
    userId,
    changes
) VALUES (
    $1,
    'CANCELLED',
    $2,
    jsonb_build_object(
        'status', 'cancelled',
        'cancelledAt', NOW(),
        'reason', $2
    )
);

COMMIT;
```

---

## 8. No-Show Handling

### Quy trình

```
Giờ đặt + 30 phút → Kiểm tra khách có đến không
      ↓
Chưa seated → Gửi thông báo no-show
      ↓
Nhân viên xác nhận no-show
      ↓
Status: no_show
      ↓
Giải phóng bàn
```

### Hậu quả (có thể tuỳ chỉnh)

- ❌ Không hoàn tiền cọc
- 📝 Ghi nhận customer profile
- 🔔 Hỗ trợ quyết định về no-show policy
- 📊 Thống kê no-show rate

---

## 9. Chỉ số KPI

```sql
-- No-show rate
SELECT
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) * 100.0 / COUNT(*) as no_show_rate
FROM reservations
WHERE reservationDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Reservation utilization
SELECT
    COUNT(CASE WHEN status IN ('seated', 'completed') THEN 1 END) * 100.0 / COUNT(*) as utilization_rate
FROM reservations
WHERE reservationDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Average party size
SELECT AVG(partySize) as avg_party_size
FROM reservations
WHERE status = 'completed'
AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```
