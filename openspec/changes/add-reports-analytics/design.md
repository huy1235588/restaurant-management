# Reports & Analytics - Technical Design

## Context
Hệ thống quản lý nhà hàng cần tính năng báo cáo để:
- Demo khả năng phân tích dữ liệu cho đồ án tốt nghiệp
- Giúp quản lý theo dõi hoạt động kinh doanh
- Hiển thị dữ liệu dạng biểu đồ trực quan

## Goals / Non-Goals

### Goals
- Cung cấp dashboard tổng quan với KPIs chính
- Báo cáo doanh thu với biểu đồ line/bar chart
- Báo cáo món ăn bán chạy/chậm
- Phân tích đơn hàng theo thời gian
- Lọc theo khoảng thời gian (today, week, month, custom)
- UI đẹp, responsive, hỗ trợ dark mode

### Non-Goals
- Xuất file PDF/Excel (phức tạp, không cần cho demo)
- Real-time updates (refresh thủ công đủ cho demo)
- Báo cáo phức tạp (inventory, staff performance)
- Scheduled reports/email

## Architecture

### Backend Structure
```
app/server/src/modules/reports/
├── reports.module.ts
├── reports.controller.ts
├── reports.service.ts
├── dto/
│   ├── report-query.dto.ts      # Query params (startDate, endDate, groupBy)
│   └── report-response.dto.ts   # Response types
└── types/
    └── report.types.ts
```

### Frontend Structure
```
app/client/src/modules/admin/reports/
├── index.ts
├── types/
│   └── report.types.ts
├── services/
│   └── reports.service.ts
├── hooks/
│   └── useReports.ts
├── components/
│   ├── ReportCard.tsx           # KPI card component
│   ├── RevenueChart.tsx         # Line/Bar chart for revenue
│   ├── TopItemsChart.tsx        # Horizontal bar chart
│   ├── OrdersChart.tsx          # Orders by status/time
│   ├── PaymentMethodChart.tsx   # Pie chart
│   └── DateRangePicker.tsx      # Date range selector
└── views/
    └── ReportsView.tsx          # Main reports page

app/client/src/app/(dashboard)/reports/
└── page.tsx                     # Route: /reports
```

## API Design

### Endpoints

```
GET /api/reports/overview
  Query: startDate, endDate
  Response: { revenue, orders, reservations, avgOrderValue, comparison }

GET /api/reports/revenue
  Query: startDate, endDate, groupBy (day|week|month)
  Response: { data: [{ date, revenue, orders }], total, growth }

GET /api/reports/top-items
  Query: startDate, endDate, limit (default 10)
  Response: { items: [{ itemId, name, quantity, revenue }] }

GET /api/reports/orders
  Query: startDate, endDate, groupBy (hour|day|status)
  Response: { data: [...], summary }

GET /api/reports/payment-methods
  Query: startDate, endDate
  Response: { methods: [{ method, count, amount, percentage }] }
```

### Query Strategies

Sử dụng Prisma aggregate functions:
```typescript
// Revenue by date
prisma.bill.groupBy({
  by: ['createdAt'],
  where: { paymentStatus: 'paid', createdAt: { gte, lte } },
  _sum: { totalAmount: true },
  _count: true
})

// Top items
prisma.billItem.groupBy({
  by: ['itemId'],
  where: { bill: { paymentStatus: 'paid', createdAt: { gte, lte } } },
  _sum: { quantity: true, total: true },
  orderBy: { _sum: { quantity: 'desc' } },
  take: 10
})
```

## UI Components

### Date Range Presets
```typescript
const presets = [
  { label: 'Hôm nay', value: 'today' },
  { label: '7 ngày qua', value: 'week' },
  { label: '30 ngày qua', value: 'month' },
  { label: 'Tùy chọn', value: 'custom' }
]
```

### Chart Library
Sử dụng **Recharts** (đã có trong project):
- `LineChart` - Doanh thu theo thời gian
- `BarChart` - Top items, orders by hour
- `PieChart` - Payment methods
- `ResponsiveContainer` - Responsive charts

### Styling
- Sử dụng Tailwind CSS classes
- Tương thích dark mode với CSS variables
- Card layout với shadow và border radius

## Decisions

### Decision 1: Aggregate at query time vs materialized views
- **Choice**: Query-time aggregation với Prisma
- **Why**: Đơn giản hơn, phù hợp với scale của đồ án, không cần maintenance
- **Trade-off**: Có thể chậm với dữ liệu lớn, nhưng đủ cho demo

### Decision 2: Frontend date handling
- **Choice**: Sử dụng date-fns (đã có)
- **Why**: Lightweight, tree-shakeable, đã có trong project
- **Alternative**: Day.js, Moment.js (không cần vì date-fns đủ dùng)

### Decision 3: State management
- **Choice**: React Query pattern (custom hooks với fetch)
- **Why**: Phù hợp với pattern hiện tại của project, có caching
- **Alternative**: Zustand (overkill cho read-only data)

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Reports    │────▶│  API Route   │────▶│  Prisma     │
│  Page       │     │  /reports/*  │     │  Queries    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Charts     │◀────│  useReports  │◀────│  Database   │
│  (Recharts) │     │  Hook        │     │  (Postgres) │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Query performance with large data | Add database indexes on date columns (already exist), limit date range |
| Complex date timezone handling | Use UTC in backend, convert to local in frontend |
| Chart rendering performance | Use ResponsiveContainer, lazy load charts |

## Open Questions
- Có cần thêm báo cáo đặt bàn (reservations) không? → Có thể thêm nếu còn thời gian
- Format số tiền hiển thị? → VND với locale vi-VN
