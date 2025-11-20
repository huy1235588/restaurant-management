# Categories Module

## Overview
The Categories module manages menu categories for organizing restaurant menu items. It provides functionality for creating, editing, viewing, and deleting categories with image support.

## Directory Structure

```
categories/
├── components/              # Reusable UI components
│   ├── index.ts
│   └── CategoryCard.tsx            # Card display for categories
│
├── views/                   # Page-level views
│   ├── index.ts
│   └── CategoryList.tsx            # Main list view with grid
│
├── dialogs/                 # Modal dialogs
│   ├── index.ts
│   ├── single/             # Single item operations
│   │   ├── index.ts
│   │   └── CategoryForm.tsx        # Create/Edit form dialog
│   └── bulk/               # Bulk operations (future)
│       └── index.ts
│
├── services/                # API calls
│   ├── index.ts
│   └── category.service.ts         # Category API client
│
├── hooks/                   # Custom React hooks
│   ├── index.ts
│   └── useCategories.ts            # Category CRUD operations
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

#### CategoryCard
Displays category information in card format.
- Category image
- Name and description
- Menu item count
- Active status
- Quick actions (Edit, Delete, View Details)

### 👁️ Views (`views/`)

#### CategoryList
Main view component for displaying categories.
- Grid layout with responsive cards
- Loading states with skeletons
- Empty state when no categories
- Error handling with alerts

### 💬 Dialogs (`dialogs/`)

#### Single Operations (`single/`)

**CategoryForm**
- Create new category
- Edit existing category
- Image upload with preview
- Form validation
- Active status toggle

#### Bulk Operations (`bulk/`)
*To be implemented:*
- Bulk delete
- Bulk export
- Bulk activate/deactivate

## Services

### categoryApi
API client for category operations.

**Methods:**
- `count(params)` - Count categories with filters
- `getAll(params)` - Get all categories with optional filters
- `getById(id)` - Get single category
- `getWithItems(id)` - Get category with associated menu items
- `create(data)` - Create new category
- `update(id, data)` - Update category
- `delete(id)` - Delete category

## Hooks

### useCategories(params)
Fetch categories with optional filtering.

**Returns:**
- `categories` - Array of categories
- `loading` - Loading state
- `error` - Error message
- `refetch()` - Refetch function

### useCategoryCount(params)
Get count of categories with filters.

### useCategory(id)
Fetch single category by ID.

### useCategoryWithItems(id)
Fetch category with associated menu items.

### useCreateCategory()
Create new category.

### useUpdateCategory()
Update existing category.

### useDeleteCategory()
Delete category.

## Types

### Category
Main category interface (defined in global types).

### CategoryFormData
Form data for create/edit operations.

## Import Examples

### Module-level imports (Recommended)

```typescript
// Import components
import { 
  CategoryCard, 
  CategoryList, 
  CategoryForm 
} from '@/modules/categories';

// Import hooks
import { 
  useCategories, 
  useCreateCategory 
} from '@/modules/categories';

// Import services
import { categoryApi } from '@/modules/categories/services';

// Import types
import type { CategoryFormData } from '@/modules/categories';
```

### Specific imports

```typescript
// Import specific component
import { CategoryCard } from '@/modules/categories/components/CategoryCard';

// Import specific view
import { CategoryList } from '@/modules/categories/views/CategoryList';

// Import specific dialog
import { CategoryForm } from '@/modules/categories/dialogs/single/CategoryForm';

// Import specific hook
import { useCategories } from '@/modules/categories/hooks/useCategories';
```

## Usage Examples

### Basic List View

```typescript
'use client';

import { useCategories } from '@/modules/categories';
import { CategoryList } from '@/modules/categories';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories({ isActive: true });

  const handleEdit = (category) => {
    // Open edit dialog
  };

  const handleDelete = (category) => {
    // Show delete confirmation
  };

  const handleViewDetails = (category) => {
    // Navigate to category detail page
  };

  return (
    <CategoryList
      categories={categories}
      loading={loading}
      error={error}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );
}
```

### Create Category

```typescript
'use client';

import { useCreateCategory } from '@/modules/categories';
import { CategoryForm } from '@/modules/categories';
import { Dialog } from '@/components/ui/dialog';

export function CreateCategoryDialog({ onClose }) {
  const { createCategory, loading } = useCreateCategory();

  const handleSubmit = async (data, imageFile) => {
    await createCategory({ ...data, imageFile });
    onClose();
  };

  return (
    <Dialog>
      <CategoryForm
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
All category-related code lives in the categories module.

### 2. **Separation of Concerns**
- Components: Reusable UI pieces
- Views: Complete page implementations
- Dialogs: Modal interactions
- Services: API communication
- Hooks: Data management and state

### 3. **Barrel Exports**
Use index.ts files for clean imports.

### 4. **Type Safety**
Strong TypeScript typing throughout.

### 5. **Independent Service**
Categories module has its own service, separate from menu module.

## Related Modules

- **Menu Module** - Menu items are organized by categories
- **Upload Module** - Image upload functionality

## Future Enhancements

- [ ] Bulk operations dialogs
- [ ] Category ordering/sorting
- [ ] Category hierarchies (subcategories)
- [ ] Category-specific menu templates
- [ ] Analytics per category
- [ ] Multi-language category names
- [ ] Category visibility scheduling

## Related Documentation

- [Change Proposal](../../../../openspec/changes/refactor-frontend-module-structure/proposal.md)
- [Design Document](../../../../openspec/changes/refactor-frontend-module-structure/design.md)
- [Module Structure Guide](../../../../openspec/changes/refactor-frontend-module-structure/MODULE_STRUCTURE_GUIDE.md)
- [Menu Module README](../menu/README.md)

---

**Last Updated:** November 20, 2025  
**Status:** ✅ Refactored and Production Ready
