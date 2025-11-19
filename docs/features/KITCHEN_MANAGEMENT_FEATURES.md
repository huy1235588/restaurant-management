# Kitchen Management - Tài Liệu Tính Năng Toàn Diện

## Overview

**Kitchen Management** (Quản Lý Bếp) là hệ thống dành riêng cho **đầu bếp và nhân viên bếp** (chefs/kitchen staff) để quản lý quy trình nấu nướng từ phía back-of-house. Hệ thống này tập trung vào việc nhận đơn từ phục vụ, tổ chức sản xuất, và đảm bảo các món được nấu đúng chất lượng và kịp thời.

**Vai trò chính:**
- 📺 **Kitchen Display System (KDS)**: Màn hình hiển thị tất cả đơn bếp và tiến độ real-time
- 🔔 **Nhận đơn từ Waiters**: Tự động nhận đơn khi phục vụ gửi, thông báo bằng âm thanh
- 👨‍🍳 **Quản lý production**: Phân công đầu bếp, theo dõi tiến độ nấu từng món
- ⏰ **Priority & Timing**: Quản lý độ ưu tiên (VIP, Express), đếm giờ nấu
- 🏭 **Workstation Management**: Phân vùng bếp (Nướng, Chiên, Hấp) và phân bổ công việc
- 📊 **Performance Tracking**: Thống kê hiệu suất đầu bếp, thời gian chuẩn bị thực tế

**Lưu ý:** Tạo đơn hàng và quản lý khách hàng nằm trong **Order Management System** (xem `ORDER_MANAGEMENT_FEATURES.md`)

---

## 1. KITCHEN DASHBOARD LAYOUT (Bố cục giao diện bếp)

### 1.1 Main Kitchen Display System (KDS)

**Khi truy cập giao diện bếp:**
- ✅ Danh sách đơn bếp theo trạng thái
- ✅ Hiển thị độ ưu tiên (VIP, khẩn cấp)
- ✅ Thời gian chờ từng đơn (real-time)
- ✅ Yêu cầu đặc biệt nổi bật
- ✅ Nút hành động nhanh (Bắt đầu, Sẵn sàng, Hoàn tát)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  🍳 KITCHEN DISPLAY SYSTEM                [Cài đặt] [Thoát]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Thống Kê Nhanh:                                          │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Chờ Chuẩn Bị  │  Đang Nấu    │   Sẵn Sàng   │            │
│  │      12      │      8       │      5      │            │
│  │ Chờ trung bình│ Thời gian trung│ Chờ lấy max │            │
│  │  5 phút      │    15 phút   │   8 phút    │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⏰ CHỜ CHUẨN BỊ (12) | 🔥 ĐANG NẤU (8) | ✅ SẴN SÀNG (5) │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ #001 | Bàn 3        │  │ #002 | Bàn 5        │          │
│  │ 👑 VIP | Chờ 5 phút │  │ 🔴 Khẩn | Đang nấu │          │
│  │ ─────────────────── │  │ ─────────────────── │          │
│  │ • Thịt bò nướng (1) │  │ • Mì Ý (2)          │          │
│  │ • Cơm tấm (2)       │  │ ⏱ Dự kiến: 3 phút  │          │
│  │   Không hành        │  │                     │          │
│  │   Ít cay            │  │ [Sẵn Sàng] [Hủy]   │          │
│  │ • Nước cam (2)      │  │                     │          │
│  │   Ít đá             │  │                     │          │
│  │                     │  │                     │          │
│  │ [Bắt Đầu] [Hủy]    │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ #003 | Bàn 7        │  │ #004 | Bàn 9        │          │
│  │ 🔴 Khẩn | Chờ 8 phút│  │ 👑 VIP | Chờ 12 phút│          │
│  │ ─────────────────── │  │ ─────────────────── │          │
│  │ • Gà nướng (1)      │  │ • Cá nướng (1)      │          │
│  │ • Salad (1)         │  │   Không muối        │          │
│  │                     │  │ • Rau muống (1)     │          │
│  │ [Bắt Đầu] [Hủy]    │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**

- **Header**: Tiêu đề KDS, nút cài đặt, thoát
- **Statistics Cards**: Tổng số đơn theo trạng thái (chờ, đang nấu, sẵn sàng)
- **Tab Navigation**: Chuyển đổi giữa các giai đoạn (Chờ, Đang Nấu, Sẵn Sàng)
- **Order Cards**: Thẻ đơn hàng hiển thị chi tiết, trạng thái, yêu cầu đặc biệt
- **Action Buttons**: Nút hành động nhanh (Bắt Đầu, Sẵn Sàng, Hủy)
- **Priority Indicators**: Biểu tượng ưu tiên (👑 VIP, 🔴 Khẩn, ⚪ Bình thường)
- **Timer**: Hiển thị thời gian chờ real-time

**Rationale:**

- Giao diện lớn, dễ đọc từ xa (TV/màn hình bếp)
- Ưu tiên hiển thị đơn chờ lâu nhất (Cũ nhất trước)
- Yêu cầu đặc biệt nổi bật để tránh nhầm lẫn
- Thẻ card to, dễ thao tác bằng tay hay bàn phím

### 1.2 Header Section

**Components:**
```
┌──────────────────────────────────────────────────────┐
│  🍳 KITCHEN DISPLAY SYSTEM              [📋] [⚙️] [×] │
│                                                      │
│  🔍 Tìm đơn (Số ĐH, Bàn...)                         │
│  [Độ Ưu Tiên ▼] [Loại Món ▼] [Đầu Bếp ▼] [Làm Mới] │
└──────────────────────────────────────────────────────┘
```

**Features:**

- **Title**: "KITCHEN DISPLAY SYSTEM" - nôi bật
- **Search Bar**: Tìm kiếm theo số đơn, số bàn
- **Filter Dropdowns**: Lọc theo độ ưu tiên, loại món, đầu bếp phụ trách
- **Refresh Button**: Làm mới màn hình (auto-refresh mỗi 5 giây)

### 1.3 Statistics Cards

**Display Metrics:**
```
┌──────────────┬──────────────┬──────────────┐
│ Chờ Chuẩn Bị │  Đang Nấu    │ Sẵn Sàng     │
│ ⏰ Chờ trung │ 🔥 Thời gian │ ✅ Chờ lấy  │
│                                           │
│      12      │      8       │      5      │
│  avg: 5 min  │  avg: 15 min │  max: 8 min │
│                                           │
│ [Chưa xác nhận] [Đang xử lý] [Sẵn lấy]  │
└──────────────┴──────────────┴──────────────┘
```

**Statistics Updates:**

- Cập nhật real-time khi có đơn mới, bắt đầu nấu, hoàn tất
- Hiển thị thời gian chờ trung bình (average)
- Cảnh báo nếu có đơn chờ quá lâu (> 20 phút) - hiển thị màu đỏ
- Color coding:
  - **Đỏ**: Chờ xác nhận (cần hành động ngay)
  - **Cam**: Đang nấu (đang xử lý)
  - **Xanh**: Sẵn sàng (chờ lấy)

### 1.4 Order Card Details

**Single Order Card Layout:**
```
┌──────────────────────────────────────┐
│ #001 | Bàn 3 | 👑 VIP | ⏱ 5 phút    │
├──────────────────────────────────────┤
│                                      │
│ Yêu cầu đặc biệt:                   │
│ 🚫 Không hành, Ít cay, Tách riêng   │
│                                      │
│ Danh sách món:                       │
│ • Thịt bò nướng x1                   │
│   ┣━ Không hành                      │
│   ┗━ Ít cay                          │
│                                      │
│ • Cơm tấm x2                         │
│                                      │
│ • Nước cam x2                        │
│   ┗━ Ít đá                           │
│                                      │
│ Nhân viên: Hương                     │
│ Đầu bếp: Hải                         │
│                                      │
│ [Bắt Đầu] [Sẵn Sàng] [Hủy]         │
└──────────────────────────────────────┘
```

**Card Information:**

- Header: Số đơn, số bàn, ưu tiên, thời gian chờ
- Priority Badge: 👑 VIP, 🔴 Khẩn, ⚪ Bình thường
- Special Requests: Yêu cầu đặc biệt nổi bật (mỏng đặc biệt)
- Items List: Danh sách món với số lượng
- Notes: Ghi chú cho từng món
- Chef Assignment: Đầu bếp phụ trách (nếu có)
- Action Buttons: Nút hành động nhanh

---

## 2. CORE FUNCTIONALITY (Chức năng cốt lõi)

### 2.1 Nhận Đơn Hàng (Receive Order from Waiters)

**Source:** Đơn gửi từ **Order Management System** khi waiter nhấn "Gửi Bếp"

**Auto Workflow:**
1. Waiter tạo đơn và nhấn "Gửi Bếp" trong Order Management
2. Order System chuyển trạng thái đơn: `PENDING` → `CONFIRMED`
3. Hệ thống gửi đơn đến Kitchen qua **WebSocket** (real-time)
4. **Kitchen Display System (KDS)** nhận đơn:
   - Phát âm thanh thông báo (🔊)
   - Hiện popup: "🔔 Đơn Mới - Bàn X"
   - Đơn xuất hiện ở tab "CHỞ CHUẨN BỊ"
5. Card đơn hiển thị:
   - Số đơn (#001), Bàn (3), Thời gian (2 phút trước)
   - Danh sách món + số lượng
   - Yêu cầu đặc biệt (nổi bật bằng màu)
   - Độ ưu tiên (VIP/Express/Normal)

**Notification on Receive:**
```
┌────────────────────────────────────────┐
│  🔔 ĐƠN HÀNG MỚI!                      │
├────────────────────────────────────────┤
│                                        │
│  Đơn #001 - Bàn 3                      │
│  3 Món - Khách chờ                     │
│                                        │
│  [Bắt Đầu Nấu]  [Xem Chi Tiết]        │
│  [Đóng]                                │
└────────────────────────────────────────┘

🔊 Âm thanh thông báo (nếu bật)
```

**Real-time Sync:**

- Khi phục vụ gửi đơn → Bếp nhận ngay
- Khi phục vụ thêm món → Bếp cập nhật
- Khi phục vụ hủy món → Bếp được thông báo

### 2.2 Bắt Đầu Nấu (Start Cooking)

**Trigger:** Đầu bếp nhấn nút "Bắt Đầu" trên thẻ đơn

**Workflow:**
1. Đầu bếp chọn đơn trong tab "Chờ Chuẩn Bị"
2. Nhấn nút "Bắt Đầu Nấu"
3. Hệ thống:
   - Cập nhật trạng thái đơn thành "PREPARING"
   - Ghi nhận đầu bếp phụ trách
   - Lưu thời gian bắt đầu nấu
   - Chuyển đơn sang tab "Đang Nấu"
   - Bật timer đếm thời gian nấu
4. Thông báo nhân viên phục vụ (optional): "Đơn #001 đang được chuẩn bị"
5. Đơn vẫn hiển thị các yêu cầu đặc biệt

**Dialog Confirmation (optional):**
```
┌─────────────────────────────────────┐
│  ✓ Xác Nhận Bắt Đầu Nấu             │
├─────────────────────────────────────┤
│                                     │
│  Đơn #001 - Bàn 3                   │
│  3 Món                              │
│                                     │
│  Đầu bếp phụ trách: [Hải ▼]         │
│                                     │
│  [Hủy]                 [Xác Nhận]   │
└─────────────────────────────────────┘
```

**Kitchen Optimization:**

- Có thể bắt đầu nhiều đơn cùng lúc
- Hệ thống gợi ý thứ tự ưu tiên (cũ nhất trước, VIP trước)
- Có thể gán từng mon cho các đầu bếp khác nhau

### 2.3 Cập Nhật Tiến Độ Món (Update Item Status)

**Trigger:** Khi nấu xong từng món hoặc giai đoạn

**Workflow:**
1. Đầu bếp đang nấu một hoặc nhiều món
2. Khi một món sắp xong:
   - Nhấn vào icon/nút cập nhật trạng thái món
   - Hoặc quét barcode/QR code của món
3. Chọn trạng thái mới:
   - Đang chuẩn bị (PREPARING)
   - Sắp xong (ALMOST_READY) - cách bực
   - Sẵn sàng (READY)
4. Hệ thống:
   - Cập nhật trạng thái món
   - Thông báo nhân viên phục vụ (nếu món sắp xong)
   - Kiểm tra xem tất cả món xong chưa

**UI for Status Update:**
```
Danh sách Món:
┌─────────────────────────────────────────┐
│ ☐ Thịt bò nướng x1                      │
│   Không hành, Ít cay                    │
│   Status: [Chuẩn bị ▼] | ⏱ 3 phút      │
│                                         │
│ ☐ Cơm tấm x2                            │
│   Status: [Chuẩn bị ▼] | ⏱ 2 phút      │
│                                         │
│ ☑ Nước cam x2 (READY ✓)                │
│   Ít đá                                 │
│   Status: [Sẵn Sàng ✓]                 │
│                                         │
│ ⏱ Tổng: 5 phút                         │
└─────────────────────────────────────────┘
```

**Quick Status Change:**

- Click trực tiếp trên status để thay đổi
- Hoặc kéo thẻ sang phải (swipe) để đánh dấu sẵn sàng
- Keyboard shortcut: Phím số 1-5 để chuyển trạng thái

### 2.4 Đánh Dấu Hoàn Tất (Mark as Complete)

**Trigger:** Tất cả các món trong đơn đã sẵn sàng

**Workflow:**
1. Khi tất cả các món đạt trạng thái "READY"
2. Nút "Hoàn Tất" tự động sáng (enable)
3. Đầu bếp nhấn "Hoàn Tát" hoặc "Sẵn Lấy"
4. Hệ thống:
   - Cập nhật trạng thái đơn thành "READY"
   - Ghi nhận thời gian hoàn tất
   - Tính thời gian chuẩn bị thực tế
   - Chuyển đơn sang tab "Sẵn Sàng"
   - Phát âm thanh thông báo
5. Thông báo nhân viên phục vụ: "Đơn #001 sẵn sàng!"
6. Bếp có thể loại bỏ đơn khỏi màn hình làm việc

**Completion Dialog:**
```
┌─────────────────────────────────────┐
│  ✅ Hoàn Tất Đơn Hàng                │
├─────────────────────────────────────┤
│                                     │
│  Đơn #001 - Bàn 3                   │
│  ✓ Thịt bò nướng x1                 │
│  ✓ Cơm tấm x2                       │
│  ✓ Nước cam x2                      │
│                                     │
│  ⏱ Thời gian chuẩn bị: 15 phút      │
│  (Dự kiến: 15 phút - Đúng giờ ✓)   │
│                                     │
│  [Hủy Hoàn Tát]         [Xác Nhận]  │
└─────────────────────────────────────┘
```

### 2.5 Hủy Đơn/Món (Cancel Order/Item)

**Trigger:** Nhân viên phục vụ yêu cầu hủy hoặc Đầu bếp tự hủy

**Workflow (Yêu cầu từ Phục Vụ):**

1. Phục vụ gửi yêu cầu hủy từ Order Management
2. Bếp nhận thông báo: "Yêu cầu hủy: [Tên Món] - [Lý do]"
3. Bếp kiểm tra trạng thái:
   - Nếu chưa bắt đầu: Chấp nhận hủy ngay (✓)
   - Nếu đang nấu: Kiểm tra có thể dừng không
   - Nếu đã xong: Từ chối hoặc chuyển xử lý
4. Bếp xác nhận hoặc từ chối
5. Thông báo trở lại phục vụ

**Cancel Dialog:**
```
┌──────────────────────────────────────┐
│  ⚠️ Yêu Cầu Hủy Món                 │
├──────────────────────────────────────┤
│                                      │
│  Đơn: #001 - Bàn 3                   │
│  Món: Thịt bò nướng x1               │
│  Trạng thái: Đang chuẩn bị           │
│  Lý do: Khách đổi ý                  │
│                                      │
│  [Từ Chối Hủy]      [Xác Nhận Hủy]  │
└──────────────────────────────────────┘
```

**Workflow (Tự Hủy từ Bếp):**

1. Đầu bếp nhấn nút "Hủy" trên thẻ đơn
2. Nhập lý do hủy: Hết nguyên liệu, Món hỏng, Sai kỹ thuật, Khác
3. Xác nhận hủy
4. Thông báo phục vụ: "Đơn #001 bị hủy: [Lý do]"
5. Đơn chuyển sang trạng thái "CANCELLED"

---

## 2.6 Integration with Order Management System

**Two-way Communication:**

```
╭───────────────────────╮     ╭───────────────────────╮
│  ORDER MANAGEMENT     │ ⇄ │  KITCHEN MANAGEMENT   │
│  (Waiter Interface)   │     │  (Chef Interface)     │
╰───────────────────────╯     ╰───────────────────────╯
```

**Workflow Integration:**

1. **Waiter tạo đơn → Kitchen nhận**
   ```
   Order: CREATE order (#001) with items
   ↓
   Order: Set status = CONFIRMED
   ↓
   Kitchen: Receive order via WebSocket
   ↓
   Kitchen: Display on KDS (tab "Chờ Chuẩn Bị")
   ↓
   Kitchen: Play sound notification
   ```

2. **Kitchen bắt đầu nấu → Order cập nhật**
   ```
   Kitchen: Chef clicks "Bắt Đầu Nấu"
   ↓
   Kitchen: Set status = PREPARING
   ↓
   Order: Update order status = PREPARING
   ↓
   Order: Notify waiter "Bếp đang nấu"
   ```

3. **Kitchen hoàn tất → Order thông báo**
   ```
   Kitchen: Chef clicks "Sẵn Sàng"
   ↓
   Kitchen: Set status = READY
   ↓
   Order: Update order status = READY
   ↓
   Order: Alert waiter 🔔 "Món sẵn sàng - Bàn X"
   ↓
   Order: Waiter clicks "Xác Nhận Đã Lấy"
   ↓
   Kitchen: Set status = COMPLETED, remove from KDS
   ```

4. **Waiter hủy món → Kitchen xác nhận**
   ```
   Order: Waiter requests cancel item
   ↓
   Order: Send cancel request to Kitchen
   ↓
   Kitchen: Display confirmation dialog
   ↓
   Kitchen: Chef accepts/rejects
   ↓
   Order: Receive response and update
   ↓
   Order: Notify waiter result
   ```

**Shared Data Models:**

| Field | Order Management | Kitchen Management |
|-------|------------------|--------------------|
| `orderId` | Primary key | Foreign key |
| `status` | PENDING → SERVING | PENDING → READY |
| `items[]` | Full details + price | Focus on prep instructions |
| `specialRequest` | Editable by waiter | Read-only, highlighted |
| `priority` | Set by waiter | Display prominently |
| `timestamps` | Created, confirmed | Started, ready, completed |

**WebSocket Events:**

```javascript
// Order → Kitchen
order.created
order.item_added
order.item_cancelled_request

// Kitchen → Order  
kitchen.status_changed
kitchen.item_ready
kitchen.cancel_accepted
kitchen.cancel_rejected
```

---

## 3. PRIORITY & TEAM MANAGEMENT (Quản lý ưu tiên và nhóm)

### 3.1 Priority Levels

**Priority Types:**

1. **👑 VIP** - Ưu tiên cao nhất
   - Khách VIP, khách quen, khách than phàn
   - Màu vàng/gold
   - Hiển thị ở đầu danh sách
   - Thông báo đặc biệt

2. **🔴 Khẩn Cấp (Express/ASAP)** - Ưu tiên cao
   - Khách chờ lâu (> 15 phút)
   - Đơn được gọi lại
   - Màu đỏ
   - Cảnh báo bằng âm thanh

3. **⚪ Bình Thường (Normal)** - Ưu tiên chuẩn
   - Đơn thường không ghi chú
   - Màu trắng/xám
   - Xử lý theo thứ tự FIFO

**Priority Assignment:**
```
Khi tạo đơn, phục vụ có thể đánh dấu:
[⚪ Bình Thường] [🔴 Khẩn] [👑 VIP]
```

### 3.2 Team Management & Workload

**Assign Chef to Order:**
```
┌──────────────────────────────────┐
│  Phân Công Đầu Bếp               │
├──────────────────────────────────┤
│                                  │
│  Đơn #001 - 3 Món               │
│                                  │
│  [Hải      ] Nấu: 3 Món, 2 Đơn │
│  [Linh     ] Nấu: 2 Món, 1 Đơn │
│  [Tâm      ] Nấu: 5 Món, 3 Đơn │
│  [Thanh    ] Nấu: 1 Món, 1 Đơn │
│  [Ai cũng được]                 │
│                                  │
│  Chọn: [Hải ▼]                   │
│  [Hủy]             [Xác Nhận]   │
└──────────────────────────────────┘
```

**Workload Display:**

- Mỗi đầu bếp có badge hiển thị: "X Món, Y Đơn"
- Tự động gợi ý gán cho đầu bếp ít việc nhất
- Có thể xem chi tiết công việc từng bếp

### 3.3 Workstation Management

**Multiple Stations:**

- Có thể chia bếp thành các khu vực (Nướng, Chiên, Hấp)
- Mỗi station có KDS riêng
- Filter đơn theo loại món (Khai vị, Chính, Tráng miệng)
- Đơn sẽ tự động route đến station phù hợp

**Station Filter:**
```
[Tất Cả] [🍗 Nướng] [🍟 Chiên] [🍜 Hấp] [🍰 Tráng Miệng]
```

---

## 4. STATUS MANAGEMENT (Quản lý trạng thái)

### 4.1 Kitchen Order Status from Chef's Perspective

**Trạng thái đơn bếp (từ góc nhìn đầu bếp):**

1. **PENDING** (Đơn mới - Chờ xác nhận) - ⏳ Xám
   - Đơn vừa nhận từ Order System, chưa ai nhận
   - **Hành động cần làm**: Nhấn "Bắt Đầu Nấu" để nhận đơn
   - **Ưu tiên**: Đơn cũ nhất hoặc VIP lên đầu

2. **CONFIRMED** (Đã nhận đơn) - 🔵 Xanh lam
   - Đầu bếp đã xác nhận nhận, chuẩn bị nguyên liệu
   - **Hành động cần làm**: Chuẩn bị dụng cụ, nguyên liệu
   - **Chuyển tiếp**: Chuyển sang PREPARING khi bắt đầu nấu

3. **PREPARING** (Đang nấu nướng) - 🔥 Cam
   - Đang chế biến món, timer đang chạy
   - **Hành động cần làm**: 
     - Cập nhật tiến độ từng món
     - Theo dõi thời gian nấu
     - Xử lý yêu cầu đặc biệt
   - **Cảnh báo**: Nếu quá thời gian dự kiến → Màu đỏ

4. **ALMOST_READY** (Sắp xong - Kiểm tra cuối) - 🟡 Vàng
   - Hầu hết các món đã xong, chờ 1-2 món cuối
   - **Hành động cần làm**: Kiểm tra chất lượng, trình bày
   - **Thông báo**: Waiter nhận notification "Sắp sẵn sàng"

5. **READY** (Sẵn sàng lấy) - ✅ Xanh lục
   - Tất cả món hoàn tất, đặt lên khu pass (lấy món)
   - **Hành động cần làm**: 🔔 Bấm chuông/thông báo waiter
   - **Chờ**: Waiter đến lấy (nếu quá lâu → cảnh báo)

6. **COMPLETED** (Waiter đã lấy) - ⚪ Xám nhạt
   - Món đã được lấy khỏi bếp, biến mất khỏi KDS
   - **Kết quả**: Ghi nhận thời gian thực tế vào báo cáo
   - **Dữ liệu**: Lưu lại để phân tích hiệu suất

7. **CANCELLED** (Bị hủy) - ❌ Đen
   - Đơn/món bị hủy bởi waiter hoặc bếp
   - **Lý do**: Hết nguyên liệu, khách đổi ý, món hỏng
   - **Hành động**: Dừng nấu, thông báo lại waiter

### 4.2 Item-level Status Tracking

**Mỗi Món Có Trạng Thái Riêng:**
```
Item Status Flow:
PENDING → PREPARING → ALMOST_READY → READY → SERVED
   ↓          ↓            ↓           ↓
   └─────────────────→ CANCELLED
```

**Display Items Status:**
```
Order Items:
☐ Thịt bò nướng x1          [Đang chuẩn bị] ⏱ 3 phút
☐ Cơm tấm x2                [Đang chuẩn bị] ⏱ 2 phút
☑ Nước cam x2               [Sẵn Sàng ✓]    ⏱ 1 phút
```

---

## 5. NOTIFICATIONS & ALERTS (Thông báo và cảnh báo)

### 5.1 Real-time Notifications

**WebSocket Events:**

```javascript
// Đơn hàng mới
kitchen.new_order → {
  orderId: "ORD-001",
  table: 3,
  items: [...],
  priority: "VIP"
}

// Yêu cầu hủy món
kitchen.cancel_request → {
  orderId: "ORD-001",
  itemId: "ITEM-1",
  reason: "Khách đổi ý"
}

// Thêm món mới
kitchen.item_added → {
  orderId: "ORD-001",
  item: {...}
}
```

### 5.2 Alert Types

**Visual Alerts:**

1. **Đơn Mới** (New Order)
   - Flash card với hiệu ứng
   - Hiển thị ở đầu danh sách
   - Thời gian 5 giây rồi dừng

2. **Quá Hạn** (Overdue)
   - Đơn chờ > 20 phút → Hiệu ứng màu đỏ
   - Nhấp nháy cảnh báo
   - Âm thanh cảnh báo liên tục

3. **Yêu Cầu Hủy** (Cancel Request)
   - Popup overlay
   - Yêu cầu xác nhận
   - Âm thanh đặc biệt

4. **Sẵn Sàng** (Ready)
   - Thông báo khi hết công việc
   - "Bếp đã sẵn sàng, hãy kiểm tra"

**Audio Alerts:**

- Âm thanh mặc định: Chuông nhẹ
- Có thể tùy chỉnh độ to nhỏ
- Tắt âm trong giờ vắng (tuỳ cài đặt)
- Mute (im lặng) khi nhấn "Mute" trong 10 phút

### 5.3 Communication with Waiters

**Notifications Sent to Front:**

- ✅ Đơn #001 sẵn sàng lấy
- 🔴 Đơn #002 quá hạn, chờ 25 phút
- ⚠️ Đơn #003 bị hủy: Hết nguyên liệu
- 👑 VIP #004 sắp sàng (3 phút)

---

## 6. TIMER & TIME MANAGEMENT (Quản lý thời gian)

### 6.1 Cooking Time Tracking

**Timer for Each Order:**
```
┌─────────────────────────────┐
│ #001 | Bàn 3 | Đang nấu    │
├─────────────────────────────┤
│                             │
│ ⏱ Thời gian nấu: 8 / 15 min│
│ ████████░░░░░░░░░░░░░░░ 53%│
│                             │
│ 🟡 Sắp quá hạn!             │
│ (Dự kiến xong: 7 phút)     │
│                             │
└─────────────────────────────┘
```

**Estimated vs Actual:**

- Thời gian dự kiến: Dựa trên prep time của menu item
- Thời gian thực tế: Được cập nhật dựa trên tiến độ
- Cảnh báo khi vượt quá dự kiến

### 6.2 Priority Alerts Based on Time

**Time-based Alerts:**

1. **10 phút chờ**: Nhắc nhở đầu bếp
2. **15 phút chờ**: Cảnh báo (màu vàng)
3. **20 phút chờ**: Cảnh báo cao (màu cam)
4. **25 phút chờ**: Khẩn cấp (màu đỏ, âm thanh liên tục)

---

## 7. REPORTS & ANALYTICS (Báo cáo và phân tích)

### 7.1 Kitchen Performance Dashboard

**Dashboard dành cho Kitchen Manager:**

**Key Metrics (Thống kê chính):**
```
┌────────────────────────────────────────────────┐
│  🍳 Kitchen Performance - Hôm nay              │
├────────────────────────────────────────────────┤
│  📊 PRODUCTION METRICS                        │
│  ────────────────────────────────────────  │
│  Tổng đơn nhận: 42                            │
│  Đơn hoàn tất: 40 (95.2%) ✅                  │
│  Đơn hủy: 2 (4.8%) ❌                          │
│  Đơn trễ hạn (>20min): 3 (7.1%) ⚠️            │
│                                                │
│  ⏱️ TIMING ANALYSIS                             │
│  ────────────────────────────────────────  │
│  Thời gian chuẩn bị trung bình: 16 phút        │
│  Nhanh nhất: 5 phút 🚀                       │
│  Chậm nhất: 35 phút 🐌                      │
│  Chênh lệch so với dự kiến: +2 phút           │
│                                                │
│  👨‍🍳 TEAM WORKLOAD                             │
│  ────────────────────────────────────────  │
│  Đầu bếp đang hoạt động: 4/5                │
│  Đơn đang xử lý: 8                           │
│  Workstation: Nướng(5), Chiên(2), Hấp(1)      │
│                                                │
│  [Chi Tiết] [Xuất Excel] [In Báo Cáo]       │
└────────────────────────────────────────────────┘
```

**Lưu ý:** Báo cáo doanh thu và khách hàng nằm trong Order Management System.

### 7.2 Chef Performance Analysis

**Báo cáo hiệu suất từng đầu bếp:**

| Đầu Bếp | Đơn Xử Lý | Hoàn Tất | Quá Hạn | Prep Time TB | Accuracy |
|---------|-------------|---------|---------|--------------|----------|
| Hải     | 15          | 14      | 1 (6.7%)| 15 phút      | 93%      |
| Hải     | 15  | 14      | 1       | 15 phút      |
| Linh    | 12  | 12      | 0       | 14 phút      |
| Tâm     | 10  | 9       | 1       | 18 phút      |
| Thanh   | 5   | 5       | 0       | 12 phút      |

### 7.3 Item Preparation Time

**Popular Items Analysis:**

| Món Ăn | Số Lượng | Thời Gian TB | Trend |
|--------|----------|--------------|-------|
| Thịt bò nướng | 28 | 12 phút | Hót 🔥 |
| Cơm tấm | 25 | 8 phút | Chạy tốt |
| Gà nướng | 18 | 14 phút | Ổn định |
| Cá nướng | 8 | 16 phút | Ít ai gọi |

---

## 8. ADVANCED FEATURES (Tính năng nâng cao)

### 8.1 Recipe & Instruction Management

**Recipe Display:**
```
Khi đầu bếp chọn một đơn, có thể xem:
- Công thức nấu (nếu cần)
- Ảnh hướng dẫn
- Video tutorial (QR code)
- Ghi chú từ đầu bếp cao cấp

Cấu hình trong Menu Management
```

### 8.2 Batch Processing

**Cook Multiple Items Together:**

- Nhóm các món cùng loại để nấu hàng loạt
- Tiết kiệm thời gian và nguyên liệu
- Phục vụ hỗ trợ gợi ý (auto-suggest batch)

### 8.3 Prep Ahead Feature

**Nấu Trước (Mise en Place):**

- Chuẩn bị nguyên liệu sẵn sàng
- Báo cáo tài nguyên cần thiết trước
- Lên kế hoạch chuẩn bị

### 8.4 Quality Control

**Check Before Serving:**

- Danh sách kiểm tra trước khi thành phẩm
- Ảnh chất lượng tham chiếu
- Phê duyệt từ đầu bếp cao cấp

---

## 9. SETTINGS & CONFIGURATION (Cài đặt và cấu hình)

### 9.1 Notification Settings

**Configuration:**
```
┌────────────────────────────────┐
│  Cài Đặt Thông Báo             │
├────────────────────────────────┤
│                                │
│ ☑ Thông báo đơn mới            │
│ ☑ Thông báo quá hạn            │
│ ☑ Thông báo yêu cầu hủy        │
│ ☑ Thông báo sẵn sàng           │
│                                │
│ Âm thanh:                      │
│ [━━━━━━━━●━━━━━] Mức 7/10     │
│                                │
│ Tự động cập nhật:              │
│ [✓] Mỗi 5 giây                 │
│                                │
│ [Lưu Thay Đổi]                 │
└────────────────────────────────┘
```

### 9.2 Display Settings

- Font size (nhỏ, bình thường, lớn)
- Color theme (sáng, tối)
- Auto-refresh interval
- Card layout (compact, expanded)

### 9.3 Kitchen Station Setup

- Chia từng station (Nướng, Chiên, Hấp)
- Gán đầu bếp mặc định
- Filter tự động

---

## 10. KEYBOARD SHORTCUTS (Phím tắt)

### 10.1 Quick Actions

```
S          Bắt đầu nấu (Start)
R          Sẵn sàng (Ready)
C          Hủy đơn (Cancel)
↑ ↓        Chọn đơn trước/sau
Enter      Xem chi tiết
H          Chuyển tới Help
Space      Pause/Resume
F          Làm mới (Fresh)
M          Mute âm thanh
```

### 10.2 Status Shortcuts

```
1          Chờ (Pending)
2          Đang nấu (Preparing)
3          Sắp xong (Almost Ready)
4          Sẵn sàng (Ready)
0          Reset/Xóa
```

---

## 11. MOBILE & ACCESSIBILITY (Di động và khả năng truy cập)

### 11.1 Tablet Interface

**Responsive for Tablets:**
```
iPad / Android Tablet View:
┌──────────────────────────────┐
│ 🍳 KDS                 [⚙️]  │
├──────────────────────────────┤
│ ⏰ Chờ (12) | 🔥 Nấu (8)    │
│                              │
│ ┌─────────────────────────┐ │
│ │ #001 | Bàn 3 | 👑 VIP  │ │
│ │ • Thịt bò x1            │ │
│ │ • Cơm tấm x2            │ │
│ │ [Bắt Đầu] [Sẵn] [Hủy] │ │
│ └─────────────────────────┘ │
│                              │
│ ┌─────────────────────────┐ │
│ │ [Tiếp theo]             │ │
│ └─────────────────────────┘ │
└──────────────────────────────┘
```

### 11.2 Voice Control (Future)

- Voice command để chuyển status
- "Sẵn sàng đơn một"
- "Bắt đầu nấu"

---

## 12. API REFERENCE (Tài liệu API)

### 12.1 Kitchen Order Endpoints

**Get Kitchen Orders:**
```javascript
GET /api/kitchen/orders?status=PENDING,PREPARING&priority=VIP,EXPRESS

Response:
{
  "data": [
    {
      "id": "KORD-001",
      "orderId": "ORD-001",
      "table": 3,
      "status": "PENDING",
      "priority": "VIP",
      "items": [
        {
          "id": "ITEM-1",
          "name": "Thịt bò nướng",
          "quantity": 1,
          "specialRequest": "Không hành, Ít cay",
          "status": "PENDING",
          "prepTime": 15
        }
      ],
      "createdAt": "2024-01-01T10:30:00Z",
      "estimatedTime": 15
    }
  ]
}
```

**Update Kitchen Order Status:**
```javascript
PATCH /api/kitchen/orders/KORD-001/status
{ "status": "PREPARING", "chefId": "CHEF-1" }
```

**Mark Item as Ready:**
```javascript
PATCH /api/kitchen/orders/KORD-001/items/ITEM-1/status
{ "status": "READY" }
```

**Complete Kitchen Order:**
```javascript
POST /api/kitchen/orders/KORD-001/complete
Response:
{
  "id": "KORD-001",
  "status": "READY",
  "actualPrepTime": 15,
  "completedAt": "2024-01-01T10:45:00Z"
}
```

### 12.2 WebSocket Events

**Kitchen Subscriptions:**

```
kitchen.orders.new
kitchen.orders.cancelled
kitchen.orders.priority_changed
kitchen.items.status_update
```

---

## 13. SECURITY & DATA PROTECTION (Bảo mật)

### 13.1 Access Control

- Chỉ đầu bếp có quyền truy cập KDS
- Yêu cầu xác thực (login)
- Log tất cả hành động

### 13.2 Data Privacy

- Không lưu dữ liệu nhạy cảm trên device
- Cache dữ liệu có hạn
- Tự động logout sau 30 phút không hoạt động

---

## 14. DATABASE SCHEMA (Cơ sở dữ liệu)

### 14.1 Kitchen Order Table

```sql
CREATE TABLE kitchen_orders (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'ALMOST_READY', 'READY', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  priority ENUM('NORMAL', 'EXPRESS', 'VIP') DEFAULT 'NORMAL',
  chef_id VARCHAR(36),
  station_id VARCHAR(36),
  prep_time_estimated INT,
  prep_time_actual INT,
  
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (chef_id) REFERENCES staff(id),
  FOREIGN KEY (station_id) REFERENCES kitchen_stations(id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);
```

---

## 15. TROUBLESHOOTING & FAQ (Khắc phục sự cố)

### 15.1 Common Issues

**Issue: Không nhận được đơn hàng mới**
```
Solutions:
1. Kiểm tra kết nối Internet
2. Làm mới trang KDS (F5)
3. Kiểm tra WebSocket kết nối
4. Khởi động lại ứng dụng
```

**Issue: Thông báo âm thanh không hoạt động**
```
Solutions:
1. Kiểm tra volume của máy tính
2. Kiểm tra browser notification đã bật
3. Kiểm tra cài đặt thông báo
4. Test âm thanh trong cài đặt
```

**Issue: Timer không chính xác**
```
Solutions:
1. Kiểm tra giờ hệ thống
2. Đồng bộ thời gian server
3. Làm mới trang
```

### 15.2 FAQ

**Q: Có thể vô hiệu hóa thông báo âm thanh không?**  
A: Có, nhấn nút Mute hoặc cài đặt im lặng trong Settings.

**Q: Làm thế nào để xem lịch sử đơn đã hoàn tát?**  
A: Chuyển sang tab "Lịch Sử" hoặc xem báo cáo trong Dashboard.

**Q: Có thể gán nhiều đầu bếp cho một đơn không?**  
A: Có, phân công từng món cho đầu bếp khác nhau.

---

## 16. FUTURE ENHANCEMENTS (Cải tiến trong tương lai)

### 16.1 Planned Features

- [ ] **Video Tutorial Integration**: Link video nấu cho từng mon
- [ ] **AI Prep Time Prediction**: Dự đoán thời gian dựa trên lịch sử
- [ ] **Inventory Integration**: Cảnh báo hết nguyên liệu
- [ ] **Customer Feedback Real-time**: Khách đánh giá ngay khi ăn
- [ ] **Voice Commands**: Điều khiển bằng giọng nói
- [ ] **AR Kitchen Guide**: Hướng dẫn thực tế ảo

### 16.2 Optimization Ideas

- Machine learning để tối ưu prep time
- Predictive ordering (dự đoán nhu cầu)
- Energy-saving mode (giảm bớt animation)

---

## APPENDIX

### A. Glossary

- **KDS**: Kitchen Display System (Hệ thống hiển thị bếp)
- **Prep Time**: Thời gian chuẩn bị
- **FIFO**: First In, First Out (Vào trước, ra trước)
- **Station**: Khu vực làm việc trong bếp
- **Chef/Cook**: Đầu bếp, người nấu

### B. Color Scheme

```
PENDING       → Xám (#808080)
PREPARING     → Cam (#FF9800)
ALMOST_READY  → Vàng (#FFC107)
READY         → Xanh lục (#4CAF50)
CANCELLED     → Đen (#000000)
VIP Priority  → Gold (#FFD700)
EXPRESS       → Đỏ (#F44336)
```

---

## SCOPE & BOUNDARIES (Phạm vi và ranh giới)

### What Kitchen Management DOES (Chức năng cốt lõi)

✅ **Production Focus (Tập trung sản xuất):**
- Nhận đơn từ Order Management qua WebSocket
- Hiển thị đơn trên Kitchen Display System (KDS)
- Quản lý tiến độ nấu từng món
- Phân công đầu bếp và workstation
- Đếm giờ chuẩn bị (prep time tracking)
- Quản lý độ ưu tiên (VIP, Express, Normal)
- Thông báo waiter khi món sẵn sàng
- Xác nhận/từ chối yêu cầu hủy món
- Báo cáo hiệu suất bếp và đầu bếp

### What Kitchen Management DOES NOT DO (Không phải chức năng)

❌ **Not Kitchen's Responsibility:**
- Tạo đơn hàng mới (Order Management)
- Giao tiếp trực tiếp với khách hàng (Order Management)
- Quản lý thông tin khách (tên, SĐT) (Order Management)
- Tính tiền và thanh toán (Bill/Payment Management)
- Báo cáo doanh thu tổng thể (Order/Bill Management)
- Quản lý bàn và reservation (Table/Reservation Management)
- Quản lý nguyên liệu và kho (Inventory Management)

### Integration Points (Các điểm tích hợp)

```
Kitchen Management tích hợp với:

1. Order Management (↔️ Two-way)
   - Nhận: Đơn mới, yêu cầu hủy
   - Gửi: Cập nhật tiến độ, thông báo sẵn sàng

2. Inventory Management (← One-way)
   - Cảnh báo hết nguyên liệu
   - Tự động trừ kho khi nấu (future)

3. Menu Management (← Read-only)
   - Lấy thông tin món (tên, recipe, prep time)
   - Hiển thị hướng dẫn nấu

4. Staff Management (← Read-only)
   - Danh sách đầu bếp
   - Phân ca và workstation
```

### Related Documents

- **Order Management**: `ORDER_MANAGEMENT_FEATURES.md` - Tạo đơn và quản lý khách hàng
- **Inventory Management**: `INVENTORY_MANAGEMENT.md` - Quản lý kho và nguyên liệu
- **Menu Management**: `MENU_MANAGEMENT_FEATURES.md` - Quản lý thực đơn
- **Bill/Payment**: `BILL_PAYMENT_MANAGEMENT.md` - Thanh toán và hóa đơn

---

**Document Version:** 2.0  
**Last Updated:** November 19, 2025  
**Author:** Restaurant Management System Team  
**Status:** Approved - Focused on Kitchen Operations
