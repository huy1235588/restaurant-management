# Thiết Kế Giao Diện Quản Lý Bàn / Table Management UI Design

## Tổng Quan (Overview)

Tài liệu thiết kế giao diện người dùng toàn diện cho tính năng quản lý bàn trong hệ thống quản lý nhà hàng. Tài liệu này cung cấp các mockup ASCII, mô tả tương tác, và hướng dẫn triển khai cho tất cả các màn hình liên quan đến quản lý bàn.

This comprehensive UI design documentation provides detailed mockups, interaction patterns, and implementation guidelines for the table management feature in the restaurant management system.

## Mục Đích (Purpose)

- **Cung cấp tham chiếu trực quan** cho developers khi triển khai tính năng quản lý bàn
- **Đảm bảo tính nhất quán** trong UI/UX patterns across table-related features
- **Hỗ trợ communication** giữa designers, developers, và stakeholders
- **Tài liệu hóa** quyết định thiết kế và trade-offs
- **Enable faster onboarding** cho team members mới

## Phạm Vi (Scope)

### Bao Gồm (Includes)
- ✅ Floor plan view (sơ đồ bàn)
- ✅ Table list view (danh sách bàn)
- ✅ Table creation/editing forms
- ✅ Status management interfaces
- ✅ Table assignment workflows
- ✅ Real-time updates and notifications
- ✅ Responsive design patterns
- ✅ Accessibility guidelines
- ✅ Interaction flows and state diagrams

### Không Bao Gồm (Out of Scope)
- ❌ Backend API specifications (covered in separate docs)
- ❌ Database schema design (see `docs/DATABASE.md`)
- ❌ Business logic implementation details
- ❌ Reservation management UI (separate feature)
- ❌ Order management UI (separate feature)

## Cấu Trúc Tài Liệu (Document Structure)

Tài liệu được chia thành các phần modular để dễ dàng điều hướng và maintain:

### 📊 [01. Giao Diện Bản Đồ Bàn](./table-management/01-table-floor-plan.md)
**Floor Plan View / Table Layout Visualization**

Giao diện trực quan hóa không gian nhà hàng với các bàn được hiển thị theo vị trí thực tế.

**Nội dung chính:**
- Layout chính với canvas view
- Table card components và states
- Zoom, pan, và floor selection controls
- Drag & drop functionality cho sắp xếp bàn
- Real-time status updates và animations
- Search và filter functionality
- Grid view và compact view alternatives
- Keyboard shortcuts và accessibility
- Touch gestures cho mobile/tablet

**Phù hợp cho:** Quick visual overview, spatial management, real-time monitoring

---

### 📝 [02. Giao Diện Danh Sách Bàn](./table-management/02-table-list-view.md)
**Table List View / Data Grid Management**

Giao diện quản lý chi tiết thông tin bàn dưới dạng bảng dữ liệu.

**Nội dung chính:**
- Data grid với sortable columns
- Search và advanced filtering
- Bulk selection và bulk actions
- Pagination controls
- Column customization
- Quick view panel
- Export/import functionality
- Row actions và context menu
- Empty states

**Phù hợp cho:** Detailed data management, bulk operations, searching/filtering

---

### ➕ [03. Giao Diện Form Bàn](./table-management/03-table-form.md)
**Table Creation/Editing Forms**

Form để tạo mới và chỉnh sửa thông tin bàn với validation đầy đủ.

**Nội dung chính:**
- Create new table dialog
- Edit existing table dialog
- Field-by-field specifications
- Validation rules và error states
- QR code generation interface
- Position và size configuration
- Advanced settings
- Multi-step wizard alternative
- Bulk create tables
- Success/error handling
- Mobile-optimized form layout

**Phù hợp cho:** Adding/modifying table information, initial setup

---

### 🔄 [04. Quản Lý Trạng Thái Bàn](./table-management/04-table-status.md)
**Table Status Management**

Quản lý và thay đổi trạng thái bàn với validation và history tracking.

**Nội dung chính:**
- 4 trạng thái chính: Trống, Đang Dùng, Đã Đặt, Bảo Trì
- Quick status toggle
- Detailed status change dialogs
- Status transition rules
- Invalid transition warnings
- Status history timeline
- Status info panel
- Bulk status changes
- Auto status management và scheduled changes
- Status notifications
- Status filter dashboard

**Phù hợp cho:** Real-time table status management, workflow control

---

### 🎯 [05. Gán Bàn và Phân Công](./table-management/05-table-assignment.md)
**Table Assignment Workflows**

Quy trình gán bàn cho reservations, orders, và staff với conflict detection.

**Nội dung chính:**
- Assign table to reservation
- Assign table to order
- Assign staff to table
- Auto-suggestion engine
- Conflict detection và warnings
- Table transfer workflow
- Bulk assignment
- Assignment history
- Optimization algorithms

**Phù hợp cho:** Reservation management, staff coordination, optimal seating

---

### ⚡ [06. Cập Nhật Thời Gian Thực](./table-management/06-realtime-updates.md)
**Real-time Updates and Notifications**

WebSocket-based real-time synchronization và collaborative features.

**Nội dung chính:**
- Connection status indicators
- Live status change animations
- Collaborative editing indicators
- Lock mechanisms
- Toast notifications
- Optimistic UI updates
- Conflict resolution
- WebSocket event specifications
- Reconnection logic
- Performance optimization

**Phù hợp cho:** Multi-user environments, live monitoring, instant updates

---

### 📱 [07. Responsive và Accessibility](./table-management/07-responsive-accessibility.md)
**Responsive Design & Accessibility Guidelines**

Hướng dẫn thiết kế responsive và accessibility cho mọi thiết bị và người dùng.

**Nội dung chính:**
- Responsive breakpoints (Desktop, Tablet, Mobile)
- Layout adaptations per screen size
- Touch gestures
- ARIA labels và semantic HTML
- Keyboard navigation
- Screen reader support
- Color contrast và color-blind friendly
- Focus indicators
- Dark mode support
- Testing checklist

**Phù hợp cho:** Cross-device compatibility, inclusive design

---

### 🔀 [08. Interaction Flows và State Diagrams](./table-management/08-interaction-flows.md)
**Interaction Flows & State Transitions**

Mô tả chi tiết các luồng tương tác và state machine cho table management.

**Nội dung chính:**
- Main user workflows (create, edit, delete, status change)
- Table status state machine
- UI state flow diagrams
- Error handling patterns
- Loading và empty states
- Animation sequences
- User decision trees
- Edge case handling

**Phù hợp cho:** Developer implementation reference, QA testing scenarios

---

## 🧩 Layout Templates & Presets

Visual Floor Plan hiện có thư viện template giúp dựng sơ đồ tầng nhanh chóng. Nút **Use Template** nằm trên thanh công cụ của tab Visual Floor Plan và hiển thị 4 preset kèm mô tả.

| Template | Mô tả | Đề xuất sử dụng |
|----------|-------|-----------------|
| Fine Dining | Lưới đối xứng, bàn vuông, spacing rộng | Nhà hàng cao cấp, tasting menu |
| Casual Dining | Bố cục so le, mix bàn tròn/oval/rectangle | Bistro, cafe, brunch |
| Bar / Lounge | Bàn cao sát tường + pod trung tâm | Quầy bar, lounge, cocktail bar |
| Banquet | Bàn dài song song | Tiệc cưới, hội nghị, sự kiện |

### Luồng tương tác
1. Mở Visual Floor Plan → chọn **Use Template**.
2. Chọn preset và nhấn *Apply Template*.
3. Canvas cập nhật ngay lập tức (không auto-save) và badge *Unsaved changes* bật lên.
4. Người dùng tùy chỉnh (drag, resize, rotate) trước khi nhấn **Save Layout**.

### Hành vi & ràng buộc
- Template áp dụng theo từng tầng; tầng khác giữ nguyên.
- Nếu tầng chưa có bàn, hệ thống nhắc tạo bàn trước.
- Undo/Redo track mọi thao tác sau khi áp template.
- Lưu layout ghi thêm width/height/rotation/shape để khi load lại giữ nguyên tỉ lệ.

## Nguyên Tắc Thiết Kế (Design Principles)

### 1. **Clarity First (Rõ Ràng Trước Tiên)**
- Thông tin quan trọng nhất (số bàn, trạng thái, sức chứa) luôn hiển thị rõ ràng
- Visual hierarchy rõ ràng với typography và spacing hợp lý
- Không clutter, chỉ hiển thị thông tin cần thiết trong từng context

### 2. **Real-time Updates (Cập Nhật Thời Gian Thực)**
- Trạng thái bàn được cập nhật ngay lập tức across all clients
- Visual feedback cho mọi thay đổi
- Optimistic UI updates với graceful error handling

### 3. **Flexibility (Linh Hoạt)**
- Multiple view modes (floor plan, list, grid) cho different use cases
- Customizable filters, columns, và saved views
- Support cả touch và mouse interactions

### 4. **Efficiency (Hiệu Quả)**
- Keyboard shortcuts cho power users
- Bulk operations cho repetitive tasks
- Quick actions và context menus
- Auto-suggestions để giảm manual work

### 5. **Accessibility (Khả Năng Tiếp Cận)**
- WCAG 2.1 AA compliant
- Keyboard-navigable
- Screen reader friendly
- Color-blind safe với patterns và labels

### 6. **Mobile-First (Mobile Trước)**
- Core functionality available trên mobile
- Touch-optimized controls
- Responsive layouts không mất features quan trọng

## Công Nghệ và Stack

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI / shadcn/ui
- **State Management**: Zustand
- **Server State**: React Query / SWR
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: dnd-kit
- **Canvas**: HTML5 Canvas hoặc SVG

### Design Tokens
```typescript
// Colors
const statusColors = {
  available: '#10b981', // green-500
  occupied: '#ef4444',  // red-500
  reserved: '#f59e0b',  // amber-500
  maintenance: '#3b82f6' // blue-500
};

// Spacing
const spacing = {
  tableCard: {
    padding: '12px',
    gap: '8px'
  }
};
```

## Quy Ước ASCII Diagrams

### Box Drawing Characters
```
Single line:  ┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼
Double line:  ┏ ━ ┓ ┃ ┗ ┛ ┣ ┫ ┳ ┻ ╋
Curved:       ╭ ─ ╮ │ ╰ ╯
Bold box:     ╔ ═ ╗ ║ ╚ ╝
Shaded:       ▓ ░ ▒ ▓
```

### Icons (Emoji)
```
Statuses:     🟢 🔴 🟡 🔵
Actions:      ➕ ✏️ 🗑️ 👁️ 🔄 📝
UI Elements:  ▼ ⬍ ⬆ ⬇ ☐ ☑ ⦿ ○
People:       👤 👥 👨‍🍳
Time:         🕐 ⏱️ ⏰
Money:        💰 💳
Objects:      🍽️ 📋 🔍 ⚙️ 🔒
Symbols:      ✓ ✗ ⚠️ ℹ️ ⚡
```

### Layout Convention
```
┌─────────────────────────────────┐
│ Header (Title, Actions)         │  ← Top bar
├─────────────────────────────────┤
│ Main Content Area               │  ← Body
│                                  │
│                                  │
└─────────────────────────────────┘
```

## Tham Chiếu Liên Quan (Related Documentation)

### Internal References
- **Database Schema**: [`docs/DATABASE.md`](../DATABASE.md) - Section 3.3 (restaurant_tables)
- **Business Use Cases**: [`docs/use_case/RESERVATION_MANAGEMENT.md`](../use_case/RESERVATION_MANAGEMENT.md)
- **API Documentation**: `docs/API.md` (if exists)
- **Component Library**: `app/client/src/components/`

### Similar Patterns
- **Food Import Management UI**: [`docs/design/FOOD_IMPORT_MANAGEMENT.md`](./FOOD_IMPORT_MANAGEMENT.md)
  - Successful reference for form design và import workflows

### External References
- **Next.js 16 Docs**: https://nextjs.org/docs
- **React 19 Docs**: https://react.dev
- **Socket.io Docs**: https://socket.io/docs/
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

## Lộ Trình Triển Khai (Implementation Roadmap)

### Phase 1: Core Features (MVP)
**Timeline**: Sprint 1-2

- [ ] Table list view với basic CRUD
- [ ] Simple floor plan view (static layout)
- [ ] Basic status management (4 states)
- [ ] Form validation
- [ ] Responsive mobile layout

**Deliverables**: Functional table management với essential features

---

### Phase 2: Advanced Features
**Timeline**: Sprint 3-4

- [ ] Real-time updates via WebSocket
- [ ] Drag & drop table positioning
- [ ] Advanced filters và saved views
- [ ] Bulk operations
- [ ] Export/import functionality
- [ ] QR code generation

**Deliverables**: Enhanced UX với real-time collaboration

---

### Phase 3: Optimization & Polish
**Timeline**: Sprint 5-6

- [ ] Performance optimization (virtual scrolling, caching)
- [ ] Animation polish
- [ ] Accessibility audit và fixes
- [ ] Dark mode support
- [ ] Comprehensive keyboard shortcuts
- [ ] Auto-suggestion algorithms

**Deliverables**: Production-ready với optimal performance

---

### Phase 4: Analytics & Intelligence
**Timeline**: Sprint 7+

- [ ] Status dashboard với analytics
- [ ] AI-powered table assignment suggestions
- [ ] Predictive maintenance alerts
- [ ] Usage pattern insights
- [ ] Optimization recommendations

**Deliverables**: Smart features với data-driven insights

---

## Testing Strategy

### Unit Testing
- Component isolation tests
- Form validation logic
- State management logic
- Utility functions

### Integration Testing
- API integration
- WebSocket connection
- Multi-component workflows
- Real-time synchronization

### E2E Testing
- Complete user journeys
- Cross-browser testing
- Mobile device testing
- Accessibility testing

### Performance Testing
- Large dataset handling (100+ tables)
- Concurrent user simulation
- WebSocket load testing
- Memory leak detection

## FAQs (Frequently Asked Questions)

### Q1: Tại sao sử dụng ASCII diagrams thay vì hình ảnh?
**A**: ASCII diagrams có nhiều lợi ích:
- ✅ Version control friendly (text-based diffs)
- ✅ Không cần design tools
- ✅ Dễ edit và iterate nhanh
- ✅ Không bị lỗi broken image links
- ✅ Lightweight và load nhanh
- ✅ Copy/paste vào code comments dễ dàng

### Q2: Có cần implement tất cả features ngay từ đầu không?
**A**: Không. Follow phased approach:
1. Start với MVP (Phase 1)
2. Gather user feedback
3. Iterate và add advanced features (Phase 2-4)
4. Prioritize based on actual usage patterns

### Q3: Làm sao handle conflict khi nhiều users edit cùng lúc?
**A**: Sử dụng optimistic locking:
- Show lock indicator when table being edited
- Broadcast editing state via WebSocket
- Prevent simultaneous edits
- Show notifications for concurrent changes
- Last-write-wins với conflict resolution UI

### Q4: Mobile app có cần tất cả features giống desktop không?
**A**: Core features cần có trên mobile:
- ✅ View table status
- ✅ Change table status
- ✅ Quick assign
- ✅ Search/filter
- ⚠️ Drag & drop (optional, có thể thay bằng form-based positioning)
- ⚠️ Bulk operations (có thể simplified)

### Q5: Làm sao optimize performance cho large datasets (500+ tables)?
**A**: Multiple strategies:
- Virtual scrolling cho list view
- Canvas rendering cho floor plan
- Pagination
- Lazy loading
- Memoization
- WebSocket subscription scoping (chỉ subscribe tầng đang xem)

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-05 | Initial | Created comprehensive UI design documentation |

## Contributors

- **Design Lead**: [Team/Individual Name]
- **Technical Lead**: [Team/Individual Name]
- **Contributors**: [Team Members]

## Feedback và Đóng Góp

Mọi feedback và đề xuất improvement xin gửi về:
- **Issue Tracker**: [GitHub Issues Link]
- **Discussion**: [Discussion Forum Link]
- **Email**: [Team Email]

---

## License

This documentation is part of the restaurant management system project and follows the same license as the main codebase.

---

**Last Updated**: 2025-01-05  
**Status**: ✅ Complete  
**Review Status**: ⏳ Pending Stakeholder Review
