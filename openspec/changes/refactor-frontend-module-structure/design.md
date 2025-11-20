# Design: Frontend Module Structure Refactoring

## Context

The restaurant management system frontend currently has an inconsistent module organization. The `tables` module follows a well-structured pattern with clear separation of concerns (components/views/dialogs), while other modules like `menu`, `categories`, `orders`, `reservations`, and `kitchen` lack this organization. Additionally, services are centralized in `src/services/` rather than colocated with their respective features.

This refactoring aims to standardize all modules following the successful `tables` pattern, improving maintainability, scalability, and developer experience.

## Goals / Non-Goals

### Goals
- Standardize module structure across all features
- Improve code discoverability and maintainability
- Colocate related code (components, services, hooks, types)
- Maintain clear separation between shared and feature-specific code
- Preserve all existing functionality during migration
- Create clear conventions for future development

### Non-Goals
- Change application functionality or behavior
- Refactor individual components' internal logic
- Optimize performance (separate concern)
- Add new features (separate changes)
- Change UI/UX design

## Decisions

### Decision 1: Standard Module Structure

**Chosen**: Follow the `tables` module pattern

```
modules/[feature]/
├── components/           # Reusable UI components
│   ├── index.ts         # Barrel exports
│   └── *.tsx            # Individual components
├── views/               # Main view components (pages)
│   ├── index.ts
│   └── *View.tsx        # List views, detail views, etc.
├── dialogs/             # Modal dialogs
│   ├── index.ts
│   ├── single/          # Single item operations
│   │   ├── index.ts
│   │   └── *Dialog.tsx
│   └── bulk/            # Bulk operations
│       ├── index.ts
│       └── Bulk*Dialog.tsx
├── services/            # API calls and data fetching
│   ├── index.ts
│   └── [feature].service.ts
├── hooks/               # Custom React hooks
│   ├── index.ts
│   └── use*.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Helper functions
│   └── index.ts
├── [Feature]Manager.tsx # Optional: Dialog orchestrator
├── README.md           # Module documentation
└── index.ts            # Module barrel export
```

**Rationale**:
- Proven pattern already working in `tables` module
- Clear separation of concerns
- Easy to navigate and understand
- Scales well with feature growth
- Follows React/Next.js best practices

**Alternatives Considered**:
1. **Domain-driven structure** (components/, hooks/, services/ at root)
   - ❌ Spreads related code across directories
   - ❌ Harder to find feature-specific code
   - ❌ Increases coupling

2. **Flat structure** (all components in one folder)
   - ❌ Doesn't scale well
   - ❌ Hard to distinguish component types
   - ❌ Messy as features grow

### Decision 2: Service Location

**Chosen**: Colocate services within each feature module

**Rationale**:
- Services are feature-specific and tightly coupled to module logic
- Easier to understand data flow within a feature
- Reduces cross-module dependencies
- Follows feature-based architecture principles

**Migration Strategy**:
```typescript
// Before: Centralized services
src/services/
├── menu.service.ts
├── order.service.ts
├── reservation.service.ts
└── kitchen-management.service.ts

// After: Colocated services
src/modules/menu/services/menu.service.ts
src/modules/orders/services/order.service.ts
src/modules/reservations/services/reservation.service.ts
src/modules/kitchen/services/kitchen.service.ts

// Keep shared services in src/services/
src/services/
├── auth.service.ts        # Authentication is cross-cutting
├── upload.service.ts      # File upload is shared
├── bill.service.ts        # Bill might be shared
└── supplier.service.ts    # Supplier might be shared
```

**Exception**: Keep truly shared services (auth, upload, bill, supplier) in `src/services/` if they're used across multiple modules.

### Decision 3: Barrel Exports (index.ts)

**Chosen**: Use barrel exports at every level

**Example**:
```typescript
// modules/menu/components/index.ts
export { MenuItemCard } from './MenuItemCard';
export { MenuItemList } from './MenuItemList';
export { MenuItemFilters } from './MenuItemFilters';

// modules/menu/index.ts
export * from './components';
export * from './views';
export * from './dialogs';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
```

**Rationale**:
- Simplifies imports: `from '@/modules/menu'` instead of long paths
- Makes refactoring easier (only update barrel exports)
- Provides clear public API for each module
- Reduces coupling to internal structure

### Decision 4: Components Classification

**Categories**:

1. **Components** (`components/`): Small, reusable UI pieces
   - Cards, badges, filters, search bars
   - Can be used in multiple views
   - Focus on presentation

2. **Views** (`views/`): Complete page-level components
   - ListView, GridView, DetailView
   - Compose multiple components
   - Handle layout and data fetching

3. **Dialogs** (`dialogs/`): Modal interactions
   - Forms (create, edit)
   - Confirmations (delete)
   - Info displays (history, details)
   - Separate single vs bulk operations

**Rationale**:
- Clear responsibility boundaries
- Easier to locate code
- Prevents components from growing too large
- Natural organization that developers intuitively understand

### Decision 5: Shared Components

**Chosen**: Maintain separate shared component folders

```
src/components/
├── ui/              # shadcn/ui components (Button, Input, etc.)
├── shared/          # Truly shared components (LoadingSpinner, EmptyState)
├── layouts/         # Layout components (Header, Sidebar, Footer)
└── providers/       # Context providers (AuthProvider, ThemeProvider)
```

**Rationale**:
- UI components are atomic design system elements
- Shared components are used across multiple features
- Layouts define app structure
- Providers manage global state
- Clear distinction from feature-specific code

### Decision 6: Migration Strategy

**Chosen**: Incremental module-by-module migration

**Order**:
1. Menu (medium complexity, good starting point)
2. Categories (simple, can validate pattern)
3. Orders (complex, stress test pattern)
4. Reservations (medium complexity)
5. Kitchen (medium complexity)
6. Visual Editor (validation only, already good)

**Per-Module Steps**:
1. Create new folder structure
2. Move/copy files to new locations
3. Update barrel exports
4. Update imports in module files
5. Update imports in pages/app
6. Test module functionality
7. Delete old files
8. Update documentation

**Rationale**:
- Reduces risk of breaking everything at once
- Allows testing after each module
- Can pause/rollback if issues arise
- Team can continue work on other modules
- Learn and adjust pattern as we go

### Decision 7: Import Path Strategy

**Chosen**: Update to use module-level imports

```typescript
// ❌ Before
import { MenuItemCard } from '@/components/features/menu/MenuItemCard';
import { menuApi } from '@/services/menu.service';

// ✅ After
import { MenuItemCard } from '@/modules/menu';
import { menuApi } from '@/modules/menu/services';

// Specific imports when needed
import { MenuItemCard } from '@/modules/menu/components/MenuItemCard';
```

**Rationale**:
- Cleaner, shorter imports
- Consistent import style
- Easy to refactor internal structure
- Clear module boundaries

## Technical Decisions

### File Naming Conventions

- **Components**: PascalCase (e.g., `MenuItemCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useMenuItems.ts`)
- **Services**: kebab-case with `.service` suffix (e.g., `menu.service.ts`)
- **Types**: kebab-case or grouped in `index.ts` (e.g., `types/index.ts`)
- **Utils**: camelCase (e.g., `formatPrice.ts`)

### TypeScript Configuration

No changes needed to tsconfig.json. Existing path mapping works:
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Testing Strategy

1. **Manual Testing Checklist**:
   - [ ] All pages load without errors
   - [ ] All features work as before
   - [ ] No console errors
   - [ ] Build succeeds

2. **Validation**:
   - [ ] Run `npm run build`
   - [ ] Check bundle size (should not increase)
   - [ ] Test in development mode
   - [ ] Test in production build

3. **Import Validation**:
   - Use IDE "Find All References" to ensure all imports updated
   - Search for old import patterns: `@/services/menu`, `@/services/order`

## Migration Plan

### Phase 1: Setup (1 hour)

1. Create standard module template
2. Document conventions in CONTRIBUTING.md
3. Create migration checklist
4. Setup test plan

### Phase 2: Menu Module (2-3 hours)

1. Create new structure
2. Move menu.service.ts
3. Reorganize components:
   - Keep cards, filters, search in components/
   - Move MenuItemForm to dialogs/single/
   - Create MenuListView and MenuGridView in views/
4. Update all imports
5. Test thoroughly
6. Document in README.md

### Phase 3: Categories Module (1-2 hours)

1. Create new structure
2. Extract category API from menu.service.ts → categories/services/
3. Move CategoryForm to dialogs/
4. Create CategoryListView
5. Update imports
6. Test and document

### Phase 4: Orders Module (2-3 hours)

1. Create complete structure
2. Move order.service.ts and order-management.service.ts
3. Organize components into structure
4. Create views for different order displays
5. Create dialogs for order operations
6. Update imports
7. Test and document

### Phase 5: Reservations Module (2-3 hours)

1. Create complete structure
2. Move reservation.service.ts
3. Organize components
4. Create views and dialogs
5. Update imports
6. Test and document

### Phase 6: Kitchen Module (2-3 hours)

1. Create complete structure
2. Move kitchen-management.service.ts
3. Organize components
4. Create views and dialogs
5. Update imports
6. Test and document

### Phase 7: Cleanup & Documentation (1-2 hours)

1. Remove old service files
2. Update FRONTEND_DOCUMENTATION.md
3. Create architecture diagram
4. Update openspec/project.md
5. Final testing
6. Team review

**Total Estimated Time**: 11-17 hours

## Risks / Trade-offs

### Risks

1. **Import Hell During Migration**
   - **Risk**: Temporary broken imports during migration
   - **Mitigation**: Migrate one module at a time, test thoroughly
   - **Impact**: Medium

2. **Merge Conflicts**
   - **Risk**: Other developers' work might conflict
   - **Mitigation**: Communicate migration plan, create feature branch, merge frequently
   - **Impact**: Low-Medium

3. **Missed Imports**
   - **Risk**: Some imports might be missed, causing runtime errors
   - **Mitigation**: Use IDE search, test all features, check build output
   - **Impact**: Low

4. **Service Dependencies**
   - **Risk**: Services might have circular dependencies
   - **Mitigation**: Review dependencies before moving, keep shared services separate
   - **Impact**: Low

### Trade-offs

1. **Short-term Disruption vs Long-term Benefit**
   - Short-term: Development slows during migration
   - Long-term: Much faster development with clear structure
   - **Decision**: Worth it

2. **More Files vs Better Organization**
   - More files and folders to navigate
   - But much clearer where to find things
   - **Decision**: Worth it

3. **Migration Effort vs Benefit**
   - Significant time investment (11-17 hours)
   - Huge improvement in maintainability
   - **Decision**: Worth it

## Success Criteria

### Must Have
- ✅ All modules follow standard structure
- ✅ No broken functionality
- ✅ All imports updated
- ✅ Project builds successfully
- ✅ Documentation updated

### Should Have
- ✅ Module README files
- ✅ Clear migration guide for team
- ✅ Architecture diagram
- ✅ Updated conventions in CONTRIBUTING.md

### Nice to Have
- ✅ Automated import validation script
- ✅ Module generator CLI tool
- ✅ Architecture decision record (this document)

## Open Questions

1. **Should we create a modules/ generator script?**
   - Could automate creation of standard structure
   - Would help maintain consistency
   - **Answer**: Nice to have, can add after migration

2. **Should bill and supplier services stay in services/?**
   - Need to check if they're truly shared or feature-specific
   - **Answer**: Keep in services/ if used by multiple modules

3. **Should we migrate all at once or incrementally?**
   - **Answer**: Incrementally (decided above)

4. **How to handle authentication?**
   - Create modules/auth/ or keep in services/?
   - **Answer**: Keep in services/ as it's cross-cutting

## References

- [Tables Module README](../../../app/client/src/modules/tables/README.md)
- [Feature-Based Architecture](https://khalilstemmler.com/articles/software-design-architecture/organizing-app-logic/)
- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [React File Structure](https://react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy)
