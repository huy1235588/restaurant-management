# Reports Module

Module báo cáo và phân tích dữ liệu kinh doanh nhà hàng.

## Tổng quan

Module này cung cấp các API để:
- Xem tổng quan KPIs (doanh thu, đơn hàng, đặt bàn)
- Báo cáo doanh thu theo thời gian
- Phân tích món ăn bán chạy
- Thống kê phương thức thanh toán
- Phân tích đơn hàng theo giờ/trạng thái

## API Endpoints

### Overview Report
```
GET /api/reports/overview
Query: startDate, endDate
Response: { revenue, orders, reservations, avgOrderValue, comparison }
```

### Revenue Report
```
GET /api/reports/revenue
Query: startDate, endDate, groupBy (day|week|month)
Response: { data: [{ date, revenue, orders }], total, growth }
```

### Top Items Report
```
GET /api/reports/top-items
Query: startDate, endDate, limit (default: 10)
Response: { items: [...], totalQuantity, totalRevenue }
```

### Payment Methods Report
```
GET /api/reports/payment-methods
Query: startDate, endDate
Response: { methods: [...], totalAmount, totalCount }
```

### Orders Report
```
GET /api/reports/orders
Query: startDate, endDate, groupBy (hour|status)
Response: { data: [...], summary }
```

## Phân quyền

| Role     | Overview | Revenue | Top Items | Payment Methods | Orders |
|----------|----------|---------|-----------|-----------------|--------|
| admin    | ✓        | ✓       | ✓         | ✓               | ✓      |
| manager  | ✓        | ✓       | ✓         | ✓               | ✓      |
| cashier  | ✓        | ✗       | ✗         | ✗               | ✗      |
| waiter   | ✗        | ✗       | ✗         | ✗               | ✗      |
| chef     | ✗        | ✗       | ✗         | ✗               | ✗      |

## Cấu trúc thư mục

```
reports/
├── dto/
│   ├── index.ts
│   └── report-query.dto.ts
├── types/
│   ├── index.ts
│   └── report.types.ts
├── index.ts
├── README.md
├── reports.controller.ts
├── reports.module.ts
└── reports.service.ts
```

## Date Range

- Nếu không truyền `startDate`/`endDate`, mặc định là ngày hôm nay
- Format: ISO 8601 (YYYY-MM-DD)
- Comparison tự động so sánh với kỳ trước (cùng số ngày)

## Ví dụ sử dụng

```bash
# Doanh thu 7 ngày qua, nhóm theo ngày
GET /api/reports/revenue?startDate=2024-11-24&endDate=2024-12-01&groupBy=day

# Top 5 món bán chạy tháng này
GET /api/reports/top-items?startDate=2024-12-01&endDate=2024-12-31&limit=5

# Thống kê đơn hàng theo giờ hôm nay
GET /api/reports/orders?groupBy=hour
```
