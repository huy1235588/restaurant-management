# Tables Module

Complete table management system including list views, visual floor plan editor, and comprehensive dialogs for table operations.

## 📁 Directory Structure

```
tables/
├── components/           # Reusable UI components
│   ├── index.ts
│   ├── TableHeader.tsx          # Header with view switcher & actions
│   ├── TableFilters.tsx         # Search & filter controls
│   ├── TableStats.tsx           # Statistics cards
│   ├── TableStatusBadge.tsx     # Status badge component
│   ├── TablePagination.tsx      # Pagination controls
│   ├── QuickViewPanel.tsx       # Side panel for quick view
│   └── visual-editor/           # Visual floor plan editor components
│       ├── index.ts
│       ├── VisualEditorPage.tsx        # Main editor page
│       ├── EditorCanvas.tsx            # Canvas for drag-and-drop
│       ├── EditorToolbar.tsx           # Editor toolbar with tools
│       ├── TableComponent.tsx          # Draggable table component
│       ├── PropertiesPanel.tsx         # Table properties editor
│       ├── FloorSelector.tsx           # Floor selection dropdown
│       ├── SaveLayoutDialog.tsx        # Save layout dialog
│       ├── LoadLayoutDialog.tsx        # Load layout dialog
│       ├── QuickCreateTableDialog.tsx  # Quick table creation
│       ├── UnsavedChangesDialog.tsx    # Unsaved changes warning
│       ├── VisualEditorDeleteTableDialog.tsx
│       └── VisualEditorKeyboardShortcutsDialog.tsx
│
├── views/               # Main view components
│   ├── index.ts
│   ├── TableListView.tsx        # List/table view with sorting
│   └── VisualFloorPlanView.tsx  # Visual floor plan editor view
│
├── dialogs/             # All dialog components
│   ├── index.ts
│   │
│   ├── bulk/           # Bulk operation dialogs
│   │   ├── index.ts
│   │   ├── BulkStatusChangeDialog.tsx
│   │   ├── BulkDeleteDialog.tsx
│   │   ├── BulkExportDialog.tsx
│   │   ├── BulkActivateDeactivateDialog.tsx
│   │   └── BulkQRCodeGenerator.tsx
│   │
│   └── single/         # Single table operation dialogs
│       ├── index.ts
│       ├── CreateTableDialog.tsx
│       ├── EditTableDialog.tsx
│       ├── DeleteTableDialog.tsx
│       ├── StatusChangeDialog.tsx
│       ├── QRCodeDialog.tsx
│       ├── TableHistoryDialog.tsx
│       └── KeyboardShortcutsDialog.tsx
│
├── stores/              # State management for visual editor
│   ├── index.ts
│   ├── editorStore.ts           # Editor tool state
│   ├── layoutStore.ts           # Layout and table positions
│   └── historyStore.ts          # Undo/redo history
│
├── hooks/               # Custom hooks
│   ├── index.ts
│   └── useFloorPlanData.ts      # Floor plan data fetching
│
├── types/               # TypeScript types
│   └── index.ts                 # Visual editor types (TablePosition, Tool, etc.)
│
├── utils/               # Utility functions
│   └── geometry.ts              # Collision detection, grid snapping
│
├── index.ts             # Module barrel export
└── TableDialogs.tsx     # Dialog orchestrator component
```

## 📝 Component Categories

### 🎨 Components (`/components`)
Reusable UI components that can be used across different views.

**Table Management UI:**
- **TableHeader** - Top section with title, view mode switcher, refresh, export, and create buttons
- **TableFilters** - Search bar and filter dropdowns (status, floor, section, active)
- **TableStats** - Dashboard statistics showing table counts by status
- **TableStatusBadge** - Colored badge for table status display
- **TablePagination** - Pagination controls with page size selector
- **QuickViewPanel** - Sliding panel for quick table details view

**Visual Editor (`/components/visual-editor/`):**
- **VisualEditorPage** - Main page orchestrating the visual floor plan editor
- **EditorCanvas** - Canvas component with drag-and-drop support
- **EditorToolbar** - Toolbar with tools (select, pan), zoom, grid controls
- **TableComponent** - Draggable/resizable table representation
- **PropertiesPanel** - Side panel for editing selected table properties
- **FloorSelector** - Dropdown to switch between different floors
- **SaveLayoutDialog** - Save current floor plan layout
- **LoadLayoutDialog** - Load saved layouts
- **QuickCreateTableDialog** - Quickly create tables on canvas
- **UnsavedChangesDialog** - Warning when switching floors with unsaved changes
- **VisualEditorDeleteTableDialog** - Confirm table deletion in editor
- **VisualEditorKeyboardShortcutsDialog** - Show keyboard shortcuts reference

### 👁️ Views (`/views`)
Complete view implementations for different display modes.

- **TableListView** - Main list/table view with:
  - Sortable columns
  - Row selection (checkboxes)
  - Action menu per row
  - Responsive design
  - Loading states

- **VisualFloorPlanView** - Visual floor plan editor view:
  - Drag-and-drop table positioning
  - Visual layout designer
  - Real-time collision detection
  - Grid snapping
  - Undo/redo support
  - Multiple floor management

### 💬 Dialogs (`/dialogs`)
Modal dialogs for various operations.

#### Single Table Operations (`/dialogs/single`)
Operations on individual tables:
- **CreateTableDialog** - Create new table form
- **EditTableDialog** - Edit table details
- **DeleteTableDialog** - Delete confirmation
- **StatusChangeDialog** - Change table status
- **QRCodeDialog** - View/download QR code
- **TableHistoryDialog** - View table history/logs
- **KeyboardShortcutsDialog** - Keyboard shortcuts reference

#### Bulk Operations (`/dialogs/bulk`)
Operations on multiple selected tables:
- **BulkStatusChangeDialog** - Change status for multiple tables
- **BulkDeleteDialog** - Delete multiple tables with confirmation
- **BulkExportDialog** - Export selected tables (CSV/JSON)
- **BulkActivateDeactivateDialog** - Toggle active status
- **BulkQRCodeGenerator** - Generate QR codes for multiple tables

## 🔌 Import Examples

### Using Module Barrel Exports (Recommended)

```typescript
// Import UI components
import { 
  TableHeader, 
  TableFilters, 
  TableStats,
  TablePagination,
  VisualEditorPage  // Visual editor main page
} from '@/modules/tables';

// Import views
import { TableListView, VisualFloorPlanView } from '@/modules/tables';

// Import dialogs
import {
  CreateTableDialog,
  EditTableDialog,
  BulkDeleteDialog,
  BulkStatusChangeDialog
} from '@/modules/tables';

// Import stores (for visual editor)
import { useEditorStore, useLayoutStore, useHistoryStore } from '@/modules/tables';

// Import types
import type { TablePosition, Tool } from '@/modules/tables';

// Import utils
import { checkTableCollision, snapPositionToGrid } from '@/modules/tables';
```

### Direct Imports

```typescript
// Import specific component
import { TableHeader } from '@/modules/tables/components/TableHeader';

// Import visual editor component
import { EditorCanvas } from '@/modules/tables/components/visual-editor/EditorCanvas';

// Import specific dialog
import { CreateTableDialog } from '@/modules/tables/dialogs/single/CreateTableDialog';
import { BulkDeleteDialog } from '@/modules/tables/dialogs/bulk/BulkDeleteDialog';

// Import stores
import { useEditorStore } from '@/modules/tables/stores/editorStore';
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- Components: Reusable UI elements
- Views: Complete feature implementations
- Dialogs: Modal interactions (single/bulk operations)

### 2. **Index Files**
Each folder has an `index.ts` for convenient imports and better encapsulation.

### 3. **Naming Conventions**
- **Components**: Descriptive names (e.g., `TableHeader`, `TableFilters`)
- **Dialogs**: Action-based names (e.g., `CreateTableDialog`, `BulkDeleteDialog`)
- **Views**: Display-mode names (e.g., `TableListView`)

### 4. **Scalability**
Easy to add new components:
- New component? → Add to `/components`
- New view mode? → Add to `/views`
- New dialog? → Add to `/dialogs/single` or `/dialogs/bulk`

## 🏗️ Architecture

### State Management

The tables module uses **Zustand** for state management, particularly for the visual editor:

- **editorStore** - Current tool, zoom level, grid settings, fullscreen mode
- **layoutStore** - Current floor, table positions, unsaved changes tracking
- **historyStore** - Undo/redo stack for table operations

### Visual Editor Features

- **Drag & Drop** - Using `@dnd-kit/core` for smooth drag-and-drop
- **Collision Detection** - Real-time detection to prevent table overlaps
- **Grid Snapping** - Configurable grid for precise positioning
- **Undo/Redo** - Full history tracking for layout changes
- **Multi-Floor Support** - Switch between different floor layouts
- **Keyboard Shortcuts** - Efficient editor navigation (V for select, H for pan, etc.)
- **Layout Persistence** - Save and load floor plan layouts

### Services Integration

- **floorPlanApi** (`@/services/floor-plan.service`) - CRUD for floor plans and layouts
- Uses centralized API services for backend communication

## 📚 Related Documentation

- [Table Management User Guide](../../../../../docs/TABLE_MANAGEMENT_USER_GUIDE.md)
- [Visual Floor Plan Features](../../../../../docs/VISUAL_FLOOR_PLAN_FEATURES.md)
- [API Documentation](../../../../../docs/API_DOCUMENTATION.md)

## ✅ Module Status

- **Structure**: Complete and validated
- **Visual Editor**: Fully integrated (migrated from separate visual-editor module)
- **Components**: All organized following standard module pattern
- **Barrel Exports**: Complete at all levels
- **Build Status**: ✅ Passing
- **Documentation**: Complete

---

**Last Updated:** November 20, 2025  
**Module Version:** 2.0 (Post visual-editor integration)  
**Maintained by:** Development Team
