# Cấu Trúc Tài Liệu

Tài liệu toàn diện cho Hệ Thống Quản Lý Nhà Hàng.

## 📁 Cấu Trúc Thư Mục

```
docs/
├── README.md                          # Tệp này - Chỉ mục tài liệu
│
├── 🎯 features/                       # Tài Liệu Tính Năng
│   ├── MENU_MANAGEMENT_FEATURES.md
│   ├── RESERVATION_MANAGEMENT_FEATURES.md
│   └── VISUAL_FLOOR_PLAN_FEATURES.md
│
├── 📋 templates/                      # Mẫu Tài Liệu
│   └── FEATURE_DOCUMENTATION_TEMPLATE.md
│
├── 🏗️ architecture/                   # Kiến Trúc Hệ Thống
│   ├── BUSINESS_USE_CASES.md          # Yêu cầu kinh doanh
│   ├── DATABASE.md                    # Thiết kế cơ sở dữ liệu
│   └── ERD.mmd                        # Sơ đồ quan hệ thực thể
│
├── 🔧 technical/                      # Hướng Dẫn Kỹ Thuật
│   ├── DESKTOP_DOCUMENTATION.md       # Tài liệu ứng dụng desktop
│   ├── FILE_STORAGE_GUIDE.md          # Hướng dẫn lưu trữ tệp
│   ├── FRONTEND_DOCUMENTATION.md      # Kiến trúc frontend
│   └── WEBSOCKET_INTEGRATION.md       # Tích hợp WebSocket
│
├── 📊 diagrams/                       # Sơ Đồ Hệ Thống
│   ├── AUTHENTICATION_MANAGEMENT_DIAGRAMS.md
│   ├── BILL_PAYMENT_MANAGEMENT_DIAGRAMS.md
│   ├── INVENTORY_MANAGEMENT_DIAGRAMS.md
│   ├── MENU_MANAGEMENT_DIAGRAMS.md
│   ├── ORDER_MANAGEMENT_DIAGRAMS.md
│   ├── RESERVATION_MANAGEMENT_DIAGRAMS.md
│   └── STAFF_MANAGEMENT_DIAGRAMS.md
│
├── 📖 use_case/                       # Tài Liệu Use Case
│   ├── AUTHENTICATION_MANAGEMENT.md
│   ├── BILL_PAYMENT_MANAGEMENT.md
│   ├── INVENTORY_MANAGEMENT.md
│   ├── MENU_MANAGEMENT.md
│   ├── ORDER_MANAGEMENT.md
│   ├── RESERVATION_MANAGEMENT.md
│   └── STAFF_MANAGEMENT.md
│
├── 🎨 design/                         # Tài Liệu Thiết Kế UI/UX
│   ├── FOOD_IMPORT_MANAGEMENT.md
│   ├── TABLE_MANAGEMENT_UI_DESIGN.md
│   └── table-management/              # Thiết kế quản lý bàn
│
├── 🌐 api/                            # Tài Liệu API
│   ├── CUSTOMER_API_FRONTEND.md
│   └── RESERVATION_API_FRONTEND.md
│
├── 📸 images/                         # Hình Ảnh Tài Liệu
│   └── use_case/                      # Sơ đồ use case
│
└── 📄 reports/                        # Báo Cáo Học Thuật
    ├── academic_plan/                 # Tài liệu kế hoạch học thuật
    └── template/                      # Mẫu báo cáo
```

---

## 📚 Danh Mục Tài Liệu

### 🎯 Tính Năng (`/features`)
**Tài liệu tính năng hoàn chỉnh theo mẫu được chuẩn hóa.**

Mỗi tài liệu tính năng bao gồm:
- Tổng quan và Tính Năng Chính
- Bố Cục Giao Diện Người Dùng
- Chức Năng Cốt Lõi (Hoạt động CRUD)
- Quản Lý Trạng Thái
- Tìm Kiếm & Lọc khả năng
- Quyền & Vai Trò
- Tham Chiếu API
- Phím Tắt
- Thực Hành Tốt Nhất
- Khắc Phục Sự Cố & Câu Hỏi Thường Gặp

**Tính Năng Có Sẵn:**
- Quản Lý Menu
- Quản Lý Đặt Chỗ
- Trình Chỉnh Sửa Sơ Đồ Tầng Trực Quan

**Tính Năng Sắp Tới:**
- Quản Lý Đơn Đặt Hàng
- Quản Lý Nhân Viên
- Quản Lý Kho Hàng
- Quản Lý Hóa Đơn & Thanh Toán

---

### 📋 Mẫu (`/templates`)
**Mẫu tài liệu được chuẩn hóa để tài liệu nhất quán.**

- `FEATURE_DOCUMENTATION_TEMPLATE.md` - Mẫu tạo tài liệu tính năng mới

**Khi nào sử dụng:**
- Tạo tài liệu cho các tính năng mới
- Cập nhật tài liệu tính năng hiện có
- Đảm bảo tính nhất quán của tài liệu trong dự án

---

### 🏗️ Kiến Trúc (`/architecture`)
**Thiết kế hệ thống, lược đồ cơ sở dữ liệu và yêu cầu kinh doanh.**

- **BUSINESS_USE_CASES.md** - Yêu cầu kinh doanh và use case
- **DATABASE.md** - Lược đồ cơ sở dữ liệu hoàn chỉnh và quyết định thiết kế
- **ERD.mmd** - Sơ đồ Quan hệ Thực thể (định dạng Mermaid)

**Mục đích:**
- Hiểu kiến trúc hệ thống
- Tham chiếu thiết kế cơ sở dữ liệu
- Tài liệu logic kinh doanh
- Bản ghi quyết định kiến trúc

---

### 🔧 Kỹ Thuật (`/technical`)
**Hướng dẫn triển khai kỹ thuật và hướng dẫn thiết lập.**

- **DESKTOP_DOCUMENTATION.md** - Tài liệu ứng dụng desktop (Tauri)
- **FILE_STORAGE_GUIDE.md** - Hướng dẫn lưu trữ tệp và tải lên
- **FRONTEND_DOCUMENTATION.md** - Kiến trúc frontend và cấu trúc thành phần
- **WEBSOCKET_INTEGRATION.md** - Tích hợp WebSocket thời gian thực

**Sử dụng cho:**
- Hiểu công nghệ
- Hướng dẫn triển khai
- Khắc phục sự cố kỹ thuật

**Lưu ý:** Tài liệu triển khai cũ đã được di chuyển. Xem `/deploy/README.md` cho hướng dẫn triển khai mới.

---

### 🚀 Triển Khai
**Hướng dẫn triển khai hoàn chỉnh - Xem `/deploy/README.md`**

Hệ thống cung cấp 2 tùy chọn triển khai:

#### **Tùy Chọn A: Vercel + Railway (Khuyến nghị cho Demo)**
- ✅ **Miễn phí** ($0-5/tháng)
- ✅ Triển khai trong **20-30 phút**
- ✅ Tự động HTTPS/SSL
- ✅ Không cần quản lý server

**Tài liệu:** [`/deploy/README.md`](../deploy/README.md#option-a-vercel--railway-recommended)

#### **Tùy Chọn B: DigitalOcean VPS (Khuyến nghị cho Học Tập & Production)**
- ✅ **Miễn phí với GitHub Education Pack** ($200 credit = 33 tháng)
- ✅ Toàn quyền kiểm soát hạ tầng
- ✅ Học quản trị server (Docker, Linux, Security)
- ✅ Production-ready với bảo mật đầy đủ

**Tài liệu chính:**
- 🇻🇳 **[Hướng Dẫn Triển Khai DigitalOcean (Tiếng Việt)](../deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md)** - Hướng dẫn từng bước chi tiết
- 📋 **[Quick Reference](../deploy/digitalocean/QUICK_REFERENCE.md)** - Lệnh thường dùng
- 💰 **[Cost Optimization](../deploy/digitalocean/COST_OPTIMIZATION.md)** - Tối ưu chi phí & GitHub Education credits
- 🔒 **[Security Checklist](../deploy/digitalocean/SECURITY_CHECKLIST.md)** - Kiểm tra bảo mật production

**Bao gồm:**
- Script tự động cho setup VPS, deployment, backup/restore, health checks
- Tài liệu tiếng Việt dễ hiểu cho sinh viên
- Cấu hình Docker Compose production-ready
- SSL tự động với Caddy hoặc Nginx
- Tối ưu tài nguyên cho Droplet 1GB RAM
- Firewall UFW, SSH keys, HTTPS
- Monitoring và logging

**Tài liệu triển khai cũ:** Đã di chuyển sang `/_archive/deployment-v1/` (lưu trữ)

---

### Cho Kỹ Sư DevOps

1. **Triển Khai:**
   - **Vercel + Railway:** [`/deploy/README.md`](../deploy/README.md#option-a-vercel--railway-recommended)
   - **DigitalOcean VPS:** [`/deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md`](../deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md)

2. **Vận Hành:**
   - [`/deploy/digitalocean/QUICK_REFERENCE.md`](../deploy/digitalocean/QUICK_REFERENCE.md) - Lệnh hàng ngày
   - [`/deploy/digitalocean/SECURITY_CHECKLIST.md`](../deploy/digitalocean/SECURITY_CHECKLIST.md) - Kiểm tra bảo mật

3. **Tối Ưu Chi Phí:**
   - [`/deploy/digitalocean/COST_OPTIMIZATION.md`](../deploy/digitalocean/COST_OPTIMIZATION.md)

4. **Cơ Sở Hạ Tầng:**
   - `technical/DOCKER.md` (nếu có)
   - `architecture/DATABASE.md`

---

### 📊 Sơ Đồ (`/diagrams`)
**Biểu diễn trực quan về quy trình và luồng công việc hệ thống.**

Sơ đồ cho mỗi mô-đun hệ thống chính:
- Luồng xác thực
- Xử lý Hóa đơn & Thanh toán
- Theo dõi Kho hàng
- Quản lý Menu
- Vòng đời Đơn đặt hàng
- Quy trình Đặt chỗ
- Hoạt động Nhân viên

**Định dạng:** Sơ đồ Mermaid nhúng trong Markdown

---

### 📖 Use Case (`/use_case`)
**Thông số kỹ thuật use case chi tiết cho từng mô-đun.**

Mỗi tài liệu use case bao gồm:
- Tác nhân và vai trò
- Điều kiện tiên quyết và điều kiện hậu kỳ
- Luồng chính và luồng thay thế
- Xử lý ngoại lệ
- Quy tắc kinh doanh

**Các mô-đun được bao gồm:**
- Xác Thực & Ủy Quyền
- Quản Lý Hóa Đơn & Thanh Toán
- Quản Lý Kho Hàng
- Quản Lý Menu
- Quản Lý Đơn Đặt Hàng
- Quản Lý Đặt Chỗ
- Quản Lý Nhân Viên

---

### 🎨 Thiết Kế (`/design`)
**Thông số kỹ thuật thiết kế UI/UX và mockup.**

- Thông số kỹ thuật thành phần UI
- Sơ đồ luồng người dùng
- Hướng dẫn hệ thống thiết kế
- Khung dây và mockup

---

### 🌐 API (`/api`)
**Tài liệu API cho tích hợp frontend.**

- Điểm cuối REST API
- Định dạng yêu cầu/phản hồi
- Yêu cầu xác thực
- Mã lỗi
- Ví dụ sử dụng

---

### 📸 Hình Ảnh (`/images`)
**Tài sản trực quan cho tài liệu.**

- Ảnh chụp màn hình
- Sơ đồ
- Biểu tượng
- Mockup UI

---

### 📄 Báo Cáo (`/reports`)
**Báo cáo học thuật và dự án.**

- Tài liệu kế hoạch học thuật
- Báo cáo tiến độ
- Tài liệu luận văn
- Mẫu báo cáo

---

## 🚀 Bắt Đầu Nhanh

### Cho Nhà Phát Triển

1. **Bắt Đầu với Kiến Trúc:**
   - Đọc `architecture/BUSINESS_USE_CASES.md`
   - Xem `architecture/DATABASE.md`
   - Nghiên cứu `architecture/ERD.mmd`

2. **Thiết Lập Môi Trường Phát Triển:**
   - Tuân theo `technical/DOCKER.md`
   - Kiểm tra `technical/FRONTEND_DOCUMENTATION.md`

3. **Hiểu Tính Năng:**
   - Duyệt `features/` cho các tính năng được triển khai
   - Xem `use_case/` cho các thông số kỹ thuật chi tiết
   - Kiểm tra `diagrams/` cho quy trình trực quan

### Cho Trình Quản Lý Sản Phẩm

1. **Yêu Cầu Kinh Doanh:**
   - `architecture/BUSINESS_USE_CASES.md`
   - Thư mục `use_case/`

2. **Tài Liệu Tính Năng:**
   - Thư mục `features/` cho thông số kỹ thuật tính năng hoàn chỉnh

3. **Thông Số Kỹ Thuật Thiết Kế:**
   - Thư mục `design/`

### Cho Kỹ Sư DevOps

1. **Triển Khai:**
   - `deployment/DEPLOYMENT.md`
   - `deployment/DEPLOYMENT_QUICK_REFERENCE.md`

2. **Vận Hành:**
   - `deployment/OPERATIONS.md`
   - `deployment/COST_OPTIMIZATION.md`

3. **Cơ Sở Hạ Tầng:**
   - `technical/DOCKER.md`

---

## 📝 Đóng Góp cho Tài Liệu

### Tạo Tài Liệu Tính Năng Mới

1. Sao chép mẫu:
   ```bash
   cp templates/FEATURE_DOCUMENTATION_TEMPLATE.md features/NEW_FEATURE_NAME.md
   ```

2. Điền vào tất cả các phần theo cấu trúc mẫu

3. Bao gồm:
   - Sơ đồ ASCII cho bố cục UI
   - Ví dụ mã
   - Điểm cuối API
   - Lược đồ cơ sở dữ liệu
   - Quy tắc xác thực

4. Xem danh sách kiểm tra ở cuối mẫu

### Tiêu Chuẩn Tài Liệu

**✅ NÊN:**
- Sử dụng ngôn ngữ rõ ràng, súc tích
- Bao gồm sơ đồ trực quan (ASCII art hoặc Mermaid)
- Cung cấp ví dụ mã
- Tài liệu tất cả điểm cuối API
- Liệt kê quy tắc xác thực
- Bao gồm phím tắt
- Thêm phần khắc phục sự cố

**❌ KHÔNG NÊN:**
- Sử dụng mô tả mơ hồ
- Bỏ qua tài liệu xử lý lỗi
- Quên xem xét khả năng truy cập
- Để lại văn bản trình giữ chỗ như [TODO]
- Bỏ lỡ thay đổi lược đồ cơ sở dữ liệu

### Quy Trình Xem Xét Tài Liệu

1. **Tự xem** xét bằng cách sử dụng danh sách kiểm tra mẫu
2. **Xem xét ngang hàng** của nhà phát triển khác
3. **Phê duyệt trưởng kỹ thuật**
4. **Cập nhật phiên bản** và ngày tháng
5. **Đánh dấu trạng thái** là "Đã Phê Duyệt"

---

## 🔍 Tìm Tài Liệu

### Theo Tính Năng

| Tính Năng | Tài Liệu | Use Case | Sơ Đồ | API |
|---------|--------------|----------|---------|-----|
| Quản Lý Menu | [Tính Năng](features/MENU_MANAGEMENT_FEATURES.md) | [Use Case](use_case/MENU_MANAGEMENT.md) | [Sơ Đồ](diagrams/MENU_MANAGEMENT_DIAGRAMS.md) | - |
| Đặt Chỗ | [Tính Năng](features/RESERVATION_MANAGEMENT_FEATURES.md) | [Use Case](use_case/RESERVATION_MANAGEMENT.md) | [Sơ Đồ](diagrams/RESERVATION_MANAGEMENT_DIAGRAMS.md) | [API](api/RESERVATION_API_FRONTEND.md) |
| Sơ Đồ Tầng | [Tính Năng](features/VISUAL_FLOOR_PLAN_FEATURES.md) | - | - | - |
| Xác Thực | - | [Use Case](use_case/AUTHENTICATION_MANAGEMENT.md) | [Sơ Đồ](diagrams/AUTHENTICATION_MANAGEMENT_DIAGRAMS.md) | - |
| Đơn Đặt Hàng | - | [Use Case](use_case/ORDER_MANAGEMENT.md) | [Sơ Đồ](diagrams/ORDER_MANAGEMENT_DIAGRAMS.md) | - |
| Kho Hàng | - | [Use Case](use_case/INVENTORY_MANAGEMENT.md) | [Sơ Đồ](diagrams/INVENTORY_MANAGEMENT_DIAGRAMS.md) | - |
| Hóa Đơn & Thanh Toán | - | [Use Case](use_case/BILL_PAYMENT_MANAGEMENT.md) | [Sơ Đồ](diagrams/BILL_PAYMENT_MANAGEMENT_DIAGRAMS.md) | - |
| Nhân Viên | - | [Use Case](use_case/STAFF_MANAGEMENT.md) | [Sơ Đồ](diagrams/STAFF_MANAGEMENT_DIAGRAMS.md) | - |

### Theo Vai Trò

**👨‍💻 Nhà Phát Triển:**
- Bắt Đầu: `technical/` → `architecture/` → `features/`
- Tham Chiếu: `api/` → `use_case/` → `diagrams/`

**👨‍💼 Trình Quản Lý Sản Phẩm:**
- Bắt Đầu: `architecture/BUSINESS_USE_CASES.md`
- Tham Chiếu: `features/` → `use_case/` → `design/`

**🎨 Nhà Thiết Kế:**
- Bắt Đầu: `design/` → `features/`
- Tham Chiếu: `use_case/` → `diagrams/`

**🚀 DevOps:**
- Bắt Đầu: [`/deploy/README.md`](../deploy/README.md) → [`/deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md`](../deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md)
- Tham Chiếu: [`/deploy/digitalocean/QUICK_REFERENCE.md`](../deploy/digitalocean/QUICK_REFERENCE.md) → `architecture/DATABASE.md`

---

## 📅 Phiên Bản Tài Liệu

Tất cả tài liệu tính năng tuân theo phiên bản ngữ nghĩa:

- **Phiên Bản 1.0**: Phiên bản phê duyệt ban đầu
- **Phiên Bản 1.1**: Cập nhật nhỏ (làm rõ, ví dụ)
- **Phiên Bản 2.0**: Cập nhật lớn (tính năng mới, cấu trúc lại)

Kiểm tra phần chân trang của mỗi tài liệu để:
- Phiên Bản Tài Liệu
- Ngày Cập Nhật Lần Cuối
- Tác Giả
- Trạng Thái (Bản Nháp / Xem Xét / Đã Phê Duyệt)

---

## 🆘 Cần Trợ Giúp?

### Vấn Đề Tài Liệu

- **Tài liệu bị thiếu?** Tạo vấn đề hoặc sử dụng mẫu để bắt đầu
- **Tài liệu không rõ ràng?** Mở một vấn đề với câu hỏi cụ thể
- **Tìm thấy lỗi?** Gửi PR với các sửa chữa

### Liên Hệ

- **Câu Hỏi Kỹ Thuật:** Kiểm tra thư mục `technical/`
- **Câu Hỏi Tính Năng:** Kiểm tra thư mục `features/`
- **Câu Hỏi Triển Khai:** Kiểm tra thư mục `deployment/`

---

**Phiên Bản Tài Liệu:** 1.0  
**Ngày Cập Nhật Lần Cuối:** 18 tháng 11 năm 2025  
**Nhân Viên Bảo Trì:** Đội Hệ Thống Quản Lý Nhà Hàng

---

## 📌 Liên Kết Nhanh

- [Mẫu Tính Năng](templates/FEATURE_DOCUMENTATION_TEMPLATE.md)
- [Lược Đồ Cơ Sở Dữ Liệu](architecture/DATABASE.md)
- [Hướng Dẫn Triển Khai](../deploy/README.md)
- [Triển Khai DigitalOcean (Tiếng Việt)](../deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md)
- [Trường Hợp Sử Dụng Kinh Doanh](architecture/BUSINESS_USE_CASES.md)
