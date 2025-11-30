## Context

Trang chủ khách hàng là landing page công khai đầu tiên của hệ thống, cho phép khách hàng xem thông tin nhà hàng, menu và đặt bàn online. Cần thiết kế đơn giản, đẹp mắt và phù hợp với scope đồ án tốt nghiệp.

**Stakeholders**: 
- Khách hàng (end users): Xem nhà hàng, menu, đặt bàn
- Sinh viên (developer): Demo kỹ năng frontend với Next.js

**Constraints**:
- Sử dụng tech stack hiện có (Next.js 16, Tailwind CSS 4, Radix UI, Framer Motion)
- Không thêm dependencies mới không cần thiết
- Responsive design (mobile-first)
- Đa ngôn ngữ (EN/VI)

## Goals / Non-Goals

### Goals
- ✅ Landing page đẹp, hiện đại với animations
- ✅ Hiển thị menu món ăn từ API
- ✅ Form đặt bàn tích hợp với backend
- ✅ Responsive cho mobile/tablet/desktop
- ✅ Dark/Light mode support
- ✅ SEO-friendly với Next.js metadata

### Non-Goals
- ❌ Hệ thống đăng nhập cho khách hàng
- ❌ Giỏ hàng và thanh toán online
- ❌ Admin panel để cấu hình nội dung trang chủ
- ❌ Blog/News section
- ❌ Google Maps API integration (chỉ hiển thị static map hoặc iframe)
- ❌ Online ordering (order để mang về)

## Decisions

### Decision 1: Single-Page Landing vs Multi-Page
**Chọn**: Single-page landing với scroll sections

**Lý do**:
- Phù hợp với website nhà hàng (compact, dễ navigate)
- Demo được Framer Motion scroll animations
- Đơn giản hơn để implement và maintain
- User experience tốt hơn trên mobile

### Decision 2: Data Source cho thông tin nhà hàng
**Chọn**: Config file hardcoded (`src/config/restaurant.ts`)

**Lý do**:
- Đơn giản cho đồ án demo
- Không cần tạo thêm API endpoint
- Dễ dàng modify cho demo
- Có thể mở rộng thành database settings sau này

**Alternatives considered**:
- API endpoint riêng: Quá phức tạp cho scope đồ án
- Environment variables: Không phù hợp cho rich content

### Decision 3: Menu Display Strategy
**Chọn**: Featured items only (6-8 món) với link đến full menu

**Lý do**:
- Landing page cần compact, không list hết menu
- Tạo curiosity để khách click xem thêm
- Performance tốt hơn (load ít data)

### Decision 4: Reservation Flow
**Chọn**: Inline form trên landing page

**Lý do**:
- Không cần navigate away
- Đơn giản: Name, Phone, Date, Time, Party Size, Notes
- Submit tạo reservation với status `pending`
- Hiển thị success message với reservation code

### Decision 5: Module Structure
**Chọn**: Feature-based module trong `src/modules/home/`

```
modules/home/
├── components/
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── MenuSection.tsx
│   ├── ReservationSection.tsx
│   ├── ContactSection.tsx
│   └── Footer.tsx
├── services/
│   └── home.service.ts
├── hooks/
│   └── useReservation.ts
├── types/
│   └── index.ts
├── config/
│   └── restaurant.config.ts
└── index.ts
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Menu API có thể trả về nhiều data | Chỉ fetch featured items (limit=8) |
| Reservation có thể conflict với admin | Tạo với status `pending`, cần confirm |
| SEO không tối ưu với SPA-style | Sử dụng Next.js Server Components khi có thể |
| Mobile performance | Lazy load images, Framer Motion reduce motion |

## UI/UX Wireframe

```
┌─────────────────────────────────────────────┐
│                   HEADER                     │
│  Logo    [Home] [Menu] [Reservation] [Lang]  │
├─────────────────────────────────────────────┤
│                                             │
│              HERO SECTION                   │
│                                             │
│         🍽️ Restaurant Name                  │
│         "Slogan goes here"                  │
│                                             │
│        [Đặt Bàn Ngay]  [Xem Menu]           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              ABOUT SECTION                  │
│                                             │
│    [Image]        Welcome to our           │
│                   restaurant...             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              MENU SECTION                   │
│                                             │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│   │Item1│  │Item2│  │Item3│  │Item4│       │
│   └─────┘  └─────┘  └─────┘  └─────┘       │
│                                             │
│            [Xem Toàn Bộ Menu]               │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│           RESERVATION SECTION               │
│                                             │
│   ┌─────────────────────────────────┐      │
│   │  Họ tên: [________________]      │      │
│   │  SĐT:    [________________]      │      │
│   │  Ngày:   [____] Giờ: [____]      │      │
│   │  Số người: [__]                  │      │
│   │  Ghi chú: [________________]     │      │
│   │                                  │      │
│   │        [Đặt Bàn]                │      │
│   └─────────────────────────────────┘      │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│             CONTACT SECTION                 │
│                                             │
│   📍 Địa chỉ: 123 ABC Street               │
│   📞 Điện thoại: 0123-456-789              │
│   ✉️ Email: info@restaurant.com            │
│   🕒 Giờ mở cửa: 10:00 - 22:00             │
│                                             │
│   [Map Placeholder]                        │
│                                             │
├─────────────────────────────────────────────┤
│                   FOOTER                    │
│   © 2025 Restaurant | Social Links         │
└─────────────────────────────────────────────┘
```

## Open Questions

1. **Images**: Sử dụng placeholder images hay cần prepare real images cho demo?
   - **Proposed**: Placeholder (Unsplash/Pexels) cho development, có thể thay sau

2. **Animations**: Mức độ animations như thế nào?
   - **Proposed**: Subtle scroll animations, không quá nhiều để tránh distraction

3. **Full Menu Page**: Có cần tạo `/menu` page riêng không?
   - **Proposed**: Có, để khách xem toàn bộ menu (phase 2 nếu cần)
