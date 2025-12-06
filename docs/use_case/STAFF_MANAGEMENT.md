# Tài Liệu Chi Tiết Quản Lý Nhân Sự

> **Lưu ý**: Tài liệu này đã được cập nhật để phản ánh triển khai thực tế của hệ thống (06/2025).
> 
> **Thay đổi so với thiết kế ban đầu:**
> - Trạng thái nhân viên đơn giản: chỉ có `isActive` (true/false)
> - Chưa triển khai: Chấm công (Timesheet), Xếp ca làm việc (Shift scheduling), Đánh giá hiệu suất phức tạp (Performance review), Gửi email thông báo
> - Performance API hiện tại tính dựa trên số Orders và doanh thu phục vụ

## 1. Giới Thiệu

Hệ thống quản lý nhân sự là module quan trọng giúp quản lý nguồn nhân lực của nhà hàng. Trong phiên bản hiện tại, hệ thống tập trung vào việc quản lý thông tin cơ bản và phân quyền truy cập.

---

## 2. Các Thành Phần Chính

### 2.1 Tài Khoản (Accounts)

-   **Định nghĩa**: Thông tin đăng nhập và xác thực của nhân viên
-   **Mục đích**: Quản lý truy cập hệ thống
-   **Thông tin chứa**:
    -   Tên đăng nhập (Username)
    -   Email
    -   Số điện thoại (Phone Number)
    -   Mật khẩu (Password - bcrypt hash)
    -   Trạng thái hoạt động (Active/Inactive)
    -   Lần đăng nhập cuối (Last Login)

### 2.2 Nhân Viên (Staff)

-   **Định nghĩa**: Thông tin chi tiết về nhân viên
-   **Mục đích**: Quản lý hồ sơ nhân viên
-   **Thông tin chứa**:
    -   Tài khoản liên kết (Account) - quan hệ 1-1
    -   Họ tên đầy đủ (Full Name)
    -   Địa chỉ (Address) - tùy chọn
    -   Ngày sinh (Date of Birth) - tùy chọn
    -   Ngày vào làm (Hire Date)
    -   Lương (Salary) - tùy chọn
    -   Vai trò (Role): admin, manager, waiter, chef, cashier
    -   Trạng thái (isActive: true/false)

### 2.3 Vai Trò và Quyền Hạn (Roles & Permissions)

-   **admin**: Toàn quyền quản lý hệ thống
-   **manager**: Quản lý nhà hàng, xem báo cáo, quản lý nhân viên (trừ tạo/xóa)
-   **waiter**: Nhân viên phục vụ, tạo đơn hàng, quản lý reservation
-   **chef**: Đầu bếp, xem/xử lý đơn bếp
-   **cashier**: Thu ngân, xử lý thanh toán, xem bills

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Tài Khoản Nhân Viên

#### 3.1.1 Tạo Tài Khoản Nhân Viên Mới

**Mục tiêu**: Tạo tài khoản đăng nhập cho nhân viên mới

**Người tham gia chính**: Admin, Manager

**Điều kiện tiên quyết**:

-   Người dùng có quyền "Quản lý nhân viên"
-   Email và username chưa tồn tại trong hệ thống

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Nhân Viên"
2. **Bước 2**: Nhấn nút "Thêm Nhân Viên Mới"
3. **Bước 3**: Điền thông tin tài khoản:
    - **Username**: Tên đăng nhập (duy nhất)
    - **Email**: Email công việc (duy nhất)
    - **Số điện thoại**: SĐT liên hệ (duy nhất)
    - **Mật khẩu tạm**: Mật khẩu ban đầu
4. **Bước 4**: Điền thông tin nhân viên:
    - **Họ tên**: Họ và tên đầy đủ
    - **Ngày sinh**: Ngày/tháng/năm sinh
    - **Địa chỉ**: Địa chỉ thường trú
    - **Ngày vào làm**: Ngày bắt đầu làm việc
    - **Vai trò**: Chọn vai trò phù hợp
    - **Lương**: Mức lương cơ bản (tùy chọn)
5. **Bước 5**: Hệ thống kiểm tra:
    - Username có duy nhất không
    - Email có duy nhất không
    - Số điện thoại có duy nhất không
    - Dữ liệu có hợp lệ không
6. **Bước 6**: Nếu hợp lệ, tạo tài khoản và hồ sơ nhân viên
7. **Bước 7**: Mã hóa mật khẩu trước khi lưu
8. **Bước 8**: Gửi email thông báo cho nhân viên:
    - Username
    - Mật khẩu tạm
    - Link đăng nhập
    - Hướng dẫn đổi mật khẩu
9. **Bước 9**: Ghi log tạo nhân viên
10. **Bước 10**: Hiển thị thông báo thành công

**Xử lý lỗi**:

-   Username đã tồn tại: "Username đã được sử dụng"
-   Email đã tồn tại: "Email đã được đăng ký"
-   Số điện thoại đã tồn tại: "Số điện thoại đã được sử dụng"
-   Dữ liệu không hợp lệ: "Vui lòng kiểm tra lại thông tin"

**Ghi log**:

-   Người tạo: [admin_username]
-   Hành động: Tạo nhân viên
-   Username: [new_username]
-   Email: [email]
-   Vai trò: [role]
-   Thời gian: [timestamp]

---

#### 3.1.2 Xem Danh Sách Nhân Viên

**Mục tiêu**: Xem toàn bộ nhân viên trong hệ thống

**Người tham gia chính**: Admin, Manager

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Nhân Viên"
2. **Bước 2**: Hệ thống hiển thị danh sách nhân viên:
    - Ảnh đại diện
    - Họ tên
    - Username
    - Email
    - Số điện thoại
    - Vai trò
    - Trạng thái (Active/Inactive)
    - Ngày vào làm
    - Nút hành động (Xem, Sửa, Khóa/Mở khóa)
3. **Bước 3**: Tính năng lọc:
    - Vai trò (Admin, Manager, Waiter, Chef, Cashier)
    - Trạng thái (Active, Inactive)
    - Ngày vào làm (Mới nhất, Cũ nhất)
4. **Bước 4**: Tìm kiếm theo:
    - Họ tên
    - Username
    - Email
    - Số điện thoại
5. **Bước 5**: Sắp xếp theo:
    - Họ tên (A-Z)
    - Ngày vào làm (Mới - Cũ)
    - Vai trò

---

#### 3.1.3 Xem Chi Tiết Nhân Viên

**Mục tiêu**: Xem thông tin đầy đủ của một nhân viên

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách nhân viên, nhấn "Xem chi tiết"
2. **Bước 2**: Hiển thị thông tin:

**Thông tin cá nhân**:
    - Ảnh đại diện
    - Họ tên đầy đủ
    - Ngày sinh
    - Địa chỉ
    - Email
    - Số điện thoại

**Thông tin công việc**:
    - Username
    - Vai trò
    - Ngày vào làm
    - Lương cơ bản
    - Trạng thái (Active/Inactive)
    - Lần đăng nhập cuối

**Lịch sử làm việc**:
    - Tổng số ca làm
    - Tổng giờ làm việc
    - Số đơn hàng xử lý
    - Đánh giá trung bình

**Quyền hạn**:
    - Danh sách quyền theo vai trò
    - Quyền đặc biệt (nếu có)

3. **Bước 3**: Hiển thị các nút hành động:
    - Chỉnh sửa thông tin
    - Đổi vai trò
    - Đổi mật khẩu
    - Khóa/Mở khóa tài khoản
    - Xem báo cáo hiệu suất

---

#### 3.1.4 Chỉnh Sửa Thông Tin Nhân Viên

**Mục tiêu**: Cập nhật thông tin nhân viên

**Người tham gia chính**: Admin, Manager

**Điều kiện tiên quyết**:

-   Nhân viên tồn tại
-   Người dùng có quyền chỉnh sửa

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết nhân viên, nhấn "Chỉnh sửa"
2. **Bước 2**: Mở form chỉnh sửa với thông tin hiện tại
3. **Bước 3**: Cập nhật thông tin cho phép:
    - Họ tên
    - Ngày sinh
    - Địa chỉ
    - Số điện thoại (kiểm tra duy nhất)
    - Lương
    - Vai trò (cần quyền Admin)
4. **Bước 4**: Các trường không cho sửa:
    - Username
    - Email (cần quy trình riêng)
    - Ngày vào làm (cần quyền Admin)
5. **Bước 5**: Hệ thống kiểm tra dữ liệu
6. **Bước 6**: Lưu thay đổi
7. **Bước 7**: Ghi log thay đổi
8. **Bước 8**: Thông báo thành công

**Ghi log thay đổi**:

-   Người sửa: [editor_username]
-   Nhân viên: [staff_username]
-   Trường thay đổi: [field_name]
-   Giá trị cũ: [old_value]
-   Giá trị mới: [new_value]
-   Thời gian: [timestamp]

---

#### 3.1.5 Đổi Vai Trò Nhân Viên

**Mục tiêu**: Thay đổi vai trò và quyền hạn của nhân viên

**Người tham gia chính**: Admin

**Điều kiện tiên quyết**:

-   Chỉ Admin mới có quyền đổi vai trò
-   Vai trò mới phải hợp lệ

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết nhân viên, nhấn "Đổi vai trò"
2. **Bước 2**: Chọn vai trò mới từ dropdown
3. **Bước 3**: Hiển thị so sánh quyền hạn:
    - Quyền hiện tại
    - Quyền mới
    - Sự khác biệt
4. **Bước 4**: Nhập lý do đổi vai trò (bắt buộc)
5. **Bước 5**: Xác nhận đổi vai trò
6. **Bước 6**: Hệ thống:
    - Cập nhật vai trò
    - Cập nhật quyền hạn
    - Ghi log
7. **Bước 7**: Thông báo cho nhân viên (qua email/notification)
8. **Bước 8**: Đăng xuất phiên hiện tại của nhân viên (nếu đang online)
9. **Bước 9**: Nhân viên đăng nhập lại với vai trò mới

**Ghi log**:

-   Admin: [admin_username]
-   Nhân viên: [staff_username]
-   Vai trò cũ: [old_role]
-   Vai trò mới: [new_role]
-   Lý do: [reason]
-   Thời gian: [timestamp]

---

#### 3.1.6 Khóa/Mở Khóa Tài Khoản

**Mục tiêu**: Vô hiệu hóa hoặc kích hoạt lại tài khoản nhân viên

**Người tham gia chính**: Admin, Manager

**Trường hợp khóa tài khoản**:

-   Nhân viên nghỉ việc
-   Nhân viên vi phạm quy định
-   Tạm thời nghỉ việc (nghỉ thai sản, nghỉ dài hạn)

**Quy trình chi tiết (Khóa tài khoản)**:

1. **Bước 1**: Từ danh sách hoặc chi tiết nhân viên, nhấn "Khóa tài khoản"
2. **Bước 2**: Hiển thị hộp thoại xác nhận:
    - "Bạn có chắc chắn muốn khóa tài khoản [username]?"
    - Nhập lý do (bắt buộc):
        - Nghỉ việc
        - Vi phạm quy định
        - Nghỉ dài hạn
        - Khác (nhập lý do)
3. **Bước 3**: Xác nhận khóa
4. **Bước 4**: Hệ thống:
    - Cập nhật isActive = false
    - Đăng xuất tất cả phiên của nhân viên
    - Vô hiệu hóa tất cả refresh token
    - Ghi log
5. **Bước 5**: Thông báo cho nhân viên (nếu không phải nghỉ việc)
6. **Bước 6**: Nhân viên không thể đăng nhập

**Quy trình chi tiết (Mở khóa tài khoản)**:

1. Từ danh sách nhân viên bị khóa, nhấn "Mở khóa"
2. Nhập lý do mở khóa
3. Xác nhận
4. Cập nhật isActive = true
5. Gửi email thông báo cho nhân viên
6. Nhân viên có thể đăng nhập lại

**Ghi log**:

-   Người thực hiện: [admin_username]
-   Nhân viên: [staff_username]
-   Hành động: Khóa/Mở khóa
-   Lý do: [reason]
-   Thời gian: [timestamp]

---

#### 3.1.7 Đổi Mật Khẩu

**Mục tiêu**: Thay đổi mật khẩu đăng nhập

**Người tham gia chính**: Bản thân nhân viên, Admin

**Trường hợp 1: Nhân viên tự đổi mật khẩu**

1. Đăng nhập vào hệ thống
2. Vào "Cài đặt tài khoản"
3. Chọn "Đổi mật khẩu"
4. Nhập mật khẩu hiện tại
5. Nhập mật khẩu mới (ít nhất 8 ký tự)
6. Xác nhận mật khẩu mới
7. Hệ thống kiểm tra:
    - Mật khẩu hiện tại đúng không
    - Mật khẩu mới đủ mạnh không
    - Mật khẩu mới không trùng mật khẩu cũ
8. Lưu mật khẩu mới (mã hóa)
9. Đăng xuất tất cả phiên khác
10. Gửi email xác nhận đổi mật khẩu

**Trường hợp 2: Admin reset mật khẩu**

1. Admin vào chi tiết nhân viên
2. Nhấn "Reset mật khẩu"
3. Xác nhận reset
4. Hệ thống tạo mật khẩu mới tạm thời
5. Gửi mật khẩu mới qua email cho nhân viên
6. Nhân viên phải đổi mật khẩu lần đầu đăng nhập

---

### 3.2 Quản Lý Ca Làm Việc và Chấm Công

#### 3.2.1 Xếp Ca Làm Việc

**Mục tiêu**: Phân công nhân viên vào các ca làm việc

**Người tham gia chính**: Manager

**Các ca làm việc**:

-   **Ca Sáng**: 6:00 - 14:00
-   **Ca Chiều**: 14:00 - 22:00
-   **Ca Tối**: 22:00 - 6:00 (ca đêm)
-   **Ca Toàn Ngày**: 8:00 - 22:00

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Ca Làm"
2. **Bước 2**: Chọn ngày/tuần cần xếp ca
3. **Bước 3**: Xem danh sách nhân viên có sẵn
4. **Bước 4**: Chọn ca làm việc
5. **Bước 5**: Chọn nhân viên cho ca:
    - Kéo thả nhân viên vào ca
    - Hoặc chọn từ dropdown
6. **Bước 6**: Hệ thống kiểm tra:
    - Nhân viên có sẵn không (không trùng ca khác)
    - Số giờ làm trong tuần có vượt quá không
    - Ca có đủ nhân viên chưa (tối thiểu)
7. **Bước 7**: Lưu lịch ca làm
8. **Bước 8**: Gửi thông báo cho nhân viên:
    - Email
    - SMS
    - Push notification
9. **Bước 9**: Nhân viên xác nhận ca làm

**Ghi chú**:

-   Mỗi nhân viên: Tối đa 40 giờ/tuần
-   Mỗi ca: Tối thiểu 2 nhân viên phục vụ
-   Cảnh báo nếu nhân viên làm quá nhiều ca liên tiếp

---

#### 3.2.2 Chấm Công

**Mục tiêu**: Ghi nhận giờ vào/ra của nhân viên

**Phương thức chấm công**:

-   **Vân tay**: Máy chấm công vân tay
-   **Mã QR**: Quét mã QR trên app
-   **Thẻ từ**: Quẹt thẻ nhân viên
-   **Thủ công**: Manager nhập giờ

**Quy trình chi tiết (Tự động)**:

1. Nhân viên đến nhà hàng
2. Chấm công vào (check-in):
    - Quét vân tay/thẻ/QR
    - Hệ thống ghi nhận thời gian
    - Hiển thị "Chào [Tên]. Ca làm: [Ca]"
3. Nhân viên làm việc
4. Kết thúc ca, chấm công ra (check-out):
    - Quét vân tay/thẻ/QR
    - Hệ thống ghi nhận thời gian
    - Tính tổng giờ làm việc
    - Hiển thị "Tạm biệt [Tên]. Giờ làm: [X] giờ"
5. Lưu bản ghi chấm công

**Xử lý ngoại lệ**:

-   **Quên chấm công**: Manager sửa thủ công
-   **Đến muộn**: Ghi nhận và cảnh báo
-   **Về sớm**: Cần lý do và xác nhận Manager
-   **Làm thêm giờ**: Tự động tính overtime

**Ghi log**:

-   Nhân viên: [staff_username]
-   Thời gian vào: [check_in_time]
-   Thời gian ra: [check_out_time]
-   Tổng giờ: [total_hours]
-   Ca làm: [shift]
-   Phương thức: [method]

---

### 3.3 Đánh Giá Hiệu Suất

#### 3.3.1 Đánh Giá Định Kỳ

**Mục tiêu**: Đánh giá hiệu suất làm việc của nhân viên

**Người tham gia chính**: Manager

**Chu kỳ đánh giá**:

-   Hàng tháng: Đánh giá ngắn hạn
-   Hàng quý: Đánh giá trung hạn
-   Hàng năm: Đánh giá tổng thể

**Tiêu chí đánh giá (cho Waiter)**:

-   **Thái độ phục vụ**: 1-5 sao
-   **Tốc độ phục vụ**: 1-5 sao
-   **Số đơn hàng xử lý**: Số lượng
-   **Đánh giá của khách**: Trung bình
-   **Tuân thủ quy định**: Có/Không
-   **Làm việc nhóm**: 1-5 sao

**Quy trình chi tiết**:

1. **Bước 1**: Vào đầu mỗi kỳ đánh giá
2. **Bước 2**: Hệ thống tự động tập hợp dữ liệu:
    - Số giờ làm việc
    - Số đơn hàng xử lý
    - Đánh giá từ khách
    - Số lần đến muộn/về sớm
    - Số lần vi phạm
3. **Bước 3**: Manager xem báo cáo tự động
4. **Bước 4**: Manager đánh giá thủ công:
    - Đánh giá từng tiêu chí
    - Nhập nhận xét
    - Đề xuất cải thiện
5. **Bước 5**: Lưu đánh giá
6. **Bước 6**: Gặp nhân viên 1-1:
    - Thảo luận kết quả
    - Lắng nghe phản hồi
    - Đặt mục tiêu cải thiện
7. **Bước 7**: Nhân viên xác nhận đã nhận đánh giá
8. **Bước 8**: Ghi log đánh giá

---

### 3.4 Báo Cáo và Phân Tích

#### 3.4.1 Báo Cáo Nhân Sự

**Các loại báo cáo**:

1. **Báo cáo tổng quan nhân sự**:
    - Tổng số nhân viên
    - Phân bổ theo vai trò
    - Nhân viên active/inactive
    - Độ tuổi trung bình
    - Thâm niên trung bình

2. **Báo cáo chấm công**:
    - Tổng giờ làm việc
    - Số ca làm
    - Đến muộn/về sớm
    - Overtime
    - Nghỉ phép

3. **Báo cáo hiệu suất**:
    - Top nhân viên xuất sắc
    - Nhân viên cần cải thiện
    - Đánh giá trung bình
    - Xu hướng hiệu suất

4. **Báo cáo lương**:
    - Tổng lương phải trả
    - Chi tiết theo nhân viên
    - Phân bổ theo vai trò
    - So sánh các tháng

---

## 4. Quy Trình Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│          QUẢN LÝ NHÂN SỰ - QUY TRÌNH TỔNG              │
└─────────────────────────────────────────────────────────┘

1. TUYỂN DỤNG
   └─ Admin/Manager tạo tài khoản nhân viên mới
      ├─ Nhập thông tin cá nhân
      ├─ Gán vai trò và quyền hạn
      └─ Gửi thông tin đăng nhập

2. ONBOARDING
   ├─ Nhân viên nhận email
   ├─ Đăng nhập lần đầu
   ├─ Đổi mật khẩu
   └─ Hoàn tất hồ sơ

3. PHÂN CÔNG CÔNG VIỆC
   ├─ Manager xếp lịch ca làm
   ├─ Gửi thông báo cho nhân viên
   └─ Nhân viên xác nhận ca

4. CHẤM CÔNG HÀNG NGÀY
   ├─ Nhân viên check-in đầu ca
   ├─ Làm việc theo phân công
   └─ Nhân viên check-out cuối ca

5. ĐÁNH GIÁ ĐỊNH KỲ
   ├─ Hệ thống tập hợp dữ liệu
   ├─ Manager đánh giá
   ├─ Gặp 1-1 với nhân viên
   └─ Lưu kết quả đánh giá

6. QUẢN LÝ VÀ ĐIỀU CHỈNH
   ├─ Đổi vai trò (nếu cần)
   ├─ Tăng lương (theo hiệu suất)
   ├─ Đào tạo và phát triển
   └─ Khen thưởng/kỷ luật

7. KẾT THÚC (NẾU CÓ)
   ├─ Nhân viên nghỉ việc
   ├─ Admin khóa tài khoản
   ├─ Thanh toán lương cuối cùng
   └─ Lưu trữ hồ sơ
```

---

## 5. Các Tác Nhân (Actors) và Quyền Hạn

| Tác Nhân    | Tạo NV | Xem | Sửa | Xóa | Đổi vai trò | Khóa TK | Xếp ca | Chấm công | Đánh giá |
| ----------- | ------ | --- | --- | --- | ----------- | ------- | ------ | --------- | -------- |
| Admin       | ✓      | ✓   | ✓   | ✓   | ✓           | ✓       | ✓      | ✓         | ✓        |
| Manager     | ✓      | ✓   | ✓   | ✗   | ✗           | ✓       | ✓      | ✓         | ✓        |
| Nhân viên   | ✗      | ✓*  | ✓*  | ✗   | ✗           | ✗       | ✗      | ✓*        | ✗        |

*Chỉ với thông tin của chính mình

---

## 6. Công Nghệ và Công Cụ

### 6.1 Công Nghệ Sử Dụng (Triển khai thực tế)

-   **Frontend**: Next.js 15, React, TypeScript, Zustand
-   **Backend**: NestJS (Node.js), TypeScript
-   **Database**: PostgreSQL, Prisma ORM
-   **Authentication**: JWT (Access Token 15 phút, Refresh Token 7 ngày), bcrypt
-   **API Documentation**: Swagger/OpenAPI

### 6.2 API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/staff` | Danh sách nhân viên (phân trang) | admin, manager |
| GET | `/staff/available-accounts` | Accounts chưa có staff | admin, manager |
| GET | `/staff/role/:role` | Nhân viên theo vai trò | admin, manager |
| GET | `/staff/:id` | Chi tiết nhân viên | all |
| GET | `/staff/:id/performance` | Hiệu suất nhân viên | admin, manager |
| POST | `/staff` | Tạo nhân viên mới | admin |
| PUT | `/staff/:id` | Cập nhật nhân viên | admin |
| PATCH | `/staff/:id/deactivate` | Vô hiệu hóa | admin, manager |
| PATCH | `/staff/:id/activate` | Kích hoạt lại | admin, manager |
| PATCH | `/staff/:id/role` | Đổi vai trò | admin |
| DELETE | `/staff/:id` | Xóa nhân viên | admin |

---

## 7. Bảng Tóm Tắt Lỗi và Xử Lý

| Lỗi                       | Nguyên Nhân           | Cách Xử Lý                           |
| ------------------------- | --------------------- | ------------------------------------ |
| Username đã tồn tại       | Username trùng        | Chọn username khác                   |
| Email đã tồn tại          | Email đã đăng ký      | Sử dụng email khác                   |
| Không thể đổi vai trò     | Không có quyền        | Chỉ Admin mới đổi được               |
| Staff not found           | ID không tồn tại      | Kiểm tra lại ID                      |
| Account already has staff | Account đã có profile | Dùng account khác hoặc xóa staff cũ  |

---

## 8. Tính Năng Phát Triển Tương Lai

> Các tính năng sau đây được thiết kế nhưng chưa triển khai trong phiên bản hiện tại:

-   **Attendance/Timesheet**: Chấm công vào/ra, tính giờ làm
-   **Shift Scheduling**: Xếp ca làm việc, thông báo ca
-   **Performance Review**: Đánh giá hiệu suất định kỳ
-   **Email Notifications**: Gửi email thông báo (welcome, shift changes)
-   **AI Scheduling**: Tự động xếp ca tối ưu
-   **Training Management**: Quản lý đào tạo
-   **Leave Management**: Quản lý nghỉ phép
-   **Payroll Integration**: Tính lương tự động
-   **Biometric Integration**: Chấm công vân tay/khuôn mặt
-   **Mobile App**: App chấm công và xem lịch

---

## 9. Lưu Ý Quan Trọng

1. **Bảo mật**: Bảo vệ thông tin cá nhân nhân viên
2. **Tuân thủ**: Tuân thủ luật lao động
3. **Công bằng**: Đánh giá công bằng, khách quan
4. **Minh bạch**: Quy trình rõ ràng, công khai
5. **Backup**: Sao lưu dữ liệu nhân sự thường xuyên
6. **Privacy**: Chỉ người có quyền mới xem được thông tin nhạy cảm
7. **Communication**: Giao tiếp rõ ràng với nhân viên
8. **Flexibility**: Linh hoạt trong quản lý ca làm
9. **Recognition**: Ghi nhận và khen thưởng kịp thời
10. **Development**: Tạo cơ hội phát triển cho nhân viên

---

## 10. Kết Luận

Hệ thống quản lý nhân sự giúp tối ưu hóa việc sử dụng nguồn nhân lực, tăng năng suất và cải thiện chất lượng phục vụ. Một hệ thống tốt giúp:

-   **Quản lý hiệu quả**: Theo dõi và quản lý nhân viên dễ dàng
-   **Tối ưu ca làm**: Phân công hợp lý, tránh thiếu hụt
-   **Đánh giá chính xác**: Dữ liệu khách quan cho đánh giá
-   **Động viên nhân viên**: Ghi nhận và khen thưởng kịp thời
-   **Giảm chi phí**: Tối ưu giờ làm, giảm overtime không cần thiết

Tài liệu này cung cấp hướng dẫn toàn diện cho việc phát triển, triển khai và sử dụng hệ thống quản lý nhân sự.
