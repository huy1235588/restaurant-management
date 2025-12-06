# Tài Liệu Chi Tiết Quản Lý Đơn Hàng

> **Lưu ý**: Tài liệu này đã được cập nhật để phản ánh chính xác hệ thống đã triển khai thực tế (Tháng 6/2025).

## 1. Giới Thiệu

Hệ thống quản lý đơn hàng là trung tâm của ứng dụng quản lý nhà hàng, kết nối giữa khách hàng, nhân viên phục vụ, bếp và thanh toán. Hệ thống cho phép tạo, theo dõi và quản lý toàn bộ vòng đời của đơn hàng từ khi khách gọi món cho đến khi hoàn tất thanh toán. Đây là module quan trọng nhất, đảm bảo quy trình phục vụ diễn ra mượt mà và chính xác.

---

## 2. Các Thành Phần Chính

### 2.1 Đơn Hàng (Orders)

-   **Định nghĩa**: Yêu cầu đặt món ăn/đồ uống của khách hàng tại nhà hàng
-   **Mục đích**: Quản lý và theo dõi các món khách gọi, truyền thông tin đến bếp
-   **Thông tin chứa**:
    -   Số đơn hàng (orderNumber) - Tự động sinh
    -   Bàn (tableId)
    -   Nhân viên phục vụ (staffId)
    -   Đặt bàn liên kết (reservationId - nếu có)
    -   Tên khách hàng (customerName)
    -   Số điện thoại khách (customerPhone)
    -   Số lượng khách (partySize)
    -   Trạng thái (status): `pending`, `confirmed`, `completed`, `cancelled`
    -   Ghi chú (notes)
    -   Các giá trị tiền (totalAmount, discountAmount, taxAmount, finalAmount)
    -   Thời gian đặt (orderTime)
    -   Thời gian xác nhận (confirmedAt)
    -   Thời gian hoàn tất (completedAt)
    -   Thời gian hủy (cancelledAt)
    -   Lý do hủy (cancellationReason)

### 2.2 Chi Tiết Đơn Hàng (Order Items)

-   **Định nghĩa**: Danh sách các món ăn/đồ uống trong đơn hàng
-   **Mục đích**: Ghi nhận chi tiết từng món khách gọi
-   **Thông tin chứa**:
    -   Món ăn (itemId)
    -   Số lượng (quantity)
    -   Đơn giá (unitPrice)
    -   Tổng tiền (totalPrice)
    -   Yêu cầu đặc biệt (specialRequest)
    -   Trạng thái (status): `pending`, `ready`, `cancelled`

### 2.3 Đơn Bếp (Kitchen Orders)

-   **Định nghĩa**: Đơn hàng được chuyển đến bếp để chuẩn bị (quan hệ 1-1 với Order)
-   **Mục đích**: Quản lý quy trình nấu nướng, theo dõi tiến độ
-   **Thông tin chứa**:
    -   Đơn hàng liên kết (orderId) - Unique, 1-1 với Order
    -   Đầu bếp phụ trách (staffId)
    -   Trạng thái (status): `pending`, `preparing`, `ready`, `completed`
    -   Thời gian chuẩn bị thực tế (prepTimeActual)
    -   Thời gian bắt đầu (startedAt)
    -   Thời gian hoàn tất (completedAt)

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Đơn Hàng

#### 3.1.1 Tạo Đơn Hàng Mới

**Mục tiêu**: Nhân viên phục vụ tạo đơn hàng mới cho khách

**Người tham gia chính**: Nhân viên phục vụ (Waiter)

**Điều kiện tiên quyết**:

-   Khách đã ngồi tại bàn hoặc tại quầy
-   Bàn đang ở trạng thái "Có sẵn" hoặc "Đã đặt"
-   Người dùng có quyền "Tạo đơn hàng"

**Quy trình chi tiết**:

1. **Bước 1**: Nhân viên phục vụ chọn bàn hoặc quét QR code trên bàn
2. **Bước 2**: Hệ thống kiểm tra:
    - Bàn có đang được sử dụng không
    - Nếu đã có đơn hàng chưa thanh toán, mở đơn đó để thêm món
    - Nếu chưa có, tạo đơn hàng mới
3. **Bước 3**: Mở giao diện tạo đơn hàng hiển thị:
    - Thông tin bàn (số bàn, sức chứa)
    - Menu đầy đủ (theo danh mục)
    - Giỏ hàng hiện tại (nếu có)
4. **Bước 4**: Nhân viên thêm món vào đơn:
    - Chọn danh mục món ăn
    - Chọn món ăn
    - Nhập số lượng
    - Nhập yêu cầu đặc biệt (nếu có): "Không hành", "Ít cay", "Tách riêng"
    - Thêm vào giỏ hàng
5. **Bước 5**: Lặp lại Bước 4 cho tất cả các món
6. **Bước 6**: Xem lại giỏ hàng:
    - Danh sách món
    - Số lượng
    - Giá từng món
    - Tổng tiền tạm tính
7. **Bước 7**: Nhập thông tin bổ sung:
    - Số lượng khách (Head Count)
    - Tên khách (tùy chọn)
    - Số điện thoại (tùy chọn)
    - Ghi chú chung cho đơn (tùy chọn)
8. **Bước 8**: Xác nhận tạo đơn
9. **Bước 9**: Hệ thống:
    - Tạo số đơn hàng (Order Number) tự động
    - Tính toán giá và tổng tiền
    - Lưu đơn hàng vào database
    - Cập nhật trạng thái bàn thành "Đang sử dụng"
    - Tạo đơn bếp (Kitchen Order) nếu có món cần nấu
10. **Bước 10**: Gửi đơn đến bếp
11. **Bước 11**: Thông báo real-time cho bếp
12. **Bước 12**: In phiếu order (nếu cần)
13. **Bước 13**: Ghi log tạo đơn

**Thông tin cần nhập**:

| Trường              | Loại     | Bắt buộc | Mô tả                                   |
| ------------------- | -------- | -------- | --------------------------------------- |
| Bàn                 | Select   | ✓        | Chọn bàn khách ngồi                     |
| Món ăn              | Multiple | ✓        | Chọn món từ menu                        |
| Số lượng            | Number   | ✓        | Số lượng từng món (mặc định: 1)        |
| Yêu cầu đặc biệt    | Text     | ✗        | Ghi chú cho từng món                    |
| Số lượng khách      | Number   | ✓        | Số người ăn (mặc định: 1)               |
| Tên khách           | Text     | ✗        | Tên khách hàng                          |
| Số điện thoại       | Phone    | ✗        | SĐT liên hệ                             |
| Ghi chú đơn hàng    | Textarea | ✗        | Ghi chú chung                           |

**Xử lý lỗi**:

-   Bàn không tồn tại: "Bàn không tồn tại trong hệ thống"
-   Món ăn hết hàng: "Món [tên món] hiện đang hết. Vui lòng chọn món khác"
-   Giỏ hàng trống: "Vui lòng chọn ít nhất một món"
-   Lỗi kết nối bếp: "Không thể gửi đơn đến bếp. Vui lòng thử lại"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Tạo đơn hàng
-   Số đơn: [order_number]
-   Bàn: [table_number]
-   Số món: [item_count]
-   Tổng tiền: [total_amount]
-   Thời gian: [timestamp]

---

#### 3.1.2 Xem Danh Sách Đơn Hàng

**Mục tiêu**: Xem tất cả đơn hàng trong hệ thống

**Người tham gia chính**: Nhân viên phục vụ, Quản lý, Cashier

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Đơn Hàng"
2. **Bước 2**: Hệ thống hiển thị danh sách đơn hàng với:
    - Số đơn hàng
    - Số bàn
    - Nhân viên phục vụ
    - Số lượng món
    - Tổng tiền
    - Trạng thái
    - Thời gian đặt
    - Nút hành động (Xem, Sửa, Hủy món, Gửi lại bếp)
3. **Bước 3**: Tính năng lọc:
    - Trạng thái (Chờ xác nhận, Đang chuẩn bị, Sẵn sàng, Đã phục vụ, Hoàn tất, Đã hủy)
    - Bàn
    - Nhân viên phục vụ
    - Thời gian (Hôm nay, Tuần này, Tháng này, Tùy chọn)
4. **Bước 4**: Tìm kiếm theo:
    - Số đơn hàng
    - Tên khách hàng
    - Số điện thoại
5. **Bước 5**: Sắp xếp theo:
    - Thời gian (Mới nhất, Cũ nhất)
    - Tổng tiền (Cao - Thấp)
    - Trạng thái

**Hiển thị theo bàn**:

-   Xem các đơn hàng theo từng bàn
-   Nhóm đơn hàng của cùng một bàn
-   Hiển thị tổng tiền của bàn

**Hiển thị theo trạng thái**:

-   Nhóm đơn theo trạng thái
-   Ưu tiên hiển thị đơn đang xử lý
-   Cảnh báo đơn quá lâu chưa phục vụ

---

#### 3.1.3 Xem Chi Tiết Đơn Hàng

**Mục tiêu**: Xem thông tin đầy đủ của một đơn hàng

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách đơn hàng, nhấn vào số đơn hoặc nút "Xem chi tiết"
2. **Bước 2**: Mở trang chi tiết hiển thị:

**Thông tin đơn hàng**:
    - Số đơn hàng
    - Trạng thái
    - Bàn
    - Nhân viên phục vụ
    - Số lượng khách
    - Tên khách hàng (nếu có)
    - Số điện thoại (nếu có)
    - Ghi chú chung

**Danh sách món ăn**:
    - Tên món
    - Số lượng
    - Đơn giá
    - Tổng tiền
    - Yêu cầu đặc biệt
    - Trạng thái từng món

**Thông tin thời gian**:
    - Thời gian đặt (Order Time)
    - Thời gian xác nhận (Confirmed At)
    - Thời gian gửi bếp
    - Thời gian hoàn tất (Completed At)
    - Thời gian chờ tổng

**Thông tin thanh toán**:
    - Tổng tiền món ăn
    - Thuế (nếu có)
    - Phí dịch vụ (nếu có)
    - Giảm giá (nếu có)
    - Tổng cộng

**Lịch sử thay đổi**:
    - Các lần thêm/sửa/hủy món
    - Người thực hiện
    - Thời gian thay đổi
    - Lý do (nếu có)

3. **Bước 3**: Hiển thị các nút hành động:
    - Thêm món
    - Sửa đơn
    - Hủy món
    - In phiếu order
    - Gửi lại bếp
    - Tạo hóa đơn
    - Quay lại

---

#### 3.1.4 Chỉnh Sửa Đơn Hàng (Thêm Món)

**Mục tiêu**: Thêm món mới vào đơn hàng đã tồn tại

**Người tham gia chính**: Nhân viên phục vụ

**Điều kiện tiên quyết**:

-   Đơn hàng chưa hoàn tất
-   Hóa đơn chưa được tạo

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết đơn hàng, nhấn nút "Thêm món"
2. **Bước 2**: Mở giao diện chọn món (tương tự tạo đơn mới)
3. **Bước 3**: Chọn món ăn từ menu
4. **Bước 4**: Nhập số lượng và yêu cầu đặc biệt
5. **Bước 5**: Thêm vào giỏ hàng
6. **Bước 6**: Xác nhận thêm món
7. **Bước 7**: Hệ thống:
    - Thêm món vào đơn hàng
    - Cập nhật tổng tiền
    - Tạo order item mới với trạng thái "Chờ xác nhận"
    - Gửi món mới đến bếp
8. **Bước 8**: Thông báo real-time cho bếp
9. **Bước 9**: Ghi log thêm món

**Lưu ý**:

-   Món mới sẽ có trạng thái riêng, không ảnh hưởng món cũ
-   Nếu bếp đã bắt đầu nấu món cũ, món mới tính như đơn bổ sung
-   Có thể thêm nhiều lần trong cùng một đơn hàng

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Thêm món vào đơn
-   Số đơn: [order_number]
-   Món thêm: [item_name]
-   Số lượng: [quantity]
-   Thời gian: [timestamp]

---

#### 3.1.5 Hủy Món trong Đơn Hàng

**Mục tiêu**: Loại bỏ một hoặc nhiều món khỏi đơn hàng

**Người tham gia chính**: Nhân viên phục vụ, Quản lý

**Điều kiện tiên quyết**:

-   Đơn hàng chưa hoàn tất
-   Người dùng có quyền hủy món

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết đơn hàng, chọn món cần hủy
2. **Bước 2**: Nhấn nút "Hủy món"
3. **Bước 3**: Hiển thị hộp thoại xác nhận:
    - "Bạn có chắc chắn muốn hủy [tên món] x[số lượng]?"
    - Nhập lý do hủy (bắt buộc):
        - Khách đổi ý
        - Món hết
        - Nhập sai
        - Khách không muốn chờ
        - Khác (nhập lý do)
4. **Bước 4**: Người dùng xác nhận hủy
5. **Bước 5**: Hệ thống kiểm tra trạng thái món:
    - **Nếu chưa gửi bếp**: Hủy trực tiếp, không tính phí
    - **Nếu đã gửi bếp nhưng chưa nấu**: Thông báo bếp hủy, không tính phí
    - **Nếu đang nấu**: Yêu cầu xác nhận quản lý, có thể tính phí
    - **Nếu đã xong**: Không cho phép hủy, chỉ có thể hoàn món
6. **Bước 6**: Cập nhật trạng thái món thành "Đã hủy"
7. **Bước 7**: Thông báo bếp (nếu món đã gửi)
8. **Bước 8**: Cập nhật lại tổng tiền đơn hàng
9. **Bước 9**: Ghi log hủy món với lý do

**Xử lý đặc biệt**:

-   Nếu hủy tất cả món trong đơn → Hủy toàn bộ đơn hàng
-   Nếu món đã nấu xong → Chuyển sang quy trình hoàn món
-   Nếu hủy quá nhiều → Cảnh báo và yêu cầu xác nhận quản lý

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Hủy món
-   Số đơn: [order_number]
-   Món hủy: [item_name]
-   Số lượng: [quantity]
-   Lý do: [cancellation_reason]
-   Tính phí: [charged_yes_no]
-   Thời gian: [timestamp]

---

#### 3.1.6 Thay Đổi Số Lượng Món

**Mục tiêu**: Tăng hoặc giảm số lượng món trong đơn hàng

**Người tham gia chính**: Nhân viên phục vụ

**Điều kiện tiên quyết**:

-   Món chưa hoàn tất
-   Đơn hàng chưa thanh toán

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết đơn hàng, chọn món cần thay đổi số lượng
2. **Bước 2**: Nhấn nút "+/-" hoặc nhập số lượng mới
3. **Bước 3**: Hệ thống kiểm tra:

**Nếu tăng số lượng**:
    - Thêm món như đơn mới
    - Gửi phần tăng thêm đến bếp
    - Cập nhật tổng tiền

**Nếu giảm số lượng**:
    - Kiểm tra trạng thái món
    - Nếu chưa nấu: Giảm số lượng trực tiếp
    - Nếu đã nấu: Không cho phép giảm, yêu cầu hủy món

4. **Bước 4**: Xác nhận thay đổi
5. **Bước 5**: Cập nhật database
6. **Bước 6**: Thông báo bếp (nếu cần)
7. **Bước 7**: Ghi log thay đổi

---

#### 3.1.7 Gửi Lại Đơn Đến Bếp

**Mục tiêu**: Gửi lại đơn hàng hoặc món cụ thể đến bếp

**Người tham gia chính**: Nhân viên phục vụ, Quản lý

**Trường hợp sử dụng**:

-   Bếp không nhận được đơn (lỗi kết nối)
-   Món bị bỏ sót
-   Cần ưu tiên món khẩn cấp

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết đơn hàng, chọn món cần gửi lại
2. **Bước 2**: Nhấn nút "Gửi lại bếp"
3. **Bước 3**: Chọn độ ưu tiên:
    - Bình thường
    - Khẩn cấp (VIP, khách chờ lâu)
4. **Bước 4**: Nhập ghi chú cho bếp (tùy chọn)
5. **Bước 5**: Xác nhận gửi
6. **Bước 6**: Hệ thống:
    - Gửi thông báo real-time đến bếp
    - Cập nhật độ ưu tiên
    - Ghi nhận thời gian gửi lại
7. **Bước 7**: Bếp xác nhận đã nhận
8. **Bước 8**: Ghi log gửi lại

---

#### 3.1.8 Hủy Toàn Bộ Đơn Hàng

**Mục tiêu**: Hủy toàn bộ đơn hàng

**Người tham gia chính**: Nhân viên phục vụ, Quản lý

**Điều kiện tiên quyết**:

-   Đơn hàng chưa có món nào được phục vụ
-   Người dùng có quyền hủy đơn
-   Có lý do hủy hợp lệ

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết đơn hàng, nhấn nút "Hủy đơn hàng"
2. **Bước 2**: Hiển thị hộp thoại xác nhận:
    - "Bạn có chắc chắn muốn hủy toàn bộ đơn hàng?"
    - "Số đơn: [order_number]"
    - "Tổng tiền: [total_amount]"
    - Nhập lý do hủy (bắt buộc):
        - Khách hủy
        - Nhập sai đơn
        - Khách rời đi không chờ
        - Sự cố trong nhà hàng
        - Khác
3. **Bước 3**: Nếu là quản lý, xác nhận trực tiếp
4. **Bước 4**: Nếu là nhân viên, yêu cầu xác nhận quản lý
5. **Bước 5**: Hệ thống:
    - Cập nhật trạng thái đơn hàng thành "Đã hủy"
    - Cập nhật trạng thái tất cả món thành "Đã hủy"
    - Thông báo bếp dừng nấu (nếu đang nấu)
    - Giải phóng bàn về trạng thái "Có sẵn"
    - Lưu lý do hủy
6. **Bước 6**: Xử lý chi phí (nếu có món đã nấu):
    - Tính phí theo chính sách
    - Tạo hóa đơn hủy (nếu cần)
7. **Bước 7**: Ghi log hủy đơn

**Xử lý chi phí khi hủy**:

-   Món chưa gửi bếp: Không tính phí
-   Món đã gửi nhưng chưa nấu: Không tính phí
-   Món đang nấu: Tính 50% giá trị
-   Món đã nấu xong: Tính 100% giá trị

**Ghi log**:

-   Người dùng: [username]
-   Người xác nhận: [manager_username]
-   Hành động: Hủy toàn bộ đơn hàng
-   Số đơn: [order_number]
-   Bàn: [table_number]
-   Lý do: [cancellation_reason]
-   Số món: [item_count]
-   Tổng tiền: [total_amount]
-   Chi phí tính: [charged_amount]
-   Thời gian: [timestamp]

---

### 3.2 Quản Lý Đơn Bếp (Kitchen Orders)

#### 3.2.1 Xem Danh Sách Đơn Bếp

**Mục tiêu**: Đầu bếp xem các đơn hàng cần chuẩn bị

**Người tham gia chính**: Đầu bếp, Phó bếp

**Quy trình chi tiết**:

1. **Bước 1**: Đầu bếp mở dashboard nhà bếp
2. **Bước 2**: Hệ thống hiển thị danh sách đơn theo trạng thái:

**Tab "Chờ chuẩn bị" (Pending)**:
    - Đơn mới vừa nhận
    - Sắp xếp theo thời gian (cũ nhất trước)
    - Hiển thị độ ưu tiên
    - Thời gian chờ hiện tại

**Tab "Đang nấu" (Preparing)**:
    - Đơn đang được xử lý
    - Hiển thị đầu bếp phụ trách
    - Thời gian bắt đầu nấu
    - Thời gian dự kiến hoàn tất

**Tab "Sẵn sàng" (Ready)**:
    - Món đã nấu xong
    - Chờ nhân viên phục vụ lấy
    - Thời gian chờ lấy

3. **Bước 3**: Mỗi đơn hiển thị:
    - Số đơn hàng / Số bàn
    - Danh sách món cần nấu
    - Số lượng từng món
    - Yêu cầu đặc biệt (in đậm, màu đỏ)
    - Độ ưu tiên (icon ngôi sao)
    - Thời gian chờ
4. **Bước 4**: Lọc và sắp xếp:
    - Theo độ ưu tiên (Cao → Thấp)
    - Theo thời gian (Cũ → Mới)
    - Theo loại món (Khai vị, Chính, Tráng miệng)
5. **Bước 5**: Tính năng tìm kiếm:
    - Theo số đơn
    - Theo số bàn
    - Theo món ăn

---

#### 3.2.2 Nhận và Bắt Đầu Nấu Đơn

**Mục tiêu**: Đầu bếp nhận đơn và bắt đầu chuẩn bị

**Quy trình chi tiết**:

1. **Bước 1**: Đầu bếp xem đơn trong tab "Chờ chuẩn bị"
2. **Bước 2**: Chọn đơn cần nấu (ưu tiên đơn cũ hoặc VIP)
3. **Bước 3**: Nhấn nút "Bắt đầu nấu"
4. **Bước 4**: Hệ thống:
    - Cập nhật trạng thái đơn bếp thành "Đang chuẩn bị"
    - Ghi nhận đầu bếp phụ trách
    - Lưu thời gian bắt đầu
    - Chuyển đơn sang tab "Đang nấu"
5. **Bước 5**: Thông báo nhân viên phục vụ (optional):
    - "Đơn [số đơn] đang được chuẩn bị"
6. **Bước 6**: Đầu bếp bắt đầu nấu các món theo đơn
7. **Bước 7**: Ghi log bắt đầu

**Lưu ý**:

-   Đầu bếp có thể nhận nhiều đơn cùng lúc
-   Hệ thống tính thời gian chuẩn bị dự kiến dựa trên:
    - Thời gian chuẩn bị từng món (prep time)
    - Số lượng món trong đơn
    - Số đơn đang xử lý
-   Cảnh báo nếu đơn chờ quá lâu (> 15 phút)

---

#### 3.2.3 Cập Nhật Tiến Độ Món Ăn

**Mục tiêu**: Cập nhật trạng thái từng món trong quá trình nấu

**Quy trình chi tiết**:

1. **Bước 1**: Trong chi tiết đơn đang nấu, chọn món
2. **Bước 2**: Cập nhật trạng thái món:
    - Đang chuẩn bị (Preparing)
    - Sắp xong (Almost ready)
    - Sẵn sàng (Ready)
3. **Bước 3**: Hệ thống cập nhật trạng thái món
4. **Bước 4**: Nếu tất cả món trong đơn đã "Sẵn sàng":
    - Tự động chuyển đơn sang tab "Sẵn sàng"
    - Thông báo cho nhân viên phục vụ
    - Ghi nhận thời gian hoàn tất
5. **Bước 5**: Ghi log cập nhật

**Thông báo real-time**:

-   Khi món sắp xong: Thông báo nhân viên chuẩn bị lấy
-   Khi tất cả món xong: Thông báo nhân viên lấy ngay
-   Khi món chờ lấy quá lâu (> 5 phút): Cảnh báo món đang nguội

---

#### 3.2.4 Hoàn Tất Đơn Bếp

**Mục tiêu**: Đánh dấu đơn đã nấu xong và sẵn sàng phục vụ

**Quy trình chi tiết**:

1. **Bước 1**: Khi tất cả món đã nấu xong, nhấn "Hoàn tất"
2. **Bước 2**: Hệ thống:
    - Cập nhật trạng thái đơn bếp thành "Sẵn sàng"
    - Ghi nhận thời gian hoàn tất
    - Tính thời gian chuẩn bị thực tế
    - Chuyển đơn sang tab "Sẵn sàng"
3. **Bước 3**: Gửi thông báo real-time cho nhân viên phục vụ:
    - "Đơn [số đơn] - Bàn [số bàn] sẵn sàng"
    - Hiển thị popup hoặc âm thanh thông báo
4. **Bước 4**: Nhân viên phục vụ xác nhận đã nhận thông báo
5. **Bước 5**: Ghi log hoàn tất

**Thống kê hiệu suất**:

-   Thời gian chuẩn bị trung bình
-   So sánh với thời gian dự kiến
-   Số đơn hoàn tất / ca làm việc
-   Đánh giá hiệu suất đầu bếp

---

#### 3.2.5 Xử Lý Đơn Hủy từ Nhân Viên Phục Vụ

**Mục tiêu**: Nhận và xử lý yêu cầu hủy món từ phục vụ

**Quy trình chi tiết**:

1. **Bước 1**: Nhận thông báo hủy món từ nhân viên phục vụ
2. **Bước 2**: Hệ thống hiển thị cảnh báo trên màn hình bếp:
    - "Yêu cầu hủy: Món [tên món] - Đơn [số đơn]"
    - Lý do hủy
3. **Bước 3**: Đầu bếp kiểm tra:
    - Món đã nấu chưa?
    - Nếu chưa bắt đầu: Chấp nhận hủy ngay
    - Nếu đang nấu: Xác nhận với quản lý bếp
    - Nếu đã xong: Từ chối hủy, yêu cầu xử lý khác
4. **Bước 4**: Đầu bếp xác nhận hoặc từ chối hủy
5. **Bước 5**: Hệ thống:
    - Cập nhật trạng thái món
    - Thông báo lại nhân viên phục vụ
    - Cập nhật đơn bếp
6. **Bước 6**: Ghi log xử lý hủy

---

### 3.3 Quản Lý Phục Vụ Món Ăn

#### 3.3.1 Nhận Thông Báo Món Sẵn Sàng

**Mục tiêu**: Nhân viên phục vụ nhận thông báo món đã xong từ bếp

**Quy trình tự động**:

1. **Bước 1**: Khi bếp đánh dấu món "Sẵn sàng"
2. **Bước 2**: Hệ thống gửi thông báo real-time:
    - Hiển thị popup trên màn hình nhân viên
    - Phát âm thanh thông báo
    - Gửi notification đến thiết bị di động
3. **Bước 3**: Thông báo bao gồm:
    - Số đơn hàng
    - Số bàn
    - Danh sách món sẵn sàng
    - Thời gian món đã sẵn sàng
4. **Bước 4**: Nhân viên xem danh sách món sẵn sàng
5. **Bước 5**: Nhân viên đến bếp lấy món

---

#### 3.3.2 Xác Nhận Lấy Món từ Bếp

**Mục tiêu**: Ghi nhận nhân viên đã lấy món từ bếp

**Quy trình chi tiết**:

1. **Bước 1**: Nhân viên phục vụ đến bếp
2. **Bước 2**: Kiểm tra món ăn:
    - Đúng món theo đơn
    - Đầy đủ số lượng
    - Chất lượng món ăn ổn
3. **Bước 3**: Scan mã đơn hoặc nhấn "Đã lấy món"
4. **Bước 4**: Hệ thống:
    - Cập nhật trạng thái món thành "Đã lấy"
    - Ghi nhận thời gian lấy món
    - Ghi nhận nhân viên lấy món
5. **Bước 5**: Nhân viên mang món ra phục vụ khách
6. **Bước 6**: Ghi log lấy món

**Xử lý nếu món không đúng**:

-   Nhân viên báo lại cho bếp
-   Bếp kiểm tra và xử lý
-   Ghi nhận vấn đề để cải thiện

---

#### 3.3.3 Xác Nhận Đã Phục Vụ Khách

**Mục tiêu**: Ghi nhận món đã được mang ra cho khách

**Quy trình chi tiết**:

1. **Bước 1**: Sau khi mang món ra bàn
2. **Bước 2**: Nhân viên mở đơn hàng trên thiết bị
3. **Bước 3**: Đánh dấu các món đã phục vụ
4. **Bước 4**: Hệ thống:
    - Cập nhật trạng thái món thành "Đã phục vụ"
    - Ghi nhận thời gian phục vụ
    - Tính thời gian từ đặt đến phục vụ
5. **Bước 5**: Kiểm tra xem tất cả món đã phục vụ chưa
6. **Bước 6**: Nếu tất cả món đã phục vụ:
    - Cập nhật trạng thái đơn hàng thành "Đã phục vụ"
    - Sẵn sàng tạo hóa đơn
7. **Bước 7**: Ghi log phục vụ

**Theo dõi chất lượng phục vụ**:

-   Thời gian từ gọi món đến phục vụ
-   Thời gian chờ trung bình
-   Đánh giá từ khách (nếu có)

---

### 3.4 Báo Cáo và Phân Tích

#### 3.4.1 Báo Cáo Đơn Hàng

**Mục tiêu**: Thống kê và phân tích đơn hàng

**Người tham gia chính**: Quản lý

**Các loại báo cáo**:

1. **Báo cáo tổng quan đơn hàng**:
    - Tổng số đơn theo ngày/tuần/tháng
    - Số lượng theo trạng thái
    - Tỷ lệ hoàn tất
    - Tỷ lệ hủy
    - Doanh thu từ đơn hàng

2. **Báo cáo món ăn bán chạy**:
    - Top món ăn được gọi nhiều nhất
    - Số lượng bán từng món
    - Doanh thu từng món
    - Xu hướng theo thời gian

3. **Báo cáo hiệu suất phục vụ**:
    - Thời gian chuẩn bị trung bình
    - Thời gian chờ trung bình
    - Thời gian phục vụ trung bình
    - Số đơn xử lý / nhân viên
    - Đánh giá chất lượng phục vụ

4. **Báo cáo theo ca làm việc**:
    - Số đơn / ca
    - Doanh thu / ca
    - Giờ cao điểm
    - Hiệu suất nhân viên / ca

5. **Báo cáo đơn hủy**:
    - Số lượng đơn hủy
    - Lý do hủy
    - Tỷ lệ hủy theo nhân viên
    - Thiệt hại từ đơn hủy

---

#### 3.4.2 Phân Tích Thời Gian Phục Vụ

**Mục tiêu**: Tối ưu hóa thời gian từ đặt món đến phục vụ

**Chỉ số theo dõi**:

-   Thời gian đặt món (Order taking time)
-   Thời gian chờ bếp (Kitchen waiting time)
-   Thời gian nấu (Cooking time)
-   Thời gian chờ lấy món (Pickup waiting time)
-   Thời gian phục vụ (Serving time)
-   Tổng thời gian (Total time)

**Phân tích**:

1. Xác định điểm nghẽn (bottleneck):
    - Bếp chậm
    - Nhân viên chậm lấy món
    - Thiếu nhân viên phục vụ

2. So sánh với tiêu chuẩn:
    - Thời gian tiêu chuẩn cho từng loại món
    - Thời gian trung bình của nhà hàng
    - So sánh giữa các ca làm việc

3. Đề xuất cải thiện:
    - Tăng nhân sự tại khâu nghẽn
    - Đào tạo nhân viên
    - Tối ưu quy trình

---

#### 3.4.3 Phân Tích Đơn Hủy

**Mục tiêu**: Giảm thiểu số lượng đơn bị hủy

**Phân tích**:

1. **Phân loại lý do hủy**:
    - Khách đổi ý: X%
    - Món hết: Y%
    - Nhập sai: Z%
    - Chờ quá lâu: W%
    - Khác: V%

2. **Phân tích theo thời gian**:
    - Giờ nào hay bị hủy nhất
    - Ngày nào hay bị hủy nhất
    - Xu hướng tăng/giảm

3. **Phân tích theo nhân viên**:
    - Nhân viên nào có tỷ lệ hủy cao
    - Nguyên nhân (nhập sai, tư vấn không tốt)

4. **Tác động tài chính**:
    - Tổng giá trị đơn hủy
    - Chi phí thực tế (nguyên liệu đã dùng)
    - Thiệt hại ước tính

**Biện pháp giảm đơn hủy**:

-   Đào tạo nhân viên tư vấn tốt hơn
-   Cập nhật menu real-time (món hết)
-   Cải thiện quy trình đặt món
-   Giảm thời gian chờ
-   Kiểm tra kỹ trước khi xác nhận đơn

---

## 4. Quy Trình Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│          QUẢN LÝ ĐƠN HÀNG - QUY TRÌNH TỔNG             │
└─────────────────────────────────────────────────────────┘

1. TIẾP NHẬN KHÁCH
   └─ Khách ngồi vào bàn
      ├─ Nhân viên chào hỏi
      └─ Tư vấn menu

2. TẠO ĐƠN HÀNG
   └─ Nhân viên phục vụ nhập đơn
      ├─ Chọn bàn
      ├─ Thêm món từ menu
      ├─ Nhập số lượng và yêu cầu đặc biệt
      ├─ Xác nhận với khách
      └─ Gửi đơn

3. XỬ LÝ BẾP
   ├─ Bếp nhận đơn
   ├─ Đầu bếp nhận và bắt đầu nấu
   ├─ Cập nhật tiến độ từng món
   └─ Hoàn tất và báo sẵn sàng

4. PHỤC VỤ
   ├─ Nhân viên nhận thông báo món xong
   ├─ Đến bếp lấy món
   ├─ Kiểm tra món
   ├─ Mang ra phục vụ khách
   └─ Xác nhận đã phục vụ

5. THEO DÕI VÀ BỔ SUNG
   ├─ Khách gọi thêm món → Quay lại Bước 2
   ├─ Khách hủy món → Xử lý hủy
   └─ Khách thay đổi → Cập nhật đơn

6. HOÀN TẤT
   ├─ Khách ăn xong
   ├─ Gọi thanh toán
   ├─ Tạo hóa đơn từ đơn hàng
   ├─ Khách thanh toán
   └─ Hoàn tất đơn hàng

7. PHÂN TÍCH
   ├─ Xem báo cáo đơn hàng
   ├─ Phân tích thời gian phục vụ
   ├─ Phân tích món bán chạy
   └─ Cải thiện quy trình
```

---

## 5. Các Tác Nhân (Actors) và Quyền Hạn

| Tác Nhân            | Tạo đơn | Xem | Sửa | Hủy món | Hủy đơn | Gửi bếp | Nhận đơn bếp | Cập nhật trạng thái |
| ------------------- | ------- | --- | --- | ------- | ------- | ------- | ------------ | ------------------- |
| Khách hàng          | ✗       | ✗   | ✗   | ✗       | ✗       | ✗       | ✗            | ✗                   |
| Nhân viên phục vụ   | ✓       | ✓   | ✓   | ✓       | ✗       | ✓       | ✗            | ✓ (phục vụ)         |
| Đầu bếp             | ✗       | ✓   | ✗   | ✗       | ✗       | ✗       | ✓            | ✓ (nấu)             |
| Quản lý             | ✓       | ✓   | ✓   | ✓       | ✓       | ✓       | ✓            | ✓                   |
| Cashier/Thu ngân    | ✗       | ✓   | ✗   | ✗       | ✗       | ✗       | ✗            | ✗                   |
| Admin               | ✓       | ✓   | ✓   | ✓       | ✓       | ✓       | ✓            | ✓                   |

---

## 6. Công Nghệ và Công Cụ (Đã triển khai)

### 6.1 Công Nghệ Sử Dụng

-   **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
-   **State Management**: Zustand
-   **Backend**: NestJS, TypeScript
-   **Database**: PostgreSQL với Prisma ORM
-   **Real-time**: NestJS WebSocket Gateway (Socket.io adapter)
-   **Authentication**: JWT (Access Token 15 phút, Refresh Token 7 ngày)

### 6.2 Các Module Liên Quan

-   **OrderController**: Quản lý CRUD đơn hàng (`/orders`)
-   **KitchenController**: Quản lý đơn bếp (`/kitchen/orders`)
-   **OrderGateway**: WebSocket cho cập nhật real-time
-   **KitchenGateway**: WebSocket cho màn hình bếp
-   **OrderService**: Business logic xử lý đơn
-   **KitchenService**: Business logic xử lý bếp

### 6.3 API Endpoints

**Order Controller:**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/orders/count` | Đếm đơn theo filter |
| GET | `/orders` | Danh sách đơn (pagination) |
| GET | `/orders/:id` | Chi tiết đơn |
| POST | `/orders` | Tạo đơn mới |
| PATCH | `/orders/:id/items` | Thêm món |
| DELETE | `/orders/:id/items/:itemId` | Hủy món |
| DELETE | `/orders/:id` | Hủy đơn |
| PATCH | `/orders/:id/status` | Cập nhật trạng thái |
| PATCH | `/orders/:id/items/:itemId/serve` | Đánh dấu đã phục vụ |

**Kitchen Controller:**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/kitchen/orders` | Danh sách đơn bếp |
| GET | `/kitchen/orders/:id` | Chi tiết đơn bếp |
| PATCH | `/kitchen/orders/:id/start` | Bắt đầu chuẩn bị |
| PATCH | `/kitchen/orders/:id/complete` | Hoàn tất |
| PATCH | `/kitchen/orders/:id/cancel` | Hủy đơn bếp |

---

## 7. Bảng Tóm Tắt Lỗi và Xử Lý

| Lỗi | Nguyên Nhân | Xử Lý | Exception Class |
|-----|-------------|-------|-----------------|
| Order not found | ID không tồn tại | Trả về 404 | `OrderNotFoundException` |
| Order item not found | Item ID không tồn tại | Trả về 404 | `OrderItemNotFoundException` |
| Table not found | Table ID không tồn tại | Trả về 404 | `TableNotFoundException` |
| Table occupied | Bàn đang có khách | Trả về 400 | `TableOccupiedException` |
| Cannot modify completed | Đơn đã hoàn tất | Trả về 400 | `CannotModifyCompletedOrderException` |
| Cannot modify cancelled | Đơn đã hủy | Trả về 400 | `CannotModifyCancelledOrderException` |
| Already cancelled | Đơn đã bị hủy trước đó | Trả về 400 | `OrderAlreadyCancelledException` |
| Bill already created | Đơn đã có hóa đơn | Trả về 400 | `BillAlreadyCreatedException` |
| Invalid status | Trạng thái không hợp lệ | Trả về 400 | `InvalidOrderStatusException` |

---

## 8. Tính Năng Chưa Triển Khai (Trong Tương Lai)

> **Lưu ý**: Các tính năng dưới đây chưa được triển khai trong phiên bản hiện tại.

-   **Self-ordering (Khách tự đặt)**: Khách scan QR trên bàn và tự đặt món
-   **AI Menu Recommendation**: Gợi ý món dựa trên lịch sử và sở thích
-   **Voice Order**: Nhân viên đặt món bằng giọng nói
-   **Multi-language Menu**: Menu đa ngôn ngữ cho khách quốc tế
-   **Thermal Printer Integration**: In phiếu order tự động
-   **Combo/Bundle Deal**: Tự động áp dụng combo khi đủ điều kiện
-   **Split Bill by Item**: Chia hóa đơn theo từng món
-   **Predictive Ordering**: Dự đoán nhu cầu nguyên liệu dựa trên đơn hàng
-   **Customer Feedback**: Khách đánh giá món ăn ngay sau khi ăn
-   **Mobile App**: App riêng cho nhân viên phục vụ

---

## 9. Lưu Ý Quan Trọng

1. **Chính xác**: Đảm bảo đơn hàng chính xác, tránh nhầm lẫn
2. **Nhanh chóng**: Xử lý đơn hàng nhanh, giảm thời gian chờ
3. **Giao tiếp rõ ràng**: Thông tin rõ ràng giữa phục vụ và bếp
4. **Real-time**: Cập nhật trạng thái real-time để tất cả đồng bộ
5. **Backup**: Có phương án dự phòng khi hệ thống gặp sự cố
6. **Training**: Đào tạo nhân viên sử dụng hệ thống thành thạo
7. **Customer service**: Ưu tiên trải nghiệm khách hàng
8. **Flexibility**: Linh hoạt xử lý các tình huống đặc biệt
9. **Security**: Bảo mật thông tin khách hàng và đơn hàng
10. **Monitoring**: Theo dõi hiệu suất và cải thiện liên tục

---

## 10. Kết Luận

Hệ thống quản lý đơn hàng là trái tim của ứng dụng quản lý nhà hàng, kết nối mọi bộ phận từ phục vụ, bếp đến thanh toán. Một hệ thống đơn hàng hiệu quả giúp:

-   **Tăng tốc độ phục vụ**: Giảm thời gian chờ của khách
-   **Giảm sai sót**: Đơn hàng chính xác, ít nhầm lẫn
-   **Tối ưu quy trình**: Quy trình rõ ràng, ít lỗi
-   **Tăng doanh thu**: Phục vụ nhiều khách hơn trong cùng thời gian
-   **Cải thiện trải nghiệm**: Khách hài lòng hơn với dịch vụ nhanh và chính xác

Tài liệu này cung cấp hướng dẫn toàn diện cho việc phát triển, triển khai và sử dụng hệ thống quản lý đơn hàng, đảm bảo nhà hàng vận hành hiệu quả và chuyên nghiệp.
