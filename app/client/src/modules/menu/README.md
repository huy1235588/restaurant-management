# Menu Module

## Overview
The Menu module manages restaurant menu items including creation, editing, viewing, filtering, and availability management. It follows a feature-based architecture with clear separation of concerns.

## Directory Structure

```
menu/
├── components/              # Reusable UI components
│   ├── index.ts
│   ├── MenuItemCard.tsx            # Card display for grid view
│   ├── MenuItemListRow.tsx         # Row display for list view
│   ├── MenuItemFilters.tsx         # Filter controls
│   ├── MenuSearch.tsx              # Search component
│   ├── MenuStatistics.tsx          # Statistics dashboard
│   └── ViewModeSwitcher.tsx        # Toggle between grid/list view
│
├── views/                   # Page-level views
│   ├── index.ts
│   └── MenuItemList.tsx            # Main list/grid view
│
├── dialogs/                 # Modal dialogs
│   ├── index.ts
│   ├── single/             # Single item operations
│   │   ├── index.ts
│   │   └── MenuItemForm.tsx        # Create/Edit form dialog
│   └── bulk/               # Bulk operations (future)
│       └── index.ts
│
├── services/                # API calls
│   ├── index.ts
│   └── menu.service.ts             # Menu API client
│
├── hooks/                   # Custom React hooks
│   ├── index.ts
│   ├── useMenuItems.ts             # List and CRUD operations
│   └── useCategories.ts            # Category operations
│
├── types/                   # TypeScript types
│   └── index.ts
│
├── utils/                   # Helper functions
│   ├── index.ts
│   └── validation.ts               # Form validation schemas
│
├── README.md               # This file
└── index.ts                # Module barrel export
```

## Components

### 🎨 UI Components (`components/`)

#### MenuItemCard
Displays menu item in card format for grid view.
- Shows image, name, price, category
- Status badges (available/unavailable)
- Quick actions menu

#### MenuItemListRow
Displays menu item in row format for table/list view.
- Compact information display
- Sortable columns
- Inline availability toggle
- Action menu

#### MenuItemFilters
Filter controls for menu items.
- Category filter
- Availability filter
- Active status filter
- Price range filter
- Additional filters (vegetarian, spicy level)

#### MenuSearch
Search functionality for menu items.
- Real-time search
- Search by name or code

#### MenuStatistics
Dashboard statistics for menu overview.
- Total items count
- Available items count
- Category breakdown

#### ViewModeSwitcher
Toggle between grid and list view modes.

### 👁️ Views (`views/`)

#### MenuItemList
Main view component for displaying menu items.
- Grid view with cards
- List view with table
- Sorting capabilities
- Pagination
- Loading states
- Empty states

### 💬 Dialogs (`dialogs/`)

#### Single Operations (`single/`)

**MenuItemForm**
- Create new menu item
- Edit existing menu item
- Image upload with cropper
- Form validation
- Category selection
- Price and cost management
- Margin calculation

#### Bulk Operations (`bulk/`)
*To be implemented:*
- Bulk availability update
- Bulk delete
- Bulk export
- Bulk price update

## Services

### menuApi
API client for menu operations.

**Methods:**
- `count(params)` - Count menu items with filters
- `getAll(params)` - Get paginated menu items with filters
- `getById(id)` - Get single menu item
- `getByCategory(categoryId)` - Get items by category
- `create(data)` - Create new menu item
- `update(id, data)` - Update menu item
- `updateAvailability(id, isAvailable)` - Toggle availability
- `delete(id)` - Delete menu item

## Hooks

### useMenuItems(params)
Fetch menu items with pagination and filters.

**Returns:**
- `data` - Paginated response
- `menuItems` - Array of menu items
- `pagination` - Pagination info
- `loading` - Loading state
- `error` - Error message
- `refetch()` - Refetch function

### useMenuItemCount(params)
Get count of menu items with filters.

### useMenuItem(id)
Fetch single menu item by ID.

### useCreateMenuItem()
Create new menu item.

### useUpdateMenuItem()
Update existing menu item.

### useUpdateAvailability()
Toggle menu item availability.

### useDeleteMenuItem()
Delete menu item.

### useCategories(params)
Fetch categories (imported from categories module).

## Types

### MenuItem
Main menu item interface.

### MenuItemFormData
Form data for create/edit operations.

### MenuFilters
Filter parameters for menu queries.

### ViewMode
View mode type: `'grid' | 'list'`

## Import Examples

### Module-level imports (Recommended)

```typescript
// Import components
import { 
  MenuItemCard, 
  MenuItemList, 
  MenuItemForm 
} from '@/modules/menu';

// Import hooks
import { 
  useMenuItems, 
  useCreateMenuItem 
} from '@/modules/menu';

// Import services
import { menuApi } from '@/modules/menu/services';

// Import types
import type { 
  MenuItem, 
  MenuItemFormData 
} from '@/modules/menu';
```

### Specific imports

```typescript
// Import specific component
import { MenuItemCard } from '@/modules/menu/components/MenuItemCard';

// Import specific view
import { MenuItemList } from '@/modules/menu/views/MenuItemList';

// Import specific dialog
import { MenuItemForm } from '@/modules/menu/dialogs/single/MenuItemForm';

// Import specific hook
import { useMenuItems } from '@/modules/menu/hooks/useMenuItems';
```

## Usage Examples

### Basic List View

```typescript
'use client';

import { useMenuItems } from '@/modules/menu';
import { MenuItemList, MenuItemFilters } from '@/modules/menu';
import { useState } from 'react';

export default function MenuPage() {
  const [filters, setFilters] = useState({});
  const { menuItems, loading, pagination } = useMenuItems(filters);

  return (
    <div>
      <MenuItemFilters 
        filters={filters} 
        onChange={setFilters} 
      />
      <MenuItemList
        items={menuItems}
        loading={loading}
        viewMode="grid"
        pagination={pagination}
      />
    </div>
  );
}
```

### Create Menu Item

```typescript
'use client';

import { useCreateMenuItem } from '@/modules/menu';
import { MenuItemForm } from '@/modules/menu';
import { Dialog } from '@/components/ui/dialog';

export function CreateMenuDialog({ categories, onClose }) {
  const { createMenuItem, loading } = useCreateMenuItem();

  const handleSubmit = async (data, imageFile) => {
    await createMenuItem({ ...data, imageFile });
    onClose();
  };

  return (
    <Dialog>
      <MenuItemForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Dialog>
  );
}
```

## Design Principles

### 1. **Colocation**
All menu-related code lives in the menu module.

### 2. **Separation of Concerns**
- Components: Reusable UI pieces
- Views: Complete page implementations
- Dialogs: Modal interactions
- Services: API communication
- Hooks: Data management and state
- Utils: Helper functions

### 3. **Barrel Exports**
Use index.ts files for clean imports.

### 4. **Type Safety**
Strong TypeScript typing throughout.

### 5. **Reusability**
Components designed to be composed and reused.

## Related Modules

- **Categories Module** - Category management (imported by menu hooks)
- **Upload Module** - Image upload functionality
- **Tables Module** - Reference implementation

## Future Enhancements

- [ ] Bulk operations dialogs
- [ ] Menu item duplication
- [ ] Import/Export functionality
- [ ] Recipe management
- [ ] Ingredient tracking
- [ ] Nutritional information
- [ ] Menu scheduling (seasonal items)
- [ ] Multi-language support

## Related Documentation

- [Change Proposal](../../../../openspec/changes/refactor-frontend-module-structure/proposal.md)
- [Design Document](../../../../openspec/changes/refactor-frontend-module-structure/design.md)
- [Module Structure Guide](../../../../openspec/changes/refactor-frontend-module-structure/MODULE_STRUCTURE_GUIDE.md)

---

**Last Updated:** November 20, 2025  
**Status:** ✅ Refactored and Production Ready
