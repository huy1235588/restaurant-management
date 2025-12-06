## ADDED Requirements

### Requirement: Thesis Chapter 1 Documentation Structure

The documentation system SHALL provide a clear directory structure for Chapter 1 "Tổng quan" with Markdown files organized by section numbers.

#### Scenario: Tạo cấu trúc thư mục Chương 1
- **WHEN** người dùng truy cập thư mục `docs/reports/thesis/chapter_1/`
- **THEN** thư mục PHẢI chứa các file Markdown theo cấu trúc:
  - `_index.md` - Mục lục và tổng quan
  - `1.1-dat-van-de.md` - Đặt vấn đề
  - `1.2-doi-tuong-pham-vi.md` - Đối tượng và phạm vi
  - `1.3-y-nghia.md` - Ý nghĩa khoa học và thực tiễn
  - `1.4-yeu-cau-he-thong.md` - Yêu cầu hệ thống
  - Thư mục `1.5-cong-nghe/` chứa các file công nghệ
  - Thư mục `images/` với hướng dẫn

### Requirement: Academic Writing Style

The report content SHALL follow academic writing standards as required by Saigon Polytechnic College.

#### Scenario: Văn phong đoạn văn
- **WHEN** nội dung được viết
- **THEN** PHẢI sử dụng câu văn hoàn chỉnh với chủ ngữ - vị ngữ
- **AND** hạn chế sử dụng bullet points trừ khi liệt kê tính năng hoặc thông số kỹ thuật
- **AND** tránh các từ sáo rỗng như "trong bối cảnh hiện nay", "toàn diện", "tối ưu hóa trải nghiệm"

#### Scenario: Sử dụng tiếng Việt
- **WHEN** nội dung có thuật ngữ có thể dịch sang tiếng Việt
- **THEN** PHẢI sử dụng tiếng Việt (ví dụ: nhân viên phục vụ thay vì Waiter, đơn hàng thay vì Order)
- **AND** chỉ giữ nguyên tiếng Anh cho các thuật ngữ kỹ thuật không có từ Việt tương đương (API, Framework, Database, JWT, WebSocket)

### Requirement: Image Placeholders

The documentation SHALL include image placeholders with detailed descriptions to guide students in preparing illustrations.

#### Scenario: Định dạng placeholder hình ảnh
- **WHEN** một mục cần hình ảnh minh họa
- **THEN** PHẢI có placeholder với định dạng:
  - Số hiệu hình (HÌNH X.Y theo quy định đánh số)
  - Mô tả ngắn gọn nội dung hình
  - Yêu cầu chi tiết về hình ảnh cần tạo/chụp
  - Nguồn hoặc công cụ để tạo hình

#### Scenario: Đánh số hình ảnh
- **WHEN** hình ảnh được đánh số
- **THEN** số đầu tiên là số chương (1 cho Chương 1)
- **AND** số thứ hai là thứ tự hình trong chương

### Requirement: Content Sections for Chapter 1

Chapter 1 SHALL include all 5 main sections as required, with specific content for the "Restaurant Management System" project.

#### Scenario: Mục 1.1 Đặt vấn đề
- **WHEN** người dùng đọc mục 1.1
- **THEN** nội dung PHẢI trình bày:
  - Bối cảnh ngành F&B tại Việt Nam
  - Thực trạng quản lý nhà hàng truyền thống và hạn chế
  - Mục tiêu nghiên cứu của đồ án
  - So sánh các giải pháp phần mềm quản lý nhà hàng hiện có

#### Scenario: Mục 1.2 Đối tượng và phạm vi nghiên cứu
- **WHEN** người dùng đọc mục 1.2
- **THEN** nội dung PHẢI xác định rõ:
  - Đối tượng nghiên cứu (hệ thống quản lý nhà hàng, quy trình nghiệp vụ)
  - Phạm vi đã triển khai (các module đã hoàn thành)
  - Phạm vi chưa triển khai (các tính năng còn thiếu)

#### Scenario: Mục 1.3 Ý nghĩa khoa học và thực tiễn
- **WHEN** người dùng đọc mục 1.3
- **THEN** nội dung PHẢI nêu:
  - Ý nghĩa khoa học (kiến trúc phần mềm, công nghệ áp dụng)
  - Ý nghĩa thực tiễn (giá trị ứng dụng trong vận hành nhà hàng)

#### Scenario: Mục 1.4 Xác định yêu cầu hệ thống
- **WHEN** người dùng đọc mục 1.4
- **THEN** nội dung PHẢI liệt kê:
  - Yêu cầu chức năng theo từng module (dựa trên source code thực tế)
  - Yêu cầu phi chức năng (bảo mật, hiệu năng, giao diện, khả năng mở rộng)

#### Scenario: Mục 1.5 Công nghệ sử dụng
- **WHEN** người dùng đọc mục 1.5
- **THEN** nội dung PHẢI giới thiệu:
  - Các công nghệ frontend (Next.js, React, TailwindCSS)
  - Các công nghệ backend (NestJS, Node.js)
  - Database và ORM (PostgreSQL, Prisma)
  - Công nghệ realtime (WebSocket, Socket.IO)
  - Cơ chế xác thực (JWT)
  - Lý do lựa chọn từng công nghệ
