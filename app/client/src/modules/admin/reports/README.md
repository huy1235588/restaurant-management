# Reports Module (Frontend)

Module báo cáo và phân tích dữ liệu cho dashboard.

## Tổng quan

Module này cung cấp:
- Dashboard tổng quan với KPIs
- Biểu đồ doanh thu theo thời gian
- Phân tích món ăn bán chạy
- Thống kê phương thức thanh toán
- Phân tích đơn hàng theo giờ

## Cấu trúc

```
reports/
├── components/
│   ├── DateRangePicker.tsx    # Chọn khoảng thời gian
│   ├── OrdersChart.tsx        # Biểu đồ đơn hàng
│   ├── PaymentMethodChart.tsx # Pie chart thanh toán
│   ├── ReportCard.tsx         # Card hiển thị KPI
│   ├── RevenueChart.tsx       # Biểu đồ doanh thu
│   └── TopItemsChart.tsx      # Top món bán chạy
├── hooks/
│   └── useReports.ts          # React Query hooks
├── services/
│   └── reports.service.ts     # API calls
├── types/
│   └── report.types.ts        # TypeScript types
├── views/
│   └── ReportsView.tsx        # Main view
├── index.ts                   # Barrel exports
└── README.md
```

## Sử dụng

```tsx
import { ReportsView } from '@/modules/admin/reports';

// Trong page component
export default function ReportsPage() {
    return <ReportsView />;
}
```

## Hooks

### useOverviewReport
```tsx
const { data, isLoading } = useOverviewReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
});
```

### useRevenueReport
```tsx
const { data } = useRevenueReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    groupBy: 'day' // 'day' | 'week' | 'month'
});
```

### useTopItemsReport
```tsx
const { data } = useTopItemsReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    limit: 10
});
```

## Components

### ReportCard
Hiển thị một KPI với icon và so sánh với kỳ trước.

```tsx
<ReportCard
    title="Doanh thu"
    value={1000000}
    change={15} // +15% so với kỳ trước
    icon={DollarSign}
    formatValue={(v) => formatCurrency(v)}
/>
```

### DateRangePicker
Chọn khoảng thời gian với presets.

```tsx
<DateRangePicker
    value={dateRange}
    onChange={setDateRange}
/>
```

## Phân quyền

- `admin`, `manager`: Xem tất cả báo cáo
- `cashier`: Chỉ xem overview
- `waiter`, `chef`: Không có quyền truy cập

## Dependencies

- **Recharts**: Thư viện biểu đồ
- **date-fns**: Xử lý ngày tháng
- **@tanstack/react-query**: Data fetching & caching
