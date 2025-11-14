# Tables Feature - Component Structure

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
│   └── QuickViewPanel.tsx       # Side panel for quick view
│
├── views/               # Main view components
│   ├── index.ts
│   └── TableListView.tsx        # List/table view with sorting
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
└── TableDialogs.tsx     # Dialog orchestrator component
```

## 📝 Component Categories

### 🎨 Components (`/components`)
Reusable UI components that can be used across different views.

- **TableHeader** - Top section with title, view mode switcher, refresh, export, and create buttons
- **TableFilters** - Search bar and filter dropdowns (status, floor, section, active)
- **TableStats** - Dashboard statistics showing table counts by status
- **TableStatusBadge** - Colored badge for table status display
- **TablePagination** - Pagination controls with page size selector
- **QuickViewPanel** - Sliding panel for quick table details view

### 👁️ Views (`/views`)
Complete view implementations for different display modes.

- **TableListView** - Main list/table view with:
  - Sortable columns
  - Row selection (checkboxes)
  - Action menu per row
  - Responsive design
  - Loading states

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

### Using Index Files (Recommended)

```typescript
// Import multiple components
import { 
  TableHeader, 
  TableFilters, 
  TableStats,
  TablePagination 
} from '@/components/features/tables/components';

// Import view
import { TableListView } from '@/components/features/tables/views';

// Import all dialogs
import {
  CreateTableDialog,
  EditTableDialog,
  BulkDeleteDialog,
  BulkStatusChangeDialog
} from '@/components/features/tables/dialogs';
```

### Direct Imports

```typescript
// Import specific component
import { TableHeader } from '@/components/features/tables/components/TableHeader';

// Import specific dialog
import { CreateTableDialog } from '@/components/features/tables/dialogs/single/CreateTableDialog';
import { BulkDeleteDialog } from '@/components/features/tables/dialogs/bulk/BulkDeleteDialog';
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

## 🔄 Future Additions

Planned structure for Visual Floor Plan:

```
views/
├── TableListView.tsx
└── VisualFloorPlanView.tsx     # Coming soon

visual-floor-plan/              # Future: Visual editor components
├── canvas/
├── tools/
└── panels/
```

## 📚 Related Documentation

- [Table Management User Guide](../../../../../docs/TABLE_MANAGEMENT_USER_GUIDE.md)
- [Visual Floor Plan Features](../../../../../docs/VISUAL_FLOOR_PLAN_FEATURES.md)
- [API Documentation](../../../../../docs/API_DOCUMENTATION.md)

---

**Last Updated:** November 14, 2025
**Maintained by:** Development Team
