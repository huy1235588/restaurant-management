# Tài Liệu Các Nghiệp Vụ Hệ Thống Quản Lý Nhà Hàng

## 1. Giới Thiệu

Hệ thống quản lý nhà hàng là một ứng dụng toàn diện được thiết kế để hỗ trợ các hoạt động kinh doanh hàng ngày của nhà hàng. Hệ thống bao gồm các nghiệp vụ liên quan đến quản lý bàn ăn, đơn hàng, menu, hóa đơn, nhân viên và các dịch vụ khác.

### 1.1 Tài Liệu Chi Tiết Nghiệp Vụ

Tài liệu này cung cấp tổng quan về các nghiệp vụ chính của hệ thống. Để biết thêm chi tiết về từng nghiệp vụ đã được triển khai, vui lòng tham khảo các tài liệu chi tiết sau:

| Nghiệp Vụ | Tài Liệu Chi Tiết | Biểu Đồ |
|-----------|-------------------|---------|
| **Quản Lý Menu** | [MENU_MANAGEMENT.md](./use_case/MENU_MANAGEMENT.md) | [Biểu đồ](./diagrams/MENU_MANAGEMENT_DIAGRAMS.md) |
| **Quản Lý Đặt Bàn** | [RESERVATION_MANAGEMENT.md](./use_case/RESERVATION_MANAGEMENT.md) | [Biểu đồ](./diagrams/RESERVATION_MANAGEMENT_DIAGRAMS.md) |
| **Quản Lý Đơn Hàng** | [ORDER_MANAGEMENT.md](./use_case/ORDER_MANAGEMENT.md) | [Biểu đồ](./diagrams/ORDER_MANAGEMENT_DIAGRAMS.md) |
| **Quản Lý Tồn Kho** | [INVENTORY_MANAGEMENT.md](./use_case/INVENTORY_MANAGEMENT.md) | [Biểu đồ](./diagrams/INVENTORY_MANAGEMENT_DIAGRAMS.md) |

Mỗi tài liệu chi tiết bao gồm:
- Quy trình nghiệp vụ chi tiết từng bước
- Ma trận phân quyền theo vai trò
- Xử lý lỗi và các trường hợp đặc biệt
- Biểu đồ Mermaid (flowchart, sequence, state, ERD, v.v.)
- Các tính năng nâng cao và tương lai

---

## 2. Các Nghiệp Vụ Chính

### 2.1 Quản Lý Tài Khoản Người Dùng (Authentication & User Management)

#### 2.1.1 Đăng Ký Tài Khoản

-   **Mô tả**: Người dùng mới (nhân viên, quản lý) có thể tạo tài khoản trong hệ thống
-   **Người tham gia**: Nhân viên mới, Quản trị viên
-   **Điều kiện tiên quyết**: Người dùng có email hợp lệ
-   **Quy trình**:
    1. Người dùng điền thông tin: email, mật khẩu, họ tên
    2. Hệ thống kiểm tra email đã tồn tại hay chưa
    3. Nếu email chưa tồn tại, tạo tài khoản mới
    4. Gửi xác nhận qua email (nếu có)
    5. Trả về thông báo thành công

#### 2.1.2 Đăng Nhập

-   **Mô tả**: Người dùng đăng nhập vào hệ thống bằng email và mật khẩu
-   **Người tham gia**: Tất cả người dùng
-   **Quy trình**:
    1. Người dùng nhập email và mật khẩu
    2. Hệ thống xác thực thông tin
    3. Nếu đúng, tạo token JWT (access token & refresh token)
    4. Trả về token và thông tin người dùng
    5. Lưu token trên client (localStorage/cookies)

#### 2.1.3 Quên Mật Khẩu

-   **Mô tả**: Người dùng có thể reset mật khẩu nếu quên
-   **Quy trình**:
    1. Nhập email đã đăng ký
    2. Hệ thống gửi link reset mật khẩu qua email
    3. Người dùng nhấn link, nhập mật khẩu mới
    4. Mật khẩu được cập nhật

#### 2.1.4 Quản Lý Phiên Làm Việc

-   **Mô tả**: Hệ thống tự động refresh token khi hết hạn
-   **Quy trình**:
    1. Khi access token hết hạn, client gửi refresh token
    2. Hệ thống kiểm tra refresh token hợp lệ
    3. Nếu hợp lệ, tạo access token mới
    4. Nếu không, người dùng phải đăng nhập lại
    5. Tự động xóa refresh token cũ sau một khoảng thời gian

---

### 2.2 Quản Lý Menu và Danh Mục

> **📖 Tài liệu chi tiết**: [Quản Lý Menu và Danh Mục](./use_case/MENU_MANAGEMENT.md)  
> **📊 Biểu đồ**: [Biểu Đồ Quản Lý Menu](./diagrams/MENU_MANAGEMENT_DIAGRAMS.md)

#### 2.2.1 Tạo Danh Mục Thực Phẩm

-   **Mô tả**: Quản lý tạo các danh mục (Khai vị, Chính, Tráng miệng, Đồ uống)
-   **Người tham gia**: Quản lý nhà hàng
-   **Quy trình**:
    1. Quản lý chọn "Tạo danh mục"
    2. Nhập tên danh mục, mô tả, ảnh đại diện
    3. Hệ thống kiểm tra danh mục chưa tồn tại
    4. Lưu danh mục vào database
    5. Hiển thị danh mục trên menu

#### 2.2.2 Cập Nhật Thông Tin Danh Mục

-   **Mô tả**: Chỉnh sửa thông tin danh mục (tên, mô tả, ảnh)
-   **Người tham gia**: Quản lý nhà hàng
-   **Quy trình**:
    1. Chọn danh mục cần sửa
    2. Cập nhật thông tin
    3. Lưu thay đổi
    4. Ghi log thay đổi

#### 2.2.3 Xóa Danh Mục

-   **Mô tả**: Xóa danh mục khỏi hệ thống
-   **Điều kiện tiên quyết**: Danh mục không có món ăn nào
-   **Quy trình**:
    1. Chọn danh mục cần xóa
    2. Kiểm tra danh mục có chứa món ăn hay không
    3. Nếu có, thông báo không thể xóa
    4. Nếu không, xóa danh mục
    5. Cập nhật database

#### 2.2.4 Quản Lý Các Món Ăn trong Menu

-   **Mô tả**: Tạo, cập nhật, xóa các món ăn
-   **Người tham gia**: Quản lý nhà hàng, Đầu bếp
-   **Quy trình Tạo Món Ăn**:
    1. Nhập tên món, mô tả, giá tiền
    2. Chọn danh mục
    3. Thêm ảnh, thành phần chính
    4. Xác định thời gian chuẩn bị (prep time)
    5. Lưu vào database
    6. Cập nhật menu

#### 2.2.5 Cập Nhật Giá Món Ăn

-   **Mô tả**: Điều chỉnh giá bán các món ăn theo mùa hoặc thay đổi chi phí
-   **Người tham gia**: Quản lý nhà hàng
-   **Quy trình**:
    1. Chọn món ăn cần cập nhật giá
    2. Nhập giá mới
    3. Lưu thay đổi
    4. Ghi log lịch sử thay đổi giá

#### 2.2.6 Quản Lý Trạng Thái Sẵn Có của Món

-   **Mô tả**: Đánh dấu các món ăn là "hết hàng" hoặc "có sẵn"
-   **Người tham gia**: Đầu bếp, Quản lý
-   **Quy trình**:
    1. Xem danh sách các món ăn
    2. Chọn món cần thay đổi trạng thái
    3. Đánh dấu hết/có sẵn
    4. Cập nhật trên giao diện khách hàng
    5. Thông báo nhân viên phục vụ

---

### 2.3 Quản Lý Bàn Ăn

#### 2.3.1 Tạo và Cấu Hình Bàn

-   **Mô tả**: Thiết lập số bàn, sức chứa, vị trí trong nhà hàng
-   **Người tham gia**: Quản lý nhà hàng
-   **Quy trình**:
    1. Tạo danh sách bàn mới
    2. Đặt tên bàn (A1, A2, V1, v.v.)
    3. Xác định số chỗ ngồi (capacity)
    4. Gán vị trí/khu vực
    5. Lưu cấu hình

#### 2.3.2 Quản Lý Trạng Thái Bàn

-   **Mô tả**: Cập nhật trạng thái bàn (trống, đã đặt, đang sử dụng, cần dọn)
-   **Người tham gia**: Nhân viên phục vụ, Quản lý
-   **Các trạng thái**:
    -   **Trống**: Bàn sẵn sàng phục vụ
    -   **Đã Đặt**: Bàn đã được khách đặt trước
    -   **Đang Sử Dụng**: Khách đang ngồi, gọi đồ ăn
    -   **Cần Dọn**: Khách đã rời, cần dọn sạch trước khi sử dụng
    -   **Bảo Trì**: Bàn cần sửa chữa

#### 2.3.3 Xem Sơ Đồ Nhà Hàng

-   **Mô tả**: Hiển thị bố trí bàn ăn trong nhà hàng theo thời gian thực
-   **Người tham gia**: Nhân viên tiếp nhận, Quản lý
-   **Quy trình**:
    1. Mở sơ đồ nhà hàng
    2. Xem trạng thái tất cả bàn với màu sắc khác nhau
    3. Nhấn vào bàn để xem chi tiết
    4. Thực hiện hành động (ghép bàn, đánh dấu cần dọn, v.v.)

#### 2.3.4 Ghép/Tách Bàn

-   **Mô tả**: Khi nhóm khách nhiều người, có thể ghép nhiều bàn lại
-   **Người tham gia**: Nhân viên tiếp nhận, Quản lý
-   **Quy trình**:
    1. Chọn 2 hoặc nhiều bàn cần ghép
    2. Xác nhận sức chứa kết hợp
    3. Tạo nhóm bàn mới
    4. Liên kết với một hoặc nhiều đơn hàng
    5. Khi tách, cập nhật các đơn hàng tương ứng

---

### 2.4 Quản Lý Đơn Hàng

> **📖 Tài liệu chi tiết**: [Quản Lý Đơn Hàng](./use_case/ORDER_MANAGEMENT.md)  
> **📊 Biểu đồ**: [Biểu Đồ Quản Lý Đơn Hàng](./diagrams/ORDER_MANAGEMENT_DIAGRAMS.md)

#### 2.4.1 Tạo Đơn Hàng Mới

-   **Mô tả**: Nhân viên phục vụ tiếp nhận đơn hàng từ khách
-   **Người tham gia**: Nhân viên phục vụ
-   **Quy trình**:
    1. Chọn bàn hoặc tạo đơn tại quầy
    2. Tạo đơn hàng mới
    3. Thêm các sản phẩm từ menu
    4. Xác nhận đơn
    5. Gửi đơn đến bếp

#### 2.4.2 Chỉnh Sửa Đơn Hàng

-   **Mô tả**: Thay đổi đơn hàng trước khi gửi bếp hoặc trong quá trình phục vụ
-   **Người tham gia**: Nhân viên phục vụ
-   **Quy trình**:
    1. Mở đơn hàng cần sửa
    2. Thêm/xóa/thay đổi sản phẩm
    3. Cập nhật ghi chú (đặc biệt, ít gia vị, v.v.)
    4. Xác nhận thay đổi
    5. Nếu bếp chưa bắt đầu, cập nhật; nếu đã bắt đầu, thêm như đơn bổ sung

#### 2.4.3 Hủy Mặt Hàng từ Đơn Hàng

-   **Mô tả**: Loại bỏ một hoặc nhiều sản phẩm khỏi đơn
-   **Người tham gia**: Nhân viên phục vụ
-   **Quy trình**:
    1. Chọn mặt hàng cần hủy
    2. Nhập lý do hủy
    3. Cập nhật hóa đơn (nếu đã thanh toán một phần)
    4. Thông báo bếp nếu đang nấu
    5. Ghi log lý do hủy

#### 2.4.4 Xem Trạng Thái Đơn Hàng

-   **Mô tả**: Theo dõi tiến độ xử lý đơn hàng từ bếp
-   **Người tham gia**: Nhân viên phục vụ, Quản lý
-   **Các trạng thái**:
    -   **Chờ xác nhận**: Đơn vừa tạo, chờ gửi bếp
    -   **Đang chuẩn bị**: Bếp đang nấu
    -   **Sẵn sàng**: Món ăn đã xong, chờ phục vụ
    -   **Đã phục vụ**: Đã mang ra cho khách
    -   **Hoàn tất**: Khách ăn xong, có thể thanh toán

#### 2.4.5 Quản Lý Đơn Hàng Tại Quầy

-   **Mô tả**: Tạo và theo dõi đơn hàng phục vụ tại quầy (không có bàn)
-   **Người tham gia**: Nhân viên quầy
-   **Quy trình**:
    1. Tạo đơn mới loại "quầy"
    2. Khách lựa chọn sản phẩm
    3. Xác nhận và thanh toán
    4. Khách chờ nhận hàng
    5. Khi sẵn sàng, gọi tên/số gọi để nhận

---

### 2.5 Quản Lý Hóa Đơn và Thanh Toán

#### 2.5.1 Tạo Hóa Đơn

-   **Mô tả**: Tạo hóa đơn từ đơn hàng hoàn tất
-   **Người tham gia**: Nhân viên phục vụ, Quản lý
-   **Quy trình**:
    1. Xác nhận tất cả sản phẩm đã phục vụ
    2. Hệ thống tính tổng tiền (bao gồm thuế, phí dịch vụ)
    3. Tạo hóa đơn chi tiết
    4. Hiển thị hóa đơn cho khách
    5. Lưu hóa đơn vào database

#### 2.5.2 Áp Dụng Giảm Giá/Khuyến Mãi

-   **Mô tả**: Áp dụng mã giảm giá hoặc khuyến mãi cho hóa đơn
-   **Người tham gia**: Nhân viên phục vụ, Quản lý
-   **Quy trình**:
    1. Nhập mã giảm giá (nếu có)
    2. Hệ thống kiểm tra mã hợp lệ
    3. Tính toán tiền giảm
    4. Cập nhật hóa đơn
    5. Hiển thị tổng tiền mới

#### 2.5.3 Thanh Toán Hóa Đơn

-   **Mô tả**: Xử lý thanh toán bằng các phương thức khác nhau
-   **Người tham gia**: Nhân viên phục vụ, Quản lý
-   **Phương thức thanh toán**:
    -   Tiền mặt
    -   Thẻ tín dụng/ghi nợ
    -   Ví điện tử
    -   Chuyển khoản ngân hàng
-   **Quy trình**:
    1. Chọn phương thức thanh toán
    2. Nhập số tiền thanh toán
    3. Xử lý giao dịch
    4. Nếu thành công, cập nhật trạng thái thanh toán
    5. In hoặc gửi hóa đơn qua email
    6. Cập nhật doanh số bán hàng

#### 2.5.4 Thanh Toán Một Phần

-   **Mô tả**: Khách có thể thanh toán một phần và trả phần còn lại sau
-   **Quy trình**:
    1. Nhân viên ghi nhận thanh toán một phần
    2. Hệ thống cập nhật số tiền còn nợ
    3. Lưu thông tin nợ
    4. Khi khách trả phần còn lại, xác nhận
    5. Hóa đơn được đánh dấu đã thanh toán đầy đủ

#### 2.5.5 Hoàn Tiền

-   **Mô tả**: Xử lý hoàn tiền cho khách trong trường hợp lỗi, thay đổi ý định
-   **Người tham gia**: Quản lý
-   **Quy trình**:
    1. Chọn hóa đơn cần hoàn tiền
    2. Nhập lý do hoàn tiền
    3. Xác nhận hoàn tiền
    4. Hệ thống xử lý hoàn tiền theo phương thức thanh toán
    5. Cập nhật doanh số, ghi log lý do

#### 2.5.6 Lập Báo Cáo Doanh Thu

-   **Mô tả**: Tổng hợp doanh thu theo ngày, tuần, tháng
-   **Người tham gia**: Quản lý, Kế toán
-   **Quy trình**:
    1. Chọn khoảng thời gian cần báo cáo
    2. Hệ thống tính tổng doanh thu, chi phí, lợi nhuận
    3. Phân loại theo danh mục, phương thức thanh toán
    4. Xuất báo cáo (PDF, Excel)
    5. Gửi email cho quản lý

---

### 2.6 Quản Lý Bếp

#### 2.6.1 Xem Danh Sách Đơn Chờ Chuẩn Bị

-   **Mô tả**: Đầu bếp xem các đơn hàng cần nấu được sắp xếp theo thứ tự ưu tiên
-   **Người tham gia**: Đầu bếp, Phó bếp
-   **Quy trình**:
    1. Mở dashboard nhà bếp
    2. Xem danh sách đơn hàng theo trạng thái
    3. Sắp xếp theo thời gian đặt hoặc bàn
    4. Chọn đơn cần nấu

#### 2.6.2 Cập Nhật Trạng Thái Chuẩn Bị Món

-   **Mô tả**: Cập nhật tiến độ nấu từng món ăn
-   **Người tham gia**: Đầu bếp
-   **Quy trình**:
    1. Bắt đầu chuẩn bị một đơn hàng
    2. Cập nhật trạng thái: "Đang nấu"
    3. Khi xong, cập nhật: "Sẵn sàng"
    4. Gửi thông báo cho nhân viên phục vụ
    5. Nhân viên phục vụ xác nhận đã lấy
    6. Trạng thái: "Đã phục vụ"

#### 2.6.3 Ghi Chú Đặc Biệt

-   **Mô tả**: Đầu bếp xem các ghi chú đặc biệt từ khách (ít gia vị, không hành, v.v.)
-   **Quy trình**:
    1. Xem ghi chú trong đơn hàng
    2. Làm theo yêu cầu đặc biệt
    3. Xác nhận khi xong
    4. Đánh dấu đã làm theo ghi chú

#### 2.6.4 Quản Lý Dụng Cụ Nhà Bếp

-   **Mô tả**: Theo dõi tình trạng và bảo trì dụng cụ nấu
-   **Người tham gia**: Đầu bếp, Quản lý
-   **Quy trình**:
    1. Ghi nhận dụng cụ cần bảo trì hoặc thay thế
    2. Tạo phiếu yêu cầu bảo trì
    3. Quản lý xem xét và phê duyệt
    4. Thực hiện bảo trì
    5. Cập nhật trạng thái

#### 2.6.5 Quản Lý Nguyên Liệu/Kho

-   **Mô tả**: Theo dõi nhu cầu nguyên liệu từ đơn hàng
-   **Người tham gia**: Đầu bếp, Quản lý kho
-   **Quy trình**:
    1. Hệ thống tính toán nguyên liệu cần dùng từ đơn hàng
    2. Đầu bếp báo khi hết hoặc thiếu nguyên liệu
    3. Quản lý kho cập nhật kho
    4. Nếu hết, đánh dấu món là "hết hàng"
    5. Thông báo khách hàng

---

### 2.7 Quản Lý Tồn Kho và Nguyên Liệu

> **📖 Tài liệu chi tiết**: [Quản Lý Tồn Kho](./use_case/INVENTORY_MANAGEMENT.md)  
> **📊 Biểu đồ**: [Biểu Đồ Quản Lý Tồn Kho](./diagrams/INVENTORY_MANAGEMENT_DIAGRAMS.md)

#### 2.7.1 Quản Lý Danh Mục Nguyên Liệu

-   **Mô tả**: Tạo và quản lý các danh mục nguyên liệu (Thịt, Rau, Gia vị, Đồ uống, v.v.)
-   **Người tham gia**: Quản lý kho, Quản lý
-   **Quy trình**:
    1. Tạo danh mục nguyên liệu mới
    2. Nhập tên, mô tả danh mục
    3. Lưu vào hệ thống
    4. Sử dụng danh mục khi thêm nguyên liệu

#### 2.7.2 Quản Lý Nguyên Liệu

-   **Mô tả**: Tạo, cập nhật thông tin nguyên liệu sử dụng trong nhà bếp
-   **Người tham gia**: Quản lý kho
-   **Quy trình**:
    1. Tạo nguyên liệu mới:
        - Nhập mã nguyên liệu (SKU)
        - Tên nguyên liệu
        - Chọn danh mục
        - Đơn vị tính (kg, g, lít, ml, v.v.)
        - Mức tồn kho tối thiểu
        - Giá vốn/đơn vị
    2. Hệ thống cảnh báo khi tồn kho dưới mức tối thiểu
    3. Cập nhật lại thông tin nếu cần thay đổi giá hoặc đơn vị

#### 2.7.3 Tạo Công Thức Món Ăn

-   **Mô tả**: Định nghĩa công thức chi tiết cho mỗi món ăn (danh sách nguyên liệu + lượng)
-   **Người tham gia**: Đầu bếp, Quản lý
-   **Quy trình**:
    1. Chọn món ăn cần tạo công thức
    2. Thêm các nguyên liệu cần dùng
    3. Nhập số lượng từng nguyên liệu
    4. Lưu công thức
    5. Hệ thống sẽ tự động tính toán nguyên liệu cần dùng khi có đơn hàng

#### 2.7.4 Quản Lý Nhà Cung Cấp

-   **Mô tả**: Quản lý danh sách nhà cung cấp nguyên liệu
-   **Người tham gia**: Quản lý kho, Quản lý
-   **Quy trình**:
    1. Tạo nhà cung cấp mới:
        - Mã nhà cung cấp (SKU)
        - Tên nhà cung cấp
        - Người liên hệ
        - Số điện thoại, email
        - Địa chỉ
        - Mã số thuế
        - Điều khoản thanh toán
    2. Cập nhật thông tin nhà cung cấp khi thay đổi
    3. Đánh dấu nhà cung cấp không còn hoạt động nếu cần

#### 2.7.5 Tạo Đơn Đặt Hàng

-   **Mô tả**: Tạo đơn đặt hàng cho nhà cung cấp
-   **Người tham gia**: Quản lý kho
-   **Quy trình**:
    1. Xem tồn kho và nguyên liệu sắp hết
    2. Tạo đơn đặt hàng mới:
        - Chọn nhà cung cấp
        - Thêm các nguyên liệu cần đặt
        - Nhập số lượng, đơn giá cho từng mặt hàng
        - Hệ thống tính tổng tiền
        - Xác định ngày dự kiến nhận hàng
    3. Xác nhận đơn đặt hàng
    4. Gửi cho nhà cung cấp

#### 2.7.6 Quản Lý Trạng Thái Đơn Đặt Hàng

-   **Mô tả**: Theo dõi tiến độ đơn đặt hàng từ lúc đặt đến khi nhận
-   **Người tham gia**: Quản lý kho
-   **Quy trình**:
    1. Xem danh sách các đơn đặt hàng theo trạng thái:
        - Chờ đặt: Chưa gửi cho nhà cung cấp
        - Đã đặt: Đã gửi, đang chờ nhận
        - Đã nhận: Nhận hàng thành công
        - Đã hủy: Hủy đơn
    2. Cập nhật trạng thái khi có thay đổi
    3. Nếu hàng bị hỏng hoặc thiếu, liên hệ nhà cung cấp

#### 2.7.7 Nhận Hàng Từ Nhà Cung Cấp

-   **Mô tả**: Ghi nhận hàng nhập kho từ nhà cung cấp
-   **Người tham gia**: Quản lý kho, Kho thủ kho
-   **Quy trình**:
    1. Chọn đơn đặt hàng cần nhận
    2. Kiểm tra số lượng hàng thực tế so với đơn
    3. Ghi nhận lô hàng:
        - Mã lô hàng (batch code)
        - Số lượng nhận
        - Ngày hết hạn (nếu có)
        - Giá vốn thực tế
    4. Cập nhật tồn kho
    5. Ghi nhận giao dịch tồn kho (stock transaction)
    6. Hệ thống tự động cảnh báo nếu hàng sắp hết hạn

#### 2.7.8 Quản Lý Lô Hàng (Batch)

-   **Mô tả**: Theo dõi chi tiết từng lô hàng, hạn sử dụng
-   **Người tham gia**: Quản lý kho
-   **Quy trình**:
    1. Khi nhận hàng, lô được ghi nhận với:
        - Mã lô
        - Số lượng ban đầu
        - Ngày nhận
        - Hạn sử dụng (nếu có)
    2. Theo dõi số lượng còn lại khi sử dụng
    3. Hệ thống cảnh báo khi gần hết hạn
    4. Khi hết hạn, báo cáo để xử lý (hủy hoặc xử lý theo quy định)

#### 2.7.9 Ghi Nhận Giao Dịch Tồn Kho

-   **Mô tả**: Ghi nhận mọi thay đổi về tồn kho (nhập, xuất, điều chỉnh, hao hụt)
-   **Người tham gia**: Quản lý kho
-   **Các loại giao dịch**:
    -   **Nhập (In)**: Hàng từ nhà cung cấp, điều chỉnh tăng
    -   **Xuất (Out)**: Sử dụng trong đơn hàng, điều chỉnh giảm
    -   **Điều chỉnh (Adjustment)**: Kiểm kê lại số lượng
    -   **Hao hụt (Waste)**: Hàng bị hỏng, mẩu, hết hạn
-   **Quy trình**:
    1. Mở danh sách giao dịch
    2. Thêm giao dịch mới:
        - Chọn nguyên liệu
        - Chọn loại giao dịch
        - Nhập số lượng
        - Nhập ghi chú
        - Liên kết với đơn đặt hàng hoặc đơn hàng (nếu có)
    3. Hệ thống cập nhật tồn kho tự động
    4. Ghi log giao dịch để kiểm toán

#### 2.7.10 Cảnh Báo Tồn Kho

-   **Mô tả**: Hệ thống cảnh báo các tình huống tồn kho bất thường
-   **Người tham gia**: Quản lý kho, Quản lý
-   **Các loại cảnh báo**:
    -   **Tồn kho thấp (Low Stock)**: Khi tồn kho dưới mức tối thiểu
    -   **Sắp hết hạn (Expiring Soon)**: Khi gần đến ngày hết hạn (7 ngày)
    -   **Đã hết hạn (Expired)**: Khi vượt quá ngày hết hạn
-   **Quy trình**:
    1. Hệ thống tự động kiểm tra tồn kho
    2. Nếu có cảnh báo, gửi thông báo cho quản lý kho
    3. Quản lý kho xem danh sách cảnh báo
    4. Xử lý cảnh báo:
        - Tồn kho thấp: Tạo đơn đặt hàng
        - Sắp/đã hết hạn: Báo cáo hoặc xử lý
    5. Đánh dấu cảnh báo đã xử lý
    6. Ghi log xử lý

#### 2.7.11 Báo Cáo Tồn Kho

-   **Mô tả**: Lập báo cáo chi tiết về tồn kho
-   **Người tham gia**: Quản lý kho, Quản lý, Kế toán
-   **Các loại báo cáo**:
    1. **Báo cáo tồn kho hiện tại**:
        - Danh sách tất cả nguyên liệu
        - Số lượng tồn kho
        - Giá vốn
        - Tổng giá trị tồn kho
    2. **Báo cáo chuyển động tồn kho**:
        - Nhập/xuất từng nguyên liệu
        - Khoảng thời gian tuỳ chọn
        - Giá trị giao dịch
    3. **Báo cáo hao hụt**:
        - Danh sách hàng hỏng, mẩu, hết hạn
        - Lý do hao hụt
        - Giá trị mất mát
    4. **Báo cáo chi phí nguyên liệu**:
        - Chi phí nguyên liệu sử dụng từng ngày/tuần/tháng
        - Liên hệ với doanh thu
        - Hiệu suất lợi nhuận
-   **Quy trình**:
    1. Chọn loại báo cáo cần lập
    2. Chọn khoảng thời gian
    3. Hệ thống tạo báo cáo chi tiết
    4. Xuất báo cáo (PDF, Excel)
    5. Gửi email cho quản lý/kế toán

#### 2.7.12 Kiểm Kê Tồn Kho

-   **Mô tả**: Kiểm kê định kỳ số lượng nguyên liệu thực tế so với hệ thống
-   **Người tham gia**: Quản lý kho, Quản lý
-   **Quy trình**:
    1. Tạo phiếu kiểm kê mới
    2. Chọn các nguyên liệu cần kiểm kê (hoặc kiểm kê toàn bộ)
    3. Nhân viên đi kiểm kê từng mặt hàng:
        - Ghi số lượng thực tế
        - Ghi chú bất thường
    4. So sánh số lượng thực tế với số lượng trong hệ thống
    5. Nếu có chênh lệch, tạo phiếu điều chỉnh:
        - Ghi nguyên nhân (hao hụt, sai sót, v.v.)
        - Cập nhật lại hệ thống
    6. Hoàn tất kiểm kê
    7. Lập báo cáo chênh lệch

---

### 2.8 Quản Lý Nhân Sự

#### 2.8.1 Quản Lý Tài Khoản Nhân Viên

-   **Mô tả**: Tạo, cập nhật, xóa tài khoản nhân viên
-   **Người tham gia**: Quản lý nhân sự, Quản trị viên
-   **Quy trình Tạo Tài Khoản**:
    1. Nhập thông tin nhân viên (tên, email, số điện thoại)
    2. Gán chức vụ (Nhân viên phục vụ, Đầu bếp, Quản lý, v.v.)
    3. Gán tài khoản và mật khẩu tạm thời
    4. Gửi thông tin đăng nhập qua email
    5. Nhân viên phải đổi mật khẩu khi đăng nhập lần đầu

#### 2.8.2 Phân Công Nhiệm Vụ

-   **Mô tả**: Gán nhân viên vào ca làm việc, khu vực
-   **Người tham gia**: Quản lý ca làm việc
-   **Quy trình**:
    1. Xem danh sách nhân viên có sẵn
    2. Gán nhân viên vào ca làm việc
    3. Gán khu vực phục vụ (nếu là nhân viên phục vụ)
    4. Xác nhận phân công
    5. Gửi thông báo cho nhân viên

#### 2.8.3 Theo Dõi Hiệu Suất Làm Việc

-   **Mô tả**: Ghi nhận số giờ làm, đánh giá hiệu suất
-   **Người tham gia**: Quản lý, Quản lý ca làm việc
-   **Quy trình**:
    1. Ghi nhận giờ vào, giờ ra
    2. Tính toán tổng giờ làm việc
    3. Đánh giá hiệu suất dựa trên các chỉ số
    4. Ghi nhận những lỗi hoặc những điểm tốt
    5. Lập báo cáo tháng

#### 2.8.4 Quản Lý Quyền Hạn

-   **Mô tả**: Phân quyền truy cập các chức năng trong hệ thống
-   **Người tham gia**: Quản trị viên
-   **Các quyền hạn**:
    -   Xem menu
    -   Chỉnh sửa menu
    -   Tạo đơn hàng
    -   Thanh toán
    -   Xem báo cáo doanh thu
    -   Quản lý nhân viên
    -   Quản lý hệ thống
-   **Quy trình**:
    1. Chọn nhân viên
    2. Gán hoặc loại bỏ quyền hạn
    3. Xác nhận thay đổi
    4. Cập nhật quyền hạn ngay lập tức

---

### 2.9 Quản Lý Đặt Bàn Trước

> **📖 Tài liệu chi tiết**: [Quản Lý Đặt Bàn](./use_case/RESERVATION_MANAGEMENT.md)  
> **📊 Biểu đồ**: [Biểu Đồ Quản Lý Đặt Bàn](./diagrams/RESERVATION_MANAGEMENT_DIAGRAMS.md)

#### 2.9.1 Tạo Yêu Cầu Đặt Bàn

-   **Mô tả**: Khách hoặc nhân viên tạo đặt bàn trước
-   **Người tham gia**: Khách, Nhân viên tiếp nhận
-   **Quy trình**:
    1. Chọn ngày, giờ cần đặt
    2. Nhập số lượng khách
    3. Nhập tên và số điện thoại khách
    4. Nhập ghi chú đặc biệt (sinh nhật, kỷ niệm, v.v.)
    5. Xác nhận đặt
    6. Nhận mã xác nhận

#### 2.9.2 Xác Nhận Đặt Bàn

-   **Mô tả**: Hệ thống xác nhận bàn còn trống và lưu đặt bàn
-   **Quy trình**:
    1. Kiểm tra bàn trống theo thời gian đặt
    2. Nếu không có bàn phù hợp, gợi ý thời gian khác
    3. Nếu có, giữ chỗ
    4. Gửi email xác nhận cho khách
    5. Ghi lịch cho nhân viên tiếp nhận

#### 2.9.3 Quản Lý Đặt Bàn

-   **Mô tả**: Xem, chỉnh sửa, hủy đặt bàn
-   **Người tham gia**: Nhân viên tiếp nhận, Quản lý
-   **Quy trình**:
    1. Xem danh sách đặt bàn theo ngày
    2. Chỉnh sửa nếu cần (số lượng, giờ, ghi chú)
    3. Xác nhận khi khách đến (check-in)
    4. Gán bàn cho khách
    5. Nếu khách không đến, đánh dấu đặt bàn bị bỏ

#### 2.9.4 Thông Báo Nhắc Lịch

-   **Mô tả**: Gửi thông báo cho khách trước khi đến
-   **Quy trình**:
    1. Hệ thống tự động gửi SMS/Email 24 giờ trước
    2. Nhắc nhở khách không quên
    3. Khách có thể xác nhận hoặc hủy
    4. Nếu hủy, hệ thống giải phóng bàn

#### 2.9.5 Xử Lý Khách Không Đến (No-show)

-   **Mô tả**: Quản lý tình huống khách đặt bàn nhưng không đến
-   **Quy trình**:
    1. Quá thời gian 15-30 phút, nhân viên ghi nhận "No-show"
    2. Giải phóng bàn
    3. Thông báo cho quản lý
    4. Cập nhật lịch sử khách

---

### 2.10 Quản Lý Thư Viện Hóa Đơn

#### 2.10.1 In Hóa Đơn

-   **Mô tả**: In hóa đơn cho khách
-   **Người tham gia**: Nhân viên phục vụ, Quản lý
-   **Quy trình**:
    1. Chọn hóa đơn cần in
    2. Kiểm tra thông tin
    3. In hóa đơn
    4. Đưa cho khách

#### 2.10.2 Lưu Trữ và Tìm Kiếm Hóa Đơn

-   **Mô tả**: Lưu trữ tất cả hóa đơn và có khả năng tìm kiếm
-   **Người tham gia**: Quản lý, Kế toán
-   **Quy trình**:
    1. Tìm kiếm hóa đơn theo ngày, khách, bàn, v.v.
    2. Xem chi tiết hóa đơn
    3. Xuất dữ liệu (PDF, Excel)
    4. Ghi chú hoặc đánh dấu hóa đơn

#### 2.10.3 Tìm Kiếm Hóa Đơn

-   **Mô tả**: Tìm kiếm hóa đơn theo nhiều tiêu chí
-   **Tiêu chí tìm kiếm**:
    -   Ngày tháng
    -   Tên khách
    -   Bàn
    -   Mức giá (từ - đến)
    -   Phương thức thanh toán
-   **Quy trình**: 1. Nhập tiêu chí tìm kiếm 2. Hệ thống tìm kiếm 3. Hiển thị kết quả 4. Chọn hóa đơn xem chi tiết

---

### 2.11 Quản Lý Hệ Thống

#### 2.11.1 Sao Lưu Dữ Liệu

-   **Mô tả**: Tạo bản sao lưu dữ liệu hệ thống
-   **Người tham gia**: Quản trị viên
-   **Quy trình**:
    1. Chạy công việc sao lưu tự động hàng ngày
    2. Lưu trữ tại nhiều vị trí (local, cloud)
    3. Kiểm tra tính toàn vẹn của bản sao lưu
    4. Ghi log khi sao lưu
    5. Thông báo khi hoàn tất

#### 2.11.2 Phục Hồi Dữ Liệu

-   **Mô tả**: Phục hồi dữ liệu từ bản sao lưu khi cần
-   **Người tham gia**: Quản trị viên
-   **Quy trình**:
    1. Chọn bản sao lưu cần phục hồi
    2. Xác nhận phục hồi
    3. Dừng hệ thống tạm thời
    4. Phục hồi dữ liệu
    5. Khởi động lại hệ thống
    6. Kiểm tra tính toàn vẹn

#### 2.11.3 Ghi Log Hệ Thống

-   **Mô tả**: Ghi lại tất cả các hoạt động trong hệ thống
-   **Quy trình**:
    1. Ghi nhận mỗi hành động người dùng
    2. Ghi thời gian, người dùng, hành động, kết quả
    3. Lưu trữ log trong database
    4. Cho phép tìm kiếm và xem log
    5. Tự động xóa log cũ hơn một khoảng thời gian

#### 2.11.4 Quản Lý Phiên Bản Hệ Thống

-   **Mô tả**: Cập nhật hệ thống lên phiên bản mới
-   **Người tham gia**: Quản trị viên
-   **Quy trình**:
    1. Kiểm tra phiên bản mới
    2. Tạo bản sao lưu trước cập nhật
    3. Tải xuống phiên bản mới
    4. Thực hiện cập nhật (migration nếu cần)
    5. Kiểm tra tất cả chức năng
    6. Thông báo cho người dùng

#### 2.11.5 Quản Lý Cấu Hình Hệ Thống

-   **Mô tả**: Điều chỉnh các cấu hình chung của nhà hàng
-   **Người tham gia**: Quản lý, Quản trị viên
-   **Các cấu hình**:
    -   Tên nhà hàng, logo, địa chỉ
    -   Thời gian hoạt động
    -   Phí dịch vụ, thuế
    -   Cấu hình email, SMS
    -   Tiền tệ, định dạng ngày tháng
-   **Quy trình**:
    1. Mở cài đặt hệ thống
    2. Chỉnh sửa cấu hình
    3. Lưu thay đổi
    4. Cập nhật ngay lập tức trên hệ thống

---

### 2.12 Truyền Thông Thực Thời (Real-time Communication)

#### 2.12.1 Thông Báo Đơn Hàng Mới

-   **Mô tả**: Thông báo ngay lập tức khi có đơn hàng mới đến bếp
-   **Người tham gia**: Đầu bếp
-   **Quy trình**:
    1. Nhân viên phục vụ gửi đơn hàng
    2. Hệ thống gửi thông báo real-time cho bếp
    3. Âm thanh/nhạc chuông thông báo
    4. Hiển thị đơn hàng trên màn hình nhà bếp

#### 2.12.2 Thông Báo Món Ăn Sẵn Sàng

-   **Mô tả**: Thông báo khi món ăn xong cho nhân viên phục vụ
-   **Người tham gia**: Nhân viên phục vụ
-   **Quy trình**:
    1. Bếp cập nhật trạng thái "Sẵn sàng"
    2. Hệ thống gửi thông báo real-time
    3. Nhân viên phục vụ lấy món ăn
    4. Phục vụ cho khách

#### 2.12.3 Yêu Cầu Hỗ Trợ

-   **Mô tả**: Khách gọi nhân viên phục vụ nếu cần
-   **Quy trình**:
    1. Khách nhấn nút gọi trên bàn hoặc ứng dụng
    2. Hệ thống gửi thông báo cho nhân viên
    3. Nhân viên nhận thông báo và đi phục vụ
    4. Ghi nhận nhu cầu của khách
    5. Thực hiện hành động cần thiết

#### 2.12.4 Cập Nhật Trạng Thái Bàn Thực Thời

-   **Mô tả**: Tất cả người dùng liên quan thấy cập nhật trạng thái bàn ngay lập tức
-   **Quy trình**:
    1. Khi trạng thái bàn thay đổi
    2. Hệ thống gửi cập nhật cho tất cả client đang kết nối
    3. Giao diện cập nhật mà không cần tải lại trang

---

### 2.13 Báo Cáo và Phân Tích

#### 2.13.1 Báo Cáo Doanh Thu

-   **Mô tả**: Lập báo cáo doanh thu theo khoảng thời gian
-   **Người tham gia**: Quản lý, Kế toán
-   **Quy trình**:
    1. Chọn khoảng thời gian (ngày, tuần, tháng, năm)
    2. Hệ thống tính tổng doanh thu
    3. Phân loại theo danh mục, bàn, nhân viên
    4. Xuất báo cáo (PDF, Excel)
    5. Gửi email cho quản lý

#### 2.13.2 Báo Cáo Sản Phẩm

-   **Mô tả**: Báo cáo về sản phẩm bán chạy, bán chậm
-   **Quy trình**:
    1. Chọn khoảng thời gian
    2. Hệ thống xếp hạng sản phẩm theo lượng bán
    3. Hiển thị doanh thu từng sản phẩm
    4. So sánh với các khoảng thời gian trước
    5. Xuất báo cáo

#### 2.13.3 Báo Cáo Hiệu Suất Nhân Viên

-   **Mô tả**: Đánh giá hiệu suất từng nhân viên
-   **Quy trình**:
    1. Tính số giờ làm việc
    2. Tính số đơn hàng xử lý được
    3. Đánh giá mức độ hài lòng khách hàng
    4. Ghi nhận lỗi hoặc khen thưởng
    5. Lập báo cáo xếp hạng

#### 2.13.4 Phân Tích Xu Hướng

-   **Mô tả**: Phân tích xu hướng kinh doanh theo thời gian
-   **Quy trình**:
    1. So sánh doanh thu giữa các giai đoạn
    2. Xác định sản phẩm hot, sản phẩm lạnh
    3. Xác định giờ cao điểm
    4. Đưa ra gợi ý cải thiện
    5. Trực quan hóa dữ liệu bằng biểu đồ

---

## 3. Tóm Tắt Các Tác Nhân (Actors)

| Tác Nhân                | Mô Tả                              | Quyền Hạn Chính                                           |
| ----------------------- | ---------------------------------- | --------------------------------------------------------- |
| **Khách Hàng**          | Người sử dụng dịch vụ của nhà hàng | Xem menu, đặt bàn, gọi nhân viên, thanh toán              |
| **Nhân Viên Phục Vụ**   | Phục vụ khách, tạo đơn hàng        | Tạo/sửa đơn, xem trạng thái, thanh toán                   |
| **Đầu Bếp**             | Chuẩn bị thức ăn                   | Xem đơn hàng, cập nhật trạng thái, quản lý nguyên liệu    |
| **Nhân Viên Tiếp Nhận** | Tiếp nhận khách, quản lý bàn       | Quản lý đặt bàn, gán bàn, xem sơ đồ                       |
| **Quản Lý Kho**         | Quản lý nguyên liệu, kho           | Quản lý nguyên liệu, tạo đơn đặt hàng, ghi nhận hàng nhập |
| **Quản Lý**             | Quản lý toàn bộ hệ thống           | Tất cả quyền hạn trừ quản trị hệ thống                    |
| **Kế Toán**             | Quản lý tài chính                  | Xem báo cáo, quản lý hóa đơn, thanh toán                  |
| **Quản Trị Viên**       | Quản lý hệ thống                   | Tất cả quyền hạn, cấu hình hệ thống                       |

---

## 4. Tóm Tắt Các Chức Năng Chính

| Chức Năng              | Mô Tả                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Quản Lý Tài Khoản**  | Đăng ký, đăng nhập, reset mật khẩu, quản lý phiên làm việc      |
| **Quản Lý Menu**       | Tạo/sửa/xóa danh mục, sản phẩm, cập nhật giá                    |
| **Quản Lý Bàn**        | Tạo/cấu hình bàn, cập nhật trạng thái, ghép/tách bàn            |
| **Quản Lý Đơn Hàng**   | Tạo/sửa/hủy đơn, theo dõi trạng thái, ghi chú đặc biệt          |
| **Quản Lý Thanh Toán** | Tạo hóa đơn, áp dụng giảm giá, thanh toán, hoàn tiền            |
| **Quản Lý Bếp**        | Xem danh sách đơn, cập nhật trạng thái, quản lý nguyên liệu     |
| **Quản Lý Nhân Sự**    | Tạo tài khoản, phân công, theo dõi hiệu suất, quản lý quyền     |
| **Quản Lý Tồn Kho**    | Quản lý nguyên liệu, công thức, đơn đặt hàng, lô hàng, cảnh báo |
| **Quản Lý Đặt Bàn**    | Tạo/xác nhận/hủy đặt bàn, nhắc lịch, xử lý no-show              |
| **Báo Cáo**            | Báo cáo doanh thu, sản phẩm, nhân viên, phân tích xu hướng      |
| **Hệ Thống**           | Sao lưu, phục hồi, ghi log, cập nhật phiên bản, cấu hình        |

---

## 5. Quy Trình Kinh Doanh Chính

### 5.1 Quy Trình Tiếp Nhận và Phục Vụ Khách

```
1. Khách đến nhà hàng
   ↓
2. Nhân viên tiếp nhận kiểm tra đặt bàn hoặc xếp bàn trống
   ↓
3. Khách ngồi tại bàn
   ↓
4. Nhân viên phục vụ gợi ý menu
   ↓
5. Khách lựa chọn và gọi đồ ăn
   ↓
6. Nhân viên phục vụ tạo đơn hàng trong hệ thống
   ↓
7. Đơn hàng gửi đến bếp
   ↓
8. Bếp chuẩn bị thức ăn theo đơn
   ↓
9. Thức ăn sẵn sàng, thông báo nhân viên phục vụ
   ↓
10. Nhân viên phục vụ mang thức ăn cho khách
    ↓
11. Khách ăn xong, gọi thanh toán
    ↓
12. Nhân viên phục vụ tạo hóa đơn
    ↓
13. Khách thanh toán
    ↓
14. Nhân viên phục vụ ghi nhận thanh toán
    ↓
15. Khách rời bàn
    ↓
16. Nhân viên dọn sạch bàn
    ↓
17. Bàn sẵn sàng cho khách tiếp theo
```

### 5.2 Quy Trình Đặt Bàn Trước

```
1. Khách đặt bàn (qua điện thoại, website, hoặc ứng dụng)
   ↓
2. Nhân viên tiếp nhận hoặc hệ thống tự động xác nhận
   ↓
3. Gửi xác nhận qua email/SMS
   ↓
4. Ngày hẹn, gửi nhắc lịch 24 giờ trước
   ↓
5. Khách xác nhận hoặc hủy
   ↓
6. Nếu xác nhận:
   - Giữ chỗ trong hệ thống
   - Khi khách đến, check-in
   - Gán bàn phù hợp
   - Tiếp tục quy trình phục vụ bình thường
   ↓
7. Nếu hủy hoặc no-show:
   - Giải phóng bàn
   - Ghi nhận trong hệ thống
```

### 5.3 Quy Trình Tạo và Quản Lý Menu

```
1. Quản lý tạo danh mục sản phẩm
   ↓
2. Nhập thông tin, ảnh, mô tả
   ↓
3. Tạo các sản phẩm trong danh mục
   ↓
4. Nhập thông tin sản phẩm: tên, giá, ảnh, thành phần
   ↓
5. Hệ thống xuất bản menu
   ↓
6. Nhân viên phục vụ có thể xem menu
   ↓
7. Nếu cần cập nhật:
   - Chỉnh sửa giá, tên, hoặc đánh dấu hết hàng
   - Thay đổi cập nhật ngay lập tức
   ↓
8. Ghi log tất cả thay đổi
```

### 5.4 Quy Trình Quản Lý Tồn Kho

```
1. Quản lý kho xác định nhu cầu nguyên liệu
   ↓
2. Tạo đơn đặt hàng cho nhà cung cấp
   ↓
3. Chọn nhà cung cấp, thêm nguyên liệu, nhập số lượng và giá
   ↓
4. Xác nhận đơn đặt hàng
   ↓
5. Đợi hàng từ nhà cung cấp
   ↓
6. Khi nhận hàng:
   - Kiểm tra số lượng thực tế
   - Ghi nhận lô hàng (batch) với hạn sử dụng
   - Cập nhật tồn kho trong hệ thống
   ↓
7. Hệ thống tự động cảnh báo:
   - Tồn kho dưới mức tối thiểu
   - Hàng sắp hết hạn
   - Hàng đã hết hạn
   ↓
8. Ghi nhận giao dịch (nhập, xuất, điều chỉnh, hao hụt)
   ↓
9. Lập báo cáo tồn kho định kỳ
```

---

## 6. Kết Luận

Hệ thống quản lý nhà hàng cung cấp các nghiệp vụ toàn diện để hỗ trợ mọi khía cạnh của hoạt động kinh doanh nhà hàng, từ quản lý bàn, đơn hàng, đến thanh toán, quản lý tồn kho và báo cáo. Các tính năng được thiết kế để tăng hiệu suất, cải thiện trải nghiệm khách hàng, và cung cấp thông tin quản lý chi tiết cho các nhà quản lý.

Tài liệu này phục vụ mục đích giáo dục và có thể được sử dụng trong báo cáo đồ án hoặc tài liệu học tập.
