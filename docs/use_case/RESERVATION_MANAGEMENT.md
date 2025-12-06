# Tài Liệu Chi Tiết Quản Lý Đặt Bàn

> **Lưu ý**: Tài liệu này đã được cập nhật để phản ánh chính xác hệ thống đã triển khai thực tế (Tháng 6/2025).

## 1. Giới Thiệu

Hệ thống quản lý đặt bàn là một phần quan trọng của ứng dụng quản lý nhà hàng, cho phép khách hàng đặt trước bàn ăn và giúp nhà hàng tối ưu hóa việc sắp xếp chỗ ngồi. Hệ thống hỗ trợ quản lý lịch đặt bàn, xác nhận đặt chỗ, theo dõi trạng thái, và xử lý các tình huống đặc biệt như khách không đến hoặc thay đổi lịch hẹn.

---

## 2. Các Thành Phần Chính

### 2.1 Bàn Ăn (Restaurant Tables)

-   **Định nghĩa**: Các bàn ăn trong nhà hàng với thông tin về sức chứa và vị trí
-   **Mục đích**: Quản lý tài nguyên bàn ăn, tối ưu hóa sắp xếp chỗ ngồi
-   **Thông tin chứa**:
    -   Số bàn (Table Number)
    -   Tên bàn (Table Name)
    -   Sức chứa (Capacity)
    -   Sức chứa tối thiểu (Min Capacity)
    -   Tầng/Khu vực (Floor/Section)
    -   Trạng thái (Status)
    -   Mã QR (QR Code)
    -   Trạng thái hoạt động (Active/Inactive)

### 2.2 Đặt Bàn (Reservations)

-   **Định nghĩa**: Yêu cầu đặt trước bàn ăn của khách hàng
-   **Mục đích**: Đảm bảo chỗ ngồi cho khách, tối ưu hóa lịch phục vụ
-   **Thông tin chứa**:
    -   Mã đặt bàn (reservationCode) - Tự động sinh UUID
    -   Tên khách hàng (customerName)
    -   Số điện thoại (phoneNumber)
    -   Email (tùy chọn)
    -   Khách hàng liên kết (customerId - tùy chọn)
    -   Bàn đặt (tableId)
    -   Ngày đặt (reservationDate)
    -   Giờ đặt (reservationTime)
    -   Thời gian dự kiến (duration - mặc định 120 phút)
    -   Số lượng khách (partySize)
    -   Yêu cầu đặc biệt (specialRequest)
    -   Tiền đặt cọc (depositAmount)
    -   Trạng thái (status): `pending`, `confirmed`, `seated`, `completed`, `cancelled`, `no_show`
    -   Ghi chú (notes)
    -   Tags (mảng tag)
    -   Người tạo (createdBy)
    -   Các timestamp: confirmedAt, seatedAt, completedAt, cancelledAt
    -   Lý do hủy (cancellationReason)

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Bàn Ăn

#### 3.1.1 Tạo Bàn Mới

**Mục tiêu**: Thêm bàn ăn mới vào hệ thống

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Điều kiện tiên quyết**:

-   Người dùng có quyền "Quản lý Bàn"
-   Số bàn chưa tồn tại trong hệ thống

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng truy cập vào phần "Quản Lý Bàn"
2. **Bước 2**: Nhấn nút "Tạo Bàn Mới"
3. **Bước 3**: Điền thông tin:
    - **Số bàn**: Nhập số bàn (ví dụ: "A1", "B2", "V1")
    - **Tên bàn**: Nhập tên bàn (tùy chọn)
    - **Sức chứa**: Nhập số người tối đa (ví dụ: 4, 6, 8)
    - **Sức chứa tối thiểu**: Nhập số người tối thiểu (mặc định: 1)
    - **Tầng**: Chọn tầng (1, 2, 3...)
    - **Khu vực**: Chọn khu vực (VIP, Sân vườn, Trong nhà, Ngoài trời)
    - **Trạng thái**: Chọn "Có sẵn" hoặc "Bảo trì"
4. **Bước 4**: Hệ thống kiểm tra:
    - Số bàn có duy nhất không
    - Sức chứa có hợp lệ không (> 0)
    - Dữ liệu có đầy đủ không
5. **Bước 5**: Nếu hợp lệ, lưu vào database
6. **Bước 6**: Tự động tạo mã QR cho bàn (nếu cần)
7. **Bước 7**: Thông báo thành công
8. **Bước 8**: Hiển thị bàn mới trong danh sách

**Xử lý lỗi**:

-   Nếu số bàn đã tồn tại: Hiển thị lỗi "Số bàn đã tồn tại"
-   Nếu sức chứa không hợp lệ: Hiển thị lỗi "Sức chứa phải lớn hơn 0"
-   Nếu dữ liệu chưa đầy đủ: Hiển thị lỗi "Vui lòng điền đầy đủ thông tin"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Tạo bàn
-   Số bàn: [table_number]
-   Sức chứa: [capacity]
-   Thời gian: [timestamp]
-   Kết quả: Thành công/Thất bại

---

#### 3.1.2 Xem Danh Sách Bàn

**Mục tiêu**: Xem toàn bộ bàn ăn trong nhà hàng

**Người tham gia chính**: Quản lý nhà hàng, Nhân viên tiếp nhận, Admin

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Bàn"
2. **Bước 2**: Hệ thống hiển thị danh sách bàn dưới dạng bảng hoặc sơ đồ với:
    - Số bàn
    - Tên bàn
    - Sức chứa
    - Tầng/Khu vực
    - Trạng thái (Có sẵn/Đã đặt/Đang sử dụng/Bảo trì)
    - Nút hành động (Xem, Sửa, Xóa)
3. **Bước 3**: Có thể lọc theo:
    - Trạng thái (Có sẵn, Đã đặt, Đang sử dụng, Bảo trì)
    - Tầng
    - Khu vực
    - Sức chứa (từ - đến)
4. **Bước 4**: Có thể tìm kiếm theo số bàn hoặc tên bàn
5. **Bước 5**: Sắp xếp theo:
    - Số bàn (A-Z)
    - Sức chứa (Thấp - Cao)
    - Trạng thái

**Hiển thị dạng sơ đồ**:

-   Hiển thị sơ đồ nhà hàng với các bàn theo vị trí thực tế
-   Màu sắc khác nhau cho từng trạng thái:
    -   **Xanh lá**: Có sẵn
    -   **Vàng**: Đã đặt
    -   **Đỏ**: Đang sử dụng
    -   **Xám**: Bảo trì
-   Click vào bàn để xem chi tiết hoặc thực hiện hành động

---

#### 3.1.3 Chỉnh Sửa Thông Tin Bàn

**Mục tiêu**: Cập nhật thông tin của bàn hiện có

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Điều kiện tiên quyết**:

-   Bàn tồn tại
-   Người dùng có quyền chỉnh sửa

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách bàn, nhấn nút "Sửa"
2. **Bước 2**: Mở form chỉnh sửa với thông tin hiện tại
3. **Bước 3**: Cập nhật thông tin cần thiết:
    - Số bàn
    - Tên bàn
    - Sức chứa
    - Sức chứa tối thiểu
    - Tầng
    - Khu vực
    - Trạng thái
4. **Bước 4**: Hệ thống kiểm tra dữ liệu
5. **Bước 5**: Lưu thay đổi
6. **Bước 6**: Cập nhật sơ đồ nhà hàng ngay lập tức
7. **Bước 7**: Ghi log thay đổi

**Các trường có thể chỉnh sửa**:

-   Số bàn: ✓ (kiểm tra duy nhất, ngoại trừ số cũ)
-   Tên bàn: ✓
-   Sức chứa: ✓ (phải > 0)
-   Sức chứa tối thiểu: ✓
-   Tầng: ✓
-   Khu vực: ✓
-   Trạng thái: ✓

**Ghi log thay đổi**:

-   Người dùng: [username]
-   Hành động: Chỉnh sửa bàn
-   Số bàn: [table_number]
-   Trường thay đổi: [field_name]
-   Giá trị cũ: [old_value]
-   Giá trị mới: [new_value]
-   Thời gian: [timestamp]

---

#### 3.1.4 Thay Đổi Trạng Thái Bàn

**Mục tiêu**: Cập nhật trạng thái bàn theo tình huống thực tế

**Người tham gia chính**: Nhân viên tiếp nhận, Quản lý

**Các trạng thái bàn**:

-   **Có sẵn (Available)**: Bàn trống, sẵn sàng phục vụ
-   **Đã đặt (Reserved)**: Bàn đã được đặt trước
-   **Đang sử dụng (Occupied)**: Khách đang ngồi
-   **Bảo trì (Maintenance)**: Bàn cần sửa chữa, không sử dụng được

**Quy trình chi tiết**:

1. **Bước 1**: Chọn bàn cần thay đổi trạng thái
2. **Bước 2**: Chọn trạng thái mới từ dropdown hoặc click trực tiếp
3. **Bước 3**: Hệ thống kiểm tra:
    - Nếu chuyển sang "Đang sử dụng": Kiểm tra có đơn hàng không
    - Nếu chuyển sang "Bảo trì": Xác nhận không có khách hoặc đặt bàn
4. **Bước 4**: Cập nhật trạng thái
5. **Bước 5**: Cập nhật sơ đồ nhà hàng real-time
6. **Bước 6**: Ghi log hành động

**Quy tắc chuyển đổi trạng thái**:

```
Có sẵn ⟷ Đã đặt ⟷ Đang sử dụng ⟷ Có sẵn
    ↓          ↓           ↓
  Bảo trì    Bảo trì     Bảo trì
```

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Thay đổi trạng thái bàn
-   Số bàn: [table_number]
-   Trạng thái cũ: [old_status]
-   Trạng thái mới: [new_status]
-   Thời gian: [timestamp]

---

#### 3.1.5 Xóa Bàn

**Mục tiêu**: Xóa bàn khỏi hệ thống

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Điều kiện tiên quyết**:

-   Bàn không có đặt bàn nào trong tương lai
-   Bàn không có đơn hàng đang xử lý
-   Người dùng có quyền xóa

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách bàn, nhấn nút "Xóa"
2. **Bước 2**: Hệ thống kiểm tra:
    - Bàn có đặt bàn trong tương lai không?
    - Bàn có đơn hàng đang xử lý không?
    - Nếu có, hiển thị danh sách và yêu cầu xử lý trước
3. **Bước 3**: Nếu không có ràng buộc, hiển thị hộp thoại xác nhận
    - "Bạn có chắc chắn muốn xóa bàn [table_number]?"
    - "Hành động này không thể hoàn tác"
4. **Bước 4**: Người dùng xác nhận
5. **Bước 5**: Xóa bàn từ database
6. **Bước 6**: Xóa mã QR liên quan (nếu có)
7. **Bước 7**: Ghi log xóa
8. **Bước 8**: Thông báo xóa thành công

**Xử lý lỗi**:

-   Nếu bàn còn đặt bàn: "Vui lòng hủy hoặc hoàn tất tất cả đặt bàn trước"
-   Nếu bàn còn đơn hàng: "Bàn đang có đơn hàng, không thể xóa"
-   Nếu xóa thất bại: "Không thể xóa bàn. Vui lòng thử lại"

**Ghi log xóa**:

-   Người dùng: [username]
-   Hành động: Xóa bàn
-   Số bàn: [table_number]
-   Sức chứa: [capacity]
-   Thời gian: [timestamp]

---

### 3.2 Quản Lý Đặt Bàn

#### 3.2.1 Tạo Đặt Bàn Mới

**Mục tiêu**: Tạo yêu cầu đặt bàn trước cho khách hàng

**Người tham gia chính**: Khách hàng (online), Nhân viên tiếp nhận (điện thoại/trực tiếp)

**Điều kiện tiên quyết**:

-   Có bàn phù hợp với số lượng khách
-   Thời gian đặt phải trong tương lai
-   Thông tin khách hàng hợp lệ

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng truy cập "Đặt Bàn" hoặc nhân viên mở form đặt bàn
2. **Bước 2**: Mở form tạo đặt bàn mới

**Thông tin cần nhập**:

| Trường              | Loại     | Bắt buộc | Mô tả                                       |
| ------------------- | -------- | -------- | ------------------------------------------- |
| Tên khách hàng      | Text     | ✓        | Tên người đặt bàn                           |
| Số điện thoại       | Phone    | ✓        | Số điện thoại liên hệ                       |
| Email               | Email    | ✗        | Email nhận xác nhận                         |
| Ngày đặt            | Date     | ✓        | Ngày đến nhà hàng                           |
| Giờ đặt             | Time     | ✓        | Giờ đến nhà hàng                            |
| Số lượng khách      | Number   | ✓        | Số người trong nhóm                         |
| Thời gian dự kiến   | Number   | ✗        | Phút (mặc định: 120 phút)                   |
| Yêu cầu đặc biệt    | Textarea | ✗        | Sinh nhật, kỷ niệm, yêu cầu món ăn đặc biệt |
| Tiền đặt cọc        | Number   | ✗        | Số tiền đặt cọc (nếu có)                    |
| Ghi chú             | Textarea | ✗        | Ghi chú nội bộ                              |

3. **Bước 3**: Điền thông tin đặt bàn
4. **Bước 4**: Hệ thống tự động tìm bàn phù hợp:
    - Dựa vào số lượng khách
    - Dựa vào thời gian đặt
    - Kiểm tra bàn có sẵn không
5. **Bước 5**: Hiển thị danh sách bàn khả dụng
6. **Bước 6**: Người dùng chọn bàn hoặc để hệ thống tự động gán
7. **Bước 7**: Xác nhận đặt bàn
8. **Bước 8**: Hệ thống tạo mã đặt bàn (Reservation Code)
9. **Bước 9**: Gửi xác nhận qua SMS/Email (nếu có)
10. **Bước 10**: Hiển thị thông tin đặt bàn và mã xác nhận
11. **Bước 11**: Cập nhật trạng thái bàn thành "Đã đặt"
12. **Bước 12**: Ghi log tạo đặt bàn

**Xử lý lỗi**:

-   Không có bàn phù hợp: "Không có bàn trống cho thời gian này. Vui lòng chọn thời gian khác"
-   Thời gian quá khứ: "Thời gian đặt phải trong tương lai"
-   Số điện thoại không hợp lệ: "Số điện thoại không đúng định dạng"
-   Số lượng khách vượt quá: "Số lượng khách vượt quá sức chứa nhà hàng"

**Ghi log**:

-   Người dùng: [username hoặc "Khách hàng"]
-   Hành động: Tạo đặt bàn
-   Mã đặt bàn: [reservation_code]
-   Tên khách: [customer_name]
-   Số điện thoại: [phone_number]
-   Bàn: [table_number]
-   Ngày giờ: [date_time]
-   Số khách: [head_count]
-   Thời gian: [timestamp]

---

#### 3.2.2 Xem Danh Sách Đặt Bàn

**Mục tiêu**: Xem tất cả các đặt bàn trong hệ thống

**Người tham gia chính**: Nhân viên tiếp nhận, Quản lý

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Đặt Bàn"
2. **Bước 2**: Hệ thống hiển thị danh sách đặt bàn với:
    - Mã đặt bàn
    - Tên khách hàng
    - Số điện thoại
    - Số bàn
    - Ngày giờ đặt
    - Số lượng khách
    - Trạng thái
    - Nút hành động (Xem chi tiết, Sửa, Hủy, Check-in)
3. **Bước 3**: Tính năng lọc:
    - Trạng thái (Chờ xác nhận, Đã xác nhận, Đã ngồi, Hoàn tất, Đã hủy, Không đến)
    - Ngày đặt (Hôm nay, Ngày mai, Tuần này, Tùy chọn)
    - Bàn
    - Số lượng khách (từ - đến)
4. **Bước 4**: Tìm kiếm theo:
    - Mã đặt bàn
    - Tên khách hàng
    - Số điện thoại
5. **Bước 5**: Sắp xếp theo:
    - Ngày giờ đặt (Sớm nhất, Muộn nhất)
    - Trạng thái
    - Số lượng khách

**Hiển thị dạng lịch**:

-   Xem đặt bàn theo lịch (Calendar View)
-   Mỗi ô thời gian hiển thị:
    -   Tên khách
    -   Số bàn
    -   Số lượng khách
    -   Trạng thái
-   Click vào để xem chi tiết hoặc chỉnh sửa

---

#### 3.2.3 Xem Chi Tiết Đặt Bàn

**Mục tiêu**: Xem toàn bộ thông tin của một đặt bàn

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách đặt bàn, nhấn vào mã hoặc nút "Xem chi tiết"
2. **Bước 2**: Mở trang chi tiết hiển thị:
    - Mã đặt bàn (Reservation Code)
    - Tên khách hàng
    - Số điện thoại
    - Email
    - Số bàn
    - Ngày giờ đặt
    - Thời gian dự kiến
    - Số lượng khách
    - Yêu cầu đặc biệt
    - Tiền đặt cọc (nếu có)
    - Trạng thái
    - Ghi chú
    - Lịch sử thay đổi (nếu có)
    - Ngày tạo, người tạo
    - Ngày cập nhật gần nhất
3. **Bước 3**: Hiển thị các nút hành động:
    - Sửa
    - Xác nhận
    - Check-in (nếu khách đã đến)
    - Hủy
    - Đánh dấu không đến (No-show)
    - Gửi lại xác nhận
    - In thông tin đặt bàn

---

#### 3.2.4 Chỉnh Sửa Đặt Bàn

**Mục tiêu**: Cập nhật thông tin đặt bàn

**Người tham gia chính**: Nhân viên tiếp nhận, Quản lý

**Điều kiện tiên quyết**:

-   Đặt bàn chưa hoàn tất hoặc hủy
-   Người dùng có quyền chỉnh sửa

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết đặt bàn, nhấn nút "Sửa"
2. **Bước 2**: Mở form chỉnh sửa với dữ liệu hiện tại
3. **Bước 3**: Cập nhật thông tin cần thiết:
    - Tên khách hàng
    - Số điện thoại
    - Email
    - Ngày giờ đặt
    - Số lượng khách
    - Bàn (nếu thay đổi)
    - Thời gian dự kiến
    - Yêu cầu đặc biệt
    - Tiền đặt cọc
    - Ghi chú
4. **Bước 4**: Nếu thay đổi ngày giờ hoặc số lượng khách:
    - Hệ thống kiểm tra bàn hiện tại có phù hợp không
    - Nếu không, đề xuất bàn khác hoặc thời gian khác
5. **Bước 5**: Xác nhận thay đổi
6. **Bước 6**: Lưu thay đổi
7. **Bước 7**: Gửi thông báo cập nhật cho khách (nếu có thay đổi quan trọng)
8. **Bước 8**: Ghi log thay đổi

**Ghi log thay đổi**:

-   Người dùng: [username]
-   Hành động: Chỉnh sửa đặt bàn
-   Mã đặt bàn: [reservation_code]
-   Trường thay đổi: [field_name]
-   Giá trị cũ: [old_value]
-   Giá trị mới: [new_value]
-   Thời gian: [timestamp]

---

#### 3.2.5 Xác Nhận Đặt Bàn

**Mục tiêu**: Xác nhận đặt bàn từ trạng thái "Chờ xác nhận" sang "Đã xác nhận"

**Người tham gia chính**: Nhân viên tiếp nhận, Quản lý

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách hoặc chi tiết đặt bàn, nhấn nút "Xác nhận"
2. **Bước 2**: Hệ thống kiểm tra:
    - Bàn vẫn còn khả dụng không
    - Thời gian đặt vẫn hợp lệ không
3. **Bước 3**: Nếu hợp lệ, cập nhật trạng thái thành "Đã xác nhận"
4. **Bước 4**: Gửi SMS/Email xác nhận cho khách
5. **Bước 5**: Ghi log xác nhận
6. **Bước 6**: Thông báo thành công

**Nội dung xác nhận gửi khách**:

```
Kính gửi [Tên khách],

Đặt bàn của quý khách đã được xác nhận:
- Mã đặt bàn: [Reservation Code]
- Bàn: [Table Number]
- Ngày giờ: [Date Time]
- Số lượng khách: [Head Count]

Quý khách vui lòng đến đúng giờ. Nếu có thay đổi, vui lòng liên hệ: [Phone]

Trân trọng,
[Tên nhà hàng]
```

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Xác nhận đặt bàn
-   Mã đặt bàn: [reservation_code]
-   Thời gian: [timestamp]

---

#### 3.2.6 Check-in Khách Đến

**Mục tiêu**: Ghi nhận khách đã đến và chuyển trạng thái sang "Đã ngồi"

**Người tham gia chính**: Nhân viên tiếp nhận

**Quy trình chi tiết**:

1. **Bước 1**: Khi khách đến, nhân viên tra cứu đặt bàn theo:
    - Mã đặt bàn
    - Số điện thoại
    - Tên khách hàng
2. **Bước 2**: Xác nhận đúng đặt bàn
3. **Bước 3**: Nhấn nút "Check-in"
4. **Bước 4**: Hệ thống:
    - Cập nhật trạng thái thành "Đã ngồi (Seated)"
    - Cập nhật trạng thái bàn thành "Đang sử dụng (Occupied)"
    - Ghi nhận thời gian check-in
5. **Bước 5**: Dẫn khách đến bàn
6. **Bước 6**: Có thể tạo đơn hàng ngay (liên kết với đặt bàn)
7. **Bước 7**: Ghi log check-in

**Xử lý trường hợp đặc biệt**:

-   **Khách đến sớm**: Kiểm tra bàn có sẵn không, nếu có cho ngồi ngay
-   **Khách đến muộn**: Ghi nhận thời gian muộn, vẫn cho ngồi nếu còn bàn
-   **Khách đến quá muộn**: Có thể hủy đặt bàn nếu quá giờ quy định

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Check-in khách
-   Mã đặt bàn: [reservation_code]
-   Thời gian đặt: [reservation_time]
-   Thời gian check-in: [checkin_time]
-   Chênh lệch: [time_difference]

---

#### 3.2.7 Hủy Đặt Bàn

**Mục tiêu**: Hủy đặt bàn theo yêu cầu của khách hoặc nhà hàng

**Người tham gia chính**: Khách hàng, Nhân viên tiếp nhận, Quản lý

**Điều kiện tiên quyết**:

-   Đặt bàn chưa hoàn tất
-   Có lý do hủy hợp lệ

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách hoặc chi tiết đặt bàn, nhấn nút "Hủy"
2. **Bước 2**: Hiển thị hộp thoại xác nhận:
    - "Bạn có chắc chắn muốn hủy đặt bàn này?"
    - Nhập lý do hủy (bắt buộc)
    - Lý do: Khách yêu cầu, Không liên lạc được, Khác
3. **Bước 3**: Người dùng xác nhận hủy
4. **Bước 4**: Hệ thống:
    - Cập nhật trạng thái thành "Đã hủy (Cancelled)"
    - Giải phóng bàn (trạng thái về "Có sẵn")
    - Lưu lý do hủy
5. **Bước 5**: Nếu có tiền đặt cọc:
    - Kiểm tra chính sách hoàn tiền
    - Xử lý hoàn tiền (nếu được)
6. **Bước 6**: Gửi thông báo hủy cho khách (nếu là nhà hàng hủy)
7. **Bước 7**: Ghi log hủy

**Chính sách hoàn tiền đặt cọc**:

-   Hủy trước 24 giờ: Hoàn 100%
-   Hủy trước 12 giờ: Hoàn 50%
-   Hủy trong vòng 12 giờ: Không hoàn tiền

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Hủy đặt bàn
-   Mã đặt bàn: [reservation_code]
-   Lý do: [cancellation_reason]
-   Thời gian: [timestamp]

---

#### 3.2.8 Xử Lý Khách Không Đến (No-show)

**Mục tiêu**: Ghi nhận khách đặt bàn nhưng không đến

**Người tham gia chính**: Nhân viên tiếp nhận, Quản lý

**Quy trình chi tiết**:

1. **Bước 1**: Sau thời gian đặt bàn + thời gian chờ (thường 15-30 phút):
    - Nhân viên kiểm tra khách có đến không
    - Thử liên hệ khách qua điện thoại
2. **Bước 2**: Nếu không liên lạc được hoặc khách không đến:
    - Nhấn nút "Đánh dấu không đến"
3. **Bước 3**: Nhập lý do hoặc ghi chú (tùy chọn)
4. **Bước 4**: Xác nhận
5. **Bước 5**: Hệ thống:
    - Cập nhật trạng thái thành "Không đến (No-show)"
    - Giải phóng bàn ngay lập tức
    - Lưu vào lịch sử khách hàng
6. **Bước 6**: Nếu có tiền đặt cọc:
    - Không hoàn tiền (theo chính sách)
    - Ghi nhận vào doanh thu
7. **Bước 7**: Cập nhật thống kê no-show
8. **Bước 8**: Ghi log

**Xử lý khách no-show nhiều lần**:

-   Ghi nhận vào hồ sơ khách hàng
-   Có thể yêu cầu đặt cọc cao hơn hoặc từ chối đặt bàn
-   Gửi cảnh báo khi khách đặt bàn lại

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Đánh dấu no-show
-   Mã đặt bàn: [reservation_code]
-   Tên khách: [customer_name]
-   Số điện thoại: [phone_number]
-   Thời gian đặt: [reservation_time]
-   Thời gian đánh dấu: [timestamp]

---

#### 3.2.9 Hoàn Tất Đặt Bàn

**Mục tiêu**: Đánh dấu đặt bàn hoàn tất sau khi khách rời đi

**Người tham gia chính**: Nhân viên tiếp nhận, Nhân viên phục vụ

**Quy trình chi tiết**:

1. **Bước 1**: Sau khi khách thanh toán và rời bàn
2. **Bước 2**: Nhân viên nhấn nút "Hoàn tất"
3. **Bước 3**: Hệ thống:
    - Cập nhật trạng thái thành "Hoàn tất (Completed)"
    - Liên kết với hóa đơn (nếu có)
    - Ghi nhận thời gian thực tế sử dụng
4. **Bước 4**: Cập nhật trạng thái bàn về "Có sẵn" sau khi dọn dẹp
5. **Bước 5**: Ghi log hoàn tất
6. **Bước 6**: Có thể gửi khảo sát hài lòng cho khách (tùy chọn)

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Hoàn tất đặt bàn
-   Mã đặt bàn: [reservation_code]
-   Thời gian check-in: [checkin_time]
-   Thời gian hoàn tất: [completion_time]
-   Thời gian sử dụng thực tế: [actual_duration]

---

### 3.3 Tính Năng Tự Động

#### 3.3.1 Nhắc Lịch Tự Động

**Mục tiêu**: Gửi thông báo nhắc khách trước khi đến

**Quy trình tự động**:

1. **24 giờ trước**: Gửi SMS/Email nhắc lịch
    - Nội dung: Thông tin đặt bàn
    - Yêu cầu: Xác nhận hoặc hủy
2. **4 giờ trước**: Gửi nhắc lại (nếu chưa xác nhận)
3. **1 giờ trước**: Gửi nhắc cuối cùng
4. **Khách xác nhận**: Cập nhật trạng thái "Đã xác nhận"
5. **Khách hủy**: Thực hiện quy trình hủy

**Nội dung nhắc lịch**:

```
[Nhà hàng ABC]

Nhắc lịch: Quý khách có đặt bàn vào ngày mai
- Mã: [Code]
- Giờ: [Time]
- Bàn: [Table]
- Số khách: [Count]

Vui lòng trả lời:
1. Xác nhận
2. Hủy
3. Thay đổi

Hotline: [Phone]
```

---

#### 3.3.2 Tự Động Giải Phóng Bàn

**Mục tiêu**: Tự động giải phóng bàn sau thời gian quy định

**Quy trình tự động**:

1. **Sau thời gian đặt + thời gian chờ**:
    - Nếu khách chưa check-in
    - Chuyển trạng thái sang "No-show"
    - Giải phóng bàn
2. **Sau thời gian sử dụng dự kiến**:
    - Cảnh báo nhân viên kiểm tra
    - Không tự động giải phóng (cần xác nhận thủ công)
3. **Sau khi hoàn tất**:
    - Cập nhật trạng thái bàn về "Có sẵn"

---

#### 3.3.3 Gợi Ý Bàn Thông Minh

**Mục tiêu**: Tự động gợi ý bàn phù hợp nhất khi đặt

**Tiêu chí gợi ý**:

1. **Sức chứa**:
    - Bàn có sức chứa phù hợp với số khách
    - Tối ưu hóa: Không gán bàn 8 người cho nhóm 2 người
2. **Vị trí**:
    - Ưu tiên bàn theo yêu cầu đặc biệt
    - VIP cho nhóm lớn hoặc sự kiện đặc biệt
3. **Thời gian**:
    - Kiểm tra bàn trống trong khung giờ đặt
    - Tính cả thời gian dự kiến sử dụng
4. **Lịch sử**:
    - Ưu tiên bàn khách từng ngồi (nếu có lịch sử)

**Thuật toán gợi ý**:

```
1. Lọc bàn có sức chứa phù hợp (capacity >= headCount >= minCapacity)
2. Kiểm tra bàn trống trong thời gian đặt
3. Sắp xếp theo:
   - Độ phù hợp sức chứa (ưu tiên bàn vừa đủ)
   - Vị trí (ưu tiên theo yêu cầu)
   - Lịch sử khách (nếu có)
4. Trả về top 3 gợi ý
```

---

### 3.4 Báo Cáo và Phân Tích

#### 3.4.1 Báo Cáo Đặt Bàn

**Mục tiêu**: Thống kê và phân tích đặt bàn

**Người tham gia chính**: Quản lý

**Các loại báo cáo**:

1. **Báo cáo tổng quan đặt bàn**:
    - Tổng số đặt bàn theo ngày/tuần/tháng
    - Số lượng theo trạng thái
    - Tỷ lệ check-in
    - Tỷ lệ no-show
    - Tỷ lệ hủy

2. **Báo cáo hiệu suất bàn**:
    - Số lần được đặt của mỗi bàn
    - Thời gian sử dụng trung bình
    - Bàn được ưa chuộng nhất
    - Bàn ít được đặt nhất

3. **Báo cáo khách hàng**:
    - Top khách đặt bàn nhiều nhất
    - Khách có lịch sử no-show
    - Khách VIP
    - Khách mới

4. **Báo cáo xu hướng**:
    - Giờ cao điểm đặt bàn
    - Ngày cao điểm trong tuần
    - Khu vực được ưa chuộng
    - Xu hướng theo mùa

**Quy trình tạo báo cáo**:

1. Chọn loại báo cáo
2. Chọn khoảng thời gian
3. Chọn bộ lọc (nếu cần)
4. Hệ thống tạo báo cáo
5. Hiển thị biểu đồ và bảng số liệu
6. Xuất báo cáo (PDF, Excel)

---

#### 3.4.2 Phân Tích Tỷ Lệ No-show

**Mục tiêu**: Phân tích và giảm thiểu tỷ lệ khách không đến

**Chỉ số theo dõi**:

-   Tỷ lệ no-show tổng thể
-   No-show theo khung giờ
-   No-show theo ngày trong tuần
-   No-show theo nguồn đặt bàn (online/điện thoại)

**Biện pháp giảm no-show**:

1. **Yêu cầu đặt cọc** cho các đặt bàn:
    - Nhóm lớn (> 6 người)
    - Giờ cao điểm
    - Khách có lịch sử no-show

2. **Nhắc lịch tích cực**:
    - Nhiều lần nhắc trước giờ đặt
    - Yêu cầu xác nhận

3. **Chính sách rõ ràng**:
    - Thời gian chờ tối đa
    - Chính sách hủy và hoàn tiền

4. **Theo dõi khách hàng**:
    - Ghi nhận lịch sử no-show
    - Áp dụng biện pháp đặc biệt cho khách rủi ro cao

---

#### 3.4.3 Tối Ưu Hóa Sức Chứa

**Mục tiêu**: Tối đa hóa số lượng khách phục vụ được

**Phân tích**:

1. **Tỷ lệ lấp đầy bàn**:
    - % bàn được sử dụng so với tổng số bàn
    - Theo khung giờ, ngày trong tuần

2. **Thời gian sử dụng bàn**:
    - Thời gian trung bình mỗi bàn
    - So sánh với thời gian đặt trước

3. **Ghép bàn thông minh**:
    - Phân tích khả năng ghép bàn
    - Tối ưu hóa cho nhóm lớn

**Chiến lược tối ưu**:

-   Khuyến khích đặt bàn ngoài giờ cao điểm
-   Giảm giá cho khung giờ thấp điểm
-   Quản lý thời gian sử dụng bàn
-   Cải thiện quy trình check-in/check-out

---

## 4. Quy Trình Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│         QUẢN LÝ ĐẶT BÀN - QUY TRÌNH TỔNG               │
└─────────────────────────────────────────────────────────┘

1. CHUẨN BỊ HỆ THỐNG
   └─ Tạo và cấu hình bàn ăn
      ├─ Nhập thông tin bàn
      ├─ Xác định sức chứa
      └─ Phân chia khu vực

2. NHẬN ĐẶT BÀN
   └─ Khách đặt bàn (online/điện thoại/trực tiếp)
      ├─ Nhập thông tin khách
      ├─ Chọn ngày giờ
      ├─ Chọn số lượng khách
      ├─ Hệ thống gợi ý bàn phù hợp
      └─ Xác nhận đặt bàn

3. XÁC NHẬN VÀ NHẮC LỊCH
   ├─ Nhân viên xác nhận đặt bàn
   ├─ Gửi xác nhận cho khách
   ├─ Gửi nhắc lịch 24h trước
   └─ Khách xác nhận hoặc hủy

4. NGÀY PHỤC VỤ
   ├─ Khách đến → Check-in
   ├─ Dẫn khách đến bàn
   ├─ Tạo đơn hàng
   ├─ Phục vụ
   └─ Khách thanh toán và rời đi

5. XỬ LÝ NGOẠI LỆ
   ├─ Khách muốn thay đổi → Chỉnh sửa đặt bàn
   ├─ Khách muốn hủy → Hủy đặt bàn
   └─ Khách không đến → Đánh dấu no-show

6. KẾT THÚC
   ├─ Hoàn tất đặt bàn
   ├─ Dọn dẹp bàn
   ├─ Cập nhật trạng thái bàn
   └─ Bàn sẵn sàng cho đặt bàn mới

7. PHÂN TÍCH VÀ CẢI THIỆN
   ├─ Xem báo cáo đặt bàn
   ├─ Phân tích tỷ lệ no-show
   ├─ Tối ưu hóa sức chứa
   └─ Điều chỉnh chiến lược
```

---

## 5. Các Tác Nhân (Actors) và Quyền Hạn

| Tác Nhân                | Tạo | Xem | Sửa | Xóa | Xác nhận | Check-in | Hủy | No-show |
| ----------------------- | --- | --- | --- | --- | -------- | -------- | --- | ------- |
| Khách hàng (Online)     | ✓   | ✓   | ✓   | ✗   | ✗        | ✗        | ✓   | ✗       |
| Nhân viên tiếp nhận     | ✓   | ✓   | ✓   | ✗   | ✓        | ✓        | ✓   | ✓       |
| Nhân viên phục vụ       | ✗   | ✓   | ✗   | ✗   | ✗        | ✗        | ✗   | ✗       |
| Quản lý                 | ✓   | ✓   | ✓   | ✓   | ✓        | ✓        | ✓   | ✓       |
| Admin/Quản trị viên     | ✓   | ✓   | ✓   | ✓   | ✓        | ✓        | ✓   | ✓       |

---

## 6. Công Nghệ và Công Cụ (Đã triển khai)

### 6.1 Công Nghệ Sử Dụng

-   **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
-   **State Management**: Zustand
-   **Backend**: NestJS, TypeScript
-   **Database**: PostgreSQL với Prisma ORM
-   **Authentication**: JWT (Access Token 15 phút, Refresh Token 7 ngày)

### 6.2 Các Module Liên Quan

-   **TableController**: Quản lý CRUD bàn (`/table`)
-   **ReservationController**: Quản lý đặt bàn (`/reservations`)
-   **ReservationService**: Business logic xử lý đặt bàn
-   **ReservationAudit**: Ghi log lịch sử thay đổi

### 6.3 API Endpoints

**Table Controller:**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/table/stats` | Thống kê bàn |
| GET | `/table` | Danh sách bàn |
| GET | `/table/available` | Bàn trống |
| GET | `/table/:id` | Chi tiết bàn |
| POST | `/table` | Tạo bàn mới |
| PUT | `/table/:id` | Cập nhật bàn |
| PATCH | `/table/:id/status` | Cập nhật trạng thái |
| DELETE | `/table/:id` | Xóa bàn |

**Reservation Controller:**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/reservations` | Danh sách đặt bàn |
| GET | `/reservations/check-availability` | Kiểm tra bàn trống |
| GET | `/reservations/:id` | Chi tiết đặt bàn |
| POST | `/reservations` | Tạo đặt bàn |
| PUT | `/reservations/:id` | Cập nhật đặt bàn |
| PATCH | `/reservations/:id/confirm` | Xác nhận |
| PATCH | `/reservations/:id/seated` | Check-in (auto tạo Order) |
| PATCH | `/reservations/:id/complete` | Hoàn tất |
| PATCH | `/reservations/:id/cancel` | Hủy |
| PATCH | `/reservations/:id/no-show` | Đánh dấu không đến |

---

## 7. Bảng Tóm Tắt Lỗi và Xử Lý

| Lỗi                           | Nguyên Nhân                     | Cách Xử Lý                                    |
| ----------------------------- | ------------------------------- | --------------------------------------------- |
| Không có bàn trống            | Tất cả bàn đã được đặt          | Đề xuất thời gian khác hoặc bàn thay thế      |
| Số điện thoại không hợp lệ    | Định dạng không đúng            | Yêu cầu nhập lại đúng định dạng               |
| Thời gian đặt trong quá khứ   | Chọn thời gian đã qua           | Chỉ cho phép đặt trong tương lai              |
| Số lượng khách vượt quá       | Vượt sức chứa nhà hàng          | Yêu cầu liên hệ trực tiếp hoặc giảm số khách  |
| Không thể hủy đặt bàn         | Đặt bàn đã hoàn tất             | Chỉ cho phép hủy đặt bàn chưa hoàn tất        |
| Bàn đã được đặt               | Bàn không còn trống             | Đề xuất bàn khác hoặc thời gian khác          |
| Không thể xóa bàn             | Bàn có đặt bàn/đơn hàng liên kết| Xử lý hết đặt bàn/đơn hàng trước khi xóa      |
| Gửi thông báo thất bại        | Lỗi kết nối với SMS/Email       | Thử lại hoặc liên hệ thủ công                 |

---

## 8. Tính Năng Chưa Triển Khai (Trong Tương Lai)

> **Lưu ý**: Các tính năng dưới đây chưa được triển khai trong phiên bản hiện tại.

-   **SMS/Email Notifications**: Gửi xác nhận và nhắc lịch tự động (Twilio, SendGrid)
-   **QR Code cho bàn**: Tạo mã QR để khách tự đặt món
-   **Đặt bàn qua Chatbot**: Tích hợp Facebook Messenger, Zalo
-   **Thanh toán trước online**: Đặt cọc hoặc thanh toán toàn bộ trước
-   **Loyalty Program**: Tích điểm cho khách đặt bàn thường xuyên
-   **Waitlist Management**: Quản lý danh sách chờ khi hết bàn
-   **VIP Table Management**: Quản lý bàn VIP với ưu đãi đặc biệt
-   **AI Prediction**: Dự đoán nhu cầu đặt bàn, tối ưu hóa sắp xếp
-   **Multi-language**: Hỗ trợ đa ngôn ngữ cho khách quốc tế
-   **Google Calendar Integration**: Đồng bộ lịch đặt bàn
-   **Review System**: Khách đánh giá sau khi sử dụng dịch vụ
-   **Dynamic Pricing**: Giá đặt bàn linh hoạt theo giờ cao/thấp điểm

---

## 9. Lưu Ý Quan Trọng

1. **Xác nhận kịp thời**: Xác nhận đặt bàn càng sớm càng tốt
2. **Nhắc lịch đầy đủ**: Gửi nhiều lần nhắc để giảm no-show
3. **Chính sách rõ ràng**: Thông báo rõ chính sách hủy và hoàn tiền
4. **Dữ liệu khách hàng**: Bảo mật thông tin khách hàng
5. **Cập nhật real-time**: Đảm bảo trạng thái bàn cập nhật ngay lập tức
6. **Backup dữ liệu**: Sao lưu dữ liệu đặt bàn thường xuyên
7. **Customer Service**: Hỗ trợ khách hàng tốt, giải quyết vấn đề nhanh
8. **Flexibility**: Linh hoạt trong việc thay đổi và điều chỉnh đặt bàn
9. **Communication**: Giao tiếp rõ ràng với khách về thời gian chờ
10. **Tracking**: Theo dõi tỷ lệ no-show và có biện pháp cải thiện

---

## 10. Kết Luận

Hệ thống quản lý đặt bàn là một phần không thể thiếu của ứng dụng quản lý nhà hàng hiện đại. Nó giúp tối ưu hóa việc sử dụng tài nguyên, cải thiện trải nghiệm khách hàng, và tăng doanh thu cho nhà hàng. Với các tính năng tự động hóa như nhắc lịch, gợi ý bàn thông minh, và phân tích dữ liệu, hệ thống giúp nhà hàng vận hành hiệu quả và chuyên nghiệp hơn.

Tài liệu này cung cấp hướng dẫn chi tiết cho các nhà phát triển, quản lý, và người dùng của hệ thống, đảm bảo mọi người hiểu rõ quy trình và có thể sử dụng hệ thống một cách tối ưu nhất.
