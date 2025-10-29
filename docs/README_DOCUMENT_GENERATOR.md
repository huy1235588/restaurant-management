# Tài Liệu Hướng Dẫn Sử Dụng Document Generator

## Giới Thiệu

Script `generate_project_document.py` tự động tạo tài liệu mô tả dự án Restaurant Management System dưới định dạng Word (.docx). Tài liệu được tạo ra tuân thủ các yêu cầu định dạng chuyên nghiệp và bao gồm đầy đủ thông tin về quy mô, chức năng, mục tiêu và lịch trình dự án.

## Yêu Cầu Hệ Thống

- **Python**: 3.8 trở lên
- **Thư viện**: python-docx

## Cài Đặt

### 1. Cài đặt Python (nếu chưa có)

**Windows:**
```powershell
# Download và cài đặt từ https://www.python.org/downloads/
```

**Linux/macOS:**
```bash
# Python thường đã được cài đặt sẵn
python3 --version
```

### 2. Cài đặt thư viện python-docx

```bash
pip install python-docx
```

hoặc

```bash
pip3 install python-docx
```

## Sử Dụng

### Cách 1: Chạy trực tiếp script

```bash
cd docs
python3 generate_project_document.py
```

### Cách 2: Chạy từ thư mục root

```bash
python3 docs/generate_project_document.py
```

### Cách 3: Làm executable và chạy (Linux/macOS)

```bash
chmod +x docs/generate_project_document.py
./docs/generate_project_document.py
```

## Output

Script sẽ tạo file: `docs/TAI_LIEU_MO_TA_DU_AN.docx`

Tài liệu bao gồm:

### 1. Trang Bìa
- Tiêu đề dự án
- Công nghệ sử dụng
- Ngày tạo tài liệu

### 2. Mục Lục
Danh sách các phần chính trong tài liệu

### 3. Phần 1: Quy Mô Dự Án
- **1.1** Tổng quan hệ thống quản lý nhà hàng
- **1.2** Kiến trúc hệ thống (3-tier architecture)
- **1.3** Công nghệ sử dụng
  - Frontend Technologies (Next.js, React, TypeScript, Tailwind CSS)
  - Backend Technologies (Express.js, PostgreSQL, Redis, Prisma)
  - Desktop Application (Tauri, Rust)
  - DevOps & Infrastructure (Docker, Docker Compose, Nginx)
- **1.4** Cấu trúc thư mục và module chính
  - Chi tiết cấu trúc client/ (Frontend)
  - Chi tiết cấu trúc server/ (Backend)
  - Desktop, docs, nginx, data modules

### 4. Phần 2: Chức Năng Dự Án
- **2.1** Quản lý xác thực và tài khoản người dùng
- **2.2** Quản lý menu và danh mục
- **2.3** Quản lý bàn và đặt bàn
- **2.4** Quản lý đơn hàng và bếp
- **2.5** Quản lý thanh toán và hóa đơn
- **2.6** Quản lý nhân sự
- **2.7** Quản lý tồn kho và nguyên liệu
- **2.8** Tính năng kỹ thuật (Real-time, i18n, Responsive, Dark Mode)

### 5. Phần 3: Mục Tiêu Có Thể Đáp Ứng
- **3.1** Giải quyết các vấn đề kinh doanh của nhà hàng
- **3.2** Cải thiện hiệu quả vận hành
- **3.3** Tăng trải nghiệm khách hàng
- **3.4** Hỗ trợ quản lý toàn diện từ frontend đến backend
- **3.5** Khả năng mở rộng và bảo trì
- **3.6** Lợi ích kinh doanh cụ thể

### 6. Phần 4: Lịch Làm Dự Án
- **4.1** Phân tích tiến độ hiện tại (85% core features completed)
- **4.2** Ước tính thời gian hoàn thành các phần còn lại (4-6 tháng)
- **4.3** Lịch trình phát triển theo giai đoạn
  - Planning & Research (Hoàn thành)
  - Core Development (85% hoàn thành)
  - Advanced Features (60% hoàn thành)
  - Testing & QA (70% hoàn thành)
  - Deployment (90% hoàn thành)
  - Mobile App (Kế hoạch tương lai)
- **4.4** Các mốc quan trọng (Milestones)
- **4.5** Phân bổ nguồn lực
- **4.6** Quản lý rủi ro

## Định Dạng Tài Liệu

Tài liệu được định dạng theo tiêu chuẩn chuyên nghiệp:

- **Font chữ nội dung**: Times New Roman, 12pt
- **Font chữ tiêu đề**: Arial Bold
  - Tiêu đề cấp 1: 16pt
  - Tiêu đề cấp 2: 14pt
- **Khoảng cách dòng**: 1.5 (Line spacing)
- **Căn lề**: Justified (Đều hai bên)
- **Footer**: Tên tài liệu ở cuối mỗi trang

## Tùy Chỉnh

Nếu muốn tùy chỉnh nội dung hoặc định dạng, bạn có thể chỉnh sửa file `generate_project_document.py`:

### Thay đổi đường dẫn output

```python
# Trong hàm main()
output_file = os.path.join(output_dir, "TEN_FILE_MOI.docx")
```

### Thêm nội dung mới

Thêm method mới vào class `ProjectDocumentGenerator`:

```python
def add_new_section(self):
    self.add_heading_custom('TIÊU ĐỀ MỚI', level=1)
    self.add_paragraph_custom('Nội dung của phần mới...')
```

Sau đó gọi trong method `generate()`:

```python
def generate(self, output_path):
    # ... existing code ...
    self.add_new_section()  # Thêm dòng này
    # ... rest of the code ...
```

### Thay đổi font hoặc kích thước

Chỉnh sửa trong method `setup_styles()` và `add_heading_custom()`:

```python
font.name = 'Arial'  # Thay đổi font
font.size = Pt(14)   # Thay đổi kích thước
```

## Xử Lý Lỗi

### Lỗi: Module 'docx' not found

```bash
# Giải pháp:
pip install python-docx
```

### Lỗi: Permission denied

```bash
# Đảm bảo bạn có quyền ghi vào thư mục docs/
chmod +x docs/generate_project_document.py
```

### Lỗi: File đang mở trong Word

```
# Đóng file Word trước khi chạy lại script
```

## Tích Hợp Vào CI/CD

Có thể tích hợp script vào GitHub Actions để tự động tạo tài liệu:

```yaml
# .github/workflows/generate-docs.yml
name: Generate Documentation

on:
  push:
    branches: [ main ]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install python-docx
      - name: Generate documentation
        run: python3 docs/generate_project_document.py
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
          name: project-documentation
          path: docs/TAI_LIEU_MO_TA_DU_AN.docx
```

## Nguồn Thông Tin

Script tự động trích xuất thông tin từ các file sau:

- `README.md` - Thông tin tổng quan, tech stack
- `docs/BUSINESS_USE_CASES.md` - Các nghiệp vụ hệ thống
- `docs/DATABASE.md` - Cơ sở dữ liệu
- `docs/FRONTEND_DOCUMENTATION.md` - Frontend architecture
- `docs/DOCKER.md` - Triển khai container
- `docs/DESKTOP_DOCUMENTATION.md` - Ứng dụng desktop
- Các file use case trong `docs/use_case/`

## Liên Hệ và Hỗ Trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng:
1. Kiểm tra phần Xử Lý Lỗi ở trên
2. Tạo issue trên GitHub repository
3. Liên hệ team phát triển

## License

Script này là một phần của Restaurant Management System project và tuân theo license của dự án chính.

---

**Cập nhật lần cuối**: 29/10/2024
**Phiên bản**: 1.0.0
