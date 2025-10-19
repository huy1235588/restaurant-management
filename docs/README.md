# 📚 Tài liệu Dự án - Restaurant Management System

> Tổng hợp tài liệu kỹ thuật cho hệ thống quản lý nhà hàng

## 📑 Danh sách Tài liệu

### 1. 📊 [DATABASE.md](./DATABASE.md) - Tài liệu Cơ sở dữ liệu
**Nội dung chính**:
- Tổng quan về cấu trúc database PostgreSQL
- Sơ đồ ERD (Entity Relationship Diagram)
- Chi tiết 13 bảng trong hệ thống
- Định nghĩa các ENUM types
- Mối quan hệ giữa các bảng
- Chiến lược đánh chỉ mục
- Các truy vấn thường dùng
- Best practices và tối ưu hóa

**Phù hợp cho**: Database Administrators, Backend Developers, System Analysts

---

### 2. 📐 [DATABASE_ERD.mmd](./DATABASE_ERD.mmd) - Sơ đồ ERD (Mermaid)
**Nội dung chính**:
- Sơ đồ ERD dạng Mermaid diagram
- Có thể render trực tiếp trên GitHub
- Hiển thị mối quan hệ giữa các bảng
- Chi tiết các trường và ràng buộc

**Cách sử dụng**:
- Xem trực tiếp trên GitHub (tự động render)
- Sử dụng với Mermaid Live Editor: https://mermaid.live/
- Import vào các công cụ hỗ trợ Mermaid

**Phù hợp cho**: Visual learners, Documentation, Presentations

---

### 3. 🔍 [DATABASE_QUERIES.sql](./DATABASE_QUERIES.sql) - Ví dụ Truy vấn SQL
**Nội dung chính**:
- 50+ truy vấn SQL thực tế
- Các truy vấn được phân loại theo chức năng:
  - Quản lý đơn hàng
  - Quản lý bàn & đặt bàn
  - Doanh thu & báo cáo tài chính
  - Hiệu suất nhân viên
  - Quản lý thực đơn
  - Quản lý bếp
  - Phân tích & báo cáo
  - Database maintenance
- Có giải thích và ví dụ cụ thể

**Cách sử dụng**:
```bash
# Chạy toàn bộ file
psql -U postgres -d restaurant_db -f DATABASE_QUERIES.sql

# Hoặc copy từng query cần thiết
```

**Phù hợp cho**: Backend Developers, Database Administrators, Data Analysts

---

### 4. 🐳 [DOCKER.md](./DOCKER.md) - Hướng dẫn Docker
**Nội dung chính**:
- Cách deploy bằng Docker
- Docker Compose configuration
- Commands reference
- Development workflow
- Production deployment
- Troubleshooting
- Performance optimization

**Phù hợp cho**: DevOps, System Administrators, Developers

---

## 🎯 Quick Start

### Cho Database Administrators
1. Đọc [DATABASE.md](./DATABASE.md) để hiểu cấu trúc database
2. Xem [DATABASE_ERD.mmd](./DATABASE_ERD.mmd) để nắm mối quan hệ
3. Sử dụng [DATABASE_QUERIES.sql](./DATABASE_QUERIES.sql) cho các tác vụ thường gặp

### Cho Backend Developers
1. Xem Prisma schema tại `/server/prisma/schema.prisma`
2. Đọc phần "Chi tiết Bảng" trong [DATABASE.md](./DATABASE.md)
3. Tham khảo queries trong [DATABASE_QUERIES.sql](./DATABASE_QUERIES.sql)

### Cho Frontend Developers
1. Xem API documentation (sẽ bổ sung)
2. Hiểu data flow qua [DATABASE_ERD.mmd](./DATABASE_ERD.mmd)
3. Tham khảo các truy vấn báo cáo trong [DATABASE_QUERIES.sql](./DATABASE_QUERIES.sql)

### Cho DevOps Engineers
1. Đọc [DOCKER.md](./DOCKER.md) cho deployment
2. Setup database theo [DATABASE.md](./DATABASE.md)
3. Monitoring và maintenance queries trong [DATABASE_QUERIES.sql](./DATABASE_QUERIES.sql)

---

## �� Cập nhật Tài liệu

### Version Control
- Tất cả tài liệu được quản lý bằng Git
- Mỗi lần thay đổi schema cần cập nhật:
  - `DATABASE.md` - Chi tiết bảng mới/thay đổi
  - `DATABASE_ERD.mmd` - Cập nhật sơ đồ ERD
  - `DATABASE_QUERIES.sql` - Thêm queries mới nếu cần

### Quy trình Cập nhật
1. Thay đổi Prisma schema
2. Run migration: `pnpm prisma migrate dev`
3. Cập nhật tài liệu tương ứng
4. Commit tất cả thay đổi cùng nhau

---

## 📚 Tài liệu Khác

### Trong Repository
- [README.md](../README.md) - Tổng quan dự án
- [/server/prisma/schema.prisma](../server/prisma/schema.prisma) - Prisma schema
- [/server/prisma/migrations/](../server/prisma/migrations/) - Migration history

### External Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Mermaid Documentation](https://mermaid.js.org/)

---

## 🤝 Đóng góp

Nếu bạn tìm thấy lỗi hoặc muốn cải thiện tài liệu:

1. Fork repository
2. Tạo branch mới: `git checkout -b docs/improve-database-docs`
3. Commit changes: `git commit -m 'docs: improve database documentation'`
4. Push: `git push origin docs/improve-database-docs`
5. Tạo Pull Request

---

## 📞 Liên hệ

- **Repository**: https://github.com/huy1235588/restaurant-management
- **Issues**: [GitHub Issues](https://github.com/huy1235588/restaurant-management/issues)
- **Author**: @huy1235588

---

**Cập nhật lần cuối**: 2025-10-19
