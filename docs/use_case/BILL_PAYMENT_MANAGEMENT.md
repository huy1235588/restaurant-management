# Tài Liệu Chi Tiết Quản Lý Hóa Đơn và Thanh Toán

## 1. Giới Thiệu

Hệ thống quản lý hóa đơn và thanh toán là bộ phận quan trọng cuối cùng trong quy trình phục vụ khách hàng tại nhà hàng. Hệ thống cho phép tạo hóa đơn từ đơn hàng, xử lý nhiều phương thức thanh toán, áp dụng giảm giá, phí dịch vụ, thuế, và quản lý các tình huống đặc biệt như thanh toán một phần, chia hóa đơn, hoàn tiền. Đây là điểm cuối trong chuỗi dịch vụ, đảm bảo doanh thu được ghi nhận chính xác và khách hàng có trải nghiệm thanh toán thuận tiện.

---

## 2. Các Thành Phần Chính

### 2.1 Hóa Đơn (Bills)

-   **Định nghĩa**: Chứng từ tài chính ghi nhận chi tiết các món ăn/dịch vụ khách đã sử dụng và số tiền phải thanh toán
-   **Mục đích**: Ghi nhận doanh thu, cung cấp chứng từ cho khách và kế toán
-   **Thông tin chứa**:
    -   Số hóa đơn (Bill Number)
    -   Đơn hàng liên kết (Order)
    -   Bàn (Table)
    -   Thu ngân (Cashier/Staff)
    -   Tổng tiền món ăn (Subtotal)
    -   Thuế (Tax Amount & Tax Rate)
    -   Giảm giá (Discount Amount)
    -   Phí dịch vụ (Service Charge)
    -   Tổng tiền (Total Amount)
    -   Tiền đã thanh toán (Paid Amount)
    -   Tiền thối (Change Amount)
    -   Trạng thái thanh toán (Payment Status)
    -   Phương thức thanh toán (Payment Method)
    -   Ghi chú (Notes)
    -   Thời gian tạo (Created At)
    -   Thời gian thanh toán (Paid At)

### 2.2 Chi Tiết Hóa Đơn (Bill Items)

-   **Định nghĩa**: Danh sách các món ăn/đồ uống trong hóa đơn
-   **Mục đích**: Ghi nhận chi tiết từng món trong hóa đơn
-   **Thông tin chứa**:
    -   Món ăn (Menu Item)
    -   Tên món (Item Name)
    -   Số lượng (Quantity)
    -   Đơn giá (Unit Price)
    -   Tổng tiền món (Subtotal)
    -   Giảm giá món (Discount)
    -   Thành tiền (Total)

### 2.3 Giao Dịch Thanh Toán (Payments)

-   **Định nghĩa**: Chi tiết các giao dịch thanh toán cho hóa đơn
-   **Mục đích**: Ghi nhận từng giao dịch thanh toán (hỗ trợ thanh toán nhiều lần)
-   **Thông tin chứa**:
    -   Hóa đơn (Bill)
    -   Phương thức thanh toán (Payment Method)
    -   Số tiền (Amount)
    -   Mã giao dịch (Transaction ID)
    -   Số thẻ (Card Number - 4 số cuối)
    -   Tên chủ thẻ (Card Holder Name)
    -   Trạng thái (Status)
    -   Ghi chú (Notes)
    -   Thời gian thanh toán (Payment Date)

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Hóa Đơn

#### 3.1.1 Tạo Hóa Đơn từ Đơn Hàng

**Mục tiêu**: Tạo hóa đơn thanh toán từ đơn hàng đã hoàn tất

**Người tham gia chính**: Nhân viên phục vụ, Thu ngân

**Điều kiện tiên quyết**:

-   Đơn hàng đã được phục vụ (hoặc ít nhất có một món đã phục vụ)
-   Đơn hàng chưa có hóa đơn

**Quy trình chi tiết**:

1. **Bước 1**: Khách yêu cầu thanh toán
2. **Bước 2**: Nhân viên mở đơn hàng cần thanh toán
3. **Bước 3**: Nhấn nút "Tạo Hóa Đơn"
4. **Bước 4**: Hệ thống kiểm tra:
    - Đơn hàng có món nào đã phục vụ chưa
    - Đơn hàng chưa có hóa đơn
5. **Bước 5**: Hệ thống tự động tạo hóa đơn:
    - Tạo số hóa đơn tự động (Bill Number)
    - Sao chép danh sách món từ đơn hàng
    - Tính tổng tiền món ăn (Subtotal)
    - Áp dụng phí dịch vụ (nếu có)
    - Áp dụng thuế (nếu có)
    - Tính tổng tiền cuối cùng (Total Amount)
6. **Bước 6**: Hiển thị hóa đơn cho nhân viên xem lại:
    - Danh sách món ăn
    - Số lượng và giá từng món
    - Tổng tiền các món
    - Phí dịch vụ (% hoặc số tiền cố định)
    - Thuế (%)
    - Tổng cộng
7. **Bước 7**: Nhân viên có thể:
    - Áp dụng giảm giá (nếu có)
    - Thêm ghi chú đặc biệt
    - Điều chỉnh phí dịch vụ (nếu được phép)
8. **Bước 8**: Xác nhận tạo hóa đơn
9. **Bước 9**: Lưu hóa đơn vào database
10. **Bước 10**: Cập nhật trạng thái đơn hàng thành "Đã tạo hóa đơn"
11. **Bước 11**: Ghi log tạo hóa đơn
12. **Bước 12**: Sẵn sàng cho bước thanh toán

**Công thức tính toán**:

```
Subtotal = Σ (Quantity × Unit Price) cho tất cả món

Service Charge = Subtotal × Service Rate (%) hoặc Fixed Amount

Subtotal After Service = Subtotal + Service Charge

Tax Amount = Subtotal After Service × Tax Rate (%)

Discount Amount = Discount (theo % hoặc số tiền)

Total Amount = Subtotal + Service Charge + Tax Amount - Discount Amount
```

**Xử lý lỗi**:

-   Đơn hàng chưa có món nào phục vụ: "Chưa có món nào được phục vụ. Không thể tạo hóa đơn"
-   Đơn hàng đã có hóa đơn: "Đơn hàng đã có hóa đơn. Vui lòng kiểm tra lại"
-   Lỗi tính toán: "Có lỗi khi tính toán hóa đơn. Vui lòng thử lại"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Tạo hóa đơn
-   Số hóa đơn: [bill_number]
-   Đơn hàng: [order_number]
-   Bàn: [table_number]
-   Tổng tiền: [total_amount]
-   Thời gian: [timestamp]

---

#### 3.1.2 Xem Hóa Đơn

**Mục tiêu**: Xem chi tiết hóa đơn đã tạo

**Người tham gia chính**: Nhân viên phục vụ, Thu ngân, Quản lý, Kế toán

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Hóa Đơn"
2. **Bước 2**: Hệ thống hiển thị danh sách hóa đơn với:
    - Số hóa đơn
    - Số bàn
    - Thu ngân
    - Tổng tiền
    - Trạng thái thanh toán
    - Thời gian tạo
    - Nút hành động (Xem, Thanh toán, In, Hoàn tiền)
3. **Bước 3**: Tính năng lọc:
    - Trạng thái thanh toán (Chờ thanh toán, Đã thanh toán, Đã hoàn tiền, Đã hủy)
    - Phương thức thanh toán
    - Thời gian (Hôm nay, Tuần này, Tháng này, Tùy chọn)
    - Khoảng tiền (từ - đến)
4. **Bước 4**: Tìm kiếm theo:
    - Số hóa đơn
    - Số bàn
    - Tên khách hàng
    - Số điện thoại
5. **Bước 5**: Sắp xếp theo:
    - Thời gian (Mới nhất, Cũ nhất)
    - Tổng tiền (Cao - Thấp)
    - Trạng thái

**Xem chi tiết hóa đơn**:

1. Nhấn vào số hóa đơn hoặc nút "Xem"
2. Hiển thị đầy đủ thông tin:
    - Thông tin nhà hàng (logo, tên, địa chỉ, SĐT)
    - Số hóa đơn
    - Ngày giờ
    - Bàn
    - Thu ngân
    - Danh sách món ăn (tên, số lượng, đơn giá, thành tiền)
    - Tổng tiền món
    - Phí dịch vụ
    - Thuế
    - Giảm giá (nếu có)
    - **Tổng cộng**
    - Phương thức thanh toán (nếu đã thanh toán)
    - Trạng thái
    - Ghi chú

---

#### 3.1.3 Áp Dụng Giảm Giá

**Mục tiêu**: Áp dụng mã giảm giá hoặc giảm giá thủ công cho hóa đơn

**Người tham gia chính**: Nhân viên phục vụ, Thu ngân, Quản lý

**Các loại giảm giá**:

-   **Giảm giá theo %**: Giảm X% trên tổng hóa đơn
-   **Giảm giá số tiền**: Giảm X VND
-   **Giảm giá món cụ thể**: Giảm giá cho một món ăn
-   **Mã giảm giá**: Áp dụng mã khuyến mãi (coupon code)

**Quy trình chi tiết**:

1. **Bước 1**: Từ màn hình hóa đơn, nhấn "Áp Dụng Giảm Giá"
2. **Bước 2**: Chọn loại giảm giá:

**Nếu sử dụng mã giảm giá**:
    - Nhập mã giảm giá
    - Hệ thống kiểm tra mã:
        - Mã có tồn tại không
        - Mã còn hiệu lực không (thời gian)
        - Mã đã được sử dụng chưa (nếu dùng 1 lần)
        - Hóa đơn có đủ điều kiện không (tổng tiền tối thiểu)
    - Nếu hợp lệ, áp dụng giảm giá theo mã
    - Đánh dấu mã đã sử dụng

**Nếu giảm giá thủ công**:
    - Chọn loại: % hoặc số tiền
    - Nhập giá trị giảm
    - Nhập lý do (bắt buộc): "Khách VIP", "Khuyến mãi sinh nhật", v.v.
    - Yêu cầu xác nhận quản lý (nếu giảm > 10%)

3. **Bước 3**: Hệ thống tính lại:
    - Discount Amount = giá trị giảm
    - Total Amount = Subtotal + Service + Tax - Discount
4. **Bước 4**: Cập nhật hóa đơn
5. **Bước 5**: Hiển thị tổng tiền mới
6. **Bước 6**: Ghi log áp dụng giảm giá

**Xử lý lỗi**:

-   Mã không hợp lệ: "Mã giảm giá không đúng hoặc đã hết hạn"
-   Mã đã sử dụng: "Mã giảm giá đã được sử dụng"
-   Không đủ điều kiện: "Hóa đơn chưa đủ điều kiện áp dụng mã này (tối thiểu X VND)"
-   Giảm giá quá lớn: "Cần xác nhận quản lý cho giảm giá > 10%"

**Ghi log**:

-   Người dùng: [username]
-   Người xác nhận: [manager_username] (nếu có)
-   Hành động: Áp dụng giảm giá
-   Số hóa đơn: [bill_number]
-   Loại giảm: [discount_type]
-   Giá trị giảm: [discount_amount]
-   Lý do: [reason]
-   Thời gian: [timestamp]

---

#### 3.1.4 In Hóa Đơn

**Mục tiêu**: In hóa đơn cho khách hoặc lưu trữ

**Người tham gia chính**: Nhân viên phục vụ, Thu ngân

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết hóa đơn, nhấn nút "In Hóa Đơn"
2. **Bước 2**: Chọn loại in:
    - **In nhiệt (Thermal)**: In nhanh trên máy in nhiệt
    - **In A4**: In định dạng A4 đầy đủ
    - **In bếp (Kitchen Copy)**: Bản sao cho bếp (nếu cần)
3. **Bước 3**: Chọn số bản in (mặc định: 1)
4. **Bước 4**: Hệ thống tạo nội dung hóa đơn:
    - Header: Logo, tên nhà hàng, địa chỉ, SĐT
    - Số hóa đơn, ngày giờ
    - Bàn, nhân viên phục vụ
    - Danh sách món (bảng)
    - Tổng tiền các bước
    - Phương thức thanh toán (nếu đã thanh toán)
    - Footer: Lời cảm ơn, thông tin liên hệ
5. **Bước 5**: Gửi lệnh in đến máy in
6. **Bước 6**: Ghi log in hóa đơn
7. **Bước 7**: Đưa hóa đơn cho khách

**Định dạng in nhiệt (58mm hoặc 80mm)**:

```
========================================
       [LOGO] TÊN NHÀ HÀNG
        Địa chỉ nhà hàng
        Hotline: 0123-456-789
========================================
HÓA ĐƠN THANH TOÁN
Số HĐ: HD-2024-001234
Ngày: 25/10/2024 14:30
Bàn: A5        NV: Nguyễn Văn A
========================================
Tên món             SL    Giá    Thành tiền
----------------------------------------
Phở Bò              2    50,000   100,000
Cà Phê Sữa Đá       1    25,000    25,000
Trà Đá              2    10,000    20,000
========================================
Tổng tiền món:                  145,000
Phí dịch vụ (5%):                 7,250
Thuế VAT (10%):                  15,225
Giảm giá:                        -5,000
========================================
TỔNG CỘNG:                      162,475
========================================
Tiền mặt:                       200,000
Tiền thối:                       37,525
========================================
Cảm ơn quý khách!
Hẹn gặp lại!
========================================
```

**Ghi log**:

-   Người dùng: [username]
-   Hành động: In hóa đơn
-   Số hóa đơn: [bill_number]
-   Loại in: [print_type]
-   Số bản: [copies]
-   Thời gian: [timestamp]

---

### 3.2 Quản Lý Thanh Toán

#### 3.2.1 Thanh Toán Toàn Bộ

**Mục tiêu**: Xử lý thanh toán đầy đủ cho hóa đơn

**Người tham gia chính**: Thu ngân, Nhân viên phục vụ

**Các phương thức thanh toán**:

-   **Tiền mặt (Cash)**: Thanh toán bằng tiền mặt
-   **Thẻ (Card)**: Thẻ tín dụng/ghi nợ
-   **Ví điện tử (E-wallet)**: MoMo, ZaloPay, VNPay, v.v.
-   **Chuyển khoản (Bank Transfer)**: Chuyển khoản ngân hàng

**Quy trình chi tiết**:

1. **Bước 1**: Từ hóa đơn, nhấn nút "Thanh Toán"
2. **Bước 2**: Hiển thị tổng tiền cần thanh toán
3. **Bước 3**: Chọn phương thức thanh toán
4. **Bước 4**: Xử lý theo từng phương thức:

**Thanh toán tiền mặt**:
    - Nhập số tiền khách đưa
    - Hệ thống tính tiền thối tự động
    - Hiển thị tiền thối
    - Xác nhận thanh toán

**Thanh toán thẻ**:
    - Quẹt thẻ qua máy POS
    - Nhập 4 số cuối thẻ (để ghi nhận)
    - Nhập tên chủ thẻ (tùy chọn)
    - Nhập mã giao dịch (Transaction ID)
    - Xác nhận thanh toán thành công

**Thanh toán ví điện tử**:
    - Hiển thị QR code thanh toán
    - Khách quét mã và thanh toán
    - Hệ thống nhận thông báo từ gateway
    - Nhập mã giao dịch
    - Xác nhận thanh toán

**Chuyển khoản**:
    - Hiển thị thông tin TK nhận
    - Khách chuyển khoản
    - Nhập mã giao dịch
    - Xác nhận đã nhận tiền

5. **Bước 5**: Hệ thống:
    - Tạo giao dịch thanh toán (Payment record)
    - Cập nhật Paid Amount = Total Amount
    - Cập nhật Payment Status = "Đã thanh toán"
    - Cập nhật Paid At = thời gian hiện tại
    - Cập nhật Payment Method
6. **Bước 6**: Cập nhật trạng thái đơn hàng thành "Hoàn tất"
7. **Bước 7**: Cập nhật trạng thái bàn về "Có sẵn"
8. **Bước 8**: Ghi log thanh toán
9. **Bước 9**: In hóa đơn thanh toán (nếu chưa in)
10. **Bước 10**: Thông báo thành công

**Xử lý lỗi**:

-   Số tiền khách đưa không đủ: "Số tiền không đủ. Thiếu X VND"
-   Thanh toán thẻ thất bại: "Giao dịch thẻ không thành công. Vui lòng thử lại"
-   Thanh toán ví thất bại: "Chưa nhận được xác nhận thanh toán. Vui lòng kiểm tra lại"
-   Lỗi hệ thống: "Có lỗi khi xử lý thanh toán. Vui lòng thử lại"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Thanh toán
-   Số hóa đơn: [bill_number]
-   Phương thức: [payment_method]
-   Tổng tiền: [total_amount]
-   Tiền nhận: [received_amount]
-   Tiền thối: [change_amount]
-   Mã giao dịch: [transaction_id]
-   Thời gian: [timestamp]

---

#### 3.2.2 Thanh Toán Một Phần

**Mục tiêu**: Cho phép khách thanh toán một phần và trả phần còn lại sau

**Người tham gia chính**: Thu ngân, Quản lý

**Điều kiện tiên quyết**:

-   Được phép thanh toán một phần (theo chính sách nhà hàng)
-   Số tiền thanh toán > 0 và < Tổng tiền

**Quy trình chi tiết**:

1. **Bước 1**: Từ hóa đơn, nhấn "Thanh Toán Một Phần"
2. **Bước 2**: Nhập số tiền thanh toán
3. **Bước 3**: Hệ thống kiểm tra:
    - Số tiền > 0
    - Số tiền < Tổng tiền
    - Số tiền >= Số tiền tối thiểu (nếu có quy định)
4. **Bước 4**: Chọn phương thức thanh toán
5. **Bước 5**: Xử lý thanh toán (tương tự thanh toán toàn bộ)
6. **Bước 6**: Hệ thống:
    - Tạo giao dịch thanh toán (Payment)
    - Cập nhật Paid Amount += Số tiền vừa thanh toán
    - Tính Remaining Amount = Total - Paid Amount
    - Payment Status = "Thanh toán một phần"
7. **Bước 7**: Hiển thị:
    - Số tiền đã thanh toán
    - Số tiền còn lại
8. **Bước 8**: Ghi chú thông tin khách (để theo dõi nợ):
    - Tên khách
    - Số điện thoại
    - Hạn thanh toán (nếu có)
9. **Bước 9**: In hóa đơn tạm (ghi rõ "Đã thanh toán X VND, còn nợ Y VND")
10. **Bước 10**: Ghi log thanh toán một phần

**Thanh toán phần còn lại**:

1. Tra cứu hóa đơn theo số hóa đơn hoặc SĐT khách
2. Hiển thị số tiền còn nợ
3. Nhấn "Thanh Toán Phần Còn Lại"
4. Xử lý thanh toán (có thể dùng phương thức khác)
5. Cập nhật Paid Amount = Total Amount
6. Cập nhật Payment Status = "Đã thanh toán"
7. In hóa đơn hoàn tất

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Thanh toán một phần
-   Số hóa đơn: [bill_number]
-   Số tiền thanh toán: [paid_amount]
-   Số tiền còn lại: [remaining_amount]
-   Thời gian: [timestamp]

---

#### 3.2.3 Chia Hóa Đơn

**Mục tiêu**: Chia một hóa đơn thành nhiều hóa đơn cho nhóm khách khác nhau thanh toán riêng

**Người tham gia chính**: Nhân viên phục vụ, Thu ngân

**Các cách chia**:

-   **Chia đều**: Chia tổng tiền cho N người
-   **Chia theo món**: Mỗi người thanh toán món mình gọi
-   **Chia thủ công**: Tự chọn món cho từng hóa đơn

**Quy trình chi tiết (Chia theo món)**:

1. **Bước 1**: Từ hóa đơn chưa thanh toán, nhấn "Chia Hóa Đơn"
2. **Bước 2**: Chọn cách chia: "Chia theo món"
3. **Bước 3**: Hệ thống hiển thị danh sách món
4. **Bước 4**: Nhập số hóa đơn muốn chia (ví dụ: 2 hóa đơn)
5. **Bước 5**: Chọn món cho hóa đơn 1:
    - Chọn các món thuộc người 1
    - Hiển thị tổng tiền hóa đơn 1
6. **Bước 6**: Chọn món cho hóa đơn 2:
    - Các món còn lại tự động vào hóa đơn 2
    - Hiển thị tổng tiền hóa đơn 2
7. **Bước 7**: Phân bổ phí dịch vụ và thuế:
    - Theo tỷ lệ tổng tiền món
    - Hoặc chia đều
8. **Bước 8**: Xác nhận chia hóa đơn
9. **Bước 9**: Hệ thống:
    - Hủy hóa đơn gốc (đánh dấu "Đã chia")
    - Tạo 2 hóa đơn mới
    - Liên kết với đơn hàng gốc
    - Ghi nhận lý do: "Chia từ HĐ [bill_number]"
10. **Bước 10**: Hiển thị 2 hóa đơn mới
11. **Bước 11**: Ghi log chia hóa đơn
12. **Bước 12**: Mỗi hóa đơn có thể thanh toán riêng

**Quy trình chi tiết (Chia đều)**:

1. Chọn "Chia đều"
2. Nhập số người (N)
3. Hệ thống tính: Mỗi người = Total Amount / N
4. Tạo N hóa đơn mới với số tiền bằng nhau
5. Mỗi hóa đơn ghi chú: "1/N của HĐ [bill_number]"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Chia hóa đơn
-   Hóa đơn gốc: [original_bill_number]
-   Số hóa đơn mới: [number_of_bills]
-   Cách chia: [split_type]
-   Thời gian: [timestamp]

---

#### 3.2.4 Hoàn Tiền

**Mục tiêu**: Xử lý hoàn tiền cho khách trong các trường hợp đặc biệt

**Người tham gia chính**: Quản lý, Thu ngân (cần xác nhận quản lý)

**Các trường hợp hoàn tiền**:

-   Món ăn không đúng/không ngon
-   Lỗi tính toán hóa đơn
-   Khách khiếu nại hợp lệ
-   Hủy dịch vụ sau khi thanh toán

**Điều kiện tiên quyết**:

-   Hóa đơn đã thanh toán
-   Có lý do hợp lệ
-   Được quản lý xác nhận
-   Trong thời gian cho phép hoàn tiền (ví dụ: trong ngày)

**Quy trình chi tiết**:

1. **Bước 1**: Khách yêu cầu hoàn tiền
2. **Bước 2**: Nhân viên mở hóa đơn cần hoàn tiền
3. **Bước 3**: Nhấn nút "Hoàn Tiền"
4. **Bước 4**: Nhập thông tin:
    - Loại hoàn tiền:
        - Hoàn toàn bộ
        - Hoàn một phần (nhập số tiền)
    - Lý do hoàn tiền (bắt buộc):
        - Lỗi của nhà hàng
        - Món ăn không đạt chất lượng
        - Khiếu nại khách hàng
        - Lỗi tính toán
        - Khác (nhập chi tiết)
    - Mô tả chi tiết
5. **Bước 5**: Yêu cầu xác nhận quản lý:
    - Nhập mật khẩu quản lý
    - Hoặc quản lý xác nhận trên thiết bị
6. **Bước 6**: Quản lý xem xét:
    - Kiểm tra lý do
    - Kiểm tra hóa đơn
    - Quyết định chấp nhận hoặc từ chối
7. **Bước 7**: Nếu chấp nhận:
    - Hệ thống xử lý hoàn tiền:
        - Tạo giao dịch hoàn tiền (Payment với amount âm)
        - Cập nhật Paid Amount -= Số tiền hoàn
        - Nếu hoàn toàn bộ: Payment Status = "Đã hoàn tiền"
        - Nếu hoàn một phần: Ghi nhận số tiền đã hoàn
    - Xử lý hoàn tiền theo phương thức thanh toán gốc:
        - Tiền mặt: Trả tiền mặt cho khách
        - Thẻ: Hoàn vào thẻ (qua POS)
        - Ví điện tử: Hoàn vào ví
        - Chuyển khoản: Chuyển lại cho khách
8. **Bước 8**: In phiếu hoàn tiền cho khách
9. **Bước 9**: Ghi log hoàn tiền chi tiết
10. **Bước 10**: Cập nhật báo cáo doanh thu

**Xử lý lỗi**:

-   Không có quyền: "Cần xác nhận quản lý để hoàn tiền"
-   Quá thời gian: "Đã quá thời hạn cho phép hoàn tiền"
-   Lỗi xử lý: "Có lỗi khi xử lý hoàn tiền. Vui lòng liên hệ quản lý"

**Ghi log hoàn tiền**:

-   Người yêu cầu: [requester_username]
-   Người xác nhận: [manager_username]
-   Hành động: Hoàn tiền
-   Số hóa đơn: [bill_number]
-   Số tiền hoàn: [refund_amount]
-   Lý do: [refund_reason]
-   Mô tả: [description]
-   Thời gian: [timestamp]

---

### 3.3 Báo Cáo và Phân Tích

#### 3.3.1 Báo Cáo Doanh Thu

**Mục tiêu**: Lập báo cáo doanh thu theo thời gian

**Người tham gia chính**: Quản lý, Kế toán

**Các loại báo cáo**:

1. **Báo cáo doanh thu theo ngày**:
    - Tổng số hóa đơn
    - Tổng doanh thu
    - Doanh thu theo phương thức thanh toán
    - Doanh thu theo ca làm việc
    - Doanh thu theo nhân viên

2. **Báo cáo doanh thu theo tuần/tháng**:
    - Tổng doanh thu
    - Doanh thu trung bình/ngày
    - Ngày có doanh thu cao nhất/thấp nhất
    - Xu hướng tăng/giảm
    - So sánh với cùng kỳ

3. **Báo cáo chi tiết hóa đơn**:
    - Danh sách tất cả hóa đơn
    - Trạng thái thanh toán
    - Phương thức thanh toán
    - Giảm giá, phí dịch vụ, thuế

4. **Báo cáo giảm giá và khuyến mãi**:
    - Tổng giá trị giảm giá
    - Số lượng mã giảm giá sử dụng
    - Hiệu quả khuyến mãi

5. **Báo cáo hoàn tiền**:
    - Số lượng hoàn tiền
    - Tổng giá trị hoàn
    - Lý do hoàn tiền
    - Tỷ lệ hoàn tiền

**Quy trình tạo báo cáo**:

1. Chọn loại báo cáo
2. Chọn khoảng thời gian
3. Chọn bộ lọc (phương thức thanh toán, nhân viên, v.v.)
4. Hệ thống tạo báo cáo
5. Hiển thị dữ liệu dạng bảng và biểu đồ
6. Xuất báo cáo (PDF, Excel, CSV)
7. Gửi email (nếu cần)

---

#### 3.3.2 Phân Tích Phương Thức Thanh Toán

**Mục tiêu**: Phân tích xu hướng sử dụng phương thức thanh toán

**Chỉ số theo dõi**:

-   Tỷ lệ % sử dụng từng phương thức:
    - Tiền mặt: X%
    - Thẻ: Y%
    - Ví điện tử: Z%
    - Chuyển khoản: W%
-   Giá trị trung bình mỗi giao dịch theo phương thức
-   Xu hướng thay đổi theo thời gian
-   So sánh giữa các ca làm việc

**Mục đích phân tích**:

-   Chuẩn bị tiền mặt lẻ phù hợp
-   Đầu tư vào công nghệ thanh toán phù hợp
-   Khuyến khích phương thức thanh toán tiện lợi
-   Giảm thiểu rủi ro tiền mặt

---

#### 3.3.3 Phân Tích Giờ Cao Điểm Thanh Toán

**Mục tiêu**: Xác định giờ nào khách thanh toán nhiều nhất

**Phân tích**:

1. Thống kê số lượng hóa đơn theo từng giờ trong ngày
2. Xác định giờ cao điểm (peak hours)
3. Xác định giờ thấp điểm
4. So sánh giữa các ngày trong tuần

**Ứng dụng**:

-   Bố trí nhân viên thu ngân phù hợp
-   Chuẩn bị thiết bị thanh toán đủ
-   Tối ưu quy trình để giảm thời gian chờ
-   Khuyến khích thanh toán ngoài giờ cao điểm

---

## 4. Quy Trình Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│      QUẢN LÝ HÓA ĐƠN VÀ THANH TOÁN - QUY TRÌNH TỔNG    │
└─────────────────────────────────────────────────────────┘

1. KHÁCH YÊU CẦU THANH TOÁN
   └─ Khách ăn xong, gọi nhân viên

2. TẠO HÓA ĐƠN
   ├─ Nhân viên mở đơn hàng
   ├─ Tạo hóa đơn từ đơn hàng
   ├─ Hệ thống tính toán tự động
   └─ Hiển thị hóa đơn

3. ÁP DỤNG GIẢM GIÁ (NẾU CÓ)
   ├─ Nhập mã giảm giá
   ├─ Hoặc giảm giá thủ công
   ├─ Hệ thống kiểm tra và tính lại
   └─ Cập nhật tổng tiền

4. HIỂN THỊ HÓA ĐƠN CHO KHÁCH
   ├─ Xem lại các món
   ├─ Kiểm tra tổng tiền
   └─ Xác nhận thanh toán

5. CHỌN PHƯƠNG THỨC THANH TOÁN
   ├─ Tiền mặt
   ├─ Thẻ tín dụng/ghi nợ
   ├─ Ví điện tử
   └─ Chuyển khoản

6. XỬ LÝ THANH TOÁN
   ├─ Nhập số tiền (nếu tiền mặt)
   ├─ Xử lý giao dịch
   ├─ Ghi nhận thanh toán
   └─ Cập nhật trạng thái

7. IN HÓA ĐƠN
   ├─ In hóa đơn thanh toán
   └─ Đưa cho khách

8. HOÀN TẤT
   ├─ Cập nhật trạng thái đơn hàng
   ├─ Giải phóng bàn
   ├─ Ghi log giao dịch
   └─ Cập nhật báo cáo doanh thu

9. TRƯỜNG HỢP ĐẶC BIỆT
   ├─ Chia hóa đơn → Tạo nhiều hóa đơn
   ├─ Thanh toán một phần → Ghi nợ
   └─ Hoàn tiền → Xác nhận quản lý
```

---

## 5. Các Tác Nhân (Actors) và Quyền Hạn

| Tác Nhân            | Tạo HĐ | Xem | Áp dụng GG | In  | Thanh toán | Chia HĐ | Hoàn tiền |
| ------------------- | ------ | --- | ---------- | --- | ---------- | ------- | --------- |
| Khách hàng          | ✗      | ✓   | ✗          | ✗   | ✗          | ✗       | ✗         |
| Nhân viên phục vụ   | ✓      | ✓   | ✓ (< 10%)  | ✓   | ✓          | ✓       | ✗         |
| Thu ngân            | ✓      | ✓   | ✓          | ✓   | ✓          | ✓       | ✗         |
| Quản lý             | ✓      | ✓   | ✓          | ✓   | ✓          | ✓       | ✓         |
| Kế toán             | ✗      | ✓   | ✗          | ✓   | ✗          | ✗       | ✗         |
| Admin               | ✓      | ✓   | ✓          | ✓   | ✓          | ✓       | ✓         |

---

## 6. Công Nghệ và Công Cụ

### 6.1 Công Nghệ Sử Dụng

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: PostgreSQL, Prisma ORM
-   **Payment Gateway**: VNPay, MoMo, ZaloPay API
-   **Printer**: Thermal Printer API (ESC/POS)
-   **PDF Generation**: PDFKit, Puppeteer
-   **Reporting**: Chart.js, Recharts

### 6.2 Tích Hợp

-   **POS Terminal**: Tích hợp máy POS cho thanh toán thẻ
-   **E-wallet Gateway**: API các ví điện tử
-   **Accounting Software**: Tích hợp phần mềm kế toán
-   **Email Service**: Gửi hóa đơn qua email

---

## 7. Bảng Tóm Tắt Lỗi và Xử Lý

| Lỗi                          | Nguyên Nhân                  | Cách Xử Lý                                        |
| ---------------------------- | ---------------------------- | ------------------------------------------------- |
| Không thể tạo hóa đơn        | Đơn hàng chưa có món phục vụ | Đợi món được phục vụ trước                        |
| Mã giảm giá không hợp lệ     | Mã sai hoặc hết hạn          | Kiểm tra lại mã hoặc liên hệ quản lý              |
| Thanh toán thẻ thất bại      | Lỗi kết nối POS              | Thử lại hoặc chọn phương thức khác                |
| Không đủ tiền mặt            | Khách đưa không đủ           | Yêu cầu khách đưa thêm hoặc chọn phương thức khác |
| Lỗi tính toán                | Bug hệ thống                 | Tính thủ công và báo IT                           |
| Không in được hóa đơn        | Máy in lỗi                   | Kiểm tra máy in hoặc in thủ công/email           |
| Hoàn tiền không được phép    | Chưa có xác nhận quản lý     | Yêu cầu quản lý xác nhận                          |
| Chia hóa đơn sai             | Lỗi chọn món                 | Hủy và chia lại                                   |

---

## 8. Tính Năng Nâng Cao (Trong Tương Lai)

-   **Thanh toán online trước**: Khách thanh toán online trước khi đến
-   **Loyalty Points**: Tích điểm, đổi quà, giảm giá
-   **Digital Receipt**: Hóa đơn điện tử, không cần in giấy
-   **Split by Percentage**: Chia hóa đơn theo % (60%-40%)
-   **Tip Management**: Quản lý tiền tip cho nhân viên
-   **Auto-discount**: Tự động áp giảm giá theo điều kiện
-   **Invoice Template**: Nhiều mẫu hóa đơn khác nhau
-   **Multi-currency**: Hỗ trợ nhiều loại tiền tệ
-   **Installment Payment**: Thanh toán trả góp qua thẻ
-   **Crypto Payment**: Thanh toán bằng tiền điện tử

---

## 9. Lưu Ý Quan Trọng

1. **Bảo mật**: Bảo vệ thông tin thanh toán của khách (PCI-DSS)
2. **Chính xác**: Đảm bảo tính toán chính xác 100%
3. **Nhanh chóng**: Xử lý thanh toán nhanh, không để khách chờ
4. **Minh bạch**: Hóa đơn rõ ràng, dễ hiểu
5. **Tuân thủ**: Tuân thủ quy định về hóa đơn, thuế
6. **Backup**: Sao lưu dữ liệu hóa đơn thường xuyên
7. **Audit Trail**: Ghi log đầy đủ mọi thay đổi
8. **Reconciliation**: Đối soát cuối ngày/ca
9. **Receipt Storage**: Lưu trữ hóa đơn theo quy định pháp luật
10. **Customer Service**: Hỗ trợ khách nếu có vấn đề về hóa đơn

---

## 10. Kết Luận

Hệ thống quản lý hóa đơn và thanh toán là khâu cuối cùng trong chuỗi dịch vụ nhà hàng, trực tiếp ảnh hưởng đến trải nghiệm khách hàng và doanh thu. Một hệ thống tốt giúp:

-   **Tăng tốc độ**: Thanh toán nhanh, không làm khách chờ
-   **Giảm sai sót**: Tự động tính toán, giảm thiểu lỗi người
-   **Tăng doanh thu**: Dễ dàng áp dụng khuyến mãi, upsell
-   **Quản lý tốt**: Báo cáo chi tiết, theo dõi doanh thu real-time
-   **Tuân thủ pháp luật**: Hóa đơn hợp lệ, đầy đủ thông tin

Tài liệu này cung cấp hướng dẫn toàn diện cho việc phát triển, triển khai và sử dụng hệ thống quản lý hóa đơn và thanh toán, đảm bảo nhà hàng vận hành hiệu quả và chuyên nghiệp.
