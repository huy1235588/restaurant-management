# Implement Menu Management

## Why

The backend APIs for menu and category management are fully implemented with authentication, validation, and database schema in place, but the frontend implementation is missing entirely. Restaurant staff need a user-friendly interface to manage menu items and categories with CRUD operations, search/filter capabilities, image uploads, and availability management to keep their menu up-to-date and organized.

## What Changes

**Category Management:**
- Category list view with grid layout, search, filtering, and sorting
- Category CRUD operations with image upload
- Category statistics dashboard
- Category detail page showing associated menu items
- Quick toggle for active/inactive status
- Empty states and error handling
- Responsive design for mobile/tablet/desktop

**Menu Item Management:**
- Menu item list with three view modes (grid/list/table)
- Comprehensive menu item CRUD with all fields (price, cost, description, dietary info, etc.)
- Advanced search and filtering (category, price range, availability, vegetarian, spicy level)
- Statistics dashboard (total, available, out of stock, new this month)
- Quick availability toggle
- Sort by name, price, date, display order
- Pagination for large datasets
- Item detail page with duplicate feature
- Form autosave to prevent data loss
- Loading states, empty states, error states
- Keyboard navigation and accessibility (WCAG 2.1 AA)
- Responsive design across devices

**Image Upload:**
- Reusable image upload component with drag-and-drop
- File validation (type, size max 5MB)
- Image preview and replace functionality
- Integration with existing `/storage` API
- Lazy loading for performance

**Integration:**
- Connect to existing backend APIs (`/menu`, `/categories`, `/storage`)
- Use React Hook Form + Zod validation (matching backend schemas)
- Follow Next.js 16 App Router patterns
- Reuse Radix UI components and Tailwind styling
- Maintain authentication via JWT middleware

## Impact

### Affected Specs
- `category-management` (NEW capability)
- `menu-management` (NEW capability)

### Affected Code
- `app/client/src/app/(dashboard)/menu/` - New pages for menu and categories
- `app/client/src/features/menu/` - New feature module (components, hooks, types, utils)
- `app/client/src/services/menu.service.ts` - Already exists, will be consumed
- Backend APIs `/menu` and `/categories` - Already implemented, no changes

### User Experience Impact
- **Positive**: Restaurant staff can now manage their menu through intuitive UI
- **Positive**: Quick availability toggles improve operational efficiency
- **Positive**: Advanced filtering helps find items quickly in large menus
- **No Breaking Changes**: This is entirely new frontend functionality

### Non-Goals
- Testing implementation (explicitly excluded)
- Documentation (explicitly excluded)
- Backend API modifications (already complete)
- Database schema changes (already established)
- Bulk import/export, recipe management, advanced inventory (future enhancements)
