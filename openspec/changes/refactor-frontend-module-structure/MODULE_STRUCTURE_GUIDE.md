# Frontend Module Structure - Quick Reference

## 📋 Standard Module Template

> **Reference Implementations**: 
> - ✅ `menu` - Complete with all features
> - ✅ `categories` - Simple, clean structure
> - ✅ `reservations` - Good hooks and services examples
> - ✅ `tables` - Complex with visual editor integration
> 
> **Future Implementations**:
> - 🚧 `orders` - To be built from scratch following this template
> - 🚧 `kitchen` - To be built from scratch following this template

```
src/modules/[feature-name]/
├── components/              # Reusable UI components
│   ├── index.ts            # Export all components
│   ├── [Feature]Card.tsx   # Card displays
│   ├── [Feature]Filters.tsx # Filter controls
│   ├── [Feature]Search.tsx  # Search components
│   └── [Feature]Badge.tsx   # Status badges, etc.
│
├── views/                   # Page-level views
│   ├── index.ts
│   ├── [Feature]ListView.tsx
│   ├── [Feature]GridView.tsx
│   └── [Feature]DetailView.tsx
│
├── dialogs/                 # Modal dialogs
│   ├── index.ts
│   ├── single/             # Single item operations
│   │   ├── index.ts
│   │   ├── Create[Feature]Dialog.tsx
│   │   ├── Edit[Feature]Dialog.tsx
│   │   ├── Delete[Feature]Dialog.tsx
│   │   └── [Feature]DetailsDialog.tsx
│   └── bulk/               # Bulk operations
│       ├── index.ts
│       ├── BulkDelete[Feature]Dialog.tsx
│       ├── BulkEdit[Feature]Dialog.tsx
│       └── BulkExport[Feature]Dialog.tsx
│
├── services/               # API calls
│   ├── index.ts
│   └── [feature].service.ts
│
├── hooks/                  # Custom React hooks
│   ├── index.ts
│   ├── use[Feature]s.ts   # List operations
│   ├── use[Feature].ts    # Single item operations
│   ├── useCreate[Feature].ts
│   ├── useUpdate[Feature].ts
│   └── useDelete[Feature].ts
│
├── types/                  # TypeScript types
│   └── index.ts
│
├── utils/                  # Helper functions
│   └── index.ts
│
├── [Feature]Manager.tsx    # Optional: Dialog orchestrator
├── README.md              # Module documentation
└── index.ts               # Module barrel export
```

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `MenuItemCard.tsx` |
| **Views** | PascalCase + View suffix | `MenuListView.tsx` |
| **Dialogs** | PascalCase + Dialog suffix | `CreateMenuDialog.tsx` |
| **Hooks** | camelCase + use prefix | `useMenuItems.ts` |
| **Services** | kebab-case + .service suffix | `menu.service.ts` |
| **Types** | PascalCase or in index.ts | `types/index.ts` |
| **Utils** | camelCase | `formatPrice.ts` |

## 🎯 Component Classification

### Components (`components/`)
**Purpose**: Small, reusable UI pieces

**Examples**:
- Cards (data display)
- Badges (status indicators)
- Filters (search/filter controls)
- Statistics (dashboard stats)
- Pagination

**Characteristics**:
- Focused on presentation
- Can be used in multiple views
- Minimal business logic
- Receive data via props

### Views (`views/`)
**Purpose**: Complete page-level components

**Examples**:
- ListView (table/list display)
- GridView (card grid display)
- DetailView (single item detail)
- DashboardView (dashboard overview)

**Characteristics**:
- Compose multiple components
- Handle data fetching
- Manage local state
- Define page layout

### Dialogs (`dialogs/`)
**Purpose**: Modal interactions

**Single Operations** (`single/`):
- Create forms
- Edit forms
- Delete confirmations
- Detail displays
- History views

**Bulk Operations** (`bulk/`):
- Bulk delete
- Bulk edit
- Bulk export
- Bulk status change

**Characteristics**:
- Form handling
- Validation
- API calls
- Success/error handling

## 📦 Import Patterns

### ✅ Recommended Imports

```typescript
// Module-level import (preferred)
import { MenuItemCard, MenuItemList } from '@/modules/menu';

// Service import
import { menuApi } from '@/modules/menu/services';

// Specific component import (when needed)
import { MenuItemCard } from '@/modules/menu/components/MenuItemCard';
```

### ❌ Avoid These Imports

```typescript
// Don't import from deep paths without barrel exports
import { MenuItemCard } from '@/modules/menu/components/MenuItemCard';

// Don't import from old centralized services
import { menuApi } from '@/services/menu.service';
```

## 🔧 Barrel Export Pattern

### Module Level (`index.ts`)

```typescript
// src/modules/menu/index.ts
export * from './components';
export * from './views';
export * from './dialogs';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
```

### Subfolder Level (`components/index.ts`)

```typescript
// src/modules/menu/components/index.ts
export { MenuItemCard } from './MenuItemCard';
export { MenuItemList } from './MenuItemList';
export { MenuItemFilters } from './MenuItemFilters';
export { MenuSearch } from './MenuSearch';
export { MenuStatistics } from './MenuStatistics';
```

### Dialogs with Subfolders

```typescript
// src/modules/menu/dialogs/index.ts
export * from './single';
export * from './bulk';

// src/modules/menu/dialogs/single/index.ts
export { CreateMenuDialog } from './CreateMenuDialog';
export { EditMenuDialog } from './EditMenuDialog';
export { DeleteMenuDialog } from './DeleteMenuDialog';

// src/modules/menu/dialogs/bulk/index.ts
export { BulkDeleteMenuDialog } from './BulkDeleteMenuDialog';
export { BulkExportMenuDialog } from './BulkExportMenuDialog';
```

## 🛠️ Service Pattern

```typescript
// src/modules/menu/services/menu.service.ts
import axios from '@/lib/axios';
import type { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '../types';

export const menuApi = {
  // List operations
  getAll: async (params?: MenuQueryParams) => {
    const response = await axios.get<MenuItem[]>('/menu', { params });
    return response.data;
  },

  // Single item operations
  getById: async (id: number) => {
    const response = await axios.get<MenuItem>(`/menu/${id}`);
    return response.data;
  },

  create: async (data: CreateMenuItemDto) => {
    const response = await axios.post<MenuItem>('/menu', data);
    return response.data;
  },

  update: async (id: number, data: UpdateMenuItemDto) => {
    const response = await axios.put<MenuItem>(`/menu/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await axios.delete(`/menu/${id}`);
  },
};
```

## 🪝 Hook Pattern

```typescript
// src/modules/menu/hooks/useMenuItems.ts
import { useState, useEffect } from 'react';
import { menuApi } from '../services';
import type { MenuItem } from '../types';

export function useMenuItems(params?: MenuQueryParams) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await menuApi.getAll(params);
        setItems(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [params]);

  return { items, loading, error };
}
```

## 📚 Module README Template

```markdown
# [Feature] Module

## Overview
Brief description of the feature module.

## Directory Structure
```
[feature]/
├── components/
├── views/
├── dialogs/
├── services/
├── hooks/
├── types/
└── utils/
```

## Components
List and describe main components.

## Views
List and describe available views.

## Dialogs
List and describe available dialogs.

## Import Examples
```typescript
import { Component } from '@/modules/[feature]';
```

## Related Documentation
- Link to API docs
- Link to user guides
```

## 🎨 Design Principles

### 1. **Single Responsibility**
Each component/function has one clear purpose.

### 2. **Colocation**
Related code lives together in the same module.

### 3. **Explicit Dependencies**
Use imports to show dependencies clearly.

### 4. **Encapsulation**
Modules expose only their public API via barrel exports.

### 5. **Consistency**
All modules follow the same structure pattern.

## ✅ Checklist for New Modules

- [ ] Create standard folder structure
- [ ] Add barrel exports (index.ts) at every level
- [ ] Organize components into components/views/dialogs
- [ ] Create service file with API calls
- [ ] Create custom hooks for data operations
- [ ] Define TypeScript types
- [ ] Add utility functions if needed
- [ ] Write module README.md
- [ ] Update imports in consuming code
- [ ] Test all functionality

## 🔗 Related Documentation

- [Proposal](./proposal.md)
- [Design Document](./design.md)
- [Task List](./tasks.md)
- [Tables Module Example](../../../app/client/src/modules/tables/README.md)
