# Design: Admin Quản Lý Thông Tin Nhà Hàng

## Context

Hệ thống quản lý nhà hàng cần cho phép admin thay đổi thông tin hiển thị trên trang chủ khách hàng mà không cần can thiệp code. Thông tin bao gồm: tên nhà hàng, slogan, địa chỉ, số điện thoại, email, giờ mở cửa, và social links.

### Stakeholders
- **Admin/Manager**: Người cập nhật thông tin nhà hàng
- **Khách hàng**: Xem thông tin trên trang chủ
- **Developer**: Maintain code dễ dàng

### Constraints
- Đồ án tốt nghiệp - implementation đơn giản
- Single-tenant (1 nhà hàng)
- PostgreSQL database
- Express backend, Next.js frontend

## Goals / Non-Goals

### Goals
- Admin có thể chỉnh sửa thông tin nhà hàng qua UI
- Thông tin được lưu trong database và persist
- Trang chủ hiển thị thông tin từ database
- Form validation và error handling

### Non-Goals
- Image/logo upload (dùng URL)
- Multi-tenant support
- Audit log / version history
- Complex caching strategy
- Real-time sync

## Decisions

### 1. Database Design: Single-Row Pattern

**Decision**: Sử dụng single-row table với JSON columns thay vì key-value store.

**Rationale**:
- Đơn giản hơn cho đồ án demo
- Type-safe với Prisma
- Dễ query toàn bộ settings
- Phù hợp cho single-tenant

**Schema**:
```prisma
model RestaurantSettings {
    id              Int       @id @default(1)
    name            String    @db.VarChar(200)
    tagline         String?   @db.VarChar(500)
    description     String?   @db.Text
    aboutTitle      String?   @db.VarChar(200)
    aboutContent    String?   @db.Text
    address         String?   @db.VarChar(500)
    phone           String?   @db.VarChar(20)
    email           String?   @db.VarChar(255)
    mapEmbedUrl     String?   @db.Text
    heroImage       String?   @db.VarChar(500)
    aboutImage      String?   @db.VarChar(500)
    logoUrl         String?   @db.VarChar(500)
    operatingHours  Json?     // Array of { day, hours }
    socialLinks     Json?     // Array of { platform, url, icon }
    highlights      Json?     // Array of { icon, label, value }
    updatedAt       DateTime  @updatedAt
    
    @@map("restaurant_settings")
}
```

**Alternatives Considered**:
- Key-value store: Linh hoạt nhưng phức tạp hơn, cần nhiều queries
- Separate tables: Over-engineering cho use case đơn giản

### 2. API Design: RESTful với Single Resource

**Decision**: Treat settings như single resource với GET/PUT

**Endpoints**:
```
GET  /api/restaurant-settings     # Public - Lấy tất cả settings
PUT  /api/restaurant-settings     # Admin only - Update settings
```

**Rationale**:
- Đơn giản, dễ hiểu
- Single GET/PUT cho toàn bộ settings
- Phù hợp với single-row database design

### 3. Frontend Architecture: Settings Module

**Decision**: Tạo module `admin/settings` theo existing pattern

**Structure**:
```
src/modules/admin/settings/
├── components/
│   ├── index.ts
│   ├── GeneralSettingsForm.tsx     # Tên, tagline, description
│   ├── ContactSettingsForm.tsx     # Địa chỉ, SĐT, email
│   ├── OperatingHoursForm.tsx      # Giờ mở cửa
│   └── SocialLinksForm.tsx         # Social media links
├── views/
│   ├── index.ts
│   └── SettingsView.tsx            # Main settings page
├── services/
│   ├── index.ts
│   └── settings.service.ts
├── hooks/
│   ├── index.ts
│   └── useSettings.ts
├── types/
│   └── index.ts
├── utils/
│   ├── index.ts
│   └── validation.ts
└── index.ts
```

### 4. Form Design: Tabbed Interface

**Decision**: Sử dụng Tabs để nhóm các settings

**Tabs**:
1. **Thông tin chung**: Tên, tagline, description, about
2. **Liên hệ**: Địa chỉ, SĐT, email, map
3. **Giờ hoạt động**: Operating hours array
4. **Social Media**: Social links array
5. **Hình ảnh**: Hero image, about image, logo URLs

**Rationale**:
- UX tốt hơn khi form dài
- Dễ navigate giữa các section
- Consistent với admin UI patterns

### 5. Data Fetching: Homepage Integration

**Decision**: Homepage fetch settings từ API, fallback to config

**Flow**:
```
Homepage Load
    ↓
Fetch /api/restaurant-settings
    ↓
Success? → Use API data
    ↓
Error? → Use restaurant.config.ts as fallback
```

**Rationale**:
- Graceful degradation nếu API fail
- Không break existing functionality
- Config file làm default values

## Risks / Trade-offs

### Risk 1: Settings không được seed
**Mitigation**: Tạo Prisma seed script với default data từ existing config

### Risk 2: Form validation phức tạp cho JSON arrays
**Mitigation**: Sử dụng Zod với array schemas, fieldArray từ react-hook-form

### Risk 3: Inconsistent data giữa API và config
**Mitigation**: Seed API data từ config values, deprecate config dần

## Migration Plan

### Phase 1: Backend Setup
1. Add Prisma model
2. Create migration
3. Create seed script
4. Implement API endpoints

### Phase 2: Admin Frontend
1. Create settings module
2. Implement forms
3. Add to sidebar navigation

### Phase 3: Homepage Integration
1. Create settings hook in home module
2. Update components to use API data
3. Keep config as fallback

### Rollback
- Remove migration
- Revert frontend to use config only
- No data loss (settings are non-critical)

## Open Questions

1. **Q**: Cần preview changes trước khi save không?
   **A**: Có thể add sau nếu cần, MVP chỉ cần save trực tiếp

2. **Q**: Validation cho operating hours format?
   **A**: Simple text input cho giờ (HH:MM - HH:MM), regex validation

3. **Q**: Cho phép delete social links hoàn toàn?
   **A**: Có, empty array là valid

