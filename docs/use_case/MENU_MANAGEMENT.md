# Tài Liệu Chi Tiết Quản Lý Menu và Danh Mục

## 1. Giới Thiệu

Hệ thống quản lý menu và danh mục là một phần thiết yếu của ứng dụng quản lý nhà hàng. Nó cho phép quản lý nhà hàng tạo, chỉnh sửa, xóa và quản lý các danh mục thực phẩm cũng như các món ăn trong menu. Hệ thống hỗ trợ quản lý giá cả, trạng thái sẵn có, ảnh sản phẩm, và thông tin chi tiết về từng món ăn.

---

## 2. Các Thành Phần Chính

### 2.1 Danh Mục (Categories)

-   **Định nghĩa**: Nhóm các món ăn theo loại (Khai vị, Chính, Tráng miệng, Đồ uống, v.v.)
-   **Mục đích**: Tổ chức menu một cách logic, giúp khách hàng dễ dàng tìm kiếm
-   **Thông tin chứa**:
    -   Tên danh mục
    -   Mô tả chi tiết
    -   Ảnh đại diện
    -   Thứ tự hiển thị
    -   Trạng thái (hoạt động/ẩn)

### 2.2 Sản Phẩm (Menu Items)

-   **Định nghĩa**: Các món ăn, đồ uống cụ thể trong menu
-   **Mục đích**: Hiển thị danh sách các lựa chọn cho khách hàng
-   **Thông tin chứa**:
    -   Tên món ăn
    -   Mô tả chi tiết, công thức
    -   Giá tiền (có thể có nhiều mức giá)
    -   Ảnh sản phẩm
    -   Danh mục
    -   Thành phần chính (allergens)
    -   Thời gian chuẩn bị
    -   Trạng thái sẵn có
    -   Lịch sử thay đổi giá
    -   Ghi chú, hướng dẫn đặc biệt

---

## 3. Các Nghiệp Vụ Chi Tiết

### 3.1 Quản Lý Danh Mục

#### 3.1.1 Tạo Danh Mục

**Mục tiêu**: Tạo một danh mục mới để phân loại các món ăn

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Điều kiện tiên quyết**:

-   Người dùng có quyền "Quản lý Menu"
-   Tên danh mục chưa tồn tại trong hệ thống

**Quy trình chi tiết**:

1. **Bước 1**: Người dùng truy cập vào phần "Quản Lý Menu" → "Danh Mục"
2. **Bước 2**: Nhấn nút "Tạo Danh Mục Mới"
3. **Bước 3**: Điền thông tin:
    - **Tên danh mục**: Nhập tên (ví dụ: "Khai vị", "Chính", "Tráng miệng")
    - **Mô tả**: Nhập mô tả chi tiết về danh mục
    - **Ảnh đại diện**: Tải lên ảnh (định dạng: JPG, PNG, tối đa 5MB)
    - **Thứ tự hiển thị**: Số nguyên (1, 2, 3...) để sắp xếp thứ tự
    - **Trạng thái**: Chọn "Hoạt động" hoặc "Ẩn"
4. **Bước 4**: Hệ thống kiểm tra:
    - Tên danh mục có duy nhất không
    - Ảnh có hợp lệ không
    - Dữ liệu có đầy đủ không
5. **Bước 5**: Nếu hợp lệ, lưu vào database
6. **Bước 6**: Thông báo thành công
7. **Bước 7**: Hiển thị danh mục mới trên giao diện menu

**Xử lý lỗi**:

-   Nếu tên danh mục đã tồn tại: Hiển thị lỗi "Danh mục đã tồn tại"
-   Nếu ảnh không hợp lệ: Hiển thị lỗi "Ảnh không hợp lệ hoặc quá lớn"
-   Nếu dữ liệu chưa đầy đủ: Hiển thị lỗi "Vui lòng điền đầy đủ thông tin"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Tạo danh mục
-   Tên danh mục: [name]
-   Thời gian: [timestamp]
-   Kết quả: Thành công/Thất bại

---

#### 3.1.2 Xem Danh Sách Danh Mục

**Mục tiêu**: Xem toàn bộ danh mục hiện có trong hệ thống

**Người tham gia chính**: Quản lý nhà hàng, Admin, Nhân viên phục vụ

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Menu" → "Danh Mục"
2. **Bước 2**: Hệ thống hiển thị danh sách danh mục dưới dạng bảng hoặc lưới với:
    - Tên danh mục
    - Số lượng sản phẩm trong danh mục
    - Ảnh đại diện
    - Trạng thái (Hoạt động/Ẩn)
    - Ngày tạo
    - Ngày chỉnh sửa gần nhất
    - Nút hành động (Sửa, Xóa, Ẩn/Hiển thị)
3. **Bước 3**: Có thể lọc theo:
    - Trạng thái (Hoạt động, Ẩn)
    - Ngày tạo (từ - đến)
4. **Bước 4**: Có thể tìm kiếm theo tên danh mục
5. **Bước 5**: Sắp xếp theo:
    - Thứ tự hiển thị
    - Tên (A-Z, Z-A)
    - Ngày tạo (mới nhất, cũ nhất)
    - Số sản phẩm

---

#### 3.1.3 Chỉnh Sửa Danh Mục

**Mục tiêu**: Cập nhật thông tin của danh mục hiện có

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Điều kiện tiên quyết**:

-   Danh mục tồn tại
-   Người dùng có quyền chỉnh sửa
-   Các sản phẩm trong danh mục không bị ảnh hưởng

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách danh mục, nhấn nút "Sửa" (edit icon)
2. **Bước 2**: Mở form chỉnh sửa với thông tin hiện tại:
    - Tên danh mục
    - Mô tả
    - Ảnh đại diện
    - Thứ tự hiển thị
    - Trạng thái
3. **Bước 3**: Cập nhật thông tin cần thiết
4. **Bước 4**: Nếu thay đổi ảnh, hệ thống xóa ảnh cũ
5. **Bước 5**: Hệ thống kiểm tra dữ liệu
6. **Bước 6**: Lưu thay đổi
7. **Bước 7**: Cập nhật menu ngay lập tức
8. **Bước 8**: Ghi log thay đổi

**Các trường có thể chỉnh sửa**:

-   Tên danh mục: ✓ (kiểm tra duy nhất, ngoại trừ tên cũ)
-   Mô tả: ✓
-   Ảnh: ✓
-   Thứ tự hiển thị: ✓
-   Trạng thái: ✓

**Ghi log thay đổi**:

-   Người dùng: [username]
-   Hành động: Chỉnh sửa danh mục
-   Danh mục: [category_name]
-   Trường thay đổi: [field_name]
-   Giá trị cũ: [old_value]
-   Giá trị mới: [new_value]
-   Thời gian: [timestamp]

---

#### 3.1.4 Ẩn/Hiển thị Danh Mục

**Mục tiêu**: Tạm thời ẩn danh mục mà không xóa dữ liệu

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách danh mục, chọn danh mục cần ẩn
2. **Bước 2**: Nhấn nút "Ẩn" hoặc click vào toggle trạng thái
3. **Bước 3**: Hệ thống yêu cầu xác nhận
4. **Bước 4**: Kiểm tra số lượng sản phẩm còn hiển thị
5. **Bước 5**: Cập nhật trạng thái thành "Ẩn"
6. **Bước 6**: Danh mục không hiển thị trên menu khách hàng
7. **Bước 7**: Ghi log hành động

**Lưu ý**:

-   Ẩn danh mục không ảnh hưởng đến các sản phẩm trong đó (sản phẩm vẫn tồn tại)
-   Danh mục ẩn vẫn hiển thị trong phần quản lý cho admin
-   Có thể hiển thị lại bất cứ lúc nào

---

#### 3.1.5 Xóa Danh Mục

**Mục tiêu**: Xóa danh mục khỏi hệ thống vĩnh viễn

**Người tham gia chính**: Quản lý nhà hàng, Admin

**Điều kiện tiên quyết**:

-   Danh mục không chứa sản phẩm nào (phải xóa hoặc chuyển hết sản phẩm trước)
-   Người dùng có quyền xóa
-   Xác nhận từ manager/admin

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách danh mục, nhấn nút "Xóa"
2. **Bước 2**: Hệ thống kiểm tra:
    - Danh mục có sản phẩm nào không?
    - Nếu có, hiển thị danh sách sản phẩm
    - Yêu cầu xóa hoặc chuyển sản phẩm trước
3. **Bước 3**: Nếu không có sản phẩm, hiển thị hộp thoại xác nhận
    - "Bạn có chắc chắn muốn xóa danh mục [name]?"
    - "Hành động này không thể hoàn tác"
4. **Bước 4**: Người dùng xác nhận (hoặc nhập lý do xóa)
5. **Bước 5**: Xóa danh mục từ database
6. **Bước 6**: Xóa ảnh đại diện khỏi storage
7. **Bước 7**: Ghi log xóa
8. **Bước 8**: Thông báo xóa thành công

**Xử lý lỗi**:

-   Nếu danh mục còn sản phẩm: "Vui lòng xóa hoặc chuyển hết sản phẩm trước"
-   Nếu xóa thất bại: "Không thể xóa danh mục. Vui lòng thử lại"

**Ghi log xóa**:

-   Người dùng: [username]
-   Hành động: Xóa danh mục
-   Danh mục: [category_name]
-   Lý do xóa: [reason]
-   Thời gian: [timestamp]

---

### 3.2 Quản Lý Sản Phẩm

#### 3.2.1 Tạo Sản Phẩm Mới

**Mục tiêu**: Thêm một món ăn/đồ uống mới vào menu

**Người tham gia chính**: Quản lý nhà hàng, Admin, Đầu bếp

**Điều kiện tiên quyết**:

-   Danh mục đã tồn tại
-   Người dùng có quyền "Quản lý Menu"
-   Tên sản phẩm chưa tồn tại trong danh mục

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Menu" → Chọn danh mục → Nhấn "Thêm Sản Phẩm"
2. **Bước 2**: Mở form tạo sản phẩm mới

**Thông tin cần nhập**:

| Trường             | Loại         | Bắt buộc | Mô tả                            |
| ------------------ | ------------ | -------- | -------------------------------- |
| Tên sản phẩm       | Text         | ✓        | Tên món ăn (ví dụ: "Phở Bò")     |
| Mô tả ngắn         | Text         | ✓        | Mô tả 1-2 dòng cho menu          |
| Mô tả chi tiết     | Rich Text    | ✗        | Công thức, nguyên liệu, cách nấu |
| Giá tiền           | Number       | ✓        | Giá bán (VND)                    |
| Danh mục           | Dropdown     | ✓        | Chọn danh mục                    |
| Ảnh sản phẩm       | File         | ✗        | Ảnh (JPG, PNG, max 5MB)          |
| Thành phần chính   | Multi-select | ✗        | Allergens (Tôm, Cua, Cá, v.v.)   |
| Thời gian chuẩn bị | Number       | ✗        | Phút (ví dụ: 20 phút)            |
| Trạng thái         | Select       | ✓        | Có sẵn / Hết hàng                |
| Ghi chú            | Text         | ✗        | Hướng dẫn đặc biệt cho bếp       |

3. **Bước 3**: Điền thông tin sản phẩm
4. **Bước 4**: Tải lên ảnh (nếu có)
5. **Bước 5**: Chọn thành phần chính (allergens)
6. **Bước 6**: Hệ thống kiểm tra dữ liệu
7. **Bước 7**: Lưu sản phẩm
8. **Bước 8**: Hiển thị sản phẩm trong danh mục
9. **Bước 9**: Ghi log tạo

**Xử lý lỗi**:

-   Tên sản phẩm trùng: "Sản phẩm này đã tồn tại trong danh mục"
-   Giá không hợp lệ: "Giá phải lớn hơn 0"
-   Ảnh không hợp lệ: "Ảnh không đúng định dạng hoặc quá lớn"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Tạo sản phẩm
-   Sản phẩm: [product_name]
-   Danh mục: [category_name]
-   Giá: [price]
-   Thời gian: [timestamp]

---

#### 3.2.2 Xem Danh Sách Sản Phẩm

**Mục tiêu**: Xem các sản phẩm trong danh mục

**Người tham gia chính**: Quản lý, Admin, Nhân viên

**Quy trình chi tiết**:

1. **Bước 1**: Truy cập "Quản Lý Menu" → Chọn danh mục
2. **Bước 2**: Hiển thị danh sách sản phẩm với:

    - Ảnh sản phẩm
    - Tên sản phẩm
    - Mô tả ngắn
    - Giá tiền
    - Trạng thái (Có sẵn/Hết hàng)
    - Thời gian chuẩn bị
    - Nút hành động (Xem chi tiết, Sửa, Xóa)

3. **Bước 3**: Tính năng lọc:
    - Trạng thái (Có sẵn, Hết hàng, Tất cả)
    - Khoảng giá (từ - đến)
4. **Bước 4**: Tìm kiếm theo tên sản phẩm
5. **Bước 5**: Sắp xếp:
    - Tên (A-Z, Z-A)
    - Giá (Thấp nhất, Cao nhất)
    - Ngày tạo (Mới nhất, Cũ nhất)

---

#### 3.2.3 Xem Chi Tiết Sản Phẩm

**Mục tiêu**: Xem toàn bộ thông tin chi tiết của sản phẩm

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách sản phẩm, nhấn vào tên hoặc nút "Xem chi tiết"
2. **Bước 2**: Mở trang chi tiết hiển thị:

    - Ảnh sản phẩm (lớn)
    - Tên sản phẩm
    - Mô tả chi tiết
    - Giá tiền hiện tại
    - Danh mục
    - Thành phần chính (allergens)
    - Thời gian chuẩn bị
    - Trạng thái
    - Lịch sử thay đổi giá (bảng)
    - Ghi chú
    - Ngày tạo, người tạo
    - Ngày chỉnh sửa gần nhất, người chỉnh sửa

3. **Bước 3**: Hiển thị các nút hành động:
    - Sửa
    - Xóa
    - Ẩn/Hiển thị
    - Quay lại

---

#### 3.2.4 Chỉnh Sửa Sản Phẩm

**Mục tiêu**: Cập nhật thông tin sản phẩm

**Người tham gia chính**: Quản lý, Admin

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách hoặc chi tiết sản phẩm, nhấn nút "Sửa"
2. **Bước 2**: Mở form chỉnh sửa với dữ liệu hiện tại
3. **Bước 3**: Cập nhật thông tin cần thiết:
    - Tên sản phẩm
    - Mô tả
    - Giá tiền
    - Ảnh
    - Thành phần chính
    - Thời gian chuẩn bị
    - Trạng thái
    - Ghi chú
4. **Bước 4**: Hệ thống kiểm tra dữ liệu
5. **Bước 5**: Nếu thay đổi giá, lưu lịch sử giá cũ
6. **Bước 6**: Lưu thay đổi
7. **Bước 7**: Cập nhật menu ngay lập tức
8. **Bước 8**: Ghi log thay đổi

**Ghi log thay đổi**:

-   Người dùng: [username]
-   Hành động: Chỉnh sửa sản phẩm
-   Sản phẩm: [product_name]
-   Trường thay đổi: [field_name]
-   Giá trị cũ: [old_value]
-   Giá trị mới: [new_value]
-   Thời gian: [timestamp]

**Lưu ý đặc biệt**:

-   Nếu thay đổi giá: Ghi vào bảng lịch sử giá
    -   Giá cũ: [old_price]
    -   Giá mới: [new_price]
    -   Ngày thay đổi: [timestamp]
    -   Lý do: [reason] (tùy chọn)

---

#### 3.2.5 Cập Nhật Giá Sản Phẩm

**Mục tiêu**: Chỉnh sửa giá bán của sản phẩm

**Người tham gia chính**: Quản lý, Admin

**Quy trình chi tiết**:

1. **Bước 1**: Từ chi tiết sản phẩm, nhấn nút "Cập Nhật Giá"
2. **Bước 2**: Mở hộp thoại với:
    - Giá cũ: [display hiện tại, read-only]
    - Giá mới: [input field, bắt buộc]
    - Lý do thay đổi: [optional text]
    - Ngày có hiệu lực: [date picker, default: hôm nay]
3. **Bước 3**: Nhập giá mới
4. **Bước 4**: Nhập lý do (ví dụ: "Tăng giá theo mùa vụ", "Giảm khuyến mãi")
5. **Bước 5**: Chọn ngày có hiệu lực (cho phép lên lịch thay đổi giá)
6. **Bước 6**: Xác nhận
7. **Bước 7**: Hệ thống lưu:
    - Cập nhật giá sản phẩm
    - Lưu vào lịch sử giá (PriceHistory table)
8. **Bước 8**: Cập nhật menu ngay lập tức (hoặc theo ngày lên lịch)
9. **Bước 9**: Ghi log

**Lịch sử giá cần ghi nhận**:

```
- Sản phẩm ID
- Giá cũ
- Giá mới
- Người thay đổi (username)
- Ngày thay đổi
- Ngày có hiệu lực
- Lý do
```

**Báo cáo thay đổi giá**:

-   Có thể xem lịch sử thay đổi giá của sản phẩm
-   Xem trend giá theo thời gian
-   Xuất báo cáo

---

#### 3.2.6 Quản Lý Trạng Thái Sẵn Có (Availability)

**Mục tiêu**: Đánh dấu sản phẩm là "Hết hàng" hoặc "Có sẵn"

**Người tham gia chính**: Đầu bếp, Nhân viên, Quản lý

**Trạng thái sản phẩm**:

-   **Có sẵn (Available)**: Sản phẩm có thể đặt
-   **Hết hàng (Out of Stock)**: Tạm thời không có
-   **Không sẵn có (Unavailable)**: Vĩnh viễn bỏ khỏi menu (không hiển thị)

**Quy trình chi tiết**:

1. **Từ danh sách sản phẩm**:

    - Click vào toggle trạng thái để thay đổi nhanh
    - Toggle giữa "Có sẵn" ↔ "Hết hàng"

2. **Từ chi tiết sản phẩm**:

    - Nhấn nút "Thay Đổi Trạng Thái"
    - Chọn trạng thái mới
    - Nhập lý do (ví dụ: "Hết nguyên liệu", "Sửa chữa thiết bị")
    - Xác nhận

3. **Bếp báo hết hàng**:

    - Từ dashboard bếp, báo sản phẩm hết
    - Hệ thống cập nhật trạng thái ngay
    - Thông báo nhân viên phục vụ

4. **Cập nhật tự động**:
    - Nếu kho thấp, có thể cảnh báo
    - Có tuỳ chọn tự động đánh dấu hết nếu kho = 0

**Hiệu ứng khi đánh dấu hết hàng**:

-   Sản phẩm vẫn hiển thị trên menu nhưng có badge "Hết hàng"
-   Khách không thể đặt (button bị disable)
-   Nhân viên phục vụ không thể chọn sản phẩm này
-   Thông báo "Hiện tại chúng tôi không có sản phẩm này"

**Ghi log**:

-   Người dùng: [username]
-   Hành động: Thay đổi trạng thái
-   Sản phẩm: [product_name]
-   Trạng thái cũ: [old_status]
-   Trạng thái mới: [new_status]
-   Lý do: [reason]
-   Thời gian: [timestamp]

---

#### 3.2.7 Ẩn/Hiển thị Sản Phẩm

**Mục tiêu**: Tạm thời ẩn sản phẩm khỏi menu mà không xóa dữ liệu

**Người tham gia chính**: Quản lý, Admin

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách sản phẩm, chọn sản phẩm
2. **Bước 2**: Nhấn nút "Ẩn" hoặc click vào toggle
3. **Bước 3**: Sản phẩm không hiển thị trên menu khách hàng
4. **Bước 4**: Sản phẩm vẫn xuất hiện trong danh sách quản lý (với badge "Ẩn")
5. **Bước 5**: Ghi log hành động

**Khác biệt giữa Ẩn và Hết hàng**:

-   **Hết hàng**: Sản phẩm vẫn hiển thị nhưng không thể đặt (tạm thời)
-   **Ẩn**: Sản phẩm không hiển thị trên menu (lâu dài hoặc bảo trì)

---

#### 3.2.8 Xóa Sản Phẩm

**Mục tiêu**: Xóa sản phẩm khỏi hệ thống

**Người tham gia chính**: Quản lý, Admin

**Điều kiện tiên quyết**:

-   Sản phẩm không còn trong các đơn hàng đang xử lý
-   Người dùng có quyền xóa

**Quy trình chi tiết**:

1. **Bước 1**: Từ danh sách hoặc chi tiết sản phẩm, nhấn nút "Xóa"
2. **Bước 2**: Hệ thống kiểm tra:
    - Sản phẩm có trong đơn hàng chưa thanh toán không?
    - Nếu có, yêu cầu xóa hoặc chuyển đơn trước
3. **Bước 3**: Hiển thị hộp thoại xác nhận:
    - "Bạn có chắc chắn muốn xóa sản phẩm [name]?"
    - "Hành động này không thể hoàn tác"
4. **Bước 4**: Người dùng xác nhận
5. **Bước 5**: Xóa sản phẩm và lịch sử giá liên quan
6. **Bước 6**: Xóa ảnh khỏi storage
7. **Bước 7**: Ghi log xóa
8. **Bước 8**: Thông báo thành công

**Ghi log xóa**:

-   Người dùng: [username]
-   Hành động: Xóa sản phẩm
-   Sản phẩm: [product_name]
-   Danh mục: [category_name]
-   Giá cũ: [price]
-   Thời gian: [timestamp]

---

#### 3.2.9 Quản Lý Allergens (Thành Phần Chính)

**Mục tiêu**: Quản lý thành phần gây dị ứng trong sản phẩm

**Danh sách Allergens phổ biến**:

-   Tôm
-   Cua
-   Cá
-   Cua xà
-   Sò huyết
-   Hàu
-   Cũ Mực
-   Trứng
-   Sữa
-   Đậu phộng
-   Hạt mắc ca
-   Tất cả hạt
-   Gluten
-   Đậu nành
-   Với Mù Tạt
-   Vừng
-   Hạt điều
-   Có thể chứa các dấu vết của...

**Quy trình quản lý**:

1. **Thêm Allergen vào sản phẩm**:

    - Khi tạo/chỉnh sửa sản phẩm
    - Chọn từ danh sách allergens
    - Có thể chọn multiple
    - Ghi chú tùy chọn (ví dụ: "Có thể chứa dấu vết cua")

2. **Hiển thị Allergen**:

    - Trên menu cho khách
    - Trên hóa đơn
    - Trên chi tiết sản phẩm

3. **Cảnh báo**:
    - Khi nhân viên phục vụ tạo đơn, cảnh báo allergen
    - Khi khách đặt online, hiển thị allergen rõ ràng

---

### 3.3 Quản Lý Hình Ảnh Sản Phẩm

#### 3.3.1 Tải Lên Ảnh

**Quy chuẩn ảnh**:

-   Định dạng: JPG, PNG, WebP
-   Kích thước tối đa: 5MB
-   Kích thước ảnh: Tối thiểu 300x300px, Tối đa 4000x4000px
-   Tỷ lệ khuyến nghị: 1:1 (vuông) hoặc 4:3

**Quy trình**:

1. Chọn ảnh từ máy tính
2. Hệ thống xác thực kích thước, định dạng
3. Nén ảnh tự động (nếu cần)
4. Tạo thumbnail (để hiển thị danh sách)
5. Lưu vào storage (local hoặc cloud)
6. Lưu đường dẫn vào database

**Xử lý lỗi**:

-   Ảnh quá lớn: "Ảnh không được vượt quá 5MB"
-   Định dạng không được phép: "Chỉ hỗ trợ JPG, PNG, WebP"
-   Kích thước nhỏ: "Ảnh phải ít nhất 300x300px"

---

#### 3.3.2 Xóa/Thay Thế Ảnh

**Quy trình**:

1. Từ form chỉnh sửa sản phẩm, nhấn "Xóa Ảnh"
2. Xóa ảnh cũ từ storage
3. Có thể tải lên ảnh mới ngay
4. Ghi log hành động

---

### 3.4 Báo Cáo và Phân Tích Menu

#### 3.4.1 Báo Cáo Sản Phẩm Bán Chạy

**Mục tiêu**: Xác định sản phẩm nào bán tốt nhất

**Quy trình**:

1. Truy cập "Báo Cáo" → "Menu"
2. Chọn khoảng thời gian (Hôm nay, Tuần này, Tháng này, Tùy chọn)
3. Hiển thị:
    - Tên sản phẩm
    - Số lượng bán
    - Doanh thu
    - % so với tổng
    - Tốc độ bán (số/giờ)
4. Sắp xếp theo:
    - Số lượng
    - Doanh thu
    - Phần trăm
5. Xuất báo cáo (PDF, Excel)

---

#### 3.4.2 Báo Cáo Sản Phẩm Bán Chậm

**Mục tiêu**: Xác định sản phẩm cần cải thiện hoặc loại bỏ

**Quy trình**:

1. Hiển thị sản phẩm có ít người mua
2. Thống kê doanh thu
3. Gợi ý:
    - Thay đổi giá
    - Cải thiện mô tả
    - Chuyển vị trí trong menu
    - Xem xét loại bỏ

---

#### 3.4.3 Phân Tích Xu Hướng Danh Mục

**Mục tiêu**: Xem danh mục nào bán chạy nhất

**Hiển thị**:

-   Doanh thu từng danh mục
-   Số lượng sản phẩm bán
-   Xu hướng theo thời gian
-   Biểu đồ so sánh

---

### 3.5 Tính Năng Đặc Biệt

#### 3.5.1 Cập Nhật Lên Lịch (Scheduled Updates)

**Mục tiêu**: Lên lịch cập nhật menu cho các thời điểm khác nhau

**Ví dụ**:

-   Thực đơn buổi sáng (6h-11h)
-   Thực đơn buổi trưa (11h-14h)
-   Thực đơn buổi chiều (14h-18h)
-   Thực đơn buổi tối (18h-22h)

**Quy trình**:

1. Tạo phiên bản menu khác nhau
2. Lên lịch hiển thị theo giờ
3. Hệ thống tự động chuyển menu

---

#### 3.5.2 Nhập Sản Phẩm Từ File (Bulk Import)

**Mục tiêu**: Nhập nhiều sản phẩm cùng lúc từ file Excel/CSV

**Định dạng tệp**:

```
Tên Sản Phẩm | Danh Mục | Giá | Mô Tả | Thời Gian | Allergens
Phở Bò | Chính | 50000 | Phở bò truyền thống | 15 | Tôm,Cua
...
```

**Quy trình**:

1. Nhấn "Nhập Từ File"
2. Tải lên file
3. Hệ thống kiểm tra dữ liệu
4. Xem trước trước khi nhập
5. Nhập vào database
6. Báo cáo số sản phẩm nhập thành công/lỗi

---

#### 3.5.3 Xuất Danh Sách Menu

**Mục tiêu**: Xuất danh sách menu cho in ấn hoặc sử dụng khác

**Định dạng**:

-   PDF (in menu)
-   Excel (báo cáo)
-   CSV (import vào hệ thống khác)

**Nội dung**:

-   Tên, giá, mô tả
-   Hình ảnh (nếu PDF)
-   Allergens
-   Thời gian chuẩn bị

---

## 4. Quy Trình Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│        QUẢN LÝ MENU VÀ DANH MỤC - QUY TRÌNH TỔNG       │
└─────────────────────────────────────────────────────────┘

1. CHUẨN BỊ BAN ĐẦU
   └─ Tạo danh mục (Khai vị, Chính, Tráng miệng, v.v.)
      └─ Tải lên ảnh danh mục

2. THÊM SẢN PHẨM
   └─ Tạo sản phẩm mới
      ├─ Điền thông tin
      ├─ Tải lên ảnh
      ├─ Chọn allergens
      └─ Lưu sản phẩm

3. QUẢN LÝ HÀNG NGÀY
   ├─ Kiểm tra trạng thái sẵn có
   ├─ Cập nhật trạng thái (Hết hàng/Có sẵn)
   ├─ Hiệu chỉnh giá (nếu cần)
   └─ Ghi log thay đổi

4. HIỂN THỊ CHO KHÁCH
   ├─ Menu hiển thị trên ứng dụng khách
   ├─ Khách xem và đặt hàng
   ├─ Nhân viên phục vụ lấy thông tin sản phẩm
   └─ Bếp nhận thông tin nấu

5. PHÂN TÍCH VÀ BÁO CÁO
   ├─ Xem sản phẩm bán chạy
   ├─ Xem sản phẩm bán chậm
   ├─ Phân tích doanh thu
   └─ Điều chỉnh chiến lược menu

6. BẢO TRÌ
   ├─ Ẩn sản phẩm không sử dụng
   ├─ Cập nhật thông tin sản phẩm
   ├─ Xóa sản phẩm cũ
   └─ Sao lưu dữ liệu menu
```

---

## 5. Các Tác Nhân (Actors) và Quyền Hạn

| Tác Nhân            | Tạo | Xem | Sửa | Xóa | Ẩn  | Cập Nhật Trạng Thái |
| ------------------- | --- | --- | --- | --- | --- | ------------------- |
| Khách hàng          | ✗   | ✓   | ✗   | ✗   | ✗   | ✗                   |
| Nhân viên phục vụ   | ✗   | ✓   | ✗   | ✗   | ✗   | ✗                   |
| Đầu bếp             | ✗   | ✓   | ✗   | ✗   | ✗   | ✓                   |
| Quản lý             | ✓   | ✓   | ✓   | ✓   | ✓   | ✓                   |
| Admin/Quản trị viên | ✓   | ✓   | ✓   | ✓   | ✓   | ✓                   |

---

## 6. Công Nghệ và Công Cụ

### 6.1 Công Nghệ Sử Dụng

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: PostgreSQL, Prisma ORM
-   **Storage**: Local/Cloud (S3, Firebase Storage)
-   **Real-time**: Socket.io (cập nhật trạng thái menu)
-   **API**: RESTful API

### 6.2 Công Cụ Quản Lý

-   Lập trình tự động để cập nhật trạng thái
-   Công cụ nhập/xuất file
-   Hệ thống log toàn diện
-   Báo cáo tự động hàng ngày

---

## 7. Bảng Tóm Tắt Lỗi và Xử Lý

| Lỗi                         | Nguyên Nhân               | Cách Xử Lý                               |
| --------------------------- | ------------------------- | ---------------------------------------- |
| Tên danh mục/sản phẩm trùng | Dữ liệu đã tồn tại        | Thay đổi tên hoặc lựa chọn danh mục khác |
| Ảnh quá lớn                 | Kích thước file > 5MB     | Nén ảnh hoặc chọn ảnh nhỏ hơn            |
| Ảnh không hợp lệ            | Định dạng không được phép | Dùng JPG, PNG, hoặc WebP                 |
| Không thể xóa danh mục      | Danh mục còn sản phẩm     | Xóa/chuyển hết sản phẩm trước            |
| Không thể xóa sản phẩm      | Sản phẩm còn trong đơn    | Chờ đơn thanh toán hoặc hủy đơn          |
| Giá không hợp lệ            | Giá ≤ 0                   | Nhập giá > 0                             |
| Hệ thống không cập nhật     | Lỗi kết nối               | Refresh trang hoặc thử lại               |

---

## 8. Tính Năng Nâng Cao (Trong Tương Lai)

-   **AI Recommendation**: Gợi ý sản phẩm dựa trên lịch sử đặt hàng
-   **Multi-language Menu**: Menu đa ngôn ngữ
-   **QR Code Menu**: Menu điện tử qua QR code
-   **Menu theo mùa**: Lên lịch menu theo mùa vụ
-   **Nutritional Info**: Thêm thông tin dinh dưỡng
-   **Recipe Management**: Quản lý công thức nấu
-   **Supplier Integration**: Tích hợp nhà cung cấp
-   **Inventory Tracking**: Theo dõi tồn kho chi tiết

---

## 9. Lưu Ý Quan Trọng

1. **Dữ liệu nhạy cảm**: Luôn sao lưu dữ liệu menu
2. **Cập nhật thường xuyên**: Giữ menu cập nhật với thực tế
3. **Hình ảnh chất lượng**: Ảnh sản phẩm đẹp tăng doanh số
4. **Mô tả chính xác**: Tránh hiểu lầm khách hàng
5. **Giá cạnh tranh**: Kiểm tra giá của các nhà hàng khác
6. **Kiểm tra allergens**: Đúng đắn để bảo vệ khách hàng
7. **Cập nhật nhật ký**: Ghi lại tất cả thay đổi

---

## 10. Kết Luận

Hệ thống quản lý menu và danh mục là trái tim của ứng dụng quản lý nhà hàng. Nó cần phải linh hoạt, dễ sử dụng, và đáng tin cậy để hỗ trợ hoạt động kinh doanh hàng ngày. Tài liệu này cung cấp hướng dẫn toàn diện cho các nhà phát triển, quản lý, và người dùng của hệ thống.
