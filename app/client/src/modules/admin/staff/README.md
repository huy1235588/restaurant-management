# Staff Management Module

Frontend module for managing restaurant staff members, their roles, and permissions.

## Overview

This module provides a complete staff management interface including:
- Staff listing with grid/table views
- Create, edit, and delete staff members
- Quick role changes
- Status toggle (active/inactive)
- Filtering and search
- Statistics dashboard

## Architecture

```
staff/
├── types/                 # TypeScript type definitions
│   └── index.ts          # Staff, Account, Role types
├── services/             # API client layer
│   ├── staff.service.ts  # REST API calls
│   └── index.ts          # Barrel export
├── hooks/                # React hooks
│   ├── useStaff.ts       # Data fetching hooks
│   ├── useStaffActions.ts # Mutation hooks
│   ├── useStaffStats.ts  # Statistics hook
│   └── index.ts          # Barrel export
├── utils/                # Utility functions
│   ├── validation.ts     # Zod schemas
│   └── index.ts          # Formatters + exports
├── components/           # Reusable UI components
│   ├── RoleBadge.tsx     # Role display with colors
│   ├── StaffCard.tsx     # Grid view card
│   ├── StaffListRow.tsx  # Table view row
│   ├── StaffFilters.tsx  # Filter controls
│   ├── StaffSearch.tsx   # Search input
│   ├── StaffStats.tsx    # Statistics display
│   ├── ViewModeSwitcher.tsx # Grid/Table toggle
│   └── index.ts          # Barrel export
├── dialogs/              # Modal dialogs
│   ├── single/           # Single-item operations
│   │   ├── StaffFormDialog.tsx    # Create/Edit form
│   │   ├── StaffDetailDialog.tsx  # View details
│   │   ├── ChangeRoleDialog.tsx   # Quick role change
│   │   ├── DeleteStaffDialog.tsx  # Delete confirmation
│   │   └── index.ts
│   ├── bulk/             # Bulk operations (placeholder)
│   │   └── index.ts
│   └── index.ts
├── views/                # Page-level views
│   ├── StaffList.tsx     # Main list view
│   └── index.ts
├── index.ts              # Module barrel export
└── README.md             # This file
```

## Usage

### Basic Usage

```tsx
import { StaffList } from '@/modules/admin/staff';

function StaffPage() {
  return <StaffList />;
}
```

### Using Individual Components

```tsx
import { 
  RoleBadge, 
  StaffCard, 
  useStaff, 
  useStaffActions 
} from '@/modules/admin/staff';

function CustomComponent() {
  const { data: staff } = useStaff();
  const { createStaff } = useCreateStaff();
  
  return (
    <>
      {staff?.map(s => (
        <StaffCard key={s.id} staff={s} />
      ))}
    </>
  );
}
```

## API Endpoints

The module communicates with the following backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | Get all staff (with filters) |
| GET | `/staff/:id` | Get staff by ID |
| GET | `/staff/role/:role` | Get staff by role |
| POST | `/staff` | Create new staff |
| PUT | `/staff/:id` | Update staff |
| PATCH | `/staff/:id/role` | Update staff role |
| PUT | `/staff/:id/activate` | Activate staff |
| PUT | `/staff/:id/deactivate` | Deactivate staff |
| DELETE | `/staff/:id` | Delete staff |
| GET | `/accounts` | Get all accounts |
| GET | `/accounts/available` | Get accounts without staff |

## Role Colors

Roles are displayed with consistent colors:

| Role | Color |
|------|-------|
| Admin | Red |
| Manager | Blue |
| Waiter | Green |
| Chef | Orange |
| Cashier | Purple |

## Permissions

The module respects role-based access control:

- **Admin**: Full access (CRUD + role changes + delete)
- **Manager**: View, create, edit, toggle status (no delete, no role change)
- **Other roles**: No access to staff management

## Internationalization

All text uses i18next translation keys under the `staff.*` namespace:

```json
{
  "staff": {
    "title": "Staff Management",
    "createStaff": "Add Staff",
    "messages": {
      "createSuccess": "Staff created successfully"
    }
  }
}
```

## Form Validation

Uses Zod schemas for form validation:

- Full name: Required, min 2 characters
- Position: Required
- Phone: Required, valid format
- Salary: Optional, min 0
- Role: Required (when creating with account)

## Dependencies

- React Query (TanStack Query) for data fetching
- Zod for validation
- React Hook Form for form handling
- Radix UI for accessible components
- Sonner for toast notifications
- i18next for translations

## Development

### Adding New Features

1. Add types in `types/index.ts`
2. Add API calls in `services/staff.service.ts`
3. Add hooks in `hooks/`
4. Add components in `components/` or `dialogs/`
5. Update exports in barrel files
6. Add translations in `locales/en.json` and `locales/vi.json`

### Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```
