# Capability: Documentation Validation

## Overview

Validation system để đảm bảo tài liệu kỹ thuật (API, architecture, diagrams, use cases) luôn đồng bộ với implementation thực tế của hệ thống restaurant management.

## ADDED Requirements

### Requirement: API Documentation Accuracy
**ID**: `doc-val-api-001`
**Priority**: High
**Category**: Documentation Quality

API documentation MUST accurately reflect endpoints, request/response schemas, and authorization requirements implemented in backend controllers. The documentation SHALL be validated against actual controller implementations and updated to match the current codebase.

#### Scenario: Validate Order API Endpoints
**Given** documentation in `docs/api/ORDER_API.md`
**And** implementation in `app/server/src/modules/order/order.controller.ts`
**When** validation process runs
**Then** all documented endpoints must exist in controller
**And** all HTTP methods must match
**And** all query parameters must be documented
**And** all request/response DTOs must match
**And** all authorization guards must be documented

#### Scenario: Validate Kitchen API WebSocket Events
**Given** documentation in `docs/api/KITCHEN_API.md`
**And** implementation in `app/server/src/modules/kitchen/`
**When** validation process runs
**Then** all documented WebSocket events must exist
**And** all event payloads must match actual implementation
**And** all event namespaces must be correct

#### Scenario: Validate Reservation API RBAC
**Given** documentation in `docs/api/RESERVATION_API.md`
**And** RBAC guards in `app/server/src/modules/reservation/reservation.controller.ts`
**When** validation process runs
**Then** all documented role requirements must match actual guards
**And** all documented permissions must be correct
**And** no undocumented authorization requirements exist

#### Scenario: Validate Billing API Response Schemas
**Given** documentation in `docs/api/BILLING_API.md`
**And** DTOs in `app/server/src/modules/billing/dto/`
**When** validation process runs
**Then** all response schemas must match actual DTOs
**And** all field types must be correct
**And** all required/optional fields must be accurate

---

### Requirement: Database Schema Documentation Accuracy
**ID**: `doc-val-db-001`
**Priority**: High
**Category**: Architecture Documentation

Database documentation MUST accurately reflect the Prisma schema, relationships, constraints, and indexes. The documentation SHALL be validated against the current schema.prisma file and all discrepancies MUST be corrected.

#### Scenario: Validate Database Tables
**Given** documentation in `docs/architecture/DATABASE.md`
**And** Prisma schema in `app/server/prisma/schema.prisma`
**When** validation process runs
**Then** all documented tables must exist in schema
**And** all table fields must match schema definitions
**And** all field types and constraints must be correct
**And** all relationships must be accurately documented

#### Scenario: Validate Enum Values
**Given** database documentation describing enums
**And** enum definitions in Prisma schema
**When** validation process runs
**Then** all documented enum values must match schema
**And** all enum usages must be correct
**And** no undocumented enum values exist

#### Scenario: Validate ERD Diagram
**Given** ERD diagram in `docs/architecture/ERD.mmd`
**And** Prisma schema defining all models and relationships
**When** validation process runs
**Then** ERD must include all models from schema
**And** all relationships must be correctly represented
**And** all cardinalities (1:1, 1:N, N:M) must be accurate
**And** diagram must render without syntax errors

#### Scenario: Validate Database Indexes
**Given** documentation describing indexes and optimization
**And** index definitions in Prisma schema
**When** validation process runs
**Then** all documented indexes must exist in schema
**And** all performance claims must be verifiable
**And** optimization recommendations must be relevant

---

### Requirement: Diagram Accuracy and Completeness
**ID**: `doc-val-diagram-001`
**Priority**: Medium
**Category**: Visual Documentation

Diagrams (sequence, flowchart, state) MUST accurately reflect actual flows, business logic, and state transitions in the implementation. All mermaid diagrams SHALL render without errors and visual flows MUST match the implemented system behavior.

#### Scenario: Validate Order Management Sequence Diagram
**Given** sequence diagram in `docs/diagrams/ORDER_MANAGEMENT_DIAGRAMS.md`
**And** order management implementation in backend and frontend
**When** validation process runs
**Then** all actor interactions must match actual API calls
**And** message sequence must reflect real flow
**And** database operations must be shown correctly
**And** error handling paths must be included

#### Scenario: Validate Reservation State Diagram
**Given** state diagram in `docs/diagrams/RESERVATION_MANAGEMENT_DIAGRAMS.md`
**And** `ReservationStatus` enum in Prisma schema
**And** state transition logic in reservation service
**When** validation process runs
**Then** all states must match enum values
**And** all transitions must be possible in code
**And** all transition triggers must be documented
**And** invalid transitions must not be shown

#### Scenario: Validate Authentication Flowchart
**Given** flowchart in `docs/diagrams/AUTHENTICATION_MANAGEMENT_DIAGRAMS.md`
**And** authentication logic in `app/server/src/modules/auth/`
**When** validation process runs
**Then** all decision points must reflect actual business logic
**And** all branches must be implemented
**And** JWT token flow must be accurate
**And** error scenarios must be included

#### Scenario: Validate Mermaid Syntax
**Given** all diagram files using mermaid syntax
**When** validation process runs
**Then** all mermaid code blocks must be syntactically valid
**And** all diagrams must render without errors
**And** all labels must be clear and readable

---

### Requirement: Use Case Documentation Alignment
**ID**: `doc-val-usecase-001`
**Priority**: Medium
**Category**: Functional Documentation

Use case documentation MUST align with implemented features, UI/UX flows, and RBAC permissions. All documented user stories SHALL reflect actual functionality and all actor permissions MUST match the RBAC implementation.

#### Scenario: Validate Menu Management Use Cases
**Given** use case documentation in `docs/use_case/MENU_MANAGEMENT.md`
**And** menu management implementation in frontend and backend
**When** validation process runs
**Then** all documented user stories must be implemented
**And** all workflows must match actual UI flow
**And** all actor permissions must align with RBAC guards
**And** all preconditions and postconditions must be accurate

#### Scenario: Validate Staff Management Actors
**Given** staff management use cases defining actors and roles
**And** RBAC implementation with Role enum and guards
**When** validation process runs
**Then** all documented roles must exist in system
**And** all permissions must match actual guards
**And** all actor capabilities must be implemented
**And** no documented capabilities should be missing

#### Scenario: Validate Order Management Workflows
**Given** order management workflows in use case documentation
**And** order management UI in `app/client/src/app/admin/orders/`
**When** validation process runs
**Then** all documented steps must exist in UI
**And** all user actions must be possible
**And** all system responses must match actual behavior
**And** all error scenarios must be handled

#### Scenario: Validate Bill Payment Scenarios
**Given** billing scenarios in use case documentation
**And** billing implementation in frontend and backend
**When** validation process runs
**Then** all payment methods must be implemented
**And** all calculation logic must be correct
**And** all payment flows must match documentation
**And** all edge cases must be handled

---

### Requirement: Architecture Documentation Consistency
**ID**: `doc-val-arch-001`
**Priority**: Medium
**Category**: Architecture Documentation

Architecture documentation MUST be consistent and up-to-date with system architecture patterns, design decisions, and technology choices. All architectural descriptions SHALL accurately reflect the current implementation and all design patterns MUST be correctly documented.

#### Scenario: Validate Reservation System Architecture
**Given** architecture documentation in `docs/architecture/RESERVATION_SYSTEM.md`
**And** reservation system implementation
**When** validation process runs
**Then** all architectural components must be implemented
**And** all design patterns must be correctly described
**And** all technology choices must be current
**And** all integration points must be accurate

#### Scenario: Validate Database Optimization Strategies
**Given** optimization documentation in `docs/architecture/DATABASE_OPTIMIZATION.md`
**And** actual database schema and queries
**When** validation process runs
**Then** all optimization techniques must be applicable
**And** all performance claims must be testable
**And** all index recommendations must be implemented or valid
**And** all query patterns must reflect actual usage

#### Scenario: Validate Database Query Examples
**Given** query examples in `docs/architecture/DATABASE_QUERIES.md`
**And** actual Prisma queries in service files
**When** validation process runs
**Then** all example queries must be syntactically valid
**And** all queries must work with current schema
**And** all query results must match documented outputs
**And** all best practices must be demonstrated

---

### Requirement: Documentation Completeness
**ID**: `doc-val-complete-001`
**Priority**: Low
**Category**: Documentation Coverage

Documentation MUST cover all major features and modules that are deployed. The validation process SHALL identify missing documentation and calculate coverage percentages. Critical modules MUST NOT be left undocumented.

#### Scenario: Verify API Documentation Coverage
**Given** all backend modules in `app/server/src/modules/`
**And** existing API documentation in `docs/api/`
**When** validation process runs
**Then** all major modules must have API documentation
**And** missing modules must be identified and reported
**And** coverage percentage must be calculated

#### Scenario: Verify Use Case Coverage
**Given** all frontend features in `app/client/src/app/admin/`
**And** existing use case documentation in `docs/use_case/`
**When** validation process runs
**Then** all major features must have use case documentation
**And** missing features must be identified
**And** incomplete use cases must be marked

#### Scenario: Verify Diagram Coverage
**Given** all major system flows and interactions
**And** existing diagrams in `docs/diagrams/`
**When** validation process runs
**Then** all critical flows must have diagrams
**And** missing diagrams must be identified
**And** diagram types (sequence, flowchart, state) must be appropriate

---

### Requirement: Documentation Maintenance Process
**ID**: `doc-val-process-001`
**Priority**: Medium
**Category**: Process & Tooling

A validation process MUST be established to maintain documentation accuracy over time. Validation checklists SHALL be created and version controlled. The process MUST be integrated into the development workflow to ensure documentation stays current.

#### Scenario: Create Validation Checklist
**Given** validation methodology defined in design document
**When** validation process is established
**Then** reusable validation checklist must be created
**And** checklist must cover all documentation types
**And** checklist must be easy to follow
**And** checklist must be version controlled

#### Scenario: Document Validation Process
**Given** completed documentation validation
**When** finalizing validation work
**Then** validation process must be documented
**And** best practices must be captured
**And** common issues and solutions must be noted
**And** future validation guidelines must be provided

#### Scenario: Integrate Documentation Review in Development
**Given** established validation process
**When** defining development workflow
**Then** documentation review must be part of PR checklist
**And** documentation updates must be required for API changes
**And** validation tools must be accessible to all developers

---

## Implementation Notes

### Validation Order
1. Database schema first (foundation)
2. API documentation (depends on schema)
3. Use cases (depends on API)
4. Diagrams (depends on all above)

### Quality Gates
- **Critical**: API docs and database schema must be 100% accurate
- **Important**: Use cases and major diagrams must be validated
- **Nice-to-have**: Complete diagram coverage for all flows

### Out of Scope
- Creating documentation for undocumented modules (separate change)
- Translating documentation (keep existing language)
- Refactoring documentation structure (only content updates)
- Automated validation tooling (future enhancement)

### Dependencies
- Access to source code (backend, frontend, database)
- Understanding of Prisma schema
- Knowledge of NestJS decorators
- Familiarity with mermaid diagram syntax

### Success Criteria
- All documented endpoints exist and are accurate
- Database documentation matches Prisma schema 100%
- All diagrams render correctly and reflect actual flows
- All use cases align with implemented features
- Validation process is documented and repeatable
