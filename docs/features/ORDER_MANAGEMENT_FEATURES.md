# Order Management - Tài Liệu Tính Năng Toàn Diện

## Overview

**Order Management** (Quản Lý Đơn Hàng) là tính năng cốt lõi của hệ thống quản lý nhà hàng, kết nối giữa khách hàng, nhân viên phục vụ, bếp và thanh toán. Tính năng này cho phép tạo, theo dõi, chỉnh sửa và quản lý toàn bộ vòng đời của đơn hàng từ khi khách gọi món cho đến khi hoàn tất thanh toán.

**Đặc điểm chính:**
- **Tạo đơn hàng nhanh chóng**: Giao diện thân thiện, thêm món từ menu dễ dàng
- **Quản lý trạng thái đơn hàng**: Theo dõi từng giai đoạn (chờ, đang chuẩn bị, sẵn sàng, đã phục vụ, hoàn tất)
- **Gửi thông tin đến bếp real-time**: Đơn bếp tự động, thông báo trực tiếp tới bếp
- **Chỉnh sửa linh hoạt**: Thêm, sửa, hủy món dễ dàng trong quá trình phục vụ
- **Báo cáo chi tiết**: Thống kê doanh thu, món bán chạy, thời gian phục vụ

---

## 1. ORDER MANAGEMENT LAYOUT (Bố cục giao diện)

### 1.1 Main Dashboard

**Khi truy cập tính năng Order Management:**
- ✅ Danh sách đơn hàng theo trạng thái
- ✅ Thanh tìm kiếm và lọc
- ✅ Thống kê nhanh (số đơn, doanh thu)
- ✅ Các nút hành động (Tạo, Xem, Sửa, Hủy)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Quản Lý Đơn Hàng                    [+ Tạo Đơn Mới]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🔍 Tìm kiếm...]  [Trạng thái ▼] [Bàn ▼] [Nhân viên ▼]  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📊 Thống Kê Nhanh:                                          │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │  Chờ xác nhận  │  Đang chuẩn bị │  Sẵn sàng    │            │
│  │      5        │      8        │      3      │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      DANH SÁCH ĐƠN HÀNG                     │
│                                                             │
│  [Số ĐH] [Bàn] [Món] [Người] [Tổng Tiền] [Trạng Thái]     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ #001    3     3    2     450,000Đ   [Chờ xác nhận] │  │
│  │ ┌─ Thịt bò nướng x1 (120K)                          │  │
│  │ ├─ Cơm tấm x2 (80K)                                │  │
│  │ └─ Nước cam x2 (50K)                               │  │
│  │ [Xem] [Sửa] [Hủy Món] [Gửi Lại Bếp]               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ #002    5     2    4     280,000Đ   [Đang chuẩn bị] │  │
│  │ ┌─ Mì Ý x2 (140K)                                  │  │
│  │ └─ Salad x2 (100K)                                 │  │
│  │ [Xem] [Sửa] [Hủy Món] [Gửi Lại Bếp]               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**

- **Header**: Tiêu đề, nút tạo đơn mới
- **Search & Filter Bar**: Tìm kiếm theo số đơn, lọc theo trạng thái, bàn, nhân viên
- **Statistics Cards**: Hiển thị tổng số đơn theo trạng thái (chờ, đang xử lý, sẵn sàng)
- **Order List**: Danh sách đơn với thông tin chính và nút hành động
- **Right Panel** (tuỳ chọn): Chi tiết đơn được chọn

**Rationale:**

- Giao diện tập trung vào danh sách đơn hàng - cần xem nhanh toàn cảnh
- Thống kê trên cùng giúp quản lý theo dõi hiệu suất thực thời
- Các nút hành động nhanh tiết kiệm thời gian cho nhân viên

### 1.2 Header Section

**Components:**
```
┌──────────────────────────────────────────────────────┐
│  📋 Quản Lý Đơn Hàng          [+ Tạo Đơn Mới] [⚙️]  │
│                                                      │
│  🔍 Tìm kiếm số đơn, tên khách...                    │
│  [Trạng Thái ▼] [Bàn ▼] [Nhân Viên ▼] [Khoảng Thời Gian ▼]│
└──────────────────────────────────────────────────────┘
```

**Features:**

- **Title Bar**: Tiêu đề "Quản Lý Đơn Hàng" + logo
- **Search Bar**: Tìm kiếm theo số đơn (#001), tên khách, số điện thoại
- **Filter Dropdowns**: Lọc theo trạng thái, bàn, nhân viên phục vụ, khoảng thời gian
- **Action Buttons**: Nút "Tạo Đơn Mới", nút cấu hình

### 1.3 Statistics Cards

**Display Metrics:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Chờ xác nhận │ Đang chuẩn bị│ Sẵn sàng   │ Hoàn tất   │
│             │             │             │             │
│      5      │      8      │      3      │     42      │
│  Cách đây:  │  Cách đây:  │  Cách đây:  │ Hôm nay:    │
│   1 phút    │   5 phút    │  12 phút    │ 1,250K Đ   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Statistics Updates:**

- Cập nhật real-time khi có đơn mới, hủy hoặc thay đổi trạng thái
- Hiển thị thời gian gần nhất: "Cách đây X phút"
- Color coding:
  - **Đỏ**: Chờ xác nhận (cần hành động)
  - **Vàng**: Đang chuẩn bị (đang xử lý)
  - **Xanh**: Sẵn sàng (có thể lấy)
  - **Xám**: Hoàn tất (không cần xử lý)

### 1.4 Order List View

**Default View (Grid):**
```
┌──────────────────────────────────────────────────────────┐
│ #001 | Bàn 3 | 3 Món | 2 Khách | 450K | ⏱ 2 phút       │
│ ───────────────────────────────────────────────────────  │
│ • Thịt bò nướng x1 (120K)  [Chờ xác nhận]              │
│ • Cơm tấm x2 (80K)                                      │
│ • Nước cam x2 (50K) - Ít đá                            │
│ ───────────────────────────────────────────────────────  │
│ [Xem Chi Tiết] [Thêm Món] [Hủy Món] [Gửi Lại] [Hủy ĐH] │
└──────────────────────────────────────────────────────────┘
```

**Compact View (List):**
```
┌─────────────────────────────────────────────────────┐
│ #001 | Bàn 3 | 3 Món | 450K | Chờ xác nhận | [...]│
│ #002 | Bàn 5 | 2 Món | 280K | Đang chuẩn bị | [...] │
│ #003 | Bàn 7 | 4 Món | 620K | Sẵn sàng | [...] │
└─────────────────────────────────────────────────────┘
```

**Switch Views:**

- Nút toolbar để chuyển giữa Grid View và List View
- Lưu trữ tùy chọn của người dùng (localStorage)

---

## 2. CORE FUNCTIONALITY (Chức năng cốt lõi)

### 2.1 Tạo Đơn Hàng Mới (Create Order)

**Trigger:** Nhân viên phục vụ nhấn nút "Tạo Đơn Mới"

**Workflow:**
1. Mở dialog/trang tạo đơn hàng
2. Chọn bàn hoặc quét QR code
3. Thêm món từ menu
4. Nhập yêu cầu đặc biệt
5. Xác nhận tạo đơn
6. Gửi đến bếp

**Form/Dialog:**
```
┌─────────────────────────────────────────────────────┐
│  ✨ Tạo Đơn Hàng Mới                         [×]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📌 Bước 1: Chọn Bàn *                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ [Bàn 1] [Bàn 2] [Bàn 3] [Bàn 4] [Bàn 5]  │  │
│  │ [Bàn 6] [Bàn 7] [Bàn 8] [Bàn 9] [Bàn 10] │  │
│  │ [Quầy 1] [Quầy 2] [Mang về]               │  │
│  └─────────────────────────────────────────────┘  │
│  Bàn được chọn: Bàn 3 (Sức chứa: 4 người)       │
│                                                     │
│  📌 Bước 2: Thêm Món *                            │
│  ┌─────────────────────────────────────────────┐  │
│  │ Danh mục:                                   │  │
│  │ [Khai vị] [Chính] [Tráng miệng] [Nước]   │  │
│  │                                             │  │
│  │ Các món (Khai vị):                          │  │
│  │ ☐ Gỏi cuốn (20K)     ☐ Nem rán (25K)      │  │
│  │ ☐ Chả giò (30K)      ☐ Shumai (35K)       │  │
│  │ ☐ Bánh mỹ (40K)      ☐ Tôm nướng (50K)    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  📌 Bước 3: Giỏ Hàng Hiện Tại                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ • Thịt bò nướng x1         120K   [×]       │  │
│  │   Yêu cầu: Không hành, ít cay                │  │
│  │ • Cơm tấm x2                80K   [×]       │  │
│  │ • Nước cam x2                50K   [×]       │  │
│  │ ───────────────────────────────────────── │  │
│  │ Tổng cộng: 450K                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  📌 Bước 4: Thông Tin Bổ Sung                     │
│  Số lượng khách: [_2_]                            │
│  Tên khách (tùy chọn): [_________]                │
│  Số điện thoại (tùy chọn): [_________]            │
│  Ghi chú: [_________________]                      │
│                                                     │
│  [Hủy]                              [Xác Nhận]    │
└─────────────────────────────────────────────────────┘
```

**Required Fields:**

- **Bàn**: Chọn bàn (bắt buộc)
- **Món ăn**: Ít nhất một món (bắt buộc)
- **Số lượng khách**: Số người ăn (bắt buộc, mặc định: 1)

**Optional Fields:**

- **Tên khách**: Tên khách hàng
- **Số điện thoại**: Số liên hệ
- **Ghi chú**: Ghi chú chung cho đơn
- **Yêu cầu đặc biệt** (cho từng món): Không hành, ít cay, tách riêng, v.v.

**Validation:**

- Bàn phải tồn tại và không phải ở trạng thái "Đóng"
- Giỏ hàng không được trống
- Số lượng khách > 0
- Giá món > 0 và tồn tại trong database

### 2.2 Edit/Update Functionality

**Triggers:**

- Nhấn nút "Sửa đơn" từ danh sách
- Nhấn nút "Thêm Món" từ chi tiết đơn hàng
- Nhấn nút "Hủy Món" từ chi tiết đơn hàng

**Edit Form:**

```
┌─────────────────────────────────────────────────────┐
│  ✏️ Chỉnh Sửa Đơn Hàng #001                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Thông tin đơn hàng:                                │
│  • Số đơn: #001 (không thể thay đổi)               │
│  • Bàn: Bàn 3 (không thể thay đổi)                 │
│  • Trạng thái: Chờ xác nhận                        │
│                                                     │
│  Danh sách món hiện tại:                            │
│  ┌─────────────────────────────────────────────┐  │
│  │ ☐ Thịt bò nướng x1  120K  [Sửa] [×]        │  │
│  │ ☐ Cơm tấm x2        80K   [Sửa] [×]        │  │
│  │ ☐ Nước cam x2       50K   [Sửa] [×]        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  [+ Thêm Món]                                       │
│                                                     │
│  Cập nhật thông tin khách:                          │
│  Tên khách: [_________]                            │
│  Số điện thoại: [_________]                        │
│  Ghi chú: [_________________]                      │
│                                                     │
│  [Hủy]                              [Lưu Thay Đổi]│
└─────────────────────────────────────────────────────┘
```

**Quick Edit Mode:**

- Nhấn trực tiếp trên số lượng để thay đổi
- Nhấn "x" để hủy món nhanh
- Có xác nhận với modal nếu cần

**Batch Edit:**

- Chọn nhiều đơn hàng để thay đổi trạng thái hàng loạt
- Chọn nhiều món để hủy/chỉnh sửa cùng lúc

### 2.3 Delete/Cancel Functionality

**Trigger:** Nhân viên nhấn nút "Hủy Món" hoặc "Hủy Đơn Hàng"

**Confirmation Dialog (Hủy Món):**
```
┌────────────────────────────────────────────┐
│  ⚠️ Xác Nhận Hủy Món                       │
├────────────────────────────────────────────┤
│                                            │
│  Bạn có chắc chắn muốn hủy:              │
│  📌 Thịt bò nướng x1 (120K)              │
│  từ đơn hàng #001 - Bàn 3?               │
│                                            │
│  Lý do hủy * :                             │
│  [○] Khách đổi ý                           │
│  [○] Món hết hàng                          │
│  [○] Nhập sai                              │
│  [○] Khác: [________________]              │
│                                            │
│  ⚠️ Lưu ý:                                 │
│  • Nếu món đã gửi bếp, bếp sẽ được       │
│    thông báo hủy                          │
│  • Không tính phí nếu chưa nấu            │
│                                            │
│  [Hủy]                      [Xác Nhận]    │
└────────────────────────────────────────────┘
```

**Validation:**

- Không được hủy đơn hàng đã thanh toán
- Không được hủy đơn hàng đã hoàn tất
- Nếu hủy tất cả món → Hủy toàn bộ đơn hàng

**Soft Delete:**

- Không xóa vật lý từ database, chỉ đánh dấu trạng thái "Cancelled"
- Có thể khôi phục trong 1 giờ nếu nhân viên nhấn nhầm

---

## 3. ORDER ITEMS MANAGEMENT

### 3.1 Add Item to Order

**Workflow:**
1. Chọn danh mục (Khai vị, Chính, Tráng miệng, v.v.)
2. Chọn món từ danh sách
3. Nhập số lượng
4. Nhập yêu cầu đặc biệt
5. Thêm vào giỏ hàng
6. Lặp lại cho các món khác
7. Xác nhận

**UI:**
```
┌────────────────────────────────────────────────┐
│  Danh Mục:                                     │
│  [Khai vị] [Chính] [Tráng miệng] [Nước]      │
│                                                │
│  Các Món:                                      │
│  ┌────────────────────────────────────────────┐ │
│  │ ☐ Thịt bò nướng       50K (Chính)  [+]   │ │
│  │ ☐ Gà nướng mật ong    45K (Chính)  [+]   │ │
│  │ ☐ Cá nướng lá chuối   55K (Chính)  [+]   │ │
│  │ ☐ Mực nướng           60K (Chính)  [+]   │ │
│  └────────────────────────────────────────────┘ │
│                                                │
│  Chi tiết món:                                 │
│  Thịt bò nướng - 50K                           │
│  Số lượng: [___] (Min: 1, Max: 50)            │
│  Yêu cầu đặc biệt:                            │
│  ☐ Không hành  ☐ Ít cay  ☐ Tách riêng       │
│  Ghi chú: [________________]                   │
│                                                │
│  [Hủy]                    [Thêm vào Giỏ]     │
└────────────────────────────────────────────────┘
```

### 3.2 Edit Item Quantity

**Cách thay đổi:**
- Nhấn nút +/- để tăng/giảm số lượng
- Nhập trực tiếp số lượng
- Xóa icon (×) để hủy món

**Validation:**
- Số lượng tối thiểu: 1
- Số lượng tối đa: 50
- Không được để giỏ trống

### 3.3 Remove Item

**Confirmation:**
```
Hủy [tên món] x[số lượng]?
[Hủy]  [Xác Nhận]
```

---

## 4. STATUS MANAGEMENT (Quản lý trạng thái)

### 4.1 Status Types

**Available Statuses:**

1. **PENDING** (Chờ xác nhận) - 🔴 Đỏ
   - Đơn hàng vừa được tạo, chưa gửi bếp
   - Nhân viên có thể sửa/hủy tự do

2. **CONFIRMED** (Đã xác nhận) - 🟡 Vàng
   - Đơn hàng đã được xác nhận, gửi đến bếp
   - Nhân viên có thể thêm/hủy món nhưng cần xác nhận bếp

3. **PREPARING** (Đang chuẩn bị) - 🟠 Cam
   - Bếp đã nhận đơn, đang nấu
   - Không thể hủy toàn bộ đơn, chỉ hủy từng món với xác nhận

4. **READY** (Sẵn sàng) - 🟢 Xanh
   - Tất cả các món đã nấu xong, chờ lấy
   - Chỉ có thể xác nhận lấy hoặc hoàn lại

5. **SERVING** (Đã phục vụ) - 🔵 Xanh Lục
   - Đơn hàng đã được mang ra cho khách
   - Chờ khách ăn xong thanh toán

6. **COMPLETED** (Hoàn tất) - ⚪ Xám
   - Đơn hàng đã thanh toán, hoàn tất
   - Dữ liệu lưu cho báo cáo

7. **CANCELLED** (Đã hủy) - ⚫ Đen
   - Đơn hàng đã bị hủy
   - Không thể sửa/xóa thêm

### 4.2 Status Flow Diagram

```
PENDING ──→ CONFIRMED ──→ PREPARING ──→ READY ──→ SERVING ──→ COMPLETED
   ↓            ↓             ↓           ↓         ↓
   └────────────────────────────────────────→ CANCELLED
```

### 4.3 Status Indicators

**Visual Indicators:**

- **Badge trạng thái**: Hiển thị tên và màu của trạng thái
- **Timeline**: Lịch sử chuyển đổi trạng thái với timestamp
- **Progress Bar**: Thanh tiến độ từ đặt đến hoàn tất

**Real-time Updates:**

- Cập nhật trạng thái khi bếp thay đổi
- Thông báo push khi trạng thái thay đổi quan trọng
- Âm thanh thông báo khi có đơn mới

---

## 5. SEARCH & FILTER (Tìm kiếm và lọc)

### 5.1 Basic Search

**Search Bar:**
```
🔍 Tìm kiếm số đơn, tên khách, số điện thoại...
```

**Search Features:**

- Tìm kiếm theo số đơn hàng (VD: #001, 001)
- Tìm kiếm theo tên khách hàng (VD: Nguyễn Văn A)
- Tìm kiếm theo số điện thoại (VD: 0123456789)
- Tìm kiếm theo số bàn (VD: Bàn 3, T3)

### 5.2 Advanced Filtering

**Filter Combinations:**
```
Active Filters:
┌─────────────────────────────────────────┐
│ Trạng thái: [Chờ xác nhận]         [×] │
│ Bàn: [3, 5, 7]                     [×] │
│ Nhân viên: [Hương]                 [×] │
│ Khoảng thời gian: [Hôm nay]        [×] │
│                                         │
│ [Clear All Filters]                     │
└─────────────────────────────────────────┘

Showing 8 of 42 orders
```

### 5.3 Sorting Options

**Sort By:**

- Thời gian (Mới nhất → Cũ nhất, Cũ nhất → Mới nhất)
- Tổng tiền (Cao → Thấp, Thấp → Cao)
- Số bàn (1 → 10, 10 → 1)
- Trạng thái (Chờ → Hoàn, Hoàn → Chờ)

**Default Sort:** Thời gian (Mới nhất trước)

---

## 6. PERMISSIONS & ROLES (Phân quyền)

### 6.1 Role-based Access

**Roles:**

```
👑 Admin
├── Xem tất cả đơn hàng
├── Tạo/Sửa/Hủy đơn hàng
├── Xem báo cáo
└── Xóa đơn hàng (vĩnh viễn)

👨‍💼 Manager
├── Xem tất cả đơn hàng
├── Tạo/Sửa đơn hàng
├── Hủy đơn hàng (cần lý do)
├── Xem báo cáo
└── Xác nhận hủy của nhân viên

🧑‍💼 Waiter/Staff
├── Xem đơn hàng của mình
├── Tạo/Sửa đơn hàng
├── Thêm/Hủy món (cần lý do nếu đã gửi bếp)
└── Xác nhận phục vụ

👨‍🍳 Chef/Kitchen Staff
├── Xem đơn bếp
├── Nhận và xác nhận đơn
├── Cập nhật trạng thái nấu
├── Đánh dấu hoàn tất
└── Xác nhận/từ chối hủy món

💳 Cashier
├── Xem đơn hàng
├── Tạo hóa đơn từ đơn hàng
├── Xem báo cáo doanh thu
└── Không được sửa/hủy đơn
```

### 6.2 Permission Matrix

**Access Control:**

| Hành động | Admin | Manager | Staff | Chef | Cashier |
|-----------|-------|---------|-------|------|---------|
| Xem       | ✅    | ✅      | ✅    | ✅   | ✅      |
| Tạo       | ✅    | ✅      | ✅    | ❌   | ❌      |
| Sửa       | ✅    | ✅      | ✅    | ❌   | ❌      |
| Hủy Món   | ✅    | ✅      | ✅*   | ✅*  | ❌      |
| Hủy ĐH    | ✅    | ✅*     | ❌    | ❌   | ❌      |
| Báo cáo   | ✅    | ✅      | ❌    | ❌   | ✅      |
| Xóa       | ✅    | ❌      | ❌    | ❌   | ❌      |

*Cần xác nhận từ cấp trên hoặc có lý do

---

## 7. NOTIFICATIONS & REAL-TIME (Thông báo thực thời)

### 7.1 Real-time Updates

**WebSocket Events:**

```javascript
// Khi có đơn hàng mới
order.created → {
  id: "ORD-001",
  table: 3,
  items: [...],
  status: "PENDING"
}

// Khi trạng thái đơn thay đổi
order.status_changed → {
  id: "ORD-001",
  oldStatus: "PENDING",
  newStatus: "CONFIRMED"
}

// Khi bếp cập nhật tiến độ
order.item_status_changed → {
  id: "ORD-001",
  itemId: "ITEM-1",
  status: "READY"
}
```

### 7.2 Notification Types

**Notifications:**

1. **Đơn Mới**: "Đơn mới #001 - Bàn 3"
2. **Sẵn Sàng**: "Đơn #001 sẵn sàng lấy"
3. **Hủy Món**: "Yêu cầu hủy: Thịt bò nướng (Đơn #001)"
4. **Quá Hạn**: "Đơn #001 chờ > 20 phút"

### 7.3 Notification Channels

- **In-app**: Popup/toast notification trên giao diện
- **Browser**: Notification bubble (desktop)
- **Sound**: Âm thanh thông báo tùy chọn
- **Mobile**: Push notification (nếu có app di động)

---

## 8. REPORTS & ANALYTICS (Báo cáo và phân tích)

### 8.1 Dashboard Metrics

**Key Metrics:**
```
┌─────────────────────────────────────────┐
│  Analytics - Hôm nay                    │
├─────────────────────────────────────────┤
│  Tổng đơn hàng:     42                  │
│  Doanh thu:         8,400K Đ (↑ 12%)   │
│  Đơn trung bình:    200K Đ              │
│  Thời gian chờ:    18 phút              │
│  Tỷ lệ hủy:         2.3%                │
│                                         │
│  [Xem báo cáo chi tiết] [Xuất Excel]   │
└─────────────────────────────────────────┘
```

### 8.2 Report Types

**Available Reports:**

1. **Báo cáo doanh thu**: Tổng doanh thu theo ngày/tuần/tháng
2. **Báo cáo món bán chạy**: Top 10 món được gọi nhiều nhất
3. **Báo cáo hiệu suất phục vụ**: Thời gian trung bình từ đặt đến phục vụ
4. **Báo cáo đơn hủy**: Số lượng, lý do, tác động tài chính
5. **Báo cáo theo ca làm việc**: Doanh thu, số đơn, hiệu suất / ca
6. **Báo cáo theo nhân viên**: Hiệu suất từng nhân viên phục vụ

**Export Options:**

- CSV export (để Excel)
- PDF reports (để in)
- Email báo cáo tự động hàng ngày/tuần/tháng

---

## 9. ADVANCED FEATURES (Tính năng nâng cao)

### 9.1 Order Grouping by Status

**Workflow:**

- Nhóm đơn hàng theo trạng thái
- Ưu tiên hiển thị "Chờ xác nhận" (màu đỏ)
- Sau đó "Đang chuẩn bị" (màu cam)
- Cuối cùng "Sẵn sàng" (màu xanh)

### 9.2 Kitchen Display System (KDS)

**Dashboard cho Bếp:**

```
┌──────────────────────────────────────┐
│  🍳 Kitchen Display System            │
├──────────────────────────────────────┤
│                                      │
│  📋 CHỜ CHUẨN BỊ (5)                 │
│  ┌──────────────────────────────────┐│
│  │ #001 Bàn 3  (Chờ 5 phút)  [VIP] ││
│  │ • Thịt bò nướng x1              ││
│  │ • Cơm tấm x2                    ││
│  │ • Nước cam x2 - Ít đá            ││
│  │ [Bắt đầu nấu]                   ││
│  └──────────────────────────────────┘│
│                                      │
│  🔥 ĐANG NẤU (8)                     │
│  │ [Card tương tự]                  │
│                                      │
│  ✅ SẴN SÀNG (3)                     │
│  │ [Card tương tự]                  │
│                                      │
└──────────────────────────────────────┘
```

### 9.3 Split Bill Functionality

**Chia hóa đơn:**
- Chia theo từng mon
- Chia theo số người
- Tính lại thuế và phí cho từng phần

---

## 10. KEYBOARD SHORTCUTS (Phím tắt)

### 10.1 Global Shortcuts

```
Ctrl + N        Tạo đơn mới
Ctrl + S        Lưu/Cập nhật đơn
Ctrl + F        Tìm kiếm
Ctrl + K        Xóa bộ lọc
Esc             Đóng dialog
```

### 10.2 Order List Shortcuts

```
↑ ↓            Điều hướng giữa các đơn
Enter          Xem chi tiết đơn được chọn
Delete         Hủy đơn được chọn (cần xác nhận)
E              Sửa đơn
A              Thêm món
```

---

## 11. MOBILE & ACCESSIBILITY (Di động và khả năng truy cập)

### 11.1 Mobile Interface

**Responsive Design:**
```
Mobile View (Portrait):
┌─────────────┐
│  Quản Lý ĐH │
├─────────────┤
│ [🔍 Tìm...]│
│ [Lọc ▼]    │
│ [+Tạo Mới] │
├─────────────┤
│ #001|Bàn 3 │
│ 3 Món|450K │
│ [Xem][Sửa] │
│ [Hủy][Gửi] │
│             │
│ #002|Bàn 5 │
│ ...         │
└─────────────┘
```

**Touch Gestures:**

- Swipe right: Xem chi tiết
- Swipe left: Ẩn/hiện menu hành động
- Tap lâu: Chọn nhiều đơn
- Double tap: Xác nhận hành động

### 11.2 Accessibility Features

**ARIA Support:**

- Screen reader compatible
- Keyboard navigation đầy đủ
- Focus management
- High contrast mode
- Large text option

---

## 12. API REFERENCE (Tài liệu API)

### 12.1 REST Endpoints

**List Orders:**
```javascript
GET /api/orders?page=1&limit=20&status=PENDING&table=3

Response:
{
  "data": [
    {
      "id": "ORD-001",
      "table": 3,
      "status": "PENDING",
      "items": [...],
      "total": 450000,
      "createdAt": "2024-01-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

**Create Order:**
```javascript
POST /api/orders
{
  "table": 3,
  "items": [
    {
      "menuItemId": "ITEM-1",
      "quantity": 1,
      "specialRequest": "Không hành, ít cay"
    }
  ],
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0123456789",
  "notes": "Ghi chú"
}

Response:
{
  "id": "ORD-001",
  "orderNumber": "#001",
  "table": 3,
  "status": "PENDING",
  "items": [...],
  "total": 450000,
  "createdAt": "2024-01-01T10:30:00Z"
}
```

**Update Order Status:**
```javascript
PATCH /api/orders/ORD-001/status
{ "status": "CONFIRMED" }

Response:
{
  "id": "ORD-001",
  "status": "CONFIRMED",
  "updatedAt": "2024-01-01T10:31:00Z"
}
```

**Cancel Order:**
```javascript
DELETE /api/orders/ORD-001
{
  "reason": "Khách hủy",
  "cancelledBy": "USER-123"
}

Response:
{
  "id": "ORD-001",
  "status": "CANCELLED",
  "reason": "Khách hủy",
  "deletedAt": "2024-01-01T10:35:00Z"
}
```

### 12.2 WebSocket Events

**Event Subscriptions:**

```
Available events:
- orders.new
- orders.status_changed
- orders.item_added
- orders.item_removed
- orders.cancelled
```

---

## 13. BEST PRACTICES & RECOMMENDATIONS (Thực hành tốt nhất)

### 13.1 Efficient Order Taking

**Tips:**

- Tương tác nhanh với khách để tránh quên
- Xác nhận lại đơn trước khi gửi bếp
- Nhập yêu cầu đặc biệt rõ ràng
- Lưu ý số lượng khách để ước tính thời gian chờ

### 13.2 Kitchen Communication

**Recommendations:**

- Gửi đơn ngay khi xác nhận (không để chờ)
- Thông báo khi khách gọi thêm món
- Ghi chú rõ ràng yêu cầu đặc biệt
- Ưu tiên đơn VIP hoặc khách chờ lâu

### 13.3 Common Mistakes to Avoid

**Anti-patterns:**

- ❌ Gửi đơn có giỏ trống
- ✅ Luôn kiểm tra giỏ trước khi gửi

- ❌ Hủy đơn mà không lý do
- ✅ Ghi rõ lý do hủy để phân tích sau

- ❌ Quên cập nhật trạng thái
- ✅ Cập nhật khi có thay đổi

---

## 14. TROUBLESHOOTING & FAQ (Khắc phục sự cố)

### 14.1 Common Issues

**Issue: Không gửi được đơn đến bếp**
```
Solutions:
1. Kiểm tra kết nối Internet
2. Kiểm tra trạng thái máy in bếp
3. Gửi lại đơn
4. Nếu vẫn lỗi, in phiếu order thủ công
5. Liên hệ IT để kiểm tra hệ thống
```

**Issue: Nhân viên bếp không nhận được thông báo**
```
Solutions:
1. Kiểm tra âm thanh thông báo đã bật
2. Kiểm tra ứng dụng đã được cấp quyền notification
3. Làm mới trang bếp (F5)
4. Khởi động lại ứng dụng
```

**Issue: Tính tổng tiền sai**
```
Solutions:
1. Kiểm tra lại giá từng mon trong menu
2. Kiểm tra số lượng
3. Kiểm tra có áp dụng giảm giá không
4. Liên hệ quản lý nếu nghi ngờ
```

### 14.2 FAQ

**Q: Có thể hủy đơn hàng đã gửi bếp không?**  
A: Có, nhưng cần xác nhận từ quản lý. Nếu bếp đã nấu, sẽ tính phí theo chính sách.

**Q: Thêm món vào đơn đang nấu có được không?**  
A: Có, nhân viên có thể thêm mon bất cứ lúc nào. Các món mới sẽ được gửi đến bếp.

**Q: Làm thế nào để chia hóa đơn?**  
A: Từ chi tiết đơn hàng, chọn các món và tạo hóa đơn riêng. Hệ thống sẽ tính lại thuế.

**Q: Có thể xem lịch sử đơn hàng của khách không?**  
A: Có, nếu lưu số điện thoại khách, có thể xem lịch sử đặt hàng.

---

## 15. PERFORMANCE OPTIMIZATION (Tối ưu hiệu năng)

### 15.1 Rendering Strategy

**Optimization Techniques:**

- **Virtual List**: Hiển thị chỉ 10-15 đơn hàng trên màn hình, load thêm khi scroll
- **Lazy Loading**: Tải chi tiết đơn khi nhấn xem
- **Debouncing**: Debounce tìm kiếm 300ms để tránh request nhiều
- **Caching**: Cache danh sách menu để tránh load lại

### 15.2 Data Management

**Caching Strategy:**

- Cache menu items (update mỗi 5 phút)
- Cache tất cả bàn (update real-time)
- Không cache danh sách đơn (update real-time)

**State Updates:**

- Cập nhật state khi có socket event
- Reorder list khi có đơn mới
- Xóa từ list khi đơn hoàn tất

---

## 16. SECURITY CONSIDERATIONS (Cân nhắc bảo mật)

### 16.1 Data Protection

**Security Measures:**

- **Authentication**: Yêu cầu đăng nhập để xem/tạo đơn
- **Authorization**: Kiểm tra quyền trước khi thực hiện hành động
- **Encryption**: Mã hóa dữ liệu nhạy cảm (SĐT khách)
- **Audit Trail**: Ghi log tất cả hành động (ai, khi nào, cái gì)

### 16.2 Input Validation

**Validation Rules:**

- Kiểm tra bàn tồn tại trước khi tạo đơn
- Kiểm tra mon tồn tại và còn hàng
- Kiểm tra số lượng > 0 và < max
- Kiểm tra người dùng có quyền trước khi hủy
- Kiểm tra không để giỏ trống

---

## 17. DATABASE SCHEMA (Cơ sở dữ liệu)

### 17.1 Order Table

```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  table_id VARCHAR(36) NOT NULL,
  staff_id VARCHAR(36) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  head_count INT DEFAULT 1,
  notes TEXT,
  status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  total_amount DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  final_amount DECIMAL(12, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason VARCHAR(255),
  
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  INDEX idx_status (status),
  INDEX idx_table_id (table_id),
  INDEX idx_created_at (created_at)
);

CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  menu_item_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  special_request TEXT,
  status ENUM('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED') DEFAULT 'PENDING',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
);
```

---

## 18. FUTURE ENHANCEMENTS (Cải tiến trong tương lai)

### 18.1 Planned Features

- [ ] **Self-ordering**: Khách scan QR trên bàn để tự đặt
- [ ] **AI Recommendations**: Gợi ý mon dựa trên lịch sử
- [ ] **Voice Ordering**: Đặt mon bằng giọng nói
- [ ] **Allergen Alert**: Cảnh báo thành phần gây dị ứng
- [ ] **Combo Suggestion**: Tự động gợi ý combo
- [ ] **Kitchen Video**: Camera theo dõi bếp

### 18.2 Requested Features

- Khách đánh giá mon ăn ngay sau khi ăn
- Lưu thói quen đặt of khách
- Tích hợp thanh toán online
- Đơn hàng định kỳ (gợi ý mon khách hay gọi)

---

## APPENDIX

### A. Glossary (Từ Điển)

- **Order**: Đơn hàng
- **Order Item**: Món ăn trong đơn hàng
- **KDS**: Kitchen Display System (Hệ thống hiển thị bếp)
- **Staff/Waiter**: Nhân viên phục vụ
- **Chef**: Đầu bếp
- **Table**: Bàn (vị trí khách ngồi)
- **Menu Item**: Mon ăn trong menu
- **Status**: Trạng thái
- **Special Request**: Yêu cầu đặc biệt

### B. Status Code Reference

```
PENDING        - Chờ xác nhận
CONFIRMED      - Đã xác nhận
PREPARING      - Đang chuẩn bị
READY          - Sẵn sàng
SERVING        - Đã phục vụ
COMPLETED      - Hoàn tất
CANCELLED      - Đã hủy
```

---

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**Author:** Restaurant Management System Team  
**Status:** Approved
