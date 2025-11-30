# Design - Dashboard Overview

## Context

Dashboard Overview là trang đầu tiên admin/manager thấy sau khi đăng nhập. Mục tiêu là cung cấp:
1. Snapshot nhanh về hoạt động trong ngày
2. Trạng thái hiện tại của nhà hàng (bàn, bếp)
3. Quick access đến các thao tác phổ biến

**Stakeholders:**
- Admin: Xem tổng quan kinh doanh
- Manager: Quản lý hoạt động hàng ngày
- (Waiter/Chef/Cashier có thể xem nhưng với quyền hạn chế)

**Constraints:**
- Tái sử dụng API từ `reports` module cho KPIs
- Không cần WebSocket real-time cho đồ án demo (polling refresh đủ)
- Single dashboard view cho tất cả roles (không custom per role)

## Goals / Non-Goals

**Goals:**
- Hiển thị KPIs hôm nay với so sánh hôm qua
- Hiển thị trạng thái bàn và kitchen queue
- Cung cấp quick actions phổ biến
- Hiển thị hoạt động gần đây
- Responsive trên desktop và mobile

**Non-Goals:**
- Real-time WebSocket updates (có thể thêm sau)
- Customizable widgets/layout
- Dashboard riêng cho từng role
- Export dashboard data
- Notifications center

## Decisions

### Decision 1: Tái sử dụng Reports API cho KPIs
- **What**: Sử dụng `GET /reports/overview` với `startDate=today&endDate=today`
- **Why**: Không duplicate logic, API đã có sẵn và test
- **Trade-off**: Có thể hơi chậm hơn API dedicated, nhưng acceptable cho đồ án

### Decision 2: New Dashboard Module cho Backend
- **What**: Tạo `dashboard` module riêng cho status và recent activity
- **Why**: Separation of concerns - Reports focus on analytics, Dashboard focus on operational status
- **Alternative considered**: Thêm endpoints vào Reports module → Rejected vì khác mục đích

### Decision 3: Polling thay vì WebSocket
- **What**: Frontend sử dụng SWR/React Query với refetch interval (30s-60s)
- **Why**: Đơn giản hơn, đủ cho demo đồ án
- **Trade-off**: Không real-time ngay lập tức, nhưng acceptable

### Decision 4: Unified Dashboard View
- **What**: Một DashboardView duy nhất cho tất cả roles
- **Why**: Đơn giản hóa implementation, role-based access đã xử lý ở sidebar
- **Alternative considered**: Dashboard per role → Rejected vì scope đồ án

## Component Architecture

```
DashboardView
├── Header (Welcome message, Refresh button)
├── TodayStats (4 KPI cards)
│   ├── RevenueCard
│   ├── OrdersCard
│   ├── ReservationsCard
│   └── AvgOrderCard
├── StatusSection (2 columns)
│   ├── TableOverview
│   └── KitchenQueue
├── QuickActions (Grid of buttons)
└── RecentActivity (Timeline list)
```

## Data Flow

```
Dashboard Page
    │
    ├─► useTodayStats() ────► GET /reports/overview
    │
    ├─► useDashboardStatus() ─► GET /dashboard/status
    │                             ├── Table summary (from tables table)
    │                             └── Kitchen queue (from orders table)
    │
    └─► useRecentActivity() ──► GET /dashboard/recent-activity
                                   ├── Recent orders
                                   ├── Recent reservations
                                   └── Recent payments
```

## API Design

### GET /dashboard/status
```typescript
Response: {
  tables: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
  };
  kitchen: {
    pending: number;
    preparing: number;
    ready: number;
  };
}
```

### GET /dashboard/recent-activity
```typescript
Query: {
  limit?: number; // default 10
}

Response: {
  activities: Array<{
    id: string;
    type: 'order' | 'reservation' | 'payment';
    action: string; // 'created', 'updated', 'completed', etc.
    description: string;
    timestamp: string; // ISO date
    metadata: {
      entityId: number;
      amount?: number;
      status?: string;
      tableName?: string;
    };
  }>;
}
```

## UI/UX Considerations

### Layout
- Desktop: 4-column grid cho KPI cards, 2-column cho status, full-width cho activity
- Tablet: 2-column grid
- Mobile: Single column stack

### Visual Design
- KPI cards: Icon + Value + Label + Change indicator
- Status sections: Card with header and content
- Quick actions: Large tappable buttons với icons
- Activity: Timeline với icons theo type, relative timestamps

### Colors (consistent với existing design)
- Revenue: Green
- Orders: Blue
- Reservations: Purple
- Positive change: Green text
- Negative change: Red text

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| API slow with large data | Use proper indexes, limit queries |
| Stale data without WebSocket | 30s polling interval, manual refresh |
| Mobile UX crowded | Responsive design, collapsible sections |

## Open Questions

- ~~Cần WebSocket real-time không?~~ → Không cho phase 1
- ~~Dashboard riêng cho từng role?~~ → Không, unified view
