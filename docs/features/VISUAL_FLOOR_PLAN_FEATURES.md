# Visual Floor Plan Editor - Comprehensive Feature Documentation

## Overview

Visual Floor Plan Editor là công cụ chỉnh sửa sơ đồ mặt bằng nhà hàng trực quan với khả năng tùy chỉnh cao, hỗ trợ thao tác kéo thả, căn chỉnh tự động và quản lý layout theo thời gian thực.

**Đặc điểm chính:**
- **Dedicated Editor View:** Khi vào Editor mode, toàn bộ màn hình dành cho canvas - không có header, search, filter
- **Floor-based Management:** Mỗi tầng có layout riêng biệt, chuyển tầng để xem/chỉnh sửa
- **Manual Save:** Thay đổi chỉ được lưu khi nhấn nút Save

---

## 1. EDITOR LAYOUT (Bố cục Editor)

### 1.1 Full Canvas Mode

**Khi vào Visual Editor:**
- ❌ Không có Header (title, search, filters)
- ❌ Không có Stats cards
- ❌ Không có Table filters
- ❌ Không có Quick view panel
- ✅ Chỉ có Canvas + Editor Toolbar + Properties Panel (optional)

**Layout Structure:**
```
┌────────────────────────────────────────┐
│  [Editor Toolbar]                      │  ← Tools, Zoom, Save
├────────────────────────────────────────┤
│                                        │
│           CANVAS                       │  ← Full screen workspace
│        (Floor-based)                   │
│                                        │
└────────────────────────────────────────┘
```

**Toolbar Items:**
- Left: Floor Selector + Tool Palette (Select, Pan, Add, Delete, Grid)
- Center: Zoom Controls
- Right: Undo/Redo, View Controls, **Save Button**

**Rationale:**
- Maximize canvas space
- Focus on editing without distractions
- Professional CAD-like experience
- Table management features stay in List View

### 1.2 Navigation

**Switching Views:**
- List View → Visual Editor: Full screen switch
- Visual Editor → List View: Return to normal layout
- No hybrid view - completely separate modes

**Data Flow:**
```
List View              Visual Editor
[Filters]              [Floor Selector]
[Search]         →     [Canvas Only]
[Stats]                [Tools]
[Table Grid]           [Save Button]
```

---

## 2. CORE EDITING TOOLS (Công cụ chỉnh sửa cơ bản)

### 2.1 Select Tool (Công cụ chọn) - `V`
**Phím tắt:** `V`

**Chức năng:**
- Chọn bàn bằng cách click
- Kéo thả để di chuyển bàn đã chọn
- Hiển thị resize handles (nút điều chỉnh kích thước) trên bàn được chọn
- Hỗ trợ multi-select (chọn nhiều bàn) với `Shift + Click`
- Hiển thị thông tin bàn đang chọn

**Tương tác:**
- Click vào bàn → Chọn bàn
- Drag bàn → Di chuyển vị trí
- Drag resize handle → Thay đổi kích thước
- Click vùng trống → Bỏ chọn

### 2.2 Pan Tool (Công cụ di chuyển canvas) - `H`
**Phím tắt:** `H`

**Chức năng:**
- Click và kéo để di chuyển toàn bộ canvas
- Hữu ích khi làm việc với sơ đồ lớn
- Hỗ trợ pan boundaries (giới hạn di chuyển) để tránh lạc khỏi vùng làm việc

**Tương tác:**
- Click và drag trên canvas → Di chuyển view
- Cursor thay đổi thành grab/grabbing icon
- Tự động tính toán boundaries dựa trên vị trí các bàn

**Pan Boundaries Features:**
- Giới hạn vùng pan dựa trên bounding box của tất cả bàn
- Thêm margin buffer (mặc định: 500px) xung quanh các bàn
- Hiển thị boundary indicator khi đến biên
- Ngăn chặn việc "lạc" khỏi vùng làm việc

### 2.3 Add Table Tool (Công cụ thêm bàn) - `T`
**Phím tắt:** `T`

**Chức năng:**
- Thêm bàn mới trực tiếp trên canvas bằng cách click
- Ghost preview (xem trước mờ) hiển thị vị trí bàn sẽ được đặt
- Collision detection (phát hiện va chạm) ngăn đặt bàn chồng lên nhau
- Grid snapping (dính lưới) tự động khi grid được bật
- Mở Quick Create Dialog sau khi click để nhập thông tin bàn

**Workflow:**
1. Nhấn `T` hoặc click nút "Add Table"
2. Di chuyển chuột → Ghost preview theo chuột
3. Ghost màu xanh = vị trí hợp lệ, màu đỏ = có va chạm
4. Click vị trí muốn đặt bàn
5. Quick Create Dialog hiện ra với tọa độ đã điền sẵn
6. Nhập Table Number, Capacity
7. Click "Create" → Bàn mới xuất hiện

**Validation:**
- Kiểm tra va chạm với bàn hiện có
- Kiểm tra vị trí trong canvas bounds
- Ngăn đặt bàn ra ngoài vùng làm việc
- Grid snapping có thể tắt bằng `Shift + Drag`

**Features:**
- Auto-increment table number
- Default capacity dựa trên kích thước
- Visual feedback rõ ràng (màu xanh/đỏ)
- Press `Esc` để cancel tool

### 2.4 Delete Tool (Công cụ xóa bàn) - `Delete`
**Phím tắt:** `Delete` (với bàn đã chọn)

**Chức năng:**
- Xóa bàn đã chọn khỏi canvas
- Hiển thị confirmation dialog trước khi xóa
- Validation để ngăn xóa bàn đang có order active
- Visual feedback (highlight đỏ) cho bàn sẽ bị xóa

**Workflow:**
1. Chọn bàn bằng Select Tool
2. Nhấn `Delete` hoặc click nút Delete
3. Confirmation dialog hiển thị:
   - Table number, status
   - Warning nếu bàn có reservation/order
4. Xác nhận xóa
5. Bàn biến mất với fade-out animation
6. Tool tự động chuyển về Select mode

**Validation:**
- Không thể xóa bàn có order đang active
- Warning cho bàn có reservation
- Hiển thị thông tin chi tiết trước khi xóa
- Undo support (có thể hoàn tác)

---

## 2. FLOOR SELECTOR (Chọn tầng)

### 2.1 Floor Management

**Chức năng:**
- Chọn tầng để hiển thị và chỉnh sửa
- Mỗi tầng có layout độc lập
- Chuyển đổi giữa các tầng nhanh chóng
- Hiển thị số lượng bàn trên mỗi tầng

**UI Location:**
- Dropdown selector ở góc trên bên trái canvas
- Hiển thị tầng hiện tại đang xem
- Danh sách tất cả tầng có sẵn

**Features:**
- **Floor List:** Dropdown hiển thị tất cả tầng (Floor 1, Floor 2, ...)
- **Table Count:** Hiển thị số bàn trên mỗi tầng
- **Quick Switch:** Keyboard shortcuts `1`, `2`, `3`... để chuyển tầng nhanh
- **Unsaved Warning:** Cảnh báo khi chuyển tầng mà có thay đổi chưa lưu

**Workflow:**
1. Mở Floor Selector dropdown
2. Chọn tầng muốn xem/chỉnh sửa
3. Canvas load layout của tầng đó
4. Thực hiện chỉnh sửa
5. Nhấn Save để lưu thay đổi
6. Có thể chuyển sang tầng khác

**Display:**
```
┌─────────────────────────────┐
│ 🏢 Floor 2 ▼  (12 tables)  │
├─────────────────────────────┤
│ Floor 1 (8 tables)          │
│ Floor 2 (12 tables) ✓       │
│ Floor 3 (15 tables)         │
└─────────────────────────────┘
```

### 2.2 Per-Floor Layout Storage

**Data Structure:**
- Mỗi tầng có bảng positions riêng
- Layout templates áp dụng per floor
- Undo/redo stack riêng cho mỗi tầng

**Database:**
```sql
CREATE TABLE table_positions (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES restaurant_tables(table_id),
  floor INTEGER NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER DEFAULT 80,
  height INTEGER DEFAULT 80,
  rotation INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. VIEW CONTROLS (Điều khiển hiển thị)

### 2.1 Zoom Controls (Điều khiển zoom)

**Chức năng:**
- **Zoom In:** Phóng to canvas (tối đa 200%)
- **Zoom Out:** Thu nhỏ canvas (tối thiểu 25%)
- **Reset Zoom:** Trở về 100%
- **Zoom Display:** Hiển thị % zoom hiện tại

**Phím tắt:**
- `Ctrl + Scroll` hoặc `Cmd + Scroll` để zoom
- `0` để reset về 100%
- Zoom In/Out buttons trên toolbar

**Features:**
- Smooth zoom animation
- Zoom center point tại vị trí chuột
- Zoom levels: 25%, 50%, 75%, 100%, 125%, 150%, 200%

### 2.2 Grid Controls (Điều khiển lưới)

**Phím tắt:** `G`

**Chức năng:**
- Toggle hiển thị/ẩn grid overlay
- Grid giúp căn chỉnh bàn chính xác
- Grid snapping tự động khi di chuyển bàn
- Configurable grid size (10px, 20px, 50px)

**Visual:**
- Grid vẽ bằng HTML5 Canvas
- Màu grid subtle (không gây mất tập trung)
- Grid responsive với zoom level

### 2.3 Fit to View (Vừa khung nhìn)

**Chức năng:**
- Tự động điều chỉnh zoom và pan để hiển thị tất cả bàn
- Tính toán bounding box của tất cả bàn
- Thêm padding xung quanh
- Smooth animation khi fit

**Use cases:**
- Xem toàn bộ floor plan
- Reset view sau khi zoom quá sâu
- Quick navigation

### 2.4 Reset View (Đặt lại view)

**Chức năng:**
- Trở về vị trí origin (0, 0)
- Reset zoom về 100%
- Useful khi muốn bắt đầu lại từ góc canvas

### 2.5 Fullscreen Mode (Chế độ toàn màn hình)

**Phím tắt:** `F`

**Chức năng:**
- Mở rộng editor toàn màn hình
- Ẩn các UI elements không cần thiết
- Maximize working space
- Press `F` hoặc `Esc` để thoát

---

## 3. DRAG & DROP SYSTEM (Hệ thống kéo thả)

### 3.1 Table Dragging (Kéo bàn)

**Technology:** `@dnd-kit/core` library

**Features:**
- Smooth drag animation
- Real-time position update
- Visual feedback (bàn được nâng lên khi drag)
- Drag preview với opacity
- Collision detection trong lúc drag
- Grid snapping option

**Drag States:**
- **Normal:** Bàn ở vị trí gốc
- **Dragging:** Bàn đang được kéo (elevated shadow)
- **Drop Preview:** Hiển thị vị trí sẽ drop

**Alignment Guides:**
- Hiển thị alignment lines khi bàn gần khớp với bàn khác
- Snap to alignment với threshold 5px
- Support horizontal, vertical, center alignment

### 3.2 Collision Detection (Phát hiện va chạm)

**Algorithm:**
```typescript
- Sử dụng AABB (Axis-Aligned Bounding Box) collision
- Kiểm tra overlap giữa 2 rectangles
- Tính toán khoảng cách giữa các bàn
- Highlight bàn có va chạm màu đỏ
```

**Features:**
- Real-time collision checking
- Visual warning (red outline)
- Prevent invalid placements
- Performance optimized cho 100+ bàn

### 3.3 Grid Snapping (Dính lưới)

**Chức năng:**
- Tự động snap vị trí bàn đến grid points gần nhất
- Chỉ hoạt động khi grid được bật
- Có thể disable bằng `Shift + Drag`
- Snap threshold: 10px

**Algorithm:**
```typescript
snappedX = Math.round(x / gridSize) * gridSize;
snappedY = Math.round(y / gridSize) * gridSize;
```

---

## 4. TABLE MANIPULATION (Thao tác với bàn)

### 4.1 Table Selection (Chọn bàn)

**Single Select:**
- Click vào bàn
- Hiển thị blue outline
- Properties panel cập nhật thông tin bàn
- Resize handles xuất hiện

**Multi-Select (Đã lên kế hoạch):**
- `Shift + Click` để thêm/bỏ khỏi selection
- `Ctrl/Cmd + A` để chọn tất cả
- Selection box: Drag để vẽ khung chọn
- Selection count badge

### 4.2 Table Resizing (Thay đổi kích thước)

**Features:**
- 8 resize handles (4 góc + 4 cạnh)
- Maintain aspect ratio với `Shift` (planned)
- Visual feedback trong lúc resize
- Minimum size constraints (40x40px)
- Maximum size constraints (200x200px)

**Resize Modes:**
- Corner handles: Resize cả width và height
- Edge handles: Resize 1 dimension
- Smooth animation

### 4.3 Table Rotation (Xoay bàn) (Planned)

**Features:**
- Rotate handle xuất hiện trên bàn được chọn
- Drag rotate handle để xoay
- Snap to 15° increments
- Display rotation angle overlay
- Range: 0° - 360°

### 4.4 Table Properties (Thuộc tính bàn)

**Editable Properties:**
- Table Number
- Table Name
- Capacity (Min/Max)
- Floor
- Section
- Status
- Position (X, Y)
- Size (Width, Height)
- Rotation
- Shape (planned)
- Custom styles (planned)

---

## 5. LAYOUT MANAGEMENT (Quản lý layout)

### 5.1 Save Layout (Lưu layout)

**Phím tắt:** `Ctrl+S`

**Chức năng:**
- **Manual Save Only:** Thay đổi chỉ được lưu khi nhấn nút Save
- Không có auto-save
- Lưu vị trí và cấu hình tất cả bàn trên tầng hiện tại
- Unsaved changes indicator hiển thị khi có thay đổi chưa lưu
- Confirmation khi rời khỏi editor với unsaved changes

**Data Saved:**
```typescript
{
  layoutName: string;
  floor: number;
  tables: Array<{
    tableId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
  canvasSettings: {
    zoom: number;
    gridSize: number;
  };
  createdAt: Date;
  updatedBy: string;
}
```

**API Endpoint:**
- `POST /api/floor-plans/layouts`

### 5.2 Load Layout (Tải layout)

**Chức năng:**
- Hiển thị danh sách saved layouts
- Preview thumbnail (planned)
- Load layout đã lưu
- Restore vị trí và cấu hình bàn

**Features:**
- Filter by floor
- Sort by date/name
- Delete layouts
- Duplicate layouts

**API Endpoint:**
- `GET /api/floor-plans/layouts?floor={floor}`

### 5.3 Templates (Mẫu layout)

**Predefined Templates:**
1. **Restaurant Layout (8 bàn)**
   - 8 bàn 4 chỗ
   - Bố trí hình chữ nhật
   - Khoảng cách tối ưu

2. **Cafe Setup (12 bàn)**
   - Mix bàn 2 chỗ và 4 chỗ
   - Bố trí linh hoạt
   - Tối ưu cho không gian nhỏ

3. **Fine Dining (6 bàn)**
   - 6 bàn lớn (6-8 chỗ)
   - Khoảng cách rộng
   - Bố trí sang trọng

4. **Bar Layout (16 bàn)**
   - Mix nhiều loại bàn
   - Bar counter
   - Standing tables

5. **Banquet Hall (20 bàn)**
   - Bàn tròn lớn
   - Bố trí tiệc
   - Có sân khấu

**Features:**
- Instant apply
- Customizable sau khi apply
- Preview trước khi apply

---

## 6. HISTORY & UNDO/REDO (Lịch sử & hoàn tác)

### 6.1 Undo System (Hoàn tác)

**Phím tắt:** `Ctrl+Z` (Windows) / `Cmd+Z` (Mac)

**Supported Actions:**
- Table move
- Table resize
- Table rotate
- Table create
- Table delete
- Table property changes

**Implementation:**
```typescript
class ActionHistory {
  private history: Action[] = [];
  private currentIndex: number = -1;
  
  push(action: Action): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}
```

**Stack Limit:** 50 actions

### 6.2 Redo System (Làm lại)

**Phím tắt:** `Ctrl+Shift+Z` (Windows) / `Cmd+Shift+Z` (Mac)

**Features:**
- Redo actions đã undo
- Navigate forward trong history
- Visual feedback (button disabled state)

---

## 7. TABLE STATUS MANAGEMENT (Quản lý trạng thái bàn)

### 7.1 Status Types

**Available Statuses:**
1. **Available (Trống)** - Màu xanh lá
2. **Occupied (Có khách)** - Màu xanh dương
3. **Reserved (Đã đặt)** - Màu vàng
4. **Maintenance (Bảo trì)** - Màu xám

### 7.2 Status Indicators (Chỉ báo trạng thái)

**Visual Indicators:**
- Background color theo status
- Icon indicator
- Animated pulse cho reserved
- Grayscale cho maintenance

**Real-time Updates:**
- WebSocket connection
- Instant status change reflection
- Multi-client sync
- Conflict resolution

### 7.3 Quick Status Change

**Chức năng:**
- Right-click menu trên bàn
- Quick status toggle
- Keyboard shortcuts (planned)
- Bulk status change (planned)

---

## 8. KEYBOARD SHORTCUTS (Phím tắt)

### 8.1 Tool Selection
| Phím | Chức năng |
|------|-----------|
| `V` | Select Tool |
| `H` | Pan Tool |
| `T` | Add Table Tool |
| `Delete` | Delete selected table |

### 8.2 Actions
| Phím | Chức năng |
|------|-----------|
| `Ctrl+S` | Save floor plan |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `G` | Toggle grid |
| `F` | Toggle fullscreen |
| `Esc` | Cancel current tool |
| `0` | Reset zoom to 100% |

### 8.3 View Controls (Planned)
| Phím | Chức năng |
|------|-----------|
| `Ctrl + Scroll` | Zoom in/out |
| `Spacebar + Drag` | Temporary pan |
| `Ctrl+A` | Select all |
| `Ctrl+D` | Duplicate selected |

---

## 9. PROPERTIES PANEL (Panel thuộc tính)

### 9.1 Table Information

**Display Info:**
- Table Number
- Table Name
- Status (với color indicator)
- Capacity (Current guests / Max capacity)
- Floor
- Section
- Position (X, Y coordinates)
- Size (Width × Height)

### 9.2 Quick Actions

**Available Actions:**
- Edit Table Details
- Change Status
- View QR Code
- Delete Table
- Duplicate Table (planned)

### 9.3 Advanced Properties (Planned)

**Customization:**
- Shape selection (rectangle, circle, square, oval)
- Custom colors
- Border style
- Label size
- Icon selection

---

## 10. PERFORMANCE OPTIMIZATIONS (Tối ưu hiệu năng)

### 10.1 Rendering Strategy

**Hybrid Rendering:**
- **HTML5 Canvas:** Grid, background, guides
- **React DOM:** Table components (interaction)
- Reason: Canvas cho graphics, DOM cho interactivity

**Optimization Techniques:**
- Virtual scrolling cho large floor plans
- RequestAnimationFrame cho smooth animations
- Debouncing cho drag events
- Memoization cho component rendering

### 10.2 Data Management

**State Updates:**
- Optimistic UI updates
- Batch updates cho multiple changes
- Selective re-rendering
- Zustand store optimization

**WebSocket:**
- Event throttling
- Selective sync (only visible floor)
- Reconnection logic
- Offline support (planned)

---

## 11. ACCESSIBILITY (Khả năng truy cập)

### 11.1 Keyboard Navigation

**Features:**
- Full keyboard control
- Tab navigation
- Arrow keys để di chuyển bàn đã chọn
- Keyboard shortcuts cho tất cả actions
- Focus indicators rõ ràng

### 11.2 Visual Accessibility

**Features:**
- High contrast mode support
- Colorblind-friendly color scheme
- Adequate font sizes
- Clear focus indicators
- Scalable UI elements

---

## 12. MOBILE RESPONSIVENESS (Tương thích di động)

### 12.1 Touch Support (Planned)

**Gestures:**
- Pinch to zoom
- Two-finger pan
- Long press context menu
- Tap to select
- Double tap to edit

### 12.2 Responsive Layout

**Breakpoints:**
- Desktop: > 1024px (full features)
- Tablet: 768px - 1024px (optimized toolbar)
- Mobile: < 768px (simplified view)

**Mobile Adaptations:**
- Collapsible toolbar
- Bottom sheet properties panel
- Simplified grid
- Touch-optimized hit areas

---

## 13. ADVANCED FEATURES (Tính năng nâng cao - Planned)

### 13.1 Duplicate Tool

**Phím tắt:** `Ctrl+D`

**Features:**
- Duplicate selected table(s)
- Auto-increment table number
- Place with offset (50px right, 50px down)
- Copy all properties
- Undo support

### 13.2 Multi-Select Operations

**Selection Methods:**
- `Shift + Click` để add/remove
- `Ctrl+A` select all
- Drag selection box
- Select by section

**Bulk Operations:**
- Bulk move (drag any → all move)
- Bulk delete
- Bulk status change
- Bulk property update

### 13.3 Alignment & Distribution Tools

**Alignment Options:**
1. Align Left
2. Align Right
3. Align Top
4. Align Bottom
5. Align Center Horizontal
6. Align Center Vertical

**Distribution Options:**
1. Distribute Horizontally
2. Distribute Vertically

**Size Matching:**
1. Match Width
2. Match Height
3. Match Size

**UI:**
- Alignment toolbar khi 2+ bàn được chọn
- Visual preview trước khi apply
- Undo/redo support

### 13.4 Zoom to Selection

**Phím tắt:** `F`

**Features:**
- Focus on selected table(s)
- Optimal zoom calculation
- Smooth animation (500ms)
- Double-click table để zoom và center

**Use Cases:**
- Quick navigation trong floor plan lớn
- Focus khi editing
- Presentation mode

### 13.5 Ruler & Measurement Tools

**Phím tắt:** `R`

**Features:**
- Horizontal ruler (top edge)
- Vertical ruler (left edge)
- Show in pixels or real-world units
- Measurement overlay during drag/resize

**Coordinate Display:**
- X, Y position while dragging
- Width × Height while resizing
- Rotation angle while rotating
- Distance between tables

### 13.6 Lock/Unlock Tables

**Phím tắt:** `Ctrl+L`

**Features:**
- Lock selected table(s)
- Locked tables: Cannot move, resize, rotate, delete
- Padlock icon overlay
- Unlock với single click
- Bulk lock/unlock

**Visual Feedback:**
- Padlock icon
- Not-allowed cursor
- Reduced opacity (85%)
- Cannot drag

**Use Cases:**
- Protect fixed structures (pillars, walls)
- Lock completed sections
- Prevent accidental changes

---

## 14. DATA PERSISTENCE (Lưu trữ dữ liệu)

### 14.1 Manual Save

**Features:**
- **Save Button:** Người dùng phải nhấn nút Save để lưu
- **Unsaved Indicator:** Hiển thị dấu (*) khi có thay đổi chưa lưu
- **Warning on Exit:** Cảnh báo khi rời editor với unsaved changes
- **Keyboard Shortcut:** `Ctrl+S` để save nhanh
- **Visual Feedback:** Loading state khi đang lưu
- **Error Handling:** Hiển thị lỗi nếu save thất bại

### 14.2 Database Schema

**table_positions Table:**
```sql
CREATE TABLE table_positions (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES restaurant_tables(table_id),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER DEFAULT 80,
  height INTEGER DEFAULT 80,
  rotation INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**floor_plan_layouts Table:**
```sql
CREATE TABLE floor_plan_layouts (
  layout_id SERIAL PRIMARY KEY,
  layout_name VARCHAR(100) NOT NULL,
  floor INTEGER NOT NULL,
  layout_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(user_id)
);
```

### 14.3 API Endpoints

**Table Positions:**
- `GET /api/tables/:id/position` - Get table position
- `PUT /api/tables/:id/position` - Update position
- `POST /api/tables/batch-position` - Batch update

**Floor Plan Layouts:**
- `GET /api/floor-plans/layouts` - List layouts
- `POST /api/floor-plans/layouts` - Save layout
- `GET /api/floor-plans/layouts/:id` - Get layout
- `DELETE /api/floor-plans/layouts/:id` - Delete layout

---

## 15. ERROR HANDLING (Xử lý lỗi)

### 15.1 Validation Errors

**Common Validations:**
- Table number uniqueness
- Capacity range (1-20)
- Position bounds checking
- Collision detection
- Floor/section validation

**Error Display:**
- Toast notifications
- Inline form errors
- Dialog confirmations
- Rollback on failure

### 15.2 Network Errors

**Handling:**
- Retry logic (3 attempts)
- Offline detection
- Queue operations
- User notifications
- Graceful degradation

### 15.3 Conflict Resolution

**Scenarios:**
- Concurrent edits by multiple users
- Version conflicts
- Status change conflicts

**Resolution:**
- Last-write-wins strategy
- Conflict dialog
- Manual merge option
- WebSocket sync

---

## 16. SECURITY & PERMISSIONS (Bảo mật & Quyền)

### 16.1 Role-based Access

**Roles:**
- **Admin:** Full access (CRUD, layouts, templates)
- **Manager:** Edit, save layouts
- **Staff:** View only, status changes
- **Guest:** View only

### 16.2 Operation Permissions

**Permission Matrix:**
| Operation | Admin | Manager | Staff | Guest |
|-----------|-------|---------|-------|-------|
| Create Table | ✅ | ✅ | ❌ | ❌ |
| Edit Table | ✅ | ✅ | ❌ | ❌ |
| Delete Table | ✅ | ✅ | ❌ | ❌ |
| Move Table | ✅ | ✅ | ❌ | ❌ |
| Change Status | ✅ | ✅ | ✅ | ❌ |
| Save Layout | ✅ | ✅ | ❌ | ❌ |
| View Floor Plan | ✅ | ✅ | ✅ | ✅ |

---

## 17. BROWSER SUPPORT (Hỗ trợ trình duyệt)

### 18.1 Supported Browsers

**Desktop:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Mobile:**
- iOS Safari 14+ ✅
- Chrome Mobile 90+ ✅
- Samsung Internet 14+ ✅

### 18.2 Required Features

**Browser APIs:**
- HTML5 Canvas
- WebSocket
- LocalStorage
- CSS Grid/Flexbox
- ES6+ JavaScript

---

## 19. FUTURE ENHANCEMENTS (Cải tiến tương lai)

### 19.1 Collaboration Features
- Real-time multi-user editing
- User cursors và selection
- Comments và annotations
- Change history với author
- Conflict resolution UI

### 19.2 Advanced Layout Tools
- Section management (define sections on canvas)
- Background image upload
- Layer system (decorations, labels)
- Custom shapes và icons
- 3D visualization

### 19.3 Analytics & Insights
- Heatmap của usage patterns
- Optimal layout suggestions
- Traffic flow analysis
- Capacity utilization reports

### 19.4 Import/Export
- Export to PDF/PNG
- Import from CAD files
- Share layouts via link
- Template marketplace

### 19.5 AI Features
- Auto-layout optimization
- Smart table placement suggestions
- Capacity recommendations
- Traffic flow optimization

---

## 20. DOCUMENTATION & SUPPORT (Tài liệu & Hỗ trợ)

### 20.1 User Guide
- Interactive tutorial
- Video walkthroughs
- Keyboard shortcuts reference
- Best practices guide
- FAQ section

### 20.2 Developer Documentation
- Component API reference
- State management guide
- WebSocket event schema
- Deployment guide
- Troubleshooting guide

### 20.3 Support Channels
- In-app help button
- Context-sensitive tooltips
- Email support
- Community forum
- Bug reporting

---

## SUMMARY (Tóm tắt)

Visual Floor Plan Editor là một công cụ toàn diện với:

✅ **Dedicated Editor Mode:** Full canvas, không có header/filters, tập trung 100% vào editing
✅ **Floor-based Management:** Chọn tầng để xem/chỉnh sửa, mỗi tầng có layout riêng
✅ **Manual Save:** Thay đổi chỉ lưu khi nhấn Save button, có unsaved changes warning
✅ **9 Core Tools:** Select, Pan, Add, Delete, Zoom In/Out, Grid, Undo, Redo, Save
✅ **Advanced Drag & Drop:** Collision detection, grid snapping, alignment guides
✅ **Layout Management:** Save/load layouts per floor, templates
✅ **Full Keyboard Support:** 15+ shortcuts
✅ **High Performance:** Optimized cho 100+ bàn

**10 Planned Features:**
1. Duplicate Tool
2. Multi-Select & Bulk Operations
3. Alignment & Distribution Tools
4. Zoom to Selection
5. Ruler & Measurements
6. Lock/Unlock Tables
7. 3D Visualization
8. AI-powered Layout Optimization
9. CAD Import/Export
10. Real-time Collaboration UI

---
