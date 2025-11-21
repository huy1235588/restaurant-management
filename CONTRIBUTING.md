# Contributing Guide

This is a personal academic project (đồ án tốt nghiệp), but the following guidelines ensure code consistency and maintainability.

## Table of Contents
- [Module Structure Convention](#module-structure-convention)
- [Creating a New Feature Module](#creating-a-new-feature-module)
- [State Management with Zustand](#state-management-with-zustand)
- [Code Style Guidelines](#code-style-guidelines)
- [Import Conventions](#import-conventions)
- [Naming Conventions](#naming-conventions)

---

## Module Structure Convention

All feature modules in `src/modules/` follow a standardized structure:

```
src/modules/[feature-name]/
├── components/              # Reusable UI components
│   ├── index.ts            # Export all components
│   ├── [Feature]Card.tsx   # Card displays
│   ├── [Feature]Filters.tsx # Filter controls
│   └── [Feature]Search.tsx  # Search components
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
│   │   └── Delete[Feature]Dialog.tsx
│   └── bulk/               # Bulk operations
│       ├── index.ts
│       └── Bulk[Operation]Dialog.tsx
│
├── services/               # API calls
│   ├── index.ts
│   └── [feature].service.ts
│
├── hooks/                  # Custom React hooks
│   ├── index.ts
│   ├── use[Feature]s.ts   # List operations
│   └── use[Feature].ts    # Single item operations
│
├── stores/                 # Zustand stores (optional)
│   ├── index.ts
│   └── [feature]Store.ts  # Feature-specific state
│
├── types/                  # TypeScript types
│   └── index.ts
│
├── utils/                  # Helper functions
│   └── index.ts
│
├── README.md              # Module documentation
└── index.ts               # Module barrel export
```

### Reference Implementations

Study these existing modules as examples:

- **`menu/`** - Complete module with all features
- **`categories/`** - Simple, clean structure
- **`reservations/`** - Good hooks and services examples
- **`tables/`** - Complex module with visual editor integration + **Zustand stores**

---

## Creating a New Feature Module

### Step 1: Create Directory Structure

```bash
cd app/client/src/modules
mkdir -p [feature-name]/{components,views,dialogs/{single,bulk},services,hooks,types,utils}
```

### Step 2: Create Barrel Exports

Create `index.ts` files in each folder:

**Module root (`index.ts`)**:
```typescript
export * from './components';
export * from './views';
export * from './dialogs';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
```

**Each subfolder (`components/index.ts`, `views/index.ts`, etc.)**:
```typescript
export { ComponentName } from './ComponentName';
export { AnotherComponent } from './AnotherComponent';
```

### Step 3: Create Service

**`services/[feature].service.ts`**:
```typescript
import axiosInstance from '@/lib/axios';
import type { FeatureItem, ApiResponse, PaginatedResponse } from '@/types';

export const featureApi = {
  getAll: async (params?: QueryParams): Promise<PaginatedResponse<FeatureItem>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<FeatureItem>>>(
      '/feature',
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<FeatureItem> => {
    const response = await axiosInstance.get<ApiResponse<FeatureItem>>(`/feature/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<FeatureItem>): Promise<FeatureItem> => {
    const response = await axiosInstance.post<ApiResponse<FeatureItem>>('/feature', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<FeatureItem>): Promise<FeatureItem> => {
    const response = await axiosInstance.put<ApiResponse<FeatureItem>>(`/feature/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/feature/${id}`);
  },
};
```

### Step 4: Create Custom Hooks

**`hooks/use[Feature]s.ts`** (list operations):
```typescript
import { useState, useEffect } from 'react';
import { featureApi } from '../services';
import type { FeatureItem } from '../types';

export function useFeatureItems() {
  const [items, setItems] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await featureApi.getAll();
        setItems(data.items);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error };
}
```

### Step 5: Create Components

Follow the three-tier structure:

**Components** (`components/`):
- Small, reusable UI pieces
- Cards, badges, filters, search bars
- Focus on presentation

**Views** (`views/`):
- Complete page-level components
- Compose multiple components
- Handle layout and data fetching

**Dialogs** (`dialogs/`):
- Modal interactions
- Forms (create, edit)
- Confirmations (delete)
- Separate single vs bulk operations

### Step 6: Create README

Document your module:

```markdown
# [Feature] Module

## Overview
Brief description of the feature module.

## Directory Structure
[Paste structure here]

## Components
List and describe main components.

## Views
List and describe available views.

## Dialogs
List and describe available dialogs.

## Import Examples
\`\`\`typescript
import { FeatureCard } from '@/modules/feature';
import { featureApi } from '@/modules/feature/services';
\`\`\`

## Related Modules
- [Other Module] - How they relate
```

---

## State Management with Zustand

### When to Use Stores

Not every module needs a Zustand store. Use stores only when:

✅ **Use stores when**:
- Complex state needs to be shared across multiple components
- State persists across route changes
- Avoiding prop drilling through many layers
- Managing UI state (modals, filters, selected items)
- Real-time data synchronization needed
- Undo/redo functionality required

❌ **Don't use stores when**:
- Simple local component state (use `useState`)
- Data fetched once and displayed (use hooks + props)
- Server state managed by React Query/SWR
- Form state (use React Hook Form)

### Store Structure

**Location**: `modules/[feature]/stores/[feature]Store.ts`

**Example - Visual Editor Store** (`modules/tables/stores/visualEditorStore.ts`):
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Table, TablePosition } from '../types';

interface VisualEditorState {
  // State
  tables: Table[];
  selectedTableId: number | null;
  isDragging: boolean;
  zoom: number;
  
  // Actions
  setTables: (tables: Table[]) => void;
  selectTable: (id: number | null) => void;
  updateTablePosition: (id: number, position: TablePosition) => void;
  setIsDragging: (isDragging: boolean) => void;
  setZoom: (zoom: number) => void;
  resetEditor: () => void;
}

export const useVisualEditorStore = create<VisualEditorState>()()
  devtools(
    persist(
      (set) => ({
        // Initial state
        tables: [],
        selectedTableId: null,
        isDragging: false,
        zoom: 1,
        
        // Actions
        setTables: (tables) => set({ tables }),
        
        selectTable: (id) => set({ selectedTableId: id }),
        
        updateTablePosition: (id, position) =>
          set((state) => ({
            tables: state.tables.map((table) =>
              table.id === id ? { ...table, position } : table
            ),
          })),
        
        setIsDragging: (isDragging) => set({ isDragging }),
        
        setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),
        
        resetEditor: () =>
          set({
            selectedTableId: null,
            isDragging: false,
            zoom: 1,
          }),
      }),
      {
        name: 'visual-editor-storage',
        partialize: (state) => ({ zoom: state.zoom }), // Only persist zoom
      }
    ),
    { name: 'VisualEditorStore' }
  );
```

### Store Best Practices

#### 1. **Separate State and Actions**
```typescript
interface StoreState {
  // State properties first
  items: Item[];
  selectedId: number | null;
  isLoading: boolean;
  
  // Actions after
  setItems: (items: Item[]) => void;
  selectItem: (id: number) => void;
}
```

#### 2. **Use Immer for Complex Updates**
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<State>()()
  immer((set) => ({
    nested: { deep: { value: 0 } },
    increment: () =>
      set((state) => {
        state.nested.deep.value++; // Direct mutation with Immer
      }),
  }));
```

#### 3. **Use Devtools in Development**
```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<State>()()
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'MyStore' } // Shows up in Redux DevTools
  );
```

#### 4. **Persist Only Necessary Data**
```typescript
import { persist } from 'zustand/middleware';

export const useStore = create<State>()()
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'my-storage',
      partialize: (state) => ({
        // Only persist specific fields
        theme: state.theme,
        preferences: state.preferences,
      }),
    }
  );
```

#### 5. **Selectors for Performance**
```typescript
// ❌ Bad - Re-renders on any state change
const { items, count, isLoading } = useStore();

// ✅ Good - Only re-renders when specific values change
const items = useStore((state) => state.items);
const count = useStore((state) => state.count);
const isLoading = useStore((state) => state.isLoading);

// ✅ Better - Use shallow equality for multiple values
import { shallow } from 'zustand/shallow';
const { items, count } = useStore(
  (state) => ({ items: state.items, count: state.count }),
  shallow
);
```

### Store Patterns

#### Pattern 1: UI State Store
```typescript
// stores/uiStore.ts - Global UI state
interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  toast: ToastMessage | null;
  
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  showToast: (message: ToastMessage) => void;
}
```

#### Pattern 2: Feature State Store
```typescript
// modules/menu/stores/menuStore.ts - Feature-specific state
interface MenuState {
  items: MenuItem[];
  filters: MenuFilters;
  selectedItems: number[];
  
  setFilters: (filters: MenuFilters) => void;
  toggleItemSelection: (id: number) => void;
  clearSelection: () => void;
}
```

#### Pattern 3: Async Actions Store
```typescript
interface DataState {
  data: Data[];
  isLoading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  createData: (data: Partial<Data>) => Promise<void>;
}

export const useDataStore = create<DataState>()((set) => ({
  data: [],
  isLoading: false,
  error: null,
  
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.fetchData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  createData: async (newData) => {
    set({ isLoading: true, error: null });
    try {
      const created = await api.createData(newData);
      set((state) => ({
        data: [...state.data, created],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

### Global vs Module Stores

**Global Stores** (`src/stores/`):
- Authentication state (`authStore.ts`)
- UI/theme state (`uiStore.ts`)
- User preferences (`preferencesStore.ts`)
- Notification system (`notificationStore.ts`)

**Module Stores** (`src/modules/[feature]/stores/`):
- Feature-specific UI state
- Complex interactive features (visual editor, drag-drop)
- Temporary selections/filters
- Local caching

### Testing Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from './myStore';

describe('MyStore', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useMyStore());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  // Reset store after each test
  afterEach(() => {
    useMyStore.setState({ count: 0 });
  });
});
```

### Store Checklist

When creating a store:

- [ ] Store is needed (not just local state)
- [ ] Located in correct folder (global vs module)
- [ ] Interface defines state and actions separately
- [ ] Devtools middleware added (development)
- [ ] Persist middleware only for necessary data
- [ ] Proper TypeScript typing
- [ ] Actions use immutable updates
- [ ] Exported as named export
- [ ] Added to module's `stores/index.ts`
- [ ] Documented in module README

---

## Code Style Guidelines

### TypeScript
- **Strict mode**: Always enabled
- **Type imports**: Use `import type` for type-only imports
- **Interface vs Type**: Prefer `interface` for object shapes, `type` for unions/intersections

### React Components
- **Functional components**: Use function declarations, not arrow functions for components
- **Props**: Define props interface/type above component
- **Hooks**: Custom hooks start with `use` prefix
- **Event handlers**: Prefix with `handle` (e.g., `handleSubmit`, `handleClick`)

### File Organization
- One component per file
- Co-locate related files (component, styles, types)
- Use barrel exports (`index.ts`) for clean imports

---

## Import Conventions

### Order of Imports
1. React and framework imports
2. Third-party libraries
3. Internal modules (absolute imports with `@/`)
4. Relative imports (same feature)
5. Type imports (group at end or use `import type`)

Example:
```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared';
import { menuApi } from '@/modules/menu/services';

import { FeatureCard } from './FeatureCard';
import type { FeatureItem } from '../types';
```

### Import Paths

**✅ Recommended**:
```typescript
// Module-level imports
import { MenuItemCard, MenuItemList } from '@/modules/menu';
import { menuApi } from '@/modules/menu/services';

// Shared component imports
import { LoadingSpinner } from '@/components/shared';
import { Button } from '@/components/ui/button';
```

**❌ Avoid**:
```typescript
// Don't import from deep paths without barrel exports
import { MenuItemCard } from '@/modules/menu/components/MenuItemCard';

// Don't import from old centralized services (they've been migrated)
import { menuApi } from '@/services/menu.service';
```

---

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `MenuItemCard.tsx`)
- **Views**: PascalCase + View suffix (e.g., `MenuListView.tsx`)
- **Dialogs**: PascalCase + Dialog suffix (e.g., `CreateMenuDialog.tsx`)
- **Hooks**: camelCase + use prefix (e.g., `useMenuItems.ts`)
- **Services**: kebab-case + .service suffix (e.g., `menu.service.ts`)
- **Stores**: camelCase + Store suffix (e.g., `menuStore.ts`, `visualEditorStore.ts`)
- **Utils**: camelCase (e.g., `formatPrice.ts`)

### Variables & Functions
- **Variables**: camelCase (e.g., `menuItems`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`, `API_URL`)
- **Functions**: camelCase (e.g., `fetchMenuItems`, `formatDate`)
- **Event handlers**: handleXxx (e.g., `handleSubmit`, `handleDelete`)
- **Boolean variables**: is/has/should prefix (e.g., `isVisible`, `hasError`, `shouldUpdate`)

### Types & Interfaces
- **Interfaces**: PascalCase (e.g., `MenuItem`, `UserProfile`)
- **Types**: PascalCase (e.g., `OrderStatus`, `TablePosition`)
- **Enums**: PascalCase (e.g., `Role`, `PaymentMethod`)

### React Components
- **Components**: PascalCase (e.g., `MenuItemCard`, `TableList`)
- **Props interfaces**: ComponentNameProps (e.g., `MenuItemCardProps`)

---

## Best Practices

### 1. Colocation
Keep related code together in the same module.

### 2. Single Responsibility
Each component/function has one clear purpose.

### 3. Explicit Dependencies
Use imports to show dependencies clearly.

### 4. Encapsulation
Modules expose only their public API via barrel exports.

### 5. Type Safety
Strong TypeScript typing throughout.

### 6. Reusability
Design components to be composed and reused.

### 7. Documentation
Document complex logic and public APIs.

---

## Module Checklist

When creating or updating a module, verify:

- [ ] Standard folder structure created
- [ ] Barrel exports (index.ts) at every level
- [ ] Components organized into components/views/dialogs
- [ ] Service file with API calls
- [ ] Custom hooks for data operations
- [ ] Zustand stores if complex state needed
- [ ] TypeScript types defined
- [ ] Utility functions if needed
- [ ] Module README.md written
- [ ] Imports updated in consuming code
- [ ] Functionality tested manually

---

## Questions?

For clarification on conventions or architecture decisions, refer to:
- Module READMEs (`src/modules/*/README.md`)
- OpenSpec documentation (`openspec/changes/refactor-frontend-module-structure/`)
- Project context (`openspec/project.md`)
