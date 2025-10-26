# Hướng Dẫn Chi Tiết: Chức Năng Upload và Lưu Trữ File

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Các Loại File và Giới Hạn](#các-loại-file-và-giới-hạn)
4. [API Endpoints](#api-endpoints)
5. [Sử Dụng từ Client](#sử-dụng-từ-client)
6. [Hướng Dẫn Lập Trình](#hướng-dẫn-lập-trình)
7. [Xử Lý Lỗi](#xử-lý-lỗi)
8. [Dọn Dẹp Tự Động](#dọn-dẹp-tự-động)
9. [Cấu Hình Lưu Trữ](#cấu-hình-lưu-trữ)
10. [Câu Hỏi Thường Gặp](#câu-hỏi-thường-gặp)

---

## Tổng Quan

Hệ thống upload và lưu trữ file của ứng dụng Restaurant Management hỗ trợ:

- **Hai nhà cung cấp lưu trữ**: Local (máy chủ) và Cloudinary (CDN)
- **Chuyển đổi nhà cung cấp** tại runtime
- **Tự động dự phòng** giữa các nhà cung cấp nếu cái chính lỗi
- **Quản lý nhiều loại file**: Hình ảnh, tài liệu, video
- **Dọn dẹp tự động** cho tệp tạm thời
- **Bảo mật**: Xác thực, xác nhận loại file, giới hạn kích thước

### Thư Mục Lưu Trữ

```
uploads/
├── temp/        # Tệp tạm thời (sẽ được dọn dẹp sau 24h)
├── menu/        # Hình ảnh thực đơn
├── staff/       # Ảnh nhân viên
├── documents/   # Tài liệu (PDF, Word, Excel)
├── images/      # Hình ảnh chung
└── others/      # Các loại tệp khác
```

---

## Kiến Trúc Hệ Thống

### Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│              (Next.js Frontend Application)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Request (multipart/form-data)
                     ▼
┌────────────────────────────────────────────────────────┐
│              Upload Middleware Layer                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Multer Configuration                             │  │
│  │ • File validation (size, type, extension)        │  │
│  │ • Disk storage configuration                     │  │
│  │ • Unique filename generation                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬───────────────────────────────────┘
                     │
                     │ Temporary File
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Upload Controller Layer                    │
│  • Route handlers                                       │
│  • Receive request data                                 │
│  • Call upload service                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Upload Service Layer                       │
│  • Handle single & multiple file uploads                │
│  • Call storage manager                                 │
│  • Cleanup temporary files                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Storage Manager Layer (Singleton)             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Primary Provider Check → Fallback Provider       │  │
│  │                                                  │  │
│  │ ┌────────────┐              ┌────────────┐       │  │
│  │ │   Local    │              │ Cloudinary │       │  │
│  │ │  Storage   │  ◄───────►   │  Storage   │       │  │
│  │ └────────────┘              └────────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│ Local Storage    │    │  Cloudinary CDN  │
│                  │    │                  │
│ uploads/         │    │ cloud-based      │
│ └── [folders]    │    │ storage          │
└──────────────────┘    └──────────────────┘
```

### Các Thành Phần Chính

| Thành Phần             | Vị Trí                                   | Chức Năng                     |
| ---------------------- | ---------------------------------------- | ----------------------------- |
| **Storage Routes**     | `storage.routes.ts`                      | Định nghĩa các endpoint       |
| **Storage Controller** | `storage.controller.ts`                  | Xử lý yêu cầu quản lý lưu trữ |
| **Upload Controller**  | `upload.controller.ts`                   | Xử lý yêu cầu upload file     |
| **Upload Service**     | `services/upload.service.ts`             | Logic upload file cấp cao     |
| **Storage Manager**    | `services/storage/storage.manager.ts`    | Quản lý nhà cung cấp lưu trữ  |
| **Local Storage**      | `services/storage/local.storage.ts`      | Triển khai lưu trữ cục bộ     |
| **Cloudinary Storage** | `services/storage/cloudinary.storage.ts` | Triển khai Cloudinary         |
| **Upload Middleware**  | `middlewares/upload.middleware.ts`       | Middleware Multer & helper    |
| **Upload Constants**   | `constants/upload.constants.ts`          | Cấu hình & hằng số            |

---

## Các Loại File và Giới Hạn

### Hình Ảnh (Image)

| Tiêu Chí                       | Giá Trị                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| **Kích thước tối đa**          | 5 MB                                                                               |
| **Định dạng MIME được phép**   | `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml` |
| **Tiện ích mở rộng được phép** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`                                   |
| **Thư mục mặc định**           | `uploads/temp/` → chuyển sang `uploads/images/`                                    |

**Ví dụ:**
```
menu.jpg (✓ Được phép)
photo.JPEG (✓ Được phép)
logo.svg (✓ Được phép)
document.pdf (✗ Không được phép - là tài liệu)
```

### Tài Liệu (Document)

| Tiêu Chí                       | Giá Trị                                                                                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kích thước tối đa**          | 10 MB                                                                                                                                                                                                                                         |
| **Định dạng MIME được phép**   | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/plain`, `text/csv` |
| **Tiện ích mở rộng được phép** | `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`, `.csv`                                                                                                                                                                                      |

**Ví dụ:**
```
invoice.pdf (✓ Được phép)
contract.docx (✓ Được phép)
data.csv (✓ Được phép)
image.png (✗ Không được phép - là hình ảnh)
```

### Video

| Tiêu Chí                       | Giá Trị                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **Kích thước tối đa**          | 50 MB                                                                         |
| **Định dạng MIME được phép**   | `video/mp4`, `video/mpeg`, `video/quicktime`, `video/x-msvideo`, `video/webm` |
| **Tiện ích mở rộng được phép** | `.mp4`, `.mpeg`, `.mov`, `.avi`, `.webm`                                      |

**Ví dụ:**
```
demo.mp4 (✓ Được phép)
tutorial.mov (✓ Được phép)
advertisement.webm (✓ Được phép)
```

---

## API Endpoints

### 1. Kiểm Tra Trạng Thái Lưu Trữ

**Endpoint:** `GET /api/storage/status`

**Yêu Cầu:**
```bash
curl -X GET http://localhost:3001/api/storage/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Phản Hồi (Thành Công - 200):**
```json
{
  "success": true,
  "message": "Storage status retrieved successfully",
  "data": {
    "primary": "local",
    "primaryAvailable": true,
    "fallback": "cloudinary",
    "fallbackAvailable": false,
    "currentType": "local"
  }
}
```

**Mô Tả Trường:**
- `primary`: Nhà cung cấp chính được cấu hình
- `primaryAvailable`: Nhà cung cấp chính có sẵn không
- `fallback`: Nhà cung cấp dự phòng
- `fallbackAvailable`: Nhà cung cấp dự phòng có sẵn không
- `currentType`: Nhà cung cấp hiện đang sử dụng

---

### 2. Lấy Loại Lưu Trữ Hiện Tại

**Endpoint:** `GET /api/storage/current`

**Yêu Cầu:**
```bash
curl -X GET http://localhost:3001/api/storage/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Phản Hồi (Thành Công - 200):**
```json
{
  "success": true,
  "data": {
    "storageType": "local"
  }
}
```

---

### 3. Chuyển Đổi Nhà Cung Cấp Lưu Trữ

**Endpoint:** `POST /api/storage/switch`

**Yêu Cầu:**
```bash
curl -X POST http://localhost:3001/api/storage/switch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "cloudinary"
  }'
```

**Tham Số:**
- `provider` (string, bắt buộc): `"local"` hoặc `"cloudinary"`

**Phản Hồi (Thành Công - 200):**
```json
{
  "success": true,
  "message": "Storage provider switched to cloudinary",
  "data": {
    "primary": "cloudinary",
    "primaryAvailable": false,
    "fallback": "local",
    "fallbackAvailable": true,
    "currentType": "cloudinary"
  }
}
```

**Phản Hồi (Lỗi - 400):**
```json
{
  "success": false,
  "error": "Invalid provider. Must be \"local\" or \"cloudinary\""
}
```

---

### 4. Upload File Đơn

**Endpoint:** `POST /api/storage/upload/single`

**Yêu Cầu (FormData):**
```bash
curl -X POST http://localhost:3001/api/storage/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.jpg" \
  -F "folder=menu" \
  -F "category=image"
```

**Tham Số FormData:**
- `file` (file, bắt buộc): Tệp để upload
- `folder` (string, tùy chọn): Thư mục đích - `temp`, `menu`, `staff`, `documents`, `images`, `others`. Mặc định: `temp`
- `category` (string, tùy chọn): Loại tệp - `image`, `document`, `video`. Mặc định: `image`

**Phản Hồi (Thành Công - 201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "menu_1635123456789_abc123.jpg",
    "originalName": "menu.jpg",
    "path": "uploads/menu/menu_1635123456789_abc123.jpg",
    "size": 245000,
    "mimetype": "image/jpeg",
    "url": "http://localhost:3001/uploads/menu/menu_1635123456789_abc123.jpg",
    "uploadedAt": "2024-10-26T12:34:56.789Z"
  }
}
```

**Phản Hồi (Lỗi - 400):**
```json
{
  "success": false,
  "error": "No file provided"
}
```

---

### 5. Upload Nhiều File

**Endpoint:** `POST /api/storage/upload/multiple`

**Yêu Cầu (FormData):**
```bash
curl -X POST http://localhost:3001/api/storage/upload/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@file1.jpg" \
  -F "files=@file2.jpg" \
  -F "files=@file3.pdf" \
  -F "folder=images" \
  -F "category=image"
```

**Tham Số FormData:**
- `files` (array of files, bắt buộc): Các tệp để upload (tối đa 10 tệp)
- `folder` (string, tùy chọn): Thư mục đích. Mặc định: `temp`
- `category` (string, tùy chọn): Loại tệp. Mặc định: `image`

**Phản Hồi (Thành Công - 201):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "files": [
      {
        "filename": "photo1_1635123456789_abc123.jpg",
        "originalName": "photo1.jpg",
        "path": "uploads/images/photo1_1635123456789_abc123.jpg",
        "size": 245000,
        "mimetype": "image/jpeg",
        "url": "http://localhost:3001/uploads/images/photo1_1635123456789_abc123.jpg",
        "uploadedAt": "2024-10-26T12:34:56.789Z"
      },
      {
        "filename": "photo2_1635123456790_def456.jpg",
        "originalName": "photo2.jpg",
        "path": "uploads/images/photo2_1635123456790_def456.jpg",
        "size": 312000,
        "mimetype": "image/jpeg",
        "url": "http://localhost:3001/uploads/images/photo2_1635123456790_def456.jpg",
        "uploadedAt": "2024-10-26T12:34:57.000Z"
      }
    ],
    "count": 2
  }
}
```

---

### 6. Xóa File

**Endpoint:** `DELETE /api/storage/upload`

**Yêu Cầu (JSON):**
```bash
curl -X DELETE http://localhost:3001/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "uploads/menu/menu_1635123456789_abc123.jpg"
  }'
```

**Tham Số JSON:**
- `filePath` (string, bắt buộc): Đường dẫn tệp cần xóa (được trả về từ upload)

**Phản Hồi (Thành Công - 200):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": null
}
```

**Phản Hồi (Lỗi - 400):**
```json
{
  "success": false,
  "error": "File path is required"
}
```

---

## Sử Dụng từ Client

### JavaScript/TypeScript (Fetch API)

#### Upload File Đơn

```typescript
async function uploadSingleFile(file: File, folder: string = 'temp', category: string = 'image') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('category', category);

  try {
    const response = await fetch('/api/storage/upload/single', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data; // Returns UploadedFileInfo
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Sử dụng:
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files?.[0];
if (file) {
  const uploadedFile = await uploadSingleFile(file, 'menu', 'image');
  console.log('File URL:', uploadedFile.url);
}
```

#### Upload Nhiều File

```typescript
async function uploadMultipleFiles(
  files: FileList,
  folder: string = 'temp',
  category: string = 'image'
) {
  const formData = new FormData();
  
  // Thêm tất cả tệp
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  formData.append('folder', folder);
  formData.append('category', category);

  try {
    const response = await fetch('/api/storage/upload/multiple', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data.files; // Array of UploadedFileInfo
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Sử dụng:
const fileInputs = document.getElementById('fileInputs') as HTMLInputElement;
if (fileInputs.files) {
  const uploadedFiles = await uploadMultipleFiles(
    fileInputs.files,
    'staff',
    'image'
  );
  uploadedFiles.forEach(file => {
    console.log('Uploaded:', file.url);
  });
}
```

#### Xóa File

```typescript
async function deleteFile(filePath: string) {
  try {
    const response = await fetch('/api/storage/upload', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// Sử dụng:
await deleteFile('uploads/menu/menu_1635123456789_abc123.jpg');
```

### React Component Example

```typescript
import React, { useState } from 'react';

export const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'menu');
    formData.append('category', 'image');

    try {
      const response = await fetch('/api/storage/upload/single', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      setUploadedUrl(data.data.url);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {uploadedUrl && (
        <div>
          <p>Upload successful!</p>
          <img src={uploadedUrl} alt="Uploaded" />
        </div>
      )}
    </div>
  );
};
```

---

## Hướng Dẫn Lập Trình

### Sử Dụng Upload Service trong Código Backend

#### Upload File Từ Service Khác

```typescript
import { uploadService } from '@/features/storage/services/upload.service';

export class MenuService {
  async createMenuWithImage(
    menuData: MenuData,
    file: Express.Multer.File
  ) {
    try {
      // Upload file trước
      const uploadedFile = await uploadService.uploadFile(file, 'menu');
      
      // Tạo menu với URL ảnh
      const menu = await prisma.menu.create({
        data: {
          ...menuData,
          imageUrl: uploadedFile.url,
          imagePath: uploadedFile.path,
        },
      });

      return menu;
    } catch (error) {
      logger.error('Failed to create menu with image:', error);
      throw error;
    }
  }

  async updateMenuImage(
    menuId: string,
    oldImagePath: string | null,
    newFile: Express.Multer.File
  ) {
    try {
      // Upload file mới
      const uploadedFile = await uploadService.uploadFile(newFile, 'menu');
      
      // Xóa file cũ nếu có
      if (oldImagePath) {
        await uploadService.deleteFile(oldImagePath);
      }

      // Update menu
      const menu = await prisma.menu.update({
        where: { id: menuId },
        data: {
          imageUrl: uploadedFile.url,
          imagePath: uploadedFile.path,
        },
      });

      return menu;
    } catch (error) {
      logger.error('Failed to update menu image:', error);
      throw error;
    }
  }
}
```

#### Upload Nhiều File

```typescript
async function uploadMenuImages(
  files: Express.Multer.File[]
) {
  try {
    // Upload tất cả file
    const uploadedFiles = await uploadService.uploadFiles(files, 'menu');
    
    console.log(`Uploaded ${uploadedFiles.length} files`);
    return uploadedFiles;
  } catch (error) {
    logger.error('Failed to upload menu images:', error);
    throw error;
  }
}
```

### Sử Dụng Storage Manager Trực Tiếp

```typescript
import { storageManager } from '@/features/storage/services/storage/storage.manager';

// Kiểm tra nhà cung cấp hiện tại
const currentType = storageManager.getStorageType();
console.log('Current storage:', currentType); // 'local' or 'cloudinary'

// Lấy trạng thái lưu trữ
const status = await storageManager.getStatus();
console.log('Storage status:', status);

// Chuyển đổi nhà cung cấp
const success = await storageManager.switchProvider('cloudinary');
if (success) {
  console.log('Switched to Cloudinary');
}

// Upload file (tự động xử lý dự phòng)
const file = req.file!;
const result = await storageManager.upload(file, 'menu');
console.log('Uploaded to:', result.url);

// Xóa file
const deleteResult = await storageManager.delete('uploads/menu/file.jpg');
if (deleteResult.success) {
  console.log('File deleted');
}
```

### Sử Dụng Upload Middleware Helper Functions

```typescript
import {
  getFileUrl,
  getFilePath,
  deleteFile,
  replaceFile,
  cleanupTempFiles,
  moveFileFromTemp,
} from '@/features/storage';

// Chuyển đổi đường dẫn sang URL
const fileUrl = getFileUrl('uploads/menu/file.jpg');
console.log(fileUrl); // '/uploads/menu/file.jpg'

// Chuyển đổi URL sang đường dẫn
const filePath = getFilePath('/uploads/menu/file.jpg');
console.log(filePath); // 'uploads/menu/file.jpg'

// Xóa file cục bộ
const deleted = deleteFile('uploads/temp/file.jpg');
console.log(deleted); // true or false

// Thay thế file (xóa file cũ)
replaceFile(oldFilePath, newFilePath);

// Dọn dẹp file tạm thời (> 24 giờ)
const deletedCount = cleanupTempFiles(24);
console.log(`Deleted ${deletedCount} files`);

// Di chuyển file từ temp sang vị trí vĩnh viễn
const newUrl = moveFileFromTemp('file_1234567890_abc.jpg', 'MENU');
console.log('Moved to:', newUrl);
```

---

## Xử Lý Lỗi

### Các Lỗi Phổ Biến

| Lỗi                                 | Mã  | Nguyên Nhân                      | Giải Pháp                                |
| ----------------------------------- | --- | -------------------------------- | ---------------------------------------- |
| **No file provided**                | 400 | Không gửi file                   | Kiểm tra tham số `file` hoặc `files`     |
| **File size exceeds maximum limit** | 400 | File quá lớn                     | Kiểm tra kích thước tối đa cho loại file |
| **Invalid file type**               | 400 | Loại file không được phép        | Kiểm tra định dạng file                  |
| **Invalid file extension**          | 400 | Tiện ích mở rộng không được phép | Sử dụng đúng định dạng file              |
| **Too many files uploaded**         | 400 | Vượt quá 10 file                 | Upload tối đa 10 file một lần            |
| **File deleted successfully**       | 200 | (OK)                             | -                                        |
| **Failed to delete file**           | 500 | Lỗi xóa file                     | Kiểm tra đường dẫn file hoặc quyền       |
| **Unauthorized**                    | 401 | Token không hợp lệ               | Kiểm tra token xác thực                  |

### Xử Lý Lỗi trong Client

```typescript
async function uploadFileWithErrorHandling(
  file: File,
  folder: string = 'temp'
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await fetch('/api/storage/upload/single', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // Xử lý lỗi dựa trên mã trạng thái HTTP
      switch (response.status) {
        case 400:
          console.error('Bad Request:', data.error);
          // Hiển thị thông báo lỗi cho người dùng
          showErrorMessage(data.error);
          break;
        case 401:
          console.error('Unauthorized - Please login again');
          redirectToLogin();
          break;
        case 500:
          console.error('Server Error:', data.error);
          showErrorMessage('Server error occurred. Please try again later.');
          break;
        default:
          console.error('Unknown error:', data.error);
      }
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Network error:', error);
    showErrorMessage('Network error. Please check your connection.');
    return null;
  }
}
```

---

## Dọn Dẹp Tự Động

### Công Việc Dự Định (Scheduled Job)

Hệ thống tự động dọn dẹp file tạm thời hàng ngày lúc 2:00 sáng.

**Cấu Hình:**
```typescript
// File: src/jobs/cleanupUploads.ts
export const startCleanupUploadsJob = () => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    logger.info('Running scheduled cleanup of temp files...');
    
    try {
      const deletedCount = cleanupTempFiles(24); // Clean files older than 24 hours
      logger.info(`Cleanup completed: ${deletedCount} temp files deleted`);
    } catch (error) {
      logger.error('Error during temp files cleanup:', error);
    }
  });

  logger.info('Cleanup uploads job scheduled (runs daily at 2:00 AM)');
};
```

**Khởi Động Job:**
```typescript
// File: src/index.ts
import { startCleanupUploadsJob } from './jobs/cleanupUploads';

app.listen(PORT, () => {
  // ... khởi động server
  startCleanupUploadsJob(); // Khởi động công việc dọn dẹp
});
```

### Dọn Dẹp Thủ Công

```typescript
// Dọn dẹp file tạm thời cũ hơn 24 giờ
import { cleanupTempFiles } from '@/features/storage';

const deletedCount = cleanupTempFiles(24);
console.log(`Deleted ${deletedCount} files older than 24 hours`);

// Dọn dẹp file cũ hơn 12 giờ
const deletedCount12 = cleanupTempFiles(12);
console.log(`Deleted ${deletedCount12} files older than 12 hours`);
```

---

## Cấu Hình Lưu Trữ

### Biến Môi Trường

**Tệp `.env` (Lưu trữ Cục Bộ - Mặc Định):**
```bash
# Storage Configuration
STORAGE_TYPE=local
BASE_URL=http://localhost:3001
```

**Tệp `.env` (Cloudinary):**
```bash
# Storage Configuration
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BASE_URL=https://your-domain.com
```

### Cấu Hình Thư Mục Upload

Các thư mục được tạo tự động nếu không tồn tại:

```
project/
└── uploads/
    ├── temp/        (tệp tạm thời)
    ├── menu/        (hình ảnh thực đơn)
    ├── staff/       (ảnh nhân viên)
    ├── documents/   (tài liệu)
    ├── images/      (hình ảnh chung)
    └── others/      (file khác)
```

### Giới Hạn File (Có Thể Tùy Chỉnh)

Trong `src/features/storage/constants/upload.constants.ts`:

```typescript
export const MAX_FILE_SIZE = {
    IMAGE: 5 * 1024 * 1024,      // 5MB
    DOCUMENT: 10 * 1024 * 1024,  // 10MB
    VIDEO: 50 * 1024 * 1024,     // 50MB
} as const;
```

---

## Các Trường Hợp Sử Dụng Thông Dụng

### 1. Upload Ảnh Thực Đơn

```typescript
// Frontend
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'menu');
formData.append('category', 'image');

const response = await fetch('/api/storage/upload/single', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
});

const { data: { url, path } } = await response.json();

// Backend - Save to database
const menu = await prisma.menu.create({
  data: {
    name: 'Pad Thai',
    imageUrl: url,
    imagePath: path,
  },
});
```

### 2. Upload Ảnh Nhân Viên (Nhiều File)

```typescript
// Frontend
const formData = new FormData();
for (let file of staffFiles) {
  formData.append('files', file);
}
formData.append('folder', 'staff');
formData.append('category', 'image');

const response = await fetch('/api/storage/upload/multiple', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
});

const { data: { files } } = await response.json();

// Backend - Save to database
for (let uploadedFile of files) {
  await prisma.staffPhoto.create({
    data: {
      url: uploadedFile.url,
      path: uploadedFile.path,
      staffId,
    },
  });
}
```

### 3. Thay Thế Ảnh Cũ

```typescript
// Upload ảnh mới
const newFile = await uploadService.uploadFile(newImage, 'menu');

// Xóa ảnh cũ
if (oldImagePath) {
  await uploadService.deleteFile(oldImagePath);
}

// Update database
await prisma.menu.update({
  where: { id: menuId },
  data: {
    imageUrl: newFile.url,
    imagePath: newFile.path,
  },
});
```

### 4. Chuyển Đổi Nhà Cung Cấp Lưu Trữ

```typescript
// Client request
const response = await fetch('/api/storage/switch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ provider: 'cloudinary' }),
});

// Tất cả upload sau đó sẽ sử dụng Cloudinary
```

### 5. Kiểm Tra Trạng Thái Lưu Trữ (Monitoring)

```typescript
// Tạo endpoint monitoring
app.get('/health/storage', async (req, res) => {
  try {
    const status = await storageManager.getStatus();
    
    if (!status.primaryAvailable && !status.fallbackAvailable) {
      return res.status(503).json({
        message: 'Storage service unavailable',
        status,
      });
    }

    res.json({
      message: 'Storage service healthy',
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Câu Hỏi Thường Gặp

### Q1: File được lưu ở đâu?

**A:** Tùy vào cấu hình:
- **Lưu trữ Cục Bộ (Local)**: `project/uploads/[folder]/`
- **Cloudinary**: Trên CDN Cloudinary (URL được trả về)

### Q2: Làm cách nào để chuyển file từ Cloudinary sang Local?

**A:** File đã upload không thể chuyển trực tiếp. Bạn cần:
1. Chuyển nhà cung cấp thành `local`
2. Upload lại file mới
3. Xóa file cũ khỏi Cloudinary

### Q3: File tạm thời bao lâu được xóa?

**A:** Mặc định 24 giờ. Được dọn dẹp hàng ngày lúc 2:00 sáng.

### Q4: Tôi có thể upload file lớn hơn giới hạn không?

**A:** Không được khuyến khích. Nếu cần thiết, cập nhật giới hạn trong `upload.constants.ts` và restart server.

### Q5: Làm cách nào để xóa tất cả file upload?

**A:** 
```bash
# Linux/Mac
rm -rf uploads/

# Windows PowerShell
Remove-Item uploads -Recurse -Force
```

### Q6: File upload có được bảo mật không?

**A:** Có, hệ thống:
- Yêu cầu xác thực (Bearer token)
- Xác nhận loại file (MIME type & extension)
- Giới hạn kích thước file
- Tạo tên file duy nhất với timestamp
- Cho phép chỉ những loại tệp cụ thể

### Q7: Làm cách nào để phục hồi file đã xóa?

**A:** File xóa không thể phục hồi. Luôn sao lưu file quan trọng.

### Q8: Khi nào nên sử dụng Cloudinary thay vì Local Storage?

**A:** Sử dụng Cloudinary cho:
- Ứng dụng production (scalability)
- Nhiều người dùng upload cùng lúc
- Cần CDN global (tốc độ)
- Dung lượng lưu trữ lớn

Sử dụng Local cho:
- Phát triển (development)
- Testing
- Ứng dụng nhỏ (single server)

### Q9: Tôi có thể tùy chỉnh thư mục upload không?

**A:** Có, cập nhật `UPLOAD_DIRS` trong `upload.constants.ts`:
```typescript
export const UPLOAD_DIRS = {
    IMAGES: 'custom/path/images',
    MENU: 'custom/path/menu',
    // ... các thư mục khác
};
```

### Q10: Làm cách nào để xem file đã upload?

**A:** 
- **Local**: Truy cập `http://localhost:3001/uploads/[path]`
- **Cloudinary**: URL được trả về từ API (ví dụ: `https://res.cloudinary.com/...`)

---

## Tài Liệu Liên Quan

- [Swagger API Documentation](/api-docs)
- [Database Schema](./DATABASE.md)
- [Business Use Cases](./BUSINESS_USE_CASES.md)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)

---

**Phiên Bản Tài Liệu**: 1.0  
**Cập Nhật Lần Cuối**: October 26, 2025  
**Tác Giả**: Development Team
