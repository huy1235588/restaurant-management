# Quản Lý Nhập Món Ăn

## Tổng Quan

Quy trình nhập món ăn là một phần quan trọng trong quản lý danh mục sản phẩm của hệ thống. Thông qua giao diện quản trị chuyên dụng, quản trị viên có thể thêm, chỉnh sửa và quản lý các món ăn với các thông tin chi tiết bao gồm hình ảnh, thành phần, giá cả và các thuộc tính khác.

## Giao Diện Mẫu (UI Mockup)

### 1. Giao Diện Danh Sách Các Món Ăn
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_list_management.png]]

### 2. Giao Diện Tạo Món Ăn Mới (Form Multi-Tab)
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_creation_form.png]]

### 3. Giao Diện Tab Giá Cả
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_price_tab.png]]

### 4. Giao Diện Tab Thành Phần
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_ingredients_tab.png]]

### 5. Giao Diện Tab Cấu Hình Nâng Cao
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_configuration_tab.png]]

### 6. Giao Diện Tab Xem Trước (Preview)
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_preview_tab.png]]

### 7. Giao Diện Trang Chi Tiết Món Ăn
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_detail_page.png]]

### 8. Giao Diện Trang Chi Tiết Món Ăn - Các Tab giá
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_detail_price_tab.png]]

### 9. Giao Diện Trang Chi Tiết Món Ăn - Các Tab nguyên liệu
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_detail_ingredients_tab.png]]

### 10. Giao Diện Trang Chi Tiết Món Ăn - Các Tab lịch sử
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_detail_history_tab.png]]

### 11. Giao Diện Trang Chi Tiết Món Ăn - Các Tab thống kê
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_detail_statistics_tab.png]]

### 12. Giao Diện Nhập Hàng Loạt (Bulk Import)
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_bulk_import.png]]

### 13. Giao Diện Tiến Trình Nhập
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_import_progress.png]]

### 14. Giao Diện Báo Cáo Nhập
![[images/use_case/FOOD_IMPORT_MANAGEMENT/food_item_import_report.png]]

## Quy Trình Chi Tiết

### 1. Truy Cập Giao Diện Quản Lý Món Ăn

#### Bước 1.1: Đăng Nhập Hệ Thống
- Nhân viên quản trị vào trang đăng nhập
- Nhập tài khoản và mật khẩu hợp lệ
- Hệ thống xác thực quyền truy cập
- Chỉ những tài khoản có quyền "Quản lý Menu" mới có thể truy cập

#### Bước 1.2: Điều Hướng Đến Module Quản Lý Menu
- Sau khi đăng nhập, truy cập Dashboard quản trị
- Tìm và click vào menu "Quản Lý Menu" hoặc "Menu Management"
- Hệ thống hiển thị danh sách các monk ăn hiện có

### 2. Hiển Thị Danh Sách Các Món Ăn

#### Bước 2.1: Xem Danh Sách Hiện Tại
- Giao diện hiển thị bảng danh sách tất cả các món ăn
- Mỗi dòng trong bảng chứa thông tin:
  - **ID Món**: Mã định danh duy nhất
  - **Tên Món**: Tên hiển thị của món ăn
  - **Danh Mục**: Loại món (Khai Vị, Chính, Tráng Miệng, v.v.)
  - **Giá**: Giá bán hiện tại
  - **Trạng Thái**: Hoạt động / Không hoạt động
  - **Hình Ảnh**: Thumbnail nhỏ
  - **Hành Động**: Các nút Edit, Delete, View

#### Bước 2.2: Tìm Kiếm và Lọc
- **Thanh Tìm Kiếm**: Nhập tên hoặc mã món để tìm kiếm nhanh
- **Lọc theo Danh Mục**: Chọn danh mục để hiển thị các món cùng loại
- **Lọc theo Trạng Thái**: Hiển thị chỉ các món hoạt động hoặc không hoạt động
- **Sắp Xếp**: Sắp xếp theo tên, giá, ngày tạo, v.v.
- **Phân Trang**: Hiển thị 10, 20, 50 món trên mỗi trang

### 3. Tạo Món Ăn Mới

#### Bước 3.1: Khởi Tạo Biểu Mẫu Mới
- Click nút "Thêm Món Ăn" hoặc "+ Thêm Mới"
- Hệ thống mở form nhập liệu hoặc điều hướng đến trang tạo mới
- Form được chia thành các phần lôgic (Tabs hoặc Sections)

#### Bước 3.2: Nhập Thông Tin Cơ Bản
**Phần 1: Thông Tin Cơ Bản**

| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| Tên Món | Text | ✓ | Tên món ăn, tối đa 200 ký tự |
| Mô Tả Ngắn | Text | ✗ | Mô tả nhanh cho khách hàng, tối đa 500 ký tự |
| Mô Tả Chi Tiết | Rich Text | ✗ | Mô tả đầy đủ, hỗ trợ định dạng HTML |
| Danh Mục | Dropdown | ✓ | Chọn từ danh sách: Khai Vị, Chính, Tráng Miệng, Nước, v.v. |
| Đơn Vị Tính | Text | ✓ | Ví dụ: Phần, Bát, Đĩa, Cốc |

**Ví dụ:**
```
Tên Món: Phở Bò Hà Nội
Mô Tả Ngắn: Phở truyền thống Hà Nội nấu từ xương bò 24h
Danh Mục: Món Chính
Đơn Vị Tính: Bát
```

#### Bước 3.3: Tải Lên Hình Ảnh
**Phần 2: Hình Ảnh**

- **Ảnh Chính (Main Image)** - Bắt Buộc
  - Click vào vùng "Tải Ảnh" hoặc kéo thả file
  - Hỗ trợ định dạng: JPG, PNG, WebP
  - Kích thước tối đa: 5MB
  - Kích thước khuyến nghị: 1200x800px (tỷ lệ 3:2)
  - Hệ thống tự động crop và optimize ảnh
  - Hiển thị preview sau khi tải

- **Ảnh Bổ Sung (Gallery)** - Tùy Chọn
  - Cho phép tải lên từ 0-5 ảnh thêm
  - Sắp xếp lại thứ tự bằng kéo thả
  - Xóa từng ảnh không cần lưu lại
  - Tất cả ảnh được lưu trữ trên Cloud Storage

#### Bước 3.4: Nhập Thông Tin Giá Cả
**Phần 3: Giá Cả**

| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| Giá Bán | Number | ✓ | Giá bán lẻ cho khách hàng, đơn vị: VND |
| Giá Gốc (Cost) | Number | ✓ | Giá vốn để tính tỉ suất lợi nhuận |
| Giảm Giá | Number | ✗ | Giá giảm cố định hoặc phần trăm |
| Loại Giảm | Radio | ✗ | Chọn: Số Tiền / Phần Trăm (%) |
| Giá Cuối Cùng | Number | ✗ | Tự động tính = Giá Bán - Giảm Giá |

**Ví dụ:**
```
Giá Bán: 80,000 VND
Giá Gốc: 35,000 VND
Giảm Giá: 0 VND
Giá Cuối Cùng: 80,000 VND
Tỉ Suất Lợi Nhuận: 128.6%
```

#### Bước 3.5: Nhập Thành Phần (Ingredients)
**Phần 4: Thành Phần & Nguyên Liệu**

- **Thêm Thành Phần**
  - Click nút "+ Thêm Thành Phần"
  - Chọn nguyên liệu từ danh sách có sẵn (hoặc tạo mới)
  - Nhập số lượng cần dùng
  - Chọn đơn vị tính (gam, ml, cái, v.v.)
  - Hệ thống hiển thị chi phí thành phần

- **Bảng Thành Phần**

| Thành Phần | Số Lượng | Đơn Vị | Chi Phí |
|-----------|---------|--------|---------|
| Nước dùng bò | 500 | ml | 10,000 VND |
| Bánh phở | 100 | gam | 3,000 VND |
| Thịt bò | 80 | gam | 15,000 VND |
| Rau mùi | 20 | gam | 2,000 VND |
| Giá đỏ | 30 | gam | 2,000 VND |
| Hành lá | 10 | gam | 1,000 VND |

- **Tổng Chi Phí Nguyên Liệu**: Tự động cộng tính
- **Tỉ Suất Lợi Nhuận**: Được tính lại dựa trên thành phần

#### Bước 3.6: Thiết Lập Thông Tin Khác
**Phần 5: Cấu Hình Nâng Cao**

| Trường | Loại | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| Trạng Thái | Radio | ✓ | Hoạt động / Không hoạt động |
| Độ Cay | Dropdown | ✗ | Không cay, Ít cay, Cay, Rất cay |
| Độ Ngọt | Dropdown | ✗ | Không ngọt, Ít ngọt, Bình thường, Ngọt |
| Dùng Cho | Multi-Select | ✗ | Ăn tại chỗ, Mang về, Giao hàng |
| Thẻ (Tags) | Multi-Select | ✗ | Signature, Best Seller, New, Hot, v.v. |
| Thời Gian Chuẩn Bị | Number | ✗ | Phút, ví dụ: 15 phút |
| Chứa Chất Gây Dị Ứng | Multi-Select | ✗ | Đậu phộng, Sữa, Cua, v.v. |
| Mục Tiêu Dùng | Multi-Select | ✗ | Người lớn, Trẻ em, Người ăn chay, v.v. |
| Kích Thước / Phần | Dropdown | ✗ | Nhỏ, Vừa, Lớn, v.v. |

#### Bước 3.7: Xem Trước và Kiểm Tra
- Click tab "Xem Trước" (Preview)
- Hệ thống hiển thị cách thức khách hàng sẽ nhìn thấy món ăn
- Kiểm tra tất cả thông tin đã nhập chính xác
- Có thể quay lại chỉnh sửa nếu cần

#### Bước 3.8: Lưu Món Ăn Mới
- Click nút "Lưu" hoặc "Tạo Món Ăn"
- Hệ thống kiểm tra các trường bắt buộc:
  - Tên Món không được để trống
  - Hình ảnh chính phải được tải lên
  - Giá Bán phải > 0
  - Danh Mục phải được chọn
  
- Nếu có lỗi, hệ thống hiển thị thông báo lỗi cụ thể
- Nếu thành công:
  - Dữ liệu được lưu vào cơ sở dữ liệu
  - Hình ảnh được tải lên Cloud Storage
  - Hiển thị thông báo "Tạo món ăn thành công"
  - Tự động điều hướng về danh sách hoặc trang chi tiết

### 4. Chỉnh Sửa Món Ăn Hiện Có

#### Bước 4.1: Chọn Món Để Sửa
- Từ danh sách, click vào tên món hoặc nút "Edit"
- Hệ thống mở form chỉnh sửa với tất cả thông tin đã nhập
- Các trường dữ liệu hiện sẵn giá trị cũ

#### Bước 4.2: Cập Nhật Thông Tin
- Sửa các trường cần thiết (tương tự như tạo mới)
- Các thay đổi được highlight hoặc đánh dấu
- Không bắt buộc phải sửa tất cả các trường

#### Bước 4.3: Cập Nhật Hình Ảnh (Tùy Chọn)
- Có thể thay đổi ảnh chính bằng cách click vào ảnh cũ
- Có thể thêm/xóa ảnh bổ sung
- Ảnh cũ được giữ nếu không thay đổi

#### Bước 4.4: Lưu Thay Đổi
- Click nút "Cập Nhật" hoặc "Lưu Thay Đổi"
- Hệ thống kiểm tra tính hợp lệ của dữ liệu
- Hiển thị thông báo "Cập nhật thành công"
- Tự động quay về danh sách

### 5. Xem Chi Tiết Món Ăn

#### Bước 5.1: Mở Trang Chi Tiết
- Click vào tên món ăn trong danh sách
- Hệ thống hiển thị trang chi tiết với:
  - Gallery hình ảnh
  - Tất cả thông tin của món (cơ bản, giá, thành phần)
  - Lịch sử chỉnh sửa
  - Số lần bán trong tháng
  - Đánh giá trung bình của khách hàng

#### Bước 5.2: Các Hành Động Khả Dụng
- **Edit**: Chỉnh sửa thông tin
- **Duplicate**: Sao chép để tạo mới dựa trên cái cũ
- **Delete**: Xóa (có xác nhận trước)
- **Archive**: Lưu trữ mà không xóa hoàn toàn
- **Pin**: Ghim để hiển thị trên đầu danh sách
- **View on Frontend**: Xem trang khách hàng của sản phẩm

### 6. Xóa Món Ăn

#### Bước 6.1: Chọn Xóa
- Từ danh sách, click nút "Delete" hoặc từ trang chi tiết
- Hệ thống hiển thị dialog xác nhận

#### Bước 6.2: Xác Nhận Xóa
- Dialog hiển thị: "Bạn có chắc muốn xóa [Tên Món]?"
- Cảnh báo: Hành động này không thể hoàn tác
- Hiển thị số lần sản phẩm này đã được bán

#### Bước 6.3: Hoàn Tất Xóa
- Click "Xóa" để xác nhận
- Hệ thống xóa bản ghi từ cơ sở dữ liệu
- Hình ảnh liên quan được xóa khỏi storage (hoặc lưu trữ)
- Hiển thị thông báo "Xóa thành công"
- Quay về danh sách

### 7. Nhập Hàng Loạt (Bulk Import)

#### Bước 7.1: Truy Cập Tính Năng Nhập Hàng Loạt
- Từ trang danh sách, click nút "Nhập Hàng Loạt" hoặc "Bulk Import"
- Hệ thống hiển thị giao diện nhập hàng loạt

#### Bước 7.2: Tải File CSV/Excel
- **Định Dạng Tệp Được Hỗ Trợ**: CSV, XLSX, XLS
- **Cấu Trúc File**:

| Tên Món | Danh Mục | Giá Bán | Giá Gốc | Mô Tả | Thẻ |
|---------|----------|---------|---------|-------|-----|
| Phở Bò | Chính | 80000 | 35000 | Phở truyền thống | signature |
| Bún Chả | Chính | 75000 | 32000 | Bún chả Hà Nội | bestseller |

- Kéo thả file hoặc click "Chọn File"
- Hệ thống preview dữ liệu từ file

#### Bước 7.3: Ánh Xạ Cột (Column Mapping)
- Giao diện cho phép ánh xạ cột trong file với các trường trong hệ thống
- Xác nhận các trường bắt buộc đã được ánh xạ
- Có thể bỏ qua các cột không cần

#### Bước 7.4: Xác Nhận và Nhập
- Review lại các bản ghi sẽ được nhập
- Click "Nhập" để bắt đầu
- Hệ thống xử lý từng bản ghi:
  - Kiểm tra tính hợp lệ
  - Tạo bản ghi mới hoặc cập nhật cái cũ (nếu có ID trùng)
  - Báo cáo tiến trình

#### Bước 7.5: Xem Báo Cáo
- Sau khi hoàn tất, hiển thị báo cáo:
  - Số lượng thêm mới
  - Số lượng cập nhật
  - Số lượng lỗi (nếu có)
  - Chi tiết từng lỗi với dòng tương ứng
  - Nút download file lỗi để xử lý lại

### 7.6: Hướng Dẫn Chi Tiết Về Hình Ảnh URL

#### Định Dạng Hình Ảnh URL

Khi nhập hàng loạt, bạn có thể cung cấp hình ảnh cho các món ăn thông qua URL (liên kết). Đây là cách để tự động tải hình ảnh từ internet.

**Định Dạng URL Hợp Lệ:**

```
https://example.com/images/pho.jpg
https://cdn.example.com/menu/items/banh-mi.png
http://images.restaurant.com/photos/pho-bo.webp
https://storage.cloud.com/uploads/menu/ca-phe.jpg
```

**Yêu Cầu URL Hình Ảnh:**

| Yêu Cầu | Chi Tiết |
|---------|---------|
| Giao Thức | Phải là `http://` hoặc `https://` (không phải `ftp://`) |
| Định Dạng File | JPG, PNG, WebP, GIF (lưu ý: GIF sẽ được convert) |
| Kích Thước File | Tối đa 5MB (nếu > 5MB sẽ bị bỏ qua) |
| Tính Khả Dụng | URL phải có thể truy cập công khai (không cần đăng nhập) |
| Hết Hạn | Không được expire hoặc bị xóa trong quá trình xử lý |

**Ví Dụ Cột URL Trong File CSV:**

```
Tên Món | Danh Mục | Giá Bán | Giá Gốc | Hình Ảnh URL
Phở Bò | Chính | 80000 | 35000 | https://images.myrestaurant.com/menu/pho-bo.jpg
Bún Chả | Chính | 75000 | 32000 | https://images.myrestaurant.com/menu/bun-cha.jpg
Bánh Mì Thịt | Khai Vị | 25000 | 12000 | https://images.myrestaurant.com/menu/banh-mi.png
Cơm Tấm | Chính | 55000 | 25000 | https://cdn.example.com/pho/com-tam.webp
```

#### Quy Trình Xử Lý Hình Ảnh URL

**Bước 1: Tải Hình Ảnh**
- Hệ thống đọc URL từ file import
- Kết nối đến URL để tải file ảnh
- Timeout: 30 giây mỗi hình ảnh
- Nếu không tải được, sẽ bị đánh dấu cảnh báo

**Bước 2: Xác Thực Hình Ảnh**
- Kiểm tra định dạng file (MIME type)
- Kiểm tra kích thước (phải ≤ 5MB)
- Kiểm tra độ phân giải (khuyến nghị ≥ 400x300px)
- Nếu không hợp lệ, sẽ bị bỏ qua

**Bước 3: Tối Ưu Hóa Ảnh**
- Resize ảnh thành các kích cỡ khác nhau:
  - Thumbnail: 200x200px
  - Medium: 600x600px
  - Large: 1200x1200px
- Convert sang định dạng WebP để tiết kiệm dung lượng
- Nén ảnh để giảm kích thước

**Bước 4: Lưu Trữ**
- Lưu ảnh vào Cloud Storage (AWS S3, Google Cloud, etc.)
- Tạo URL truy cập public
- Ghi lại đường dẫn ảnh trong cơ sở dữ liệu

#### Các Lỗi Phổ Biến Khi Xử Lý URL

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| **URL không hợp lệ** | Định dạng sai, không có `https://` | Kiểm tra lại URL, đảm bảo bắt đầu với `http://` hoặc `https://` |
| **Không thể truy cập URL** | Máy chủ down, URL bị xóa, firewall chặn | Kiểm tra URL có thể mở được trên trình duyệt không |
| **Timeout tải ảnh** | Máy chủ chậm, kết nối mạng yếu | Kiểm tra tốc độ internet, thử lại sau |
| **Kích thước file > 5MB** | Ảnh quá lớn | Nén ảnh trước khi upload lên server, sau đó lấy URL |
| **Định dạng file không hỗ trợ** | URL trỏ đến file .bmp, .svg, .tiff, v.v. | Chuyển đổi ảnh sang JPG, PNG hoặc WebP |
| **CORS Error** | URL ở domain khác, không cho phép cross-origin | Kiểm tra cài đặt CORS trên server lưu trữ ảnh |
| **HTTPS Certificate Error** | URL HTTPS nhưng certificate không hợp lệ | Sử dụng HTTP thay vì HTTPS, hoặc cập nhật certificate |

#### Xử Lý Khi URL Có Lỗi

**Khi tải hàng loạt, nếu URL có vấn đề:**

1. **Cảnh Báo (Warning)** - Hình ảnh không được tải
   - Món ăn vẫn được tạo
   - Không có ảnh chính
   - Hiển thị cảnh báo trong báo cáo
   - Bạn có thể thêm ảnh sau bằng cách edit

2. **Lỗi (Error)** - Nếu URL bắt buộc phải có
   - Không tạo được món ăn nếu URL là trường bắt buộc
   - Hiển thị lỗi cụ thể
   - Thường không xảy ra vì hình ảnh không bắt buộc trong bulk import

**Ví dụ Báo Cáo:**

```
Dòng 10: ⚠️ Cảnh Báo
Tên: Gà Nướng
URL: https://old-server.com/images/ga.jpg
Vấn Đề: Không thể truy cập URL (404 Not Found)
Xử Lý: Món ăn đã được tạo nhưng không có ảnh
Hành Động: Vào edit món ăn này để thêm ảnh sau

Dòng 25: ⚠️ Cảnh Báo
Tên: Cánh Gà Nước Mắm
URL: https://cdn.example.com/menu/canh-ga.jpg (15.2 MB)
Vấn Đề: Kích thước file quá lớn (> 5MB)
Xử Lý: Món ăn đã được tạo nhưng không có ảnh
Hành Động: Nén ảnh và thêm lại thủ công
```

#### Tips Sử Dụng Hình Ảnh URL Hiệu Quả

**1. Chuẩn Bị Hình Ảnh Trước**
- Upload ảnh lên một cloud storage công khai (Dropbox, Google Drive public, AWS S3)
- Đảm bảo tất cả ảnh có kích thước tương đối (< 5MB)
- Lấy URL public của từng ảnh

**2. Tổ Chức URL Một Cách Khoa Học**
```
Tên Ảnh: pho-bo-ha-noi.jpg
URL: https://menu-images.restaurant.com/2025/10/pho-bo-ha-noi.jpg

Tên Ảnh: bun-cha-hanoi.jpg
URL: https://menu-images.restaurant.com/2025/10/bun-cha-hanoi.jpg
```

**3. Kiểm Tra URL Trước Khi Import**
- Mở từng URL trong trình duyệt để xác nhận ảnh hiển thị
- Kiểm tra kích thước file
- Đảm bảo không có lỗi 404 hoặc timeout

**4. Sử Dụng Công Cụ Trợ Giúp**
- Dùng Google Sheets để quản lý danh sách URL
- Sử dụng công cụ kiểm tra link như Dead Link Checker
- Dùng Image Optimizer trước khi upload

**5. Xử Lý Lỗi Sau Import**
```
Quy Trình:
1. Tải file, ánh xạ cột, bắt đầu import
2. Xem báo cáo, tìm dòng có cảnh báo URL
3. Download file báo cáo (CSV)
4. Sửa URL trong file
5. Import lại các dòng bị lỗi
6. Hoặc Edit từng món thủ công để thêm ảnh
```

#### Ví Dụ Thực Tế

**Tình huống: Import 50 món phở từ file CSV**

**Bước 1: Chuẩn Bị**
```
File: menu-pho.csv
Có các cột: Tên Món, Danh Mục, Giá, Hình Ảnh URL

Content:
Phở Bò Hà Nội,Chính,80000,https://cdn.images.com/pho/pho-bo-1.jpg
Phở Gà,Chính,70000,https://cdn.images.com/pho/pho-ga-1.jpg
Phở Ngang,Chính,85000,https://cdn.images.com/pho/pho-ngang-1.jpg
```

**Bước 2: Ánh Xạ Cột**
```
Cột File "Hình Ảnh URL" → Trường "Hình Ảnh Chính"
```

**Bước 3: Xác Nhận**
- Chọn "Tải Từ URL"
- Bắt đầu nhập

**Bước 4: Theo Dõi**
- Hệ thống tải ảnh từ URL
- Tối ưu hóa và lưu trữ
- Báo cáo kết quả

**Bước 5: Xử Lý Kết Quả**
```
Báo Cáo:
✓ Thành Công: 48 bản ghi (ảnh tải OK)
⚠️ Cảnh Báo: 2 bản ghi (ảnh không tải được)
  - Dòng 15: URL timeout
  - Dòng 32: File 6MB, quá lớn
  
→ Hành động:
  - Edit 2 dòng bị lỗi để thêm ảnh thủ công sau
  - Hoặc sửa URL và nhập lại
```

#### Tùy Chọn Xử Lý Ảnh Khi Nhập

Khi ánh xạ cột hình ảnh, bạn có thể chọn:

1. **Tải Từ URL** ✓ (Mặc Định)
   - Tải ảnh từ URL công khai
   - Kiểm tra, tối ưu, lưu trữ
   - Ghi URL mới vào cơ sở dữ liệu

2. **Sử Dụng Ảnh Mặc Định**
   - Bỏ qua URL, dùng ảnh placeholder
   - Thích hợp khi URL không tin cậy
   - Bạn có thể thêm ảnh sau thủ công

3. **Bỏ Qua Cột Này**
   - Không xử lý cột ảnh
   - Tạo món ăn không có ảnh
   - Thêm ảnh sau bằng edit

#### Bảo Mật và Quyền Riêng Tư

- **URL Công Khai**: Bất kỳ ai cũng có thể truy cập
- **Không Lưu URL Gốc**: Hệ thống copy ảnh, không giữ URL gốc
- **Không Phụ Thuộc Server Ngoài**: Ảnh được lưu riêng, nếu URL gốc bị xóa vẫn OK
- **Cache CDN**: Ảnh được cache trên CDN, tải nhanh hơn

### 8. Quản Lý Danh Mục

#### Bước 8.1: Cấu Hình Danh Mục
- Từ trang quản lý menu, click "Cấu Hình Danh Mục"
- Hệ thống hiển thị danh sách danh mục hiện có:
  - Khai Vị
  - Sup/Canh
  - Chính
  - Tráng Miệng
  - Nước Uống
  - v.v.

#### Bước 8.2: Thêm Danh Mục Mới
- Click "+ Thêm Danh Mục"
- Nhập tên danh mục
- Nhập mô tả (tùy chọn)
- Upload biểu tượng (tùy chọn)
- Chọn vị trí/thứ tự hiển thị
- Click "Tạo"

#### Bước 8.3: Chỉnh Sửa/Xóa Danh Mục
- Click nút "Edit" để sửa
- Click nút "Delete" để xóa (chỉ xóa được nếu không có món ăn nào)

## Các Quy Tắc và Ràng Buộc

### Quy Tắc Nhập Liệu

1. **Tên Món**
   - Phải duy nhất trong hệ thống
   - Tối đa 200 ký tự
   - Không được để trống

2. **Giá**
   - Phải là số dương
   - Giá Bán ≥ Giá Gốc (bắt buộc)
   - Được phép ≤ 0 cho các loại "Free", "Giftback", v.v. (cần xác nhận)

3. **Hình Ảnh**
   - Hình ảnh chính là bắt buộc
   - Tối đa 5MB mỗi file
   - Chỉ hỗ trợ JPG, PNG, WebP
   - Tối đa 5 ảnh bổ sung

4. **Thành Phần**
   - Số lượng phải > 0
   - Đơn vị tính phải được chọn từ danh sách có sẵn

### Quy Tắc Xóa

1. Không thể xóa danh mục nếu còn môn ăn sử dụng
2. Khi xóa món ăn:
   - Nếu đã bán: chuyển sang trạng thái "Archived" thay vì xóa hoàn toàn
   - Nếu chưa bán: xóa hoàn toàn
3. Hình ảnh liên quan được lưu trữ trong 30 ngày trước khi xóa vĩnh viễn

## Thông Báo và Xác Nhận

### Các Loại Thông Báo

| Loại | Màu | Ví Dụ |
|------|-----|-------|
| Thành Công | Xanh | "Tạo món ăn thành công" |
| Lỗi | Đỏ | "Tên món đã tồn tại trong hệ thống" |
| Cảnh Báo | Vàng/Cam | "Giá bán thấp hơn giá gốc" |
| Thông Tin | Xanh Dương | "Có 5 bản ghi sẽ được cập nhật" |

### Dialog Xác Nhận

- Hiển thị trước khi thực hiện hành động quan trọng:
  - Xóa món ăn
  - Xóa danh mục
  - Nhập hàng loạt > 100 bản ghi
  - Thay đổi trạng thái của nhiều món cùng lúc

## Kiểm Soát Quyền Truy Cập

### Các Quyền Trong Menu Management

| Quyền | Mô Tả |
|-------|-------|
| VIEW | Xem danh sách và chi tiết các món ăn |
| CREATE | Tạo món ăn mới |
| EDIT | Chỉnh sửa thông tin món ăn |
| DELETE | Xóa món ăn |
| BULK_IMPORT | Nhập hàng loạt từ file |
| MANAGE_CATEGORY | Quản lý danh mục |

### Vai Trò Mặc Định

- **Admin**: Toàn bộ quyền
- **Manager**: VIEW, CREATE, EDIT, DELETE, BULK_IMPORT
- **Staff**: VIEW, CREATE (chỉ khi được phép)
- **Viewer**: VIEW

## Lịch Sử Thay Đổi và Audit Log

### Theo Dõi Thay Đổi

Hệ thống ghi lại tất cả thay đổi:
- **Ai thay đổi**: Tên người dùng
- **Khi nào**: Thời gian chính xác
- **Cái gì thay đổi**: Trường và giá trị cũ/mới
- **Hành động**: Tạo/Sửa/Xóa/Khôi Phục

### Xem Lịch Sử

- Từ trang chi tiết món ăn, click tab "Lịch Sử"
- Hiển thị timeline tất cả các sự kiện
- Có thể filter theo ngày, người dùng, loại hành động

## Tối Ưu Hóa Hiệu Suất

### Caching

- Danh sách danh mục được cache 1 giờ
- Hình ảnh được cache ở CDN
- Quay lại danh sách sau khi tạo/sửa có thể hiển thị dữ liệu cached

### Tải Ảnh

- Hình ảnh được resize tự động thành:
  - Thumbnail: 200x200px
  - Medium: 600x600px
  - Large: 1200x1200px
  - Original: Giữ nguyên
- Được nén và convert sang WebP để tiết kiệm bandwidth

## Xử Lý Lỗi Phổ Biến

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| "Tên món đã tồn tại" | Nhập tên trùng với món hiện có | Đổi tên hoặc dùng chức năng Duplicate |
| "Hình ảnh quá lớn" | File > 5MB | Nén ảnh trước khi tải lên |
| "Giá Bán < Giá Gốc" | Nhập giá sai | Kiểm tra lại giá, có thể cho phép nếu là promotion |
| "Danh mục không thể xóa" | Có món ăn sử dụng | Xóa hoặc di chuyển các món trước |
| "Lỗi tải file" | File không đúng format | Dùng CSV hoặc XLSX được support |

## Workflow Hoàn Chỉnh - Ví Dụ Thực Tế

### Kịch Bản: Thêm Một Món Ăn Mới "Gà 7 Món"

```
1. Đăng nhập → Truy cập Menu Management
   ↓
2. Click "Thêm Món Ăn"
   ↓
3. Nhập thông tin:
   - Tên: "Gà 7 Món Lẩu Mắm"
   - Danh Mục: "Chính"
   - Mô Tả: "Gà nấu lẩu mắm kèm rau"
   - Giá Bán: 150,000 VND
   - Giá Gốc: 65,000 VND
   ↓
4. Upload ảnh chính
   ↓
5. Thêm thành phần:
   - Gà: 400g
   - Mắm cua: 50ml
   - Rau ăn kèm: 100g
   - v.v.
   ↓
6. Cấu hình thêm:
   - Độ Cay: "Rất Cay"
   - Thẻ: "Signature", "Hot"
   - Thời Gian Chuẩn Bị: 20 phút
   ↓
7. Xem Preview
   ↓
8. Click "Lưu"
   ↓
9. Thành công! Hiển thị chi tiết món mới tạo
```

## Quy Trình Hỗ Trợ và Khắc Phục Sự Cố

### Khi Gặp Vấn Đề

1. Kiểm tra thông báo lỗi từ hệ thống
2. Xem phần "Xử Lý Lỗi Phổ Biến" ở trên
3. Thử làm lại các bước từ đầu
4. Nếu vẫn lỗi, liên hệ với IT Support

### Đội Hỗ Trợ

- **Email**: support@restaurant.com
- **Hotline**: 1900-xxxx
- **Chat**: Tích hợp trong ứng dụng
- **Hours**: 8:00 - 18:00, Thứ Hai - Thứ Sáu

## Tổng Kết

Quy trình nhập món ăn qua giao diện quản trị được thiết kế để:
- ✓ Dễ sử dụng cho người quản lý
- ✓ Đảm bảo tính nhất quán dữ liệu
- ✓ Tiết kiệm thời gian (khoảng 2-3 phút/món)
- ✓ Cung cấp các công cụ nâng cao như nhập hàng loạt
- ✓ Quản lý lịch sử và quyền truy cập tập trung
