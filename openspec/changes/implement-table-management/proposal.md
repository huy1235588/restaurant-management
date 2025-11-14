# Proposal: Implement Table Management

## Overview

Implement comprehensive table management functionality for the restaurant management system. This includes creating the frontend UI for table visualization, CRUD operations, real-time status updates, and advanced features like floor plan view, QR code management, and drag-and-drop positioning.

## Why

Restaurant staff need a complete table management system to efficiently manage their dining space, track table availability in real-time, and optimize table assignments. Currently, the backend infrastructure exists but there is no user interface, preventing staff from:

- Visualizing the restaurant layout and table positions
- Monitoring table status (available, occupied, reserved, maintenance) in real-time
- Managing table configurations and capacity planning
- Creating and customizing floor plan layouts for different service periods
- Generating QR codes for contactless ordering and table identification

Without this functionality, restaurants cannot effectively use the system for day-to-day operations, resulting in manual tracking, inefficient table turnover, and poor customer experience. This implementation bridges the gap between the existing backend capabilities and practical usability for restaurant operations.

The addition of the Visual Floor Plan view (third tab) provides restaurant managers with advanced layout customization capabilities, allowing them to create accurate representations of their physical space, save different configurations for various events (weekday, weekend, private events), and optimize table placement for maximum efficiency.

## Problem Statement

Currently, the system has:
- ✅ Database schema for `restaurant_tables` with full field definitions
- ✅ Backend API endpoints for table CRUD operations
- ✅ Frontend service layer (`table.service.ts`) for API integration
- ✅ Comprehensive UI design documentation

However, the frontend UI implementation is **missing**:
- ❌ No `/tables` page exists in the client application
- ❌ No table floor plan visualization
- ❌ No table list/grid management interface
- ❌ No table creation/editing forms
- ❌ No real-time status updates via WebSocket
- ❌ No QR code generation/management
- ❌ No drag-and-drop table positioning

This prevents restaurant staff from:
- Visualizing restaurant layout and table positions
- Managing table configurations (capacity, floor, section)
- Monitoring real-time table status (available, occupied, reserved, maintenance)
- Assigning tables to reservations and orders
- Generating QR codes for contactless ordering

## Proposed Solution

Build a complete table management feature with four main interfaces:

### 1. Floor Plan View (Primary Interface)
- Visual 2D canvas showing restaurant layout
- Table cards with status indicators (🟢 available, 🔴 occupied, 🟡 reserved, 🔵 maintenance)
- Drag-and-drop repositioning (future enhancement)
- Floor/section filtering
- Manual save changes via Save button
- Quick actions (change status, view details, assign order)

### 2. Visual Floor Plan (Enhanced Interactive View)
- Advanced 3D-like visualization or enhanced 2D canvas
- Interactive table arrangement with visual editor
- Custom table shapes and sizes (rectangle, circle, square)
- Grid snapping and alignment tools
- Visual indicators for table relationships (combined tables, sections)
- Enhanced drag-and-drop with rotation and resizing
- Save and load multiple floor plan layouts (via Save button)
- Print-friendly floor plan export

### 3. List View (Data Management)
- Sortable/filterable data grid
- Bulk operations (status changes, deletion)
- Advanced search and filtering
- Pagination
- Quick edit inline
- Export functionality

### 4. Table Forms
- Create new table dialog with validation
- Edit table details (number, capacity, floor, section)
- QR code generation
- Status management with transition rules
- Bulk table creation wizard

## Goals

1. **Enable table visualization**: Provide clear overview of restaurant layout and table status
2. **Streamline table operations**: Quick CRUD operations with validation
3. **Manual save workflow**: Explicit save actions for better control and data consistency
4. **Improve efficiency**: Reduce time staff spend managing table configurations
5. **Support scalability**: Handle restaurants with 50-200+ tables across multiple floors
6. **Multi-floor management**: Allow restaurants to manage separate floor plans for different floors (e.g., Floor 1, Floor 2, Rooftop)

## Non-Goals

- Physical table positioning/coordinates storage (Phase 2)
- 3D restaurant visualization (not required)
- Table combination/splitting (separate feature)
- Advanced analytics/reporting (separate feature)
- Mobile app implementation (web-responsive only)

## Success Metrics

- Staff can create/edit tables in < 30 seconds
- Layout changes save successfully within 2 seconds
- Support managing 50-200+ tables across multiple floors
- Zero data loss during save operations
- Intuitive floor switching with clear visual indicators

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unsaved changes lost on navigation | Medium | Show warning dialog before leaving with unsaved changes |
| Performance with 200+ tables | Medium | Implement virtual scrolling and pagination |
| QR code generation load | Low | Generate codes asynchronously, cache results |
| Drag-and-drop complexity | Medium | Use proven libraries (dnd-kit) and implement incrementally |
| Multi-floor data synchronization | Medium | Use floor-scoped queries and clear floor indicators |

## Dependencies

- Existing backend API (`/tables` endpoints)
- Radix UI components (Dialog, Dropdown, etc.)
- Zustand for state management
- React Hook Form + Zod for validation
- **dnd-kit** library for Visual Floor Plan drag-and-drop
- HTML5 Canvas API for grid rendering

## Timeline Estimate

- **Phase 1** (Core Features): 2-3 weeks
  - List view with CRUD operations
  - Basic floor plan view
  - Status management
  - Multi-floor support
  
- **Phase 2** (Enhanced Features): 1-2 weeks
  - Basic drag-and-drop positioning
  - QR code generation
  - Bulk operations
  - Advanced filtering

- **Phase 3** (Visual Floor Plan): 1-2 weeks
  - Advanced visual editor with drag, resize, rotate
  - Custom table shapes (no color customization)
  - Layout templates and save/load (button-based)
  - Grid system and alignment guides
  - Undo/redo functionality
  - Database migrations and API endpoints

**Total**: 4-7 weeks

## Alternatives Considered

1. **Third-party table management library**
   - Rejected: No library fits restaurant-specific requirements
   
2. **Grid-only view without floor plan**
   - Rejected: Visual layout is critical for staff workflow
   
3. **Server-side rendering for real-time updates**
   - Rejected: WebSocket provides better performance and UX

## Open Questions

1. ~~Should we store physical X/Y coordinates for tables in the database?~~
   - **Decision**: Yes, added in Phase 3 for Visual Floor Plan feature
   
2. What should be the default table capacity range?
   - **Proposed**: Min 1, Max 20 (configurable per table)
   
3. Should QR codes be auto-generated on table creation?
   - **Proposed**: Auto-generate but allow manual override

4. How to handle table assignment conflicts?
   - **Proposed**: Implement locking mechanism with timeout

5. Should Visual Floor Plan support real-time collaborative editing?
   - **Decision**: No, changes are saved manually via Save button for better control

6. How should multi-floor management work?
   - **Decision**: Each floor has independent floor plan layout. Floor selector allows switching between floors with clear visual indicators

## What's New in This Update

This proposal has been updated to include a **third view mode: Visual Floor Plan**, which provides an advanced interactive floor plan editor beyond the basic Floor Plan view.

### New Features Added:

1. **Visual Floor Plan View** (TV-007 updated)
   - Third tab option alongside Floor Plan and List view
   - Advanced drag-and-drop with resize and rotate capabilities
   - Custom table shapes (Rectangle, Circle, Square, Oval)
   - Grid system with snapping and alignment guides
   - Manual save via Save button (no WebSocket auto-sync)

2. **New Requirements** (TV-008 through TV-014):
   - **TV-008**: Visual Floor Plan Editor with drag, resize, rotate
   - **TV-009**: Custom table shapes (simplified, no color customization)
   - **TV-011**: Layout templates and save/load functionality (button-based)
   - **TV-012**: Grid system with snapping
   - **TV-013**: Undo/redo and action history
   - **TV-014**: Comprehensive editor toolbar

3. **Database Schema Enhancements**:
   - Added fields to `RestaurantTable`: positionX, positionY, rotation, shape, width, height
   - New table: `FloorPlanLayout` for saving multiple layouts

4. **New Dependencies**:
   - `dnd-kit` library for advanced drag-and-drop
   - HTML5 Canvas API for grid rendering

5. **Multi-Floor Support**:
   - Restaurants can manage multiple floors (e.g., Tầng 1, Tầng 2, Sân thượng)
   - Each floor has independent floor plan layouts
   - Clear floor selector with visual indicators

6. **Implementation Tasks** (Phase 3):
   - Streamlined tasks covering Visual Floor Plan implementation
   - Estimated 1-2 weeks development time
   - Testing requirements integrated into development, not separate phase
   - Total project timeline: 4-7 weeks

## Approval

- [ ] Product Owner
- [ ] Tech Lead
- [ ] UI/UX Designer
- [ ] Backend Engineer (for WebSocket events)

## Related Documents

- [DATABASE.md](../../../docs/DATABASE.md#33-table-management) - Database schema
- [TABLE_MANAGEMENT_UI_DESIGN.md](../../../docs/design/TABLE_MANAGEMENT_UI_DESIGN.md) - UI mockups
- [BUSINESS_USE_CASES.md](../../../docs/BUSINESS_USE_CASES.md) - Business requirements
