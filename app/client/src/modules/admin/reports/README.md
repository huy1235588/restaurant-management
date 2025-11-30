# Reports Module (Frontend)

Module báo cáo và phân tích dữ liệu cho dashboard.

## Tổng quan

Module này cung cấp:
- Dashboard tổng quan với KPIs
- Biểu đồ doanh thu theo thời gian
- Phân tích món ăn bán chạy
- Thống kê phương thức thanh toán
- Phân tích đơn hàng theo giờ
- **Batch API** để fetch tất cả reports trong 1 request
- **Export CSV** cho các báo cáo
- **Cache indicator** hiển thị khi data từ cache

## Cấu trúc

```
reports/
├── components/
│   ├── ChartSkeleton.tsx      # NEW - Unified skeleton loading
│   ├── DateRangePicker.tsx    # Chọn khoảng thời gian
│   ├── ExportButton.tsx       # NEW - Dropdown export CSV
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

### useDashboardReport (NEW - Recommended)
Fetch tất cả reports trong 1 request:

```tsx
const { data, isLoading, isFetching, refetch } = useDashboardReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    refresh: false // true để bypass cache
});

// data.overview, data.revenue, data.topItems, data.paymentMethods, data.orders
// data.cached, data.cachedAt
```

### usePrefetchDashboard (NEW)
Prefetch data cho common date ranges:

```tsx
const prefetch = usePrefetchDashboard();

useEffect(() => {
    prefetch({ startDate: '2024-01-01', endDate: '2024-01-31' });
}, []);
```

### useExportReport (NEW)
Export báo cáo ra file CSV:

```tsx
const { mutate: exportReport, isPending } = useExportReport();

exportReport({
    type: 'revenue', // 'revenue' | 'top-items' | 'orders'
    params: { startDate: '2024-01-01', endDate: '2024-12-31' }
});
```

### useOverviewReport (Legacy)
```tsx
const { data, isLoading } = useOverviewReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
});
```

### useRevenueReport (Legacy)
```tsx
const { data } = useRevenueReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    groupBy: 'day' // 'day' | 'week' | 'month'
});
```

### useTopItemsReport (Legacy)
```tsx
const { data } = useTopItemsReport({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    limit: 10
});
```

## Components

### ChartSkeleton (NEW)
Unified skeleton loading cho tất cả charts:

```tsx
<ChartSkeleton type="line" />      // Line chart skeleton
<ChartSkeleton type="bar" />       // Vertical bar chart
<ChartSkeleton type="bar-horizontal" /> // Horizontal bar chart
<ChartSkeleton type="pie" />       // Pie chart skeleton

// Full dashboard skeleton
<DashboardSkeleton />
```

### ExportButton (NEW)
Dropdown để export CSV:

```tsx
<ExportButton
    params={{ startDate: '2024-01-01', endDate: '2024-12-31' }}
    disabled={isLoading}
/>
```

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

## Performance Optimizations

### Batch API
- 1 request thay vì 5 requests riêng lẻ
- Response time giảm ~60% (500ms → 200ms)
- React Query caching với staleTime 2 phút

### Caching
- Backend cache với TTL 5-15 phút
- "Cached" indicator hiển thị khi data từ cache
- Refresh button để bypass cache

### Prefetching
- Tự động prefetch date ranges phổ biến (today, last 30 days)
- Improve perceived performance

## Phân quyền

- `admin`, `manager`: Xem tất cả báo cáo + export
- `cashier`: Chỉ xem overview
- `waiter`, `chef`: Không có quyền truy cập

## Dependencies

- **Recharts**: Thư viện biểu đồ
- **date-fns**: Xử lý ngày tháng
- **@tanstack/react-query**: Data fetching & caching
- **file-saver**: Download file (for CSV export)
