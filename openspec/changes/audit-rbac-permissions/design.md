## Context

Dự án restaurant-management sử dụng NestJS với JWT authentication và Role-Based Access Control (RBAC). Hiện tại:
- JwtAuthGuard đã được triển khai và áp dụng cho hầu hết controllers
- RolesGuard và @Roles decorator đã có sẵn nhưng chỉ được sử dụng ở một số ít endpoints
- Có 5 vai trò: admin, manager, waiter, chef, cashier

### Stakeholders
- Admin: Quản trị viên hệ thống - toàn quyền
- Manager: Quản lý nhà hàng - hầu hết quyền trừ một số admin-only
- Waiter: Phục vụ - chủ yếu order và reservation
- Chef: Đầu bếp - kitchen operations
- Cashier: Thu ngân - billing và thanh toán

## Goals / Non-Goals

### Goals
- Triển khai RBAC đầy đủ cho tất cả API endpoints
- Đảm bảo tính nhất quán với tài liệu use case
- Bảo vệ các sensitive operations (delete, admin functions)
- Không breaking change cho các operations đã hoạt động đúng

### Non-Goals
- Không thay đổi cấu trúc roles/permissions
- Không implement permission granularity mới (vẫn dùng role-based)
- Không thêm row-level security (resource ownership) - chỉ thực hiện nếu đơn giản
- Không implement audit logging chi tiết (đã có trong scope khác)

## Decisions

### Decision 1: Áp dụng RolesGuard ở cấp method, không phải controller

**Lý do**: Mỗi endpoint trong cùng controller có thể cần quyền khác nhau (GET vs POST vs DELETE)

**Alternative considered**:
- Tách controller thành read/write controllers - Phức tạp, khó maintain
- Áp dụng RolesGuard cấp controller rồi override - Không rõ ràng, dễ nhầm

### Decision 2: Sử dụng @Roles() decorator với danh sách role names

**Lý do**: Đơn giản, dễ đọc, dễ maintain

```typescript
@Roles('admin', 'manager')
@UseGuards(RolesGuard)
```

### Decision 3: GET endpoints cho tất cả authenticated users (trừ một số ngoại lệ)

**Lý do**: 
- Đơn giản hóa implementation
- Waiter/Chef cần xem menu, orders, tables để làm việc
- Chỉ restrict write operations

**Ngoại lệ**:
- Staff list: chỉ admin/manager
- Reports: chỉ admin/manager (+ cashier cho revenue)

### Decision 4: Không implement resource ownership check trong phase này

**Lý do**:
- Phức tạp hơn nhiều (cần query DB để verify owner)
- Có thể thêm sau nếu cần
- Với đồ án demo, RBAC cơ bản đủ cho use case

**Tuy nhiên**: Có thể cân nhắc cho một số case đơn giản như waiter cancel order của mình

## Risks / Trade-offs

### Risk 1: Breaking Changes cho Frontend
**Mitigation**: 
- Document rõ các endpoint bị ảnh hưởng
- Frontend cần update để handle 403 responses
- Test kỹ với các roles

### Risk 2: Waiter không thể cancel order của mình
**Mitigation**: 
- Option A: Cho manager cancel hộ
- Option B: Implement simple ownership check cho order cancel
- Chọn Option A trước, có thể thêm B sau

### Risk 3: Chef không xem được menu để biết món nào có sẵn
**Mitigation**: GET menu cho tất cả roles

## Implementation Approach

### Phase 1: Audit (Non-breaking)
1. Review tất cả controllers
2. Document current state vs desired state
3. Create audit report

### Phase 2: Apply RBAC (May have breaking changes)
1. Menu & Category - ít impact nhất
2. Table - ít impact
3. Kitchen - quan trọng cho chef
4. Order - quan trọng cho waiter
5. Billing - quan trọng cho cashier
6. Staff - admin-sensitive
7. Reservation

### Phase 3: Testing
1. Manual testing với từng role
2. Verify 403 responses
3. Update frontend nếu cần

## Open Questions

1. **Waiter có được cancel order không?**
   - Proposal: Chỉ cancel order của chính mình
   - Implementation: Có thể defer đến later phase

2. **Cashier có được xem tất cả reports không?**
   - Current doc: Chỉ revenue report
   - Decision: Follow doc - chỉ revenue report

3. **Staff có xem được thông tin của nhân viên khác không?**
   - Proposal: Admin/Manager xem tất cả, nhân viên chỉ xem của mình
   - Implementation: Cần custom guard hoặc service logic
