# Proposal: Implement Reservation System

## Why

Hệ thống quản lý nhà hàng hiện tại thiếu chức năng đặt bàn trực tuyến, một tính năng thiết yếu cho trải nghiệm khách hàng hiện đại và tối ưu hóa việc sử dụng tài nguyên nhà hàng. Khách hàng phải gọi điện thoại hoặc đến trực tiếp để đặt bàn, gây bất tiện và tăng tải công việc cho nhân viên. Việc triển khai hệ thống đặt bàn sẽ:

- **Tăng trải nghiệm khách hàng**: Cho phép đặt bàn 24/7 qua web/app
- **Tối ưu sử dụng bàn**: Quản lý lịch đặt bàn, tránh double-booking, tối đa hóa sức chứa
- **Giảm tải nhân viên**: Tự động hóa quy trình đặt bàn, xác nhận, và theo dõi trạng thái
- **Cải thiện báo cáo**: Thống kê tỷ lệ đặt bàn, no-show, xu hướng giờ cao điểm

Đây là đồ án tốt nghiệp nên phạm vi được đơn giản hóa để phù hợp với thời gian và nguồn lực, loại bỏ các tính năng phức tạp như thanh toán đặt cọc, tích hợp SMS/Email thực, QR code, và thuật toán gợi ý bàn AI.

## What Changes

### Core Features
- **Quản lý đặt bàn cơ bản**:
  - Tạo, xem, sửa, hủy đặt bàn
  - Xác nhận đặt bàn (pending → confirmed)
  - Check-in khách đến (confirmed → seated)
  - Đánh dấu hoàn tất (seated → completed)
  - Đánh dấu no-show (pending/confirmed → no_show)
  
- **Kiểm tra bàn trống**:
  - Lọc bàn theo sức chứa, tầng, khu vực
  - Kiểm tra trạng thái bàn trong khung giờ cụ thể
  - Hiển thị danh sách bàn khả dụng (list/grid view)
  
- **Quản lý khách hàng**:
  - Tự động tạo/liên kết customer từ thông tin đặt bàn
  - Theo dõi lịch sử đặt bàn của khách
  - Ghi nhận khách no-show nhiều lần
  
- **Audit trail**:
  - Ghi log mọi thay đổi trạng thái đặt bàn
  - Lưu lịch sử chỉnh sửa và người thực hiện

### Simplified Features (Đồ án học tập)
- **Không có thanh toán đặt cọc**: Bỏ `depositAmount` logic, chỉ lưu trữ không xử lý
- **Không có SMS/Email thực**: Chỉ giả lập thông báo UI, không tích hợp gateway
- **Không có QR Code**: Bỏ hoàn toàn, không sinh và quét mã QR
- **Không có thuật toán gợi ý AI**: Chỉ lọc bàn đơn giản theo điều kiện cơ bản
- **Hiển thị danh sách**: Không có sơ đồ bàn real-time phức tạp, chỉ list/grid view

### Database
- Sử dụng schema đã có: `reservations`, `reservation_audits`, `customers`, `restaurant_tables`
- Không thay đổi cấu trúc database, chỉ implement business logic

### Backend (Express + TypeScript)
- RESTful API cho CRUD đặt bàn
- Validation với Zod
- Logic kiểm tra bàn trống (tính toán thời gian overlap)
- Quản lý trạng thái lifecycle (pending → confirmed → seated → completed/no_show)
- Audit logging tự động

### Frontend (Next.js 16 + React 19)
- Module `reservations` theo chuẩn feature-based structure
- Danh sách đặt bàn với filter/search/pagination
- Form tạo/sửa đặt bàn với validation
- Màn hình check-in khách hàng
- Báo cáo đặt bàn cơ bản (thống kê theo status, ngày, no-show rate)

### Testing Scope
- Manual testing qua demonstration (phù hợp đồ án)
- Không yêu cầu automated tests, CI/CD

## Impact

### Affected Specs
- **NEW**: `reservation-management` - Quản lý đặt bàn (new capability)

### Affected Code
**Backend (`app/server/src/`):**
- `features/reservations/` - New feature module
  - `reservations.controller.ts`
  - `reservations.service.ts`
  - `reservations.validation.ts`
  - `reservations.types.ts`
- `routes/` - Add reservation routes
- Database schema: Use existing `reservations`, `reservation_audits`, `customers` tables

**Frontend (`app/client/src/`):**
- `modules/reservations/` - New module
  - `components/` - ReservationCard, ReservationList, TableAvailability
  - `views/` - ReservationListView, ReservationDetailView
  - `dialogs/` - CreateReservationDialog, ConfirmDialog, CheckInDialog
  - `services/reservation.service.ts` - API calls
  - `hooks/useReservations.ts` - Data fetching hooks
  - `types/reservation.types.ts`
  - `utils/` - Date/time helpers
- `app/dashboard/reservations/` - App Router pages
- `locales/` - Translation keys for EN/VI

**Documentation:**
- `docs/use_case/RESERVATION_MANAGEMENT.md` - Existing, reference only
- `docs/api/RESERVATION_API_FRONTEND.md` - Existing, reference only

### Breaking Changes
- **None** - This is a new feature, no breaking changes to existing functionality

### Dependencies
- Existing: Prisma, Zod, date-fns, React Hook Form
- No new external dependencies required
- Real-time updates via Socket.io (optional enhancement, not required for MVP)

### Migration Plan
- No database migrations needed (schema already exists)
- Initial data seeding: Sample reservations for demonstration (optional)

### Risks
- **Overlap detection complexity**: Cần test kỹ logic kiểm tra bàn trống để tránh double-booking
- **Timezone handling**: Đảm bảo date/time xử lý đúng timezone Vietnam
- **No-show tracking**: Logic đơn giản, không có chính sách hoàn tiền phức tạp

### Success Criteria
- ✅ Khách hàng có thể đặt bàn qua web
- ✅ Nhân viên xem và quản lý đặt bàn hiệu quả
- ✅ Hệ thống tự động kiểm tra bàn trống, tránh double-booking
- ✅ Audit trail đầy đủ cho mọi thay đổi
- ✅ Báo cáo thống kê cơ bản (số đặt bàn, tỷ lệ no-show)
- ✅ Demo được đầy đủ các use case chính cho đồ án
