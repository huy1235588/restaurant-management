# Design: Validate Documentation

## Overview

This document outlines the technical approach and methodology for validating documentation against the actual implementation. The validation process combines automated tooling with manual review to ensure comprehensive accuracy.

## Problem Statement

Tài liệu trong thư mục `docs/` có thể không đồng bộ với implementation thực tế do:
1. Continuous development và feature additions
2. Ongoing migration từ Express sang NestJS
3. Database schema changes qua Prisma migrations
4. Frontend updates với Next.js 16 và React 19
5. Thiếu automated validation process

Manual validation alone is error-prone và time-consuming. Automated tooling alone không thể catch tất cả semantic issues.

## Solution Architecture

### Validation Approach: Hybrid (Manual + Automated)

```
┌─────────────────────────────────────────────────────┐
│           Documentation Validation Process          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Automated Code Analysis                         │
│     ├─ Extract endpoints from controllers           │
│     ├─ Parse Prisma schema                          │
│     ├─ List frontend pages/components               │
│     └─ Generate comparison reports                  │
│                                                     │
│  2. Manual Validation                               │
│     ├─ Review API documentation                     │
│     ├─ Validate architecture docs                   │
│     ├─ Update diagrams                              │
│     └─ Verify use cases                             │
│                                                     │
│  3. Documentation Updates                           │
│     ├─ Fix discrepancies                            │
│     ├─ Add missing information                      │
│     ├─ Update diagrams                              │
│     └─ Improve clarity                              │
│                                                     │
│  4. Review & Quality Check                          │
│     ├─ Cross-reference validation                   │
│     ├─ Completeness check                           │
│     ├─ Consistency verification                     │
│     └─ Final approval                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Validation Methodology

### 1. API Documentation Validation

**Input Documents**: 
- `docs/api/ORDER_API.md`
- `docs/api/KITCHEN_API.md`
- `docs/api/RESERVATION_API.md`
- `docs/api/BILLING_API.md`

**Source of Truth**: Backend controllers in `app/server/src/modules/*/`

**Validation Steps**:
1. **Extract Documented Endpoints**:
   - Parse markdown to extract endpoints, methods, paths
   - Extract request/response schemas
   - Extract authorization requirements

2. **Extract Implemented Endpoints**:
   - Scan controller files for `@Controller()`, `@Get()`, `@Post()`, `@Put()`, `@Delete()`, etc.
   - Extract DTOs from decorator parameters
   - Extract guards and roles from `@UseGuards()` and `@Roles()`

3. **Compare & Identify Discrepancies**:
   - Missing endpoints in documentation
   - Outdated endpoints no longer in code
   - Changed request/response structures
   - Different authorization requirements

4. **Manual Review**:
   - Verify query parameters and validation rules
   - Check WebSocket events if mentioned
   - Validate error responses
   - Review examples for accuracy

**Validation Checklist per API Document**:
- [ ] All endpoints documented
- [ ] HTTP methods correct
- [ ] Request schemas match DTOs
- [ ] Response schemas accurate
- [ ] Query parameters documented
- [ ] Path parameters documented
- [ ] Authorization requirements correct
- [ ] Error responses documented
- [ ] Examples provided and accurate
- [ ] WebSocket events documented (if applicable)

### 2. Architecture Documentation Validation

**Input Documents**:
- `docs/architecture/DATABASE.md`
- `docs/architecture/DATABASE_OPTIMIZATION.md`
- `docs/architecture/DATABASE_QUERIES.md`
- `docs/architecture/ERD.mmd`
- `docs/architecture/RESERVATION_SYSTEM.md`

**Source of Truth**: 
- `app/server/prisma/schema.prisma`
- Database queries in service files
- Architecture patterns in code

**Validation Steps for DATABASE.md**:
1. **Parse Prisma Schema**:
   - Extract all models (tables)
   - Extract all enums
   - Extract relationships (1:1, 1:N, N:M)
   - Extract indexes and constraints

2. **Compare with Documentation**:
   - Verify table descriptions
   - Check field types and constraints
   - Validate relationships
   - Confirm enum values

3. **Update Documentation**:
   - Add missing tables/fields
   - Remove deprecated items
   - Update descriptions
   - Refresh examples

**Validation Steps for ERD.mmd**:
1. Extract entity relationships from Prisma schema
2. Compare with mermaid ERD diagram
3. Update diagram if needed
4. Ensure visual clarity and correctness

**Validation Steps for DATABASE_QUERIES.md & DATABASE_OPTIMIZATION.md**:
1. Review query examples
2. Test query performance claims
3. Verify indexes match schema
4. Update optimization recommendations

**Validation Steps for RESERVATION_SYSTEM.md**:
1. Review architecture description
2. Compare with actual implementation in `app/server/src/modules/reservation/`
3. Verify state transitions with enum values
4. Update workflow descriptions

**Validation Checklist per Architecture Document**:
- [ ] All models/tables documented
- [ ] Field types and constraints correct
- [ ] Relationships accurate
- [ ] Enums match schema
- [ ] Indexes documented
- [ ] ERD diagram up-to-date
- [ ] Query examples valid
- [ ] Optimization tips relevant
- [ ] Architecture descriptions accurate

### 3. Diagrams Validation

**Input Documents**:
- `docs/diagrams/AUTHENTICATION_MANAGEMENT_DIAGRAMS.md`
- `docs/diagrams/BILL_PAYMENT_MANAGEMENT_DIAGRAMS.md`
- `docs/diagrams/INVENTORY_MANAGEMENT_DIAGRAMS.md`
- `docs/diagrams/MENU_MANAGEMENT_DIAGRAMS.md`
- `docs/diagrams/ORDER_MANAGEMENT_DIAGRAMS.md`
- `docs/diagrams/RESERVATION_MANAGEMENT_DIAGRAMS.md`
- `docs/diagrams/STAFF_MANAGEMENT_DIAGRAMS.md`

**Source of Truth**:
- API flows in controllers and services
- Frontend flows in components and pages
- Database state transitions from enums

**Validation Steps**:
1. **For Sequence Diagrams**:
   - Trace API calls from frontend to backend
   - Verify message order
   - Check actor interactions
   - Validate database operations

2. **For Flowcharts**:
   - Follow business logic in code
   - Verify decision points
   - Check state transitions
   - Validate error handling paths

3. **For State Diagrams**:
   - Compare with enum definitions
   - Verify transition logic in services
   - Check allowed transitions

4. **Update Diagrams**:
   - Fix incorrect flows
   - Add missing steps
   - Update labels and descriptions
   - Improve visual clarity

**Validation Checklist per Diagram Document**:
- [ ] Sequence diagrams match API flows
- [ ] Flowcharts reflect business logic
- [ ] State diagrams match enums
- [ ] Actor interactions correct
- [ ] All major flows covered
- [ ] Error handling shown
- [ ] Mermaid syntax valid
- [ ] Diagrams render correctly

### 4. Use Case Documentation Validation

**Input Documents**:
- `docs/use_case/AUTHENTICATION_MANAGEMENT.md`
- `docs/use_case/BILL_PAYMENT_MANAGEMENT.md`
- `docs/use_case/INVENTORY_MANAGEMENT.md`
- `docs/use_case/MENU_MANAGEMENT.md`
- `docs/use_case/ORDER_MANAGEMENT.md`
- `docs/use_case/RESERVATION_MANAGEMENT.md`
- `docs/use_case/STAFF_MANAGEMENT.md`

**Source of Truth**:
- Implemented features in frontend (`app/client/src/`)
- Backend business logic in services
- RBAC permissions in guards and decorators

**Validation Steps**:
1. **Verify User Stories**:
   - Check if feature is implemented
   - Validate preconditions and postconditions
   - Compare steps with actual UI flow

2. **Validate Actors**:
   - Verify roles match RBAC implementation
   - Check permissions match guards
   - Confirm actor capabilities

3. **Review Workflows**:
   - Trace user journey in frontend
   - Validate API calls sequence
   - Check error handling scenarios

4. **Update Documentation**:
   - Fix outdated workflows
   - Add missing use cases
   - Update actor permissions
   - Improve scenario descriptions

**Validation Checklist per Use Case Document**:
- [ ] User stories match implemented features
- [ ] Actors and roles correct
- [ ] Permissions align with RBAC
- [ ] Workflows reflect actual UI
- [ ] Preconditions accurate
- [ ] Postconditions correct
- [ ] Error scenarios covered
- [ ] Examples clear and accurate

## Tools & Scripts

### Automated Tools to Use:

1. **grep / ripgrep**: Search for patterns in code
   ```bash
   # Find all controller endpoints
   rg -n "@Controller|@Get|@Post|@Put|@Delete" app/server/src/
   
   # Find all guards and roles
   rg -n "@UseGuards|@Roles" app/server/src/
   
   # Find all Prisma models
   rg -n "^model " app/server/prisma/schema.prisma
   ```

2. **Prisma CLI**: Analyze database schema
   ```bash
   cd app/server
   npx prisma format
   npx prisma validate
   ```

3. **Manual Code Review**: Use VS Code to navigate and inspect:
   - Controller files for endpoints
   - Service files for business logic
   - DTO files for request/response structures
   - Guards for authorization
   - Schema for database structure

4. **Documentation Linting**:
   - Check markdown formatting
   - Validate mermaid diagrams
   - Verify links

### Validation Script (Optional)

Create a simple Node.js script to:
- Parse controller decorators
- Extract endpoint information
- Compare with documented endpoints
- Generate discrepancy report

**Note**: Due to time constraints, this will be manual validation with tools assistance.

## Quality Standards

### Documentation Quality Criteria

1. **Accuracy**: Information must match implementation 100%
2. **Completeness**: No major features or endpoints missing
3. **Clarity**: Clear, unambiguous language
4. **Consistency**: Same format and style across all docs
5. **Maintainability**: Easy to update in the future

### Update Guidelines

When updating documentation:
1. **Preserve Structure**: Keep existing organization and format
2. **Add Context**: Explain why something works a certain way
3. **Use Examples**: Provide code snippets and scenarios
4. **Link Related Docs**: Cross-reference related documentation
5. **Mark Status**: Note if feature is in progress or planned

### Review Process

1. **Self-Review**: Author checks all changes
2. **Validation**: Run validation checklist
3. **Cross-Reference**: Verify consistency across docs
4. **Approval**: Get sign-off before merging

## Risk Management

### Risk 1: Incomplete Implementation Discovery
**Mitigation**:
- Review both frontend and backend code
- Check Prisma schema thoroughly
- Review API request logs if available
- Test features manually if unclear

### Risk 2: Ambiguous Documentation
**Mitigation**:
- Clarify with code examples
- Add screenshots if needed
- Link to actual code files
- Use clear, specific language

### Risk 3: Time Overrun
**Mitigation**:
- Prioritize core modules first (Order, Reservation, Billing)
- Set time limits per document
- Mark partially validated sections
- Can validate in phases

### Risk 4: Breaking Changes During Migration
**Mitigation**:
- Document current state
- Note ongoing migrations
- Mark unstable sections
- Plan follow-up validation after migration

## Success Metrics

1. **Coverage**: % of documented endpoints/features validated
   - Target: 100% of in-scope documentation

2. **Accuracy**: % of validated items that are correct
   - Target: 100% accuracy after updates

3. **Completeness**: % of implemented features documented
   - Target: 90%+ (some minor features may be undocumented)

4. **Timeliness**: Validation completed within estimated time
   - Target: Complete within 20-30 tasks

## Deliverables

1. **Updated Documentation**: All validated and corrected docs
2. **Validation Report**: Summary of changes and discrepancies found
3. **Validation Checklist**: Reusable checklist for future validations
4. **Process Documentation**: How to maintain doc accuracy going forward

## Next Steps

After completing this validation:
1. **Establish Review Process**: Add docs review to PR checklist
2. **Automate Validation**: Build scripts for ongoing validation
3. **Complete Missing Docs**: Create API docs for undocumented modules
4. **Integrate with CI**: Run validation checks in CI/CD pipeline

## Appendices

### Appendix A: File Mapping

| Documentation | Source Code |
|--------------|-------------|
| `ORDER_API.md` | `app/server/src/modules/order/order.controller.ts` |
| `KITCHEN_API.md` | `app/server/src/modules/kitchen/kitchen.controller.ts` |
| `RESERVATION_API.md` | `app/server/src/modules/reservation/reservation.controller.ts` |
| `BILLING_API.md` | `app/server/src/modules/billing/billing.controller.ts` |
| `DATABASE.md` | `app/server/prisma/schema.prisma` |
| All use cases | Frontend pages in `app/client/src/app/admin/**/page.tsx` |
| All diagrams | API flows and business logic in services |

### Appendix B: Validation Command Reference

```bash
# List all controllers
ls app/server/src/modules/*/

# Search for endpoints
rg "@Get|@Post|@Put|@Delete|@Patch" app/server/src/ --type ts

# List all models
rg "^model " app/server/prisma/schema.prisma

# List all enums
rg "^enum " app/server/prisma/schema.prisma

# Find frontend pages
ls app/client/src/app/admin/**/page.tsx

# Search for guards
rg "@UseGuards|@Roles" app/server/src/ --type ts
```
