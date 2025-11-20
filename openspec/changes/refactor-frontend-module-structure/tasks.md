# Tasks: Refactor Frontend Module Structure

## 1. Setup & Planning
- [x] 1.1 Audit current module structures and create inventory
- [x] 1.2 Create reference documentation for standard module structure
- [x] 1.3 Setup barrel exports template (index.ts)
- [x] 1.4 Document migration checklist

## 2. Menu Module Refactoring
- [x] 2.1 Create new structure: components/views/dialogs/services/hooks/types/utils
- [x] 2.2 Move menu.service.ts from services/ to modules/menu/services/
- [x] 2.3 Organize components:
  - [x] 2.3.1 Keep reusable components in components/
  - [x] 2.3.2 Move form components to dialogs/
  - [x] 2.3.3 Create views/ for main displays (MenuListView, MenuGridView)
- [x] 2.4 Update barrel exports (index.ts)
- [x] 2.5 Update imports in pages and components
- [x] 2.6 Create module README.md

## 3. Categories Module Refactoring
- [x] 3.1 Create new structure: components/views/dialogs/services/hooks/types/utils
- [x] 3.2 Move category logic from menu.service.ts to modules/categories/services/
- [x] 3.3 Organize components:
  - [x] 3.3.1 Keep CategoryCard in components/
  - [x] 3.3.2 Move CategoryForm to dialogs/
  - [x] 3.3.3 Create views/ for CategoryListView
- [x] 3.4 Update barrel exports
- [x] 3.5 Update imports in pages
- [x] 3.6 Create module README.md

## 4. Orders Module Refactoring
- [ ] 4.1 Create complete structure following standard pattern
- [ ] 4.2 Move order.service.ts and order-management.service.ts to modules/orders/services/
- [ ] 4.3 Organize existing components into proper folders
- [ ] 4.4 Create views/ for different order views (list, detail, timeline)
- [ ] 4.5 Create dialogs/ for order operations
- [ ] 4.6 Update barrel exports
- [ ] 4.7 Update imports throughout app
- [ ] 4.8 Create module README.md

## 5. Reservations Module Refactoring
- [x] 5.1 Create complete structure following standard pattern
- [x] 5.2 Move reservation.service.ts to modules/reservations/services/
- [x] 5.3 Organize components into components/views/dialogs
- [x] 5.4 Create hooks for reservation operations
- [x] 5.5 Define types and utils
- [x] 5.6 Update barrel exports
- [x] 5.7 Update imports throughout app
- [x] 5.8 Create module README.md

## 6. Kitchen Module Refactoring
- [ ] 6.1 Create complete structure following standard pattern
- [ ] 6.2 Move kitchen-management.service.ts to modules/kitchen/services/
- [ ] 6.3 Organize components into components/views/dialogs
- [ ] 6.4 Create hooks for kitchen operations
- [ ] 6.5 Define types and utils
- [ ] 6.6 Update barrel exports
- [ ] 6.7 Update imports throughout app
- [ ] 6.8 Create module README.md

## 7. Tables Module Validation & Visual Editor Integration
- [x] 7.1 Review existing tables structure (already well-organized)
- [x] 7.2 Merge visual-editor module into tables (VisualFloorPlanView dependency)
- [x] 7.3 Fix import paths for moved visual-editor components
- [x] 7.4 Create root barrel export (index.ts) for tables module
- [x] 7.5 Remove old visual-editor module folder
- [x] 7.6 Update README.md with complete structure including visual editor
- [x] 7.7 Build validation

## 8. Shared Components Organization
- [ ] 8.1 Keep components/shared/ for truly shared components
- [ ] 8.2 Keep components/ui/ for shadcn/ui components
- [ ] 8.3 Keep components/layouts/ for layout components
- [ ] 8.4 Keep components/providers/ for context providers
- [ ] 8.5 Move error-pages to app/ level if appropriate
- [ ] 8.6 Update barrel exports

## 9. Services Cleanup
- [ ] 9.1 Remove old service files from src/services/ after migration
- [ ] 9.2 Keep only auth.service.ts in services/ (or move to modules/auth if exists)
- [ ] 9.3 Keep upload.service.ts, bill.service.ts, supplier.service.ts in services/ (shared services)
- [ ] 9.4 Update service barrel exports

## 10. Global Updates
- [x] 10.1 Update all import statements across the app
- [ ] 10.2 Update tsconfig paths if needed
- [x] 10.3 Test all pages and features
- [ ] 10.4 Run linter and fix any issues
- [x] 10.5 Build project and verify no errors

## 11. Documentation
- [ ] 11.1 Update FRONTEND_DOCUMENTATION.md with new structure
- [ ] 11.2 Create CONTRIBUTING.md with module creation guidelines
- [ ] 11.3 Update project.md in openspec/
- [ ] 11.4 Add migration notes for other developers
- [ ] 11.5 Create visual diagram of new structure

## 12. Testing & Validation
- [ ] 12.1 Run full test suite (if exists)
- [x] 12.2 Manual testing of all features
- [ ] 12.3 Check for circular dependencies
- [x] 12.4 Verify bundle size hasn't increased significantly
- [x] 12.5 Test dev and production builds

## 13. Rollout
- [ ] 13.1 Create detailed PR with migration notes
- [ ] 13.2 Review with team
- [ ] 13.3 Merge and deploy
- [ ] 13.4 Monitor for issues
- [ ] 13.5 Address any post-deployment issues
