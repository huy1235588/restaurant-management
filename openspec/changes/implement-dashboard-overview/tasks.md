# Tasks - Implement Dashboard Overview

## 1. Backend - Dashboard Module

- [x] 1.1 Tạo cấu trúc module `app/server/src/modules/dashboard/`
  - [x] `dashboard.module.ts`
  - [x] `dashboard.controller.ts`
  - [x] `dashboard.service.ts`
  - [x] `dto/` folder

- [x] 1.2 Tạo DTOs
  - [x] `dashboard-status.dto.ts` - Response type cho status
  - [x] `recent-activity.dto.ts` - Query params và response type

- [x] 1.3 Implement `DashboardService`
  - [x] 1.3.1 `getStatus()` - Aggregates table status + kitchen queue
  - [x] 1.3.2 `getRecentActivity(limit)` - Query recent orders, reservations, payments

- [x] 1.4 Implement `DashboardController`
  - [x] 1.4.1 `GET /dashboard/status` - Trạng thái real-time
  - [x] 1.4.2 `GET /dashboard/recent-activity` - Hoạt động gần đây

- [x] 1.5 Thêm Swagger documentation cho API

- [x] 1.6 Register module trong `app.module.ts`

## 2. Frontend - Dashboard Module Structure

- [x] 2.1 Định nghĩa types trong `modules/admin/dashboard/types/`
  - [x] `dashboard.types.ts` - TableSummary, KitchenQueue, RecentActivity, etc.

- [x] 2.2 Tạo services trong `modules/admin/dashboard/services/`
  - [x] `dashboard.service.ts` - API calls cho dashboard endpoints

- [x] 2.3 Tạo hooks trong `modules/admin/dashboard/hooks/`
  - [x] `useDashboardStatus.ts` - Fetch status data
  - [x] `useRecentActivity.ts` - Fetch recent activity
  - [x] `useTodayStats.ts` - Reuse reports overview API

## 3. Frontend - Dashboard Components

- [x] 3.1 Tạo `components/TodayStats.tsx`
  - [x] KPI cards với icons (Revenue, Orders, Reservations)
  - [x] Percentage change indicators
  - [x] Loading skeleton

- [x] 3.2 Tạo `components/TableOverview.tsx`
  - [x] Visual summary of table statuses
  - [x] Counts per status với color coding
  - [x] Link to tables page

- [x] 3.3 Tạo `components/KitchenQueue.tsx`
  - [x] Order counts by kitchen status
  - [x] Visual indicators (badges)
  - [x] Link to kitchen page

- [x] 3.4 Tạo `components/QuickActions.tsx`
  - [x] Grid of action buttons
  - [x] Role-based visibility
  - [x] Icons + labels

- [x] 3.5 Tạo `components/RecentActivity.tsx`
  - [x] Timeline layout
  - [x] Activity icons by type
  - [x] Relative timestamps (date-fns)
  - [x] Click to navigate to detail

- [x] 3.6 Tạo `components/index.ts` barrel export

## 4. Frontend - Dashboard View & Page

- [x] 4.1 Tạo `views/DashboardView.tsx`
  - [x] Compose all dashboard components
  - [x] Responsive grid layout
  - [x] Refresh button
  - [x] Welcome message with user name

- [x] 4.2 Update `app/admin/dashboard/page.tsx`
  - [x] Import và render DashboardView
  - [x] Remove placeholder content

- [x] 4.3 Tạo `index.ts` barrel export cho module

## 5. Internationalization (i18n)

- [x] 5.1 Mở rộng translations cho tiếng Việt (`locales/vi.json`)
  - [x] `dashboard.tableOverview`, `dashboard.kitchenQueue`
  - [x] `dashboard.quickActions.*`
  - [x] `dashboard.recentActivity.*`

- [x] 5.2 Mở rộng translations cho tiếng Anh (`locales/en.json`)
  - [x] Same keys as Vietnamese

## 6. Testing & Validation

- [ ] 6.1 Test API endpoints với Swagger UI
- [ ] 6.2 Verify dashboard loads correctly với các roles (admin, manager)
- [ ] 6.3 Verify responsive design trên mobile
- [ ] 6.4 Verify dark mode compatibility
- [ ] 6.5 Verify links navigate correctly

## 7. Finalization

- [ ] 7.1 Run `openspec validate implement-dashboard-overview --strict`
- [ ] 7.2 Review code và test thủ công
- [ ] 7.3 Archive change với `openspec archive implement-dashboard-overview`
