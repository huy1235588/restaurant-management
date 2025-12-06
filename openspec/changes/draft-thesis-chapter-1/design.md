# Design: Cấu trúc và tổ chức nội dung Chương 1

## Context

Chương 1 "Tổng quan" là phần mở đầu của báo cáo đồ án tốt nghiệp, cần tuân thủ quy định trình bày của Trường Cao đẳng Bách Khoa Sài Gòn. Nội dung được chia thành các file Markdown riêng biệt để dễ quản lý và chỉnh sửa, sau đó sẽ được tổng hợp vào file Word cuối cùng.

## Goals

- Tạo cấu trúc file rõ ràng, dễ bảo trì
- Viết nội dung theo văn phong học thuật, chuyên nghiệp
- Hạn chế tối đa từ tiếng Anh khi có từ Việt tương đương
- Đặt placeholder hình ảnh với mô tả chi tiết

## Non-Goals

- Không tạo file Word hoàn chỉnh (sẽ thực hiện thủ công sau)
- Không bao gồm hình ảnh thực tế (chỉ placeholder)

## Decisions

### Quyết định 1: Cấu trúc thư mục

Chương 1 sẽ được tổ chức như sau:

```
docs/reports/thesis/chapter_1/
├── _index.md              # Trang tổng hợp và mục lục chương
├── 1.1-dat-van-de.md      # Đặt vấn đề và bối cảnh nghiên cứu
├── 1.2-doi-tuong-pham-vi.md   # Đối tượng và phạm vi nghiên cứu
├── 1.3-y-nghia.md         # Ý nghĩa khoa học và thực tiễn
├── 1.4-yeu-cau-he-thong.md    # Xác định yêu cầu hệ thống
├── 1.5-cong-nghe/         # Công nghệ sử dụng (thư mục con)
│   ├── _index.md          # Tổng quan công nghệ
│   ├── 1.5.1-nextjs.md    # Next.js và React
│   ├── 1.5.2-nestjs.md    # NestJS và Node.js
│   ├── 1.5.3-postgresql.md    # PostgreSQL và Prisma
│   ├── 1.5.4-websocket.md # WebSocket và Socket.IO
│   └── 1.5.5-jwt.md       # JWT Authentication
└── images/                # Thư mục chứa hình ảnh (để trống, chỉ có README)
    └── README.md          # Hướng dẫn thêm hình ảnh
```

**Lý do**: Chia nhỏ file giúp dễ chỉnh sửa từng phần, tránh xung đột khi làm việc nhóm, và cho phép tái sử dụng nội dung.

### Quyết định 2: Quy ước đặt tên file

- Tên file sử dụng tiền tố số thứ tự theo cấu trúc chương mục (1.1, 1.2, ...)
- Tên file viết thường, dùng dấu gạch ngang thay khoảng trắng
- Không dùng dấu tiếng Việt trong tên file

### Quyết định 3: Chuẩn nội dung Markdown

Mỗi file tuân theo cấu trúc:

```markdown
# [Số mục]. [Tên mục]

[Nội dung chính viết dạng đoạn văn, không liệt kê trừ khi cần thiết]

[Placeholder hình ảnh nếu có, định dạng:]
> **[HÌNH X.Y: Mô tả ngắn]**
> 
> *Yêu cầu*: Mô tả chi tiết hình ảnh cần chụp/tạo
> 
> *Nguồn*: Đường dẫn file/công cụ để tạo hình

[Tiểu mục nếu có]
## [Số tiểu mục]. [Tên tiểu mục]
```

### Quyết định 4: Quy ước thuật ngữ

Sử dụng tiếng Việt cho các thuật ngữ có thể dịch:

| Tiếng Anh | Tiếng Việt |
|-----------|------------|
| Waiter | Nhân viên phục vụ |
| Manager | Quản lý |
| Admin | Quản trị viên |
| Customer | Khách hàng |
| Chef | Đầu bếp |
| Cashier | Thu ngân |
| Order | Đơn hàng / Gọi món |
| Menu | Thực đơn |
| Bill | Hóa đơn |
| Table | Bàn |
| Reservation | Đặt bàn |
| Dashboard | Bảng điều khiển |
| Authentication | Xác thực |
| Authorization | Phân quyền |

Giữ nguyên tiếng Anh:
- API, REST, RESTful
- Framework, Library
- Database, ORM
- JWT (JSON Web Token)
- WebSocket
- Tên công nghệ: Next.js, NestJS, PostgreSQL, Prisma, Socket.IO

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Nội dung quá dài, khó đọc | Chia thành các file nhỏ, có tổng hợp ở `_index.md` |
| Placeholder hình ảnh bị bỏ qua | Mô tả chi tiết và đánh số rõ ràng |
| Văn phong không đồng nhất | Tuân theo quy ước thuật ngữ và mẫu câu |

## Open Questions

- Cần xác nhận với giảng viên về độ dài yêu cầu của Chương 1
- Số lượng hình ảnh tối thiểu/tối đa cho mỗi mục
