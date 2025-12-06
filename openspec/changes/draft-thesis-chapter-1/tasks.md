# Tasks: Triển khai nội dung Chương 1 báo cáo đồ án

## 1. Thiết lập cấu trúc thư mục
- [x] 1.1 Tạo thư mục `docs/reports/thesis/chapter_1/images/` với file README.md hướng dẫn
- [x] 1.2 Tạo thư mục `docs/reports/thesis/chapter_1/1.5-cong-nghe/`

## 2. Soạn thảo file tổng hợp
- [x] 2.1 Tạo file `_index.md` - Mục lục và tổng quan Chương 1

## 3. Soạn thảo mục 1.1 - Đặt vấn đề
- [x] 3.1 Tạo file `1.1-dat-van-de.md` với dàn ý và nội dung:
  - Bối cảnh ngành F&B tại Việt Nam
  - Thực trạng quản lý nhà hàng truyền thống
  - Mục tiêu nghiên cứu và câu hỏi đặt ra
  - So sánh các giải pháp hiện có trên thị trường
  - Placeholder: Biểu đồ tăng trưởng ngành F&B, Bảng so sánh phần mềm quản lý nhà hàng

## 4. Soạn thảo mục 1.2 - Đối tượng và phạm vi nghiên cứu
- [x] 4.1 Tạo file `1.2-doi-tuong-pham-vi.md` với dàn ý và nội dung:
  - Đối tượng nghiên cứu (hệ thống quản lý nhà hàng, quy trình nghiệp vụ)
  - Phạm vi đã triển khai (12 module frontend, 14 module backend)
  - Phạm vi chưa triển khai (kho, thanh toán online, mobile app)
  - Placeholder: Sơ đồ tổng quan hệ thống

## 5. Soạn thảo mục 1.3 - Ý nghĩa khoa học và thực tiễn
- [x] 5.1 Tạo file `1.3-y-nghia.md` với dàn ý và nội dung:
  - Ý nghĩa khoa học (kiến trúc phần mềm, công nghệ realtime, RESTful API)
  - Ý nghĩa thực tiễn (số hóa quy trình, tăng hiệu quả phục vụ)
  - Đóng góp của đồ án

## 6. Soạn thảo mục 1.4 - Xác định yêu cầu hệ thống
- [x] 6.1 Tạo file `1.4-yeu-cau-he-thong.md` với dàn ý và nội dung:
  - Yêu cầu chức năng theo từng module (Auth, Bàn, Thực đơn, Đặt bàn, Order, Bếp, Thanh toán, Nhân viên, Dashboard, Báo cáo, Cài đặt)
  - Yêu cầu phi chức năng (Bảo mật, Hiệu năng, Giao diện, Khả năng mở rộng)
  - Placeholder: Sơ đồ Use Case tổng quan

## 7. Soạn thảo mục 1.5 - Công nghệ sử dụng
- [x] 7.1 Tạo file `1.5-cong-nghe/_index.md` - Tổng quan công nghệ và lý do lựa chọn
- [x] 7.2 Tạo file `1.5-cong-nghe/1.5.1-nextjs.md` - Next.js và React
  - Giới thiệu framework, ưu điểm, cách áp dụng trong dự án
  - Placeholder: Logo Next.js, Sơ đồ kiến trúc frontend
- [x] 7.3 Tạo file `1.5-cong-nghe/1.5.2-nestjs.md` - NestJS và Node.js
  - Giới thiệu framework, ưu điểm, cách áp dụng trong dự án
  - Placeholder: Logo NestJS, Sơ đồ kiến trúc backend
- [x] 7.4 Tạo file `1.5-cong-nghe/1.5.3-postgresql.md` - PostgreSQL và Prisma
  - Giới thiệu database, ORM, cách áp dụng trong dự án
  - Placeholder: Logo PostgreSQL, Prisma, Sơ đồ ERD tổng quan
- [x] 7.5 Tạo file `1.5-cong-nghe/1.5.4-websocket.md` - WebSocket và Socket.IO
  - Giới thiệu giao thức, thư viện, cách áp dụng cho Kitchen Display
  - Placeholder: Sơ đồ luồng WebSocket
- [x] 7.6 Tạo file `1.5-cong-nghe/1.5.5-jwt.md` - JWT Authentication
  - Giới thiệu cơ chế xác thực, cách áp dụng Access Token + Refresh Token
  - Placeholder: Sơ đồ luồng xác thực

## 8. Rà soát và hoàn thiện
- [ ] 8.1 Kiểm tra văn phong học thuật, sửa các lỗi diễn đạt
- [ ] 8.2 Kiểm tra tính nhất quán thuật ngữ (tiếng Việt vs tiếng Anh)
- [ ] 8.3 Đánh số hình ảnh và placeholder theo đúng quy định (HÌNH 1.1, 1.2, ...)
- [ ] 8.4 Kiểm tra tham chiếu đến source code và tài liệu dự án

## Dependencies

- Task 1.x phải hoàn thành trước các task khác
- Task 2.1 có thể làm song song với Task 3-7
- Task 7.2-7.6 có thể làm song song
- Task 8.x phải làm cuối cùng sau khi hoàn thành tất cả nội dung
