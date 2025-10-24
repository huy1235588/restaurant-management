# Tài Liệu Chi Tiết Quản Lý Tồn Kho

## 1. Giới Thiệu

Hệ thống quản lý tồn kho là một phần quan trọng của ứng dụng quản lý nhà hàng, giúp theo dõi và quản lý nguyên liệu, vật tư, đảm bảo nguồn cung ứng ổn định cho hoạt động kinh doanh. Hệ thống hỗ trợ quản lý nguyên liệu, nhà cung cấp, đơn đặt hàng, giao dịch kho, theo dõi lô hàng, cảnh báo tồn kho và báo cáo phân tích.

---

## 2. Các Thành Phần Chính

### 2.1 Nguyên Liệu (Ingredients)
- **Định nghĩa**: Các nguyên liệu thô, gia vị, vật tư phục vụ sản xuất món ăn
- **Mục đích**: Theo dõi số lượng tồn kho, chi phí, và quản lý nguồn cung
- **Thông tin chứa**:
  - Mã nguyên liệu (ingredientCode)
  - Tên nguyên liệu
  - Đơn vị tính (kg, g, lít, ml, v.v.)
  - Danh mục nguyên liệu
  - Tồn kho tối thiểu (minimumStock)
  - Tồn kho hiện tại (currentStock)
  - Giá đơn vị (unitCost)
  - Trạng thái hoạt động

### 2.2 Danh Mục Nguyên Liệu (Ingredient Categories)
- **Định nghĩa**: Phân loại nguyên liệu theo nhóm (Thịt, Hải sản, Rau củ, Gia vị, v.v.)
- **Mục đích**: Tổ chức và quản lý nguyên liệu có hệ thống
- **Thông tin chứa**:
  - Tên danh mục
  - Mô tả
  - Trạng thái hoạt động

### 2.3 Nhà Cung Cấp (Suppliers)
- **Định nghĩa**: Các đối tác cung cấp nguyên liệu cho nhà hàng
- **Mục đích**: Quản lý thông tin liên hệ, điều khoản thanh toán với nhà cung cấp
- **Thông tin chứa**:
  - Mã nhà cung cấp (supplierCode)
  - Tên nhà cung cấp
  - Người liên hệ
  - Số điện thoại, Email
  - Địa chỉ
  - Mã số thuế
  - Điều khoản thanh toán
  - Trạng thái hoạt động

### 2.4 Đơn Đặt Hàng (Purchase Orders)
- **Định nghĩa**: Đơn hàng đặt mua nguyên liệu từ nhà cung cấp
- **Mục đích**: Theo dõi quy trình mua hàng từ đặt hàng đến nhận hàng
- **Thông tin chứa**:
  - Số đơn hàng (orderNumber)
  - Nhà cung cấp
  - Nhân viên đặt hàng
  - Ngày đặt hàng
  - Ngày dự kiến nhận (expectedDate)
  - Ngày nhận thực tế (receivedDate)
  - Trạng thái (pending, ordered, received, cancelled)
  - Tổng tiền trước thuế (subtotal)
  - Thuế (taxAmount)
  - Tổng tiền (totalAmount)
  - Ghi chú

### 2.5 Giao Dịch Kho (Stock Transactions)
- **Định nghĩa**: Các giao dịch nhập/xuất/điều chỉnh tồn kho
- **Mục đích**: Theo dõi lịch sử biến động tồn kho
- **Loại giao dịch**:
  - **in**: Nhập kho (từ đơn đặt hàng)
  - **out**: Xuất kho (sử dụng cho sản xuất)
  - **adjustment**: Điều chỉnh (kiểm kê, sửa lỗi)
  - **waste**: Hao hụt (hư hỏng, hết hạn)

### 2.6 Lô Hàng (Ingredient Batches)
- **Định nghĩa**: Theo dõi từng lô nguyên liệu nhập về
- **Mục đích**: Quản lý hạn sử dụng, truy xuất nguồn gốc
- **Thông tin chứa**:
  - Số lô (batchNumber)
  - Nguyên liệu
  - Số lượng ban đầu (quantity)
  - Số lượng còn lại (remainingQuantity)
  - Giá đơn vị (unitCost)
  - Hạn sử dụng (expiryDate)
  - Ngày nhận (receivedDate)
  - Liên kết đơn đặt hàng

### 2.7 Cảnh Báo Tồn Kho (Stock Alerts)
- **Định nghĩa**: Thông báo tự động khi có vấn đề về tồn kho
- **Loại cảnh báo**:
  - **low_stock**: Tồn kho thấp hơn mức tối thiểu
  - **expiring_soon**: Sắp hết hạn (trong 7 ngày)
  - **expired**: Đã hết hạn
- **Thông tin chứa**:
  - Nguyên liệu bị cảnh báo
  - Loại cảnh báo
  - Thông điệp
  - Trạng thái xử lý (isResolved)
  - Người xử lý
  - Thời gian tạo/xử lý

### 2.8 Công Thức (Recipes)
- **Định nghĩa**: Định lượng nguyên liệu cần thiết cho từng món ăn
- **Mục đích**: Tính toán tiêu hao nguyên liệu khi sản xuất món ăn
- **Thông tin chứa**:
  - Món ăn (itemId)
  - Nguyên liệu (ingredientId)
  - Số lượng cần (quantity)
  - Đơn vị
  - Ghi chú

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Nguyên Liệu

#### 3.1.1 Tạo Nguyên Liệu Mới

**Mục tiêu**: Thêm nguyên liệu mới vào hệ thống quản lý kho

**Người tham gia chính**: Quản lý kho, Quản lý nhà hàng

**Điều kiện tiên quyết**:
- Người dùng có quyền "Quản lý Kho"
- Mã nguyên liệu chưa tồn tại trong hệ thống
- Danh mục nguyên liệu đã được tạo

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng truy cập "Quản Lý Kho" → "Nguyên Liệu"
2. **Bước 2**: Nhấn nút "Thêm Nguyên Liệu Mới"
3. **Bước 3**: Điền thông tin nguyên liệu:
   - **Mã nguyên liệu**: Mã duy nhất (ví dụ: NL001, MEAT001)
   - **Tên nguyên liệu**: Tên đầy đủ (ví dụ: "Thịt bò Úc", "Cà chua")
   - **Đơn vị tính**: Chọn đơn vị (kg, g, lít, ml, cái, v.v.)
   - **Danh mục**: Chọn danh mục nguyên liệu
   - **Tồn kho tối thiểu**: Mức cảnh báo (ví dụ: 10 kg)
   - **Tồn kho hiện tại**: Số lượng ban đầu (mặc định 0)
   - **Giá đơn vị**: Giá mua trung bình (tùy chọn)
4. **Bước 4**: Hệ thống kiểm tra:
   - Mã nguyên liệu có duy nhất không
   - Các trường bắt buộc đã điền đủ chưa
   - Số liệu có hợp lệ không (số dương)
5. **Bước 5**: Nếu hợp lệ, lưu vào database
6. **Bước 6**: Thông báo thành công
7. **Bước 7**: Hiển thị nguyên liệu mới trong danh sách

**Xử lý lỗi**:
- Mã nguyên liệu đã tồn tại: "Mã nguyên liệu đã được sử dụng"
- Dữ liệu không hợp lệ: "Vui lòng kiểm tra lại thông tin nhập"
- Tồn kho âm: "Số lượng tồn kho phải là số không âm"

**Ghi log**:
- Người dùng: [username]
- Hành động: Tạo nguyên liệu
- Mã nguyên liệu: [ingredientCode]
- Thời gian: [timestamp]

---

#### 3.1.2 Xem Danh Sách Nguyên Liệu

**Mục tiêu**: Xem và tìm kiếm nguyên liệu trong kho

**Người tham gia chính**: Tất cả nhân viên có quyền truy cập kho

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Kho" → "Nguyên Liệu"
2. **Bước 2**: Hệ thống hiển thị danh sách nguyên liệu với:
   - Mã nguyên liệu
   - Tên nguyên liệu
   - Danh mục
   - Tồn kho hiện tại
   - Đơn vị tính
   - Trạng thái tồn kho (Đủ, Thấp, Hết hàng)
   - Nút hành động (Xem, Sửa, Nhập kho, Xuất kho)
3. **Bước 3**: Có thể lọc theo:
   - Danh mục nguyên liệu
   - Trạng thái tồn kho
   - Trạng thái hoạt động
4. **Bước 4**: Có thể tìm kiếm theo:
   - Mã nguyên liệu
   - Tên nguyên liệu
5. **Bước 5**: Sắp xếp theo:
   - Tên (A-Z, Z-A)
   - Tồn kho (Cao-Thấp, Thấp-Cao)
   - Ngày cập nhật

**Hiển thị cảnh báo**:
- 🔴 Hết hàng: currentStock = 0
- 🟡 Tồn kho thấp: currentStock < minimumStock
- 🟢 Đủ hàng: currentStock >= minimumStock

---

#### 3.1.3 Cập Nhật Thông Tin Nguyên Liệu

**Mục tiêu**: Chỉnh sửa thông tin nguyên liệu

**Người tham gia chính**: Quản lý kho, Quản lý nhà hàng

**Điều kiện tiên quyết**:
- Nguyên liệu tồn tại
- Người dùng có quyền chỉnh sửa

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách nguyên liệu, nhấn nút "Sửa"
2. **Bước 2**: Mở form chỉnh sửa với thông tin hiện tại
3. **Bước 3**: Cập nhật các thông tin cần thiết:
   - Tên nguyên liệu: ✓
   - Đơn vị tính: ✓ (cẩn thận khi thay đổi)
   - Danh mục: ✓
   - Tồn kho tối thiểu: ✓
   - Giá đơn vị: ✓
   - Trạng thái: ✓
   - Mã nguyên liệu: ✗ (không cho phép thay đổi)
   - Tồn kho hiện tại: ✗ (chỉ thay đổi qua giao dịch)
4. **Bước 4**: Hệ thống kiểm tra dữ liệu
5. **Bước 5**: Lưu thay đổi
6. **Bước 6**: Ghi log thay đổi

**Lưu ý**:
- Không thể thay đổi tồn kho hiện tại trực tiếp
- Phải sử dụng giao dịch kho để nhập/xuất/điều chỉnh

---

#### 3.1.4 Vô Hiệu Hóa Nguyên Liệu

**Mục tiêu**: Ngừng sử dụng nguyên liệu mà không xóa khỏi hệ thống

**Người tham gia chính**: Quản lý kho, Quản lý nhà hàng

**Điều kiện tiên quyết**:
- Nguyên liệu tồn tại
- Không có giao dịch đang chờ xử lý

**Quy trình chi tiết**:

1. **Bước 1**: Chọn nguyên liệu cần vô hiệu hóa
2. **Bước 2**: Nhấn nút "Vô hiệu hóa"
3. **Bước 3**: Xác nhận hành động
4. **Bước 4**: Hệ thống cập nhật trạng thái isActive = false
5. **Bước 5**: Nguyên liệu không hiển thị trong danh sách hoạt động
6. **Bước 6**: Dữ liệu lịch sử vẫn được giữ nguyên

**Lợi ích**:
- Giữ lại lịch sử giao dịch
- Có thể kích hoạt lại khi cần
- Báo cáo vẫn chính xác

---

### 3.2 Quản Lý Danh Mục Nguyên Liệu

#### 3.2.1 Tạo Danh Mục Nguyên Liệu

**Mục tiêu**: Tạo nhóm phân loại cho nguyên liệu

**Người tham gia chính**: Quản lý kho, Quản lý nhà hàng

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Kho" → "Danh Mục Nguyên Liệu"
2. **Bước 2**: Nhấn "Tạo Danh Mục Mới"
3. **Bước 3**: Điền thông tin:
   - **Tên danh mục**: Ví dụ "Thịt", "Hải sản", "Rau củ", "Gia vị"
   - **Mô tả**: Mô tả chi tiết về nhóm nguyên liệu
4. **Bước 4**: Lưu danh mục
5. **Bước 5**: Danh mục mới có thể sử dụng ngay

**Danh mục gợi ý**:
- Thịt (Thịt bò, heo, gà, v.v.)
- Hải sản (Tôm, cá, mực, v.v.)
- Rau củ (Rau xanh, củ quả)
- Gia vị (Muối, đường, gia vị khô)
- Nước sốt (Tương, dầu ăn, nước mắm)
- Đồ khô (Mì, bún, phở)
- Đồ đông lạnh
- Đồ uống (Nước ngọt, bia, rượu)
- Vật tư tiêu hao (Túi, hộp, đũa)

---

### 3.3 Quản Lý Nhà Cung Cấp

#### 3.3.1 Thêm Nhà Cung Cấp Mới

**Mục tiêu**: Thêm đối tác cung cấp nguyên liệu

**Người tham gia chính**: Quản lý mua hàng, Quản lý nhà hàng

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Kho" → "Nhà Cung Cấp"
2. **Bước 2**: Nhấn "Thêm Nhà Cung Cấp"
3. **Bước 3**: Điền thông tin:
   - **Mã nhà cung cấp**: Mã duy nhất (SUP001, NCC001)
   - **Tên công ty**: Tên đầy đủ của nhà cung cấp
   - **Người liên hệ**: Tên người đại diện
   - **Số điện thoại**: Số liên lạc chính
   - **Email**: Email liên hệ
   - **Địa chỉ**: Địa chỉ đầy đủ
   - **Mã số thuế**: Mã số thuế doanh nghiệp
   - **Điều khoản thanh toán**: Ví dụ "Thanh toán trong 30 ngày"
4. **Bước 4**: Kiểm tra mã nhà cung cấp duy nhất
5. **Bước 5**: Lưu thông tin
6. **Bước 6**: Nhà cung cấp sẵn sàng để tạo đơn hàng

**Thông tin bổ sung**:
- Lịch sử giao dịch
- Đánh giá chất lượng
- Tổng giá trị đơn hàng
- Tỷ lệ giao hàng đúng hạn

---

#### 3.3.2 Quản Lý Thông Tin Nhà Cung Cấp

**Mục tiêu**: Cập nhật và theo dõi nhà cung cấp

**Chức năng**:
- Xem danh sách nhà cung cấp
- Cập nhật thông tin liên hệ
- Xem lịch sử đơn hàng
- Đánh giá hiệu suất
- Vô hiệu hóa nhà cung cấp không còn hợp tác

---

### 3.4 Quản Lý Đơn Đặt Hàng

#### 3.4.1 Tạo Đơn Đặt Hàng Mới

**Mục tiêu**: Đặt hàng nguyên liệu từ nhà cung cấp

**Người tham gia chính**: Quản lý kho, Nhân viên mua hàng

**Điều kiện tiên quyết**:
- Người dùng có quyền tạo đơn hàng
- Nhà cung cấp đã được thiết lập
- Nguyên liệu cần đặt đã có trong hệ thống

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Kho" → "Đơn Đặt Hàng"
2. **Bước 2**: Nhấn "Tạo Đơn Đặt Hàng Mới"
3. **Bước 3**: Chọn nhà cung cấp
4. **Bước 4**: Nhập thông tin đơn hàng:
   - Ngày đặt hàng: Tự động (ngày hiện tại)
   - Ngày dự kiến nhận: Chọn ngày
   - Ghi chú: Thông tin bổ sung
5. **Bước 5**: Thêm nguyên liệu vào đơn:
   - Chọn nguyên liệu
   - Nhập số lượng
   - Nhập đơn giá
   - Hệ thống tự động tính thành tiền
   - Có thể thêm nhiều nguyên liệu
6. **Bước 6**: Hệ thống tính toán:
   - Tổng tiền trước thuế (subtotal)
   - Thuế VAT (taxAmount) - mặc định 10%
   - Tổng tiền thanh toán (totalAmount)
7. **Bước 7**: Xem trước và xác nhận đơn hàng
8. **Bước 8**: Lưu đơn với trạng thái "pending"
9. **Bước 9**: Có thể in đơn hàng hoặc gửi email cho nhà cung cấp

**Trạng thái đơn hàng**:
- **pending**: Đang soạn thảo, chưa gửi
- **ordered**: Đã gửi cho nhà cung cấp
- **received**: Đã nhận hàng đầy đủ
- **cancelled**: Đã hủy đơn

**Xử lý lỗi**:
- Không có nguyên liệu trong đơn: "Vui lòng thêm ít nhất một nguyên liệu"
- Số lượng không hợp lệ: "Số lượng phải lớn hơn 0"
- Đơn giá không hợp lệ: "Đơn giá phải là số dương"

---

#### 3.4.2 Xác Nhận Gửi Đơn Đặt Hàng

**Mục tiêu**: Gửi đơn đặt hàng cho nhà cung cấp

**Quy trình**:

1. **Bước 1**: Mở đơn đặt hàng ở trạng thái "pending"
2. **Bước 2**: Kiểm tra lại thông tin
3. **Bước 3**: Nhấn "Xác Nhận Gửi Đơn"
4. **Bước 4**: Trạng thái chuyển sang "ordered"
5. **Bước 5**: Ghi nhận thời gian gửi đơn
6. **Bước 6**: Tùy chọn gửi email tự động cho nhà cung cấp

**Lưu ý**:
- Sau khi gửi, không thể chỉnh sửa thông tin đơn hàng
- Chỉ có thể hủy đơn nếu cần

---

#### 3.4.3 Nhận Hàng và Nhập Kho

**Mục tiêu**: Xác nhận nhận hàng và cập nhật tồn kho

**Người tham gia chính**: Quản lý kho, Nhân viên kho

**Điều kiện tiên quyết**:
- Đơn đặt hàng ở trạng thái "ordered"
- Hàng đã được giao đến

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập đơn đặt hàng cần nhận
2. **Bước 2**: Nhấn "Nhận Hàng"
3. **Bước 3**: Kiểm tra và nhập thông tin thực tế:
   - Ngày nhận hàng: Tự động (ngày hiện tại)
   - Đối chiếu từng nguyên liệu:
     - Số lượng đặt vs số lượng nhận
     - Chất lượng hàng hóa
     - Hạn sử dụng (nếu có)
4. **Bước 4**: Nhập số lượng thực tế nhận cho từng nguyên liệu
5. **Bước 5**: Nếu nguyên liệu có hạn sử dụng, nhập thông tin lô hàng:
   - Số lô (batchNumber)
   - Hạn sử dụng (expiryDate)
   - Đơn giá thực tế
6. **Bước 6**: Hệ thống tự động:
   - Tạo giao dịch nhập kho (type = "in")
   - Cập nhật currentStock cho mỗi nguyên liệu
   - Tạo bản ghi IngredientBatch (nếu có)
   - Cập nhật unitCost trung bình
7. **Bước 7**: Cập nhật trạng thái đơn hàng:
   - Nếu nhận đủ: "received"
   - Nếu nhận thiếu: Ghi chú số lượng thiếu
8. **Bước 8**: Ghi nhận ngày nhận thực tế (receivedDate)
9. **Bước 9**: In phiếu nhập kho

**Xử lý trường hợp đặc biệt**:
- **Nhận thiếu hàng**: Ghi nhận số lượng thiếu, có thể tạo đơn bổ sung
- **Hàng không đạt chất lượng**: Từ chối nhận, liên hệ nhà cung cấp
- **Nhận sai hàng**: Ghi nhận và yêu cầu đổi trả

---

#### 3.4.4 Hủy Đơn Đặt Hàng

**Mục tiêu**: Hủy đơn đặt hàng khi cần thiết

**Điều kiện**:
- Đơn hàng chưa nhận (trạng thái pending hoặc ordered)

**Quy trình**:

1. **Bước 1**: Mở đơn đặt hàng cần hủy
2. **Bước 2**: Nhấn "Hủy Đơn"
3. **Bước 3**: Nhập lý do hủy
4. **Bước 4**: Xác nhận hủy
5. **Bước 5**: Trạng thái chuyển sang "cancelled"
6. **Bước 6**: Thông báo cho nhà cung cấp (nếu đã gửi đơn)

---

### 3.5 Quản Lý Giao Dịch Kho

#### 3.5.1 Nhập Kho Thủ Công

**Mục tiêu**: Nhập kho không qua đơn đặt hàng

**Trường hợp sử dụng**:
- Mua hàng trực tiếp tại chợ
- Nhập kho từ nguồn khác
- Điều chuyển từ kho khác

**Quy trình**:

1. **Bước 1**: Truy cập "Quản Lý Kho" → "Giao Dịch"
2. **Bước 2**: Chọn "Nhập Kho"
3. **Bước 3**: Chọn nguyên liệu
4. **Bước 4**: Nhập thông tin:
   - Số lượng nhập
   - Đơn vị
   - Loại giao dịch: "in"
   - Ghi chú: Nguồn hàng, lý do
5. **Bước 5**: Xác nhận giao dịch
6. **Bước 6**: Hệ thống tự động:
   - Tạo StockTransaction
   - Cập nhật currentStock += quantity
   - Ghi log

---

#### 3.5.2 Xuất Kho

**Mục tiêu**: Ghi nhận sử dụng nguyên liệu cho sản xuất

**Cách thức**:
- **Tự động**: Khi xác nhận đơn hàng, hệ thống tự động trừ nguyên liệu theo công thức
- **Thủ công**: Xuất kho cho mục đích khác

**Quy trình xuất kho thủ công**:

1. **Bước 1**: Truy cập "Giao Dịch" → "Xuất Kho"
2. **Bước 2**: Chọn nguyên liệu
3. **Bước 3**: Nhập số lượng xuất
4. **Bước 4**: Nhập lý do: Sản xuất, Hao hụt, Khác
5. **Bước 5**: Xác nhận
6. **Bước 6**: Hệ thống:
   - Tạo StockTransaction (type = "out")
   - Cập nhật currentStock -= quantity
   - Kiểm tra tồn kho, tạo cảnh báo nếu cần

**Quy trình xuất kho tự động**:

1. Khi đơn hàng chuyển sang trạng thái "preparing"
2. Hệ thống lấy danh sách món ăn trong đơn
3. Tính toán nguyên liệu cần dựa trên Recipe
4. Tạo StockTransaction cho mỗi nguyên liệu
5. Trừ tồn kho tương ứng
6. Nếu tồn kho không đủ, cảnh báo

---

#### 3.5.3 Điều Chỉnh Tồn Kho

**Mục tiêu**: Điều chỉnh số lượng tồn kho sau kiểm kê

**Trường hợp sử dụng**:
- Sai số nhập liệu
- Kiểm kê định kỳ
- Phát hiện hàng hư hỏng

**Quy trình**:

1. **Bước 1**: Truy cập "Giao Dịch" → "Điều Chỉnh"
2. **Bước 2**: Chọn nguyên liệu cần điều chỉnh
3. **Bước 3**: Xem tồn kho hiện tại trong hệ thống
4. **Bước 4**: Nhập tồn kho thực tế sau kiểm kê
5. **Bước 5**: Hệ thống tính chênh lệch
6. **Bước 6**: Nhập lý do điều chỉnh
7. **Bước 7**: Xác nhận
8. **Bước 8**: Hệ thống:
   - Tạo StockTransaction (type = "adjustment")
   - Cập nhật currentStock = actual quantity
   - Ghi log chi tiết

---

#### 3.5.4 Ghi Nhận Hao Hụt

**Mục tiêu**: Ghi nhận nguyên liệu hư hỏng, hết hạn

**Quy trình**:

1. **Bước 1**: Truy cập "Giao Dịch" → "Hao Hụt"
2. **Bước 2**: Chọn nguyên liệu
3. **Bước 3**: Chọn lô hàng (nếu có)
4. **Bước 4**: Nhập số lượng hao hụt
5. **Bước 5**: Chọn lý do:
   - Hết hạn sử dụng
   - Hư hỏng trong bảo quản
   - Sai sót trong chế biến
   - Mất mát, hỏng hóc
6. **Bước 6**: Xác nhận
7. **Bước 7**: Hệ thống:
   - Tạo StockTransaction (type = "waste")
   - Trừ tồn kho
   - Cập nhật remainingQuantity của batch (nếu có)
   - Ghi log để báo cáo

---

#### 3.5.5 Xem Lịch Sử Giao Dịch

**Mục tiêu**: Tra cứu lịch sử nhập/xuất/điều chỉnh

**Chức năng**:
- Xem tất cả giao dịch của một nguyên liệu
- Lọc theo loại giao dịch
- Lọc theo thời gian
- Lọc theo người thực hiện
- Xuất báo cáo

**Thông tin hiển thị**:
- Thời gian giao dịch
- Loại giao dịch
- Nguyên liệu
- Số lượng (+/-)
- Tồn kho sau giao dịch
- Người thực hiện
- Ghi chú

---

### 3.6 Quản Lý Lô Hàng và Hạn Sử Dụng

#### 3.6.1 Theo Dõi Lô Hàng

**Mục tiêu**: Quản lý nguyên liệu theo từng lô nhập về

**Lợi ích**:
- Truy xuất nguồn gốc
- Quản lý hạn sử dụng
- Xuất kho theo FIFO (First In First Out)
- Tính giá vốn chính xác

**Quy trình tự động**:
- Khi nhận hàng từ đơn đặt hàng
- Hệ thống tự động tạo IngredientBatch
- Lưu thông tin: số lô, số lượng, hạn sử dụng, giá

**Quy trình thủ công**:
1. Truy cập "Quản Lý Kho" → "Lô Hàng"
2. Chọn "Thêm Lô Hàng Mới"
3. Chọn nguyên liệu
4. Nhập thông tin lô:
   - Số lô
   - Số lượng
   - Hạn sử dụng
   - Ngày nhận
   - Giá đơn vị
5. Lưu thông tin

---

#### 3.6.2 Xuất Kho Theo FIFO

**Mục tiêu**: Ưu tiên xuất hàng nhập trước

**Quy trình**:

1. Khi có lệnh xuất kho
2. Hệ thống tìm các lô hàng còn tồn
3. Sắp xếp theo ngày nhận (cũ nhất trước)
4. Trừ số lượng từ lô cũ nhất
5. Nếu lô đó không đủ, trừ tiếp từ lô tiếp theo
6. Cập nhật remainingQuantity cho các lô

**Ví dụ**:
- Cần xuất 15kg gạo
- Lô 1 (01/01/2024): Còn 10kg
- Lô 2 (05/01/2024): Còn 20kg
- Kết quả: Trừ 10kg từ Lô 1, 5kg từ Lô 2

---

#### 3.6.3 Cảnh Báo Hàng Sắp Hết Hạn

**Mục tiêu**: Thông báo kịp thời để xử lý

**Quy trình tự động**:

1. Hệ thống chạy job định kỳ (mỗi ngày)
2. Kiểm tra tất cả lô hàng
3. Tìm lô có expiryDate trong vòng 7 ngày
4. Tạo StockAlert (type = "expiring_soon")
5. Gửi thông báo cho quản lý kho
6. Hiển thị trên dashboard

**Xử lý cảnh báo**:
- Ưu tiên sử dụng trong sản xuất
- Giảm giá để tiêu thụ nhanh
- Chuyển đổi mục đích sử dụng (nếu được)
- Thanh lý trước khi hết hạn

---

#### 3.6.4 Xử Lý Hàng Hết Hạn

**Quy trình**:

1. Hệ thống phát hiện lô hàng hết hạn
2. Tạo StockAlert (type = "expired")
3. Thông báo cho quản lý kho
4. Quản lý kho kiểm tra thực tế
5. Ghi nhận hao hụt (StockTransaction type = "waste")
6. Trừ tồn kho
7. Cập nhật trạng thái lô hàng
8. Ghi log cho báo cáo

---

### 3.7 Hệ Thống Cảnh Báo Tồn Kho

#### 3.7.1 Cảnh Báo Tồn Kho Thấp

**Kích hoạt**: currentStock < minimumStock

**Quy trình tự động**:

1. Sau mỗi giao dịch xuất kho/điều chỉnh
2. Hệ thống kiểm tra currentStock
3. So sánh với minimumStock
4. Nếu thấp hơn, tạo StockAlert (type = "low_stock")
5. Gửi thông báo cho:
   - Quản lý kho
   - Nhân viên mua hàng
   - Quản lý nhà hàng
6. Hiển thị badge cảnh báo trên dashboard

**Thông tin cảnh báo**:
- Nguyên liệu bị thiếu
- Số lượng hiện tại
- Mức tối thiểu
- Số lượng cần đặt hàng (đề xuất)
- Nhà cung cấp gợi ý

---

#### 3.7.2 Xử Lý Cảnh Báo

**Quy trình**:

1. **Bước 1**: Xem danh sách cảnh báo
2. **Bước 2**: Đánh giá mức độ ưu tiên
3. **Bước 3**: Thực hiện hành động:
   - Tạo đơn đặt hàng
   - Điều chỉnh mức tồn kho tối thiểu
   - Tìm nhà cung cấp thay thế
4. **Bước 4**: Đánh dấu cảnh báo đã xử lý
5. **Bước 5**: Ghi chú hành động đã thực hiện

---

#### 3.7.3 Báo Cáo Cảnh Báo

**Nội dung**:
- Số lượng cảnh báo theo loại
- Thời gian phản hồi trung bình
- Nguyên liệu hay bị cảnh báo
- Xu hướng cảnh báo theo thời gian

---

### 3.8 Quản Lý Công Thức (Recipes)

#### 3.8.1 Thiết Lập Công Thức Món Ăn

**Mục tiêu**: Định lượng nguyên liệu cho từng món

**Người tham gia chính**: Đầu bếp, Quản lý bếp, Quản lý nhà hàng

**Quy trình**:

1. **Bước 1**: Truy cập "Quản Lý Menu" → Chọn món ăn
2. **Bước 2**: Nhấn tab "Công Thức"
3. **Bước 3**: Nhấn "Thêm Nguyên Liệu"
4. **Bước 4**: Chọn nguyên liệu từ danh sách
5. **Bước 5**: Nhập số lượng cần thiết cho 1 phần
6. **Bước 6**: Chọn đơn vị (phải khớp với đơn vị trong kho)
7. **Bước 7**: Thêm ghi chú nếu cần
8. **Bước 8**: Lưu công thức
9. **Bước 9**: Lặp lại cho các nguyên liệu khác

**Ví dụ - Công thức Phở Bò**:
- Bánh phở: 200g
- Thịt bò: 150g
- Hành tây: 30g
- Rau thơm: 20g
- Nước dùng: 500ml
- Gia vị phở: 15g

---

#### 3.8.2 Tính Toán Chi Phí Món Ăn

**Mục tiêu**: Xác định giá vốn món ăn

**Công thức**:
```
Chi phí món = Σ (Số lượng nguyên liệu × Giá đơn vị)
Tỷ lệ chi phí = (Chi phí món / Giá bán) × 100%
```

**Quy trình tự động**:
1. Hệ thống lấy công thức món ăn
2. Lấy giá đơn vị (unitCost) của từng nguyên liệu
3. Tính tổng chi phí nguyên liệu
4. So sánh với giá bán
5. Tính tỷ lệ chi phí (food cost %)
6. Cảnh báo nếu tỷ lệ > 35% (tùy cấu hình)

---

#### 3.8.3 Kiểm Tra Tính Khả Dụng Món Ăn

**Mục tiêu**: Kiểm tra xem có đủ nguyên liệu không

**Quy trình tự động**:

1. Khi khách đặt món
2. Hệ thống lấy công thức
3. Kiểm tra currentStock của từng nguyên liệu
4. So sánh với số lượng cần
5. Nếu đủ: Cho phép đặt
6. Nếu không đủ: 
   - Đánh dấu món "Hết hàng"
   - Thông báo cho nhân viên
   - Gợi ý món thay thế

---

### 3.9 Báo Cáo và Phân Tích

#### 3.9.1 Báo Cáo Tồn Kho

**Nội dung**:
- Danh sách nguyên liệu và số lượng tồn
- Giá trị tồn kho (số lượng × đơn giá)
- Phân loại theo danh mục
- Tỷ lệ tồn kho (so với tối thiểu)

**Lọc và sắp xếp**:
- Theo danh mục
- Theo giá trị (cao đến thấp)
- Theo trạng thái (đủ/thấp/hết)

---

#### 3.9.2 Báo Cáo Nhập - Xuất - Tồn

**Kỳ báo cáo**: Ngày, Tuần, Tháng, Quý, Năm, Tùy chỉnh

**Nội dung**:
- Tồn đầu kỳ
- Nhập trong kỳ (số lượng, giá trị)
- Xuất trong kỳ (số lượng, giá trị)
- Điều chỉnh, hao hụt
- Tồn cuối kỳ

**Công thức**:
```
Tồn cuối = Tồn đầu + Nhập - Xuất + Điều chỉnh
```

---

#### 3.9.3 Báo Cáo Nhà Cung Cấp

**Nội dung**:
- Tổng giá trị đơn hàng theo nhà cung cấp
- Số lượng đơn hàng
- Tỷ lệ giao hàng đúng hạn
- Đánh giá chất lượng
- Nhà cung cấp uy tín nhất

---

#### 3.9.4 Báo Cáo Hao Hụt

**Mục đích**: Phân tích nguyên nhân và giảm thiểu

**Nội dung**:
- Tổng giá trị hao hụt
- Phân loại theo nguyên nhân
- Top nguyên liệu hao hụt nhiều nhất
- Xu hướng hao hụt theo thời gian
- Đề xuất cải thiện

---

#### 3.9.5 Báo Cáo Hiệu Suất Kho

**Chỉ số quan trọng**:

1. **Vòng quay kho (Inventory Turnover)**:
```
Vòng quay = Giá vốn hàng bán / Tồn kho trung bình
```

2. **Số ngày tồn kho (Days Inventory Outstanding)**:
```
DIO = 365 / Vòng quay kho
```

3. **Tỷ lệ hao hụt**:
```
Tỷ lệ hao hụt = (Giá trị hao hụt / Giá trị nhập) × 100%
```

4. **Độ chính xác tồn kho**:
```
Độ chính xác = (1 - |Tồn thực tế - Tồn hệ thống| / Tồn hệ thống) × 100%
```

---

## 4. Quy Trình Hoạt Động Tổng Hợp

### 4.1 Quy Trình Kiểm Kê Định Kỳ

**Tần suất**: Hàng tháng hoặc quý

**Quy trình**:

1. **Chuẩn bị**:
   - Lập kế hoạch kiểm kê
   - Phân công nhân sự
   - In danh sách nguyên liệu
   
2. **Thực hiện**:
   - Đếm thực tế từng nguyên liệu
   - Ghi nhận vào phiếu kiểm kê
   - Kiểm tra hạn sử dụng
   
3. **Đối chiếu**:
   - So sánh thực tế với hệ thống
   - Ghi nhận chênh lệch
   - Điều tra nguyên nhân
   
4. **Điều chỉnh**:
   - Tạo giao dịch điều chỉnh
   - Cập nhật tồn kho trong hệ thống
   - Báo cáo kết quả

5. **Xử lý**:
   - Xử lý hàng hết hạn
   - Xử lý hàng hư hỏng
   - Đề xuất cải tiến

---

### 4.2 Quy Trình Đặt Hàng Tự Động

**Mục đích**: Tự động tạo đơn khi tồn kho thấp

**Điều kiện kích hoạt**:
- currentStock < minimumStock
- Chưa có đơn đang đặt cho nguyên liệu này

**Quy trình**:

1. Hệ thống phát hiện tồn kho thấp
2. Tính số lượng cần đặt:
```
Số lượng đặt = (Tồn kho tối ưu - Tồn kho hiện tại)
Tồn kho tối ưu = minimumStock × 2
```
3. Tìm nhà cung cấp ưu tiên
4. Tạo đơn hàng nháp (draft)
5. Gửi thông báo cho người phê duyệt
6. Người phê duyệt xem và xác nhận
7. Gửi đơn cho nhà cung cấp

---

### 4.3 Quy Trình Xử Lý Đơn Hàng Món Ăn

**Mục đích**: Tự động trừ nguyên liệu khi sản xuất

**Quy trình**:

1. Khách đặt món (Order created)
2. Kiểm tra tính khả dụng (Recipe availability check)
3. Xác nhận đơn (Order confirmed)
4. Chuyển sang bếp (Status = "preparing")
5. **Hệ thống tự động**:
   - Lấy công thức các món trong đơn
   - Tính tổng nguyên liệu cần
   - Tạo StockTransaction (type = "out")
   - Trừ currentStock
   - Trừ remainingQuantity của batches (FIFO)
6. Kiểm tra tồn kho sau trừ
7. Tạo cảnh báo nếu cần

---

## 5. Best Practices và Lưu Ý

### 5.1 Quản Lý Tồn Kho Hiệu Quả

**Nguyên tắc**:
1. **FIFO** (First In First Out): Xuất hàng nhập trước
2. **Tồn kho tối thiểu hợp lý**: Không quá cao (vốn ứ), không quá thấp (thiếu hàng)
3. **Kiểm kê định kỳ**: Đảm bảo độ chính xác
4. **Phân loại ABC**: 
   - A: Nguyên liệu quan trọng, giá trị cao
   - B: Nguyên liệu trung bình
   - C: Nguyên liệu ít quan trọng

### 5.2 Giảm Thiểu Hao Hụt

**Biện pháp**:
- Kiểm tra hạn sử dụng thường xuyên
- Bảo quản đúng cách (nhiệt độ, độ ẩm)
- Đào tạo nhân viên xử lý nguyên liệu
- Sử dụng nguyên liệu gần hết hạn trước
- Kiểm soát chặt chẽ quy trình xuất kho

### 5.3 Tối Ưu Chi Phí

**Chiến lược**:
- So sánh giá nhiều nhà cung cấp
- Đàm phán điều khoản thanh toán
- Mua số lượng lớn cho nguyên liệu ổn định
- Theo dõi giá thị trường
- Tính toán food cost % chính xác

### 5.4 An Toàn Thực Phẩm

**Yêu cầu**:
- Ghi nhận đầy đủ thông tin lô hàng
- Theo dõi hạn sử dụng nghiêm ngặt
- Truy xuất nguồn gốc khi cần
- Xử lý hàng hết hạn kịp thời
- Tuân thủ quy định ATTP

### 5.5 Phân Quyền

**Quản lý kho**:
- Toàn quyền quản lý nguyên liệu
- Tạo và duyệt đơn đặt hàng
- Nhập/xuất/điều chỉnh kho
- Xem tất cả báo cáo

**Nhân viên kho**:
- Xem danh sách nguyên liệu
- Ghi nhận nhập/xuất kho
- Kiểm tra hạn sử dụng

**Đầu bếp**:
- Xem nguyên liệu khả dụng
- Tạo và cập nhật công thức
- Đề xuất đặt hàng

**Quản lý nhà hàng**:
- Xem tất cả dữ liệu
- Phê duyệt đơn hàng lớn
- Xem báo cáo tổng hợp

---

## 6. Tích Hợp với Các Module Khác

### 6.1 Tích Hợp với Menu Management
- Công thức món ăn (Recipe)
- Kiểm tra nguyên liệu khả dụng
- Tính giá vốn món ăn
- Tự động cập nhật trạng thái món

### 6.2 Tích Hợp với Order Management
- Tự động trừ nguyên liệu khi đơn hàng confirmed
- Kiểm tra khả năng đáp ứng đơn
- Báo cáo tiêu hao theo đơn hàng

### 6.3 Tích Hợp với Accounting
- Tính giá trị tồn kho
- Ghi nhận chi phí mua hàng
- Báo cáo lãi/lỗ
- Theo dõi công nợ nhà cung cấp

---

## 7. Kết Luận

Hệ thống quản lý tồn kho là xương sống của hoạt động nhà hàng, đảm bảo:
- ✅ Nguồn cung ổn định
- ✅ Kiểm soát chi phí hiệu quả
- ✅ Giảm thiểu hao hụt
- ✅ Đảm bảo an toàn thực phẩm
- ✅ Hỗ trợ ra quyết định kinh doanh

Việc sử dụng hệ thống một cách đúng đắn và nhất quán sẽ giúp nhà hàng hoạt động trơn tru và tối ưu lợi nhuận.
