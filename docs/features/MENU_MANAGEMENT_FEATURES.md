# Menu Management System - Comprehensive Feature Documentation

## Overview

Menu Management System là hệ thống quản lý thực đơn toàn diện cho nhà hàng với khả năng quản lý món ăn, danh mục, giá cả, tình trạng sẵn có và hình ảnh món ăn. Hệ thống hỗ trợ tìm kiếm nhanh, lọc thông minh và cập nhật theo thời gian thực.

**Đặc điểm chính:**
- **Category Management:** Quản lý món ăn theo danh mục
- **Availability Management:** Quản lý tình trạng sẵn có
- **Image Management:** Quản lý hình ảnh món ăn
- **Pricing Control:** Quản lý giá món ăn
- **Search & Filter:** Tìm kiếm và lọc món ăn

---

## 1. MENU VIEW LAYOUT (Bố cục giao diện quản lý thực đơn)

### 1.1 Header Section

**Components:**
```
┌──────────────────────────────────────────────────┐
│  🍽️ Menu Management                              │
│  ┌─────────────────┐  [+ Add New Dish]         │
│  │ 🔍 Search...    │                            │
│  └─────────────────┘                            │
└──────────────────────────────────────────────────┘
```

**Features:**
- **Title Bar:** Hiển thị "Menu Management" với icon
- **Search Bar:** Tìm kiếm món ăn theo tên
- **Action Buttons:**
  - Add New Dish: Tạo món ăn mới

### 1.2 Filter Panel

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [All Categories ▼] [All Status ▼] [Price Range ▼]│
│ [Reset Filters]                                  │
└──────────────────────────────────────────────────┘
```

**Filter Options:**

**1. Category Filter:**
- All Categories
- Khai vị (Appetizers)
- Súp (Soups)
- Salad
- Món chính (Main Course)
- Hải sản (Seafood)
- Mì & Cơm (Noodles & Rice)
- Tráng miệng (Desserts)
- Đồ uống (Beverages)
- Rượu & Bia (Wine & Beer)

**2. Status Filter:**
- All Status
- Available (isAvailable = true) - Còn hàng
- Out of Stock (isAvailable = false) - Hết hàng
- Active (isActive = true) - Đang bán
- Inactive (isActive = false) - Ngừng bán

**3. Price Range Filter:**
- All Prices
- Under 50,000 VND
- 50,000 - 100,000 VND
- 100,000 - 200,000 VND
- 200,000 - 500,000 VND
- Over 500,000 VND
- Custom Range (nhập min-max)

**4. Additional Filters:**
- Vegetarian: Món chay (isVegetarian = true)
- Spicy Level: 0 (Không cay), 1-2 (Ít cay), 3-4 (Cay vừa), 5 (Rất cay)
- Preparation Time: Quick (<15min), Normal (15-30min), Long (>30min)
- Search: Tìm theo tên món, mã món, hoặc mô tả

### 1.3 Statistics Cards

**Display Metrics:**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Total      │ Available  │ Out of     │ New This   │
│ Dishes     │            │ Stock      │ Month      │
│    248     │    215     │    12      │    8       │
└────────────┴────────────┴────────────┴────────────┘
```

**Statistics Updates:**
- Cập nhật khi thêm/xóa món
- Color coding: Green (available), Red (out of stock), Blue (new)
- Click vào card để quick filter

### 1.4 View Modes

**Grid View (Default):**
```
┌───────────┐ ┌───────────┐ ┌───────────┐
│  [Image]  │ │  [Image]  │ │  [Image]  │
│  Dish     │ │  Dish     │ │  Dish     │
│  150,000₫ │ │  200,000₫ │ │  180,000₫ │
│  ⭐ 4.5   │ │  ⭐ 4.8   │ │  ⭐ 4.2   │
└───────────┘ └───────────┘ └───────────┘
```

**List View:**
```
┌──────────────────────────────────────────────────┐
│ [Img] Dish Name           Category    Price  [⚙]│
│ [Img] Another Dish        Category    Price  [⚙]│
│ [Img] Third Dish          Category    Price  [⚙]│
└──────────────────────────────────────────────────┘
```

**Table View:**
```
┌─────┬─────────────┬───────────┬────────┬────────┐
│ ID  │ Name        │ Category  │ Price  │ Status │
├─────┼─────────────┼───────────┼────────┼────────┤
│ 001 │ Phở Bò     │ Main      │150,000│✓ Avail │
│ 002 │ Bún Chả   │ Main      │120,000│✓ Avail │
└─────┴─────────────┴───────────┴────────┴────────┘
```

**Switch Views:** Buttons ở góc phải: [🔲 Grid] [≡ List] [📊 Table]

---

## 2. DISH MANAGEMENT (Quản lý món ăn)

### 2.1 Add New Dish

**Trigger:** Click button "Add New Dish" ở header

**Form Dialog:**
```
┌─────────────────────────────────────────────────┐
│  ✨ Create New Dish                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  📷 Image Upload                                │
│  ┌─────────────────────┐                       │
│  │  Drag & drop or     │                       │
│  │  [Browse Files]     │                       │
│  └─────────────────────┘                       │
│                                                 │
│  Dish Name *                                    │
│  ┌─────────────────────────────────────────┐  │
│  │                                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Category *              Price *               │
│  [Select Category ▼]     [        VND]         │
│                                                 │
│  Description                                    │
│  ┌─────────────────────────────────────────┐  │
│  │                                          │  │
│  │                                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Ingredients (comma-separated)                 │
│  ┌─────────────────────────────────────────┐  │
│  │                                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [Advanced Options ▼]                          │
│                                                 │
│  [Cancel]                    [Create Dish]     │
└─────────────────────────────────────────────────┘
```

**Required Fields:**
- Item Code (unique, max 20 chars) - Mã món
- Item Name (max 100 chars) - Tên món
- Category ID - Danh mục
- Price - Giá bán

**Optional Fields:**
- Cost - Giá vốn (for profit calculation)
- Description (max 1000 chars) - Mô tả
- Image URL - Link hình ảnh
- Preparation Time (minutes) - Thời gian chế biến
- Spicy Level (0-5) - Độ cay
- Is Vegetarian (boolean) - Món chay
- Calories - Lượng calo
- Display Order - Thứ tự hiển thị
- Is Available (boolean, default: true) - Còn hàng
- Is Active (boolean, default: true) - Đang bán

**Validation:**
- Item Code: 1-20 characters, unique, required
- Item Name: 1-100 characters, required
- Category ID: Must be valid category ID, required
- Price: Must be between 0 and 99,999,999.99, required
- Cost: Must be between 0 and 99,999,999.99, optional
- Description: Max 1000 characters, optional
- Image URL: Valid URL or empty, max 500 chars
- Preparation Time: Positive integer (minutes)
- Spicy Level: Integer between 0-5
- Calories: Positive integer

**Workflow:**
1. Click "Add New Dish"
2. Upload image (drag-drop hoặc browse)
3. Điền thông tin món ăn
4. Chọn category và nhập giá
5. Thêm description và ingredients
6. Mở Advanced Options nếu cần
7. Click "Create Dish"
8. Success notification hiển thị
9. Món ăn mới xuất hiện trong list

### 2.2 Edit Existing Dish

**Triggers:**
- Click vào món ăn trong Grid View
- Click icon ⚙️ trong List/Table View
- Right-click → Edit

**Edit Form:**
- Giống Add Form nhưng với dữ liệu đã điền sẵn
- Có thêm nút "Delete Dish" màu đỏ
- History tab hiển thị lịch sử thay đổi

**Quick Edit Mode:**
- Inline editing trong Table View
- Double-click vào field để edit
- Auto-save khi blur hoặc Enter

**Batch Edit:**
- Select nhiều món bằng checkbox
- Click "Bulk Edit" button
- Chỉnh sửa fields chung (category, status, discount)
- Apply changes cho tất cả món đã chọn

### 2.3 Delete Dish

**Trigger:** Click "Delete" trong Edit Form hoặc select + Delete button

**Confirmation Dialog:**
```
┌────────────────────────────────────────┐
│  ⚠️ Delete Dish?                      │
├────────────────────────────────────────┤
│                                        │
│  Are you sure you want to delete:     │
│                                        │
│  🍜 Phở Bò Đặc Biệt                   │
│                                        │
│  ⚠️ Warning:                          │
│  • This dish has 45 orders in history │
│  • 3 current orders include this dish │
│  • Cannot be undone                   │
│                                        │
│  [Cancel]            [Delete Anyway]  │
└────────────────────────────────────────┘
```

**Validation:**
- Không thể xóa nếu món đang có trong order active
- Warning nếu món có trong historical orders
- Option: Archive thay vì Delete (recommended)

**Soft Delete:**
- Món bị xóa chuyển sang "Archived" status
- Không hiển thị trong menu chính
- Có thể restore từ Archive section
- Giữ lại data cho reporting purposes

### 2.4 Duplicate Dish

**Use Case:** Tạo dish mới tương tự dish hiện có (ví dụ: size variants)

**Workflow:**
1. Right-click dish → "Duplicate"
2. Copy form mở với suffix " (Copy)" added to name
3. Modify name, price, và các thông tin khác
4. Create

**Auto-adjustments:**
- Tự động thêm "(Copy)" vào tên
- Suggest variations (Small/Medium/Large, Regular/Spicy)
- Link to original dish for variant tracking

---

## 3. CATEGORY MANAGEMENT (Quản lý danh mục)

### 3.1 Category List

**View:**
```
┌──────────────────────────────────────────────────┐
│  📂 Categories                    [+ New Category]│
├──────────────────────────────────────────────────┤
│                                                  │
│  🥗 Appetizers              (24 dishes)    [⚙️]  │
│  🍜 Soups                   (12 dishes)    [⚙️]  │
│  🥙 Main Course             (68 dishes)    [⚙️]  │
│  🍰 Desserts                (18 dishes)    [⚙️]  │
│  ☕ Beverages               (32 dishes)    [⚙️]  │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Features:**
- Drag & drop để reorder categories
- Display order affects menu display
- Icon picker cho mỗi category
- Color coding option

### 3.2 Add/Edit Category

**Form Fields (Based on actual schema):**
```
┌────────────────────────────────────┐
│  📁 Category Details               │
├────────────────────────────────────┤
│                                    │
│  Category Name * (unique)          │
│  ┌──────────────────────────────┐ │
│  │ Max 100 characters            │ │
│  └──────────────────────────────┘ │
│                                    │
│  Description (optional)            │
│  ┌──────────────────────────────┐ │
│  │ Max 500 characters            │ │
│  └──────────────────────────────┘ │
│                                    │
│  Image URL (optional)              │
│  ┌──────────────────────────────┐ │
│  │ Max 500 characters            │ │
│  └──────────────────────────────┘ │
│                                    │
│  Display Order                     │
│  [  0  ]  (default: 0)             │
│                                    │
│  Status                            │
│  ☑️ Is Active (default: true)     │
│                                    │
│  [Cancel]           [Save]        │
└────────────────────────────────────┘
```

**Schema Fields:**
- `categoryId`: Auto-increment integer (Primary Key)
- `categoryName`: String (max 100 chars, unique, required)
- `description`: String (max 500 chars, optional)
- `displayOrder`: Integer (default: 0)
- `isActive`: Boolean (default: true)
- `imageUrl`: String (max 500 chars, optional)
- `createdAt`: Timestamp (auto)
- `updatedAt`: Timestamp (auto)

**API Endpoints:**
- POST `/api/categories` - Create category
- PUT `/api/categories/:id` - Update category
- DELETE `/api/categories/:id` - Delete category
- GET `/api/categories/:id/items` - Get category with menu items

### 3.3 Category Ordering

**Display Order Management:**
- Categories sắp xếp theo `displayOrder` field
- Drag & drop để thay đổi thứ tự
- Auto-save khi reorder
- Lower number = higher priority (0, 1, 2, ...)

**Note:** Hiện tại hệ thống không hỗ trợ sub-categories (flat structure). Mỗi category là một level duy nhất.

---

## 4. PRICING MANAGEMENT (Quản lý giá)

### 4.1 Price Setting

**Basic Pricing (Based on actual schema):**
```
┌────────────────────────────────────┐
│  💰 Pricing                        │
├────────────────────────────────────┤
│                                    │
│  Price * (Selling Price)           │
│  [150,000] VND                     │
│  Range: 0 - 99,999,999.99          │
│                                    │
│  Cost (optional)                   │
│  [80,000] VND                      │
│  Giá vốn for profit calculation     │
│                                    │
│  📊 Profit: 70,000 VND (87.5%)     │
│                                    │
└────────────────────────────────────┘
```

**Schema Fields:**
- `price`: DECIMAL(10,2) - Required, giá bán
- `cost`: DECIMAL(10,2) - Optional, giá vốn

**Note:** 
- Hiện tại hệ thống chưa hỗ trợ size variants
- Không có discount field trong schema
- Không có dynamic pricing
- Để tạo size variants, cần tạo nhiều menu items riêng biệt

### 4.2 Price History (Future Enhancement)

**Planned Features:**
- Track price changes over time
- Price history log
- Rollback to previous prices
- Scheduled price changes
- Bulk price updates

**Current Limitation:**
Hiện tại chỉ có `updatedAt` timestamp. Không có bảng price history riêng.

---

## 5. AVAILABILITY MANAGEMENT (Quản lý tình trạng sẵn có)

### 5.1 Status Control (Based on actual schema)

**Available Status Fields:**
```
┌────────────────────────────────────┐
│  📌 Status Management              │
├────────────────────────────────────┤
│                                    │
│  Is Available                      │
│  ☑️ Available (default: true)      │
│  Còn hàng / Hết hàng                  │
│                                    │
│  Is Active                         │
│  ☑️ Active (default: true)         │
│  Đang bán / Ngừng bán                │
│                                    │
└────────────────────────────────────┘
```

**Two-Level Status System:**

1. **isAvailable** (boolean, default: true)
   - `true`: Còn hàng, có thể order
   - `false`: Hết hàng, không thể order tạm thời
   - API: `PATCH /api/menu/:id/availability`

2. **isActive** (boolean, default: true)
   - `true`: Đang bán, hiển trong menu
   - `false`: Ngừng bán, ẩn khỏi menu
   - API: `PUT /api/menu/:id`

**Quick Toggle:**
- Toggle switch trên UI cho isAvailable
- Chỉ admin/manager mới có thể thay đổi isActive
- Cập nhật ngay sau khi lưu

**API Usage:**
```javascript
// Quick availability toggle
PATCH /api/menu/123/availability
{ "isAvailable": false }

// Full update including isActive
PUT /api/menu/123
{ 
  "isActive": false,
  "isAvailable": false 
}
```

### 5.2 Future Availability Features

**Planned Enhancements:**
- Schedule availability for specific time periods
- Auto-update availability based on business rules
- Predicted availability based on order patterns
- Availability notifications to customers

**Schema Relations:**
```
MenuItem -> OrderItem
         -> BillItem
```

### 5.3 Additional Item Properties

**Other Status-Related Fields:**

- **preparationTime**: Integer (minutes)
  - Thời gian chế biến dự kiến
  - Hiển thị cho khách hàng
  - Dùng để estimate order time

- **spicyLevel**: Integer (0-5, default: 0)
  - 0: Không cay
  - 1-2: Ít cay
  - 3-4: Cay vừa
  - 5: Rất cay

- **isVegetarian**: Boolean (default: false)
  - Món chay / Món mặn
  - Filter option trong menu

- **calories**: Integer (optional)
  - Lượng calo
  - Thông tin dinh dưỡng

**Note:** Không có seasonal availability trong schema hiện tại. Có thể quản lý bằng cách toggle isActive theo mùa.

---

## 6. PERMISSIONS & ROLES (Phân quyền)

### 6.1 Role-based Access

**Schema Field:**
```
imageUrl: String (max 500 chars, optional)
```

**Image URL Format:**
```
┌────────────────────────────────────┐
│  📷 Image URL                      │
├────────────────────────────────────┤
│                                    │
│  Image URL (optional)              │
│  ┌──────────────────────────────┐ │
│  │ https://example.com/image.jpg │ │
│  └──────────────────────────────┘ │
│                                    │
│  Max length: 500 characters        │
│  Must be valid URL or empty        │
│                                    │
└────────────────────────────────────┘
```

**Current Implementation:**
- Hệ thống lưu imageUrl dưới dạng string (URL)
- Không có built-in upload system
- Cần tích hợp với external storage (Cloudinary, S3, etc.)
- Chỉ support 1 image URL / menu item

**Integration Options:**

1. **Cloudinary:**
   - Upload image to Cloudinary
   - Lấy URL từ response
   - Lưu URL vào imageUrl field

2. **AWS S3:**
   - Upload to S3 bucket
   - Get public URL
   - Store in database

3. **Local Storage:**
   - Upload to `/uploads` folder
   - Serve via static file server
   - Store relative path

**File Upload API:**
Hệ thống có file upload service tại:
```
POST /api/upload
- Accepts multipart/form-data
- Returns file URL
- Stores in /uploads directory
```

### 6.2 Image Requirements

**Recommended Specifications:**
- Format: JPG, PNG, WebP
- Max size: 5MB per image
- Dimensions: 800x600px or 1024x768px
- Aspect ratio: 4:3 or 16:9
- Compression: Optimize before upload

**Frontend Handling:**
- Display placeholder if imageUrl is null
- Lazy loading for performance
- Responsive images with srcset
- Error fallback image

### 6.3 Future Enhancements

**Planned Features:**
- Direct file upload UI
- Multiple images per item (gallery)
- Image cropping tool
- Auto-optimization
- CDN integration
- Image variants (thumbnail, medium, large):**
- Browse uploaded images
- Search images by tags
- Reuse images across dishes
- Organize in folders

**Stock Photos Integration:**
- Connect to Unsplash API
- Search food photos
- Import directly to library

---

## 7. SEARCH & FILTER (Tìm kiếm và lọc)

### 7.1 Basic Search

**Search Bar:**
```
┌────────────────────────────────────────────┐
│  🔍 Search dishes...                       │
└────────────────────────────────────────────┘
```

**Search Features:**
- Tìm kiếm theo tên món ăn
- Tìm kiếm theo mô tả
- Hiển thị kết quả ngay lập tức

### 7.2 Filtering

**Filter Combinations:**
```
Active Filters:
┌─────────────────────────────────────────┐
│ Category: Main Course              [×]  │
│ Price: 100k-200k VND               [×]  │
│ Status: Available                  [×]  │
│                                         │
│ [Clear All Filters]                     │
└─────────────────────────────────────────┘

Showing 12 of 248 dishes
```

### 7.3 Sorting Options

**Sort By:**
- Name (A-Z / Z-A)
- Price (Low to High / High to Low)
- Date Added (Newest / Oldest)
- Category (Alphabetical)

**Default Sort:** By name (A-Z)

---

## 8. IMAGE MANAGEMENT (Quản lý hình ảnh)

### 8.1 Image Storage (Based on actual schema)

**Roles:**
```
👑 Admin
├── Full access
├── Add/Edit/Delete dishes
├── Manage categories
└── Set prices

👨‍💼 Manager
├── View all dishes
├── Edit dish details
└── Update availability

🧑‍💼 Staff
├── View menu only
├── See availability
└── View prices
```

### 6.2 Permission Settings

**Basic Permissions:**
- Can create dishes
- Can edit dishes
- Can delete dishes
- Can manage categories
- Can view menu

---

## 9. BEST PRACTICES & RECOMMENDATIONS (Thực hành tốt nhất)

### 9.1 Menu Organization

**Tips:**
- Limit categories to 8-12 for clarity
- Order dishes by popularity
- Use high-quality images (professional photos)
- Keep descriptions concise (2-3 lines max)
- Update seasonal items regularly
- Remove unpopular dishes quarterly

### 9.2 Pricing Strategy

**Recommendations:**
- Psychological pricing (99,000 instead of 100,000)
- Bundle deals for higher revenue
- Loss leader strategy for popular items
- Premium pricing for signature dishes
- Regular price reviews (quarterly)

### 9.3 Image Guidelines

**Photo Best Practices:**
- Natural lighting preferred
- Show actual portion size
- Consistent styling
- Clean background
- Show garnish and plating
- Update photos annually

### 9.4 Availability Management

**Availability Tips:**
- Prepare backup dishes
- Communicate with kitchen daily
- Update availability regularly
- Plan for peak hours

---

## 10. KEYBOARD SHORTCUTS (Phím tắt)

### 10.1 Global Shortcuts

```
Ctrl + N        Create New Dish
Ctrl + S        Save Changes
Ctrl + F        Focus Search
Ctrl + K        Quick Command
Esc             Close Dialog/Cancel
Ctrl + Z        Undo
Ctrl + Y        Redo
```

### 10.2 Navigation

```
←↑↓→            Navigate dishes
Enter           Open selected dish
Space           Toggle selection
Ctrl + A        Select all
Delete          Delete selected
```

### 10.3 View Controls

```
Ctrl + 1        Grid View
Ctrl + 2        List View
Ctrl + 3        Table View
Ctrl + +        Zoom In
Ctrl + -        Zoom Out
Ctrl + 0        Reset Zoom
```

---

## 11. TROUBLESHOOTING (Xử lý sự cố)

### 11.1 Common Issues

**Issue: Images not uploading**
- Check file size (max 5MB)
- Verify format (JPG/PNG/WebP)
- Check internet connection
- Clear browser cache

**Issue: Changes not saving**
- Check internet connection
- Verify user permissions
- Try refreshing the page
- Check form validation errors

### 11.2 Performance Tips

**Optimization:**
- Use compressed images
- Limit dishes per page (20-50)
- Enable lazy loading
- Clear old cache regularly
- Archive discontinued dishes

---

## CONCLUSION

Menu Management System cung cấp giải pháp quản lý thực đơn nhà hàng với giao diện trực quan và các tính năng cơ bản cần thiết. Hệ thống được thiết kế đơn giản, dễ sử dụng, phù hợp cho dự án tốt nghiệp.

**Key Features:**
- Quản lý món ăn và danh mục
- Cập nhật giá và tình trạng sẵn có
- Tìm kiếm và lọc món ăn
- Quản lý hình ảnh món ăn
- Phân quyền người dùng cơ bản
- Giao diện responsive

---

**Document Version:** 2.0 - Simplified for Graduation Project  
**Last Updated:** November 15, 2025  
**Maintained By:** Restaurant Management System Team

**Note:** This simplified version is designed specifically for a graduation project. Complex features have been removed including: inventory management, recipe tracking, supplier integration, advanced analytics, multilingual support, bulk operations, menu scheduling, webhooks, notifications, AI features, and third-party integrations. Focus is on core menu management functionality.
