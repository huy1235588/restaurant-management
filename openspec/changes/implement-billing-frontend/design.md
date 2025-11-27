# Design: Billing Frontend Architecture

## Context

Hệ thống cần giao diện thanh toán cho nhân viên thu ngân và phục vụ. Backend API đã sẵn sàng với đầy đủ endpoints. Frontend cần tuân theo patterns đã có trong project (module-based architecture, Zustand state, React Query fetching).

**Stakeholders**: Thu ngân, nhân viên phục vụ, quản lý, admin

**Constraints**:
- Phải consistent với UI/UX của các module khác (order, menu)
- Sử dụng existing components (Radix UI, Tailwind)
- Hỗ trợ đa ngôn ngữ (EN/VI)
- Responsive cho tablet (thiết bị chính của nhân viên)

## Goals / Non-Goals

**Goals:**
- Triển khai đầy đủ billing workflow: create → discount → payment
- UI trực quan, dễ sử dụng cho cashier
- Real-time updates khi có thay đổi
- Tích hợp seamless với Order module

**Non-Goals:**
- Payment gateway integration (chỉ ghi nhận phương thức)
- Receipt printing (có thể thêm sau)
- Split bill (phức tạp, phase sau)
- Partial payments (không hỗ trợ trong API hiện tại)

## Decisions

### 1. Module Structure
**Decision**: Theo cấu trúc chuẩn như order/menu modules

```
billing/
├── components/     # UI components
├── dialogs/        # Modal dialogs
├── hooks/          # React Query hooks
├── services/       # API calls
├── types/          # TypeScript types
├── utils/          # Helpers
├── views/          # Page views
└── index.ts        # Barrel exports
```

**Rationale**: Consistency với project conventions, dễ maintain.

### 2. State Management
**Decision**: React Query cho server state, local state cho form data

**Rationale**: 
- Không cần global store như Zustand vì billing state không share nhiều
- React Query handles caching, refetching, mutations
- Simple form state với useState/useReducer

### 3. Bill Creation Flow
**Decision**: Dialog-based flow từ Order

```
OrderCard (status=confirmed) 
  → Click "Tạo hóa đơn" 
  → CreateBillDialog (preview) 
  → Confirm 
  → Redirect to bill detail
```

**Rationale**: 
- Không cần trang riêng cho tạo bill
- Bill luôn từ order, không tạo độc lập
- Quick action từ order list

### 4. Payment Flow
**Decision**: Multi-step dialog

```
ProcessPaymentDialog:
  Step 1: Chọn phương thức (4 buttons)
  Step 2: Nhập chi tiết (số tiền, card info nếu cần)
  Step 3: Confirm & Show result (tiền thối cho cash)
```

**Rationale**: 
- Wizard-style giảm cognitive load
- Clear progression
- Có thể back để sửa

### 5. UI Layout
**Decision**: Card-based grid layout (tương tự OrderListView)

**Rationale**:
- Familiar pattern cho users
- Scannable nhanh
- Works well on tablet

## Component Hierarchy

```
BillListView
├── Filters (status, date, search)
├── BillCard[] (grid)
│   ├── BillStatusBadge
│   └── Actions (View, Pay)
└── Pagination

BillDetailView
├── Bill Header (number, table, status)
├── BillItemList
│   └── BillItem[]
├── BillSummary
│   └── (subtotal, tax, service, discount, total)
└── Actions
    ├── ApplyDiscountDialog
    ├── ProcessPaymentDialog
    └── VoidBillDialog (admin)

ProcessPaymentDialog
├── PaymentMethodSelector
├── PaymentForm (conditional fields)
└── PaymentResult (change amount)
```

## API Integration

```typescript
// services/billing.service.ts
const billingApi = {
  getBills: (filters) => axios.get('/bills', { params: filters }),
  getBillById: (id) => axios.get(`/bills/${id}`),
  createBill: (orderId) => axios.post('/bills', { orderId }),
  applyDiscount: (id, data) => axios.patch(`/bills/${id}/discount`, data),
  processPayment: (id, data) => axios.post(`/bills/${id}/payment`, data),
  voidBill: (id, reason) => axios.delete(`/bills/${id}`, { data: { reason } }),
};
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Concurrent bill modifications | Optimistic locking không có, dựa vào paymentStatus check |
| Network failures during payment | Show clear error, allow retry, không auto-retry |
| Large discount without approval | Warning UI, log on backend (approval flow phase sau) |

## Migration Plan

1. **Phase 1** (this proposal): Core billing CRUD + payment
2. **Phase 2**: Receipt printing, reports
3. **Phase 3**: Split bill, partial payments

No database migration needed - schema already exists.

## Open Questions

1. ~~Có cần print receipt integration không?~~ → Phase sau
2. ~~Có cần audit log cho billing actions không?~~ → Backend đã log
3. Có cần realtime notification khi bill được tạo/paid không? → Nice to have, có thể thêm WebSocket events
