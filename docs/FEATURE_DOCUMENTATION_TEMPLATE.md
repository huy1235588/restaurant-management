# [Feature Name] - Comprehensive Feature Documentation

## Overview

[Mô tả tổng quan về tính năng, giải thích mục đích và vai trò của tính năng trong hệ thống quản lý nhà hàng]

**Đặc điểm chính:**
- **[Key Feature 1]:** [Mô tả ngắn gọn]
- **[Key Feature 2]:** [Mô tả ngắn gọn]
- **[Key Feature 3]:** [Mô tả ngắn gọn]
- **[Key Feature 4]:** [Mô tả ngắn gọn]

---

## 1. [FEATURE] LAYOUT (Bố cục giao diện)

### 1.1 Main Layout Structure

**When accessing [Feature]:**
- ✅ [Component có]
- ✅ [Component có]
- ❌ [Component không có]

**Layout Structure:**
```
┌────────────────────────────────────────┐
│  [Component 1]                         │  ← Mô tả
├────────────────────────────────────────┤
│                                        │
│           [Main Area]                  │  ← Mô tả chính
│                                        │
│                                        │
└────────────────────────────────────────┘
```

**Key Components:**
- Left: [Mô tả các thành phần bên trái]
- Center: [Mô tả các thành phần ở giữa]
- Right: [Mô tả các thành phần bên phải]

**Rationale:**
- [Lý do thiết kế 1]
- [Lý do thiết kế 2]
- [Lý do thiết kế 3]

### 1.2 Header Section

**Components:**
```
┌──────────────────────────────────────────────────┐
│  🎯 [Feature Name]                               │
│  ┌─────────────────┐  [+ Action Button]         │
│  │ 🔍 Search...    │                             │
│  └─────────────────┘                             │
└──────────────────────────────────────────────────┘
```

**Features:**
- **Title Bar:** [Mô tả]
- **Search Bar:** [Chức năng tìm kiếm]
- **Action Buttons:** [Các nút hành động]

### 1.3 Filter Panel

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Filter 1 ▼] [Filter 2 ▼] [Filter 3 ▼]         │
│ [Reset Filters]                                  │
└──────────────────────────────────────────────────┘
```

**Filter Options:**

**1. [Filter Type 1]:**
- Option 1
- Option 2
- Option 3

**2. [Filter Type 2]:**
- Option A
- Option B
- Option C

### 1.4 Statistics Cards

**Display Metrics:**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Metric 1   │ Metric 2   │ Metric 3   │ Metric 4   │
│            │            │            │            │
│    XXX     │    YYY     │    ZZZ     │    WWW     │
└────────────┴────────────┴────────────┴────────────┘
```

**Statistics Updates:**
- [Điều kiện cập nhật 1]
- [Điều kiện cập nhật 2]
- Color coding: [Quy tắc màu sắc]

### 1.5 View Modes

**[View Mode 1] (Default):**
```
┌───────────┐ ┌───────────┐ ┌───────────┐
│  [Item 1] │ │  [Item 2] │ │  [Item 3] │
│           │ │           │ │           │
│  Details  │ │  Details  │ │  Details  │
└───────────┘ └───────────┘ └───────────┘
```

**[View Mode 2]:**
```
┌──────────────────────────────────────────────────┐
│ [Item 1]  [Details]  [Info]  [Actions]          │
│ [Item 2]  [Details]  [Info]  [Actions]          │
│ [Item 3]  [Details]  [Info]  [Actions]          │
└──────────────────────────────────────────────────┘
```

**Switch Views:** [Cách chuyển đổi giữa các view]

---

## 2. CORE FUNCTIONALITY (Chức năng cốt lõi)

### 2.1 [Primary Action] (Hành động chính)

**Trigger:** [Cách kích hoạt chức năng]

**Form/Dialog:**
```
┌─────────────────────────────────────────────────┐
│  ✨ [Action Title]                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Input Field 1] *                              │
│  ┌─────────────────────────────────────────┐  │
│  │                                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [Input Field 2] *                              │
│  ┌─────────────────────────────────────────┐  │
│  │                                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [Additional Options ▼]                         │
│                                                 │
│  [Cancel]                    [Submit]           │
└─────────────────────────────────────────────────┘
```

**Required Fields:**
- [Field 1]: [Description, constraints]
- [Field 2]: [Description, constraints]
- [Field 3]: [Description, constraints]

**Optional Fields:**
- [Field A]: [Description, default value]
- [Field B]: [Description, default value]

**Validation:**
- [Validation rule 1]
- [Validation rule 2]
- [Validation rule 3]

**Workflow:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
5. [Step 5]

### 2.2 Edit/Update Functionality

**Triggers:**
- [Trigger method 1]
- [Trigger method 2]
- [Trigger method 3]

**Edit Form:**
- [Mô tả form chỉnh sửa]
- [Các thành phần khác biệt so với form tạo mới]

**Quick Edit Mode:**
- [Mô tả chế độ chỉnh sửa nhanh]
- [Cách kích hoạt và sử dụng]

**Batch Edit:**
- [Mô tả chức năng chỉnh sửa hàng loạt]
- [Các trường có thể chỉnh sửa hàng loạt]

### 2.3 Delete Functionality

**Trigger:** [Cách kích hoạt xóa]

**Confirmation Dialog:**
```
┌────────────────────────────────────────┐
│  ⚠️ [Delete Confirmation Title]       │
├────────────────────────────────────────┤
│                                        │
│  [Confirmation message]                │
│                                        │
│  [Item details]                        │
│                                        │
│  ⚠️ Warning:                          │
│  • [Warning point 1]                   │
│  • [Warning point 2]                   │
│  • [Warning point 3]                   │
│                                        │
│  [Cancel]            [Delete]          │
└────────────────────────────────────────┘
```

**Validation:**
- [Điều kiện không được phép xóa]
- [Cảnh báo khi xóa]

**Soft Delete:**
- [Mô tả cơ chế soft delete nếu có]
- [Cách restore]

---

## 3. [CATEGORY/GROUPING] MANAGEMENT

### 3.1 [Category] Overview

**View:**
```
┌──────────────────────────────────────────────────┐
│  📂 [Categories]                  [+ New Category]│
├──────────────────────────────────────────────────┤
│                                                  │
│  [Category 1]              (XX items)    [⚙️]    │
│  [Category 2]              (YY items)    [⚙️]    │
│  [Category 3]              (ZZ items)    [⚙️]    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

### 3.2 Add/Edit Category

**Form Fields (Based on schema):**
```
┌────────────────────────────────────┐
│  📁 [Category Details]             │
├────────────────────────────────────┤
│                                    │
│  [Field 1] * (required)            │
│  ┌──────────────────────────────┐ │
│  │                               │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Field 2] (optional)              │
│  ┌──────────────────────────────┐ │
│  │                               │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Cancel]           [Save]        │
└────────────────────────────────────┘
```

**Schema Fields:**
- `field1`: [Type, constraints, description]
- `field2`: [Type, constraints, description]
- `field3`: [Type, constraints, description]

**API Endpoints:**
- POST `/api/[resource]` - Create
- PUT `/api/[resource]/:id` - Update
- DELETE `/api/[resource]/:id` - Delete
- GET `/api/[resource]/:id` - Get details

---

## 4. [SPECIFIC FEATURE] (Tính năng đặc thù)

### 4.1 [Feature Component 1]

**Description:**
[Mô tả chi tiết về component này]

**UI Example:**
```
┌────────────────────────────────────┐
│  💰 [Component Name]               │
├────────────────────────────────────┤
│                                    │
│  [Visual representation]           │
│                                    │
└────────────────────────────────────┘
```

**Schema Fields:**
- `field1`: [Type, range, description]
- `field2`: [Type, range, description]

**Note:**
- [Important note 1]
- [Important note 2]

### 4.2 [Feature Component 2]

**Features:**
- [Feature description]
- [Configuration options]

---

## 5. STATUS MANAGEMENT (Quản lý trạng thái)

### 5.1 Status Types

**Available Statuses:**
1. **[Status 1]** - [Color] - [Description]
2. **[Status 2]** - [Color] - [Description]
3. **[Status 3]** - [Color] - [Description]
4. **[Status 4]** - [Color] - [Description]

### 5.2 Status Indicators

**Visual Indicators:**
- [Indicator type 1]
- [Indicator type 2]
- [Indicator type 3]

**Real-time Updates:**
- [Update mechanism 1]
- [Update mechanism 2]

### 5.3 Status Control (Based on schema)

**Status Fields:**
```
┌────────────────────────────────────┐
│  📌 Status Management              │
├────────────────────────────────────┤
│                                    │
│  [Status Field 1]                  │
│  ☑️ [Option] (default: true/false) │
│  [Description]                     │
│                                    │
│  [Status Field 2]                  │
│  ☑️ [Option] (default: true/false) │
│  [Description]                     │
│                                    │
└────────────────────────────────────┘
```

**API Usage:**
```javascript
// Status update endpoint
PATCH /api/[resource]/:id/status
{ "status": "value" }

// Full update
PUT /api/[resource]/:id
{ 
  "field1": "value",
  "field2": "value" 
}
```

---

## 6. IMAGE/FILE MANAGEMENT (Quản lý hình ảnh/file)

### 6.1 File Storage (Based on schema)

**Schema Field:**
```
[fieldName]: String (max XXX chars, optional/required)
```

**File Format:**
```
┌────────────────────────────────────┐
│  📷 [File Type]                    │
├────────────────────────────────────┤
│                                    │
│  [Field Name] (optional/required)  │
│  ┌──────────────────────────────┐ │
│  │ [URL or path]                 │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Upload Button]                   │
│                                    │
└────────────────────────────────────┘
```

**Current Implementation:**
- [Storage method description]
- [Supported formats]
- [Size limits]

**Integration Options:**
1. **[Option 1]:** [Description]
2. **[Option 2]:** [Description]
3. **[Option 3]:** [Description]

### 6.2 File Requirements

**Recommended Specifications:**
- Format: [Supported formats]
- Max size: [Size limit]
- Dimensions: [Recommended dimensions]
- Aspect ratio: [Recommended ratios]

**Frontend Handling:**
- [Handling approach 1]
- [Handling approach 2]

---

## 7. SEARCH & FILTER (Tìm kiếm và lọc)

### 7.1 Basic Search

**Search Bar:**
```
┌────────────────────────────────────────────┐
│  🔍 Search [items]...                      │
└────────────────────────────────────────────┘
```

**Search Features:**
- [Search capability 1]
- [Search capability 2]
- [Search capability 3]

### 7.2 Advanced Filtering

**Filter Combinations:**
```
Active Filters:
┌─────────────────────────────────────────┐
│ [Filter 1]: [Value]                [×] │
│ [Filter 2]: [Value]                [×] │
│ [Filter 3]: [Value]                [×] │
│                                         │
│ [Clear All Filters]                     │
└─────────────────────────────────────────┘

Showing X of Y items
```

### 7.3 Sorting Options

**Sort By:**
- [Sort option 1] (A-Z / Z-A)
- [Sort option 2] (Low to High / High to Low)
- [Sort option 3] (Newest / Oldest)

**Default Sort:** [Default sorting behavior]

---

## 8. PERMISSIONS & ROLES (Phân quyền)

### 8.1 Role-based Access

**Roles:**
```
👑 Admin
├── [Permission 1]
├── [Permission 2]
└── [Permission 3]

👨‍💼 Manager
├── [Permission 1]
├── [Permission 2]
└── [Permission 3]

🧑‍💼 Staff
├── [Permission 1]
└── [Permission 2]
```

### 8.2 Permission Matrix

**Access Control:**
| Action | Admin | Manager | Staff |
|--------|-------|---------|-------|
| View   | ✅    | ✅      | ✅    |
| Create | ✅    | ✅      | ❌    |
| Edit   | ✅    | ✅      | ❌    |
| Delete | ✅    | ❌      | ❌    |

---

## 9. VIEW CONTROLS (Điều khiển hiển thị)

### 9.1 Zoom Controls

**Chức năng:**
- **Zoom In:** [Description]
- **Zoom Out:** [Description]
- **Reset Zoom:** [Description]

**Phím tắt:**
- `Ctrl + Scroll` để zoom
- `0` để reset về 100%

### 9.2 Display Options

**Options:**
- [Option 1]: [Description]
- [Option 2]: [Description]
- [Option 3]: [Description]

---

## 10. INTEGRATION (Tích hợp)

### 10.1 Integration with [Other Feature]

**Integration Points:**
- [Integration point 1]
- [Integration point 2]
- [Integration point 3]

**Data Flow:**
```
[Feature A] → [Feature B] → [Feature C]
```

### 10.2 Real-time Sync

**Bidirectional Sync:**
- [Sync behavior 1]
- [Sync behavior 2]

**Status Updates:**
- [Update mechanism]
- [Conflict resolution]

---

## 11. REPORTS & ANALYTICS (Báo cáo và phân tích)

### 11.1 Dashboard Metrics

**Key Metrics:**
```
┌─────────────────────────────────────────┐
│  Analytics - [Period]                   │
├─────────────────────────────────────────┤
│  [Metric 1]:     XXX                    │
│  [Metric 2]:     YYY (XX%)              │
│  [Metric 3]:     ZZZ (YY%)              │
│                                         │
│  [View Detailed Report]                 │
└─────────────────────────────────────────┘
```

### 11.2 Report Types

**Available Reports:**
1. **[Report Type 1]:** [Description]
2. **[Report Type 2]:** [Description]
3. **[Report Type 3]:** [Description]

**Export Options:**
- CSV export
- PDF reports
- Excel format

---

## 12. ADVANCED FEATURES (Tính năng nâng cao)

### 12.1 [Advanced Feature 1]

**Description:** [Feature description]

**Configuration:**
```
┌─────────────────────────────────────┐
│  [Feature Configuration]            │
├─────────────────────────────────────┤
│  [Settings and options]             │
└─────────────────────────────────────┘
```

### 12.2 [Advanced Feature 2]

**Features:**
- [Feature description 1]
- [Feature description 2]

---

## 13. KEYBOARD SHORTCUTS (Phím tắt)

### 13.1 Global Shortcuts

```
Ctrl + N        [Action]
Ctrl + S        [Action]
Ctrl + F        [Action]
Ctrl + K        [Action]
Esc             [Action]
```

### 13.2 Navigation Shortcuts

```
←↑↓→            [Action]
Enter           [Action]
Space           [Action]
Delete          [Action]
```

---

## 14. MOBILE & ACCESSIBILITY (Di động và khả năng truy cập)

### 14.1 Mobile Interface

**Responsive Design:**
```
Mobile View:
┌─────────────────┐
│ [Header]        │
├─────────────────┤
│                 │
│  [Main Content] │
│                 │
├─────────────────┤
│ [Actions]       │
└─────────────────┘
```

**Touch Gestures:**
- [Gesture 1]: [Action]
- [Gesture 2]: [Action]
- [Gesture 3]: [Action]

### 14.2 Accessibility Features

**ARIA Support:**
- Screen reader compatible
- Keyboard navigation
- Focus management
- High contrast mode

---

## 15. SETTINGS & CONFIGURATION (Cài đặt và cấu hình)

### 15.1 General Settings

**Configuration Options:**
```
┌─────────────────────────────────────┐
│  [Feature] Configuration            │
├─────────────────────────────────────┤
│  [Setting 1]:   [Value/Option]  ▼   │
│  [Setting 2]:   [Value/Option]  ▼   │
│  [Setting 3]:   [Value/Option]  ▼   │
│                                     │
│  [Save Settings]                    │
└─────────────────────────────────────┘
```

### 15.2 Advanced Settings

**Expert Options:**
- [Option 1]: [Description]
- [Option 2]: [Description]
- [Option 3]: [Description]

---

## 16. BEST PRACTICES & RECOMMENDATIONS (Thực hành tốt nhất)

### 16.1 [Usage Pattern 1]

**Tips:**
- [Tip 1]
- [Tip 2]
- [Tip 3]

### 16.2 [Usage Pattern 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

### 16.3 Common Mistakes to Avoid

**Anti-patterns:**
- ❌ [Don't do this]
- ✅ [Do this instead]

---

## 17. TROUBLESHOOTING & FAQ (Khắc phục sự cố)

### 17.1 Common Issues

**Issue: [Problem description]**
```
Solutions:
1. [Solution 1]
2. [Solution 2]
3. [Solution 3]
```

**Issue: [Another problem]**
```
Solutions:
1. [Solution 1]
2. [Solution 2]
```

### 17.2 FAQ

**Q: [Question 1]?**  
A: [Answer]

**Q: [Question 2]?**  
A: [Answer]

**Q: [Question 3]?**  
A: [Answer]

---

## 18. API REFERENCE (Tài liệu API)

### 18.1 REST Endpoints

**List Items:**
```javascript
GET /api/[resource]
?page=1
&limit=20
&filter=[field]:[value]
&sort=[field]:[asc|desc]

Response:
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**Create Item:**
```javascript
POST /api/[resource]
{
  "field1": "value1",
  "field2": "value2"
}

Response:
{
  "id": "xxx",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Update Item:**
```javascript
PUT /api/[resource]/:id
{
  "field1": "new_value"
}

Response:
{
  "id": "xxx",
  "field1": "new_value",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Delete Item:**
```javascript
DELETE /api/[resource]/:id

Response:
{
  "message": "Successfully deleted",
  "id": "xxx"
}
```

### 18.2 WebSocket Events (if applicable)

**Event Subscriptions:**
```
Available events:
- [resource].created
- [resource].updated
- [resource].deleted
```

**Event Payload:**
```javascript
{
  "event": "[resource].updated",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "xxx",
    "changes": {...}
  }
}
```

---

## 19. PERFORMANCE OPTIMIZATION (Tối ưu hiệu năng)

### 19.1 Rendering Strategy

**Optimization Techniques:**
- [Technique 1]
- [Technique 2]
- [Technique 3]

### 19.2 Data Management

**Caching Strategy:**
- [Cache layer 1]
- [Cache layer 2]

**State Updates:**
- [Update strategy]
- [Optimization approach]

---

## 20. SECURITY CONSIDERATIONS (Cân nhắc bảo mật)

### 20.1 Data Protection

**Security Measures:**
- [Measure 1]
- [Measure 2]
- [Measure 3]

### 20.2 Input Validation

**Validation Rules:**
- [Rule 1]
- [Rule 2]
- [Rule 3]

---

## 21. FUTURE ENHANCEMENTS (Cải tiến trong tương lai)

### 21.1 Planned Features

**Upcoming Features:**
- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

### 21.2 Requested Features

**User Requests:**
- [Request 1]
- [Request 2]
- [Request 3]

---

## APPENDIX

### A. Keyboard Shortcuts Reference

```
Global:
  Ctrl/Cmd + [key]    [Action]
  
Navigation:
  Arrow keys          [Action]
  
Editing:
  Enter               [Action]
  Delete              [Action]
```

### B. Status Code Reference

```
[Entity] Status Codes:
  CODE_1       - [Description]
  CODE_2       - [Description]
  CODE_3       - [Description]
```

### C. Validation Rules

```
[Field 1]:     [Validation rule]
[Field 2]:     [Validation rule]
[Field 3]:     [Validation rule]
```

### D. Database Schema

```sql
CREATE TABLE [table_name] (
  id SERIAL PRIMARY KEY,
  [field1] [TYPE] [CONSTRAINTS],
  [field2] [TYPE] [CONSTRAINTS],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT [constraint_name] CHECK ([condition])
);

CREATE INDEX [index_name] ON [table_name]([field]);
```

---

**Document Version:** 1.0  
**Last Updated:** [Date]  
**Author:** Restaurant Management System Team  
**Status:** [Draft/Review/Approved]

---

## TEMPLATE USAGE GUIDE

### How to Use This Template

1. **Replace Placeholders:**
   - `[Feature Name]` → Tên tính năng cụ thể
   - `[Description]` → Mô tả chi tiết
   - `[Field/Value]` → Thông tin thực tế

2. **Remove Unused Sections:**
   - Xóa các section không áp dụng cho tính năng
   - Giữ lại cấu trúc phù hợp

3. **Add Custom Sections:**
   - Thêm sections đặc thù cho tính năng
   - Đảm bảo thứ tự logic

4. **Visual Diagrams:**
   - Sử dụng ASCII art cho UI layouts
   - Thêm code blocks cho examples
   - Include screenshots nếu cần

5. **Keep Updated:**
   - Update document version
   - Update last modified date
   - Update status (Draft → Review → Approved)

### Section Priority

**Essential (Must Have):**
- Overview
- Layout/Interface
- Core Functionality
- Database Schema
- API Reference

**Important (Should Have):**
- Status Management
- Search & Filter
- Permissions
- Keyboard Shortcuts

**Optional (Nice to Have):**
- Advanced Features
- Mobile Interface
- Analytics
- Future Enhancements

### Writing Style Guide

**✅ DO:**
- Use clear, concise language
- Include code examples
- Show visual representations
- Explain WHY, not just WHAT
- Document edge cases
- List all validations

**❌ DON'T:**
- Use vague descriptions
- Skip validation rules
- Forget error handling
- Ignore accessibility
- Omit API endpoints
- Leave TODOs in production docs

### Documentation Checklist

Before marking document as "Approved":

- [ ] All placeholders replaced
- [ ] Database schema documented
- [ ] API endpoints listed with examples
- [ ] Validation rules specified
- [ ] Error handling covered
- [ ] Keyboard shortcuts documented
- [ ] Permission matrix included
- [ ] FAQ section populated
- [ ] Version number set
- [ ] Last updated date correct
- [ ] Status set to appropriate value
- [ ] Code examples tested
- [ ] Visual diagrams clear
- [ ] Cross-references accurate

---

**Template Version:** 1.0  
**Template Created:** December 2024  
**Template Author:** Restaurant Management System Team
