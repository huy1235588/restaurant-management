# Tasks: Validate Documentation

## Phase 1: Setup & Preparation (4 tasks)

- [ ] **Setup validation environment**
  - Review validation checklist from design.md
  - Prepare grep commands for code analysis
  - Open relevant documentation and source files
  - Set up note-taking for discrepancies found

- [ ] **Analyze database schema baseline**
  - Run `npx prisma format` in app/server
  - Extract all models, enums, relationships from schema.prisma
  - List all indexes and constraints
  - Document current schema structure for reference

- [ ] **Analyze backend API baseline**
  - List all controller files in app/server/src/modules/
  - Extract endpoints using `rg "@Controller|@Get|@Post|@Put|@Delete|@Patch"`
  - Document authorization guards and roles
  - Create endpoint inventory for comparison

- [ ] **Analyze frontend pages baseline**
  - List all pages in app/client/src/app/admin/
  - Document major feature flows
  - Note RBAC-protected routes
  - Create feature inventory for use case validation

## Phase 2: Validate API Documentation (4 tasks)

- [ ] **Validate ORDER_API.md**
  - Compare documented endpoints with app/server/src/modules/order/order.controller.ts
  - Verify all HTTP methods, paths, query parameters
  - Check request/response DTOs against actual DTOs
  - Validate authorization requirements with guards
  - Verify WebSocket events if documented
  - Update documentation with corrections
  - **Deliverable**: Updated ORDER_API.md with 100% accuracy

- [ ] **Validate KITCHEN_API.md**
  - Compare documented endpoints with app/server/src/modules/kitchen/kitchen.controller.ts
  - Verify kitchen order workflows and status transitions
  - Check WebSocket events and namespaces
  - Validate real-time update documentation
  - Verify authorization for kitchen-specific endpoints
  - Update documentation with corrections
  - **Deliverable**: Updated KITCHEN_API.md with accurate kitchen flows

- [ ] **Validate RESERVATION_API.md**
  - Compare documented endpoints with app/server/src/modules/reservation/reservation.controller.ts
  - Verify reservation status enum values
  - Check query parameters and filtering options
  - Validate RBAC permissions for reservation management
  - Verify audit trail documentation
  - Update documentation with corrections
  - **Deliverable**: Updated RESERVATION_API.md with complete reservation API

- [ ] **Validate BILLING_API.md**
  - Compare documented endpoints with app/server/src/modules/billing/billing.controller.ts
  - Verify payment method enums
  - Check payment status transitions
  - Validate calculation logic documentation
  - Verify invoice generation endpoints
  - Update documentation with corrections
  - **Deliverable**: Updated BILLING_API.md with accurate billing flows

## Phase 3: Validate Architecture Documentation (5 tasks)

- [ ] **Validate DATABASE.md tables and models**
  - Compare all documented tables with Prisma schema
  - Verify all field types, constraints, defaults
  - Check all relationships (1:1, 1:N, N:M)
  - Validate foreign key descriptions
  - Add missing tables or remove deprecated ones
  - Update field descriptions for clarity
  - **Deliverable**: DATABASE.md accurately reflecting all 18+ tables

- [ ] **Validate DATABASE.md enums**
  - Compare all documented enums with Prisma schema
  - Verify enum value lists (Role, OrderStatus, TableStatus, etc.)
  - Check enum usage descriptions
  - Update any outdated enum values
  - **Deliverable**: All enum documentation accurate

- [ ] **Validate ERD.mmd diagram**
  - Compare ERD entities with Prisma models
  - Verify all relationships shown correctly
  - Check cardinality notations (1:1, 1:N, N:M)
  - Validate mermaid syntax renders correctly
  - Update diagram if needed
  - **Deliverable**: Up-to-date ERD matching current schema

- [ ] **Validate DATABASE_QUERIES.md and DATABASE_OPTIMIZATION.md**
  - Review query examples for syntax correctness
  - Verify queries work with current schema
  - Check optimization recommendations are relevant
  - Validate index usage examples
  - Update outdated query patterns
  - **Deliverable**: Query and optimization docs reflecting best practices

- [ ] **Validate RESERVATION_SYSTEM.md architecture**
  - Review architecture description against implementation
  - Verify component interactions
  - Check state machine logic with ReservationStatus enum
  - Validate integration points (orders, tables, customers)
  - Update architecture diagrams if needed
  - **Deliverable**: Accurate reservation system architecture doc

## Phase 4: Validate Diagrams (7 tasks)

- [ ] **Validate AUTHENTICATION_MANAGEMENT_DIAGRAMS.md**
  - Review sequence diagrams against auth controller and JWT logic
  - Verify login/logout flows match implementation
  - Check token refresh mechanism
  - Validate role-based access control flows
  - Update diagrams for accuracy
  - Ensure mermaid syntax is valid
  - **Deliverable**: Accurate authentication diagrams

- [ ] **Validate ORDER_MANAGEMENT_DIAGRAMS.md**
  - Verify order creation sequence diagram
  - Check order status transition state diagram
  - Validate kitchen order flow
  - Verify waiter-kitchen-customer interactions
  - Update diagrams to match actual flows
  - **Deliverable**: Accurate order management visual flows

- [ ] **Validate RESERVATION_MANAGEMENT_DIAGRAMS.md**
  - Verify reservation creation flowchart
  - Check reservation status state diagram
  - Validate confirmation and cancellation flows
  - Verify no-show and seated transitions
  - Update diagrams for accuracy
  - **Deliverable**: Complete reservation flow diagrams

- [ ] **Validate BILL_PAYMENT_MANAGEMENT_DIAGRAMS.md**
  - Verify billing creation sequence
  - Check payment processing flowchart
  - Validate payment method branches (cash, card, momo, bank_transfer)
  - Verify refund and cancellation flows
  - Update diagrams to match implementation
  - **Deliverable**: Accurate billing and payment diagrams

- [ ] **Validate MENU_MANAGEMENT_DIAGRAMS.md**
  - Verify menu CRUD operations sequence
  - Check category management flows
  - Validate image upload process
  - Verify availability status changes
  - Update diagrams for current implementation
  - **Deliverable**: Accurate menu management diagrams

- [ ] **Validate STAFF_MANAGEMENT_DIAGRAMS.md**
  - Verify staff CRUD operations
  - Check role assignment flows
  - Validate account activation/deactivation
  - Verify permission checking flows
  - Update diagrams to match RBAC implementation
  - **Deliverable**: Accurate staff management diagrams

- [ ] **Validate INVENTORY_MANAGEMENT_DIAGRAMS.md**
  - Review inventory-related flows (if implemented)
  - Check if inventory module exists in codebase
  - Mark as "Not Implemented" if feature missing
  - Update or remove diagrams accordingly
  - **Deliverable**: Clarified inventory documentation status

## Phase 5: Validate Use Cases (7 tasks)

- [ ] **Validate AUTHENTICATION_MANAGEMENT.md**
  - Verify login use case with actual login page
  - Check role assignment with RBAC guards
  - Validate password reset flows (if implemented)
  - Verify actor permissions match Role enum
  - Update workflows to match UI
  - **Deliverable**: Accurate authentication use cases

- [ ] **Validate ORDER_MANAGEMENT.md**
  - Verify order creation workflow with UI in app/client/src/app/admin/orders/new/
  - Check order editing flows with edit page
  - Validate waiter interactions and permissions
  - Verify kitchen handoff process
  - Update use cases to match actual feature set
  - **Deliverable**: Complete order management use cases

- [ ] **Validate RESERVATION_MANAGEMENT.md**
  - Verify reservation booking workflow with UI
  - Check customer information requirements
  - Validate confirmation and cancellation flows
  - Verify table assignment process
  - Update scenarios to match implementation
  - **Deliverable**: Accurate reservation use cases

- [ ] **Validate BILL_PAYMENT_MANAGEMENT.md**
  - Verify bill creation from order
  - Check payment method selection
  - Validate payment processing workflows
  - Verify receipt generation (if implemented)
  - Update use cases with actual flows
  - **Deliverable**: Complete billing use cases

- [ ] **Validate MENU_MANAGEMENT.md**
  - Verify menu item CRUD workflows with app/client/src/app/admin/menu/
  - Check category assignment
  - Validate image upload process
  - Verify availability toggle
  - Update use cases to match UI
  - **Deliverable**: Accurate menu management use cases

- [ ] **Validate STAFF_MANAGEMENT.md**
  - Verify staff CRUD workflows with staff page
  - Check role assignment process
  - Validate permission management
  - Verify account status management
  - Update actors and permissions
  - **Deliverable**: Complete staff management use cases

- [ ] **Validate INVENTORY_MANAGEMENT.md**
  - Check if inventory features are implemented
  - Review codebase for inventory module
  - Mark use cases as "Planned" or "Not Implemented" if missing
  - Update or remove use cases accordingly
  - **Deliverable**: Clarified inventory use case status

## Phase 6: Quality Assurance & Finalization (3 tasks)

- [ ] **Cross-reference validation**
  - Verify consistency between API docs, diagrams, and use cases
  - Check that all modules mentioned in use cases have API docs
  - Ensure diagrams reference correct API endpoints
  - Validate database references across all docs
  - Fix any inconsistencies found
  - **Deliverable**: Consistent documentation across all types

- [ ] **Create validation report**
  - Summarize all changes made
  - List discrepancies found and fixed
  - Document modules with missing documentation
  - Note any ongoing migrations affecting docs
  - Create recommendations for future validation
  - **Deliverable**: Comprehensive validation report

- [ ] **Document validation process**
  - Update validation checklist with lessons learned
  - Document common issues and solutions
  - Create guidelines for maintaining documentation
  - Propose integration with development workflow
  - **Deliverable**: Reusable validation process documentation

## Validation Checklist

Use this checklist for each document validated:

### API Documentation Checklist
- [ ] All endpoints exist in controller
- [ ] HTTP methods correct
- [ ] Request schemas match DTOs
- [ ] Response schemas accurate
- [ ] Query parameters documented
- [ ] Path parameters documented
- [ ] Authorization requirements correct
- [ ] Error responses documented
- [ ] Examples accurate
- [ ] WebSocket events documented (if applicable)

### Architecture Documentation Checklist
- [ ] All models/tables documented
- [ ] Field types and constraints correct
- [ ] Relationships accurate
- [ ] Enums match schema
- [ ] Indexes documented
- [ ] Architecture descriptions accurate
- [ ] Examples valid and current

### Diagrams Checklist
- [ ] Sequence diagrams match API flows
- [ ] Flowcharts reflect business logic
- [ ] State diagrams match enums
- [ ] Actor interactions correct
- [ ] All major flows covered
- [ ] Error handling shown
- [ ] Mermaid syntax valid
- [ ] Diagrams render correctly

### Use Case Checklist
- [ ] User stories match implemented features
- [ ] Actors and roles correct
- [ ] Permissions align with RBAC
- [ ] Workflows reflect actual UI
- [ ] Preconditions accurate
- [ ] Postconditions correct
- [ ] Error scenarios covered
- [ ] Examples clear and accurate

## Notes

- **Priority**: Focus on order management, reservation, and billing first (core business flows)
- **Dependencies**: Some tasks can run in parallel (e.g., different API docs)
- **Flexibility**: If a module is not implemented, mark documentation clearly instead of deleting
- **Version Control**: Commit changes incrementally after each phase
- **Review**: Self-review all changes before marking task complete

## Estimated Effort

- Phase 1: 2-3 hours
- Phase 2: 3-4 hours
- Phase 3: 3-4 hours
- Phase 4: 4-5 hours
- Phase 5: 4-5 hours
- Phase 6: 2-3 hours

**Total**: ~20-25 hours of focused work
