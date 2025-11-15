# Design: Menu Management System

## Architecture Overview

The menu management system follows a feature-based architecture pattern consistent with the existing codebase. It implements a standard React component hierarchy with server-client separation, leveraging Next.js 16 App Router and React 19 patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages (App Router)                                          │
│    └─ (dashboard)/menu/                                      │
│         ├─ page.tsx              (Menu List)                 │
│         ├─ categories/page.tsx   (Category List)             │
│         └─ [id]/page.tsx        (Menu Item Detail)           │
├─────────────────────────────────────────────────────────────┤
│  Feature Components                                          │
│    └─ features/menu/                                         │
│         ├─ components/           (UI Components)             │
│         ├─ hooks/                (Custom Hooks)              │
│         └─ types/                (TypeScript Types)          │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│    └─ services/                                              │
│         └─ menu.service.ts       (API Client - exists)       │
├─────────────────────────────────────────────────────────────┤
│                         API Layer                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + Prisma)                │
│                      [Already Implemented]                   │
├─────────────────────────────────────────────────────────────┤
│  Routes: /menu, /categories                                  │
│  Controllers: menuController, categoryController             │
│  Services: menuService, categoryService                      │
│  Validators: Zod Schemas                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database (Prisma)                  │
│    Tables: menu_items, categories                            │
└─────────────────────────────────────────────────────────────┘
```

## Technology Decisions

### Frontend Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Next.js 16 App Router** | Routing & SSR | Already established in project, provides file-based routing |
| **React 19** | UI Framework | Latest stable version in project |
| **TypeScript 5** | Type Safety | Enforces contracts with backend APIs |
| **Tailwind CSS 4** | Styling | Project standard, utility-first approach |
| **Radix UI** | Component Primitives | Accessible components already in use |
| **React Hook Form** | Form Management | Performant, already integrated |
| **Zod** | Validation | Shared schemas with backend |
| **Axios** | HTTP Client | Configured with interceptors for auth |

### State Management Strategy

**Local State (useState/useReducer):**
- Form input values
- UI toggles (modals, dropdowns)
- View mode (grid/list/table)
- Filter selections

**Server State (Custom Hooks + Axios):**
- Menu items data
- Categories data
- Loading states
- Error states

**No Global State Required:**
- Menu data is page-scoped
- Auth context already exists
- No cross-feature sharing needed

### Data Flow Pattern

```typescript
// Standard data flow for menu operations
User Action → Component Event Handler → API Service Call → 
Backend Processing → Response → State Update → UI Re-render
```

**Example: Creating a Menu Item**
```
1. User fills form and submits
2. onSubmit handler validates with Zod
3. menuApi.create() sends POST request
4. Backend validates and saves to DB
5. Success response returns created item
6. Local state updates (optimistic or refetch)
7. UI shows success toast and navigates to list
```

## Component Architecture

### Feature Structure

```
app/client/src/features/menu/
├── components/
│   ├── MenuItemCard.tsx          # Grid view card
│   ├── MenuItemListRow.tsx       # List view row
│   ├── MenuItemForm.tsx          # Create/Edit form
│   ├── MenuItemFilters.tsx       # Filter panel
│   ├── MenuItemStats.tsx         # Statistics cards
│   ├── CategoryCard.tsx          # Category display
│   ├── CategoryForm.tsx          # Category form
│   └── ImageUploadField.tsx      # Reusable image upload
├── hooks/
│   ├── useMenuItems.ts           # Menu CRUD operations
│   ├── useCategories.ts          # Category CRUD operations
│   ├── useMenuFilters.ts         # Filter state management
│   └── useMenuSearch.ts          # Search functionality
├── types/
│   └── index.ts                  # Feature-specific types
└── utils/
    ├── validation.ts             # Zod schemas (frontend)
    └── formatters.ts             # Price, date formatting
```

### Page Structure

```
app/client/src/app/(dashboard)/menu/
├── page.tsx                      # Menu items list page
├── categories/
│   ├── page.tsx                  # Categories list
│   └── [id]/
│       └── page.tsx              # Category detail/edit
└── [id]/
    └── page.tsx                  # Menu item detail/edit
```

## Key Design Decisions

### Decision 1: Feature-Based vs Domain-Based Organization

**Chosen**: Feature-based organization (`features/menu/`)

**Rationale**: 
- Aligns with existing codebase structure (`features/tables/`)
- Keeps related components, hooks, and types together
- Easier to locate and maintain related code
- Clear boundaries for menu-specific logic

**Alternative Considered**: Domain-based (`components/menu/`, `hooks/menu/`, `types/menu/`)
- **Rejected**: Spreads related files across multiple directories, harder navigation

---

### Decision 2: Server Components vs Client Components

**Chosen**: Mix of Server and Client Components with clear boundaries

**Strategy**:
- **Server Components**: Page layouts, static headers, initial data fetching
- **Client Components**: Interactive forms, filters, modals, real-time updates

**Rationale**:
- Leverages Next.js 16 App Router capabilities
- Reduces JavaScript bundle size
- Improves initial page load performance
- Maintains interactivity where needed

**Example Pattern**:
```tsx
// app/(dashboard)/menu/page.tsx (Server Component)
export default async function MenuPage() {
    // Can perform server-side data fetching if needed
    return <MenuItemsList />; // Client component for interactivity
}

// features/menu/components/MenuItemsList.tsx (Client Component)
"use client";
export function MenuItemsList() {
    // Client-side state and interactivity
}
```

---

### Decision 3: Form Validation Strategy

**Chosen**: Zod schemas mirroring backend validation

**Implementation**:
```typescript
// Reuse backend validation patterns
const menuItemFormSchema = z.object({
    itemName: z.string().min(1).max(100),
    categoryId: z.number().int().positive(),
    price: z.number().positive(),
    description: z.string().max(1000).optional(),
    // ... other fields matching backend
});
```

**Rationale**:
- Consistent validation between frontend and backend
- Clear error messages for users
- Type safety with TypeScript inference
- Prevents unnecessary API calls with invalid data

---

### Decision 4: Image Upload Approach

**Chosen**: Direct upload to storage service with preview

**Flow**:
```
1. User selects image
2. Frontend validates (size, type)
3. Upload to /storage endpoint
4. Receive imageUrl
5. Store URL in form state
6. Submit form with imageUrl
7. Backend saves URL to database
```

**Rationale**:
- Decouples image upload from entity creation
- Allows image preview before submit
- Reuses existing storage service
- Handles upload errors gracefully

**Alternative Considered**: Multipart form submission
- **Rejected**: More complex error handling, harder to implement preview

---

### Decision 5: List View Rendering

**Chosen**: Three view modes (Grid, List, Table) with persistent preference

**Implementation**:
- Grid: Card-based layout with images (default)
- List: Compact rows with key information
- Table: Dense data table for quick scanning

**Rationale**:
- Matches requirement in MENU_MANAGEMENT_FEATURES.md
- Different use cases prefer different views
- Grid for visual browsing, Table for quick editing
- Local storage persists user preference

---

### Decision 6: Search and Filter Strategy

**Chosen**: Client-side filter UI with server-side execution

**Flow**:
```
User adjusts filters → Update URL query params → 
Debounced API call → Server filters data → Update UI
```

**Benefits**:
- URL contains filter state (shareable, bookmarkable)
- Server-side filtering handles large datasets
- Debouncing reduces API calls
- Query params work with back/forward navigation

**Implementation**:
```typescript
const searchParams = useSearchParams();
const router = useRouter();

function updateFilters(newFilters: Filters) {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
        params.set(key, String(value));
    });
    router.push(`?${params.toString()}`);
}
```

---

### Decision 7: Error Handling Pattern

**Chosen**: Layered error handling with user-friendly messages

**Layers**:
1. **Validation Layer**: Zod catches input errors before submission
2. **Service Layer**: Axios interceptor handles HTTP errors
3. **Component Layer**: Try-catch with toast notifications
4. **Fallback Layer**: Error boundaries for unexpected crashes

**Example**:
```typescript
try {
    await menuApi.create(formData);
    toast.success("Menu item created successfully");
    router.push("/menu");
} catch (error) {
    if (error.response?.status === 400) {
        toast.error("Invalid data. Please check your inputs.");
    } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
    } else {
        toast.error("Failed to create menu item. Please try again.");
    }
}
```

---

### Decision 8: Optimistic Updates vs Refetch

**Chosen**: Hybrid approach based on operation type

**Strategy**:
- **Create/Delete**: Refetch after success (authoritative source)
- **Simple Updates**: Optimistic update for instant feedback (toggle availability)
- **Complex Updates**: Refetch to ensure consistency

**Rationale**:
- Balance between perceived performance and data accuracy
- Availability toggle is common and should feel instant
- Form submissions can afford slight delay for accuracy

---

### Decision 9: Mobile Responsiveness Strategy

**Chosen**: Mobile-first responsive design with view adaptations

**Breakpoints** (Tailwind default):
- **Mobile**: < 640px - Single column, simplified cards
- **Tablet**: 640px - 1024px - Two columns, compact layout
- **Desktop**: > 1024px - Full grid, all features visible

**Adaptations**:
- Mobile: Hide secondary info, stack filters vertically, swipe actions
- Tablet: Two-column grid, collapsible filters
- Desktop: Full grid, side-by-side filters, hover actions

---

### Decision 10: Loading State Strategy

**Chosen**: Skeleton screens for initial load, spinners for actions

**Patterns**:
- **Initial Page Load**: Skeleton cards matching final layout
- **Search/Filter**: Overlay spinner on existing content
- **Form Submit**: Button loading state with disabled form
- **Image Upload**: Progress indicator with preview

**Rationale**:
- Skeleton screens improve perceived performance
- Users understand content structure before load
- Clear feedback for every action

## Data Models (Frontend Types)

These mirror the backend Prisma schema:

```typescript
// types/index.ts
export interface MenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable: boolean;
    isActive: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian: boolean;
    calories?: number;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    category?: Category;
}

export interface Category {
    categoryId: number;
    categoryName: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    menuItems?: MenuItem[];
}

export interface MenuFilters {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isVegetarian?: boolean;
    spicyLevel?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```

## API Integration

All endpoints are already implemented and documented with Swagger:

### Menu Item Endpoints
- `GET /menu` - List menu items with filters
- `GET /menu/count` - Count menu items
- `GET /menu/:id` - Get single item
- `GET /menu/code/:code` - Get by code
- `GET /menu/category/:categoryId` - Get by category
- `POST /menu` - Create item
- `PUT /menu/:id` - Update item
- `PATCH /menu/:id/availability` - Toggle availability
- `DELETE /menu/:id` - Delete item

### Category Endpoints
- `GET /categories` - List categories
- `GET /categories/count` - Count categories
- `GET /categories/:id` - Get single category
- `GET /categories/:id/items` - Get category with items
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Image Upload Endpoint
- `POST /storage/upload` - Upload image file

## Security Considerations

**Already Implemented**:
- JWT authentication on all routes
- Role-based access control (authenticate middleware)
- Input validation on backend (Zod schemas)
- SQL injection prevention (Prisma ORM)

**Frontend Additions**:
- Client-side validation before API calls
- Secure token storage (httpOnly cookies)
- CSRF protection via headers
- File upload validation (type, size)

## Performance Considerations

**Optimizations**:
1. **Pagination**: Default 20 items per page
2. **Debounced Search**: 300ms delay to reduce API calls
3. **Image Lazy Loading**: Load images as they enter viewport
4. **Code Splitting**: Each page as separate chunk
5. **Memoization**: Expensive calculations cached with useMemo
6. **Virtual Scrolling**: If list exceeds 100 items

**Bundle Size Management**:
- Import only needed Radix UI components
- Tree-shaking with ES modules
- Dynamic imports for heavy components (image editor)

## Testing Strategy

**Note**: Testing implementation is explicitly excluded from this proposal, but for future reference:

**Unit Tests**: Component logic, hooks, utilities
**Integration Tests**: API service calls, form submissions
**E2E Tests**: Complete user flows (create, edit, delete)

## Accessibility Considerations

**WCAG 2.1 AA Compliance**:
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast ratios (4.5:1 minimum)
- Screen reader announcements for actions

**Radix UI Benefits**:
- Built-in accessibility features
- Keyboard navigation
- Focus trapping in dialogs
- ARIA attributes

## Deployment Considerations

**No Infrastructure Changes Required**:
- Frontend bundles to existing Next.js deployment
- Backend APIs already deployed
- Database schema exists
- No new environment variables needed

**Rollout Strategy**:
1. Deploy frontend changes
2. Verify connectivity to backend APIs
3. Monitor error logs
4. Gradual rollout to users

## Monitoring and Observability

**Frontend Metrics**:
- Page load times
- API response times
- Error rates by endpoint
- User action tracking (create, edit, delete counts)

**Integration Points**:
- Use existing Winston logger on backend
- Frontend console errors capture
- User feedback mechanisms (toast notifications)

## Future Enhancements (Out of Scope)

These are explicitly not included but noted for future consideration:

1. **Bulk Operations**: Import/export CSV, bulk price updates
2. **Advanced Filtering**: Multi-select categories, price range slider
3. **Drag-and-Drop Reordering**: Visual displayOrder management
4. **Image Gallery**: Multiple images per menu item
5. **Version History**: Track price changes over time
6. **Menu Templates**: Copy from existing items
7. **Seasonal Menus**: Time-based item visibility
8. **Nutritional Details**: Expanded allergen tracking
9. **Recipe Management**: Ingredient lists and preparation steps
10. **Analytics Dashboard**: Popular items, revenue by category
